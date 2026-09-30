#!/usr/bin/env python3
"""record_checks — CI checks of the Orchestrator's records, and the merge gate's own checks (model S-013).

Usage:
  record_checks.py decisions --base REF [--root DIR]
  record_checks.py merges    --base REF [--root DIR] [--branch NAME]
  record_checks.py routing   [--root DIR]
  record_checks.py build-cap [--root DIR]
  record_checks.py grants    [--root DIR]
  record_checks.py gate      --item ID --default REF [--root DIR]

check_all.sh runs the first five in a v3 project (governance/v3.toml): `decisions` and `merges`
with a base, the other three always. Each reads only the tree and history at --root (the default
branch's checkout) and fails closed on a record it cannot parse, naming the file and line.

  decisions  (record-decisions; D-011, D-066) every decisions/<item>/<gate>-<card>.md added or
             changed in REF..HEAD (a merge counts only for what differs from all its parents) is
             authored by a person in the surface map's humans block, or by `chief-of-staff` with a
             second line `Proxy: done at the owner's request` and at least one more word; a proxy on
             a gate.word ROUTING.toml's [proxy] refused list names fails. Its first line is
             `Decision: <word>`. Other files under decisions/ are left to surface_guard. Known
             limit: a git author name can be forged by anyone holding a push credential; the proxy's
             words are checked for presence, not truth.
  merges     (record-merges; D-067) each commit on HEAD's first-parent line in REF..HEAD with an
             `Item:` trailer has two parents, its tree is the merge of them, its second parent is its
             `Item-Tip:` commit or a gate merge whose first parent is that commit, and, read from its
             own tree (risk-paths.toml from its first parent, the default branch's tip at the merge),
             the reviews the item's diff needs are present and bound to that tip (`requirements`).
             Every other first-parent commit by `orchestrator` touches only status/**,
             dispatch-log/**, queue/** and (builder's reading, model S-012 AC2) the research question copy
             research/Q-nnn.md. status/merges.jsonl is never trusted. Skipped on an item/ or build/
             branch (--branch), whose first-parent line is not the default branch's.
  routing    (record-routing; D-042) orchestrator.py verify-log passes, and each dispatch-log line
             with a `route` names a route of ROUTING.toml; a dispatch or check-run line's role is the
             role its route's action dispatches (`dispatch item-role`: the route's role), a card or
             done line's role is the route's role; its stage is the route's (`then_stage` when the
             route has one and dispatches); a `*` stage or `!x` or `*` role constrains nothing. The
             card-only ids attempts, usage-limit and dor-re-aim are accepted on card lines only.
  build-cap  (record-build-cap; D-030, D-051) prints the project items at stage 5 or 6 (in any
             state) and the research items neither done nor closed; fails only when ROUTING.toml
             [limits] build_cap is set and the project count is above it.
  grants     (record-grants; D-012, D-058) reports only: the grant format is not defined yet.
  gate       (the merge gate's step 4, on HEAD, the merged tree, for one item) gate-packs,
             gate-handback, gate-freeze; PACKS.toml is read from --default, the default tip.

Exit 0 = pass, 1 = a record check failed, 2 = usage or parse error.
"""

import argparse
import datetime
import hashlib
import json
import os
import re
import sys

try:
    import tomllib
except ImportError:  # Python < 3.11
    tomllib = None

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402
import orchestrator as orch  # noqa: E402

