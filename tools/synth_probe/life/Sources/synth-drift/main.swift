import SkeeCore
import SkeeRender
// Samples of three cues outside the goldens, for checking the worst drift
// claim in docs/PORT.md ("Skee.Synth"). One Double per line.
for cue in [Cue.tallyChips(200), Cue.tallyMult(80), Cue.combo(40)] {
    var s = Synth()
    s.play(cue)
    var out = [Float](repeating: 0, count: 44100)
    out.withUnsafeMutableBufferPointer { s.render($0.baseAddress!, 44100) }
    for x in out { print(Double(x)) }
}
