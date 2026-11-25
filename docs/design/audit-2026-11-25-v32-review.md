*By the Design reviewer, on the model the owner named, at the owner's request (decisions/questions/P-005-design-round-8.md, answer 1): an advisory review of mockup v32 (docs/design/mockups/timeline-v32-craft.html) for improvements to flow, usability and readability. No verdict was asked for. Recorded verbatim by the orchestrator, session session_01QBwHGLabYiZK6jrjfzcfBm; its 100 screenshots stayed outside the repository. The Chief of Staff opened two of them (30b, 31 at 360) and saw what F1 and F3 describe.*

ADVISORY REVIEW: timeline mockup v32 (/home/user/Service-Desk/docs/design/mockups/timeline-v32-craft.html)
No verdict was asked for and none is given. Nothing in the repository was changed.

## 1. How v32 reads and works

v32 reads well as a whole: home says in one sentence what waits, and the project page has a clear hierarchy, with rails, level labels and gauges that are easy to tell apart in light and dark. Folding never moves the tapped row (0 px measured), and nothing scrolls sideways at 393 or 360 px. The weak points are in what happens after a tap, not in the look:

- Tapping Why throws the page by more than 1,000 px.
- The page opens, and "jump to Now" lands, with the fixed pointer on a row that is not the thing waiting on the owner.
- The session bubble puts "Open in Claude" under the tab bar or off the screen.
- The map re-scales under the pointer as you read, and shows the Design phase while the pill says Build or Launch.
- The floating band takes 331 px, so the list gets about half the screen, and less inside Safari.

Fixing the first three would change daily use the most.

How it was checked: Playwright and Chromium at 393×852 and 360×740, light and dark, deviceScaleFactor 1, plus one 393×659 capture to stand in for Safari with its toolbars. The page uses the system font stack (P-005-rebrand-style retires IBM Plex), so Linux rendered a fallback font; truncation widths are approximate to a few px.

## 2. Findings, ranked within each group

### Flow

**F1. Tapping Why throws the page.**
- Saw: in 6 of 6 trials (mouse and touch, different rows) scrollY jumped the moment Why was tapped: 640→2131, 640→1924, 640→2162, 1903→1097, 2039→847, 660→1944. The bubble (`.w2-bub`) opened 600 to 1,800 px off screen. Screenshots: `30b-why-after-tap-393-light.png`, `30-why-bubble-393-light.png`.
- Saw also: "Needed by Spec revised, round 4" (in the plan) moved the page 1825→934 and put the pointer on 2.2.2.5 Merge, not on 2.2.2.11, the row it names (`65-needed-by-tapped-393-light.png`).
- Likely cause, not proven: `relist()` (line 3317) measures its anchor before the later layers rebuild the list.
- Why it matters: R5 answer 11 ("I don't want clicking on this type of card to move the flow back") and R7 answer 12 ("don't let the whole screen move around with it").
- Suggest: pin the tapped row the way folds already do (the `finPin` hold at line 4987 works). Needs-tag taps already hold still (2110→2110).

**F2. The page opens, and "Now" lands, off the thing that waits.**
- Saw on open (`03-project-open-393-light.png`): scrollY 640, the pointer on 2.2.2.2 "First draft" (12:16). At 360 it is on 2.2.2.1; at 393×659 on the sprint heading. The M6 row sits half under the band (row y 294 to 350, band bottom 331). Stop card 5 (2.2.2.10), the thing waiting, is about 1,400 px further down.
- Saw on round-button tap (`44-jump-to-now-393-light.png`): the Now card lands at y 339, directly under the band. The pointer is on milestone 2.5 (2.4 at 360) and the map arrow is hidden (opacity 0).
- Why it matters: R7 answer 8 asks for a fixed centre "always identifying" what is in line with it; the glance should start on what needs the owner.
- Suggest: on open and on the Now tap, put the waiting event (or the Now card) at the pointer, with its arrow shown on the map.
- Touches round 3 answer 4 as the Chief of Staff read it ("Now just under the floating band"); that wording predates the fixed centre, so it is a question for the owner.

