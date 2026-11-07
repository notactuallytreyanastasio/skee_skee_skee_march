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
        return [String(k), phaseName(s.phase), f64(s.t), f64(s.x), f64(s.along), f64(s.height)].joined(separator: ":")
    }
    let sums = res.path.reduce(into: [0.0, 0.0, 0.0, 0.0]) { acc, s in
        acc[0] += s.t; acc[1] += s.x; acc[2] += s.along; acc[3] += s.height
    }
    var row = ["shot", i(shots), i(id), ball.rawValue, u64(seed)] + form.tokens
    row += [holeName(res.hole), res.hingeSpeed.map(f64) ?? "none"]
    row += [res.firstLanding.map { f64($0.x) } ?? "none", res.firstLanding.map { f64($0.y) } ?? "none"]
    row += [f64(res.peakHeight), f64(res.duration), i(res.rattles)]
    row += [res.events.map(eventName).joined(separator: ","), res.eventTimes.map(f64).joined(separator: ",")]
    row += [i(n)] + sums.map(f64) + [samples.joined(separator: ",")]
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

for key in seen.keys.sorted() { print(key, seen[key]!) }
print("shots", shots, "tables", tables.count)
try g.write()
