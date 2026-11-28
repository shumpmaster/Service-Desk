# Options: a project with no plan, and the empty and can’t-read states (round 9)

The owner’s start prompt for round 9: “take up the open items one at a time with pictures, starting with the screens the desk lacks” (your round 9 start prompt, docs/handoff/2026-11-27-chief-of-staff-p005-19.md). The design reviewer put this third, because “three of five projects show a broken page today” (docs/design/audit-2026-11-27-v46-screens.md, section 4). The job: “Is this project really quiet, or can the desk not see it?”

Built over mockup v48 (`../timeline-v48-craft.html`). `source/build.py` writes `phone.html` (v48 with `source/st.css` and `source/st.js`; the option set by the phone's hash, `.light` or `.dark` fixing the theme); `source/page.py` writes `index.html` and this file with the round 8 options pages' stylesheet.

| Phone | Hash | What it shows |
|---|---|---|
| v48 | `q=now.light` | a quiet project in the older layout, “undefined” on every row |
| A (recommended) | `q=A.light`, `q=A.dark`, 360 wide | the project’s own page: top row with No phases yet, the map card with the summary line and a branch map, the list top down |
| B | `q=B.light` | no map: the summary line, one line of why, the list |
| C | `q=C.light` | A with an empty plan block |
| Home, nothing waiting | `s=calm.light` | one calm line in place of the priority list (example) |
| Being read | `s=checking.light` | portfolio, Checking…, a shimmer |
| Can’t read | `s=cant.light`, `s=cant.home.light` | Model-Lab, Can’t read since 9:14 am, Try again, Open on GitHub; and its own line on home |
| First open | `s=first.light` | no new-since marks, a one-line welcome |

Hash words: `q=now|A|B|C` the page; `om`, `ml` or `pf` the project it opens on (operating model by default); `s=calm|checking|cant|first` the state; `home` (with `s=cant`) home’s line. With any option or state, a quiet project tapped on home opens that option’s page (A for the states).

The records: No status file in the three repositories carries a phase (Model-Lab’s status/ holds only its README; the operating model and portfolio have none), so each says No phases yet. The events, branches and counts are from each repository’s history as of the mockup’s 14 Nov, 11:25 am: the operating model, 20 pull requests merged from 1 to 14 November and its 13 November (the spec-number fix, S-038, and pull requests #57 to #59); Model-Lab, 77 merged since 4 November (the copy read here starts then) and its six of 13 November; portfolio, 11 merged from 1 to 12 November. The purpose lines in the summary sheet are examples. The words of these states, the 9:14 am time and the calm and first-open homes are examples: no record carries a read failure, a last-looked time or a welcome. The pages under them hold the real records above. Try again shows Checking…, then says what happened; the mockup sends nothing.

Touches. The page: The design pack’s “Every project, not only Service-Desk”: “The desk shows every project run under the operating model, at any tier, in any phase” (governance/domains/design/README.md). Its checklist 5, No made-up figures, and 30, the three states (not used, not recorded yet, no record). R8 answer 28: plain words first, codes after in grey. Answers 31 and 32: the summary line at the head of the map card, opening About this project. R7 answer 8: “I actually want it from the top down”. The states: The design pack’s checklist 4, Quiet is honest: “does the screen never say “Quiet” while a project is unread or can’t be read, showing “Checking…” or “Can’t read since HH:MM” instead?” (S-001 AC4, AC5; PROJECT.md intent, “Missed decisions”). R8 answers 24 and 26: home is a priority list of your actions. Checklist 5: an unknown is shown in words, never as a value or zero.

In v48, a quiet project: operating model, Model-Lab and portfolio open in an older layout: a large title, project chips, “No plan on record for this project in the mockup”, a MAIN / BRANCH list, and “undefined” in every row’s state tag. No map card, no pills, no summary line. The cause: a later layer of the mockup (v30’s) reuses the name of the table of state words, so every row’s state word reads undefined. The states: no empty or can’t-read state is drawn. Home always has things waiting; a project is shown as read, never as being read or unreadable; the only error states are the Late and Stopped banners behind More’s “preview the feed”; and every visit shows “new since you last looked” marks, with no first visit.
