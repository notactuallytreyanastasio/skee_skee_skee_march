import GoldenSupport
@testable import SkeeCore

// Owned by the reducer piece. Full runs from the real Swift, as rows that
// test/suites/reducer_suite.march replays through the March reducer:
//
//   cfg <id> <antes> <frames> <balls> <start> <charms> <powerUps> <fever> <scale>
//       <overkillStep> <overkillCap> <interestPer> <interestCap> <offers> <anteBase,...>
//   run <label> <seed> <roomIndex> <extraTickets> <cfg id> <state digest>
//   s <action> <state digest> <event digest> <balls left>                 an accepted action
//   t <action> <shot> <detail> <state digest> <event digest> <balls left> <floats>
//                                                                         an accepted throw
//   e <action> <error index>                                              a refused action
//   tablefor <room> <ante> <antes> <kind> <boss> <power or n> <ball> <table digest>
//       table(for:) on a state built with those fields, every index an allCases one
//
// <floats> is the shot's floats that <detail> hashes, each as its bit pattern,
// comma-separated: every event time, then hinge speed, landing x and landing y
// ("n" when absent), peak height and duration, then the path count in decimal.
// They let the March suite measure libm drift in ulps, not only count it.
//
// The same executable writes Golden.RunHeldout (test/golden/runheldout.march):
// chaos runs on seeds and configs the main golden never uses, so a bound set
// on the main golden is checked on shots it was not fitted to. Its first run
// starts on a config other than the standard one and with extra tickets.
//
// <balls left> is RoundState.ballsLeft after the step. It counts three balls a
// frame whatever ballsPerFrame says, as Swift does, and the tall config's two
// balls a frame is what tells the difference.
//
// Bot runs are what `playBotRun` plays. Chaos runs are a seeded driver throwing
// legal and illegal actions at the reducer, which reaches what the bots never
// do: fouls, sells, rerolls, purges, every ActionError. Coverage of every event
// and error is checked below, so a thin golden fails here rather than passing
// there.

var g = GoldenFile(module: "Run")
let botSeeds = 36
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

func optionalFloat(_ x: Double?) -> String { x.map(f64) ?? "n" }

func shotFloats(_ s: ShotResult) -> String {
    var parts = s.eventTimes.map(f64)
    parts.append(optionalFloat(s.hingeSpeed))
    parts.append(optionalFloat(s.firstLanding?.x))
    parts.append(optionalFloat(s.firstLanding?.y))
    parts.append(f64(s.peakHeight))
    parts.append(f64(s.duration))
    parts.append(i(s.path.count))
    return parts.joined(separator: ",")
}

// ---- Coverage ----

