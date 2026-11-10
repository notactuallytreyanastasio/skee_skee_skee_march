import CoreGraphics
import GoldenSupport
@testable import SkeeCore
@testable import SkeeHUD
@testable import SkeeRender

// Owned by the presentation piece. The real SkeeRender Presentation and SkeeHUD
// HUDState, driven by real reducer steps from seeded runs, written as rows that
// test/suites/presentation_suite.march replays through Skee.Presentation and
// Skee.HudState:
//
//   run <label> <seed> <room> <antes> <targetScale> <startTickets> <framesPerRound>
//       a fresh Presentation on newRun(seed, config, room); a k and h row follow
//   a <action> <releaseAlong> <state digest>
//       apply the action (it is always accepted) and enqueue the step
//   d <dt>        advance(dt); a k and h row follow
//   x             skip(); a k and h row follow
//   k ...         the presentation after the last d, x or run (see `tick`)
//   h ...         HUDState.make on it (see `hud`)
//   num <x> <text>                       HUDState.num(x), written as is (no spaces)
//   ps <reel> <position> <row> <room> <symbol>   Presentation.pullSymbol
//
// digest.swift is a symlink to golden-run's, mirrored by arcade/testkit/lib/arcade/test/digest.march and run_digest.march.
// Strings are written as their Digest.text hash, so spaces never reach a token.

var g = GoldenFile(module: "Presentation")

// ---- Tokens ----

func textHash(_ s: String) -> String {
    var d = Digest()
    d.text(s)
    return String(d.h)
}

func csv(_ xs: [String]) -> String { xs.isEmpty ? "-" : xs.joined(separator: ",") }

func actionToken(_ a: Action) -> String {
    switch a {
    case .pull(let b): return "p,\(b.lines)"
    case .throwBall(let l):
        return ["t", f64(l.power), f64(l.aim), f64(l.start), f64(l.fold), f64(l.spin), f64(l.skid)].joined(separator: ",")
    case .foul: return "f"
    case .chooseBall(let b): return "c,\(index(b))"
    case .arm(let i): return "a,\(i)"
    case .buy(let i, let target): return "b,\(i),\(target.map { String(index($0)) } ?? "n")"
    case .reroll: return "r"
    case .sell(let i): return "s,\(i)"
    case .leaveCounter: return "l"
    }
}

func cueToken(_ c: Cue) -> String {
    switch c {
    case .launch: "launch"
    case .rail: "rail"
    case .hump: "hump"
    case .lip: "lip"
    case .backwall: "backwall"
    case .landed: "landed"
    case .drop(let h): "drop\(index(h))"
    case .gutter: "gutter"
    case .hop: "hop"
    case .whoosh: "whoosh"
    case .hotSpot: "hotSpot"
    case .lever: "lever"
    case .pullWin(let n): "pullWin\(n)"
    case .reelTick: "reelTick"
    case .reelStop: "reelStop"
    case .combo(let n): "combo\(n)"
    case .tallyChips(let n): "tallyChips\(n)"
    case .tallyMult(let n): "tallyMult\(n)"
    case .frameDone: "frameDone"
    case .lineWon: "lineWon"
    case .jackpot: "jackpot"
    case .banner(let t): "banner\(textHash(t))"
    case .foul: "foul"
    }
}

func beatLetter(_ b: Beat) -> String {
    switch b {
    case .roll: "R"
    case .spin: "S"
    case .pull: "P"
    case .tally: "T"
    case .banner: "B"
    case .commit: "C"
    case .restyle: "Y"
    }
}

func kindIndex(_ k: Popup.Kind) -> Int {
    switch k {
    case .chips: 0
    case .mult: 1
    case .tickets: 2
    case .bad: 3
    case .jackpot: 4
    }
}

func anchorToken(_ a: Popup.Anchor) -> String {
    switch a {
    case .hole(let h): "h\(index(h))"
    case .center: "c"
    case .hud: "u"
    }
}

func pullToken(_ p: Pull?) -> String {
    guard let p else { return "n" }
    return (p.stops.map { String($0) } + [String(p.bet.lines), b(p.free), String(index(p.room))]).joined(separator: ",")
}

