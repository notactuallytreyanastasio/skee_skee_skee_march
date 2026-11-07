import Foundation
import GoldenSupport
@testable import SkeeCore

// The physics goldens: the lane curve, Launch construction, board geometry,
// analyzeFlick and simulateShot, all from the real SkeeCore. Row formats are
// read by test/suites/physics_suite.march. A comma-joined token is a list.
//
// Tables are written out field by field, so a shot row needs no March port of
// BallKind.modify, Boss.modify or Room.table to be judged: the physics is
// compared alone, on exactly the numbers Swift ran.

var g = GoldenFile(module: "Physics")
var r = SplitMix64(seed: 0x5EED_0F_5EED)

@MainActor func u(_ lo: Double, _ hi: Double) -> Double { lo + r.nextUnit() * (hi - lo) }
@MainActor func coin(_ p: Double) -> Bool { r.nextUnit() < p }

func holeName(_ h: Hole) -> String { h.rawValue }

func eventName(_ e: ShotEvent) -> String {
    switch e {
    case .dud: "dud"
    case .rail: "rail"
    case .launched: "launched"
    case .landed: "landed"
    case .lip(let ring): "lip\(ring)"
    case .backwall: "backwall"
    case .hop: "hop"
    case .dropped(let h): "dropped:\(h.rawValue)"
    case .settled(let h): "settled:\(h.rawValue)"
    case .gutter: "gutter"
    }
}

func phaseName(_ p: PathPhase) -> String { p.rawValue }

/// f64, with every NaN written as the canonical quiet NaN. Negating a NaN flips its
/// sign bit, which JS cannot show, and March's float_bits reads every NaN as this one.
func c64(_ x: Double) -> String { f64(x.isNaN ? Double.nan : x) }

// ---- The speed curve ----
let lane = LaneSpec.standard
for n in 0...400 {
    let p = Double(n) / 400
    g.line("curve", f64(p), f64(lane.releaseSpeed(power: p)))
}
for n in 0...300 {
    let v = 1.5 + Double(n) * 0.0125
    g.line("inverse", f64(v), f64(lane.power(forSpeed: v)))
}
for fold in [0.0, 0.25, 0.5, 0.75, 1.0] {
    g.line("angle", f64(fold), f64(HingeSpec.standard.launchAngle(fold: fold)))
}

// ---- Launch construction ----
func launchTokens(_ l: Launch) -> [String] {
    [f64(l.power), f64(l.speed), f64(l.from), f64(l.aim), f64(l.start), f64(l.fold), f64(l.spin), f64(l.skid)]
}
for n in 0..<300 {
    let raw = n % 3 == 0
        ? [u(-1, 2), u(-3, 3), u(-3, 3), u(-1, 2), u(-3, 3), u(-1, 2)]
        : [u(0, 1), u(-1, 1), u(-1, 1), u(0, 1), u(-1, 1), u(0, 1)]
    let l = Launch(power: raw[0], aim: raw[1], start: raw[2], fold: raw[3], spin: raw[4], skid: raw[5])
    g.line(["launchp"] + raw.map(f64) + launchTokens(l))
}
for n in 0..<300 {
    let raw = n % 3 == 0
        ? [u(-1, 8), u(-1, 4), u(-3, 3), u(-3, 3), u(-1, 2), u(-3, 3), u(-1, 2)]
        : [u(0, 5.8), u(0, 2.35), u(-1, 1), u(-1, 1), u(0, 1), u(-1, 1), u(0, 1)]
    let l = Launch(speed: raw[0], from: raw[1], aim: raw[2], start: raw[3], fold: raw[4], spin: raw[5], skid: raw[6])
    g.line(["launchs"] + raw.map(f64) + launchTokens(l) + launchTokens(l.mirrored))
}