var eventsSeen = Set<String>()
var tiersSeen = Set<String>()
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
        for e in step.events {
            eventsSeen.insert(name(e))
            if case .jackpot(let tier) = e { tiersSeen.insert(String(describing: tier)) }
        }
        let shot = step.events.compactMap { e -> ShotResult? in
            if case .shot(let r, _) = e { r } else { nil }
        }.first
        if let shot {
            g.line("t", token(a), shotToken(shot), hash(detail(of: shot)), hash(digest(of: step.state)), hash(digest(of: step.events)),
                   i(step.state.round.ballsLeft), shotFloats(shot))
        } else {
            g.line("s", token(a), hash(digest(of: step.state)), hash(digest(of: step.events)), i(step.state.round.ballsLeft))
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
// The chaos runs below draw from these five only, so adding a config never
// changes them.
let baseConfigs = configs.count
// Run lengths at the edge of `s.ante >= c.antes`: zero antes wins on the first
// boss, as does one.
for antes in [0, 1] {
    var edge = RunConfig.standard
    edge.antes = antes
    edge.targetScale = 0.01
    edge.startTickets = 20
    configs.append(edge)
}
let edgeConfigs = [baseConfigs, baseConfigs + 1]
// The Grand hunt: long rounds and deep pockets, so max bets keep coming.
let huntConfig = configs.count
do {
    var hunt = RunConfig.standard
    hunt.framesPerRound = 400
    hunt.startTickets = 100_000
    hunt.targetScale = 0.01
    configs.append(hunt)
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
        // By digest, not ==: a tied pair names a symbol picked in Set order, which
        // Swift seeds per Set instance, so two replays can differ in that alone.
        precondition(digest(of: s) == digest(of: run.final), "replaying a bot run must reach its final state")
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
    let cfg = n % baseConfigs
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

// ---- Chaos at the edge of the run length ----

for (e, cfg) in edgeConfigs.enumerated() {
    for n in 1...12 {
        let room = Room.allCases[n % Room.allCases.count]
        let seed = mixed(n + 200_000 + 1000 * e)
        var s = newRun(seed: seed, config: configs[cfg], room: room)
        var driver = Chaos(rng: SplitMix64(seed: seed ^ 0xC4A0), purger: false)
        header("edge,\(e),\(n)", seed, room, 0, cfg, s)
        var over = 0
        for _ in 0..<300 {
            s = write(driver.next(s), s)
            switch s.phase {
            case .won, .lost: over += 1
            case .throwing, .prizeCounter: break
            }
            if over > 3 { break }
        }
        if case .won = s.phase { wins += 1 }
        chaosRuns += 1
    }
}

// ---- The Grand jackpot ----

// Max bets and fouls until a pull hits the Grand, then a few more steps. No
// bot or chaos run reaches it: it needs three wilds across the centre line.
func isGrand(_ e: GameEvent) -> Bool {
    if case .jackpot(.grand) = e { return true }
    return false
}

@MainActor func huntActions(_ seed: UInt64, _ room: Room) -> [Action]? {
    var s = newRun(seed: seed, config: configs[huntConfig], room: room)
    var acts: [Action] = []
    var after: Int? = nil
    while acts.count < 1600 {
        guard case .throwing = s.phase else { return nil }
        let a: Action = s.round.pull == nil ? .pull(.five) : .foul
        guard case .success(let step) = apply(a, to: s) else { return nil }
        acts.append(a)
        s = step.state
        if after == nil && step.events.contains(where: isGrand) { after = 0 }
        if let n = after {
            if n >= 8 { return acts }
            after = n + 1
        }
    }
    return nil
}

var grandRuns = 0
hunt: for n in 1...200_000 {
    for room in Room.allCases {
        let seed = mixed(n + 300_000)
        guard let acts = huntActions(seed, room) else { continue }
        var s = newRun(seed: seed, config: configs[huntConfig], room: room)
        header("grand,\(n)", seed, room, 0, huntConfig, s)
        for a in acts { s = write(a, s) }
        grandRuns += 1
        if grandRuns == 2 { break hunt }
    }
}

// ---- table(for:): every modifier it stacks, in its order ----

@MainActor func tableFor(_ room: Room, ante: Int, antes: Int, kind: RoundKind, boss: Boss, power: PowerUp?, ball: BallKind) {
    var c = RunConfig.standard
    c.antes = antes
    var s = newRun(seed: 7, config: c, room: room)
    s.ante = ante
    s.round.kind = kind
    s.boss = boss
    s.round.armed = power
    s.ball = ball
    g.line("tablefor", i(index(room)), i(ante), i(antes), i(index(kind)), i(index(boss)),
           power.map { String(index($0)) } ?? "n", i(index(ball)), hash(digest(of: table(for: s))))
}

var tables = 0
for (r, room) in Room.allCases.enumerated() {
    for kind in RoundKind.allCases {
        for (b, boss) in Boss.allCases.enumerated() {
            let powers: [PowerUp?] = [nil] + PowerUp.allCases.map { Optional($0) }
            for (p, power) in powers.enumerated() {
                // Every pair of boss and power-up on every kind, with the ante,
                // run length and ball moving so each is seen against the rest.
                let ante = 1 + (r + b + p) % 9
                let antes = [8, 3, 1, 0, 12][(b + p) % 5]
                let ball = BallKind.allCases[(r + b + p) % BallKind.allCases.count]
                tableFor(room, ante: ante, antes: antes, kind: kind, boss: boss, power: power, ball: ball)
                tables += 1
            }
        }
    }
}

// ---- Coverage: a thin golden stops here ----

let allEvents = ["pulled", "freeGamesWon", "jackpot", "shot", "fouled", "frameScored", "feverLit", "roundCleared",
                 "roundFailed", "counterOpened", "bought", "sold", "rerolled", "armed", "ballChosen", "roundStarted",
                 "anteStarted", "runWon"]
let allErrors = ["wrongPhase", "noSuchOffer", "noSuchItem", "cantAfford", "slotsFull", "needsTarget", "alreadyArmed",
                 "reelTooShort", "needsPull", "alreadyPulled"]
let missingEvents = allEvents.filter { !eventsSeen.contains($0) }
let missingErrors = allErrors.filter { !errorsSeen.contains($0) }
print("bot runs \(botRuns), chaos runs \(chaosRuns), grand runs \(grandRuns), tables \(tables), wins \(wins), steps \(steps), rows \(g.lines.count)")
let missingTiers = ["mini", "minor", "major", "grand"].filter { !tiersSeen.contains($0) }
precondition(missingTiers.isEmpty, "golden never saw jackpot tiers: \(missingTiers)")
precondition(grandRuns == 2, "the Grand hunt found \(grandRuns) runs")
precondition(missingEvents.isEmpty, "golden never saw events: \(missingEvents)")
precondition(missingErrors.isEmpty, "golden never saw errors: \(missingErrors)")
try g.write()

// ---- Held out: chaos on seeds and configs the main golden never sees ----

g = GoldenFile(module: "RunHeldout")
for (n, c) in configs.enumerated() {
    g.line("cfg", i(n), i(c.antes), i(c.framesPerRound), i(c.ballsPerFrame), i(c.startTickets), i(c.charmSlots),
           i(c.powerUpSlots), i(c.feverHeat), f64(c.targetScale), f64(c.overkillStep), i(c.overkillCap),
           i(c.interestPer), i(c.interestCap), i(c.offerCount), c.anteBase.map(String.init).joined(separator: ","))
}
let heldoutRuns = 64
var heldoutShots = 0
for n in 1...heldoutRuns {
    let room = Room.allCases[(n * 7) % Room.allCases.count]
    // n = 1 gives config 1 and extra tickets: the first run is not the standard one.
    let cfg = n % configs.count
    let extra = n % 2 == 1 ? 1 + n % 9 : 0
    let seed = mixed(n + 400_000)
    var s = newRun(seed: seed, config: configs[cfg], room: room, extraTickets: extra)
    var driver = Chaos(rng: SplitMix64(seed: seed ^ 0x5EED), purger: n % 11 == 0)
    header("heldout,\(n)", seed, room, extra, cfg, s)
    var over = 0
    for _ in 0..<400 {
        s = write(driver.next(s), s)
        switch s.phase {
        case .won, .lost: over += 1
        case .throwing, .prizeCounter: break
        }
        if over > 4 { break }
    }
}
heldoutShots = g.lines.filter { $0.hasPrefix("t ") }.count
print("held out: runs \(heldoutRuns), shots \(heldoutShots), rows \(g.lines.count)")
precondition(heldoutShots > 2000, "held-out golden is too thin: \(heldoutShots) shots")
try g.write()
