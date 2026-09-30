#!/usr/bin/env python3
"""spec_check — spec status lines, frozen specs stay frozen, specs predate the readings.

Usage:
  spec_check.py status   [--root DIR]
  spec_check.py frozen   --base REF [--root DIR]
  spec_check.py predates --base REF [--root DIR]
  spec_check.py facts    --base REF [--root DIR]

A spec is a specs/*.md file whose name doesn't start with `_`. Its id is its
file-name prefix (S-nnn), and its status is the first word after the first
column-0 `status:` in its header (the lines before the first `## ` heading):
draft, frozen or superseded (model S-003).

  status    every spec has a valid status, and every ledger `spec:` or
            `amends:` value names an existing spec.
  frozen    a spec that was frozen (or superseded) at REF, or every frozen
            version of it committed in REF..HEAD, must be unchanged at HEAD. The one
            allowed change is its status word becoming `superseded`, and only
            when a ledger entry added in REF..HEAD lists the spec in `amends:`.
            Deleting a frozen spec fails.
  predates  every ledger entry added in REF..HEAD with a `spec:` field: some
            commit in which the spec is frozen is a strict ancestor of every
            commit in REF..HEAD that introduces the entry (L-0028). A
            `spec_blob:` must equal the spec's blob at one such commit.
  facts     every spec frozen at HEAD but not frozen (or superseded) at REF
            (model S-005 AC5) has a "Facts relied on" section; each fact in it
            (a top-level list item) carries evidence: a path with a line
            (file.py:12), a command in backticks, or a docs/research/ citation;
            and each known limit that names platform behaviour carries the same.
            Known limits are the items of a "Known limits" section and the
            facts-section items labelled "Known limit(s)". Items marked "above
            tier" (recorded by a reviewer after review) and "none" are skipped.
            Warn-only below T2 unless governance/enforcement.toml names
            spec_check.facts; the warning cites model L-0052. In a v3
            project (governance/v3.toml exists) it is enforced at every
            tier unless enforcement.toml sets it to warn-only (model S-009 AC6).

`frozen` and `predates` read committed content only (REF and HEAD), not the
working tree. Commit hashes in messages identify the commits involved.
Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402

AMENDS_FIELD = "amends"
SPEC_FIELD = "spec"
BLOB_FIELD = "spec_blob"


def _rel(name):
    return "%s/%s" % (g.SPECS_REL, name)


def check_status(root):
    """Return (violations, notes)."""
    v, notes = [], []
    names = g.spec_files(root)
    if not names:
        notes.append("NOTE: no spec files in %s/" % g.SPECS_REL)
    ids = {}
    for name in names:
        rel = _rel(name)
        sid = g.spec_id(name)
        if sid is None:
            v.append("%s: the file name must start with a spec id (S- and 3+ digits, then '-' or '.md')" % rel)
        elif sid in ids:
            v.append("%s: spec id %s is also used by %s — each spec id names one file" % (rel, sid, ids[sid]))
        else:
            ids[sid] = rel
        status, _ = g.spec_status(g.read_text(os.path.join(root, rel)), where=rel)
        if status is None:
            v.append("%s: no 'status:' line in the header (the lines before the first '## ' heading)" % rel)
        elif status not in g.SPEC_STATUSES:
            v.append("%s: status %r is not one of: %s" % (rel, status, ", ".join(g.SPEC_STATUSES)))
    ledger_path = os.path.join(root, g.LEDGER_REL)
    if not os.path.isfile(ledger_path):
        notes.append("NOTE: no %s; no ledger spec references to check" % g.LEDGER_REL)
        return v, notes
    _, entries = g.parse_ledger(g.read_text(ledger_path))
    for e in entries:
        where = "%s line %d (%s)" % (g.LEDGER_REL, e.lineno, e.id)
        value = e.get(SPEC_FIELD)
        if value is not None:
            sid = g.strip_comment(value)
            if not g.SPEC_REF_RE.match(sid):
                v.append("%s: spec: %r is not a spec id (S-nnn)" % (where, sid))
            elif sid not in ids:
                v.append("%s: spec: %s names no spec file in %s/" % (where, sid, g.SPECS_REL))
        refs, err = g.parse_id_list(e.get(AMENDS_FIELD), g.SPEC_REF_RE, "amends")
        if err:
            v.append("%s: %s" % (where, err))
        for sid in refs:
            if sid not in ids:
                v.append("%s: amends %s, which names no spec file in %s/" % (where, sid, g.SPECS_REL))
    return v, notes


def _frozen_in(root, rel, rev_range):
    """[(sha, text)] for every commit in rev_range (oldest first) that changes `rel` and leaves it frozen."""
    out = []
    for sha in g.rev_list(root, ["--reverse", "--topo-order", "--full-history", rev_range, "--", "./" + rel]):
        text = g.git_text(root, sha, rel, newline="")
        if text is not None and g.spec_status(text)[0] == "frozen":
            out.append((sha, text))
    return out


def _amended_ids(entries):
    out = {}
    for e in entries:
        refs, err = g.parse_id_list(e.get(AMENDS_FIELD), g.SPEC_REF_RE, "amends")
        for sid in refs:
            out.setdefault(sid, []).append(e.id)
    return out


def _frozen_problem(rel, sid, baseline, since, new, amended):
    """The violation, if any, of HEAD's text `new` against one frozen or superseded version."""
    if new is None:
        return ("%s: a frozen spec (frozen %s) was deleted — frozen specs are immutable; "
                "set its status to 'superseded' instead" % (rel, since))
    if new == baseline:
        return None
    old_status, span = g.spec_status(baseline)
    if old_status == "superseded":
        return "%s: a superseded spec (%s) was changed — superseded specs are immutable" % (rel, since)
    expected = baseline[:span[0]] + "superseded" + baseline[span[1]:]
    if new != expected:
        return ("%s: a frozen spec (frozen %s) was changed — the only change allowed is its status "
                "word becoming 'superseded', with a ledger entry that lists it in amends:" % (rel, since))
    if sid not in amended:
        return ("%s: status moved from frozen to superseded, but no ledger entry added since the base ref "
                "lists %s in amends:" % (rel, sid))
    return None


