#!/usr/bin/env python3
"""surface_guard — prove the surface map is coherent and changes stay inside it.

Usage:
  surface_guard.py check [--root DIR] [--files-from FILE]
  surface_guard.py diff AGENT [--root DIR] [--base REF] [--files-from FILE]
  surface_guard.py diff --range BASE..HEAD [--branch NAME] [--root DIR] [--commits-from FILE]
  surface_guard.py whois PATH... [--root DIR]
  surface_guard.py charters [--check | --write] [--root DIR]

Reads governance/SURFACES.md (docs/archive/OPERATING_MODEL_v2.5.1.md section 8; model S-001 and model S-002).
`diff --range` walks every commit in BASE..HEAD and checks who wrote it (agent
identity or the humans block), its Agent-Session/Spec trailers, the paths it
touched, the build-branch rule and test-author independence (check-author and builder
are one pair too, model S-013 AC8), and that no
builder commit's Spec: trailer names a spec whose status is `superseded`
(model S-005 AC1). A git range judges "superseded" per commit, at the commit's
first parent (model S-015 AC9: work made before the spec was superseded stays
valid); with --commits-from, or when a commit's first parent cannot be read (a
root commit, a shallow clone), the specs in the working tree at --root decide,
as before. Merge commits and commits in the `exempt` block are skipped.
Commits are judged against the surface map in the working tree at --root.
`charters` checks (or rewrites) the generated Surface section of every
builder-class agent's .claude/agents/<id>.md, between the markers
<!-- surface:begin --> and <!-- surface:end --> (model S-003 §4).
Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402

SF = g.SURFACES_REL


def tracked_files(root):
    return sorted(set(g.split_z(g.git(root, ["ls-files", "-z"]))))


def changed_files(root, base=None):
    files = set()
    if base:
        files.update(g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", "--relative",
                                            "%s...HEAD" % base])))
    if g.git_ok(root, ["rev-parse", "--verify", "-q", "HEAD"]):
        files.update(g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", "--relative", "HEAD"])))
    else:
        # No commits yet: everything staged is a change.
        files.update(g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", "--relative", "--cached"])))
    files.update(g.split_z(g.git(root, ["ls-files", "--others", "--exclude-standard", "-z"])))
    return sorted(files)


def structure_violations(s):
    """Rules about the map itself. Returns (violations, notes)."""
    v = []
    for lineno, msg in s.problems:
        v.append("%s line %d: %s" % (SF, lineno, msg))
    seen = {}
    for r in s.roster:
        where = "%s line %d" % (SF, r.lineno)
        if r.id == g.ORCHESTRATOR:
            v.append("%s: 'orchestrator' is reserved and must not have a roster row" % where)
        if r.id in seen:
            v.append("%s: duplicate roster id '%s' (first at line %d)" % (where, r.id, seen[r.id]))
        else:
            seen[r.id] = r.lineno
        if r.cls not in g.CLASSES:
            v.append("%s: '%s' has invalid class '%s' (must be one of: %s)"
                     % (where, r.id, r.cls, ", ".join(g.CLASSES)))
        if r.status not in g.STATUSES:
            v.append("%s: '%s' has invalid status '%s' (must be one of: %s)"
                     % (where, r.id, r.status, ", ".join(g.STATUSES)))
        if r.authority not in g.AUTHORITIES:
            v.append("%s: '%s' has invalid authority '%s' (must be one of: %s)"
                     % (where, r.id, r.authority, ", ".join(g.AUTHORITIES)))
    if g.ORCHESTRATOR not in s.blocks:
        v.append("%s: no surface:orchestrator block — the orchestrator's surface must be declared" % SF)
    for agent_id in sorted(seen):
        if agent_id != g.ORCHESTRATOR and agent_id not in s.blocks:
            v.append("%s: roster id '%s' has no surface:%s block — every roster row needs a surface"
                     % (SF, agent_id, agent_id))
    for agent_id in sorted(s.blocks):
        if agent_id != g.ORCHESTRATOR and agent_id not in seen:
            v.append("%s line %d: surface:%s block has no roster row — orphan surface"
                     % (SF, s.block_lines[agent_id], agent_id))
    for agent_id in sorted(set(s.reviewer_ids())):
        rules = s.blocks.get(agent_id) or []
        if rules:
            v.append("%s line %d: %s '%s' has globs in its surface block — reviewer-class agents are read-only"
                     % (SF, s.block_lines[agent_id], s.row(agent_id).cls, agent_id))
    notes = []
    defaulted = sorted(set(r.id for r in s.roster if r.defaulted))
    if defaulted:
        notes.append("NOTE: authority defaulted to 'autonomous' for: %s" % ", ".join(defaulted))
    return v, notes


def ownership_violations(s, files):
    v = []
    for path in sorted(set(files)):
        owners = s.owners(path)
        if not owners:
            v.append("%s: unowned — no surface in %s claims it (every path needs exactly one owner)" % (path, SF))
        elif len(owners) > 1:
            v.append("%s: claimed by %s — every path needs exactly one owner" % (path, ", ".join(owners)))
    return v


def exempt_violations(s, root):
    """Every exemption must name an entry heading in docs/LEDGER.md."""
    if not s.exempt:
        return []
    ledger = os.path.join(root, g.LEDGER_REL)
    if not os.path.isfile(ledger):
        return ["%s line %d: exempt %s cites %s, but %s is missing" % (SF, lineno, sha, lid, g.LEDGER_REL)
                for lineno, sha, lid in s.exempt]
    _, entries = g.parse_ledger(g.read_text(ledger))
    ids = set(e.id for e in entries)
    return ["%s line %d: exempt %s cites %s, which is not an entry in %s" % (SF, lineno, sha, lid, g.LEDGER_REL)
            for lineno, sha, lid in s.exempt if lid not in ids]


def known_agents(s):
    ids = set(s.roster_ids())
    ids.add(g.ORCHESTRATOR)
    return ids


def diff_violations(s, agent, files):
    """Raise UsageError for an unknown agent; else return violations."""
    if agent not in known_agents(s):
        raise g.UsageError("unknown agent '%s' — not in the %s roster and not 'orchestrator'" % (agent, SF))
    v = []
    files = sorted(set(files))
    row = s.row(agent)
    if row is not None and row.cls in g.REVIEWER_CLASSES:
        for path in files:
            v.append("%s: changed by %s '%s' — reviewers are read-only" % (path, row.cls, agent))
        return v
    for path in files:
        owners = s.owners(path)
        if owners == [agent]:
            continue
        if not owners:
            v.append("%s: outside the surface of '%s' (unowned)" % (path, agent))
        elif agent in owners:
            v.append("%s: claimed by %s, not by '%s' alone" % (path, ", ".join(owners), agent))
        else:
            v.append("%s: outside the surface of '%s' (owned by %s)" % (path, agent, ", ".join(owners)))
    return v


# --------------------------------------------------------------------------
# diff --range (model S-002)


BUILD_BRANCH_RE = re.compile(r"^build/([^/]+)/(.+)$")
AUTH = "surface_guard.range.authorship"
TRAILERS = "surface_guard.range.trailers"
SPEC = "surface_guard.range.spec"


def is_test_author(agent_id):
    return agent_id == "test-author" or agent_id.startswith("test-author-")


def parse_range(rng):
    base, sep, head = rng.partition("..")
    if not sep:
        raise g.UsageError("--range %r must be BASE..HEAD" % rng)
    if head.startswith("."):
        raise g.UsageError("--range %r: use BASE..HEAD (two dots), not BASE...HEAD" % rng)
    if not base:
        raise g.UsageError("--range %r has no BASE" % rng)
    return base, head or "HEAD"


def _commit_from_json(obj, where):
    if not isinstance(obj, dict):
        raise g.UsageError("%s: each commit must be an object" % where)
    missing = [k for k in ("sha", "parents", "author_name", "author_email", "message", "paths") if k not in obj]
    if missing:
        raise g.UsageError("%s: commit is missing %s" % (where, ", ".join(missing)))
    if not isinstance(obj["parents"], list) or not isinstance(obj["paths"], list):
        raise g.UsageError("%s: 'parents' and 'paths' must be lists" % where)
    return g.Commit(str(obj["sha"]), [str(p) for p in obj["parents"]], str(obj["author_name"]),
                    str(obj["author_email"]), str(obj["message"]), [str(p) for p in obj["paths"]])


def load_commits_json(path):
    """Return (commits, history) from a --commits-from file."""
    text = g.read_text(path)
    try:
        data = json.loads(text)
    except ValueError as exc:
        raise g.UsageError("cannot read --commits-from %s: %s" % (path, exc))
    except RecursionError:
        raise g.UsageError("cannot read --commits-from %s: nested too deeply to parse" % path)
    history = None
    if isinstance(data, dict):
        unknown = sorted(set(data) - {"commits", "history"})
        if unknown or "commits" not in data:
            raise g.UsageError("--commits-from %s: the object form is {\"commits\": [...], \"history\": [...]}" % path)
        commits_raw = data["commits"]
        history_raw = data.get("history")
    else:
        commits_raw, history_raw = data, None
    if not isinstance(commits_raw, list) or (history_raw is not None and not isinstance(history_raw, list)):
        raise g.UsageError("--commits-from %s: 'commits' and 'history' must be lists" % path)
    commits = [_commit_from_json(o, path) for o in commits_raw]
    if history_raw is not None:
        history = [_commit_from_json(o, path) for o in history_raw]
    else:
        history = list(commits)
    return commits, [c for c in history if not c.is_merge()]


def load_commits_git(root, base, head):
    for ref in (base, head):
        if not g.git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % ref]):
            raise g.UsageError("%r is not a commit in %s" % (ref, root))
    commits = g.read_commits(root, g.rev_list(root, ["--reverse", "%s..%s" % (base, head)]))
    for c in commits:
        if not c.is_merge():
            c.paths = g.commit_paths(root, c.sha)
    history = g.read_commits(root, g.rev_list(root, ["--no-merges", head]))
    return commits, history


def current_branch(root):
    try:
        return g.git(root, ["rev-parse", "--abbrev-ref", "HEAD"]).decode().strip()
    except g.GitError:
        return "HEAD"


def superseded_specs(root):
    """{spec id: [rel]} for every spec file in the working tree at root whose status is superseded."""
    out = {}
    for name in g.spec_files(root):
        sid = g.spec_id(name)
        rel = "%s/%s" % (g.SPECS_REL, name)
        if sid and g.spec_status(g.read_text(os.path.join(root, rel)), where=rel)[0] == "superseded":
            out.setdefault(sid, []).append(rel)
    return out


def superseded_at_parent(root):
    """A function commit -> {spec id: [rel]} superseded at the commit's first parent, or None when that
    parent cannot be read (model S-015 AC9); the caller then uses the range head's specs."""
    cache = {}

    def at(c):
        if not c.parents:
            return None
        parent = c.parents[0]
        if parent not in cache:
            if not g.git_ok(root, ["cat-file", "-e", "%s^{commit}" % parent]):
                cache[parent] = None
            else:
                out = {}
                for name in g.spec_files_at(root, parent):
                    sid = g.spec_id(name)
                    rel = "%s/%s" % (g.SPECS_REL, name)
                    text = g.git_text(root, parent, rel)
                    if sid and text is not None and g.spec_status(text)[0] == "superseded":
                        out.setdefault(sid, []).append(rel)
                cache[parent] = out
        return cache[parent]

    return at


