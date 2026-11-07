import Foundation
import GoldenSupport

// ---- Swift's String, as Skee.SwiftText models it ----
// Rows:
//   seg <text> <chars>       each Character as <scalars><L|.><N|.><W|.>:<ascii key or x>
//   lower <text> <lowercased>
//   prop <scalar> <alphabetic numeric whitespace emojiPresentation trimmed>
//   prefix <text> <n> <String(text.prefix(n))> <text.count>

/// Scalars from every grapheme-break class and the properties the guard reads.
let tricky: [String] = [
    "a", "b", "k", "K", "s", "x", "Z", "1", "7", " ", "-", ".", "(", ")", "@", "`", ";", "\"", "\\",
    "\r", "\n", "\t", "\r\n", s(0x7F), s(0x00), s(0x0B), s(0x85), s(0xAD), s(0x200B), s(0x2060), s(0xFEFF),
    s(0xA0), s(0x1680), s(0x2002), s(0x2028), s(0x2029), s(0x202F), s(0x3000), s(0x180E),
    s(0x301), s(0x308), s(0x300), s(0x20E3), s(0x34F), s(0xFE0F), s(0xFE0E), s(0xE0100), s(0x200C), s(0x200D),
    s(0x903), s(0x93F), s(0x93C), s(0x94D), s(0x915), s(0x937), s(0x930), s(0x9CD), s(0x995), s(0xA4D), s(0xD4D), s(0xD15),
    s(0x600), s(0x605), s(0x6DD), s(0x110BD), s(0x111C2),
    s(0x1100), s(0x1161), s(0x11A8), s(0xAC00), s(0xAC01), s(0xA960), s(0xD7B0), s(0xD7CB),
    s(0x1F1E6), s(0x1F1FA), s(0x1F1F8), s(0x1F600), s(0x2764), s(0x1F468), s(0x1F469), s(0x1F3FB), s(0x1F3FF),
    s(0x1F3F4), s(0xE0067), s(0xE007F), s(0x00A9), s(0x263A), s(0x1F3B0), s(0x2E80), s(0x3030), s(0x1F004),
    s(0xE33), s(0xE01), s(0xEB3), s(0x1B44), s(0x1A60), s(0x11720),
    s(0x212A), s(0x130), s(0x1FEF), s(0x37E), s(0x2126), s(0x212B), s(0xFF21), s(0xFF41), s(0x3A3), s(0x3C2), s(0x1E9E), s(0xDF),
    s(0x663), s(0xFF15), s(0xB2), s(0xBD), s(0x216B), s(0x4E00), s(0x4E03), s(0x2460), s(0x1D7CE),
    s(0x4F60), s(0x597D), s(0xE9), s(0x65), s(0x438), s(0x5D0), s(0x627), s(0x10400), s(0x10428),
]

func charToken(_ c: Character) -> String {
    let key: String
    if c.unicodeScalars.count == 1, let v = (0..<128).first(where: { Character(Unicode.Scalar(UInt8($0))) == c }) { key = String(v) }
    else { key = "x" }
    return "\(c.unicodeScalars.count)\(c.isLetter ? "L" : ".")\(c.isNumber ? "N" : ".")\(c.isWhitespace ? "W" : "."):\(key)"
}

func textRows(_ g: inout GoldenFile) {
    var fz = Fuzz(state: 0x5EE5_7E77)
    var texts: [String] = tricky
    for a in tricky { for b in tricky { if fz.below(9) == 0 { texts.append(a + b) } } }
    for _ in 0..<5000 {
        let n = 1 + fz.below(12)
        texts.append((0..<n).map { _ in fz.pick(tricky) }.joined())
    }
    // Denser where the rules carry state: conjuncts (GB9c), emoji ZWJ
    // sequences (GB11), flags (GB12, GB13) and Hangul syllables (GB6 to GB8).
    let stateful: [String] = [s(0x915), s(0x937), s(0x930), s(0x995), s(0xD15), s(0x94D), s(0x9CD), s(0xD4D), s(0x93C), s(0x200D),
                              s(0x200C), s(0x301), s(0x903), s(0x1F600), s(0x2764), s(0x1F468), s(0x1F3FB), s(0xFE0F), s(0x1F1E6),
                              s(0x1F1FA), s(0x1100), s(0x1161), s(0x11A8), s(0xAC00), s(0xAC01), "a", " ", s(0x600), "\r", "\n"]
    for _ in 0..<3000 {
        let n = 2 + fz.below(10)
        texts.append((0..<n).map { _ in fz.pick(stateful) }.joined())
    }
    for t in texts {
        g.line("seg", hex(t), t.map(charToken).joined(separator: ","))
        g.line("lower", hex(t), hex(t.lowercased()))
    }
    // Property spot checks: every scalar where some property changes, its
    // neighbours, and a stride through the rest.
    func bits(_ x: Unicode.Scalar) -> String {
        let p = x.properties
        return [p.isAlphabetic, p.numericType != nil, p.isWhitespace, p.isEmojiPresentation,
                CharacterSet.whitespacesAndNewlines.contains(x)].map { $0 ? "1" : "0" }.joined()
    }
    var last = ""
    var picked = Set<UInt32>()
    for v in UInt32(0)...0x10FFFF {
        guard let x = Unicode.Scalar(v) else { continue }
        let b = bits(x)
        if b != last || v % 977 == 0 { picked.insert(v); if v > 0 { picked.insert(v - 1) } }
        last = b
    }
    for v in picked.sorted() { if let x = Unicode.Scalar(v) { g.line("prop", String(v), bits(x)) } }
    // Lowercase over every scalar that changes.
    for v in UInt32(0)...0x10FFFF {
        guard let x = Unicode.Scalar(v) else { continue }
        let m = x.properties.lowercaseMapping
        if m != String(x) { g.line("lowermap", String(v), m.unicodeScalars.map { String($0.value) }.joined(separator: ",")) }
    }
    // String(text.prefix(n)) and count, as Haggle.say and HostGuard.allows use them.
    let comb = "e" + s(0x301)
    let longs = [String(repeating: "a", count: 250), String(repeating: comb, count: 230), String(repeating: "\r\n", count: 210),
                 String(repeating: s(0x1F468, 0x200D, 0x1F469), count: 205), String(repeating: s(0x1F1E6), count: 401),
                 String(repeating: "ab ", count: 70) + s(0x915, 0x94D, 0x937)]
    for t in longs + texts.prefix(300) {
        for n in [0, 1, 2, 199, 200, 201, 239, 240, 241] {
            g.line("prefix", hex(t), String(n), hex(String(t.prefix(n))), String(t.count))
        }
    }
}
