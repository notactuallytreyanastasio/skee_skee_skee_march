#!/bin/sh
# Check that the three engine packages are publishable, without publishing:
# stage them (scripts/package.sh) into a temporary directory outside this
# tree, then
#   1. in each published copy: `forge publish --dry-run`, and no `../` in its
#      manifest;
#   2. in a build copy beside it, where the core dep of arcade_physics and
#      arcade_testkit points at the staged core (`path = "../arcade"`) instead
#      of the registry: forge check, forge lint and forge audit. This is the
#      standalone build: nothing of the engine tree or any game is reachable.
# Fails on any warning, as scripts/check.sh does, with one exception that is
# printed rather than hidden: no license has been chosen yet, and the dry run
# warns about the empty `license` field until one is.
#   scripts/publish-check.sh
set -u
root=$(cd "$(dirname "$0")/.." && pwd)
export PATH="$HOME/.march/bin:$PATH"
work=$(mktemp -d "${TMPDIR:-/tmp}/arcade-publish-check.XXXXXX") || exit 2
trap 'rm -rf "$work"' EXIT
fail=0
license_note=""

"$root/scripts/package.sh" "$work/publish" > "$work/package.log" 2>&1 || {
  cat "$work/package.log"
  echo "publish-check: staging failed"
  exit 1
}

scan() {
  label="$1"
  shift
  out=$("$@" 2>&1)
  rc=$?
  warnings=$(printf '%s\n' "$out" | grep -iE 'warning' \
    | grep -vE 'overriding the module target triple|warnings? generated' \
    | grep -vF 'warning: no `license` field in forge.toml')
  if printf '%s\n' "$out" | grep -qF 'warning: no `license` field in forge.toml'; then
    license_note="$license_note $label"
  fi
  if [ "$rc" -ne 0 ] || [ -n "$warnings" ]; then
    echo "--- publish-check: $label (exit $rc)"
    printf '%s\n' "$out"
    fail=1
  fi
}

pkgs="arcade arcade_physics arcade_testkit"
for p in $pkgs; do
  dir="$work/publish/$p"
  scan "forge publish --dry-run ($p)" sh -c "cd '$dir' && forge publish --dry-run"
  # A relative path out of the package in the published manifest.
  if grep -nF '../' "$dir/forge.toml"; then
    echo "--- publish-check: $p/forge.toml reaches outside the package"
    fail=1
  fi
done

# The build copies.
mkdir -p "$work/build"
(cd "$work/publish" && tar -cf - $pkgs) | tar -xf - -C "$work/build"
for p in arcade_physics arcade_testkit; do
  m="$work/build/$p/forge.toml"
  sed 's|^arcade = "\([^"]*\)"$|arcade = { version = "\1", path = "../arcade" }|' "$m" > "$m.new"
  mv "$m.new" "$m"
  grep -q '^arcade = { version = "[^"]*", path = "\.\./arcade" }$' "$m" || {
    echo "--- publish-check: $p: no registry arcade dep to point at the staged core"
    fail=1
  }
done
for p in $pkgs; do
  dir="$work/build/$p"
  scan "forge check ($p, staged)" sh -c "cd '$dir' && forge check"
  scan "forge lint ($p, staged)" sh -c "cd '$dir' && forge lint"
  scan "forge audit ($p, staged)" sh -c "cd '$dir' && forge audit"
done

if [ -n "$license_note" ]; then
  echo "publish-check: note: no license chosen yet (empty \`license\` in forge.toml):$license_note"
fi
[ "$fail" -eq 0 ] && echo "publish-check: arcade, arcade_physics, arcade_testkit stage, build standalone and pass forge publish --dry-run"
exit "$fail"
