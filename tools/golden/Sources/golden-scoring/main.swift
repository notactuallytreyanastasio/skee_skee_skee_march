import Foundation
import GoldenSupport
@testable import SkeeCore

// Scoring goldens from the real SkeeCore: Symbol, Payline, BoardSetup, TopSlot,
// Pull, Progressive and scoreFrame with its ordered steps.
//
// Everything in a row is what Swift computed. The only logic of our own here is
// `tiedSymbols`, which marks the inputs where Swift's answer depends on the
// per-process hash seed, so the file is reproducible. See tieProbe below.

func csv(_ xs: [String]) -> String { xs.isEmpty ? "-" : xs.joined(separator: ",") }

/// A list of records in one token. "-" is the empty list.
func joined(_ xs: [String]) -> String { xs.isEmpty ? "-" : xs.joined(separator: ";") }

func kindAndSymbol(_ p: Payline) -> String {
    switch p {
    case .none: "none"
    case .pair(let s): "pair:\(s.rawValue)"
    case .triple(let s): "triple:\(s.rawValue)"
    }
}

/// `Payline.evaluate` takes `max` over a `Set`, so equal keys resolve in hash
/// order, which Swift seeds per process. These are the symbols that tie for
/// best: more than one means Swift itself has no single answer.
func tiedSymbols(_ symbols: [Symbol]) -> [Symbol] {
    let wilds = symbols.filter(\.isWild).count
    let real = symbols.filter { $0 != .blank && !$0.isWild }
    let keyed = Set(real).map { s in (s, real.filter { $0 == s }.count + wilds, s.tripleMult) }
    guard let top = keyed.map({ ($0.1, $0.2) }).max(by: { $0 < $1 }) else { return [] }
    return keyed.filter { $0.1 == top.0 && $0.2 == top.1 }.map(\.0).sorted { $0.rawValue < $1.rawValue }
}

/// The payline as a token. A tied line names every symbol Swift may pick.
func paylineToken(_ p: Payline, _ symbols: [Symbol]) -> String {
    let tied = tiedSymbols(symbols)
    guard tied.count > 1 else { return kindAndSymbol(p) }
    let names = tied.map(\.rawValue).joined(separator: "|")
    switch p {
    case .none: return "none"
    case .pair: return "pair:\(names)"
    case .triple: return "triple:\(names)"
    }
}

func lineWinToken(_ w: LineWin?) -> String {
    guard let w else { return "none" }
    return "\(i(w.line)):\(w.symbol.rawValue):\(i(w.chips)):\(i(w.multiplier))"
}

func sourceToken(_ s: ScoreStep.Source) -> String {
    switch s {
    case .base: "base"
    case .pull: "pull"
    case .ball(let n): "ball:\(i(n))"
    case .slot(let n): "slot:\(i(n))"
    case .payline: "payline"
    case .charm(let c): "charm:\(c.rawValue)"
    case .fever: "fever"
    case .freeGame: "freeGame"
    }
}

func effectToken(_ e: ScoreStep.Effect) -> String {
    switch e {
    case .base(let c, let m): "base:\(i(c)):\(f64(m))"
    case .chips(let c): "chips:\(i(c))"
    case .mult(let m): "mult:\(f64(m))"
    case .timesMult(let x): "times:\(f64(x))"
    case .tickets(let t): "tickets:\(i(t))"
    case .note(let s): "note:\(s.replacingOccurrences(of: " ", with: "_"))"
    }
}

func stepToken(_ s: ScoreStep) -> String { sourceToken(s.source) + "," + effectToken(s.effect) }

func ballToken(_ r: BallRecord) -> String {
    csv([r.hole.rawValue, r.symbol.rawValue, i(r.chips), i(r.rattles), f64(r.fold), b(r.foul),
         i(r.slotHits), i(r.combo), r.ball.rawValue, b(r.hot)])
}