// ---- Tables ----
func tableTokens(_ t: Table) -> [String] {
    let l = t.lane, h = t.hinge, b = t.board
    let lt = [l.length, l.width, l.incline, l.rollingFriction, l.railRestitution, l.minSpeed,
              l.scoringSpeed, l.maxSpeed, l.knee, l.maxAimAngle, l.hook, l.skidLoss].map(f64)
    let ht = [h.baseAngle, h.foldGain, h.carry].map(f64)
    let bt1 = [b.width, b.height, b.tilt, b.ringCenter.x, b.ringCenter.y, b.centerHoleOffset.x,
               b.centerHoleOffset.y, b.centerHoleRadius, b.captureSpeed].map(f64)
    let flight = [Swift.String(b.pocketsNeedFlight ? "1" : "0")]
    let bt2 = ([b.lipMinFall] + b.ringWalls + [b.pockets[0].center.x, b.pockets[0].center.y, b.pockets[0].radius,
               b.pockets[1].center.x, b.pockets[1].center.y, b.pockets[1].radius, b.lipHeight, b.ballRadius,
               b.lipBand, b.bounce, b.lipBounce, b.lipKick, b.wallRestitution, b.backwallRestitution,
               b.rollingFriction, b.landingGrip, b.wind.x, b.wind.y, b.ringHoleRadius]).map(f64)
    return lt + ht + bt1 + flight + bt2 + [t.gravity, t.dt, t.maxDuration].map(f64)
}

var gusty = Table.standard
gusty.board.wind = Vec2(-0.55, 0.3)
var gale = Boss.crosswind.modify(Room.penthouse.table)
gale.board.wind = Vec2(0.9, -0.4)
var open = Table.standard
open.board.pocketsNeedFlight = false

let bases: [Table] = [
    .standard,
    Room.neonLounge.table,
    Room.highRoller.table,
    Room.penthouse.table,
    Boss.tallLips.modify(.standard),
    Boss.slickLane.modify(.standard),
    Boss.crosswind.modify(.standard),
    Boss.tightPockets.modify(.standard),
    PowerUp.feather.modify(.standard),
    PowerUp.magnet.modify(.standard),
    PowerUp.magnet.modify(Boss.tightPockets.modify(Room.neonLounge.table)),
    PowerUp.feather.modify(Boss.tallLips.modify(Room.highRoller.table)),
    gusty,
    gale,
    open,
]
var tables: [Table] = []
@MainActor func tableId(_ t: Table) -> Int {
    if let n = tables.firstIndex(of: t) { return n }
    tables.append(t)
    g.line(["table", i(tables.count - 1)] + tableTokens(t))
    return tables.count - 1
}

// ---- Board geometry ----
for (n, t) in bases.enumerated() {
    let id = tableId(t)
    let b = t.board
    for h in Hole.allCases {
        let c = b.holeCenter(h)
        g.line("center", i(id), holeName(h), f64(c.x), f64(c.y))
    }
    for _ in 0..<(n == 0 ? 200 : 40) {
        let p = Vec2(u(-0.35, 0.35), u(-0.05, 1.05))
        g.line("zone", i(id), f64(p.x), f64(p.y), holeName(b.zone(at: p)))
    }
}
for h in Hole.allCases {
    g.line("holefacts", holeName(h), i(h.faceValue), holeName(h.mirrored), b(h.isPocket))
}

// ---- Shots ----
enum Form {
    case power(Double, Double, Double, Double, Double, Double)
    case speed(Double, Double, Double, Double, Double, Double, Double)

    var launch: Launch {
        switch self {
        case .power(let p, let a, let s, let f, let sp, let sk):
            Launch(power: p, aim: a, start: s, fold: f, spin: sp, skid: sk)
        case .speed(let v, let from, let a, let s, let f, let sp, let sk):
            Launch(speed: v, from: from, aim: a, start: s, fold: f, spin: sp, skid: sk)
        }
    }

    var tokens: [String] {
        switch self {
        case .power(let p, let a, let s, let f, let sp, let sk):
            ["p"] + [p, 0, a, s, f, sp, sk].map(f64)
        case .speed(let v, let from, let a, let s, let f, let sp, let sk):
            ["s"] + [v, from, a, s, f, sp, sk].map(f64)
        }
    }
}

