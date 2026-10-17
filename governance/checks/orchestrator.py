#!/usr/bin/env python3
"""orchestrator — the Orchestrator's decision rules (model S-012).

Usage:
  orchestrator.py step --root DIR --now RFC3339 --spec-dir DIR [--outcomes FILE] [--routing PATH]
                       [--item-tips FILE] [--hold]
  orchestrator.py verify-log [--root DIR]

A pure decision engine. It runs no sessions, touches no git branch and reads no
work product's content (AC10: it parses only status files, request files,
ROUTING.toml, the dispatch log, the outcomes file, status/processed.json, the
one decision record an item waits on (whole, up to 64 KiB; model S-024 AC4), and a
spec's header up to its `status:` line; it may list file names and test paths). Two
reads more (model S-023, model S-024): a later-work request's `ruling` record, only for
its first line, when the request is filed; and the Build gate's case, only for a
`criteria` record holding `Nothing needed:`, only to find its `## Nothing needed in Build`
line. Whether a phase gate's case exists is a path test.

  step        For each work item, works out the one next action (AC3, AC11):
              1. requests: intake/requests/<item>.toml -> status/<item>.toml at the
                 kind's start (AC2); research copies its question to research/<item>.md.
              2. outcomes: --outcomes FILE, one JSON object per line
                 {item, session, role, record, result, verdict} (AC8), then the stall
                 rule (dispatched longer than the role's limit + the grace = timeout).
              3. decisions: decisions/<item>/<gate>-<card>.md for the card the item
                 waits on (AC5): `Decision: <word>`, optional `Proxy: done at the
                 owner's request ...`.
              4. routing: the first route of governance/ROUTING.toml (or --routing)
                 matching stage, state, role, verdict and round; every dispatch passes
                 the freeze pre-check (stages 4-6) and then the budget check.
              Writes the changed status files, card stubs queue/<item>-<gate>-<card>.md,
              dispatch-log/<yyyy-mm>.jsonl lines, status/plan.json (this run's planned
              sessions and check runs; emptied when nothing is planned, so nothing is
              carried out twice) and status/processed.json (inputs already applied and
              anomalies already logged, so a second run on unchanged inputs adds no
              status, card, plan entry or log line).
  --item-tips (model S-013 AC4) a JSON object {item: {"tip": sha, "fresh": bool}} (the decide job's:
              each launch-waiting item's branch tip, and whether its decision record was committed
              after the card's last change). With it, an answer to a launch card is applied only when
              the card's `Item-Tip:` line names that tip and the answer is fresh; otherwise the answer
              is refused with a fresh launch card (route `launch-pass`, or `gate-view` for an item whose
              card the gate Critic's view raised, model S-024), and `approve` or `proceed` on a card with
              no `Item-Tip:` is refused (the card stays open). The commit job stamps the tip.
  --hold      (model S-013 AC6) CI is not green on the default tip: requests, outcomes and the owner's
              decisions are applied and cards raised, but no session or check run is dispatched
              (an item a route would dispatch keeps its status) and the plan is empty.
  verify-log  (AC12) checks the hash chain of dispatch-log/*.jsonl within and across
              months (each line's `prev` is the sha256 of the line before; a month's
              first line carries the previous month's last line's hash; the very first
              carries 64 zeros), each line's month, and that the last line matches the
              `log_head` step recorded in status/processed.json. Detects an edited,
              deleted or reordered line and a missing month.

Status file values (AC1): `card` is the item's card counter (the last card's
number; the next card is card + 1), kept after the card is answered; `gate`
is set only while the item waits on the owner; `resume` is "<stage>/<role>".
Cards raised outside the table's routes log the route id `attempts` or
`usage-limit` (AC8) or `dor-re-aim` (AC5 `re-aim` at the dor gate). A refused
request, outcome or decision record is logged once: a refused request is
recorded as processed and never looked at again (a new request needs a new
id); a changed decision record is read again; an outcome's session id is final
once seen. A record for a card other than the
one the item waits on is never read and never applied (logged once, by name).
research/<item>.md is written only when it does not exist.
Exit 0 = done (anomalies are logged, not fatal), 1 = verify-log found a break,
2 = usage or parse error.
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

ROUTING_REL = "governance/ROUTING.toml"
STATUS_DIR = "status"
PLAN_REL = "status/plan.json"
PROCESSED_REL = "status/processed.json"
REQUESTS_DIR = "intake/requests"
QUEUE_DIR = "queue"
DECISIONS_DIR = "decisions"
LOG_DIR = "dispatch-log"
RESEARCH_DIR = "research"
SPECS_DIR = "specs"               # the project's specs folder, which --spec-dir mirrors (model S-033 AC5)
GENESIS = "0" * 64

KINDS = ("project", "research", "evidence")
KIND_OF_PREFIX = {"P": "project", "Q": "research", "E": "evidence"}
STAGES = (2, 3, 4, 5, 6)
STATES = ("ready", "dispatched", "returned", "waiting-owner", "done", "closed")
ROLES = ("critic", "researcher", "source-checker", "definer", "definer-freeze", "check-author", "builder",
         "reviewer", "checks", "critic-triage", "critic-gate", "user-rep")
VERDICTS = ("PASS", "FAIL", "malformed", "none")
GATES = ("dor", "dor-fail", "criteria", "launch", "stop", "failure")
# model S-024: the three phase gates, the phase each case is named for, and where recycle may go.
GATE_PHASE = {"dor": "design", "criteria": "build", "launch": "launch"}
GATE_PASS = {"dor": "dor-pass", "criteria": "plan-pass", "launch": "launch-pass"}
GATE_TITLE = {"dor": "The Design gate", "criteria": "The Build gate", "launch": "The Launch gate"}
RECYCLE_INTO = {"dor": ("Discovery",), "criteria": ("Discovery", "Design"),
                "launch": ("Discovery", "Design", "Build", "Launch")}
RECOMMENDATION_RE = re.compile(r"^\*\*The Critic's recommendation:\*\* (proceed|hold|recycle into "
                               r"(Discovery|Design|Build|Launch)|kill)\b")
GATE_WORDS = ("proceed", "hold", "recycle", "kill")
# model S-025: the user representative, at every phase gate of a project with a target-user profile.
PROFILE_REL = "docs/users/PROFILE.md"
USER_VERDICT_RE = re.compile(r"^\*\*The user representative's verdict:\*\* (approve|reject) — \S.*$")
GATE_ROLES = ("critic-gate", "user-rep")
# model S-025: the words that move an item forward over the representative's reject need `User-Override:`.
FORWARD_WORDS = {"dor": ("proceed", "build"), "criteria": ("proceed", "approve"), "launch": ("proceed", "approve")}
RESULTS = ("ok", "error", "timeout", "usage-limit")
CHECKERS = ("critic", "source-checker", "reviewer", "checks")   # verdict PASS or FAIL
BUDGET_EXEMPT = ("checks", "critic-triage", "critic-gate", "user-rep")
FROZEN_STAGES = (4, 5, 6)
# AC5 confirm: the stage's checker (research: the Source checker).
CONFIRM_CHECKER = {2: "critic", 3: "critic", 4: "critic", 5: "checks", 6: "reviewer"}
RESPECIFY_WORDS = ("re-specify", "criteria-wrong", "checks-wrong")
# model S-023 AC2: the six phases over the stages, one map in one place; the desk runs the first four.
PHASES = ("Discovery", "Design", "Build", "Launch", "Operate", "Review")
DESK_PHASES = PHASES[:4]
GRADUATED = "Graduated"
PHASE_OF_STAGE = {1: "Discovery", 2: "Discovery", 3: "Design", 4: "Build", 5: "Build", 6: "Launch", 7: "Operate",
                  8: "Review"}
# model S-023 AC6: the applied gate words that send the work back through a gate it did not pass.
BOUNDARY_WORDS = {"dor": ("recycle", "re-aim"), "criteria": ("recycle", "revise"), "launch": ("recycle", "revise")}
# model S-023 AC4: a research request's milestone tag; AC12: a later-work request's ruling record.
MILESTONE_TAG_RE = re.compile(r"^(?:M[0-9A-Z]{1,7}|(?:Discovery|Design|Build|Launch)-[1-9])$")
# model S-033 AC5: a spec header's `milestones:` line, as v3_checks.SPEC_MILESTONES_RE reads it.
CARD_MILESTONES_RE = re.compile(r"^milestones: (M[0-9A-Z]{1,7}(?:, M[0-9A-Z]{1,7})*)$")
RULING_PATH_RE = re.compile(r"^decisions/questions/[A-Za-z0-9][A-Za-z0-9.-]*\.md$")
ENTERS = {"Build": (4, "definer-freeze"), "Design": (3, "definer")}

ITEM_RE = re.compile(r"^[PQE]-\d{3,}$")
SPEC_ID_RE = re.compile(r"^S-(\d{3,})$")
SPEC_NAME_RE = re.compile(r"^(S-\d{3,})(?=-|\.md$)")
RESUME_RE = re.compile(r"^(\d+)/([a-z-]+)$")
RECORD_NAME_RE = re.compile(r"^([a-z]+(?:-[a-z]+)*)-(\d+)\.md$")
DECISION_RE = re.compile(r"^Decision: ([A-Za-z-]+)[ \t]*$")
PROXY_PREFIX = "Proxy: done at the owner's request"
MONTH_FILE_RE = re.compile(r"^(\d{4}-\d{2})\.jsonl$")
ROUND_RE = re.compile(r"^(\*|>=\d+|<\d+)$")

FIELD_ORDER = ("kind", "stage", "state", "role", "last_verdict", "plan_round", "build_round", "confirm_used",
               "attempts", "sessions", "dispatched_at", "usage_limit_since", "gate", "card", "next_gate", "gate_n",
               "gate_recommendation", "user_verdict", "resume", "spec",
               "superseded", "project", "milestone", "outcome")
REQUIRED = FIELD_ORDER[:10]


class UsageError(Exception):
    pass


# --------------------------------------------------------------------------
# Time


def parse_time(text):
    """An RFC 3339 time with a zone, as an aware UTC datetime; ValueError otherwise."""
    if not isinstance(text, str) or not re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}", text):
        raise ValueError("not an RFC 3339 time: %r" % (text,))
    dt = datetime.datetime.fromisoformat(text.replace("z", "Z"))
    if dt.tzinfo is None:
        raise ValueError("an RFC 3339 time needs a zone: %r" % (text,))
    return dt.astimezone(datetime.timezone.utc)


def fmt_time(dt):
    return dt.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# --------------------------------------------------------------------------
# The routing table (ROUTING.toml)


class Routing:
    def __init__(self, data, where):
        self.where = where
        limits = data.get("limits", {})
        try:
            self.budget = int(limits.get("budget_per_stage", 12))
            self.grace_minutes = int(limits.get("stall_grace_minutes", 15))
            self.usage_limit_hours = int(limits.get("usage_limit_hours", 24))
            self.time_limits = {k: int(v) for k, v in data.get("time_limits", {}).items()}
        except (TypeError, ValueError):
            raise UsageError("%s: [limits] and [time_limits] hold whole numbers" % where)
        self.routes = [self._route(r, i) for i, r in enumerate(data.get("route", []), 1)]
        if not self.routes:
            raise UsageError("%s: no [[route]] entries" % where)
        self.gates = data.get("gates", {})
        if not isinstance(self.gates, dict) or sorted(self.gates) != sorted(GATES):
            raise UsageError("%s: [gates] must hold exactly %s" % (where, ", ".join(GATES)))
        self.proxy_refused = list(data.get("proxy", {}).get("refused", []))
        self.strikes = dict(self.gates["stop"].get("strikes", {}))

    def _route(self, r, n):
        bad = "%s: route %d: " % (self.where, n)
        for key in ("id", "stage", "state", "role", "verdict", "round", "action"):
            if key not in r:
                raise UsageError(bad + "no `%s`" % key)
        if r["stage"] != "*" and r["stage"] not in STAGES:
            raise UsageError(bad + "stage %r" % (r["stage"],))
        states = r["state"] if isinstance(r["state"], list) else [r["state"]]
        if any(s != "*" and s not in STATES for s in states):
            raise UsageError(bad + "state %r" % (r["state"],))
        role = r["role"][1:] if r["role"].startswith("!") else r["role"]
        if role != "*" and role not in ROLES:
            raise UsageError(bad + "role %r" % (r["role"],))
        if r["verdict"] != "*" and r["verdict"] not in VERDICTS:
            raise UsageError(bad + "verdict %r" % (r["verdict"],))
        if not isinstance(r["round"], str) or not ROUND_RE.match(r["round"]):
            raise UsageError(bad + "round %r" % (r["round"],))
        act = r["action"]
        ok = act in ("none", "done", "run-checks", "dispatch item-role", "card next-gate", "pass") \
            or (act.startswith("gate ") and act[5:] in GATE_PHASE) \
            or (act.startswith("card ") and act[5:] in GATES) \
            or (act.startswith("dispatch ") and act[9:] in ROLES)
        if not ok:
            raise UsageError(bad + "action %r" % (act,))
        if act == "pass" and ("then_stage" not in r or r.get("then_role") not in ROLES):
            raise UsageError(bad + "a pass route needs then_stage and then_role")
        if "then_role" in r and act != "pass":
            raise UsageError(bad + "then_role is only for a pass route")
        if r.get("condition") not in (None, "frozen", "not-frozen", "case-written", "no-case",
                                      "frozen-nothing-needed", "user-step", "no-user-step"):
            raise UsageError(bad + "condition %r" % (r["condition"],))
        if "then_stage" in r and r["then_stage"] not in STAGES:
            raise UsageError(bad + "then_stage %r" % (r["then_stage"],))
        res = r.get("resume")
        if res is not None and res != "this" and not _valid_resume(res):
            raise UsageError(bad + "resume %r" % (res,))
        return dict(r)

    def time_limit(self, role):
        return self.time_limits.get(role, self.time_limits.get("default", 30))


def load_routing(path):
    try:
        with open(path, "rb") as fh:
            data = tomllib.load(fh)
    except OSError as exc:
        raise UsageError("cannot read the routing table %s: %s" % (path, exc))
    except tomllib.TOMLDecodeError as exc:
        raise UsageError("%s: %s" % (path, exc))
    return Routing(data, path)


def round_key(stage):
    return "build_round" if stage in (5, 6) else "plan_round"


def round_of(st):
    return st[round_key(st["stage"])]


def _round_ok(cond, rnd):
    if cond == "*":
        return True
    if cond.startswith(">="):
        return rnd >= int(cond[2:])
    return rnd < int(cond[1:])


def is_applied_decision(line):
    """An applied decision line: `word`, no `route`, a result that is not a refusal (model S-012 AC12)."""
    return isinstance(line, dict) and "word" in line and "route" not in line \
        and not str(line.get("result", "")).startswith("refused")


def is_graduation(line):
    """model S-023 AC2: the applied answer at the one Launch gate that sets the project done."""
    return is_applied_decision(line) and line.get("gate") == "launch" and line.get("word") in ("approve", "proceed") \
        and str(line.get("result", "")).startswith("done/")


def is_boundary(line):
    """model S-023 AC6: an applied decision line whose word sends the work back through a gate it did not pass."""
    return is_applied_decision(line) and line.get("word") in BOUNDARY_WORDS.get(line.get("gate"), ())


def phase_of_item(st, lines):
    """model S-023 AC2: a project item's phase, Graduated once its log holds a graduation line; None for
    research and evidence items, which have no phase of their own."""
    if st.get("kind") != "project":
        return None
    if any(is_graduation(l) for l in lines):
        return GRADUATED
    return PHASE_OF_STAGE[st["stage"]]


def iterations(lines):
    """model S-023 AC6: [(line, phase, iteration)] for each routed line (a `route` and a `stage`) of one item's
    lines in log order. Counts start at 0 per phase; a routed line whose phase is not among the phases reached
    since the last boundary line opens its phase's next iteration; a boundary line empties that set."""
    counts, reached, out = {}, set(), []
    for l in lines:
        if not isinstance(l, dict):
            continue
        if is_boundary(l):
            reached = set()
            continue
        if "route" not in l or l.get("stage") not in PHASE_OF_STAGE:
            continue
        phase = PHASE_OF_STAGE[l["stage"]]
        if phase not in reached:
            counts[phase] = counts.get(phase, 0) + 1
            reached.add(phase)
        out.append((l, phase, counts[phase]))
    return out


