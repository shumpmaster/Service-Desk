#!/usr/bin/env python3
"""owner_signal — publish whether the owner is needed as two commit statuses (model S-004).

Usage:
  owner_signal.py record --dir DIR [--test ID=OUTCOME ...] [--output FILE]
  owner_signal.py post   [--dry-run] [--root DIR]

`record` runs as the checks job's last step. It reads DIR/steps.json and
DIR/review.json (written by check_all.sh under GOV_SUMMARY_DIR) and
DIR/questions.json (written by `review_check.py questions`), and writes them,
with each test step's outcome, as the job outputs `tests`, `steps`, `review`
and `questions` (to FILE, default $GITHUB_OUTPUT). A missing or unparseable
file gives an empty output.

`post` runs in the final `owner-signal` job, from the default branch's
checkout. Every input comes from the environment:
  EVENT_NAME   pull_request or push
  PR_HEAD_SHA  pull_request.head.sha (the status target on pull_request)
  PR_BASE_SHA  pull_request.base.sha (the tripwire diff's base)
  GITHUB_SHA   the status target on push
  TESTS, STEPS, REVIEW, QUESTIONS   the checks job's outputs
  GITHUB_REPOSITORY, GITHUB_SERVER_URL, GITHUB_RUN_ID   the repository and run URL
  GH_TOKEN     used by `gh api`
It posts `owner-verdict` (pull_request only) and `owner-questions` with
`gh api`. Descriptions hold only fixed words, counts and reason codes, cut to
140 characters. The owner-verdict tripwire (AC6) diffs PR_BASE_SHA...PR_HEAD_SHA
in this checkout against the default branch's signal_code list
(governance/risk-paths.toml, else the defaults); if the diff can't run or the
list is invalid, it posts an error, never a pass.

Standard library only; Python 3.11+ (tomllib). Exit 0 = every status posted
(or printed with --dry-run), 1 = a post failed, 2 = usage error.
"""

import sys

if sys.version_info < (3, 11):
    print("ERROR: Python 3.11+ is required (tomllib)", file=sys.stderr)
    sys.exit(2)

import argparse  # noqa: E402
import json  # noqa: E402
import os  # noqa: E402
import re  # noqa: E402
import subprocess  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402

VERDICT = "owner-verdict"
QUESTIONS = "owner-questions"
MAX_DESCRIPTION = 140
OUTCOMES = ("success", "failure", "cancelled", "skipped")
REVIEW_STEP_PREFIX = "review_check pr "
OWNER_ACTIONS = ("error", "not_required", "changes_requested", "approved", "after_agents", "needed")
REASON_CODES = ("R0", "R1", "R2", "R3", "test-weakening", "dependency", "domain")
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
REPO_RE = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")
TEST_ID_RE = re.compile(r"^[A-Za-z0-9_-]+$")

NO_SUMMARY = "CI produced no summary"
TRIPWIRE_FAILED = "Tripwire couldn't run"
TRIPWIRE_TRIPPED = "CI code changed · check the PR"


class Invalid(Exception):
    """An input that is empty, unparseable or not in the expected shape."""


def describe(text):
    """A status description: at most 140 characters (F10)."""
    return text[:MAX_DESCRIPTION]


# --------------------------------------------------------------------------
# Parsing the checks job's outputs. Anything unexpected is Invalid.


def _load(text):
    if not isinstance(text, str) or not text.strip():
        raise Invalid("empty")
    try:
        return json.loads(text)
    except ValueError:
        raise Invalid("not JSON")


def _count(value):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise Invalid("not a count")
    return value


def parse_review(text):
    data = _load(text)
    if not isinstance(data, dict):
        raise Invalid("review summary is not an object")
    action = data.get("owner_action")
    if action not in OWNER_ACTIONS:
        raise Invalid("owner_action")
    other = _count(data.get("other_findings"))
    reasons = data.get("reasons")
    if not isinstance(reasons, list) or any(r not in REASON_CODES for r in reasons):
        raise Invalid("reasons")
    risk = data.get("risk")
    if risk is not None and risk not in g.RISK_CLASSES:
        raise Invalid("risk")
    return {"owner_action": action, "other_findings": other, "reasons": reasons, "risk": risk}


def parse_steps(text):
    data = _load(text)
    if not isinstance(data, list) or not data:
        raise Invalid("steps summary is not a non-empty list")
    out = []
    for item in data:
        if not isinstance(item, dict) or not isinstance(item.get("name"), str) or not item["name"]:
            raise Invalid("step")
        if isinstance(item.get("exit"), bool) or not isinstance(item.get("exit"), int):
            raise Invalid("step exit")
        out.append((item["name"], item["exit"]))
    return out