def check_frozen(root, base):
    """Return (violations, notes)."""
    g.verify_commit(root, base)
    g.verify_commit(root, "HEAD", "HEAD")
    names = sorted(set(g.spec_files_at(root, base)) | set(g.spec_files_at(root, "HEAD")))
    amended = _amended_ids(g.added_ledger_entries(root, base))
    v, notes = [], []
    protected = 0
    for name in names:
        rel = _rel(name)
        sid = g.spec_id(name)
        # Every version to hold HEAD against: the base's, when frozen or superseded there;
        # else each frozen version committed in BASE..HEAD, whatever the merge order.
        old = g.git_text(root, base, rel, newline="")
        if old is not None and g.spec_status(old)[0] in ("frozen", "superseded"):
            baselines = [(old, "at the base ref")]
        else:
            baselines, seen = [], set()
            for sha, text in _frozen_in(root, rel, "%s..HEAD" % base):
                if text not in seen:
                    seen.add(text)
                    baselines.append((text, "since commit %s" % sha[:12]))
        if not baselines:
            continue
        protected += 1
        new = g.git_text(root, "HEAD", rel, newline="")
        for baseline, since in baselines:
            problem = _frozen_problem(rel, sid or name, baseline, since, new, amended)
            if problem:
                v.append(problem)
                break
    notes.append("NOTE: %d frozen or superseded spec(s) compared with HEAD" % protected)
    return v, notes