var seen: [String: Int] = [:]
var shots = 0

@MainActor func shot(_ form: Form, _ table: Table, _ ball: BallKind, _ seed: UInt64) {
    let id = tableId(table)
    let res = simulateShot(form.launch, on: table, ball: ball, seed: seed)
    seen["ball:\(ball.rawValue)", default: 0] += 1
    seen["hole:\(res.hole.rawValue)", default: 0] += 1
    for e in res.events { seen["event:\(eventName(e))", default: 0] += 1 }

    let n = res.path.count
    // Every 64th shot keeps its whole path. The rest keep nine evenly spaced
    // samples and the last; the four sums below cover every sample of all of them.
    let stride = shots % 64 == 0 ? 1 : max(1, n / 9)
    var picked = Swift.stride(from: 0, to: n, by: stride).map { $0 }
    if picked.last != n - 1 { picked.append(n - 1) }
    let samples = picked.map { k -> String in
        let s = res.path[k]
        return [String(k), phaseName(s.phase), c64(s.t), c64(s.x), c64(s.along), c64(s.height)].joined(separator: ":")
    }
    let sums = res.path.reduce(into: [0.0, 0.0, 0.0, 0.0]) { acc, s in
        acc[0] += s.t; acc[1] += s.x; acc[2] += s.along; acc[3] += s.height
    }
    var row = ["shot", i(shots), i(id), ball.rawValue, u64(seed)] + form.tokens
    row += [holeName(res.hole), res.hingeSpeed.map(c64) ?? "none"]
    row += [res.firstLanding.map { c64($0.x) } ?? "none", res.firstLanding.map { c64($0.y) } ?? "none"]
    row += [c64(res.peakHeight), c64(res.duration), i(res.rattles)]
    row += [res.events.map(eventName).joined(separator: ","), res.eventTimes.map(c64).joined(separator: ",")]
    row += [i(n)] + sums.map(c64) + [samples.joined(separator: ",")]
    g.line(row)
    shots += 1
}

@MainActor func randomForm() -> Form {
    let aim = coin(0.2) ? u(-1, 1) : u(-0.4, 0.4)
    let start = coin(0.5) ? 0 : u(-1, 1)
    let fold = coin(0.5) ? 0 : u(0, 1)
    let spin = coin(0.5) ? 0 : u(-1, 1)
    let skid = coin(0.5) ? 0 : u(0, 1)
    if coin(0.2) {
        return .speed(u(0, 5.85), u(0, 2.35), aim, start, fold, spin, skid)
    }
    return .power(coin(0.15) ? u(0, 1) : u(0.3, 0.95), aim, start, fold, spin, skid)
}

for base in bases {
    for ball in BallKind.allCases {
        let t = ball.modify(base)
        for _ in 0..<36 { shot(randomForm(), t, ball, r.next()) }
    }
}
// Straight down the middle, where balls sit on walls and get nudged.
for ball in BallKind.allCases {
    let t = ball.modify(.standard)
    for n in 0...70 {
        shot(.power(Double(n) / 70, 0, 0, 0, 0, 0), t, ball, r.next())
    }
}
// The corners of the launch space.
let edges: [Form] = [
    .power(0, 0, 0, 0, 0, 0), .power(1, 1, 1, 1, 1, 1), .power(1, -1, -1, 1, -1, 1),
    .power(0.6, 1, 1, 0, 1, 0), .power(0.6, -1, -1, 0, -1, 0), .power(0.3, 1, 1, 0, 0, 0),
    .speed(0, 0, 0, 0, 0, 0, 0), .speed(0, 2.35, 0, 0, 0, 0, 0), .speed(5.85, 2.35, 1, 1, 1, 1, 1),
    .speed(0.2, 1.0, 0.5, 0, 0, 0, 0), .speed(3, 0.8, 0, 0, 0, 0, 0),
]
for form in edges {
    for ball in BallKind.allCases { shot(form, ball.modify(.standard), ball, r.next()) }
}

