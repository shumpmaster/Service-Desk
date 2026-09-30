#!/usr/bin/env python3
"""review_check — required reviews from risk-paths.toml, verdicts from reviews/.

Usage:
  review_check.py lint     [--root DIR]
  review_check.py pr PR    --base REF [--root DIR] [--files-from FILE] [--summary-json FILE]
  review_check.py classify PATH... [--root DIR]
  review_check.py questions --default-branch NAME --summary-json FILE [--root DIR]

Reads governance/risk-paths.toml (a path's risk class and the reviews a change
needs), governance/SURFACES.md (the reviewer-class roster) and the verdict
files reviews/<PR>/<reviewer-id>.md (model S-002). `owner` is the reserved
reviewer id of the human owner. In a v3 project (governance/v3.toml present,
model S-009 AC6) `lint` also accepts the plan-review record
reviews/<spec id>/plan.md (a directory named S-nnn, the file named exactly
plan.md), whose verdict line is linted like any other. Requires Python 3.11+
(tomllib).

`pr` also raises flags (model S-003), each of which adds `owner` to the
required reviews: a changed test file ([tests] globs) that was deleted, gained
a line with a skip marker or a broad catch, or has fewer assertions; and any
changed dependency manifest ([dependencies] manifests). An added dependency
that isn't pinned (requirements*.txt without `==`; a package.json
dependencies/devDependencies range) fails outright. Contents are compared
between the merge base of BASE and HEAD, and HEAD. These are text heuristics.

`pr --summary-json FILE` also writes the owner's state as JSON on every exit
path (model S-004 AC1): other_findings, owner_action, risk and reasons.
`questions` (model S-004 AC3) writes the open question files as JSON: on the
default branch (HEAD is origin/NAME) every questions/*.md not starting with
'_'; elsewhere those that differ from the merge base with origin/NAME. It is
not a check; only CI's record step runs it (exit 0, or 2 with an error summary).
Exit 0 = pass, 1 = rule violated, 2 = usage or parse error.
"""

import sys

if sys.version_info < (3, 11):
    print("ERROR: Python 3.11+ is required (tomllib)", file=sys.stderr)
    sys.exit(2)

import argparse  # noqa: E402
import difflib  # noqa: E402
import json  # noqa: E402
import os  # noqa: E402
import re  # noqa: E402
import unicodedata  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402

REVIEWS_REL = "reviews"
PR_RE = re.compile(r"^[A-Za-z0-9._-]+$")
VERDICT_RE = re.compile(r"^Verdict: (PASS|FAIL)[ \t]*$")
SETTERS_CAP = 10
PLAN_STEM = "plan"   # v3 only: reviews/<spec id>/plan.md is a plan-review record (model S-009 AC6)


def _lead_stripped(line):
    """The line without leading whitespace and Unicode format (Cf) characters."""
    i = 0
    while i < len(line) and (line[i].isspace() or unicodedata.category(line[i]) == "Cf"):
        i += 1
    return line[i:]


def parse_verdict(text):
    """Return 'PASS', 'FAIL' or None (malformed).

    One leading UTF-8 BOM is dropped. The deciding line is the first line that,
    after removing leading whitespace and format (Cf) characters, starts with
    `Verdict:`. That line, as written, must read exactly `Verdict: PASS` or
    `Verdict: FAIL` (one space after the colon), optionally followed by spaces
    or tabs. Lines split on LF only, and one trailing CR is dropped, so no other
    character (form feed, \\x1c, U+2028 ...) ends a line. Any line on which
    `Verdict:` appears anywhere but at the start makes the file malformed
    (model S-003 §6)."""
    if text.startswith("\ufeff"):
        text = text[1:]
    lines = [l[:-1] if l.endswith("\r") else l for l in text.split("\n")]
    if any("Verdict:" in l and not l.startswith("Verdict:") for l in lines):
        return None
    for line in lines:
        if _lead_stripped(line).startswith("Verdict:"):
            m = VERDICT_RE.match(line)
            return m.group(1) if m else None
    return None


