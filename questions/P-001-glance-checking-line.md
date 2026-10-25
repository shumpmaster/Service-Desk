# Ruling needed: When a project's first read has failed, should Home and Waiting still say "Checking…" under their titles?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: With every project shown, while any project has never been read since the desk opened, the line under Waiting's title says "checking…" and Home's says "Checking…". When that project's reads have already failed, the red lines just below say "✕ Can't read … in this opening", and the same project shown alone says "Not read in this opening". So "checking…" suggests a read still on its way, with no age, when the desk is in fact retrying failed reads. This is older than the glance work. Left unruled, it stays as built.
OPTIONS:
  A. Say what is known — while any project's first read has failed, Home's and Waiting's line under the title says "Not read in this opening" instead of "Checking…"; "Checking…" stays only while a first read is still on its way; built in a small change after G9.
  B. As built — the red "Can't read" lines just below explain it.
RECOMMENDATION: A — the line then agrees with the red lines and with the project shown alone, and never suggests progress that isn't happening.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the line under Home's and Waiting's titles, in this one state only
DEFAULT: A   TIMEOUT: 168

## Context
- The Design reviewer found it in G8d's round-3 review, finding N1 (source: the G8d design review, round 3, to be filed verbatim as reviews/M3E/_stage-g8d-design-r3-verbatim.md with G8d's pull request)
- Home's every-project rule for "Checking…" (source: specs/S-001.md, AC82)
- "A failed read is never called checking…" for a project shown alone (source: specs/S-001.md, AC89 (a))
- The picture (source: docs/design/builds/m3e-g8d/03-waiting-every-project-round3-360-light.png; made up, not real)
