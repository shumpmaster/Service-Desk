# Ruling needed: Should a half-written answer survive the phone reloading the desk?

Milestone: none (a design follow-up after MD3; the planner gives it a milestone when it is built)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The desk keeps an open sheet, your typed words and the scroll through its every-minute refresh, as you ruled. But when the phone fully reloads the app after a while in the background (iOS does this), the sheet stays open and your typed words and scroll are lost. Left unruled, it stays as built.
OPTIONS:
  A. Keep them across a reload — Your typed words and scroll come back after a full reload too, on this device only.
  B. As built — A full reload clears them.
RECOMMENDATION: A — a half-written answer shouldn't vanish because the phone closed the app.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: every sheet with a text box, on your phone
DEFAULT: B   TIMEOUT: 168

## Context
- The audit choice (source: docs/design/audit-2026-10-22.md, section 6, on branch orch/md3-design-audit, pull request #194)