def nothing_needed_ruled(lines):
    """model S-024 AC5: the item's latest applied criteria decision line holds nothing_needed = Build."""
    for l in reversed(list(lines)):
        if isinstance(l, dict) and "word" in l and "route" not in l and l.get("gate") == "criteria" \
                and not str(l.get("result", "")).startswith("refused"):
            return l.get("nothing_needed") == "Build"
    return False


def checks_locked_since_ruling(lines):
    """model S-024 AC4: a `checks-pass` line after the item's latest applied criteria decision line."""
    seen = False
    for l in lines:
        if not isinstance(l, dict):
            continue
        if "word" in l and "route" not in l and l.get("gate") == "criteria" \
                and not str(l.get("result", "")).startswith("refused"):
            seen = False
        elif l.get("route") == "checks-pass":
            seen = True
    return seen


def route_matches(route, st, is_frozen, case_written=False, lines=(), user_step=False):
    if route["stage"] != "*" and route["stage"] != st["stage"]:
        return False
    state = route["state"]
    if isinstance(state, list):
        if st["state"] not in state:
            return False
    elif state != "*" and state != st["state"]:
        return False
    role = route["role"]
    if role.startswith("!"):
        if st["role"] == role[1:]:
            return False
    elif role != "*" and role != st["role"]:
        return False
    if route["verdict"] != "*" and route["verdict"] != st["last_verdict"]:
        return False
    if not _round_ok(route["round"], round_of(st)):
        return False
    cond = route.get("condition")
    if cond in ("frozen", "not-frozen") and bool(is_frozen(st.get("spec"))) != (cond == "frozen"):
        return False
    if cond == "case-written" and not case_written:
        return False
    if cond == "no-case" and case_written:
        return False
    if cond == "frozen-nothing-needed" and not (is_frozen(st.get("spec")) and nothing_needed_ruled(lines)):
        return False
    # model S-025: the user representative's step runs when the profile and this gate's proposal exist.
    if cond == "user-step" and not user_step:
        return False
    if cond == "no-user-step" and user_step:
        return False
    return True


NO_ROUTE = {"id": "no-route", "action": "card failure"}


def find_route(routing, st, is_frozen, case_written=False, lines=(), user_step=False):
    """The first route matching the status (AC3)."""
    for r in routing.routes:
        if route_matches(r, st, is_frozen, case_written, lines, user_step):
            return r
    return NO_ROUTE


# --------------------------------------------------------------------------
# The pure rules: routing, outcomes, decisions


class Context:
    """What the rules need from outside: the table, the clock, a spec's freeze, a new spec id."""

    def __init__(self, routing, now, is_frozen, new_spec, case_written=None, lines_of=None, user_step=None):
        self.case_written = case_written
        self.user_step = user_step          # model S-025: user_step(item, st), optional
        self.lines_of = lines_of
        self.routing = routing
        self.now = now
        self.now_s = fmt_time(now)
        self.is_frozen = is_frozen
        self.new_spec = new_spec


REASONS = {
    "triage-return": "Triage traced the failure chain to its root cause; its recorded return is linked below.",
    "malformed-return": "A session returned without a valid verdict.",
    "dor-pass": "The project passed the definition-of-ready check.",
    "dor-fail": "The project failed the definition-of-ready check.",
    "plan-pass": "The plan review passed; the acceptance criteria need the owner's approval.",
    "freeze-not-frozen": "The Definer's freeze session returned, but the spec's status line is not `frozen`.",
    "launch-pass": "The launch review passed.",
    "no-route": "No route of the routing table matches the item's status.",
}


def _this(st):
    return "%d/%s" % (st["stage"], st["role"])


def _valid_resume(text):
    m = RESUME_RE.match(text) if isinstance(text, str) else None
    return bool(m) and int(m.group(1)) in STAGES and m.group(2) in ROLES


def _card(st, gate, route_id, reason, resume=None, **extra):
    """Raise a card: the item waits on the owner (AC3: never a second card while waiting)."""
    assert st["state"] != "waiting-owner" or "gate" not in st, "an item waiting on the owner gets no second card"
    st["state"] = "waiting-owner"
    st["gate"] = gate
    st["card"] = st.get("card", 0) + 1
    st.pop("dispatched_at", None)
    if resume:
        st["resume"] = resume
    else:
        st.pop("resume", None)
    action = {"kind": "card", "route": route_id, "gate": gate, "card": st["card"], "reason": reason,
              "resume": resume}
    action.update(extra)
    return action


