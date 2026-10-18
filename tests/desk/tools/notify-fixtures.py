"""The sender's fixtures (spec S-001, J16, AC73, AC77; 2026-10-18), made or checked by the model's own code.

    python3 tests/desk/tools/notify-fixtures.py tests/desk/fixtures/notify      (from the repository's root)

Writes into <out dir>, and prints what each check of the model said:

- sd-ef8daf4/: Service-Desk's real records at ef8daf4 that the desk's readers and the sender read, copied
  unchanged with `git show` (queue/, decisions/, questions/, status/, dispatch-log/, governance/ROUTING.toml,
  docs/LEDGER.md, sessions/chief-of-staff/ and .github/workflows/asks-merge.yml).
- ac77-real/: questions/P-001-next-work.md and sessions/chief-of-staff/session_012RJPVKAoLga2RkqLYRDcBY.jsonl
  as they stand at ccf320f (real), and ac77-real/asked/questions/P-001-next-work.md: the same question with the
  one line `Asked in session: session_012RJPVKAoLga2RkqLYRDcBY` added directly after its `Milestone: M3A` line
  (real except that line).
- model-classify.json: `classify` (governance/checks/asks_merge.py:117) on made-up diffs, with readers that
  give every file a form the job takes, so its verdict turns on the paths.
- model-waits.json: the model's own `run` (asks_merge.py:600), driven by a fake API, one pull request a
  scenario, each giving one of its `waits` reasons (or a merge, or nothing judged); its printed lines, and the
  same lines written into a log in GitHub's form, a timestamp before each.
- grant-cases.json and model-grants.json: made-up histories (written into scratch repositories with git's
  plumbing, as tests/desk/notify-helpers.mjs writes them again) and `find_grant`'s verdict on each.
  `find_grant` on this repository at ef8daf4 is printed too.

The model's code is imported from governance/checks/ (read only). Nothing here is a real record unless the
README says so.
"""
import base64
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.getcwd()
sys.path.insert(0, os.path.join(HERE, "governance", "checks"))
import asks_merge  # noqa: E402
import govlib  # noqa: E402

FIND_GRANT = asks_merge.find_grant  # the model's own, restored after run()'s scenarios

OUT = sys.argv[1]
REPO = "shumpmaster/Service-Desk"


def git(args, cwd=HERE, env=None, input=None):
    return subprocess.run(["git"] + args, cwd=cwd, check=True, capture_output=True, input=input,
                          env=env).stdout


def write(rel, data):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as fh:
        fh.write(data if isinstance(data, bytes) else data.encode("utf-8"))


def dump(rel, obj):
    write(rel, json.dumps(obj, indent=1, ensure_ascii=False) + "\n")


# ---------------------------------------------------------------------------
# Real records

REAL_PREFIXES = ("queue/", "decisions/", "questions/", "status/", "dispatch-log/", "sessions/chief-of-staff/")
REAL_FILES = ("governance/ROUTING.toml", "docs/LEDGER.md", ".github/workflows/asks-merge.yml")
shutil.rmtree(os.path.join(OUT, "sd-ef8daf4"), ignore_errors=True)
names = git(["ls-tree", "-r", "--name-only", "ef8daf4"]).decode().split("\n")
copied = 0
for p in names:
    if p and (p.startswith(REAL_PREFIXES) or p in REAL_FILES):
        write("sd-ef8daf4/" + p, git(["show", "ef8daf4:" + p]))
        copied += 1
print("sd-ef8daf4: %d files copied from ef8daf4" % copied)

SID = "session_012RJPVKAoLga2RkqLYRDcBY"
question = git(["show", "ccf320f:questions/P-001-next-work.md"]).decode("utf-8")
write("ac77-real/questions/P-001-next-work.md", question)
write("ac77-real/sessions/chief-of-staff/%s.jsonl" % SID, git(["show", "ccf320f:sessions/chief-of-staff/%s.jsonl" % SID]))
lines = question.split("\n")
i = lines.index("Milestone: M3A")
asked = "\n".join(lines[:i + 1] + ["Asked in session: %s" % SID] + lines[i + 1:])
write("ac77-real/asked/questions/P-001-next-work.md", asked)
print("ac77-real: the question and the session file at ccf320f; the asked copy adds one line after line %d" % (i + 1))

