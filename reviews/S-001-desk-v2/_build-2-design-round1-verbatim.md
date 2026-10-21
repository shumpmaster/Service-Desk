# S-001 desk v2, stage 2 (Home): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-2 at 2d3eeec.

---

Verdict: FAIL

**What this means for you.** Stage 2 fails on one point that blocks it, and the fix is small. Home matches what you asked for and what the mockup draws. Each tile shows its phases as a timeline, left to right, with a colour and an icon for each phase. The sizes are the mockup's ("closest to Linear"), except two headings inside the closed "More detail" fold. Four "Since you last looked" lines come first, then "more". The "Latest" bubble is gone, the fold sits closed at the foot, and nothing scrolls sideways at either phone width, light or dark. The board, Plan, Status, Timeline and Team are unchanged. What fails: on a screen 720 px wide or wider (an iPad, say), Home's column takes the width of its content instead of the screen's. It stays 708 px wide even on a 1024 px screen, and it shifts sideways when you fold a group. The cause is one class name doing two jobs. Nothing here is irreversible. There are also a few smaller points to fix and three questions for the Definer.

Evidence: my own Playwright Chromium captures, with the tests' fake desk answering every call. Times are made up at 2026-10-19 16:00 Chicago, and fonts were checked as IBM Plex Sans and Mono loaded. Everything is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-2/shots/ (named below as shots/), with measurements in its measures-*.json and states.json. The harness is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-2/cap.mjs, with setups.mjs and the probe-*.mjs scripts beside it. The scratch worktrees are removed.

## Blocking

**B1. Home's column at 720 px and wider takes the width of its content, not the screen's.** AC82 says "at 720 px and wider, two to a row, Home's column widening to at most 960 px for that (C: the width a tablet held upright passes)". This also touches part A item 1, through P-001-home-tiles' "two to a row only on a wider screen".
- Cause: sandbox.js:3304 puts the class `v2-home` on `<html>`. sandbox.css:959's `.v2-home { display: grid; gap: 12px; padding-top: 4px; }` was meant for Home's `<section>`, but it also matches `<html>`. The root becomes a grid, so `body` (with `margin: 0 auto`) sizes to its content and is capped by sandbox.css:1087's `max-width: 960px`. My measure's `querySelector('.v2-home')` returned `<html>`.
- Measured: `body` is 708 px wide at 720, 768 and 1024 px (states.json, "wide"). With every group folded at 720 px it is 644 px, and its left edge moves from 6 to 38 px (`probe-col.mjs` output). At 1024 it shifts from 158 to 190 px. Tiles are 334 px each, two to a row, at equal height (291 px).
- Captures: shots/st-wide-1024-light.png, st-wide-768-dark.png, main-groups-toggled-720-light.png, main-home-tiles-720-dark.png.
- Phones are unaffected: `body` fills 360 and 414 in every capture, and at 719 px it is 560 px with one tile a row.
- AC82's test checks only the CSS rule, so it can't see this.

## Non-blocking (to fix or file)

**N1. The fold's headings are 16 px weight 700, a bold the page doesn't load.** "Notifications" and "GitHub Actions this month" in "More detail" render at 16 px 700 (shots/main-home-foot-414-light.png). The page loads Plex Sans faces only at 400, 500 and 600, so Chromium fakes the bold. sandbox.css:1074's `.v2-home .sb-h3 { font: var(--t-row) }` (specificity 0,2,0) loses to sandbox.css:662's `html.sb .sb-h3 { font: var(--t-item) }` (0,2,1). This touches part B item 27 in spirit. It isn't blocking because v2 draws no fold, so part A alone applies, and items 8 and 23 hold. Every other text on Home is in the scale (sweep over all captures).

**N2. A tile whose records can't be read, or are still loading, names them "not recorded".** For a can't-read project, and for one still "Checking…" at first paint, the tile reads "Now: not recorded · Phases: reading…", "No agent run recorded" and "Next: not recorded". Captures: shots/zeta-branchcr-414-light.png and checking-sd-414-light.png (probe-first.mjs). The desk's own word for unread records is "not available"; Status says "Your last action: not available yet". This touches item 5 and item 30's three states. It isn't blocking because the base tile also stated an absence ("Nothing under way"), and the head of the tile is honest: "Can't read" / "Checking…", the red "Can't read since 16:00: not-found" line, the briefing's "Can't read Zeta-unreadable since 16:00", and the group header's "1 can't be read".

**N3. "Since you last looked" lines are cut at three lines with no fade.** Lines are held to `max-height: calc(3 * 1.45em)` (57 px; scroll height 188 px for a 367-character card title), cut mid-sentence (shots/x-since-sheet-long-360-light.png). Item 16's form for long text is three lines, faded, with the whole one tap away. The tap does open the record, but nothing shows the line goes on.

