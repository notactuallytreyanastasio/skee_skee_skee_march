#!/bin/sh
# Draw one Skee.Scene frame as SVG, through the JS build, and as PNG beside
# the real SceneKit render (tools/golden_scene's scene-snapshot).
#   tools/scene_preview/preview.sh <stage 0-4> <width> <height> <out dir>
# Stages: 0 waiting, 1 on the lane, 2 in the air, 3 on the board, 4 sinking.
set -eu
root=$(cd "$(dirname "$0")/../.." && pwd)
export PATH="$HOME/.march/bin:$PATH"
out="$4"
mkdir -p "$out"
MARCH_LIB_PATH="$root/lib:$root/test/support:$root/test/suites:$root/test/golden" \
  march --target js --disable-pass opt.fold -o "$out/preview.mjs" "$root/tools/scene_preview/preview_main.march" >/dev/null
node "$out/preview.mjs" x "$1" "$2" "$3" > "$out/march-$1.svg"
echo "wrote $out/march-$1.svg"