def _introducing_commits(root, base, wanted):
    """{entry id: [sha]}: every commit in BASE..HEAD whose ledger holds the entry while
    none of its parents' ledgers does (L-0028)."""
    cache = {}

    def ids_at(sha):
        if sha not in cache:
            cache[sha] = set(e.id for e in g.ledger_entries_at(root, sha))
        return cache[sha]

    shas = g.rev_list(root, ["--full-history", "--topo-order", "--reverse", "%s..HEAD" % base,
                             "--", "./" + g.LEDGER_REL])
    out = {}
    for c in g.read_commits(root, shas):
        for eid in ids_at(c.sha) & wanted:
            if not any(eid in ids_at(p) for p in c.parents):
                out.setdefault(eid, []).append(c.sha)
    return out


def _frozen_commits(root, rel):
    """Every commit reachable from HEAD that changes `rel` and leaves it frozen, oldest first."""
    out = []
    for sha in g.rev_list(root, ["--full-history", "--topo-order", "--reverse", "HEAD", "--", "./" + rel]):
        text = g.git_text(root, sha, rel, newline="")
        if text is not None and g.spec_status(text)[0] == "frozen":
            out.append(sha)
    return out


def check_predates(root, base):
    """Return (violations, notes).

    An entry passes when some commit in which its spec is frozen is a strict
    ancestor of every commit in BASE..HEAD that introduces the entry (L-0028).
    A spec_blob must equal the spec's blob at one such commit."""
    g.verify_commit(root, base)
    g.verify_commit(root, "HEAD", "HEAD")
    entries = [e for e in g.added_ledger_entries(root, base) if e.get(SPEC_FIELD) is not None]
    v, notes = [], []
    if not entries:
        return v, ["NOTE: no ledger entry with a spec: field was added since the base ref"]
    introduced = _introducing_commits(root, base, set(e.id for e in entries))
    head_specs = {}
    for name in g.spec_files_at(root, "HEAD"):
        sid = g.spec_id(name)
        if sid:
            head_specs.setdefault(sid, []).append(name)
    frozen = {}
    for e in entries:
        where = "%s (%s)" % (g.LEDGER_REL, e.id)
        sid = g.strip_comment(e.get(SPEC_FIELD))
        if not g.SPEC_REF_RE.match(sid):
            v.append("%s: spec: %r is not a spec id (S-nnn)" % (where, sid))
            continue
        files = head_specs.get(sid, [])
        if len(files) != 1:
            v.append("%s: spec: %s must name exactly one spec file at HEAD (found %d)" % (where, sid, len(files)))
            continue
        rel = _rel(files[0])
        if rel not in frozen:
            frozen[rel] = _frozen_commits(root, rel)
        e_shas = introduced.get(e.id, [])
        if not frozen[rel]:
            v.append("%s: reports against %s, but %s was never frozen in a commit reachable from HEAD — "
                     "freeze the spec before reporting results against it" % (where, sid, rel))
            continue
        if not e_shas:
            v.append("%s: cannot find the commit in %s..HEAD that added this entry" % (where, base))
            continue
        qualifying = [f for f in frozen[rel]
                      if all(f != x and g.git_ok(root, ["merge-base", "--is-ancestor", f, x]) for x in e_shas)]
        if not qualifying:
            v.append("%s: reports against %s, but no commit in which the spec is frozen is a strict ancestor of "
                     "every commit that added the entry (%s) — freeze the spec in an earlier commit"
                     % (where, sid, ", ".join(x[:12] for x in e_shas)))
            continue
        blob = e.get(BLOB_FIELD)
        if blob is not None:
            blob = g.strip_comment(blob)
            if not g.SHA_RE.match(blob):
                v.append("%s: spec_blob %r is not a 40-hex blob id" % (where, blob))
                continue
            blobs = [g.git(root, ["rev-parse", "%s:./%s" % (f, rel)]).decode().strip() for f in qualifying]
            if blob.lower() not in [b.lower() for b in blobs]:
                v.append("%s: spec_blob %s does not match %s as frozen before the entry (blob %s)"
                         % (where, blob, rel, ", ".join(sorted(set(blobs)))))
    notes.append("NOTE: %d ledger entr%s with a spec: field checked" % (len(entries), "y" if len(entries) == 1 else "ies"))
    return v, notes


# --------------------------------------------------------------------------
# facts: the facts lint for a spec being frozen (model S-005 AC5). Text heuristics.


