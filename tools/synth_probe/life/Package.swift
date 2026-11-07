// swift-tools-version: 6.0
import PackageDescription
// Synth piece probe: does Swift's Synth keep a voice whose t has reached
// exactly decay * 6 (strict `>`)? Expected values for the "voice lives
// through t == decay * 6" case in test/suites/synth_suite.march.
let package = Package(
    name: "SynthLifeProbe",
    platforms: [.macOS(.v15)],
    dependencies: [.package(name: "SkeeSkeeSkee", path: "/Users/bobdawg/code/skee_skee_skee")],
    targets: [.executableTarget(name: "synth-life", dependencies: [
        .product(name: "SkeeRender", package: "SkeeSkeeSkee")]),
             .executableTarget(name: "synth-drift", dependencies: [
        .product(name: "SkeeCore", package: "SkeeSkeeSkee"), .product(name: "SkeeRender", package: "SkeeSkeeSkee")])]
)
