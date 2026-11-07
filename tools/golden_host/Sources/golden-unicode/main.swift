import Foundation

// The Unicode facts Swift's String uses, read off this machine's Swift
// runtime by asking it, never typed in: scalar properties, the lowercase
// mapping, CharacterSet.whitespacesAndNewlines (DeepSeek.parse's trim),
// which single scalars a Character compares equal to an ASCII one (canonical
// equivalence), and grapheme break classes found by probing how String
// groups scalars into Characters. Writes lib/skee/unicode_data.march.
// Each table is one String of fixed-width hex records sorted by start, so
// March can binary-search it with string_byte_at and allocate nothing.

func scalars() -> [Unicode.Scalar] {
    (0...0x10FFFF).compactMap { Unicode.Scalar(UInt32($0)) }
}
let all = scalars()

func h6(_ v: UInt32) -> String {
    let s = String(v, radix: 16)
    return String(repeating: "0", count: 6 - s.count) + s
}

/// Ranges of scalars where `f` gives the same non-nil class, as records
/// start(6) end(6) class(width chars).
func ranges(_ f: (Unicode.Scalar) -> String?) -> [String] {
    var out: [String] = []
    var cur: (UInt32, UInt32, String)? = nil
    for s in all {
        let c = f(s)
        if let (a, b, k) = cur, let c, c == k, s.value == b + 1 { cur = (a, s.value, k); continue }
        if let (a, b, k) = cur { out.append(h6(a) + h6(b) + k) }
        cur = c.map { (s.value, s.value, $0) }
    }
    if let (a, b, k) = cur { out.append(h6(a) + h6(b) + k) }
    return out
}

func str(_ xs: Unicode.Scalar...) -> String { var s = ""; s.unicodeScalars.append(contentsOf: xs); return s }
func n(_ s: String) -> Int { s.count }
let a: Unicode.Scalar = "a"
let acute: Unicode.Scalar = "\u{301}"
let ka: Unicode.Scalar = "\u{915}", virama: Unicode.Scalar = "\u{94D}"
let jL: Unicode.Scalar = "\u{1100}", jV: Unicode.Scalar = "\u{1161}", jT: Unicode.Scalar = "\u{11A8}"
let grin: Unicode.Scalar = "\u{1F600}", zwj: Unicode.Scalar = "\u{200D}"
let riA: Unicode.Scalar = "\u{1F1E6}"

/// Grapheme_Cluster_Break as String's behaviour shows it. One letter each:
/// r CR, n LF, c Control, e Extend, z ZWJ, m SpacingMark, p Prepend,
/// l L, v V, t T, s LV, x LVT, i Regional_Indicator. Any is absent.
func gcb(_ x: Unicode.Scalar) -> String? {
    if x.value == 0x0D { return "r" }
    if x.value == 0x0A { return "n" }
    if x.value == 0x200D { return "z" }
    let attaches = n(str(a, x)) == 1
    if attaches {
        // GB11 lets only Extend (not SpacingMark) sit between ExtPict and ZWJ.
        return n(str(grin, x, zwj, grin)) == 1 ? "e" : "m"
    }
    if n(str(x, acute)) == 2 { return "c" }
    if n(str(x, a)) == 1 { return "p" }
    if n(str(x, jL)) == 1 { return "l" }
    // T before V: V x T joins too (GB7), but only T x T (GB8).
    if n(str(jT, x)) == 1 { return "t" }
    if n(str(jV, x)) == 1 { return "v" }
    if n(str(jL, x)) == 1 { return n(str(x, jV)) == 1 ? "s" : "x" }
    if n(str(riA, x)) == 1 { return "i" }
    return nil
}

/// Extended_Pictographic, as GB11 shows it.
func pict(_ x: Unicode.Scalar) -> String? {
    if n(str(a, x)) == 1 { return nil }
    return n(str(grin, zwj, x)) == 1 ? "" : nil
}

/// Indic_Conjunct_Break as GB9c shows it: k Consonant, j Linker, e Extend.
func incb(_ x: Unicode.Scalar) -> String? {
    if n(str(a, x)) == 1 {
        if n(str(ka, x, ka)) == 1 { return "j" }
        if n(str(ka, x, virama, ka)) == 1 && n(str(ka, virama, x, ka)) == 1 { return "e" }
        return nil
    }
    return n(str(ka, virama, x)) == 1 ? "k" : nil
}

let trim = CharacterSet.whitespacesAndNewlines