def verdict_files(root):
    """Return ([(pr, stem, rel)], notes). A missing reviews/ is a note."""
    d = os.path.join(root, REVIEWS_REL)
    if not os.path.isdir(d):
        return [], ["NOTE: no %s/ directory; no verdicts recorded yet" % REVIEWS_REL]
    out, notes = [], []
    for pr in sorted(os.listdir(d)):
        pdir = os.path.join(d, pr)
        if pr.startswith("_") or not os.path.isdir(pdir):
            continue
        if not PR_RE.match(pr) or pr in (".", ".."):
            notes.append("NOTE: %s/%s/ is not a PR directory name ([A-Za-z0-9._-]+); ignored" % (REVIEWS_REL, pr))
            continue
        for name in sorted(os.listdir(pdir)):
            if name.startswith("_") or not name.endswith(".md") or not os.path.isfile(os.path.join(pdir, name)):
                continue
            out.append((pr, name[:-3], "%s/%s/%s" % (REVIEWS_REL, pr, name)))
    return out, notes


MALFORMED = ("%s: malformed verdict — 'Verdict:' may appear only at the start of a line, and the first "
             "such line must be exactly 'Verdict: PASS' or 'Verdict: FAIL'")


class Lint(object):
    """What `lint` found: tagged findings, the malformed verdict files, and the parsed state."""

    def __init__(self):
        self.rp = None
        self.findings = []     # (check name, message)
        self.malformed = {}    # (pr, stem) -> message
        self.notes = []
        self.warnings = []     # printed with the notes; they never fail
        self.verdicts = {}     # (pr, stem) -> 'PASS', 'FAIL' or None
        self.enforcement = None


def lint(root):
    """Lint risk-paths.toml, enforcement.toml and every verdict file."""
    out = Lint()
    s = g.load_surfaces(root)
    reviewer_ids = s.reviewer_ids()
    rp, problems = g.load_risk_paths(root, reviewer_ids)
    out.rp = rp
    out.findings.extend(("review_check.config", p) for p in problems)
    if rp is not None and not problems and rp.signal_code == []:
        # Valid, but it silently disables the owner-signal tripwire (model S-005 AC4).
        out.warnings.append("WARNING: %s: signal_code = [] turns the owner-signal tripwire off — no changed "
                            "path can trip it; list the signal-code globs, or remove the key to use the "
                            "defaults" % g.RISK_PATHS_REL)
    out.enforcement = g.load_enforcement(root)
    out.findings.extend(("enforcement.lint", p) for p in out.enforcement.problems)
    files, out.notes = verdict_files(root)
    allowed = set(reviewer_ids) | {g.OWNER}
    v3 = g.is_v3(root)
    for pr, stem, rel in files:
        verdict = parse_verdict(g.read_text(os.path.join(root, rel), newline=""))
        out.verdicts[(pr, stem)] = verdict
        if verdict is None:
            out.malformed[(pr, stem)] = MALFORMED % rel
        if v3 and stem == PLAN_STEM and g.SPEC_REF_RE.match(pr):
            continue   # a v3 plan-review record, reviews/<spec id>/plan.md (model S-009 AC6)
        if stem not in allowed:
            out.findings.append(("review_check.lint", "%s: '%s' is neither 'owner' nor a reviewer-class roster id in %s"
                                 % (rel, stem, g.SURFACES_REL)))
    return out


def changed_files(root, base):
    if not g.git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % base]):
        raise g.UsageError("base ref %r is not a commit in %s" % (base, root))
    return sorted(set(g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", "--relative",
                                             "%s...HEAD" % base]))))


def added_lines(old, new):
    """Lines of `new` that a line diff from `old` marks as added (old may be '')."""
    a = old.split("\n") if old else []
    b = new.split("\n")
    out = []
    for tag, _, _, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag in ("replace", "insert"):
            out.extend(b[j1:j2])
    return out


def count_patterns(text, patterns):
    return sum(text.count(p) for p in patterns)