**F3. The session link is below the fold.**
- Saw: the session bubble opens in the list under the row, 235 to 307 px tall, with "Open in Claude" as its last line. With the row at the pointer, the link sits at y 810 at 393×852 (the tab bar starts at 770 and covers it) and at y 792 at 360×740 (below the 740 px screen). Screenshots: `31-session-bubble-at-pointer-360-light.png`, `31-session-bubble-393-light.png`.
- Why it matters: R7 answers 2 and 4 want to go "back and forth between the desk and Claude code sessions". Today that is tap, scroll, tap.
- Suggest: make "Open in Claude" the first line of the bubble, with the run or pull request beside it and the description after.

**F4. The map re-scales as you read.**
- Saw, scrolling down S-011 in time order:
  - the blue window's width went 28→164→232→309→164→28→0→164→232→309 px;
  - the map arrow's x went 192, 90, 145, 192, 262, 332, 260, 192, 227, 94, 90, 131, 156, 270, 292, 332;
  - the "PR #445" label slid 269→210→175→147→129.
- Through the spec writer's six actions (about 640 px of scrolling, scrollY 1100 to 1740) the window is 28 or 0 px wide and every event squeezes into clumps (`10-scroll-1200-393-light.png`).
- Why it matters: the same complaint as R7 answer 18 ("the timeline perspective gets thrown off"), now from scrolling.
- Suggest: hold one scale per phase, or keep the last window while the pointer is inside a plan, so the arrow only ever moves right as you read down.
- Touches R5 answers 4 and 7 (fit and centre the events in view): a question for the owner, not a recommendation against them.

**F5. The map shows the wrong phase for Build and Launch.**
- Saw: with the pill reading "3 Build" or "4 Launch", the band still shows Design's map with the "2.2 M6" chip, at full 331 px (`13-phase-at-2760-393-light.png`).
- Why it matters: Discovery gets its own map and a 211 px band; a phase with no events gets a stale one.
- Suggest: for a phase with no events, show its planned milestones, or shrink the band to the top row so the list gets the room.

**F6. One tap on a milestone does two things.**
- Saw: a tap opens or folds the milestone and selects it; a second tap folds it but leaves it selected (`22-milestone-2.3-tapped-393-light.png`, `23-milestone-2.3-tapped-twice-393-light.png`). Only the chip's cross (10 px, in a 71×20 chip) clears it. M6's dashed outline spans the whole map (x 4 to 387), so it reads as the map's frame.
- Suggest: a second tap clears the selection, or the chip takes a larger hit area.

### Usability

**U1. Bubbles are hard to close.**
- Needs: no close control; Escape and taps outside do not close it (`36-needs-still-open-after-all-393-light.png`). Its own tag moves from the row's right (299, 450) to under the bubble at the left (80, 703), 253 px lower and sometimes under the tab bar; tapping it there is the only way out (`37-needs-open-tag-moved-393-light.png`).
- Why and session: close on a tap outside, not on Escape; no close control.
- Checklist: item 15 (visible close control, closes on outside tap or Escape) and item 11 (close control 44×44).
- Suggest: one small close mark in each bubble, a tap outside closing all three, and the Needs tag staying where it was tapped.

**U2. The Needs bubble runs under the tab bar.**
- Saw: with the row at the pointer, the bubble spans y 522 to 737 at 360×740 while the bar starts at 658, hiding the third requirement and "Then:" (`33-needs-bubble-at-pointer-360-light.png`). At 393×852 its last 4 px are covered.
- Suggest: open upward when there is less room below than the bubble needs, or add bottom space equal to the bar.