def range_violations(s, commits, history, branch, superseded=None, superseded_at=None):
    """Return ([(check name, violation)], notes, counts) for a range walk.

    `superseded` maps a spec id to its superseded spec files (model S-005 AC1), as the range head has
    them. `superseded_at`, when given, maps a commit to the same at its first parent, or to None when
    that parent cannot be read (model S-015 AC9); a commit it answers is judged by that instead."""
    superseded = superseded or {}
    v, notes = [], []
    roster = dict((r.id, r) for r in s.roster)
    humans = s.human_emails()
    exempt = s.exempt_map()

    branch_id = None
    if branch and branch.startswith("build/"):
        m = BUILD_BRANCH_RE.match(branch)
        if not m:
            v.append(("surface_guard.range.branch",
                      "branch %s is not build/<id>/<task> — no builder can be identified" % branch))
        elif m.group(1) not in roster or roster[m.group(1)].cls != "builder":
            v.append(("surface_guard.range.branch",
                      "branch build/%s/… names no builder — '%s' is not a builder-class roster id"
                      % (m.group(1), m.group(1))))
        else:
            branch_id = m.group(1)

    merges = [c for c in commits if c.is_merge()]
    n_exempt = n_human = 0
    checked = []
    for c in commits:
        if c.is_merge():
            continue
        lid = exempt.get(c.sha.lower())
        if lid is not None:
            n_exempt += 1
            notes.append("NOTE: %s: exempt (%s) — skipped" % (c.short, lid))
            continue
        checked.append(c)
        who = "%s <%s>" % (c.author_name, c.author_email)
        agent = c.agent_id()
        if agent is None:
            if c.author_email.lower() in humans:
                n_human += 1
                notes.append("NOTE: %s: human commit by %s — any path allowed" % (c.short, c.author_email))
                continue
            v.append((AUTH, "%s: unknown author %s — not an agent identity and not in the humans block"
                      % (c.short, who)))
            continue
        if agent != g.ORCHESTRATOR and agent not in roster:
            v.append((AUTH, "%s: unknown agent %s — '%s' is not in the %s roster" % (c.short, who, agent, SF)))
            continue
        if c.author_name != agent:
            v.append((AUTH, "%s: author name '%s' does not match agent id '%s' (%s)"
                      % (c.short, c.author_name, agent, c.author_email)))
        sessions = c.trailer("Agent-Session")
        if not sessions:
            v.append((TRAILERS, "%s: agent commit by '%s' has no Agent-Session trailer" % (c.short, agent)))
        elif len(sessions) > 1:
            v.append((TRAILERS, "%s: agent commit by '%s' has %d Agent-Session trailers — exactly one is required"
                      % (c.short, agent, len(sessions))))
        elif not sessions[0]:
            v.append((TRAILERS, "%s: agent commit by '%s' has an empty Agent-Session trailer" % (c.short, agent)))
        specs = c.trailer("Spec")
        if len(specs) > 1:
            v.append((TRAILERS, "%s: agent commit by '%s' has %d Spec trailers — at most one is allowed"
                      % (c.short, agent, len(specs))))
        if agent in roster and roster[agent].cls == "builder":
            sup = superseded
            if superseded_at is not None:
                here = superseded_at(c)
                if here is not None:
                    sup = here
            for sid in specs:
                if sid in sup:
                    v.append((SPEC, "%s: builder commit by '%s' names Spec: %s, which is superseded (%s) — "
                              "build against the spec that superseded it" % (c.short, agent, sid,
                                                                            ", ".join(sup[sid]))))
        if branch_id is not None and agent != branch_id:
            v.append(("surface_guard.range.branch", "%s: commit by '%s' on branch %s — only '%s' or a human may "
                      "commit there" % (c.short, agent, branch, branch_id)))
        if agent in roster and roster[agent].cls in g.REVIEWER_CLASSES:
            v.append((AUTH, "%s: commit by %s '%s' — reviewers never commit" % (c.short, roster[agent].cls, agent)))
            continue
        for line in diff_violations(s, agent, c.paths or []):
            v.append(("surface_guard.range.paths", "%s: %s" % (c.short, line)))

    v.extend(("surface_guard.range.independence", line) for line in independence_violations(s, checked, history))
    if merges:
        notes.insert(0, "NOTE: %d merge commit(s) skipped" % len(merges))
    return v, notes, (len(commits), len(merges), n_exempt, n_human)


