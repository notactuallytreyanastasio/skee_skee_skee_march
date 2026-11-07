import Foundation
import GoldenSupport
@testable import SkeeCore

// Items goldens, from the real BallKind, Charm, PowerUp, Offer, Boss, RoundKind,
// difficultyTable and RunConfig.target. Row kinds are read by
// test/suites/items_suite.march.
var g = GoldenFile(module: "Items")

/// A display string as one token. Spaces become underscores, so the text must
/// not hold an underscore or anything that a March string literal would treat
/// specially: the mapping has to stay reversible for the comparison to be exact.
@MainActor func txt(_ s: String) -> String {
    for c in s.unicodeScalars {
        precondition(c.isASCII && !"_\"\\\n$#{}".unicodeScalars.contains(c), "text token cannot hold \(c): \(s)")
    }
    return s.replacingOccurrences(of: " ", with: "_")
}

// ---- Catalogues, in allCases order: the order RNG picks index into. ----

for ball in BallKind.allCases {
    g.line("ball", ball.rawValue, txt(ball.name), txt(ball.short), txt(ball.blurb), f64(ball.pay),
           txt(ball.payLabel), b(ball.isRandom), f64(ball.speedScale), f64(Double(ball.drawnSize)))
}
for charm in Charm.allCases {
    g.line("charm", charm.rawValue, txt(charm.name), txt(charm.blurb), i(charm.cost))
}
for power in PowerUp.allCases {
    g.line("power", power.rawValue, txt(power.name), txt(power.blurb), i(power.cost))
}
for boss in Boss.allCases {
    g.line("boss", boss.rawValue, txt(boss.name), txt(boss.blurb), i(boss.frameDelta), b(boss.pairsPay))
}
for kind in RoundKind.allCases {
    g.line("round", kind.rawValue, txt(kind.title), kind.next?.rawValue ?? "-")
}

// ---- Offers ----

@MainActor func offerLine(_ kind: String, _ arg: String, _ o: Offer) {
    g.line("offer", kind, arg, i(o.cost), b(o.needsTarget))
}
for c in Charm.allCases { offerLine("charm", c.rawValue, .charm(c)) }
for s in Symbol.allCases { offerLine("stamp", s.rawValue, .stamp(s)) }
offerLine("gild", "-", .gild)
offerLine("purge", "-", .purge)
for p in PowerUp.allCases { offerLine("power", p.rawValue, .powerUp(p)) }
g.line("gild_amount", i(Offer.gildAmount))

// ---- Boss chips ----

for boss in Boss.allCases {
    for hole in Hole.allCases {
        for base in [0, 1, 10, 50, 100, 160] {
            g.line("boss_chips", boss.rawValue, hole.rawValue, i(base), i(boss.chips(for: hole, base: base)))
        }
    }
}

// ---- Tables ----

/// Every field of a table: three non-Float tokens, then the Floats in the order
/// the suite's `table_floats` lists them.
@MainActor func fields(_ t: Table) -> [String] {
    let l = t.lane, h = t.hinge, d = t.board
    precondition(d.ringWalls.count == 4 && d.pockets.count == 2)
    let left = d.pockets[0], right = d.pockets[1]
    let floats: [Double] = [
        l.length, l.width, l.incline, l.rollingFriction, l.railRestitution, l.minSpeed, l.scoringSpeed,
        l.maxSpeed, l.knee, l.maxAimAngle, l.hook, l.skidLoss,
        h.baseAngle, h.foldGain, h.carry,
        d.width, d.height, d.tilt, d.ringCenter.x, d.ringCenter.y, d.centerHoleOffset.x, d.centerHoleOffset.y,
        d.centerHoleRadius, d.captureSpeed, d.lipMinFall,
        d.ringWalls[0], d.ringWalls[1], d.ringWalls[2], d.ringWalls[3],
        left.center.x, left.center.y, left.radius, right.center.x, right.center.y, right.radius,
        d.lipHeight, d.ballRadius, d.lipBand, d.bounce, d.lipBounce, d.lipKick, d.wallRestitution,
        d.backwallRestitution, d.rollingFriction, d.landingGrip, d.wind.x, d.wind.y, d.ringHoleRadius,
        t.gravity, t.dt, t.maxDuration,
    ]
    return [b(d.pocketsNeedFlight), left.hole.rawValue, right.hole.rawValue] + floats.map(f64)
}