def _dispatch(ctx, st, route_id, role, stage, run_checks):
    """A dispatch or check run, after the freeze pre-check and then the budget check (AC3)."""
    if stage != st["stage"]:
        st.update(stage=stage, sessions=0, attempts=0)
    exempt = role in BUDGET_EXEMPT
    # model S-023 AC12: the Definer's freeze session at stage 4 (a fix spec) is the freeze itself.
    if stage in FROZEN_STAGES and role != "definer-freeze" and not ctx.is_frozen(st.get("spec")):
        return _card(st, "failure", route_id,
                     "A dispatch at stage %d needs a frozen spec, and %s is not frozen (D-043, D-046)."
                     % (stage, st.get("spec") or "the item's spec"))
    if not exempt and st["sessions"] >= ctx.routing.budget:
        return _card(st, "stop", route_id,
                     "The session budget for stage %d (%d) is used up." % (stage, ctx.routing.budget),
                     budget=True)
    # A re-dispatch after a usage-limit outcome does not count against the budget (AC8).
    if not exempt and "usage_limit_since" not in st:
        st["sessions"] += 1
    st.update(role=role, state="dispatched", last_verdict="none", dispatched_at=ctx.now_s)
    return {"kind": "dispatch", "route": route_id, "action": "run-checks" if run_checks else "dispatch",
            "role": role, "stage": stage, "spec": st.get("spec")}


def route_item(ctx, st, item=None):
    """Route one status (AC3). Returns (route id, new status, action or None)."""
    lines = ctx.lines_of(item) if (ctx.lines_of and item) else ()
    cw = bool(ctx.case_written(item, st)) if (ctx.case_written and item and st.get("next_gate")) else False
    us = bool(ctx.user_step(item, st)) if (ctx.user_step and item and st.get("next_gate")) else False
    r = find_route(ctx.routing, st, ctx.is_frozen, cw, lines, us)
    rid, act = r["id"], r["action"]
    if act == "none":
        return rid, st, None
    st = dict(st)
    if act.startswith("gate "):
        gid = act[5:]
        seen = [l.get("gate_n") for l in lines if isinstance(l, dict) and l.get("gate") == gid
                and isinstance(l.get("gate_n"), int)]
        n = 1 + max(seen + [0])
        action = {"kind": "gate", "route": rid, "gate": gid, "gate_n": n, "role": st["role"],
                  "stage": st["stage"], "spec": st.get("spec")}
        st.update(gate_n=n, next_gate=gid, role="critic-gate", state="ready", sessions=0, attempts=0,
                  last_verdict="none")
        st.pop("gate_recommendation", None)
        st.pop("user_verdict", None)
        return rid, st, action
    if act == "card next-gate":
        gid = st.pop("next_gate")
        return rid, st, _card(st, gid, rid, REASONS.get(GATE_PASS[gid], ""))
    if act == "pass":
        action = {"kind": "pass", "route": rid, "role": st["role"], "stage": st["stage"] + 1,
                  "spec": st.get("spec"), "nothing_needed": "Build"}
        st.update(stage=r["then_stage"], role=r["then_role"], state="ready", last_verdict="none", sessions=0,
                  attempts=0)
        return rid, st, action
    if act.startswith("card "):
        resume = r.get("resume")
        if resume == "this":
            resume = _this(st)
        return rid, st, _card(st, act[5:], rid, REASONS.get(rid, ""), resume)
    if act == "done":
        st["state"] = "done"
        return rid, st, {"kind": "done", "route": rid}
    if act == "run-checks":
        role = "checks"
    elif act == "dispatch item-role":
        role = st["role"]
    else:
        role = act[len("dispatch "):]
    return rid, st, _dispatch(ctx, st, rid, role, r.get("then_stage", st["stage"]), act == "run-checks")


def normalize_verdict(role, verdict):
    """AC8: PASS/FAIL for checkers and check runs, none for doers and Triage; else malformed."""
    if role in CHECKERS:
        return verdict if verdict in ("PASS", "FAIL") else "malformed"
    return "none" if verdict == "none" else "malformed"


def apply_outcome(ctx, st, result, verdict):
    """Apply a finished session or check run to a dispatched item (AC8). Returns (status, action)."""
    st = dict(st)
    st.pop("dispatched_at", None)
    action = None
    if result == "ok":
        v = normalize_verdict(st["role"], verdict)
        st.update(state="returned", last_verdict=v, attempts=0)
        st.pop("usage_limit_since", None)
        if v == "FAIL":
            st[round_key(st["stage"])] += 1
    elif result in ("error", "timeout"):
        st.pop("usage_limit_since", None)
        st.update(state="ready", last_verdict="none", attempts=min(st["attempts"] + 1, 2))
        if st["attempts"] >= 2:
            action = _card(st, "failure", "attempts",
                           "Two attempts in a row ended without a return (the last: %s)." % result, _this(st))
    elif result == "usage-limit":
        st.update(state="ready", last_verdict="none")
        since = st.setdefault("usage_limit_since", ctx.now_s)
        hours = ctx.routing.usage_limit_hours
        if ctx.now - parse_time(since) >= datetime.timedelta(hours=hours):
            action = _card(st, "failure", "usage-limit",
                           "The account has hit its usage limit on every try for %d hours (since %s)."
                           % (hours, since), _this(st))
    else:
        raise ValueError("unknown result %r" % (result,))
    return st, action


def word_list_key(st, gate):
    """Which word list of a gate applies to the item (AC5: words by item kind)."""
    if st["kind"] == "project" and gate in ("stop", "failure"):
        return "project_with_spec" if st.get("spec") else "project_in_shape"
    return st["kind"]


def valid_words(routing, st, gate):
    g = routing.gates.get(gate, {})
    words = list(g.get(word_list_key(st, gate), []))
    if st.get("confirm_used") and "confirm" in words:
        words.remove("confirm")
    for word, min_stage in g.get("stage_limits", {}).items():
        if word in words and st["stage"] < min_stage:
            words.remove(word)
    if g.get("retry_needs_resume") and not st.get("resume") and "retry" in words:
        words.remove("retry")
    return words


def apply_decision(ctx, st, word, into=None, nothing_needed=None, lines=()):
    """Apply the owner's (or the Chief of Staff's) word to the item's card (AC5).
    The word must be valid (valid_words). model S-024: `into` is a recycle's phase; `nothing_needed`
    rides on the log line only; `lines` are the item's log lines. Returns (status, action or None)."""
    st = dict(st)
    gate = st.pop("gate")
    resume = st.pop("resume", None)
    kind = st["kind"]
    st["sessions"] = 0                      # every decision resets sessions
    st.pop("usage_limit_since", None)
    st.pop("dispatched_at", None)

    def to(stage, role, reset=False):
        st.update(stage=stage, role=role, state="ready", last_verdict="none", attempts=0)
        if reset:                           # only the owner's words reset the rounds
            st.update(plan_round=0, build_round=0, confirm_used=False)

    def close():
        st["state"] = "closed"
        st["outcome"] = word

    def new_spec():
        old = st.get("spec")
        if old:
            st["superseded"] = list(st.get("superseded", [])) + [old]
        st["spec"] = ctx.new_spec()

    if gate in GATE_PHASE:
        st.pop("gate_recommendation", None)
        st.pop("user_verdict", None)
        if word == "hold":
            st.update(gate_n=st.get("gate_n", 0) + 1, next_gate=gate, role="critic-gate", state="ready",
                      last_verdict="none", attempts=0)
            return st, None
        if word == "kill":
            close()
            return st, None
        if word == "recycle":
            if into == "Discovery":
                to(2, "critic", reset=True)
                return st, _card(st, "dor-fail", "gate-recycle",
                                 "The owner recycled the project into Discovery: the Chief of Staff revises the "
                                 "project document and resubmits it.")
            if into == "Design":
                if gate != "criteria":
                    new_spec()
                to(3, "definer", reset=True)
            elif into == "Build":
                if nothing_needed_ruled(lines) and not checks_locked_since_ruling(lines):
                    to(4, "check-author", reset=True)
                else:
                    to(5, "builder", reset=True)
            else:
                to(6, "builder", reset=True)
            return st, None
        if word == "proceed":
            word = {"dor": "build", "criteria": "approve", "launch": "approve"}[gate]
    if gate == "dor":
        if word == "build":
            new_spec()
            to(3, "definer")
        elif word == "re-aim":
            return st, _card(st, "dor-fail", "dor-re-aim",
                             "The owner asked for the project to be re-aimed: the Chief of Staff revises the "
                             "project document and resubmits it.")
        else:
            close()
    elif gate == "dor-fail":
        if word == "resubmit":
            to(2, "critic")                 # rounds and confirm_used kept
        else:
            close()
    elif gate == "criteria":
        if word == "approve":
            to(3, "definer-freeze")
        elif word == "revise":
            to(3, "definer")
        else:
            close()
    elif gate == "launch":
        if word == "approve":
            st["state"] = "done"
        elif word == "revise":
            to(6, "builder")
        else:
            close()
    else:  # stop, failure
        if word in ("drop", "re-scope"):
            close()
        elif word == "confirm":
            role = "source-checker" if kind == "research" else CONFIRM_CHECKER[st["stage"]]
            to(st["stage"], role)
            st["confirm_used"] = True
            st[round_key(st["stage"])] = 2
        elif word in RESPECIFY_WORDS:
            if kind == "research":
                to(2, "researcher", reset=True)
            else:
                new_spec()
                to(3, "definer", reset=True)
        elif word == "rebuild":
            to(5, "builder", reset=True)
        elif word == "resubmit":
            to(2, "critic", reset=True)
        elif word == "retry":
            m = RESUME_RE.match(resume)
            to(int(m.group(1)), m.group(2))
        else:
            raise ValueError("unknown word %r" % (word,))
    return st, None


# --------------------------------------------------------------------------
# Status files


def _is_int(v):
    return isinstance(v, int) and not isinstance(v, bool)


def user_rejected(st):
    """model S-025: the status holds the user representative's reject."""
    m = USER_VERDICT_RE.match(st.get("user_verdict") or "")
    return bool(m) and m.group(1) == "reject"