/// The presentation's whole visible state.
func tick(_ p: Presentation) -> [String] {
    var row = ["k", i(p.beats.count), p.current.map(beatLetter) ?? "-", f64(p.beatTime), f64(p.clock)]
    row.append(csv(p.cues.map(cueToken)))
    row.append(p.finished.isEmpty ? "-" : p.finished.map(beatLetter).joined())
    row += [f64(p.flash), f64(p.shake), f64(p.celebration), i(p.talliedBonus), String(digest(of: p.shown))]
    if let s = p.ball {
        row.append([f64(s.along), f64(s.x), f64(s.height), f64(s.t), String(phaseIndex(s.phase))].joined(separator: ","))
    } else {
        row.append("n")
    }
    row.append(i(p.trail.count))
    row.append(BoardSetup.reelHoles.map { f64(p.reelPositions[$0] ?? -1) }.joined(separator: ","))
    row.append(p.pullPositions.map(f64).joined(separator: ","))
    row.append(pullToken(p.lastPull))
    row.append(p.popups.isEmpty ? "-" : p.popups.map {
        [String(kindIndex($0.kind)), anchorToken($0.anchor), f64($0.life), f64($0.age), textHash($0.text)].joined(separator: ",")
    }.joined(separator: ";"))
    row.append(p.recentThrows.isEmpty ? "-" : p.recentThrows.map { "\(f64($0.power)):\(index($0.hole))" }.joined(separator: ";"))
    row += [f64(p.anticipation), f64(p.timeScale)]
    if let r = p.restingBall { row.append("\(f64(r.until)),\(f64(r.sample.along))") } else { row.append("n") }
    row.append(b(p.teasing))
    return row
}

func phaseIndex(_ p: PathPhase) -> Int {
    switch p {
    case .lane: 0
    case .air: 1
    case .board: 2
    }
}

func point(_ q: CGPoint) -> String { "\(f64(Double(q.x))),\(f64(Double(q.y)))" }

func onScreen(_ h: Hole) -> CGPoint {
    let n = Double(index(h))
    return CGPoint(x: n * 41.5 + 3, y: 700 - n * 55.25)
}

let center = CGPoint(x: 195, y: 422)

/// HUDState.make's every derived field.
func hud(_ p: Presentation, bet: Bet) -> [String] {
    let h = HUDState.make(p, holeOnScreen: onScreen, center: center, bet: bet)
    var row = ["h", i(h.score), i(h.target), i(h.tickets), i(h.heat), i(h.heatMax), b(h.fever), i(h.frameNumber),
               i(h.framesTotal), i(h.ballsLeft), b(h.busy), i(h.combo)]
    row.append(h.targets.map { String(index($0)) }.joined(separator: ","))
    row.append(h.frame.map { $0.map { String(index($0)) } ?? "n" }.joined(separator: ","))
    if let m = h.machine {
        let wins = m.wins.map { "\($0.line):\(index($0.symbol)):\($0.chips):\($0.multiplier)" }
        row.append([m.positions.map(f64).joined(separator: ","), String(m.bet.lines),
                    csv(Bet.allCases.filter { m.affordable.contains($0) }.map { String($0.lines) }),
                    b(m.canPull), b(m.free), String(m.freeLeft), wins.isEmpty ? "-" : wins.joined(separator: "/"),
                    b(m.teasing), String(index(m.room))].joined(separator: ";"))
    } else {
        row.append("n")
    }
    row.append(h.tally.map { "\($0.chips),\(f64($0.mult)),\(textHash($0.label))" } ?? "n")
    row.append(h.banner.map { "\(textHash($0.title)),\(textHash($0.sub)),\(f64($0.progress))" } ?? "n")
    row.append(h.popups.isEmpty ? "-" : h.popups.map {
        "\(textHash($0.text)),\(kindIndex($0.kind)),\(point($0.at)),\(f64($0.age))"
    }.joined(separator: ";"))
    row.append(h.hint.map { "\(textHash($0.text)),\($0.symbol.map { String(index($0)) } ?? "n"),\(textHash($0.after)),\(b($0.hot))" } ?? "n")
    row.append(h.hotAt.map(point) ?? "n")
    row += [b(h.firstThrow), b(h.rack), b(h.counter != nil), h.over.map { b($0.won) } ?? "n"]
    row += [f64(h.shower), f64(h.clock), String(index(h.ball)), textHash(h.roundTitle), b(h.isBoss),
            textHash(h.bossName), textHash(h.bossBlurb), i(h.ante), i(h.antes), i(h.throwsMeter.count)]
    row.append(csv(h.charms.map { String(index($0)) }))
    row.append(csv(h.powerUps.map { String(index($0)) }))
    row.append(h.armed.map { String(index($0)) } ?? "n")
    row.append(h.screen == .game ? "1" : "0")
    return row
}

