# Ruling needed: On Waiting, should a project whose first read is still on its way be named, instead of the lanes showing 0?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: G9b's design review (round 1, N1) found that on Waiting, with one project failed, one still being read and one read, the screen says "Not read in this opening", "Nothing waiting: Personal-Org-Operating-Model" and "✕ Can't read Alpha in this opening", then "Waiting on you 0" and "Nothing here". Nothing says Service-Desk is still being read, and the lane shows 0 while its count isn't known yet. This was so before G9b. Left unruled, it stays as built.
OPTIONS:
  A. Name it — a grey line "Still reading Service-Desk…" among Waiting's quiet lines until its first read answers; the lanes' 0 stays, since the other projects are read.
  B. As built — the line under the title already says not everything is read.
RECOMMENDATION: A — the 0 reads as an all-clear for a project the desk hasn't seen yet; one grey line says what's missing.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: Waiting's quiet lines, only while a project's first read is on its way
DEFAULT: B   TIMEOUT: 168

## Context
- The finding (source: reviews/M3E/_stage-g9b-design-r1-verbatim.md, N1)
- The capture (source: docs/design/builds/m3e-g9b/g9b-waiting-failed-held-360x740-dark-MADE-UP-NOT-real.png; made up, not real)
- Waiting's lanes for the unknown (source: specs/S-001.md, AC91 (f))
