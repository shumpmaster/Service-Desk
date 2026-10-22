# Ruling needed: Should a repeated "not yet" reason show once per group, instead of on every row?

Milestone: none (a design follow-up after MD3; the planner gives it a milestone when it is built)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The audit found the same reason repeated row by row: on Plan, each of 21 rows says it has no estimate yet; the Timeline says "Why not recorded yet" 15 times; Home says "why it went back: not recorded" 3 times; Team says "not recorded" on 5 tiles. It is the biggest reason the main screens run long. Left unruled, it stays as built.
OPTIONS:
  A. Once per group — Say it once at the group or phase head (e.g. "6 milestones · no estimates yet"), as you ruled for standard milestones; each row shows its own value only once there is one.
  B. Every row — Keep it on every row, as built.
RECOMMENDATION: A — it cuts about half of Plan's length, and every gap still says who fills it.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: Plan, Timeline, Home and Team
DEFAULT: B   TIMEOUT: 168

## Context
- The audit choice (source: docs/design/audit-2026-10-22.md, section 6, on branch orch/md3-design-audit, pull request #194)
