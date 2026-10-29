# Ruling needed: Keep the time or count in two headings small so they fit one line?

Milestone: none (a small design change you asked for after M3B, across every screen)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: At 15 px, "Since you last looked · yesterday, 04:00" and "Milestones by phase · 8 of 15 reached" wrap onto a second line on a phone. Keeping the part after " · " at the small 12 px size would let each fit one line. Left unruled, they wrap.
OPTIONS:
  A. Keep that part small — the heading words at 15 px, the time or count after them at 12 px, on one line.
  B. Let them wrap — the whole heading at 15 px, on two lines where needed.
RECOMMENDATION: A — the heading stays one line and the time or count stays readable.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: two headings, on Home and the project page
DEFAULT: B   TIMEOUT: 168

## Context
- The wraps, made up (source: docs/design/builds/headers-picture/headers-1-home.png and docs/design/builds/headers-picture/headers-4-project-page.png)
