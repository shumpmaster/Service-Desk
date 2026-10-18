"""J13's fixtures (spec S-001, model 3.5.0's records, 2026-10-17): the Chief of Staff's session files.

    python3 tests/desk/tools/j13-fixtures.py tests/desk/fixtures/j13      (from the repository's root)

Writes, under <out>:
- real/sessions/chief-of-staff/session_012RJPVKAoLga2RkqLYRDcBY.jsonl: the first session file on the default branch,
  copied unchanged from 21bc250 (`git show`);
- good/sessions/chief-of-staff/*.jsonl: NOT real records, written in S-033 AC6's forms, which the model's own
  `python3 governance/checks/v3_checks.py sessions --root <a v3 root holding them>` passes; its output in
  good/check.txt;
- bad/sessions/chief-of-staff/s-bad.jsonl: NOT a real record: out-of-form lines, the same command's failures in
  bad/check.txt, one line each (the desk names and skips those it mirrors, and reads the rest as written).

The times are on 2026-10-17 (UTC); the tests set their clock against them.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.getcwd()
OUT = sys.argv[1]
D = "2026-10-17T"


def usage(**over):
    u = {k: None for k in ("input_tokens", "output_tokens", "cache_read_input_tokens", "cache_creation_input_tokens",
                           "num_turns", "duration_ms", "context_window", "autocompact_threshold", "context_peak",
                           "compactions")}
    u.update({"derived": ["context_peak"], "would_have_stopped": None, "cost_usd_estimate": None})
    u.update(over)
    return u


def start(sid, t, doing):
    return {"event": "start", "session": sid, "time": D + t, "doing": doing}


def helper(sid, role, a, b, tokens=None, tool_uses=None, duration_ms=None):
    return {"event": "helper", "session": sid, "role": role, "started": D + a, "ended": D + b,
            "reported": {"tokens": tokens, "tool_uses": tool_uses, "duration_ms": duration_ms}}


def end(sid, t, **u):
    return {"event": "end", "session": sid, "time": D + t, "usage": usage(**u)}


GOOD = {
    # One piece ended, with a definer helper (figures) and a helper whose role the roster lacks (nulls); its end
    # line's usage holds duration_ms and every other figure null.
    "s-ended": [start("s-ended", "08:00:00Z", "Filing your question on the desk plan's fourth review"),
                helper("s-ended", "definer", "08:05:00Z", "08:40:00Z", 52340, 31, 2100000),
                helper("s-ended", "ux-researcher", "08:45:00Z", "09:00:00Z"),
                end("s-ended", "09:10:00Z", duration_ms=4200000)],
    # One piece under way (started 11:00), with a definer helper that ended at 11:31.
    "s-open": [start("s-open", "11:00:00Z", "Revising the desk plan for model 3.5.0's records"),
               helper("s-open", "definer", "11:10:00Z", "11:31:00Z", 1200, 4, 1260000)],
    # A second session under way at once, started later (11:30).
    "s-two": [start("s-two", "11:30:00Z", "Recording your answers to the two desk questions")],
    # A piece followed by a second start (the first ended, time not recorded), then an end.
    "s-restart": [start("s-restart", "06:00:00Z", "A first piece that never handed back"),
                  start("s-restart", "06:30:00Z", "A second piece"),
                  end("s-restart", "07:00:00Z", duration_ms=1800000)],
    # A piece left open since 03:30: under way until 11:30, then "ended, time not recorded".
    "s-old": [start("s-old", "03:30:00Z", "A piece left open overnight")],
    # An end line before any start, a piece, and an end line after an end.
    "s-orphan": [end("s-orphan", "05:00:00Z", duration_ms=60000),
                 start("s-orphan", "05:10:00Z", "A short piece"),
                 end("s-orphan", "05:20:00Z", duration_ms=600000),
                 end("s-orphan", "05:25:00Z", duration_ms=900000)],
    # A made-up end line with a cost (no tool gives the Chief of Staff its cost today).
    "s-cost": [start("s-cost", "10:00:00Z", "A made-up piece whose end line has a cost"),
               end("s-cost", "10:20:00Z", duration_ms=1200000, cost_usd_estimate=1.234)],
}

B = "s-bad"
ok_start = json.dumps(start(B, "09:00:00Z", "A piece in a file with out-of-form lines"))
BAD = [
    # 1: in form
    ok_start,
    # The findings the desk mirrors (each named and skipped).
    "not json",                                                                                  # 2
    '{"event": "start", "session": "s-bad", "time": NaN, "doing": "x"}',                          # 3
    json.dumps({"session": B, "time": D + "09:01:00Z", "doing": "no event"}),                      # 4
    json.dumps({"event": 5, "session": B, "time": D + "09:02:00Z", "doing": "x"}),                 # 5
    json.dumps({"event": "pause", "session": B, "time": D + "09:03:00Z"}),                         # 6
    json.dumps({"event": "start", "session": B, "time": D + "09:04:00Z"}),                         # 7
    json.dumps({"event": "start", "session": B, "time": D + "09:05:00Z", "doing": "x", "note": "extra"}),  # 8
    json.dumps({"event": "start", "session": 7, "time": D + "09:06:00Z", "doing": "x"}),           # 9
    json.dumps({"event": "start", "session": "other", "time": D + "09:07:00Z", "doing": "x"}),     # 10
    json.dumps({"event": "start", "session": B, "time": D + "09:08:00Z", "doing": "   "}),         # 11
    json.dumps(dict(helper(B, "definer", "09:09:00Z", "09:10:00Z"), role="")),                     # 12
    json.dumps({"event": "start", "session": B, "time": "2026-10-17 09:11:00", "doing": "x"}),     # 13
    json.dumps({"event": "start", "session": B, "time": "2026-02-30T09:12:00Z", "doing": "x"}),    # 14
    json.dumps(dict(helper(B, "definer", "09:13:00Z", "09:14:00Z"), reported=[])),                 # 15
    json.dumps(dict(helper(B, "definer", "09:15:00Z", "09:16:00Z"), reported={"tokens": 1, "tool_uses": 1})),  # 16
    json.dumps(dict(helper(B, "definer", "09:17:00Z", "09:18:00Z"),
                    reported={"tokens": 1, "tool_uses": 1, "duration_ms": 1, "cost": 2})),       # 17
    json.dumps(helper(B, "definer", "09:19:00Z", "09:20:00Z", tokens=True)),                     # 18
    json.dumps(helper(B, "definer", "09:21:00Z", "09:22:00Z", tokens=-1)),                       # 19
    json.dumps(helper(B, "definer", "09:24:00Z", "09:23:00Z")),                                  # 20
    # The findings the desk does not mirror (read as written).
    '{"event": "start", "session": "s-bad", "time": "2026-10-17T09:40:00Z", "doing": "first", "doing": "a repeated key"}',  # 21
    '{"event": "helper", "session": "s-bad", "role": "definer", "started": "2026-10-17T09:41:00Z", '
    '"ended": "2026-10-17T09:42:00Z", "reported": {"tokens": 1.0, "tool_uses": 2, "duration_ms": 60000}}',  # 22
    json.dumps(start(B, "08:00:00Z", "A start earlier than the line before")),                   # 23
    # An end line's usage by J10's rule (read, closing its piece).
    json.dumps(dict(end(B, "09:50:00Z", duration_ms=600000), usage=dict(usage(duration_ms=600000), cost_usd_estimate="a lot"))),  # 24
    json.dumps(start(B, "10:00:00Z", "A piece whose end line's usage is not an object")),        # 25
    json.dumps({"event": "end", "session": B, "time": D + "10:30:00Z", "usage": "none"}),         # 26
]


def write(rel, text):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(text)


def check(sub):
    root = tempfile.mkdtemp()
    try:
        os.makedirs(os.path.join(root, "governance"))
        open(os.path.join(root, "governance", "v3.toml"), "w").close()
        shutil.copytree(os.path.join(OUT, sub, "sessions"), os.path.join(root, "sessions"))
        r = subprocess.run([sys.executable, os.path.join(HERE, "governance", "checks", "v3_checks.py"), "sessions",
                            "--root", root], capture_output=True, text=True)
        text = "exit %d\n%s" % (r.returncode, (r.stdout + r.stderr).replace(root + os.sep, "").replace(root, "<root>"))
        write(os.path.join(sub, "check.txt"), text)
        return text
    finally:
        shutil.rmtree(root)


real = subprocess.run(["git", "show", "21bc250:sessions/chief-of-staff/session_012RJPVKAoLga2RkqLYRDcBY.jsonl"],
                      check=True, capture_output=True, text=True).stdout
write("real/sessions/chief-of-staff/session_012RJPVKAoLga2RkqLYRDcBY.jsonl", real)
for sid, lines in GOOD.items():
    write("good/sessions/chief-of-staff/%s.jsonl" % sid, "".join(json.dumps(l) + "\n" for l in lines))
write("bad/sessions/chief-of-staff/%s.jsonl" % B, "".join(l + "\n" for l in BAD))
print(check("good"))
print(check("bad"))
