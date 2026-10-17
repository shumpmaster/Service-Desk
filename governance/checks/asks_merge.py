#!/usr/bin/env python3
"""asks_merge — the asks-merge delegation: merge pull requests that only file or close an ask (model S-033 AC4).

Usage:
  asks_merge.py run [--root DIR] [--repo OWNER/NAME] [--default-branch NAME]

`run` is the one step of .github/workflows/asks-merge.yml. --root is the default branch's checkout (default
`.`, fetched with its history and no credentials); --repo defaults to $GITHUB_REPOSITORY; the default branch
is read from the API when --default-branch is not given. It talks to GitHub only through `gh api` with
$GH_TOKEN, the workflow's own token, and never runs or checks out a pull request's code: it reads a pull
request's files as data, through the API.

The grant. docs/LEDGER.md at the checkout holds an entry with `type: delegation`, `scope: project`, `expires:
never`, a `decided_by:` beginning `owner` that names a decisions/questions/ file present in the checkout,
and a `decision:` beginning `asks-merge:`; no entry supersedes it (a withdrawal is a later delegation entry
superseding it, its `decision:` beginning `asks-merge withdrawn:`); and the first-parent commit that brought
it onto the default branch is not a merge carrying a `Merged-By:` trailer. The latest such entry is the
grant. Without one, nothing is merged.

Each open pull request whose base is the default branch and whose head branch is in this repository is read
once: its head sha H, its title and its description. Everything is then judged at H:
  - the compare of the default branch's tip D and H (from their merge base M; a file listed as renamed is
    one deletion and one addition, renames being off as `git diff --no-renames` reads them), and the
    contents endpoint at H, M and D for the files the kinds below read. The compare's `commits` must be all
    of them (`total_commits` read and equal to the number listed), each with exactly one parent, that parent
    one of the listed commits or M, and H among them: the pull request's own commits are one line from M, so
    M is the only merge base and the merge changes D only in the paths listed. The diff is exactly one or
    more of:
      (a) filing: questions/<name>.md added, not `_TEMPLATE.md`, with no decisions/questions/<name>.md on D;
      (b) closing: questions/<name>.md deleted and decisions/questions/<name>.md added, where the question
          on D holds one `REVERSIBILITY:` label, on its `RISK CLASS:` line, reading `reversible`
          (governance_checks.reversibility and reversibility_labels), the answer's first line
          begins `Ruling:` and does not end `(defaulted)`, its second line matches record_checks' PROXY_RE,
          its first column-0 `Milestone:` line after line 1 holds the question's value exactly, and its
          name neither ends `-notes.md` nor holds `-critic`;
      (c) session lines: sessions/chief-of-staff/<session id>.jsonl added, or lines added to its end (read
          at M and H) with no line changed or removed;
      (d) tidying: questions/<name>.md deleted, its decisions/questions/<name>.md already on D.
    Each <name> holds no `/` and does not start with `_`; every file read is a regular file.
  - its check runs: keyed by their workflow's path (check suites mapped to workflow runs through the
    workflow runs for H) and name, or, for a suite that maps to no workflow run (an app that is not GitHub
    Actions), by the app's slug and name; runs of .github/workflows/orchestrator.yml are not counted; the
    latest run per key (by id) must be `completed` with `success`, and with no counted run the head waits;
  - its commit statuses: the latest per context (by id) must be `success`, except `owner-questions`;
  - the description holds no `Merged-By:`, `Delegation:` or `Merged-Head:` line;
  - the grant still stands in the ledger read from D just before the merge.
Then it calls GitHub's merge endpoint with `sha: H`, `merge_method: merge`, the title `<title> (#<n>)` and
the message: the description, a blank line, and the trailers `Merged-By: orchestrator`, `Delegation: L-<n>`
and `Merged-Head: H`. Any refusal (the head moved, a conflict, a read that fails) skips the pull request
until the next run. Once at least one merge succeeded, it starts governance.yml on the default branch with
`base` set to D as read before the first merge (orchestrator_git.py dispatch-governance).

record_checks merges uses `classify` and `grant_problem` to judge each `Merged-By:` merge after the fact.

Exit 0 = done (merged or not), 1 = merges were made but the governance run could not be started, 2 = usage
error.
"""

