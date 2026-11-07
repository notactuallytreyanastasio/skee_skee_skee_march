import GoldenSupport
@testable import SkeeCore

// Owned by the reducer piece, with golden-run. Aim books, hand noise and landing
// rates from the real Swift. Whole bot runs are in golden-run: bots_suite plays
// them again and compares every action.
//
//   book <room> <ante> <boss|n> <ball> <powerSteps> <grid hash>
//   window <hole> <power> <aim> <width>                  each hole in the book above
//   rate <skill> <hole> <share per landing hole, all 8>  each aimed hole in the book above
//   hand <seed> <skill> <power> <aim> <new power> <new aim> <next rng word>

var g = GoldenFile(module: "Bots")

func index<T: CaseIterable & Equatable>(_ x: T) -> Int { Array(T.allCases).firstIndex(of: x)! }

/// One hole of the grid at a time, in a 32-bit FNV: March mirrors it.
func gridHash(_ grid: [[Hole]]) -> UInt32 {
    var h: UInt32 = 2_166_136_261
    for row in grid {
        for hole in row {
            h ^= UInt32(index(hole))
            h = h &* 16_777_619
            h ^= h >> 15
        }
    }
    return h
}

struct Spec { var room: Room; var ante: Int; var boss: Boss?; var ball: BallKind; var steps: Int }

let specs: [Spec] = [
    Spec(room: .boardwalk, ante: 1, boss: nil, ball: .classic, steps: 240),
    Spec(room: .neonLounge, ante: 4, boss: nil, ball: .comet, steps: 240),
    Spec(room: .highRoller, ante: 8, boss: .crosswind, ball: .marshmallow, steps: 120),
    Spec(room: .penthouse, ante: 6, boss: .tightPockets, ball: .wobbler, steps: 120),
    Spec(room: .boardwalk, ante: 8, boss: .tallLips, ball: .bean, steps: 120),
]

for spec in specs {
    var t = difficultyTable(ante: spec.ante, base: spec.room.table)
    if let b = spec.boss { t = b.modify(t) }
    t = spec.ball.modify(t)
    let book = AimBook(table: t, powerSteps: spec.steps, ball: spec.ball)
    g.line("book", i(index(spec.room)), i(spec.ante), spec.boss.map { String(index($0)) } ?? "n", i(index(spec.ball)),
           i(spec.steps), String(gridHash(book.grid)))
    for h in Hole.allCases {
        if let w = book.best[h] {
            g.line("window", i(index(h)), f64(w.launch.power), f64(w.launch.aim), f64(w.width))
        }
    }
    for (n, skill) in Skill.all.enumerated() {
        let rates = landings(book, t, skill, spec.ball)
        for h in BoardSetup.reelHoles {
            if let spread = rates[h] {
                g.line(["rate", i(n), i(index(h))] + Hole.allCases.map { f64(spread[$0] ?? 0) })
            }
        }
    }
}

var seeds = SplitMix64(seed: 77)
for n in 0..<400 {
    let skill = Skill.all[n % Skill.all.count]
    let seed = seeds.next()
    var hand = SplitMix64(seed: seed)
    let l = Launch(power: seeds.nextUnit(), aim: seeds.nextUnit() * 2 - 1, start: seeds.nextUnit() * 2 - 1, fold: seeds.nextUnit())
    let out = skill.perturb(l, rng: &hand)
    g.line("hand", u64(seed), i(n % Skill.all.count), f64(l.power), f64(l.aim), f64(l.start), f64(l.fold),
           f64(out.power), f64(out.aim), u64(hand.state))
}

try g.write()