// ---- Driving ----

let dts: [Double] = [1.0 / 60, 1.0 / 7, 0, 1.0 / 30, 0.25, 1.0 / 120, 0.05, 1.0 / 60, 0.5, 0, 1.0 / 60, 0.1, 1.0 / 60, 0.3]
var dtAt = 0
var cuesSeen = Set<String>()
var beatsSeen = Set<String>()
var bannersSeen = Set<String>()
var popupsSeen = Set<String>()
var ticks = 0

@MainActor func emit(_ p: Presentation, bet: Bet) {
    ticks += 1
    for c in p.cues {
        cuesSeen.insert(String(String(describing: c).prefix { $0 != "(" }))
        if case .banner(let t) = c { bannersSeen.insert(t) }
    }
    if let b = p.current { beatsSeen.insert(beatLetter(b)) }
    for b in p.finished { beatsSeen.insert(beatLetter(b)) }
    if let (t, _, _) = p.banner { bannersSeen.insert(t) }
    for pop in p.popups { popupsSeen.insert(pop.text) }
    g.line(tick(p))
    g.line(hud(p, bet: bet))
}

@MainActor func step(_ p: inout Presentation, bet: Bet) {
    let dt = dts[dtAt % dts.count]
    dtAt += 1
    p.advance(dt)
    g.line("d", f64(dt))
    emit(p, bet: bet)
}

/// What the driver does next, given the state.
func choose(_ s: RunState, _ rng: inout SplitMix64, maxBet: Bool) -> Action? {
    switch s.phase {
    case .lost, .won:
        return nil
    case .prizeCounter(let c):
        let u = rng.nextUnit()
        if u < 0.6, let at = c.offers.indices.first(where: { c.offers[$0].map { $0.cost <= s.tickets } ?? false }) {
            return .buy(at, target: c.offers[at]!.needsTarget ? .ring30 : nil)
        }
        if u < 0.7 && c.rerollCost <= s.tickets { return .reroll }
        if u < 0.75 && !s.charms.isEmpty { return .sell(0) }
        return .leaveCounter
    case .throwing:
        if s.round.pull == nil {
            if maxBet && s.tickets >= Bet.five.cost { return .pull(.five) }
            let u = rng.nextUnit()
            if u < 0.15 && s.tickets >= Bet.three.cost { return .pull(.three) }
            return .pull(.one)
        }
        let u = rng.nextUnit()
        if u < 0.05 { return .foul }
        if u < 0.09 { return .chooseBall(BallKind.allCases[rng.nextInt(below: BallKind.allCases.count)]) }
        if u < 0.13 && !s.powerUps.isEmpty && s.round.armed == nil { return .arm(0) }
        let power = 0.3 + 0.65 * rng.nextUnit()
        let aim = -0.6 + 1.2 * rng.nextUnit()
        if u > 0.9 {
            return .throwBall(Launch(power: power, aim: aim, start: rng.nextUnit() - 0.5, fold: rng.nextUnit(),
                                     spin: rng.nextUnit() - 0.5, skid: 0.2 * rng.nextUnit()))
        }
        return .throwBall(Launch(power: power, aim: aim))
    }
}

let releases: [Double] = [0, 0, 0.3, 0.8, 0, 1.5, 0.05]

/// Shot events at the very first sample of an untrimmed path: Presentation.during's
/// `before == 0 && et == t0` branch, which only such an event reaches.
var firstMomentEvents = 0

@MainActor func noteFirstMoment(_ st: Step) {
    for e in st.events {
        if case .shot(let r, _) = e, let t0 = r.path.first?.t {
            firstMomentEvents += r.eventTimes.filter { $0 == t0 }.count
        }
    }
}

