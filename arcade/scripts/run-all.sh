#!/bin/sh
# Run every one of the engine's own suites on one target. Exit non-zero if any
# is red, or if none ran.
#   scripts/run-all.sh <native|js>
set -u
target="$1"
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root" || exit 2
logs=".march/test/$target"
mkdir -p "$logs"
green=""
red=""
for main in test/mains/*_main.march; do
  suite=$(basename "$main" _main.march)
  "$root/scripts/run-suite.sh" "$suite" "$target" >"$logs/$suite.log" 2>&1
  case "$?" in
    0) green="$green $suite"; grep "^GREEN" "$logs/$suite.log"; grep '^ok~' "$logs/$suite.log" ;;
    *) red="$red $suite"; tail -30 "$logs/$suite.log" ;;
  esac
done
echo "--- arcade $target: green:${green:- none} | red:${red:- none}"
[ -n "$green" ] || { echo "RED: no arcade suite passed on $target"; exit 1; }
[ -z "$red" ]
