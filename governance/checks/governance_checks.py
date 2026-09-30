#!/usr/bin/env python3
"""governance_checks — sprint, question, reviewer-agent, active-builder and scope lints.

Usage:
  governance_checks.py sprints   [--root DIR]
  governance_checks.py questions [--root DIR]
  governance_checks.py reviewers [--root DIR]
  governance_checks.py builders  [--root DIR] [--base REF]
  governance_checks.py scope     --base REF [--root DIR] [--files-from FILE] [--default-branch NAME]
  governance_checks.py all       [--root DIR] [--base REF]

`all` runs sprints, questions, reviewers and builders, and also scope when
--base is given.

`builders` enforces one active builder per surface (a T2 rule; skipped at T0
and T1, read from the `tier:` line of AGENTS.md). It sees only git branches:
build/<id>/<task> refs, local and remote, that are not yet merged into the
base. Open pull requests cannot be seen without the host's API, so a PR whose
branch was deleted, or opened from a fork, is invisible to it.

`scope` (model S-003) checks that every path changed in BASE...HEAD (or listed
in FILE) matches a glob in an open sprint's `scope:` line, or in the
`extends_scope:` of a ledger entry added in BASE..HEAD or since the merge base
of HEAD with the default branch (model S-005 AC3), so an extension pushed
earlier on the same branch still counts. The default branch is NAME
(origin/NAME, else the local NAME); without NAME, origin/HEAD's target, then
origin/main, then main. Bookkeeping paths (the ledger, the digest, sprints,
questions and reviews) are always in scope.

In a v3 project (governance/v3.toml exists, model S-009 AC2) sprints are retired:
`sprints` and `scope` do not run (each passes with a note), and `all` runs
questions, reviewers and builders only. v3_checks.py scope takes scope from the
spec instead.

Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402

SPRINTS_REL = "docs/sprints"
SPRINT_EXCLUDED = ("SPRINT_PLAN.md", "PROGRESS.md")
SPRINT_STATUSES = ("open", "closed", "planned")
QUESTIONS_REL = "questions"
QUESTION_LABELS = ("WHY:", "OPTIONS:", "RECOMMENDATION:", "RISK CLASS:",
                   "REVERSIBILITY:", "DEFAULT:", "TIMEOUT:")
AGENTS_REL = ".claude/agents"
# Owner ruling: reviewer-class agents may hold only these tools.
REVIEWER_TOOLS = ("Read", "Grep", "Glob", "LS", "Bash", "WebSearch", "WebFetch")
# Readers and researchers hold no shell (L-0006, model S-002).
NO_SHELL_TOOLS = ("Read", "Grep", "Glob", "LS", "WebSearch", "WebFetch")
SHELL_TOOLS = ("bash",)
# Always in scope (model S-003 §2).
BOOKKEEPING_GLOBS = ("docs/LEDGER.md", "docs/DIGEST.md", "digest/**", "docs/sprints/**",
                     "questions/**", "reviews/**")


def _md_files(root, rel):
    d = os.path.join(root, rel)
    if not os.path.isdir(d):
        return []
    return sorted(n for n in os.listdir(d)
                  if n.endswith(".md") and os.path.isfile(os.path.join(d, n)))


def first_field(text, key, whole=False, where=None):
    """First column-0 `key: value` line, with any `#` comment dropped.

    Returns the whole trimmed value when `whole` is true, else its first word;
    '' for an empty value; None when the line is absent. A line whose visible
    text starts with `key:` behind Unicode format (Cf) characters is a
    UsageError (model S-003 §6)."""
    g.reject_hidden_key(text, key, where or "text")
    rx = re.compile(r"^%s:(.*)$" % re.escape(key))
    for line in text.splitlines():
        m = rx.match(line.rstrip("\r"))
        if m:
            value = g.strip_comment(m.group(1))
            if whole or not value:
                return value
            return value.split()[0]
    return None


def check_sprints(root):
    """Return (violations, notes)."""
    v, notes = [], []
    names = [n for n in _md_files(root, SPRINTS_REL) if n not in SPRINT_EXCLUDED]
    if not names:
        return v, ["NOTE: no sprint files in %s/" % SPRINTS_REL]
    open_by_ws = {}
    any_open = False
    for name in names:
        rel = "%s/%s" % (SPRINTS_REL, name)
        text = g.read_text(os.path.join(root, rel))
        status = first_field(text, "status", where=rel)
        workstream = first_field(text, "workstream", whole=True, where=rel)
        if status is None:
            v.append("%s: missing 'status:' line (open, closed or planned)" % rel)
        elif status not in SPRINT_STATUSES:
            v.append("%s: status %r is not one of: %s" % (rel, status, ", ".join(SPRINT_STATUSES)))
        if not workstream:
            v.append("%s: missing 'workstream:' line" % rel)
        if status == "open":
            any_open = True
            v.extend(_scope_violations(rel, first_field(text, "scope", whole=True, where=rel)))
        if status == "open" and workstream:
            open_by_ws.setdefault(workstream, []).append(rel)
    for ws in sorted(open_by_ws):
        if len(open_by_ws[ws]) > 1:
            v.append("%s: workstream '%s' has %d open sprints (%s) — only one open sprint per workstream"
                     % (SPRINTS_REL, ws, len(open_by_ws[ws]), ", ".join(open_by_ws[ws])))
    if not any_open:
        v.append("%s: no open sprint — stop and ask the owner" % SPRINTS_REL)
    return v, notes


def _scope_violations(rel, scope):
    """The model S-003 rule for an open sprint's `scope:` line."""
    if scope is None:
        return ["%s: open sprint has no 'scope:' line — list the globs it may touch, comma-separated "
                "('**' for everything)" % rel]
    if not scope:
        return ["%s: open sprint has an empty 'scope:' line — list the globs it may touch, comma-separated "
                "('**' for everything)" % rel]
    if any(not item or item == "!" for item in g.split_globs(scope)):
        return ["%s: 'scope:' has an empty item — write a comma-separated list of globs" % rel]
    return []


