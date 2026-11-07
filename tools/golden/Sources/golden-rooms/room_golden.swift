import GoldenSupport
@testable import SkeeCore

// Every value here comes from running the real SkeeCore. Tokens may not hold a
// space, so text travels with `_` for a space. The March side undoes that.

private func text(_ s: String) -> String {
    precondition(!s.contains("_") && !s.contains("\\") && !s.contains("\""), "unsafe golden text: \(s)")
    return s.replacingOccurrences(of: " ", with: "_")
}

private func opt(_ r: Room?) -> String { r.map(\.rawValue) ?? "-" }

private func csv<T>(_ xs: [T], _ f: (T) -> String) -> String {
    xs.isEmpty ? "-" : xs.map(f).joined(separator: ",")
}

private func tableFields(_ t: Table) -> [(String, Double)] {
    let l = t.lane, h = t.hinge, b = t.board
    return [
        ("lane.length", l.length), ("lane.width", l.width), ("lane.incline", l.incline),
        ("lane.rollingFriction", l.rollingFriction), ("lane.railRestitution", l.railRestitution),
        ("lane.minSpeed", l.minSpeed), ("lane.scoringSpeed", l.scoringSpeed), ("lane.maxSpeed", l.maxSpeed),
        ("lane.knee", l.knee), ("lane.maxAimAngle", l.maxAimAngle), ("lane.hook", l.hook),
        ("lane.skidLoss", l.skidLoss),
        ("hinge.baseAngle", h.baseAngle), ("hinge.foldGain", h.foldGain), ("hinge.carry", h.carry),
        ("board.width", b.width), ("board.height", b.height), ("board.tilt", b.tilt),
        ("board.ringCenter.x", b.ringCenter.x), ("board.ringCenter.y", b.ringCenter.y),
        ("board.centerHoleOffset.x", b.centerHoleOffset.x), ("board.centerHoleOffset.y", b.centerHoleOffset.y),
        ("board.centerHoleRadius", b.centerHoleRadius), ("board.captureSpeed", b.captureSpeed),
        ("board.lipMinFall", b.lipMinFall),
        ("board.ringWalls.0", b.ringWalls[0]), ("board.ringWalls.1", b.ringWalls[1]),
        ("board.ringWalls.2", b.ringWalls[2]), ("board.ringWalls.3", b.ringWalls[3]),
        ("board.pockets.0.x", b.pockets[0].center.x), ("board.pockets.0.y", b.pockets[0].center.y),
        ("board.pockets.0.radius", b.pockets[0].radius),
        ("board.pockets.1.x", b.pockets[1].center.x), ("board.pockets.1.y", b.pockets[1].center.y),
        ("board.pockets.1.radius", b.pockets[1].radius),
        ("board.lipHeight", b.lipHeight), ("board.ballRadius", b.ballRadius), ("board.lipBand", b.lipBand),
        ("board.bounce", b.bounce), ("board.lipBounce", b.lipBounce), ("board.lipKick", b.lipKick),
        ("board.wallRestitution", b.wallRestitution), ("board.backwallRestitution", b.backwallRestitution),
        ("board.rollingFriction", b.rollingFriction), ("board.landingGrip", b.landingGrip),
        ("board.wind.x", b.wind.x), ("board.wind.y", b.wind.y), ("board.ringHoleRadius", b.ringHoleRadius),
        ("gravity", t.gravity), ("dt", t.dt), ("maxDuration", t.maxDuration),
    ]
}

private func emitRooms(_ g: inout GoldenFile) {
    for r in Room.allCases {
        g.line("room", r.rawValue, text(r.name), text(r.blurb), i(r.rank), opt(r.next),
               i(r.compThreshold), f64(r.targetScale))
        let t = r.table
        for (label, value) in tableFields(t) { g.line("table", r.rawValue, label, f64(value)) }
        g.line("tableshape", r.rawValue, i(t.board.ringWalls.count), i(t.board.pockets.count),
               "\(t.board.pockets[0].hole)", "\(t.board.pockets[1].hole)", b(t.board.pocketsNeedFlight))
        let s = r.setup
        for h in BoardSetup.reelHoles {
            g.line("reel", r.rawValue, "\(h)", csv(s.reels[h] ?? []) { "\($0)" })
            g.line("gild", r.rawValue, "\(h)", i(s.gild[h] ?? 0))
        }
        for (n, strip) in r.strips.enumerated() {
            g.line("strip", r.rawValue, i(n), csv(strip) { $0.rawValue })
        }
        g.line("shelf", r.rawValue, csv(r.prizes) { $0.rawValue })
    }
    for (n, strip) in Pull.strips.enumerated() { g.line("basestrip", i(n), csv(strip) { $0.rawValue }) }
}

private func emitPrizes(_ g: inout GoldenFile) {
    for p in Prize.allCases { g.line("prize", p.rawValue, text(p.name), i(p.price), p.room.rawValue) }
}

private func comp(_ c: Comp) -> [String] { [c.room.rawValue, i(c.nights), i(c.tickets), i(c.credit), i(c.value)] }

