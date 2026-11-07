import GoldenSupport
@testable import SkeeCore

// Owned by the reducer piece. Full runs from the real Swift, as rows that
// test/suites/reducer_suite.march replays through the March reducer:
//
//   cfg <id> <antes> <frames> <balls> <start> <charms> <powerUps> <fever> <scale>
//       <overkillStep> <overkillCap> <interestPer> <interestCap> <offers> <anteBase,...>
//   run <label> <seed> <roomIndex> <extraTickets> <cfg id> <state digest>
//   s <action> <state digest> <event digest>                 an accepted action
//   t <action> <shot> <detail> <state digest> <event digest> an accepted throw
//   e <action> <error index>                                 a refused action
//
// Bot runs are what `playBotRun` plays. Chaos runs are a seeded driver throwing
// legal and illegal actions at the reducer, which reaches what the bots never
// do: fouls, sells, rerolls, purges, every ActionError. Coverage of every event
// and error is checked below, so a thin golden fails here rather than passing
// there.

var g = GoldenFile(module: "Run")
let botSeeds = 40
let chaosSeeds = 120

// ---- Tokens ----

func num(_ x: Double) -> String { x.bitPattern == 0 ? "0" : f64(x) }

func token(_ a: Action) -> String {
    switch a {
    case .pull(let b): return "p,\(b.lines)"
    case .throwBall(let l):
        if l.from == 0 && Launch(power: l.power, aim: l.aim).speed == l.speed {
            return ["t", num(l.power), num(l.aim), num(l.start), num(l.fold), num(l.spin), num(l.skid)].joined(separator: ",")
        }
        return ["v", num(l.speed), num(l.from), num(l.aim), num(l.start), num(l.fold), num(l.spin), num(l.skid)].joined(separator: ",")
    case .foul: return "f"
    case .chooseBall(let b): return "c,\(index(b))"
    case .arm(let i): return "a,\(i)"
    case .buy(let i, let target): return "b,\(i),\(target.map { String(index($0)) } ?? "n")"
    case .reroll: return "r"
    case .sell(let i): return "s,\(i)"
    case .leaveCounter: return "l"
    }
}

/// Hole, then one or two characters per event.
func shotToken(_ s: ShotResult) -> String {
    var out = String(index(s.hole))
    for e in s.events {
        switch e {
        case .dud: out += "D"
        case .rail: out += "R"
        case .launched: out += "L"
        case .landed: out += "N"
        case .lip(let ring): out += "l\(ring)"
        case .backwall: out += "B"
        case .hop: out += "H"
        case .dropped(let h): out += "d\(index(h))"
        case .settled(let h): out += "s\(index(h))"
        case .gutter: out += "G"
        }
    }
    return out
}

func hash(_ x: UInt32) -> String { String(x) }

// ---- Coverage ----

var eventsSeen = Set<String>()
var errorsSeen = Set<String>()
var outcomes: [String: Int] = [:]
var steps = 0

func name(_ e: GameEvent) -> String { String(String(describing: e).prefix { $0 != "(" }) }

// ---- Writing a run ----

/// Apply `a`, write its row, return the next state.
@MainActor func write(_ a: Action, _ s: RunState) -> RunState {
    steps += 1
    switch apply(a, to: s) {
    case .failure(let e):
        errorsSeen.insert(String(describing: e))
        g.line("e", token(a), i(errorIndex(e)))
        return s
    case .success(let step):
        for e in step.events { eventsSeen.insert(name(e)) }
        let shot = step.events.compactMap { e -> ShotResult? in
            if case .shot(let r, _) = e { r } else { nil }
        }.first
        if let shot {
            g.line("t", token(a), shotToken(shot), hash(detail(of: shot)), hash(digest(of: step.state)), hash(digest(of: step.events)))
        } else {
            g.line("s", token(a), hash(digest(of: step.state)), hash(digest(of: step.events)))
        }
        return step.state
    }
}

func errorIndex(_ e: ActionError) -> Int {
    switch e {
    case .wrongPhase: 0
    case .noSuchOffer: 1
    case .noSuchItem: 2
    case .cantAfford: 3
    case .slotsFull: 4
    case .needsTarget: 5
    case .alreadyArmed: 6
    case .reelTooShort: 7
    case .needsPull: 8
    case .alreadyPulled: 9
    }
}