def open_sprint_scopes(root):
    """[(rel, [glob])] for every open sprint, in file order ([] globs when scope is missing)."""
    out = []
    for name in _md_files(root, SPRINTS_REL):
        if name in SPRINT_EXCLUDED:
            continue
        rel = "%s/%s" % (SPRINTS_REL, name)
        text = g.read_text(os.path.join(root, rel))
        if first_field(text, "status", where=rel) != "open":
            continue
        scope = first_field(text, "scope", whole=True, where=rel)
        out.append((rel, g.split_globs(scope) if scope else []))
    return out


def scope_changed_files(root, base):
    return sorted(set(g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", "--relative",
                                             "%s...HEAD" % base]))))


def default_branch_ref(root, name=None):
    """The default branch's ref (refs/remotes/origin/NAME, else refs/heads/NAME), or None.

    Without NAME: origin/HEAD's target, then origin/main, then main."""
    if name is not None:
        if not name or name.startswith("-") or not g.git_ok(root, ["check-ref-format", "--branch", name]):
            raise g.UsageError("default branch %r is not a branch name" % name)
        candidates = ["refs/remotes/origin/%s" % name, "refs/heads/%s" % name]
    else:
        candidates = []
        if g.git_ok(root, ["symbolic-ref", "-q", "refs/remotes/origin/HEAD"]):
            candidates.append(g.git(root, ["symbolic-ref", "-q", "refs/remotes/origin/HEAD"]).decode().strip())
        candidates += ["refs/remotes/origin/main", "refs/heads/main"]
    for ref in candidates:
        if g.git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % ref]):
            return ref
    return None


