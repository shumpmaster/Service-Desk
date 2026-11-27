# Options: the Needs-you tab (round 9)

Built over mockup v47 (`../timeline-v47-craft.html`), from the advisory review `docs/design/audit-2026-11-27-v46-screens.md`, section 3, candidate 1. `source/build.py` writes `phone.html` (v47 with `source/ny.css` and `source/ny.js`; the option set by the phone's hash, `.light` or `.dark` fixing the theme); `source/page.py` writes `index.html` with the round 8 options pages' stylesheet.

| Phone | Hash | What it shows |
|---|---|---|
| v47 | `now.light`, `now.dark` | the tab tapped: the leftover sheet for the first waiting thing |
| A (recommended) | `A.light`, `A.dark` | one list: Waiting on you, Sent, Kicked back, With the AI team: 1, Answered (24 hours open, Earlier folded) |
| B | `B.light.by` | A with an In order / By project switch, shown By project |
| C | `C.light` | Yours / With the team / Done as a segmented control |
| Sheets | `A.light.kinds.sheet=q`, `=pr`, `=deploy`, `=session` | A with four example rows, one sheet open |

Other hash words: `kinds` adds the four example rows; `home` stays on home with the tab untapped. In A, B and C the tab is a view of its own inside the page, its icon lit and its badge the waiting count; Desk returns home where it was.

Records behind it: the waiting rows are home's priority list, cloned as it stands. The answered rows are the owner's rulings in decisions/questions/P-005-s011-widths.md, P-005-s011-m8-reading.md, P-005-definer-pack.md (14 Nov, 8:47 am), decisions/P-005/stop-4.md, decisions/questions/P-005-model-3.7.3.md, P-005-critic-pack.md (13 Nov, 10:58 pm), and decisions/P-005/dor-3.md, dor-2.md, dor-fail-1.md (folded under Earlier). With the AI team: 1 is the mockup's own at-work session (its name an example since v44).

Examples, marked so: the Sent and Kicked-back rows, the four other kinds of ask and their sheets, the session name. Tapping the Needs-you tab opens an older-style sheet for the first waiting thing only (“S-011 failed three plan reviews”, Around it, Record, Open on GitHub). It is not the choices sheet home uses and not a list; nothing shows what you already answered, and the tab has no count.
