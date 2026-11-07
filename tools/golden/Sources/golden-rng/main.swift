import Foundation
import GoldenSupport
import SkeeCore

// RNG and float goldens, from the real SplitMix64, Vec2, clamp and degrees.
var g = GoldenFile(module: "Rng")

// Seeds cover zero, small values, values on both sides of 2^53, the top of the
// range, and values whose increment wraps past 2^64.
let seeds: [UInt64] = [
    0, 1, 2, 42, 1234567, 0xB07, 0x5EED, 0x40575,
    (1 << 53) - 1, 1 << 53, (1 << 53) + 1,
    0xDEAD_BEEF_CAFE_F00D, 0x8000_0000_0000_0000, 0x9E37_79B9_7F4A_7C15,
    0x61C8_8646_80B5_83EB, UInt64.max, UInt64.max - 1,
]

for seed in seeds {
    var r = SplitMix64(seed: seed)
    for n in 0..<200 {
        let v = r.next()
        g.line("next", u64(seed), i(n), u64(v), u64(r.state))
    }
    r = SplitMix64(seed: seed)
    for n in 0..<100 { g.line("unit", u64(seed), i(n), f64(r.nextUnit()), u64(r.state)) }
    r = SplitMix64(seed: seed)
    for n in 0..<100 { g.line("gauss", u64(seed), i(n), f64(r.nextGaussian()), u64(r.state)) }
    r = SplitMix64(seed: seed)
    // Bounds the game draws with, plus a prime, 2^31, 2^32 and values past both.
    for (n, bound) in [1, 2, 3, 4, 5, 6, 7, 20, 100, 1000, 65536, 2147483647, 2147483648, 4294967296, 4294967297, 1_000_000_007, 1 << 52, (1 << 53) - 1].enumerated() {
        for k in 0..<5 {
            let v = r.nextInt(below: bound)
            g.line("below", u64(seed), i(n * 5 + k), i(bound), i(v), u64(r.state))
        }
    }
    r = SplitMix64(seed: seed)
    for n in [0, 1, 2, 3, 7, 15, 20, 52] {
        let xs = Array(0..<n)
        let out = r.shuffled(xs)
        g.line(["shuffle", u64(seed), i(n), u64(r.state)] + out.map(i))
    }
    r = SplitMix64(seed: seed)
    for n in 0..<40 {
        let xs = Array(100..<(100 + 1 + n % 13))
        let v = r.pick(xs)
        g.line("pick", u64(seed), i(n), i(xs.count), i(v), u64(r.state))
    }
    // Interleaved, in the order a run draws: the shared state must carry across kinds.
    r = SplitMix64(seed: seed)
    for n in 0..<30 {
        let a = r.next()
        let u = r.nextUnit()
        let k = r.nextInt(below: 20)
        let z = r.nextGaussian()
        let s = r.shuffled(Array(0..<5))
        let p = r.pick([7, 8, 9])
        g.line(["mixed", u64(seed), i(n), u64(a), f64(u), i(k), f64(z), i(p), u64(r.state)] + s.map(i))
    }
}

// Bit patterns for the float reader, including every awkward value.
var corpus: [Double] = [
    0, -0.0, 1, -1, 0.5, 0.1, 0.2, 0.3, 1.0 / 3.0, 1.0 / 240.0, 2.0 / 3.0,
    .pi, 2 * .pi, -.pi, .ulpOfOne, 1 + .ulpOfOne, 1 - .ulpOfOne / 2,
    9_007_199_254_740_992, 9_007_199_254_740_991, 4_503_599_627_370_496, 4_503_599_627_370_497,
    1e300, -1e300, 1e-300, .greatestFiniteMagnitude, -.greatestFiniteMagnitude,
    .leastNormalMagnitude, .leastNonzeroMagnitude, -.leastNonzeroMagnitude,
    2.2250738585072009e-308, 5e-324, 1e-310,
    1e22, 123456789012345680,
]
var fr = SplitMix64(seed: 0xF10A7)
for _ in 0..<400 {
    let u = fr.nextUnit(), v = fr.nextUnit()
    corpus.append((u - 0.5) * pow(2, Double(Int(v * 2000)) - 1000))
}
// Non-finite values have no decimal spelling that parses on every target, so
// they get their own rows and March produces them by arithmetic.
for x in corpus where x.isFinite { g.line("bits", f64(x), x.description) }
g.line("posinf", f64(.infinity))
g.line("neginf", f64(-.infinity))
g.line("nan", f64(.nan))

