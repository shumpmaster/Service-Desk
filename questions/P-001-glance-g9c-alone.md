# Ruling needed: With one project shown alone on Waiting, should the new "Still reading" and "Signed out" lines be left out?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your answers "Name it" and "Say it on Waiting" (decisions/questions/P-001-glance-waiting-pending.md and P-001-glance-waiting-signed-out.md, A) are being built as stage G9c. With one project shown alone, Waiting already says "Checking…" and "Not read yet" while its read is on its way, and signed out its red line above the lanes already ends "Signed out — reload to sign in". So G9c adds neither line there. Left unruled, it is built that way.
OPTIONS:
  A. Leave them out — that view already says both.
  B. Add them there too.
RECOMMENDATION: A — the same words twice on one small screen add nothing.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: Waiting with one project shown alone
DEFAULT: A   TIMEOUT: 168

## Context
- Your answers (source: decisions/questions/P-001-glance-waiting-pending.md; P-001-glance-waiting-signed-out.md)
- One project shown's states (source: specs/S-001.md, AC89 (a))
- G9c's readings, 2 (source: specs/S-001.md on the Definer's G9c branch, "Open: from G9c's readings", landing with G9c)
