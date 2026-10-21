# S-001 desk v2, stage 1a: the Design reviewer's round-2 build review, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/desk-v2 at 1c4d4f8, acting as design-reviewer.

---

Verdict: FAIL

**In plain words.** Round 2 fixes almost everything from round 1. The board's buttons and group names are now the right size. The sheet's "Done ✓" and "Close" are pills again, and its close control has its circle. The record fold's heading is back on the type scale, and the filtered board shows its quiet counts on one small line, as frame 2 draws it. On the full board, before anything has been read or when nothing can be read, the lanes now say "Not read yet" or "Can't read" in place of "0 / Nothing here". The `:where()` change left every old screen exactly as it was. One problem is left, and it is the same one as round 1's third finding. When the board shows one project and that project has not been read yet, or can't be read, the line under the lanes still says "With the agents: 0 · Being recorded by the automatic job: 0". Those are two zeros standing for things the desk doesn't know. It is a small, local fix. I changed nothing and committed nothing.

Branch: origin/orch/desk-v2 at 1c4d4f8. Round-2 code diff: bffdc1b..1c4d4f8, in src/public/sandbox.css, sandbox.js, lib/board.js and lib/j22.js. The spec as revised in e671cbd (AC80, AC81) was read.

## How I got the evidence
- **Harness:** round 1's harness, copied with the worktree path as a parameter, in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/r2/`. Scripts: `cap.mjs`, `measure.js`, `sig.js`, `pixdiff.mjs`, `buttons.mjs`, `behave.mjs`, `behave2.mjs`, `states.mjs`.
  - Playwright Chromium against src/public, with the page's calls answered by tests/desk/fake-desk.mjs.
  - Clock fixed at 2026-10-19T21:00Z.
