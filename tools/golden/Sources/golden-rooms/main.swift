import GoldenSupport

// Owned by the rooms piece. The rows are written in room_golden.swift.
var g = GoldenFile(module: "Rooms")
emitRoomGoldens(&g)
try g.write()
