import Foundation
import GoldenSupport
@testable import SkeeCore

// Owned by the meta piece: Guide, Walkthrough, Tip, and the save formats
// (Wallet's decoder for old saves, the run file of seed + actions, tips seen).
// Text travels as UTF-8 hex, since a page holds spaces, quotes and newlines.

func hex(_ s: String) -> String {
    s.isEmpty ? "-" : s.utf8.map { String(format: "%02x", $0) }.joined()
}

var g = GoldenFile(module: "Meta")

// ---- Guide ----
let allTips = Tip.allCases
func tipsToken(_ s: Set<Tip>) -> String {
    let names = allTips.filter { s.contains($0) }.map(\.rawValue)
    return names.isEmpty ? "-" : names.joined(separator: ",")
}
g.line("tiporder", allTips.map(\.rawValue).joined(separator: ","))
for (ti, topic) in Guide.all.enumerated() {
    g.line("topic", i(ti), hex(topic.title), tipsToken(topic.unlocks), i(topic.pages.count))
    for (pi, page) in topic.pages.enumerated() {
        g.line("page", i(ti), i(pi), hex(page))
    }
}
var seens: [Set<Tip>] = [[], Set(allTips)]
seens += allTips.map { [$0] }
seens += [[.combo, .hotSpot], [.bets, .balls], [.gameOver, .jackpot], [.charm, .boss, .fever]]
for seen in seens {
    let titles = Guide.all.map(\.title)
    let got = Guide.topics(seen: seen).map { t in String(titles.firstIndex(of: t.title)!) }
    g.line("topics", tipsToken(seen), got.joined(separator: ","))
}

// ---- Coach cards ----
func cardTokens(_ c: CoachCard) -> [String] { [hex(c.title), hex(c.body), b(c.needsTap), b(c.high)] }
for step in WalkthroughStep.allCases {
    for foul in [false, true] {
        var w = Walkthrough(step: step)
        w.lastWasFoul = foul
        g.line(["card", i(step.rawValue), b(foul)] + cardTokens(w.card))
    }
}
for tip in Tip.allCases {
    g.line(["tipcard", tip.rawValue, b(tip.canWait)] + cardTokens(tip.card))
}
g.line("practice", i(Walkthrough.practiceTarget), i(Tip.gap))
for room in Room.allCases {
    let s = practiceRun(room: room)
    g.line("practicerun", room.rawValue, u64(s.seed), i(s.round.target), i(s.tickets), s.round.kind.rawValue, i(s.ante))
}

