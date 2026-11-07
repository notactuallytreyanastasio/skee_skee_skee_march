import Foundation
import GoldenSupport

var g = GoldenFile(module: "Host")
textRows(&g)
guardRows(&g)
haggleRows(&g)
try g.write()
