// swift-tools-version: 6.0
import PackageDescription

// The host's goldens: Host, HostGuard and Haggle from SkeeCore, and
// DeepSeek.parse from SkeeNet, so this is a package of its own beside
// tools/golden. Owned by the host piece. `make golden-host` runs golden-host
// (test/golden/host.march) and golden-unicode (lib/skee/unicode_data.march:
// the Swift runtime's Unicode tables that Skee.SwiftText reads).
let package = Package(
    name: "SkeeGoldenHost",
    platforms: [.macOS(.v15)],
    dependencies: [
        .package(name: "SkeeSkeeSkee", path: "/Users/bobdawg/code/skee_skee_skee"),
    ],
    targets: [
        .target(name: "GoldenSupport"),
        .executableTarget(name: "golden-host", dependencies: [
            "GoldenSupport",
            .product(name: "SkeeCore", package: "SkeeSkeeSkee"),
            .product(name: "SkeeNet", package: "SkeeSkeeSkee"),
        ]),
        .executableTarget(name: "golden-unicode", dependencies: []),
    ]
)