// ---- Walkthrough transitions ----
let shotResult = simulateShot(Launch(power: 0.5, aim: 0), on: .standard)
let frame = scoreFrame([], context: ScoringContext())
let events: [(String, GameEvent)] = [
    ("pulled", .pulled(Pull(stops: [0, 0, 0], bet: .one))),
    ("freeGamesWon", .freeGamesWon(3)),
    ("jackpot", .jackpot(.mini)),
    ("shot", .shot(shotResult, BallRecord(hole: .ring30, symbol: .bell, chips: 30))),
    ("shotHot", .shot(shotResult, BallRecord(hole: .ring30, symbol: .bell, chips: 30, hot: true))),
    ("shotSlot", .shot(shotResult, BallRecord(hole: .ring30, symbol: .bell, chips: 30, slotHits: 1))),
    ("shotBoth", .shot(shotResult, BallRecord(hole: .ring30, symbol: .bell, chips: 30, slotHits: 2, hot: true))),
    ("fouled", .fouled),
    ("frameScored", .frameScored(frame)),
    ("feverLit", .feverLit),
    ("roundCleared", .roundCleared(score: 70, target: 60, payout: Payout(base: 3, overkill: 0, interest: 0))),
    ("roundFailed", .roundFailed(score: 0, target: 60)),
    ("counterOpened", .counterOpened),
    ("boughtCharm", .bought(.charm(.multBall))),
    ("boughtPowerUp", .bought(.powerUp(.hold))),
    ("boughtStamp", .bought(.stamp(.cherry))),
    ("boughtGild", .bought(.gild)),
    ("boughtPurge", .bought(.purge)),
    ("sold", .sold(.luckyPenny)),
    ("rerolled", .rerolled),
    ("armed", .armed(.feather)),
    ("ballChosen", .ballChosen(.comet)),
    ("roundStartedWarmup", .roundStarted(.warmup, target: 9)),
    ("roundStartedFeature", .roundStarted(.feature, target: 9)),
    ("roundStartedBoss", .roundStarted(.boss, target: 9)),
    ("anteStarted", .anteStarted(2, boss: .miser)),
    ("runWon", .runWon),
]
func walkToken(_ w: Walkthrough) -> [String] {
    [i(w.step.rawValue), b(w.finished), b(w.lastWasFoul), b(w.pulledAhead)]
}
func startState(_ step: WalkthroughStep, foul: Bool, ahead: Bool, finished: Bool) -> Walkthrough {
    var w = Walkthrough(step: step)
    w.lastWasFoul = foul
    w.pulledAhead = ahead
    if finished { w.skip() }
    return w
}
for step in WalkthroughStep.allCases {
    for foul in [false, true] {
        for ahead in [false, true] {
            for finished in [false, true] {
                let w0 = startState(step, foul: foul, ahead: ahead, finished: finished)
                for (name, e) in events {
                    var w = w0
                    w.observe([e])
                    g.line(["walk"] + walkToken(w0) + [name] + walkToken(w))
                }
                var t = w0
                t.gotIt()
                g.line(["walk"] + walkToken(w0) + ["gotIt"] + walkToken(t))
                var k = w0
                k.skip()
                g.line(["walk"] + walkToken(w0) + ["skip"] + walkToken(k))
            }
        }
    }
}
// A few event lists, to pin the in-order fold.
let lists: [[String]] = [
    ["fouled", "fouled", "fouled", "frameScored"],
    ["frameScored", "pulled"],
    ["pulled", "pulled"],
    ["shot", "shot", "frameScored", "pulled"],
    ["counterOpened", "roundStartedWarmup"],
    ["roundCleared", "counterOpened", "roundStartedFeature"],
    ["fouled", "shot"],
    ["shot", "fouled", "frameScored"],
]
let byName = Dictionary(uniqueKeysWithValues: events)
for step in WalkthroughStep.allCases {
    for names in lists {
        let w0 = Walkthrough(step: step)
        var w = w0
        w.observe(names.map { byName[$0]! })
        g.line(["walks"] + walkToken(w0) + [names.joined(separator: ",")] + walkToken(w))
    }
}

// ---- Tips ----
func game(_ kind: RoundKind, ante: Int) -> RunState {
    var s = practiceRun()
    s.round.kind = kind
    s.ante = ante
    return s
}
let games: [(String, RunState)] = [
    ("warmup1", game(.warmup, ante: 1)), ("feature1", game(.feature, ante: 1)),
    ("boss1", game(.boss, ante: 1)), ("warmup2", game(.warmup, ante: 2)),
]
let tipSeens: [Set<Tip>] = [[], [.gameOver], [.bets], [.combo, .hotSpot], [.fever], Set(allTips), Set(allTips).subtracting([.jackpot])]
let sinces: [(String, Int)] = [("0", 0), ("5", 5), ("6", 6), ("max", .max)]
func tipToken(_ t: Tip?) -> String { t?.rawValue ?? "-" }
for (gname, s) in games {
    for seen in tipSeens {
        for (sname, since) in sinces {
            for (name, e) in events {
                g.line("tip", gname, tipsToken(seen), sname, name, tipToken(Tip.next(after: [e], in: s, seen: seen, sinceLast: since)))
            }
            for names in [["feverLit", "roundFailed"], ["shotSlot", "boughtCharm"], ["frameScored", "roundStartedFeature"], ["shot", "pulled", "jackpot"]] {
                g.line("tips", gname, tipsToken(seen), sname, names.joined(separator: ","),
                       tipToken(Tip.next(after: names.map { byName[$0]! }, in: s, seen: seen, sinceLast: since)))
            }
        }
    }
}