func pullToken(_ p: Pull?) -> String {
    guard let p else { return "-" }
    return csv([i(p.stops[0]), i(p.stops[1]), i(p.stops[2]), i(p.bet.rawValue), b(p.free), p.room.rawValue])
}

func tierToken(_ t: JackpotTier?) -> String { t?.rawValue ?? "none" }

/// Prints what this process's hash seed makes of the one three-ball tie.
/// `SKEE_TIE_PROBE=1 golden-scoring` run repeatedly shows Swift disagreeing
/// with itself, which is why the tied rows name both symbols.
if ProcessInfo.processInfo.environment["SKEE_TIE_PROBE"] != nil {
    print(kindAndSymbol(Payline.evaluate([.cherry, .lemon, .clover])))
    exit(0)
}

var g = GoldenFile(module: "Scoring")
let rooms = Room.allCases
let bets = Bet.allCases

// ---- Tables ----
for s in Symbol.allCases {
    g.line("symbol", s.rawValue, i(s.flatChips), f64(s.pairMult), f64(s.tripleMult), b(s.isWild))
}
for s in ReelSymbol.allCases {
    g.line("reel", s.rawValue, b(s.isWild), i(s.lineMultiplier), i(s.linePay), s.target.rawValue)
}
for x in bets {
    g.line("bet", i(x.rawValue), i(x.lines), i(x.cost), b(x.isMax))
}
for t in JackpotTier.allCases {
    g.line("tier", t.rawValue, t.title, i(Progressive.seeds[t]!), i(Progressive.growth[t]!))
}
g.line("consts", i(TopSlot.maxLevel), i(TopSlot.jackpotTickets), i(Pull.freeGamesAwarded))
for line in Pull.lines { g.line("linedef", csv(line.map(i))) }

// ---- Payline: every sequence of symbols up to four long ----
func sequences(_ n: Int) -> [[Symbol]] {
    n == 0 ? [[]] : sequences(n - 1).flatMap { head in Symbol.allCases.map { head + [$0] } }
}
for n in 0...4 {
    for s in sequences(n) {
        let p = Payline.evaluate(s)
        g.line("payline", csv(s.map(\.rawValue)), paylineToken(p, s), f64(p.addedMult))
    }
}

// ---- TopSlot: every window against every ball ----
for w in sequences(3) {
    let slot = TopSlot(symbols: w)
    for s in Symbol.allCases {
        g.line("hits", csv(w.map(\.rawValue)), s.rawValue, i(slot.hits(s)))
    }
}
for hits in 0...6 {
    for level in [-3, -1, 0, 1, 2, 3, 4, 5, 6, 7, 99] {
        g.line("combo", i(hits), i(level), f64(TopSlot.comboMult(hits: hits, level: level)))
    }
}

// ---- BoardSetup, per room, then with a reel emptied and a hole gilded ----
for room in rooms {
    let setup = room.setup
    for hole in Hole.allCases {
        g.line("board", room.rawValue, hole.rawValue, csv(setup.reel(hole).map(\.rawValue)),
               setup.homeSymbol(for: hole).rawValue, i(setup.chips(for: hole)))
        var changed = setup
        if hole != .gutter {
            changed.reels[hole] = []
            changed.gild[hole, default: 0] += 25
        }
        g.line("boardchanged", room.rawValue, hole.rawValue, csv(changed.reel(hole).map(\.rawValue)),
               changed.homeSymbol(for: hole).rawValue, i(changed.chips(for: hole)))
    }
}

// ---- Line wins: every three reel symbols, on every line index ----
for a in ReelSymbol.allCases {
    for c in ReelSymbol.allCases {
        for d in ReelSymbol.allCases {
            let s = [a, c, d]
            g.line("linewin", csv(s.map(\.rawValue)), lineWinToken(Pull.lineWin(s, line: (a == c ? 3 : 0))),
                   i(a == c ? 3 : 0))
        }
    }
}