# ---------------------------------------------------------------------------
# classify on made-up diffs

S033 = os.path.join(HERE, "tests", "desk", "fixtures", "s033")
Q_TEXT = open(os.path.join(S033, "questions", "S033-milestone.md"), encoding="utf-8").read()
A_TEXT = open(os.path.join(S033, "decisions", "questions", "S033-milestone.md"), encoding="utf-8").read()
OLD_SESSION = '{"event": "start", "session": "s1", "time": "2026-10-18T09:00:00Z", "doing": "a made-up piece"}\n'
NEW_SESSION = OLD_SESSION + '{"event": "end", "session": "s1", "time": "2026-10-18T10:00:00Z", "usage": null}\n'
CASES = [
    ("filing", [("A", "questions/N1.md")]),
    ("closing", [("D", "questions/N2.md"), ("A", "decisions/questions/N2.md")]),
    ("session added", [("A", "sessions/chief-of-staff/s1.jsonl")]),
    ("session lines added", [("M", "sessions/chief-of-staff/s1.jsonl")]),
    ("tidying", [("D", "questions/N3.md")]),
    ("filing and a session", [("A", "questions/N1.md"), ("A", "sessions/chief-of-staff/s1.jsonl")]),
    ("code", [("A", "src/x.js")]),
    ("filing and code", [("A", "questions/N1.md"), ("M", "src/lib/model.js")]),
    ("a question changed", [("M", "questions/N1.md")]),
    ("the template", [("A", "questions/_TEMPLATE.md")]),
    ("an answer alone", [("A", "decisions/questions/N2.md")]),
    ("a question in a folder", [("A", "questions/sub/N1.md")]),
    ("a session file deleted", [("D", "sessions/chief-of-staff/s1.jsonl")]),
    ("an answer named _x", [("A", "decisions/questions/_x.md")]),
    ("a card", [("A", "queue/P-001-stop-9.md")]),
    ("a session file badly named", [("A", "sessions/chief-of-staff/s 1.jsonl")]),
    ("a decision card's answer", [("A", "decisions/P-001/stop-9.md")]),
    ("empty", []),
]


def reader(texts):
    return lambda path: ("file", texts[path]) if path in texts else None


out = []
for name, changes in CASES:
    head = {"questions/N1.md": Q_TEXT, "decisions/questions/N2.md": A_TEXT.replace("S033-milestone", "N2"),
            "sessions/chief-of-staff/s1.jsonl": NEW_SESSION, "questions/sub/N1.md": Q_TEXT, "src/x.js": "x\n",
            "questions/_TEMPLATE.md": Q_TEXT, "decisions/questions/_x.md": A_TEXT, "queue/P-001-stop-9.md": "x\n",
            "sessions/chief-of-staff/s 1.jsonl": NEW_SESSION, "decisions/P-001/stop-9.md": "Decision: x\n",
            "src/lib/model.js": "x\n"}
    base = {"sessions/chief-of-staff/s1.jsonl": OLD_SESSION, "src/lib/model.js": "y\n"}
    default = {"questions/N2.md": Q_TEXT, "questions/N3.md": Q_TEXT, "decisions/questions/N3.md": A_TEXT,
               "sessions/chief-of-staff/s1.jsonl": OLD_SESSION, "questions/N1.md": Q_TEXT if name == "a question changed" else None}
    default = {k: v for k, v in default.items() if v is not None}
    kinds, problems = asks_merge.classify(changes, reader(head), reader(base), reader(default))
    out.append({"case": name, "changes": changes, "kinds": kinds, "problems": problems})
    print("classify(%s): kinds %s, problems %d" % (name, "".join(kinds) or "-", len(problems)))