ORCH = g.ORCHESTRATOR
COS = "chief-of-staff"
DECISION_PATH_RE = re.compile(r"decisions/([PQE]-[0-9]+)/([a-z]+(?:-[a-z]+)*)-([0-9]+)\.md")
PROXY_RE = re.compile(r"Proxy: done at the owner's request[ \t]+\S")
ITEM_TIP_RE = re.compile(r"^Item-Tip: ([0-9a-f]{40})[ \t]*$", re.M)
SHA_RE = re.compile(r"[0-9a-f]{40}")
HASH_RE = re.compile(r"[0-9a-f]{64}")
ORCH_DEFAULT_PATHS = ("status/", "dispatch-log/", "queue/")
RESEARCH_QUESTION_RE = re.compile(r"research/Q-[0-9]+\.md")
CARD_ONLY_ROUTES = ("attempts", "usage-limit", "dor-re-aim")
OUTCOMES_REL = "status/outcomes.jsonl"
RISK_REL = "governance/risk-paths.toml"
PACKS_REL = "governance/PACKS.toml"
ROUTING_REL = "governance/ROUTING.toml"
KIND_OF_PREFIX = {"P": "project", "Q": "research", "E": "evidence"}


# --------------------------------------------------------------------------
# git and record readers


def git_lines(root, args):
    return [l for l in g.git(root, args).decode("utf-8", "surrogateescape").split("\n") if l]


def is_ancestor(root, a, b):
    return g.git_ok(root, ["merge-base", "--is-ancestor", a, b])


def changed_paths(root, sha, parents):
    """Paths a commit changes: against its parent (a root commit: all); a merge: only what differs from
    every parent (so a clean merge adds nothing of its own)."""
    if len(parents) >= 2:
        return g.split_z(g.git(root, ["diff-tree", "-r", "-c", "--name-only", "--no-commit-id", "-z", sha]))
    return g.commit_paths(root, sha)


def paths_vs_parents(root, sha):
    """For a merge, the union of its differences from each parent; else its own paths."""
    return g.split_z(g.git(root, ["diff-tree", "-r", "-m", "--name-only", "--no-commit-id", "--root", "-z", sha]))


def jsonl_at(root, rev, rel, findings, name):
    """[(line number, object)] of a JSON-lines record at `rev`; an unreadable line is a finding."""
    text = g.git_text(root, rev, rel)
    out = []
    if text is None:
        return out
    for n, line in enumerate(text.split("\n"), 1):
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
        except (ValueError, RecursionError):
            obj = None
        if not isinstance(obj, dict):
            findings.append((name, "%s line %d: not a JSON object; the record cannot be read" % (rel, n)))
            continue
        out.append((n, obj))
    return out


def toml_at(root, rev, rel):
    text = g.git_text(root, rev, rel)
    if text is None:
        return None
    try:
        return tomllib.loads(text)
    except tomllib.TOMLDecodeError as exc:
        raise g.UsageError("%s at %s: %s" % (rel, rev[:12], exc))


def surfaces_at(root, rev):
    data = g.git_blob(root, rev, g.SURFACES_REL)
    return g.parse_surfaces(g.check_text(data or b"", g.SURFACES_REL))


def find_control(root, commit, h):
    """(path, control object) of the control file whose sha256 is h under reviews/**/_control/ at commit."""
    if not isinstance(h, str) or not HASH_RE.fullmatch(h):
        return None, None
    names = g.split_z(g.git(root, ["ls-tree", "-r", "-z", "--name-only", commit, "--", "reviews"]))
    for rel in names:
        if not re.fullmatch(r"reviews/[^/]+/_control/[0-9]+-%s\.json" % h[:12], rel):
            continue
        data = g.git_blob(root, commit, rel)
        if data is not None and hashlib.sha256(data).hexdigest() == h:
            try:
                obj = json.loads(data.decode("utf-8"))
            except (UnicodeDecodeError, ValueError):
                return rel, None
            return rel, obj if isinstance(obj, dict) else None
    return None, None


def card_tip(text):
    """The `Item-Tip:` a launch card names, or None."""
    m = ITEM_TIP_RE.search(text or "")
    return m.group(1) if m else None


# --------------------------------------------------------------------------
# AC4: what an item's merge needs