def parse_tests(text):
    data = _load(text)
    if not isinstance(data, dict) or not data:
        raise Invalid("tests summary is not a non-empty object")
    for value in data.values():
        if value not in OUTCOMES:
            raise Invalid("test outcome")
    return dict(data)


def parse_questions(text):
    data = _load(text)
    if not isinstance(data, dict) or data.get("state") not in ("ok", "error"):
        raise Invalid("questions summary")
    if data["state"] == "ok":
        _count(data.get("open"))
    return data


# --------------------------------------------------------------------------
# The mapping (AC2, AC4): a pure function from inputs to statuses.


def verdict_status(review_text, steps_text, tests_text):
    """(state, description) for owner-verdict, from the checks job's outputs."""
    try:
        review = parse_review(review_text)
        steps = parse_steps(steps_text)
        tests = parse_tests(tests_text)
    except Invalid:
        return "error", NO_SUMMARY
    review_steps = [rc for name, rc in steps if name.startswith(REVIEW_STEP_PREFIX)]
    if len(review_steps) != 1:
        # A review summary without exactly one `review_check pr` step doesn't add up.
        return "error", NO_SUMMARY
    action = review["owner_action"]
    if action == "error":
        return "error", "Owner state unknown · review check error"
    if action == "not_required":
        return "success", "Owner not required"
    if action == "changes_requested":
        return "failure", "Owner requested changes"
    if action == "approved":
        return "success", "Owner approved"
    # Steps that didn't pass: every check_all step but review_check pr, and every test step.
    failed_steps = (sum(1 for name, rc in steps if rc != 0 and not name.startswith(REVIEW_STEP_PREFIX))
                    + sum(1 for outcome in tests.values() if outcome != "success"))
    if action == "after_agents":
        # The count includes the failed steps (model S-005 AC4), not only review_check's findings.
        return "pending", "Owner: after agents · %d other finding(s)" % (review["other_findings"] + failed_steps)
    # needed: only when every other check_all step passed and every test step succeeded.
    others_pass = all(rc == 0 for name, rc in steps if not name.startswith(REVIEW_STEP_PREFIX))
    tests_pass = all(outcome == "success" for outcome in tests.values())
    if not (others_pass and tests_pass and review["other_findings"] == 0):
        return "pending", "Owner: after agents · other checks failing"
    reasons = ", ".join(review["reasons"])
    return "pending", "Owner verdict needed" + (" · " + reasons if reasons else "")


def questions_status(questions_text):
    """(state, description) for owner-questions."""
    try:
        q = parse_questions(questions_text)
    except Invalid:
        return "error", NO_SUMMARY
    if q["state"] == "error":
        return "error", "Questions unknown"
    if q["open"]:
        return "pending", "%d open question(s)" % q["open"]
    return "success", "No open questions"


def target_sha(env):
    """The commit the statuses go on: the PR head on pull_request, github.sha otherwise."""
    if env.get("EVENT_NAME") == "pull_request":
        return env.get("PR_HEAD_SHA", "")
    return env.get("GITHUB_SHA", "")


def statuses(env, tripwire=None):
    """[(context, state, description)] to post for this run.

    `tripwire` is None (not run), or (ok, tripped): ok False means it couldn't run."""
    out = []
    if env.get("EVENT_NAME") == "pull_request":
        if tripwire is None or not tripwire[0]:
            state, desc = "error", TRIPWIRE_FAILED
        elif tripwire[1]:
            state, desc = "error", TRIPWIRE_TRIPPED
        else:
            state, desc = verdict_status(env.get("REVIEW", ""), env.get("STEPS", ""), env.get("TESTS", ""))
        out.append((VERDICT, state, describe(desc)))
    state, desc = questions_status(env.get("QUESTIONS", ""))
    out.append((QUESTIONS, state, describe(desc)))
    return out


# --------------------------------------------------------------------------
# The tripwire (AC6)


def signal_code(root):
    """The default branch's signal_code list. Raises Invalid when it can't be trusted."""
    path = os.path.join(root, g.RISK_PATHS_REL)
    if not os.path.isfile(path):
        return list(g.SIGNAL_CODE_DEFAULTS)
    try:
        data, err = g.load_toml(g.read_text(path, newline=""), g.RISK_PATHS_REL)
    except g.UsageError:
        raise Invalid("risk-paths.toml can't be read")
    if err:
        raise Invalid("risk-paths.toml is not valid TOML")
    if "signal_code" not in data:
        return list(g.SIGNAL_CODE_DEFAULTS)
    value, problem = g.check_signal_code(data["signal_code"])
    if problem:
        raise Invalid(problem)
    return value