import argparse
import base64
import json
import os
import re
import subprocess
import sys
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import govlib as g  # noqa: E402
import governance_checks as gc  # noqa: E402
import record_checks as rc  # noqa: E402

ORCH_WORKFLOW = ".github/workflows/orchestrator.yml"
EXEMPT_STATUS = "owner-questions"
BOT = "github-actions[bot]"
ACCEPT = "Accept: application/vnd.github+json"
GH_TIMEOUT = 60
PAGES = 10
COMPARE_FILE_CAP = 300
QUESTION_RE = re.compile(r"questions/([^/]+)\.md")
ANSWER_RE = re.compile(r"decisions/questions/([^/]+)\.md")
SESSION_RE = re.compile(r"sessions/chief-of-staff/([A-Za-z0-9_-]{1,100})\.jsonl")
RECORD_RE = re.compile(r"decisions/questions/[A-Za-z0-9][A-Za-z0-9._-]*\.md")
SHA_RE = re.compile(r"[0-9a-f]{40}")
REPO_RE = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+")
TRAILER_LINE_RE = re.compile(r"(?mi)^(?:Merged-By|Delegation|Merged-Head)[ \t]*:")
REGULAR_MODES = ("100644", "100755")


class Unreadable(Exception):
    """A record the judgment needs cannot be read; the pull request waits."""


# --------------------------------------------------------------------------
# The four kinds (shared with record_checks merges)


def _name_ok(name):
    return bool(name) and "/" not in name and not name.startswith("_")


def _lines(text):
    out = text.split("\n")
    return out[:-1] if out and out[-1] == "" else out


def _answer_milestone(text):
    """The first column-0 `Milestone:` line after line 1, trailing space dropped, or None."""
    return gc.question_milestone("\n".join(text.replace("\r\n", "\n").split("\n")[1:]))


def _value(line):
    return line[len("Milestone:"):].strip() if line is not None else None


def classify(changes, head, base, default):
    """([kind letters], [problem]) of a diff: `changes` is [(status, path)] with status A, D or M (renames
    already split); `head`, `base` and `default` read a path in the tree being merged, the merge base (the
    first parent, after the fact) and the default branch: None when absent, else (kind, text) where kind is
    "file" for a regular file. No problem means the diff is one or more of the kinds (a) to (d)."""
    problems, kinds = [], set()
    filed, deleted, answered, sessions = [], [], {}, []
    for status, path in changes:
        q, a, s = QUESTION_RE.fullmatch(path), ANSWER_RE.fullmatch(path), SESSION_RE.fullmatch(path)
        if q and _name_ok(q.group(1)) and status == "A":
            filed.append((q.group(1), path))
        elif q and _name_ok(q.group(1)) and status == "D":
            deleted.append((q.group(1), path))
        elif a and _name_ok(a.group(1)) and status == "A":
            answered[a.group(1)] = path
        elif s and status in ("A", "M"):
            sessions.append((status, path))
        else:
            problems.append("%s (%s) is not a change the asks-merge delegation covers"
                            % (path, {"A": "added", "D": "deleted", "M": "changed"}.get(status, status)))
    if not changes:
        problems.append("the diff is empty")

    def regular(reader, path, where):
        got = reader(path)
        if got is None:
            problems.append("%s is not in %s" % (path, where))
            return None
        if got[0] != "file":
            problems.append("%s in %s is not a regular file" % (path, where))
            return None
        if got[1] is None:
            problems.append("%s in %s cannot be read as text" % (path, where))
        return got[1]

    for name, path in filed:
        answer = "decisions/questions/%s.md" % name
        regular(head, path, "the head")
        if default(answer) is not None:
            problems.append("%s: filed, but its answer record %s is on the default branch" % (path, answer))
        else:
            kinds.add("a")
    for name, path in deleted:
        answer = "decisions/questions/%s.md" % name
        question = regular(default, path, "the default branch")
        if name not in answered:
            if regular(default, answer, "the default branch") is None:
                problems.append("%s: deleted, but its answer record %s is not on the default branch" % (path, answer))
            else:
                kinds.add("d")
            continue
        added = answered.pop(name)
        text = regular(head, added, "the head")
        if question is None or text is None:
            continue
        why = closing_problem(name, question, text)
        if why:
            problems.append("%s: %s" % (added, why))
        else:
            kinds.add("b")
    for name, path in sorted(answered.items()):
        problems.append("%s: an answer record added without deleting questions/%s.md" % (path, name))
    for status, path in sessions:
        text = regular(head, path, "the head")
        if text is None:
            continue
        if status == "M":
            old = regular(base, path, "the merge base")
            if old is None:
                continue
            ol, nl = _lines(old), _lines(text)
            if nl[:len(ol)] != ol or len(nl) <= len(ol):
                problems.append("%s: a line changed or removed; only lines added to the end are covered" % path)
                continue
        kinds.add("c")
    return sorted(kinds), problems


