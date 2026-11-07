// swift-tools-version: 6.0
import PackageDescription
// Scratch probe for the synth piece: which Float arithmetic does Swift's Synth do?
let package = Package(
    name: "SynthProbe",
    platforms: [.macOS(.v15)],
    dependencies: [.package(name: "SkeeSkeeSkee", path: "/Users/bobdawg/code/skee_skee_skee")],
    targets: [.executableTarget(name: "synth-probe", dependencies: [
        .product(name: "SkeeCore", package: "SkeeSkeeSkee"), .product(name: "SkeeRender", package: "SkeeSkeeSkee")])]
)
