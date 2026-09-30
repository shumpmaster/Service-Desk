#!/usr/bin/env python3
"""v3_checks — the v3 checks that read a project's own records (model S-009).

Usage:
  v3_checks.py ready    [--root DIR]
  v3_checks.py trace    [--root DIR]
  v3_checks.py joins    [--root DIR]
  v3_checks.py scope    --base REF [--root DIR] [--default-branch NAME]
  v3_checks.py freeze   --base REF [--root DIR]
  v3_checks.py holdouts --base REF [--root DIR]

Every subcommand runs only in a v3 project: one with a governance/v3.toml file
(its presence is the switch; its content is not read). Without it, each one
prints a note and passes, so a v2.5.1 project is unaffected (AC1). A spec is a
specs/*.md file as spec_check reads it; "frozen" is its status word.

  ready     (AC4, D-052) once any spec is frozen (or superseded), each of the
            eight Part 1 sections of docs/PROJECT.md (`## 1.` to `## 8.`) has
            text beyond its instruction line. An instruction line is a line
            wholly wrapped in single asterisks (`*...*`).
  trace     (AC5, D-035) every criterion of a frozen spec (a line in its
            "Acceptance criteria" section starting `- **AC<n>` or `- AC<n>`,
            with its continuation lines) carries `[trace: V<k> → AC<n>]`: V<k>
            is a value target of docs/PROJECT.md section 6 (a line there
            starting `V<k>:`) and AC<n> is the criterion's own number. A frozen
            or superseded spec with no "Acceptance criteria" section fails.
  joins     (AC7, D-046) every join of a frozen spec (a line in its "Join
            sheets" section starting `- **J<n> —`) has a file under tests/
            containing `join-test: <spec id>/J<n>`. Known limit: this proves a
            marked test exists, not that it uses the real pieces. A frozen spec
            with no "Join sheets" section passes with a note naming it.
  scope     (AC3, D-048) walks each commit in REF..HEAD on its own. Every path
            a commit with a `Spec: S-nnn` trailer changes must match that
            spec's "Areas touched" globs (as the spec stands at that commit),
            an `extends_scope:` of a ledger entry added in REF..HEAD or since
            HEAD's merge base with the default branch (model S-013 AC8; NAME,
            else origin/HEAD, origin/main, main, as governance_checks scope), or a
            bookkeeping path (the ones governance_checks scope exempts). A
            builder-class commit without a Spec: trailer fails, except the
            Source checker's filings (model S-015 AC7): a commit by roster id
            `source-checker` whose every path is under library/** and that
            carries exactly one `Item: <item id>` naming a status file
            (status/<item>.toml) present at that commit. Orchestrator,
            Chief of Staff and human commits without a trailer are bounded by
            the surface map only (model S-010 AC3a: `chief-of-staff` writes
            before any spec exists).
            Merge commits and commits in the surface map's `exempt` block are
            skipped. Areas touched: comma-separated globs, one or more lines,
            optionally as list items or in backticks; an item holding a space
            is prose and ignored; `!` excludes and later items win.
  freeze    (AC6, D-043) every spec frozen at HEAD but not at REF: each commit
            in REF..HEAD that freezes it (frozen there, in none of its parents)
            holds reviews/<spec id>/plan.md whose verdict, read as review_check
            reads verdicts, is PASS. Its facts are checked by `spec_check facts`,
            which a v3 project enforces at every tier.
  holdouts  (AC8, D-054) when governance/HOLDOUTS.md changes in REF..HEAD (any
            commit touches it, or it differs between REF and HEAD), a ledger
            entry added in REF..HEAD has the field `holdouts: changed`.

Findings are reported under the check names v3_checks.<subcommand>, which
governance/enforcement.toml can set to warn-only.
Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402
import governance_checks  # noqa: E402
import review_check  # noqa: E402

PROJECT_REL = "docs/PROJECT.md"
HOLDOUTS_REL = "governance/HOLDOUTS.md"
TESTS_REL = "tests"
PART1_SECTIONS = 8
BUILDER = "builder"
CHIEF_OF_STAFF = "chief-of-staff"   # builder-class, but bounded by the surface map only (model S-010 AC3a)
SOURCE_CHECKER = "source-checker"   # files checked facts under library/** with `Item:` (model S-015 AC7)
_ITEM_ID_RE = re.compile(r"[PQE]-[0-9]+")

_H1_RE = re.compile(r"^# ")
_H2_RE = re.compile(r"^## ")
_SECTION_END_RE = re.compile(r"^#{1,2} ")
_NUMBERED_RE = re.compile(r"^## +(\d+)\.")
_TARGET_RE = re.compile(r"^(V\d+):")
_CRITERION_RE = re.compile(r"^- (?:\*\*)?AC(\d+)(?!\d)")
_TRACE_RE = re.compile(r"\[trace:\s*(V\d+)\s*→\s*AC(\d+)\s*\]")
_ITEM_RE = re.compile(r"^[-*+] ")
_JOIN_RE = re.compile(r"^- \*\*J(\d+) —")
_CRITERIA_HEADING_RE = re.compile(r"^## +acceptance criteria\b", re.I)
_JOINS_HEADING_RE = re.compile(r"^## +join sheets?\b", re.I)
_AREAS_HEADING_RE = re.compile(r"^## +areas touched\b", re.I)


# --------------------------------------------------------------------------
# Reading the records


def is_instruction_line(line):
    """True for a line wholly wrapped in single asterisks (`*...*`), not `**bold**`."""
    s = line.strip()
    return (len(s) >= 3 and s[0] == "*" and s[-1] == "*"
            and not s.startswith("**") and not s.endswith("**"))


def section(text, heading_re):
    """[(line number, line)] of the first `## ` section whose heading matches, up to the next
    `#` or `##` heading; None when there is no such section."""
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if heading_re.match(line):
            body = []
            for j in range(i + 1, len(lines)):
                if _SECTION_END_RE.match(lines[j]):
                    break
                body.append((j + 1, lines[j]))
            return body
    return None


def part1_sections(text):
    """{n: (heading, line number, [body line])} for the numbered `## n.` sections of Part 1.

    Part 1 runs from a `# Part 1` heading to the next `# ` heading; without one, from the
    top of the file to a `# Part 2` heading (or the end). The first `## n.` wins."""
    lines = text.split("\n")
    start, end = 0, len(lines)
    p1 = next((i for i, l in enumerate(lines) if l.startswith("# Part 1")), None)
    if p1 is not None:
        start = p1 + 1
        end = next((i for i in range(start, len(lines)) if _H1_RE.match(lines[i])), len(lines))
    else:
        end = next((i for i, l in enumerate(lines) if l.startswith("# Part 2")), len(lines))
    out = {}
    current = None
    for i in range(start, end):
        line = lines[i]
        if _SECTION_END_RE.match(line):
            current = None
            m = _NUMBERED_RE.match(line)
            if m and int(m.group(1)) not in out:
                current = int(m.group(1))
                out[current] = (line.rstrip(), i + 1, [])
            continue
        if current is not None:
            out[current][2].append(line)
    return out


def value_targets(text):
    """The value target IDs of the project document: lines of Part 1 section 6 starting `V<n>:`."""
    sec = part1_sections(text).get(6)
    if sec is None:
        return []
    out = []
    for line in sec[2]:
        m = _TARGET_RE.match(line)
        if m and m.group(1) not in out:
            out.append(m.group(1))
    return out


def criteria(text):
    """[(line number, n, [(V<k>, m)])] for each criterion of the Acceptance criteria section."""
    body = section(text, _CRITERIA_HEADING_RE) or []
    out = []
    current = None
    for lineno, line in body:
        m = _CRITERION_RE.match(line)
        if m:
            current = [lineno, m.group(1), [line]]
            out.append(current)
        elif current is not None and line.strip() and not _ITEM_RE.match(line):
            current[2].append(line)
        else:
            current = None
    return [(lineno, n, _TRACE_RE.findall(" ".join(block))) for lineno, n, block in out]


def joins(text):
    """[(line number, n)] for each `- **J<n> —` line of the Join sheets section."""
    body = section(text, _JOINS_HEADING_RE) or []
    out = []
    for lineno, line in body:
        m = _JOIN_RE.match(line)
        if m:
            out.append((lineno, m.group(1)))
    return out


def areas_touched(text):
    """The glob list of a spec's Areas touched section ([] when it has none)."""
    body = section(text, _AREAS_HEADING_RE) or []
    globs = []
    for _, line in body:
        line = line.strip()
        if _ITEM_RE.match(line):
            line = line[2:]
        for item in line.split(","):
            item = item.strip().strip("`").strip()
            if item and not any(ch.isspace() for ch in item):
                globs.append(item)
    return globs


