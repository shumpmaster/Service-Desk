#!/usr/bin/env python3
"""v3_checks — the v3 checks that read a project's own records (model S-009).

Usage:
  v3_checks.py ready    [--root DIR]
  v3_checks.py trace    [--root DIR]
  v3_checks.py joins    [--root DIR]
  v3_checks.py scope    --base REF [--root DIR] [--default-branch NAME]
  v3_checks.py freeze   --base REF [--root DIR] [--milestones]
  v3_checks.py holdouts --base REF [--root DIR]
  v3_checks.py milestones --base REF [--root DIR]
  v3_checks.py gates    --base REF [--root DIR]

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
            before any spec exists). The Definer's lane (model S-019 AC1): in a
            spec-scoped commit by roster id `definer`, each path that the
            `definer` block of the surface map includes (`!` lines honoured) is
            bounded by the surface map, which surface_guard diff enforces, and
            not by the Areas touched of the spec it names; its other paths are
            judged as above. Such paths are counted in a separate NOTE.
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

model S-023 adds the project's milestones (Part 1 section 3, one per line:
`<name> (M<id>) · done when <what is achieved> · phase: <phase>`, optionally
` · for: P-<n>`, ` · sprints: PR #<n>, <item>` and ` · dropped`), the standard
milestones (STANDARD_MILESTONES) and the timeline (`timeline`):
  ready     also, once the project is approved (a status/P-*.toml holds a spec),
            section 3 lists at least one milestone not marked dropped.
  trace     also fails a milestone line out of form, a code-first line, a repeated
            id, a name holding a code or id, a `sprints:` entry not built,
            reviewed and merged, and a draft spec's malformed `fixes:` or
            `milestones:` line (a frozen one's is a NOTE); it prints the timeline
            as NOTE lines.
  freeze    with --milestones, each spec it checks needs a `milestones:` header
            line; a spec with a `fixes:` line copying frozen criteria the owner's
            ruling names needs no plan review of its own.
  milestones (AC8) between REF and HEAD: a milestone is never erased once the
            project is approved; it changes only with an `Owner-Ruling:` record
            and, added or reworded, a `Critic-Check:` record; research filed
            after approval names its milestone, and so does a draft spec
            (v3_checks.milestone_tags).

model S-024 adds:
  gates     (AC10) each case docs/gates/<item>/<phase>-gate-<n>-case.md added or
            changed in REF..HEAD, read at HEAD: its title, its nine sections in
            order, the proposer's recommendation, its fenced blocks, its
            milestone list (exactly the timeline's lines for the runs the gate
            closes), a citation on every line that states something, each
            citing a record the Critic's gate pack would hold in the case's
            tree (HEAD with the item branch's own changes), the ruling record
            of later work, the Launch gate's handover and launch review, at
            most 350 counted words in sections 1 to 8, the folded appendix,
            each visual's text alternative, caption and numbers, and no case
            changed after the Critic was dispatched on it.

model S-025 adds:
  ready     also section 9 of the brief, the target user: when it holds content,
            either `The owner is the user.` (and no docs/users/PROFILE.md) or the
            lines `Profile: docs/users/PROFILE.md` and `Approved: decisions/questions/
            <P-id>-user-profile-<n>.md`, the profile in its six sections, every line
            citing research/ or ending ` — not known`, and the approval record's
            `Profile-Sha256:` matching the profile's bytes; it must hold content once
            a project item is approved or waits on its Design gate.
  gates     also each proposal docs/gates/<item>/<phase>-gate-<n>-proposal.md added
            or changed: its title and label lines, its five sections, its case, no
            recommendation and no citation of a case, a Critic or User representative
            record or decisions/, cited lines in sections 1, 2 and 5 (at most 200
            counted words), scenarios quoted word for word from the item's spec,
            screens that exist; and a case citing a User representative record fails.

Findings are reported under the check names v3_checks.<subcommand>, which
governance/enforcement.toml can set to warn-only, apart from v3_checks.milestones
and v3_checks.gates.
Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import argparse
import json
import os
import posixpath
import re
import sys

try:
    import tomllib
except ImportError:  # Python < 3.11
    tomllib = None

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402
import governance_checks  # noqa: E402
import orchestrator as orch  # noqa: E402
import review_check  # noqa: E402
import spec_check  # noqa: E402

PROJECT_REL = "docs/PROJECT.md"
HOLDOUTS_REL = "governance/HOLDOUTS.md"
TESTS_REL = "tests"
PART1_SECTIONS = 8
BUILDER = "builder"
CHIEF_OF_STAFF = "chief-of-staff"   # builder-class, but bounded by the surface map only (model S-010 AC3a)
SOURCE_CHECKER = "source-checker"   # files checked facts under library/** with `Item:` (model S-015 AC7)
DEFINER = "definer"                 # its own spec and experiment files are bounded by its surface (model S-019 AC1)
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
# model S-023: the project's milestones, the standard milestones and the timeline


# AC1, AC7: the model's fixed checklist for the desk's four phases, in the order of OPERATING_MODEL.md §4's
# "Standard milestones" table: (id, phase, name, done when).
STANDARD_MILESTONES = (
    ("Discovery-1", "Discovery", "An idea worth exploring",
     "the idea is logged and the owner has agreed to look into it"),
    ("Discovery-2", "Discovery", "Success defined",
     "the value target: what it must improve, by how much, by when, and when we'd stop"),
    ("Discovery-3", "Discovery", "The expert's questions answered",
     "the groundwork map, and the owner has answered its short list of questions"),
    ("Discovery-4", "Discovery", "The right problem chosen",
     "a plain problem statement, checked against how others have solved it"),
    ("Discovery-5", "Discovery", "What already exists is known", "research to the depth needed, every source checked"),
    ("Discovery-6", "Discovery", "The risks are known", "the pre-mortem; its risks shape the research"),
    ("Discovery-7", "Discovery", "Scope, limits and owners agreed",
     "in and out, the spend ceiling, the trust level, who owns each deliverable"),
    ("Discovery-8", "Discovery", "A brief ready to rule on", "the Critic passes the brief; the owner's Design gate follows"),
    ("Design-1", "Design", "Done defined in real scenarios", "criteria by scenario"),
    ("Design-2", "Design", "How the pieces connect is mapped", "join sheets"),
    ("Design-3", "Design", "Every unknown has a test", "registered experiments, each with a fallback"),
    ("Design-4", "Design", "Every fact is backed by evidence", "the facts relied on, each with a source"),
    ("Design-5", "Design", "The design fits together", "the join-up review closing Design"),
    ("Design-6", "Design", "A plan that passed review",
     "the Critic's plan review passes, the spec freezes; the owner's Build gate follows"),
    ("Build-1", "Build", "Tests written before the work", "locked checks plus hidden holdouts, by the check author"),
    ("Build-2", "Build", "The work is built", "built to the frozen plan, in-session checks passing"),
    ("Build-3", "Build", "Independently reviewed and passing",
     "the reviewer tries to break it; it holds against the hidden tests too"),
    ("Build-4", "Build", "The experiments are answered", "each registered experiment has a recorded result"),
    ("Build-5", "Build", "Everything built fits together", "the join-up review closing Build"),
    ("Launch-1", "Launch", "It's live", "integrated and live for its users"),
    ("Launch-2", "Launch", "An operating team is in place", "who runs it day to day is set up"),
    ("Launch-3", "Launch", "It's handed over", "the handover package is complete; the owner approves the launch"),
    ("Launch-4", "Launch", "Its own monitoring and feedback works",
     "the product's own monitoring, feedback and review, designed in Design and built in Build, are confirmed "
     "running at, or just before, the Launch gate"),
    ("Launch-5", "Launch", "Graduated",
     "the owner passes the Launch gate and the product leaves the desk, owning its own running, monitoring, "
     "feedback and review; the lessons for the operating model are recorded at handover"),
)
STANDARD_IDS = tuple(m[0] for m in STANDARD_MILESTONES)
NOT_RECORDED_IDS = ("Discovery-1", "Discovery-4", "Discovery-6", "Design-3", "Design-5", "Build-4", "Build-5",
                    "Launch-1", "Launch-2", "Launch-5")
# AC7's redo table: (role, stage) of the sessions that do or check each milestone's work.
REDO = {
    "Discovery-5": (("critic", 2),), "Discovery-7": (("critic", 2),), "Discovery-8": (("critic", 2),),
    "Design-1": (("definer", 3),), "Design-6": (("definer", 3), ("critic", 3)),
    "Build-1": (("check-author", 4), ("critic", 4)), "Build-2": (("builder", 5), ("checks", 5)),
    "Build-3": (("builder", 5), ("reviewer", 5)),
    "Launch-3": (("builder", 6), ("reviewer", 6)), "Launch-4": (("builder", 6), ("reviewer", 6)),
}
BRIEF_IDS = ("Discovery-5", "Discovery-7", "Discovery-8")

MILESTONE_MARK_RE = re.compile(r"\(M[0-9A-Z]{1,7}\) · ")
MILESTONE_LINE_RE = re.compile(
    r"^(?:- )?(?P<name>\S.*?) \((?P<id>M[0-9A-Z]{1,7})\) · done when (?P<done>\S.*?) · "
    r"phase: (?P<phase>Discovery|Design|Build|Launch)(?: · for: (?P<for>P-\d{3,}))?"
    r"(?: · sprints: (?P<sprints>(?:PR #\d+|[PQE]-\d{3,})(?:, (?:PR #\d+|[PQE]-\d{3,}))*))?(?P<dropped> · dropped)?$")
CODE_FIRST_RE = re.compile(r"^(?:- )?M[0-9A-Z]{1,7}:")
NAME_ID_RE = re.compile(r"\b(?:[SDPQE]-\d{3,}|L-\d{4,}|AC\d+|J\d+|V\d+|M\d[0-9A-Z]{0,6})\b")
SPEC_MILESTONES_RE = re.compile(r"^milestones: (M[0-9A-Z]{1,7})((?:, M[0-9A-Z]{1,7})*)$")
FIXES_RE = re.compile(r"^fixes: (S-\d{3,}) (AC\d+(?:, AC\d+)*)$")
RULING_FIXES_RE = re.compile(r"^Fixes: (S-\d{3,}) (AC\d+(?:, AC\d+)*)$")
TAG_RE = re.compile(r"^(?:M[0-9A-Z]{1,7}|(?:Discovery|Design|Build|Launch)-[1-9])$")
ITEM_ID_RE = re.compile(r"^[PQE]-\d{3,}$")
RULING_FIRST_RE = re.compile(r"^(?:Decision: [A-Za-z-]+[ \t]*|Ruling: \S.*)$")
GROUNDWORK_PREFIXES = ("Groundwork map:", "Discovery map:")
MERGE_PR_RE = re.compile(r"^Merge pull request #(\d+) from ")


class Milestone(object):
    def __init__(self, lineno, m):
        self.lineno = lineno
        self.id, self.name, self.done, self.phase = m.group("id"), m.group("name"), m.group("done"), m.group("phase")
        self.for_item = m.group("for")
        self.sprints = m.group("sprints").split(", ") if m.group("sprints") else []
        self.dropped = bool(m.group("dropped"))

    def part(self):
        """The `<name> (<id>) · done when <done> · phase: <phase>` part the Critic's record quotes (AC8)."""
        return "%s (%s) · done when %s · phase: %s" % (self.name, self.id, self.done, self.phase)


def milestone_lines(text):
    """(milestones, problems) of Part 1 section 3: [Milestone] in order, and [(line number, message)] for every
    line that breaks AC3's form or name rule or is written code first."""
    sec = part1_sections(text or "").get(3)
    if sec is None:
        return [], []
    heading, lineno0, body = sec
    out, problems, raw = [], [], []
    for j, line in enumerate(body):
        n = lineno0 + 1 + j
        s = line.rstrip("\r")
        if CODE_FIRST_RE.match(s):
            problems.append((n, "a milestone written code first: write the name first: <name> (M<id>) · …"))
            continue
        if not MILESTONE_MARK_RE.search(s):
            continue
        m = MILESTONE_LINE_RE.match(s)
        if not m:
            problems.append((n, "not in the milestone form `<name> (M<id>) · done when <what is achieved> · phase: "
                                "<Discovery|Design|Build|Launch>` (optionally ` · for: P-<n>`, ` · sprints: …`, "
                                "` · dropped`)"))
            continue
        raw.append((n, m))
    ids = [m.group("id") for _, m in raw]
    seen = set()
    for n, m in raw:
        ms = Milestone(n, m)
        if ms.id in seen:
            problems.append((n, "milestone id %s is repeated" % ms.id))
            continue
        seen.add(ms.id)
        name = ms.name
        bad = None
        if "`" in name:
            bad = "a backtick"
        elif NAME_ID_RE.search(name):
            bad = "the code %s" % NAME_ID_RE.search(name).group(0)
        else:
            for other in ids:
                if re.search(r"\b%s\b" % re.escape(other), name):
                    bad = "the milestone id %s" % other
                    break
        if bad:
            problems.append((n, "the name %r holds %s: a milestone's name is plain English, with no codes or ids"
                                % (name, bad)))
        out.append(ms)
    return out, problems


