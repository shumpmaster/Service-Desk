# Ruling needed: Should each "Since you last looked" line be cut at 2 lines, not 3?

Milestone: none (a design follow-up after M3D; the planner gives it a milestone when it is built)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: With four long entries at 360 px, no project tile shows on Home's first screen, against your reason for "four, then more" (P-001-since-count: the tiles start on the first screen). It bends P-001-tile-summary-clip's three lines for ruling lines, since an entry can quote a ruling. Left unruled, it stays as built.
OPTIONS:
  A. Two lines — Each entry is cut at 2 lines with its fade; the tap still opens the whole entry.
  B. As built — Three lines.
RECOMMENDATION: A — it keeps the tiles on the first screen, which is why you chose four entries.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: Home's Since you last looked
DEFAULT: B   TIMEOUT: 168

## Context
- The audit's proposal, its rationale and what it bends (source: docs/design/audit-2026-10-24.md)
- Before and after shots of the real desk (source: docs/design/mockups/glance-emphasis/index.html; the owner's private page https://claude.ai/artifact/QFYn6QWmAej31S5FXKYvux)
- The owner's request (source: docs/design/references/owner-request-2026-10-24-glance-emphasis.md)
- It is item 6 of the audit's ranked proposals and section 6 of the mockup (source: docs/design/audit-2026-10-24.md; docs/design/mockups/glance-emphasis/index.html)
