#!/usr/bin/env python3
"""ledger_check — enforce the append-only, well-formed decision ledger.

Usage:
  ledger_check.py check [--root DIR] [--ledger PATH] [--base REF]

Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402


def content_violations(ledger_rel, text):
    """Rules about the ledger's current content."""
    v = []
    _, entries = g.parse_ledger(text)
    first_seen = {}
    earlier = set()
    for e in entries:
        where = "%s line %d (%s)" % (ledger_rel, e.lineno, e.id)
        if e.id in first_seen:
            v.append("%s: duplicate ledger ID %s (first at line %d) — IDs must be unique"
                     % (where, e.id, first_seen[e.id]))
        else:
            first_seen[e.id] = e.lineno
        date = e.get("date")
        if date is None:
            v.append("%s: missing 'date:' field" % where)
        elif not g.valid_date(date):
            v.append("%s: date %r is not a YYYY-MM-DD date" % (where, date))
        etype = e.get("type")
        if etype is None:
            v.append("%s: missing 'type:' field" % where)
        elif etype not in g.LEDGER_TYPES:
            v.append("%s: type %r is not one of: %s" % (where, etype, ", ".join(g.LEDGER_TYPES)))
        expires = e.get("expires")
        if expires is not None and expires != "never" and not g.valid_date(expires):
            v.append("%s: expires %r must be a YYYY-MM-DD date or 'never'" % (where, expires))
        ids, err = g.parse_supersedes(e.get("supersedes"))
        if err:
            v.append("%s: %s" % (where, err))
        for sid in ids:
            if sid not in earlier:
                v.append("%s: supersedes %s, which does not appear earlier in the ledger" % (where, sid))
        earlier.add(e.id)
    return v, len(entries)


def prefix_violations(root, ledger_rel, current_bytes, base):
    """The ledger at BASE must be a byte-for-byte prefix of the current ledger."""
    if not g.git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % base]):
        raise g.UsageError("base ref %r is not a commit in %s" % (base, root))
    spec = "%s:./%s" % (base, ledger_rel)
    if not g.git_ok(root, ["cat-file", "-e", spec]):
        return [], "NOTE: %s did not exist at the base ref; append-only check skipped" % ledger_rel
    old = g.git(root, ["show", spec])
    if not current_bytes.startswith(old):
        return ["%s: the ledger was edited, not appended to — its content at the base ref is not a "
                "prefix of the current file (write a new entry instead, e.g. a correction)" % ledger_rel], None
    return [], None


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="ledger_check.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    p = sub.add_parser("check", allow_abbrev=False)
    p.add_argument("--root", default=".")
    p.add_argument("--ledger", default=g.LEDGER_REL)
    p.add_argument("--base")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if args.cmd != "check":
        parser.print_usage(sys.stderr)
        return 2
    try:
        ledger_rel = g.resolve_under_root(args.root, args.ledger, "--ledger")
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2
    path = os.path.join(args.root, ledger_rel)
    if not os.path.isfile(path):
        try:
            return g.report(args.root, [("ledger_check.entries", "%s: ledger file not found — every project keeps "
                                         "its decisions in %s" % (ledger_rel, ledger_rel))], [], "no ledger")
        except g.UsageError as exc:
            print("ERROR: %s" % exc, file=sys.stderr)
            return 2
    try:
        current = g.read_bytes(path)
        text = g.reject_bad_chars(g.decode_utf8(current, ledger_rel), ledger_rel)
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2
    try:
        cv, count = content_violations(ledger_rel, text)
        v = [("ledger_check.entries", line) for line in cv]
        notes = []
        if args.base:
            pv, note = prefix_violations(args.root, ledger_rel, current, args.base)
            v = [("ledger_check.append_only", line) for line in pv] + v
            if note:
                notes.append(note)
        return g.report(args.root, v, notes, "%s has %d well-formed entr%s%s" % (
            ledger_rel, count, "y" if count == 1 else "ies",
            "; append-only since the base ref" if args.base and not notes else ""))
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