def specs_with_status(root, statuses):
    """[(rel, spec id or None, text)] for every spec in the working tree whose status is in `statuses`."""
    out = []
    for name in g.spec_files(root):
        rel = "%s/%s" % (g.SPECS_REL, name)
        text = g.read_text(os.path.join(root, rel))
        if g.spec_status(text, where=rel)[0] in statuses:
            out.append((rel, g.spec_id(name), text))
    return out


def read_project(root):
    path = os.path.join(root, PROJECT_REL)
    return g.read_text(path) if os.path.isfile(path) else None


# --------------------------------------------------------------------------
# The checks. Each returns (violations, notes).


def check_ready(root):
    started = specs_with_status(root, ("frozen", "superseded"))
    if not started:
        return [], ["NOTE: no frozen spec yet; the definition of ready is not checked"]
    text = read_project(root)
    if text is None:
        return ["%s: missing — the project document's Part 1 must be complete once a spec is frozen (D-052)"
                % PROJECT_REL], []
    sections = part1_sections(text)
    v = []
    for n in range(1, PART1_SECTIONS + 1):
        if n not in sections:
            v.append("%s: no '## %d.' section in Part 1 — the definition of ready has eight sections (D-052)"
                     % (PROJECT_REL, n))
            continue
        heading, _, body = sections[n]
        if not any(line.strip() and not is_instruction_line(line) for line in body):
            v.append("%s: section '%s' has no content beyond its instruction line — Part 1 must be complete "
                     "once a spec is frozen (D-052)" % (PROJECT_REL, heading))
    return v, ["NOTE: %d frozen or superseded spec(s); %s Part 1 checked" % (len(started), PROJECT_REL)]