class Requirements(object):
    def __init__(self, item, tip, default):
        self.item, self.tip, self.default = item, tip, default
        self.cls = None
        self.reviews = []
        self.paths = []
        self.r3_paths = []
        self.problems = []      # unmet: the item is not merged
        self.by_hand = []       # the gate cannot satisfy it: the owner merges by hand

    def ok(self):
        return not self.problems and not self.by_hand


def risk_of(root, default, paths):
    """(class, {reviewer: reasons}, R3 paths) of a change, under risk-paths.toml at `default`."""
    text = g.git_text(root, default, RISK_REL, newline="")
    if text is None:
        raise g.UsageError("%s is missing at the default tip %s" % (RISK_REL, default[:12]))
    s = surfaces_at(root, default)
    rp, problems = g.parse_risk_paths(text, s.reviewer_ids())
    if rp is None or problems:
        raise g.UsageError("%s at the default tip: %s" % (RISK_REL, "; ".join(problems)))
    cls, _, req, _ = rp.required(paths)
    return cls, req, sorted(p for p in paths if rp.path_class(p) == "R3")


def requirements(root, default, item, tip, records=None):
    """AC4 for `item` at `tip`: the merge-base diff default...tip classed by risk-paths.toml at `default`
    (the default branch's tip, never the item's copy), and the reviews that class needs, read from the
    records at `records` (default: `default`): status/outcomes.jsonl, the launch card and decision."""
    records = records or default
    r = Requirements(item, tip, default)
    kind = KIND_OF_PREFIX[item[0]]
    r.paths = sorted(set(g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z",
                                                "%s...%s" % (default, tip)]))))
    r.cls, req, r.r3_paths = risk_of(root, default, r.paths)
    r.reviews = sorted(req)
    github = [p for p in r.paths if p == ".github" or p.startswith(".github/")]
    if github:
        r.by_hand.append("it changes .github/** (%s), which the workflow's own token cannot push"
                         % ", ".join(github[:5]))
    domain = [rid for rid in r.reviews if rid not in ("reviewer", g.OWNER)]
    if domain:
        r.by_hand.append("its diff needs a domain review (%s), which the gate does not run" % ", ".join(domain))
    if kind != "project" and r.reviews:
        r.by_hand.append("a %s item whose diff (%s) needs a review (%s)" % (kind, r.cls, ", ".join(r.reviews)))
    if r.by_hand:
        return r
    if "reviewer" in req:
        reviewer_bound(root, r, records)
    if g.OWNER in req:
        owner_bound(root, r, records)
    return r


def reviewer_bound(root, r, records):
    findings = []
    lines = jsonl_at(root, records, OUTCOMES_REL, findings, "record-merges")
    r.problems += [m for _, m in findings]
    cand = [o for _, o in lines if o.get("item") == r.item and o.get("role") == "reviewer" and o.get("result") == "ok"]
    if not cand:
        r.problems.append("no reviewer outcome of %s with result ok in %s" % (r.item, OUTCOMES_REL))
        return
    last = cand[-1]
    who = "the latest reviewer outcome (session %s)" % last.get("session")
    if last.get("verdict") != "PASS":
        r.problems.append("%s has verdict %s; an earlier round's PASS does not count" % (who, last.get("verdict")))
        return
    rec, rsha = last.get("record"), last.get("record_sha")
    data = g.git_blob(root, r.tip, rec) if isinstance(rec, str) and rec else None
    if data is None or not isinstance(rsha, str) or hashlib.sha256(data).hexdigest() != rsha:
        r.problems.append("%s: its record %s at the tip does not hash to its record_sha" % (who, rec))
    rel, ctl = find_control(root, r.tip, last.get("control"))
    if ctl is None:
        r.problems.append("%s: no control file of hash %s on the item branch" % (who, str(last.get("control"))[:12]))
        return
    src = ctl.get("source_tip")
    if not isinstance(src, str) or not SHA_RE.fullmatch(src):
        r.problems.append("%s: its control file %s has no source_tip" % (who, rel))
        return
    if not g.git_ok(root, ["cat-file", "-e", "%s^{commit}" % src]) or not is_ancestor(root, src, r.tip):
        r.problems.append("%s: its source_tip %s is not an ancestor of the tip" % (who, src[:12]))
        return
    for c in git_lines(root, ["rev-list", "%s..%s" % (src, r.tip)]):
        bad = [p for p in paths_vs_parents(root, c) if not p.startswith(("reviews/", "status/"))]
        if bad:
            r.problems.append("commit %s after the reviewed tip %s changes %s (outside reviews/** and status/**)"
                              % (c[:12], src[:12], ", ".join(sorted(set(bad))[:5])))


