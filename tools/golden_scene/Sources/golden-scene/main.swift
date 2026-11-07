import AppKit
import GoldenSupport
import SceneKit
import SkeeCore
import SkeeRender
import SkeeScene
import simd

// Goldens for the scene piece (lib/skee/world.march, camera.march, scene.march),
// from the real SkeeScene: World's mappings, Cabinet.fit, CameraRig.project,
// ScenePresenter's flick geometry, guide, lane point and waiting ball, the
// Cabinet's node tree, and setReel's decal placement.
//
// SkeeScene computes in Float (32-bit). Every value is written as the Double
// of that Float, so March (64-bit) is compared with a stated tolerance.

var g = GoldenFile(module: "Scene", regenerate: "make golden-scene")

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

// ---- Textures.lane: each board's tone, read off the real texture ----
// The commonest pixel inside each board (between its seams, grain streaks
// aside) is the board's fill, mixed from the maple base.
do {
    let img = Textures.lane
    let w = img.width, h = img.height
    var px = [UInt8](repeating: 0, count: w * h * 4)
    let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                        space: CGColorSpace(name: CGColorSpace.sRGB)!,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    let bw = Double(w) / 9
    for board in 0..<9 {
        var counts: [Int: Int] = [:]
        let x0 = Int((Double(board) * bw).rounded(.up)) + 3, x1 = Int((Double(board + 1) * bw).rounded(.down)) - 3
        for y in 0..<h {
            for x in x0..<x1 {
                let o = (y * w + x) * 4
                counts[Int(px[o]) * 65536 + Int(px[o + 1]) * 256 + Int(px[o + 2]), default: 0] += 1
            }
        }
        let tone = counts.max { $0.value < $1.value }!.key
        g.line(["lanetone", i(board), i(tone / 65536), i(tone / 256 % 256), i(tone % 256)])
    }
}