def _contents(root, base_sha, path):
    """(old, new) text of path: at the merge base and HEAD, or (None, working tree) without a base."""
    if base_sha is None:
        full = os.path.join(root, path)
        return None, (g.read_text(full) if os.path.isfile(full) else None)
    return g.git_text(root, base_sha, path), g.git_text(root, "HEAD", path)


def test_flags(rp, path, old, new):
    """Reasons a changed test file needs the owner's verdict (AC4)."""
    if new is None:
        return ["test file deleted"] if old is not None else []
    old = old or ""
    reasons = []
    added = added_lines(old, new)
    t = rp.tests
    markers = [m for m in t["skip_markers"] if any(m in line for line in added)]
    if markers:
        reasons.append("adds a line with a skip marker (%s)" % ", ".join(markers))
    before, after = count_patterns(old, t["assert_patterns"]), count_patterns(new, t["assert_patterns"])
    if after < before:
        reasons.append("assertion count fell from %d to %d" % (before, after))
    catches = [c for c in t["broad_catches"] if any(c in line for line in added)]
    if catches:
        reasons.append("adds a line with a broad catch (%s)" % ", ".join(catches))
    return reasons


def _package_deps(text, where):
    data = g.load_json(text, where)
    if not isinstance(data, dict):
        raise g.UsageError("%s: the top level must be a JSON object" % where)
    out = {}
    for section in ("dependencies", "devDependencies"):
        deps = data.get(section, {})
        if not isinstance(deps, dict) or not all(isinstance(v, str) for v in deps.values()):
            raise g.UsageError("%s: '%s' must be an object mapping names to version strings" % (where, section))
        out[section] = deps
    return out


UNPINNED_PREFIXES = ("^", "~", ">", "<", "*")


def pin_checked(path):
    """requirements*.txt and package.json are checked for pins; other manifests are only flagged."""
    name = path.rsplit("/", 1)[-1]
    return g.glob_match("requirements*.txt", name) or name == "package.json"


def unpinned(path, old, new):
    """Messages for added dependencies that aren't pinned (AC5); [] for other manifests."""
    if new is None:
        return []
    name = path.rsplit("/", 1)[-1]
    out = []
    if g.glob_match("requirements*.txt", name):
        for line in added_lines(old or "", new):
            req = g.strip_comment(line)
            if not req or req.startswith(("-r", "-e", "--")):
                continue
            if "==" not in req:
                out.append("%s: unpinned dependency %r — pin it with '=='" % (path, req))
    elif name == "package.json":
        new_deps = _package_deps(new, path)
        try:
            old_deps = _package_deps(old, path) if old is not None else {}
        except g.UsageError:
            old_deps = {}   # a malformed old file: every dependency counts as added
        for section in ("dependencies", "devDependencies"):
            before = old_deps.get(section, {})
            for dep in sorted(new_deps[section]):
                value = new_deps[section][dep]
                if before.get(dep) == value:
                    continue
                v = value.strip()
                if v.startswith(UNPINNED_PREFIXES) or v == "latest":
                    out.append("%s: unpinned dependency %s = %r in %s — pin an exact version"
                               % (path, dep, value, section))
    return out


def change_flags(root, rp, files, base):
    """Return ([(path, reason, kind)], [unpinned message]) for the changed files."""
    tests = [p for p in files if rp.is_test(p)]
    manifests = [p for p in files if rp.is_manifest(p)]
    flags, bad = [], []
    if not tests and not manifests:
        return flags, bad
    base_sha = None
    if base:
        base_sha = g.git(root, ["merge-base", base, "HEAD"]).decode().strip()
    for p in tests:
        if base_sha is None:
            flags.append((p, "test file changed; weakening can't be measured without --base", "test"))
            continue
        try:
            old, new = _contents(root, base_sha, p)
        except g.UsageError as exc:
            flags.append((p, "can't be read as text (%s); weakening can't be measured" % exc, "test"))
            continue
        for reason in test_flags(rp, p, old, new):
            flags.append((p, reason, "test"))
    for p in manifests:
        flags.append((p, "dependency manifest changed", "dependency"))
        if pin_checked(p):
            old, new = _contents(root, base_sha, p)
            bad.extend(unpinned(p, old, new))
    return flags, bad