- **Setups:**
  - main: Service-Desk, POOM (`fixtures/poom`), Example (board-v5 plus #140 awaiting its reviewer) and Alpha (`fullRepo`);
  - md-extremes.
- **Captures:** 360×740 and 414×896, light and dark. 154 captures (166 files counting the dumps) in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/shots-r2/`, with `measures.json` (text, computed styles, contrast, tap targets, accent users, fonts).
- **Unread states:** in `shots-r2/states/` (with `log.txt`).
- **Before/after of the old screens:** rendered in one run from bffdc1b (`shots-r2/base/`) and from 1c4d4f8 (`shots-r2/after/`).
- **Script errors:** none in any capture.
- **Tests:** the locked tests (`node --test tests/desk/ac80-board.test.mjs tests/desk/ac81-bar-type.test.mjs tests/desk/ac48-62-63-look.test.mjs`) give 45 pass, 0 fail. The whole suite (`node --test tests/desk/*.test.mjs`) gives 831 pass, 0 fail.

## Round-1 findings

**F1 (button reset out-ranking the v2 classes): resolved.**
- `sandbox.css` now puts its resets in `:where(.v2) …`, with no specificity.
- Computed at 360, light and dark (`buttons.mjs`):

| Control | Computed |
|---|---|
| `button.v2-grp` | 500 11px |
| `a.v2-step` | 500 11px, 28 px tall, 1px border, radius 6 (gate buttons 26 px) |
| `.v2-undo` | 500 11px (texts in `marks-*`) |
| `button.v2-x44` | 44×44, `--chip` background, radius 22 |
| `button.v2-abtn done` "Done ✓" | 67×36, chip background, padding 0 12px, radius 18, 500 12px |
| `button.v2-abtn ghost` "Close" | 55×36, padding 0 12px, ring by inset shadow; the word sits inside |

- Screenshots: `shots-r2/sheet-question-360-light-end.png` and `sheet-pr130-360-light.png`.
- `.v2-more` is `--t-label` and is no longer out-ranked (sandbox.css:908). No capture drew "<n> more", so this one is checked in the CSS only.
- The frame 2 part is resolved too: the filtered view now draws one line, "With the agents: 1 · Being recorded by the automatic job: 0" (`button.v2-qs`, 400 12px, ≥24 px tall). Screenshot: `shots-r2/beh/filtered-foldclosed-360-light.png`.

**F2 (record-fold heading at 19.5px/700): resolved.**
- The new rule `.v2-sheet .sb-record :is(h1…h6) { font: var(--t-row) }` (sandbox.css:951) applies.
- The heading "Ruling needed: How should…" renders at 500 13px. Screenshots: `shots-r2/sheet-question-record-*`.
- With every fold in the sheet opened, the scan finds no off-scale text (`behave2.mjs`: `off-scale in sheet: []`).

**F3 (a zero for an unknown): not resolved. This is the blocking finding below.**
- Fixed on the full board:
  - before the first read: "Waiting on you / Not read yet / Kicked back / Not read yet", with no counts;
  - with every project down: "Can't read" in both lanes, plus "Can't read Example since 16:00" and the same for Alpha;
  - no badge in either case; Home reads "Checking…" or "Not quiet: can't read 2 projects · last read 16:00".
- Still present in the filtered view.

**Open question 1 (the board's buttons, 11 or 12 px): resolved.** The spec now says 500 11px (AC81 as revised; e671cbd item 5), and `.v2-step` follows it (sandbox.css:896).

**Open question 2 (text no frame draws): resolved.**
- AC81 now gives such text the nearest role on the scale.
- The record heading is `--t-row`.
- The sandbox marker is `.v2 .sb-marker { font: var(--t-label) }`: measured 500 11px.

## Blocking finding

**F3-r2: Part A item 5 ("an unknown shown in words, never as a value or zero"; P-001-design-lab-1.md, "Absolutely no fake numbers"), and AC80 as F3 was settled.**
- **Where:** Waiting with one project shown (`#/waiting/<name>`, frame 2).
- **What it shows:** when that project is unread or can't be read, the lanes correctly say "Not read yet" or "Can't read", but the small line under them still reads **"With the agents: 0 · Being recorded by the automatic job: 0"**.
- **Cause:** sandbox.js:1714-1720 builds `small(...)` from `q.agents.length` and `q.recording.length` and never checks `bd.unread`. sandbox.js:1446 already works out `view.unread` for this same filtered set.
- **Reproducing case** (`states.mjs`), the same text at all four width-and-theme combinations:
  - Polls held, `#/waiting/Example`: "Example / 1 of 2 projects / Waiting on you / Not read yet / Kicked back / Not read yet / … / With the agents: 0 / · / Being recorded by the automatic job: 0".
  - Both projects aborted, `#/waiting/Example`: "… Can't read / … Can't read / … With the agents: 0 · Being recorded by the automatic job: 0".
  - Alpha aborted, `#/waiting/Alpha`: the same.
- **Screenshots:** `shots-r2/states/preread-filtered-360-light.png`, `alldown-filtered-414-dark.png`, `partial-filtered-down-*.png`.
- **How it is reached:** this view is what the top row's "Waiting", the Status screen's queue button, Home's pill and the old `p/<name>/queue` address all open (AC81). It is also kept on a refresh.
- The round-2 diff rewrote this exact line, so it is part of what this change adds.

## Evidence per checklist item

### Part A
1. **Rulings — FAIL** through F3-r2 (P-001-design-lab-1.md). Everything else is kept:
   - board-scope C, board-layout, board-bounce, board-done-keep, board-done-button, gate-card and gate-buttons;
   - home-tab and portfolio-tab;
   - board-after-agents and domain-review-count: #140 sits in "With the agents: 1" ("Waiting on Reviewer's verdict") and in no count.
2. **Spec — FAIL** on F3-r2 (AC80 as settled). Otherwise it matches:
   - AC80's sizes (item 27);
   - the filtered one small line, with real counts once read;
   - per e671cbd: no check line on a pull request card, and the PR sheet's "Its own checks: not read by the desk; its GitHub page shows them" (`sheet-pr130-*`);
   - the gate card's "Critic: not recorded";
   - kicked back after 6 minutes, with "GitHub doesn't show it merged yet", and "Confirming with GitHub" with its step and "Undo" (`marks-414-light.png`).
3. **Waiting is real — PASS.**
   - Badge 14 = Example 8 + Alpha 6; it reads 13 after the marks (12 waiting + 1 kicked back).
   - #140 is not counted.
4. **Quiet is honest — PASS.**
   - Words throughout: "checking…", "Can't read <p> since 16:00"; Home's "Checking…" and "Not quiet…".
   - No "Quiet" while a project is unread.
   - A follow-up is listed below.
5. **No made-up figures — FAIL (F3-r2).** Every other figure comes from a record.
6. **Every project — PASS.**
   - service-desk, poom (Status, Timeline, Team, Pipeline) and md-extremes (Home, Waiting with folds, the long-name filter, the long sheet, Status, Timeline and Team for Delta and Epsilon).
   - Every capture: `scrollWidth` equals `innerWidth` (360 and 414), 0 elements past the edge, no script errors.
7. **Standard milestones:** not touched (the old screens render identically; see 22).
8. **Type roles — PASS.**
   - title 600/24; sheet title 600/18; lead 400/15; row 500/13; body 400/13; small 400/12; label 500/11; mono 400/11.
   - Quoted record text: body, with the heading at row weight.
9. **Text boxes — PASS.** `.v2-input` is 16px Plex in every sheet. Viewport "width=device-width, initial-scale=1": zoom not locked.
10. **Contrast — PASS for everything the change adds.**
    - No v2 text below 4.5:1 in any capture.
    - The lowest are the badge (5.18 light, 6.69 dark), the top row's non-current links (5.67 light, 6.44 dark) and the bar's non-current tabs (6.40 light, 7.72 dark).
    - The unread lanes' words: 6.4 light, 7.72 dark.
11. **Tap targets — PASS.**
    - Sheet close 44×44; `.v2-qs` ≥24; `.v2-grp` and the gate buttons 26; steps and quiet lines 28; top-row links 32; tabs 52.
    - No undersized v2 target.
12. **Width — PASS** (see 6).
13. **Colour alone — PASS.** Kinds have an icon and a word; the lanes are told apart by their heads; the unread states are in words.
14. **One meaning per colour — PASS.** Every `--you` user in v2, across all captures:
    - `.v2-badge`;
    - the kind icons of owner-waiting cards: `vi-pr`, `vi-question`, `vi-gate`, `vi-card`, `vi-hold`, `vi-merge`, `vi-kick`.
    - Nothing else.
15. **Sheets and refresh — PASS.**
    - A tap on a title opens the sheet; Escape closes it and focus returns to the card; a tap outside closes it.
    - After two 60 s polls the sheet stays open, the typed text is kept (and carried into the Answer A link), its scroll stays at 150 and focus stays in the box.
16. **Long text — PASS:** titles clip at three lines, the whole title is in the sheet.
17. **Answering — PASS:**
    - one "Answer X ↗" per option, "Recommended" on C only, nothing preselected;
    - the gate sheet has Proceed, Hold, Recycle and Kill ↗.
18. **Kinds — PASS.**
19. **Plain words first — PASS.**
20. **Times — PASS:** America/Chicago.
21. **Board — PASS** apart from F3-r2.
22. **Tabs and Home — PASS.**
    - Opens on Home; the bar is Home · Waiting · Plan with the badge; no Projects or Portfolio tab.
    - Status, Timeline and Team carry the top row "Status · Timeline · Team · Waiting", the current one shaded.
    - `#/p/Alpha/queue` goes to the filtered board.
    - **The `:where()` lowering of `html.sb a` and `html.sb p` changed nothing on the old screens:**
      - Across 72 old-screen captures (Home, Status, Timeline, Team, Time asked, Pipeline and Plan; all three fixtures; both widths and themes), every element outside `.v2` has identical computed colour, background, margin, padding, font, decoration, display, border and box between bffdc1b and 1c4d4f8: **0 differences**.
      - The only changed pixels are in the bar's non-current tabs and the top row's non-current links (`pixdiff.mjs`). Those now take their own class colour, `--ink2` (rgb 92,95,102 light; 162,165,172 dark), in place of inherited `--ink`. This is the mockup's `.tab { color: var(--ink2) }`, with the current tab and link staying `--ink`. A visible change, and toward frame H1/1.
23. **Typeface — PASS.**
    - Every v2 selector renders in Plex Sans or Plex Mono, served by the desk (CDP platform fonts).
    - Files fetched: Sans Regular, Medium and SemiBold Latin1; Mono Regular Latin1; Sans Medium Pi.
    - 0 requests to another origin.
24. **Motion — PASS** (unchanged: the reduced-motion rule for `.lifted`).
25. **Dark mode — PASS** on items 9 to 14 in dark. F3-r2 shows in dark too.

### Part B (frames 1, 2, 3 and 12)
- **26 Frames — PASS** apart from F3-r2.
  - Frame 1's group names, steps, Undo and quiet lines match.
  - Frame 2's single small line matches. It is drawn as plain text in the frame; the build makes each count a control opening its fold, as AC80 says.
  - Frame 3's close circle, pills and fold match.
- **27 Sizes — PASS.**
  - Every v2 text across all captures is on the list: 600/24, 600/18, 400/15, 500/13, 400/13, 600/13 (`.v2-letter`), 500/12, 400/12, 600/11, 500/11 and 400/11, and 400/16 in the text boxes.
  - The marker is 500/11; the record heading is 500/13.
- **29 Accent — PASS** (item 14).
- **34 — PASS on the card** ("Settles as C · Wed 13:07" with a clock icon). The sheet's version comes with AC85 (stage 4).
- **35 Keys — PASS:** no legend.
- **28, 30–33:** not drawn by this stage.

## Non-blocking follow-ups
These were already on the screens before this change, or are notes.
- `--soft` text at 3.18:1 light and 3.88:1 dark on old Status: `.sb-mname`, `.code`, `.sb-mstate`, `.sb-mwhy`.
- Other old-screen text below 4.5:1:
  - Old Home: `.sb-top.you` at 4.18 and `.sb-hg-you` at 3.85.
  - `.sb-ts.now`: 4.28.
  - Status: `.sb-began-k` / `.sb-rtag.run3` at 3.89.
  - Timeline: `.sb-now-t` at 4.43.
  - Plan: "▲" at 2.28 / 2.97, and "Record plan" in dark at 3.56.
  - Team on Alpha: "Waiting on you, the oldest for…" at 4.18 light (not captured in round 1; the old Team screen is unchanged by this change, 0 style diffs).
- Old Team, `a.sb-tlink` "On the Timeline ›": 142×16.8 at 360. The first one fails WCAG 2.5.8's spacing exception. It is identical at bffdc1b; round 1 didn't report it.
- Old screens are not in Plex, and Home's tiles are still two-column; stages 2, 3 and 7 are planned to fix these.
- With every project down, the board's subtitle stays "checking…". In the filtered view of an unreadable project, the lanes say "Can't read" without "since HH:MM", because AC5's words sit only in the full board's quiet line. Item 4 holds (nothing says Quiet); noted for whoever touches the filtered view next.

## Open questions
1. **Partly-read board.** Alpha can't be read and Example is read (`partial-waiting-*`): the lanes count Example only ("Waiting on you 1", "Kicked back 0 · Nothing here"), and the badge reads 1. Alpha is named above them: "Can't read Alpha since 16:00". AC80 gives an unreadable project those words and counts only the cards read, so I did not count this as a finding. Should a lane's count, or its "Nothing here", say when part of what it covers is unread? That is for the Definer.
2. **The filtered small line when no fold is worth opening.** Frame 2 draws plain text with real zeros ("With the agents: 0 · …: 0"). AC80 says a quiet line is "shown only when it has any, whose tap opens a fold". Once F3-r2 is fixed, should a 0 on that line still be a control opening an empty fold?

Scratch worktrees dr-1a-r2 and dr-1a-r1base have been removed.