@MainActor func header(_ label: String, _ seed: UInt64, _ room: Room, _ extra: Int, _ cfg: Int, _ s: RunState) {
    g.line("run", label, u64(seed), i(index(room)), i(extra), i(cfg), hash(digest(of: s)))
}

// ---- Configs ----

var configs: [RunConfig] = [.standard]
do {
    var quick = RunConfig.standard
    quick.targetScale = 0.02
    quick.startTickets = 12
    configs.append(quick)

    var short = RunConfig.standard
    short.antes = 2
    short.targetScale = 0.01
    short.charmSlots = 2
    short.powerUpSlots = 1
    short.feverHeat = 3
    configs.append(short)

    var rich = RunConfig.standard
    rich.targetScale = 0.01
    rich.startTickets = 400
    rich.offerCount = 3
    rich.overkillCap = 2
    rich.interestPer = 7
    rich.interestCap = 9
    rich.overkillStep = 0.25
    rich.framesPerRound = 2
    rich.anteBase = [300, 900, 1500]
    configs.append(rich)

    var tall = RunConfig.standard
    tall.ballsPerFrame = 2
    tall.targetScale = 0.03
    tall.startTickets = 30
    configs.append(tall)
}

for (n, c) in configs.enumerated() {
    g.line("cfg", i(n), i(c.antes), i(c.framesPerRound), i(c.ballsPerFrame), i(c.startTickets), i(c.charmSlots),
           i(c.powerUpSlots), i(c.feverHeat), f64(c.targetScale), f64(c.overkillStep), i(c.overkillCap),
           i(c.interestPer), i(c.interestCap), i(c.offerCount), c.anteBase.map(String.init).joined(separator: ","))
}

// ---- Swift's clamp on an inverted range, which March's stdlib clamp is not ----

for (x, lo, hi) in [(0, 5, 3), (4, 5, 3), (9, 5, 3), (2, 2, 1), (-7, 1, 0), (5, 0, 3)] {
    g.line("clampi", i(x), i(lo), i(hi), i(clamp(x, lo, hi)))
}

// ---- Wallet.pulled: every room's pulls through one wallet ----

for room in Room.allCases {
    var w = Wallet()
    var rng = SplitMix64(seed: UInt64(index(room)) &+ 40)
    var paid = 0
    for n in 1...3000 {
        // Mostly max bets, so jackpots hit; every fourth pull is free.
        let bet: Bet = n % 7 == 0 ? .one : n % 5 == 0 ? .three : .five
        let p = Pull.spin(bet: bet, free: n % 4 == 0, room: room, &rng)
        paid += w.pulled(p)
        if n % 500 == 0 {
            g.line("wallet", i(index(room)), i(n), i(paid), i(w.balance), i(w.lifetime),
                   i(w.progressive.amount(.mini)), i(w.progressive.amount(.minor)),
                   i(w.progressive.amount(.major)), i(w.progressive.amount(.grand)))
        }
    }
}

// ---- Bot runs ----

func mixed(_ n: Int) -> UInt64 { UInt64(n) &* 0x9E37_79B9_7F4A_7C15 }

var books: [Table: AimBook] = [:]
let balls: [BallKind] = [.classic, .classic, .marshmallow, .bean, .wobbler, .comet]
var botRuns = 0
var wins = 0
for n in 1...Int(botSeeds) {
    for room in Room.allCases {
        let skill = Skill.all[(n + index(room)) % Skill.all.count]
        let ball = balls[n % balls.count]
        let seed = mixed(n)
        let run = playBotRun(seed: seed, skill: skill, room: room, ball: ball, books: &books)
        var s = newRun(seed: seed, room: room)
        header("bot,\(skill.name),\(index(ball))", seed, room, 0, 0, s)
        for a in run.actions { s = write(a, s) }
        precondition(s == run.final, "replaying a bot run must reach its final state")
        botRuns += 1
        if case .won = s.phase { wins += 1 }
    }
}

// ---- Chaos runs ----

struct Chaos {
    var rng: SplitMix64
    var purger: Bool

    mutating func chance(_ percent: Int) -> Bool { rng.nextInt(below: 100) < percent }
    mutating func unit() -> Double { rng.nextUnit() }
    mutating func signed() -> Double { rng.nextUnit() * 2 - 1 }

