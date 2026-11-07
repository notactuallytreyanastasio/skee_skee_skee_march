import GoldenSupport
import SkeeCore
import SkeeScene

// A room's colours, from the real CabinetPalette.of(room).
var g = GoldenFile(module: "Cabinet")
for room in Room.allCases {
    let p = CabinetPalette.of(room)
    let named: [(String, UInt32)] = [
        ("backdrop", p.backdrop), ("rail", p.rail), ("railDark", p.railDark), ("cabinet", p.cabinet),
        ("zone40", p.zones[0]), ("zone30", p.zones[1]), ("zone20", p.zones[2]), ("zone10", p.zones[3]),
        ("lip", p.lip), ("hole", p.hole), ("felt", p.felt), ("floor", p.floor),
    ]
    precondition(p.zones.count == 4)
    for (name, colour) in named { g.line("colour", room.rawValue, name, i(Int(colour))) }
}
try g.write()
