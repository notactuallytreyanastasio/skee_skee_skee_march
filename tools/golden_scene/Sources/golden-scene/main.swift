import AppKit
import GoldenSupport
import SceneKit
import SkeeCore
import SkeeScene
import simd

// Goldens for the scene piece (lib/skee/world.march, camera.march, scene.march),
// from the real SkeeScene: World's mappings, Cabinet.fit, CameraRig.project,
// ScenePresenter's flick geometry, guide, lane point and waiting ball, the
// Cabinet's node tree, and setReel's decal placement.
//
// SkeeScene computes in Float (32-bit). Every value is written as the Double
// of that Float, so March (64-bit) is compared with a stated tolerance.

var g = GoldenFile(module: "Scene")

func f(_ x: Float) -> String { f64(Double(x)) }
func v(_ p: SIMD3<Float>) -> [String] { [f(p.x), f(p.y), f(p.z)] }

func roomToken(_ r: Room) -> String { r.rawValue }

func phaseToken(_ p: PathPhase) -> String {
    switch p {
    case .lane: "lane"
    case .air: "air"
    case .board: "board"
    }
}

func holeToken(_ h: Hole) -> String {
    switch h {
    case .gutter: "gutter"
    case .ring10: "ring10"
    case .ring20: "ring20"
    case .ring30: "ring30"
    case .ring40: "ring40"
    case .ring50: "ring50"
    case .pocketLeft: "pocketLeft"
    case .pocketRight: "pocketRight"
    }
}

let viewports: [(Int, Int)] = [(390, 844), (626, 890), (820, 1180), (1024, 1366), (1180, 820), (1440, 900), (1920, 1080)]

let samples: [PathSample] = [
    PathSample(t: 0, phase: .lane, x: 0, along: 0, height: 0),
    PathSample(t: 0.1, phase: .lane, x: -0.21, along: 0.7, height: 0),
    PathSample(t: 0.2, phase: .lane, x: 0.25, along: 2.4, height: 0),
    PathSample(t: 0.3, phase: .air, x: 0.05, along: 2.45, height: 0.04),
    PathSample(t: 0.35, phase: .air, x: -0.1, along: 2.52, height: 0.11),
    PathSample(t: 0.4, phase: .board, x: 0.12, along: 2.65, height: 0.002),
    PathSample(t: 0.5, phase: .board, x: 0, along: 2.9, height: 0),
    PathSample(t: 0.6, phase: .board, x: -0.2, along: 3.26, height: 0.0),
]

// ---- World ----
for room in Room.allCases {
    let w = World(table: room.table)
    let r = roomToken(room)
    g.line(["world", r, f(w.laneLength), f(w.ballRadius)] + v(w.laneNormal) + v(w.laneForward) + v(w.boardOrigin) + v(w.boardUp) + v(w.boardNormal))
    for x in [-0.31, -0.1, 0, 0.2, 0.31] {
        for s in [-0.2, -0.05, 0, 0.12, 1.2, 2.4] {
            g.line(["lane", r, f64(x), f64(s)] + v(w.lane(x: x, s: s)))
        }
    }
    for (x, y, z) in [(0.0, 0.0, 0.0), (0.0, 1.06, 0.0), (-0.2, 0.86, 0.02), (0.31, 0.5, 0.1), (-0.05, 0.3, -0.03)] {
        g.line(["board", r, f64(x), f64(y), f64(z)] + v(w.board(Vec2(x, y), z: z)))
    }
    for s in samples {
        g.line(["ball", r, phaseToken(s.phase), f64(s.x), f64(s.along), f64(s.height), f(w.ballScale(s))] + v(w.ballCenter(s)) + v(w.surfaceNormal(s)))
    }
}

// ---- Camera fit: the rig and projections for each viewport ----
let cab = Cabinet(table: Room.boardwalk.table, palette: .of(.boardwalk))
let fp = cab.framingPoints
g.line(["framing"] + v(fp.near) + v(fp.hump) + v(fp.top))
for (wi, hi) in viewports {
    let size = CGSize(width: wi, height: hi)
    let aspect = Float(size.width / size.height)
    let rig = Cabinet.fit(points: fp, aspect: aspect)
    let vp = [i(wi), i(hi)]
    g.line(["fit"] + vp + v(rig.position) + v(rig.target) + [f(rig.fov)])
    let presenter = ScenePresenter(cabinet: cab, aspect: aspect)
    let w = cab.world
    func px(_ p: SIMD3<Float>) -> [String] {
        let q = rig.project(p, aspect: aspect)
        return [f64(Double(q.x) * Double(wi)), f64(Double(q.y) * Double(hi))]
    }
    let L = w.table.lane.length, hw = w.table.lane.width / 2
    g.line(["proj"] + vp + ["laneNearLeft"] + px(w.lane(x: -hw, s: 0)))
    g.line(["proj"] + vp + ["laneNearRight"] + px(w.lane(x: hw, s: 0)))
    g.line(["proj"] + vp + ["laneFarLeft"] + px(w.lane(x: -hw, s: L)))
    g.line(["proj"] + vp + ["laneFarRight"] + px(w.lane(x: hw, s: L)))
    g.line(["proj"] + vp + ["hump"] + px(fp.hump))
    g.line(["proj"] + vp + ["near"] + px(fp.near))
    g.line(["proj"] + vp + ["top"] + px(fp.top))
    for h in Hole.allCases {
        g.line(["proj"] + vp + [holeToken(h)] + px(w.board(w.table.board.holeCenter(h))))
    }
    for (k, s) in samples.enumerated() {
        g.line(["proj"] + vp + ["sample\(k)"] + px(w.ballCenter(s)))
    }
    let fg = presenter.flickGeometry(size: size)
    g.line(["flick"] + vp + [f64(fg.creaseY), f64(fg.laneCenterX), f64(fg.laneHalfWidth), f64(fg.foulGive)])
    for line in [-1.0, -0.4, 0, 0.55, 1] {
        let pts = presenter.guide(line: line, size: size)
        g.line(["guide"] + vp + [f64(line)] + pts.flatMap { [f64(Double($0.x)), f64(Double($0.y))] })
        g.line(["waiting", f64(line)] + v(presenter.waitingBall(line: line)))
    }
    for (fx, fy) in [(0.5, 0.9), (0.2, 0.75), (0.95, 0.99), (0.5, 0.52), (0.5, 0.3), (0.0, 0.6)] as [(Float, Float)] {
        if let p = presenter.lanePoint(screen: SIMD2(fx, fy), aspect: aspect) {
            g.line(["lanepoint"] + vp + [f(fx), f(fy), "1"] + v(p))
            let lc = presenter.laneCoordinates(p)
            g.line(["lanecoords"] + v(p) + [f64(lc.x), f64(lc.s)])
        } else {
            g.line(["lanepoint"] + vp + [f(fx), f(fy), "0"])
        }
    }
    let ray = rig.ray(SIMD2(0.3, 0.6), aspect: aspect)
    g.line(["ray"] + vp + v(ray.0) + v(ray.1))
}

