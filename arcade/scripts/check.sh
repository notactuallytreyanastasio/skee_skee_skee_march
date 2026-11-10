#!/bin/sh
# The engine's static gate: forge check and forge lint in the engine package
# and its test kit, the publish check (scripts/publish-check.sh), and march
# --check over the test kit and the engine's own suites. forge exits 0 on
# warnings, and a non-exhaustive match is only a warning, so this fails on any
# warning text. Paths are relative to the engine root (this script's parent).
#   scripts/check.sh
set -u
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root" || exit 2
export PATH="$HOME/.march/bin:$PATH"
fail=0

# The clang target-triple lines are noise from native compiles.
scan() {
  label="$1"
  shift
  out=$("$@" 2>&1)
  rc=$?
  warnings=$(printf '%s\n' "$out" | grep -iE 'warning' | grep -vE 'overriding the module target triple|warnings? generated')
  if [ "$rc" -ne 0 ] || [ -n "$warnings" ]; then
    echo "--- arcade: $label (exit $rc)"
    printf '%s\n' "$out"
    fail=1
  fi
}

# forge's check cache keys on the lib-path string, not on the contents of a
# path dep, so an edit to the engine would not invalidate the test kit's
# cached result.
rm -rf .forge/check-cache testkit/.forge/check-cache physics/.forge/check-cache
for pkg in . testkit physics; do
  scan "forge check ($pkg)" sh -c "cd '$pkg' && forge check"
  scan "forge lint ($pkg)" sh -c "cd '$pkg' && forge lint"
done
export MARCH_LIB_PATH="lib:physics/lib:testkit/lib:test/suites:test/golden"
files=$(find testkit/lib test -name '*.march' -not -path 'test/golden/*' | sort)
for f in $files; do
  scan "march --check $f" march --check "$f"
done
# The packages as they would be published: staged outside the tree, built
# standalone, and passed through forge publish --dry-run.
"$root/scripts/publish-check.sh" || fail=1
[ "$fail" -eq 0 ] && echo "check-arcade: engine, test kit and engine suites clean, no warnings"
exit "$fail"
