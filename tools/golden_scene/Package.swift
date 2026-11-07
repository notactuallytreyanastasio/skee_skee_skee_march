// swift-tools-version: 6.0
import PackageDescription

// The scene goldens need SkeeScene (SceneKit), so they get a package of their
// own beside tools/golden, like tools/golden_cabinet. Owned by the scene piece.
//   make golden-scene
let package = Package(
    name: "SkeeGoldenScene",
    platforms: [.macOS(.v15)],
    dependencies: [
        .package(name: "SkeeSkeeSkee", path: "/Users/bobdawg/code/skee_skee_skee"),
    ],
    targets: [
        .target(name: "GoldenSupport"),
        .executableTarget(name: "golden-scene", dependencies: [
            "GoldenSupport",
            .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
            .product(name: "SkeeScene", package: "SkeeSkeeSkee"),
            .product(name: "SkeeRender", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "scene-snapshot", dependencies: [
            .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
            .product(name: "SkeeScene", package: "SkeeSkeeSkee"),
            .product(name: "SkeeRender", package: "SkeeSkeeSkee"),
        ]),
    ]
)
