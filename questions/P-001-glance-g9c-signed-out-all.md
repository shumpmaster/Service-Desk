# Ruling needed: Signed out, should the one "Signed out" line on Waiting replace every red line, including "Can't show" and older failures?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your answer "Say it on Waiting" (decisions/questions/P-001-glance-waiting-signed-out.md, A) is being built as stage G9c. G9c reads it as: while signed out, the one line replaces every project's red line, including "✕ Can't show <project>", failures with other causes, and the portfolio's line, as Home's signed-out briefing shows none. So Waiting with every project shown no longer says per project "since HH:MM" or "in this opening" while signed out; the line under the title and each project's own view still do. Left unruled, it is built that way.
OPTIONS:
  A. Replace every red line — one "Signed out — reload to sign in" line, as Home does.
  B. Replace only the lines the sign-out caused — keep "Can't show" lines and earlier failures under it.
RECOMMENDATION: A — signed out, nothing can be read until you reload, so the other lines can't be trusted to be current either.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: Waiting's quiet lines while signed out
DEFAULT: A   TIMEOUT: 168

## Context
- Your answer (source: decisions/questions/P-001-glance-waiting-signed-out.md)
- Home's signed-out briefing (source: src/lib/home.js, the signed-out head)
- G9c's readings, 3 (source: specs/S-001.md on the Definer's G9c branch, "Open: from G9c's readings", landing with G9c)