def owner_bound(root, r, records):
    if r.item[0] != "P":
        r.by_hand.append("an R3 change of a non-project item needs the owner by hand")
        return
    st = toml_at(root, records, "status/%s.toml" % r.item) or {}
    n = st.get("card")
    if not isinstance(n, int) or isinstance(n, bool):
        r.problems.append("status/%s.toml holds no card number, so no launch decision can be found" % r.item)
        return
    rec = "decisions/%s/launch-%d.md" % (r.item, n)
    card = "queue/%s-launch-%d.md" % (r.item, n)
    text = g.git_text(root, records, rec)
    if text is None or text.split("\n", 1)[0].rstrip("\r").rstrip() != "Decision: approve":
        r.problems.append("%s does not start `Decision: approve` (the owner's approval of the R3 change)" % rec)
        return
    authors = git_lines(root, ["log", "-1", "--format=%ae", records, "--", rec])
    humans = surfaces_at(root, r.default).human_emails()
    if not authors or authors[0].lower() not in humans or authors[0].lower().endswith("@" + g.AGENT_DOMAIN):
        r.problems.append("%s was not written by a person in the humans block" % rec)
    tip = card_tip(g.git_text(root, records, card))
    if tip is None:
        r.problems.append("%s names no Item-Tip: (a launch card without a tip cannot be approved)" % card)
    elif tip != r.tip:
        r.problems.append("%s (answered by %s) names Item-Tip %s, not the tip %s" % (card, rec, tip[:12],
                                                                                    r.tip[:12]))


# --------------------------------------------------------------------------
# AC5 step 4: the gate's checks on the merged tree


def pack_problems(packs, ctl):
    """Manifest paths the control file's role may not read under PACKS.toml (`packs`: its [roles])."""
    import session_runner as sr
    return sr.manifest_problems(packs, ctl)


def spec_freeze_time(root, commit, spec, cache):
    """The committer time (epoch seconds) of the first commit in `commit`'s history that set `spec`'s
    status to frozen, or None."""
    if spec in cache:
        return cache[spec]
    found = None
    for c in git_lines(root, ["rev-list", "--reverse", "--topo-order", commit, "--", "specs/"]):
        names = [n for n in g.spec_files_at(root, c) if g.spec_id(n) == spec]
        frozen = False
        for n in names:
            text = g.git_text(root, c, "specs/%s" % n, newline="")
            if text is not None and g.spec_status(text)[0] == "frozen":
                frozen = True
        if not frozen:
            continue
        parents = git_lines(root, ["rev-list", "--parents", "-n", "1", c])[0].split()[1:]
        was = False
        for p in parents:
            for n in [x for x in g.spec_files_at(root, p) if g.spec_id(x) == spec]:
                text = g.git_text(root, p, "specs/%s" % n, newline="")
                if text is not None and g.spec_status(text)[0] in ("frozen", "superseded"):
                    was = True
        if not was:
            found = int(git_lines(root, ["log", "-1", "--format=%ct", c])[0])
            break
    cache[spec] = found
    return found


def dispatch_lines(root, commit, findings, name):
    out = []
    for rel in sorted(g.split_z(g.git(root, ["ls-tree", "-z", "--name-only", commit, "--", "dispatch-log/"]))):
        if re.fullmatch(r"dispatch-log/[0-9]{4}-[0-9]{2}\.jsonl", rel):
            out += [(rel, n, o) for n, o in jsonl_at(root, commit, rel, findings, name)]
    return out


