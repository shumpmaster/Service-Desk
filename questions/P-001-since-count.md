# Ruling needed: How many "Since you last looked" lines should Home show before "more"?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: Home lists what changed since you last looked. Mockup v2 shows the newest four, then "7 more", so the project tiles start on the first screen. Left unruled, it shows four.
OPTIONS:
  A. Four, then "more" — The tiles start on the first screen; one tap shows the rest.
  B. All of them — Every change since you last looked is listed; the tiles move further down.
RECOMMENDATION: A — the tiles stay in sight, and the rest is one tap away.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: one detail of the new desk's screens
DEFAULT: A   TIMEOUT: 48

## Context
- The plan for desk v2 lists this as open for the owner (source: specs/S-001.md on build/definer/s001-desk-v2)
- The approved mockup and what it leaves open (source: docs/design/mockups/desk-v2/README.md)
