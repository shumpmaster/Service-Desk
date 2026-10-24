# Ruling needed: Should "Since you last looked" say when a project's lines may be missing?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: When a project can't be read, Home's "Since you last looked" still lists what came in from the projects that were read, and says nothing about the missing project. Its lines may be missing, but the list reads as if it were whole. The briefing and that project's tile already say "can't read", so nothing is hidden on the screen, but the list itself doesn't say so. Left unruled, it stays as built.
OPTIONS:
  A. Say so in the list — one grey line under it, "<project> not read since HH:MM, its lines may be missing" (or "not read in this opening"), one line per unreadable project; built with the colour step (G7), which already changes Home.
  B. As built — the list stays as it is; the briefing and the tile say "can't read".
RECOMMENDATION: A — a list should never look whole when part of it can't be read; one grey line costs little.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: Home's "Since you last looked" list
DEFAULT: B   TIMEOUT: 168

## Context
- The Design reviewer's open question 2 on G1 (Home), passing the build but asking whether the list should say it is incomplete (source: reviews/M3E/_stage-g1-design-r1-verbatim.md)
- The Definer's reading: unlike the Kicked back strip, which only changes on a successful read, the "Since" list records events on GitHub, so an unreadable project's entries really can be missing (source: specs/S-001.md, AC91 (c) and (f), G2 review notes of 2026-10-24)
- G1 replaced the false "Nothing new since …" with "✕ Not read since HH:MM" when the list is empty, but not when it holds other projects' lines (source: specs/S-001.md, AC91 (c))
