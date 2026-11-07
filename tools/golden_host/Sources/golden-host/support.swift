import Foundation
import GoldenSupport

// Text travels as UTF-8 hex, since a line holds spaces, quotes and newlines.
func hex(_ s: String) -> String {
    s.isEmpty ? "-" : s.utf8.map { String(format: "%02x", $0) }.joined()
}

/// A deterministic stream for building the fuzz corpus. The corpus itself is
/// written into the golden file, so March never has to replay this.
struct Fuzz {
    var state: UInt64
    mutating func next() -> UInt64 {
        state &+= 0x9E37_79B9_7F4A_7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
        return z ^ (z >> 31)
    }
    mutating func below(_ n: Int) -> Int { Int(next() % UInt64(n)) }
    mutating func pick<T>(_ xs: [T]) -> T { xs[below(xs.count)] }
}

func s(_ xs: UInt32...) -> String {
    var out = ""
    for x in xs { out.unicodeScalars.append(Unicode.Scalar(x)!) }
    return out
}
