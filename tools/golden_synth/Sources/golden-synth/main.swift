import Foundation
import GoldenSupport
import SkeeCore
import SkeeRender

// Golden sample buffers from the real Synth, for test/suites/synth_suite.march.
// A scenario is a script of ops; the March suite replays the same script.
//
//   op <scenario> <voices after> play <cue tokens>
//   op <scenario> <voices after> render <n>
//   op <scenario> <voices after> rumble <f64 of the Float>
//   op <scenario> <voices after> drum <0|1>
//   s <scenario> <index> <f32 bits, 8 hex digits>   kept samples (see keep)
//   len <scenario> <n>                              samples rendered in all
//   sumsq <scenario> <f64>                          sum of squares, in Double
//   peak <scenario> <f64>                           max |sample|
//
// A banner's text has its spaces written as `~`, since tokens cannot hold one.

enum Op {
    case play(Cue)
    case render(Int)
    case rumble(Float)
    case drum(Bool)
    /// Render chunks until no voice is left (at most `cap` samples), then 512 more.
    case untilSilent(cap: Int)
}

func hex32(_ x: Float) -> String {
    let s = String(x.bitPattern, radix: 16)
    return String(repeating: "0", count: 8 - s.count) + s
}

func holeToken(_ h: Hole) -> String {
    switch h {
    case .gutter: "gutter"
    case .ring10: "ring10"
    case .ring20: "ring20"
    case .ring30: "ring30"
    case .ring40: "ring40"
    case .ring50: "ring50"
    case .pocketLeft: "pocketLeft"
    case .pocketRight: "pocketRight"
    }
}

func cueTokens(_ c: Cue) -> [String] {
    switch c {
    case .launch: ["launch"]
    case .rail: ["rail"]
    case .hump: ["hump"]
    case .lip: ["lip"]
    case .backwall: ["backwall"]
    case .landed: ["landed"]
    case .drop(let h): ["drop", holeToken(h)]
    case .gutter: ["gutter"]
    case .hop: ["hop"]
    case .whoosh: ["whoosh"]
    case .hotSpot: ["hotSpot"]
    case .lever: ["lever"]
    case .pullWin(let n): ["pullWin", i(n)]
    case .reelTick: ["reelTick"]
    case .reelStop: ["reelStop"]
    case .combo(let n): ["combo", i(n)]
    case .tallyChips(let n): ["tallyChips", i(n)]
    case .tallyMult(let n): ["tallyMult", i(n)]
    case .frameDone: ["frameDone"]
    case .lineWon: ["lineWon"]
    case .jackpot: ["jackpot"]
    case .banner(let t): ["banner", t.replacingOccurrences(of: " ", with: "~")]
    case .foul: ["foul"]
    }
}

func voiceCount(_ s: Synth) -> Int {
    for c in Mirror(reflecting: s).children where c.label == "voices" {
        return (c.value as! [Any]).count
    }
    fatalError("Synth has no voices field")
}

var g = GoldenFile(module: "Synth")

@MainActor func run(_ name: String, _ ops: [Op]) {
    var s = Synth()
    var index = 0
    var denseUntil = 512
    var sumsq = 0.0
    var peak = 0.0
    func keep(_ k: Int) -> Bool { k < denseUntil || k % 61 == 0 }
    func render(_ n: Int) {
        var out = [Float](repeating: 0, count: n)
        out.withUnsafeMutableBufferPointer { s.render($0.baseAddress!, n) }
        for x in out {
            if keep(index) { g.line("s", name, i(index), hex32(x)) }
            sumsq += Double(x) * Double(x)
            peak = max(peak, Double(abs(x)))
            index += 1
        }
        g.line(["op", name, i(voiceCount(s)), "render", i(n)])
    }
    for op in ops {
        switch op {
        case .play(let c):
            s.play(c)
            denseUntil = index + 256
            g.line(["op", name, i(voiceCount(s)), "play"] + cueTokens(c))
        case .render(let n):
            render(n)
        case .rumble(let x):
            s.rumbleTarget = x
            denseUntil = index + 256
            g.line("op", name, i(voiceCount(s)), "rumble", f64(Double(x)))
        case .drum(let on):
            s.drum = on
            denseUntil = index + 256
            g.line("op", name, i(voiceCount(s)), "drum", b(on))
        case .untilSilent(let cap):
            var done = 0
            while voiceCount(s) > 0 && done < cap {
                render(2205)
                done += 2205
            }
            render(512)
        }
    }
    g.line("len", name, i(index))
    g.line("sumsq", name, f64(sumsq))
    g.line("peak", name, f64(peak))
}

let fourSeconds = 44100 * 4

@MainActor func single(_ name: String, _ c: Cue) {
    run(name, [.play(c), .untilSilent(cap: fourSeconds)])
}

// SynthTests, with their exact scripts.
run("silent", [.render(22050)])
run("test_range", [.play(.drop(.ring50)), .play(.jackpot), .play(.lever), .render(22050)])
run("test_determinism", [.play(.drop(.ring30)), .play(.reelStop), .render(22050)])