def independence_violations(s, checked, history):
    """A session that wrote a spec's tests (test-author) must not also write its code, nor may one session be
    both a spec's check-author and its builder (model S-013 AC8)."""
    roster = dict((r.id, r) for r in s.roster)
    specs = set()
    for c in checked:
        specs.update(x for x in c.trailer("Spec") if x)
    v = []
    for spec in sorted(specs):
        tests, code = {}, {}   # session -> set of ids
        for c in history:
            agent = c.agent_id()
            if agent is None or agent not in roster or roster[agent].cls != "builder":
                continue
            if spec not in c.trailer("Spec"):
                continue
            target = tests if is_test_author(agent) else code
            for session in c.trailer("Agent-Session"):
                if session:
                    target.setdefault(session, set()).add(agent)
        for session in sorted(set(tests) & set(code)):
            for ta in sorted(tests[session]):
                for coder in sorted(code[session]):
                    v.append("spec %s: session %s wrote both tests (%s) and code (%s)" % (spec, session, ta, coder))
        # model S-013 AC8: the check-author (a spec's locked checks) and the builder are one pair too.
        for session in sorted(code):
            if CHECK_AUTHOR in code[session] and BUILDER in code[session]:
                v.append("spec %s: session %s wrote both checks (%s) and code (%s)"
                         % (spec, session, CHECK_AUTHOR, BUILDER))
    return v


