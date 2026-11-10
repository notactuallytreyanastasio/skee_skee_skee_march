#!/bin/sh
# Time Skee.Scene per frame on the shipping target (node, opt.fold off).
#   tools/scene_preview/bench.sh [out dir]
set -eu
root=$(cd "$(dirname "$0")/../.." && pwd)
export PATH="$HOME/.march/bin:$PATH"
out="${1:-$root/dist/scene_bench}"
mkdir -p "$out"
MARCH_LIB_PATH="$root/arcade/lib:$root/arcade/testkit/lib:$root/lib:$root/test/support:$root/test/suites:$root/test/golden" \
  march --target js --disable-pass opt.fold -o "$out/bench.mjs" "$root/tools/scene_preview/bench_main.march" >"$out/build.log" 2>&1 || { cat "$out/build.log"; exit 1; }
node "$out/bench.mjs"
