#!/bin/sh
# Compile one of putt's suites, test/mains/<suite>_main.march, and run it on
# a target. Paths are relative to putt's root (this script's parent); the
# engine is two levels up.
#   scripts/run-suite.sh <suite> <native|js>
# Exit 0: the program exited 0 and printed HARNESS PASS with non-zero counts.
# Exit 1: anything else. The exit code alone is not trusted: a runner that
# silently ran nothing must go red, which is why the summary line is required.
set -u
suite="$1"
target="$2"
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root" || exit 2
export PATH="$HOME/.march/bin:$PATH"
arcade=../..
# The game, the engine, its physics, its test kit and the suites.
export MARCH_LIB_PATH="lib:$arcade/lib:$arcade/physics/lib:$arcade/testkit/lib:test/suites"
entry="test/mains/${suite}_main.march"
[ -f "$entry" ] || { echo "no such suite: $entry"; exit 2; }

out_dir=".march/test/$target/$suite"
mkdir -p "$out_dir"
log="$out_dir/run.log"

case "$target" in
  native)
    march --compile --opt 0 -o "$out_dir/$suite" "$entry" >"$out_dir/build.log" 2>&1
    built=$?
    # Native == on a record reuses one comparison for every record type and
    # answers wrongly. The types forbid it; this catches anything that slips by.
    bad_eq=$(grep -c '@__march_eq_[A-Za-z0-9_]*Ptr' "test/mains/${suite}_main.ll" 2>/dev/null)
    rm -f "test/mains/${suite}_main.ll"
    if [ "$built" -ne 0 ]; then
      cat "$out_dir/build.log"
      echo "BUILD FAILED: $suite ($target)"
      exit 1
    fi
    if [ "${bad_eq:-0}" -ne 0 ]; then
      echo "RED: $suite on native uses == on a record, which is unsound natively"
      exit 1
    fi
    "$out_dir/$suite" >"$log" 2>&1
    rc=$?
    ;;
  js)
    # --disable-pass opt.fold is load-bearing: the folder bakes a result into a
    # literal, which the JS emitter then truncates to 12 digits.
    march --target js --js-int-check --disable-pass opt.fold -o "$out_dir/$suite.mjs" "$entry" >"$out_dir/build.log" 2>&1 \
      || { cat "$out_dir/build.log"; echo "BUILD FAILED: $suite ($target)"; exit 1; }
    node "$out_dir/$suite.mjs" >"$log" 2>&1
    rc=$?
    ;;
  *)
    echo "unknown target: $target"
    exit 2
    ;;
esac

cat "$log"
summary=$(grep "^HARNESS PASS $suite " "$log" | tail -1)
if [ "$rc" -ne 0 ] || [ -z "$summary" ]; then
  echo "RED: putt $suite on $target (exit $rc)"
  exit 1
fi
case "$summary" in
  *" cases=0 "*|*" values=0") echo "RED: putt $suite on $target compared nothing"; exit 1 ;;
esac
echo "GREEN: putt $suite on $target: $summary"