def check_status(item, st):
    """Errors for a status file's values outside AC1's sets (empty when valid)."""
    errs = []
    unknown = sorted(set(st) - set(FIELD_ORDER))
    if unknown:
        errs.append("unknown field(s) %s" % ", ".join(unknown))
    missing = [k for k in REQUIRED if k not in st]
    if missing:
        return errs + ["missing field(s) %s" % ", ".join(missing)]
    if st["kind"] not in KINDS or KIND_OF_PREFIX[item[0]] != st["kind"]:
        errs.append("kind %r (an %s-item is a %s)" % (st["kind"], item[0], KIND_OF_PREFIX[item[0]]))
    if _is_int(st["stage"]) and st["stage"] == 8 and st["kind"] == "evidence":
        # model S-024 AC9: a finished evidence review written before it loads as a record; an open one is skipped.
        if st.get("state") not in ("done", "closed"):
            errs.append("an open evidence review at stage 8: the desk no longer runs them (model S-024); close its "
                        "status by hand")
    elif not _is_int(st["stage"]) or st["stage"] not in STAGES:
        errs.append("stage %r" % (st["stage"],))
    if st["state"] not in STATES:
        errs.append("state %r" % (st["state"],))
    if st["role"] not in ROLES:
        errs.append("role %r" % (st["role"],))
    if st["last_verdict"] not in VERDICTS:
        errs.append("last_verdict %r" % (st["last_verdict"],))
    for k in ("plan_round", "build_round", "sessions"):
        if not _is_int(st[k]) or st[k] < 0:
            errs.append("%s %r" % (k, st[k]))
    if not _is_int(st["attempts"]) or not 0 <= st["attempts"] <= 2:
        errs.append("attempts %r" % (st["attempts"],))
    if not isinstance(st["confirm_used"], bool):
        errs.append("confirm_used %r" % (st["confirm_used"],))
    for k in ("dispatched_at", "usage_limit_since"):
        if k in st:
            try:
                parse_time(st[k])
            except ValueError:
                errs.append("%s %r" % (k, st[k]))
    if "gate" in st and st["gate"] not in GATES:
        errs.append("gate %r" % (st["gate"],))
    if "card" in st and (not _is_int(st["card"]) or st["card"] < 1):
        errs.append("card %r" % (st["card"],))
    if "next_gate" in st and (st["next_gate"] not in GATE_PHASE or st.get("role") not in GATE_ROLES):
        errs.append("next_gate %r" % (st["next_gate"],))
    if "gate_n" in st and (not _is_int(st["gate_n"]) or st["gate_n"] < 1):
        errs.append("gate_n %r" % (st["gate_n"],))
    if "gate_recommendation" in st and not (isinstance(st["gate_recommendation"], str)
                                            and len(st["gate_recommendation"]) <= 500
                                            and RECOMMENDATION_RE.match(st["gate_recommendation"])
                                            and st.get("role") in GATE_ROLES):
        errs.append("gate_recommendation %r" % (st["gate_recommendation"],))
    if "user_verdict" in st and not (isinstance(st["user_verdict"], str) and len(st["user_verdict"]) <= 500
                                     and USER_VERDICT_RE.match(st["user_verdict"]) and st.get("role") == "user-rep"):
        errs.append("user_verdict %r" % (st["user_verdict"],))
    if "resume" in st and not _valid_resume(st["resume"]):
        errs.append("resume %r" % (st["resume"],))
    if "spec" in st and not (isinstance(st["spec"], str) and SPEC_ID_RE.match(st["spec"])):
        errs.append("spec %r" % (st["spec"],))
    if "superseded" in st and not (isinstance(st["superseded"], list)
                                   and all(isinstance(s, str) and SPEC_ID_RE.match(s) for s in st["superseded"])):
        errs.append("superseded %r" % (st["superseded"],))
    if "project" in st and not (isinstance(st["project"], str) and ITEM_RE.match(st["project"])
                                and st["project"].startswith("P-")):
        errs.append("project %r" % (st["project"],))
    if "milestone" in st and not (st["kind"] == "research" and isinstance(st["milestone"], str)
                                  and MILESTONE_TAG_RE.match(st["milestone"])):
        errs.append("milestone %r (model S-023: only a research item carries one)" % (st["milestone"],))
    if "outcome" in st and not isinstance(st["outcome"], str):
        errs.append("outcome %r" % (st["outcome"],))
    if st.get("state") == "waiting-owner" and ("gate" not in st or "card" not in st):
        errs.append("state waiting-owner without gate and card")
    if st.get("state") != "waiting-owner" and "gate" in st:
        errs.append("gate %r while not waiting on the owner" % (st["gate"],))
    if st.get("state") == "dispatched" and "dispatched_at" not in st:
        errs.append("state dispatched without dispatched_at")
    return errs


def _toml_value(v):
    if isinstance(v, bool):
        return "true" if v else "false"
    if _is_int(v):
        return str(v)
    if isinstance(v, list):
        return "[" + ", ".join(json.dumps(x, ensure_ascii=False) for x in v) + "]"
    return json.dumps(v, ensure_ascii=False)


def dump_status(st):
    lines = ["# Written only by the Orchestrator (model S-012 AC1)."]
    lines += ["%s = %s" % (k, _toml_value(st[k])) for k in FIELD_ORDER if k in st]
    return "\n".join(lines) + "\n"


def new_status(kind, stage, role, **extra):
    st = {"kind": kind, "stage": stage, "state": "ready", "role": role, "last_verdict": "none",
          "plan_round": 0, "build_round": 0, "confirm_used": False, "attempts": 0, "sessions": 0}
    st.update(extra)
    return st


# --------------------------------------------------------------------------
# Cards


GATE_QUESTION = {
    "dor": "The Design gate: the project passed the definition-of-ready check. The case for moving into Design is "
           "in the gate document. Proceed, hold, recycle or kill?",
    "dor-fail": "The project failed the definition-of-ready check. Resubmit a revised project document, or stop?",
    "criteria": "The Build gate: the plan review passed. The case for freezing the criteria and moving into Build "
                "is in the gate document. Proceed, hold, recycle or kill?",
    "launch": "The Launch gate: the launch review passed. The case for going live and graduating the product, with "
              "its own monitoring and feedback confirmed running, is in the gate document. Proceed, hold, recycle "
              "or kill?",
    "stop": "The work reached the stop rule. What happens next?",
    "failure": "The work could not go on. What happens next?",
}
WORD_EFFECT = {
    ("dor", "build"): "a new spec id is allocated and the project moves into Design: Define (stage 3, the Definer)",
    ("dor", "re-aim"): "a dor-fail card for the Chief of Staff to revise the project document",
    ("dor-fail", "resubmit"): "back to the definition-of-ready check (stage 2, the Critic); the plan rounds "
                              "are kept, so a third FAIL still leads to Triage and a stop card",
    ("criteria", "approve"): "the Definer freezes the spec (stage 3, definer-freeze)",
    ("criteria", "revise"): "back to the Definer (stage 3)",
    ("launch", "approve"): "the project is delivered (done)",
    ("launch", "revise"): "back to the Builder for the launch (stage 6)",
    ("stop", "resubmit"): "back to the definition-of-ready check (stage 2, the Critic), rounds reset",
    # model S-024 AC3: each gate's own effects for its four words ("What each answer does").
    ("dor", "proceed"): "the Design gate is passed: a new spec id is allocated and the project moves into Design "
                        "(stage 3, the Definer), as `build` does",
    ("dor", "hold"): "not yet: nothing moves; the Chief of Staff updates the case under the next number, the Critic "
                     "reads it again, and a fresh card follows (needs a `Reason:` line)",
    ("dor", "recycle"): "back into Discovery, its next iteration (`Into: Discovery` and a `Reason:` line): a "
                        "dor-fail card for the Chief of Staff to revise the project document, rounds reset",
    ("dor", "kill"): "the project is closed (kill)",
    ("criteria", "proceed"): "the Build gate is passed: the Definer freezes the spec (stage 3, definer-freeze), as "
                             "`approve` does; with a line `Nothing needed: Build`, on a case holding \"Nothing needed "
                             "in Build\", the frozen return then passes Build with nothing needed (a `Proxy:` line "
                             "is refused with it)",
    ("criteria", "hold"): "not yet: nothing moves; the Chief of Staff updates the case under the next number, the "
                          "Critic reads it again, and a fresh card follows (needs a `Reason:` line)",
    ("criteria", "recycle"): "back into Design (`Into: Design`: the Definer, stage 3, same spec) or Discovery "
                             "(`Into: Discovery`: stage 2, then a dor-fail card), as its next iteration, with a "
                             "`Reason:` line; rounds reset",
    ("criteria", "kill"): "the project is closed (kill)",
    ("launch", "proceed"): "the Launch gate is passed: the product goes live and graduates (done), as `approve` "
                           "does",
    ("launch", "hold"): "not yet: nothing moves; the Chief of Staff updates the case under the next number, the "
                        "Critic reads it again, and a fresh card follows (needs a `Reason:` line)",
    ("launch", "recycle"): "back into Launch (`Into: Launch`: the Builder, stage 6), Build (`Into: Build`: the "
                           "Builder, stage 5, or the Check author, stage 4, when Build was passed with nothing "
                           "needed), Design (`Into: Design`: a new spec superseding the current one, stage 3, the "
                           "Definer, not a strike) or Discovery (`Into: Discovery`: stage 2, then a dor-fail card), "
                           "as its next iteration, with a `Reason:` line; rounds reset",
    ("launch", "kill"): "the project is closed (kill)",
}
WORD_EFFECT_ANY = {
    "stop": "closed (stop)",
    "drop": "closed (drop)",
    "re-scope": "closed (re-scope)",
    "re-specify": "a new spec superseding the current one, back to the Definer (stage 3), who also marks the "
                  "old spec superseded, with a ledger entry from the Orchestrator (model S-013 AC7), rounds "
                  "reset; a strike (research: back to the Researcher, rounds reset)",
    "criteria-wrong": "a new spec superseding the current one, back to the Definer (stage 3), who also marks "
                      "the old spec superseded, with a ledger entry from the Orchestrator; rounds reset; not a "
                      "strike",
    "checks-wrong": "a new spec superseding the current one (a locked check is only superseded with its "
                    "spec), back to the Definer (stage 3), who also marks the old spec superseded, with a "
                    "ledger entry from the Orchestrator; rounds reset; not a strike",
    "rebuild": "back to the Builder (stage 5), rounds reset",
    "confirm": "one focused check by the stage's checker, round set to 2 (offered once)",
    "retry": "back to where the work stopped",
}