/// A table with every field moved, so that a port reading a constant where the
/// Swift reads the table, or the wrong field, cannot pass.
@MainActor func alternate() -> Table {
    var r = SplitMix64(seed: 0xA17)
    func p(_ x: Double) -> Double { x * (0.75 + 0.5 * r.nextUnit()) + 0.001 * r.nextUnit() }
    var t = Table.standard
    t.lane.length = p(t.lane.length); t.lane.width = p(t.lane.width); t.lane.incline = p(t.lane.incline)
    t.lane.rollingFriction = p(t.lane.rollingFriction); t.lane.railRestitution = p(t.lane.railRestitution)
    t.lane.minSpeed = p(t.lane.minSpeed); t.lane.scoringSpeed = p(t.lane.scoringSpeed)
    t.lane.maxSpeed = p(t.lane.maxSpeed); t.lane.knee = p(t.lane.knee)
    t.lane.maxAimAngle = p(t.lane.maxAimAngle); t.lane.hook = p(t.lane.hook); t.lane.skidLoss = p(t.lane.skidLoss)
    t.hinge.baseAngle = p(t.hinge.baseAngle); t.hinge.foldGain = p(t.hinge.foldGain); t.hinge.carry = p(t.hinge.carry)
    t.board.width = p(t.board.width); t.board.height = p(t.board.height); t.board.tilt = p(t.board.tilt)
    t.board.ringCenter = Vec2(p(t.board.ringCenter.x), p(t.board.ringCenter.y))
    t.board.centerHoleOffset = Vec2(p(t.board.centerHoleOffset.x), p(t.board.centerHoleOffset.y))
    t.board.centerHoleRadius = p(t.board.centerHoleRadius); t.board.captureSpeed = p(t.board.captureSpeed)
    t.board.pocketsNeedFlight = false
    t.board.lipMinFall = p(t.board.lipMinFall)
    t.board.ringWalls = t.board.ringWalls.map(p)
    t.board.pockets = t.board.pockets.map { q in
        var n = q; n.center = Vec2(p(q.center.x), p(q.center.y)); n.radius = p(q.radius); return n
    }
    t.board.lipHeight = p(t.board.lipHeight); t.board.ballRadius = p(t.board.ballRadius)
    t.board.lipBand = p(t.board.lipBand); t.board.bounce = p(t.board.bounce)
    t.board.lipBounce = p(t.board.lipBounce); t.board.lipKick = p(t.board.lipKick)
    t.board.wallRestitution = p(t.board.wallRestitution)
    t.board.backwallRestitution = p(t.board.backwallRestitution)
    t.board.rollingFriction = p(t.board.rollingFriction); t.board.landingGrip = p(t.board.landingGrip)
    t.board.wind = Vec2(p(t.board.wind.x), p(t.board.wind.y)); t.board.ringHoleRadius = p(t.board.ringHoleRadius)
    t.gravity = p(t.gravity); t.dt = p(t.dt); t.maxDuration = p(t.maxDuration)
    return t
}

let alt = alternate()
g.line(["alt_table"] + fields(alt))

/// One table, modified in the order `table(for:)` applies modifiers. Any
/// modifier may be absent, which writes `-`.
@MainActor func tableLine(alternate useAlt: Bool, ante: Int? = nil, antes: Int = 8, boss: Boss? = nil,
               power: PowerUp? = nil, ball: BallKind? = nil) {
    var t = useAlt ? alt : Table.standard
    if let ante { t = difficultyTable(ante: ante, base: t, antes: antes) }
    if let boss { t = boss.modify(t) }
    if let power { t = power.modify(t) }
    if let ball { t = ball.modify(t) }
    g.line(["table", useAlt ? "alt" : "std", ante.map(String.init) ?? "-", i(antes), boss?.rawValue ?? "-",
            power?.rawValue ?? "-", ball?.rawValue ?? "-"] + fields(t))
}

