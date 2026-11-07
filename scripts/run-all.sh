#!/bin/sh
# Run every suite on one target. Exit non-zero if any suite is red, and name
# the pending ones so a stub is never mistaken for a pass.
#   scripts/run-all.sh <native|js>
set -u
target="$1"
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root" || exit 2
logs="dist/test/$target"
mkdir -p "$logs"
green=""
pending=""
red=""
for main in test/mains/*_main.march; do
  suite=$(basename "$main" _main.march)
  "$root/scripts/run-suite.sh" "$suite" "$target" >"$logs/$suite.log" 2>&1
  rc=$?
  case "$rc" in
    0) green="$green $suite"; grep "^GREEN" "$logs/$suite.log"; grep '^ok~' "$logs/$suite.log" ;;
    3) pending="$pending $suite" ;;
    *) red="$red $suite"; tail -30 "$logs/$suite.log" ;;
  esac
done
echo "--- $target: green:${green:- none} | pending:${pending:- none} | red:${red:- none}"
[ -n "$green" ] || { echo "RED: no suite passed on $target"; exit 1; }
[ -z "$red" ]