def card_text(routing, item, st, action, links, words, milestone=None, spec_path=None):
    """A decision card: its header lines, the seven parts of D-019 and, for a launch card, section 8 (model S-013
    AC4).
    model S-033 AC5: a `Milestone: <ids>` line straight under the `answer:` line when `milestone` (the spec
    header's `milestones:` value, or a research request's tag) is recorded, and, after section 7 and before any
    section 8, `## Context`: a bullet for each fact of sections 1 to 3 that comes from a record, with its source
    (the status file; `spec_path`, the spec's file, when known; the gate case for a gate card)."""
    gate, n = action["gate"], action["card"]
    record = "decisions/%s/%s-%d.md" % (item, gate, n)
    notes = "decisions/%s/%s-%d-notes.md" % (item, gate, n)
    answered = routing.gates.get(gate, {}).get("answered_by", "owner")
    user = action.get("user")                 # model S-025: "ran", "not-needed", "not-run", or None
    out = ["# Decision card — %s %s-%d" % (item, gate, n), "",
           "item: %s   kind: %s   gate: %s   card: %d   route: %s" % (item, st["kind"], gate, n, action["route"]),
           "answer: write `%s`, first line `Decision: <word>` (one of the words below)." % record]
    if milestone:
        out.append("Milestone: %s" % milestone)
    out += ["", "## 1. The decision", GATE_QUESTION.get(gate, "")]
    if gate in GATE_PHASE and st.get("gate_n"):
        out.append("%s, case %d." % (GATE_TITLE[gate], st["gate_n"]))
        if user == "ran":
            out.append("You rule on the gate and on the user representative's verdict.")
    out += ["",
           "## 2. Why it's yours",
           "Route `%s` of governance/ROUTING.toml (model S-012) sends this card to the %s. %s"
           % (action["route"], answered, action.get("reason") or ""), "",
           "## 3. Background",
           "- stage %d, role %s, last verdict %s" % (st["stage"], st["role"], st["last_verdict"]),
           "- plan round %d, build round %d, confirm used: %s" % (st["plan_round"], st["build_round"],
                                                                 "yes" if st["confirm_used"] else "no"),
           "- sessions this stage: %d of %d" % (st["sessions"], routing.budget)]
    if st.get("spec"):
        out.append("- spec: %s%s" % (st["spec"], (" (supersedes %s)" % ", ".join(st["superseded"]))
                                     if st.get("superseded") else ""))
    if st.get("resume"):
        out.append("- `retry` returns to stage %s, role %s" % tuple(st["resume"].split("/")))
    out += ["", "## 4. Options"]
    old_words = gate in GATE_PHASE and any(w in GATE_WORDS for w in words)
    for i, w in enumerate(words):
        if old_words and w not in GATE_WORDS and (i == 0 or words[i - 1] in GATE_WORDS):
            out.append("Also accepted, as before:")
        effect = WORD_EFFECT.get((gate, w)) or WORD_EFFECT_ANY.get(w, "")
        refused = " A `Proxy:` line is refused on this word." if "%s.%s" % (gate, w) in routing.proxy_refused else ""
        override = ""
        if user == "ran" and w in FORWARD_WORDS.get(gate, ()) and user_rejected(st):
            override = " After the representative's reject, add a line `User-Override: <your reason>`."
        out.append("- `%s` — %s.%s%s" % (w, effect, refused, override))
    rec5 = ["The Chief of Staff's part: `%s`." % notes]
    if gate in GATE_PHASE and st.get("gate_n"):
        rec5 = ["The Critic: %s" % (st.get("gate_recommendation") or "(the Critic's line is not recorded)"),
                "The proposer's recommendation is in section 1 of the case. " + rec5[0]]
        if user == "ran":
            rec5.insert(1, "The user representative (a simulation, not real users): %s"
                        % (st.get("user_verdict") or "(the representative's line is not recorded)"))
        elif user == "not-needed":
            rec5.insert(1, "The user representative: not needed. The brief records that the owner is the user "
                           "(docs/PROJECT.md, section 9).")
        elif user == "not-run":
            rec5.insert(1, "The user representative did not run: no proposal was written for this gate. Answer "
                           "`hold` to have it run on an updated case and proposal.")
    out += ["", "## 5. Recommendation"] + rec5 + ["",
            "## 6. If you don't decide",
            "Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the "
            "budget (model S-012 AC6).", "",
            "## 7. Who has checked it"]
    out += ["- %s" % l for l in links] or ["- (no record)"]
    status = "status/%s.toml" % item
    out += ["", "## Context",
            "- stage %d, role %s, last verdict %s (source: %s)" % (st["stage"], st["role"], st["last_verdict"], status),
            "- plan round %d, build round %d (source: %s)" % (st["plan_round"], st["build_round"], status)]
    if st.get("spec") and spec_path:
        out.append("- the spec, %s (source: %s)" % (st["spec"], spec_path))
    if gate in GATE_PHASE and st.get("gate_n"):
        out.append("- the %s gate's case %d (source: docs/gates/%s/%s-gate-%d-case.md)"
                   % (GATE_PHASE[gate].capitalize(), st["gate_n"], item, GATE_PHASE[gate], st["gate_n"]))
    if gate == "launch":
        out += ["", LAUNCH_SECTION, LAUNCH_UNSTAMPED]
    return "\n".join(out) + "\n"


# model S-013 AC4: the launch card's last section. The commit job replaces it with the item tip
# (an `Item-Tip: <sha>` line) and every R3 path the item changes, after it pushes the item branch.
LAUNCH_SECTION = "## 8. What approval merges"
LAUNCH_UNSTAMPED = ("The item tip is not stamped yet: the commit job writes it here after it pushes the item "
                    "branch. A launch card without a tip cannot be approved (model S-013 AC4).")
ITEM_TIP_RE = re.compile(r"^Item-Tip: ([0-9a-f]{40})[ \t]*$", re.M)


# --------------------------------------------------------------------------
# The step