// ---- Flicks ----
let duo = FlickGeometry(creaseY: 445, laneCenterX: 313, laneHalfWidth: 260)

@MainActor func flick(distance: Double = 220, duration: Double = 0.16, lift: Double = 0.8, from y0: Double = 820,
           x0: Double = 313, lateral: (Double) -> Double = { _ in 0 }, wobble: Double = 0,
           jitter: Double = 0, hz: Double = 120) -> [FlickSample] {
    var out: [FlickSample] = []
    let dt = 1.0 / hz
    var t = 0.0
    while t <= duration * lift + 1e-9 {
        let v = t / duration
        let d = distance * (10 * pow(v, 3) - 15 * pow(v, 4) + 6 * pow(v, 5))
        let w = wobble * sin(t * 90)
        let e = jitter == 0 ? 0 : u(-jitter, jitter)
        out.append(FlickSample(t: t, x: x0 + lateral(v) + e, y: y0 - d - w + e))
        t += dt
    }
    return out
}

@MainActor func flickRow(_ s: [FlickSample], _ geo: FlickGeometry, _ fold: Double, _ k: FlickTuning = .standard) {
    let tuning = [k.slowest, k.fastest, k.releaseWeight, k.snapGain, k.fullAimAngle, k.smoothJerk, k.skidPerJerk, k.lineReach].map(f64)
    let geoTokens = [geo.creaseY, geo.laneCenterX, geo.laneHalfWidth, geo.foulGive].map(f64)
    let samples = s.map { [f64($0.t), f64($0.x), f64($0.y)].joined(separator: ":") }.joined(separator: ",")
    var row = ["flick"] + geoTokens + tuning + [f64(fold), samples.isEmpty ? "empty" : samples, b(crossedFoulLine(s, in: geo))]
    switch analyzeFlick(s, in: geo, fold: fold, tuning: k) {
    case .none: row.append("none")
    case .foul: row.append("foul")
    case .release(let l):
        let m = lastMetrics!
        row += ["release"] + launchTokens(l)
        row += [m.peak, m.release, m.duration, m.jerk, m.snap, m.side, m.speed].map(f64)
    }
    g.line(row)
}

// The cases of StrokeTests, then a spread around them.
let named: [[FlickSample]] = [
    flick(), flick(duration: 0.24), flick(duration: 0.12), flick(distance: 300), flick(distance: 150),
    flick(lift: 0.6), flick(lift: 0.97), flick(wobble: 9), flick(wobble: 4),
    flick(lateral: { v in v > 0.55 ? 90 * pow(v - 0.55, 2) * 10 : 0 }),
    flick(lateral: { v in 40 * v }), flick(lateral: { v in 220 * tan(.pi / 18) * v }),
    flick(x0: 120, lateral: { v in 80 * v }), flick(distance: 520, duration: 0.2),
    flick(distance: 700, duration: 0.5, lift: 1.0), flick(from: 400), flick(distance: 8, duration: 0.1),
    flick(distance: -200, from: 500), [],
    [FlickSample(t: 0, x: 313, y: 820)],
    // Repeated timestamps: the differences drop those pairs.
    [0, 0, 0.01, 0.01, 0.02, 0.03, 0.03, 0.04, 0.05, 0.06].enumerated().map { n, t in
        FlickSample(t: t, x: 313, y: 820 - Double(n) * 30)
    },
]
for s in named { flickRow(s, duo, 0) }
for n in 0..<400 {
    let lean = u(-120, 120)
    let curl = u(-200, 200)
    let s = flick(distance: coin(0.1) ? u(-100, 900) : u(60, 420), duration: u(0.05, 0.5), lift: u(0.3, 1.0),
                  from: u(460, 860), x0: u(60, 560),
                  lateral: { v in lean * v + (v > 0.5 ? curl * (v - 0.5) * (v - 0.5) : 0) },
                  wobble: coin(0.3) ? u(0, 12) : 0, jitter: coin(0.3) ? u(0, 3) : 0,
                  hz: [60.0, 120.0, 240.0][n % 3])
    var tuning = FlickTuning.standard
    if n % 5 == 0 { tuning.lineReach = 0.9; tuning.releaseWeight = 0.7; tuning.fullAimAngle = 0.6 }
    flickRow(s, n % 4 == 0 ? FlickGeometry(creaseY: 300, laneCenterX: 200, laneHalfWidth: 150, foulGive: 60) : duo, n % 2 == 0 ? 0 : u(0, 1), tuning)
}
for _ in 0..<100 {
    let x = u(-50, 700)
    g.line("lanestart", f64(x), f64(laneStart(touchX: x, in: duo)))
}
// A collapsed lane: the shell's geometry can give a zero half width.
var flat = duo
flat.laneHalfWidth = 0
for x in [100.0, 313.0, 500.0] {
    g.line("lanestartflat", f64(x), f64(laneStart(touchX: x, in: flat)))
}

