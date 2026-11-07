import GoldenSupport
import SkeeCore

// Owned by the items piece. Emit goldens from the real Swift here; see the
// "Adding golden cases" section of docs/PORT.md for the line format.
var g = GoldenFile(module: "Items")
g.line("stub", i(0))
try g.write()
