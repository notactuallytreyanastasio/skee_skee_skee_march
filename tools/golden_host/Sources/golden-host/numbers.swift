import Foundation
import GoldenSupport
@testable import SkeeCore
@testable import SkeeNet

// ---- Number tokens (repair round 3) ----
// Rows:
//   parse <text> ...       DeepSeek.parse of a reply whose mood (or offer.nights) is the token
//   serial <body> <ok|refused>   JSONSerialization.jsonObject over an envelope holding the token
//                                in a field DeepSeek.chat never reads
//
// JSONDecoder reads an Int from an integer token exactly (Int64's range),
// and from any other token through a Double and, past 2^53, a Decimal.
// JSONSerialization reads a token of up to 17 digits as a Double (+inf
// refused, -inf read), a longer one as a Decimal (exponent -128...127), and
// refuses an exponent written in more than four characters.

func numberTokens() -> [String] {
    var toks: [String] = [
        "-9223372036854775808", "-9223372036854775809", "-9223372036854776000", "-9223372036854776832", "-9223372036854776833",
        "-9223372036854775807", "9223372036854775807", "9223372036854775808", "9223372036854775296", "9223372036854775295",
        "9223372036854774784", "9223372036854776832", "18446744073709551615", "18446744073709551616",
        "-9.223372036854775808e18", "-9.2233720368547758e18", "-9.2233720368547757e18", "9.2233720368547757e18",
        "9.2233720368547748e18", "-9223372036854775808.0", "-9223372036854775807.0", "9223372036854775807.0",
        "-9223372036854775808e0", "-9223372036854775809e0", "-92233720368547758080e-1", "-922337203685477580.71",
        "-922337203685477580.7", "9007199254740991.5", "9007199254740993.5", "18014398509481985.5", "4503599627370495.5",
        "4503599627370497.5", "184467440737095516.15", "184467440737095516.16", "1.8446744073709551615e17",
        "1.8446744073709551616e17", "9007199254740993.0000000000000000000009", "9007199254740993.00000000000000000000009",
        "9007199254740993.00000000000000000000", "18014398509481985.0000000000000000000001",
        "34000000000000000.0000000000000000000001", "35000000000000000.0000000000000000000001",
        "9007199254740993.9999999999999999999999999", "1.00000000000000001", "0.99999999999999999", "4.9e-324",
        "9.99999999999999999999e307", "9.9999999999999999e307", "9.99999999999999999e307", "1.23456789012345678901e-300",
        "1.2345678901234567890e200", "1.2345678901234567890e140", "123456789012345678901234567890", "1e-400", "-1e-400",
        "1e400", "-1e400", "-1e309", "1e0300", "1e00300", "1e-0001", "1e0001", "1e+0001", "1e+001", "1e-999", "1e-1000",
        "123456789012345678e1", "123456789012345678e0001", "123456789012345678e00001", "0.12345678901234567e-130",
        "0.123456789012345678", "0.12345678901234567", "1.0000000000000000", "1.00000000000000000", "0.0000000000000000",
        "-0.00000000000000000000", "123456789012345678e130", "123456789012345678e-145", "12345678901234567e-200",
        "123456789012345678e-200", "340282366920938463463374607431768211455e127", "340282366920938463463374607431768211456e126",
        "1" + String(repeating: "0", count: 165), "1" + String(repeating: "0", count: 166), "1" + String(repeating: "0", count: 200),
        "1" + String(repeating: "0", count: 164) + "e1", "1" + String(repeating: "0", count: 170) + "e-10",
        "0." + String(repeating: "0", count: 127) + "1", "0." + String(repeating: "0", count: 128) + "1",
        "0." + String(repeating: "0", count: 200) + "1", "0." + String(repeating: "0", count: 200),
        "0." + String(repeating: "0", count: 130) + "1e10", "0." + String(repeating: "0", count: 50) + String(repeating: "9", count: 60),
        "1." + String(repeating: "9", count: 60) + "e-127", "1." + String(repeating: "9", count: 60) + "e-90",
        "9007199254740993." + String(repeating: "0", count: 400) + "1",
    ]
    for base in ["9007199254740992", "9223372036854775807", "9223372036854775296", "9223372036854774784", "18446744073709551615"] {
        for sign in ["", "-"] {
            for tail in ["", ".0", ".5", ".1", ".00000000000000000001", "e0", "0e-1", "5e-1", "0000000000000000000000001e-25"] {
                toks.append(sign + base + tail)
            }
        }
    }
    var fz = Fuzz(state: 0x5EED_4E55)
    let lengths = [0, 1, 2, 5, 15, 16, 17, 18, 19, 20, 25, 38, 39, 40, 60, 120, 165, 166, 167]
    let fracs = [1, 2, 5, 16, 17, 18, 20, 30, 38, 40, 100, 127, 128, 129, 200]
    let exps = [0, 1, 2, 3, 16, 17, 18, 19, 30, 100, 126, 127, 128, 129, 140, 165, 166, 200, 300, 307, 308, 309, 320, 400]
    let alphabets = ["0123456789", "0", "9", "09"]
    for _ in 0..<500 {
        let sign = fz.pick(["", "", "-"])
        let k = fz.pick(lengths)
        var ip = k == 0 ? "0" : String(fz.pick(Array("123456789")))
        if k > 1 { let a = Array(fz.pick(alphabets)); for _ in 1..<k { ip.append(fz.pick(a)) } }
        var fp = ""
        if fz.below(5) < 3 { let a = Array(fz.pick(alphabets)); fp = "."; for _ in 0..<fz.pick(fracs) { fp.append(fz.pick(a)) } }
        var ep = ""
        if fz.below(5) < 3 { ep = fz.pick(["e", "E"]) + fz.pick(["", "+", "-"]) + fz.pick(["", "", "0", "00"]) + String(fz.pick(exps)) }
        toks.append(sign + ip + fp + ep)
    }
    return toks
}

func numberRows(_ g: inout GoldenFile) {
    let toks = numberTokens()
    for t in toks {
        for text in ["{\"say\": \"Hi\", \"offer\": {\"nights\": 2, \"tickets\": 1, \"credit\": 0}, \"mood\": " + t + ", \"walk\": false}",
                     "{\"say\": \"Hi\", \"offer\": {\"nights\": " + t + ", \"tickets\": 1, \"credit\": 0}, \"mood\": 0, \"walk\": false, \"x\": " + t + "}"] {
            if let r = DeepSeek.parse(text) { g.line(["parse", hex(text), "ok"] + replyTokens(r)) } else { g.line("parse", hex(text), "nil") }
        }
        let body = "{\"x\": " + t + ", \"choices\": [{\"message\": {\"role\": \"assistant\", \"content\": \"hi\"}, \"finish_reason\": \"stop\"}]}"
        let ok = (try? JSONSerialization.jsonObject(with: Data(body.utf8))) != nil
        g.line("serial", hex(body), ok ? "ok" : "refused")
    }
}
