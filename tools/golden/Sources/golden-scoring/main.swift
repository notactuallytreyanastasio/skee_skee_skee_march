import GoldenSupport
import SkeeCore

// Owned by the scoring piece. Emit goldens from the real Swift here; see the
// "Adding golden cases" section of docs/PORT.md for the line format.
var g = GoldenFile(module: "Scoring")
g.line("stub", i(0))
try g.write()