let bases = [false, true]
for base in bases {
    tableLine(alternate: base)
    for ball in BallKind.allCases { tableLine(alternate: base, ball: ball) }
    for power in PowerUp.allCases { tableLine(alternate: base, power: power) }
    for boss in Boss.allCases { tableLine(alternate: base, boss: boss) }
    // Every ante, the clamped ones either side, and far outside.
    for ante in -3...12 { tableLine(alternate: base, ante: ante) }
}
// Other run lengths, including the max(antes - 1, 1) guard and antes below 1,
// where clamp's lo exceeds its hi.
for antes in [-2, -1, 0, 1, 2, 3, 5, 8, 12] {
    for ante in [-1, 0, 1, 2, 3, 5, 8, 9, 13] { tableLine(alternate: false, ante: ante, antes: antes) }
}
// Every item on every ante.
for ante in 1...8 {
    for boss in Boss.allCases { tableLine(alternate: false, ante: ante, boss: boss) }
    for power in PowerUp.allCases { tableLine(alternate: false, ante: ante, power: power) }
    for ball in BallKind.allCases { tableLine(alternate: false, ante: ante, ball: ball) }
}
// Modifiers stacked, as the reducer stacks them.
let bossChoices: [Boss?] = [nil] + Boss.allCases
let powerChoices: [PowerUp?] = [nil] + PowerUp.allCases
for ante in [1, 8] {
    for boss in bossChoices {
        for power in powerChoices {
            for ball in BallKind.allCases {
                tableLine(alternate: false, ante: ante, boss: boss, power: power, ball: ball)
            }
        }
    }
}
for boss in Boss.allCases {
    for power in [nil, PowerUp.feather, .magnet] as [PowerUp?] {
        for ball in [BallKind.classic, .marshmallow, .comet] {
            tableLine(alternate: true, ante: 5, boss: boss, power: power, ball: ball)
        }
    }
}

// ---- Charms ----

@MainActor func paylineToken(_ p: Payline) -> String {
    switch p {
    case .none: "none"
    case .pair(let s): "pair:" + s.rawValue
    case .triple(let s): "triple:" + s.rawValue
    }
}

@MainActor func effectToken(_ e: ScoreStep.Effect) -> String {
    switch e {
    case .mult(let m): "m:" + f64(m)
    case .timesMult(let m): "x:" + f64(m)
    case .chips(let c): "c:" + i(c)
    case .tickets(let t): "t:" + i(t)
    case .note(let s): "n:" + txt(s)
    case .base: preconditionFailure("a charm never sets the base")
    }
}

@MainActor func ballToken(_ x: BallRecord) -> String {
    [x.hole.rawValue, x.symbol.rawValue, i(x.rattles), f64(x.fold), b(x.foul)].joined(separator: ":")
}

/// One frame and what all 15 charms make of it, in allCases order.
@MainActor func frameLine(_ balls: [BallRecord], _ payline: Payline, _ streak: Int) {
    let view = FrameView(balls: balls, payline: payline, streakAfter: streak)
    let effects = Charm.allCases.map { c -> String in
        let list = c.effects(on: view)
        return list.isEmpty ? "-" : list.map(effectToken).joined(separator: ",")
    }
    let ballsToken = balls.isEmpty ? "-" : balls.map(ballToken).joined(separator: "/")
    g.line(["frame", i(streak), paylineToken(payline), ballsToken] + effects)
}

let holes = Hole.allCases
let symbols = Symbol.allCases
// Either side of the hinge whisperer's threshold, and the ends of the range.
let folds: [Double] = [0, 0.25, 0.49999999999999994, 0.5, 0.5000000000000001, 0.75, 1]
var r = SplitMix64(seed: 0x17E35)

@MainActor func randomBall(hole: Hole? = nil, symbol: Symbol? = nil) -> BallRecord {
    let h = hole ?? r.pick(holes)
    let s = symbol ?? r.pick(symbols)
    let rattles = r.nextInt(below: 5) == 0 ? r.nextInt(below: 7) : r.nextInt(below: 2)
    let fold = r.pick(folds)
    let foul = r.nextInt(below: 6) == 0
    return BallRecord(hole: h, symbol: s, chips: r.nextInt(below: 200), rattles: rattles, fold: fold, foul: foul)
}