    mutating func launch() -> Launch {
        if chance(25) {
            return Launch(speed: 2 + unit() * 3, from: unit() * 2.5, aim: signed() * 0.4, start: signed() * 0.3,
                          fold: unit(), spin: signed(), skid: unit() * 0.5)
        }
        if chance(25) {
            return Launch(power: 0.3 + unit() * 0.7, aim: signed() * 0.3, start: signed() * 0.5, fold: unit(), spin: signed(), skid: unit())
        }
        return Launch(power: 0.3 + unit() * 0.7, aim: signed() * 0.3)
    }

    mutating func target() -> Hole? {
        if chance(10) { return nil }
        if chance(10) { return .gutter }
        return Hole.allCases[rng.nextInt(below: Hole.allCases.count)]
    }

    mutating func bet() -> Bet { Bet.allCases[rng.nextInt(below: 3)] }

    mutating func wrongLane() -> Action {
        switch rng.nextInt(below: 5) {
        case 0: .pull(bet())
        case 1: .throwBall(launch())
        case 2: .foul
        case 3: .arm(0)
        default: .chooseBall(.comet)
        }
    }

    mutating func wrongCounter() -> Action {
        switch rng.nextInt(below: 4) {
        case 0: .buy(0, target: nil)
        case 1: .reroll
        case 2: .sell(0)
        default: .leaveCounter
        }
    }

    mutating func next(_ s: RunState) -> Action {
        switch s.phase {
        case .throwing:
            let lane = s.round.pull == nil
            if chance(5) { return wrongCounter() }
            if chance(6) { return .chooseBall(BallKind.allCases[rng.nextInt(below: BallKind.allCases.count)]) }
            if chance(8) { return .arm(rng.nextInt(below: 4) - 1) }
            if lane {
                if chance(8) { return .throwBall(launch()) }
                if chance(4) { return .foul }
                return .pull(bet())
            }
            if chance(4) { return .pull(bet()) }
            if chance(9) { return .foul }
            return .throwBall(launch())
        case .prizeCounter(let c):
            if chance(4) { return wrongLane() }
            if purger {
                if let i = c.offers.firstIndex(of: .purge) { return .buy(i, target: .ring10) }
                if s.tickets >= c.rerollCost && c.rerollCost < 25 { return .reroll }
                return .leaveCounter
            }
            switch rng.nextInt(below: 100) {
            case ..<50: return .buy(rng.nextInt(below: 7) - 1, target: target())
            case ..<65: return .reroll
            case ..<80: return .sell(rng.nextInt(below: 7) - 1)
            default: return .leaveCounter
            }
        case .lost, .won:
            return chance(50) ? wrongLane() : wrongCounter()
        }
    }
}

var chaosRuns = 0
for n in 1...Int(chaosSeeds) {
    let room = Room.allCases[n % Room.allCases.count]
    let cfg = n % configs.count
    let purger = n % 9 == 0
    let seed = mixed(n + 100_000)
    let extra = n % 3 == 0 ? n % 7 : 0
    var s = newRun(seed: seed, config: configs[purger ? 3 : cfg], room: room, extraTickets: extra)
    var driver = Chaos(rng: SplitMix64(seed: seed ^ 0xC4A0), purger: purger)
    header("chaos,\(n)", seed, room, extra, purger ? 3 : cfg, s)
    var over = 0
    for _ in 0..<500 {
        let a = driver.next(s)
        s = write(a, s)
        switch s.phase {
        case .won, .lost: over += 1
        case .throwing, .prizeCounter: break
        }
        if over > 6 { break }
    }
    if case .won = s.phase { wins += 1 }
    chaosRuns += 1
}

// ---- Coverage: a thin golden stops here ----

let allEvents = ["pulled", "freeGamesWon", "jackpot", "shot", "fouled", "frameScored", "feverLit", "roundCleared",
                 "roundFailed", "counterOpened", "bought", "sold", "rerolled", "armed", "ballChosen", "roundStarted",
                 "anteStarted", "runWon"]
let allErrors = ["wrongPhase", "noSuchOffer", "noSuchItem", "cantAfford", "slotsFull", "needsTarget", "alreadyArmed",
                 "reelTooShort", "needsPull", "alreadyPulled"]
let missingEvents = allEvents.filter { !eventsSeen.contains($0) }
let missingErrors = allErrors.filter { !errorsSeen.contains($0) }
print("bot runs \(botRuns), chaos runs \(chaosRuns), wins \(wins), steps \(steps), rows \(g.lines.count)")
precondition(missingEvents.isEmpty, "golden never saw events: \(missingEvents)")
precondition(missingErrors.isEmpty, "golden never saw errors: \(missingErrors)")
try g.write()