def run_tripwire(root, base, head):
    """(ok, tripped). ok is False when the diff can't run or signal_code is invalid (never fails open)."""
    try:
        globs = signal_code(root)
    except Invalid:
        return False, False
    if not SHA_RE.match(base or "") or not SHA_RE.match(head or ""):
        return False, False
    proc = subprocess.run(["git", "diff", "--name-only", "--no-renames", "-z", "%s...%s" % (base, head)],
                          cwd=root, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0:
        return False, False
    paths = g.split_z(proc.stdout)
    return True, any(g.glob_match(gl, p) for p in paths for gl in globs)


# --------------------------------------------------------------------------
# Commands


def run_url(env):
    server, repo, run = env.get("GITHUB_SERVER_URL", ""), env.get("GITHUB_REPOSITORY", ""), env.get("GITHUB_RUN_ID", "")
    if server and REPO_RE.match(repo) and run.isdigit():
        return "%s/%s/actions/runs/%s" % (server, repo, run)
    return ""


def gh_post(repo, sha, context, state, description, url):
    """POST one commit status with `gh api`; return True on success."""
    cmd = ["gh", "api", "--method", "POST", "repos/%s/statuses/%s" % (repo, sha),
           "-f", "state=%s" % state, "-f", "context=%s" % context, "-f", "description=%s" % description]
    if url:
        cmd += ["-f", "target_url=%s" % url]
    try:
        proc = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except OSError as exc:
        print("ERROR: can't run gh: %s" % exc, file=sys.stderr)
        return False
    if proc.returncode != 0:
        print("ERROR: posting %s failed: %s" % (context, proc.stderr.decode("utf-8", "replace").strip()),
              file=sys.stderr)
        return False
    return True


def cmd_post(args, env=None, poster=gh_post):
    env = dict(os.environ if env is None else env)
    sha = target_sha(env)
    if not SHA_RE.match(sha):
        print("ERROR: target commit %r is not a 40-character SHA" % sha, file=sys.stderr)
        return 2
    repo = env.get("GITHUB_REPOSITORY", "")
    if not args.dry_run and not REPO_RE.match(repo):
        print("ERROR: GITHUB_REPOSITORY %r is not owner/name" % repo, file=sys.stderr)
        return 2
    tripwire = None
    if env.get("EVENT_NAME") == "pull_request":
        tripwire = run_tripwire(args.root, env.get("PR_BASE_SHA", ""), sha)
    url = run_url(env)
    ok = True
    for context, state, desc in statuses(env, tripwire):
        print("%s %s: %s" % (context, state, desc))
        if not args.dry_run:
            ok = poster(repo, sha, context, state, desc, url) and ok
    return 0 if ok else 1


def _read_summary(path):
    """One line of JSON from path, or '' when it is missing or unparseable."""
    try:
        with open(path, encoding="utf-8") as fh:
            return json.dumps(json.load(fh), sort_keys=True, separators=(",", ":"))
    except (OSError, ValueError):
        return ""


def record_outputs(summary_dir, tests):
    """{output name: one-line value} for the checks job's outputs."""
    out = {}
    valid = all(TEST_ID_RE.match(k) and v in OUTCOMES for k, v in tests)
    out["tests"] = json.dumps(dict(tests), sort_keys=True, separators=(",", ":")) if tests and valid else ""
    for name, rel in (("steps", "steps.json"), ("review", "review.json"), ("questions", "questions.json")):
        out[name] = _read_summary(os.path.join(summary_dir, rel))
    return out


def cmd_record(args, env=None):
    env = os.environ if env is None else env
    tests = []
    for item in args.test or []:
        key, sep, value = item.partition("=")
        tests.append((key, value) if sep else (key, ""))
    target = args.output or env.get("GITHUB_OUTPUT", "")
    if not target:
        print("ERROR: record needs --output FILE or GITHUB_OUTPUT", file=sys.stderr)
        return 2
    outputs = record_outputs(args.dir, tests)
    with open(target, "a", encoding="utf-8") as fh:
        for name in ("tests", "steps", "review", "questions"):
            value = outputs[name]
            assert "\n" not in value and "\r" not in value
            fh.write("%s=%s\n" % (name, value))
            print("%s: %s" % (name, "recorded" if value else "empty"))
    return 0


def main(argv=None):
    # No flag abbreviations (model S-005 AC4): only the full flag names are accepted.
    parser = argparse.ArgumentParser(prog="owner_signal.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    p_rec = sub.add_parser("record", allow_abbrev=False)
    p_rec.add_argument("--dir", required=True)
    p_rec.add_argument("--test", action="append")
    p_rec.add_argument("--output")
    p_post = sub.add_parser("post", allow_abbrev=False)
    p_post.add_argument("--dry-run", action="store_true")
    p_post.add_argument("--root", default=".")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if args.cmd == "record":
        return cmd_record(args)
    if args.cmd == "post":
        return cmd_post(args)
    parser.print_usage(sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())