CHECK_AUTHOR = "check-author"
BUILDER = "builder"


def run_range(args, s):
    base, head = parse_range(args.range)
    at = None
    if args.commits_from:
        commits, history = load_commits_json(args.commits_from)
        branch = args.branch
    else:
        commits, history = load_commits_git(args.root, base, head)
        branch = args.branch if args.branch is not None else current_branch(args.root)
        at = superseded_at_parent(args.root)
    v, notes, (n, m, e, h) = range_violations(s, commits, history, branch, superseded_specs(args.root), at)
    # The walk trusts the map, so a broken map (including an exemption that
    # cites no ledger entry) fails the walk too, not only `check`.
    map_v, _ = structure_violations(s)
    v = _tag(MAP, map_v + exempt_violations(s, args.root)) + v
    return g.report(args.root, v, notes, "%d commit(s) in %s checked (%d merge(s) skipped, %d exempt, %d human)"
                    % (n, args.range, m, e, h))


MAP = "surface_guard.map"


def _tag(name, lines):
    return [(name, line) for line in lines]


# --------------------------------------------------------------------------
# charters (model S-003 §4)


AGENTS_REL = ".claude/agents"
CHARTER_BEGIN = "<!-- surface:begin -->"
CHARTER_END = "<!-- surface:end -->"
CHARTER_OWNER_LINE = "Owning file: %s (generated; do not edit)." % SF


