import Foundation
import GoldenSupport

var g = GoldenFile(module: "Host")
textRows(&g)
try g.write()
