# Changelog

All notable changes to `arcade` are recorded here. Versions follow semver;
`forge publish --old-source` checks the bump against the public API surface.

## 0.1.0 (unreleased)

The first version, extracted from a browser game whose Swift goldens it still
reproduces bit for bit.

- Pure core: `Arcade.U64`, `Arcade.Numerics`, `Arcade.Num`, `Arcade.Vec2`,
  `Arcade.Vec3`, `Arcade.Rng` (SplitMix64 as a value), `Arcade.Camera`
  (`Perspective` or `Orthographic` lens), `Arcade.CameraFit`, `Arcade.Draw`,
  `Arcade.Canvas`, `Arcade.Html`, `Arcade.Svg`, `Arcade.Float32`,
  `Arcade.Synth`, `Arcade.SynthFeed`, `Arcade.Replay`.
- Web shell (JS target only, `needs IO.Foreign`): `Arcade.Web.Runtime`,
  `Glue`, `Cell`, `Input`, `Canvas2d`, `Paint`, `Audio`, `SynthHost`,
  `SynthWorklet`, and the `arcade_*.mjs` glue beside them.
- No license is declared yet; `forge publish` warns until one is.