def check_trace(root):
    started = specs_with_status(root, ("frozen", "superseded"))
    frozen = specs_with_status(root, ("frozen",))
    text = read_project(root)
    targets = set(value_targets(text)) if text is not None else set()
    notes = ["NOTE: value targets in %s section 6: %s"
             % (PROJECT_REL, ", ".join(sorted(targets, key=lambda t: int(t[1:]))) or "none")]
    v, count = [], 0
    # A frozen or superseded spec whose criteria heading drifted must not pass unchecked.
    for rel, _, spec_text in started:
        if section(spec_text, _CRITERIA_HEADING_RE) is None:
            v.append("%s: no Acceptance criteria section found (a '## Acceptance criteria' heading) — its "
                     "criteria cannot be traced (D-035)" % rel)
    for rel, _, spec_text in frozen:
        for lineno, n, traces in criteria(spec_text):
            count += 1
            where = "%s line %d" % (rel, lineno)
            if not traces:
                v.append("%s: AC%s has no [trace: V<n> → AC%s] — drift from the value targets (D-035)"
                         % (where, n, n))
                continue
            for target, m in traces:
                if target not in targets:
                    v.append("%s: AC%s traces to %s, which is not a value target in %s section 6 — drift"
                             % (where, n, target, PROJECT_REL))
                if m != n:
                    v.append("%s: AC%s carries [trace: %s → AC%s], whose criterion number is not AC%s — drift"
                             % (where, n, target, m, n))
    notes.append("NOTE: %d criteri%s in %d frozen spec(s) checked" % (count, "on" if count == 1 else "a", len(frozen)))
    return v, notes


def _marker_texts(root):
    """The text of every file under tests/ (decoded leniently; unreadable files are skipped)."""
    base = os.path.join(root, TESTS_REL)
    out = []
    for d, dirs, files in os.walk(base):
        dirs[:] = sorted(x for x in dirs if x not in (".git", "__pycache__"))
        for f in sorted(files):
            try:
                with open(os.path.join(d, f), "rb") as fh:
                    out.append(fh.read().decode("utf-8", "replace"))
            except OSError:
                continue
    return out


def check_joins(root):
    frozen = specs_with_status(root, ("frozen",))
    wanted, notes = [], []
    for rel, sid, text in frozen:
        if section(text, _JOINS_HEADING_RE) is None:
            notes.append("NOTE: %s: no Join sheets section found (a '## Join sheets' heading); no joins read "
                         "from it" % rel)
        for lineno, n in joins(text):
            wanted.append((rel, lineno, sid or rel, n))
    if not wanted:
        return [], notes + ["NOTE: no joins in %d frozen spec(s)" % len(frozen)]
    texts = _marker_texts(root)
    v = []
    for rel, lineno, sid, n in wanted:
        marker = re.compile(r"join-test: %s/J%s(?!\d)" % (re.escape(sid), n))
        if not any(marker.search(t) for t in texts):
            v.append("%s line %d: join %s/J%s has no test — add a test under %s/ containing 'join-test: %s/J%s'"
                     % (rel, lineno, sid, n, TESTS_REL, sid, n))
    return v, notes + ["NOTE: %d join(s) in %d frozen spec(s) checked" % (len(wanted), len(frozen))]


