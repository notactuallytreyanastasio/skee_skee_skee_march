import Foundation
import GoldenSupport
@testable import SkeeCore
@testable import SkeeNet

// ---- DeepSeek: reading replies, and the guarded retries over the wire ----
// Rows:
//   parse <text> ok <say> <n> <t> <c> <mood> <walk> <offTopic>   DeepSeek.parse
//   parse <text> nil
//   wire <id> <ask: reply|greeting> <room> <visit> <seed> <lines: hex,hex or ->
//   answer <id> <k> <status or net> <body>      what the mock relay answers, in order
//   sent <id> <k> <model> <max_tokens> <temperature bits> <response_format or -> <messages digest> <last message role> <last message>
//   result <id> ok <say> <n> <t> <c> <mood> <walk> <offTopic>
//   result <id> fail <http code|truncated|malformed|unreadable|network> <detail>
//
// DeepSeek's client runs for real against URLSession.shared; a URLProtocol
// stands in for the network, answers from the script and records each request.

/// An Int, or big+ / big- past what the JS target holds (March holds those at 2^53-1).
func wide(_ x: Int) -> String { x > (1 << 53) - 1 ? "big+" : x < -((1 << 53) - 1) ? "big-" : String(x) }

func replyTokens(_ r: HostReply) -> [String] {
    [hex(r.say), wide(r.offer.nights), wide(r.offer.tickets), wide(r.offer.credit), wide(r.mood), b(r.walk), offTok(r.offTopic)]
}

let okBody = #"{"say": "Two nights, then.", "offer": {"nights": 2, "tickets": 0, "credit": 0}, "mood": 1, "walk": false}"#

