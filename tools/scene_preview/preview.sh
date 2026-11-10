#!/bin/sh
# Draw one Skee.Scene frame through the JS build and paint it with Canvas 2D
# in headless Chrome (paint.html), to set beside the real SceneKit render
# (tools/golden_scene's scene-snapshot).
#   tools/scene_preview/preview.sh <stage 0-4> <width> <height> <out dir>
# Stages: 0 waiting, 1 on the lane, 2 in the air, 3 on the board, 4 sinking.
set -eu
root=$(cd "$(dirname "$0")/../.." && pwd)
export PATH="$HOME/.march/bin:$PATH"
out="$4"
mkdir -p "$out"
MARCH_LIB_PATH="$root/arcade/lib:$root/arcade/physics/lib:$root/arcade/testkit/lib:$root/lib:$root/test/support:$root/test/suites:$root/test/golden" \
  march --target js --disable-pass opt.fold -o "$out/preview.mjs" "$root/tools/scene_preview/preview_main.march" >"$out/build.log" 2>&1 || { cat "$out/build.log"; exit 1; }
node "$out/preview.mjs" "$1" "$2" "$3" json > "$out/ops.js"
cp "$root/tools/scene_preview/paint.html" "$out/paint.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor="${SCALE:-1}" --window-size="$2,$(($3 + 87))" --screenshot="$out/march-$1.png" "file://$out/paint.html" >/dev/null 2>&1
echo "wrote $out/march-$1.png"
