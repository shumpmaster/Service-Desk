# Ruling needed: Shown alone, what should a project say that the desk couldn't draw and now can't read?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: With one project shown alone, if the desk could read it but not draw it, and its read then fails, its lane says "0" and "Nothing here when last read", and the strip "Kicked back · none when last read". But when it was last read the desk couldn't draw it, so "nothing here" was never known. Left unruled, it is fixed with option A's words.
OPTIONS:
  A. No number, "Can't show when last read" — the lane gives no count and says "Can't show when last read", the strip "Kicked back · can't show when last read"; built in a small change after G8d lands.
  B. As built.
RECOMMENDATION: A — the words say what the desk knows, and no 0 stands for an unknown.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: Waiting with one project shown alone, in this one state only
DEFAULT: A   TIMEOUT: 168

## Context
- The Design reviewer found it in G8d's round-2 review, finding N2 (source: the G8d design review, round 2, to be filed verbatim as reviews/M3E/_stage-g8d-design-r2-verbatim.md with G8d's pull request)
- AC89 (a)'s state 5 words, "Nothing here when last read" (source: specs/S-001.md, AC89 (a))
- The picture of a project shown alone (source: docs/design/builds/m3e-g8d/02-waiting-alone-360-dark.png; made up, not real)