def gate_checks(root, merged, default, item):
    """([(check name, finding)], [note]) of gate-packs, gate-handback and gate-freeze for one item."""
    findings, notes = [], []
    lines = [o for _, o in jsonl_at(root, merged, OUTCOMES_REL, findings, "gate-packs") if o.get("item") == item]
    packs = toml_at(root, default, PACKS_REL) or {}
    roles = packs.get("roles", {}) if isinstance(packs.get("roles"), dict) else {}
    controls = {}
    older = 0
    for o in lines:
        h = o.get("control")
        if not isinstance(h, str):
            continue
        rel, ctl = find_control(root, merged, h)
        controls[h] = ctl
        if ctl is None:
            if "record_sha" in o:
                findings.append(("gate-packs", "session %s (%s): no control file of hash %s on the item branch"
                                 % (o.get("session"), o.get("role"), h[:12])))
            else:
                older += 1
            continue
        if "source_tip" not in ctl:
            older += 1
            continue
        if ctl.get("role") == "checks" or not isinstance(ctl.get("manifest"), dict):
            continue
        for p in pack_problems(roles, ctl):
            findings.append(("gate-packs", "session %s (%s): %s" % (o.get("session"), ctl.get("role"), p)))
    if older:
        notes.append("NOTE: gate-packs: %d outcome line(s) of %s predate model S-013 (no source_tip); reported, "
                     "not checked" % (older, item))
    # gate-handback (D-006): a passing check run after each build, before any review.
    st = toml_at(root, merged, "status/%s.toml" % item) or {}
    checked = 0
    for i, o in enumerate(lines):
        if o.get("role") != "builder" or o.get("result") != "ok":
            continue
        ctl = controls.get(o.get("control"))
        if isinstance(ctl, dict) and (ctl.get("entry") or {}).get("stage") == 6:
            continue        # builder's reading: the launch work at stage 6 goes to review, not a check run
        checked += 1
        ok = False
        for later in lines[i + 1:]:
            if later.get("role") == "reviewer":
                break
            if later.get("role") == "checks" and later.get("result") == "ok" and later.get("verdict") == "PASS":
                ok = True
                break
        if not ok:
            findings.append(("gate-handback", "builder session %s: no check run with verdict PASS after it and "
                                              "before any review (D-006)" % o.get("session")))
    if checked:
        spec = st.get("spec")
        if not isinstance(spec, str) or g.git_blob(root, merged, "reviews/%s/checks.txt" % spec) is None:
            findings.append(("gate-handback", "reviews/%s/checks.txt is missing" % spec))
    # gate-freeze (D-046): no build or launch dispatch before its spec froze.
    cache = {}
    for rel, n, o in dispatch_lines(root, merged, findings, "gate-freeze"):
        if o.get("item") != item or o.get("action") not in ("dispatch", "run-checks") or o.get("stage") not in (5, 6):
            continue
        spec = o.get("spec")
        when = spec_freeze_time(root, merged, spec, cache) if isinstance(spec, str) else None
        try:
            t = orch.parse_time(o.get("time")).timestamp()
        except ValueError:
            findings.append(("gate-freeze", "%s line %d: its time %r cannot be read" % (rel, n, o.get("time"))))
            continue
        if when is None:
            findings.append(("gate-freeze", "%s line %d: a stage-%s dispatch of %s, whose spec %s has no freezing "
                                            "commit on the item branch" % (rel, n, o.get("stage"), item, spec)))
        elif t < when:
            findings.append(("gate-freeze", "%s line %d: a stage-%s dispatch at %s, before %s froze (%s)"
                             % (rel, n, o.get("stage"), o.get("time"), spec,
                                datetime.datetime.fromtimestamp(when, datetime.timezone.utc).isoformat())))
    return findings, notes