/// A run played from a fixed list of actions, each watched frame by frame.
@MainActor func scripted(_ label: String, seed: UInt64, room: Room, config: RunConfig, actions: [(Action, Double)]) {
    var s = newRun(seed: seed, config: config, room: room)
    var p = Presentation(state: s)
    g.line("run", label, u64(seed), i(index(room)), i(config.antes), f64(config.targetScale), i(config.startTickets), i(config.framesPerRound))
    emit(p, bet: s.round.lastBet)
    for (a, along) in actions {
        guard case .success(let st) = apply(a, to: s) else {
            print("golden-presentation: \(label) refused \(a)")
            exit(1)
        }
        s = st.state
        g.line("a", actionToken(a), f64(along), String(digest(of: s)))
        noteFirstMoment(st)
        p.enqueue(st, releaseAlong: along)
        while p.isBusy { step(&p, bet: s.round.lastBet) }
        step(&p, bet: s.round.lastBet)
    }
}

/// The first seed from `from` whose driven run scores a jackpot frame, and the step that does.
@MainActor func findJackpot(from: UInt64, room: Room, config: RunConfig, steps: Int) -> (UInt64, Int) {
    for seed in from..<(from + 5000) {
        var s = newRun(seed: seed, config: config, room: room)
        var rng = SplitMix64(seed: seed &+ 0x5EED)
        for n in 0..<steps {
            guard let a = choose(s, &rng, maxBet: true) else { break }
            guard case .success(let st) = apply(a, to: s) else { continue }
            s = st.state
            if s.stats.jackpots > 0 { return (seed, n) }
        }
    }
    print("golden-presentation: no jackpot found")
    exit(1)
}

@MainActor func run(_ label: String, seed: UInt64, room: Room, config: RunConfig, steps: Int, detailed: Int, maxBet: Bool = false,
                    detailedFrom: Int = .max) {
    var s = newRun(seed: seed, config: config, room: room)
    var p = Presentation(state: s)
    var rng = SplitMix64(seed: seed &+ 0x5EED)
    g.line("run", label, u64(seed), i(index(room)), i(config.antes), f64(config.targetScale), i(config.startTickets), i(config.framesPerRound))
    emit(p, bet: s.round.lastBet)
    for n in 0..<steps {
        guard let a = choose(s, &rng, maxBet: maxBet) else { break }
        guard case .success(let st) = apply(a, to: s) else { continue }
        s = st.state
        let along: Double = if case .throwBall = a { releases[n % releases.count] } else { 0 }
        g.line("a", actionToken(a), f64(along), String(digest(of: s)))
        p.enqueue(st, releaseAlong: along)
        let bet = s.round.lastBet
        noteFirstMoment(st)
        if n < detailed || n >= detailedFrom {
            if n % 4 == 3 {
                // Queue the next step behind this one.
                for _ in 0..<3 { step(&p, bet: bet) }
            } else {
                var guardTicks = 0
                while p.isBusy && guardTicks < 2000 { step(&p, bet: bet); guardTicks += 1 }
                step(&p, bet: bet)
            }
        } else if n % 6 == 0 {
            while p.isBusy { step(&p, bet: bet) }
        } else {
            p.skip()
            g.line("x")
            emit(p, bet: bet)
        }
    }
    while p.isBusy { step(&p, bet: s.round.lastBet) }
}

var standard = RunConfig.standard
var quick = RunConfig.standard
quick.targetScale = 0.02
quick.startTickets = 12
var short = RunConfig.standard
short.antes = 1
short.targetScale = 0.01
short.startTickets = 20
var hunt = RunConfig.standard
hunt.framesPerRound = 400
hunt.startTickets = 100_000
hunt.targetScale = 0.01

