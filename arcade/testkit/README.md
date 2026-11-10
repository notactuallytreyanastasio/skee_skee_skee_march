# arcade_testkit

The test kit of the `arcade` engine for March: the suite harness, golden-row
readers and run digests, shared by native and JS plain-main test runners.
Modules live under `lib/arcade/test/` as `Arcade.Test.*`.

It holds IO and panics, so it is a dev-dep only and never on a shipped build:

```toml
[dev-deps]
arcade_testkit = "0.1.0"
```

A suite passes only when it exits 0 and prints `HARNESS PASS` with non-zero
counts, so a runner that ran nothing is red.