dump("model-classify.json", {"note": "asks_merge.classify on made-up diffs (NOT real records); every file in a form the job takes", "cases": out})

# ---------------------------------------------------------------------------
# run() with a fake API, one scenario a pull request

LEDGER = git(["show", "ef8daf4:docs/LEDGER.md"]).decode("utf-8")
D = "d" * 40
H = "a" * 40
M = "b" * 40


class Grant(object):
    id = "L-0017"


def b64(text):
    return base64.b64encode(text if isinstance(text, bytes) else text.encode("utf-8")).decode()


class FakeApi(object):
    def __init__(self, pr, over=None, put=("ok", {"merged": True})):
        self.pr, self.over, self.put_answer = pr, over or {}, put

    def answer(self, path):
        for prefix, ans in self.over.items():
            if path.startswith(prefix):
                return ans
        if path.startswith("repos/%s/pulls?" % REPO):
            return "ok", ([self.pr] if "page=1" in path else [])
        if path.startswith("repos/%s/branches/" % REPO):
            return "ok", {"commit": {"sha": D}}
        if path.startswith("repos/%s/compare/" % REPO):
            return "ok", {"files": [{"filename": "questions/N1.md", "status": "added"}], "merge_base_commit": {"sha": M},
                          "commits": [{"sha": H, "parents": [{"sha": M}]}], "total_commits": 1}
        if path.startswith("repos/%s/contents/questions/N1.md?ref=%s" % (REPO, H)):
            return "ok", {"type": "file", "path": "questions/N1.md", "encoding": "base64", "content": b64(Q_TEXT)}
        if path.startswith("repos/%s/contents/docs/LEDGER.md?ref=%s" % (REPO, D)):
            return "ok", {"type": "file", "path": "docs/LEDGER.md", "encoding": "base64", "content": b64(LEDGER)}
        if path.startswith("repos/%s/contents/" % REPO):
            return "missing", None
        if path.startswith("repos/%s/commits/%s/check-runs" % (REPO, H)):
            return "ok", {"check_runs": [{"id": 1, "name": "build", "status": "completed", "conclusion": "success",
                                          "check_suite": {"id": 10}}]}
        if path.startswith("repos/%s/actions/runs?head_sha=%s" % (REPO, H)):
            return "ok", {"workflow_runs": [{"check_suite_id": 10, "path": ".github/workflows/desk-build.yml"},
                                            {"check_suite_id": 11, "path": ".github/workflows/orchestrator.yml"}]}
        if path.startswith("repos/%s/commits/%s/statuses" % (REPO, H)):
            return "ok", []
        return "error", "no route for %s" % path

    def get(self, path):
        return self.answer(path)

    def put(self, path, payload):
        return self.put_answer

    def dispatch_governance(self, ref, base):
        return True


def pr(**kw):
    p = {"number": 7, "title": "File a made-up question", "body": "", "base": {"ref": "main"},
         "head": {"sha": H, "repo": {"full_name": REPO}}}
    p.update(kw)
    return p


