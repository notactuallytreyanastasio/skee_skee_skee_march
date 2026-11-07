#!/bin/sh
# Format lib/, test/ and shell/ safely. Never run bare `forge format`: it
# silently replaces `match do` blocks, and multi-line lambdas inside list
# literals, with a literal `...`. This wrapper formats each file through
# --stdin and refuses any result with more `...` than the input had.
#   scripts/format.sh           rewrite files
#   scripts/format.sh --check   exit 1 if anything would change or be damaged
set -u
mode="${1:-write}"
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root" || exit 2
export PATH="$HOME/.march/bin:$PATH"
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
bad=0
for f in $(find lib test shell -name '*.march' -not -path 'test/golden/*' | sort); do
  if ! forge format --stdin <"$f" >"$tmp" 2>/dev/null; then
    echo "format: cannot parse $f"
    bad=1
    continue
  fi
  before=$(grep -o '\.\.\.' "$f" | wc -l)
  after=$(grep -o '\.\.\.' "$tmp" | wc -l)
  if [ "$after" -gt "$before" ]; then
    echo "format: REFUSED $f: the formatter would delete code (see docs/PORT.md). Rewrite that block."
    bad=1
    continue
  fi
  if ! cmp -s "$f" "$tmp"; then
    if [ "$mode" = "--check" ]; then
      echo "format: not formatted: $f"
      bad=1
    else
      cp "$tmp" "$f"
      echo "formatted $f"
    fi
  fi
done
exit "$bad"
