# arcade

A game engine for March games that run in the browser. The core is pure
(`cap pure`, `needs ()` on every fn): maths, a seedable RNG, a camera, a 2D
drawing vocabulary, a 32-bit-Float synth and the replay of a game's reducer.
A thin JS-only shell (`Arcade.Web.*`, plus `arcade_*.mjs` glue) runs a game's
frame loop, canvas, pointer and audio. A game supplies the rules, the scene and
the sounds; the engine never looks inside a game's model, messages or effects.

Every number the engine computes is reproducible: the same seed and the same
actions give the same state bit for bit, natively and on JS, unless the
computation goes through libm (sin, cos, log, atan2), where V8 and the native
libm can differ by an ulp or two. The engine names no game. Its defaults
follow the Swift game it was extracted from (Swift's `max`/`min` tie order,
SplitMix64, Swift's 32-bit `Float` in the synth), because a client's goldens
pin those semantics.

## Packages

| forge name | Path | Type | Holds |
|---|---|---|---|
| `arcade` | `.` (`lib/arcade/`) | lib | the pure core and, under `lib/arcade/web/`, the JS shell |
| `arcade_physics` | `physics/` (`lib/arcade/physics/`) | lib, depends on `arcade` | fixed-step simulation, kinematics, the libm replay seam, gesture measurement. Pure |
| `arcade_testkit` | `testkit/` (`lib/arcade/test/`) | lib, depends on `arcade`; a **dev-dep** | the suite harness, golden-row readers, digests. Holds IO and panics, so it goes on test paths only |

Module `Arcade.X.Y` lives at `<package>/lib/arcade/x/y.march`. The example
game `examples/putt/` is a package of its own (`putt`, an app) and is not part
of the engine.

## Modules

Pure core (`arcade`):

| Module | Responsibility |
|---|---|
| `Arcade.U64` | 64-bit unsigned words as two 32-bit limbs (JS has no 64-bit Int): make, of_int, of_hex, add, xor, shr, mul, equal |
| `Arcade.Numerics` | `Numerics`: the Float constants a literal cannot hold on JS (pi, tau, 2^-53, infinity, NaN), built from text; `float_of_text` |
| `Arcade.Num` | Swift-tie-order `max`/`min`, a NaN-keeping `clamp`, `clamp_int`, `ieee_div` (IEEE results for a zero divisor), `degrees`, `is_negative` |
| `Arcade.Vec2`, `Arcade.Vec3` | the `Vec2` and `Vec3` types and their algebra (normalize is zero-safe) |
| `Arcade.Rng` | SplitMix64 as a value: every draw returns `(value, Rng)`; `next_unit`, `next_int_below`, `next_gaussian`, `shuffled`, `pick` |
| `Arcade.Camera` | `Pose`, `Lens` (`Perspective(fov)` or `Orthographic(extent)`), `Rig`, `Viewport`, `Projection`; world to screen fractions and pixels, `ray`, `ray_plane`, `pixels_per_metre`, lean and shake helpers |
| `Arcade.CameraFit` | a grid search for a `Rig` that puts weighted target points nearest the screen heights they want; the game supplies `pose_at` and the targets |
| `Arcade.Draw` | the DrawOp vocabulary a game hands its shell (`Rgba`, `Shape`, `Paint`, `Pen`, `Lettering`, `Affine`, clips) and colour helpers (`hex`, `with_alpha`, `css`, `css_number`, `mix`, `lighter`) |
| `Arcade.Canvas` | DrawOps compiled to a `CanvasCall` list, every drawing decision made here, where it is testable |
| `Arcade.Html` | HTML as data (`Tag`, `Words`, `Prop`), `escape`, `render` |
| `Arcade.Svg` | DrawOps as SVG elements in `Arcade.Html` (`ops_svg`), clips as `<clipPath>` groups |
| `Arcade.Float32` | Swift's 32-bit `Float` emulated on doubles: `f32` rounding, `sinf`, `expf`, `powf`, Float.pi, `plus_zero` |
| `Arcade.Synth` | a polyphonic synth as a value: voices, stealing, `render`, rumble and drum beds; `SynthTuning` (`tuning()` is the default `new()` uses) |
| `Arcade.SynthFeed` | `AudioCmd(cue)`, a game's audio commands over its own cue type; `block` (the audio callback), `Levels`, `track`/`restore` across a worklet restart |
| `Arcade.Replay` | a game's reducer folded over actions: `replay` (rebuild a state from a seed and its actions), `drive` (a policy chooses actions until it has none), `steer` (whole turns, for a bot whose turn plays several actions) |

Physics (`arcade_physics`):

| Module | Responsibility |
|---|---|
| `Arcade.Physics.Sim` | `SimClock`, `tick`, timed events and sampled paths (`Timed`, `Sampled`, `records`), and the tail-recursive step loop `run_steps` |
| `Arcade.Physics.Kinematics` | `ballistic`, `ballistic_height`, `integrate_friction`, `reflect`, `reflect_approaching`, `clamp_to_bound` |
| `Arcade.Physics.Trig` | `SinCos`, `SineBook`, `sine_of`, `sin_cos`: the seam where recorded sines replace libm, for bit-exact replays across targets |
| `Arcade.Physics.Gesture` | a flick measured from pointer samples: `TrackPoint`, `GestureLimits`, `measure` to `GestureMetrics` |

Web shell (`arcade`, JS target only, `needs IO.Foreign`; march copies each
`arcade_*.mjs` beside the build because `lib/` is on the module path):

| Module | Responsibility |
|---|---|
| `Arcade.Web.Runtime` | the frame loop: `launch(canvas_id, make)` runs a `WebHooks(model, msg, fx)` record; owns canvas, cell, dispatch, resize, rAF |
| `Arcade.Web.Glue` | clock in seconds, rAF, view size, device pixel ratio, canvas sizing, seed limbs, visibility, vibrate, `data-*` marks |
| `Arcade.Web.Cell` | the one state cell per JS realm (`put(s : a)`, `get() : a`) |
| `Arcade.Web.Input` | one pointer followed on a canvas with coalesced samples, and a tap queue for DOM buttons |
| `Arcade.Web.Canvas2d` | the Canvas 2D calls `Js.Canvas` lacks |
| `Arcade.Web.Paint` | executes a `CanvasCall` list, one call each, deciding nothing |
| `Arcade.Web.Audio` | the AudioContext lifecycle: `install(AudioSetup, serve)` and `route(cmds)`; the setup names rate, gain, worklet URL, processor name and debug global |
| `Arcade.Web.SynthHost` | the synth the speakers hear, one per realm: `reset`, `serve(voices, cmds)` |
| `Arcade.Web.SynthWorklet` | the worklet build's processor: `register(processor, rate, reset, serve)` |

Test kit (`arcade_testkit`):

| Module | Responsibility |
|---|---|
| `Arcade.Test.Harness` | `Case`, `Outcome` (`Passed`, `Drifted`, `Mismatch`), `expect*`, `all`, `report` (prints `HARNESS PASS` or fails), `pending` |
| `Arcade.Test.GoldenIo` | golden rows as tokens: `rows`, `of_kind`, `int`, `u64`, `float_of_bits`, `expect_float` (every bit), `expect_libm_float` (declared ulp tolerance on JS) |
| `Arcade.Test.Digest` | a 32-bit FNV-style digest of a run, word by word, so two targets can be compared by one number |

## How a game plugs in

The game is a forge package that names the engine by path (a forge package
once published):

```toml
[deps]
arcade = { path = "../.." }
arcade_physics = { path = "../../physics" }   # only if it uses Arcade.Physics

[dev-deps]
arcade_testkit = { path = "../../testkit" }
```

Its Makefile includes `arcade.mk`, which defines `ARCADE_LIB`,
`ARCADE_TESTKIT_LIB`, `ARCADE_PHYSICS_LIB` and `ARCADE_JS_FLAGS`, exports them
to the game's scripts, and adds the targets `check-arcade` and `test-arcade`
without changing the game's default goal:

```make
ARCADE := ../..
include $(ARCADE)/arcade.mk
WEB_LIB := lib:$(ARCADE_LIB):$(ARCADE_PHYSICS_LIB):shell
web:
	MARCH_LIB_PATH=$(WEB_LIB) march $(ARCADE_JS_FLAGS) -o dist/game.mjs shell/game_shell.march
```

`forge build` puts only `lib/` and the deps on the module path, so a shell in
`shell/` is built with `march` directly, as above.

The game's side, as `examples/putt` does it:

1. **Rules** are a pure reducer, `play(rules, action, state) : Result(state, why)`.
   Every random choice is drawn from an `Arcade.Rng` carried in the state, so
   `Arcade.Replay.replay(rules, play, start(seed), actions)` rebuilds any game.
2. **Simulation** steps with `Arcade.Physics.Sim.run_steps(cx, max_t, time_of,
   step, stop, s0)` and the helpers in `Kinematics`.
3. **The view** builds a `Rig` (`Perspective` for a 3D scene, `Orthographic`
   for a top-down one), projects with `Arcade.Camera`, and returns a
   `List(DrawOp)`.
4. **Sound** is the game's own cue type and a `voices(SynthConsts, cue)` fn;
   the game emits `AudioCmd(cue)` values and the engine's feed and worklet
   render them. The worklet is a second JS build whose entry calls
   `Arcade.Web.SynthWorklet.register`.
5. **The shell** is one `WebHooks` record handed to
   `Arcade.Web.Runtime.launch`: boot, update, perform, the tick, resize,
   pointer and visibility msgs, the scene, an overlay and the `data-*` marks.

## Parameterization rules

These keep the engine game-agnostic and keep a client's goldens bit-exact.

1. **Defaults are the extracted literals.** A generalization takes a
   parameter whose default equals what the first client computed before
   (`SynthTuning`, `Numerics`, `GestureLimits`), so
   moving code into the engine changes no output. No float operation is
   reordered and no RNG draw is added, dropped or moved.
2. **Hooks in the pure core are plain fn parameters**, with a context `cx`
   passed first so callers can pass named top-level fns. No let-bound lambdas
   over records, and no calling a fn read from a record field. Records of
   closures (`WebHooks`) are only for the JS shell.
3. **Extension points are type parameters** (`AudioCmd(cue)`, `Timed(e)`,
   `WebHooks(model, msg, fx)`), never a closed ADT a game would have to
   extend.
4. **Equality and order come in as `eq` and `rank` fns.** No `derive Ord`, no
   `==` on records, no `derive Show` on generic records (each is wrong or
   crashes on some target).
5. **Names are distinctive.** Engine types clash with neither a game nor the
   stdlib (`Numerics`, `SynthTuning`, `WebHooks`, not `Stage`, `Trace`, `Rng`
   from random.march or the Json constructors). A type is defined once:
   March has no aliases, and a name defined in two packages will not build.
6. **The engine names no game.** Nothing under `arcade/` may mention a game
   built on it, and dependencies point one way: games use arcade.

## Numbers to know

- **Float literals on JS** print with 12 significant digits, so a constant
  with more comes from `Arcade.Numerics` (built from text). Every JS build
  turns off `opt.fold` (`ARCADE_JS_FLAGS`), which would bake a computed Float
  into such a literal.
- **libm on JS.** sin, cos, log and atan2 differ from native on a few percent
  of arguments by 1 ulp (`next_gaussian`, which chains them, by up to 2).
  `Arcade.Test.GoldenIo.expect_libm_float` allows `libm_ulps()` (2) on JS and
  reports every difference as drift. Physics that must replay across targets
  goes through `Arcade.Physics.Trig`.
- **Float32.** `sinf`, `expf` and `powf` are double libm rounded to Float, not
  a Float libm, so they can differ from a platform's `sinf` by one Float ulp.
- **`0.0 +. x` is folded to `x`** on every target, which loses the sign of a
  `-0.0` result; `Arcade.Float32.plus_zero` is the explicit form.
- **Int on JS** is a double, exact to 2^53 - 1. The test runners build with
  `--js-int-check`; anything wider is `Arcade.U64`.

## Running the checks

From the engine root:

```sh
scripts/check.sh            # forge check + lint of arcade, arcade_testkit, arcade_physics;
                            # march --check of the test kit and suites; fails on any warning
scripts/run-all.sh native   # every engine suite as a native plain-main program
scripts/run-all.sh js       # the same through node
scripts/run-suite.sh rng js # one suite on one target
```

Or, from a game that includes `arcade.mk`: `make check-arcade` and
`make test-arcade` (`test-arcade-native`, `test-arcade-js`). A suite passes
only when it exits 0 and prints `HARNESS PASS` with non-zero counts, so a
runner that ran nothing is red.

The engine's suites (`test/suites/`: u64, numerics, num, vec, rng, camera,
physics, replay) run with nothing of any game on the module path
(`lib:physics/lib:testkit/lib:test/suites:test/golden`). Their rows in
`test/golden/` are a static copy, pinned once and never regenerated, so the
engine has no generator of its own to depend on.

The example game: `make -C examples/putt check test web playtest`.

Never run a bare `forge format`: on this toolchain it can delete the body of a
`match do` or a multi-statement lambda. Use the host repository's guarded
format script.