// ---- Wallet: what Swift's decoder makes of a saved string ----
func walletTokens(_ w: Wallet) -> [String] {
    let owned = w.owned.map(\.rawValue).joined(separator: ",")
    let meters = JackpotTier.allCases.map { String(w.progressive.amount($0)) }.joined(separator: ",")
    let rooms = Room.allCases.filter { w.rooms.contains($0) }.map(\.rawValue).joined(separator: ",")
    let comps = Room.allCases.map { r -> String in
        guard let c = w.comps[r] else { return "-" }
        return "\(c.room.rawValue):\(c.nights):\(c.tickets):\(c.credit)"
    }.joined(separator: ",")
    return [i(w.balance), i(w.lifetime), owned.isEmpty ? "-" : owned, meters, rooms.isEmpty ? "-" : rooms, w.room.rawValue, comps, i(w.gamesSinceHost), i(w.hostVisits)]
}
@MainActor func walletRow(_ label: String, _ json: String) {
    if let w = try? JSONDecoder().decode(Wallet.self, from: Data(json.utf8)) {
        g.line(["wallet", label, hex(json), "ok"] + walletTokens(w))
    } else {
        g.line(["wallet", label, hex(json), "error"])
    }
}
let enc = JSONEncoder()
enc.outputFormatting = [.sortedKeys]
var rich = Wallet(balance: 1234, lifetime: 98765, owned: [.kazoo, .sticker, .diamondCrown])
rich.progressive.feed(.five)
rich.progressive.feed(.three)
rich.rooms = [.boardwalk, .neonLounge, .penthouse]
rich.room = .neonLounge
rich.comps = [.neonLounge: Comp(room: .neonLounge, nights: 2, tickets: 1, credit: 0), .boardwalk: Comp(room: .boardwalk, nights: 1, tickets: 0, credit: 60)]
rich.gamesSinceHost = 2
rich.hostVisits = 5
var lone = Wallet()
lone.credit(7)
lone.gamePlayed()
for (label, w) in [("default", Wallet()), ("rich", rich), ("lone", lone)] {
    walletRow(label, String(decoding: try enc.encode(w), as: UTF8.self))
}
let hand: [(String, String)] = [
    ("oldest", #"{"balance":5,"lifetime":9,"owned":["kazoo"]}"#),
    ("withProgressive", #"{"balance":5,"lifetime":9,"owned":[],"progressive":{"meters":["mini",77,"grand",3000]}}"#),
    ("withRooms", #"{"balance":0,"lifetime":4000,"owned":[],"rooms":["neonLounge"]}"#),
    ("withRoom", #"{"balance":0,"lifetime":0,"owned":[],"rooms":["boardwalk","highRoller"],"room":"highRoller"}"#),
    ("withComps", #"{"balance":1,"lifetime":2,"owned":[],"comps":["boardwalk",{"room":"boardwalk","nights":3,"tickets":2,"credit":0}]}"#),
    ("withHost", #"{"balance":1,"lifetime":2,"owned":[],"gamesSinceHost":3}"#),
    ("withVisits", #"{"balance":1,"lifetime":2,"owned":[],"hostVisits":1}"#),
    ("nulls", #"{"balance":1,"lifetime":2,"owned":[],"progressive":null,"rooms":null,"room":null,"comps":null,"gamesSinceHost":null,"hostVisits":null}"#),
    ("extraKeys", #"{"balance":1,"lifetime":2,"owned":[],"future":[1,2,{"x":null}]}"#),
    ("spaces", " {\n \"balance\" : 1 , \"lifetime\" : 2 , \"owned\" : [ ] } \n"),
    ("emptyMeters", #"{"balance":1,"lifetime":2,"owned":[],"progressive":{"meters":[]}}"#),
    ("dupRooms", #"{"balance":1,"lifetime":2,"owned":[],"rooms":["penthouse","penthouse"]}"#),
    ("emptyRooms", #"{"balance":1,"lifetime":2,"owned":[],"rooms":[]}"#),
    ("negative", #"{"balance":-5,"lifetime":-9,"owned":[],"gamesSinceHost":-1}"#),
    ("wholeFloat", #"{"balance":5.0,"lifetime":9,"owned":[]}"#),
    ("exponent", #"{"balance":1e3,"lifetime":9,"owned":[]}"#),
    ("big", #"{"balance":4503599627370496,"lifetime":9,"owned":[]}"#),
    ("dupOwned", #"{"balance":5,"lifetime":9,"owned":["kazoo","kazoo"]}"#),
    // Swift refuses all of these, so the app starts with a fresh Wallet().
    ("empty", ""),
    ("truncated", #"{"balance":5,"lifetime":"#),
    ("array", "[]"),
    ("number", "5"),
    ("noBalance", #"{"lifetime":9,"owned":[]}"#),
    ("noLifetime", #"{"balance":9,"owned":[]}"#),
    ("noOwned", #"{"balance":9,"lifetime":9}"#),
    ("nullBalance", #"{"balance":null,"lifetime":9,"owned":[]}"#),
    ("stringBalance", #"{"balance":"5","lifetime":9,"owned":[]}"#),
    ("fraction", #"{"balance":5.5,"lifetime":9,"owned":[]}"#),
    ("unknownPrize", #"{"balance":5,"lifetime":9,"owned":["spaceship"]}"#),
    ("unknownRoom", #"{"balance":5,"lifetime":9,"owned":[],"room":"moon"}"#),
    ("unknownInRooms", #"{"balance":5,"lifetime":9,"owned":[],"rooms":["boardwalk","moon"]}"#),
    ("metersObject", #"{"balance":5,"lifetime":9,"owned":[],"progressive":{"meters":{"mini":5}}}"#),
    ("metersOdd", #"{"balance":5,"lifetime":9,"owned":[],"progressive":{"meters":["mini"]}}"#),
    ("metersUnknown", #"{"balance":5,"lifetime":9,"owned":[],"progressive":{"meters":["tiny",5]}}"#),
    ("noMeters", #"{"balance":5,"lifetime":9,"owned":[],"progressive":{}}"#),
    ("compMissingField", #"{"balance":5,"lifetime":9,"owned":[],"comps":["boardwalk",{"room":"boardwalk","nights":3}]}"#),
    ("compsObject", #"{"balance":5,"lifetime":9,"owned":[],"comps":{"boardwalk":{"room":"boardwalk","nights":3,"tickets":2,"credit":0}}}"#),
    ("trailing", #"{"balance":5,"lifetime":9,"owned":[]} x"#),
    ("ownedString", #"{"balance":5,"lifetime":9,"owned":"kazoo"}"#),
    ("boolHost", #"{"balance":5,"lifetime":9,"owned":[],"hostVisits":true}"#),
]
for (label, json) in hand { walletRow(label, json) }

// ---- The run file: seed + actions, as GameModel's RunStore writes it ----
struct File: Codable { var seed: UInt64; var room: Room?; var extraTickets: Int?; var actions: [Action] }

func launchToken(_ l: Launch) -> String {
    [l.power, l.speed, l.from, l.aim, l.start, l.fold, l.spin, l.skid].map(f64).joined(separator: ":")
}
func actionToken(_ a: Action) -> String {
    switch a {
    case .pull(let bet): "pull:\(bet.rawValue)"
    case .throwBall(let l): "throw:" + launchToken(l)
    case .foul: "foul"
    case .chooseBall(let k): "choose:\(k.rawValue)"
    case .arm(let n): "arm:\(n)"
    case .buy(let n, let h): "buy:\(n):\(h?.rawValue ?? "-")"
    case .reroll: "reroll"
    case .sell(let n): "sell:\(n)"
    case .leaveCounter: "leave"
    }
}
func phaseToken(_ p: Phase) -> String {
    switch p {
    case .throwing: "throwing"
    case .prizeCounter: "counter"
    case .lost: "lost"
    case .won: "won"
    }
}
@MainActor func runRow(_ label: String, _ json: String) {
    guard let f = try? JSONDecoder().decode(File.self, from: Data(json.utf8)) else {
        g.line(["runfile", label, hex(json), "error"])
        return
    }
    let acts = f.actions.map(actionToken).joined(separator: ",")
    g.line(["runfile", label, hex(json), "ok", u64(f.seed), f.room?.rawValue ?? "-", f.extraTickets.map(String.init) ?? "-", acts.isEmpty ? "-" : acts])
    // Replay as GameModel.init does: stop at the first refused action.
    let room = f.room ?? .boardwalk
    var s = newRun(seed: f.seed, room: room, extraTickets: f.extraTickets ?? 0)
    var kept = 0
    for a in f.actions {
        guard case .success(let step) = apply(a, to: s) else { break }
        s = step.state
        kept += 1
    }
    g.line("replay", label, i(kept), phaseToken(s.phase), i(s.ante), i(s.tickets), i(s.round.score), i(s.round.frames.count), i(s.round.currentBalls.count), i(s.stats.points), i(s.stats.balls), s.ball.rawValue)
}
let shots: [Action] = [
    .throwBall(Launch(power: 0.62, aim: 0)),
    .throwBall(Launch(speed: 3.3, from: 0.4, aim: 0.1, start: -0.2, fold: 0.3, spin: 0.25, skid: 0.05)),
    .throwBall(Launch(power: 0.7, aim: -0.3, start: 0.5)),
]
let files: [(String, File)] = [
    ("fresh", File(seed: 1_700_000_000, room: .boardwalk, extraTickets: 0, actions: [])),
    ("oneFrame", File(seed: 2024, room: .boardwalk, extraTickets: 0, actions: [.pull(.one)] + shots)),
    ("mixed", File(seed: 99, room: .neonLounge, extraTickets: 2, actions: [.chooseBall(.marshmallow), .pull(.one), shots[0], .foul, shots[2], .pull(.three)] + shots)),
    ("refused", File(seed: 7, room: .boardwalk, extraTickets: 1, actions: [.pull(.one), .pull(.one), shots[0], .reroll, .sell(0), .arm(3), .buy(1, target: .ring40), .leaveCounter])),
    ("allKinds", File(seed: 5, room: .penthouse, extraTickets: 0, actions: [.buy(0, target: nil), .buy(2, target: .pocketLeft), .reroll, .sell(1), .arm(0), .leaveCounter, .chooseBall(.comet), .pull(.five), .foul])),
    ("bigSeed", File(seed: 18_446_744_073_709_551_615, room: .highRoller, extraTickets: 3, actions: [.pull(.one)])),
    ("noRoom", File(seed: 42, room: nil, extraTickets: nil, actions: [.pull(.one), shots[0]])),
]
for (label, f) in files { runRow(label, String(decoding: try enc.encode(f), as: UTF8.self)) }
// A full game, by the walkthrough bot's hand, so replay reaches the counter.
var full: [Action] = []
do {
    var s = newRun(seed: 31337)
    var n = 0
    while n < 60 {
        n += 1
        let a: Action
        switch s.phase {
        case .prizeCounter: a = .leaveCounter
        case .lost, .won: n = 999; continue
        case .throwing: a = s.round.pull == nil ? .pull(.one) : .throwBall(Launch(power: 0.55 + Double(n % 5) * 0.05, aim: Double(n % 3 - 1) * 0.2))
        }
        guard case .success(let step) = apply(a, to: s) else { break }
        s = step.state
        full.append(a)
    }
}
runRow("long", String(decoding: try enc.encode(File(seed: 31337, room: .boardwalk, extraTickets: 0, actions: full)), as: UTF8.self))
let handRuns: [(String, String)] = [
    ("beforeRooms", #"{"seed":2024,"actions":[{"pull":{"_0":1}},{"throwBall":{"_0":{"power":0.62,"aim":0}}}]}"#),
    ("beforeThumbs", #"{"seed":2024,"room":"boardwalk","extraTickets":0,"actions":[{"pull":{"_0":1}},{"throwBall":{"_0":{"power":0.62,"aim":0.1,"start":0.3,"fold":0.2,"spin":0.4,"skid":0.6,"speed":null}}}]}"#),
    ("powerOnly", #"{"seed":2024,"actions":[{"pull":{"_0":3}},{"throwBall":{"_0":{"power":2,"aim":-5}}}]}"#),
    ("speedNoFrom", #"{"seed":2024,"actions":[{"pull":{"_0":1}},{"throwBall":{"_0":{"power":0,"aim":0,"speed":3.1}}}]}"#),
    ("nullRoom", #"{"seed":2024,"room":null,"extraTickets":null,"actions":[]}"#),
    ("buyNull", #"{"seed":2024,"actions":[{"buy":{"_0":1,"target":null}}]}"#),
    ("extraKeys", #"{"seed":2024,"actions":[],"version":3}"#),
    ("empty", ""),
    ("noSeed", #"{"actions":[]}"#),
    ("noActions", #"{"seed":1}"#),
    ("negativeSeed", #"{"seed":-1,"actions":[]}"#),
    ("floatSeed", #"{"seed":1.5,"actions":[]}"#),
    ("unknownAction", #"{"seed":1,"actions":[{"jump":{}}]}"#),
    ("badBet", #"{"seed":1,"actions":[{"pull":{"_0":2}}]}"#),
    ("noPower", #"{"seed":1,"actions":[{"throwBall":{"_0":{"aim":0}}}]}"#),
    ("twoKeys", #"{"seed":1,"actions":[{"foul":{},"reroll":{}}]}"#),
    ("badHole", #"{"seed":1,"actions":[{"buy":{"_0":1,"target":"ring60"}}]}"#),
    ("badRoom", #"{"seed":1,"room":"moon","actions":[]}"#),
    ("truncated", #"{"seed":1,"actions":[{"pull""#),
]
for (label, json) in handRuns { runRow(label, json) }

// ---- Tips seen, as TipStore keeps them: unknown names are dropped ----
for names in [[String](), ["combo"], ["fever", "combo", "fever"], ["combo", "teleport", "gameOver"], Tip.allCases.map(\.rawValue)] {
    let seen = Set(names.compactMap(Tip.init))
    g.line("tipstore", names.isEmpty ? "-" : names.joined(separator: ","), tipsToken(seen))
}

try g.write()