def charter_lines(rules):
    """The generated Surface section: one '- <glob>' line per surface line, '!' kept."""
    return (["Writes:"] + ["- %s%s" % ("!" if neg else "", pattern) for neg, pattern in rules]
            + [CHARTER_OWNER_LINE])


def _marker_span(lines):
    """(begin index, end index) of the marker lines, or an error message."""
    begins = [i for i, l in enumerate(lines) if l.rstrip("\r") == CHARTER_BEGIN]
    ends = [i for i, l in enumerate(lines) if l.rstrip("\r") == CHARTER_END]
    if not begins or not ends:
        return None, "no %s … %s markers — the Surface section must sit between them" % (CHARTER_BEGIN, CHARTER_END)
    if len(begins) > 1 or len(ends) > 1 or ends[0] < begins[0]:
        return None, "the %s and %s markers must appear once each, in that order" % (CHARTER_BEGIN, CHARTER_END)
    return (begins[0], ends[0]), None


def check_charters(s, root, write=False):
    """Return (violations, notes). With write, rewrite stale sections (only between the markers)."""
    v, notes = [], []
    checked = 0
    for agent_id in sorted(set(s.builder_ids())):
        rel = "%s/%s.md" % (AGENTS_REL, agent_id)
        path = os.path.join(root, rel)
        if not os.path.isfile(path):
            notes.append("NOTE: builder '%s' has no %s; nothing to check" % (agent_id, rel))
            continue
        checked += 1
        text = g.read_text(path, newline="")
        lines = text.split("\n")
        span, err = _marker_span(lines)
        if err:
            v.append("%s: %s" % (rel, err))
            continue
        begin, end = span
        want = charter_lines(s.blocks.get(agent_id, []))
        have = [l[:-1] if l.endswith("\r") else l for l in lines[begin + 1:end]]
        if have == want:
            continue
        if not write:
            v.append("%s: the Surface section differs from surface:%s in %s — regenerate it with "
                     "surface_guard.py charters --write" % (rel, agent_id, SF))
            continue
        eol = "\r" if lines[begin].endswith("\r") else ""
        new = "\n".join(lines[:begin + 1] + [l + eol for l in want] + lines[end:])
        with open(path, "wb") as fh:
            fh.write(new.encode("utf-8"))
        notes.append("wrote %s" % rel)
    return v, notes, checked


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="surface_guard.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    p_check = sub.add_parser("check", allow_abbrev=False)
    p_check.add_argument("--root", default=".")
    p_check.add_argument("--files-from")
    p_diff = sub.add_parser("diff", allow_abbrev=False)
    p_diff.add_argument("agent", nargs="?")
    p_diff.add_argument("--root", default=".")
    p_diff.add_argument("--base")
    p_diff.add_argument("--files-from")
    p_diff.add_argument("--range", dest="range")
    p_diff.add_argument("--branch")
    p_diff.add_argument("--commits-from")
    p_who = sub.add_parser("whois", allow_abbrev=False)
    p_who.add_argument("paths", nargs="+")
    p_who.add_argument("--root", default=".")
    p_ch = sub.add_parser("charters", allow_abbrev=False)
    p_ch.add_argument("--root", default=".")
    mode = p_ch.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    if args.cmd == "diff":
        usage = None
        if (args.agent is None) == (args.range is None):
            usage = "diff takes exactly one of AGENT and --range BASE..HEAD"
        elif args.range is not None and (args.base or args.files_from):
            usage = "--base and --files-from do not apply to diff --range (use --commits-from)"
        elif args.range is None and (args.branch is not None or args.commits_from):
            usage = "--branch and --commits-from apply only to diff --range"
        if usage:
            print("ERROR: %s" % usage, file=sys.stderr)
            return 2
    try:
        s = g.load_surfaces(args.root)
        if args.cmd == "check":
            files = g.read_file_list(args.files_from) if args.files_from else tracked_files(args.root)
            sv, notes = structure_violations(s)
            v = (_tag(MAP, sv + exempt_violations(s, args.root))
                 + _tag("surface_guard.ownership", ownership_violations(s, files)))
            return g.report(args.root, v, notes,
                            "surface map is coherent; %d file(s) each have exactly one owner" % len(set(files)))
        if args.cmd == "diff" and args.range is not None:
            return run_range(args, s)
        if args.cmd == "diff":
            files = g.read_file_list(args.files_from) if args.files_from else changed_files(args.root, args.base)
            v = diff_violations(s, args.agent, files)
            return g.report(args.root, _tag("surface_guard.diff", v), [],
                            "%d changed file(s) all inside the surface of '%s'" % (len(set(files)), args.agent))
        if args.cmd == "charters":
            v, notes, n = check_charters(s, args.root, write=args.write)
            return g.report(args.root, _tag("surface_guard.charters", v), notes,
                            "%d builder charter(s) %s" % (n, "written or already current" if args.write
                                                          else "match %s" % SF))
        if args.cmd == "whois":
            bad = 0
            for p in args.paths:
                path = p
                owners = s.owners(path)
                if len(owners) == 1:
                    print("%s: %s" % (path, owners[0]))
                elif not owners:
                    bad += 1
                    print("%s: UNOWNED" % path)
                else:
                    bad += 1
                    print("%s: CLAIMED BY %s" % (path, ", ".join(owners)))
            return 1 if bad else 0
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2
    return 2


if __name__ == "__main__":
    sys.exit(main())
