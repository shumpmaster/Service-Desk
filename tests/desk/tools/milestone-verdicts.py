"""The model's verdict on each milestone line of a docs/PROJECT.md (spec S-001, J11's reached fixture).

    python3 tests/desk/tools/milestone-verdicts.py <PROJECT.md> [...]   (from the repository's root)

Runs `milestone_lines` from governance/checks/v3_checks.py (the model's own reader, S-033 AC7) on
each file and prints, as JSON, { file: { "read": [{lineno, id, reached, dropped, why, sprints}],
"skipped": [{lineno, message}] } }. The desk's J11 test reads the output (committed as
tests/desk/fixtures/j11-reached/model-verdicts.json) and checks it reads and skips exactly these lines.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.getcwd(), "governance", "checks"))
import v3_checks  # noqa: E402

out = {}
for path in sys.argv[1:]:
    with open(path, encoding="utf-8") as f:
        ms, problems = v3_checks.milestone_lines(f.read())
    out[path] = {
        "read": [{"lineno": m.lineno, "id": m.id, "reached": m.reached, "dropped": m.dropped, "why": m.why,
                  "sprints": m.sprints} for m in ms],
        "skipped": [{"lineno": n, "message": msg} for n, msg in problems],
    }
print(json.dumps(out, indent=2, ensure_ascii=False))
