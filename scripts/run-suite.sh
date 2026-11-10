#!/bin/sh
# Compile one test/mains/<suite>_main.march and run it on a target.
#   scripts/run-suite.sh <suite> <native|js>
# Exit 0: the program exited 0 and printed HARNESS PASS with non-zero counts.
# Exit 3: the suite is a pending stub. Exit 1: anything else.
# The exit code alone is not trusted: a runner that silently ran nothing must
# go red, which is why the summary line is required.
set -u
suite="$1"
target="$2"
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root" || exit 2
export PATH="$HOME/.march/bin:$PATH"
# Not plain lib:test: a module holding a `test` block is always loaded (march#1183),
# so test/*_test.march on the path would tie every suite to every other.
# The engine and its test kit come first, as forge orders deps; arcade.mk sets
# ARCADE_LIB and ARCADE_TESTKIT_LIB when make runs this.
arcade_lib="${ARCADE_LIB:-arcade/lib}"
arcade_testkit_lib="${ARCADE_TESTKIT_LIB:-arcade/testkit/lib}"
arcade_physics_lib="${ARCADE_PHYSICS_LIB:-arcade/physics/lib}"
export MARCH_LIB_PATH="${SKEE_LIB_PATH:-$arcade_lib:$arcade_physics_lib:$arcade_testkit_lib:lib:test/support:test/suites:test/golden}"
entry="test/mains/${suite}_main.march"
[ -f "$entry" ] || { echo "no such suite: $entry"; exit 2; }

out_dir="dist/test/$target/$suite"
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
      echo "RED: $suite on native uses == on a record, which is unsound natively. See docs/PORT.md."
      exit 1
    fi
    "$out_dir/$suite" >"$log" 2>&1
    rc=$?
    ;;
  js)
    # --disable-pass opt.fold is load-bearing: the folder bakes a result into a
    # literal, which the JS emitter then truncates to 12 digits. See docs/PORT.md.
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
if [ "$rc" -eq 0 ] && grep -q "^HARNESS PENDING $suite\$" "$log"; then
  echo "PENDING: $suite on $target has no tests yet"
  exit 3
fi
summary=$(grep "^HARNESS PASS $suite " "$log" | tail -1)
if [ "$rc" -ne 0 ] || [ -z "$summary" ]; then
  echo "RED: $suite on $target (exit $rc)"
  exit 1
fi
case "$summary" in
  *" cases=0 "*|*" values=0") echo "RED: $suite on $target compared nothing"; exit 1 ;;
esac
echo "GREEN: $suite on $target: $summary"