func parseRows(_ g: inout GoldenFile) {
    func with(_ field: String, _ value: String) -> String {
        var parts = ["\"say\": \"Hi\"", "\"offer\": {\"nights\": 2, \"tickets\": 1, \"credit\": 0}", "\"mood\": 0", "\"walk\": false"]
        let keys = ["say", "offer", "mood", "walk"]
        if let k = keys.firstIndex(of: field) { parts[k] = "\"\(field)\": \(value)" } else { parts.append("\"\(field)\": \(value)") }
        return "{" + parts.joined(separator: ", ") + "}"
    }
    func offer(_ inner: String) -> String { with("offer", inner) }
    var texts: [String] = [
        okBody, "{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}",
        "```json\n" + okBody + "\n```", "```\n" + okBody + "\n```", "``` json\n" + okBody + "\n```", "```json\n\n" + okBody + "\n\n```\n",
        "```json\n" + okBody + "\n```\nHope that helps!", "```json\r\n" + okBody + "\r\n```", "```" + okBody + "```", "````\n" + okBody + "\n````",
        "  \n```json\n" + okBody + "\n```  ", "```json\n" + okBody, okBody + "\n```", "```json\n```\n" + okBody + "\n```",
        "```json\n{\"say\": \"Hi\",\n\"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0},\n```inner\n\"mood\": 0, \"walk\": false}\n```",
        s(0x1FEF) + "``json\n" + okBody + "\n```", "`" + s(0x301) + "``json\n" + okBody + "\n```", s(0xFEFF) + okBody, s(0x200B) + okBody,
        s(0xA0, 0x2028) + okBody + s(0x3000), "\t\r\n" + okBody + "\n\n", s(0x85) + okBody, s(0x180E) + okBody,
        "", "   \n ", "Flattery with a marketing plan attached. Two nights it is.", "null", "[]", "\"hi\"", "{}", "[" + okBody + "]",
        okBody + " trailing", okBody + okBody, okBody + "\n", "{\"say\": 'Hi'}", "// note\n" + okBody,
        with("say", "\"\""), with("say", "\" \""), with("say", "1"), with("say", "null"), with("say", "[\"Hi\"]"), with("say", "true"),
        with("say", "\"\\u00e9t\\u00e9\""), with("say", "\"\\ud83d\\ude00\""), with("say", "\"\\ud800\""), with("say", "\"\\udc00x\""),
        with("say", "\"tab\there\""), with("say", "\"nul\\u0000\""), with("say", "\"raw\u{7F}del\""), with("say", "\"line\nbreak\""),
        with("say", "\"\\x41\""), with("say", "\"\\uZZZZ\""), with("say", "\"\\/slash\""), with("say", "\"a\\\"b\\\\c\""),
        with("mood", "1.0"), with("mood", "0.5"), with("mood", "\"1\""), with("mood", "null"), with("mood", "-7"), with("mood", "1e2"),
        with("mood", "1e400"), with("mood", "-1e400"), with("mood", "1e-400"), with("mood", "9007199254740993"), with("mood", "-9223372036854775808"),
        with("mood", "9223372036854775808"), with("mood", "1e18"), with("mood", "-0"), with("mood", "01"), with("mood", "1."), with("mood", "+1"),
        with("walk", "0"), with("walk", "\"false\""), with("walk", "null"), with("walk", "true"), with("walk", "tru"),
        with("offTopic", "true"), with("offTopic", "false"), with("offTopic", "null"), with("offTopic", "1"), with("offTopic", "\"true\""),
        with("extra", "{\"\\\" \\ntickets\": 1}"), with("extra", "{\"\\\" \ntickets\": 1}"), with("extra", "\"raw\u{01}\""), with("extra", "[1, 2,]"),
        with("extra", String(repeating: "[", count: 600) + String(repeating: "]", count: 600)),
        with("extra", String(repeating: "[", count: 300) + String(repeating: "]", count: 300)), with("extra", "\"\\uZZZZ\""), with("extra", "1."),
        offer("{\"nights\": 2, \"\\\" \ntickets\": 0, \"tickets\": 1, \"credit\": 0}"), offer("{\"nights\": 2, \"\\\" \ntickets\": 1, \"credit\": 0}"),
        offer("{\"nights\": 2, \"tickets\": 1}"), offer("{\"nights\": 2, \"tickets\": 1, \"credit\": 0, \"credit\": 500}"),
        offer("[2, 1, 0]"), offer("null"), offer("{\"nights\": \"2\", \"tickets\": 1, \"credit\": 0}"), offer("{\"nights\": 2.5, \"tickets\": 1, \"credit\": 0}"),
        offer("{\"nights\": 99, \"tickets\": -5, \"credit\": 1e5}"), offer("{\"nights\": 2, \"tickets\": 1, \"credit\": 0,}"),
        offer("{\"Nights\": 2, \"tickets\": 1, \"credit\": 0}"), offer("{\"n\\u0069ghts\": 2, \"tickets\": 1, \"credit\": 0}"),
        "{\"say\": \"Hi\", \"say\": \"Bye\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}",
        "{\"s\\u0061y\": \"Escaped key\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false}",
        "{\"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false, \"say\": \"Last\"}",
        "{\"say\": \"Hi\", \"offer\": {\"nights\": 1, \"tickets\": 0, \"credit\": 0}, \"mood\": 0, \"walk\": false,}",
        "{\"say\": \"Hi\" , \"offer\" : { \"nights\" : 1 , \"tickets\" : 0 , \"credit\" : 0 } , \"mood\" : 0 , \"walk\" : false }",
        "{\n  \"say\": \"Pretty\",\n  \"offer\": {\n    \"nights\": 3,\n    \"tickets\": 2,\n    \"credit\": 300\n  },\n  \"mood\": -1,\n  \"walk\": true,\n  \"offTopic\": false\n}",
    ]
    var fz = Fuzz(state: 0x9A25E)
    let pieces = ["{", "}", "[", "]", ",", ":", " ", "\n", "\"say\"", "\"offer\"", "\"mood\"", "\"walk\"", "\"nights\"", "\"tickets\"", "\"credit\"",
                  "\"Hi\"", "1", "0", "-1", "true", "false", "null", "```", "```json\n", "1.5", "\"\\u00e9\"", "\"\\\" \ntickets\""]
    for _ in 0..<400 {
        var t = okBody
        let n = 1 + fz.below(3)
        for _ in 0..<n {
            let at = t.index(t.startIndex, offsetBy: fz.below(t.count))
            if fz.below(2) == 0 { t.insert(contentsOf: fz.pick(pieces), at: at) } else { t.remove(at: at) }
        }
        texts.append(t)
    }
    for t in texts {
        if let r = DeepSeek.parse(t) { g.line(["parse", hex(t), "ok"] + replyTokens(r)) } else { g.line("parse", hex(t), "nil") }
    }
}

// ---- The mock relay ----
final class WireScript: @unchecked Sendable {
    var answers: [(Int?, String)] = []
    var sent: [Data] = []
    let lock = NSLock()
    static let shared = WireScript()
}

final class MockRelay: URLProtocol {
    override class func canInit(with request: URLRequest) -> Bool { request.url?.host == "relay.test" }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        var body = request.httpBody ?? Data()
        if body.isEmpty, let stream = request.httpBodyStream {
            stream.open()
            var buf = [UInt8](repeating: 0, count: 65536)
            while stream.hasBytesAvailable { let n = stream.read(&buf, maxLength: buf.count); if n <= 0 { break }; body.append(buf, count: n) }
            stream.close()
        }
        let sc = WireScript.shared
        sc.lock.lock()
        sc.sent.append(body)
        let answer = sc.answers.isEmpty ? (500, "{\"error\":\"script ran out\"}") : sc.answers.removeFirst()
        sc.lock.unlock()
        guard let code = answer.0 else {
            client?.urlProtocol(self, didFailWithError: URLError(.notConnectedToInternet))
            return
        }
        let resp = HTTPURLResponse(url: request.url!, statusCode: code, httpVersion: "HTTP/1.1", headerFields: ["content-type": "application/json"])!
        client?.urlProtocol(self, didReceive: resp, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: Data(answer.1.utf8))
        client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}