@MainActor func randomPayline() -> Payline {
    switch r.nextInt(below: 3) {
    case 0: .none
    case 1: .pair(r.pick(symbols))
    default: .triple(r.pick(symbols))
    }
}

let streaks = [0, 0, 1, 2, 3, 7, 40]

// Every triple of holes.
for a in holes { for c in holes { for d in holes {
    let balls = [randomBall(hole: a), randomBall(hole: c), randomBall(hole: d)]
    frameLine(balls, Payline.evaluate(balls.map(\.symbol)), r.pick(streaks))
} } }
// Every triple of symbols, with the payline they really make.
for a in symbols { for c in symbols { for d in symbols {
    let balls = [randomBall(symbol: a), randomBall(symbol: c), randomBall(symbol: d)]
    frameLine(balls, Payline.evaluate(balls.map(\.symbol)), r.pick(streaks))
} } }
// Every payline against every charm, whatever the balls.
for s in symbols {
    for p in [Payline.pair(s), .triple(s)] {
        frameLine((0..<3).map { _ in randomBall() }, p, 0)
    }
}
// Frames that are not three balls long, and paylines that do not match the balls.
for n in [0, 1, 2, 4, 5] {
    for _ in 0..<40 {
        frameLine((0..<n).map { _ in randomBall() }, randomPayline(), r.pick(streaks))
    }
}
for _ in 0..<500 {
    frameLine((0..<3).map { _ in randomBall() }, randomPayline(), r.pick(streaks))
}
// Ladder's near misses: four rings in a run, and repeats.
let rings: [Hole] = [.ring10, .ring20, .ring30, .ring40, .ring50]
for start in 0...1 {
    let balls = rings[start..<start + 4].map { randomBall(hole: $0) }
    frameLine(balls, .none, 0)
}

// ---- Targets ----

@MainActor func targetStdLine(_ ante: Int, _ kind: RoundKind) {
    g.line("target_std", i(ante), kind.rawValue, i(RunConfig.standard.target(ante: ante, kind: kind)))
}
for ante in -3...12 { for kind in RoundKind.allCases { targetStdLine(ante, kind) } }

@MainActor func targetLine(_ c: RunConfig, _ ante: Int, _ kind: RoundKind) {
    g.line("target", f64(c.targetScale), f64(c.kindScale[.warmup]!), f64(c.kindScale[.feature]!),
           f64(c.kindScale[.boss]!), c.anteBase.map(i).joined(separator: ","), i(ante), kind.rawValue,
           i(c.target(ante: ante, kind: kind)))
}

// The standard table under every room's scale, as newRun multiplies it.
for room in Room.allCases {
    var c = RunConfig.standard
    c.targetScale *= room.targetScale
    for ante in -1...10 { for kind in RoundKind.allCases { targetLine(c, ante, kind) } }
}
// Scales that land on and either side of .5: rounding is away from zero, and the
// three-way product groups left to right.
let scales: [Double] = [0.1, 0.25, 0.3, 0.49999999999999994, 0.5, 0.5000000000000001, 0.7, 1.1, 1.25, 1.37,
                        2.5, -0.1, -0.25, -0.5, -1.5, 0]
for scale in scales {
    var c = RunConfig.standard
    c.targetScale = scale
    c.anteBase = [1, 2, 3, 5, 7, 9, 11, 1001]
    for ante in 1...8 { for kind in RoundKind.allCases { targetLine(c, ante, kind) } }
}
// A kind scale of 0.1 is the case where (base * kind) * scale differs from
// base * (kind * scale), and a short ante list moves the clamp.
var odd = RunConfig.standard
odd.anteBase = [333, 777, 1]
odd.kindScale = [.warmup: 0.1, .feature: 0.7, .boss: 3.3]
odd.targetScale = 1.1
for ante in -1...5 { for kind in RoundKind.allCases { targetLine(odd, ante, kind) } }

try g.write()
