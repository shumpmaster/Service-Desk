# Ruling needed: Should a project the desk can't draw get a grey line under "Since you last looked"?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your answer A gave each project the desk can't read a grey line, "<project> not read since HH:MM, its lines may be missing". A project whose records the desk reads but can't draw ("Can't show <project>" in the briefing) adds nothing to the list either, yet gets no grey line, so the list can read "Nothing new since …" while that project's lines are missing. This was so before G7b too. Left unruled, it stays as built.
OPTIONS:
  A. As built — no line for a project the desk can't draw; the briefing's "Can't show <project>" and its tile say so.
  B. A line for it too — "<project> not shown, its lines may be missing", in the same grey, in tile order with the others; built in a small change after G7b lands.
RECOMMENDATION: B — the list says what it may be missing whatever the reason, so "Nothing new" is never said over a gap.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the "Since you last looked" list on Home only
DEFAULT: B   TIMEOUT: 168

## Context
- The grey lines are for projects that can't be read; a can't-show project whose read works gets none (source: specs/S-001.md, AC91 (c), G7b's review notes)
- The Design reviewer left this half of its Q4 open after the fix round (source: reviews/M3E/_stage-g7b-design-r2-verbatim.md)