def scope_extensions(root, base, default_branch=None):
    """([(entry id, [glob])], note): extends_scope entries added in BASE..HEAD or since the
    merge base of HEAD with the default branch (model S-005 AC3)."""
    entries = list(g.added_ledger_entries(root, base))
    ref = default_branch_ref(root, default_branch)
    if ref is None:
        note = "NOTE: no default branch found; only extensions added since the base ref count"
    elif not g.git_ok(root, ["merge-base", ref, "HEAD"]):
        note = "NOTE: HEAD has no merge base with %s; only extensions added since the base ref count" % ref
    else:
        merge_base = g.git(root, ["merge-base", ref, "HEAD"]).decode().strip()
        seen = set(e.id for e in entries)
        entries += [e for e in g.added_ledger_entries(root, merge_base) if e.id not in seen]
        note = "NOTE: extensions counted since the base ref and since the merge base with %s" % ref
    extends = []
    for e in entries:
        value = e.get("extends_scope")
        if value is not None:
            extends.append((e.id, g.split_globs(g.strip_comment(value))))
    return extends, note


def check_scope(root, base, files=None, default_branch=None):
    """Every changed path is inside an open sprint's scope, an extends_scope entry, or bookkeeping."""
    g.verify_commit(root, base)
    if files is None:
        files = scope_changed_files(root, base)
    sprints = open_sprint_scopes(root)
    extends, extends_note = scope_extensions(root, base, default_branch)
    where = ", ".join(rel for rel, _ in sprints) or "no open sprint"
    v, notes = [], [extends_note]
    for path in sorted(set(files)):
        if any(g.glob_match(gl, path) for gl in BOOKKEEPING_GLOBS):
            continue
        if any(g.glob_list_includes(globs, path) for _, globs in sprints):
            continue
        if any(g.glob_list_includes(globs, path) for _, globs in extends):
            continue
        v.append("%s: outside the sprint scope (%s) — widen the scope with a ledger entry's extends_scope: "
                 "in the same change, or leave the path alone" % (path, where))
    notes.append("NOTE: %d changed path(s) checked against the scope of %s%s"
                 % (len(set(files)), where,
                    "; extended by %s" % ", ".join(i for i, _ in extends) if extends else ""))
    return v, notes


def check_questions(root):
    v, notes = [], []
    names = [n for n in _md_files(root, QUESTIONS_REL) if not n.startswith("_")]
    if not names:
        notes.append("NOTE: no open question files in %s/" % QUESTIONS_REL)
    for name in names:
        rel = "%s/%s" % (QUESTIONS_REL, name)
        text = g.read_text(os.path.join(root, rel))
        missing = [lab for lab in QUESTION_LABELS
                   if not re.search(r"(?m)(^|\s)%s" % re.escape(lab), text)]
        if missing:
            v.append("%s: question is missing required label(s): %s" % (rel, ", ".join(missing)))
    return v, notes


def front_matter(text):
    """Lines of the front matter, or None.

    Front matter exists only when the very first line is `---`; it runs to
    the next `---` line.
    """
    lines = text.splitlines()
    if lines and lines[0].startswith("\ufeff"):
        lines[0] = lines[0][1:]
    if not lines or lines[0].rstrip() != "---":
        return None
    for i in range(1, len(lines)):
        if lines[i].rstrip() == "---":
            return lines[1:i]
    return None


def fm_lines(lines, key):
    """Every (index, value) for a column-0 `key:` line in the front matter."""
    rx = re.compile(r"^%s[ \t]*:(.*)$" % re.escape(key))
    out = []
    for i, line in enumerate(lines):
        m = rx.match(line)
        if m:
            out.append((i, m.group(1).strip()))
    return out


_TOOL_ITEM_RE = re.compile(r"^([^\s()]+)(\(.*\))?$")