def spec_header(text):
    lines = []
    for line in (text or "").split("\n"):
        if line.startswith("## "):
            break
        lines.append(line.rstrip("\r"))
    return lines


def spec_milestones(text):
    """(state, [ids]) of a spec's `milestones:` header line: state is "missing", "malformed" or "ok"."""
    for line in spec_header(text):
        if line.startswith("milestones:"):
            m = SPEC_MILESTONES_RE.match(line)
            if not m:
                return "malformed", []
            return "ok", [m.group(1)] + [x for x in m.group(2).split(", ") if x]
    return "missing", []


def spec_fixes(text):
    """(line, match or None) of a spec's `fixes:` header line, or (None, None)."""
    for line in spec_header(text):
        if line.startswith("fixes:"):
            return line, FIXES_RE.match(line)
    return None, None


def _toml_file(path):
    try:
        with open(path, "rb") as fh:
            return tomllib.loads(fh.read().decode("utf-8"))
    except (OSError, UnicodeDecodeError, tomllib.TOMLDecodeError):
        return None


def project_statuses(root):
    """{item: status} of every readable status/P-*.toml in the working tree."""
    d = os.path.join(root, "status")
    out = {}
    for name in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if re.fullmatch(r"[PQE]-[0-9]{3,}\.toml", name):
            st = _toml_file(os.path.join(d, name))
            if isinstance(st, dict):
                out[name[:-5]] = st
    return out


def approved_in(statuses):
    """AC3: a project is approved when a project status file holds a `spec`."""
    return any(k.startswith("P-") and isinstance(st.get("spec"), str) for k, st in statuses.items())


def waiting_on_design_gate(statuses):
    """AC3: a project waits on its Design gate when a project status holds next_gate dor, or waits on the dor card."""
    return any(k.startswith("P-") and (st.get("next_gate") == "dor"
                                       or (st.get("state") == "waiting-owner" and st.get("gate") == "dor"))
               for k, st in statuses.items())


def read_log(root):
    """[(position, rel, line number, object)] of dispatch-log/*.jsonl in file-name, then line order."""
    d = os.path.join(root, "dispatch-log")
    out = []
    for name in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not re.fullmatch(r"[0-9]{4}-[0-9]{2}\.jsonl", name):
            continue
        with open(os.path.join(d, name), encoding="utf-8", errors="replace", newline="") as fh:
            for i, line in enumerate(fh.read().split("\n"), 1):
                if not line.strip():
                    continue
                try:
                    obj = json.loads(line)
                except ValueError:
                    continue
                if isinstance(obj, dict):
                    out.append((len(out), "dispatch-log/%s" % name, i, obj))
    return out


def read_merges(root):
    path = os.path.join(root, "status", "merges.jsonl")
    out = []
    if os.path.isfile(path):
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh.read().split("\n"):
                try:
                    obj = json.loads(line) if line.strip() else None
                except ValueError:
                    obj = None
                if isinstance(obj, dict) and isinstance(obj.get("item"), str):
                    out.append(obj)
    return out


def read_file(root, rel):
    path = os.path.join(root, *rel.split("/"))
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8", errors="replace", newline="") as fh:
        return fh.read()


def research_question(root, item):
    """The question text of research/<item>.md (the Orchestrator's copy), or ''."""
    text = read_file(root, "research/%s.md" % item) or ""
    lines = text.split("\n")
    for i, l in enumerate(lines):
        if l.strip() == "## The question":
            for rest in lines[i + 1:]:
                if rest.strip():
                    return rest.strip()
            return ""
    return ""


def merged_pr_numbers(repo):
    """The pull-request numbers of merge commits `Merge pull request #<n> from …` reachable from HEAD."""
    try:
        if not g.git_ok(repo, ["rev-parse", "--verify", "-q", "HEAD^{commit}"]):
            return set()
        shas = g.rev_list(repo, ["--merges", "HEAD"])
        out = set()
        for c in g.read_commits(repo, shas):
            if not c.is_merge():
                continue
            m = MERGE_PR_RE.match(c.message.split("\n", 1)[0])
            if m:
                out.add(int(m.group(1)))
        return out
    except (g.GitError, OSError, ValueError):
        return set()


def handover_files(root):
    d = os.path.join(root, "docs", "handover")
    out = []
    for dirpath, dirs, files in os.walk(d) if os.path.isdir(d) else []:
        dirs.sort()
        for f in sorted(files):
            rel = os.path.relpath(os.path.join(dirpath, f), root).replace(os.sep, "/")
            if rel != "docs/handover/_TEMPLATE.md":
                out.append(rel)
    return out


def monitoring_section_filled(text):
    """AC13: the handover file holds `## Its own monitoring and feedback` with a line beyond its instruction."""
    lines = (text or "").split("\n")
    for i, l in enumerate(lines):
        if l.rstrip("\r") == "## Its own monitoring and feedback":
            for rest in lines[i + 1:]:
                if _SECTION_END_RE.match(rest):
                    return False
                if rest.strip() and not is_instruction_line(rest):
                    return True
            return False
    return False


class Run(object):
    """A phase run of the timeline (AC7): `<Phase> i<n>`, an item run when it holds lines of its item."""

    def __init__(self, phase, iteration, item=None, first=None):
        self.phase, self.iteration, self.item, self.first = phase, iteration, item, first
        self.routed = []         # [(position, line)] of the item's routed lines in the run
        self.decisions = []      # [(position, line)] of the item's applied decision lines in the run
        self.project = []        # [Milestone]
        self.standard = []       # [(id, name, state, from-run label or None)]
        self.sprints = {}        # milestone id -> [sprint id]
        self.untagged = []       # [item id]
        self.nothing_needed = False

    @property
    def is_item_run(self):
        return self.item is not None and bool(self.routed)

    def label(self):
        return "%s i%d" % (self.phase, self.iteration)