final class Box<T>: @unchecked Sendable { var value: Result<T, Error>?; init() {} }
func blocking<T>(_ body: @escaping @Sendable () async throws -> T) -> Result<T, Error> {
    let box = Box<T>(), done = DispatchSemaphore(value: 0)
    Task { do { box.value = .success(try await body()) } catch { box.value = .failure(error) }; done.signal() }
    done.wait()
    return box.value!
}

func envelope(_ content: String, finish: String = "stop") -> String {
    let data = try! JSONSerialization.data(withJSONObject: ["choices": [["index": 0, "message": ["role": "assistant", "content": content], "finish_reason": finish]]], options: [.sortedKeys])
    return String(decoding: data, as: UTF8.self)
}

struct Wire { let greeting: Bool; let room: Room; let visit: Haggle.Visit; let seed: UInt64; let said: [String]; let answers: [(Int?, String)] }

func wireRows(_ g: inout GoldenFile) {
    URLProtocol.registerClass(MockRelay.self)
    let client = DeepSeek(relay: URL(string: "https://relay.test/skee-host/chat")!)
    let link = #"{"say": "See www.example.com", "offer": {"nights": 2, "tickets": 0, "credit": 0}, "mood": 0, "walk": false}"#
    let calm = #"{"say": "Let's talk about the deal.", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 0, "walk": false, "offTopic": true}"#
    let crisis = #"{"say": "I'm only a game, and you matter more. Call or text 988 any time.", "offer": {"nights": 1, "tickets": 0, "credit": 0}, "mood": 1, "walk": false, "offTopic": true}"#
    let hello = #"{"say": "A seagull stole my hot dog. One free night?", "offer": {"nights": 3, "tickets": 2, "credit": 500}, "mood": 0, "walk": false}"#
    let ask = ["Two nights, please?"]
    var wires: [Wire] = [
        Wire(greeting: false, room: .neonLounge, visit: .newRoom, seed: 1, said: ask, answers: [(200, envelope(okBody))]),
        Wire(greeting: false, room: .neonLounge, visit: .newRoom, seed: 1, said: ask, answers: [(200, envelope(link)), (200, envelope(okBody))]),
        Wire(greeting: false, room: .neonLounge, visit: .newRoom, seed: 1, said: ask, answers: [(200, envelope(link)), (200, envelope("nope")), (200, envelope(okBody))]),
        Wire(greeting: false, room: .neonLounge, visit: .newRoom, seed: 1, said: ask, answers: [(200, envelope(link)), (200, envelope(link)), (200, envelope("still not it"))]),
        Wire(greeting: false, room: .boardwalk, visit: .arrival, seed: 3, said: ask, answers: [(429, "{\"error\":\"slow down\"}")]),
        Wire(greeting: false, room: .boardwalk, visit: .arrival, seed: 3, said: ask, answers: [(200, envelope(link)), (400, "{\"error\":\"not a haggle\"}")]),
        Wire(greeting: false, room: .boardwalk, visit: .arrival, seed: 3, said: ask, answers: [(502, "{\"error\":\"upstream\"}")]),
        Wire(greeting: false, room: .boardwalk, visit: .arrival, seed: 3, said: ask, answers: [(500, String(repeating: "x", count: 300))]),
        Wire(greeting: false, room: .boardwalk, visit: .arrival, seed: 3, said: ask, answers: [(200, envelope(okBody, finish: "length"))]),
        Wire(greeting: false, room: .boardwalk, visit: .arrival, seed: 3, said: ask, answers: [(nil, "")]),
        Wire(greeting: false, room: .boardwalk, visit: .arrival, seed: 3, said: ask, answers: [(200, envelope(link)), (nil, "")]),
        Wire(greeting: false, room: .highRoller, visit: .returning, seed: 8, said: ask, answers: [(200, envelope("")), (200, envelope("  ")), (200, envelope(okBody))]),
        Wire(greeting: false, room: .highRoller, visit: .returning, seed: 8, said: ask, answers: [(200, envelope("```json\n" + okBody + "\n```"))]),
        Wire(greeting: false, room: .penthouse, visit: .newRoom, seed: 2, said: ["I want to end my life"], answers: [(200, envelope(calm)), (200, envelope(crisis))]),
        Wire(greeting: false, room: .penthouse, visit: .newRoom, seed: 2, said: ["my number is 555-123-4567", "anyway, more credit?"], answers: [(200, envelope(okBody))]),
        Wire(greeting: true, room: .boardwalk, visit: .arrival, seed: 3, said: [], answers: [(200, envelope(hello))]),
        Wire(greeting: true, room: .neonLounge, visit: .newRoom, seed: 6, said: [], answers: [(200, envelope(link)), (200, envelope(hello))]),
        Wire(greeting: true, room: .neonLounge, visit: .returning, seed: 6, said: [], answers: [(429, "{\"error\":\"slow down\"}")]),
    ]
    let malformed = ["not json", "{}", "{\"choices\": []}", "{\"choices\": [{}]}", "{\"choices\": [{\"message\": {}}]}",
                     "{\"choices\": [{\"message\": {\"content\": null}}]}", "{\"choices\": [{\"message\": {\"content\": 5}}]}",
                     "{\"choices\": [1]}", "{\"choices\": {\"message\": {\"content\": \"x\"}}}", "[]", "",
                     "{\"choices\": [{\"message\": {\"content\": \"x\"}}, 1]}",
                     "{\"choices\": [{\"message\": {\"content\": \"" + okBody.replacingOccurrences(of: "\"", with: "\\\"") + "\"}, \"finish_reason\": null}]}",
                     "{\"choices\": [{\"message\": {\"content\": \"" + okBody.replacingOccurrences(of: "\"", with: "\\\"") + "\"}, \"finish_reason\": \"length\"}]}",
                     "{\"choices\": [{\"message\": {\"content\": \"" + okBody.replacingOccurrences(of: "\"", with: "\\\"") + "\"}, \"finish_reason\": 1}]}",
                     "{\"choices\": [{\"message\": {\"content\": \"" + okBody.replacingOccurrences(of: "\"", with: "\\\"") + "\"},}],}",
                     "{\"choices\": [{\"message\": {\"content\": \"" + okBody.replacingOccurrences(of: "\"", with: "\\\"") + "\"}}], \"usage\": {\"x\": 1}}"]
    for m in malformed { wires.append(Wire(greeting: false, room: .boardwalk, visit: .newRoom, seed: 11, said: ask, answers: [(200, m)])) }

    for (id, w) in wires.enumerated() {
        var h = Haggle(room: w.room, seed: w.seed, visit: w.visit)
        for line in w.said { h.say(line) }
        g.line("wire", i(id), w.greeting ? "greeting" : "reply", roomName(w.room), visitName(w.visit), u64(w.seed), w.said.isEmpty ? "-" : w.said.map(hex).joined(separator: ","))
        for (k, a) in w.answers.enumerated() { g.line("answer", i(id), i(k), a.0.map(String.init) ?? "net", hex(a.1)) }
        WireScript.shared.answers = w.answers
        WireScript.shared.sent = []
        let now = h
        let result = w.greeting ? blocking { try await client.greeting(in: now) } : blocking { try await client.guardedReply(in: now) }
        for (k, data) in WireScript.shared.sent.enumerated() {
            let obj = try! JSONSerialization.jsonObject(with: data) as! [String: Any]
            let msgs = (obj["messages"] as! [[String: String]]).map { ChatMessage(ChatMessage.Role(rawValue: $0["role"]!)!, $0["content"]!) }
            let format = (obj["response_format"] as? [String: String])?["type"] ?? "-"
            let last = msgs.last!
            g.line("sent", i(id), i(k), obj["model"] as! String, i(obj["max_tokens"] as! Int), f64(obj["temperature"] as! Double), format,
                   digestMessages(msgs), roleName(last.role), hex(last.content))
        }
        switch result {
        case .success(let r): g.line(["result", i(id), "ok"] + replyTokens(r))
        case .failure(let e):
            let kind: String
            switch e {
            case DeepSeek.Failure.http(let code, _): kind = "http" + String(code)
            case DeepSeek.Failure.truncated: kind = "truncated"
            case DeepSeek.Failure.malformed: kind = "malformed"
            case DeepSeek.Failure.unreadableReply: kind = "unreadable"
            case DeepSeek.Failure.noKey: kind = "nokey"
            // JSONSerialization refused the body: not JSON at all.
            case let ns as NSError where ns.domain == NSCocoaErrorDomain: kind = "badjson"
            default: kind = "network"
            }
            // A URLError's description names its task (a fresh UUID): only DeepSeek's own are kept.
            let detail = e is DeepSeek.Failure ? String(describing: e) : kind
            g.line("result", i(id), "fail", kind, hex(detail))
        }
    }
}
