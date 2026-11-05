# Improvement register

*One row per landed change, newest first, in the same PR as its ledger entry. Plain English
first, then the measured delta on the instrument that judged it, then the evidence. A row is
written only after its measurement has run, never as a promise. "No change" is a valid and
honest row.*

*Standing yardstick: <the one metric most changes are judged against, and its current value>.*

| date | change | what it delivered, measured | evidence |
| --- | --- | --- | --- |
| 2026-11-05 | Model 3.7.2: the check run's copy and a cut-short history (L-0023) | Measured on `v3_checks trace` in this session's shallow clone: 9 violations and exit 1 before, 9 NOTEs and its OK line after; the check run's copy itself is first measured on the desk's next check run | governance/checks/v3_checks.py trace, before and after; reviews/307/reviewer.md |
| 2026-11-05 | Model 3.7.0: a later project item may have a plan of its own (L-0022) | Measured on the timeline: P-003 and P-004 now read "Success defined" and "Scope agreed" as not recorded instead of borrowing the desk's; every other check result is unchanged | governance/checks/v3_checks.py trace, before and after; reviews/302/reviewer.md |
| 2026-10-19 | A Design reviewer whose verdict changes to the page's code need (L-0018) | Not measured yet. Its measure is the design findings the owner raises later that its reviews missed | governance/domains/design/README.md; .claude/agents/design-reviewer.md |