// ---- Bulk ----
// Many more shots than can be written out, for a tight hole-match rate. Inputs come
// from a seeded SplitMix64 that March replays; each shot leaves only its hole, its
// event count and its path length. Written after everything else, so the rows
// above are unaffected by how many there are.
var bulkRng = SplitMix64(seed: 0xB01C_5EED)
var combos: [(Int, BallKind)] = []
for base in bases {
    for ball in BallKind.allCases {
        let id = tableId(ball.modify(base))
        combos.append((id, ball))
        g.line("bulkcombo", i(id), ball.rawValue)
    }
}
g.line("bulkseed", u64(0xB01C_5EED))
@MainActor func unit(_ lo: Double, _ hi: Double) -> Double { lo + bulkRng.nextUnit() * (hi - lo) }
var bulkRow: [String] = []
for n in 0..<20000 {
    let (id, ball) = combos[n % combos.count]
    let power = unit(0.3, 0.95)
    let aim = unit(-0.5, 0.5)
    let start = unit(-1, 1)
    let fold = unit(0, 1)
    let spin = unit(-1, 1)
    let skid = unit(0, 1)
    let seed = bulkRng.next()
    let l = Launch(power: power, aim: aim, start: start, fold: fold, spin: spin, skid: skid)
    let res = simulateShot(l, on: tables[id], ball: ball, seed: seed)
    bulkRow.append("\(res.hole.rawValue).\(res.events.count).\(res.path.count)")
    if bulkRow.count == 100 {
        g.line("bulk", bulkRow.joined(separator: ","))
        bulkRow = []
    }
}

// ---- Hard branches ----
// Everything above can miss a branch no random input reaches, so these rows go
// after the bulk rows, on their own generator: nothing above moves. Each block
// says which branch it pins. tools/golden never checks that a block does its job;
// the proof is the mutation run reported with the physics repair.
var hardRng = SplitMix64(seed: 0x4A2D_B2A9)
@MainActor func hu(_ lo: Double, _ hi: Double) -> Double { lo + hardRng.nextUnit() * (hi - lo) }

// NaN in a Launch: Launch's clamp keeps it, and every comparison on it is false, so
// each branch must keep Swift's polarity. `v.length < 0.05` is the one that bit.
let nan = Double.nan
let nanForms: [Form] = [
    .power(0.6, 0.1, 0, 0, nan, 0), .speed(3, 0.5, 0.1, 0, 0, nan, 0),
    .power(0.6, nan, 0, 0, 0, 0), .power(0.6, 0.1, nan, 0, 0, 0), .power(0.6, 0.1, 0, nan, 0, 0),
    .power(0.6, 0.1, 0, 0, 0, nan), .power(nan, 0.1, 0, 0, 0, 0),
    .speed(nan, 0.5, 0.1, 0, 0, 0, 0), .speed(3, nan, 0.1, 0, 0, 0, 0), .speed(3, 0.5, nan, 0, 0, 0, 0),
]
for base in [Table.standard, Room.penthouse.table] {
    for ball in BallKind.allCases {
        for form in nanForms { shot(form, ball.modify(base), ball, 7) }
    }
}