class Timeline(object):
    """AC7's timeline of one project: its first item's runs, the Graduated mark, then each later item."""

    def __init__(self, root, repo=None):
        self.root, self.repo = root, repo or root
        self.text = read_project(root) or ""
        self.milestones, self.problems = milestone_lines(self.text)
        self.log = read_log(root)
        self.statuses = project_statuses(root)
        self.merges = read_merges(root)
        self.specs = {}
        for name in g.spec_files(root) if os.path.isdir(os.path.join(root, g.SPECS_REL)) else []:
            sid = g.spec_id(name)
            if sid and sid not in self.specs:
                self.specs[sid] = g.read_text(os.path.join(root, g.SPECS_REL, name))
        self.by_item = {}
        for pos, _, _, obj in self.log:
            if isinstance(obj.get("item"), str):
                self.by_item.setdefault(obj["item"], []).append((pos, obj))
        self.project_items = sorted(i for i, ls in self.by_item.items()
                                    if i.startswith("P-") and any("route" in o for _, o in ls))
        self.first = self.project_items[0] if self.project_items else None
        self.later = self.project_items[1:]
        self.groundwork = set(i for i in self.by_item if i.startswith("Q-")
                              and research_question(root, i).startswith(GROUNDWORK_PREFIXES))
        self.notes = []
        self.blocks = []         # [(item, [Run], graduation line or None)]
        self._all_runs = []
        for item in self.project_items:
            runs = self.item_runs(item)
            self.blocks.append([item, runs, self.graduation(item)])
            self._all_runs += [r for r in runs if r.is_item_run]
        for block in self.blocks:
            block[1] = self.place_milestones(block[0], block[1])
        for item, runs, _ in self.blocks:
            self.standard_states(item, runs)
        self.sprints()

    # -- step 1: an item's own runs
    def item_runs(self, item):
        lines = self.by_item.get(item, [])
        pos_of = dict((id(o), p) for p, o in lines)
        runs = {}
        order = []
        for obj, phase, it in orch.iterations([o for _, o in lines]):
            key = (phase, it)
            if key not in runs:
                runs[key] = Run(phase, it, item, pos_of[id(obj)])
                order.append(runs[key])
            runs[key].routed.append((pos_of[id(obj)], obj))
        order.sort(key=lambda r: r.first)
        for p, o in lines:
            if "route" in o or not orch.is_applied_decision(o):
                continue
            before = [r for r in order if any(rp < p for rp, _ in r.routed)]
            owner = max(before, key=lambda r: max(rp for rp, _ in r.routed if rp < p)) if before else (
                order[0] if order else None)
            if owner is not None:
                owner.decisions.append((p, o))
        for r in order:
            r.nothing_needed = r.phase == "Build" and any(o.get("nothing_needed") == "Build" for _, o in r.routed)
            for _, o in r.routed + r.decisions:
                nn = o.get("nothing_needed")
                if nn is None:
                    continue
                expected = nn == "Build" and (("route" in o and r.phase == "Build")
                                               or ("route" not in o and o.get("gate") == "criteria"))
                if not expected:
                    self.notes.append("NOTE: %s: a line holding nothing_needed = %r in %s %s marks nothing: only "
                                      "Build can be passed with nothing needed (model S-023 AC7)"
                                      % (item, nn, r.label(), "(a decision line)" if "route" not in o else ""))
        return order

    def graduation(self, item):
        for p, o in self.by_item.get(item, []):
            if orch.is_graduation(o):
                return (p, o)
        return None

    # -- steps 2 to 4: where the project milestones go
    def place_milestones(self, item, runs):
        first_item = item == self.first
        mine = [m for m in self.milestones if (m.for_item is None) == first_item and (first_item or m.for_item == item)]
        if first_item:
            cut = min((p for r in runs for p, o in r.routed if orch.PHASE_OF_STAGE[o["stage"]] in ("Build", "Launch")),
                      default=None)
            lead = [r for r in runs if cut is None or r.first < cut]
        else:
            lead = []
        seq = list(lead)
        count = {}
        for r in lead:
            count[r.phase] = count.get(r.phase, 0) + 1
        prev = seq[-1] if seq else None
        for m in mine:
            if m.phase == "Discovery":
                disc = [r for r in (lead if first_item else runs) if r.phase == "Discovery"]
                target = disc[-1] if (first_item and disc) else (disc[0] if disc else None)
                if target is None:
                    target = next((r for r in seq if r.phase == "Discovery" and r.iteration == 1), None)
                    if target is None:
                        target = Run("Discovery", 1)
                        seq.insert(0, target)
                        count["Discovery"] = count.get("Discovery", 0) + 1
                target.project.append(m)
                continue
            if prev is not None and prev.phase == m.phase:
                prev.project.append(m)
                continue
            count[m.phase] = count.get(m.phase, 0) + 1
            prev = Run(m.phase, count[m.phase])
            prev.project.append(m)
            seq.append(prev)
        rest = [r for r in runs if r not in lead]
        before = lead[-1] if lead else None
        for r in rest:
            twin = next((x for x in seq if x.item is None and x.phase == r.phase and x.iteration == r.iteration), None)
            if twin is not None:
                r.project = twin.project + r.project
                seq[seq.index(twin)] = r
            else:
                seq.insert(seq.index(before) + 1 if before in seq else 0, r)
            before = r
        # The Graduated mark is printed after every run of the item (lines()), so a run from milestone lines
        # alone that would come after it is placed before it.
        return seq

    # -- step 5: the standard milestones of every run
    def match(self, item, phase, pos, research=False):
        """The run a log record at `pos` is matched to: the latest item run of `phase` that begins at or before
        it (among every item's runs for a research item's record), or the item's first run when it comes before
        the item's first routed line."""
        pool = self._all_runs if research else [r for b in self.blocks if b[0] == item for r in b[1] if r.is_item_run]
        cands = [r for r in pool if r.phase == phase and r.first <= pos]
        if cands:
            return max(cands, key=lambda r: r.first)
        own = sorted((r for r in pool if r.item == item), key=lambda r: r.first)
        if own and pos < own[0].first and own[0].phase == phase:
            return own[0]
        return None

    def redoes(self, run, mid):
        if mid in BRIEF_IDS and run.phase == "Discovery" and run.iteration >= 2:
            return True
        if mid == "Discovery-3":
            for q in self.groundwork:
                for p, o in self.by_item.get(q, []):
                    if o.get("action") == "dispatch" and o.get("role") in ("researcher", "source-checker") \
                            and self.match(run.item, "Discovery", p, research=True) is run:
                        return True
            return False
        return any(o.get("action") in ("dispatch", "run-checks") and (o.get("role"), o.get("stage")) in REDO.get(mid, ())
                   for _, o in run.routed)

    def _redone_after(self, run, mid, pos):
        if mid == "Discovery-3":
            for q in self.groundwork:
                for p, o in self.by_item.get(q, []):
                    if p > pos and o.get("action") == "dispatch" and o.get("role") in ("researcher", "source-checker") \
                            and self.match(run.item, "Discovery", p, research=True) is run:
                        return True
            return False
        return any(p > pos and o.get("action") in ("dispatch", "run-checks")
                   and (o.get("role"), o.get("stage")) in REDO.get(mid, ()) for p, o in run.routed)

    def _route_lines(self, item, route):
        return [(p, o) for p, o in self.by_item.get(item, []) if o.get("route") == route]

    def log_part(self, item, run, mid):
        """'ok', 'later' (matched, but the part after the gate's ruling is not there yet) or None, for the log
        part of `mid` matched to `run` under the latest-result rule; 'none' when the milestone has no log part."""
        def matched(lines, phase=run.phase):
            return [p for p, o in lines if self.match(item, phase, p) is run and not self._redone_after(run, mid, p)]
        if mid == "Discovery-3":
            for q in self.groundwork:
                for p, o in self.by_item.get(q, []):
                    if o.get("route") == "source-pass" and self.match(item, "Discovery", p, research=True) is run \
                            and not self._redone_after(run, mid, p):
                        return "ok"
            return None
        if mid in BRIEF_IDS:
            for p in matched(self._route_lines(item, "dor-pass")):
                if mid != "Discovery-5" or self.research_settled(p):
                    return "ok"
            return None
        route = {"Design-1": "define-to-plan-review", "Build-1": "checks-pass", "Build-2": "checks-run-pass",
                 "Build-3": "review-pass", "Launch-4": "launch-pass"}.get(mid)
        if route:
            return "ok" if matched(self._route_lines(item, route)) else None
        if mid == "Design-6":
            passes = matched(self._route_lines(item, "plan-pass"))
            if not passes:
                return None
            freezes = [p for p, o in self.by_item.get(item, []) if o.get("route") in ("freeze-frozen",
                                                                                         "freeze-nothing-needed")
                       and p > min(passes) and self.match(item, "Design", p) is run]
            return "ok" if freezes else "later"
        if mid == "Launch-3":
            passes = matched(self._route_lines(item, "launch-pass"))
            if not passes:
                return None
            grad = self.graduation(item)
            if grad and grad[0] > min(passes) and self.match(item, "Launch", grad[0]) is run:
                return "ok"
            return "later"
        return "none"

    def research_settled(self, dor_pos):
        """Discovery-5: every research item with a routed line before the dor-pass line is source-checked or
        closed (by a decision line with result closed/…) before it."""
        for q, lines in self.by_item.items():
            if not q.startswith("Q-"):
                continue
            routed = [p for p, o in lines if "route" in o]
            if not routed or min(routed) >= dor_pos:
                continue
            if any(p < dor_pos and o.get("route") == "source-pass" for p, o in lines):
                continue
            if any(p < dor_pos and orch.is_applied_decision(o) and str(o.get("result", "")).startswith("closed/")
                   for p, o in lines):
                continue
            return False
        return True

    def file_part(self, item, mid):
        """True, False, 'none' (no file part) or 'not-recorded' (the file the record needs is not there)."""
        st = self.statuses.get(item, {})
        if mid == "Discovery-2":
            return bool(value_targets(self.text))
        if mid == "Discovery-3":
            for suffix in ("groundwork", "discovery"):
                t = read_file(self.root, "decisions/questions/%s-%s.md" % (item, suffix))
                if t is not None and t.startswith("Ruling: "):
                    return True
            return False
        if mid == "Discovery-7":
            secs = part1_sections(self.text)
            return all(n in secs and any(l.strip() and not is_instruction_line(l) for l in secs[n][2])
                       for n in (1, 4, 5))
        if mid in ("Design-2", "Design-4"):
            spec = st.get("spec")
            text = self.specs.get(spec) if isinstance(spec, str) else None
            if text is None:
                return "not-recorded"
            if mid == "Design-2":
                return bool(joins(text))
            return not spec_check.facts_violations("specs/%s" % spec, text)
        if mid == "Launch-3":
            return bool(handover_files(self.root))
        if mid == "Launch-4":
            if not any(monitoring_section_filled(read_file(self.root, f)) for f in handover_files(self.root)):
                return "not-recorded"
            return True
        return "none"

    def standard_states(self, item, runs):
        latest = {}
        latest_item = {}
        for r in runs:
            latest[r.phase] = r
            if r.is_item_run:
                latest_item[r.phase] = r
        state = {}           # (run id, mid) -> (log ok, from label)
        for r in sorted(runs, key=lambda x: (x.phase, x.iteration)):
            prev = next((x for x in runs if x.is_item_run and x.phase == r.phase and x.iteration == r.iteration - 1),
                        None)
            r.standard = []
            for mid, phase, name, _ in STANDARD_MILESTONES:
                if phase != r.phase:
                    continue
                r.standard.append((mid, name) + self._state(item, r, prev, mid, latest, latest_item, state))

    def _state(self, item, r, prev, mid, latest, latest_item, state):
        if r.nothing_needed:
            return ("not needed", None)
        if mid in NOT_RECORDED_IDS or not r.is_item_run:
            return ("not recorded", None)
        # The log part first, so a later iteration can carry it over even where the file rule hides it here.
        log = self.log_part(item, r, mid)
        origin = r.label() if log == "ok" else None
        if log is None and r.iteration >= 2 and prev is not None and not self.redoes(r, mid):
            carried = state.get((id(prev), mid))
            if carried and carried[0]:
                log, origin = "ok", carried[1]
        state[(id(r), mid)] = (log == "ok", origin)
        if mid == "Discovery-3" and not self.groundwork:
            return ("not recorded", None)
        filed = self.file_part(item, mid)
        if filed != "none" and latest.get(r.phase) is not r:
            return ("not recorded", None)
        if filed == "not-recorded":
            return ("not recorded", None)
        if log == "none":
            return ("reached", None) if filed is True else ("not reached", None)
        if log == "later":
            if latest_item.get(r.phase) is r and filed is not False:
                return ("not recorded", None)
            return ("not reached", None)
        if log == "ok" and filed is not False:
            return ("reached", None) if origin == r.label() else ("reached (carried over from %s)" % origin, origin)
        return ("not reached", None)

    # -- step 6: sprints and steps
    def spec_ids(self, sid):
        st, ids = spec_milestones(self.specs.get(sid)) if sid in self.specs else ("missing", [])
        return ids

    def sprints(self):
        by_id = dict((m.id, m) for m in self.milestones)
        tied = {}            # milestone id (project or standard) -> [item]
        listed = set()
        for m in self.milestones:
            for s in m.sprints:
                if not s.startswith("PR #"):
                    listed.add(s)
        for mg in self.merges:
            it, ids = mg["item"], []
            st = self.statuses.get(it, {})
            if it == self.first:
                specs = [mg.get("spec")] + list(st.get("superseded") or [])
                for sid in specs:
                    ids += [i for i in self.spec_ids(sid) if i in by_id and by_id[i].for_item is None]
            elif it.startswith("P-"):
                ids = [m.id for m in self.milestones if m.for_item == it]
            elif isinstance(st.get("milestone"), str):
                ids = [st["milestone"]] if (st["milestone"] in by_id or st["milestone"] in STANDARD_IDS) else []
            seen = []
            for i in ids:
                if i not in seen:
                    seen.append(i)
                    tied.setdefault(i, []).append(it)
            if not seen and it not in listed:
                runs = [r for b in self.blocks if b[0] == self.first for r in b[1] if r.is_item_run]
                lines = [p for p, o in self.by_item.get(it, []) if "route" in o]
                target = None
                if runs and lines:
                    cands = [r for r in runs if r.first <= min(lines)]
                    target = max(cands, key=lambda r: r.first) if cands else min(runs, key=lambda r: r.first)
                elif runs:
                    target = min(runs, key=lambda r: r.first)
                if target is not None:
                    target.untagged.append(it)
        every = [r for _, runs, _ in self.blocks for r in runs]
        for r in every:
            for m in r.project:
                r.sprints[m.id] = list(tied.get(m.id, [])) + [s for s in m.sprints if s not in tied.get(m.id, [])]
        for mid in STANDARD_IDS:
            phase = mid.split("-")[0]
            for x in tied.get(mid, []):
                lines = [p for p, o in self.by_item.get(x, []) if "route" in o]
                target = self.match(self.first, phase, min(lines), research=True) if lines else None
                if target is None:
                    target = next((r for r in every if r.phase == phase), None)
                if target is not None and x not in target.sprints.get(mid, []):
                    target.sprints.setdefault(mid, []).append(x)

    def merged(self, item):
        return any(mg["item"] == item for mg in self.merges)

    def steps_of(self, item):
        return [(p, o) for p, o in self.by_item.get(item, []) if o.get("action") == "dispatch"]

    # -- the NOTE lines
    def run_lines(self, run, pending=False):
        out = [run.label() + (" (nothing needed)" if run.nothing_needed else "")]
        for mid, name, state, _ in run.standard:
            out.append('  %s "%s": %s' % (mid, name, state))
            for s in run.sprints.get(mid, []):
                out += self.sprint_lines(s)
        for m in run.project:
            out.append('  %s "%s"%s' % (m.id, m.name, " (dropped)" if m.dropped else ""))
            sprints = run.sprints.get(m.id, [])
            for s in sprints:
                out += self.sprint_lines(s)
            if pending and not sprints and not m.dropped and run.item is not None:
                st = self.statuses.get(run.item, {})
                specs = [st.get("spec")] + list(st.get("superseded") or [])
                if any(m.id in self.spec_ids(s) for s in specs if isinstance(s, str)):
                    out.append("    sprint pending: %s" % run.item)
        if run.untagged:
            out.append("  untagged")
            for s in run.untagged:
                out += self.sprint_lines(s)
        steps = list(run.decisions)
        if run.item is not None and not self.merged(run.item):
            steps += [(p, o) for p, o in run.routed if o.get("action") == "dispatch"]
        for p, o in sorted(steps, key=lambda x: x[0]):
            if "route" in o:
                out.append("    step %s %s stage %s" % (o.get("time"), o.get("role"), o.get("stage")))
            else:
                out.append("    decision %s %s %s" % (o.get("time"), o.get("gate"), o.get("word")))
        return out

    def sprint_lines(self, s):
        out = ["    sprint %s" % s]
        if not s.startswith("PR #"):
            out += ["      step %s %s stage %s" % (o.get("time"), o.get("role"), o.get("stage"))
                    for _, o in self.steps_of(s)]
        return out

    def lines(self):
        out = []
        for n, (item, runs, grad) in enumerate(self.blocks):
            if n:
                first = min((r for r in runs if r.is_item_run), key=lambda r: r.first, default=None)
                out.append("Later work %d: %s into %s" % (n, item, first.phase if first else "nothing"))
            for r in runs:
                out += self.run_lines(r)
            if grad:
                out.append("Graduated %s" % grad[1].get("time"))
        if not self.blocks:
            seq = self.place_milestones(None, [])
            for r in seq:
                for mid, phase, name, _ in STANDARD_MILESTONES:
                    if phase == r.phase:
                        r.standard.append((mid, name, "not recorded", None))
                out += self.run_lines(r)
        return out

    def gate_runs(self, item, gate):
        """model S-024 AC10: the runs a gate closes, for `item`: the run holding its latest `gate` line for `gate`, and
        at the Launch gate before it the latest Build run that begins before that line."""
        block = next((b for b in self.blocks if b[0] == item), None)
        if block is None:
            return []
        runs = block[1]
        lines = [(p, o) for p, o in self.by_item.get(item, []) if o.get("action") == "gate" and o.get("gate") == gate]
        if not lines:
            return []
        p = lines[-1][0]
        holder = next((r for r in runs if any(rp == p for rp, _ in r.routed)), None)
        if holder is None:
            return []
        out = [holder]
        if gate == "launch":
            builds = [r for r in runs if r.phase == "Build" and r.first is not None and r.first < p]
            if builds:
                out.insert(0, max(builds, key=lambda r: r.first))
        return out