// ---- Textures.lane, .ball(kind), .wave: sampled rows of the real images ----
// Each row is run-length coded, `count value` pairs left to right, where a
// value is the 8-bit premultiplied pixel a * 2^24 + r * 2^16 + g * 2^8 + b.
// Memory row y is drawing y: Textures draws y-down. The port paints each
// texture's marks from one list and reads its texel back from the same list.
func pixels(_ img: CGImage) -> [UInt8] {
    let w = img.width, h = img.height
    var px = [UInt8](repeating: 0, count: w * h * 4)
    let ctx = CGContext(data: &px, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                        space: CGColorSpace(name: CGColorSpace.sRGB)!,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    return px
}
@MainActor func textureRows(_ kind: [String], _ img: CGImage, rows: StrideTo<Int>) {
    let px = pixels(img)
    let w = img.width
    for y in rows {
        var runs: [String] = []
        var last = -1, count = 0
        for x in 0..<w {
            let o = (y * w + x) * 4
            let v = Int(px[o + 3]) * 16777216 + Int(px[o]) * 65536 + Int(px[o + 1]) * 256 + Int(px[o + 2])
            if v == last { count += 1 } else {
                if count > 0 { runs += [i(count), i(last)] }
                last = v; count = 1
            }
        }
        runs += [i(count), i(last)]
        g.line(kind + [i(y)] + runs)
    }
}
textureRows(["lanepx"], Textures.lane, rows: stride(from: 4, to: 2048, by: 8))
for kind in BallKind.allCases { textureRows(["ballpx", kind.rawValue], Textures.ball(kind), rows: stride(from: 1, to: 256, by: 2)) }
textureRows(["wavepx"], Textures.wave, rows: stride(from: 2, to: 256, by: 4))

// ---- ScenePresenter.update, frame by frame over real throws ----
// Inputs the presenter read and what it did to the ball, shadow, trough and
// camera, so the March port can replay the same inputs.
@MainActor func replay(seed: UInt64, throws launches: [Launch], tag: String, looks: Bool = false, ball: BallKind = .classic) {
    let cab = Cabinet(table: Room.boardwalk.table, palette: .boardwalk)
    let presenter = ScenePresenter(cabinet: cab, aspect: 390.0 / 844.0)
    var state = newRun(seed: seed)
    state.ball = ball
    var p = Presentation(state: state)
    let dt = 1.0 / 60
    var frame = 0
    func send(_ a: Action) {
        let r = apply(a, to: state); guard case .success(let step) = r else { fatalError("action refused: \(r) after \(frame) frames") }
        state = step.state
        p.enqueue(step)
    }
    func cueToken(_ c: Cue) -> String? {
        switch c {
        case .hump: "hump"
        case .lip: "lip"
        case .hop: "hop"
        case .landed: "landed"
        case .backwall: "backwall"
        case .rail: "rail"
        case .drop(let h): "drop-" + holeToken(h)
        default: nil
        }
    }
    func step(record: Bool) {
        p.advance(dt)
        presenter.update(p, held: nil, dt: dt)
        guard record else { return }
        let s = p.shown
        var t: [String] = ["frame", tag, i(frame), f64(p.clock), b(p.isBusy)]
        if case .roll = p.current { t.append("1") } else { t.append("0") }
        if let sm = p.ball { t += [phaseToken(sm.phase), f64(sm.x), f64(sm.along), f64(sm.height)] } else { t += ["-", "-", "-", "-"] }
        if let r = p.restingBall { t += [phaseToken(r.sample.phase), f64(r.sample.x), f64(r.sample.along), f64(r.sample.height), f64(r.until)] } else { t += ["-", "-", "-", "-", "-"] }
        if case .throwing = s.phase { t.append("1") } else { t.append("0") }
        t += [i(s.round.ballsLeft), f64(p.anticipation), f64(p.shake), s.ball.rawValue]
        let cues = p.cues.compactMap(cueToken)
        t.append(cues.isEmpty ? "-" : cues.joined(separator: ","))
        let ball = cab.ball
        let q = ball.simdOrientation
        t += v(ball.simdPosition) + [f(q.real), f(q.imag.x), f(q.imag.y), f(q.imag.z), f(ball.simdScale.x), b(ball.isHidden)]
        let sh = cab.shadow
        let sq = sh.simdOrientation
        t += v(sh.simdPosition) + [f(sq.real), f(sq.imag.x), f(sq.imag.y), f(sq.imag.z), f(sh.simdScale.x), f(Float(sh.opacity)), b(sh.isHidden)]
        t.append(i(cab.waiting.filter { !$0.isHidden }.count))
        t += v(cab.camera.simdPosition)
        if looks { lookRows(t, p) } else { g.line(t) }
        frame += 1
    }
    // What the reels, bulbs, rings of light and camera aim showed: the
    // frame's inputs (the first 20 tokens of a frame row), the rest of what
    // update reads, then the cabinet's state after it.
    func lookRows(_ t: [String], _ p: Presentation) {
        let s = p.shown
        let excited = p.flash > 0.05 || s.fever || p.banner != nil || p.anticipation > 0 || p.celebration > 0
        let have = (p.tallyProgress == nil && !p.isBusy) ? s.round.currentBalls.map(\.symbol.rawValue) : []
        let slot = p.isBusy ? "-" : s.topSlot.symbols.map(\.rawValue).joined(separator: ",")
        var l = ["look"] + Array(t.dropFirst().prefix(20))
        l += [b(excited), have.isEmpty ? "-" : have.joined(separator: ","), slot, b(s.setup == BoardSetup.standard)]
        for hole in BoardSetup.reelHoles {
            let r = cab.reelsOnBoard[hole]!
            let d = r.decals[0]
            let e = (d.geometry!.firstMaterial!.emission.contents as? NSColor)?.usingColorSpace(.extendedSRGB)
            l += [f64(p.reelPositions[hole] ?? 0), r.shown?.rawValue ?? "-", f(Float(r.halo.opacity)), rgbOf(r.halo.geometry?.firstMaterial?.diffuse.contents), f(d.simdScale.x), b(d.isHidden)]
            l += [f(Float(e?.redComponent ?? 0)), f(Float(e?.greenComponent ?? 0)), f(Float(e?.blueComponent ?? 0))]
        }
        l += v(cab.camera.simdWorldPosition) + v(cab.camera.simdWorldFront)
        g.line(l)
        let lit = cab.bulbs.map { n -> String in
            let e = (n.geometry?.firstMaterial?.emission.contents as? NSColor)?.usingColorSpace(.extendedSRGB)
            return f(Float(e?.redComponent ?? 0))
        }
        g.line(["lookbulbs", tag, i(frame)] + lit)
        let wave = Textures.wave as AnyObject
        let rings = cab.scene.rootNode.childNodes.filter { n in
            guard let c = n.geometry?.firstMaterial?.diffuse.contents else { return false }
            return (c as AnyObject) === wave
        }
        g.line(["lookwaves", tag, i(frame), i(rings.count)] + rings.flatMap { [f($0.simdScale.x), f(Float($0.opacity))] })
    }
    send(.pull(.one))
    while p.isBusy { step(record: false) }
    for l in launches {
        guard case .throwing = state.phase else { break }
        if case .failure(.needsPull) = apply(.throwBall(l), to: state) {
            send(.pull(.one))
            while p.isBusy { step(record: true) }
        }
        send(.throwBall(l))
        while p.isBusy { step(record: true) }
        for _ in 0..<40 { step(record: true) }
    }
}
replay(seed: 7, throws: [Launch(power: 0.62, aim: 0.01), Launch(power: 0.05, aim: -0.03), Launch(power: 0.9, aim: 0.05, spin: 0.4)], tag: "a")
// A whole frame of nine balls, for the reels' glow, flashes and slot
// matches, the bulbs' chase, the rings of light and the camera's lean.
replay(seed: 7, throws: [
    Launch(power: 0.62, aim: 0.01), Launch(power: 0.62, aim: 0.01), Launch(power: 0.55, aim: 0.03),
    Launch(power: 0.8, aim: 0.0), Launch(power: 0.8, aim: 0.0), Launch(power: 0.05, aim: -0.03),
    Launch(power: 0.9, aim: 0.05, spin: 0.4), Launch(power: 0.6, aim: -0.05), Launch(power: 0.75, aim: 0.02),
], tag: "b", looks: true)

// The other balls, for the paths replays a and b never reach: a comet's
// rings at the hump, the back wall and the rails; a jumping bean's hops; a
// marshmallow's drawn size.
replay(seed: 7, throws: [Launch(power: 1.0, aim: 0.0), Launch(power: 0.8, aim: 0.8), Launch(power: 0.7, aim: -1.0)], tag: "c", looks: true, ball: .comet)
replay(seed: 7, throws: [Launch(power: 0.6, aim: 0.0), Launch(power: 1.0, aim: 0.0), Launch(power: 0.8, aim: 0.8)], tag: "d", looks: true, ball: .bean)
replay(seed: 7, throws: [Launch(power: 0.62, aim: 0.01)], tag: "e", ball: .marshmallow)

try g.write()