def closing_problem(name, question, answer):
    """Why an answer record does not close its question under the delegation (kind (b)), or None."""
    if name.endswith("-notes") or "-critic" in name:
        return "a notes or Critic record, which waits for the owner"
    labels, word = gc.reversibility_labels(question), gc.reversibility(question)
    if labels != 1:
        return "its question holds %d 'REVERSIBILITY:' labels, not one" % labels
    if word is None:
        return "its question's 'REVERSIBILITY:' label is not on its 'RISK CLASS:' line"
    if word != "reversible":
        return "its question's REVERSIBILITY is %r, not reversible" % (word,)
    lines = answer.replace("\r\n", "\n").split("\n")
    first = lines[0].rstrip()
    if not first.startswith("Ruling:"):
        return "its first line does not begin `Ruling:`"
    if first.endswith("(defaulted)"):
        return "a defaulted ruling, which waits for the owner"
    if len(lines) < 2 or not rc.PROXY_RE.match(lines[1]):
        return "its second line is not `Proxy: done at the owner's request` with the owner's words"
    want, got = _value(gc.question_milestone(question)), _value(_answer_milestone(answer))
    if want is None:
        return "its question has no `Milestone:` line"
    if got != want:
        return "its `Milestone:` line after line 1 is %r, not the question's %r" % (got, want)
    return None


# --------------------------------------------------------------------------
# The checks at H


def check_state(check_runs, workflow_runs, statuses):
    """(True, None) when every counted check run and every status but owner-questions has passed at the head,
    else (False, why)."""
    suites = {}
    for w in workflow_runs:
        if isinstance(w, dict) and isinstance(w.get("check_suite_id"), int) and isinstance(w.get("path"), str):
            suites[w["check_suite_id"]] = w["path"].split("@", 1)[0]
    latest = {}
    for r in check_runs:
        if not isinstance(r, dict) or not isinstance(r.get("id"), int):
            return False, "a check run cannot be read"
        suite = (r.get("check_suite") or {}).get("id")
        path = suites.get(suite)
        if path == ORCH_WORKFLOW:
            continue
        key = ("workflow", path, r.get("name")) if path is not None else \
              ("app", (r.get("app") or {}).get("slug"), r.get("name"))
        if key not in latest or r["id"] > latest[key]["id"]:
            latest[key] = r
    if not latest:
        return False, "no counted check run on the head yet"
    for key in sorted(latest, key=lambda k: tuple(str(x) for x in k)):
        r = latest[key]
        if r.get("status") != "completed" or r.get("conclusion") != "success":
            return False, "check run %r (%s) is %s/%s" % (key[2], key[1], r.get("status"), r.get("conclusion"))
    last = {}
    for s in statuses:
        if not isinstance(s, dict) or not isinstance(s.get("id"), int) or not isinstance(s.get("context"), str):
            return False, "a commit status cannot be read"
        if s["context"] not in last or s["id"] > last[s["context"]]["id"]:
            last[s["context"]] = s
    for ctx in sorted(last):
        if ctx != EXEMPT_STATUS and last[ctx].get("state") != "success":
            return False, "status %r is %s" % (ctx, last[ctx].get("state"))
    return True, None