// The constants that cannot be Float literals on JS, as the Swift computes them.
g.line("const", "pi", f64(.pi))
g.line("const", "tau", f64(2 * .pi))
g.line("const", "dt", f64(Table.standard.dt))
g.line("const", "unit53", f64(1.0 / 9_007_199_254_740_992.0))
g.line("const", "floor_u1", f64(1e-12))

// libm samples over the arguments the core really uses, so divergence between
// Darwin libm and V8 is a measured number. Both next_gaussian's inputs and the
// physics' sway and hop angles land in these ranges.
var lr = SplitMix64(seed: 0x11B)
for _ in 0..<2000 {
    let a = lr.nextUnit() * 2 * .pi, b = max(lr.nextUnit(), 1e-12)
    let y = (lr.nextUnit() - 0.5) * 800, x = lr.nextUnit() * 400 + 1
    g.line("libm", "sin", f64(a), f64(sin(a)))
    g.line("libm", "cos", f64(a), f64(cos(a)))
    g.line("libm", "log", f64(b), f64(log(b)))
    g.line("libm2", "atan2", f64(y), f64(x), f64(atan2(y, x)))
    g.line("libm", "sqrt", f64(b), f64(b.squareRoot()))
}

// Math: clamp keeps Swift's min(max(x, lo), hi) argument order, so the sign of
// a zero at the bound is part of the contract.
let clampCases: [(Double, Double, Double)] = [
    (0.5, 0, 1), (-1, 0, 1), (2, 0, 1), (0, 0, 1), (-0.0, 0, 1), (0, -0.0, 1), (-0.0, -1, 1),
    (-0.0, -1, 0), (0, -1, -0.0), (1, 1, 1), (.infinity, 0, 1), (-.infinity, 0, 1),
]
for (x, lo, hi) in clampCases { g.line("clamp", f64(x), f64(lo), f64(hi), f64(clamp(x, lo, hi))) }
g.line("clampnan", f64(clamp(Double.nan, 0, 1)))
for (x, lo, hi) in [(5, 0, 3), (-5, 0, 3), (2, 0, 3), (0, 0, 0), (9, 1, 8)] { g.line("clampi", i(x), i(lo), i(hi), i(clamp(x, lo, hi))) }

for d in [0.0, 6, 8, 20, 24, 45, 90, 180, 360, -45, 0.5, 12.5] { g.line("deg", f64(d), f64(degrees(d))) }

// Signed zeros first: negation and scaling must flip them as Swift does.
var vr = SplitMix64(seed: 0x7EC)
for n in 0..<200 {
    let a = n == 0 ? Vec2(0, -0.0) : Vec2((vr.nextUnit() - 0.5) * 4, (vr.nextUnit() - 0.5) * 4)
    let c = n == 0 ? Vec2(-0.0, 1) : Vec2((vr.nextUnit() - 0.5) * 4, (vr.nextUnit() - 0.5) * 4)
    let k = n == 0 ? -1 : (vr.nextUnit() - 0.5) * 8
    let sum = a + c, dif = a - c, sc = a * k, neg = -a, nrm = a.normalized
    g.line("vec", f64(a.x), f64(a.y), f64(c.x), f64(c.y), f64(k),
           f64(sum.x), f64(sum.y), f64(dif.x), f64(dif.y), f64(sc.x), f64(sc.y),
           f64(neg.x), f64(neg.y), f64(a.dot(c)), f64(a.length), f64(nrm.x), f64(nrm.y))
}
let z = Vec2.zero.normalized
g.line("veczero", f64(z.x), f64(z.y), f64(Vec2.zero.length))