**U3. The list gets about half the screen.**
- Saw: band 331 px plus the floating bar leaves the list 439 px at 393×852 (52%), 327 px at 360×740 (44%) and 246 px at 393×659, which is the sprint heading and one and a half events (`70-project-open-393x659-safari-like-light.png`).
- Why it matters: R7 answers 21 and 22 asked twice for more room for the list.
- Suggest: an owner-controlled way to shrink the map to a single strip (a tap on the band's edge), still floating.
- Touches round 3 answer 4 (the map always stays) and R7 answer 20 ("okay with the taller phase map"): put as a choice for the owner.

**U4. Tap targets are small.**
- Saw (measured, CSS px):

| Control | Size |
|---|---|
| Why | 40×18 |
| Claude | 64×18 |
| Needs | 73 to 76×18 |
| "Needed by" | 241×22 |
| Selection chip | 71×20 |
| Context view links | 80×22, 28 px apart |
| Phase strip segments (role=button) | 34 to 69 × 8 |
| Back, bell, More | 32×32 |
| Top pills | 34 high |

- Why and Claude sit 6 px apart on one line.
- Checklist: item 11 (24×24 minimum; several pass only by the spacing exception).
- Suggest: invisible hit padding up to about 44 px with no change to the look, so the slim top row of R7 answer 22 stays. Make the strip segments non-interactive, or give them the row's height.

**U5. Context view rows do not match the owner's words.**
- Saw: event rows carry a dot, not their number, though R7 answer 4 asks for "the number and title plus the link". All 35 links read "Claude" (9 of 9 in the main list too) although 9 different sessions stand behind them. Titles are cut to make room ("Merged PR #443: the card's …"). Screenshots: `52-context-top-393-light.png`, `50-context-view-393-light.png`.
- Suggest: show the fourth number on event rows, and let the tag tell sessions apart (a short name or start time), or bracket consecutive rows that share a session under one link.
- The second idea touches R7 answer 4 (one link per row): a question for the owner.

**U6. Holding the round button has no visible hint.**
- Saw: the hold fires at about 515 ms and works both ways. The only hint is "Hold the round button to leave" at the top of the Context view, which is off screen because the view lands on Now.
- Suggest: a one-time hint, or a small mark on the button when the Context view is on (it already turns blue).
- Not checked: whether iOS's long-press callout interferes.

**U7. The phase menu clips its gate lines.**
- Saw: gate rows are 302 px wide in a 270 px menu: "Build gate · yours: you approve the pla" (`41-phase-dropdown-393-light.png`; same at 360).
- Suggest: wrap to two lines.

**U8. The project pill cuts the name.**
- Saw: "Home-s…" at 393 for Home-screen widget (`45-switch-project-widget-393-light.png`); "The ti…" at 360 (80 px of name in 53 px).
- Suggest: let the project pill take the row's spare width and the phase pill shrink first, or show the name on two lines in the menu.

### Readability

**R1. Milestone names are cut to one line.**
- Saw: 8 names truncated at 393 and 15 at 360. M7 "Everything the agent team does, on one timeline" shows 171 to 204 of 388 px; M8 the same. The MILESTONE label takes 65 px of each row.
- Checklist: item 19 (plain words first).
- Suggest: wrap names to two lines, as events already wrap (R7 answer 22), or move the level label to the small line above, as fourth numbers do (R7 answer 14).

**R2. A ring shows "0" where nothing is on record.**
- Saw: the percent inside each ring is 7.5 px (19 rings). Eleven not-started milestones and Discovery 1.5 show "0" beside "criteria not on record".
- Checklist: item 5 (an unknown is shown in words, never as zero).
- Suggest: an empty or dashed ring when criteria are not on record.
- Making the number larger conflicts with R7 answer 11 (the owner asked for it smaller), so that part is only noted.

**R3. Small or faint text.**
- Size: level labels 10 px uppercase (25 of them); the map's words and "main" 10.5 px; home's strip dates 9.5 px.
- Contrast (item 10, 4.5:1):
  - the white count on the blue badge is 3.52:1 in light and 3.65:1 in dark, at 11 px;
  - "main" is 2.92:1;
  - the Now card's "waiting 1 h 43 min" is 4.27:1;
  - in dark, only the badge fails.
- Suggest: darken the badge blue under white text, and give "main" and the Now sub-line the ink-2 grey.

**R4. The map is hard to read at its edges.**
- Saw:
  - the four pull-request labels sit 2 to 4 px apart and read as one string, "PR #443 PR #444 PR #445 PR #446";
  - the lane label "2.3.2 Mockups v2 to v4" is cut at the right edge (drawn to x 486 at 393, 437 at 360);
  - "New spec S-011, rounds reset" lies across icons of the lane below;
  - the squeezed events overlap each other at both sides (`10-scroll-0900-393-light.png`, `10-scroll-0300-393-light.png`).
- Suggest: a separator or a minimum gap between main's labels, labels kept inside the frame, and the squeezed runs drawn as a count ("+6") in place of stacked icons.

**R5. Home at 360.**
- Saw: each strip's "now" label and dot are cut off (the 300 px drawing runs to x 374 in a card ending at 344); "Home-screen widget" and "4 Nov" wrap (`01-home-360-light.png`). At both widths the waiting questions are cut at two lines ("S-011 failed three plan reviews: wh…") while the wait time holds its own column.
- Checklist: item 16 (three lines, faded, the rest one tap away).
- Suggest: size the strip to its card; put the wait time under the question so the question gets the full width and three lines.

**R6. Many text sizes.**
- Saw: 13 sizes on the project page (7.5, 10, 10.5, 11, 12, 12.5, 13, 13.5, 14, 15, 15.5, 17, 22).
- Not a checklist finding: part B does not apply to this mockup. A note for the build: fewer steps would make the levels read more distinctly (item 8).

### Other

**O1. Console errors.** Four SVG errors (`<rect> attribute x: Expected length, "NaN"`, also width and `<text>` x) appear when the list jumps to about scrollY 2400 to 2520, with the pointer near milestone 2.4. Reproduced twice. No other errors.

**O2. Stale label.** The plan row numbered 2.2.2.7 carries `aria-label="Step 2.7.2.5, fold its actions"`.

**O3. Times.** Home says "as of 17:25 UTC"; event rows show a clock time with no date ("12:07" for 14 November). Checklist item 20 asks for America/Chicago. A date on events older than today would help.

**O4. Verified fine.**
- No sideways scroll at 393 or 360 in any state.
- Folds move nothing (sprint, milestone, unused milestones: 0 px).
- The band growing from 211 to 331 px between Discovery and Design does not move the rows.
- Reduced motion leaves no running animation and makes the Now jump immediate.
- Zoom is not locked; the search box is 17 px.
- The phase and project menus have 44 px rows and close on Escape.

**O5. Not checked.**
- A real iPhone: momentum scrolling while the band changes height, long-press behaviour, safe areas, the San Francisco font.
- Where the links lead.
- The bell and tabs 2 and 3, which do nothing in the mockup.
- The quiet-projects fold: my tap did not open it, so its state is unverified.
- 414 px.
- Leaving the Context view: it returned to a different place than I left (640→1154), but I had tapped Now inside it, so this is not a clean test.

## 3. Observations for "serves no purpose / missing"

Serves little purpose as drawn:
- The word "Claude" on every event, identical 9 of 9 times (35 of 36 in the Context view).
- The same figure said two or three times: ring "100" beside "Reached · 100%"; sprint squares beside "9 done · 75%" and "12 events"; phase "38%" beside "3 of 8 milestones reached" and the strip.
- The "0" rings on milestones whose criteria are not on record.
- MILESTONE repeated on 20 rows. The owner asked for labels (R7 answer 9), so this is only an observation.
- The Now card repeats event 2.2.2.10 and sits under milestone 2.3, outside M6 and S-011 where the stop happened.
- "by orchestrator" and "by reviewer (plan)" lines under most events.
- The map's lane names and squeezed clumps for sprints not in view.

Missing:
- The four things waiting. The pill says 4, but the project page shows one as Now and the other three only inside event 2.2.2.5's tag. There is no list of them.
- A way to answer from the project page. The sheet from the Now card offers Done, Close and Open on GitHub, with no choices (`61-home-wait-row-tapped-393-light.png`, `64-now-card-tapped-393-light.png`).
- Who is at work now and on what (P-001-design-discovery answer 8).
- A "new since you last looked" mark (same answer).
- Dates on events, and how long each wait or stop lasted.
- Anything on the map for a planned phase.
- Tokens and context use (P-001-usage-and-context).
- Gates: thin 28 px grey lines although they are the owner's own decisions; research does not appear at all. Both belong to the queued topic and are noted only.

## 4. Screenshots

All 100 are in `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-review/`.

Most telling:
1. `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-review/30b-why-after-tap-393-light.png` (F1: the page after tapping Why)
2. `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-review/03-project-open-393-light.png` (F2: where the page opens)
3. `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-review/31-session-bubble-at-pointer-360-light.png` (F3: the link off screen)
4. `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-review/10-scroll-1200-393-light.png` (F4: the map squeezed inside the plan)
5. `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-review/13-phase-at-2760-393-light.png` (F5: Build with Design's map)
6. `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v32-review/36-needs-still-open-after-all-393-light.png` (U1: Needs will not close)

The rest, by filename in the same folder:
- Home: `01-home-{393,360}-{light,dark}.png`, `04-home-scrolled-393-light.png`, `05-home-full-393-light.png`, `60-home-quiet-open-393-light.png`, `61-home-wait-row-tapped-393-light.png`, `62-home-{bell,more,tab1,tab2,tab3}-393-light.png`, `63-home-search-393-light.png`
- Opening a project: `02-push-midway-393-light.png`, `03-project-open-{393,360}-{light,dark}.png`, `70-project-open-393x659-safari-like-light.png`
- Scrolling: `10-scroll-{0000,0150,0300,0640,0900,1200,1500,1900,2300,2700,3000,3400,3800}-393-light.png`, `10-scroll-{0420,0900,1200,2000}-{393-dark,360-light,360-dark}.png`, `11-wheel-step4-393-light.png`, `13-phase-at-{2760,3460}-393-light.png`
- Folding and selecting: `20-sprint-folded-393-light.png`, `21-s010-open-393-light.png`, `22-milestone-2.3-tapped-393-light.png`, `23-milestone-2.3-tapped-twice-393-light.png`, `24-chip-cleared-393-light.png`, `66-unused-open-393-light.png`
- Bubbles: `30-why-bubble-393-light.png`, `30b-why-after-tap-393-light.png`, `30c-why-open-in-place-393-light.png`, `31-session-bubble-393-light.png`, `31-session-bubble-at-pointer-{393-dark,360-light,360-dark}.png`, `32-session-bubble-merge-393-light.png`, `33-needs-bubble-393-light.png`, `33-needs-bubble-at-pointer-{393,360}-{light,dark}.png`, `34-needs-layer2-393-light.png`, `35-needs-after-escape-393-light.png`, `36-needs-still-open-after-all-393-light.png`, `37-needs-open-tag-moved-393-light.png`, `64-now-card-tapped-393-light.png`, `65-needed-by-tapped-393-light.png`
- Pills: `40-project-dropdown-{393,360}-{light,dark}.png`, `41-phase-dropdown-{393,360}-{light,dark}.png`, `42-phase-{build,design,discovery,launch}-chosen-393-light.png`, `45-switch-project-midway-393-light.png`, `45-switch-project-widget-393-light.png`
- Round button: `44-jump-to-now-{393,360}-{light,dark}.png`, `50-context-midmotion-393-light.png`, `50-context-view-{393,360}-{light,dark}.png`, `51-context-full-393-light.png`, `52-context-top-393-light.png`, `53-context-now-393-light.png`, `54-context-off-393-light.png`
