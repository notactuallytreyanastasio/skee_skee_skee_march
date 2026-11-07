import Foundation
import GoldenSupport
@testable import SkeeCore

// ---- Host and Haggle ----
// Rows:
//   hostof <room> <name> <manner>
//   haggle <room> <visit> <seed> <budget> <patience> <hello> <flavor>
//   seq <id> <room> <visit> <seed>                       a scripted haggle
//   do <id> <k> say <text>                               then its state row
//   do <id> <k> hear <say> <n> <t> <c> <mood> <walk> <offTopic: 1 0 ->
//   do <id> <k> greet <say> <n> <t> <c>
//   do <id> <k> deflect <concern>                        hear(deflection(screen(last line)))
//   do <id> <k> accept
//   state <id> <k> <n t c> <patience> <status> <lines> <wantsModel> <askedForPerks> <final n t c> <last speaker> <last text> <messages digest>
//   msg <id> <k> <i> <role> <content>                    every message, at some steps
//   greetmsgs <id> <digest> <ask>
//   standin <line> <isLast> <text>
//   accepts <line> <say> <accepted>
//   json <say> <n> <t> <c> <mood> <walk> <json>
//   deflection <room> <visit> <concern> <turn> <say> <n t c> <mood> <walk> <offTopic>

func roomName(_ r: Room) -> String { r.rawValue }
func visitName(_ v: Haggle.Visit) -> String { v.rawValue }
func statusName(_ s: Haggle.Status) -> String { s.rawValue }
func speakerName(_ s: HaggleLine.Speaker) -> String { s.rawValue }
func roleName(_ r: ChatMessage.Role) -> String { r.rawValue }

/// Two small polynomial hashes and the byte length: enough to see any change
/// in a message, and cheap to recompute in March with exact Ints.
func digest(_ s: String) -> String {
    var h1 = 0, h2 = 0, n = 0
    for b in s.utf8 { h1 = (h1 * 257 + Int(b)) % 999_983; h2 = (h2 * 263 + Int(b)) % 1_000_037; n += 1 }
    return "\(n).\(h1).\(h2)"
}
func digestMessages(_ ms: [ChatMessage]) -> String {
    ms.map { "\(roleName($0.role).prefix(1))\(digest($0.content))" }.joined(separator: ",")
}
func terms(_ c: Comp) -> [String] { [i(c.nights), i(c.tickets), i(c.credit)] }
func offTok(_ o: Bool?) -> String { o.map { $0 ? "1" : "0" } ?? "-" }

enum Step {
    case say(String)
    case hear(HostReply)
    case greet(HostReply)
    case deflect
    case accept
}

func R(_ say: String, _ n: Int, _ t: Int, _ c: Int, mood: Int = 0, walk: Bool = false, off: Bool? = nil) -> HostReply {
    HostReply(say: say, offer: .init(nights: n, tickets: t, credit: c), mood: mood, walk: walk, offTopic: off)
}

nonisolated(unsafe) var promptsWritten = Set<String>()

struct Script { let room: Room; let visit: Haggle.Visit; let seed: UInt64; let steps: [Step]; let full: Bool }

