import GoldenSupport
@testable import SkeeCore

// A 32-bit digest of a run, mirrored word for word by test/support/run_digest.march.
// Enums go in as their allCases index. Optionals and lists carry a tag or a
// count, so two different shapes cannot feed the same words.
struct Digest {
    private(set) var h: UInt32 = 2_166_136_261

    mutating func word(_ x: UInt32) {
        h ^= x
        h = h &* 16_777_619
        h ^= h >> 15
    }
    mutating func int(_ x: Int) { word(UInt32(truncatingIfNeeded: x)) }
    mutating func bool(_ x: Bool) { word(x ? 1 : 0) }
    mutating func float(_ x: Double) {
        word(UInt32(x.bitPattern >> 32))
        word(UInt32(truncatingIfNeeded: x.bitPattern))
    }
    mutating func u64(_ x: UInt64) {
        word(UInt32(x >> 32))
        word(UInt32(truncatingIfNeeded: x))
    }
    mutating func text(_ s: String) {
        int(s.utf8.count)
        for b in s.utf8 { word(UInt32(b)) }
    }
    mutating func list<T>(_ xs: [T], _ one: (inout Digest, T) -> Void) {
        int(xs.count)
        for x in xs { one(&self, x) }
    }
    mutating func option<T>(_ x: T?, _ one: (inout Digest, T) -> Void) {
        if let x { word(1); one(&self, x) } else { word(0) }
    }
}

func index<T: CaseIterable & Equatable>(_ x: T) -> Int { Array(T.allCases).firstIndex(of: x)! }

extension Digest {
    mutating func hole(_ h: Hole) { int(index(h)) }
    mutating func symbol(_ s: Symbol) { int(index(s)) }
    mutating func charm(_ c: Charm) { int(index(c)) }
    mutating func powerUp(_ p: PowerUp) { int(index(p)) }
    mutating func ball(_ b: BallKind) { int(index(b)) }
    mutating func boss(_ b: Boss) { int(index(b)) }
    mutating func kind(_ k: RoundKind) { int(index(k)) }
    mutating func room(_ r: Room) { int(index(r)) }
    mutating func bet(_ b: Bet) { int(b.lines) }
    mutating func tier(_ t: JackpotTier) { int(index(t)) }

    mutating func pull(_ p: Pull) {
        for stop in p.stops { int(stop) }
        bet(p.bet); bool(p.free); room(p.room)
    }

    mutating func record(_ b: BallRecord) {
        hole(b.hole); symbol(b.symbol); int(b.chips); int(b.rattles); float(b.fold)
        bool(b.foul); int(b.slotHits); int(b.combo); ball(b.ball); bool(b.hot)
    }

    /// The kind and the pay, not the symbol. `Payline.evaluate` breaks a tie
    /// (Cherry, Lemon and a wild) in Set order, which Swift seeds per process,
    /// so the symbol of a tied pair is not a fact about the run. Its pay is.
    mutating func payline(_ p: Payline) {
        switch p {
        case .none: word(0)
        case .pair: word(1); float(p.addedMult)
        case .triple: word(2); float(p.addedMult)
        }
    }

    mutating func step(_ s: ScoreStep) {
        switch s.source {
        case .base: word(0)
        case .pull: word(1)
        case .ball(let i): word(2); int(i)
        case .slot(let i): word(3); int(i)
        case .payline: word(4)
        case .charm(let c): word(5); charm(c)
        case .fever: word(6)
        case .freeGame: word(7)
        }
        switch s.effect {
        case .base(let c, let m): word(0); int(c); float(m)
        case .chips(let c): word(1); int(c)
        case .mult(let m): word(2); float(m)
        case .timesMult(let m): word(3); float(m)
        case .tickets(let t): word(4); int(t)
        case .note(let n): word(5); text(n)
        }
    }

    mutating func frame(_ f: FrameScore) {
        list(f.balls) { $0.record($1) }
        payline(f.payline)
        list(f.steps) { $0.step($1) }
        int(f.chips); float(f.mult); int(f.tickets); int(f.streakAfter)
    }

    mutating func round(_ r: RoundState) {
        kind(r.kind); int(r.target); int(r.framesTotal)
        list(r.frames) { $0.frame($1) }
        list(r.currentBalls) { $0.record($1) }
        int(r.streak); int(r.combo)
        option(r.armed) { $0.powerUp($1) }
        option(r.pull) { $0.pull($1) }
        int(r.freeLeft)
        option(r.hot) { $0.hole($1) }
        bet(r.lastBet)
    }