C = "repos/%s/commits/%s/check-runs" % (REPO, H)
R = "repos/%s/actions/runs?head_sha=%s" % (REPO, H)
ST = "repos/%s/commits/%s/statuses" % (REPO, H)
CMP = "repos/%s/compare/" % REPO
CQ = "repos/%s/contents/questions/N1.md?ref=%s" % (REPO, H)
SCENARIOS = [
    ("merged", pr(), {}),
    ("head unreadable", pr(head={"repo": {"full_name": REPO}}), {}),
    ("a fork's branch", pr(head={"sha": H, "repo": {"full_name": "someone/Service-Desk"}}), {}),
    ("another base", pr(base={"ref": "other"}), {}),
    ("no title", pr(title=" "), {}),
    ("a trailer line in the description", pr(body="Merged-By: someone"), {}),
    ("the tip unreadable", pr(), {"repos/%s/branches/" % REPO: ("error", "HTTP 502")}),
    ("the compare unreadable", pr(), {CMP: ("error", "HTTP 502")}),
    ("300 files", pr(), {CMP: ("ok", {"files": [{"filename": "questions/N%d.md" % k, "status": "added"} for k in range(300)],
                                      "merge_base_commit": {"sha": M}, "commits": [{"sha": H, "parents": [{"sha": M}]}], "total_commits": 1})}),
    ("commits not all listed", pr(), {CMP: ("ok", {"files": [{"filename": "questions/N1.md", "status": "added"}], "merge_base_commit": {"sha": M},
                                                   "commits": [{"sha": H, "parents": [{"sha": M}]}], "total_commits": 2})}),
    ("code in the diff", pr(), {CMP: ("ok", {"files": [{"filename": "src/x.js", "status": "added"}], "merge_base_commit": {"sha": M},
                                             "commits": [{"sha": H, "parents": [{"sha": M}]}], "total_commits": 1})}),
    ("not text", pr(), {CQ: ("ok", {"type": "file", "path": "questions/N1.md", "encoding": "base64", "content": b64(b"\xff\xfe\x00")})}),
    ("a file unreadable", pr(), {CQ: ("error", "HTTP 502")}),
    ("could not be judged", pr(head=["not", "an", "object"]), {}),
    ("checks unreadable", pr(), {C: ("error", "HTTP 502")}),
    ("a check run unreadable", pr(), {C: ("ok", {"check_runs": [{"name": "build"}]})}),
    ("no check run yet", pr(), {C: ("ok", {"check_runs": []})}),
    ("only the Orchestrator's check", pr(), {C: ("ok", {"check_runs": [{"id": 2, "name": "loop", "status": "completed", "conclusion": "cancelled", "check_suite": {"id": 11}}]})}),
    ("a check running", pr(), {C: ("ok", {"check_runs": [{"id": 1, "name": "build", "status": "in_progress", "conclusion": None, "check_suite": {"id": 10}}]})}),
    ("a check queued", pr(), {C: ("ok", {"check_runs": [{"id": 1, "name": "build", "status": "queued", "conclusion": None, "check_suite": {"id": 10}}]})}),
    ("a check failed", pr(), {C: ("ok", {"check_runs": [{"id": 1, "name": "build", "status": "completed", "conclusion": "failure", "check_suite": {"id": 10}}]})}),
    ("a check cancelled, then run again to success", pr(), {C: ("ok", {"check_runs": [
        {"id": 1, "name": "build", "status": "completed", "conclusion": "cancelled", "check_suite": {"id": 10}},
        {"id": 3, "name": "build", "status": "completed", "conclusion": "success", "check_suite": {"id": 10}}]})}),
    ("an app's check failed", pr(), {C: ("ok", {"check_runs": [{"id": 4, "name": "lint", "status": "completed", "conclusion": "failure",
                                                                "check_suite": {"id": 99}, "app": {"slug": "some-app"}}]})}),
    ("a status pending", pr(), {ST: ("ok", [{"id": 5, "context": "ci/x", "state": "pending"}])}),
    ("a status failed", pr(), {ST: ("ok", [{"id": 5, "context": "ci/x", "state": "failure"}])}),
    ("a status in error", pr(), {ST: ("ok", [{"id": 5, "context": "ci/x", "state": "error"}])}),
    ("owner-questions pending only", pr(), {ST: ("ok", [{"id": 5, "context": "owner-questions", "state": "pending"}])}),
    ("a status unreadable", pr(), {ST: ("ok", [{"context": "ci/x", "state": "success"}])}),
    ("the grant withdrawn", pr(), {"repos/%s/contents/docs/LEDGER.md?ref=%s" % (REPO, D): ("ok", {"type": "file", "path": "docs/LEDGER.md",
                                   "encoding": "base64", "content": b64(LEDGER.replace("## L-0017", "## L-0917"))})}),
]


