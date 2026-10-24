# Ruling needed: On Waiting, should empty lanes shrink so "Waiting on you" gets the width?

Milestone: none (a design follow-up after M3D; the planner gives it a milestone when it is built)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: At 360 px the lanes are 117, 99 and 99 px wide. With Kicked back and Done empty, 63% of the width says nothing and card titles fit about 14 characters a line. It bends frame 1's lane proportions; all three lanes stay on screen, as you ruled (P-001-board-layout). Left unruled, it stays as built.
OPTIONS:
  A. Shrink empty lanes — An empty lane shows only its heading and count (about 64 px); Waiting on you takes the rest (about 220 px). A lane widens again once a card is in it; its drop target is narrower while empty.
  B. As built — The lanes keep their widths.
RECOMMENDATION: A — it about doubles the line length of the cards you act on, without a new layout.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: Waiting's three lanes
DEFAULT: B   TIMEOUT: 168

## Context
- The audit's proposal, its rationale and what it bends (source: docs/design/audit-2026-10-24.md)
- Before and after shots of the real desk (source: docs/design/mockups/glance-emphasis/index.html; the owner's private page https://claude.ai/artifact/QFYn6QWmAej31S5FXKYvux)
- The owner's request (source: docs/design/references/owner-request-2026-10-24-glance-emphasis.md)
- It is item 4 of the audit's ranked proposals and section 4 of the mockup (source: docs/design/audit-2026-10-24.md; docs/design/mockups/glance-emphasis/index.html)
