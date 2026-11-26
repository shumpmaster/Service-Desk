# Mockup v36 build layer

v36 is v35 plus this layer. It carries out the owner's round 8, answers 10 and 12 (decisions/questions/P-005-design-round-8.md): "Draw those options next"; "I want all 8 as recommended". Home is as in v35.

    python3 v36.py ../timeline-v35-craft.html ../timeline-v36-craft.html

The code is option A of each item from `../options-r8-purpose/source/` (pp.css, pp.js), fixed to A: `source/purpose.css`, `source/purpose.js`. The hash no longer chooses an option, and the phone's starting positions are gone; the page starts on home, as v35 does. The B branches of the options' code stay in the file but never run.

- **1, each count said once**: a sprint's line reads "stopped · your call · 9 of 12 done" (no "12 events", no percent); a phase heading drops its percent.
- **2, "by" lines**: the usual actor for each kind is dropped (Commit: spec writer; Review: plan reviewer; Decision: orchestrator; Check: Actions); "by you", other actors and extra words stay.
- **3, the Now card**: hidden; Stop card 5 wears a blue NOW tag.
- **4, what waits on you**: the count on the project pill opens a sheet of the four that wait, each with Answer and Go to it.
- **5, who is at work**: an "At work now" row under Stop card 5, opening a sheet.
- **6, new since you last looked**: a blue dot on each new row and "· 9 new" on Design's heading.
- **7, how long it waited**: "waited 3 h 53 min" (Stop card 4), "waiting 1 h 43 min" (Stop card 5), "waiting 2 h 39 min" (Merged PR #446).
- **8, tokens and context**: the session bubble says "Used: 4 helpers, 139,766 tokens" and shows a context meter, marked as an example.

## One patch to an earlier layer
The top row's own click handler (v31) runs on capture, before any later layer, and stops the click; so item 4's handler never ran on a real tap (the options page started its phone with the sheet open and did not meet this). `v36.py` patches that handler once to ask `window.__v36count` first: if the tap fell on the count (found by where the tap fell, since the pill may be redrawn between press and release), the sheet opens; otherwise the projects menu opens as before.

The Now card's removal needed no patch: v34's landing and the round button's tap find Stop card 5 by v35's own mark (`data-kn-wait`), and the hidden card is only a fallback.

## Checks
Playwright and Chromium at 393×852 and 360×740, light and dark, and 393 light with reduced motion.

| Check | Result |
|---|---|
| Console errors, sideways scroll | none in any run |
| 1: percent in a sprint line; phase percent shown | 0; 0 |
| 2: usual-actor lines left | 0 ("by you · planned · an example" kept) |
| 3: Now card shown; NOW tag on Stop card 5 | no; yes |
| 4: tap on the count | the sheet "4 things wait on you in The timeline" with 4 rows; the projects menu does not open; Go to it closes the sheet and puts Merged PR #446 at the pointer |
| 5: At work row; its sheet | "At work now · Chief of Staff (CoS 14 Nov)"; "The Chief of Staff, on S-011" |
| 6: new dots; heading count | 9; "9 new" |
| 7: waits | "waiting 1 h 43 min" and "waiting 2 h 39 min" in the waiting colour; S-010 opened, Stop card 4 "waited 3 h 53 min" |
| 8: session bubble | "Used: 4 helpers, 139,766 tokens … Context: 62% at its peak (an example: not recorded)" |
| Opens with Stop card 5 at the pointer (v34) | yes (393: row 462, pointer 545; 360: row 406, pointer 489) |
| Round button lands on Stop card 5 | yes |
| Arrow scrolling down Design | only moves right (393: 61 → 334; 360: 45 → 294), hidden past the last event |
| Band fold (v34) | 334 → 76 → 334 |
| Second milestone tap | clears; the next tap selects again |
| Top row | 38 on all four |
| Push | in from the right (+243 at 393 after 60 ms); none with reduced motion |
| Why tap (v33) | the tag and the page stay put (414 → 414, scroll 2255 → 2255); grey fill, no border |
| Needs bubble | opens with a close mark; Escape closes it |
| Open in Claude | on screen (y 412–442 at 393, 416–446 at 360) |
| Gate, decision, research and stop sheets (v35) | all open and close; the stop's five choices; research "Q-028: how long GitHub keeps run results" |
| Context view | event rows numbered (2.2.1.1); links "PR #428", "CoS 13 Nov", "CoS 14 Nov" |
| Clock times without am or pm | none |

Screenshots stayed outside the repository.

## Carried over
- The Needs bubble may scroll the page to fit (v33's U2), as in v34 and v35.
- The planned map's milestone names are cut to about nine letters; the project pill still cuts "Home-screen widget" (Not settled in TIMELINE-CURRENT.md).
- Examples, not records: every Answer button; when you last looked; the context meter. The records are asked for in `../../requests/2026-11-26-timeline-records.md`.
