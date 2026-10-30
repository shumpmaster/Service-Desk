# Ruling needed: How your Build checklist records what was and wasn't done the model's way

Milestone: M3C, Build-1, Build-2, Build-3
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: The Launch gate's case lists your model's Build checklist, and three of its five items were not met as the model writes them, because you chose to build the desk outside the pipeline, from its draft plan. "Tests written before the work" (Build-1: checks locked by a check author before any work, with hidden tests) was not done: the Builder wrote its own tests with each milestone. "The work is built" (Build-2: built to the frozen plan, its checks passing) was built to the draft plan, which never froze, with the Builder's tests passing. "Independently reviewed and passing" (Build-3: the Reviewer tries to break it, and it holds against hidden tests too) had the Reviewer pass every pull request, but there are no hidden tests. The other two, "The experiments are answered" (Build-4) and "Everything built fits together" (Build-5), are met the model's way once EXP-006's result is recorded and Build's join-up review passes. Launch's five are taken on; one of them, "Its own monitoring and feedback works" (Launch-4), is confirmed for two parts, the 14-day measures and the weekly value check, only in their before-launch forms (a trial week and a dry run), since you ruled both start after launch: Launch-4 is taken on in the way option B would take on Build-2 and Build-3, with a reason saying how it differed. A line recorded as skipped needs your own ruling. Needed before your Chief of Staff writes the lines and the case. At the timeout the record would read A (defaulted), but no line is ever skipped on a default, so in effect no Build line is written (option C).
OPTIONS:
  A. Skip all three, with the reasons — Build-1, Build-2 and Build-3 are recorded as skipped, each with what was done instead: the Builder's own tests; the draft plan, never frozen; the Reviewer's reviews, with no hidden tests. Build-4, Build-5 and Launch's five are taken on. The case shows the three as skipped with those reasons, and its findings say how the desk was built instead. Read at a glance, "skipped" beside "The work is built" and "Independently reviewed" can look as if neither happened; the reason beside each says both were done another way. Nothing is built or changed.
  B. Skip Build-1 only — Build-1 is skipped; Build-2 and Build-3 are recorded as taken on, each with a reason saying how it differed (the draft plan, never frozen; no hidden tests). The case shows them as taken on with those reasons, so at a glance the checklist reads as more done the model's way than it was.
  C. Leave Build's lines out — only Launch's five lines are written. The case shows Build's checklist with no line saying what was and wasn't done, and its findings say so.
RECOMMENDATION: A — it records each item as it happened, in the model's own terms, so no line reads as done the model's way when it wasn't; the reasons beside the skipped lines say the work was still built and reviewed.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the project document's checklist lines, and how the Launch gate's case shows Build
DEFAULT: A (in effect C: no line is skipped on a default)   TIMEOUT: 168

## Context
- Build's five standard milestones and their done-whens (source: Personal-Org-Operating-Model OPERATING_MODEL.md §4, "Standard milestones")
- The build path you chose (source: decisions/questions/P-001-build-path.md, question 0; docs/LEDGER.md, L-0003: "There are no locked acceptance tests or Critic gate for S-001")
- No hidden tests exist (source: governance/HOLDOUTS.md)
- The spec stays a draft (source: specs/S-001.md, its header, status: draft)
- The two monitoring parts that start after launch, and their before-launch forms (source: specs/S-001.md, "The desk live at the needs-you address: M3C, through the Launch gate"; decisions/questions/P-001-m3b-window.md)
- Skipping a Build or Launch line needs your ruling here (source: docs/PROJECT.md section 3, its instruction; governance/checks/v3_checks.py, build_gate_passed)
- Reversible questions adopt the recommendation at timeout (source: AGENTS.md §5)