# --------------------------------------------------------------------------
# AC1: the checks on the default branch


def check_decisions(root, base):
    g.verify_commit(root, base)
    routing = toml_at(root, "HEAD", ROUTING_REL) or {}
    refused = set(routing.get("proxy", {}).get("refused", []) or [])
    humans = g.load_surfaces(root).human_emails()
    findings, notes, seen = [], [], 0
    for c in g.read_commits(root, g.rev_list(root, ["--reverse", "%s..HEAD" % base])):
        for path in changed_paths(root, c.sha, c.parents):
            m = DECISION_PATH_RE.fullmatch(path)
            if not m or path.endswith("-notes.md") or m.group(2) not in orch.GATES:
                continue
            text = g.git_text(root, c.sha, path)
            if text is None:
                continue            # deleted
            seen += 1
            gate = m.group(2)
            lines = text.split("\n")
            dm = orch.DECISION_RE.match(lines[0].rstrip("\r"))
            if not dm:
                findings.append(("record-decisions", "%s line 1 (commit %s): not `Decision: <word>`; the record "
                                                     "cannot be read" % (path, c.short)))
                continue
            word = dm.group(1)
            agent = c.agent_id()
            if agent is None and c.author_email.lower() in humans:
                continue
            if agent != COS:
                findings.append(("record-decisions", "%s (commit %s): written by %s <%s>, neither a person in the "
                                                     "humans block nor chief-of-staff (D-011)"
                                 % (path, c.short, c.author_name, c.author_email)))
                continue
            second = lines[1].rstrip("\r") if len(lines) > 1 else ""
            if not PROXY_RE.match(second):
                findings.append(("record-decisions", "%s line 2 (commit %s): chief-of-staff's answer needs "
                                                     "`Proxy: done at the owner's request` and at least one word "
                                                     "more (D-066)" % (path, c.short)))
            elif "%s.%s" % (gate, word) in refused:
                findings.append(("record-decisions", "%s (commit %s): a proxy is refused on %s.%s (ROUTING.toml "
                                                     "[proxy] refused, D-066)" % (path, c.short, gate, word)))
    notes.append("NOTE: %d owner answer version(s) in %s..HEAD checked" % (seen, base))
    return findings, notes


def orch_path_ok(path):
    return path.startswith(ORCH_DEFAULT_PATHS) or bool(RESEARCH_QUESTION_RE.fullmatch(path))


def check_merges(root, base, branch=None):
    g.verify_commit(root, base)
    if branch and branch.startswith(("item/", "build/")):
        return [], ["NOTE: %s is not the default branch; record-merges judges only the default branch's "
                    "first-parent line" % branch]
    findings, notes = [], []
    merges = 0
    commits = g.read_commits(root, g.rev_list(root, ["--first-parent", "--reverse", "%s..HEAD" % base]))
    for c in commits:
        items = c.trailer("Item")
        if items:
            merges += 1
            findings += [("record-merges", "commit %s: %s" % (c.short, m)) for m in merge_problems(root, c, items)]
            continue
        if c.agent_id() != ORCH:
            continue
        if len(c.parents) >= 2:
            paths = g.split_z(g.git(root, ["diff", "--name-only", "--no-renames", "-z", c.parents[0], c.sha]))
        else:
            paths = g.commit_paths(root, c.sha)
        bad = sorted(p for p in paths if not orch_path_ok(p))
        if bad:
            findings.append(("record-merges", "commit %s by orchestrator (no Item: trailer) changes %s, outside "
                                              "status/**, dispatch-log/** and queue/**"
                             % (c.short, ", ".join(bad[:8]))))
    notes.append("NOTE: %d first-parent commit(s) in %s..HEAD, %d item merge(s)" % (len(commits), base, merges))
    return findings, notes


