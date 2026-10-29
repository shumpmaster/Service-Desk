# Ruling needed: On a narrow phone, where does the button beside the two split headings go?

Milestone: none (a small design change you asked for after M3B, across every screen)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: On a 360 px phone, "Since you last looked · yesterday, 14:00" with "Mark as seen", and "Milestones by phase · 8 of 15 reached" with "↑ start at the foot", don't fit on one line, even with the time or count at 12 px as you chose: each is about 40 px short. Your picture drew the button beside the heading, and your wrap answer keeps the heading on one line; on a narrow phone both can't hold. On a 414 px phone everything fits on one line. Left unruled, the build stays as it is (A).
OPTIONS:
  A. As built — the heading on one line, the button on its own line just below it, at the right; each row about 20 px taller on a narrow phone.
  B. A smaller button on narrow phones — the button stays beside the heading with a shorter label or an icon; a picture first, since it changes a control.
  C. The heading wraps — the button stays beside it, and the heading goes onto two lines on a narrow phone.
RECOMMENDATION: A — both your answers hold where they can: the heading stays on one line, and the button stays whole and easy to tap.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: two headings on Home and a project page, on narrow phones
DEFAULT: A   TIMEOUT: 168

## Context
- The measurements and the Design reviewer's question (source: this session, HD1's design review)
- Before and after, made up (source: docs/design/builds/hd1/01-home-360-light-before-after-MADE-UP-NOT-real.png; 02-home-414-dark-before-after-MADE-UP-NOT-real.png)
- Your answers (source: decisions/questions/P-001-headers-approve.md; P-001-headers-wrap.md)