/// A single scalar whose Character equals an ASCII Character: the ASCII byte.
var asciiOf: [UInt32: UInt8] = [:]
let asciiChars: [Character] = (0..<128).map { Character(Unicode.Scalar(UInt8($0))) }
for s in all where s.value >= 128 {
    let c = Character(s)
    for (k, ac) in asciiChars.enumerated() where c == ac { asciiOf[s.value] = UInt8(k) }
}

/// The lowercase mapping where it is not the scalar itself: up to three
/// scalars, padded with 000000.
func lowerRecord(_ s: Unicode.Scalar) -> String? {
    let m = Array(s.properties.lowercaseMapping.unicodeScalars)
    if m.count == 1 && m[0] == s { return nil }
    precondition(m.count <= 3)
    return (m + Array(repeating: Unicode.Scalar(0), count: 3 - m.count)).map { h6($0.value) }.joined()
}


// ---- March source: each table becomes a binary decision tree in code, so a
// lookup is a dozen Int comparisons and allocates nothing on either target.

/// Ranges with an Int class each, sorted and disjoint.
typealias Classed = [(UInt32, UInt32, Int)]

func parse(_ records: [String], width: Int, code: (String) -> Int) -> Classed {
    records.map { r in
        let a = UInt32(r.prefix(6), radix: 16)!, b = UInt32(r.dropFirst(6).prefix(6), radix: 16)!
        return (a, b, code(String(r.dropFirst(12))))
    }
}

func tree(_ rs: ArraySlice<(UInt32, UInt32, Int)>, bool: Bool, indent: String) -> String {
    if rs.count == 1 {
        let (a, b, k) = rs.first!
        let test = a == b ? "cp == \(a)" : "cp >= \(a) && cp <= \(b)"
        return bool ? test : "if \(test) do \(k) else 0 end"
    }
    let mid = rs.startIndex + rs.count / 2
    let deeper = indent + "  "
    return "if cp < \(rs[mid].0) do\n\(deeper)\(tree(rs[rs.startIndex..<mid], bool: bool, indent: deeper))\n\(indent)else\n\(deeper)\(tree(rs[mid..<rs.endIndex], bool: bool, indent: deeper))\n\(indent)end"
}

var out = "mod Skee.UnicodeData do\n\n"
out += "  -- GENERATED by tools/golden_host (golden-unicode) from the Swift runtime on\n"
out += "  -- this machine. Do not edit; run `make golden-host`. Every table is read off\n"
out += "  -- Swift itself (scalar properties, CharacterSet, Character equality, and how\n"
out += "  -- String groups scalars into Characters), and each one is a binary decision\n"
out += "  -- tree over scalar values, so a lookup allocates nothing. Skee.SwiftText\n"
out += "  -- reads these.\n"
out += "  cap pure\n\n"

@MainActor func emit(_ name: String, _ doc: String, _ rs: Classed, bool: Bool) {
    out += "  doc \"\"\"\(doc) \(rs.count) ranges.\"\"\"\n"
    out += "  fn \(name)(cp : Int) : \(bool ? "Bool" : "Int") needs () do\n    "
    out += rs.isEmpty ? (bool ? "false" : "0") : tree(rs[...], bool: bool, indent: "    ")
    out += "\n  end\n\n"
}
func flag(_ f: @escaping (Unicode.Scalar) -> Bool) -> Classed { parse(ranges { f($0) ? "" : nil }, width: 12) { _ in 1 } }

emit("alphabetic", "Unicode.Scalar.Properties.isAlphabetic, which Character.isLetter reads off the first scalar.", flag { $0.properties.isAlphabetic }, bool: true)
emit("numeric", "numericType != nil, which Character.isNumber reads off the first scalar.", flag { $0.properties.numericType != nil }, bool: true)
emit("white_space", "Unicode.Scalar.Properties.isWhitespace, which Character.isWhitespace reads off the first scalar.", flag { $0.properties.isWhitespace }, bool: true)
emit("emoji_presentation", "Unicode.Scalar.Properties.isEmojiPresentation, for HostGuard.allows.", flag { $0.properties.isEmojiPresentation }, bool: true)
emit("trimmed", "CharacterSet.whitespacesAndNewlines, which DeepSeek.parse trims.", flag { trim.contains($0) }, bool: true)
let gcbCodes = ["r": 1, "n": 2, "c": 3, "e": 4, "z": 5, "m": 6, "p": 7, "l": 8, "v": 9, "t": 10, "s": 11, "x": 12, "i": 13]
emit("grapheme_break", "Grapheme_Cluster_Break as String groups scalars: 0 Any, 1 CR, 2 LF, 3 Control, 4 Extend, 5 ZWJ, 6 SpacingMark, 7 Prepend, 8 L, 9 V, 10 T, 11 LV, 12 LVT, 13 Regional_Indicator.", parse(ranges(gcb), width: 13) { gcbCodes[$0]! }, bool: false)
emit("pictographic", "Extended_Pictographic, as GB11 shows it.", flag { pict($0) != nil }, bool: true)
emit("indic", "Indic_Conjunct_Break as GB9c shows it: 0 None, 1 Consonant, 2 Linker, 3 Extend.", parse(ranges(incb), width: 13) { ["k": 1, "j": 2, "e": 3][$0]! }, bool: false)