def merge_problems(root, c, items):
    out = []
    if len(items) != 1 or not orch.ITEM_RE.match(items[0]):
        return ["its Item: trailer %r does not name one item" % (items,)]
    item = items[0]
    if len(c.parents) != 2:
        return ["it merges %s but has %d parent(s); an item merge has two parents" % (item, len(c.parents))]
    tips = c.trailer("Item-Tip")
    if len(tips) != 1 or not SHA_RE.fullmatch(tips[0]):
        return ["its Item-Tip: trailer %r does not name one commit" % (tips,)]
    tip = tips[0]
    first, second = c.parents
    if second != tip:
        sc = g.read_commits(root, [second])[0] if g.git_ok(root, ["cat-file", "-e", "%s^{commit}" % second]) else None
        if sc is None or not sc.parents or sc.parents[0] != tip:
            return ["its second parent %s is neither its Item-Tip %s nor a gate merge whose first parent is it"
                    % (second[:12], tip[:12])]
    proc_tree = g.git(root, ["merge-tree", "--write-tree", "--no-messages", first, second]).decode().split("\n")[0]
    own = g.git(root, ["rev-parse", "%s^{tree}" % c.sha]).decode().strip()
    if proc_tree.strip() != own:
        out.append("its tree is not the merge of its two parents")
    req = requirements(root, first, item, tip, records=c.sha)
    out += ["%s: %s" % (item, p) for p in req.problems + req.by_hand]
    return out


def check_routing(root):
    import contextlib
    import io
    findings, notes = [], []
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        rc = orch.verify_log(root)
    for line in buf.getvalue().split("\n"):
        if line.startswith("FAIL: "):
            findings.append(("record-routing", line[len("FAIL: "):]))
    if rc != 0 and not findings:
        findings.append(("record-routing", "orchestrator.py verify-log failed"))
    path = os.path.join(root, *ROUTING_REL.split("/"))
    try:
        routing = orch.load_routing(path)
    except orch.UsageError as exc:
        raise g.UsageError(str(exc))
    routes = dict((r["id"], r) for r in routing.routes)
    d = os.path.join(root, "dispatch-log")
    n_lines = 0
    for name in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not orch.MONTH_FILE_RE.match(name):
            continue
        rel = "dispatch-log/%s" % name
        with open(os.path.join(d, name), encoding="utf-8", newline="") as fh:
            text = fh.read()
        for i, line in enumerate(text.split("\n"), 1):
            if not line:
                continue
            try:
                obj = json.loads(line)
            except ValueError:
                continue            # verify-log names it
            if not isinstance(obj, dict) or "route" not in obj:
                continue
            n_lines += 1
            why = route_problem(routes, obj)
            if why:
                findings.append(("record-routing", "%s line %d: %s" % (rel, i, why)))
    notes.append("NOTE: %d routed line(s) checked against %s" % (n_lines, ROUTING_REL))
    return findings, notes


def route_problem(routes, obj):
    rid, action = obj.get("route"), obj.get("action")
    if rid in CARD_ONLY_ROUTES:
        return None if action == "card" else "route %s appears only on cards, but this line's action is %r" % (
            rid, action)
    r = routes.get(rid)
    if r is None:
        return "route %r is not in %s" % (rid, ROUTING_REL)
    ract = r["action"]
    dispatches = ract == "run-checks" or ract.startswith("dispatch ")
    if action in ("dispatch", "run-checks"):
        if not dispatches:
            return "a %s line on route %s, whose action is %r" % (action, rid, ract)
        if ract == "run-checks":
            want = "checks"
        elif ract == "dispatch item-role":
            want = r["role"]
        else:
            want = ract[len("dispatch "):]
    else:
        want = r["role"]
    if want != "*" and not want.startswith("!") and obj.get("role") != want:
        return "role %r, but route %s gives %r" % (obj.get("role"), rid, want)
    stage = r.get("then_stage", r["stage"]) if dispatches else r["stage"]
    if stage != "*" and obj.get("stage") != stage:
        return "stage %r, but route %s gives %r" % (obj.get("stage"), rid, stage)
    return None