FLAG_REASONS = {"test": "flag: test weakening", "dependency": "flag: dependency change"}


def _required_check(rid):
    return "review_check.owner" if rid == g.OWNER else "review_check.verdicts"


def cmd_lint(args):
    lt = lint(args.root)
    v = [("review_check.lint", m) for _, m in sorted(lt.malformed.items())] + lt.findings
    return g.report(args.root, v, lt.notes + lt.warnings, "%s and %d verdict file(s) are well-formed"
                    % (g.RISK_PATHS_REL, len(lt.verdicts)), enforcement=lt.enforcement)


def cmd_pr(args, state=None):
    """Run `pr`. `state` (a dict), when given, receives what the owner summary needs."""
    state = state if state is not None else {}
    pr = args.pr
    if not PR_RE.match(pr) or pr in (".", ".."):
        raise g.UsageError("PR %r must match [A-Za-z0-9._-]+" % pr)
    lt = lint(args.root)
    rp, notes, verdicts = lt.rp, lt.notes + lt.warnings, lt.verdicts
    v = list(lt.findings)
    state.update(findings=v, enforcement=lt.enforcement, owner_own=set())
    if rp is None:
        v += [("review_check.lint", m) for _, m in sorted(lt.malformed.items())]
        return g.report(args.root, v, notes, "", enforcement=lt.enforcement)
    files = g.read_file_list(args.files_from) if args.files_from else changed_files(args.root, args.base)
    cls, setters, required, checks = rp.required(files)
    flags, bad = change_flags(args.root, rp, files, args.base)
    # 'PASS', 'FAIL', None (malformed) or 'missing'. `required` is filled in below by the flags.
    state.update(risk=cls, required=required, owner_verdict=verdicts.get((pr, g.OWNER), "missing"))
    print("Risk class: %s" % cls)
    for p in setters[:SETTERS_CAP]:
        print("  %s: %s" % (p, cls))
    if len(setters) > SETTERS_CAP:
        print("  … and %d more" % (len(setters) - SETTERS_CAP))
    for p, reason, kind in flags:
        print("Flag: %s: %s — needs the owner's verdict" % (p, reason))
        reasons = required.setdefault(g.OWNER, [])
        if FLAG_REASONS[kind] not in reasons:
            reasons.append(FLAG_REASONS[kind])
    v.extend(("review_check.pinning", m) for m in bad)
    # A malformed verdict of a required reviewer fails as that requirement (so warning
    # lint never lets it through); any other malformed verdict is a lint finding.
    for (vpr, stem), msg in sorted(lt.malformed.items()):
        required_here = vpr == pr and stem in required
        v.append((_required_check(stem) if required_here else "review_check.lint", msg))
    print("Required reviews: %s" % (", ".join(sorted(required)) or "none"))
    for gl, check in checks:
        notes.append("NOTE: domain %s asks for check '%s' (not verified by this tool)" % (gl, check))
    for rid in sorted(required):
        rel = "%s/%s/%s.md" % (REVIEWS_REL, pr, rid)
        why = "required by %s" % ", ".join(required[rid])
        if (pr, rid) not in verdicts:
            v.append((_required_check(rid), "missing verdict: %s (%s)" % (rel, why)))
        elif verdicts[(pr, rid)] == "FAIL":
            v.append((_required_check(rid), "%s: verdict is FAIL (%s)" % (rel, why)))
        else:
            continue   # PASS; a malformed verdict is reported above.
        if rid == g.OWNER:
            state["owner_own"].add(len(v) - 1)   # the owner's own missing or FAIL verdict
    for (vpr, stem) in sorted(verdicts):
        if vpr == pr and stem not in required:
            notes.append("NOTE: %s/%s/%s.md: verdict from '%s', which this change does not require"
                         % (REVIEWS_REL, pr, stem, stem))
    return g.report(args.root, v, notes, "PR %s (%s): %d required verdict(s), all PASS" % (pr, cls, len(required)),
                    enforcement=lt.enforcement)


