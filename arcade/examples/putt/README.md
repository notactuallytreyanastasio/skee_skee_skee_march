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
test/suites/putt_suite.march, test/mains/putt_main.march
scripts/check.sh, scripts/run-suite.sh
```

```
make check   # forge check + lint of lib/, march --check of the suites; fails on any warning
make test    # the suite on native and on JS; both must print HARNESS PASS
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

## Not yet: the browser launch

There is no `shell/` and `make web` fails on purpose. Launching in a browser
needs the engine's web runtime (`Arcade.Web.Runtime` with its `WebHooks`
record, and the `Arcade.Web` glue for the cell, input, canvas and audio),
which is being written alongside this game and was not in this tree when it
was made. Everything that launch needs from the game exists and is tested:

- the model and update: `Putt.Rules.new_game`, `play` (a `PuttTurn` with the
  events it told and the ball's sampled path);
- input: `Arcade.Physics.Gesture.measure` over the pointer's track, then
  `Putt.Rules.shot_of_flick`;
- the frame: `Putt.View.scene` (or `scene_with_ball` while a putt's path is
  played back), through `Arcade.Canvas.calls` and `Arcade.Web.Paint.frame`;
- sound: `Putt.Cues.voices` as the synth's cue table, and
  `Putt.Cues.audio_between` for the commands each playback frame sends.

What remains is `shell/putt_main.march` handing those to the runtime's
`launch`, the `web` target building it with `$(ARCADE_JS_FLAGS)`, and a
one-flick playtest.
