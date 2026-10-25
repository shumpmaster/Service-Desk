# Ruling needed: On a project with nothing recorded yet, should its page still show the soft box?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: The last glance step (G9) puts a project page's sentence and its one-line count in a soft grey box, the same look as Home's briefing. On a project with nothing recorded yet, or not read yet, the box holds only words such as "not recorded" or "no milestones tracked yet · no sprints filed yet", never a number. Left unruled, it is built as drawn.
OPTIONS:
  A. Keep the box always — the same place answers the same question on every project, even when the answer is "not recorded yet".
  B. No box until something is recorded — the words show as plain lines, and the box appears once the project has records.
RECOMMENDATION: A — the page doesn't change shape with the state, and the words say honestly what is not known.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: a project page's top box, for projects with nothing recorded or not read yet
DEFAULT: A   TIMEOUT: 168

## Context
- The Design reviewer asked this as Q1 in G9's review (source: the G9 design review, round 1, to be filed verbatim as reviews/M3E/_stage-g9-design-r1-verbatim.md with G9's pull request)
- The soft box's rule (source: specs/S-001.md, AC92 (e))
- The picture of a project with nothing recorded (source: docs/design/builds/m3e-g9/04-project-with-nothing-recorded-360x740-light-MADE-UP-NOT-real.png; made up, not real)
