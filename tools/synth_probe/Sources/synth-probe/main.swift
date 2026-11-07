import Foundation

// frameDone, replicated with Swift's Float arithmetic but double libm rounded
// to Float (what March does). Prints every sample's bits.
var seed: UInt32 = 22222
@MainActor func noise() -> Float { seed = seed &* 1664525 &+ 1013904223; return Float(seed >> 9) / Float(1 << 23) * 2 - 1 }
var lowpass: Float = 0, rumble: Float = 0
let dt: Float = 1 / 44100
var t: Float = 0, phase: Float = 0
for _ in 0..<20000 {
    var s: Float = 0
    rumble += (0 - rumble) * 0.0008
    lowpass += (noise() - lowpass) * 0.035
    s += lowpass * rumble * 0.9
    let f: Float = 392 + (392 - 392) * min(1, t / max(Float(0.1), 0.0001))
    phase += f * dt
    if phase > 1 { phase -= 1 }
    let osc = Float(Foundation.sin(Double(phase * 2 * .pi)))
    let attack = min(1, t / 0.003)
    s += osc * 0.2 * attack * Float(Foundation.exp(Double(-t / 0.15)))
    t += dt
    print(String(max(-1, min(1, s)).bitPattern, radix: 16))
}
