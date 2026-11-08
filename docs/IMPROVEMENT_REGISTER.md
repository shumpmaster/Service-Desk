# Improvement register

*One row per landed change, newest first, in the same PR as its ledger entry. Plain English
first, then the measured delta on the instrument that judged it, then the evidence. A row is
written only after its measurement has run, never as a promise. "No change" is a valid and
honest row.*

*Standing yardstick: <the one metric most changes are judged against, and its current value>.*

| date | change | what it delivered, measured | evidence |
| --- | --- | --- | --- |
| 2026-11-08 | The Definer's pack gains the join-up review form (L-0037) | Measured on `session_runner.py pack` for a P-003/S-005 Definer entry, from main's tree at 65e0c00: 119 files and no docs/design/ before, 120 after (116 and 117 from item/P-003's tree), the one added file docs/design/JOIN_UP_REVIEW.md. Its effect on the review, whether the next join-up section follows the form, is measured at the Critic's next plan review of S-005 | governance/PACKS.toml; docs/LEDGER.md L-0037; decisions/questions/definer-join-up-form.md |
| 2026-11-07 | The three plan-writer commits of EXP-008 exempt from the range checks (L-0034 to L-0036) | Measured on this branch: `v3_checks scope --base origin/main` went from 3 violations ("builder commit by 'definer' has no Spec: trailer") after the registration's merge to pass after the exempt lines; surface_guard diff passes before the exempt lines and, with the ledger entries, after them | governance/SURFACES.md exempt block; docs/LEDGER.md L-0034 to L-0036; decisions/questions/P-004-result-spec.md |
| 2026-11-07 | The Builder's EXP-007 result commit exempt from the range checks (L-0033) | Measured on this branch: `v3_checks scope --base origin/main` went from 1 violation ("builder commit by 'builder' has no Spec: trailer") at the commit before the exempt line to pass after it; surface_guard diff passes both before and after | governance/SURFACES.md exempt block; docs/LEDGER.md L-0033; decisions/questions/P-004-result-spec.md |
| 2026-11-05 | The nine plan-writer commits of EXP-007 exempt from the range checks (L-0024 to L-0032) | Measured on PR #300's branch: `v3_checks scope` went from 9 violations ("Spec: P-004 names no spec file") to pass; surface_guard diff still passes; no other check result changed apart from the PR's risk class rising to R3, which needs the Reviewer's and the owner's verdicts | governance/checks/v3_checks.py scope and surface_guard.py diff, before and after; reviews/300/reviewer.md |
| 2026-11-05 | Model 3.7.2: the check run's copy and a cut-short history (L-0023) | Measured on `v3_checks trace` in this session's shallow clone: 9 violations and exit 1 before, 9 NOTEs and its OK line after; the check run's copy itself is first measured on the desk's next check run | governance/checks/v3_checks.py trace, before and after; reviews/307/reviewer.md |
| 2026-11-05 | Model 3.7.0: a later project item may have a plan of its own (L-0022) | Measured on the timeline: P-003 and P-004 now read "Success defined" and "Scope agreed" as not recorded instead of borrowing the desk's; every other check result is unchanged | governance/checks/v3_checks.py trace, before and after; reviews/302/reviewer.md |
| 2026-10-19 | A Design reviewer whose verdict changes to the page's code need (L-0018) | Not measured yet. Its measure is the design findings the owner raises later that its reviews missed | governance/domains/design/README.md; .claude/agents/design-reviewer.md |
