// swift-tools-version: 6.0
import PackageDescription

// The cabinet colours are in SkeeScene, which needs SceneKit, so they get a
// package of their own beside tools/golden. Owned by the rooms piece.
//   cd tools/golden_cabinet && swift run -c release golden-cabinet ../..
let package = Package(
    name: "SkeeGoldenCabinet",
    platforms: [.macOS(.v15)],
    dependencies: [
        .package(name: "SkeeSkeeSkee", path: "/Users/bobdawg/code/skee_skee_skee"),
    ],
    targets: [
        .target(name: "GoldenSupport"),
        .executableTarget(name: "golden-cabinet", dependencies: [
            "GoldenSupport",
            .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
            .product(name: "SkeeScene", package: "SkeeSkeeSkee"),
        ]),
    ]
)
