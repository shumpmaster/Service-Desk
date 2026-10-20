# S-001 desk v2, stage 1a: the Design reviewer's round-1 build review, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/desk-v2 at bffdc1b; the design-reviewer's first review (run as a reviewer-class subagent following .claude/agents/design-reviewer.md).

---

Verdict: FAIL

**In plain words.** Stage 1a mostly works. The board is the Waiting tab with three lanes, grouped by project. The new bar sits at the foot of every screen, the badge counts correctly, IBM Plex is served by the desk itself, and the v2 colours are in place. Nothing scrolls sideways, every v2 text clears 4.5:1 in light and dark, and every v2 tap target is at least 24 px. It fails on three things:
1. **A CSS rule overrides the new buttons' styles.** On the board, group names, quiet lines, "Undo" and "<n> more" show at the wrong size. In the card's sheet, "Done ✓" and "Close" lose their pill shape, and "Close" spills out of its ring.
2. **Off-scale heading in the sheet.** "The whole record" fold shows its heading at 19.5 px bold, which is off mockup v2's scale.
3. **A zero for an unknown.** Before anything has been read, or when nothing can be read, the board shows "Waiting on you 0 · Nothing here".

Each is a small, local fix. I changed nothing.

Branch origin/orch/desk-v2 at bffdc1b, diff `origin/main...HEAD -- src/public src/lib`.

## How I got the evidence
- **Harness**, built outside the repo: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/` (`cap.mjs`, `measure.js`, `buttons.mjs`, `behave2.mjs`, `behave3.mjs`).
  - It runs Playwright's Chromium against `src/public` and answers the page's calls from `tests/desk/fake-desk.mjs`.
  - The clock is fixed at 2026-10-19T21:00Z.
- **Two setups:**
  - Main: Service-Desk (J11's real records at 3117150), Personal-Org-Operating-Model (`fixtures/poom`, v2.5), "Example" (board-v5's eight cards, plus #140 missing its reviewer's verdict) and "Alpha" (one card of each kind, `fullRepo`).
  - Extremes: `md-extremes` (5 projects, long titles).
- **Captures:** 360×740 and 414×896, light and dark. 122 files in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/shots/`, with per-capture text, computed styles, contrast, tap targets and accent users in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/shots/measures.json`.
- **Before/after:** the same old screens rendered from origin/main (f3e0b2f), in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/shots-main/`.
- **Fonts:** confirmed by CDP `CSS.getPlatformFontsForNode`. Every v2 selector (`.v2-t`, `.v2-lh`, `.v2-m`, `.v2-tabw`, `.v2-title`, `.v2-stitle`, `.v2-rl`, `.v2-ql`, `.v2-step`) renders in "IBM Plex Sans / SmBld / Medm (web)" and "IBM Plex Mono (web)".
  - Files fetched: `/fonts/IBMPlexSans-{Regular,Medium,SemiBold}-Latin1.woff2`, `IBMPlexMono-Regular-Latin1.woff2`, `IBMPlexSans-{Regular,Medium}-Pi.woff2`.
  - No request left desk.local.
- **Script errors:** none in any capture.
- **Locked tests:** `node --test ac80-board.test.mjs ac81-bar-type.test.mjs ac48-62-63-look.test.mjs` gives 37 pass, 0 fail. These tests read CSS rules one by one, not the cascade, so they cannot see finding 1.

## Blocking findings

