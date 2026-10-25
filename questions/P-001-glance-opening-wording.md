# Ruling needed: For a project never read since the desk opened, should the briefing and the list use the same words?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: When a project has failed since the desk was opened, the briefing and its tile say "Can't read <project> since 10:00" (the time the desk opened), while the new grey line says "<project> not read in this opening, its lines may be missing". Both follow the spec, but read together they seem to disagree. Left unruled, it stays as built.
OPTIONS:
  A. As built — the briefing and tile give the opening time; the list says "in this opening".
  B. "In this opening" everywhere — the briefing and tile say "Can't read <project> in this opening" too; built in a small change after G7b lands.
  C. The time everywhere — the list says "<project> not read since 10:00, its lines may be missing" too; built in a small change after G7b lands.
RECOMMENDATION: B — "since 10:00" reads as if a read worked until 10:00, and none did; "in this opening" says that.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the words for a project never read since the desk opened, on Home's briefing, tile and list
DEFAULT: B   TIMEOUT: 168

## Context
- The list's words are set by your answer A (source: decisions/questions/P-001-glance-since-incomplete.md)
- The briefing's and tile's words are older (source: specs/S-001.md, AC89 (a) and AC91 (c))
- The Design reviewer asked this as Q3 (source: the G7b design review, to be filed verbatim as reviews/M3E/_stage-g7b-design-r1-verbatim.md with G7b's pull request)
- The picture with both wordings (source: docs/design/builds/m3e-g7b/01-two-unreadable-tile-order-NOT-real-360-light.png, filed with G7b's pull request; made-up fixture)
