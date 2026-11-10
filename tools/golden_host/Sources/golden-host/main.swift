import Foundation
import GoldenSupport

var g = GoldenFile(module: "Host")
textRows(&g)
guardRows(&g)
haggleRows(&g)
parseRows(&g)
numberRows(&g)
wireRows(&g)
try g.write()