// The nudge limit: nothing can drop, and a heavy board stops the ball dead after
// every nudge, so a ball left in a ring is nudged until `nudges < 6` runs out.
for friction in [0.5, 1.0] {
    var stuck = Table.standard
    stuck.board.captureSpeed = -1
    stuck.board.rollingFriction = friction
    for n in 0...30 {
        let power = 0.3 + Double(n) * 0.02
        shot(.power(power, 0, 0, 0, 0, 0), stuck, .classic, hardRng.next())
        shot(.power(power, 0.15, 0.2, 0, 0, 0), stuck, .classic, hardRng.next())
    }
}

// A short clock: a dud still on the lane stops at maxDuration, not when it has
// rolled all the way back, and the board loop stops mid-flight.
for limit in [0.25, 0.5, 1.0, 1.5] {
    var short = Table.standard
    short.maxDuration = limit
    let forms: [Form] = [
        .speed(0.6, 1.5, 0, 0, 0, 0, 0), .speed(1, 0.2, 0.3, 0.5, 0, 0, 0), .power(0.05, 0, 0, 0, 0, 0),
        .power(0.6, 0, 0, 0, 0, 0), .speed(5, 2, 0, 0, 1, 0, 0),
    ]
    for form in forms {
        shot(form, short, .classic, hardRng.next())
        shot(form, short, .bean, hardRng.next())
    }
}

// A hole wider than the rings: the gutter has a centre, but never a hole.
var wide = Table.standard
wide.board.ringHoleRadius = 0.5
wide.board.captureSpeed = 10
for n in 0...30 {
    shot(.power(0.25 + Double(n) * 0.01, 0.4, 1, 0, 0, 0), wide, .classic, hardRng.next())
    shot(.power(0.25 + Double(n) * 0.01, -0.4, -1, 0, 0, 0), wide, .classic, hardRng.next())
}

// Past the backwall while already moving down: -abs(v.y), not -v.y.
var backward = Table.standard
backward.board.height = 0.01
backward.hinge.carry = -0.5
for n in 0...5 {
    shot(.power(0.3 + Double(n) * 0.1, 0.1, 0, 0, 0, 0), backward, .classic, hardRng.next())
}

func track(_ ts: [Double], _ xs: [Double], _ ys: [Double]) -> [FlickSample] {
    zip(ts, zip(xs, ys)).map { FlickSample(t: $0, x: $1.0, y: $1.1) }
}

/// Upward speed per stretch, as (pt/s, samples), every 1/128 s: dyadic, so each
/// difference is exact and a chosen speed is reached exactly.
func stretches(_ parts: [(Double, Int)], y0: Double = 820, x0: Double = 313, lean: Double = 1) -> [FlickSample] {
    var out = [FlickSample(t: 0, x: x0, y: y0)]
    var y = y0, n = 0
    for (speed, count) in parts {
        for _ in 0..<count {
            n += 1
            y -= speed / 128
            out.append(FlickSample(t: Double(n) / 128, x: x0 + Double(n) * lean, y: y))
        }
    }
    return out
}

