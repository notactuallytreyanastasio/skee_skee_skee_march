#!/bin/sh
# Putt's static gate: forge check and forge lint of the game's lib/, and
# march --check of its suites and mains. forge exits 0 on warnings, and a
# non-exhaustive match is only a warning, so this fails on any warning text.
# Paths are relative to putt's root (this script's parent).
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
    echo "--- putt: $label (exit $rc)"
    printf '%s\n' "$out"
    fail=1
  fi
}

# forge's check cache keys on the lib-path string, not on the contents of a
# path dep, so an engine edit would not invalidate putt's cached result.
rm -rf .forge/check-cache
scan "forge check" forge check
scan "forge lint" forge lint
arcade=../..
export MARCH_LIB_PATH="lib:$arcade/lib:$arcade/physics/lib:$arcade/testkit/lib:test/suites"
for f in $(find test -name '*.march' | sort); do
  scan "march --check $f" march --check "$f"
done
[ "$fail" -eq 0 ] && echo "check-putt: lib and suites clean, no warnings"
exit "$fail"
