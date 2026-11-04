"""Measure the Critic's and the gate Critic's packs for P-003, today and with option A.

Run from the repository root: python3 -I reviews/P-003-critic-pack-cap/measure.py
It uses the pipeline's own pattern matcher (governance/checks/session_runner.py `_any`), counts only
files the pack would copy (at most RUNNER.toml's per-file limit, not a Chief of Staff notes file), and
approximates {spec} and {ruling} as absent (P-003 has neither yet).
"""
import os
import sys
sys.path.insert(0, os.path.join("governance", "checks"))
import session_runner as s  # noqa: E402

FILE_CAP, TOTAL_CAP = 1048576, 20971520
CRITIC = ["docs/PROJECT.md", "docs/playbooks/**", "library/**", "tests/acceptance/**", "checks/**",
          "governance/standards/definition-of-ready.md", "decisions/**", "docs/users/**", "research/**"]
GATE = ["docs/gates/P-003/**", "docs/gates/_GATE.md", "docs/PROJECT.md", "reviews/P-003/**", "decisions/P-003/*.md",
        "status/P-003.toml", "dispatch-log/*.jsonl", "research/**", "docs/handover/**", "status/merges.jsonl",
        "reviews/**", "decisions/questions/**", "docs/users/**"]
TODAY = ["docs/design/**"]
OPTION_A = ["docs/design/**/*.md", "docs/design/screens/**"]


def size(globs):
    total, left_out = 0, 0
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules")]
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), ".").replace(os.sep, "/")
            if not s._any(globs, rel) or (rel.startswith("decisions/") and rel.endswith("-notes.md")):
                continue
            n = os.path.getsize(rel)
            if n > FILE_CAP:
                left_out += 1
            else:
                total += n
    return total, left_out


for name, globs in (("critic, today", CRITIC + TODAY), ("critic, option A", CRITIC + OPTION_A),
                    ("critic-gate, today", GATE + TODAY), ("critic-gate, option A", GATE + OPTION_A)):
    total, left_out = size(globs)
    print("%-22s %11d bytes (%5.1f MB)  %s the 20 MB limit; %d file(s) over 1 MB left out"
          % (name, total, total / 1e6, "over" if total > TOTAL_CAP else "under", left_out))
