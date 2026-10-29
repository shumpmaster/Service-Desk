# Ruling needed: Do you approve the bigger headers as drawn?

Milestone: none (a small design change you asked for after M3B, across every screen)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: You asked to "appropriately size up all of the text that serves as headers across the entire desk". The Design reviewer listed every header and drew before and after: section and sheet-block heads (today 11 px grey, smaller than the 13 px text under them) go to 15 px semibold; smaller group heads (lane heads, each project's group on Waiting, run heads, "More detail" sub-heads) to 13 px semibold; an opened phase's two group heads to 12 px semibold. Screen titles (24 px) and sheet titles (18 px) stay. Every size and weight is one mockup v2 already uses; no colour changes. Left unruled, nothing is built.
OPTIONS:
  A. Approve as drawn — the Definer writes it into the spec and it is built and reviewed as usual, replacing mockup v2's 11 px section heads for these roles.
  B. Bigger titles too — as A, and screen titles go 24 → 28 px and sheet titles 18 → 20 px (image 8); adds two sizes to the scale.
  C. Ask for changes — name them; the picture is redrawn.
RECOMMENDATION: A — every header now reads as a heading, with no new size on the scale; the titles are already the largest text on each screen.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: header text on every screen and sheet
DEFAULT: C   TIMEOUT: 168

## Context
- Your request, word for word (source: docs/design/references/owner-request-2026-10-29-header-sizes.md)
- The picture, made up, not real (source: docs/design/builds/headers-picture/headers-1-home.png to headers-7-targets-sheet.png; the titles option, docs/design/builds/headers-picture/headers-8-option-bigger-titles.png)
