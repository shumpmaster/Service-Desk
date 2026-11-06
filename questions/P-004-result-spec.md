# Ruling needed: How should the widget test's result be filed, so it passes the desk's scope check?

Milestone: none (the widget's milestone, M5, is still only a proposal in its plan, so nothing here serves a milestone yet)
Asked in session: session_01QBwHGJ3UVJ6HY4SS92w7UW

WHY: The widget test's result has to be written up and filed beside the desk's other test results, and the test's rules give that job to the Builder. One of the desk's checks needs every Builder commit to name a written spec that has its own file, and the widget project, P-004, has none yet. Naming the project instead fails the check, and so does naming nothing: that is the slip that needed your exemption of the nine commits last time, and I won't repeat it. So before the Builder files the result, the desk needs a way that passes. Until you rule, the result isn't filed, and the test data stays on its portfolio branch, since it is deleted only after the result is filed. Nothing the desk does or shows changes, whichever you choose.
OPTIONS:
  A. "A short spec for the widget (Recommended)" — "The plan-writer writes P-004's own spec, whose only allowed file for now is the result, the Critic checks it, and it is frozen; the Builder's commit then names it and the check passes. Any widget P-004 goes on to build needs a spec of its own anyway, and a later spec can build on this one. About a day; nothing for you to do."
  B. "Exempt the one commit" — "The Builder files the result, and that one commit is added to the desk's list of commits its scope and surface checks skip, with an entry in the decision log, as was done for the nine. Your merging the pull request is your approval. Quickest, but it is the second exemption for the same cause, and the list grows each time a project without a spec needs a Builder record."
  C. "Change the check" — "The check is changed so a Builder commit may name a project like P-004 when it changes only a test result file. Fixes this for every later project, but it is a change to the desk's own tools: its own written plan, the Critic's check, the Reviewer's, and your approval. A few days; the result waits until it's done."
RECOMMENDATION: A, because it follows the desk's rule that built work traces to a spec, needs no exemption, and is work P-004 needs whichever way it goes. My confidence is medium-high. It would change if you want the result filed today; then B.
RISK CLASS: R3   REVERSIBILITY: reversible   BLAST RADIUS: only how the result's commit passes the desk's checks; B changes which commits the checks skip, which needs your approval; nothing the desk does or shows
DEFAULT: none (option B changes the list of commits the checks skip, which needs your approval, so no option is taken by default)   TIMEOUT: none

## Context
- The registration says the result is filed at docs/handover/experiments/EXP-007-result.md, recorded by the Builder from the Reviewer's verdict (source: experiments/EXP-007-widget-refresh.md, "runner" and "result")
- docs/handover/** is the Builder's to write; the orchestrator's surface excludes it (source: governance/SURFACES.md, surface:builder and surface:orchestrator)
- The scope check fails a Builder commit with no Spec: trailer, and a Spec: trailer that is not an S-numbered spec with a file in specs/ (source: governance/checks/v3_checks.py, check_scope; governance/checks/govlib.py, SPEC_REF_RE)
- The only spec in specs/ is S-001, the desk's first version, which is P-001's (source: specs/S-001.md, header)
- Freezing a spec needs the Critic's plan review recorded as PASS (source: governance/checks/v3_checks.py, module notes on freeze)
- The nine commits that wrote the test's plan carried `Spec: P-004` and were exempted by your ruling, with ledger entries L-0024 to L-0032 (source: decisions/questions/P-004-registration-commits.md)
- The test data on portfolio's branch exp-007-test-data is deleted only after the result is filed (source: docs/handoff/2026-11-04-chief-of-staff-widget.md, "Next", item 4)
