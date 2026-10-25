# Ruling needed: In the busiest case, should every question show all its choices, even if the lanes start five screens down?

Milestone: M3G
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: The picture shows every question with all its choices, never cut. With five questions of four to six choices, the section is about four and a half phone screens tall at 360 px, and the "Waiting on you" lanes start about five screens down. That pulls against your wish to glance for a few seconds and not get hit in the face with it. Left unruled, it is built as drawn.
OPTIONS:
  A. As drawn — every question shows all its choices.
  B. Choices on the first three — the first three questions (in order) show their choices; the rest show their title and "Show choices ›", which opens them in place.
  C. Choices on a tap — every question shows its title and recommendation; a tap opens its choices in place.
RECOMMENDATION: B — the questions that matter most are answerable at once, and the screen stays short in a busy week.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the questions section on Waiting only
DEFAULT: B   TIMEOUT: 168

## Context
- The section's length measured in the picture, about 3,400 px at 360 px wide (source: the Design reviewer's picture review, CS31, to be filed with the plan)
- Reading (d): titles cut at three lines, choices never cut (source: specs/S-001.md at db5f432, AC94)
- The owner's words on not being hit in the face at a glance (source: decisions/questions/P-001-design-discovery.md)
- The whole board in the busiest case (source: docs/design/builds/m3g-picture/m3g-f1-board-360-light-full.png; made up, not real)