# --------------------------------------------------------------------------
# The grant


def grant_form_problem(entry, entries):
    """Why a ledger entry is not a standing asks-merge grant in form (or is superseded), or None."""
    if g.strip_comment(entry.get("type") or "") != "delegation":
        return "its type is not delegation"
    if g.strip_comment(entry.get("scope") or "") != "project":
        return "its scope is not project"
    if g.strip_comment(entry.get("expires") or "") != "never":
        return "it does not expire never"
    if not (entry.get("decided_by") or "").strip().startswith("owner"):
        return "its decided_by does not begin owner"
    if not (entry.get("decision") or "").strip().startswith("asks-merge:"):
        return "its decision does not begin asks-merge:"
    for e in entries:
        ids, _ = g.parse_supersedes(e.get("supersedes"))
        if entry.id in ids:
            return "%s supersedes it" % e.id
    return None


def _ledger_has(blob_text, entry_id):
    return blob_text is not None and any(e.id == entry_id for e in g.parse_ledger(blob_text)[1])


def arrival(root, rev, entry_id):
    """The first-parent commit, at or before `rev`, whose ledger holds `entry_id` and whose first parent's does
    not (the commit that brought it onto that line), or None."""
    shas = g.rev_list(root, ["--first-parent", rev])
    data = g.git(root, ["cat-file", "--batch-check"],
                 input="".join("%s:%s\n" % (s, g.LEDGER_REL) for s in shas).encode())
    blobs = []
    for line in data.decode("utf-8", "replace").split("\n")[:len(shas)]:
        parts = line.split()
        blobs.append(parts[0] if len(parts) == 3 and parts[1] == "blob" else None)
    texts = {}

    def has(blob):
        if blob is None:
            return False
        if blob not in texts:
            texts[blob] = g.git(root, ["cat-file", "blob", blob]).decode("utf-8", "replace")
        return _ledger_has(texts[blob], entry_id)
    for i, sha in enumerate(shas):
        parent = blobs[i + 1] if i + 1 < len(shas) else None
        if blobs[i] != parent and has(blobs[i]) and not has(parent):
            return g.read_commits(root, [sha])[0]
    return None


def grant_problem(root, rev, entry_id):
    """Why `entry_id` is not a standing asks-merge grant in the ledger at `rev`, or None (model S-033 AC4)."""
    entries = g.ledger_entries_at(root, rev)
    found = [e for e in entries if e.id == entry_id]
    if not found:
        return "no such entry in the ledger"
    why = grant_form_problem(found[0], entries)
    if why:
        return why
    named = RECORD_RE.findall(found[0].get("decided_by") or "")
    if not any(g.git_blob(root, rev, p) is not None for p in named):
        return "its decided_by names no decisions/questions/ record present there"
    c = arrival(root, rev, entry_id)
    if c is not None and c.is_merge() and c.trailer("Merged-By"):
        return ("it arrived in merge %s, which carries a Merged-By: trailer: a grant is never merged under itself"
                % c.short)
    return None


def find_grant(root, rev="HEAD"):
    """(the latest standing asks-merge grant at `rev`, or None; why each candidate is not one)."""
    reasons = []
    for e in reversed(g.ledger_entries_at(root, rev)):
        if not (e.get("decision") or "").strip().startswith("asks-merge:"):
            continue
        why = grant_problem(root, rev, e.id)
        if why is None:
            return e, reasons
        reasons.append("%s: %s" % (e.id, why))
    return None, reasons