def _spec_at(root, sha, sid, cache):
    """(rel, [glob]) of spec `sid` as it stands at commit `sha`, or (None, None)."""
    key = (sha, sid)
    if key not in cache:
        names = [n for n in g.spec_files_at(root, sha) if g.spec_id(n) == sid]
        if not names:
            cache[key] = (None, None)
        else:
            rel = "%s/%s" % (g.SPECS_REL, names[0])
            cache[key] = (rel, areas_touched(g.git_text(root, sha, rel) or ""))
    return cache[key]


def check_scope(root, base, default_branch=None):
    g.verify_commit(root, base)
    s = g.load_surfaces(root)
    roster = dict((r.id, r) for r in s.roster)
    exempt = s.exempt_map()
    # model S-013 AC8: extensions added since the merge base count too, as governance_checks scope counts them.
    extends, extends_note = governance_checks.scope_extensions(root, base, default_branch)
    commits = g.read_commits(root, g.rev_list(root, ["--reverse", "%s..HEAD" % base]))
    cache = {}
    v, notes = [], []
    merges = skipped = unscoped = scoped = filings = 0
    for c in commits:
        if c.is_merge():
            merges += 1
            continue
        if c.sha.lower() in exempt:
            skipped += 1
            notes.append("NOTE: %s: exempt (%s) — skipped" % (c.short, exempt[c.sha.lower()]))
            continue
        specs = c.trailer("Spec")
        agent = c.agent_id()
        if not specs:
            if agent == SOURCE_CHECKER and agent in roster and roster[agent].cls == BUILDER:
                why = _filing_problem(root, c)
                if why is None:
                    filings += 1
                else:
                    v.append("%s: builder commit by '%s' has no Spec: trailer and is not a filing: it %s — a "
                         "Source checker's filing carries one Item: naming a status file at that commit and "
                         "touches only library/** (model S-015 AC7)" % (c.short, agent, why))
            elif agent in roster and roster[agent].cls == BUILDER and agent != CHIEF_OF_STAFF:
                v.append("%s: builder commit by '%s' has no Spec: trailer — in v3 every piece of built work "
                         "traces to a spec (D-035)" % (c.short, agent))
            else:
                unscoped += 1
            continue
        if len(specs) > 1:
            v.append("%s: %d Spec: trailers — a commit is judged against exactly one spec" % (c.short, len(specs)))
            continue
        sid = specs[0]
        rel, globs = _spec_at(root, c.sha, sid, cache) if g.SPEC_REF_RE.match(sid) else (None, None)
        if rel is None:
            v.append("%s: Spec: %s names no spec file in %s/ at that commit" % (c.short, sid or "''", g.SPECS_REL))
            continue
        scoped += 1
        for path in g.commit_paths(root, c.sha):
            if any(g.glob_match(gl, path) for gl in governance_checks.BOOKKEEPING_GLOBS):
                continue
            if g.glob_list_includes(globs, path):
                continue
            if any(g.glob_list_includes(ext, path) for _, ext in extends):
                continue
            v.append("%s: %s: outside the Areas touched of %s (%s) — widen them with a ledger entry's "
                     "extends_scope: in the same range, or leave the path alone" % (c.short, path, sid, rel))
    notes.insert(0, extends_note)
    notes.insert(0, "NOTE: %d commit(s) in %s..HEAD: %d spec-scoped, %d without a Spec: trailer and not a "
                 "builder's, %d source-checker filing(s), %d merge(s) skipped, %d exempt%s"
                 % (len(commits), base, scoped, unscoped, filings, merges, skipped,
                    "; extended by %s" % ", ".join(i for i, _ in extends) if extends else ""))
    return v, notes


def _filing_problem(root, c):
    """None when a source-checker commit without Spec: is a filing (model S-015 AC7), else why not."""
    items = c.trailer("Item")
    if len(items) != 1 or not _ITEM_ID_RE.fullmatch(items[0]):
        return "has %s" % ("no Item: trailer" if not items else "an Item: that is not one item id")
    if g.git_blob(root, c.sha, "status/%s.toml" % items[0]) is None:
        return "names %s, which has no status file at that commit" % items[0]
    outside = [p for p in g.commit_paths(root, c.sha) if not g.glob_match("library/**", p)]
    if outside:
        return "touches %s, outside library/**" % outside[0]
    return None