def check_build_cap(root):
    findings, notes = [], []
    d = os.path.join(root, "status")
    projects = research = 0
    for name in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not re.fullmatch(r"[PQE]-[0-9]+\.toml", name):
            continue
        rel = "status/%s" % name
        try:
            with open(os.path.join(d, name), "rb") as fh:
                st = tomllib.load(fh)
        except (OSError, tomllib.TOMLDecodeError) as exc:
            findings.append(("record-build-cap", "%s: the record cannot be read (%s)" % (rel, exc)))
            continue
        active = st.get("state") not in ("done", "closed")
        if st.get("kind") == "project" and st.get("stage") in (5, 6):      # AC1.4: whatever its state
            projects += 1
        if st.get("kind") == "research" and active:
            research += 1
    routing = {}
    path = os.path.join(root, *ROUTING_REL.split("/"))
    if os.path.isfile(path):
        try:
            with open(path, "rb") as fh:
                routing = tomllib.load(fh)
        except (OSError, tomllib.TOMLDecodeError) as exc:
            raise g.UsageError("%s: %s" % (ROUTING_REL, exc))
    cap = (routing.get("limits") or {}).get("build_cap")
    print("project items at stage 5 or 6: %d" % projects)
    print("research items neither done nor closed: %d" % research)
    if cap is None:
        print("build cap: not set (the owner's to define; reported only)")
    elif not isinstance(cap, int) or isinstance(cap, bool) or cap < 0:
        raise g.UsageError("%s [limits] build_cap %r is not a whole number" % (ROUTING_REL, cap))
    else:
        print("build cap: %d" % cap)
        if projects > cap:
            findings.append(("record-build-cap", "%d project items at stage 5 or 6, above the build cap of %d"
                             % (projects, cap)))
    return findings, notes


def check_grants(root):
    print("grants not checked: the format is not defined")
    return [], []


def main(argv=None):
    parser = argparse.ArgumentParser(prog="record_checks.py", description=__doc__.split("\n")[0], allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    for name in ("decisions", "merges"):
        p = sub.add_parser(name, allow_abbrev=False)
        p.add_argument("--base", required=True)
        p.add_argument("--root", default=".")
        if name == "merges":
            p.add_argument("--branch")
    for name in ("routing", "build-cap", "grants"):
        sub.add_parser(name, allow_abbrev=False).add_argument("--root", default=".")
    p = sub.add_parser("gate", allow_abbrev=False)
    p.add_argument("--item", required=True)
    p.add_argument("--default", required=True)
    p.add_argument("--root", default=".")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    if tomllib is None:
        print("ERROR: record_checks.py needs Python 3.11+ (tomllib)", file=sys.stderr)
        return 2
    root = args.root
    try:
        if not os.path.isdir(root):
            raise g.UsageError("root directory %r does not exist" % root)
        if args.cmd == "decisions":
            f, n = check_decisions(root, args.base)
            ok = "every owner answer in the range is a person's or a proxy with its words"
        elif args.cmd == "merges":
            f, n = check_merges(root, args.base, args.branch)
            ok = "every merge and Orchestrator commit on the first-parent line holds"
        elif args.cmd == "routing":
            f, n = check_routing(root)
            ok = "the dispatch log's chain and routes hold"
        elif args.cmd == "build-cap":
            f, n = check_build_cap(root)
            ok = "within the build cap (or none set)"
        elif args.cmd == "grants":
            f, n = check_grants(root)
            ok = "grants reported"
        else:
            if not orch.ITEM_RE.match(args.item):
                raise g.UsageError("--item %r is not an item id" % args.item)
            g.verify_commit(root, args.default, "--default")
            f, n = gate_checks(root, "HEAD", args.default, args.item)
            ok = "gate-packs, gate-handback and gate-freeze hold for %s" % args.item
        return g.report(root, f, n, ok)
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
