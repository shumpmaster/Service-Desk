# Ruling needed: When nothing is new and a project can't be read, should the red "Not read since" line stay above the new grey lines?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your answer A on "Since you last looked" added one grey line per project that can't be read, "<project> not read since HH:MM, its lines may be missing". When the list is empty, the red "✕ Not read since HH:MM" line from G1 is still there above them, so the two say nearly the same words, one red and one grey. The Design reviewer found the grey lines read clearly as the weaker voice and don't compete. Left unruled, it stays as built.
OPTIONS:
  A. As built — the red line stays and the grey lines follow it; the empty list says "can't read" twice, in red and in grey.
  B. The grey lines replace it — when the list is empty, only the grey per-project lines show; the empty list shows no red line, though the briefing's red ✕ lines above still say "Can't read"; built in a small change after G7b lands.
RECOMMENDATION: A — the red line says the list itself can't be trusted, and the grey lines say which project; B would leave the list's only red warning to the briefing.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the empty "Since you last looked" list on Home only
DEFAULT: A   TIMEOUT: 168

## Context
- The grey lines and the red line are both kept by AC91 (c) as changed (source: specs/S-001.md, AC91 (c))
- The Design reviewer asked this as Q1 (source: the G7b design review, to be filed verbatim as reviews/M3E/_stage-g7b-design-r1-verbatim.md with G7b's pull request)
- The picture with the red and grey lines (source: docs/design/builds/m3e-g7b/02-signed-out-three-projects-NOT-real-360-dark.png, filed with G7b's pull request; made-up fixture)
