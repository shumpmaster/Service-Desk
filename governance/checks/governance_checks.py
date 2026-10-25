#!/usr/bin/env python3
"""governance_checks — sprint, question, reviewer-agent, active-builder and scope lints.

Usage:
  governance_checks.py sprints   [--root DIR]
  governance_checks.py questions [--root DIR] [--base REF]
  governance_checks.py reviewers [--root DIR]
  governance_checks.py builders  [--root DIR] [--base REF]
  governance_checks.py handover  [--root DIR]
  governance_checks.py scope     --base REF [--root DIR] [--files-from FILE] [--default-branch NAME]
  governance_checks.py all       [--root DIR] [--base REF]
  governance_checks.py pr-body   --event FILE [--root DIR]

`all` runs sprints, questions, reviewers, builders and handover, and also
scope when --base is given. In a v3 project, where scope is retired, the base
goes to `questions` only; check_all.sh passes it only there (model S-033 AC2).

`builders` enforces one active builder per surface (a T2 rule; skipped at T0
and T1, read from the `tier:` line of AGENTS.md). It sees only git branches:
build/<id>/<task> refs, local and remote, that are not yet merged into the
base. Open pull requests cannot be seen without the host's API, so a PR whose
branch was deleted, or opened from a fork, is invisible to it.

`handover` (model S-026 AC5) reads every file directly in docs/handover/ whose
name ends in `.md` or `.markdown`, in any case (model S-029 AC3), except
`_TEMPLATE.md`; subfolders are not read, and a symbolic link fails. No folder or
no such file: it passes. Each file is read as UTF-8 (Windows line ends as `\n`,
a leading byte order mark dropped, model S-029 AC3): blank lines, at most one
`# ` title line, then blank lines and the handover form's two instruction lines
(exactly as the form holds them) are skipped; the next line must be a `What this
means for you` heading, as for `pr-body`. After it, blank lines and form lines
are skipped, and the lead paragraph must pass the pull request's rules: 15 to 150
words, no backtick and no fenced code, up to the first blank line or the next
heading. A lead holding at least half of the form's instruction line, in runs of
three words, holds the form's line and fails (model S-029 AC2).
Findings read `<path>: <problem>`. It checks the form, not the plainness, runs
in every project (v3 or not) and can be made warn-only in enforcement.toml.

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
questions, reviewers, builders and handover only. v3_checks.py scope takes scope from the
spec instead.

`pr-body` (model S-020 AC7) reads a GitHub event payload (the pr-body workflow passes
$GITHUB_EVENT_PATH). Not a pull-request event: it passes with a NOTE. Otherwise the body's first
non-blank line, after any leading HTML comment, must be a heading `What this means for you` (any
level, an optional colon, case ignored), and the lead paragraph after it (up to the first blank line
or the next heading) must have 15 to 150 words, no backtick and no fenced code. A null body fails;
an unreadable payload exits 2. It checks the form, not the plainness, and is not part of `all`.

In a v3 project (model S-032 AC6: governance/v3.toml under --root DIR, default `.`, which in the pr-body
job is the base commit's checkout), the body then goes on, in this order: after at least one blank line
(a line straight after the lead is part of it), a line in column 0, `Milestone: <ids>` (milestone ids
`M<id>` or the model's 24 standard ids, separated by `, `) or `Milestone: none (<reason>)` (a reason with
no parenthesis, not "not recorded"); then a Context heading and a Why heading, each read as the desk reads
headings (`#` to `######` in column 0, a space or tab, the word, an optional colon, case ignored), each
section running to the next line the desk reads as a heading, or the end. Context holds only bullets,
`- <fact> (source: <record>)` starting in column 0 (an indented line straight after a bullet's line
continues it, a blank line ends it), each with a fact and a record that is not "not recorded", "none" or
"unknown"; or exactly one bullet `- none beyond the ruling quoted in Why` (case ignored, only a final full
stop allowed), and then Why quotes the ruling (a line starting `>` with words after it, or words in double
quotes). The line ending Context is the Why heading. Each Why line is read as the desk reads it, a leading
`>` and one space or tab dropped, and Why must hold words, not only "not recorded", "none", "n/a" or "tbd".
A Tasks section follows Why, other sections allowed between; anything may follow it. Each problem is one
finding; a body whose first line is not the lead heading gets that one finding only. Without --root's
governance/v3.toml, only the lead is read, with the output as before.

The Tasks section (model S-034 AC3) is read in a v3 project once the Why heading is found; when it is not,
model S-032's findings stand alone. Among the lines after the Why heading, the first line `#` to `######`, a
space or tab, `Tasks`, an optional colon (case ignored) is its heading; other headings, a bare-hashes line among
them, may come between, and a second such heading anywhere after it is a finding. After its blank lines come the tasks, at least
one: a task line starts in column 0 with `- [ ] `, `- [x] ` or `- [X] `; a line starting with a space or tab and
holding a non-space character, straight after a task line or one of its continuation lines, continues it (so a
nested item is part of the task above it); a blank line ends a task. The section ends at its first line that is
none of these (the next heading, a `---` line and a footer, a closing paragraph, anything), or at the body's end,
and anything may follow it; a line ending it that looks like a task-list item (a list marker, then `[`, at most
one character, `]`) but is not in the form is a finding. Each task is read with its lines joined by single
spaces, after its box; from its end, first an optional ` (not done: <reason>)`, then before it an optional
` (added: <reason>)`, each running from its last opener in what is left to the `)` ending what is left. A reason
must not be empty, "not recorded", "none" or "unknown" (case ignored); the task's own words must not be empty or
only "not recorded", "none", "n/a" or "tbd" (case ignored, a final full stop allowed). A ticked task must not end
` (not done: …)`. Unless the payload's `pull_request.draft` is `true` (a payload without it is read as not a
draft), every unticked task must end ` (not done: <reason>)`. Its findings follow model S-032's. The check reads
neither the repository's plan nor its visibility.

`questions` (model S-033 AC2), where governance/v3.toml exists, also reads each questions/*.md file not
starting with `_`: its first `Milestone:` line in column 0 must be in model S-032's form (as `pr-body` reads
it); it must have a Context section (a heading read as the desk reads it, running to the next such heading
or the end) holding at least one bullet `- ` in column 0 (an indented line straight after a bullet's line
continues it, as for `pr-body`), every bullet holding ` (source: `, and nowhere the words "not recorded"
(case ignored); and REVERSIBILITY is the word after its label on the first line beginning `RISK CLASS:` in
column 0 (the template's shared line), up to the next space: `reversible`, `costly` or `irreversible`; a file
holding more than one `REVERSIBILITY:` label, or one whose only label is not on that line, is reported.
With --base REF, a question file at HEAD that is not at REF and whose answer record
decisions/questions/<name>.md is at REF is a reused name; without a base that finding is not run. A
question file whose answer record exists (and is not a reused name) is a NOTE: it is answered, and the Chief
of Staff deletes it. Outside a v3 project the check is unchanged.

Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import json
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


def check_questions(root, base=None):
    v, notes = [], []
    v3 = g.is_v3(root)
    if base is not None and v3:
        g.verify_commit(root, base)
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
        if not v3:
            continue
        v.extend("%s: %s (model S-033 AC2)" % (rel, p) for p in v3_question_problems(text))
        answer = "%s/%s" % (ANSWERS_REL, name)
        if base is not None and g.git_blob(root, base, rel) is None and g.git_blob(root, base, answer) is not None:
            v.append("%s: added in the range, but its answer record %s is already on the base %s: a reused name; "
                     "file the question under a new name (model S-033 AC2)" % (rel, answer, base))
        elif os.path.isfile(os.path.join(root, answer)):
            notes.append("NOTE: %s is answered (%s); the Chief of Staff deletes it in a pull request of its own "
                         "(model S-033 AC4 kind (d))" % (rel, answer))
    return v, notes


# model S-033 AC2: a v3 question names its milestone, lists its facts, and states its reversibility.
ANSWERS_REL = "decisions/questions"
REVERSIBILITY_WORDS = ("reversible", "costly", "irreversible")
_REVERSIBILITY_RE = re.compile(r"(?:^|\s)REVERSIBILITY:[ \t]*([^\s]*)")
_REVERSIBILITY_LABEL_RE = re.compile(r"(?m)(?:^|\s)REVERSIBILITY:")


def reversibility(text):
    """The word after the `REVERSIBILITY:` label (at the line's start or after white space) on the first line
    beginning `RISK CLASS:` in column 0, the template's shared line, up to the next space: '' when nothing
    follows on the line, None when that line holds no label or there is no such line (model S-033 AC2; a label
    elsewhere is never read: model S-033, build review round 1, note 5)."""
    for line in (text or "").replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        if line.startswith("RISK CLASS:"):
            m = _REVERSIBILITY_RE.search(line)
            return m.group(1) if m else None
    return None


def reversibility_labels(text):
    """How many `REVERSIBILITY:` labels (at a line's start or after white space) the text holds anywhere."""
    return len(_REVERSIBILITY_LABEL_RE.findall(text or ""))


def question_milestone(text):
    """The first column-0 `Milestone:` line of a question file or answer record, trailing space dropped, or
    None (model S-033 J1)."""
    for line in (text or "").replace("\r\n", "\n").split("\n"):
        if line.startswith("Milestone:"):
            return line.rstrip(" \t\r")
    return None


def v3_question_problems(text):
    """Problems with a v3 question file's form (model S-033 AC2): its milestone line, its Context section and its
    reversibility. An empty list means it passes."""
    problems = []
    lines = (text or "").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    line = question_milestone(text)
    if line is None:
        problems.append("no 'Milestone:' line in column 0: a question names the milestone it unblocks, "
                        "'Milestone: M<id>' or 'Milestone: none (<why it serves none>)'")
    else:
        why = _milestone_problem(line)
        if why:
            problems.append(why)
    heads = [i for i, l in enumerate(lines) if PR_CONTEXT_RE.match(l)]
    if not heads:
        problems.append("no '## Context' section: list the facts behind the question, each '- <fact> (source: "
                        "<record>)'")
    else:
        i = heads[0]
        body = lines[i + 1:_section(lines, i + 1)]
        # Bullets as model S-032 reads them: `- ` in column 0, an indented line straight after one continuing it.
        bullets = _bullets(body)[0]
        if not bullets:
            problems.append("the Context section holds no bullet '- <fact> (source: <record>)'")
        for b in bullets:
            if PR_SOURCE not in b:
                problems.append("a Context bullet has no ' (source: <record>)': %r" % b)
        if any("not recorded" in l.lower() for l in body):
            problems.append("the Context section says \"not recorded\": give each fact its record, or leave it "
                            "out")
    word, labels = reversibility(text), reversibility_labels(text)
    if labels > 1:
        problems.append("it holds %d 'REVERSIBILITY:' labels: keep the one on the 'RISK CLASS:' line, and write "
                        "the word without its colon anywhere else" % labels)
    elif labels == 1 and word is None:
        problems.append("its 'REVERSIBILITY:' label is not on the 'RISK CLASS:' line (column 0), where it is read")
    if word is not None and word not in REVERSIBILITY_WORDS:
        problems.append("REVERSIBILITY is %r, not one of: %s" % (word, ", ".join(REVERSIBILITY_WORDS)))
    return problems


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


# model S-020 AC7: a pull request's body opens with what it means for the owner.
PR_LEAD_RE = re.compile(r"^#{1,6}\s*What this means for you\s*:?\s*$", re.IGNORECASE)
PR_HEADING_RE = re.compile(r"^\s{0,3}#{1,6}(\s|$)")
PR_FENCE_RE = re.compile(r"^\s{0,3}(```|~~~)")
PR_LEAD_WORDS = (15, 150)


def check_pr_body(payload, root=None):
    """(problems, notes) for a GitHub event payload (model S-020 AC7). Blank lines straight after the
    heading are skipped; the lead paragraph is then read up to the first blank line or the next
    heading, whichever comes first. When `root` holds governance/v3.toml, the body must then go on with
    a `Milestone:` line, a Context section and a Why section (model S-032 AC6), and after Why a Tasks section,
    read with the payload's draft state (model S-034 AC3)."""
    if not isinstance(payload, dict):
        raise g.UsageError("the event payload is not a JSON object")
    pr = payload.get("pull_request")
    if not isinstance(pr, dict):
        return [], ["NOTE: not a pull-request event; the PR-body check does not apply"]
    body = pr.get("body")
    if body is None:
        return ["the pull request has no body; it must open with a '## What this means for you' heading "
                "and a plain paragraph"], []
    if not isinstance(body, str):
        return ["the pull request's body is not text"], []
    text = body.replace("\r\n", "\n").replace("\r", "\n").lstrip()
    while text.startswith("<!--"):
        end = text.find("-->")
        if end < 0:
            return ["the body's leading HTML comment is never closed"], []
        text = text[end + 3:].lstrip()
    lines = text.split("\n")
    if not lines or not PR_LEAD_RE.match(lines[0].strip()):
        first = lines[0].strip() if lines else ""
        return ["the body's first line is %r, not a '## What this means for you' heading" % first[:80]], []
    problems = lead_problems(lines[1:])
    if root is not None and g.is_v3(root):
        problems += context_problems(lines[1:], draft=pr.get("draft") is True)
    return problems, []


def lead_lines(lines):
    """The lead paragraph's lines: blank lines first are skipped, then up to the first blank line or heading."""
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    lead = []
    while i < len(lines) and lines[i].strip() and not PR_HEADING_RE.match(lines[i]):
        lead.append(lines[i])
        i += 1
    return lead


def lead_problems(lines):
    """Problems with the lead paragraph in `lines`, the lines after a 'What this means for you' heading
    (model S-026 J1; shared by `pr-body` and `handover`). Blank lines first are skipped; the lead is then
    read up to the first blank line or the next heading. An empty list means the lead passes."""
    lead = lead_lines(lines)
    problems = []
    words = len(" ".join(lead).split())
    if not PR_LEAD_WORDS[0] <= words <= PR_LEAD_WORDS[1]:
        problems.append("the 'What this means for you' paragraph has %d words; it needs %d to %d"
                        % (words, PR_LEAD_WORDS[0], PR_LEAD_WORDS[1]))
    if any(PR_FENCE_RE.match(l) for l in lead):
        problems.append("the 'What this means for you' paragraph holds fenced code")
    elif any("`" in l for l in lead):
        problems.append("the 'What this means for you' paragraph holds a backtick (code belongs after it)")
    return problems


# model S-032 AC6: in a v3 project the body goes on with its milestone, its Context and its Why.
# The model's 24 standard milestones, as v3_checks.STANDARD_IDS holds them (the pr-body job holds only this
# file and govlib.py, so it cannot import v3_checks; a test compares the two).
PR_STANDARD_IDS = tuple("%s-%d" % (phase, n) for phase, count in
                        (("Discovery", 8), ("Design", 6), ("Build", 5), ("Launch", 5)) for n in range(1, count + 1))
PR_MILESTONE_ID_RE = re.compile(r"^M[0-9A-Z]{1,7}$")
PR_MILESTONE_NONE_RE = re.compile(r"^none \(([^()]*)\)$")
# The section headings and ends exactly as the desk reads them (Service-Desk src/lib/pulls.js:25, HEADING_RE).
PR_DESK_HEADING_RE = re.compile(r"^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$")
PR_CONTEXT_RE = re.compile(r"^#{1,6}[ \t]+Context[ \t]*:?[ \t]*$", re.IGNORECASE)
PR_WHY_RE = re.compile(r"^#{1,6}[ \t]+Why[ \t]*:?[ \t]*$", re.IGNORECASE)
PR_CONTINUATION_RE = re.compile(r"^[ \t]+\S")
PR_SOURCE = " (source: "
# The exception bullet exactly as the desk reads it (Service-Desk src/lib/pulls.js:27, EXCEPTION_RE).
PR_RULING_ONLY_RE = re.compile(r"none beyond the ruling quoted in why\.?", re.IGNORECASE)
# A Why line as the desk reads its text: a leading `>` and one space or tab dropped (src/lib/pulls.js:114).
PR_QUOTE_MARK_RE = re.compile(r"^>[ \t]?")
PR_EMPTY_WORDS = ("not recorded", "none", "unknown")
PR_EMPTY_WHY = ("not recorded", "none", "n/a", "tbd")
PR_QUOTE_RE = re.compile("\"[^\"]+\"|“[^”]+”")


def _bare(text):
    """text trimmed, case ignored, a final full stop dropped."""
    t = text.strip().lower()
    return t[:-1].rstrip() if t.endswith(".") else t


def _section(lines, i):
    """The index of the line ending the section that starts at lines[i]: the next desk heading, or the end."""
    while i < len(lines) and not PR_DESK_HEADING_RE.match(lines[i]):
        i += 1
    return i


def _milestone_problem(line):
    """Why `line` is not a `Milestone:` line in form, or None."""
    value = line[len("Milestone:"):]
    if not value.startswith(" ") or not value.strip():
        return "the 'Milestone:' line names no milestone: %r" % line
    value = value[1:].rstrip(" \t")
    m = PR_MILESTONE_NONE_RE.match(value)
    if m:
        if not m.group(1).strip() or _bare(m.group(1)) == "not recorded":
            return "the 'Milestone: none (<reason>)' line gives no reason: %r" % line
        return None
    if value == "none" or value.startswith("none "):
        return "the 'Milestone:' line is not 'Milestone: none (<why it serves none>)': %r" % line
    for mid in value.split(", "):
        if not (PR_MILESTONE_ID_RE.match(mid) or mid in PR_STANDARD_IDS):
            return ("the 'Milestone:' line names %r, neither a milestone id (M<id>) nor a standard milestone "
                    "(Discovery-1 to Launch-5): %r" % (mid, line))
    return None


def _bullets(lines):
    """([bullet text], problems) of a Context section's lines: a bullet starts `- ` in column 0; an indented line
    straight after a bullet's line continues it; a blank line ends it; any other line is not a bullet."""
    bullets, problems, open_ = [], [], False
    for line in lines:
        if not line.strip():
            open_ = False
        elif line.startswith("- "):
            bullets.append([line.strip()])
            open_ = True
        elif open_ and PR_CONTINUATION_RE.match(line):
            bullets[-1].append(line.strip())
        else:
            open_ = False
            problems.append("a line in the Context section is not a bullet '- <fact> (source: <record>)': %r" % line)
    return [" ".join(b).strip() for b in bullets], problems


def context_problems(lines, draft=False):
    """Problems with what follows the lead paragraph in a v3 project's body (model S-032 AC6): `lines` are the
    lines after the 'What this means for you' heading. Once the Why heading is found, the Tasks section's
    problems follow (model S-034 AC3); `draft` is whether the pull request is a draft."""
    problems = []
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    i += len(lead_lines(lines[i:]))
    after_lead = i
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and i > after_lead and lines[i].lstrip(" \t").startswith("Milestone:"):
        if lines[i].startswith("Milestone:"):
            why = _milestone_problem(lines[i].rstrip(" \t"))
            if why:
                problems.append(why)
        else:
            problems.append("the 'Milestone:' line does not start in column 0: %r" % lines[i])
        i += 1
    elif i < len(lines):
        problems.append("the line after the 'What this means for you' paragraph is %r, not a 'Milestone:' line"
                        % lines[i][:80])
    else:
        problems.append("there is no 'Milestone:' line after the 'What this means for you' paragraph")
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i >= len(lines):
        return problems + ["there is no '## Context' section"]
    if not PR_CONTEXT_RE.match(lines[i]):
        if PR_WHY_RE.match(lines[i]):
            return problems + ["the Why section comes before the Context section: '## Context' comes first"]
        return problems + ["the line after the 'Milestone:' line is %r, not a '## Context' heading" % lines[i][:80]]
    end = _section(lines, i + 1)
    bullets, bad = _bullets(lines[i + 1:end])
    problems += bad
    ruling_only = any(PR_RULING_ONLY_RE.fullmatch(b[2:].strip()) for b in bullets)
    if not bullets:
        problems.append("the Context section holds no bullet '- <fact> (source: <record>)'")
    elif ruling_only and len(bullets) > 1:
        problems.append("the bullet '- none beyond the ruling quoted in Why' must be the Context section's only one")
    elif not ruling_only:
        for b in bullets:
            k = b.rfind(PR_SOURCE)
            if k < 1 or not b.endswith(")"):
                problems.append("a Context bullet is not '- <fact> (source: <record>)': %r" % b)
            elif not b[2:k].strip():
                problems.append("a Context bullet has no fact before its source: %r" % b)
            elif not b[k + len(PR_SOURCE):-1].strip() or _bare(b[k + len(PR_SOURCE):-1]) in PR_EMPTY_WORDS:
                problems.append("a Context bullet's source is not a record: %r" % b)
    if end >= len(lines):
        return problems + ["there is no '## Why' section after the Context section"]
    if not PR_WHY_RE.match(lines[end]):
        return problems + ["the heading after the Context section is %r, not '## Why'" % lines[end][:80]]
    why = [l for l in lines[end + 1:_section(lines, end + 1)] if l.strip()]
    words = " ".join(w for w in (PR_QUOTE_MARK_RE.sub("", l).strip() for l in why) if w)
    if not words:
        problems.append("the Why section is empty")
    elif _bare(words) in PR_EMPTY_WHY:
        problems.append("the Why section says only %r: give the reason" % words)
    elif ruling_only and len(bullets) == 1 and not (any(l.startswith(">") and PR_QUOTE_MARK_RE.sub("", l).strip()
                                                         for l in why)
                                                     or PR_QUOTE_RE.search("\n".join(why))):
        problems.append("the Context section cites only the ruling, so the Why section must quote it (a line "
                        "starting '>' and its words, or the ruling's words in double quotes)")
    return problems + tasks_problems(lines, end + 1, draft)


# model S-034 AC3: in a v3 project a Tasks section follows Why, other sections allowed between.
PR_TASKS_RE = re.compile(r"^#{1,6}[ \t]+Tasks[ \t]*:?[ \t]*$", re.IGNORECASE)
# GFM's task-list marker in column 0: a space or an `x` in either case between the brackets, then one space.
PR_TASK_RE = re.compile(r"^- \[([ xX])\] (.*)$")
PR_TASK_LIKE_RE = re.compile(r"^[ \t]*(?:[-*+]|[0-9]+[.)])[ \t]*\[[^\]]?\]")
PR_NOT_DONE = " (not done: "
PR_ADDED = " (added: "
PR_EMPTY_REASON = ("not recorded", "none", "unknown")
PR_EMPTY_TASK = ("not recorded", "none", "n/a", "tbd")
PR_TASK_FORM = "'- [ ] <task>' or '- [x] <task>'"


def _task_mark(text, opener):
    """(what is left, reason or None) of a task's text ending ` (<opener> <reason>)`: the mark runs from the last
    `opener` in `text` to the `)` that ends it."""
    k = text.rfind(opener)
    if not text.endswith(")") or k < 0:
        return text, None
    return text[:k], text[k + len(opener):-1]


def tasks_problems(lines, start, draft):
    """Problems with the Tasks section among lines[start:], the lines after the Why heading (model S-034 AC3)."""
    heads = [k for k in range(start, len(lines)) if PR_TASKS_RE.match(lines[k])]
    if not heads:
        return ["there is no '## Tasks' section after the Why section"]
    problems = ["the body has a second '## Tasks' section: %r" % lines[k][:80] for k in heads[1:]]
    j = heads[0] + 1
    while j < len(lines) and not lines[j].strip():
        j += 1
    tasks, open_ = [], False          # [ticked, [its lines' text], its first line]
    while j < len(lines):
        line = lines[j]
        m = PR_TASK_RE.match(line)
        if m:
            tasks.append([m.group(1) != " ", [m.group(2).strip()], line.rstrip()])
            open_ = True
        elif not line.strip():
            open_ = False
        elif open_ and PR_CONTINUATION_RE.match(line):
            tasks[-1][1].append(line.strip())
        else:
            break
        j += 1
    if not tasks:
        first = lines[j] if j < len(lines) else ""
        return problems + ["the Tasks section holds no task %s: its first line is %r" % (PR_TASK_FORM, first[:80])]
    if j < len(lines) and PR_TASK_LIKE_RE.match(lines[j]):
        problems.append("a line in the Tasks section is not a task %s: %r" % (PR_TASK_FORM, lines[j][:80]))
    for ticked, parts, shown in tasks:
        rest, not_done = _task_mark(" " + " ".join(p for p in parts if p), PR_NOT_DONE)
        rest, added = _task_mark(rest, PR_ADDED)
        for word, reason in (("not done", not_done), ("added", added)):
            if reason is not None and reason.strip().lower() in PR_EMPTY_REASON + ("",):
                problems.append("a task's '%s' gives no reason: %r" % (word, shown))
        if not rest.strip() or _bare(rest) in PR_EMPTY_TASK:
            problems.append("a task has no words: %r" % shown)
        if ticked and not_done is not None:
            problems.append("a ticked task says it was not done: %r" % shown)
        if not ticked and not_done is None and not draft:
            problems.append("the pull request is not a draft, but a task is neither ticked nor says why it was not "
                            "done: %r" % shown)
    return problems


# model S-026 AC5: the handover package's plain opening.
HANDOVER_REL = "docs/handover"
HANDOVER_SKIP = "_TEMPLATE.md"
# The handover form's two instruction lines, exactly as template-v3/docs/handover/_TEMPLATE.md holds them
# (its opening line, and the line under "What this means for you"); a change to the form is made here too.
HANDOVER_FORM_LINES = (
    "*Handed from the pipeline to the project's operating team at launch (D-036).*",
    "*One paragraph in plain English, 15 to 150 words. Start with anything that failed or was skipped, then say "
    "what changes for the owner, what they will see, decide or do differently, and whether any of it is "
    "irreversible. No file paths, code or ids (OPERATING_MODEL \u00a72, \"Plain English first\").*",
)


def _skip_form(lines, i):
    """The index of the first line from i that is neither blank nor one of the form's lines."""
    while i < len(lines) and (not lines[i].strip() or lines[i].strip() in HANDOVER_FORM_LINES):
        i += 1
    return i


def _shingles(text):
    """The set of three-word runs in text, read as lowercase letters and digits only."""
    w = re.findall(r"[^\W_]+", text.lower())
    return set(zip(w, w[1:], w[2:]))


# model S-029 AC2: a lead holding at least half of the instruction line's three-word runs holds the form's
# instruction line, or most of it, and fails with its own finding (no word count).
HANDOVER_COPY_SHARE = 0.5


def handover_problems(text):
    """Problems with one handover package's opening (model S-026 AC5; model S-029 AC2)."""
    if text.startswith("\ufeff"):
        text = text[1:]
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i < len(lines) and lines[i].startswith("# "):
        i += 1
    i = _skip_form(lines, i)
    first = lines[i].strip() if i < len(lines) else ""
    if not PR_LEAD_RE.match(first):
        return ["the first section is %r, not 'What this means for you'" % first[:80]]
    rest = lines[_skip_form(lines, i + 1):]
    form = _shingles(HANDOVER_FORM_LINES[1])
    if len(form & _shingles(" ".join(lead_lines(rest)))) >= HANDOVER_COPY_SHARE * len(form):
        return ["the 'What this means for you' paragraph holds the form's instruction line, or most of it; "
                "delete it and keep only your own paragraph"]
    return lead_problems(rest)


def check_handover(root):
    """(violations, notes): every top-level docs/handover/*.md but _TEMPLATE.md opens plainly (model S-026 AC5)."""
    folder = os.path.join(root, HANDOVER_REL)
    if not os.path.isdir(folder):
        return [], []
    v = []
    for name in sorted(os.listdir(folder)):
        if not name.lower().endswith((".md", ".markdown")) or name == HANDOVER_SKIP:    # model S-029 AC3
            continue
        path = os.path.join(folder, name)
        rel = "%s/%s" % (HANDOVER_REL, name)
        if os.path.islink(path):
            v.append("%s: a symbolic link, not followed; a handover package must be a regular file" % rel)
            continue
        if not os.path.isfile(path):
            continue
        try:
            with open(path, "rb") as fh:
                text = fh.read().decode("utf-8")
        except UnicodeDecodeError:
            v.append("%s: not valid UTF-8" % rel)
            continue
        v.extend("%s: %s" % (rel, p) for p in handover_problems(text))
    return v, []


def run_pr_body(event, root="."):
    try:
        with open(event, "rb") as fh:
            payload = json.loads(fh.read().decode("utf-8"))
        problems, notes = check_pr_body(payload, root=root)
    except (OSError, UnicodeDecodeError, ValueError, g.UsageError) as exc:
        print("ERROR: pr-body: cannot read the event payload %s: %s" % (event, exc), file=sys.stderr)
        return 2
    for n in notes:
        print(n)
    if problems:
        for p in problems:
            print("FAIL: pr-body: %s" % p)
        print("PR-body check FAILED (model S-020 AC7).")
        return 1
    print("OK: pr-body check passed")
    return 0


# Not run in a v3 project (model S-009 AC2).
V3_RETIRED = ("sprints", "scope")

CHECKS = (("sprints", check_sprints), ("questions", check_questions), ("reviewers", check_reviewers),
          ("builders", check_builders), ("handover", check_handover), ("scope", check_scope))


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="governance_checks.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    for name in ("sprints", "questions", "reviewers", "builders", "handover", "scope", "all"):
        p = sub.add_parser(name, allow_abbrev=False)
        p.add_argument("--root", default=".")
        if name in ("builders", "questions", "all"):
            p.add_argument("--base")
        if name == "scope":
            p.add_argument("--base", required=True)
            p.add_argument("--files-from")
            p.add_argument("--default-branch")
    p = sub.add_parser("pr-body", allow_abbrev=False)
    p.add_argument("--event", required=True)
    p.add_argument("--root", default=".")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    if args.cmd == "pr-body":
        return run_pr_body(args.event, args.root)
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
            if name == "builders" and not (v3 and args.cmd == "all"):
                v, n = fn(args.root, args.base)
            elif name == "builders":
                # model S-033 AC2: in a v3 project `all` takes the base for `questions`; builders keeps the
                # default branch as its base, as check_all.sh ran it before.
                v, n = fn(args.root)
            elif name == "questions":
                v, n = fn(args.root, getattr(args, "base", None))
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