// Touch coordinates are quantised, so neighbouring speeds tie and max(by:) must
// keep the first; timestamps on a dyadic grid make the ties exact.
for n in 0..<240 {
    let q = [1.0, 0.5, 1.0 / 3.0][n % 3]
    let hz = [64.0, 128.0, 256.0, 60.0, 120.0][n % 5]
    let lean = hu(-60, 60)
    let raw = flick(distance: hu(120, 420), duration: hu(0.1, 0.3), lift: hu(0.6, 1.0), from: hu(600, 860),
                    x0: hu(120, 500), lateral: { v in lean * v }, hz: hz)
    flickRow(raw.enumerated().map { k, s in
        FlickSample(t: Double(k) / hz, x: (s.x / q).rounded() * q, y: (s.y / q).rounded() * q)
    }, duo, 0)
}
// Plateaus: a run of exactly equal speeds, with the thumb still drifting sideways.
for _ in 0..<60 {
    let up = Int(hu(4, 9)), top = Int(hu(600, 1800))
    let ramp = (1...3).map { (Double(top) * Double($0) / 4, 2) }
    flickRow(stretches(ramp + [(Double(top), up)] + ramp.reversed(), y0: hu(600, 860).rounded(),
                       x0: hu(120, 500).rounded(), lean: hu(-3, 3).rounded()), duo, 0)
}

// Out-of-order timestamps: pairs that step backwards drop out, as repeats do.
for _ in 0..<80 {
    let lean = hu(-60, 60)
    var s = flick(distance: hu(150, 400), duration: hu(0.1, 0.3), lift: hu(0.6, 1.0), lateral: { v in lean * v })
    for _ in 0..<Int(hu(1, 4)) {
        let k = Int(hu(1, Double(s.count - 2)))
        let t = s[k].t
        s[k].t = s[k + 1].t
        s[k + 1].t = t
    }
    flickRow(s, duo, 0)
}
// A sample exactly at the start time, reachable only out of order: t = 1 is the
// midpoint of the first pair and also the time of a later sample.
flickRow(track([0, 2, 1, 3, 4, 5, 6, 7, 8].map { $0 / 128 }, [313, 320, 340, 345, 350, 352, 353, 354, 354],
               [820, 800, 780, 760, 740, 720, 700, 680, 660]), duo, 0)
// Two velocities at one time: the line through them has no slope to read.
flickRow(track([0, 2, 4, 6, 8, 10, 12, 9, 13].map { $0 / 64 }, [313, 314, 315, 316, 317, 318, 319, 320, 321],
               [820, 812, 804, 796, 788, 780, 772, 772, 756]), duo, 0)

// A crawl, then one jump: the chord from the crawl to the peak is under a point
// tall, so the aim's floor sets its height. The last rows move backwards instead.
for n in 0..<40 {
    let crawl = n % 2 == 0 ? 0.25 : 0.75
    let dip = n >= 30
    var y = 820.0, x = 313.0
    var ts: [Double] = [], xs: [Double] = [], ys: [Double] = []
    for k in 0..<16 {
        ts.append(Double(k) / 128); xs.append(x); ys.append(y)
        x += hu(-3, 3).rounded()
        y -= k == 8 ? hu(30, 60).rounded() : (dip && k == 7 ? -crawl : crawl)
    }
    flickRow(track(ts, xs, ys), duo, 0)
}

