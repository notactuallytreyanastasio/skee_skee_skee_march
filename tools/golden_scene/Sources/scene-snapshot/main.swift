import AppKit
import SceneKit
import SkeeCore
import SkeeRender
import SkeeScene

// Renders the real SceneKit cabinet to a PNG, to set beside
// tools/scene_preview's drawing of Skee.Scene. Not a golden: a picture.
//   scene-snapshot <out.png> <width> <height> [room]
let args = CommandLine.arguments
let out = args[1]
let w = Int(args[2])!, h = Int(args[3])!
let room = args.count > 4 ? Room(rawValue: args[4]) ?? .boardwalk : .boardwalk
let cab = Cabinet(table: room.table, palette: .of(room))
let presenter = ScenePresenter(cabinet: cab, aspect: Float(w) / Float(h))
let p = Presentation(state: newRun(seed: 7, room: room))
for _ in 0..<3 { presenter.update(p, held: nil, dt: 1.0 / 60) }
guard let img = snapshot(cab, size: CGSize(width: w, height: h)) else { fatalError("no Metal device") }
let rep = NSBitmapImageRep(cgImage: img)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
print("wrote \(out)")
