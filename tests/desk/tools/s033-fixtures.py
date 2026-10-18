"""J2's S-033 fixtures (spec S-001, model 3.5.0's records, 2026-10-17): made or checked by the model's own code.

    python3 tests/desk/tools/s033-fixtures.py <out dir>      (from the repository's root)

Writes into <out dir> (tests/desk/fixtures/s033/), and prints what each check of the model said:

- questions/S033-*.md: question files written from questions/_TEMPLATE.md at 368effa (model S-033 AC2), one for
  a project milestone, two ids, a standard id and `none (<reason>)`; each passed by
  `python3 governance/checks/governance_checks.py questions --root <a v3 root holding them>`.
- queue/P-002-stop-1.md: a card written by `card_text` (governance/checks/orchestrator.py) with a milestone and a
  spec path; queue/P-003-launch-2.md: a launch gate card written by `card_text` with neither (its `## Context`
  then comes before `## 8.`); queue/Q-013-stop-2.md: a research item's stop card with no milestone.
- decisions/questions/S033-milestone.md: the Chief of Staff's answer form (`Proxy:` on line 2, `Milestone:` on
  line 3), passed against its question by `closing_problem` (governance/checks/asks_merge.py), the asks-merge
  job's check of kind (b). The real answers P-001-asks-merge-on-desk.md and P-001-cos-sessions-on-desk.md are
  checked against their real questions (questions/<name>.md at 3f206a5) the same way.

The model's code is imported from governance/checks/ (read only). Nothing here is a real record unless the README
says so.
"""
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.getcwd()
sys.path.insert(0, os.path.join(HERE, "governance", "checks"))
import asks_merge  # noqa: E402
import orchestrator  # noqa: E402

OUT = sys.argv[1]


def git_show(rev_path):
    return subprocess.run(["git", "show", rev_path], check=True, capture_output=True, text=True).stdout


def write(rel, text):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(text)


TEMPLATE = git_show("368effa:questions/_TEMPLATE.md")
write("questions/_TEMPLATE.md", TEMPLATE)


def question(title, milestone, facts):
    """A question in the template's form, every placeholder filled in (NOT a real record)."""
    lines = ["# Ruling needed: %s" % title, "", "Milestone: %s" % milestone, "",
             "WHY: a made-up question for the desk's tests; it unblocks what its Milestone line names.",
             "OPTIONS:",
             "  A. Yes — the made-up work goes ahead.",
             "  B. No — it waits.",
             "RECOMMENDATION: A — it is a test.",
             "RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the desk's tests only",
             "DEFAULT: A   TIMEOUT: 48", "", "## Context"]
    lines += ["- %s (source: %s)" % f for f in facts]
    return "\n".join(lines) + "\n"


QUESTIONS = {
    "S033-milestone": question("A made-up question naming one project milestone", "MD3",
                               [("The chosen design is to run on the real back end", "docs/PROJECT.md, section 3"),
                                ("The sandbox reads the default branch only (it has a second paren (here))",
                                 "specs/S-001.md, J11")]),
    "S033-two": question("A made-up question naming two milestones", "M2, M2B",
                         [("Both milestones list PR #44", "docs/PROJECT.md, section 3")]),
    "S033-standard": question("A made-up question naming a standard milestone", "Design-6",
                              [("A plan passes review before the Build gate", "governance/checks/v3_checks.py")]),
    "S033-none": question("A made-up question serving no milestone", "none (a records-only question)",
                          [("Records-only questions serve no milestone", "AGENTS.md, §5")]),
}
for name, text in QUESTIONS.items():
    write("questions/%s.md" % name, text)

# The model's own check of the question files, in a v3 root holding only them.
root = tempfile.mkdtemp()
try:
    os.makedirs(os.path.join(root, "governance"))
    open(os.path.join(root, "governance", "v3.toml"), "w").close()
    os.makedirs(os.path.join(root, "questions"))
    for name, text in QUESTIONS.items():
        with open(os.path.join(root, "questions", name + ".md"), "w", encoding="utf-8") as fh:
            fh.write(text)
    r = subprocess.run([sys.executable, os.path.join(HERE, "governance", "checks", "governance_checks.py"),
                        "questions", "--root", root], capture_output=True, text=True)
    print("governance_checks.py questions: exit %d" % r.returncode)
    print((r.stdout + r.stderr).strip())
finally:
    shutil.rmtree(root)

# Two cards, by the model's card_text, with Service-Desk's own routing table.
routing = orchestrator.load_routing(os.path.join(HERE, "governance", "ROUTING.toml"))
st = {"kind": "project", "stage": 5, "role": "builder", "last_verdict": "FAIL", "plan_round": 2, "build_round": 3,
      "confirm_used": False, "sessions": 7, "spec": "S-002"}
card1 = orchestrator.card_text(routing, "P-002", st, {"gate": "stop", "card": 1, "route": "stop-rule",
                                                       "reason": "The build round limit is reached."},
                               ["reviews/S-002/reviewer.md"], ["resubmit", "re-specify", "kill"],
                               milestone="M2", spec_path="specs/S-002-made-up.md")
write("queue/P-002-stop-1.md", card1)
st2 = {"kind": "project", "stage": 6, "role": "critic-gate", "last_verdict": "PASS", "plan_round": 1, "build_round": 1,
       "confirm_used": False, "sessions": 3, "gate_n": 2,
       "gate_recommendation": "**The Critic's recommendation:** proceed — the launch review passed."}
card2 = orchestrator.card_text(routing, "P-003", st2, {"gate": "launch", "card": 2, "route": "launch-gate"},
                               ["reviews/P-003/critic-gate.md"], ["proceed", "hold", "recycle", "kill"])
write("queue/P-003-launch-2.md", card2)
st3 = {"kind": "research", "stage": 2, "role": "critic-triage", "last_verdict": "FAIL", "plan_round": 3, "build_round": 0,
       "confirm_used": True, "sessions": 9}
card3 = orchestrator.card_text(routing, "Q-013", st3, {"gate": "stop", "card": 2, "route": "third-fail"},
                               ["reviews/Q-013/source-check.md"], ["re-specify", "drop", "retry"])
write("queue/Q-013-stop-2.md", card3)
print("card_text: queue/P-002-stop-1.md (Milestone: M2, spec specs/S-002-made-up.md), "
      "queue/P-003-launch-2.md (a launch gate card, no milestone, no spec) and "
      "queue/Q-013-stop-2.md (a research item's stop card, no milestone: AC66 falls to its item)")

# The Chief of Staff's answer form, checked by the asks-merge job's own check of kind (b).
answer = ("Ruling: A — the made-up work goes ahead\n"
          "Proxy: done at the owner's request (a made-up answer for the desk's tests)\n"
          "Milestone: MD3\n\n"
          "Question, as put: \"A made-up question naming one project milestone\"\n")
write("decisions/questions/S033-milestone.md", answer)
print("closing_problem(S033-milestone): %r" % (asks_merge.closing_problem("S033-milestone", QUESTIONS["S033-milestone"],
                                                                          answer),))
for name in ("P-001-asks-merge-on-desk", "P-001-cos-sessions-on-desk"):
    q = git_show("3f206a5:questions/%s.md" % name)
    a = git_show("d727b64:decisions/questions/%s.md" % name)
    write("questions/%s.md" % name, q)
    write("decisions/questions/%s.md" % name, a)
    print("closing_problem(%s, the real question at 3f206a5, the real answer at d727b64): %r"
          % (name, asks_merge.closing_problem(name, q, a)))
write("decisions/questions/P-001-asks-merge.md", git_show("368effa:decisions/questions/P-001-asks-merge.md"))