# --------------------------------------------------------------------------
# model S-004: the owner summary (AC1) and the questions subcommand (AC3)

REASON_CODES = ("R0", "R1", "R2", "R3", "test-weakening", "dependency", "domain")
_FLAG_CODES = {FLAG_REASONS["test"]: "test-weakening", FLAG_REASONS["dependency"]: "dependency"}


def reason_codes(reasons):
    """Map the owner's requirement reasons to the fixed codes (AC1), in the fixed order."""
    codes = set()
    for r in reasons:
        if r in g.RISK_CLASSES:
            codes.add(r)
        elif r in _FLAG_CODES:
            codes.add(_FLAG_CODES[r])
        elif r.startswith("domain "):
            codes.add("domain")
    return [c for c in REASON_CODES if c in codes]


def owner_summary(rc, state):
    """The AC1 summary of a `pr` run that exited with `rc`, from the state cmd_pr recorded."""
    findings = state.get("findings", [])
    enf = state.get("enforcement")
    own = state.get("owner_own", set())
    other = 0
    for i, (name, _) in enumerate(findings):
        if i in own:
            continue
        # Enforced findings, and every verdicts finding even when warn-only.
        if name == "review_check.verdicts" or enf is None or not enf.ledger_for(name):
            other += 1
    required = state.get("required") or {}
    verdict = state.get("owner_verdict", "missing")
    if rc == 2 or "required" not in state or any(n == "review_check.config" for n, _ in findings):
        action = "error"
    elif g.OWNER not in required:
        action = "not_required"
    elif verdict is None:
        action = "error"
    elif verdict == "FAIL":
        action = "changes_requested"
    elif verdict == "PASS":
        action = "approved"
    elif other > 0:
        action = "after_agents"
    else:
        action = "needed"
    return {
        "other_findings": other,
        "owner_action": action,
        "risk": state.get("risk"),
        "reasons": reason_codes(required.get(g.OWNER, [])),
    }


def write_json(path, data):
    """Write data as one line of JSON (then a newline) to path."""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(data, sort_keys=True, separators=(",", ":")) + "\n")
    os.replace(tmp, path)


QUESTIONS_REL = "questions"


def question_files_at_head(root):
    """questions/*.md at HEAD whose names don't start with '_' (names read NUL-separated)."""
    out = []
    for path in g.split_z(g.git(root, ["ls-tree", "-z", "--name-only", "HEAD", "--", QUESTIONS_REL + "/"])):
        name = path[len(QUESTIONS_REL) + 1:] if path.startswith(QUESTIONS_REL + "/") else ""
        if name and "/" not in name and name.endswith(".md") and not name.startswith("_"):
            out.append(path)
    return sorted(out)


def open_questions(root, default_branch):
    """Return the open question files (AC3). Raises UsageError when they can't be decided."""
    if not default_branch or default_branch.startswith("-") or not g.git_ok(
            root, ["check-ref-format", "--branch", default_branch]):
        raise g.UsageError("default branch %r is not a branch name" % default_branch)
    ref = "refs/remotes/origin/%s" % default_branch
    if not g.git_ok(root, ["rev-parse", "--verify", "-q", "%s^{commit}" % ref]):
        raise g.UsageError("origin/%s is not a commit in %s" % (default_branch, root))
    head = g.git(root, ["rev-parse", "--verify", "HEAD^{commit}"]).decode().strip()
    tip = g.git(root, ["rev-parse", "--verify", "%s^{commit}" % ref]).decode().strip()
    files = question_files_at_head(root)
    if head == tip:
        return files
    if not g.git_ok(root, ["merge-base", ref, "HEAD"]):
        raise g.UsageError("no merge base between origin/%s and HEAD" % default_branch)
    base = g.git(root, ["merge-base", ref, "HEAD"]).decode().strip()
    changed = set(g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", base, "HEAD",
                                         "--", QUESTIONS_REL + "/"])))
    return [p for p in files if p in changed]