// peak > 150, exactly and either side: a steady speed is its own peak.
for speed in [100.0, 148, 149, 150, 151, 152, 155, 158, 160, 161, 165, 170] {
    flickRow(stretches([(speed, 40)]), duo, 0)
}
// release > 60 || peak > 600, exactly and either side.
for parts in [[(200.0, 20), (60.0, 16)], [(200.0, 20), (61.0, 16)], [(200.0, 20), (59.0, 16)],
              [(600.0, 8), (20.0, 16)], [(601.0, 8), (20.0, 16)], [(599.0, 8), (20.0, 16)]] {
    flickRow(stretches(parts), duo, 0)
}
// Getting going: the first speed strictly over 8% of the peak. 80 is exactly 8% of 1000.
flickRow(stretches([(80, 12), (1000, 12)]), duo, 0)
flickRow(stretches([(81, 12), (1000, 12)]), duo, 0)
flickRow(stretches([(79, 12), (1000, 12)]), duo, 0)
// The tap threshold: exactly 25 points of travel is not a throw.
flickRow(stretches([(800, 4)]), duo, 0)
flickRow(stretches([(832, 4)]), duo, 0)
// Touching down exactly on the crease, and reaching exactly the foul line.
flickRow(stretches([(800, 20)], y0: 445), duo, 0)
flickRow(stretches([(800, 20)], y0: 445.5), duo, 0)
flickRow(stretches([(1280, 40)], y0: 705), duo, 0)
flickRow(stretches([(1280, 40)], y0: 704.5), duo, 0)
// How few samples are enough, and how few velocities.
flickRow(stretches([(800, 2)]), duo, 0)
flickRow(stretches([(4000, 3)]), duo, 0)
flickRow(track([0, 0, 1, 2].map { $0 / 128 }, [313, 314, 315, 316], [820, 800, 780, 760]), duo, 0)
flickRow(track([0, 0, 1, 2, 3].map { $0 / 128 }, [313, 314, 315, 316, 317], [820, 800, 780, 760, 740]), duo, 0)
// Slow touch rates: two velocities in the last 0.06 s, then one, then no
// acceleration in the last 0.05 s.
for hz in [30.0, 32.0, 20.0, 16.0, 12.0] {
    for _ in 0..<24 {
        let lean = hu(-60, 60)
        flickRow(flick(distance: hu(150, 420), duration: hu(0.25, 0.6), lift: hu(0.6, 1.0), x0: hu(120, 500),
                       lateral: { v in lean * v }, hz: hz), duo, 0)
    }
}
// Exactly on the edge of the tail windows: the midpoint of a pair, end - 0.06 or
// end - 0.05, is in.
for window in [0.06, 0.05] {
    let edge = 1.0 - window
    let half: Double = 1.0 / 1024
    var ts: [Double] = []
    for k in 0..<20 {
        let back: Double = Double(20 - k) / 64
        ts.append(edge - back - half)
    }
    ts.append(edge - half)
    ts.append(edge + half)
    ts.append(1.0)
    var xs: [Double] = []
    var ys: [Double] = []
    for k in 0..<ts.count {
        let step = Double(k)
        xs.append(313 + step)
        ys.append(820 - step * step)
    }
    flickRow(track(ts, xs, ys), duo, 0)
}

// One velocity in the tail that is not the last: out of order, the last pair's
// midpoint is older than the tail. Swift reads v.last, not the tail.
flickRow(track([0, 8, 16, 24, 40, 10, 34].map { $0 / 64 }, [313, 316, 319, 322, 330, 335, 340],
               [820, 780, 740, 700, 600, 590, 400]), duo, 0)

// A flat lane and no speed: s is exactly 0 after the first step, which is `s <= 0`.
var level = Table.standard
level.lane.incline = 0
shot(.speed(0, 0, 0, 0, 0, 0, 0), level, .classic, hardRng.next())

// A coarse clock on a level board: `resting` lands exactly on 0.2, which is not
// `resting > 0.2` yet.
for dt in [0.1, 0.2] {
    var coarse = Table.standard
    coarse.dt = dt
    coarse.board.tilt = 0
    coarse.board.captureSpeed = -1
    coarse.board.rollingFriction = 0.02
    for n in 0...30 {
        shot(.power(0.2 + Double(n) * 0.02, 0, 0, 0, 0, 0), coarse, .classic, hardRng.next())
    }
}

// What a caller gets by not saying: the default give, and the standard tuning.
let plainGeometry = FlickGeometry(creaseY: 445, laneCenterX: 313, laneHalfWidth: 260)
g.line("flickdefaults", f64(plainGeometry.foulGive), f64(plainGeometry.foulY))
let plainTuning = FlickTuning.standard
g.line(["tuningdefaults"] + [plainTuning.slowest, plainTuning.fastest, plainTuning.releaseWeight, plainTuning.snapGain,
                             plainTuning.fullAimAngle, plainTuning.smoothJerk, plainTuning.skidPerJerk,
                             plainTuning.lineReach].map(f64))

for key in seen.keys.sorted() { print(key, seen[key]!) }
print("shots", shots, "tables", tables.count)
try g.write()