// Every cue alone.
single("launch", .launch)
single("whoosh", .whoosh)
single("hotSpot", .hotSpot)
single("hop", .hop)
single("rail", .rail)
single("hump", .hump)
single("lip", .lip)
single("backwall", .backwall)
single("landed", .landed)
for h in Hole.allCases { single("drop_" + holeToken(h), .drop(h)) }
single("gutter", .gutter)
single("reelTick", .reelTick)
single("reelStop", .reelStop)
for n in [0, 1, 3, 6, 9] { single("combo_\(n)", .combo(n)) }
for n in [0, 3, 11] { single("tallyChips_\(n)", .tallyChips(n)) }
for n in [0, 4, 9] { single("tallyMult_\(n)", .tallyMult(n)) }
single("frameDone", .frameDone)
single("lineWon", .lineWon)
single("jackpot", .jackpot)
for t in ["CLEARED", "FREE GAMES", "JACKPOT", "MEGA JACKPOT", "GAME OVER", "FEVER", "ANTE 2", "YOU BEAT THE ARCADE", "FOUL"] {
    single("banner_" + t.replacingOccurrences(of: " ", with: "_"), .banner(t))
}
single("lever", .lever)
for n in [0, 45, 400] { single("pullWin_\(n)", .pullWin(n)) }
single("foul", .foul)

// More than maxVoices at once: add drops the oldest.
run("overflow", [.play(.jackpot), .play(.banner("MEGA JACKPOT")), .play(.hotSpot), .untilSilent(cap: fourSeconds)])
run("overflow_late", [.play(.banner("JACKPOT")), .render(3000), .play(.jackpot), .render(100), .play(.pullWin(500)),
                      .untilSilent(cap: fourSeconds)])

// Cues arriving mid-buffer, as in a roll.
run("roll", [.play(.launch), .render(1000), .play(.rail), .render(700), .play(.hump), .render(3000), .play(.lip),
             .render(1500), .play(.drop(.ring40)), .render(500), .play(.combo(2)), .render(4410),
             .play(.tallyChips(1)), .render(2000), .play(.tallyMult(1)), .untilSilent(cap: fourSeconds)])

// Rumble: up, down, and off long enough to decay into subnormals and zero.
run("rumble", [.rumble(0.6), .render(30000), .rumble(0.37123), .render(10000), .rumble(0), .render(150000)])

// Drum roll, on and off.
run("drum", [.drum(true), .render(20000), .drum(false), .untilSilent(cap: fourSeconds)])

// Everything at once: drum voices are appended past maxVoices.
run("mix", [.rumble(0.45), .drum(true), .play(.jackpot), .play(.banner("JACKPOT")), .render(5000), .play(.lever),
            .render(9000), .drum(false), .play(.foul), .render(3000), .rumble(0), .untilSilent(cap: fourSeconds)])

// The Float arithmetic underneath, row by row.
//   fround <f64 x> <f64 Double(Float(x))>
//   sinf / expf <f64 of the Float argument> <f64 of the Float result>
//   powf <f64 base> <f64 exponent> <f64 result>
var word: UInt64 = 0x5EED_5EED_5EED_5EED
@MainActor func unit() -> Double {
    word = word &* 6364136223846793005 &+ 1442695040888963407
    return Double(word >> 11) / Double(1 << 53)
}
for _ in 0..<3000 {
    let x = (unit() * 2 - 1) * pow(2, unit() * 40 - 20)
    g.line("fround", f64(x), f64(Double(Float(x))))
}
for _ in 0..<1000 {
    // Exactly halfway between two Floats: ties go to even.
    let f = Float(unit() * 100 + 0.001)
    let x = Double(f) + Double(f.ulp) / 2
    g.line("fround", f64(x), f64(Double(Float(x))))
    g.line("fround", f64(-x), f64(Double(Float(-x))))
}
for _ in 0..<1000 {
    // Subnormal Floats and the boundary to the normal range.
    let x = (unit() * 2 - 1) * pow(2, -126 - unit() * 26)
    g.line("fround", f64(x), f64(Double(Float(x))))
}
for x in [0.0, -0.0, 1.0, -1.0, 0.0008, 0.035, 0.9, 0.055, 0.0001, 0.003, 1.0 / 44100, Double.pi, 2.76, 1.0595, 1.06] {
    g.line("fround", f64(x), f64(Double(Float(x))))
}
for _ in 0..<3000 {
    let phase = Float(unit())
    let a = phase * 2 * .pi
    g.line("sinf", f64(Double(a)), f64(Double(sin(a))))
}
for _ in 0..<3000 {
    let a = Float(-unit() * 6.5)
    g.line("expf", f64(Double(a)), f64(Double(exp(a))))
}
for n in 0...12 { g.line("powf", f64(Double(Float(1.0595))), f64(Double(Float(n))), f64(Double(pow(Float(1.0595), Float(n))))) }
for n in 0...60 { g.line("powf", f64(Double(Float(1.06))), f64(Double(Float(n))), f64(Double(pow(Float(1.06), Float(n))))) }

try g.write()