// ---- Every window of every room, at every bet, free and paid, as checksums ----
// A checksum per configuration, because the 8,000 windows are identical in
// shape; the seeded rows below carry every field of a pull.
for room in rooms {
    let lengths = room.strips.map(\.count)
    for bet in bets {
        for free in [false, true] {
            var chips = 0, scatters = 0, triggers = 0, wins = 0, hash = 0
            var tiers: [JackpotTier: Int] = [:]
            for x in 0..<lengths[0] {
                for y in 0..<lengths[1] {
                    for z in 0..<lengths[2] {
                        let p = Pull(stops: [x, y, z], bet: bet, free: free, room: room)
                        let tier = p.jackpot
                        if let tier { tiers[tier, default: 0] += 1 }
                        chips += p.lineChips
                        scatters += p.scatters
                        triggers += p.triggersFreeGames ? 1 : 0
                        wins += p.lineWins.count
                        let rank = tier.map { $0.rank + 1 } ?? 0
                        hash = (hash * 131 + p.lineChips + 7 * p.scatters + 17 * rank + 3 * p.lineWins.count) % 1_000_000_007
                    }
                }
            }
            g.line("windows", room.rawValue, i(bet.rawValue), b(free), i(chips), i(scatters), i(triggers), i(wins),
                   i(hash), csv(JackpotTier.allCases.map { i(tiers[$0] ?? 0) }))
        }
    }
}

// ---- Seeded pulls: every room, every bet, free and paid, in a chain ----
// Seeds from a generator, so the top bits are exercised, plus zero.
var seedSource = SplitMix64(seed: 0x5C0_12E)
for room in rooms {
    for bet in bets {
        for free in [false, true] {
            for n in 0..<10 {
                let seed = n == 0 ? 0 : seedSource.next()
                var r = SplitMix64(seed: seed)
                for _ in 0..<25 {
                    let before = r.state
                    let p = Pull.spin(bet: bet, free: free, room: room, &r)
                    g.line("pull", room.rawValue, i(bet.rawValue), b(free), u64(before), u64(r.state), csv(p.stops.map(i)),
                           csv(p.grid.flatMap { $0 }.map(\.rawValue)), csv(p.centre.map(\.rawValue)),
                           csv(p.targets.map(\.rawValue)), csv(Array(p.activeLines).map(i)),
                           joined(p.lineWins.map { lineWinToken($0) }), i(p.lineChips), i(p.scatters),
                           b(p.triggersFreeGames), tierToken(p.jackpot))
                }
            }
        }
    }
}

// ---- Progressive: a seeded chain of feeds and hits ----
var meters = Progressive()
var progressRng = SplitMix64(seed: 0xFEED)
for _ in 0..<400 {
    let tier = progressRng.pick(JackpotTier.allCases)
    let bet = progressRng.pick(bets)
    if progressRng.nextInt(below: 5) == 0 {
        let won = meters.hit(tier)
        g.line("meters", "hit", tier.rawValue, i(won), csv(JackpotTier.allCases.map { i(meters.amount($0)) }))
    } else {
        meters.feed(bet)
        g.line("meters", "feed", i(bet.rawValue), "0", csv(JackpotTier.allCases.map { i(meters.amount($0)) }))
    }
}