// The default spec values, read from the real structs: each row is a dotted
// field name and its bits. Only the fields that are plain numbers are here;
// Bool, list and Vec2 fields get their own rows below.
let t = Table.standard
let lane = t.lane, hinge = t.hinge, board = t.board
let specs: [(String, Double)] = [
    ("gravity", t.gravity), ("dt", t.dt), ("max_duration", t.maxDuration),
    ("lane.length", lane.length), ("lane.width", lane.width), ("lane.incline", lane.incline),
    ("lane.rolling_friction", lane.rollingFriction), ("lane.rail_restitution", lane.railRestitution),
    ("lane.min_speed", lane.minSpeed), ("lane.scoring_speed", lane.scoringSpeed),
    ("lane.max_speed", lane.maxSpeed), ("lane.knee", lane.knee),
    ("lane.max_aim_angle", lane.maxAimAngle), ("lane.hook", lane.hook), ("lane.skid_loss", lane.skidLoss),
    ("hinge.base_angle", hinge.baseAngle), ("hinge.fold_gain", hinge.foldGain), ("hinge.carry", hinge.carry),
    ("board.width", board.width), ("board.height", board.height), ("board.tilt", board.tilt),
    ("board.ring_center.x", board.ringCenter.x), ("board.ring_center.y", board.ringCenter.y),
    ("board.center_hole_offset.x", board.centerHoleOffset.x), ("board.center_hole_offset.y", board.centerHoleOffset.y),
    ("board.center_hole_radius", board.centerHoleRadius), ("board.capture_speed", board.captureSpeed),
    ("board.lip_min_fall", board.lipMinFall),
    ("board.wall40", board.ringWalls[0]), ("board.wall30", board.ringWalls[1]),
    ("board.wall20", board.ringWalls[2]), ("board.wall10", board.ringWalls[3]),
    ("board.left.x", board.pockets[0].center.x), ("board.left.y", board.pockets[0].center.y),
    ("board.left.radius", board.pockets[0].radius),
    ("board.right.x", board.pockets[1].center.x), ("board.right.y", board.pockets[1].center.y),
    ("board.right.radius", board.pockets[1].radius),
    ("board.lip_height", board.lipHeight), ("board.ball_radius", board.ballRadius),
    ("board.lip_band", board.lipBand), ("board.bounce", board.bounce), ("board.lip_bounce", board.lipBounce),
    ("board.lip_kick", board.lipKick), ("board.wall_restitution", board.wallRestitution),
    ("board.backwall_restitution", board.backwallRestitution),
    ("board.rolling_friction", board.rollingFriction), ("board.landing_grip", board.landingGrip),
    ("board.wind.x", board.wind.x), ("board.wind.y", board.wind.y), ("board.ring_hole_radius", board.ringHoleRadius),
    ("config.target_scale", RunConfig.standard.targetScale),
    ("config.kind_scale.warmup", RunConfig.standard.kindScale[.warmup]!),
    ("config.kind_scale.feature", RunConfig.standard.kindScale[.feature]!),
    ("config.kind_scale.boss", RunConfig.standard.kindScale[.boss]!),
    ("config.overkill_step", RunConfig.standard.overkillStep),
    ("tuning.slowest", FlickTuning.standard.slowest), ("tuning.fastest", FlickTuning.standard.fastest),
    ("tuning.release_weight", FlickTuning.standard.releaseWeight), ("tuning.snap_gain", FlickTuning.standard.snapGain),
    ("tuning.full_aim_angle", FlickTuning.standard.fullAimAngle), ("tuning.smooth_jerk", FlickTuning.standard.smoothJerk),
    ("tuning.skid_per_jerk", FlickTuning.standard.skidPerJerk), ("tuning.line_reach", FlickTuning.standard.lineReach),
]
for (name, value) in specs { g.line("spec", name, f64(value)) }
g.line("specflag", "pockets_need_flight", b(board.pocketsNeedFlight))

let c = RunConfig.standard
let ints: [(String, Int)] = [
    ("antes", c.antes), ("frames_per_round", c.framesPerRound), ("balls_per_frame", c.ballsPerFrame),
    ("start_tickets", c.startTickets), ("charm_slots", c.charmSlots), ("power_up_slots", c.powerUpSlots),
    ("fever_heat", c.feverHeat), ("overkill_cap", c.overkillCap), ("interest_per", c.interestPer),
    ("interest_cap", c.interestCap), ("offer_count", c.offerCount),
    ("round_tickets.warmup", c.roundTickets[.warmup]!), ("round_tickets.feature", c.roundTickets[.feature]!),
    ("round_tickets.boss", c.roundTickets[.boss]!),
]
for (name, value) in ints { g.line("specint", name, i(value)) }
g.line(["anteBase"] + c.anteBase.map(i))
for hole in BoardSetup.reelHoles {
    g.line(["reel", hole.rawValue] + BoardSetup.standard.reel(hole).map(\.rawValue))
}

try g.write()