// ---- The cabinet's node tree, depth first, outline shells folded in ----
func rgbOf(_ any: Any?) -> String {
    guard let c = any as? NSColor, let s = c.usingColorSpace(.sRGB) else { return "-" }
    let r = Int((s.redComponent * 255).rounded()), gg = Int((s.greenComponent * 255).rounded()), b = Int((s.blueComponent * 255).rounded())
    return i(r * 65536 + gg * 256 + b)
}

func geometryTokens(_ geo: SCNGeometry) -> [String] {
    switch geo {
    case let b as SCNBox: ["box", f(Float(b.width)), f(Float(b.height)), f(Float(b.length)), f(Float(b.chamferRadius))]
    case let c as SCNCylinder: ["cylinder", f(Float(c.radius)), f(Float(c.height))]
    case let s as SCNSphere: ["sphere", f(Float(s.radius))]
    case let t as SCNTorus: ["torus", f(Float(t.ringRadius)), f(Float(t.pipeRadius))]
    case let p as SCNPlane: ["plane", f(Float(p.width)), f(Float(p.height))]
    case let t as SCNTube: ["tube", f(Float(t.innerRadius)), f(Float(t.outerRadius))]
    default: ["mesh", i(geo.sources(for: .vertex).first?.vectorCount ?? 0)]
    }
}

@MainActor func dump(_ room: Room) {
    let cab = Cabinet(table: room.table, palette: .of(room))
    var index = 0
    func walk(_ n: SCNNode) {
        if n.name != "outline", let geo = n.geometry {
            let outline = n.childNodes.first { $0.name == "outline" }
            let thick = (outline?.geometry?.firstMaterial?.value(forKey: "uThick") as? NSNumber)?.floatValue ?? 0
            let m = geo.firstMaterial
            let t = n.simdWorldTransform
            let cols = [t.columns.0, t.columns.1, t.columns.2, t.columns.3].flatMap { [f($0.x), f($0.y), f($0.z)] }
            g.line(["node", roomToken(room), i(index)] + geometryTokens(geo) + [rgbOf(m?.diffuse.contents), f(thick), b(n.isHidden), f(Float(n.opacity))] + cols)
            index += 1
        }
        for c in n.childNodes where c.name != "outline" { walk(c) }
    }
    walk(cab.scene.rootNode)
    g.line(["nodecount", roomToken(room), i(index)])
    // Camera before any fit.
    g.line(["camera0", roomToken(room)] + v(cab.camera.simdPosition) + [f(Float(cab.camera.camera!.fieldOfView))])
}
for room in Room.allCases { dump(room) }

// ---- setReel: decal placement, hiding, scale and the halo ----
let reelCab = Cabinet(table: Room.boardwalk.table, palette: .boardwalk)
for hole in BoardSetup.reelHoles {
    for (turn, glow, slot, pulse) in [(0.0, Float(0), false, Float(1)), (1.4, 1, false, 0.8), (2.75, 2, false, 0.6), (-0.3, 0, true, 0.9), (3.0, 0, false, 1)] {
        reelCab.setReel(hole, .bell, turn: turn, glow: glow, slotMatch: slot, pulse: pulse)
        let r = reelCab.reelsOnBoard[hole]!
        for (k, d) in r.decals.enumerated() {
            g.line(["decal", holeToken(hole), f64(turn), f(glow), b(slot), f(pulse), i(k), b(d.isHidden), f(d.simdScale.x)] + v(d.simdPosition) + v(d.simdWorldPosition))
        }
        g.line(["halo", holeToken(hole), f64(turn), f(glow), b(slot), f(pulse), f(Float(r.halo.opacity)), rgbOf(r.halo.geometry?.firstMaterial?.diffuse.contents)] + v(r.halo.simdWorldPosition))
    }
}

// ---- Bulbs ----
for (phase, level) in [(0, Float(0.35)), (1, 0.9), (5, 0.35), (2, 0)] as [(Int, Float)] {
    reelCab.lightBulbs(phase: phase, level: level)
    let lit = reelCab.bulbs.map { n -> String in
        let e = n.geometry?.firstMaterial?.emission.contents as? NSColor
        let w = e?.usingColorSpace(.sRGB)?.redComponent ?? 0
        return f(Float(w))
    }
    g.line(["bulbs", i(phase), f(level)] + lit)
}

try g.write()