run("standard3", seed: 3, room: .boardwalk, config: standard, steps: 40, detailed: 26)
run("standard2", seed: 2, room: .neonLounge, config: standard, steps: 30, detailed: 12)
run("quick7", seed: 7, room: .boardwalk, config: quick, steps: 120, detailed: 20)
run("quick11", seed: 11, room: .highRoller, config: quick, steps: 90, detailed: 8)
run("short5", seed: 5, room: .penthouse, config: short, steps: 160, detailed: 6)
run("short9", seed: 9, room: .boardwalk, config: short, steps: 160, detailed: 4)
run("hunt1", seed: 1, room: .boardwalk, config: hunt, steps: 260, detailed: 4, maxBet: true)
run("hunt4", seed: 4, room: .penthouse, config: hunt, steps: 260, detailed: 0, maxBet: true)

// A ball started against a rail and aimed into it meets the rail in its first
// 240 Hz step, while t is still the path's first time.
scripted("rails", seed: 6, room: .boardwalk, config: standard, actions: [
    (.pull(.one), 0),
    (.throwBall(Launch(power: 0.7, aim: 0.6, start: 1)), 0),
    (.throwBall(Launch(power: 0.55, aim: -0.8, start: -1)), 0),
    (.throwBall(Launch(power: 0.8, aim: 0.3, start: 1, fold: 0.5)), 0.3),
])

// A jackpot frame (three sevens or diamonds), watched frame by frame.
let (jackpotSeed, jackpotStep) = findJackpot(from: 100, room: .boardwalk, config: hunt, steps: 400)
print("jackpot: seed \(jackpotSeed) step \(jackpotStep)")
run("jackpot", seed: jackpotSeed, room: .boardwalk, config: hunt, steps: jackpotStep + 1, detailed: 0, maxBet: true,
    detailedFrom: jackpotStep)

// HUDState.num: %.1f's sign of a negative that rounds to zero, exact decimal
// halves (ties to even) and doubles just off one (0.35 is 0.34999...). Exact while
// |x| * 10 < 2^53, which every game value is far inside.
for x in [0.0, -0.0, 3.0, -1.0, 1.5, -2.5, 0.25, 0.75, 0.04, -0.04, -0.05, 0.05, 0.15, -0.15, 0.35, 0.45, 0.55, 0.65,
          0.95, 1.05, 2.675, 9.95, 99.95, 12.25, 100.125, -0.25, -0.35, 1.0 / 3, 2.0 / 3, 1e-9, 450359962737049.5, 450359962737049.55] {
    g.line("num", f64(x), HUDState.num(x))
}

// Presentation.pullSymbol, every room and reel, either side of zero.
for room in Room.allCases {
    for reel in 0..<3 {
        for position in [0, 0.5, 3.99, 7.2, -0.5, -1, -13.7, 25.1, 40, 59.999] {
            for row in [-1, 0, 1, 2] {
                g.line("ps", i(reel), f64(position), i(row), i(index(room)),
                       i(index(Presentation.pullSymbol(reel: reel, at: position, row: row, room: room))))
            }
        }
    }
}

// ---- Coverage: a thin golden fails here, not by passing there. ----

let wantCues = ["launch", "hump", "drop", "gutter", "lever", "pullWin", "reelTick", "reelStop", "combo",
                "tallyChips", "tallyMult", "frameDone", "lineWon", "banner", "foul", "whoosh", "landed", "lip",
                "jackpot", "rail"]
let wantBeats = ["R", "S", "P", "T", "B", "C"]
let wantBanners = ["FOUL", "CLEARED", "FEVER", "YOU BEAT THE ARCADE", "FREE GAMES"]
var missing = wantCues.filter { !cuesSeen.contains($0) } + wantBeats.filter { !beatsSeen.contains($0) }
    + wantBanners.filter { !bannersSeen.contains($0) }
if !bannersSeen.contains(where: { $0.hasPrefix("ANTE") }) { missing.append("ANTE banner") }
if !bannersSeen.contains(where: { $0.hasSuffix("JACKPOT") }) { missing.append("JACKPOT banner") }
if !popupsSeen.contains(where: { $0.hasPrefix("JACKPOT  ") }) { missing.append("JACKPOT tally popup") }
if firstMomentEvents == 0 { missing.append("an event at a path's first time") }
print("cues seen: \(cuesSeen.sorted())")
print("banners seen: \(bannersSeen.sorted())")
print("ticks: \(ticks)")
if !missing.isEmpty {
    print("golden-presentation: missing coverage: \(missing)")
    exit(1)
}
try g.write()