def _write_questions(path, data):
    """Write the questions summary; on failure, say so with an ERROR: line and return False."""
    try:
        write_json(path, data)
    except OSError as exc:
        print("ERROR: can't write the questions summary %s: %s" % (path, exc), file=sys.stderr)
        return False
    return True


def cmd_questions(args):
    """Exit 0 with an ok summary; else 2, with an error summary when the path can be written
    and an ERROR: line when it can't (model S-005 AC4)."""
    try:
        files = open_questions(args.root, args.default_branch)
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        _write_questions(args.summary_json, {"state": "error", "open": None, "files": []})
        return 2
    if not _write_questions(args.summary_json, {"state": "ok", "open": len(files), "files": files}):
        return 2
    print("Open questions: %d" % len(files))
    for p in files:
        print("  %s" % p)
    return 0


def cmd_classify(args):
    s = g.load_surfaces(args.root) if os.path.isfile(os.path.join(args.root, g.SURFACES_REL)) else None
    rp, problems = g.load_risk_paths(args.root, s.reviewer_ids() if s else [])
    if rp is None:
        raise g.UsageError("; ".join(problems))
    for p in problems:
        print("NOTE: %s" % p)
    for path in args.paths:
        print("%s: %s" % (path, rp.path_class(g.normalize_path(path))))
    return 0


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="review_check.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    p_lint = sub.add_parser("lint", allow_abbrev=False)
    p_lint.add_argument("--root", default=".")
    p_pr = sub.add_parser("pr", allow_abbrev=False)
    p_pr.add_argument("pr")
    p_pr.add_argument("--base")
    p_pr.add_argument("--root", default=".")
    p_pr.add_argument("--files-from")
    p_pr.add_argument("--summary-json")
    p_q = sub.add_parser("questions", allow_abbrev=False)
    p_q.add_argument("--default-branch", required=True)
    p_q.add_argument("--summary-json", required=True)
    p_q.add_argument("--root", default=".")
    p_cls = sub.add_parser("classify", allow_abbrev=False)
    p_cls.add_argument("paths", nargs="+")
    p_cls.add_argument("--root", default=".")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        _summary_after_usage_error(argv, exc.code)
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    if args.cmd == "pr":
        return run_pr(args)
    try:
        if args.cmd == "lint":
            return cmd_lint(args)
        if args.cmd == "questions":
            return cmd_questions(args)
        if args.cmd == "classify":
            return cmd_classify(args)
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2
    return 2


def _write_summary(path, rc, state):
    """Write the AC1 summary; on failure, say so and return 2."""
    try:
        write_json(path, owner_summary(rc, state))
    except OSError as exc:
        print("ERROR: can't write the summary %s: %s" % (path, exc), file=sys.stderr)
        return 2
    return rc


def run_pr(args):
    """`pr`, writing --summary-json on every exit path (AC1)."""
    state = {}
    rc = 2
    try:
        if not args.base and not args.files_from:
            print("ERROR: pr needs --base REF (or --files-from FILE)", file=sys.stderr)
        else:
            try:
                rc = cmd_pr(args, state)
            except g.UsageError as exc:
                print("ERROR: %s" % exc, file=sys.stderr)
                rc = 2
    finally:
        # An unexpected exception still leaves an `error` summary behind (rc stays 2).
        if args.summary_json:
            rc = _write_summary(args.summary_json, rc, state)
    return rc


def _summary_after_usage_error(argv, code):
    """A `pr` command line argparse rejected still gets an `error` summary, if it names a file."""
    argv = list(sys.argv[1:] if argv is None else argv)
    if not code or not argv or argv[0] != "pr":
        return
    path = None
    for i, a in enumerate(argv):
        if a == "--summary-json" and i + 1 < len(argv):
            path = argv[i + 1]
        elif a.startswith("--summary-json="):
            path = a.split("=", 1)[1]
    if path:
        _write_summary(path, 2, {})


if __name__ == "__main__":
    sys.exit(main())
