#!/bin/sh
# Time Skee.Synth.render on native and under node, and print the measured
# parity with Swift. Writes to dist/bench/synth.
set -eu
root=$(cd "$(dirname "$0")/../.." && pwd)
cd "$root"
export PATH="$HOME/.march/bin:$PATH"
export MARCH_LIB_PATH="arcade/lib:arcade/testkit/lib:lib:test/support:test/suites:test/golden"
out=dist/bench/synth
mkdir -p "$out"
march --compile -o "$out/bench" tools/synth_bench/synth_bench.march >"$out/build-native.log" 2>&1 || { cat "$out/build-native.log"; exit 1; }
rm -f tools/synth_bench/synth_bench.ll
march --target js --disable-pass opt.fold -o "$out/bench.mjs" tools/synth_bench/synth_bench.march >"$out/build-js.log" 2>&1 || { cat "$out/build-js.log"; exit 1; }
echo "--- native"
"$out/bench"
echo "--- node $(node --version)"
node "$out/bench.mjs"