def run_one(name, p, over, put=("ok", {"merged": True}), pulls=None):
    api = FakeApi(p, over, put)
    if pulls is not None:
        api.over["repos/%s/pulls?" % REPO] = pulls
    buf = io.StringIO()
    asks_merge.find_grant = lambda root, rev="HEAD": (Grant(), [])
    code = asks_merge.run(api, HERE, REPO, "main", out=buf)
    return code, [l for l in buf.getvalue().split("\n") if l]


results = []
for name, p, over in SCENARIOS + [("GitHub refused the merge", pr(), {})]:
    put = ("error", "HTTP 409: conflict") if name == "GitHub refused the merge" else ("ok", {"merged": True})
    code, printed = run_one(name, p, over, put)
    results.append((name, code, printed))
code, printed = run_one("judged nothing (the open pull requests unreadable)", pr(), {}, pulls=("error", "HTTP 502"))
results.append(("judged nothing (the open pull requests unreadable)", code, printed))

STAMP = "2026-10-18T12:50:%02d.%07dZ "
waits = []
for k, (name, code, printed) in enumerate(results):
    log = "".join(STAMP % (k % 60, 1234567 + j) + l + "\n" for j, l in enumerate(printed))
    line = next((l for l in printed if l.startswith("PR #")), None)
    reason = line.split(": waits: ", 1)[1] if line and ": waits: " in line else None
    waits.append({"scenario": name, "exit": code, "printed": printed, "log": log, "reason": reason,
                  "merged": bool(line and ": merged" in line)})
    print("run(%s): exit %d, %s" % (name, code, line or "no PR line"))
dump("model-waits.json", {"note": "asks_merge.run driven by a fake API (NOT real records); its printed lines, and a log in GitHub's form", "scenarios": waits})

# ---------------------------------------------------------------------------
# find_grant on made-up histories, and on this repository at ef8daf4

asks_merge.find_grant = FIND_GRANT
g, reasons = asks_merge.find_grant(HERE, "ef8daf4")
print("find_grant(this repository, ef8daf4): %s %s" % (g.id if g else None, reasons))

RECORD = git(["show", "ef8daf4:decisions/questions/P-001-asks-merge.md"]).decode("utf-8")
WITHDRAW = ("\n## L-9001 — The asks-merge delegation withdrawn (made up)\ndate: 2026-10-19\ntype: delegation\n"
            "supersedes: [L-0017]\nscope: project\nexpires: never\ndecision: asks-merge withdrawn: made up\n"
            "decided_by: owner (made up, decisions/questions/P-001-asks-merge.md)\n")
