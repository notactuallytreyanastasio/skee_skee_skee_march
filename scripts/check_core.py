#!/usr/bin/env python3
"""Rules the compiler cannot enforce, as a script. Exit 1 on any violation.

    scripts/check_core.py [--root DIR] [--core DIR ...] [--other DIR ...] [--engine DIR ...]

Roots are relative to --root. The defaults are this repository's: core is
lib/ and arcade/lib/ (the game's pure core and the engine's), other is shell/,
test/ (generated goldens aside), the engine's test kit and the engine's own
suites (arcade/test/, copied rows aside) and the engine's web shell
(arcade/lib/arcade/web/, JS only), and the engine is arcade/. Every core root must hold March files, or the check refuses to pass.

Purity (core roots): the compiler misses Js.* and System.* from a module with no
needs lines, so this file is the only complete guard. Every rule below that
says "core" exists because a March bug would otherwise silently change
behaviour on the JS target, or because the formatter would destroy the code.
See "March gotchas" in docs/PORT.md for each one.

Engine (arcade/**): the arcade engine knows nothing of the game that uses it.
Its March files and .mjs/.js glue must not name a Skee. module or say "skee"
anywhere, comments and strings included. Engine code lives in arcade/ only:
a March file under lib/arcade/, where the engine began, is a stale copy. See
"Arcade engine" in docs/PORT.md.
"""
import argparse
import pathlib
import re
import sys

FORBIDDEN_MODULES = re.compile(
    r"\b(Js|System|File|Dir|Process|Http|HttpClient|HttpServer|Socket|Random|Logger|Env|Task|Actor)\."
)
FORBIDDEN_CALLS = re.compile(
    r"\b(println|print|eprintln|process_exit|process_argv|sys_uptime_ms|unix_time|unix_time_ms|file_read)\("
)
TYPE_DEF = re.compile(r"^\s*type\s+([A-Z][A-Za-z0-9_]*)")
FN_DEF = re.compile(r"^\s*p?fn\s+([a-z_][A-Za-z0-9_]*)\s*\(")
FLOAT_LITERAL = re.compile(r"(?<![\w.])(\d+)\.(\d+)(?![\w.])")
SKEE_MODULE = re.compile(r"\bSkee\.")
SKEE_WORD = re.compile(r"skee", re.I)


def code_only(line: str) -> str:
    """The line without strings and without a trailing -- comment."""
    out, i, in_string = [], 0, False
    while i < len(line):
        c = line[i]
        if in_string:
            if c == "\\":
                i += 2
                continue
            if c == '"':
                in_string = False
            i += 1
            continue
        if c == '"':
            in_string = True
            out.append('""')
            i += 1
            continue
        if line.startswith("--", i):
            break
        out.append(c)
        i += 1
    return "".join(out)


def significant_digits(whole: str, fraction: str) -> int:
    digits = (whole + fraction).lstrip("0").rstrip("0")
    return len(digits)


def check_source(path: pathlib.Path, text: str, core: bool, report) -> None:
    """Rules for every March file. `core` adds the purity rules for lib/."""
    lines = text.split("\n")
    in_doc = False
    for number, raw in enumerate(lines, 1):
        if raw.count('"""') % 2 == 1:
            in_doc = not in_doc
            continue
        if in_doc:
            continue
        line = code_only(raw)
        where = f"{path}:{number}"
        if re.match(r"^  let\s", line):
            report(where, "module-level let: broken on the JS target in any module but the entry; use a zero-argument fn")
        if re.search(r"\bMath\.(pi|tau|e)\b", line):
            report(where, "Math.pi, Math.tau and Math.e are truncated on JS; use the Skee.Consts record")
        if re.search(r"\bderive\b.*\bOrd\b", line):
            report(where, "derive Ord gives wrong answers on every backend; add an explicit rank")
        if re.search(r"\bmatch\s+do\b", line):
            report(where, "match do: forge format deletes its body; use if/else")
        if re.search(r"\bfn\s+negate\b", line):
            report(where, "a function named negate captures prefix minus and recurses forever")
        for match in FLOAT_LITERAL.finditer(line):
            if significant_digits(match.group(1), match.group(2)) > 12:
                report(where, f"Float literal {match.group(0)} has more than 12 significant digits: truncated on JS; add it to Skee.Consts")
        if core:
            found = FORBIDDEN_MODULES.search(line)
            if found:
                report(where, f"{found.group(0)} in the pure core")
            found = FORBIDDEN_CALLS.search(line)
            if found:
                report(where, f"{found.group(1)} in the pure core")
            if re.search(r"\bextern\b", line):
                report(where, "extern in the pure core")
            if re.match(r"^\s*needs\s", line):
                report(where, "needs line in the pure core: core modules declare no capabilities")
            if re.search(r"\bpanic\(", line):
                report(where, "panic in the pure core: return a Result or tighten the type")
            definition = FN_DEF.match(line)
            if definition:
                signature = line
                ahead = number
                while " do" not in signature and ahead < len(lines) and ahead < number + 12:
                    signature += " " + code_only(lines[ahead])
                    ahead += 1
                if "needs ()" not in signature:
                    report(where, f"fn {definition.group(1)} has no `needs ()` in its signature")
    if core and not re.search(r"^\s*cap pure\s*$", text, re.M):
        report(str(path), "core module without `cap pure`")


