# Changelog

All notable changes to `arcade_testkit` are recorded here. Versions follow
semver; `forge publish --old-source` checks the bump against the public API
surface.

## 0.1.0 (unreleased)

The first version. Depends on `arcade` 0.1.0. A dev-dep: it holds IO and
panics, so it belongs on test paths only.

- `Arcade.Test.Harness`: `Case`, `Outcome` (`Passed`, `Drifted`, `Mismatch`),
  the `expect*` checks, `all`, `report` (prints `HARNESS PASS` or fails),
  `pending`.
- `Arcade.Test.GoldenIo`: golden rows as tokens, `float_of_bits`,
  `expect_float` (every bit) and `expect_libm_float` (a declared ulp
  tolerance on JS).
- `Arcade.Test.Digest`: a 32-bit FNV-style digest of a run, so two targets
  can be compared by one number.
- No license is declared yet; `forge publish` warns until one is.
