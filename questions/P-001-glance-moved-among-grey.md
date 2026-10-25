# Ruling needed: When the rows around it carry grey estimate lines, is the small "moved" word enough?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your answer B put a small grey word "moved" on the row you just moved, under its code line. The Design reviewer found it readable (6.40:1 light, 7.72:1 dark) and easy to find on most screens. But when the rows around it also carry small grey lines such as "Estimate: not made yet", the word reads as one more grey line and stands out less. Left unruled, it stays as built.
OPTIONS:
  A. As built — the word stays small and grey; the light-grey edge beside it is the second signal.
  B. The word at medium weight — "moved" in the same grey but at weight 500, so it stands apart from the 400-weight estimate lines without adding a colour; built in a small change.
RECOMMENDATION: A — the edge and the word together already mark the row, and the case is only when estimates are missing.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the "moved" word on Plan only
DEFAULT: A   TIMEOUT: 168

## Context
- The word as built (source: specs/S-001.md, AC24's note, stage G8b)
- The Design reviewer asked this as Q1 (source: the G8b design review, to be filed verbatim as reviews/M3E/_stage-g8b-design-r1-verbatim.md with G8b's pull request)
- The picture with the word among grey lines (source: docs/design/builds/m3e-g8b/04-word-among-grey-lines-414-dark.png, filed with G8b's pull request; made-up fixture)
