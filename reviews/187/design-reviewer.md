Verdict: PASS

Round 3, stage 7, at b5668a2. The last finding is fixed. The short mark showing that a piece of work is still under way is now a short stack of thick, flat rungs, in its lane's grey. It no longer looks like the lane carrying on, whether the lane is solid, dashed or dotted, in light and dark. Nothing else on the desk changed, the accepted desk is still identical, and every test passes. Nothing blocks; two small notes follow, neither caused by this change.

**What I ran**
- **Worktrees:** fresh detached worktrees at b5668a2, f393d3c and 361b6b7; all removed at the end, branch untouched.
- **Harness:** dr7-h, with the head's fixtures, unchanged since f393d3c. b5668a2 captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr7-h/cap-r3/ (2,056 PNGs). The f393d3c reference is .../dr7-h/cap-r2/.
- **Stub sweep:** a new script, .../dr7-h/stubs3.mjs, visits every member page of every project in main, extremes, sdq, unread25 and letters, at 360 and 414, in three theme modes: light, the phone's dark, and dark forced with `data-theme="dark"`. It measures each stub against its lane, the nearest marks and the "now" ring, and clips a capture around it. Output is in .../dr7-h/stubs-r3/: stubs.json, stubs-forced.json and 337 clips.
- **Tests:** the locked page tests ac80-board, ac81-bar-type and ac48-62-63-look, plus ac88-dark: 51 of 51 pass, and the locked files are unchanged since f393d3c. The full suite: 1,017 of 1,017 pass (.../dr7-h/suite-r3.txt).

## R2-1 is fixed

**The change:** sandbox.css:540 `.sb-lanes .lane.stub { stroke-width: 4; stroke-dasharray: 1.5 2.5; stroke-linecap: butt; }`. Its colour still comes from the lane's shade rule.

**Measured on every stub:** 348 across light, phone dark and forced dark (116 each).
- **Pages:** every orchestrator; the owner pages of Alpha, Beta, Gamma, Eta, Epsilon and Letters; every builder; and the Epsilon definer and researcher.
- **Lanes:** 0 (solid), 1 (dashed), 2 (dotted) and 3 (ink dashed), in both the agents' and the owner's lane families.
- **Every one** is 4 px wide in 1.5/2.5 butt dashes, 14 px long, and its stroke equals its lane's stroke exactly. The lanes are 2 px wide: solid, 6/4 dashed or 0.01/4 round-dotted.
- So the stub keeps AC49's "short dashed stub" in its lane's grey (part A item 2). In shape it is twice the weight of any lane or curve, with flat rungs no lane, curve, dot or ring draws (items 13 and 25).

**Forced dark** gives `--bg` #0f1012, and its 112 clips are pixel-identical to the phone's dark ones.

**At a glance:** .../dr7-h/r2crops/m3-sd-orch-360.png covers the Service-Desk orchestrator's four stubs (lanes 1, 3, 2 and 1) in light and dark. .../dr7-h/r2crops/m3-alpha-414.png covers the Alpha owner's lanes 0 and 1, the builder with its "now" ring, and the orchestrator's lane 2.
- On each lane type the stub reads as a distinct "≡" above the lane's top mark. That holds against the solid line, the 6/4 dashes and the round dots of a dotted lane, light and dark, 360 and 414.
- It starts at the lane's top dot (distance 0) and is never confused with the dot, the "now" ring or a fork curve (nearest curve 3.6 to 21.7 px).
- Compare round 2's failing state, where the stub on a dotted lane read as more of the same dots: .../dr7-h/r2crops/stub2-dr7r2-wt-light.png.

## Nothing else moved against f393d3c

**Pixel diff of all 2,056 captures** (.../dr7-h/imgdiff-r3-all.txt): 1,791 identical. Of the rest:
- the stub's own box, 4 px wide and up to 9 px tall at x 42–46, 56–60 or 70–74, on the stub pages only;
- "checked N s ago" counters;
- 7 full-page captures with a larger difference. I recaptured four of them (Beta and Eta builders, Service-Desk definer in sdq, critic in unread25) twice at each head. The repeats differ only in the stub's box, or not at all.
  - The odd captures are the harness's full-page race. It caught the log's frame before its drawing was placed, and appeared at every head across rounds 1–3: .../dr7-h/r2crops/race-eta.png.
  - Main's two (Alpha builder; Service-Desk definer, 414 light) were checked the same way (.../dr7-h/imgdiff-r3-main.txt).

**Unchanged:** lanes, curves, dots, words and every other screen. In all eight b5668a2 measure sets: no text under 4.5:1, nothing scrolls sideways, and text boxes stay 16 px.

**Accepted view:** still pixel-identical to 361b6b7. 100 of 100 captures from main and sdq, both widths, both themes (.../dr7-h/imgdiff-acc-r3.txt), and the crawl texts are byte-identical.

## Non-blocking notes

1. On a builder's log, the "now" ring (radius 8) covers most of the 14 px stub, so only one or two rungs show above it. The geometry is the same as at 361b6b7, and the ring and the "now" tag carry the meaning.
2. In a full-page capture, the running log's drawing can lag one frame behind a viewport resize. It was seen at every head, never in a normal-viewport capture, and dot alignment measures 0–0.1 px off. If it matters on a phone turning sideways, it would be a follow-up to file.

Round-1 follow-ups still stand: the seam between a Plan bubble's top row and its ground, "Cost: –" on the Working now sheet, and PR, deploy, hold and merge sheets drawing no whole-record fold.

## Open question
- No fixture gives an owner's log a stub on lane 2 or 3, or the Chief of Staff a log with lanes. The rule covers them through the shared selector, but no capture shows them. Should a fixture be added?
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-7-design-round3-verbatim.md.)
