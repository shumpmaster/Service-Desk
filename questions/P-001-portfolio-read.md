# Ruling needed: Should the desk read your portfolio repository too?

Milestone: MD3
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The operating model gives the level above your projects its own repository: ideas and their states, rulings across projects, standing intent and a decision queue. The desk reads only its two projects today, so none of that can show, including the first step of every project (you agreeing to explore an idea). Left unruled, the desk stays project-only.
OPTIONS:
  A. Yes, read only — The desk reads the portfolio repository too; you add it to the desk's read access, and nothing on the desk can change it.
  B. Not yet — The desk stays with its projects; revisit after the redesign.
RECOMMENDATION: A — it's the one place ideas, cross-project rulings and the portfolio's own cards live, and reading it changes nothing there.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: what the desk can read; one more repository on its read access
DEFAULT: B   TIMEOUT: 48

## Context
- The owner said the desk had been designed around Service-Desk rather than every project, and asked for an inventory first (source: docs/design/references/owner-request-2026-10-19-scope.md on orch/board-mockup)
- The desk does not read the portfolio level at all; the portfolio repository is not in src/config/projects.json (source: docs/design/inventory-2026-10-19.md on orch/board-mockup)