**F1 — Part B item 26 (frames 1, 2, 3 and 12) and AC80's sizes. A reset rule out-ranks the v2 button classes.**
- **Cause:** `sandbox.css:820` reads `.v2 button { font: inherit; color: inherit; background: none; border: 0; padding: 0; … }`. Its specificity (0,1,1) beats single-class rules (0,1,0) on every v2 `<button>`: `v2-grp` (sandbox.js:1655), `v2-ql` (:1674), `v2-more` (:1661), `v2-undo` (:1641), `v2-step` (:1695), `v2-x44` (:1751), `v2-abtn` (:1785, :1954, :1955).
- **Computed styles at 360 light** (`node buttons.mjs`):
  - `button.v2-grp "Example"`: 400 13px. Frame 1's `.grp` and AC80 ("a group's name … 500 11 px") call for 500 11px.
  - `.v2-ql` "With the agents:": 400 13px. Frame 1's `.ql` is 400 12px.
  - `.v2-undo` "Undo": 400 13px; frame 1 and AC80 call for 500 11px.
  - `button.v2-x44` (sheet close): background transparent. Frame 3 draws it on a `--chip` circle.
  - `button.v2-abtn done "Done ✓"`: 45×36, no background, no padding, 400 13px.
  - `button.v2-abtn ghost "Close"`: 32×36 with no padding, so the word "Close" overflows its 36 px round outline.
- **Screenshots:**
  - `shots/sheet-question-360-light-end.png` (foot of the sheet: "Done ✓" as bare text, "Close" spilling out of its ring)
  - `shots/marks-414-light.png` ("Undo" at 13 px)
  - `shots/waiting-agents-fold-360-light.png` (group name and quiet line at 13 px)
- **Same cause, frame 2:** with one project shown, frame 2 and AC80 ("its quiet lines then show under the lanes in one small line, 'With the agents: <n> · Being recorded by the automatic job: <n>'") call for one small line.
  - The build draws two rows with icons and chevrons, and a "·" left dangling after the first.
  - `.v2-quiet.under { display: grid }`, plus the button reset.
  - Screenshot: `shots/filtered-foldclosed-360-light.png`. Text: "With the agents: 1 › ·" / "Being recorded by the automatic job: 0 ›".

**F2 — Part B item 27 and AC81 ("so the only text sizes are 24, 18, 15, 13, 12 and 11 px … the only weights 400, 500 and 600 … Nothing else").**
- In the card's sheet, the fold "The whole record" (sandbox.js:1950, `details.v2-fd > article.sb-record`) draws the question file's `# Ruling needed: …` heading as an H2 at 19.5px, weight 700.
- `.v2-sheet .sb-record { font: var(--t-body) }` (sandbox.css:945) does not reach the heading inside it.
- Found with every fold in the sheet opened (`node behave2.mjs`): `{"tag":"H2","chain":"sb-record < v2-fd","px":"19.5px","wt":"700"}`.
- Frame 3 draws this fold ("The whole question"). Screenshot: `shots/qsheet-context-open-360-light.png`.

**F3 — Part A item 5 ("is an unknown shown in words, never as a value or zero"; P-001-design-lab-1.md "Absolutely no fake numbers"), and item 4 in spirit.**
- **Before the first read** (polls held, `behave.mjs`), Waiting reads: "checking… / Waiting on you 0 / Nothing here / Kicked back 0 / Nothing here". Screenshot: `shots/preread-waiting-360-light.png`.
- **With every project unreadable** (network aborted, `behave3.mjs`), it reads: "checking… / Can't read Example since 16:00 / Can't read Alpha since 16:00 / Waiting on you 0 / Nothing here …". Screenshot: `shots/alldown-waiting-360-light.png`.
- The words above the lanes are honest, and Home says "Checking…" / "Not quiet: can't read 2 projects". But the lane counts show an unread number as 0, and "Nothing here" claims an empty lane.
- The badge is correctly absent.

## Evidence per checklist item

### Part A

1. **Rulings — FAIL** through F3 (P-001-design-lab-1.md). Otherwise kept:
   - Board: P-001-board-scope C, board-layout, board-bounce, board-done-keep, board-done-button, gate-card, gate-buttons.
   - Bar: P-001-home-tab, P-001-portfolio-tab.
   - With the agents: P-001-board-after-agents, P-001-domain-review-count. #140, which lacks its reviewer's verdict, sits in "With the agents: 1" ("Waiting on Reviewer's verdict") and is in no count.