def timeline(root, repo=None):
    """model S-023 AC7: the project's timeline (a Timeline); `repo` (default `root`) is where its git reads run."""
    return Timeline(root, repo)


# --------------------------------------------------------------------------
# The checks. Each returns (violations, notes).


# model S-025: section 9 of the brief, the target user, and the profile it names.
SECTION9 = 9
SWITCH_LINE = "The owner is the user."
PROFILE_REL = orch.PROFILE_REL
PROFILE_LINE = "Profile: %s" % PROFILE_REL
APPROVED_RE = re.compile(r"^Approved: (decisions/questions/P-[0-9]{3,}-user-profile-[1-9][0-9]*\.md)$")
PROFILE_SECTIONS = ("## Who they are", "## What they are trying to get done", "## How they manage today",
                    "## What would make them choose it", "## What would make them say no",
                    "## What they would give for it")
PROFILE_SAY_NO = PROFILE_SECTIONS[4]
NOT_KNOWN = " — not known"
PROFILE_SHA_RE = re.compile(r"^Profile-Sha256: ([0-9a-f]{64})$")
PROFILE_FORM_REL = "docs/users/_PROFILE.md"


def _profile_problems(root, approved):
    """model S-025 AC7: the profile's form and citations, and its approval record's fingerprint."""
    import hashlib
    path = os.path.join(root, *PROFILE_REL.split("/"))
    if not os.path.isfile(path):
        return ["%s: section 9 names %s, which does not exist (model S-025)" % (PROJECT_REL, PROFILE_REL)]
    with open(path, "rb") as fh:
        data = fh.read()
    lines = [l.rstrip("\r") for l in data.decode("utf-8", "replace").split("\n")]
    v = []
    # Only the form's own instruction lines are exempt; any other line, italic or not, cites or is "not known".
    form = read_file(root, PROFILE_FORM_REL) or ""
    form_instructions = set(l.rstrip("\r").rstrip() for l in form.split("\n") if is_instruction_line(l))
    heads = [l.rstrip() for l in lines if l.startswith("## ")]
    if heads != list(PROFILE_SECTIONS):
        v.append("%s: its sections are not the six of docs/users/_PROFILE.md, in order: %s (model S-025)"
                 % (PROFILE_REL, "; ".join(PROFILE_SECTIONS)))
    current, say_no = None, 0
    for i, line in enumerate(lines, 1):
        s = line.rstrip()
        if s.startswith("## "):
            current = s
            continue
        if current is None or not s.strip() or s in form_instructions:
            continue
        cites = [m.group("path") for m in CITATION_RE.finditer(s)]
        barred = [c for c in cites if c == PROJECT_REL or c.startswith("decisions/") or c.startswith("docs/gates/")]
        if barred:
            v.append("%s line %d: cites %s; a profile is built from the research, not from the project's hopes "
                     "(model S-025)" % (PROFILE_REL, i, barred[0]))
        research = [c for c in cites if c.startswith("research/") and ".." not in c.split("/")
                    and os.path.isfile(os.path.join(root, *c.split("/")))]
        if not research and not s.endswith(NOT_KNOWN):
            v.append("%s line %d: cites no record under research/ that exists, and does not end '%s' (model S-025)"
                     % (PROFILE_REL, i, NOT_KNOWN))
        if current == PROFILE_SAY_NO:
            say_no += 1
    if not say_no:
        v.append("%s: '%s' holds no line (model S-025)" % (PROFILE_REL, PROFILE_SAY_NO[3:]))
    rpath = os.path.join(root, *approved.split("/"))
    if not os.path.isfile(rpath):
        return v + ["%s: section 9 names the approval record %s, which does not exist (model S-025)"
                    % (PROJECT_REL, approved)]
    with open(rpath, encoding="utf-8", errors="replace", newline="") as fh:
        rec = [l.rstrip("\r") for l in fh.read().split("\n")]
    if rec[0] != "Decision: approve" or (len(rec) > 1 and rec[1].strip() and not rec[1].startswith(orch.PROXY_PREFIX)):
        v.append("%s: lines 1 and 2 must be `Decision: approve` and an empty line or the `Proxy:` line "
                 "(model S-025)" % approved)
    shas = [m.group(1) for m in (PROFILE_SHA_RE.match(l) for l in rec) if m]
    if len(shas) != 1 or shas[0] != hashlib.sha256(data).hexdigest():
        v.append("%s: its `Profile-Sha256:` line does not match %s as it stands; the owner approves the changed "
                 "profile in a new record, which section 9 then names (model S-025)" % (approved, PROFILE_REL))
    return v


def check_section9(root):
    """model S-025 AC7: section 9 is in one of its two forms whenever it holds content, and holds content once a
    project item is approved or waits on its Design gate."""
    text = read_project(root)
    if text is None:
        return []
    sections = part1_sections(text)
    body = [l.rstrip() for l in sections[SECTION9][2] if l.strip() and not is_instruction_line(l)] \
        if SECTION9 in sections else []
    if not body:
        statuses = project_statuses(root)
        if approved_in(statuses) or waiting_on_design_gate(statuses):
            return ["%s: section '9. The target user' is missing or holds nothing beyond its instruction, and a "
                    "project item is approved or waits on its Design gate: write `%s` or the profile's two lines "
                    "(model S-025)" % (PROJECT_REL, SWITCH_LINE)]
        return []
    profile = os.path.isfile(os.path.join(root, *PROFILE_REL.split("/")))
    if body == [SWITCH_LINE]:
        if profile:
            return ["%s: section 9 says the owner is the user, but %s exists (model S-025)"
                    % (PROJECT_REL, PROFILE_REL)]
        return []
    if len(body) == 2 and body[0] == PROFILE_LINE and APPROVED_RE.match(body[1]):
        return _profile_problems(root, APPROVED_RE.match(body[1]).group(1))
    return ["%s: section 9 is neither the one line `%s` nor the two lines `%s` and `Approved: "
            "decisions/questions/<P-id>-user-profile-<n>.md` (model S-025)" % (PROJECT_REL, SWITCH_LINE, PROFILE_LINE)]


def check_ready(root):
    s9 = check_section9(root)
    v, notes = _check_ready_1_to_8(root)
    return s9 + v, notes


