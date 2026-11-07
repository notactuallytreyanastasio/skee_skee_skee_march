import SkeeRender

func voiceCount(_ s: Synth) -> Int {
    for c in Mirror(reflecting: s).children where c.label == "voices" { return (c.value as! [Any]).count }
    fatalError("Synth has no voices field")
}

// Find the first decay near 0.0098 for which some t_n == decay * 6 exactly.
let dt: Float = 1 / Synth.rate
var t: Float = 0
var n = 0
var decay: Float = 0
var hit = 0
while hit == 0 {
    t += dt; n += 1
    if n >= 2600, (t / 6) * 6 == t { decay = t / 6; hit = n }
}
// No game decay ever hits it.
let gameDecays: [Float] = [0.012, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1,
                           0.12, 0.14, 0.15, 0.18, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5]
for d in gameDecays {
    var tt: Float = 0
    while tt <= d * 6 { if tt == d * 6 { print("game decay \(d) hits life") }; tt += dt }
}
print("decay bits \(String(decay.bitPattern, radix: 16)) life reached after \(hit) samples")
var s = Synth()
s.add([s.v(.sine, 440, amp: 0.5, decay: decay)])
var out = [Float](repeating: 0, count: 1)
for i in 1...(hit + 2) {
    out.withUnsafeMutableBufferPointer { s.render($0.baseAddress!, 1) }
    if i >= hit - 1 {
        print("after \(i) samples: voices \(voiceCount(s)), sample \(i - 1) bits \(String(out[0].bitPattern, radix: 16)) = \(out[0])")
    }
}
