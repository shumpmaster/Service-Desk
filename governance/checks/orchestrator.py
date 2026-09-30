#!/usr/bin/env python3
"""orchestrator — the Orchestrator's decision rules (model S-012).

Usage:
  orchestrator.py step --root DIR --now RFC3339 --spec-dir DIR [--outcomes FILE] [--routing PATH]
                       [--item-tips FILE] [--hold]
  orchestrator.py verify-log [--root DIR]

A pure decision engine. It runs no sessions, touches no git branch and reads no
work product's content (AC10: it parses only status files, request files,
ROUTING.toml, the dispatch log, the outcomes file, status/processed.json, the
first two lines of the one decision record an item waits on, and a spec's
header up to its `status:` line; it may list file names).

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
              is refused with a fresh launch card (route `launch-pass`), and `approve` on a card with
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
GENESIS = "0" * 64

KINDS = ("project", "research", "evidence")
KIND_OF_PREFIX = {"P": "project", "Q": "research", "E": "evidence"}
STAGES = (2, 3, 4, 5, 6, 8)
STATES = ("ready", "dispatched", "returned", "waiting-owner", "done", "closed")
ROLES = ("critic", "researcher", "source-checker", "definer", "definer-freeze", "check-author", "builder",
         "reviewer", "checks", "critic-triage")
VERDICTS = ("PASS", "FAIL", "malformed", "none")
GATES = ("dor", "dor-fail", "criteria", "launch", "evidence", "stop", "failure")
RESULTS = ("ok", "error", "timeout", "usage-limit")
CHECKERS = ("critic", "source-checker", "reviewer", "checks")   # verdict PASS or FAIL
BUDGET_EXEMPT = ("checks", "critic-triage")
FROZEN_STAGES = (4, 5, 6)
# AC5 confirm: the stage's checker (research: the Source checker).
CONFIRM_CHECKER = {2: "critic", 3: "critic", 4: "critic", 5: "checks", 6: "reviewer", 8: "critic"}
RESPECIFY_WORDS = ("re-specify", "criteria-wrong", "checks-wrong")

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
               "attempts", "sessions", "dispatched_at", "usage_limit_since", "gate", "card", "resume", "spec",
               "superseded", "project", "outcome")
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
        ok = act in ("none", "done", "run-checks", "dispatch item-role") \
            or (act.startswith("card ") and act[5:] in GATES) \
            or (act.startswith("dispatch ") and act[9:] in ROLES)
        if not ok:
            raise UsageError(bad + "action %r" % (act,))
        if r.get("condition") not in (None, "frozen", "not-frozen"):
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


def route_matches(route, st, is_frozen):
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
    if cond is not None and bool(is_frozen(st.get("spec"))) != (cond == "frozen"):
        return False
    return True


NO_ROUTE = {"id": "no-route", "action": "card failure"}


def find_route(routing, st, is_frozen):
    """The first route matching the status (AC3)."""
    for r in routing.routes:
        if route_matches(r, st, is_frozen):
            return r
    return NO_ROUTE


# --------------------------------------------------------------------------
# The pure rules: routing, outcomes, decisions


class Context:
    """What the rules need from outside: the table, the clock, a spec's freeze, a new spec id."""

    def __init__(self, routing, now, is_frozen, new_spec):
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
    "evidence-return": "The evidence review is back.",
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
    if stage in FROZEN_STAGES and not ctx.is_frozen(st.get("spec")):
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


def route_item(ctx, st):
    """Route one status (AC3). Returns (route id, new status, action or None)."""
    r = find_route(ctx.routing, st, ctx.is_frozen)
    rid, act = r["id"], r["action"]
    if act == "none":
        return rid, st, None
    st = dict(st)
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


def apply_decision(ctx, st, word):
    """Apply the owner's (or the Chief of Staff's) word to the item's card (AC5).
    The word must be valid (valid_words). Returns (status, action or None)."""
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
    elif gate == "evidence":
        if word == "continue":
            st["state"] = "done"
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
            if gate == "stop":              # evidence
                to(8, "critic", reset=True)
            else:
                m = RESUME_RE.match(resume)
                to(int(m.group(1)), m.group(2))
        else:
            raise ValueError("unknown word %r" % (word,))
    return st, None


# --------------------------------------------------------------------------
# Status files


