import GoldenSupport
@testable import SkeeCore

// Owned by the run piece. Emit goldens from the real Swift here; see the
// "Adding golden cases" section of docs/PORT.md for the line format.
var g = GoldenFile(module: "Run")
g.line("stub", i(0))
try g.write()
