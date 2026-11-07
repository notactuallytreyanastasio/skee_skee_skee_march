// swift-tools-version: 6.0
import PackageDescription

// Golden-value generators: each target runs the real Swift SkeeCore and writes
// a March data module under test/golden/. The reference package is a read-only
// path dependency; nothing here may change it.
let package = Package(
    name: "SkeeGolden",
    platforms: [.macOS(.v15)],
    dependencies: [
        .package(name: "SkeeSkeeSkee", path: "/Users/bobdawg/code/skee_skee_skee"),
    ],
    targets: [
        .target(name: "GoldenSupport"),
        .executableTarget(name: "golden-rng", dependencies: [
            "GoldenSupport", .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "golden-physics", dependencies: [
            "GoldenSupport", .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "golden-scoring", dependencies: [
            "GoldenSupport", .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "golden-items", dependencies: [
            "GoldenSupport", .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "golden-rooms", dependencies: [
            "GoldenSupport", .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "golden-run", dependencies: [
            "GoldenSupport", .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "golden-bots", dependencies: [
            "GoldenSupport", .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
        ]),
    ]
)
