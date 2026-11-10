# Changelog

All notable changes to `arcade_physics` are recorded here. Versions follow
semver; `forge publish --old-source` checks the bump against the public API
surface.

## 0.1.0 (unreleased)

The first version, split out of the engine core so a game that needs no
simulation does not depend on one. Depends on `arcade` 0.1.0.

- `Arcade.Physics.Sim`: `SimClock`, `tick`, `Timed` and `Sampled` records,
  the tail-recursive step loop `run_steps`.
- `Arcade.Physics.Kinematics`: `ballistic`, `ballistic_height`,
  `integrate_friction`, `reflect`, `reflect_approaching`, `clamp_to_bound`.
- `Arcade.Physics.Trig`: `SinCos`, `SineBook`, `sine_of`, `sin_cos`, the seam
  where recorded sines replace libm for bit-exact replays across targets.
- `Arcade.Physics.Gesture`: `TrackPoint`, `GestureLimits`, `measure` to
  `GestureMetrics`.
- No license is declared yet; `forge publish` warns until one is.
