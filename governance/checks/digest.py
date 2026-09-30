#!/usr/bin/env python3
"""digest — generate docs/DIGEST.md and per-scope packs from the ledger.

Usage:
  digest.py build [--root DIR] [--ledger PATH] [--out PATH] [--packs DIR] [--max-words N]
  digest.py check [same options]

`build` writes the digest and packs (and removes stale pack files).
`check` regenerates in memory and fails on any difference, on a stale pack
file, or on a pack over the word budget.
Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402

RULING_TYPES = ("ruling", "delegation", "defaulted", "tier-change",
                "predeclaration", "rule-experiment")
UNSCOPED = "(unscoped)"
DECISION_WORDS = 25


def escape_cell(text):
    return text.replace("|", "\\|")


def truncate_words(text, n=DECISION_WORDS):
    words = text.split()
    if len(words) > n:
        return " ".join(words[:n]) + " …"
    return " ".join(words)


def slugify(scope):
    if scope == UNSCOPED:
        return "unscoped"
    return re.sub(r"[^a-z0-9]+", "-", scope.lower()).strip("-")


class Row(object):
    def __init__(self, entry):
        self.id = entry.id
        scope = (entry.get("scope") or "").strip()
        self.scope = scope if scope else UNSCOPED
        decision = (entry.get("decision") or "").strip()
        self.decision = decision if decision else entry.title
        self.since = entry.get("date") or ""
        expires = (entry.get("expires") or "").strip()
        self.expires = expires if expires else "never"


def classify(entries):
    """Return (as_of, active_rows, kill_rows)."""
    superseded = set()
    for i, e in enumerate(entries):
        ids, _ = g.parse_supersedes(e.get("supersedes"))
        earlier = set(x.id for x in entries[:i])
        for sid in ids:
            if sid in earlier:
                superseded.add(sid)
    dates = [e.get("date") for e in entries if g.valid_date(e.get("date"))]
    as_of = max(dates) if dates else None
    active, kills = [], []
    for e in entries:
        if e.id in superseded:
            continue
        etype = e.get("type")
        if etype == "kill":
            kills.append(Row(e))
        elif etype in RULING_TYPES:
            exp = e.get("expires")
            if as_of and g.valid_date(exp) and exp < as_of:
                continue
            active.append(Row(e))
    key = lambda r: g.id_sort_key(r.id)  # noqa: E731
    return as_of, sorted(active, key=key), sorted(kills, key=key)


def ruling_table(rows):
    lines = ["| ID | Decision | Since | Expires |", "| --- | --- | --- | --- |"]
    for r in rows:
        lines.append("| %s | %s | %s | %s |" % (
            escape_cell(r.id), escape_cell(truncate_words(r.decision)),
            escape_cell(r.since), escape_cell(r.expires)))
    return lines


def kill_table(rows):
    lines = ["| ID | Scope | Decision |", "| --- | --- | --- |"]
    for r in rows:
        lines.append("| %s | %s | %s |" % (
            escape_cell(r.id), escape_cell(r.scope), escape_cell(truncate_words(r.decision))))
    return lines


def by_scope(rows):
    out = {}
    for r in rows:
        out.setdefault(r.scope, []).append(r)
    return out


def render_digest(ledger_rel, entries):
    as_of, active, kills = classify(entries)
    lines = ["# DIGEST — generated from %s; do not edit by hand" % ledger_rel,
             "As of %s: %d active rulings and %d kills, from %d ledger entries."
             % (as_of or "(no dated entries)", len(active), len(kills), len(entries)),
             "",
             "## Active rulings",
             ""]
    groups = by_scope(active)
    if not groups:
        lines.append("None.")
        lines.append("")
    for scope in sorted(groups):
        lines.append("### %s" % scope)
        lines.extend(ruling_table(groups[scope]))
        lines.append("")
    lines.append("## Kills")
    if kills:
        lines.extend(kill_table(kills))
    else:
        lines.append("None.")
    return "\n".join(lines) + "\n"


def render_pack(scope, active, kills):
    lines = ["# Scope pack: %s — generated; do not edit" % scope, "", "## Active rulings"]
    lines.extend(ruling_table(active) if active else ["None."])
    lines.extend(["", "## Kills"])
    lines.extend(kill_table(kills) if kills else ["None."])
    return "\n".join(lines) + "\n"


def generate(ledger_rel, text, packs_rel):
    """Return (digest_text, {pack_rel_path: text}, problems)."""
    _, entries = g.parse_ledger(text)
    _, active, kills = classify(entries)
    digest = render_digest(ledger_rel, entries)
    a_groups, k_groups = by_scope(active), by_scope(kills)
    packs, problems, slugs = {}, [], {}
    for scope in sorted(set(a_groups) | set(k_groups)):
        slug = slugify(scope)
        if not slug:
            problems.append("scope %r has no letters or digits, so it has no pack file name" % scope)
            continue
        if slug in slugs:
            problems.append("scopes %r and %r both map to pack %s/%s.md — make the scopes distinct"
                            % (slugs[slug], scope, packs_rel, slug))
            continue
        slugs[slug] = scope
        packs["%s/%s.md" % (packs_rel, slug)] = render_pack(scope, a_groups.get(scope, []), k_groups.get(scope, []))
    return digest, packs, problems


def existing_packs(root, packs_rel, out_rel):
    """Pack files on disk. The digest file itself is never a pack, even when
    --out sits inside the packs directory."""
    d = os.path.join(root, packs_rel)
    if not os.path.isdir(d):
        return []
    return sorted(rel for rel in ("%s/%s" % (packs_rel, n) for n in os.listdir(d)
                                  if n.endswith(".md") and os.path.isfile(os.path.join(d, n)))
                  if rel != out_rel)


def read_or_none(path):
    """The file's text (line endings untranslated), or None when it cannot be
    opened. A file that is not valid UTF-8 is a UsageError (exit 2)."""
    try:
        with open(path, "rb") as fh:
            data = fh.read()
    except OSError:
        return None
    return g.decode_utf8(data, path)


def write_text(path, text):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)


def budget_violations(packs, max_words):
    v = []
    for rel in sorted(packs):
        n = len(packs[rel].split())
        if n > max_words:
            v.append("%s: %d words, over the %d-word pack budget — consolidate with a superseding ledger entry"
                     % (rel, n, max_words))
    return v


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="digest.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    for name in ("build", "check"):
        p = sub.add_parser(name, allow_abbrev=False)
        p.add_argument("--root", default=".")
        p.add_argument("--ledger", default=g.LEDGER_REL)
        p.add_argument("--out", default="docs/DIGEST.md")
        p.add_argument("--packs", default="digest")
        p.add_argument("--max-words", type=int, default=1100)
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if args.cmd not in ("build", "check"):
        parser.print_usage(sys.stderr)
        return 2
    try:
        return run(args)
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


def run(args):
    root = args.root
    ledger_rel = g.resolve_under_root(root, args.ledger, "--ledger")
    out_rel = g.resolve_under_root(root, args.out, "--out")
    packs_rel = g.resolve_under_root(root, args.packs, "--packs")
    text = read_or_none(os.path.join(root, ledger_rel))
    if text is None:
        print("ERROR: ledger %s not found under %s" % (ledger_rel, root), file=sys.stderr)
        return 2
    # The ledger is a governance file (L-0013); the digest outputs are not.
    g.reject_bad_chars(text, os.path.join(root, ledger_rel))
    digest, packs, problems = generate(ledger_rel, text, packs_rel)
    v = ["%s: %s" % (ledger_rel, p) for p in problems]
    if out_rel in packs:
        v.append("%s: the digest path is also the path of a scope pack — choose a different --out or --packs"
                 % out_rel)

    if args.cmd == "build":
        write_text(os.path.join(root, out_rel), digest)
        for rel in sorted(packs):
            write_text(os.path.join(root, rel), packs[rel])
        removed = [rel for rel in existing_packs(root, packs_rel, out_rel) if rel not in packs]
        for rel in removed:
            os.remove(os.path.join(root, rel))
            print("removed stale pack %s" % rel)
        v.extend(budget_violations(packs, args.max_words))
        if v:
            for line in v:
                print(line)
            print("FAIL: %d violation(s) (files were written)" % len(v))
            return 1
        print("OK: wrote %s and %d scope pack(s) in %s/" % (out_rel, len(packs), packs_rel))
        return 0

    if read_or_none(os.path.join(root, out_rel)) != digest:
        v.append("%s: out of date or hand-edited — regenerate it with digest.py build, never edit it by hand" % out_rel)
    for rel in sorted(packs):
        if read_or_none(os.path.join(root, rel)) != packs[rel]:
            v.append("%s: missing, out of date or hand-edited — regenerate it with digest.py build" % rel)
    for rel in existing_packs(root, packs_rel, out_rel):
        if rel not in packs:
            v.append("%s: stale pack — no active ruling or kill has this scope; delete it or run digest.py build" % rel)
    v.extend(budget_violations(packs, args.max_words))
    return g.report(root, [("digest.check", line) for line in v], [],
                    "%s and %d scope pack(s) match %s" % (out_rel, len(packs), ledger_rel))


if __name__ == "__main__":
    sys.exit(main())
