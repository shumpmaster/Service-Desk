# Ruling needed: On Waiting, how should "Waiting on you" get more of the width: shrink empty lanes, or make Kicked back a strip?

Milestone: none (a design follow-up after M3D; the planner gives it a milestone when it is built)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: At 360 px the lanes are 117, 99 and 99 px wide. With Kicked back and Done empty, 63% of the width says nothing and card titles fit about 14 characters a line. A bends frame 1's lane proportions and keeps all three lanes, as you ruled (P-001-board-layout). C and D are your idea from a comment on the mockup (24 Oct): "scrap the middle column, and rather opt for a collapsible section that shows kicked back cards left to right in a line", "minimized when nothing exists but pops open when something is there". They change your three-lanes ruling, and the Design reviewer has not reviewed them yet. Left unruled, it stays as built.
OPTIONS:
  A. Shrink empty lanes — An empty lane shows only its heading and count (about 64 px); Waiting on you takes the rest (about 220 px). A lane widens again once a card is in it; its drop target is narrower while empty.
  B. As built — The lanes keep their widths.
  C. Kicked back strip — The middle column goes. Kicked back becomes a strip above the lanes: one quiet line ("Kicked back · none") when empty, open with its cards left to right (each with its reason) when there are any. Waiting on you and Done share the width. An open strip pushes the lanes down about 170 px; dragging a card from the strip into Done needs new drag code.
  D. Strip and shrink — C, and an empty Done also shrinks to its heading and count, as in A.
RECOMMENDATION: D — Kicked back is rare, so a strip costs nothing most days, and with an empty Done shrunk too, Waiting on you gets nearly the whole width.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: Waiting's lanes and how a kicked-back card is shown
DEFAULT: B   TIMEOUT: 168

## Context
- The audit's proposal, its rationale and what it bends (source: docs/design/audit-2026-10-24.md)
- Before and after shots of the real desk (source: docs/design/mockups/glance-emphasis/index.html; the owner's private page https://claude.ai/artifact/QFYn6QWmAej31S5FXKYvux)
- The owner's request (source: docs/design/references/owner-request-2026-10-24-glance-emphasis.md)
- Your comment on the mockup, word for word (source: docs/design/references/owner-request-2026-10-24-glance-emphasis.md, "Comment on item 4")
- It is item 4 of the audit's ranked proposals and sections 4 and 4b of the mockup (source: docs/design/audit-2026-10-24.md; docs/design/mockups/glance-emphasis/index.html)