// Lowercase: single-scalar mappings as runs of one delta, every scalar or
// every other one; longer mappings listed whole.
var single: [(UInt32, Int)] = []
var multi: [(UInt32, [UInt32])] = []
for s in all {
    let m = Array(s.properties.lowercaseMapping.unicodeScalars)
    if m.count == 1 { if m[0] != s { single.append((s.value, Int(m[0].value) - Int(s.value))) } }
    else { multi.append((s.value, m.map(\.value))) }
}
var runs: [(UInt32, UInt32, Int, UInt32)] = []
for (cp, d) in single {
    if var r = runs.last, r.2 == d {
        let gap = cp - r.1
        if r.0 == r.1, gap == 1 || gap == 2 { r.1 = cp; r.3 = gap; runs[runs.count - 1] = r; continue }
        if r.0 != r.1, gap == r.3 { r.1 = cp; runs[runs.count - 1] = r; continue }
    }
    runs.append((cp, cp, d, 1))
}
func lowerTree(_ rs: ArraySlice<(UInt32, UInt32, Int, UInt32)>, indent: String) -> String {
    if rs.count == 1 {
        let (a, b, d, step) = rs.first!
        let delta = d < 0 ? "cp - \(-d)" : "cp + \(d)"
        if a == b { return "if cp == \(a) do \(delta) else cp end" }
        let every = step == 2 ? " && (cp - \(a)) % 2 == 0" : ""
        return "if cp >= \(a) && cp <= \(b)\(every) do \(delta) else cp end"
    }
    let mid = rs.startIndex + rs.count / 2
    let deeper = indent + "  "
    return "if cp < \(rs[mid].0) do\n\(deeper)\(lowerTree(rs[rs.startIndex..<mid], indent: deeper))\n\(indent)else\n\(deeper)\(lowerTree(rs[mid..<rs.endIndex], indent: deeper))\n\(indent)end"
}
out += "  doc \"\"\"lowercaseMapping for the \(single.count) scalars that map to one other scalar, as \(runs.count) runs; a scalar that maps to itself or to several comes back unchanged.\"\"\"\n"
out += "  fn lower_one(cp : Int) : Int needs () do\n    \(lowerTree(runs[...], indent: "    "))\n  end\n\n"
out += "  doc \"\"\"lowercaseMapping for the \(multi.count) scalars that map to more than one scalar; [] for every other.\"\"\"\n"
out += "  fn lower_many(cp : Int) : List(Int) needs () do\n"
var body = "[]"
for (cp, m) in multi.reversed() {
    body = "if cp == \(cp) do [\(m.map(String.init).joined(separator: ", "))] else \(body) end"
}
out += "    \(body)\n  end\n\n"
let asc = asciiOf.keys.sorted()
var ascBody = "-1"
for cp in asc.reversed() { ascBody = "if cp == \(cp) do \(asciiOf[cp]!) else \(ascBody) end" }
out += "  doc \"\"\"The ASCII byte whose Character a scalar past ASCII equals (a canonical singleton), or -1. \(asc.count) scalars.\"\"\"\n"
out += "  fn ascii_equal(cp : Int) : Int needs () do\n    \(ascBody)\n  end\n\n"
out += "end\n"
guard CommandLine.arguments.count > 1 else { print("usage: golden-unicode <project root>"); exit(2) }
let path = URL(fileURLWithPath: CommandLine.arguments[1]).appendingPathComponent("lib/skee/unicode_data.march")
try out.write(to: path, atomically: true, encoding: .utf8)
print("lowercase: \(single.count) single in \(runs.count) runs, \(multi.count) multi; ascii-equal \(asc.count)")
print("wrote \(path.path)")
