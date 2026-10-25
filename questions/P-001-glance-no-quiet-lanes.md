# Ruling needed: When no project on Waiting can be both read and drawn, what should the lanes say instead of "0" and "Nothing here"?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: With every project shown, if one project can't be read and the only other can't be drawn, Waiting's lanes still say "Waiting on you 0", "Nothing here" and "Kicked back · none" under the red lines. When every project can't be read, the same lanes already give no number and say "Can't read". A 0 there is a false all-clear, which your earlier answers rule out; only the words are your choice. Left unruled, the no-number part is fixed with option A's words.
OPTIONS:
  A. No number, "Can't read or show" — the lanes give no count and say "Can't read or show", the strip "Kicked back · can't read or show"; built in a small change after G8d lands.
  B. As built — the red lines above explain the 0.
RECOMMENDATION: A — it matches what the lanes already do when nothing can be read, and never shows a 0 for an unknown.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: Waiting's lanes and strip with every project shown, in this one state only
DEFAULT: A   TIMEOUT: 168

## Context
- The Design reviewer found the 0 in G8d's round-2 review, finding N1 (source: the G8d design review, round 2, to be filed verbatim as reviews/M3E/_stage-g8d-design-r2-verbatim.md with G8d's pull request)
- Unknowns are said in words, never as a 0 (source: specs/S-001.md, AC91 (f) and the design pack's part A item 5)
- The before and after picture (source: docs/design/builds/m3e-g8d/01-waiting-every-project-360-light.png; made up, not real)
