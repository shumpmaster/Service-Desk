# Mockup v35 build layer

v35 is v34 plus this layer. It carries out the owner's round 8, answers 8 and 9 (decisions/questions/P-005-design-round-8.md): "Honestly love every option. Especially the research functionality"; "I want you to go with ever option you recommended so if those are all A then do that". Home is as in v34.

    python3 v35.py ../timeline-v34-craft.html ../timeline-v35-craft.html

The code is option A of each kind from `../options-r8-kinds/source/` (kn.css, kn.js), fixed to A: `source/kinds.css`, `source/kinds.js`. The hash no longer chooses an option and the page starts on home, as v34 does. The B branches of the options' code stay in kinds.js but never run.

- **Gate**: a row of its own closing its phase: GATE, its name, its state (Passed, Not reached), Yours while it is still the owner's, a line under it (your ruling and when, or what it decides), a chevron. The map's edges mark the gate in and the gate out; the phase menu's gate rows say passed 13 Nov, yours, or yours, next. Tapped, a sheet: what it decides, what it waits for, what you will get, the four choices, and its records. Its time is in Chicago time ("13 Nov, 10:10 am"), like every other time; v34's gate line read 16:10 UTC.
- **Decision**: Yours (or By proxy) on its first line, and under the title the words it applies: "Applies your words: “criteria-wrong (Recommended)”". Tapped, a sheet: your words, who applied it and when, what it changed, the choices it had, its records.
- **Research**: RESEARCH in place of SPRINT on Q-028, a Memo tag, "Passed its source check on the 3rd try · 13 Nov"; the map lane reads "1.5.1 Research Q-028". Tapped (or its Memo), a sheet: the question, the decision it serves, what happened step by step, how sure it is, its records.
- **Stop**: "Yours · waiting", "Three plan reviews failed · holds up M6, M7, M8", and an "Answer stop card 5" button opening the card's five choices, criteria-wrong edged in blue. The Answer buttons are an example: no record says the desk's answer link can record a stop card's answer, so the mockup sends nothing and says so.
- **One fix to v34's landing**: v34 found the waiting stop by its tag reading "Waiting on you"; option A's tag reads "Yours · waiting", so without a change the page would land on the Now card about 560 points past the stop. The stop row now carries a mark (`data-kn-wait`) and v34's matcher accepts it (an assert-once text patch in v35.py).

## Checks (Playwright and Chromium, 393×852 and 360×740, light and dark; 393 light with reduced motion)

| Check | Result |
|---|---|
| Console errors, sideways scroll | none, in all five runs |
| Gate rows | 3, each a row with its flag ring: Design gate Passed; Build gate Not reached, Yours; Launch gate Not reached, Yours |
| Gate sheet (Build gate) | opens: What it decides, What it waits for, What you will get, Your choices, Records; Escape closes it |
| Gate marks on the map | "Build gate · yours", "Launch gate · yours" on Design's map |
| Phase menu gate rows | "Design gate · passed 13 Nov", "Build gate · yours, next", "Launch gate · yours" |
| Decision rows | "Yours / Applies your words: criteria-wrong (Recommended)"; the planned S-011 frozen reads Yours; the sheet opens ("Stop card 4 applied: a new spec, rounds reset") and the scrim closes it |
| Stop row | tag "Yours · waiting"; "Three plan reviews failed · holds up M6, M7, M8"; Answer opens five choices; a choice says "The mockup sends nothing" |
| Research (Discovery, Discovery-5 open) | level "Research", "Passed its source check on the 3rd try · 13 Nov", lane "1.5.1 Research Q-028", the Memo opens the sheet (The question, The decision it serves, What happened, How sure it is, Records) |
| Clock times without am or pm in the list | none |
| Opens with Stop card 5 at the pointer (v34, F2) | yes, in all five runs (393: row 471, pointer 545; 360: row 414, pointer 489) |
| Round button tap lands on Stop card 5 | yes, in all five runs |
| Map arrow scrolling down Design (v34, F4) | only moves right: 156, 203, 227, 227, 227, 239, 275, 346 at 393; 121 … 315 at 360; hidden past the last event |
| Band fold (v34, U3) | 334 → 76 → 334 |
| Second milestone tap (v34, F6) | clears the selection; the next tap selects again |
| Top row (v34) | 38 × 4 |
| Why tap (v33, F1) | scroll unchanged (2297 → 2297 at 393; 2525 → 2525 at 360); the Why tag is a grey fill with no border |
| Needs bubble (v33, U1) | opens with a close mark; Escape closes it. It scrolls the page 266 to fit, as v34 does (v33's U2) |
| Open in Claude (v33, F3) | on screen: y 404–434 at 393, 424–454 at 360 |
| Context view (v34) | event rows numbered 2.2.1.1 …; links "PR #428", "CoS 13 Nov", "CoS 14 Nov" |
| Push (v34) | comes in from the right (+243 at 393 60 ms in); none with reduced motion |

Short: the planned map's milestone names stay cut to about nine letters (v34, as drawn); the project pill still cuts "Home-screen widget" (a ruling for the owner, in Not settled).