class Step:
    def __init__(self, root, now, spec_dir, outcomes, routing_path, item_tips=None, hold=False):
        self.root = root
        self.item_tips = item_tips
        self.hold = hold
        self.now = now
        self.now_s = fmt_time(now)
        self.spec_dir = spec_dir
        self.outcomes_path = outcomes
        self.routing = load_routing(routing_path)
        self.items = {}          # valid items: id -> status
        self.original = {}       # id -> status file text as read
        self.all_ids = set()     # every status/*.toml name
        self.lines = []          # new dispatch-log lines (without time and prev)
        self.plan = []
        self.cards = []          # (rel, text)
        self.research = []       # (rel, text)
        self.trigger = {}
        self.records = {}
        self.touched = set()
        self.spec_cache = {}
        self.max_spec = 0
        self.item_objs = {}
        self.ctx = Context(self.routing, now, self.is_frozen, self.new_spec, self.case_written, self.lines_of,
                           self.user_step)

    # -- paths and reading
    def path(self, rel):
        return os.path.join(self.root, *rel.split("/"))

    def listdir(self, rel):
        p = self.path(rel)
        return sorted(os.listdir(p)) if os.path.isdir(p) else []

    def read_text(self, path):
        with open(path, encoding="utf-8", newline="") as fh:
            return fh.read()

    # -- processed inputs and the log
    def load_processed(self):
        p = self.path(PROCESSED_REL)
        self.processed_text = None
        data = {}
        if os.path.exists(p):
            try:
                self.processed_text = self.read_text(p)
                data = json.loads(self.processed_text)
            except (OSError, ValueError) as exc:
                raise UsageError("%s is unreadable: %s" % (PROCESSED_REL, exc))
        self.processed = {"requests": list(data.get("requests", [])),
                          "outcomes": dict(data.get("outcomes", {})),
                          "decisions": dict(data.get("decisions", {})),
                          "anomalies": list(data.get("anomalies", [])),
                          "plan_hash": data.get("plan_hash"),
                          "log_head": data.get("log_head", GENESIS)}
        self.anomaly_keys = set(self.processed["anomalies"])

    def load_log(self):
        self.month = self.now.strftime("%Y-%m")
        months = [m.group(1) for m in (MONTH_FILE_RE.match(n) for n in self.listdir(LOG_DIR)) if m]
        if months and months[-1] > self.month:
            raise UsageError("--now (%s) is before the dispatch log's latest month (%s)" % (self.now_s, months[-1]))
        self.log_prev = GENESIS
        self.item_lines = {}
        for m in months:
            rel = "%s/%s.jsonl" % (LOG_DIR, m)
            for i, line in enumerate(self.read_text(self.path(rel)).split("\n"), 1):
                if not line:
                    continue
                self.log_prev = sha(line)
                try:
                    item = json.loads(line).get("item")
                except (ValueError, AttributeError):
                    item = None
                if item:
                    self.item_lines.setdefault(item, []).append((rel, i))
                    self.item_objs.setdefault(item, []).append(json.loads(line))

    def lines_of(self, item):
        return list(self.item_objs.get(item, [])) + [l for l in self.lines if l.get("item") == item]

    def ruling_of(self, item):
        """model S-024 AC8: a later-work request's `ruling` (enters Build or Design), or None."""
        p = self.path("%s/%s.toml" % (REQUESTS_DIR, item))
        if not os.path.isfile(p):
            return None
        try:
            data = tomllib.loads(self.read_text(p))
        except (OSError, tomllib.TOMLDecodeError):
            return None
        r = data.get("ruling")
        return r if data.get("enters") in ("Build", "Design") and isinstance(r, str) else None

    def case_path(self, item, st):
        return "docs/gates/%s/%s-gate-%d-case.md" % (item, GATE_PHASE[st["next_gate"]], st.get("gate_n", 0))

    def proposal_path(self, item, st):
        return "docs/gates/%s/%s-gate-%d-proposal.md" % (item, GATE_PHASE[st["next_gate"]], st.get("gate_n", 0))

    def has_profile(self):
        """model S-025: a target-user profile on the checkout (a path test; never opened)."""
        return os.path.isfile(self.path(PROFILE_REL))

    def case_written(self, item, st):
        # model S-025: with a target-user profile, the gate waits for the proposal too.
        if not os.path.isfile(self.path(self.case_path(item, st))):
            return False
        return not self.has_profile() or os.path.isfile(self.path(self.proposal_path(item, st)))

    def user_step(self, item, st):
        """model S-025: the user representative's step runs (the profile and this gate's proposal exist)."""
        return self.has_profile() and os.path.isfile(self.path(self.proposal_path(item, st)))

    def log(self, **fields):
        item = fields.get("item")
        if "route" in fields and isinstance(item, str) and item.startswith("P-") and fields.get("stage") in PHASE_OF_STAGE:
            # model S-023 AC6: a project item's routed line carries its phase and that phase's iteration.
            fields["phase"] = PHASE_OF_STAGE[fields["stage"]]
            fields["iteration"] = iterations(self.lines_of(item) + [fields])[-1][2]
        self.lines.append(fields)

    def anomaly(self, key, item, message):
        if key in self.anomaly_keys:
            return
        self.anomaly_keys.add(key)
        self.processed["anomalies"].append(key)
        self.log(trigger="anomaly", item=item, error=message)
        print("ERROR: %s%s" % ("%s: " % item if item else "", message), file=sys.stderr)

    # -- specs
    def spec_names(self):
        if not hasattr(self, "_spec_names"):
            self._spec_names = {}
            for n in sorted(os.listdir(self.spec_dir)):
                m = SPEC_NAME_RE.match(n)
                if m and n.endswith(".md") and not n.startswith("_"):
                    self._spec_names.setdefault(m.group(1), n)
        return self._spec_names

    def is_frozen(self, spec):
        if not spec:
            return False
        if spec not in self.spec_cache:
            name = self.spec_names().get(spec)
            status = None
            if name:
                with open(os.path.join(self.spec_dir, name), encoding="utf-8") as fh:
                    while True:
                        line = fh.readline()
                        if not line or line.startswith("## "):
                            break
                        if line.startswith("status:"):
                            words = line[len("status:"):].split()
                            status = words[0] if words else ""
                            break
            self.spec_cache[spec] = status == "frozen"
        return self.spec_cache[spec]

    def card_milestone(self, st, spec_name):
        """model S-033 AC5: the milestones the card's item serves, as recorded: its spec header's `milestones:`
        line, or a research item's tag from its request; None when neither is recorded."""
        if spec_name:
            with open(os.path.join(self.spec_dir, spec_name), encoding="utf-8") as fh:
                for line in fh:
                    if line.startswith("## "):
                        break
                    m = CARD_MILESTONES_RE.match(line.rstrip("\r\n"))
                    if m:
                        return m.group(1)
        if st.get("kind") == "research" and isinstance(st.get("milestone"), str) \
                and MILESTONE_TAG_RE.match(st["milestone"]):
            return st["milestone"]
        return None

    def note_spec(self, sid):
        m = SPEC_ID_RE.match(sid) if isinstance(sid, str) else None
        if m:
            self.max_spec = max(self.max_spec, int(m.group(1)))

    def new_spec(self):
        self.max_spec += 1
        sid = "S-%03d" % self.max_spec
        self.spec_cache[sid] = False
        return sid

    # -- phase 0: status files
    def load_statuses(self):
        for sid in self.spec_names():
            self.note_spec(sid)
        for name in self.listdir(STATUS_DIR):
            if not name.endswith(".toml"):
                continue
            item = name[:-5]
            self.all_ids.add(item)
            rel = "%s/%s" % (STATUS_DIR, name)
            text = self.read_text(self.path(rel))
            key = "status:%s:%s" % (item, sha(text))
            if not ITEM_RE.match(item):
                self.anomaly(key, item, "%s: not an item id (P-nnn, Q-nnn, E-nnn); skipped" % rel)
                continue
            try:
                st = tomllib.loads(text)
            except tomllib.TOMLDecodeError as exc:
                self.anomaly(key, item, "%s is unreadable (%s); skipped" % (rel, exc))
                continue
            self.note_spec(st.get("spec"))
            for s in st.get("superseded", []) if isinstance(st.get("superseded"), list) else []:
                self.note_spec(s)
            errs = check_status(item, st)
            if errs:
                self.anomaly(key, item, "%s: %s; skipped" % (rel, "; ".join(errs)))
                continue
            self.items[item] = st
            self.original[item] = text

    # -- phase 1: requests
    def requests(self):
        for name in self.listdir(REQUESTS_DIR):
            if not name.endswith(".toml") or name.startswith("_"):
                continue
            item = name[:-5]
            if item in self.processed["requests"]:
                continue
            rel = "%s/%s" % (REQUESTS_DIR, name)
            text = self.read_text(self.path(rel))
            key = "request:%s:%s" % (item, sha(text))

            def refuse(msg):
                # A refusal is final (J1): recorded as processed, never looked at again.
                self.anomaly(key, item if ITEM_RE.match(item) else None, "request %s refused: %s" % (rel, msg))
                self.processed["requests"].append(item)

            if not ITEM_RE.match(item):
                refuse("the file name is not an item id (P-nnn, Q-nnn, E-nnn)")
                continue
            try:
                data = tomllib.loads(text)
            except tomllib.TOMLDecodeError as exc:
                refuse("unreadable (%s)" % exc)
                continue
            kind = data.get("kind")
            if data.get("id", item) != item:
                refuse("its id %r is not its file name" % (data.get("id"),))
            elif item in self.all_ids:
                refuse("the item %s already exists" % item)
            elif kind not in KINDS:
                refuse("unknown kind %r" % (kind,))
            elif KIND_OF_PREFIX[item[0]] != kind:
                refuse("an %s-item is a %s, not a %s" % (item[0], KIND_OF_PREFIX[item[0]], kind))
            elif kind == "research" and not (isinstance(data.get("question"), str) and data["question"].strip()):
                refuse("a research request needs a `question`")
            elif kind == "evidence":
                refuse("a graduated product owns its own review (model S-023)")
            elif "milestone" in data and kind == "project":
                refuse("a project's milestones are in its project document; tag its specs and research instead "
                       "(model S-023)")
            elif "milestone" in data and not (isinstance(data["milestone"], str)
                                              and MILESTONE_TAG_RE.match(data["milestone"])):
                refuse("milestone %r is neither a project milestone's id (M<id>) nor a standard milestone's "
                       "(<Phase>-<n>) (model S-023)" % (data["milestone"],))
            elif kind == "project" and self.later_work_problem(data):
                refuse(self.later_work_problem(data))
            else:
                if kind == "project" and data.get("enters") in ENTERS:
                    # model S-023 AC12: later work the owner raised starts at Build or Design, with a new spec.
                    stage, role = ENTERS[data["enters"]]
                    st = new_status("project", stage, role, spec=self.new_spec())
                elif kind == "project":
                    st = new_status("project", 2, "critic")
                elif kind == "research":
                    st = new_status("research", 2, "researcher")
                    if "milestone" in data:
                        st["milestone"] = data["milestone"]
                    self.research.append(("%s/%s.md" % (RESEARCH_DIR, item),
                                          "# Research question — %s\n\n*Copied by the Orchestrator from %s "
                                          "(model S-012 AC2).*\n\n## The question\n\n%s\n"
                                          % (item, rel, data["question"].strip())))
                self.items[item] = st
                self.all_ids.add(item)
                self.processed["requests"].append(item)
                self.trigger[item] = "request:%s" % item
                self.log(trigger="request", item=item, record=rel, result="created")

    def later_work_problem(self, data):
        """model S-023 AC12: why a project request's `enters` and `ruling` are refused, or None."""
        enters, ruling = data.get("enters"), data.get("ruling")
        if "enters" not in data:
            return ("`ruling` names the owner's record for later work entering at Build or Design, and needs "
                    "`enters` (model S-023)") if "ruling" in data else None
        if enters not in ENTERS:
            return "enters %r is neither \"Build\" nor \"Design\" (model S-023)" % (enters,)
        if not (isinstance(ruling, str) and RULING_PATH_RE.match(ruling)):
            return ("enters = %r needs `ruling`, the owner's ruling record under decisions/questions/ "
                    "(model S-023)" % enters)
        p = self.path(ruling)
        first = None
        if os.path.isfile(p) and not os.path.islink(p):
            with open(p, encoding="utf-8", errors="replace", newline="") as fh:
                first = fh.readline()
        if first is None:
            return "the ruling record %s is not in the tree (model S-023)" % ruling
        if not first.startswith("Ruling: "):
            return "the ruling record %s does not start `Ruling: ` (model S-023)" % ruling
        return None

    # -- phase 2: outcomes and stalls
    def outcomes(self):
        if not self.outcomes_path:
            return
        try:
            text = self.read_text(self.outcomes_path)
        except OSError as exc:
            raise UsageError("cannot read the outcomes file: %s" % exc)
        for n, line in enumerate(text.split("\n"), 1):
            line = line.strip()
            if not line:
                continue
            h = sha(line)
            try:
                obj = json.loads(line)
            except ValueError:
                obj = None
            if not isinstance(obj, dict) or not isinstance(obj.get("session"), str) or not obj["session"]:
                self.anomaly("outcome-line:%s" % h, None,
                             "outcomes line %d is not an outcome with a session id; ignored" % n)
                continue
            sid = obj["session"]
            if sid in self.processed["outcomes"]:
                if self.processed["outcomes"][sid] != h:
                    self.anomaly("outcome-repeat:%s:%s" % (sid, h), obj.get("item"),
                                 "session %s was already processed; this outcome is ignored" % sid)
                continue
            self.processed["outcomes"][sid] = h
            item = obj.get("item")
            st = self.items.get(item) if isinstance(item, str) else None
            key = "outcome:%s" % sid
            if st is None:
                self.anomaly(key, item if isinstance(item, str) else None,
                             "session %s: no such item (or its status file was skipped); ignored" % sid)
                continue
            if st["state"] != "dispatched":
                self.anomaly(key, item, "session %s: the item is %s, not dispatched; ignored" % (sid, st["state"]))
                continue
            if obj.get("role") != st["role"]:
                self.anomaly(key, item, "session %s: role %r, but the item was dispatched to %s; ignored"
                             % (sid, obj.get("role"), st["role"]))
                continue
            result = obj.get("result")
            if result not in RESULTS:
                self.anomaly(key, item, "session %s: unknown result %r; ignored" % (sid, result))
                continue
            verdict = obj.get("verdict") if isinstance(obj.get("verdict"), str) else "malformed"
            record = obj.get("record") if isinstance(obj.get("record"), str) else None
            st2, action = apply_outcome(self.ctx, st, result, verdict)
            rec = obj.get("recommendation")
            if result == "ok" and st["role"] == "critic-gate" and isinstance(rec, str) and len(rec) <= 500 \
                    and RECOMMENDATION_RE.match(rec):
                st2["gate_recommendation"] = rec
            uv = obj.get("user_verdict")
            if result == "ok" and st["role"] == "user-rep" and isinstance(uv, str) and len(uv) <= 500 \
                    and USER_VERDICT_RE.match(uv):
                st2["user_verdict"] = uv            # model S-025
            self.items[item] = st2
            self.touched.add(item)
            self.trigger[item] = "outcome:%s" % sid
            if record:
                self.records[item] = record
            self.log(trigger="outcome", item=item, session=sid, role=st["role"], record=record, result=result,
                     verdict=st2["last_verdict"] if result == "ok" else None)
            if action:
                self.act(item, action)

    def stalls(self):
        grace = datetime.timedelta(minutes=self.routing.grace_minutes)
        for item in sorted(self.items):
            st = self.items[item]
            if st["state"] != "dispatched" or item in self.touched:
                continue
            limit = datetime.timedelta(minutes=self.routing.time_limit(st["role"]))
            if self.now - parse_time(st["dispatched_at"]) > limit + grace:
                st2, action = apply_outcome(self.ctx, st, "timeout", "none")
                self.items[item] = st2
                self.touched.add(item)
                self.trigger[item] = "stall:%s" % item
                self.log(trigger="stall", item=item, role=st["role"], dispatched_at=st["dispatched_at"],
                         result="timeout")
                if action:
                    self.act(item, action)

    # -- phase 3: decisions
    def decisions(self):
        for item in sorted(self.items):
            st = self.items[item]
            waiting = st["state"] == "waiting-owner" and item not in self.touched
            rel = "%s/%s/%s-%d.md" % (DECISIONS_DIR, item, st.get("gate"), st.get("card", 0)) if waiting else None
            for name in self.listdir("%s/%s" % (DECISIONS_DIR, item)):
                if name.endswith("-notes.md") or not RECORD_NAME_RE.match(name):
                    continue
                r = "%s/%s/%s" % (DECISIONS_DIR, item, name)
                if r in self.processed["decisions"] or r == rel:
                    continue
                self.anomaly("stray:%s" % r, item, "%s answers a card the item is not waiting on; ignored" % r)
            if not waiting or rel in self.processed["decisions"] or "stray:%s" % rel in self.anomaly_keys:
                continue
            if not os.path.isfile(self.path(rel)):
                continue
            # model S-024 AC4: the whole record is read, and a refusal is keyed on the hash of all of it;
            # model S-029 AC7: read and hashed in chunks, so no more than 64 KiB and one chunk is held.
            head, size, whole = b"", 0, hashlib.sha256()
            with open(self.path(rel), "rb") as fh:
                for chunk in iter(lambda: fh.read(65536), b""):
                    whole.update(chunk)
                    size += len(chunk)
                    if len(head) <= 65536:
                        head += chunk
            if size > 65536:
                self.decide(item, st, rel, None, True, whole.hexdigest())
            else:
                self.decide(item, st, rel, head.decode("utf-8", "replace"))

    def decide(self, item, st, rel, text, too_big=False, digest=None):
        h = digest or sha(text)
        key = "decision:%s:%s" % (rel, h)
        if key in self.anomaly_keys:
            return
        if too_big:
            self.anomaly(key, item, "%s is over 64 KiB; the card stays open" % rel)
            return
        rows = text.split("\n")
        first = rows[0] + ("\n" if len(rows) > 1 else "")
        second = rows[1] if len(rows) > 1 else ""
        later = [r.rstrip("\r") for r in rows[2:]]
        gate = st["gate"]
        m = DECISION_RE.match(first.rstrip("\r\n"))
        if not m:
            self.anomaly(key, item, "%s: the first line is not `Decision: <word>`; the card stays open" % rel)
            return
        word = m.group(1)
        proxy = False
        line2 = second.strip()
        if line2:
            if not line2.startswith(PROXY_PREFIX):
                self.anomaly(key, item, "%s: the second line is neither empty nor `%s`; the card stays open"
                             % (rel, PROXY_PREFIX))
                return
            proxy = True
        words = valid_words(self.routing, st, gate)
        if word not in words:
            self.anomaly(key, item, "%s: `%s` is not a valid word for this %s card (valid: %s); the card stays open"
                         % (rel, word, gate, ", ".join(words) or "none"))
            return
        if proxy and "%s.%s" % (gate, word) in self.routing.proxy_refused:
            self.anomaly(key, item, "%s: a Proxy: line is refused on `%s` at the %s gate (D-066); the card "
                                    "stays open" % (rel, word, gate))
            return
        into = None
        nn_lines = [r for r in later if r.startswith("Nothing needed: ")]
        reasons = [r for r in later if r.startswith("Reason:") and r[len("Reason:"):].strip()]
        intos = [r[len("Into: "):].strip() for r in later if r.startswith("Into: ")]
        problem = None
        if nn_lines:
            # model S-024 AC4: only Build, only on the Build gate's `proceed`, in the owner's own words.
            case = "docs/gates/%s/build-gate-%d-case.md" % (item, st.get("gate_n", 0))
            named = nn_lines[0][len("Nothing needed: "):]
            if gate != "criteria":
                problem = "`Nothing needed:` is read only at the Build gate (the criteria card), not on a %s card " \
                          "(model S-023)" % gate
            elif word != "proceed":
                problem = "`Nothing needed:` goes only with `proceed`, not `%s` (model S-024)" % word
            elif proxy:
                problem = "`Nothing needed:` is the owner's own ruling and is refused under a Proxy: line " \
                          "(model S-024)"
            elif len(nn_lines) != 1:
                problem = "the record holds %d `Nothing needed:` lines; one is allowed (model S-024)" % len(nn_lines)
            elif named != "Build":
                problem = "`Nothing needed:` names %s: only Build can be passed with nothing needed (model S-023)" \
                          % (named.strip() or "nothing")
            elif not (os.path.isfile(self.path(case)) and "## Nothing needed in Build" in
                      [l.rstrip("\r") for l in self.read_text(self.path(case)).split("\n")]):
                problem = "`Nothing needed: Build` needs the case %s to hold `## Nothing needed in Build` " \
                          "(model S-024)" % case
        if gate in GATE_PHASE and word == "recycle":
            if len(intos) != 1 or intos[0] not in RECYCLE_INTO[gate]:
                problem = "recycle needs one `Into:` line naming %s" % ", ".join(RECYCLE_INTO[gate])
            elif not reasons:
                problem = "recycle needs a `Reason:` line"
            else:
                into = intos[0]
        if gate in GATE_PHASE and word == "hold" and not reasons:
            problem = "hold needs a `Reason:` line"
        if gate in GATE_PHASE and word in FORWARD_WORDS[gate] and user_rejected(st) \
                and not [r for r in later if r.startswith("User-Override:") and r[len("User-Override:"):].strip()]:
            problem = "after the user representative's reject, `%s` needs a `User-Override:` line (model S-025)" % word
        if problem:
            self.anomaly(key, item, "%s: %s; the card stays open" % (rel, problem))
            return
        if gate == "launch" and self.item_tips is not None and self.launch_stale(item, st, rel, key, word, h):
            return
        st2, action = apply_decision(self.ctx, st, word, into, "Build" if nn_lines else None, self.lines_of(item))
        self.items[item] = st2
        self.touched.add(item)
        self.processed["decisions"][rel] = h
        self.trigger[item] = "decision:%s" % rel
        fields = dict(trigger="decision", item=item, record=rel, gate=gate, card=st["card"], word=word,
                      proxy=proxy, result="%s/%d/%s" % (st2["state"], st2["stage"], st2["role"]))
        if word in self.routing.strikes:
            fields["strike"] = bool(self.routing.strikes[word])
        if into:
            fields["into"] = into
        if nn_lines:
            fields["nothing_needed"] = "Build"
        if gate in GATE_PHASE and word == "hold":
            fields.update(gate_n=st2["gate_n"])
        self.log(**fields)
        if action:
            self.act(item, action)

    def launch_card_tip(self, item, n):
        p = self.path("%s/%s-launch-%d.md" % (QUEUE_DIR, item, n))
        if not os.path.isfile(p):
            return None
        m = ITEM_TIP_RE.search(self.read_text(p))
        return m.group(1) if m else None

    def launch_stale(self, item, st, rel, key, word, h):
        """model S-013 AC4: True when the answer is not applied: `approve` or `proceed` (model S-024) on a card
        without a tip (the card stays open), or any answer to a tip that is not the item's current one or that was written before
        the card's last stamp (refused with a fresh launch card)."""
        tip = self.launch_card_tip(item, st["card"])
        info = self.item_tips.get(item) if isinstance(self.item_tips, dict) else None
        info = info if isinstance(info, dict) else {}
        if tip is None:
            if word not in ("approve", "proceed"):      # model S-024: proceed approves too
                return False
            self.anomaly(key, item, "%s: the launch card names no Item-Tip:, so it cannot be approved yet "
                                    "(model S-013 AC4); the card stays open" % rel)
            return True
        if info.get("tip") == tip and info.get("fresh") is True:
            return False
        self.processed["decisions"][rel] = h
        st2 = dict(st)
        st2.pop("gate", None)
        self.items[item] = st2
        self.touched.add(item)
        self.trigger[item] = "decision:%s" % rel
        why = ("the item's tip moved from %s to %s" % (tip[:12], str(info.get("tip"))[:12])
               if info.get("tip") != tip else "the answer was written before the card's last change")
        self.log(trigger="decision", item=item, record=rel, gate="launch", card=st["card"], word=word,
                 result="refused: %s" % why)
        reraise = {"critic-gate": "gate-view", "user-rep": "user-view"}.get(st2.get("role"), "launch-pass")
        action = _card(st2, "launch", reraise,
                       "The owner's answer to launch card %d was refused: %s. This fresh card names the current "
                       "tip (model S-013 AC4)." % (st["card"], why))
        self.act(item, action)
        return True

    # -- phase 4: routing
    def route(self):
        for item in sorted(self.items):
            rid, st2, action = route_item(self.ctx, self.items[item], item)
            if self.hold and action and action["kind"] == "dispatch":
                continue                    # model S-013 AC6: held, the item keeps its status
            self.items[item] = st2
            if action:
                self.act(item, action)

    # -- actions
    def act(self, item, action):
        st = self.items[item]
        trigger = self.trigger.get(item, "step")
        if action["kind"] == "dispatch":
            entry = {"item": item, "route": action["route"], "action": action["action"],
                     "role": action["role"], "stage": action["stage"], "spec": action["spec"], "gate": None}
            extra = {}
            if action["role"] in GATE_ROLES and st.get("next_gate"):
                entry.update(gate=st["next_gate"], gate_n=st["gate_n"])
                extra = {"gate_n": st["gate_n"]}
            # model S-025: a user-rep entry never carries the ruling (a user would not see it).
            ruling = self.ruling_of(item) if action["role"] != "user-rep" else None
            if ruling:
                entry["ruling"] = ruling
            self.plan.append(entry)
            self.log(trigger=trigger, item=item, route=action["route"], action=action["action"],
                     role=action["role"], gate=entry["gate"], stage=action["stage"], spec=action["spec"], **extra)
        elif action["kind"] == "gate":
            self.log(trigger=trigger, item=item, route=action["route"], action="gate", role=action["role"],
                     gate=action["gate"], gate_n=action["gate_n"], stage=action["stage"], spec=action["spec"])
        elif action["kind"] == "pass":
            self.log(trigger=trigger, item=item, route=action["route"], action="pass", role=action["role"],
                     gate=None, stage=action["stage"], spec=action["spec"], nothing_needed="Build")
        elif action["kind"] == "done":
            self.log(trigger=trigger, item=item, route=action["route"], action="done", role=st["role"], gate=None,
                     stage=st["stage"])
        else:
            gate, n = action["gate"], action["card"]
            extra = {"gate_n": st["gate_n"]} if gate in GATE_PHASE and "gate_n" in st else {}
            self.log(trigger=trigger, item=item, route=action["route"], action="card", role=st["role"], gate=gate,
                     card=n, stage=st["stage"], reason=action.get("reason"), **extra)
            if gate in GATE_PHASE and "gate_n" in st:
                # model S-024 AC3: the paths come from the gate and gate_n; the Orchestrator opens neither file.
                ph, gn, spec = GATE_PHASE[gate], st["gate_n"], st.get("spec")
                links = ["the case: `docs/gates/%s/%s-gate-%d-case.md` (default branch)" % (item, ph, gn),
                         "the Critic's view: `reviews/%s/_%s-gate-%d-critic.md` (branch item/%s)"
                         % (item, ph, gn, item)]
                if st.get("role") == "user-rep":
                    # model S-025: the step ran; the proposal and the representative's record, by path only.
                    action = dict(action, user="ran")
                    links += ["the proposal: `docs/gates/%s/%s-gate-%d-proposal.md` (default branch)" % (item, ph, gn),
                              "the user representative's view: `reviews/%s/_%s-gate-%d-user.md` (branch item/%s)"
                              % (item, ph, gn, item)]
                else:
                    action = dict(action, user="not-run" if self.has_profile() else "not-needed")
                if gate == "criteria" and spec:
                    links.append("the plan review, with Design's join-up review: `reviews/%s/plan.md` (branch "
                                 "item/%s)" % (spec, item))
                if gate == "launch" and spec:
                    lines = self.lines_of(item)
                    if nothing_needed_ruled(lines) and not checks_locked_since_ruling(lines):
                        links.append("the stage-5 review, with Build's join-up review: (none: Build passed with "
                                     "nothing needed)")
                    else:
                        links.append("the stage-5 review, with Build's join-up review: `reviews/%s/_reviewer-build.md`"
                                     " (branch item/%s)" % (spec, item))
                    links.append("the launch review: `reviews/%s/reviewer.md` (branch item/%s)" % (spec, item))
            else:
                links = []
            if self.records.get(item):
                links.append("the recorded return: `%s`" % self.records[item])
            if action.get("budget"):
                refs = self.item_lines.get(item, [])
                by_file = {}
                for rel, ln in refs:
                    by_file.setdefault(rel, []).append(str(ln))
                links += ["the item's dispatch-log lines: `%s` lines %s" % (rel, ", ".join(lns))
                          for rel, lns in sorted(by_file.items())]
                links.append("this card's own line: `%s/%s.jsonl`" % (LOG_DIR, self.month))
            links.append("the status file: `status/%s.toml`" % item)
            if st.get("spec"):
                links.append("the spec: %s" % st["spec"])
            words = valid_words(self.routing, st, gate)
            name = self.spec_names().get(st.get("spec")) if st.get("spec") else None
            self.cards.append(("%s/%s-%s-%d.md" % (QUEUE_DIR, item, gate, n),
                               card_text(self.routing, item, st, action, links, words,
                                         milestone=self.card_milestone(st, name),
                                         spec_path="%s/%s" % (SPECS_DIR, name) if name else None)))
            rec = "%s/%s/%s-%d.md" % (DECISIONS_DIR, item, gate, n)
            if os.path.exists(self.path(rec)):
                self.anomaly("stray:%s" % rec, item, "%s existed before its card; it is never applied" % rec)

    # -- writing
    def write_file(self, rel, text):
        p = self.path(rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        tmp = p + ".tmp"
        with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        os.replace(tmp, p)

    def write(self):
        for item in sorted(self.items):
            text = dump_status(self.items[item])
            if text != self.original.get(item):
                self.write_file("%s/%s.toml" % (STATUS_DIR, item), text)
        for rel, text in self.research:
            if not os.path.exists(self.path(rel)):
                self.write_file(rel, text)
        for rel, text in self.cards:
            if not os.path.exists(self.path(rel)):
                self.write_file(rel, text)
        if self.lines:
            rel = "%s/%s.jsonl" % (LOG_DIR, self.month)
            os.makedirs(self.path(LOG_DIR), exist_ok=True)
            prev = self.log_prev
            out = []
            for fields in self.lines:
                obj = {"time": self.now_s}
                obj.update(fields)
                obj["prev"] = prev
                line = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
                prev = sha(line)
                out.append(line + "\n")
            with open(self.path(rel), "a", encoding="utf-8", newline="\n") as fh:
                fh.write("".join(out))
            self.processed["log_head"] = prev
        plan_text = json.dumps({"entries": self.plan}, indent=2, sort_keys=True) + "\n"
        plan_hash = sha(plan_text)
        write_plan = plan_hash != self.processed["plan_hash"]
        self.processed["plan_hash"] = plan_hash
        p = dict(self.processed)
        p["requests"] = sorted(p["requests"])
        p["anomalies"] = sorted(p["anomalies"])
        processed_text = json.dumps(p, indent=2, sort_keys=True) + "\n"
        if processed_text != self.processed_text:
            self.write_file(PROCESSED_REL, processed_text)
        if write_plan:
            self.write_file(PLAN_REL, plan_text)

    def run(self):
        self.load_processed()
        self.load_log()
        self.load_statuses()
        self.requests()
        self.outcomes()
        self.stalls()
        self.decisions()
        self.route()
        self.write()
        cards = len(self.cards)
        print("OK: step at %s: %d item(s), %d plan entr%s, %d card(s), %d new log line(s)"
              % (self.now_s, len(self.items), len(self.plan), "y" if len(self.plan) == 1 else "ies", cards,
                 len(self.lines)))
        return 0


def cmd_step(args):
    root = args.root
    if not os.path.isdir(root):
        raise UsageError("root directory %r does not exist" % root)
    try:
        now = parse_time(args.now)
    except ValueError as exc:
        raise UsageError("--now: %s" % exc)
    if not os.path.isdir(args.spec_dir):
        raise UsageError("--spec-dir %r is not a directory" % args.spec_dir)
    routing = args.routing or os.path.join(root, *ROUTING_REL.split("/"))
    tips = None
    if args.item_tips:
        try:
            with open(args.item_tips, encoding="utf-8") as fh:
                tips = json.load(fh)
        except (OSError, ValueError) as exc:
            raise UsageError("--item-tips: %s" % exc)
        if not isinstance(tips, dict):
            raise UsageError("--item-tips holds a JSON object {item: {tip, fresh}}")
    return Step(root, now, args.spec_dir, args.outcomes, routing, tips, args.hold).run()


# --------------------------------------------------------------------------
# verify-log


def verify_log(root):
    findings = []
    d = os.path.join(root, LOG_DIR)
    names = sorted(os.listdir(d)) if os.path.isdir(d) else []
    files = []
    for n in names:
        m = MONTH_FILE_RE.match(n)
        if m:
            files.append((m.group(1), n))
        elif n.endswith(".jsonl"):
            findings.append("%s/%s: not a month file (yyyy-mm.jsonl)" % (LOG_DIR, n))
    prev = GENESIS
    for month, n in files:
        rel = "%s/%s" % (LOG_DIR, n)
        with open(os.path.join(d, n), encoding="utf-8", newline="") as fh:
            text = fh.read()
        lines = text.split("\n")
        if lines and lines[-1] == "":
            lines.pop()
        if not lines:
            findings.append("%s: empty month file" % rel)
        for i, line in enumerate(lines, 1):
            try:
                obj = json.loads(line)
            except ValueError:
                obj = None
            if not isinstance(obj, dict) or not isinstance(obj.get("prev"), str):
                findings.append("%s line %d: not a log line" % (rel, i))
            elif obj["prev"] != prev:
                findings.append("%s line %d: the chain is broken (a line before it was edited, deleted or "
                                "reordered, or a month is missing)" % (rel, i))
            elif not str(obj.get("time", "")).startswith(month):
                findings.append("%s line %d: time %r is not in %s" % (rel, i, obj.get("time"), month))
            prev = sha(line)
    p = os.path.join(root, *PROCESSED_REL.split("/"))
    if os.path.exists(p):
        try:
            with open(p, encoding="utf-8") as fh:
                head = json.load(fh).get("log_head")
        except (OSError, ValueError, AttributeError):
            head = None
            findings.append("%s is unreadable" % PROCESSED_REL)
        if head is not None and head != prev:
            findings.append("the log's last line does not match %s's log_head (a line or month was removed from "
                            "the end, or the last line was edited)" % PROCESSED_REL)
    for f in findings:
        print("FAIL: %s" % f)
    if findings:
        return 1
    print("OK: the dispatch log's chain holds (%d month file(s))" % len(files))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(prog="orchestrator.py", description=__doc__.split("\n")[0],
                                     allow_abbrev=False)
    sub = parser.add_subparsers(dest="cmd")
    p = sub.add_parser("step", allow_abbrev=False)
    p.add_argument("--root", required=True)
    p.add_argument("--now", required=True)
    p.add_argument("--spec-dir", required=True)
    p.add_argument("--outcomes")
    p.add_argument("--routing")
    p.add_argument("--item-tips")
    p.add_argument("--hold", action="store_true")
    v = sub.add_parser("verify-log", allow_abbrev=False)
    v.add_argument("--root", default=".")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    if tomllib is None:
        print("ERROR: orchestrator.py needs Python 3.11+ (tomllib)", file=sys.stderr)
        return 2
    try:
        if args.cmd == "step":
            return cmd_step(args)
        return verify_log(args.root)
    except UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
