// swift-tools-version: 6.0
import PackageDescription

// The synth is in SkeeRender, so it gets a package of its own beside
// tools/golden. Owned by the synth piece. `make golden-synth` runs it.
let package = Package(
    name: "SkeeGoldenSynth",
    platforms: [.macOS(.v15)],
    dependencies: [
        .package(name: "SkeeSkeeSkee", path: "/Users/bobdawg/code/skee_skee_skee"),
    ],
    targets: [
        .target(name: "GoldenSupport"),
        .executableTarget(name: "golden-synth", dependencies: [
            "GoldenSupport",
            .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
            .product(name: "SkeeRender", package: "SkeeSkeeSkee"),
        ]),
    ]
)
