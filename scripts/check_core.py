#!/usr/bin/env python3
"""Rules the compiler cannot enforce, as a script. Exit 1 on any violation.

    scripts/check_core.py [--root DIR]

Purity (under lib/): the compiler misses Js.* and System.* from a module with no
needs lines, so this file is the only complete guard. Every rule below that
says "lib/" exists because a March bug would otherwise silently change
behaviour on the JS target, or because the formatter would destroy the code.
See "March gotchas" in docs/PORT.md for each one.
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
FN_DEF = re.compile(r"^\s*p?fn\s+([a-z_][A-Za-z0-9_]*)\s*\(")
FLOAT_LITERAL = re.compile(r"(?<![\w.])(\d+)\.(\d+)(?![\w.])")


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


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    root = pathlib.Path(parser.parse_args().root)
    problems = []

    def report(where: str, message: str) -> None:
        problems.append(f"{where}: {message}")

    core_files = sorted((root / "lib").rglob("*.march"))
    if not core_files:
        print(f"no March files under {root / 'lib'}: refusing to pass", file=sys.stderr)
        return 1
    for path in core_files:
        check_source(path, path.read_text(), True, report)
    others = sorted((root / "shell").rglob("*.march")) + [
        p for p in sorted((root / "test").rglob("*.march")) if "golden" not in p.parts
    ]
    for path in others:
        check_source(path, path.read_text(), False, report)

    for line in problems:
        print(line)
    if problems:
        print(f"check-core: {len(problems)} violation(s)")
        return 1
    print(f"check-core: {len(core_files)} core and {len(others)} other files clean")
    return 0


if __name__ == "__main__":
    sys.exit(main())
