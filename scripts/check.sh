#!/bin/sh
# The game's static gate. forge check and forge lint see one package's lib/
# only and exit 0 on warnings, and a non-exhaustive match is only a warning, so
# this script covers test/ and shell/ with march --check too, and fails on any
# warning text. The engine packages, its test kit and its own suites are
# arcade/scripts/check.sh (make check-arcade, which make check runs first).
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
    echo "--- $label (exit $rc)"
    printf '%s\n' "$out"
    fail=1
  fi
}

# forge checks one package at a time, and its check cache keys on the lib-path
# string, not on the contents of a path dep: an edit to the engine would not
# invalidate the game's cached result. So the cache goes first.
arcade_lib="${ARCADE_LIB:-arcade/lib}"
arcade_testkit_lib="${ARCADE_TESTKIT_LIB:-arcade/testkit/lib}"
arcade=$(dirname "$arcade_lib")
rm -rf .forge/check-cache "$arcade/.forge/check-cache" "$arcade/testkit/.forge/check-cache"
scan "forge check" forge check
scan "forge lint" forge lint
export MARCH_LIB_PATH="$arcade_lib:$arcade_testkit_lib:lib:test:shell"
files=$(find test shell -name '*.march' -not -path 'test/golden/*' | sort)
for f in $files; do
  scan "march --check $f" march --check "$f"
done
python3 scripts/check_core.py || fail=1
scripts/format.sh --check || fail=1
[ "$fail" -eq 0 ] && echo "check: lib, test and shell clean, no warnings"
exit "$fail"
