# S-001 desk v2, stage 6a (the portfolio block): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-6a at 5edaaf3.

---

Verdict: FAIL

The new block at the foot of Home matches frame H4 for size and spacing, and every row uses AC87's 6a words. Each sheet opens and closes properly, and the rest of the desk is unchanged from 84c1224. Two blocking points remain, both small to fix. First, the Scorecard sheet adds a line explaining what the marks mean, and mockup v2 allows no key. Second, when the desk can't read a project, the cap line calls it "not read yet", while the same screen says "Can't read … since 13:00". Nothing was skipped. The three locked page tests pass.

Captures are at 360×740 and 414×896, light and dark, in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/shots/. There are 132 of them, and the measurements are in m-all.json in that folder. Made-up projects are labelled NOT real in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/setups6a.mjs.

## Blocking

**B1. The Scorecard sheet adds a key** (part B item 35; settled conflict 2; the spec repeats "no key … every icon carries its word" at specs/S-001.md:6820-6821)
- The sheet ends with: "The marks: a slashed circle, no record for this in the model yet; a dashed circle with "?", not recorded yet."
- Each mark already sits at 16 px beside its own words on the lines just above it. No spec text asks for this line.
- Source: src/lib/portfolio.js:45 (`PF_WORDS.marks`) and src/public/sandbox.js:978.
- Captures: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/shots/build-sheet-scorecard-360-light.png, and the same line in all 12 scorecard sheet captures.

**B2. A project the desk can't read is called "not read yet"** (part A item 4, the honest-state words; item 5, unknowns in true words)
- Setup: md-extremes plus Zeta-unreadable, whose read is refused with not-found.
- The briefing says "Can't read Zeta-unreadable since 13:00" and the tile says "Can't read since 13:00: not-found".
- The block's cap line says "In Build or Launch: none · Zeta-unreadable's phase: not read yet". By the code, its sheet would say "Phase: not read yet · not counted".
- Cause: src/public/sandbox.js `portfolioOf` passes only `b.error`, so a refused read falls into src/lib/portfolio.js:65 (`pv.why === 'Phases: reading…'` gives 'not read yet'). The "can't be read" words at :64 are reached only on a build error.
- Captures: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/shots/extremes-foot-360-light.png and extremes-foot-414-dark.png. The same text is in cmp-new/measures-extremes-ext.json in that folder.

## Non-blocking (carry as risks or follow-ups)

- **N1. The marks sit in a different place from frame H4** (item 26):
  - H4 puts a state icon in each row's left column: "?" for the cap, ✓ for decisions, "?" for the scorecard.
  - The build leaves all five left columns empty and draws each mark just before the words it marks.
  - The spec explains most of this: no ✓ on a queue nobody read in 6a, the slashed circle for the cap, and one mark per part of the Scorecard.
  - The marks never strand: each 12 px mark (top 361.9, bottom 373.9) sits inside its 12/16.8 line (359.5–374.5).
- **N2. Rows have no line limit.** With long names, the cap line runs to 6 lines and the versions line to 7 at 360 px (long-foot-360-light.png). Item 16 covers only summaries and rulings, so this is not a failure. Since the sheet holds the detail, these rows could be clipped.
- **N3.** At 414 px the foot line's "P-001-portfolio-read" breaks at a hyphen into "P-001-portfolio-" / "read)." (real-foot-414-light.png). The words are the spec's and the frame's (item 19).
- **N4.** The versions sheet's last line gives file paths (governance/OPERATING_MODEL_VERSION, VERSION) in plain small Sans rather than Plex Mono (item 19).
- **N5.** The sheet heads' label "Across your projects · read only" is in Plex Mono 11 px. It is words, not a reference (item 23), but it follows the existing mono label slot of the sheet head.
- **N6.** A portfolio sheet reopened by a reload doesn't take focus. Escape then leaves focus on the page body, not on a row. Evidence: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/probe-reload.mjs.

## What passes

- **Sizes, closest to Linear's** (items 27, 23):
  - The block and sheets use only 11, 12, 13 and 18 px, weights 400, 500 and 600, with Plex Sans and Plex Mono loaded.
  - They match frame H4 as rendered (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/mock/H4.json):
    - the heading is 11/500 grey, with 18 px of space above it and a 1 px rule;
    - "portfolio" is 11/400 Plex Mono;
    - row titles are 13/500, and the rarer-records row is 13/400 grey, as drawn;
    - row lines are 12/400 grey, with 9 px row padding;
    - the line under the rows is 12/400;
    - the gaps above the heading, below it, and before the foot line are 12, 12 and 12 px, as in H4.
- **Words** (AC87 6a; the owner's "no made-up values"):
  - Today's real setup:
    - "In Build or Launch: none · your cap: no record for this in the model yet";
    - "Not read yet: your portfolio isn't connected to the desk";
    - "Targets: no record for this in the model yet · your time across projects: not recorded yet";
    - "Model versions · latest 3.5.0", then "Service-Desk 3.5.0 · Personal-Org-Operating-Model runs the v2.5 pipeline, publishes 3.5.0";
    - "Rarely needed · not read yet: your portfolio isn't connected";
    - the 6a line under the rows.
  - Made-up project in Build: "In Build or Launch: Example" and "Example 3.4.0, 1 behind".
  - Missing version file: "Example: not recorded".
  - No latest: "latest: not recorded", "Example 3.2.7" with nothing compared, and "publishes: not recorded".
- **Sheets** (items 11, 15):
  - Every row opens a dialog with a 44×44 "Close" and focus on it. Enter from the keyboard opens it too.
  - Escape, the close control, a tap outside and Back each close it, with focus back on the row. The focus ring shows after keyboard closes, not after a tap.
  - A reload keeps the sheet open.
- **Width, contrast, accent, fixtures** (items 6, 10, 12, 14, 25):
  - Nothing scrolls sideways in any of the 132 captures, light or dark.
  - No text is under contrast. The lowest is grey text at 6.4:1 in light and 7.72:1 in dark.
  - No vermilion is used in the block or the sheets.
  - The service-desk, poom and md-extremes fixtures render without error.
  - No call names the portfolio.
- **Navigation** (item 22): the bar is still Home · Waiting · Plan, with no Portfolio tab.
- **Unchanged from 84c1224:**
  - Of the 142 screen captures, only Home differs (the new block) and the live "checked N s ago" age. That covers the rest of Home, Waiting, the project page, the Timeline, Team and Plan.
  - All 220 sheet captures are identical.
  - Home above the block is pixel-identical apart from the age line.
  - Details: imgdiff-cmp.txt and imgdiff-sh.txt in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/.
- **Locked tests:** ac80-board 28/28, ac81-bar-type 11/11 and ac48-62-63-look 9/9 pass, and their files are unchanged. ac87-portfolio 12/12, ac82-home 26/26 and ac86-plan 19/19 also pass.

## Already there before this change

- **P1.** Home's scroll position isn't kept across a reload at 84c1224 or 5edaaf3 (item 15). The harness uses a fake clock, so this needs confirming on the preview.
- **P2.** Tile name links on Home are under 24 px tall and fail the spacing exception (item 11, from stage 2): "Service-Desk" 79×17 at 414, and "Beta" 28×17 in md-extremes at 360.

## Open questions

1. B2: the Orchestrator should decide with the Builder which words a refused or failed read should give in the cap line and its sheet. The rulebook points to "Can't read since HH:MM", or at least the "can't be read" the code already has. The versions row then says "not available", which is stage 3's word.
2. N1: is the move of the marks from the left column to inline acceptable as the spec's reading of H4, or should the owner see it?

Both scratch worktrees are removed. The harness and captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/.