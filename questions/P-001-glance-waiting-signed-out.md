# Ruling needed: Signed out, should Waiting say "Signed out — reload to sign in", as Home does?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: G9b's design review (round 1, N3) found that when you are signed out, Home's briefing says "Signed out — reload to sign in", but Waiting only shows "✕ Can't read <project> in this opening" for each project, never why. This was so before G9b. Left unruled, it stays as built.
OPTIONS:
  A. Say it on Waiting too — the same "Signed out — reload to sign in" line at the top of Waiting's quiet lines, in place of one red line per project.
  B. As built — each project's red line, and Home says why.
RECOMMENDATION: A — the fix is the same for every project (reload), so one line that says so beats several that don't.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: Waiting's quiet lines, only while signed out
DEFAULT: B   TIMEOUT: 168

## Context
- The finding (source: reviews/M3E/_stage-g9b-design-r1-verbatim.md, N3)
- Home's signed-out line (source: docs/design/builds/m3e-g9b/g9b-home-signed-out-360x740-dark-MADE-UP-NOT-real.png; made up, not real)
- Signing out (source: specs/S-001.md, J6)