_HEADING_RE = re.compile(r"^#{1,2} ")
_FACTS_HEADING_RE = re.compile(r"^## +facts relied on\b", re.I)
_LIMITS_HEADING_RE = re.compile(r"^## +known limits?\b", re.I)
_ITEM_RE = re.compile(r"^[-*+] +(.*)$")
_FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})")
# Evidence: a path with a line, a path plus a bare ":line", a spike, or a command.
_PATH_LINE_RE = re.compile(r"(?:[\w.-]+/)*[\w-][\w.-]*\.[A-Za-z0-9]+:\d+|(?:[\w.-]+/)+[\w.-]*:\d+")
_PATH_RE = re.compile(r"(?:[\w.-]+/)+[\w.-]+|\b[\w-]+\.(?:py|sh|ya?ml|toml|md|json|js|ts|txt)\b")
_BARE_LINE_RE = re.compile(r"(?<![\w/.:]):\d+\b")
_RESEARCH_RE = re.compile(r"docs/research/")
_CODE_RE = re.compile(r"`([^`]+)`")
COMMANDS = frozenset((
    "git", "gh", "python", "python3", "bash", "sh", "curl", "wget", "grep", "rg", "ls", "cat", "find",
    "npm", "npx", "node", "pip", "pip3", "make", "go", "cargo", "jq", "wc", "diff", "sed", "awk", "head",
    "tail", "docker", "wrangler", "kubectl", "terraform", "sqlite3", "psql", "dig", "openssl", "env",
))
_LIMIT_LABEL_RE = re.compile(r"^[*_\s]*known limits?\b", re.I)
_NONE_RE = re.compile(r"^[*_\s]*(?:known limits?\b[^:]*:)?[*_\s:]*none\b", re.I)
_ABOVE_TIER_RE = re.compile(r"\babove[ -]tier\b", re.I)
# Words that name a platform's behaviour, for known limits.
_PLATFORM_RE = re.compile(
    r"\b(?:github|gitlab|bitbucket|git|actions?|workflows?|runners?|ubuntu|linux|macos|windows|apis?|"
    r"https?|tokens?|webhooks?|browsers?|cloudflare|aws|gcp|azure|docker|containers?|npm|pypi|pip|python|"
    r"node|dns|cdn|platforms?|ci|cron|rate[ -]limits?|quotas?|sdk|oauth|ssh|os)\b", re.I)


def _is_command(text):
    text = text.strip()
    if text.startswith("$ "):
        return True
    words = text.split()
    if len(words) < 2:
        return False
    first = words[0]
    return (first in COMMANDS or first.startswith("./")
            or re.match(r"^[\w./-]+\.(?:py|sh)$", first) is not None)


def has_evidence(text, code_lines=()):
    """True when an item's text cites a path with a line, a docs/research/ spike, or a command."""
    if _PATH_LINE_RE.search(text) or _RESEARCH_RE.search(text):
        return True
    if _PATH_RE.search(text) and _BARE_LINE_RE.search(text):
        return True
    if any(_is_command(span) for span in _CODE_RE.findall(text)):
        return True
    return any(_is_command(line) for line in code_lines)


def section_items(text):
    """{'facts': [...], 'limits': [...], 'has_facts': bool}. Each item is (line number, text, code lines):
    a top-level list item with its continuation lines, and any fenced block that follows it."""
    out = {"facts": [], "limits": [], "has_facts": False}
    section = None
    item = None          # [lineno, [text lines], [code lines]]
    in_fence = False
    blank = False

    def close():
        if item is not None and section is not None:
            out[section].append((item[0], "\n".join(item[1]), item[2]))

    for n, raw in enumerate(text.split("\n"), 1):
        line = raw.rstrip("\r")
        if in_fence:
            if _FENCE_RE.match(line):
                in_fence = False
            elif item is not None:
                item[2].append(line)
            continue
        if _HEADING_RE.match(line):
            close()
            item = None
            if _FACTS_HEADING_RE.match(line):
                section = "facts"
                out["has_facts"] = True
            elif _LIMITS_HEADING_RE.match(line):
                section = "limits"
            else:
                section = None
            continue
        if section is None:
            continue
        if _FENCE_RE.match(line):
            in_fence = True
            continue
        m = _ITEM_RE.match(line)
        if m:
            close()
            item = [n, [m.group(1)], []]
        elif not line.strip():
            blank = True
            continue
        elif item is not None and (line[0].isspace() or not blank):
            item[1].append(line.strip())
        else:
            close()
            item = None
        blank = False
    close()
    return out