def _check_ready_1_to_8(root):
    started = specs_with_status(root, ("frozen", "superseded"))
    approved = approved_in(project_statuses(root))
    if not started and not approved:
        return [], ["NOTE: no frozen spec yet; the definition of ready is not checked"]
    text = read_project(root)
    if text is None:
        return ["%s: missing — the project document's Part 1 must be complete once a spec is frozen (D-052)"
                % PROJECT_REL], []
    v = []
    if approved:
        # model S-023 AC3: from the Design gate on, section 3 lists the project's own milestones.
        ms = milestone_lines(text)[0]
        if not any(not m.dropped for m in ms):
            v.append("%s: section 3 holds no milestone line that is not marked dropped — the project is approved "
                     "(a project status holds a spec), so its own milestones are listed there, at least one "
                     "(model S-023 AC3)" % PROJECT_REL)
    if not started:
        return v, ["NOTE: the project is approved; no frozen spec yet, so only section 3's milestones are checked"]
    sections = part1_sections(text)
    for n in range(1, PART1_SECTIONS + 1):
        if n not in sections:
            v.append("%s: no '## %d.' section in Part 1 — the definition of ready's sections 1 to 8 must all be "
                     "there (D-052)"
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
    mv, mnotes = milestone_trace(root)
    return v + mv, notes + mnotes


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
    # model S-019 AC1: the Definer's own surface, in glob-list form so `!` lines are honoured.
    definer_globs = ["!" + p if neg else p for neg, p in s.blocks.get(DEFINER, [])] if DEFINER in roster else []
    # model S-013 AC8: extensions added since the merge base count too, as governance_checks scope counts them.
    extends, extends_note = governance_checks.scope_extensions(root, base, default_branch)
    commits = g.read_commits(root, g.rev_list(root, ["--reverse", "%s..HEAD" % base]))
    cache = {}
    v, notes = [], []
    merges = skipped = unscoped = scoped = filings = lane = 0
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
        in_lane = agent == DEFINER and bool(definer_globs)
        for path in g.commit_paths(root, c.sha):
            if any(g.glob_match(gl, path) for gl in governance_checks.BOOKKEEPING_GLOBS):
                continue
            if in_lane and g.glob_list_includes(definer_globs, path):
                lane += 1
                continue
            if g.glob_list_includes(globs, path):
                continue
            if any(g.glob_list_includes(ext, path) for _, ext in extends):
                continue
            v.append("%s: %s: outside the Areas touched of %s (%s) — widen them with a ledger entry's "
                     "extends_scope: in the same range, or leave the path alone" % (c.short, path, sid, rel))
    if lane:
        notes.insert(0, "NOTE: %d definer-lane path(s) bounded by the surface map, not Areas touched" % lane)
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


def check_freeze(root, base, milestones=False):
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
        if milestones and spec_milestones(new)[0] != "ok":
            v.append("%s: frozen in %s..HEAD with no `milestones: M<id>, …` header line naming the project milestones "
                     "it delivers (model S-023 AC8)" % (rel, base[:12]))
        fix = fix_spec_problems(root, rel, sid, new)
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
            if fix == []:
                continue        # model S-023 AC12: a fix spec copies frozen criteria the owner's ruling names
            v.append("%s: frozen in commit %s without a plan-review record %s whose verdict is PASS (%s) — "
                     "the freeze gate (D-043) needs it in the freezing commit or earlier%s"
                     % (rel, sha[:12], plan_rel, why,
                        "; as a fix spec it needs none only when: " + "; ".join(fix) if fix else ""))
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


# --------------------------------------------------------------------------
# model S-023 AC8: the milestone checks


def milestone_trace(root):
    """(violations, notes) that `trace` adds for the milestones (model S-023 AC8), the timeline NOTE included."""
    v, notes = [], []
    text = read_project(root)
    if text is None:
        return v, notes
    ms, problems = milestone_lines(text)
    for n, msg in problems:
        v.append("%s line %d: %s (model S-023 AC3)" % (PROJECT_REL, n, msg))
    ids = set(m.id for m in ms)
    merged = set(mg["item"] for mg in read_merges(root))
    prs = None
    for m in ms:
        for s in m.sprints:
            where = "%s line %d: %s's sprint %s" % (PROJECT_REL, m.lineno, m.id, s)
            if s.startswith("PR #"):
                n = int(s[4:])
                rec = read_file(root, "reviews/%d/reviewer.md" % n)
                if rec is None:
                    v.append("%s has no reviews/%d/reviewer.md (model S-023 AC5)" % (where, n))
                elif review_check.parse_verdict(rec) != "PASS":
                    v.append("%s: reviews/%d/reviewer.md's verdict is not PASS (model S-023 AC5)" % (where, n))
                if prs is None:
                    prs = merged_pr_numbers(root)
                if n not in prs:
                    v.append("%s has no merge commit `Merge pull request #%d from …` reachable from HEAD: a sprint "
                             "is built, reviewed and merged (model S-023 AC5)" % (where, n))
            elif s not in merged:
                v.append("%s has no line in status/merges.jsonl (model S-023 AC5)" % where)
    for rel, sid, spec_text in specs_with_status(root, ("draft", "frozen", "superseded")):
        status = g.spec_status(spec_text)[0]
        line, fm = spec_fixes(spec_text)
        if line is not None and fm is None:
            msg = "%s: its `fixes:` line %r is not `fixes: S-<n> AC<n>, AC<n>` (model S-023 AC12)" % (rel, line)
            (v.append(msg) if status == "draft" else notes.append("NOTE: " + msg))
        state, named = spec_milestones(spec_text)
        unknown = [i for i in named if i not in ids]
        if state == "malformed" or unknown or (state == "missing" and status != "draft"):
            why = ("has no `milestones:` header line" if state == "missing" else
                   "has a malformed `milestones:` line" if state == "malformed" else
                   "names %s, not in %s section 3" % (", ".join(unknown), PROJECT_REL))
            msg = "%s %s (model S-023 AC5)" % (rel, why)
            (v.append(msg) if status == "draft" else notes.append("NOTE: " + msg))
    tl = timeline(root)
    notes += ["NOTE: " + l for l in tl.lines()]
    notes += tl.notes
    for item in tl.later:
        if not any(m.for_item == item for m in ms):
            notes.append("NOTE: later work %s has no milestone of its own in %s section 3 (` · for: %s`) "
                         "(model S-023 AC12)" % (item, PROJECT_REL, item))
    for m in ms:
        if m.for_item and (m.for_item == tl.first or m.for_item not in tl.project_items):
            notes.append("NOTE: %s line %d: %s's ` · for: %s` names %s (model S-023 AC3)"
                         % (PROJECT_REL, m.lineno, m.id, m.for_item,
                            "the first project item" if m.for_item == tl.first else "an item with no routed line"))
    for item, st in sorted(project_statuses(root).items()):
        tag = st.get("milestone")
        if isinstance(tag, str) and tag not in ids and tag not in STANDARD_IDS:
            notes.append("NOTE: status/%s.toml: milestone %s is neither a milestone of %s section 3 nor a standard "
                         "milestone (model S-023 AC8)" % (item, tag, PROJECT_REL))
    return v, notes


def _ls(root, rev, prefix):
    try:
        return g.split_z(g.git(root, ["ls-tree", "-r", "-z", "--name-only", rev, "--", prefix]))
    except g.GitError:
        return []


def statuses_at(root, rev):
    out = {}
    for rel in _ls(root, rev, "status"):
        m = re.fullmatch(r"status/([PQE]-[0-9]{3,})\.toml", rel)
        if not m:
            continue
        try:
            st = tomllib.loads(g.git_text(root, rev, rel) or "")
        except (tomllib.TOMLDecodeError, g.UsageError):
            continue
        out[m.group(1)] = st
    return out


def milestones_at(root, rev):
    text = g.git_text(root, rev, PROJECT_REL)
    return milestone_lines(text)[0] if text is not None else []


def _whole(word, text):
    return re.search(r"(?<![0-9A-Za-z])%s(?![0-9A-Za-z])" % re.escape(word), text or "") is not None


def ruling_path_problem(path):
    """Why `path` is not a ruling record path (AC8's path rule), or None."""
    if not path or path.startswith("/") or posixpath.normpath(path) != path or ".." in path.split("/"):
        return "not a normalised relative path"
    parts = path.split("/")
    ok = (len(parts) == 3 and parts[0] == "decisions" and (parts[1] == "questions" or ITEM_ID_RE.match(parts[1])))
    if not ok:
        return "not a ruling record under decisions/questions/ or decisions/<item>/"
    if parts[2] == "README.md" or parts[2].endswith("-notes.md"):
        return "a README or notes file, not a ruling record"
    return None


def check_milestones(root, base):
    """model S-023 AC8: never erased, changed only with the owner's record, Critic-checked, and new work tagged.
    Returns [(check name, finding)], [note]."""
    g.verify_commit(root, base)
    g.verify_commit(root, "HEAD", "HEAD")
    f, notes = [], []
    st_ref, st_head = statuses_at(root, base), statuses_at(root, "HEAD")
    approved_ref, approved_head = approved_in(st_ref), approved_in(st_head)
    waiting_ref = waiting_on_design_gate(st_ref)
    old = dict((m.id, m) for m in milestones_at(root, base))
    new_list = milestones_at(root, "HEAD")
    new = dict((m.id, m) for m in new_list)
    commits = g.read_commits(root, g.rev_list(root, ["--reverse", "%s..HEAD" % base]))
    own = [c for c in commits if not c.is_merge() and PROJECT_REL in g.commit_paths(root, c.sha)]
    rulings = [(c, p) for c in own for p in c.trailer("Owner-Ruling")]
    checks = [(c, p) for c in own for p in c.trailer("Critic-Check")]
    head_text = {}

    def at_head(path):
        if path not in head_text:
            head_text[path] = g.git_text(root, "HEAD", path) if not ruling_path_problem(path) else None
        return head_text[path]

    def ruling_why(path, mid):
        why = ruling_path_problem(path)
        if why:
            return why
        t = at_head(path)
        if t is None:
            return "no such file at HEAD"
        if not RULING_FIRST_RE.match(t.split("\n", 1)[0].rstrip("\r")):
            return "its first line is neither `Decision: <word>` nor `Ruling: …`"
        if not _whole(mid, t):
            return "it does not name %s" % mid
        return None

    def hold_licence(mid):
        """A Design-gate hold whose Reason: names `mid` licenses it, but only for the wait it answers: the project
        waits on its Design gate at REF, and the hold record was added in REF..HEAD (model S-023 AC8)."""
        if not waiting_ref:
            return None
        for rel in _ls(root, "HEAD", "decisions"):
            if not re.fullmatch(r"decisions/P-[0-9]{3,}/dor-[0-9]+\.md", rel):
                continue
            if g.git_blob(root, base, rel) is not None:
                continue                 # written before the range: it answered an earlier wait
            t = g.git_text(root, "HEAD", rel) or ""
            lines = t.split("\n")
            if lines[0].rstrip("\r").rstrip() != "Decision: hold":
                continue
            if any(l.startswith("Reason:") and _whole(mid, l) for l in lines):
                return rel
        return None

    def hold_text(mid):
        rel = hold_licence(mid)
        return (g.git_text(root, "HEAD", rel) or "") if rel else ""

    def licensed(mid):
        if any(ruling_why(p, mid) is None for _, p in rulings):
            return True
        return hold_licence(mid) is not None

    def why_not(mid, what):
        msg = ("%s %s: needs an Owner-Ruling: trailer, on a commit that changes %s, naming the owner's ruling record "
               "that names %s (model S-023 AC8)" % (mid, what, PROJECT_REL, mid))
        reasons = ["Owner-Ruling: %s: %s" % (p, ruling_why(p, mid)) for _, p in rulings]
        return msg + ("; " + "; ".join(reasons) if reasons else "")

    if approved_ref:
        for mid, m in old.items():
            if mid not in new:
                f.append(("v3_checks.milestones", "%s is in %s section 3 at %s but not at HEAD: a milestone is never "
                                                  "deleted or renumbered; to drop it, end its line with ` · dropped` "
                                                  "(model S-023 AC8)" % (mid, PROJECT_REL, base)))
            elif m.dropped and not new[mid].dropped:
                f.append(("v3_checks.milestones", "%s was marked dropped at %s and is not at HEAD: a dropped milestone "
                                                  "stays dropped (model S-023 AC8)" % (mid, base)))
    when = "after approval" if approved_ref else "while the project waits on its Design gate"
    if approved_ref or waiting_ref:
        changed = []
        for mid, m in new.items():
            if mid not in old:
                changed.append((mid, "added " + when))
            else:
                o = old[mid]
                if m.dropped and not o.dropped:
                    changed.append((mid, "marked dropped " + when))
                if m.phase != o.phase:
                    changed.append((mid, "moved from %s to %s %s" % (o.phase, m.phase, when)))
                if m.for_item != o.for_item:
                    changed.append((mid, "given another ` · for:` item %s" % when))
        common_old = [i for i in old if i in new]
        common_new = [m.id for m in new_list if m.id in old]
        pos_old = dict((i, n) for n, i in enumerate(common_old))
        for a_i in range(len(common_new)):
            for b_i in range(a_i + 1, len(common_new)):
                a, b = common_new[a_i], common_new[b_i]
                if pos_old[a] > pos_old[b]:
                    changed.append((a, "reordered with %s %s" % (b, when)))
                    changed.append((b, "reordered with %s %s" % (a, when)))
        if waiting_ref and not approved_ref:
            for mid, o in old.items():
                if mid not in new:
                    changed.append((mid, "deleted " + when))
                elif o.dropped and not new[mid].dropped:
                    changed.append((mid, "un-dropped " + when))
        seen = set()
        for mid, what in changed:
            if (mid, what) in seen:
                continue
            seen.add((mid, what))
            if not licensed(mid):
                f.append(("v3_checks.milestones", why_not(mid, what)))
    if approved_ref:
        ruling_paths = set(p for _, p in rulings)
        for m in new_list:
            o = old.get(m.id)
            if o is not None and (o.name, o.done) == (m.name, m.done):
                continue
            what = "added after approval" if o is None else "reworded after approval"
            part = m.part()
            found, reasons = None, []
            for _, p in checks:
                why = ruling_path_problem(p)
                t = at_head(p) if why is None else None
                if why is None and p in ruling_paths:
                    why = "it is also an Owner-Ruling: record; the Critic's check is a file of its own"
                elif why is None and t is None:
                    why = "no such file at HEAD"
                elif why is None and t.startswith(("Decision:", "Ruling:")):
                    why = "it starts like an owner's record, not the Critic's"
                elif why is None and review_check.parse_verdict(t) != "PASS":
                    why = "its verdict is not PASS"
                elif why is None and not any(re.match(r"^(?:- |`)?" + re.escape(part), l)
                                             for l in t.split("\n")):
                    why = "it does not quote %r at the start of a line" % part
                if why is None:
                    found = p
                    break
                reasons.append("Critic-Check: %s: %s" % (p, why))
            if found is None:
                f.append(("v3_checks.milestones", "%s %s: needs a Critic-Check: trailer naming the Critic's PASS "
                                                  "record that quotes '%s' (model S-023 AC8)%s"
                          % (m.id, what, part, "; " + "; ".join(reasons) if reasons else "")))
            elif o is None and not any(ruling_why(p, m.id) is None and found in (at_head(p) or "")
                                       for _, p in rulings) and found not in hold_text(m.id):
                f.append(("v3_checks.milestones", "%s added after approval: the owner's ruling record that licenses it "
                                                  "names no Critic-Check: record %s (model S-023 AC8)" % (m.id, found)))
    # Tags on new work.
    live = set(i for i, m in new.items() if not m.dropped)
    for c in commits:
        if c.is_merge():
            continue
        for path in g.commit_paths(root, c.sha):
            mm = re.fullmatch(r"intake/requests/(Q-[0-9]{3,})\.toml", path)
            if not mm or g.git_blob(root, c.sha, path) is None:
                continue
            if c.parents and g.git_blob(root, c.parents[0], path) is not None:
                continue                 # not the commit that adds it
            try:
                req = tomllib.loads(g.git_text(root, c.sha, path) or "")
            except tomllib.TOMLDecodeError:
                continue
            if req.get("kind") != "research":
                continue
            if not c.parents or not approved_in(statuses_at(root, c.parents[0])):
                continue                 # filed before approval: no tag needed (AC4)
            tag = req.get("milestone")
            if tag is None:
                why = "holds no `milestone`"
            elif not isinstance(tag, str) or not (tag in live or tag in STANDARD_IDS):
                why = ("names %r, a dropped milestone" % tag if isinstance(tag, str) and tag in new else
                       "names %r, neither a milestone of %s section 3 nor a standard milestone" % (tag, PROJECT_REL))
            else:
                continue
            f.append(("v3_checks.milestone_tags", "%s (commit %s) %s: research filed after the project's approval "
                                                  "names the milestone it serves (model S-023 AC4)"
                      % (path, c.short, why)))
    if approved_head:
        for name in g.spec_files_at(root, "HEAD"):
            rel = "%s/%s" % (g.SPECS_REL, name)
            t = g.git_text(root, "HEAD", rel) or ""
            status = g.spec_status(t)[0]
            if spec_milestones(t)[0] != "missing":
                continue
            if status == "draft":
                f.append(("v3_checks.milestone_tags", "%s is a draft spec with no `milestones:` header line naming the "
                                                      "project milestones it delivers (model S-023 AC5)" % rel))
            elif status in ("frozen", "superseded"):
                notes.append("NOTE: %s (%s) carries no `milestones:` line" % (rel, status))
    for item, st in sorted(st_head.items()):
        if st.get("kind") == "research" and st.get("state") not in ("done", "closed") and "milestone" not in st:
            notes.append("NOTE: open research item %s carries no milestone tag" % item)
    notes.insert(0, "NOTE: the project is %s at %s and %s at HEAD; %d milestone(s) at HEAD"
                 % ("approved" if approved_ref else ("waiting on its Design gate" if waiting_ref else "not approved"),
                    base, "approved" if approved_head else "not approved", len(new_list)))
    return f, notes


def fix_spec_problems(root, rel, sid, text):
    """model S-023 AC8, AC12: why a spec with a `fixes:` line may not freeze without a plan review of its own
    (empty when it may: its criteria are copied unchanged from a frozen spec, as the owner's ruling names them)."""
    line, fm = spec_fixes(text)
    if fm is None:
        return None
    target, ids = fm.group(1), fm.group(2).split(", ")
    out = []
    if target == sid:
        return ["%s's fixes: line names %s itself: a fix spec copies the criteria of another, frozen spec" % (sid, sid)]
    names = [n for n in g.spec_files_at(root, "HEAD") if g.spec_id(n) == target]
    other = g.git_text(root, "HEAD", "%s/%s" % (g.SPECS_REL, names[0])) if names else None
    if other is None:
        out.append("%s fixes %s, which is not in %s/" % (sid, target, g.SPECS_REL))
    elif g.spec_status(other)[0] != "frozen":
        out.append("%s fixes %s, which is not frozen" % (sid, target))
    else:
        mine = criterion_blocks(text)
        theirs = dict(criterion_blocks(other))
        for lineno, stray in criteria_strays(text):
            out.append("%s line %d: %r is in its Acceptance criteria but in none of its copied criteria: a fix spec "
                       "freezes no new criterion" % (rel, lineno, stray.strip()))
        if [n for n, _ in mine] != ids:
            out.append("%s's acceptance criteria are %s, not exactly %s of its fixes: line, in that order: a fix spec "
                       "freezes no new criterion" % (sid, ", ".join(n for n, _ in mine) or "none", ", ".join(ids)))
        for n, block in mine:
            if n in ids and theirs.get(n) != block:
                out.append("%s fixes %s %s, but its %s is not %s's %s copied unchanged: a fix spec freezes no new "
                           "criterion" % (sid, target, n, n, target, n))
    holders = [i for i, st in statuses_at(root, "HEAD").items() if i.startswith("P-") and st.get("spec") == sid]
    if not holders:
        out.append("no project status holds spec = %r" % sid)
    else:
        item = holders[0]
        try:
            req = tomllib.loads(g.git_text(root, "HEAD", "intake/requests/%s.toml" % item) or "")
        except tomllib.TOMLDecodeError:
            req = {}
        ruling = req.get("ruling")
        if req.get("enters") != "Build" or not isinstance(ruling, str):
            out.append("%s's request names no ruling for a fix entering at Build (enters = \"Build\", ruling)" % item)
        else:
            rt = g.git_text(root, "HEAD", ruling) if not ruling_path_problem(ruling) else None
            if rt is None:
                out.append("%s, the ruling %s's request names, is not in the tree" % (ruling, item))
            elif not rt.startswith("Ruling: "):
                out.append("%s, the ruling %s's request names, does not start `Ruling: `" % (ruling, item))
            else:
                fixes = [l.rstrip("\r") for l in rt.split("\n") if l.startswith("Fixes: ")]
                if len(fixes) != 1:
                    out.append("%s holds %d `Fixes:` lines; the ruling names one" % (ruling, len(fixes)))
                elif fixes[0][len("Fixes: "):] != line[len("fixes: "):]:
                    out.append("%s's fixes: line is not the Fixes: line of %s, the ruling %s's request names"
                               % (sid, ruling, item))
    out += spec_check.facts_violations(rel, text)
    return out


def criteria_strays(text):
    """[(line number, line)] of the non-blank lines of a spec's Acceptance criteria section that belong to no
    criterion bullet (`- AC<n>` or `- **AC<n>` and its indented continuation lines)."""
    out, inside = [], False
    for lineno, line in section(text, _CRITERIA_HEADING_RE) or []:
        if _CRITERION_RE.match(line):
            inside = True
        elif not line.strip() or (inside and line[:1] in (" ", "\t")):
            pass                    # model S-029 AC9: a blank line does not end a criterion
        else:
            inside = False
            out.append((lineno, line))
    return out


def criterion_blocks(text):
    """[(AC<n>, block)] of a spec's Acceptance criteria section: each bullet `- AC<n>` or `- **AC<n>` with its
    indented continuation lines, byte for byte."""
    body = section(text, _CRITERIA_HEADING_RE) or []
    out, cur, blanks = [], None, []
    for _, line in body:
        m = _CRITERION_RE.match(line)
        if m:
            cur, blanks = ["AC" + m.group(1), [line]], []
            out.append(cur)
        elif not line.strip():
            blanks.append(line)     # model S-029 AC9: kept only when an indented line follows
        elif cur is not None and line[:1] in (" ", "\t"):
            cur[1] += blanks + [line]
            blanks = []
        else:
            cur, blanks = None, []
    return [(n, "\n".join(b)) for n, b in out]


# --------------------------------------------------------------------------
# model S-024 AC10: each phase gate's case


GATE_OF_PHASE = {"design": "dor", "build": "criteria", "launch": "launch"}
CASE_RE = re.compile(r"^docs/gates/([PQE]-[0-9]{3,})/(design|build|launch)-gate-([1-9][0-9]*)-case\.md$")
CRITIC_RECORD_RE = re.compile(r"^reviews/([PQE]-[0-9]{3,})/_(design|build|launch)-gate-([1-9][0-9]*)-critic\.md$")
CASE_SECTIONS = ("## 1. The ask", "## 2. The vision", "## 3. What this phase taught us",
                 "## 4. The plan for the next phase", "## 5. The risks", "## 6. Cost and limits",
                 "## 7. Kill criteria", "## 8. What the owner is agreeing to", "## 9. Appendix: the phase record")
NOTHING_NEEDED_HEADING = "## Nothing needed in Build"
NOTHING_NEEDED_PARTS = ("### What was checked", "### What was adjusted", "### Why nothing is needed")
GATE_FORM_REL = "docs/gates/_GATE.md"
CITATION_RE = re.compile(r"\[(?P<path>[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)*)(?::(?P<line>[1-9][0-9]*))?\]")
IMAGE_RE = re.compile(r"^!\[([^\]]*)\]\(([^)\s]+)\)$")
TEXT_ALT_RE = re.compile(r"^\*Text alternative: (\S.*)\*$")
TABLE_SEP_RE = re.compile(r"^\|?(\s*:?-+:?\s*\|)+\s*:?-*:?\s*$")
DETAILS_RE = re.compile(r"^(?:<details>|</details>|<summary>.*</summary>)$")
PROPOSER_RE = re.compile(r"^\*\*The proposer's recommendation:\*\* (proceed|hold|recycle into "
                         r"(Discovery|Design|Build|Launch)|kill)\b")
NUMBER_RE = re.compile(r"(?<![\w.,])[0-9]+(?:[.,][0-9]+)*(?![\w]|[.,][0-9])")
WORD_LIMIT = 350
# model S-025: the proposal beside each case, and the User representative's record no case may cite.
PROPOSAL_RE = re.compile(r"^docs/gates/([PQE]-[0-9]{3,})/(design|build|launch)-gate-([1-9][0-9]*)-proposal\.md$")
USER_RECORD_RE = re.compile(r"^reviews/([PQE]-[0-9]{3,})/_(design|build|launch)-gate-([1-9][0-9]*)-user\.md$")
PROPOSAL_FORM_REL = "docs/gates/_PROPOSAL.md"
PROPOSAL_LABEL = "**Shown to the user representative, a simulation of the target user, not real users.**"
PROPOSAL_SECTIONS = ("## 1. What it is", "## 2. What it does for you", "## 3. How you would use it",
                     "## 4. What it looks like", "## 5. What it asks of you")
PROPOSAL_COUNTED = (0, 1, 4)              # sections 1, 2 and 5
PROPOSAL_NONE_YET = {2: "Scenarios come with the design: none yet at this gate.",
                     3: "Screens come with the design: none yet at this gate."}
PROPOSER_LINE = "**The proposer's recommendation:**"
SCENARIO_RE = re.compile(r"^> (?P<words>\S.*?) \[(?P<path>specs/[A-Za-z0-9_.-]+\.md):(?P<line>[1-9][0-9]*)\]$")
SCREEN_RE = re.compile(r"^- (?P<name>\S.*?) \[(?P<path>docs/design/screens/[A-Za-z0-9_./-]+)\]$")
NO_SCREENS_RE = re.compile(r"^No screens: \S")
PROPOSAL_WORD_LIMIT = 200
USER_RECORD_CITED = "a case never carries the user representative's verdict; it reaches the owner on the card (model S-025)"


def record_lines(full):
    """A record's lines, split on "\n" only; a final newline ends the last line (model S-029 AC8)."""
    with open(full, encoding="utf-8", errors="replace", newline="") as fh:
        rows = fh.read().split("\n")
    return rows[:-1] if rows and rows[-1] == "" else rows


def carries_verdict(path, rows, ln):
    """model S-029 AC5: whether a citation shows the user representative's reject: any line of a decision record
    that holds a `User-Override:` line, or a dispatch log's cited part (line ln, or all of it) naming one."""
    if path.startswith("decisions/"):
        return any(r.startswith("User-Override:") for r in rows)
    part = [rows[ln - 1]] if ln is not None and ln <= len(rows) else rows
    return path.startswith("dispatch-log/") and any("User-Override:" in r for r in part)


def changed_cases(root, base, pattern=CASE_RE):
    names = g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", base, "HEAD", "--", "docs/gates"]))
    return [n for n in sorted(names) if pattern.match(n) and g.git_blob(root, "HEAD", n) is not None]


def citable_paths(tree, item, spec, ruling):
    """The files the session runner's pack loop would copy for a critic-gate entry of `item` from `tree`."""
    import session_runner as sr
    packs = _toml_file(os.path.join(tree, "governance", "PACKS.toml")) or {}
    pe = (packs.get("roles") or {}).get("critic-gate")
    if not isinstance(pe, dict):
        return set()
    runner = _toml_file(os.path.join(tree, "governance", "RUNNER.toml")) or {}
    limit = (runner.get("limits") or {}).get("file_bytes")
    limit = limit if isinstance(limit, int) and not isinstance(limit, bool) else 1 << 20
    values = {"spec": spec, "item": item, "question": None, "project": None, "ruling": ruling}
    reads = sr._fill(list(pe.get("must_read", [])) + list(pe.get("may_read", [])), values)
    hidden = sr._fill(list(pe.get("must_not_see", [])), values)
    reserved = (sr.norm("BRIEF.md"), sr.norm(".claude/agents/critic.md"))
    out = set()
    for rel, st, kind in sr.walk(tree, prune_git=True):
        if kind != "file" or not sr.is_utf8(rel):
            continue
        n = sr.norm(rel)
        if sr.hard_linked(st) or sr.always_out(n) or st.st_size > limit or n in reserved:
            continue
        if sr.under(n, "decisions") and n.endswith("-notes.md"):
            continue
        if sr.USER_RECORD_RE.fullmatch(n):
            continue                # model S-025: the gate Critic's pack never holds one, so no case cites one
        if sr._any(reads, n) and not sr._any(hidden, n):
            out.add(rel)
    return out


def case_problems(root, rel, tree, tl, cited_ok, form_instructions):
    """The findings for one case, read at HEAD, its citations resolved in `tree` (model S-024 AC10)."""
    m = CASE_RE.match(rel)
    item, phase, n = m.group(1), m.group(2), int(m.group(3))
    gate = GATE_OF_PHASE[phase]
    text = g.git_text(root, "HEAD", rel) or ""
    lines = [l.rstrip("\r") for l in text.split("\n")]
    v = []

    def bad(i, msg):
        v.append("%s line %d: %s (model S-024 AC10)" % (rel, i + 1, msg))

    # Title and order.
    nonblank = [i for i, l in enumerate(lines) if l.strip()]
    title = "# %s — the %s gate" % (item, phase.capitalize())
    if not nonblank or lines[nonblank[0]] != title:
        bad(nonblank[0] if nonblank else 0, "the first line must be exactly %r" % title)
    first_sec = next((i for i, l in enumerate(lines) if l == CASE_SECTIONS[0]), None)
    for i in nonblank[1:]:
        if first_sec is not None and i >= first_sec:
            break
        bad(i, "nothing comes between the title and `%s`" % CASE_SECTIONS[0])
        break
    # Sections.
    where = {}
    for h in CASE_SECTIONS:
        at = [i for i, l in enumerate(lines) if l == h]
        if len(at) != 1:
            bad(at[1] if len(at) > 1 else 0, "%s `%s`" % ("a repeated section" if at else "no section", h))
        else:
            where[h] = at[0]
    order = [where[h] for h in CASE_SECTIONS if h in where]
    if order != sorted(order):
        bad(order[0] if order else 0, "the nine sections are out of order")
    s8, s9 = where.get(CASE_SECTIONS[7]), where.get(CASE_SECTIONS[8])
    heads = set(CASE_SECTIONS) | {NOTHING_NEEDED_HEADING} | set(NOTHING_NEEDED_PARTS)
    # Nothing needed in Build.
    nn = [i for i, l in enumerate(lines) if l == NOTHING_NEEDED_HEADING]
    nn_span = None
    if nn:
        if phase != "build":
            bad(nn[0], "`%s` appears only in a Build gate's case" % NOTHING_NEEDED_HEADING)
        elif len(nn) > 1:
            bad(nn[1], "`%s` appears twice" % NOTHING_NEEDED_HEADING)
        elif s8 is None or s9 is None or not s8 < nn[0] < s9:
            bad(nn[0], "`%s` sits between sections 8 and 9" % NOTHING_NEEDED_HEADING)
        else:
            nn_span = (nn[0], s9)
            parts = [(h, [i for i in range(nn[0], s9) if lines[i] == h]) for h in NOTHING_NEEDED_PARTS]
            at = [x[1][0] for x in parts if len(x[1]) == 1]
            if any(len(x[1]) != 1 for x in parts) or at != sorted(at):
                bad(nn[0], "`%s` needs its three headings, once each and in order: %s"
                    % (NOTHING_NEEDED_HEADING, ", ".join(NOTHING_NEEDED_PARTS)))
            else:
                ends = at[1:] + [s9]
                for start, end in zip(at, ends):
                    if not any(CITATION_RE.search(lines[i]) for i in range(start + 1, end)):
                        bad(start, "`%s` needs at least one line with a citation" % lines[start])
    # The recommendation.
    s1, s2 = where.get(CASE_SECTIONS[0]), where.get(CASE_SECTIONS[1])
    if s1 is not None and not any(PROPOSER_RE.match(l) for l in lines[s1:s2 if s2 is not None else len(lines)]):
        bad(s1, "section 1 holds no line `**The proposer's recommendation:** <proceed, hold, recycle into <Phase>, "
                "or kill> — <why>`")
    # Fenced blocks.
    fenced = set()
    blocks = []                    # (kind, open line, close line)
    i = 0
    while i < len(lines):
        l = lines[i]
        if l.startswith("```") or l.startswith("~~~"):
            kind = l[3:] if l.startswith("```") else None
            ok = kind == "mermaid" or (kind == "milestones" and s9 is not None and i > s9)
            if not ok:
                bad(i, "a fenced block other than ```mermaid or the one ```milestones block in section 9")
            j = i + 1
            while j < len(lines) and lines[j] != "```":
                j += 1
            if j >= len(lines):
                bad(i, "a fenced block with no closing ``` line")
            blocks.append((kind, i, j))
            fenced.update(range(i, min(j, len(lines) - 1) + 1))
            i = j + 1
            continue
        i += 1
    # The milestone list.
    ms_blocks = [b for b in blocks if b[0] == "milestones" and s9 is not None and b[1] > s9]
    expected = []
    for r in tl.gate_runs(item, gate):
        expected += tl.run_lines(r, pending=True)
    if len(ms_blocks) != 1 or lines[ms_blocks[0][1] + 1:ms_blocks[0][2]] != expected:
        bad(ms_blocks[0][1] if ms_blocks else (s9 or 0),
            "section 9 needs one ```milestones block holding exactly these lines, from the timeline (model S-023 "
            "AC7); copy it:\n```milestones\n%s\n```" % "\n".join(expected))
    # Lines exempt from citations, and the counted words.
    images, alts, captions = set(), set(), set()
    for i, l in enumerate(lines):
        if i not in fenced and IMAGE_RE.match(l):
            images.add(i)
        if i not in fenced and TEXT_ALT_RE.match(l):
            alts.add(i)
    for i in sorted(images | alts):
        nxt = next((j for j in range(i + 1, len(lines)) if lines[j].strip()), None)
        if nxt is not None and nxt not in alts and nxt not in images:
            captions.add(nxt)
    seps = set(i for i, l in enumerate(lines) if TABLE_SEP_RE.match(l) and i not in fenced)
    table_heads = set(i - 1 for i in seps if i > 0)
    title_i = nonblank[0] if nonblank else 0
    cited = []
    for i, l in enumerate(lines):
        if i <= title_i or not l.strip():
            continue
        if l in heads or l in form_instructions or i in fenced or i in images or i in alts or i in seps \
                or i in table_heads or DETAILS_RE.match(l.strip()):
            for mm in CITATION_RE.finditer(l):
                if i not in fenced and i not in images:
                    cited.append((i, mm))
            continue
        found = list(CITATION_RE.finditer(l))
        if not found:
            bad(i, "a line that states something cites no record: end it with [<path>] or [<path>:<line>]")
        cited += [(i, mm) for mm in found]
    # Citable records.
    for i, mm in cited:
        path, ln = mm.group("path"), mm.group("line")
        full = os.path.join(tree, *path.split("/"))
        if any(part in (".", "..") for part in path.split("/")):
            bad(i, "the cited record %s is not a path inside the case's tree (no `.` or `..` parts)" % path)
        elif USER_RECORD_RE.match(path):
            v.append("%s line %d: cites %s: %s" % (rel, i + 1, path, USER_RECORD_CITED))
        elif not os.path.isfile(full) or os.path.islink(full):
            bad(i, "the cited record %s is not a file in the case's tree" % path)
        elif path not in cited_ok:
            bad(i, "the cited record %s is not one the Critic's gate pack holds" % path)
        else:
            rows = record_lines(full)
            if ln is not None and int(ln) > len(rows):
                bad(i, "%s has no line %s" % (path, ln))
            elif carries_verdict(path, rows, int(ln) if ln is not None else None):     # model S-029 AC5
                v.append("%s line %d: cites %s: %s; the cited part holds it (model S-029)"
                         % (rel, i + 1, path, USER_RECORD_CITED))
    paths = set(mm.group("path") for _, mm in cited)
    # The ruling record, and the Launch gate's own records.
    req = _toml_file(os.path.join(tree, "intake", "requests", "%s.toml" % item)) or {}
    if "enters" in req and isinstance(req.get("ruling"), str) and req["ruling"] not in paths:
        bad(0, "the case of later work cites no line of its ruling record %s" % req["ruling"])
    if phase == "launch":
        spec = (_toml_file(os.path.join(tree, "status", "%s.toml" % item)) or {}).get("spec")
        if not any(p.startswith("docs/handover/") and p != "docs/handover/_TEMPLATE.md" for p in paths):
            bad(0, "a Launch gate's case cites the handover package, a file under docs/handover/")
        if not isinstance(spec, str) or "reviews/%s/reviewer.md" % spec not in paths:
            bad(0, "a Launch gate's case cites the launch review, reviews/%s/reviewer.md" % spec)
    # Length.
    if s1 is not None and s9 is not None:
        words = 0
        for i in range(s1, s9):
            l = lines[i]
            if nn_span and nn_span[0] <= i < nn_span[1]:
                continue
            if not l.strip() or l in heads or l in form_instructions or i in fenced or i in images or i in alts \
                    or i in captions or i in seps or DETAILS_RE.match(l.strip()):
                continue
            words += sum(1 for tok in CITATION_RE.sub(" ", l).split() if re.search(r"[^\W_]", tok))
        if words > WORD_LIMIT:
            bad(s1, "sections 1 to 8 hold %d counted words, above %d" % (words, WORD_LIMIT))
    # The appendix.
    if s9 is not None:
        after = next((i for i in range(s9 + 1, len(lines)) if lines[i].strip()), None)
        if after is None or lines[after].strip() != "<details>":
            bad(s9, "section 9's first line is `<details>`: the appendix is folded away")
        if not nonblank or lines[nonblank[-1]].strip() != "</details>":
            bad(nonblank[-1] if nonblank else 0, "the case ends with the line `</details>`")
    # Visuals.
    visuals = [(i, "image") for i in sorted(images)] + [(b[2], "mermaid") for b in blocks if b[0] == "mermaid"]
    for i, kind in visuals:
        if kind == "image":
            alt_text = IMAGE_RE.match(lines[i]).group(1).strip()
            cap = next((j for j in range(i + 1, len(lines)) if lines[j].strip()), None)
        else:
            nxt = next((j for j in range(i + 1, len(lines)) if lines[j].strip()), None)
            alt_text = TEXT_ALT_RE.match(lines[nxt]).group(1) if nxt is not None and nxt in alts else ""
            cap = next((j for j in range(nxt + 1, len(lines)) if lines[j].strip()), None) if nxt is not None else None
        if not alt_text:
            bad(i, "a visual with no text alternative")
            continue
        if cap is None or not CITATION_RE.search(lines[cap]) or cap in alts or cap in images:
            bad(i, "a visual's next line is its caption, citing its records")
            continue
        cap_paths = [mm for mm in CITATION_RE.finditer(lines[cap])]
        if kind == "image":
            target = IMAGE_RE.match(lines[i]).group(2)
            own = "%s-gate-%d-case-" % (phase, n)
            ok = (re.fullmatch(re.escape(own) + r"[1-9][0-9]*\.svg", target)
                  or (target.startswith("docs/design/") and target in [mm.group("path") for mm in cap_paths]))
            if not ok:
                bad(i, "an image names %s, neither %s<k>.svg beside this case nor a docs/design/ file its caption "
                       "cites" % (target, own))
        for num in NUMBER_RE.findall(alt_text):
            found = False
            for mm in cap_paths:
                # only a citable record is ever opened: never a path outside the case's tree
                if mm.group("path") not in cited_ok or ".." in mm.group("path").split("/"):
                    continue
                full = os.path.join(tree, *mm.group("path").split("/"))
                if not os.path.isfile(full) or os.path.islink(full):
                    continue
                rec = record_lines(full)            # model S-029 AC8: the same lines as the citation check
                hay = [rec[int(mm.group("line")) - 1]] if mm.group("line") and int(mm.group("line")) <= len(rec) \
                    else rec
                if any(num in NUMBER_RE.findall(h) for h in hay):
                    found = True
                    break
            if not found:
                bad(i, "the text alternative's number %s is in no record its caption cites" % num)
    return v


def proposal_problems(root, rel, tree, cited_ok, form_instructions, spec):
    """model S-025 AC7: the findings for one proposal, read at HEAD, its citations resolved in `tree`."""
    m = PROPOSAL_RE.match(rel)
    item, phase, n = m.group(1), m.group(2), int(m.group(3))
    text = g.git_text(root, "HEAD", rel) or ""
    lines = [l.rstrip("\r") for l in text.split("\n")]
    v = []

    def bad(i, msg):
        v.append("%s line %d: %s (model S-025)" % (rel, i + 1, msg))

    nonblank = [i for i, l in enumerate(lines) if l.strip()]
    title = "# %s — the %s gate: what a user would see" % (item, phase.capitalize())
    if not nonblank or lines[nonblank[0]] != title:
        bad(nonblank[0] if nonblank else 0, "the first line must be exactly %r" % title)
    if len(nonblank) < 2 or lines[nonblank[1]] != PROPOSAL_LABEL:
        bad(nonblank[1] if len(nonblank) > 1 else 0, "the line after the title must be exactly %r" % PROPOSAL_LABEL)
    where = {}
    for h in PROPOSAL_SECTIONS:
        at = [i for i, l in enumerate(lines) if l == h]
        if len(at) != 1:
            bad(at[1] if len(at) > 1 else 0, "%s `%s`" % ("a repeated section" if at else "no section", h))
        else:
            where[h] = at[0]
    order = [where[h] for h in PROPOSAL_SECTIONS if h in where]
    if order != sorted(order):
        bad(order[0] if order else 0, "the five sections are out of order")
    if len(nonblank) > 2 and PROPOSAL_SECTIONS[0] in where and nonblank[2] != where[PROPOSAL_SECTIONS[0]]:
        bad(nonblank[2], "nothing comes between the label line and `%s`" % PROPOSAL_SECTIONS[0])
    if not os.path.isfile(os.path.join(tree, "docs", "gates", item, "%s-gate-%d-case.md" % (phase, n))):
        bad(0, "no case docs/gates/%s/%s-gate-%d-case.md in its tree: a proposal goes beside its case"
            % (item, phase, n))
    # The sections' spans: (start, end) line indexes of each section's body.
    starts = sorted(where.values())
    spans = {}
    for k, h in enumerate(PROPOSAL_SECTIONS):
        if h in where:
            later = [x for x in starts if x > where[h]]
            spans[k] = (where[h] + 1, later[0] if later else len(lines))

    def content(k):
        a, b = spans.get(k, (0, 0))
        return [i for i in range(a, b) if lines[i].strip() and lines[i] not in form_instructions]
    # Lines barred anywhere, and citations of barred records.
    for i, l in enumerate(lines):
        if l.startswith(PROPOSER_LINE):
            bad(i, "a proposal holds no recommendation: only what the offer would show a user")
        for mm in CITATION_RE.finditer(l):
            path = mm.group("path")
            if (path.startswith("docs/gates/") and path.endswith("-case.md")) or \
                    (path.startswith("reviews/") and (path.endswith("-critic.md") or path.endswith("-user.md"))) or \
                    path.startswith("decisions/"):
                bad(i, "cites %s: a proposal never cites a case, a Critic or User representative record, or "
                       "anything under decisions/" % path)
    # Sections 1, 2 and 5: every content line cites a citable record; at most 200 counted words.
    words = 0
    for k in PROPOSAL_COUNTED:
        for i in content(k):
            l = lines[i]
            found = list(CITATION_RE.finditer(l))
            if not found:
                bad(i, "a line that states something cites no record: end it with [<path>] or [<path>:<line>]")
            for mm in found:
                path = mm.group("path")
                full = os.path.join(tree, *path.split("/"))
                if any(part in (".", "..") for part in path.split("/")) or not os.path.isfile(full) \
                        or os.path.islink(full):
                    bad(i, "the cited record %s is not a file in the proposal's tree" % path)
                elif path not in cited_ok:
                    bad(i, "the cited record %s is not one the Critic's gate pack holds" % path)
            words += sum(1 for tok in CITATION_RE.sub(" ", l).split() if re.search(r"[^\W_]", tok))
    if words > PROPOSAL_WORD_LIMIT:
        bad(where.get(PROPOSAL_SECTIONS[0], 0), "sections 1, 2 and 5 hold %d counted words, above %d"
            % (words, PROPOSAL_WORD_LIMIT))
    # Sections 3 and 4.
    for k in (2, 3):
        if k not in spans:
            continue
        body = content(k)
        if phase == "design":
            if [lines[i] for i in body] != [PROPOSAL_NONE_YET[k]]:
                bad(spans[k][0] - 1, "at the Design gate, `%s` holds exactly the line %r"
                    % (PROPOSAL_SECTIONS[k], PROPOSAL_NONE_YET[k]))
            continue
        if not body:
            bad(spans[k][0] - 1, "`%s` is empty" % PROPOSAL_SECTIONS[k])
        if k == 2:
            for i in body:
                sm = SCENARIO_RE.match(lines[i])
                if not sm:
                    bad(i, "a scenario line is `> <words> [specs/<spec>.md:<line>]`")
                    continue
                name = sm.group("path")[len("specs/"):]
                if spec and g.spec_id(name) != spec:
                    bad(i, "the scenario cites %s, not the item's spec %s" % (sm.group("path"), spec))
                    continue
                full = os.path.join(tree, *sm.group("path").split("/"))
                specline = None
                if os.path.isfile(full) and not os.path.islink(full):
                    rows = record_lines(full)          # model S-029 AC8: the same lines as the citation check
                    ln = int(sm.group("line"))
                    specline = rows[ln - 1] if ln <= len(rows) else None
                if specline is None:
                    bad(i, "the scenario cites %s, which has no such line in the proposal's tree" % sm.group("path"))
                elif sm.group("words") not in specline:
                    bad(i, "the scenario's words are not in %s:%s word for word" % (sm.group("path"), sm.group("line")))
        else:
            if len(body) == 1 and NO_SCREENS_RE.match(lines[body[0]]):
                continue
            for i in body:
                sc = SCREEN_RE.match(lines[i])
                if not sc:
                    bad(i, "a screen line is `- <screen name> [docs/design/screens/<file>]`, or the one line "
                           "`No screens: <why>`")
                    continue
                full = os.path.join(tree, *sc.group("path").split("/"))
                if ".." in sc.group("path").split("/") or not os.path.isfile(full) or os.path.islink(full):
                    bad(i, "the screen %s is not a file in the proposal's tree" % sc.group("path"))
    return v


def check_gates(root, base):
    """model S-024 AC10: each case added or changed in REF..HEAD, its citations and milestone list read in the
    case's tree (the default tip and the item branch's own changes)."""
    import shutil
    import tempfile
    import orchestrator_git as og
    g.verify_commit(root, base)
    g.verify_commit(root, "HEAD", "HEAD")
    v, notes = [], []
    cases = changed_cases(root, base)
    proposals = changed_cases(root, base, PROPOSAL_RE)          # model S-025
    dispatched = set()
    for rel in _ls(root, base, "dispatch-log"):
        if not re.fullmatch(r"dispatch-log/[0-9]{4}-[0-9]{2}\.jsonl", rel):
            continue
        for line in (g.git_text(root, base, rel) or "").split("\n"):
            try:
                o = json.loads(line) if line.strip() else None
            except ValueError:
                o = None
            if isinstance(o, dict) and o.get("role") == "critic-gate" and o.get("action") == "dispatch":
                dispatched.add((o.get("item"), o.get("gate"), o.get("gate_n")))
    items = sorted(set(CASE_RE.match(c).group(1) for c in cases) | set(PROPOSAL_RE.match(c).group(1)
                                                                       for c in proposals))
    trees = {}
    tmp = tempfile.mkdtemp(prefix="v3-gates-")
    try:
        for item in items:
            out = os.path.join(tmp, item)
            og.build_tree(root, "origin", "HEAD", item, None, None, None, out)
            trees[item] = out
        for rel in cases:
            m = CASE_RE.match(rel)
            item, phase, n = m.group(1), m.group(2), int(m.group(3))
            tree = trees[item]
            st = _toml_file(os.path.join(tree, "status", "%s.toml" % item)) or {}
            req = _toml_file(os.path.join(tree, "intake", "requests", "%s.toml" % item)) or {}
            ruling = req.get("ruling") if req.get("enters") in ("Build", "Design") else None
            ok = citable_paths(tree, item, st.get("spec") if isinstance(st.get("spec"), str) else None,
                               ruling if isinstance(ruling, str) else None)
            form = read_file(tree, GATE_FORM_REL) or ""
            instructions = set(l.rstrip("\r") for l in form.split("\n") if is_instruction_line(l))
            tl = timeline(tree, repo=root)
            v += case_problems(root, rel, tree, tl, ok, instructions)
            if (item, GATE_OF_PHASE[phase], n) in dispatched:
                v.append("%s: changed after the Critic was dispatched on it (the dispatch log at %s holds its "
                         "critic-gate line); after a hold, write the updated case under the next number "
                         "(model S-024 AC10)" % (rel, base[:12]))
        for rel in proposals:
            m = PROPOSAL_RE.match(rel)
            item, phase, n = m.group(1), m.group(2), int(m.group(3))
            tree = trees[item]
            st = _toml_file(os.path.join(tree, "status", "%s.toml" % item)) or {}
            req = _toml_file(os.path.join(tree, "intake", "requests", "%s.toml" % item)) or {}
            ruling = req.get("ruling") if req.get("enters") in ("Build", "Design") else None
            spec = st.get("spec") if isinstance(st.get("spec"), str) else None
            ok = citable_paths(tree, item, spec, ruling if isinstance(ruling, str) else None)
            form = read_file(tree, PROPOSAL_FORM_REL) or ""
            instructions = set(l.rstrip("\r") for l in form.split("\n") if is_instruction_line(l))
            v += proposal_problems(root, rel, tree, ok, instructions, spec)
            if (item, GATE_OF_PHASE[phase], n) in dispatched:
                v.append("%s: changed after the Critic was dispatched on its case (the dispatch log at %s holds its "
                         "critic-gate line); after a hold, write the updated proposal under the next number "
                         "(model S-025)" % (rel, base[:12]))
        for item, tree in sorted(trees.items()):
            for dirpath, _, files in os.walk(os.path.join(tree, "reviews", item)):
                for f in sorted(files):
                    rrel = os.path.relpath(os.path.join(dirpath, f), tree).replace(os.sep, "/")
                    mm = CRITIC_RECORD_RE.match(rrel)
                    if mm and not os.path.isfile(os.path.join(tree, "docs", "gates", item, "%s-gate-%s-case.md"
                                                              % (mm.group(2), mm.group(3)))):
                        notes.append("NOTE: %s has no case docs/gates/%s/%s-gate-%s-case.md"
                                     % (rrel, item, mm.group(2), mm.group(3)))
                    um = USER_RECORD_RE.match(rrel)
                    if um and not os.path.isfile(os.path.join(tree, "docs", "gates", item, "%s-gate-%s-case.md"
                                                              % (um.group(2), um.group(3)))):
                        notes.append("NOTE: %s has no case docs/gates/%s/%s-gate-%s-case.md (model S-025)"
                                     % (rrel, item, um.group(2), um.group(3)))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    notes.insert(0, "NOTE: %d gate case(s) and %d proposal(s) added or changed in %s..HEAD checked"
                 % (len(cases), len(proposals), base[:12]))
    return v, notes


CHECKS = {"ready": check_ready, "trace": check_trace, "joins": check_joins,
          "scope": check_scope, "freeze": check_freeze, "holdouts": check_holdouts,
          "milestones": check_milestones, "gates": check_gates}
RANGE_CHECKS = ("scope", "freeze", "holdouts", "milestones", "gates")
OK_MESSAGES = {
    "ready": "the project document's Part 1 is complete, or no spec is frozen yet",
    "trace": "every criterion of a frozen spec traces to a value target",
    "joins": "every join of a frozen spec has a marked test",
    "scope": "every spec-scoped commit stays inside its spec's Areas touched",
    "freeze": "every spec frozen since the base ref has a PASS plan review at its freeze",
    "holdouts": "no unrecorded change to %s" % HOLDOUTS_REL,
    "milestones": "the milestones are never erased, change only with the owner's record and the Critic's check, "
                  "and new work names its milestone",
    "gates": "every gate case added or changed is in its form, cites only records the Critic can open, and lists "
             "the closing phases' milestones as the timeline gives them",
}


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="v3_checks.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    for name in ("ready", "trace", "joins", "scope", "freeze", "holdouts", "milestones", "gates"):
        p = sub.add_parser(name, allow_abbrev=False)
        p.add_argument("--root", default=".")
        if name in RANGE_CHECKS:
            p.add_argument("--base", required=True)
        if name == "scope":
            p.add_argument("--default-branch")
        if name == "freeze":
            p.add_argument("--milestones", action="store_true")
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
        elif args.cmd == "freeze":
            v, notes = check_freeze(args.root, args.base, args.milestones)
        elif args.cmd == "milestones":
            found, notes = check_milestones(args.root, args.base)
            return g.report(args.root, found, notes, OK_MESSAGES[args.cmd])
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