NOTE = "\n## L-9002 — A made-up note\ndate: 2026-10-19\ntype: note\nsupersedes: []\ndecision: a made-up entry\n"
WITHOUT = LEDGER.replace("## L-0017", "## L-0917").replace("asks-merge: granted", "not a grant")
CASES_G = [
    {"name": "the real ledger, brought in a plain commit", "commits": [
        {"id": "c1", "parents": [], "files": {"docs/LEDGER.md": LEDGER, "decisions/questions/P-001-asks-merge.md": RECORD}, "message": "the ledger\n"}]},
    {"name": "superseded by a withdrawal", "commits": [
        {"id": "c1", "parents": [], "files": {"docs/LEDGER.md": LEDGER + WITHDRAW, "decisions/questions/P-001-asks-merge.md": RECORD}, "message": "the ledger\n"}]},
    {"name": "its decided_by record absent", "commits": [
        {"id": "c1", "parents": [], "files": {"docs/LEDGER.md": LEDGER}, "message": "the ledger\n"}]},
    {"name": "no ledger", "commits": [
        {"id": "c1", "parents": [], "files": {"README.md": "x\n"}, "message": "nothing\n"}]},
    {"name": "arrived in a merge carrying Merged-By", "commits": [
        {"id": "c1", "parents": [], "files": {"docs/LEDGER.md": WITHOUT, "decisions/questions/P-001-asks-merge.md": RECORD}, "message": "base\n"},
        {"id": "c2", "parents": ["c1"], "files": {"docs/LEDGER.md": LEDGER}, "message": "the grant on a branch\n"},
        {"id": "c3", "parents": ["c1", "c2"], "files": {"docs/LEDGER.md": LEDGER},
         "message": "Merge the grant (#1)\n\nMerged-By: orchestrator\nDelegation: L-0017\nMerged-Head: %s\n" % ("c" * 40)}]},
    {"name": "arrived in a plain merge", "commits": [
        {"id": "c1", "parents": [], "files": {"docs/LEDGER.md": WITHOUT, "decisions/questions/P-001-asks-merge.md": RECORD}, "message": "base\n"},
        {"id": "c2", "parents": ["c1"], "files": {"docs/LEDGER.md": LEDGER}, "message": "the grant on a branch\n"},
        {"id": "c3", "parents": ["c1", "c2"], "files": {"docs/LEDGER.md": LEDGER}, "message": "Merge the grant (#1)\n\nThe owner's merge.\n"}]},
    {"name": "a later entry that is not a grant", "commits": [
        {"id": "c1", "parents": [], "files": {"docs/LEDGER.md": LEDGER + NOTE, "decisions/questions/P-001-asks-merge.md": RECORD}, "message": "the ledger\n"}]},
]


def build_repo(case, root):
    """Write a case's commits with git's plumbing (tests/desk/notify-helpers.mjs `buildRepo` does the same)."""
    git(["init", "-q", root])
    env = dict(os.environ, GIT_INDEX_FILE=os.path.join(root, ".git", "case-index"), GIT_AUTHOR_NAME="made-up",
               GIT_AUTHOR_EMAIL="made-up@agents.invalid", GIT_COMMITTER_NAME="made-up",
               GIT_COMMITTER_EMAIL="made-up@agents.invalid")
    shas, trees = {}, {}
    for k, c in enumerate(case["commits"]):
        files = dict(trees[c["parents"][0]]) if c["parents"] else {}
        for path, text in c["files"].items():
            if text is None:
                files.pop(path, None)
            else:
                files[path] = text
        trees[c["id"]] = files
        if os.path.exists(env["GIT_INDEX_FILE"]):
            os.remove(env["GIT_INDEX_FILE"])
        for path in sorted(files):
            blob = git(["hash-object", "-w", "--stdin"], cwd=root, input=files[path].encode("utf-8")).decode().strip()
            git(["update-index", "--add", "--cacheinfo", "100644,%s,%s" % (blob, path)], cwd=root, env=env)
        tree = git(["write-tree"], cwd=root, env=env).decode().strip()
        date = c.get("date", "2026-10-18T10:%02d:00+00:00" % k)
        env2 = dict(env, GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
        args = ["commit-tree", tree]
        for p in c["parents"]:
            args += ["-p", shas[p]]
        shas[c["id"]] = git(args, cwd=root, env=env2, input=c["message"].encode("utf-8")).decode().strip()
    git(["update-ref", "HEAD", shas[case["commits"][-1]["id"]]], cwd=root)
    return shas


verdicts = []
for case in CASES_G:
    tmp = tempfile.mkdtemp(prefix="notify-grant-")
    try:
        build_repo(case, tmp)
        g, reasons = asks_merge.find_grant(tmp, "HEAD")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    verdicts.append({"case": case["name"], "grant": g.id if g else None, "reasons": reasons})
    print("find_grant(%s): %s" % (case["name"], g.id if g else None))
dump("grant-cases.json", {"note": "made-up histories (NOT real records; the ledger is the real one at ef8daf4, changed where the case says)", "cases": CASES_G})
dump("model-grants.json", {"note": "asks_merge.find_grant on each case of grant-cases.json", "verdicts": verdicts})