FACTS_MISSING = ("%s: frozen without a 'Facts relied on' section — list each fact the spec relies on, "
                 "with its evidence")
FACT_NO_EVIDENCE = ("%s line %d: a fact without evidence — cite a path with a line (file.py:12), a command, "
                    "or a docs/research/ spike")
LIMIT_NO_EVIDENCE = ("%s line %d: a known limit that names platform behaviour, without evidence — give it the "
                     "same evidence as a fact, or spike it first")


def facts_violations(rel, text):
    """The facts lint for one spec's text."""
    items = section_items(text)
    if not items["has_facts"]:
        return [FACTS_MISSING % rel]
    v = []
    limits = list(items["limits"])
    for lineno, body, code in items["facts"]:
        if _LIMIT_LABEL_RE.match(body):
            limits.append((lineno, body, code))
        elif not has_evidence(body, code):
            v.append(FACT_NO_EVIDENCE % (rel, lineno))
    for lineno, body, code in sorted(limits):
        if _NONE_RE.match(body) or _ABOVE_TIER_RE.search(body):
            continue
        if _PLATFORM_RE.search(body) and not has_evidence(body, code):
            v.append(LIMIT_NO_EVIDENCE % (rel, lineno))
    return v


def check_facts(root, base):
    """Return (violations, notes) for every spec frozen at HEAD but not at the base ref."""
    g.verify_commit(root, base)
    g.verify_commit(root, "HEAD", "HEAD")
    v, checked = [], 0
    for name in g.spec_files_at(root, "HEAD"):
        rel = _rel(name)
        new = g.git_text(root, "HEAD", rel)
        if new is None or g.spec_status(new)[0] != "frozen":
            continue
        old = g.git_text(root, base, rel)
        if old is not None and g.spec_status(old)[0] in ("frozen", "superseded"):
            continue
        checked += 1
        v.extend(facts_violations(rel, new))
    return v, ["NOTE: %d spec(s) frozen since the base ref checked for facts" % checked]


CHECKS = {"status": check_status, "frozen": check_frozen, "predates": check_predates, "facts": check_facts}
OK_MESSAGES = {
    "status": "every spec has a valid status and every ledger spec reference resolves",
    "frozen": "no frozen spec changed since the base ref",
    "predates": "every spec-reporting ledger entry follows its spec's freeze",
    "facts": "every spec frozen since the base ref lists its facts and known limits with evidence",
}


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="spec_check.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    for name in ("status", "frozen", "predates", "facts"):
        p = sub.add_parser(name, allow_abbrev=False)
        p.add_argument("--root", default=".")
        if name != "status":
            p.add_argument("--base", required=True)
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    try:
        enforcement = None
        if args.cmd == "status":
            v, notes = check_status(args.root)
        else:
            v, notes = CHECKS[args.cmd](args.root, args.base)
        if args.cmd == "facts":
            # Warn-only below T2 unless enforcement.toml names it (model S-005 AC5).
            tier, note = g.read_tier(args.root)
            notes = ([note] if note else []) + notes
            # In a v3 project the tier default does not apply (model S-009 AC6).
            enforcement = g.apply_tier_defaults(g.load_enforcement(args.root), tier, v3=g.is_v3(args.root))
        return g.report(args.root, [("spec_check." + args.cmd, line) for line in v], notes, OK_MESSAGES[args.cmd],
                        enforcement=enforcement)
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
