#!/bin/sh
# Proves the guards can fail. Works on a throwaway copy of the project, plants
# one violation at a time, and requires the matching guard to go red, then
# requires the clean copy to stay green. A guard that has never been seen to
# fail proves nothing.
set -u
root=$(cd "$(dirname "$0")/.." && pwd)
work="$root/dist/selftest"
export PATH="$HOME/.march/bin:$PATH"
passed=0
failed=0

reset() {
  rm -rf "$work"
  mkdir -p "$work/test"
  cp -R "$root/lib" "$root/shell" "$root/scripts" "$root/forge.toml" "$root/.march-lint.toml" "$root/.editorconfig" "$work/"
  for d in support golden suites mains; do cp -R "$root/test/$d" "$work/test/"; done
  cp "$root"/test/*_test.march "$work/test/"
}

# expect_red <label> <command...>: the command must exit non-zero.
expect_red() {
  label="$1"
  shift
  if "$@" >"$work/out.log" 2>&1; then
    echo "NOT RED  $label"
    tail -5 "$work/out.log"
    failed=$((failed + 1))
  else
    echo "red ok   $label"
    passed=$((passed + 1))
  fi
}

expect_green() {
  label="$1"
  shift
  if "$@" >"$work/out.log" 2>&1; then
    echo "green ok $label"
    passed=$((passed + 1))
  else
    echo "NOT GREEN $label"
    tail -10 "$work/out.log"
    failed=$((failed + 1))
  fi
}

expect_code() {
  want="$1"
  label="$2"
  shift 2
  "$@" >"$work/out.log" 2>&1
  got=$?
  if [ "$got" -eq "$want" ]; then
    echo "exit ok  $label ($got)"
    passed=$((passed + 1))
  else
    echo "BAD EXIT $label (got $got, want $want)"
    failed=$((failed + 1))
  fi
}

core() { python3 "$work/scripts/check_core.py" --root "$work"; }

# plant_core <label> <module body>: one violating module under lib/.
plant_core() {
  label="$1"
  body="$2"
  reset
  printf 'mod Skee.Planted do\n  cap pure\n\n%s\nend\n' "$body" >"$work/lib/skee/planted.march"
  expect_red "core: $label" core
}

echo "== core rules"
reset
expect_green "core: the clean tree passes" core
plant_core "Js.Dom in lib/" '  fn f() : () needs () do
    Js.Dom.body()
  end'
plant_core "Js.Canvas in lib/" '  fn f(x : Int) : Int needs () do
    Js.Canvas.get_context(x)
  end'
plant_core "System.monotonic_time in lib/" '  fn f() : Int needs () do
    System.monotonic_time()
  end'
plant_core "println in lib/" '  fn f() : () needs () do
    println("x")
  end'
plant_core "fn without needs ()" '  fn f() : Int do
    1
  end'
plant_core "pfn without needs ()" '  pfn f() : Int do
    1
  end'
plant_core "a needs line" '  needs IO.Console'
plant_core "extern" '  extern "x" : Cap(IO.Foreign) do
    fn y() : Int
  end'
plant_core "panic" '  fn f() : Int needs () do
    panic("x")
  end'
plant_core "module-level let" '  let x = 1'
plant_core "a 16-digit Float literal" '  fn f() : Float needs () do
    3.141592653589793
  end'
plant_core "Math.pi" '  fn f() : Float needs () do
    Math.pi()
  end'
plant_core "derive Ord" '  type T = A | B
  derive Eq, Ord for T'
plant_core "match do" '  fn f(x : Int) : Int needs () do
    match do
      x > 0 -> 1
      true -> 2
    end
  end'
plant_core "a function called negate" '  fn negate(x : Int) : Int needs () do
    x
  end'
reset
printf 'mod Skee.Planted do\n  fn f() : Int needs () do\n    1\n  end\nend\n' >"$work/lib/skee/planted.march"
expect_red "core: module without cap pure" core
reset
rm "$work"/lib/skee/*.march
expect_red "core: an empty lib/ refuses to pass" core
reset
printf 'mod Skee.Planted do\n  cap pure\n\n  type Tally = { n : Int }\nend\n' >"$work/lib/skee/planted.march"
printf 'mod Skee.Planted2 do\n  cap pure\n\n  type Tally = { m : Int }\nend\n' >"$work/lib/skee/planted2.march"
expect_red "core: a type name defined twice (march#1183)" core

echo "== test runners"
suite() { "$work/scripts/run-suite.sh" "$@"; }
plant_suite() {
  name="$1"
  cases="$2"
  cat >"$work/test/suites/${name}_suite.march" <<EOF
mod PlantedSuite do
  fn cases() : List(Harness.Case) do
    $cases
  end
end
EOF
  cat >"$work/test/mains/${name}_main.march" <<EOF
mod PlantedMain do
  needs IO.Console

  fn main(_c : Cap(IO.Console)) : () do
    Harness.report("$name", PlantedSuite.cases())
  end
end
EOF
}
reset
plant_suite planted '[Harness.case("bad", fn -> Harness.expect_int(1, 2, "one"))]'
expect_red "a failing case, native" suite planted native
expect_red "a failing case, js" suite planted js
reset
plant_suite planted '[]'
expect_red "an empty suite, native" suite planted native
expect_red "an empty suite, js" suite planted js
reset
plant_suite planted '[Harness.case("nothing", fn -> Harness.all([]))]'
expect_red "a case that compared nothing, native" suite planted native
expect_red "a case that compared nothing, js" suite planted js
reset
plant_suite planted '[Harness.case("boom", fn -> panic("boom"))]'
expect_red "a panic, native" suite planted native
expect_red "a panic, js" suite planted js
reset
cat >"$work/test/mains/silent_main.march" <<'EOF'
mod SilentMain do
  needs IO.Console

  fn main(_c : Cap(IO.Console)) : () do
    println("ran nothing")
  end
end
EOF
expect_red "a runner that exits 0 without a summary, native" suite silent native
expect_red "a runner that exits 0 without a summary, js" suite silent js
reset
cat >"$work/test/suites/planted_suite.march" <<'EOF'
mod PlantedSuite do
end
EOF
cat >"$work/test/mains/planted_main.march" <<'EOF'
mod PlantedMain do
  needs IO.Console

  fn main(_c : Cap(IO.Console)) : () do
    Harness.pending("planted")
  end
end
EOF
expect_code 3 "a pending stub is not green" suite planted js

echo "== native record equality guard"
reset
cat >"$work/lib/skee/planted.march" <<'EOF'
mod Skee.Planted do
  cap pure

  type P = { a : Int }
  derive Eq, Show for P

  fn p() : P needs () do
    { a: 1 }
  end
end
EOF
plant_suite planted '[Harness.case("record eq", fn -> Harness.expect(Skee.Planted.p() == Skee.Planted.p(), "same"))]'
expect_red "== on a record, native" suite planted native

echo "== isolation between agents"
reset
# A broken lib module with a derive is still loaded by everyone (march#1183), so
# isolation covers other suites and forge test wrappers only.
printf 'mod PhysicsTest do\n  this is not march\n' >"$work/test/physics_test.march"
printf 'mod ScoringSuite do\n  fn cases( broken\n' >"$work/test/suites/scoring_suite.march"
expect_green "another suite's broken files leave test-foundation green" suite foundation native
expect_green "another suite's broken files leave test-js-foundation green" suite foundation js

echo "== static gate"
gate() { (cd "$work" && scripts/check.sh); }
reset
expect_green "gate: the clean tree passes" gate
reset
cat >"$work/test/suites/planted_suite.march" <<'EOF'
mod PlantedSuite do
  fn f(x : Option(Int)) : Int do
    match x do
      Some(n) -> n
    end
  end
end
EOF
expect_red "gate: non-exhaustive match in test/" gate
reset
cat >"$work/shell/planted.march" <<'EOF'
mod Planted do
  fn f(x : Option(Int)) : Int do
    match x do
      Some(n) -> n
    end
  end
end
EOF
expect_red "gate: non-exhaustive match in shell/" gate
reset
cat >"$work/lib/skee/planted.march" <<'EOF'
mod Skee.Planted do
  cap pure

  fn f(x : Option(Int)) : Int needs () do
    match x do
      Some(n) -> n
    end
  end
end
EOF
expect_red "gate: non-exhaustive match in lib/" gate
reset
cat >"$work/test/suites/planted_suite.march" <<'EOF'
mod PlantedSuite do
  fn f() : Int do
    "not an int"
  end
end
EOF
expect_red "gate: a type error in test/" gate
reset
cat >"$work/test/suites/planted_suite.march" <<'EOF'
mod PlantedSuite do
  fn f(xs : List(Int)) : List(List(Int)) do
    [List.map(xs, fn x ->
      let y = x + 1
      y)]
  end
end
EOF
expect_red "gate: code the formatter would delete" "$work/scripts/format.sh" --check

echo "== browser build keeps constant-folded floats exact"
reset
cat >"$work/shell/game.march" <<'EOF'
mod Game do
  needs IO.Console

  fn main(_c : Cap(IO.Console)) : () do
    let exact = string_to_float("0.004166666666666667")
    println(if Some(1.0 /. 240.0) == exact do "folded exact" else "folded TRUNCATED" end)
  end
end
EOF
build_and_run() {
  (cd "$work" && "$@" >/dev/null 2>&1 && node .march/build/debug/skee.mjs)
}
fold_off() { build_and_run env MARCH_DISABLE_PASS=opt.fold forge build --target js | grep -q "folded exact"; }
fold_on() { build_and_run forge build --target js | grep -q "folded exact"; }
expect_green "forge build with opt.fold off computes 1/240 at run time" fold_off
expect_red "forge build with opt.fold on truncates (control: the bug is still real)" fold_on

rm -rf "$work"
echo "selftest: $passed passed, $failed failed"
[ "$failed" -eq 0 ]