def _is_int(v):
    return isinstance(v, int) and not isinstance(v, bool)


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
    if not _is_int(st["stage"]) or st["stage"] not in STAGES:
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
    "dor": "The project passed the definition-of-ready check. Build it, re-aim it, or stop?",
    "dor-fail": "The project failed the definition-of-ready check. Resubmit a revised project document, or stop?",
    "criteria": "The plan review passed. Approve the acceptance criteria (the spec goes to its freeze), "
                "revise them, or stop?",
    "launch": "The launch review passed. Approve the launch, revise it, or stop?",
    "evidence": "The evidence review of the delivered project is back. Continue, re-aim, or stop?",
    "stop": "The work reached the stop rule. What happens next?",
    "failure": "The work could not go on. What happens next?",
}
WORD_EFFECT = {
    ("dor", "build"): "a new spec id is allocated and the project goes to Define (stage 3, the Definer)",
    ("dor", "re-aim"): "a dor-fail card for the Chief of Staff to revise the project document",
    ("dor-fail", "resubmit"): "back to the definition-of-ready check (stage 2, the Critic); the plan rounds "
                              "are kept, so a third FAIL still leads to Triage and a stop card",
    ("criteria", "approve"): "the Definer freezes the spec (stage 3, definer-freeze)",
    ("criteria", "revise"): "back to the Definer (stage 3)",
    ("launch", "approve"): "the project is delivered (done)",
    ("launch", "revise"): "back to the Builder for the launch (stage 6)",
    ("evidence", "continue"): "the evidence review is done",
    ("evidence", "re-aim"): "closed (re-aim); the Chief of Staff files new requests",
    ("stop", "retry"): "the evidence review runs again (stage 8, the Critic), rounds reset",
    ("stop", "resubmit"): "back to the definition-of-ready check (stage 2, the Critic), rounds reset",
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


def card_text(routing, item, st, action, links, words):
    gate, n = action["gate"], action["card"]
    record = "decisions/%s/%s-%d.md" % (item, gate, n)
    notes = "decisions/%s/%s-%d-notes.md" % (item, gate, n)
    answered = routing.gates.get(gate, {}).get("answered_by", "owner")
    out = ["# Decision card — %s %s-%d" % (item, gate, n), "",
           "item: %s   kind: %s   gate: %s   card: %d   route: %s" % (item, st["kind"], gate, n, action["route"]),
           "answer: write `%s`, first line `Decision: <word>` (one of the words below)." % record,
           "", "## 1. The decision", GATE_QUESTION.get(gate, ""), "",
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
    for w in words:
        effect = WORD_EFFECT.get((gate, w)) or WORD_EFFECT_ANY.get(w, "")
        refused = " A `Proxy:` line is refused on this word." if "%s.%s" % (gate, w) in routing.proxy_refused else ""
        out.append("- `%s` — %s.%s" % (w, effect, refused))
    out += ["", "## 5. Recommendation", "The Chief of Staff's part: `%s`." % notes, "",
            "## 6. If you don't decide",
            "Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the "
            "budget (model S-012 AC6).", "",
            "## 7. Who has checked it"]
    out += ["- %s" % l for l in links] or ["- (no record)"]
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
        self.ctx = Context(self.routing, now, self.is_frozen, self.new_spec)

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

    def log(self, **fields):
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
            elif kind == "evidence" and not self._done_project(data.get("project")):
                refuse("the project %r is not a project item in state done" % (data.get("project"),))
            else:
                if kind == "project":
                    st = new_status("project", 2, "critic")
                elif kind == "research":
                    st = new_status("research", 2, "researcher")
                    self.research.append(("%s/%s.md" % (RESEARCH_DIR, item),
                                          "# Research question — %s\n\n*Copied by the Orchestrator from %s "
                                          "(model S-012 AC2).*\n\n## The question\n\n%s\n"
                                          % (item, rel, data["question"].strip())))
                else:
                    st = new_status("evidence", 8, "critic", project=data["project"])
                self.items[item] = st
                self.all_ids.add(item)
                self.processed["requests"].append(item)
                self.trigger[item] = "request:%s" % item
                self.log(trigger="request", item=item, record=rel, result="created")

    def _done_project(self, pid):
        st = self.items.get(pid) if isinstance(pid, str) else None
        return bool(st) and st["kind"] == "project" and st["state"] == "done"

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
            with open(self.path(rel), encoding="utf-8", newline="") as fh:
                first = fh.readline()
                second = fh.readline()
            self.decide(item, st, rel, first, second)

    def decide(self, item, st, rel, first, second):
        h = sha(first + second)
        key = "decision:%s:%s" % (rel, h)
        if key in self.anomaly_keys:
            return
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
        if gate == "launch" and self.item_tips is not None and self.launch_stale(item, st, rel, key, word, h):
            return
        st2, action = apply_decision(self.ctx, st, word)
        self.items[item] = st2
        self.touched.add(item)
        self.processed["decisions"][rel] = h
        self.trigger[item] = "decision:%s" % rel
        fields = dict(trigger="decision", item=item, record=rel, gate=gate, card=st["card"], word=word,
                      proxy=proxy, result="%s/%d/%s" % (st2["state"], st2["stage"], st2["role"]))
        if word in self.routing.strikes:
            fields["strike"] = bool(self.routing.strikes[word])
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
        """model S-013 AC4: True when the answer is not applied: `approve` on a card without a tip (the card
        stays open), or any answer to a tip that is not the item's current one or that was written before
        the card's last stamp (refused with a fresh launch card)."""
        tip = self.launch_card_tip(item, st["card"])
        info = self.item_tips.get(item) if isinstance(self.item_tips, dict) else None
        info = info if isinstance(info, dict) else {}
        if tip is None:
            if word != "approve":
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
        action = _card(st2, "launch", "launch-pass",
                       "The owner's answer to launch card %d was refused: %s. This fresh card names the current "
                       "tip (model S-013 AC4)." % (st["card"], why))
        self.act(item, action)
        return True

    # -- phase 4: routing
    def route(self):
        for item in sorted(self.items):
            rid, st2, action = route_item(self.ctx, self.items[item])
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
            self.plan.append({"item": item, "route": action["route"], "action": action["action"],
                              "role": action["role"], "stage": action["stage"], "spec": action["spec"],
                              "gate": None})
            self.log(trigger=trigger, item=item, route=action["route"], action=action["action"],
                     role=action["role"], gate=None, stage=action["stage"], spec=action["spec"])
        elif action["kind"] == "done":
            self.log(trigger=trigger, item=item, route=action["route"], action="done", role=st["role"], gate=None,
                     stage=st["stage"])
        else:
            gate, n = action["gate"], action["card"]
            self.log(trigger=trigger, item=item, route=action["route"], action="card", role=st["role"], gate=gate,
                     card=n, stage=st["stage"], reason=action.get("reason"))
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
            self.cards.append(("%s/%s-%s-%d.md" % (QUEUE_DIR, item, gate, n),
                               card_text(self.routing, item, st, action, links, words)))
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