def check_freeze(root, base):
    g.verify_commit(root, base)
    g.verify_commit(root, "HEAD", "HEAD")
    v, checked = [], 0
    for name in g.spec_files_at(root, "HEAD"):
        rel = "%s/%s" % (g.SPECS_REL, name)
        sid = g.spec_id(name)
        new = g.git_text(root, "HEAD", rel)
        if sid is None or new is None or g.spec_status(new)[0] != "frozen":
            continue
        old = g.git_text(root, base, rel)
        if old is not None and g.spec_status(old)[0] in ("frozen", "superseded"):
            continue
        checked += 1
        frozen_at = {}

        def is_frozen(sha):
            if sha not in frozen_at:
                text = g.git_text(root, sha, rel)
                frozen_at[sha] = text is not None and g.spec_status(text)[0] == "frozen"
            return frozen_at[sha]

        shas = g.rev_list(root, ["--full-history", "--topo-order", "--reverse", "%s..HEAD" % base, "--", "./" + rel])
        freezing = [c.sha for c in g.read_commits(root, shas)
                    if is_frozen(c.sha) and not any(is_frozen(p) for p in c.parents)]
        plan_rel = "reviews/%s/plan.md" % sid
        for sha in freezing:
            plan = g.git_text(root, sha, plan_rel)
            if plan is None:
                why = "none at that commit"
            else:
                verdict = review_check.parse_verdict(plan)
                if verdict == "PASS":
                    continue
                why = "its verdict is FAIL" if verdict == "FAIL" else "its verdict line is malformed"
            v.append("%s: frozen in commit %s without a plan-review record %s whose verdict is PASS (%s) — "
                     "the freeze gate (D-043) needs it in the freezing commit or earlier"
                     % (rel, sha[:12], plan_rel, why))
    return v, ["NOTE: %d spec(s) frozen since the base ref checked for a plan review" % checked]


def check_holdouts(root, base):
    g.verify_commit(root, base)
    g.verify_commit(root, "HEAD", "HEAD")
    touched = g.rev_list(root, ["--full-history", "%s..HEAD" % base, "--", "./" + HOLDOUTS_REL])
    changed = bool(touched) or g.git_blob(root, base, HOLDOUTS_REL) != g.git_blob(root, "HEAD", HOLDOUTS_REL)
    if not changed:
        return [], ["NOTE: %s unchanged in %s..HEAD" % (HOLDOUTS_REL, base)]
    marked = [e.id for e in g.added_ledger_entries(root, base)
              if e.get("holdouts") is not None and g.strip_comment(e.get("holdouts")) == "changed"]
    if marked:
        return [], ["NOTE: %s changed in %s..HEAD; recorded by %s" % (HOLDOUTS_REL, base, ", ".join(marked))]
    return ["%s changed in %s..HEAD, but no ledger entry added in the range has 'holdouts: changed' (D-054)"
            % (HOLDOUTS_REL, base)], []


CHECKS = {"ready": check_ready, "trace": check_trace, "joins": check_joins,
          "scope": check_scope, "freeze": check_freeze, "holdouts": check_holdouts}
RANGE_CHECKS = ("scope", "freeze", "holdouts")
OK_MESSAGES = {
    "ready": "the project document's Part 1 is complete, or no spec is frozen yet",
    "trace": "every criterion of a frozen spec traces to a value target",
    "joins": "every join of a frozen spec has a marked test",
    "scope": "every spec-scoped commit stays inside its spec's Areas touched",
    "freeze": "every spec frozen since the base ref has a PASS plan review at its freeze",
    "holdouts": "no unrecorded change to %s" % HOLDOUTS_REL,
}


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="v3_checks.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    for name in ("ready", "trace", "joins", "scope", "freeze", "holdouts"):
        p = sub.add_parser(name, allow_abbrev=False)
        p.add_argument("--root", default=".")
        if name in RANGE_CHECKS:
            p.add_argument("--base", required=True)
        if name == "scope":
            p.add_argument("--default-branch")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    if not g.is_v3(args.root):
        print("NOTE: no %s; the v3 checks are off (model S-009 AC1)" % g.V3_SWITCH_REL)
        print("OK: %s check not run" % args.cmd)
        return 0
    try:
        if args.cmd == "scope":
            v, notes = check_scope(args.root, args.base, args.default_branch)
        elif args.cmd in RANGE_CHECKS:
            v, notes = CHECKS[args.cmd](args.root, args.base)
        else:
            v, notes = CHECKS[args.cmd](args.root)
        return g.report(args.root, [("v3_checks." + args.cmd, line) for line in v], notes, OK_MESSAGES[args.cmd])
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