// ---- Frames ----
// Records and contexts drawn from the real generator, skewed so lines, top-slot
// tickets, fever, free games and every charm all fire. The frame count is what
// `coverage` proves, below: every step source and effect, and every charm.
func randomFrame(_ r: inout SplitMix64) -> ([BallRecord], ScoringContext) {
    let room = r.pick(rooms)
    let setup = room.setup
    let shape = r.nextInt(below: 20)
    let count = shape == 0 ? 0 : shape == 1 ? 1 : shape == 2 ? 2 : shape == 3 ? 4 : 3
    // Half the frames aim at one hole or a run of rings, to reach Even Steven,
    // Ladder and triples.
    let plan = r.nextInt(below: 4)
    let fixed = r.pick(Hole.allCases)
    let ladderStart = r.nextInt(below: 3)
    let rings: [Hole] = [.ring10, .ring20, .ring30, .ring40, .ring50]
    let shared = r.pick(Symbol.allCases)
    let balls = (0..<count).map { n -> BallRecord in
        let hole: Hole = switch plan {
        case 0: fixed
        case 1: rings[ladderStart + min(n, 2)]
        default: r.pick(Hole.allCases)
        }
        let reel = setup.reel(hole)
        let symbol: Symbol = switch r.nextInt(below: 5) {
        case 0: r.pick(Symbol.allCases)
        case 1, 2: shared
        default: r.pick(reel)
        }
        return BallRecord(hole: hole, symbol: symbol,
                          chips: setup.chips(for: hole) + 25 * r.nextInt(below: 3),
                          rattles: r.nextInt(below: 4), fold: r.nextUnit(),
                          foul: hole == .gutter && r.nextInt(below: 3) == 0,
                          slotHits: r.nextInt(below: 4), combo: r.nextInt(below: 8),
                          ball: r.pick(BallKind.allCases), hot: r.nextInt(below: 3) == 0)
    }
    let charms = (0..<r.nextInt(below: 6)).map { _ in r.pick(Charm.allCases) }
    let pull: Pull? = r.nextInt(below: 3) == 0 ? nil
        : Pull.spin(bet: r.pick(bets), free: r.nextInt(below: 4) == 0, room: room, &r)
    let context = ScoringContext(charms: charms, streakBefore: r.nextInt(below: 13), fever: r.nextInt(below: 4) == 0,
                                 pairsPay: r.nextInt(below: 5) != 0, pull: pull)
    return (balls, context)
}

/// A step's shape, without its numbers: what `coverage` counts.
func shape(_ s: ScoreStep) -> String {
    let source = sourceToken(s.source).split(separator: ":")[0]
    let effect = effectToken(s.effect).split(separator: ":")[0]
    return "\(source)/\(effect)"
}

var frameRng = SplitMix64(seed: 0xF2A_3E)
var coverage: Set<String> = []
var firedCharms: Set<Charm> = []
var jackpotFrames = 0
for _ in 0..<5000 {
    let (balls, context) = randomFrame(&frameRng)
    let f = scoreFrame(balls, context: context)

    // The total is the fold of the steps. If this ever fails, Swift changed.
    var chips = 0, mult = 1.0, tickets = 0
    for s in f.steps {
        coverage.insert(shape(s))
        if case .charm(let c) = s.source { firedCharms.insert(c) }
        switch s.effect {
        case .base(let c, let m): chips = c; mult = m
        case .chips(let c): chips += c
        case .mult(let m): mult += m
        case .timesMult(let x): mult *= x
        case .tickets(let t): tickets += t
        case .note: break
        }
    }
    precondition(chips == f.chips && mult == f.mult && tickets == f.tickets, "steps do not fold to the frame")
    if f.isJackpot { jackpotFrames += 1 }

    g.line("frame", joined(balls.map(ballToken)), csv(context.charms.map(\.rawValue)), i(context.streakBefore),
           b(context.fever), b(context.pairsPay), pullToken(context.pull),
           paylineToken(f.payline, balls.map(\.symbol)), joined(f.steps.map(stepToken)), i(f.chips), f64(f.mult),
           i(f.tickets), i(f.streakAfter), i(f.total), b(f.isJackpot))
}

// Every charm but Extra Ball, which never emits a step, must have fired.
let silent = Set(Charm.allCases).subtracting(firedCharms)
precondition(silent == [.extraBall], "charms that never fired: \(silent)")
precondition(jackpotFrames > 0, "no jackpot frame")
for needed in ["base/base", "pull/chips", "ball/chips", "slot/mult", "slot/tickets", "payline/mult", "payline/note",
               "charm/chips", "charm/mult", "charm/times", "charm/tickets", "charm/note", "fever/times", "freeGame/times"] {
    precondition(coverage.contains(needed), "step never generated: \(needed)")
}
for c in coverage.sorted() { g.line("coverage", c) }

try g.write()