# Docs, manifests and scripts too: they ship in the published packages.
ENGINE_SUFFIXES = (".march", ".mjs", ".js", ".md", ".toml", ".sh", ".mk")
ENGINE_SKIP = {"node_modules", "build", "_build", ".forge"}


DEFAULT_CORE = ["lib", "arcade/lib", "arcade/physics/lib", "arcade/examples/putt/lib"]
DEFAULT_OTHER = ["shell", "test", "arcade/testkit/lib", "arcade/test", "arcade/lib/arcade/web", "arcade/examples/putt/test"]
# Directories under a core root that hold the impure shell instead: checked
# as non-core (an --other root above), never as core.
SHELL_PARTS = ("web",)
DEFAULT_ENGINE = ["arcade"]


def march_files(base: pathlib.Path) -> list:
    """March source under base, generated goldens and build output aside."""
    return [
        p for p in sorted(base.rglob("*.march"))
        if "golden" not in p.relative_to(base).parts and not ENGINE_SKIP.intersection(p.relative_to(base).parts)
    ]


def is_shell(base: pathlib.Path, path: pathlib.Path) -> bool:
    """A file of the engine's web shell (arcade/lib/arcade/web/), under a core root."""
    parts = path.relative_to(base).parts
    return len(parts) >= 3 and parts[0] == "arcade" and parts[1] in SHELL_PARTS


def engine_files(bases: list) -> list:
    """Files of the arcade engine (source, docs, manifests, scripts) under the engine roots."""
    found = []
    for base in bases:
        for path in sorted(base.rglob("*")):
            rel = path.relative_to(base).parts
            if path.is_file() and path.suffix in ENGINE_SUFFIXES and not ENGINE_SKIP.intersection(rel):
                found.append(path)
    return found


def check_engine(path: pathlib.Path, text: str, report) -> None:
    """The engine names no game: no Skee. module and no "skee" in any form."""
    for number, line in enumerate(text.split("\n"), 1):
        where = f"{path}:{number}"
        if SKEE_MODULE.search(line):
            report(where, "Skee. in the arcade engine: the engine must not depend on the game")
        elif SKEE_WORD.search(line):
            report(where, "\"skee\" in the arcade engine: no game concepts in the engine, comments and strings included")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--core", action="append", help="a pure-core root (repeatable)")
    parser.add_argument("--other", action="append", help="a non-core March root (repeatable)")
    parser.add_argument("--engine", action="append", help="an engine root (repeatable)")
    args = parser.parse_args()
    root = pathlib.Path(args.root)
    problems = []

    def report(where: str, message: str) -> None:
        problems.append(f"{where}: {message}")

    core_files = []
    for rel in args.core or DEFAULT_CORE:
        found = [p for p in march_files(root / rel) if not is_shell(root / rel, p)]
        if not found:
            print(f"no March files under {root / rel}: refusing to pass", file=sys.stderr)
            return 1
        core_files += found
    for path in core_files:
        check_source(path, path.read_text(), True, report)
    others = []
    for rel in args.other or DEFAULT_OTHER:
        others += march_files(root / rel)
    for path in others:
        check_source(path, path.read_text(), False, report)
    engine = engine_files([root / rel for rel in args.engine or DEFAULT_ENGINE])
    for path in engine:
        check_engine(path, path.read_text(), report)
    for path in sorted((root / "lib" / "arcade").rglob("*.march")):
        report(str(path), "engine code under lib/arcade/: since the carve-out the engine lives in arcade/lib/arcade/")

    # march#1183: a bare type name loads every module on the lib path that defines
    # a type of that name, so two suites sharing one tie their builds together.
    owners = {}
    for path in core_files + others:
        for number, line in enumerate(path.read_text().splitlines(), 1):
            found = TYPE_DEF.match(code_only(line))
            if found:
                owners.setdefault(found.group(1), []).append(f"{path}:{number}")
    for name, places in sorted(owners.items()):
        if len(places) > 1:
            report(places[1], f"type {name} is also defined at {places[0]} (march#1183: rename one)")

    for line in problems:
        print(line)
    if problems:
        print(f"check-core: {len(problems)} violation(s)")
        return 1
    print(f"check-core: {len(core_files)} core and {len(others)} other files clean ({len(engine)} engine)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