**N4. The Alpha fixture's tile puts the gate on a third row, and its sentence repeats itself.** The tile draws the Build gate ◆ on a "run 3" row under a run 2 that is now at Design. Its sentence reads "…Build and Launch ahead; the Build gate waits on you; Launch and Done ahead", with Launch named twice (shots/main-home-tiles-414-light.png; cells in measures-main-home.json, lineCells). The drawing follows the run model: the base's Status screen also shows "Build · run 3 still to come". The repeated words touch item 19.

**N5. A dashed drop hangs from an empty cell.** In the quiet fixture (Calm), run 2's drop hangs from a run-1 Design cell that is empty: run 1 holds only Build, now (shots/quiet-home-full-414-light.png). It follows the model, but frame H5 doesn't draw this case.

**N6. At 360×740 the tiles don't start on the first screen.** The "Your projects" header sits at about 670 px, under the bar (shots/main-home-360-light.png), against the since-count ruling's line "The tiles start on the first screen". The cause is two parts that were already on Home at the base: the sandbox marker and AC75's notifications line, about 130 px together. At 414×896 the first tile's head is visible.

**N7. At 720 px and wider, a short summary leaves a gap.** `.v2-tile .sb-sumclip { height: calc(3 * 1.4em) }` (sandbox.css:1088) holds three lines for a one-line summary, leaving a blank gap before "Why" (shots/main-home-tiles-720-dark.png). It keeps tiles in a row at the same height, as AC54 asks. This is a note only.

## What holds (summary)
- **Frames.** The briefing, "Since you last looked", the groups and the tiles match frames H1, H3 and H5 in order and form (item 26). Service-Desk's tile reproduces H5's drawing exactly. The groups read "Your projects · active" (open), "Closed or not run by the desk" (open), "Done" (closed). The "⋯ More" pill and the "Example" tags are not built, as ruled.
- **Sizes (item 27).** Title 24/600, briefing 15/500, since lines 13/400 with Plex Mono times at 11, tile name 13/600, tile lines 12, timeline labels 11, icons 14 px. All are the mockup's own rules, apart from N1.
- **Phases.** Each phase has its colour and an icon in a plain circle, and the drawing is carried in words for screen readers (items 13 and 14). Vermilion is used only for the owner's things.
- **Contrast (item 10).** No text under 4.5:1 on Home in light or dark, at 360, 414 and 720 px.
- **Width (item 12).** No sideways scroll in any setup: main, quiet, markers off, and extremes with eight projects, long names and one that can't be read.
- **Honest quiet (items 3 and 4).** "Nothing needs you · Every project read 2 s ago" shows only when everything is read; "Checking…" appears before that. Counts match: briefing = badge = the groups' headers, 39 = 38 + 1.
- **"Since you last looked".** Four lines, then "5 more since yesterday, 14:00", whose sheet shows the other 5 (44×44 close; Escape and a tap outside close it). "Mark as seen" empties the list at once. With no record on the device it reads "new-since markers off on this device". Times are in Chicago time.
- **Summary.** A long one clips to three lines (50.4 px at 16.8 px a line) with a fade. A tap opens the whole text in a bubble with a 44 px close, and Escape closes it.
- **Controls and motion.** No "Latest" bubble and no "Work ahead ›" control on Home. A tile's tap opens the Status screen (`#/p/Alpha`). "More detail" is last and closed. No motion rules are added.
- **Other screens unchanged.** 26 of 28 captures of Waiting, Plan, Status (Service-Desk, Personal-Org-Operating-Model, Alpha), Timeline and Team are byte-identical to 5a7e55a (folders dr-2/cmp-new and dr-2/cmp-old). The other two differ only in the clock's "checked 1 s ago" against "4 s ago".
- **Tests.** I ran ac80-board, ac81-bar-type and ac48-62-63-look: 47 of 47 pass. The full desk suite passes 896 of 896, and `node tools/build.mjs` passes. All three were edited on the branch (they sit in the builder's tests/** surface). The edits only swap today's Home for the new one, as the spec anticipates (AC62's "each stage's pull request takes its screens off it"; AC81's "none on stage 2's Home"). Whether those edits are allowed is the Reviewer's call.

## Open questions (for the Definer, through the Orchestrator)
1. A settle time already past reads in the future tense: "4 questions settle themselves, the first 15 Oct, 03:20" on 19 Oct. AC82 only covers the next 7 days and beyond. Should an overdue default say so?
2. A refresh doesn't keep the "N more" sheet open. AC40's ten-second rule, which AC82 keeps, moves "last looked" when the window ends. After a refresh the list is empty and the address stays `#/since` with no sheet, against item 15's "a refresh keeps open sheets". The same rule empties the list on every reopen after a ten-second look.
3. N2: what should a tile's "Now", "At work" and "Next" lines say while its project can't be read: "not available", or nothing?

Two rig notes:
- A network-kind failure with no earlier read shows as "Read 16:06" / "All clear" on the base too. It doesn't come from this change, so I used the fake's explicit can't-read state to test Home's can't-read forms.
- I left the builder's summary file in the scratchpad unread, as my pack requires.