def parse_tools(value):
    """Parse a comma-separated tools value (optionally in [brackets]).

    Returns (base_names, error). Each item may carry a `(...)` permission
    suffix, which is stripped. An item with whitespace outside the suffix
    (e.g. a space-separated list) or an empty item is unparseable.
    """
    v = value.strip()
    if v.startswith("[") and v.endswith("]"):
        v = v[1:-1].strip()
    if not v:
        return [], None
    names = []
    for raw in v.split(","):
        item = raw.strip()
        if len(item) >= 2 and item[0] == item[-1] and item[0] in "'\"":
            item = item[1:-1].strip()
        m = _TOOL_ITEM_RE.match(item)
        if not m:
            return [], ("cannot parse tools item %r — write a comma-separated list such as "
                        "'tools: Read, Grep, Glob'" % item)
        names.append(m.group(1))
    return names, None


def check_reviewers(root):
    v, notes = [], []
    s = g.load_surfaces(root)
    reviewers = sorted(set(s.reviewer_ids()))
    if not reviewers:
        notes.append("NOTE: no reviewer-class agents in %s" % g.SURFACES_REL)
    for rid in reviewers:
        cls = s.row(rid).cls
        allow = REVIEWER_TOOLS if cls == "reviewer" else NO_SHELL_TOOLS
        allowed = ", ".join(allow)
        allowed_lower = set(t.lower() for t in allow)
        rel = "%s/%s.md" % (AGENTS_REL, rid)
        path = os.path.join(root, rel)
        if not os.path.isfile(path):
            v.append("%s: missing — reviewer '%s' in %s needs an agent definition" % (rel, rid, g.SURFACES_REL))
            continue
        fm = front_matter(g.read_text(path))
        if fm is None:
            v.append("%s: no front matter (the first line must be '---'), so no tools: list — a reviewer "
                     "without one inherits every tool" % rel)
            continue
        names = fm_lines(fm, "name")
        if names and names[0][1].strip("'\"") != rid:
            v.append("%s: name %r does not match the roster id '%s'" % (rel, names[0][1], rid))
        tools_lines = fm_lines(fm, "tools")
        if not tools_lines:
            v.append("%s: no 'tools:' line — a reviewer without one inherits every tool, including write tools" % rel)
            continue
        if len(tools_lines) > 1:
            v.append("%s: %d 'tools:' lines — a reviewer must have exactly one" % (rel, len(tools_lines)))
            continue
        idx, value = tools_lines[0]
        if not value:
            following = fm[idx + 1] if idx + 1 < len(fm) else ""
            if following.strip().startswith("-"):
                v.append("%s: 'tools:' is a YAML block list — write it on one line as a comma-separated list" % rel)
            else:
                v.append("%s: 'tools:' list is empty — list the reviewer's read-only tools explicitly" % rel)
            continue
        listed, err = parse_tools(value)
        if err:
            v.append("%s: %s" % (rel, err))
            continue
        if not listed:
            v.append("%s: 'tools:' list is empty — list the reviewer's read-only tools explicitly" % rel)
            continue
        bad = [t for t in listed if t.lower() not in allowed_lower]
        shells = [t for t in bad if t.lower() in SHELL_TOOLS]
        if shells:
            v.append("%s: %s '%s' holds a shell (%s) — readers and researchers get no shell (allowed: %s)"
                     % (rel, cls, rid, ", ".join(shells), allowed))
            bad = [t for t in bad if t.lower() not in SHELL_TOOLS]
        if bad:
            v.append("%s: %s '%s' holds tool(s) outside the reviewer allowlist: %s (allowed: %s)"
                     % (rel, cls, rid, ", ".join(bad), allowed))
    return v, notes


BUILD_REF_RES = (re.compile(r"^refs/heads/(build/[^/]+/.+)$"),
                 re.compile(r"^refs/remotes/[^/]+/(build/[^/]+/.+)$"))


def default_base(root):
    for ref in ("origin/main", "main"):
        if g.git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % ref]):
            return ref
    raise g.UsageError("no --base given and neither origin/main nor main exists")


