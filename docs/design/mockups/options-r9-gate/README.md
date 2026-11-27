# Options: a gate open for your ruling, and a reader for any record (round 9)

The owner’s start prompt for round 9: “take up the open items one at a time with pictures, starting with the screens the desk lacks” (your round 9 start prompt, docs/handoff/2026-11-27-chief-of-staff-p005-19.md). The design reviewer put this second: “the highest-stakes action is undrawn, and every sheet’s records become readable with one template” (docs/design/audit-2026-11-27-v46-screens.md, section 4).

Built over mockup v48 (`../timeline-v48-craft.html`). `source/build.py` writes `phone.html` (v48 with `source/gr.css` and `source/gr.js`; the option set by the phone's hash, `.light` or `.dark` fixing the theme); `source/page.py` writes `index.html` and this file with the round 8 options pages' stylesheet.

| Phone | Hash | What it shows |
|---|---|---|
| v48, gate | `g=now.light` | the passed Design gate’s sheet; Records as plain text |
| A (recommended) | `g=A.light`, `g=A.dark`, 360 wide | the gate sheet open: the ask, the case’s opening (Read the whole case), the Critic, the user representative, four choices with what follows (Kill: Can’t be undone), Records rows |
| A on the list | `g=A.list.light` | the gate row Yours · open, in the wait colour |
| A on home | `g=A.home.light` | the gate as row 1 (example), its choices as buttons |
| B | `g=B.light` | a full page from the right, the case inline, the choices pinned at the foot |
| C | `g=C.light` | a short sheet: the ask, three evidence rows, the choices |
| v48, reader | `rd=now.light` | the research sheet’s Records line, plain text |
| A (recommended) | `rd=A.case.light`, `rd=A.ho.light`, `rd=A.case.dark`, 360 wide | a reader page: kind, title, file, the opening first and larger, sections, Open on GitHub, ‹ back |
| B | `rd=B.case.light`, `rd=B.case.up.light` | the reader as a sheet over the sheet, opening at the first paragraph; swiped up |

Hash words: `g=now|A|B|C` the gate; `list`, `home` where the open gate shows; `rd=now|A|B` the reader; `case` or `ho` the record; `up` the stacked sheet swiped up. With any option, every Records line in every sheet becomes one row per record, its plain name first and its file in grey, opening the reader.

The gate: The gate drawn open is the timeline’s real Design gate as it stood on 13 November, after case 2 and before you said proceed: its words are from docs/gates/P-005/design-gate-2-case.md, the Chief of Staff’s notes on it (decisions/P-005/dor-3-notes.md, which quote the gate Critic’s verdict) and the project document (section 9: “The owner is the user.”, so the user representative is not needed). Its open state, its row 1 on home and its waiting time are examples and say so: today no gate is open.

The readers: The readers hold real records, trimmed, with codes after the words in grey: the gate case (case 2), the Chief of Staff’s notes on it, the stop card’s notes (decisions/P-005/stop-5-notes.md), the research memo Q-028 (research/Q-028-memo.md, which has no plain paragraph of its own, so its Summary goes first and says so), a ruling (decisions/questions/P-005-s011-widths.md), a handover (docs/handoff/2026-11-14-chief-of-staff-p005-11.md), ledger L-0008 and the model’s Phase gates. Any other record opens a short reader that says the mockup holds only its name. The handover line on the At-work sheet’s Records is added here (the last handover before that session).

Touches. The gate: P-001-gate-card, A: “It shows the gate case’s opening, the Critic’s view and, where one runs, the user representative’s verdict, with your choices as buttons.” P-001-gate-buttons, A: choices as buttons on the card and in its sheet; “a tap only opens a filled-in answer you still save on GitHub”. Gates are never answered by proxy (L-0049). OPERATING_MODEL §4: proceed, hold, recycle, kill (“the project closes”). The reader: R8 answer 11: “Honestly I would want them to be so clear and descriptive that I could hand someone my phone and let them see exactly what’s going on.” AGENTS.md §4, Plain English first: every record written for you opens with one plain paragraph (in a gate case, the ask); the reader shows it first. P-001-design-lab-open, answer 9: asked “The gate document: shown inside the desk too, or only linked on GitHub?”, you answered “Linked”. Both readers show it inside the desk, with Open on GitHub at the foot, so they need your word to set that answer aside.

In v48, the gate: the timeline’s gates show only as passed (the Design gate: what it decided, your two rulings, what it checked) or not reached (Build, Launch: what each will decide, the four choices greyed). No gate is drawn open for your ruling, so nothing shows the case, the Critic’s view or the user representative beside the choices you would tap. The reader: every sheet ends with a Records line in grey: file paths, several to a line, that cannot be tapped. The gate case, the stop card, the memo, a ruling or a handover cannot be read from the phone; v48’s pull-request sheet alone opens a run or a review record, with “‹ The pull request” to come back.