    mutating func offer(_ o: Offer) {
        switch o {
        case .charm(let c): word(0); charm(c)
        case .stamp(let s): word(1); symbol(s)
        case .gild: word(2)
        case .purge: word(3)
        case .powerUp(let p): word(4); powerUp(p)
        }
    }

    mutating func phase(_ p: Phase) {
        switch p {
        case .throwing: word(0)
        case .prizeCounter(let c):
            word(1)
            list(c.offers) { $0.option($1) { $0.offer($1) } }
            int(c.rerollCost)
        case .lost: word(2)
        case .won: word(3)
        }
    }

    mutating func config(_ c: RunConfig) {
        int(c.antes); int(c.framesPerRound); int(c.ballsPerFrame); int(c.startTickets)
        int(c.charmSlots); int(c.powerUpSlots); int(c.feverHeat)
        list(c.anteBase) { $0.int($1) }
        float(c.targetScale)
        for k in RoundKind.allCases { float(c.kindScale[k]!); int(c.roundTickets[k]!) }
        float(c.overkillStep); int(c.overkillCap); int(c.interestPer); int(c.interestCap); int(c.offerCount)
    }

    mutating func run(_ s: RunState) {
        config(s.config); ball(s.ball); room(s.room)
        u64(s.rng.state); u64(s.seed)
        int(s.ante); boss(s.boss)
        round(s.round); phase(s.phase)
        for h in BoardSetup.reelHoles {
            list(s.setup.reel(h)) { $0.symbol($1) }
            int(s.setup.gild[h] ?? 0)
            int(s.stops[h] ?? 0)
        }
        for t in s.topSlot.symbols { symbol(t) }
        list(s.charms) { $0.charm($1) }
        list(s.powerUps) { $0.powerUp($1) }
        int(s.tickets); int(s.heat); bool(s.fever)
        let t = s.stats
        int(t.balls)
        for h in Hole.allCases { int(t.holes[h] ?? 0) }
        int(t.jackpots); int(t.rattles); int(t.bestFrame); int(t.pulls); int(t.freeGames)
        for k in JackpotTier.allCases { int(t.jackpotTiers[k] ?? 0) }
        int(t.points); int(t.roundsCleared)
    }

    mutating func shotEvent(_ e: ShotEvent) {
        switch e {
        case .dud: word(0)
        case .rail: word(1)
        case .launched: word(2)
        case .landed: word(3)
        case .lip(let ring): word(4); int(ring)
        case .backwall: word(5)
        case .hop: word(6)
        case .dropped(let h): word(7); hole(h)
        case .settled(let h): word(8); hole(h)
        case .gutter: word(9)
        }
    }

    /// Everything but a shot's floats: those depend on libm, the rest is the
    /// reducer's to pass on. `shotDetail` covers the floats.
    mutating func event(_ e: GameEvent) {
        switch e {
        case .pulled(let p): word(0); pull(p)
        case .freeGamesWon(let n): word(1); int(n)
        case .jackpot(let t): word(2); tier(t)
        case .shot(let s, let r): word(3); hole(s.hole); list(s.events) { $0.shotEvent($1) }; record(r)
        case .fouled: word(4)
        case .frameScored(let f): word(5); frame(f)
        case .feverLit: word(6)
        case .roundCleared(let score, let target, let p):
            word(7); int(score); int(target); int(p.base); int(p.overkill); int(p.interest)
        case .roundFailed(let score, let target): word(8); int(score); int(target)
        case .counterOpened: word(9)
        case .bought(let o): word(10); offer(o)
        case .sold(let c): word(11); charm(c)
        case .rerolled: word(12)
        case .armed(let p): word(13); powerUp(p)
        case .ballChosen(let b): word(14); ball(b)
        case .roundStarted(let k, let target): word(15); kind(k); int(target)
        case .anteStarted(let a, let b): word(16); int(a); boss(b)
        case .runWon: word(17)
        }
    }

    /// The floats of one shot, for measuring libm drift. Not the whole path:
    /// the physics goldens cover that, sample by sample.
    mutating func shotDetail(_ s: ShotResult) {
        list(s.eventTimes) { $0.float($1) }
        option(s.hingeSpeed) { $0.float($1) }
        option(s.firstLanding) { $0.float($1.x); $0.float($1.y) }
        float(s.peakHeight); float(s.duration)
        int(s.path.count)
    }
}

func digest(of s: RunState) -> UInt32 {
    var d = Digest()
    d.run(s)
    return d.h
}

func digest(of events: [GameEvent]) -> UInt32 {
    var d = Digest()
    d.list(events) { $0.event($1) }
    return d.h
}

func detail(of s: ShotResult) -> UInt32 {
    var d = Digest()
    d.shotDetail(s)
    return d.h
}