func play(_ g: inout GoldenFile, _ id: Int, _ sc: Script) {
    var h = Haggle(room: sc.room, seed: sc.seed, visit: sc.visit)
    g.line("seq", i(id), roomName(sc.room), visitName(sc.visit), u64(sc.seed))
    func record(_ k: Int) {
        let last = h.lines.last!
        g.line(["state", i(id), i(k)] + terms(h.offer) + [i(h.patience), statusName(h.status), i(h.lines.count), b(h.wantsModel), b(h.askedForPerks)]
               + terms(h.final) + [speakerName(last.speaker), hex(last.text), digestMessages(h.messages)])
        if sc.full || (k == 0 && id < 60) {
            for (mi, m) in h.messages.enumerated() {
                // A system prompt is written once, as a `prompt` row, and named by its digest.
                if m.role == .system {
                    let d = digest(m.content)
                    if !promptsWritten.contains(d) { promptsWritten.insert(d); g.line("prompt", d, hex(m.content)) }
                    g.line("msg", i(id), i(k), i(mi), roleName(m.role), d)
                } else {
                    g.line("msg", i(id), i(k), i(mi), roleName(m.role), hex(m.content))
                }
            }
        }
    }
    record(0)
    g.line("greetmsgs", i(id), digestMessages(h.greetingMessages), hex(h.greetingMessages[1].content))
    for (k, st) in sc.steps.enumerated() {
        switch st {
        case .say(let t): g.line("do", i(id), i(k + 1), "say", hex(t)); h.say(t)
        case .hear(let r):
            g.line("do", i(id), i(k + 1), "hear", hex(r.say), i(r.offer.nights), i(r.offer.tickets), i(r.offer.credit), i(r.mood), b(r.walk), offTok(r.offTopic))
            h.hear(r)
        case .greet(let r):
            g.line("do", i(id), i(k + 1), "greet", hex(r.say), i(r.offer.nights), i(r.offer.tickets), i(r.offer.credit))
            h.greet(r)
        case .deflect:
            let said = h.lines.last(where: { $0.speaker == .player })?.text ?? ""
            // A line the guard lets through has no deflection: nothing happens.
            let c = HostGuard.screen(said)
            g.line("do", i(id), i(k + 1), "deflect", concernName(c))
            let turn = h.lines.filter { $0.speaker == .player }.count
            if let c { h.hear(h.deflection(c, Phrasebook.of(sc.room), turn)) }
        case .accept: g.line("do", i(id), i(k + 1), "accept"); h.accept()
        }
        record(k + 1)
    }
}