def check_builders(root, base=None):
    """One active builder per surface: at most one unmerged build/<id>/… branch per id."""
    tier, note = g.read_tier(root)
    notes = [note] if note else []
    if tier in ("T0", "T1"):
        notes.append("NOTE: one-active-builder check skipped at %s (a T2 rule)" % tier)
        return [], notes
    if base is None:
        base = default_base(root)
    elif not g.git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % base]):
        raise g.UsageError("base ref %r is not a commit in %s" % (base, root))
    out = g.git(root, ["for-each-ref", "--format=%(refname)", "refs/heads/build/", "refs/remotes/"])
    refs = {}   # branch name -> [refname]
    for refname in out.decode("utf-8", "surrogateescape").splitlines():
        for rx in BUILD_REF_RES:
            m = rx.match(refname)
            if m:
                refs.setdefault(m.group(1), []).append(refname)
                break
    active = {}  # id -> [branch]
    for branch in sorted(refs):
        unmerged = [r for r in refs[branch]
                    if not g.git_ok(root, ["merge-base", "--is-ancestor", r, base])]
        if unmerged:
            active.setdefault(branch.split("/")[1], []).append(branch)
    v = []
    for agent_id in sorted(active):
        if len(active[agent_id]) > 1:
            v.append("builder '%s' has %d unmerged build branches (%s) — one active builder per surface at %s"
                     % (agent_id, len(active[agent_id]), ", ".join(active[agent_id]), tier))
    if not v:
        notes.append("NOTE: %d unmerged build branch(es) against %s" % (sum(len(b) for b in active.values()), base))
    return v, notes


# Not run in a v3 project (model S-009 AC2).
V3_RETIRED = ("sprints", "scope")

CHECKS = (("sprints", check_sprints), ("questions", check_questions), ("reviewers", check_reviewers),
          ("builders", check_builders), ("scope", check_scope))


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="governance_checks.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    for name in ("sprints", "questions", "reviewers", "builders", "scope", "all"):
        p = sub.add_parser(name, allow_abbrev=False)
        p.add_argument("--root", default=".")
        if name in ("builders", "all"):
            p.add_argument("--base")
        if name == "scope":
            p.add_argument("--base", required=True)
            p.add_argument("--files-from")
            p.add_argument("--default-branch")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    # `all` gains scope only when a base is given.
    selected = [c for c in CHECKS if args.cmd == c[0] or (args.cmd == "all" and (c[0] != "scope" or args.base))]
    violations, notes, errors = [], [], []
    v3 = g.is_v3(args.root)
    if v3:
        # model S-009 AC2: sprints are retired in v3 (D-063); the spec-based scope check replaces
        # the sprint-based one.
        retired = [c[0] for c in selected if c[0] in V3_RETIRED]
        selected = [c for c in selected if c[0] not in V3_RETIRED]
        if retired:
            notes.append("NOTE: v3 project (%s): sprints are retired (D-063); %s not run"
                         % (g.V3_SWITCH_REL, " and ".join("the %s check" % n for n in retired)))
    for name, fn in selected:
        try:
            if name == "builders":
                v, n = fn(args.root, args.base)
            elif name == "scope":
                files = g.read_file_list(args.files_from) if getattr(args, "files_from", None) else None
                v, n = fn(args.root, args.base, files, getattr(args, "default_branch", None))
            else:
                v, n = fn(args.root)
        except g.UsageError as exc:
            errors.append("%s: %s" % (name, exc))
            continue
        violations.extend(("governance_checks." + name, line) for line in v)
        notes.extend(n)
    for e in errors:
        print("ERROR: %s" % e, file=sys.stderr)
    if args.cmd == "all" and v3:
        what = "question, reviewer and builder checks"
    elif args.cmd == "all":
        what = ("sprint, question, reviewer, builder and scope checks" if args.base
                else "sprint, question, reviewer and builder checks")
    else:
        what = args.cmd + " check"
    ok_msg = "%s passed" % what
    if v3 and args.cmd in V3_RETIRED:
        ok_msg = "%s check not run in a v3 project" % args.cmd
    try:
        return g.report(args.root, violations, notes, ok_msg, errors=bool(errors))
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
