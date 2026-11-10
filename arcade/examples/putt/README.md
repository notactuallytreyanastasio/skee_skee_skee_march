# Putt

Top-down mini-golf on the arcade engine, and the engine's second game: four
one-screen holes, a flick to putt, walls and blocks the ball bounces off, sand
that slows it, and a wind on every hole drawn from the game's seed. It uses
only `Arcade.*` modules; nothing in it knows about any other game.

```
forge.toml              app; [deps] arcade, arcade_physics by path; [dev-deps] arcade_testkit
lib/putt/course.march   Putt.Course: the holes (walls, blocks, sand, tee, cup, par)
lib/putt/roll.march     Putt.Roll: one putt rolled out (Arcade.Physics.Sim + Kinematics)
lib/putt/rules.march    Putt.Rules: state, actions, play/apply, resume (Arcade.Replay), shot_of_flick (Arcade.Physics.Gesture)
lib/putt/view.march     Putt.View: orthographic Arcade.Camera and a frame's Arcade.Draw ops
lib/putt/cues.march     Putt.Cues: PuttCue, its Arcade.Synth voices, the AudioCmd(PuttCue) feed
shell/putt_shell.march  PuttShell: the browser build's entry, Arcade.Web.Runtime hooks
shell/putt_audio.march  PuttAudio: Arcade.Web.Audio setup and routing
shell/putt_worklet.march, shell/putt_names.march   the audio worklet build's entry; the names both builds share
web/index.html, web/style.css
test/suites/putt_suite.march, test/mains/putt_main.march, test/web/playtest.mjs
scripts/check.sh, scripts/run-suite.sh, scripts/serve.mjs
```

```
make check     # forge check + lint of lib/, march --check of the suites and shell/; fails on any warning
make test      # the suite on native and on JS; both must print HARNESS PASS
make web       # the browser build in dist/
make serve     # dist/ at http://127.0.0.1:8237/
make playtest  # one flick in headless Chrome
```

From the repository root, `make test-examples` runs `make test` here and
`make check-examples` runs `make check`; `make test` and `make check` include
them.

## How it plays

`Putt.Rules.play(rules(), action, state)` is the whole game. A state is on a
tee (`PuttAiming`), done with a hole (`PuttHoleDone`) or done with the course
(`PuttCourseDone`); the actions are `PuttStrike(shot)` and `PuttNext`. A shot
is a direction and a speed in m/s; `shot_of_flick` reads one from a flick's
`GestureMetrics`, aiming from where the flick began to where it was fastest.
The orthographic camera keeps screen up as course +y, so that direction on
screen is the putt's on the course. A hole ends when the ball drops or after
six strokes (picked up).

The wind is the only random thing. `new_game` seeds an `Arcade.Rng`, and each
tee draws two units from it, so a game is its seed plus the actions it
accepted: `resume(rules(), seed, actions)` replays them with
`Arcade.Replay.replay`.

The roll is a fixed 1/256 s step: friction against the direction of travel
(five times as much in sand) plus the wind as a steady pull, then the rails,
then the blocks, then the cup, which takes a ball over it at 1.25 m/s or less
and lets a faster one lip out. It uses only `+ - * /` and `sqrt`, which every
target rounds alike, so a game is bit-identical natively and on JS. The suite
pins that: the final-state and turn-by-turn digests of a seeded bot game, and
a frame's 82 canvas calls, are one constant for both targets.

## In the browser

`make web` builds `dist/`, a static site: `putt.mjs` from
`shell/putt_shell.march`, the audio worklet's own build
`putt_synth_worklet.mjs` from `shell/putt_worklet.march`, March's runtime
modules, the engine's glue (`arcade_*.mjs`, copied by march), and
`web/index.html` and `web/style.css`. `make serve` serves it at
`http://127.0.0.1:8237/` (`PORT=...` to change).

The shell is the hooks `Arcade.Web.Runtime.launch` runs one model with; the
runtime owns the canvas, the frame loop and the pointer. A drag's samples
are kept until the pointer lifts, then measured as a flick
(`Arcade.Physics.Gesture.measure` with `flick_limits`) and turned into a putt
by `shot_of_flick`. The rules roll the whole putt at once; the shell then
plays its sampled path back at real time (straight lines between samples),
drawing `Putt.View.scene_with_ball` from the state it was struck from, and
sends `Putt.Cues.audio_between` for each frame's slice of time to
`Arcade.Web.Audio`. When the path ends the state moves on to the turn's
`after`. Touches are ignored while a putt is shown; on a finished hole a tap
tees up the next, and on a finished course a tap starts a new game seeded
from the last one's generator. The synth runs `Putt.Cues.voices` in the
worklet (processor `putt-synth`), or on the main thread where worklets are
missing.

`make playtest` builds `dist/`, serves it on `PORT` and flicks once in
headless Chrome (puppeteer-core from `PLAYTEST_MODULES`, by default the
host repository's `tools/playtest`). It reads the marks the shell sets on
`<html>` (`data-phase`, `data-hole`, `data-strokes`, `data-rolling`,
`data-putts`) and checks the first tee, the green's colour at the canvas's
centre, the flick becoming a putt that rolls and rests with one stroke on
the card, the speakers coming up in the worklet and being sent the putt's
commands, and a clean console. Screenshots go to `test/web/shots/`.

Not checked by anything: how far a flick sends the ball. The playtest's
flick (8 px every 10 ms by its own clock, about 800 px/s) is measured as a
lift speed near 267 px/s, a 0.67 m/s putt that stops about a third of a
metre up the 6 m first hole (from the screenshots). `power_per_speed` was
tuned without a browser.