# --------------------------------------------------------------------------
# After the fact: record_checks merges


class GitTree(object):
    """Reads a path at a commit of the local repository, as classify's readers do."""

    def __init__(self, root, sha):
        self.root, self.sha = root, sha

    def __call__(self, path):
        out = g.git(self.root, ["ls-tree", "-z", self.sha, "--", path]).decode("utf-8", "surrogateescape")
        entry = [e for e in out.split("\0") if e and e.split("\t", 1)[-1] == path]
        if not entry:
            return None
        mode, kind, obj = entry[0].split("\t", 1)[0].split()
        if kind != "blob" or mode not in REGULAR_MODES:
            return ("other", None)
        try:
            return ("file", g.git(self.root, ["cat-file", "blob", obj]).decode("utf-8"))
        except UnicodeDecodeError:
            return ("file", None)


def merged_by_problems(root, c):
    """What is wrong with a first-parent commit carrying `Merged-By:` (model S-033 AC4), [] when nothing."""
    if len(c.parents) < 2:
        return ["it carries Merged-By: but has fewer than two parents; an asks-merge merge has two (model S-033 "
                "AC4)"]
    out = []
    first, second = c.parents[0], c.parents[1]
    if c.author_name != BOT:
        out.append("it carries Merged-By: but its author is %s <%s>, not %s: only the asks-merge workflow "
                   "merges under the delegation (model S-033 AC4)" % (c.author_name, c.author_email, BOT))
    if c.trailer("Merged-By") != ["orchestrator"]:
        out.append("its Merged-By: trailer is %r, not one `Merged-By: orchestrator`" % (c.trailer("Merged-By"),))
    raw = g.split_z(g.git(root, ["diff", "--no-renames", "--name-status", "-z", first, c.sha]))
    changes = [(raw[i][:1], raw[i + 1]) for i in range(0, len(raw) - 1, 2)]
    _, problems = classify(changes, GitTree(root, c.sha), GitTree(root, first), GitTree(root, first))
    if problems:
        out.append("its diff against its first parent is not one of the asks-merge kinds (filing, closing, "
                   "session lines, tidying): %s%s (model S-033 AC4)"
                   % ("; ".join(problems[:3]), "; and %d more" % (len(problems) - 3) if len(problems) > 3 else ""))
    dels = c.trailer("Delegation")
    if len(dels) != 1:
        out.append("it has %s Delegation: trailer; it needs one naming its grant (model S-033 AC4)"
                   % ("no" if not dels else "more than one"))
    else:
        why = grant_problem(root, first, dels[0])
        if why:
            out.append("its Delegation: %s names no asks-merge grant standing in its first parent's ledger: %s "
                       "(model S-033 AC4)" % (dels[0], why))
    heads = c.trailer("Merged-Head")
    if heads != [second]:
        out.append("its Merged-Head: %s is not its second parent %s (model S-033 AC4)"
                   % (", ".join(heads) or "(none)", second[:12]))
    return out


# --------------------------------------------------------------------------
# GitHub


class GhApi(object):
    """`gh api` with $GH_TOKEN: get and put answer (state, data) with state ok, missing (HTTP 404) or error."""

    def __init__(self):
        self.timeout = GH_TIMEOUT

    def _call(self, argv, data=None):
        try:
            proc = subprocess.run(argv, input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                  timeout=self.timeout)
        except (OSError, subprocess.TimeoutExpired) as exc:
            return "error", "gh could not run (%s)" % type(exc).__name__
        if proc.returncode != 0:
            err = (proc.stderr or b"").decode("utf-8", "replace")
            if "HTTP 404" in err:
                return "missing", None
            return "error", (err or "exit %d" % proc.returncode).strip().replace("\n", " | ")[:300]
        try:
            return "ok", json.loads(proc.stdout.decode("utf-8")) if proc.stdout.strip() else None
        except (UnicodeDecodeError, ValueError):
            return "error", "not JSON"

    def get(self, path):
        return self._call(["gh", "api", "-H", ACCEPT, path])

    def put(self, path, payload):
        return self._call(["gh", "api", "-X", "PUT", "-H", ACCEPT, path, "--input", "-"],
                          json.dumps(payload).encode("utf-8"))

    def dispatch_governance(self, ref, base):
        import orchestrator_git as og
        try:
            return og.cmd_dispatch_governance(argparse.Namespace(workflow="governance.yml", ref=ref, base=base)) == 0
        except (og.Refused, g.UsageError) as exc:
            print("ERROR: %s" % exc, file=sys.stderr)
            return False