private func emitComps(_ g: inout GoldenFile) {
    for r in Room.allCases {
        g.line(["opening"] + comp(.opening(r)))
        g.line(["ceiling"] + comp(.ceiling(r)))
        for nights in [-3, 0, 1, 2, 3, 4, 5, 6, 7, 99] {
            for tickets in [-1, 0, 1, 2, 3, 4, 5, 6, 99] {
                for credit in [-50, 0, 1, 299, 300, 600, 900, 1200, 1201, 99_999] {
                    let c = Comp(room: r, nights: nights, tickets: tickets, credit: credit)
                    g.line(["comp"] + comp(c) + comp(c.clamped()))
                }
            }
        }
    }
}

private func emitWinnings(_ g: inout GoldenFile) {
    for points in [-41, -40, -39, -1, 0, 1, 19, 20, 21, 39, 40, 4000, 4019, 123_456, 9_999_999] {
        for rounds in [0, 1, 3, 24] {
            for won in [false, true] {
                var stats = RunStats()
                stats.points = points
                stats.roundsCleared = rounds
                g.line("winnings", i(points), i(rounds), b(won), i(winnings(stats: stats, won: won)))
            }
        }
    }
}

private func emitMeters(_ g: inout GoldenFile) {
    let w = Wallet()
    g.line(["meters"] + JackpotTier.allCases.map { i(w.progressive.amount($0)) })
}

/// The whole wallet, as the March replay must rebuild it.
private func walletTokens(_ w: Wallet) -> [String] {
    [
        i(w.balance), i(w.lifetime), csv(w.owned) { $0.rawValue },
        Room.allCases.map { w.rooms.contains($0) ? "1" : "0" }.joined(), w.room.rawValue,
        Room.allCases.map { r in
            w.comps[r].map { "\($0.room.rawValue):\($0.nights):\($0.tickets):\($0.credit)" } ?? "-"
        }.joined(separator: ","),
        i(w.gamesSinceHost), i(w.hostVisits), opt(w.compDue), i(w.hostInterval), opt(w.hostDue),
    ]
}

/// One step of a scripted wallet: what was done, what it returned, the wallet
/// after. The row carries its arguments, so March replays the same steps.
private func step(_ g: inout GoldenFile, _ name: String, _ args: [String], _ result: String, _ w: Wallet) {
    let padded = args + Array(repeating: "-", count: 6 - args.count)
    g.line(["wallet", name] + padded + [result] + walletTokens(w))
}

private func haggled(_ rng: inout SplitMix64, _ room: Room, _ visit: Haggle.Visit) -> Haggle {
    var h = Haggle(room: room, seed: rng.next(), visit: visit)
    let says = ["more tickets please", "some credit", "more nights", "you stupid crook", "tickets please"]
    let pushes = rng.nextInt(below: 7)
    for _ in 0..<pushes where h.status == .open {
        h.say(says[rng.nextInt(below: says.count)])
        h.hear(h.scriptedReply)
    }
    if rng.nextInt(below: 4) != 0 { h.accept() }
    return h
}

private func emitWallets(_ g: inout GoldenFile) {
    let visits: [Haggle.Visit] = [.arrival, .newRoom, .returning]
    for scenario in 0..<60 as Range<UInt64> {
        var rng = SplitMix64(seed: 0x524F_4F4D + scenario)
        let balance = rng.nextInt(below: 3000)
        let lifetime = balance + rng.nextInt(below: 3000)
        var w = Wallet(balance: balance, lifetime: lifetime)
        step(&g, "new", [i(balance), i(lifetime)], "-", w)
        for _ in 0..<40 {
            switch rng.nextInt(below: 7) {
            case 0:
                let amount = [1, 50, 400, 1500, 5000, 12000][rng.nextInt(below: 6)]
                w.credit(amount)
                step(&g, "credit", [i(amount)], "-", w)
            case 1:
                w.gamePlayed()
                step(&g, "played", [], "-", w)
            case 2:
                let extra = w.checkIn()
                step(&g, "checkin", [], i(extra), w)
            case 3:
                let p = Prize.allCases[rng.nextInt(below: Prize.allCases.count)]
                switch w.buy(p) {
                case .success(let after):
                    w = after
                    step(&g, "buy", [p.rawValue], "ok", w)
                case .failure(let e):
                    step(&g, "buy", [p.rawValue], "\(e)", w)
                }
            case 4:
                let r = Room.allCases[rng.nextInt(below: 4)]
                w.room = r
                step(&g, "goto", [r.rawValue], "-", w)
            case 5:
                let r = Room.allCases[rng.nextInt(below: 4)]
                w.rooms.insert(r)
                step(&g, "own", [r.rawValue], "-", w)
            default:
                let room = w.hostDue ?? Room.allCases[rng.nextInt(below: 4)]
                let visit = visits[rng.nextInt(below: 3)]
                let h = haggled(&rng, room, visit)
                w.close(h)
                // An open haggle changes nothing, so March makes no call.
                let deal = h.final
                step(&g, h.status == .open ? "unsigned" : "close",
                     [deal.room.rawValue, i(deal.nights), i(deal.tickets), i(deal.credit), visit.rawValue, "\(h.status)"],
                     "-", w)
            }
        }
    }
}

func emitRoomGoldens(_ g: inout GoldenFile) {
    emitRooms(&g)
    emitPrizes(&g)
    emitComps(&g)
    emitWinnings(&g)
    emitMeters(&g)
    emitWallets(&g)
}