func haggleRows(_ g: inout GoldenFile) {
    for r in Room.allCases { let h = Host.of(r); g.line("hostof", roomName(r), hex(h.name), hex(h.manner)) }
    let visits: [Haggle.Visit] = [.arrival, .newRoom, .returning]
    var seeds: [UInt64] = Array(0..<48)
    seeds += [0x40575, 0xFFFF_FFFF_FFFF_FFFF, 0x8000_0000_0000_0000, 1_700_000_000, 1_762_500_000, 0xDEAD_BEEF_CAFE_F00D, 0x1_0000_0000]
    for r in Room.allCases { for v in visits { for sd in seeds {
        let h = Haggle(room: r, seed: sd, visit: v)
        g.line("haggle", roomName(r), visitName(v), u64(sd), i(h.budget), i(h.patience), hex(h.lines[0].text), i(Int(sd % 16)))
    } } }

    var scripts: [Script] = []
    func push(_ t: (Int, Int, Int), mood: Int = 0) -> [Step] { [.say("more"), .hear(R("...", t.0, t.1, t.2, mood: mood))] }
    // The Swift tests, step for step.
    scripts.append(Script(room: .neonLounge, visit: .newRoom, seed: 1, steps: [.say("two nights?"), .hear(R("Fine.", 2, 1, 100, mood: 1)), .accept], full: true))
    scripts.append(Script(room: .highRoller, visit: .newRoom, seed: 1, steps: [.say("two nights"), .hear(R("Two.", 2, 0, 0)), .say("MORE"), .hear(R("Goodbye.", 2, 0, 0, walk: true))], full: true))
    scripts.append(Script(room: .penthouse, visit: .newRoom, seed: 9, steps: push((99, 99, 99_999), mood: 1), full: true))
    scripts.append(Script(room: .neonLounge, visit: .newRoom, seed: 2, steps: push((2, 1, 0), mood: 1) + push((1, 0, 0), mood: 1), full: false))
    scripts.append(Script(room: .neonLounge, visit: .newRoom, seed: 2, steps: push((1, 0, 0), mood: 1) + push((1, 0, 0)) + push((1, 0, 0), mood: -5), full: false))
    scripts.append(Script(room: .neonLounge, visit: .newRoom, seed: 2, steps: Array(repeating: push((1, 0, 0), mood: -1), count: 5).flatMap { $0 } + [.say("wait!")], full: true))
    scripts.append(Script(room: .highRoller, visit: .newRoom, seed: 4, steps: push((2, 0, 0)), full: true))
    scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: Array(repeating: [Step.say("give me everything"), .hear(R("No.", 1, 0, 0, mood: -1, walk: true))], count: 8).flatMap { $0 }, full: false))
    do {
        var h = Haggle(room: .boardwalk, seed: 3, visit: .arrival)
        var steps: [Step] = []
        for _ in 0..<3 {
            steps.append(.say("one more night, please?")); h.say("one more night, please?")
            let r = R("Welcome!", h.offer.nights, h.offer.tickets, h.offer.credit, mood: 1)
            steps.append(.hear(r)); h.hear(r)
        }
        scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: steps, full: false))
    }
    scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: [.say("give me everything now"), .hear(R("Easy there.", 1, 0, 0, mood: -1))], full: false))
    scripts.append(Script(room: .boardwalk, visit: .returning, seed: 3, steps: [.say("hello"), .hear(R("Hi.", 1, 0, 0))], full: false))
    scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: [.say("please"), .hear(R("Sure.", 2, 1, 0, mood: 1)), .accept], full: false))
    for line in ["my number is 555-123-4567", "I want to kill myself"] {
        scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: [.say(line), .hear(R("Let's move on.", 1, 0, 0, off: true)), .say("anyway, one more night?")], full: true))
        scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: [.say(line), .deflect, .say("anyway, one more night?")], full: true))
    }
    scripts.append(Script(room: .neonLounge, visit: .newRoom, seed: 3, steps: ["how's your night going?", "my grandson plays too", "do you like pie?", "tell me a story", "nice jacket", "cold out there"].flatMap { [Step.say($0), .hear(R("Ha! Tell me more.", 1, 0, 0, off: true))] }, full: false))
    scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: ["What's your favorite pie?", "My grandson loves this place.", "who should I vote for?"].flatMap { [Step.say($0), .hear(R("Lemon meringue!", 1, 0, 0, mood: 1))] } + [.say("how about one more night?"), .hear(R("Fine, two.", 1, 0, 0, mood: 1))], full: false))
    scripts.append(Script(room: .neonLounge, visit: .newRoom, seed: 12, steps: ["Tell me a joke", "What's your favorite pie?", "How's your evening?", "My knee hurts", "Lovely weather", "Is that a tuba?"].flatMap { [Step.say($0), .hear(R("Ha!", 1, 0, 0))] }, full: false))
    scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: [.greet(R("A seagull ate my hot dog. One free night?", 3, 2, 500)), .greet(R("Again?", 1, 0, 0))], full: true))
    scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: [.say("what about the election"), .deflect, .say("nice weather"), .hear(R("Back to the deal.", 3, 2, 500, off: true))], full: false))
    scripts.append(Script(room: .penthouse, visit: .newRoom, seed: 3, steps: [.say("I want to end my life"), .deflect], full: true))
    scripts.append(Script(room: .boardwalk, visit: .arrival, seed: 3, steps: Array(repeating: [Step.say("one more?"), .hear(R("Mm.", 1, 0, 0))], count: 26).flatMap { $0 }, full: false))
    // A deflection that walks the host: adult at the last of their patience.
    scripts.append(Script(room: .highRoller, visit: .returning, seed: 5, steps: push((2, 0, 0), mood: -1) + [.say("send nudes"), .deflect, .say("send nudes"), .deflect], full: true))
    // Lines past maxLine, quotes and newlines in what the model sees.
    scripts.append(Script(room: .neonLounge, visit: .returning, seed: 77, steps: [.say(String(repeating: "longer stay ", count: 30)), .hear(R("Say \"please\"\nand \\ mean it.", 2, 1, 50, mood: 1)), .say("e" + s(0x301) + "\"" + s(0x301) + "\r\n tickets"), .hear(R("\"" + s(0x301) + "\r\nok", 2, 2, 0, off: false)), .accept, .say("too late")], full: true))

    // Fuzz: random haggles through the real rules.
    var fz = Fuzz(state: 0x4A66_1E)
    let pool = plainLines + numberLines.prefix(10) + emailLines.prefix(5) + ["more tickets please", "two nights", "100 credit?", "a better deal", "bump it", "add a night", "extra credit", "throw in tickets", "raise it", "stay longer", "more days", "prize money", "cash", "winnings"]
    for _ in 0..<160 {
        let room = fz.pick(Room.allCases), visit = fz.pick(visits)
        let seed = fz.next()
        var steps: [Step] = []
        var h = Haggle(room: room, seed: seed, visit: visit)
        if fz.below(3) == 0 { let r = R("Hello there, friend.", fz.below(4), fz.below(3), fz.below(400)); steps.append(.greet(r)); h.greet(r) }
        let n = 1 + fz.below(14)
        for _ in 0..<n where h.status == .open {
            let line = fz.pick(pool)
            steps.append(.say(line)); h.say(line)
            if HostGuard.screen(h.lines.last!.text) != nil, fz.below(4) != 0 {
                steps.append(.deflect)
                let turn = h.lines.filter { $0.speaker == .player }.count
                h.hear(h.deflection(HostGuard.screen(h.lines.last!.text)!, Phrasebook.of(room), turn))
                continue
            }
            let top = Comp.ceiling(room)
            let r = R(fz.pick(["Fine.", "No.", "Ha!", "Two nights, then.", "One ticket more.", "You charmer."]),
                      fz.below(top.nights + 3) - 1, fz.below(top.tickets + 3) - 1, fz.below(top.credit + 400) - 100,
                      mood: fz.below(7) - 3, walk: fz.below(10) == 0, off: [nil, true, false][fz.below(3)])
            steps.append(.hear(r)); h.hear(r)
        }
        if fz.below(2) == 0 { steps.append(.accept); h.accept() }
        scripts.append(Script(room: room, visit: visit, seed: seed, steps: steps, full: false))
    }
    for (id, sc) in scripts.enumerated() { play(&g, id, sc) }

    // standIn, accepts, json, deflection.
    let lines = plainLines + numberLines + emailLines
    for line in lines { for last in [false, true] {
        let h = Haggle(room: .boardwalk, seed: 3, visit: .arrival)
        g.line("standin", hex(line), b(last), hex(h.standIn(line, isLast: last)))
    } }
    let says = ["Oh dear, chin up, let's play.", "I'm only a game, and you matter more. You can call or text 988 any time.", "988", "19880", "9 8 8",
                "Call 988" + s(0x301) + " now", "Fine, two nights.", "Visit www.example.com", "Call or text 988."]
    for line in ["I want to end my life", "I want to kill myself", "hello", "my number is 555-123-4567", "suicide" + s(0x301), "SUICIDE"] {
        for say in says {
            var h = Haggle(room: .boardwalk, seed: 3, visit: .arrival)
            h.say(line)
            g.line("accepts", hex(line), hex(say), b(h.accepts(R(say, 2, 0, 0))))
        }
    }
    do {
        let h = Haggle(room: .boardwalk, seed: 3, visit: .arrival)
        g.line("accepts", "-", hex("Fine."), b(h.accepts(R("Fine.", 2, 0, 0))))
    }
    for say in ["plain", "quote \" here", "back \\ slash", "new\nline", "crlf\r\nhere", "\"" + s(0x301) + "accented quote", "\\" + s(0x308),
                "tab\tand " + s(0x1F3B0), "", "\n\n", s(0x1FEF) + "varia"] {
        for (mood, walk) in [(0, false), (1, true), (-1, false), (12, false)] {
            g.line("json", hex(say), "2", "1", "100", i(mood), b(walk), hex(Haggle.json(R(say, 2, 1, 100, mood: mood, walk: walk))))
        }
    }
    let concerns: [HostGuard.Concern] = [.crisis, .personalInfo, .adult, .realMoney, .offTopic, .trickery]
    for r in Room.allCases { for v in visits { for c in concerns { for turn in 0..<4 {
        let h = Haggle(room: r, seed: 5, visit: v)
        let d = h.deflection(c, Phrasebook.of(r), turn)
        g.line("deflection", roomName(r), visitName(v), concernName(c), i(turn), hex(d.say), i(d.offer.nights), i(d.offer.tickets), i(d.offer.credit), i(d.mood), b(d.walk), offTok(d.offTopic))
    } } } }
}