def get_pages(api, path, key=None):
    """Every item of a paginated list (100 a page, at most PAGES pages), or None when a page cannot be read or
    the list is longer."""
    items = []
    for page in range(1, PAGES + 1):
        state, data = api.get("%s%sper_page=100&page=%d" % (path, "&" if "?" in path else "?", page))
        chunk = (data.get(key) if isinstance(data, dict) else None) if key else data
        if state != "ok" or not isinstance(chunk, list):
            return None
        items += chunk
        if len(chunk) < 100:
            return items
    return None


class ApiTree(object):
    """Reads a path at a commit through the contents endpoint, as classify's readers do; caches each read."""

    def __init__(self, api, repo, sha):
        self.api, self.repo, self.sha, self.cache = api, repo, sha, {}

    def __call__(self, path):
        if path not in self.cache:
            self.cache[path] = self._read(path)
        return self.cache[path]

    def _read(self, path):
        state, data = self.api.get("repos/%s/contents/%s?ref=%s" % (self.repo, urllib.parse.quote(path, safe="/"),
                                                                     self.sha))
        if state == "missing":
            return None
        if state != "ok":
            raise Unreadable("%s at %s cannot be read (%s)" % (path, self.sha[:12], data))
        if not isinstance(data, dict):
            return ("other", None)                  # a folder
        if data.get("type") != "file" or data.get("path") != path:
            return ("other", None)                  # a link, a submodule, or a link the endpoint followed
        if data.get("encoding") != "base64":
            raise Unreadable("%s at %s is not given in full" % (path, self.sha[:12]))
        try:
            return ("file", base64.b64decode(data.get("content") or "").decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return ("file", None)


def merge_message(body, delegation, head):
    text = (body or "").replace("\r\n", "\n").replace("\r", "\n").rstrip()
    trailers = "Merged-By: orchestrator\nDelegation: %s\nMerged-Head: %s" % (delegation, head)
    return (text + "\n\n" + trailers) if text else trailers


def history_problem(cmp, mb, head):
    """Why the compare's `commits` do not show the pull request's own commits as one line from the merge base
    `mb` to `head`, or None. Only then is `mb` the one merge base of the default branch and the head, so the
    merge changes the default branch only in the paths the compare lists; a merge commit among them can give
    several merge bases (a criss-cross history), and GitHub's merge then builds its own base, under which the
    merged tree may differ in a path the list does not show (model S-033, build review round 1, finding 1)."""
    commits, total = cmp.get("commits"), cmp.get("total_commits")
    if not isinstance(commits, list) or not isinstance(total, int) or isinstance(total, bool):
        return "the compare's commit list or its total cannot be read"
    if total != len(commits):
        return "the compare lists %d of its %d commits, not every one" % (len(commits), total)
    shas, parents = set(), []
    for c in commits:
        sha = (c or {}).get("sha") if isinstance(c, dict) else None
        ps = c.get("parents") if isinstance(c, dict) else None
        if not isinstance(sha, str) or not SHA_RE.fullmatch(sha) or not isinstance(ps, list):
            return "a commit in it cannot be read"
        ids = [(p or {}).get("sha") if isinstance(p, dict) else None for p in ps]
        if not all(isinstance(x, str) and SHA_RE.fullmatch(x) for x in ids):
            return "commit %s in it has a parent that cannot be read" % sha[:12]
        if len(ids) != 1:
            return ("commit %s in it has %d parents: a merge, or a first commit, among its commits, so its merge "
                    "base may not be the one the compare names" % (sha[:12], len(ids)))
        shas.add(sha)
        parents.append((sha, ids[0]))
    for sha, parent in parents:
        if parent not in shas and parent != mb:
            return "commit %s in it has a parent %s, neither one of its commits nor the merge base" % (sha[:12],
                                                                                                    parent[:12])
    if commits and head not in shas:
        return "the compare's commit list does not hold its head"
    return None


def judge(api, repo, default, grant, pr):
    """(None, D, payload) when the pull request may be merged now, else (why it waits, None, None)."""
    n = pr.get("number")
    head = pr.get("head") or {}
    sha = head.get("sha")
    if not isinstance(sha, str) or not SHA_RE.fullmatch(sha):
        return "its head cannot be read", None, None
    if (head.get("repo") or {}).get("full_name") != repo:
        return "its branch is not in this repository", None, None
    if (pr.get("base") or {}).get("ref") != default:
        return "its base is not the default branch", None, None
    title, body = pr.get("title"), pr.get("body") or ""
    if not isinstance(title, str) or not title.strip() or not isinstance(body, str):
        return "its title or description cannot be read", None, None
    if TRAILER_LINE_RE.search(body):
        return "its description carries a Merged-By:, Delegation: or Merged-Head: line", None, None
    state, branch = api.get("repos/%s/branches/%s" % (repo, urllib.parse.quote(default, safe="")))
    tip = ((branch or {}).get("commit") or {}).get("sha") if state == "ok" and isinstance(branch, dict) else None
    if not isinstance(tip, str) or not SHA_RE.fullmatch(tip):
        return "the default branch's tip cannot be read", None, None
    state, cmp = api.get("repos/%s/compare/%s...%s" % (repo, tip, sha))
    files = cmp.get("files") if state == "ok" and isinstance(cmp, dict) else None
    mb = ((cmp or {}).get("merge_base_commit") or {}).get("sha") if isinstance(cmp, dict) else None
    if not isinstance(files, list) or not isinstance(mb, str) or not SHA_RE.fullmatch(mb):
        return "the compare of the default branch and its head cannot be read", None, None
    if len(files) >= COMPARE_FILE_CAP:
        return "its diff lists %d files or more, more than the compare shows whole" % COMPARE_FILE_CAP, None, None
    why = history_problem(cmp, mb, sha)
    if why:
        return why, None, None
    changes = []
    for f in files:
        name, status = (f or {}).get("filename"), (f or {}).get("status")
        if not isinstance(name, str):
            return "a changed file cannot be read", None, None
        if status == "added":
            changes.append(("A", name))
        elif status == "removed":
            changes.append(("D", name))
        elif status == "modified":
            changes.append(("M", name))
        elif status == "renamed" and isinstance(f.get("previous_filename"), str):
            changes += [("D", f["previous_filename"]), ("A", name)]
        else:
            return "%s is %s, not a change the delegation covers" % (name, status), None, None
    kinds, problems = classify(changes, ApiTree(api, repo, sha), ApiTree(api, repo, mb), ApiTree(api, repo, tip))
    if problems:
        return problems[0] + ("; and %d more" % (len(problems) - 1) if len(problems) > 1 else ""), None, None
    runs = get_pages(api, "repos/%s/commits/%s/check-runs" % (repo, sha), "check_runs")
    wruns = get_pages(api, "repos/%s/actions/runs?head_sha=%s" % (repo, sha), "workflow_runs")
    statuses = get_pages(api, "repos/%s/commits/%s/statuses" % (repo, sha))
    if runs is None or wruns is None or statuses is None:
        return "its check runs or statuses cannot be read whole", None, None
    ok, why = check_state(runs, wruns, statuses)
    if not ok:
        return why, None, None
    ledger = ApiTree(api, repo, tip)(g.LEDGER_REL)
    entries = g.parse_ledger(ledger[1])[1] if ledger is not None and ledger[1] is not None else []
    standing = [e for e in entries if e.id == grant.id]
    why = grant_form_problem(standing[0], entries) if standing else "it is not in the default branch's ledger"
    if why:
        return "the grant %s no longer stands: %s" % (grant.id, why), None, None
    payload = {"sha": sha, "merge_method": "merge", "commit_title": "%s (#%d)" % (title.strip(), n),
               "commit_message": merge_message(body, grant.id, sha)}
    return None, tip, (payload, "".join(kinds))


def run(api, root, repo, default=None, out=None):
    out = out or sys.stdout

    def say(text):
        print(text, file=out)
    if not default:
        state, data = api.get("repos/%s" % repo)
        default = data.get("default_branch") if state == "ok" and isinstance(data, dict) else None
        if not isinstance(default, str) or not default:
            say("NOTE: the default branch cannot be read; nothing is merged")
            return 0
    grant, reasons = find_grant(root, "HEAD")
    if grant is None:
        say("NOTE: no asks-merge grant stands in %s%s; nothing is merged (model S-033 AC4)"
            % (g.LEDGER_REL, " (%s)" % "; ".join(reasons) if reasons else ""))
        return 0
    say("NOTE: the asks-merge grant is %s" % grant.id)
    pulls = get_pages(api, "repos/%s/pulls?state=open&base=%s" % (repo, urllib.parse.quote(default, safe="")))
    if pulls is None:
        say("NOTE: the open pull requests cannot be read; nothing is merged")
        return 0
    first_base, merged = None, 0
    for pr in sorted((p for p in pulls if isinstance(p, dict) and isinstance(p.get("number"), int)),
                     key=lambda p: p["number"]):
        n = pr["number"]
        try:
            why, tip, plan = judge(api, repo, default, grant, pr)
        except Unreadable as exc:
            why, tip, plan = str(exc), None, None
        except Exception as exc:  # noqa: BLE001 - one pull request never stops the run, or its dispatch
            why, tip, plan = "it could not be judged (%s)" % type(exc).__name__, None, None
        if why:
            say("PR #%d: waits: %s" % (n, why))
            continue
        payload, kinds = plan
        try:
            state, res = api.put("repos/%s/pulls/%d/merge" % (repo, n), payload)
        except Exception as exc:  # noqa: BLE001 - as above
            state, res = "error", type(exc).__name__
        if state != "ok" or (isinstance(res, dict) and res.get("merged") is False):
            say("PR #%d: waits: GitHub refused the merge (%s)" % (n, res))
            continue
        merged += 1
        first_base = first_base or tip
        say("PR #%d: merged (kinds %s) at %s under %s" % (n, ", ".join(kinds), payload["sha"][:12], grant.id))
    if not merged:
        return 0
    if not api.dispatch_governance(default, first_base):
        say("ERROR: %d merge(s) made, but the governance run on %s could not be started" % (merged, default))
        return 1
    say("OK: %d merge(s); the governance run on %s starts from %s" % (merged, default, first_base))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(prog="asks_merge.py", description=__doc__.split("\n")[0], allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    p = sub.add_parser("run", allow_abbrev=False)
    p.add_argument("--root", default=".")
    p.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY", ""))
    p.add_argument("--default-branch", default="")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if args.cmd != "run":
        parser.print_usage(sys.stderr)
        return 2
    if not REPO_RE.fullmatch(args.repo or ""):
        print("ERROR: --repo (or GITHUB_REPOSITORY) %r is not owner/name" % args.repo, file=sys.stderr)
        return 2
    if args.default_branch and not g.git_ok(args.root, ["check-ref-format", "--branch", args.default_branch]):
        print("ERROR: --default-branch %r is not a branch name" % args.default_branch, file=sys.stderr)
        return 2
    try:
        return run(GhApi(), args.root, args.repo, args.default_branch or None)
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
