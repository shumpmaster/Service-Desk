# Ruling needed: After the desk fully reloads, should an "Add your own words" fold that holds your kept words open again?

Milestone: M3G
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: QW1's design review (round 1, Q1). Words you type under a question's "Add your own words" are kept on your phone, and come back after a full reload (decisions/questions/P-001-audit-reload.md, A). But the fold comes back closed, with no sign it holds words, so you may not see your half-written answer; and the kept scroll lands a little higher because the closed folds make the page shorter. AC94 says the fold starts closed and doesn't say what a reload does. Left unruled, it is built as is.
OPTIONS:
  A. Open it again — a fold that holds kept words opens after a reload, so your words show where you left them.
  B. Keep it closed, but mark it — "Add your own words · kept ›", so you know it holds words.
  C. As built — closed, the words there when you open it.
RECOMMENDATION: A — the reload ruling says your words come back; showing them is the plainest way to keep it.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the questions section's "Add your own words" folds, after a full reload
DEFAULT: C   TIMEOUT: 168

## Context
- The question (source: QW1's design review, round 1, Q1, to be filed verbatim as reviews/M3G/_stage-qw1-design-r1-verbatim.md with QW1's pull request)
- The reload ruling (source: decisions/questions/P-001-audit-reload.md)
- The fold (source: specs/S-001.md, AC94, "Add your own words")
