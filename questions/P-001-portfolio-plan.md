# Ruling needed: Should the plan across projects live in the portfolio, not in Service-Desk?

Milestone: MD3
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: Your chosen order of the work ahead and the Chief of Staff's estimates cover every project, but they are kept inside Service-Desk (docs/planning/ and intake/estimates.jsonl). That ties a cross-project record to one project. Left unruled, they stay where they are.
OPTIONS:
  A. Move them, once the portfolio is read — After the desk reads the portfolio, the plan and estimates move there; until then nothing changes.
  B. Keep them in Service-Desk — They stay where they are.
RECOMMENDATION: A — they belong to all projects, and moving them waits until the desk can read them there.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: where the plan and estimates are kept; Work ahead reads them from the new place
DEFAULT: B   TIMEOUT: 48

## Context
- The owner said the desk had been designed around Service-Desk rather than every project, and asked for an inventory first (source: docs/design/references/owner-request-2026-10-19-scope.md on orch/board-mockup)
- The plan order and estimates are portfolio records kept in one project (source: docs/design/inventory-2026-10-19.md on orch/board-mockup)
