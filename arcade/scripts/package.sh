#!/bin/sh
# Stage the three engine packages as they would be published, one directory
# each under OUT:
#   OUT/arcade          the core and the web shell
#   OUT/arcade_physics  Arcade.Physics.*
#   OUT/arcade_testkit  Arcade.Test.*
#
#   scripts/package.sh OUT
#
# `forge publish` tars the whole directory it runs in (minus .git, _build and
# the like), and forge.toml has no include or exclude list. Run in arcade/ it
# would ship the example game, the engine's suites and goldens, and both
# nested packages inside the core's archive. So a real publish runs in a
# staged copy (`cd OUT/arcade && forge publish`), never in the engine tree.
#
# What ships is an explicit list per package, taken from the working tree's
# tracked and unignored files. In each staged manifest the dev form of the
# core dep, `arcade = { version = "V", path = ".." }`, becomes the registry
# form `arcade = "V"`; V must equal the core's own version. Anything missing
# or unexpected stops the script.
set -eu
[ $# -eq 1 ] || { echo "usage: scripts/package.sh OUT" >&2; exit 2; }
root=$(cd "$(dirname "$0")/.." && pwd)
out=$1
mkdir -p "$out"
out=$(cd "$out" && pwd)

die() { echo "package.sh: $*" >&2; exit 1; }

# The [package] version of a manifest: the first `version = "..."` line, which
# forge.toml puts in [package] ahead of any dep table.
version_of() {
  sed -n 's/^version = "\([^"]*\)"$/\1/p' "$1" | head -n 1
}

core_version=$(version_of "$root/forge.toml")
[ -n "$core_version" ] || die "no version in $root/forge.toml"

# stage NAME SRC_DIR ENTRY...: copy each ENTRY (a file, or a directory whose
# tracked and unignored files are taken) from SRC_DIR into OUT/NAME.
stage() {
  name=$1
  src=$2
  shift 2
  dest="$out/$name"
  [ ! -e "$dest" ] || die "$dest already exists; stage into an empty OUT"
  mkdir -p "$dest"
  list="$out/.$name.files"
  : > "$list"
  for entry in "$@"; do
    if [ -d "$src/$entry" ]; then
      (cd "$src" && git ls-files -co --exclude-standard -- "$entry") >> "$list"
    elif [ -f "$src/$entry" ]; then
      echo "$entry" >> "$list"
    else
      die "$name: $src/$entry does not exist"
    fi
  done
  [ -s "$list" ] || die "$name: nothing to stage"
  (cd "$src" && tar -cf - -T "$list") | tar -xf - -C "$dest"
  rm -f "$list"
  [ -f "$dest/forge.toml" ] || die "$name: no forge.toml staged"
  staged_name=$(sed -n 's/^name = "\([^"]*\)"$/\1/p' "$dest/forge.toml" | head -n 1)
  [ "$staged_name" = "$name" ] || die "$name: forge.toml names '$staged_name'"
}

# to_registry NAME: the core dep in OUT/NAME/forge.toml, dev form to registry
# form. Exactly one such line, at the core's version, and no path left after.
to_registry() {
  manifest="$out/$1/forge.toml"
  pattern='^arcade = { version = "\([^"]*\)", path = "\.\." }$'
  n=$(grep -c "$pattern" "$manifest" || true)
  [ "$n" -eq 1 ] || die "$1: expected one 'arcade = { version = ..., path = \"..\" }' line, found $n"
  dep_version=$(sed -n "s/$pattern/\\1/p" "$manifest")
  [ "$dep_version" = "$core_version" ] \
    || die "$1: depends on arcade $dep_version, the core is $core_version"
  sed "s/$pattern/arcade = \"\\1\"/" "$manifest" > "$manifest.new"
  mv "$manifest.new" "$manifest"
  if grep -nE '(^|[{ ,])path *=' "$manifest"; then
    die "$1: a path dep is left in the published manifest"
  fi
}

stage arcade "$root" \
  forge.toml forge.caps.lock README.md CHANGELOG.md .march-lint.toml .editorconfig lib
stage arcade_physics "$root/physics" \
  forge.toml forge.caps.lock README.md CHANGELOG.md lib
stage arcade_testkit "$root/testkit" \
  forge.toml forge.caps.lock README.md CHANGELOG.md .march-lint.toml lib
to_registry arcade_physics
to_registry arcade_testkit

for name in arcade arcade_physics arcade_testkit; do
  echo "staged $name $(version_of "$out/$name/forge.toml"): $(find "$out/$name" -type f | wc -l | tr -d ' ') files in $out/$name"
done