2. **Spec — FAIL** against AC80's sizes and its filtered "one small line" (F1). (AC80 and AC81 lie outside item 2's AC range; I judged them as the spec, which the pack's order of authority puts above the checklist.) Everything else on the board matched AC80 as rendered:
   - lanes and their counts, the empty words, kind lines, meta;
   - "Settles as C · Wed 13:07";
   - a gate card's four buttons;
   - kicked back after 6 minutes, with the reason "GitHub doesn't show it merged yet" (`shots/marks-414-light.png`);
   - "Confirming with GitHub" with its step button and "Undo".
3. **Waiting is real — PASS.** The badge reads 14 = Example 8 (9 less #140) + Alpha 6, and Home's "14 waiting on you in all" matches. Main showed 15 (with #140). After marks: 13 = 12 waiting + 1 kicked back. Alpha's deploy is not counted (no `deploysNeedOwner`).
4. **Quiet is honest — PASS in words** ("checking…", "Can't read X since HH:MM"; Home "Not quiet…"). The lanes' 0 / "Nothing here" is F3.
5. **No made-up figures — FAIL (F3).** Every other figure comes from records: ages, "#126 · R0 · 3 h 21 m", "checked 2 s ago".
6. **Every project — PASS.**
   - Fixtures: service-desk, poom (Status, Pipeline) and md-extremes (Home, Waiting, the long-name filter, the long sheet, Status Epsilon and Delta).
   - Both widths and both themes: no script errors, and `scrollWidth` equals `innerWidth` (360 and 414) in all 96 captures, with 0 elements past the viewport edge.
7. **Standard milestones:** not touched.
8. **Type roles — PASS** on the v2 screens: title 600/24, sheet title 600/18, lead 400/15, row 500/13, body 400/13, small 400/12, label 500/11, mono 400/11.
9. **Text boxes — PASS.** `.v2-input` is 16px Plex in every sheet. The viewport meta is "width=device-width, initial-scale=1", so zoom is not locked.
10. **Contrast — PASS for everything the change adds.** Lowest v2 text: the badge at 5.18:1 light and 6.69:1 dark. Every v2 text node on screen measured at least 4.5:1. The old-screen failures are identical on main (follow-ups, below).
11. **Tap targets — PASS.**
    - Sheet close is 44×44.
    - Smallest v2 targets: 26 px (gate buttons, `.v2-grp`), the 28×28 chip ✕, 28 px for steps and quiet lines, 52 px for the tabs.
    - The card title links, 16–17.5 px tall, take the whole card through `.v2-t::after { inset: 0 }`, and pass WCAG's spacing exception (measured).
12. **Width — PASS** (see 6).
13. **Colour alone — PASS.** Each kind has an icon and a word; lanes are told apart by their headings; a confirmed card loses its note as well as changing colour.
14. **One meaning per colour — PASS.** Every `--you` user in v2, across all captures:
    - `.v2-badge` (background);
    - the kind icons of cards waiting on the owner (`vi-pr`, `vi-question`, `vi-gate`, `vi-card`, `vi-hold`, `vi-merge`, `vi-kick`).
    - Done and confirming icons are grey, and so is the "With the agents" icon.
15. **Sheets and refresh — PASS.**
    - Tapping a card's title opens its sheet. Escape closes it and focus returns to the card; a tap outside closes it.
    - After two 60 s polls, the sheet stays open, the typed text "my own words here" is kept (and carried into the Answer A link), the sheet's scroll stays at 150, and focus stays in the box.
    - A browser reload reopens the sheet from its address.
16. **Long text:** card titles are clipped at three lines, the whole title is in the sheet (AC80), and no ellipsis is drawn (AC54's rule).
17. **Answering — PASS.**
    - One "Answer A/B/C ↗" button per option; "Recommended" shows on C only; nothing is preselected.
    - Answer A opens "Ruling: A\n\nQuestion: questions/P-001-board-answer.md\nMilestone: MD2\n\n…".
    - The gate sheet has Proceed, Hold, Recycle and Kill ↗.
18. **Kinds of decision — PASS:** an icon and a word for each kind, none ranked.
19. **Plain words first — PASS:** codes follow in mono ("… P-001-board-answer", "#126 · R0").
20. **Times — PASS:** America/Chicago (raised 13:07 CDT; "Settles as C · Wed 13:07").
21. **Board — PASS** except F1:
    - one board grouped by project, in J7's order;
    - a tap on a project's name gives a chip, ✕ and "1 of 4 projects";
    - three lanes at every width;
    - kicked back after about 5 minutes;
    - Done holds 24 hours (tests);
    - the Done card keeps its step and "Undo";
    - the gate card has its buttons on the card and in the sheet.
22. **Tabs and Home — PASS** for what the change touches.
    - Opens on Home, with the bar Home · Waiting · Plan and the badge.
    - No Projects or Portfolio tab.
    - Project screens mark Home as current and carry the row Status · Timeline · Team · Waiting (`shots/team-sd-360-light.png`).
    - `#/p/Alpha/queue` redirects to the board filtered to Alpha (`shots/queue-redirect-*`).
    - Home's tiles are untouched (follow-up, below).
23. **Typeface — PASS:** every font the change sets is Plex Sans or Plex Mono (CDP above). The old screens stay in the phone's own font, as AC81 plans until stage 3/7.
24. **Motion — PASS:** `@media (prefers-reduced-motion: reduce) { .v2-card.lifted { rotate: none; } }`.
25. **Dark mode — items 9 to 14 hold in dark** (`*-dark.png`; frame 12 vs `shots/waiting-example-414-dark.png`). F1 and F2 occur in dark too.

### Part B (frames 1, 2, 3 and 12)

- **26 Frames — FAIL (F1).** Also, the sheet's layout (frame 3) is AC85's, stage 4, so only the close control and the fold are judged here.
- **27 Sizes — FAIL (F2).** Every other v2 text is on the stated scale and pairs. Also seen: the board's step buttons render 500 12px, while frame 1's `.step` and AC80 say 500 11px (open question 1).
- **29 Accent — PASS** (item 14).
- **34 Undo and timeouts — PASS on the card** (a clock icon plus "Settles as C · Wed 13:07"). The sheet shows no lock or clock line; main's Queue sheet showed none either, and AC85 (stage 4) brings it.
- **35 Keys — PASS:** no legend is added.
- **28, 30–33:** not drawn by this stage.

## Non-blocking follow-ups (pre-existing; identical on main f3e0b2f)
- `--soft` text below 4.5:1 on the old Status screen: `.sb-mname`, `.code`, `.sb-mstate`, `.sb-mwhy` at 3.18:1 light (#8a919a) and 3.88:1 dark (#6f7680). This is the pack's known follow-up.
- Old Home's coral (#d23c0f):
  - `.sb-top.you` "14 waiting on you in all": 4.18:1 light.
  - `.sb-hg-you`: 3.85:1 light.
- Other old-screen text below 4.5:1:
  - Status, `.sb-began-k` / `.sb-rtag.run3`: 3.89:1.
  - Timeline, `.sb-now-t` "Now · 19 Oct": 4.43:1.
  - md-extremes Home, `.sb-ts.now`: 4.28:1.
  - Plan, "▲": 2.28 / 2.97:1, and "Record plan" in dark: 3.56:1.
- Old screens are not in Plex, and Home's tiles are still the two-column grid (P-001-home-tiles.md); stages 2, 3 and 7 are planned to fix these.
- The "Sandbox: candidate design" marker draws at 600 12.48px (old `--t-meta`) on the new Waiting screen. Mockup v2 does not draw it.

## Open questions
1. AC80 says a board button has "500 11 px text" (as frame 1's `.step` = `--t-label`). AC81's list of allowed pairs gives "500 12 px (… the board's buttons and links, :161, :208, :225)", but desk-v2.html:208 is the sheet's `.abtn`. The build follows AC81 at 12 px. The spec contradicts itself; it is for the Definer to settle. I did not count it as blocking.
2. The pack says "A size the mockup does not state is not a finding", while AC81 says "Nothing else". I applied AC81 (spec above checklist) to F2. Should the pack say which holds for content the frames don't draw, such as the record fold and the sandbox marker?
