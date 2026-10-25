# Ruling needed: Should Plan show the word "moved" on the row you just moved?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your ruling on gold (one meaning) turned Plan's "moved" edge from gold to the light line grey, "with its word 'moved' kept". The colour step (G7) built that. The Design reviewer found that the word "moved" has only ever been read out to screen readers, never shown. So after G7, a sighted reader finds the row they just moved only by a very faint grey edge (1.45:1 in light, 1.58:1 in dark). Left unruled, it stays as built.
OPTIONS:
  A. As built — the light-grey edge alone, the word still only read out; nothing changes, and the moved row is hard to spot.
  B. Show the word — a small grey "moved" on the row, in the secondary text colour, beside the light-grey edge; gold keeps its one meaning; built in a small change after G7 lands.
  C. A darker edge — the edge in the secondary text grey instead of the line grey, the word still only read out; easier to see than A, but still no word.
RECOMMENDATION: B — it does what the ruling said ("its word kept") for sighted readers too, without bringing gold back.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the moved row on Plan only; no other page, count or colour changes
DEFAULT: B   TIMEOUT: 168

## Context
- Ruling A on gold: Plan's "moved" edge becomes the light line grey, with its word "moved" kept (source: decisions/questions/P-001-glance-plan-gold.md)
- The word "moved" is accessible text only (source: specs/S-001.md, AC24)
- The Design reviewer measured the edge at 1.45:1 (light) and 1.58:1 (dark) and asked whether the edge alone is enough (source: the G7 design review, N2 and Q1, to be filed verbatim as reviews/M3E/_stage-g7-design-r1-verbatim.md with G7's pull request)
- The before and after pictures show the edge going from gold to light grey (source: docs/design/builds/m3e-g7/04-plan-moved-edge-grey-reached-checks-414x896-light.png, filed with G7's pull request)
