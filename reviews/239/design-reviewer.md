Verdict: PASS

The Design reviewer's verdicts on G8d (PR #239), verbatim: round 1 at f554f7a (PASS), round 2 at d968b1e (PASS), round 3 at 102b051 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: PASS

**Summary for the owner**
G8d does what you asked on 25 Oct. A project the desk hasn't read since it opened now says "in this opening" on every screen, the same words Home already used:
- **Waiting:** "✕ Can't read Service-Desk in this opening".
- **The line above the lanes when one project is shown:** "Can't read Alpha in this opening: <reason>".
- **The project page:** "✕ Can't read in this opening".
- **The older Pipeline view:** "Can't read in this opening: <reason>".

A project read earlier and then failing still says "since 10:01". A project the desk can read but can't draw now says "can't be shown" on the cap row, its sheet ("Phase: can't be shown · not counted"), the versions row and the group head ("2 projects · 1 can't be read · 1 can't be shown"). Before, those all said "can't be read since 10:00". "Nothing new since" is unchanged.

No colours, sizes or fonts changed. The set of text sizes, weights, fonts and colours on every capture is the same before and after. Nothing scrolls sideways at 360 or 414 px. The red text measures 6.85:1 in light and 6.91:1 in dark. The full test suite passes (1298 of 1298).

One thing still reads wrongly, and it was already there before G8d. On Waiting, a project the desk can read but can't draw is listed as "Nothing waiting: Bravo". Every other screen says it can't be shown. That is a false "quiet", and the words for the fix are yours to pick (question 1).

**Evidence** (Chromium through Playwright. IBM Plex Sans loaded, `document.fonts.check` true. 360×740 and 414×896, light and dark. Trees exported with `git archive` at 3058cc0 and f554f7a; the before tree used the after tree's test fixtures and tools, so both render the same fixture states. Shots are in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design/` under `shots-before/`, `shots-after/`, `dump-before/`, `dump-after/`, `x-before/`, `x-after/` and `y-after/`. Each `.txt` file holds the rendered text, an ARIA snapshot and the computed styles with contrast.)
- **Rulings, Q1 "Yes, everywhere":**
  - Waiting, every project shown: before "Can't read Service-Desk since 10:00" → after "…in this opening"; Alpha, read earlier, keeps "since 10:01".
  - Signed out: Service-Desk "in this opening"; Personal-Org-Operating-Model and Alpha "since 10:01".
  - One project shown (state 2): "Can't read Service-Desk in this opening: network error…", and the same on both blob-failure paths with the 6 cards kept. Before also drew 6 cards, so `cards: true` changes nothing drawn.
  - Page waits row: "Can't read in this opening" with the reason under it.
  - Pipeline view: "Can't read in this opening: network error…".
  - Code: `src/public/lib/board.js` `cantSince`/`quietCantWords`; `sandbox.js` lines 1347–1350, 1626–1627, 1926–1929 and 2510–2511; `universe.js` `boxStateText`.
- **Rulings, Q2 "can't be shown":**
  - Cap row: "Bravo's phase: can't be shown". Cap sheet: "Phase: can't be shown · not counted". Versions row and sheet: "Bravo: can't be shown".
  - Head, nothing waiting: "1 can't be read · 1 can't be shown · 2 projects".
  - Head, cards waiting: "6 waiting on you · 1 can't be read · 1 can't be shown · 3 projects".
  - Signed out, the can't-draw project is counted "2 can't be read", as the G8d row asks.
  - Code: `portfolio.js` `unknownWhy`/`nowCant`/`isState`; `sandbox.js` `readStateOf` at 964–968 and the head at 1027 and 1046. A can't-draw tile never reaches `tileNode` (sandbox.js 1052–1059), so the tile, the briefing and the grey "not shown" line are pixel-identical.
- **Q3:** nothing built; the case is kept (ac91-g8d.test.mjs:475).
- **Item 4 (quiet is honest):** every new string replaces a can't-read string with another can't-read string; nothing new says "quiet".
- **Item 6 (every project):** service-desk and poom render without overflow, and so does md-extremes with every read failing (`y-after/`). The long project name wraps, scrollWidth equals the viewport, and the head reads "4 can't be read".
- **Items 10 and 25 (contrast):** `--bad` is rgb(179,22,42) at 6.85:1 in light and rgb(255,107,120) at 6.91:1 in dark. The new head part uses `.v2-hgb`, 11 px weight 500, the same as "can't be read".
- **Item 12 (width):** scrollWidth equals clientWidth on all 168 captures.
- **Items 8, 23 and 27 (type):** no new sizes or weights. The style sets before and after are identical on every G8d capture.
- **Screen reader:** the head button's name reads "Your projects · active 6 waiting on you 1 can't be read 1 can't be shown 3 projects (open)". The page line and quiet line text are as shown above.
- **Nothing else moved:** image diffs are confined to the changed line. Exceptions are Home's head and portfolio rows, where the shorter words reflow (the page is 12 px shorter), and a one-minute card-age tick on the clock. g8d-home-signed-out-cant-show is identical, with 0 pixels different.
- **Tests and build:** `node --test ../tests/desk/` passes 1298 of 1298; `node tools/build.mjs` reports "36 page modules in step". Both were run on the exported after tree.

**Blocking findings**
None.

**Non-blocking notes** (all were there before G8d and are follow-ups to file)
1. **The Builder's note is right, and the wording is misleading.**
   - On Waiting, a project the desk can read but can't draw is listed as "👁 Nothing waiting: Personal-Org-Operating-Model, Bravo". In that fixture Bravo has an open pull request that the desk can't turn into a card (`x-after/x-waiting-cant-show-waiting-*.txt`).
   - With that project alone shown, Waiting says "checked 43 s ago", "Waiting on you 0", "Nothing here" and "With the agents: 0 · Being recorded by the automatic job: 0" (`x-after/x-waiting-only-cant-show-*`).
   - This goes against part A item 4 (a quiet that isn't true; PROJECT.md "Missed decisions") and item 5 (an unknown shown as 0). It also breaks "one project, one story": Home, the tile, the page, the cap, versions and the head all say it can't be shown.
   - Cause: `readOf` in sandbox.js, around line 1926, ignores `drawError`, so `boardView` puts the project in `nothingWaiting`.
   - That it must not say "Nothing waiting" follows from the checklist. Which words replace it is your call (question 1).
2. **The v2.5 Pipeline view says "Nothing waiting on you here."** directly under "Can't read in this opening: …", both before and after (`g8d-pipeline-never-*`). This is the same item 4 problem; `waitsNode` doesn't check the read.
3. **The group head now takes two lines more often.**
   - With cards waiting at 414 px it was one line (28 px) and is now two (44 px). At 360 px it was already two (39 px, only the chevron wrapped) and stays two (44 px).
   - The second line starts with "1 can't be shown 3 ⌄" at the left. With nothing waiting it fits on one line at both widths.
   - It reads in order and nothing overflows. Mockup v2 doesn't draw counts in the head, so this is not a finding, only an observation (question 2).
4. **A small unasked improvement:** a can't-read quiet line with no time held now omits the time. Before, it formatted `new Date(undefined)`.
5. **Known follow-up still open:** the `--soft` contrast, unchanged and not touched here.

**Questions for the owner** (asked, not picked)
1. On Waiting, how should a project the desk can read but can't draw read? Today it's listed under "Nothing waiting: <project>", and with only it shown, "Nothing here" with zero counts.
   - Options: (a) a red "✕ Can't show <project>" quiet line, matching the briefing, and with it alone shown the same line above the lanes, with no counts given; (b) leave it as built.
   - Whichever you choose, the Definer may treat (a)'s honesty half as a spec bug under part A items 4 and 5 rather than as a choice.
2. With cards waiting on a phone, the "Your projects · active" head now wraps so "1 can't be shown 3 ⌄" starts a second line. Is that fine, or do you want the head's counts laid out differently?

**Pairs for the owner** (side by side, before on the left and after on the right, each labelled "Made-up fixture data — NOT real")
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design/owner-pairs-final/01-home-group-head-360-light.png`
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design/owner-pairs-final/02-home-cap-versions-360-dark.png`
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design/owner-pairs-final/03-waiting-in-this-opening-360-dark.png`
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design/owner-pairs-final/04-page-and-pipeline-414-light.png`

## Round 2
Verdict: PASS

**Summary for the owner**
G8d round 2 does what you asked with ""✕ Can't show Bravo" (Recommended)".
- **Every project shown:** when the desk can read a project but can't draw it, Waiting no longer lists it under "Nothing waiting". It now shows a red "✕ Can't show Alpha" line. That line looks exactly like the "✕ Can't read …" lines and sits among them in the board's usual order.
- **That project shown alone:** the same red line appears above the lanes. No counts are given: no "0" on the lane and no "With the agents: 0 · …" line. The lane reads "Can't show" and the strip reads "Kicked back · can't show", the same way the can't-read case already reads.
- **Signed out, or reads failing:** a project whose read fails still says "Can't read …", never "Can't show".
- **What didn't change:** colours, sizes and fonts. The red reads at 6.85:1 in light and 6.91:1 in dark. Nothing scrolls sideways at 360 or 414 px. All 1309 tests pass.

The Builder's note is right, and it is a false quiet. Take a screen where every project is shown, one project can't be read and the only other one can't be drawn. Waiting's lanes still say "Waiting on you 0", "Nothing here" and "Kicked back · none". When every project can't be read, the same lanes say "Can't read" with no number. That was already there before this round, and this round made the screen more honest, so it is a follow-up and doesn't block. The fix's wording is yours (question 1). A smaller case of the same kind is question 2.

**Evidence** (Chromium through Playwright; IBM Plex Sans and Mono loaded, `document.fonts.check` true, except the older Pipeline view, which uses no Mono and is pixel-identical before and after. 360×740 and 414×896, light and dark. Trees exported with `git archive`: before e7c87e9, after d968b1e; the before tree used the after tree's tests/ so both render the same fixtures. 96 captures per tree: the 13 g8d- shots plus 11 extra x- states. Each `.txt` beside a `.png` holds the rendered text, an ARIA snapshot, the computed styles with contrast, scrollWidth, and the set of styles in use. Folder: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r2/, with shots-before/ and shots-after/.)

- **Ruling (owner-answers-2026-10-25-g8c-review.md item 4; spec AC80, AC89 (a), AC91 (c) round 2). Part A item 1: kept.**
  - g8d-waiting-cant-show:
    - before: "Nothing waiting: Personal-Org-Operating-Model, Alpha"
    - after: "Nothing waiting: Personal-Org-Operating-Model" / "✕ Can't read Service-Desk in this opening" / "✕ Can't show Alpha"
  - g8d-waiting-cant-show-cards: "✕ Can't show Bravo", with the 6 cards still drawn.
  - x-among (Service-Desk and Bravo can't be read, Alpha can't be drawn): "Can't read Service-Desk in this opening" / "Can't show Alpha" / "Can't read Bravo in this opening". This is the board's order.
  - Code: src/public/lib/board.js:131 and :927; src/public/sandbox.js:1931 and :2516.
- **Shown alone (g8d-waiting-one-cant-show, and x-onlycs-cards for Bravo with other cards on the board).**
  - The line "✕ Can't show Alpha" sits above the lanes.
  - "Waiting on you" has no count; its empty words are "Can't show" (`.v2-empty.unknown`, the same class and style as the existing "Can't read" lane).
  - The strip reads "Kicked back · can't show", styled `v2-kw` like "can't read".
  - The small line of counts is gone. Before, it read "0", "Nothing here" and "With the agents: 0 · Being recorded by the automatic job: 0".
  - Under the title it reads "checked <age> ago", as the spec says. Before and after show different ages (42 s / 0 s); that is capture timing, not a change. It flips the other way on x-onlyalpha-cards.
  - Code: board.js:183; sandbox.js:2027 and :2546.
- **Read failing keeps can't-read words.**
  - x-cs-readfail: "Can't read Alpha since 10:02". x-cs-readfail-one: "Can't read Alpha since 10:02: network error…".
  - x-cs-signedout: three "Can't read … since" lines, the lanes "Can't read", the strip "Kicked back · can't read". There is no "Can't show" anywhere.
  - Clearing on the next good draw is covered by its own test case.
- **Item 4 (quiet is honest) and item 5 (no made-up figures):** the change takes away one false "Nothing waiting" and, when the project is shown alone, three zeros. It adds none. The every-project case is non-blocking finding N1 below.
- **Item 6 (every project):**
  - service-desk fixtures: the g8d- shots.
  - poom: x-poom-cs reads "Can't show Personal-Org-Operating-Model" and draws without error.
  - md-extremes: on x-ext-cs and x-ext-cs-one, "Can't show Epsilon-with-a-very-long-project-name-that-wraps" wraps inside the width.
- **Items 10 and 25 (contrast):**
  - The line and its ✕: rgb(179,22,42) at 6.85:1 in light; rgb(255,107,120) at 6.91:1 in dark. Both are 12 px weight 400, identical to the can't-read line.
  - The "Can't show" lane and strip words: 6.40:1 in light, 7.72:1 in dark.
- **Item 12 (width):** scrollWidth equals clientWidth on all 96 after captures.
- **Items 8, 23 and 27 (type):** no new size, weight or font. Where the set of styles changed, the only addition is the existing `--bad` 12 px/400 Plex Sans style, now used for the new red line. On the shown-alone screens, the Mono "0" style is gone with the counts.
- **Item 13 (colour alone) and the screen reader:**
  - Every red line carries a ✕ and its words.
  - ARIA reads: paragraph "Can't show Alpha"; region "Kicked back", "Kicked back · can't show"; region "Waiting on you", heading "Waiting on you" with no count, then "Can't show".
- **Nothing else moved:**
  - Text that changed outside the target lines is only clock ticks: ages "6 h 43 m"→"6 h 44 m" and "since 10:01"→"10:02".
  - Pixel changes outside the target lines are only those clock ticks and the lanes moving down or up by one line.
  - Every other G8d capture is identical in pixels, text and styles, including Home, the page and the Pipeline view.
- **Tests and build (on the exported after tree):** `node --test ../tests/desk/` passed 1309 of 1309. `node tools/build.mjs` reported "PASS (2 connected projects; 36 page modules in step)". Logs: tests-after.log and build.log in the same folder.

**Blocking findings**
None.

**Non-blocking findings** (all were there before round 2, and none got worse; follow-ups to file)
- **N1. The Builder's note is a false quiet.**
  - With every project shown, take a case where no shown project is both readable and drawable but one can't be drawn. x-noquiet has this: Service-Desk and Personal-Org-Operating-Model can't be read, and Alpha can't be drawn.
  - Waiting's lanes say "Waiting on you 0", "Nothing here" and "Kicked back · none" under the three red lines (x-noquiet-*).
  - When every shown project can't be read, the same lanes give no count and say "Can't read" (x-cs-signedout-*). Home's briefing for x-noquiet gives no count either ("Can't show Alpha", "Waiting ›").
  - This goes against part A item 5 (an unknown shown as 0) and item 4.
  - Cause: sandbox.js:2018 sets `view.unread` from the raw read state, so a can't-draw project counts as "ok" there, while readOf (:1931) no longer treats it as ok.
  - Before round 2 it was worse: it also said "Nothing waiting: Alpha".
- **N2. Alone shown, a can't-draw project whose read later fails is in state 5 (x-cs-readfail-one).** The lane says "0" and "Nothing here when last read", with "Kicked back · none when last read". But when it was last read, the desk couldn't draw it, so "nothing here" is not known. That is the same item 4/5 problem. It is unchanged from before, and round 2's spec keeps state 5's can't-read words.

**Notes**
- At 414 px, Waiting's red lines flow two to a row ("✕ Can't read Service-Desk in this opening   ✕ Can't show Alpha"). That is the existing quiet-line layout, and the reading order still follows the board.
- Known follow-up, untouched here: the `--soft` contrast.

**Questions for the owner** (asked, not picked)
1. With every project shown, suppose no project can be both read and drawn, for example one can't be read and one can't be shown. Waiting's lanes still say "0", "Nothing here" and "Kicked back · none". Should they do what they already do when nothing can be read: no number, with the unknown said in words?
   - (a) Yes. You'd pick the words, for example "Can't read or show".
   - (b) Leave as built; the red lines above explain the 0.
   - The no-zero part follows from checklist item 5, so the Definer may treat it as a spec bug whichever you choose. Only the words are a choice.
2. Shown alone, a project the desk couldn't draw and now can't read says "Nothing here when last read" with a 0, though when last read it couldn't be shown. Should it be (a) no number, with words such as "Can't show when last read", or (b) left as built?

**Pairs for the owner** (before on the left, after on the right, each labelled "Made-up fixture data (test fixtures) - NOT real projects, NOT real failures")
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r2/owner-pairs-final/01-waiting-every-project-360-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r2/owner-pairs-final/02-waiting-alone-360-dark.png (the "checked 42 s / 0 s ago" difference is capture timing)

## Round 3
Verdict: PASS

**Summary for the owner**
Round 3 builds both of your "A" answers, and the screens now say what the desk actually knows.
- **Every project shown:** when no project can be both read and drawn, Waiting no longer shows "Waiting on you 0", "Nothing here" and "Kicked back · none". The lane now gives no number and says "Can't read or show". The strip says "Kicked back · can't read or show". The red lines above it are unchanged.
- **One project shown alone:** take a project the desk couldn't draw whose read has since failed. It no longer says "0" and "Nothing here when last read". It now says "Can't show when last read" with no number, and the strip says "Kicked back · can't show when last read".
- **Same look:** the new words look exactly like the existing "Can't read" lane, in the same grey, size and font.
- **Signed out, every project shown:** still "Can't read".
- **Everything else is unchanged:** nothing else on Waiting, Home, a project page or the Pipeline view changed except clock ticks. Nothing scrolls sideways. All 1317 tests pass.

The Builder's "checking…" note is real but older than G8d (it dates from stage 1a). It doesn't block this round. I've put it to you as a question below.

**Evidence**
How I captured:
- Chromium through Playwright at 360×740 and 414×896, light and dark.
- IBM Plex Sans and Mono loaded (`document.fonts.check` true) on every capture except the older Pipeline view. That view uses no Mono and is pixel-identical before and after.
- Trees exported with `git archive`: before 657694e, after 102b051. The before tree uses the after tree's tests/, so both render the same fixtures.
- 76 captures per tree: the 19 g8d- shots (6 new) and 19 x- states (8 new), each at the 4 sizes and themes. Each `.txt` beside a `.png` holds the rendered text, an ARIA snapshot, computed styles with contrast, scrollWidth, and the set of styles in use.
- Folder: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r3/ (shots-before/, shots-after/, cmp.txt).

Findings by ruling and checklist item:
- **The two rulings (P-001-glance-no-quiet-lanes.md A, P-001-glance-cant-show-last-read.md A); spec AC91 (f) and AC89 (a) round 3; part A items 1, 4 and 5. Kept.** The only screens whose words changed are the targeted ones; every other difference is a clock digit.
  - **x-noquiet and g8d-waiting-cant-read-or-show** (Service-Desk and Personal-Org-Operating-Model can't be read, Alpha can't be drawn):
    - before: "Kicked back · none" / "Waiting on you 0" / "Nothing here"
    - after: "Kicked back · can't read or show" / "Waiting on you" / "Can't read or show"
  - **The same change on other states:**
    - x-noquiet-later (one read failed after a first read)
    - g8d-waiting-none-drawn (every project readable, none drawable)
    - x-ext-noquiet (md-extremes)
    - x-poom-noquiet (poom)
  - **g8d-waiting-cant-read-or-show-cards:** Alpha's last-read cards stay, with their count of 6. Only the strip changed, to "can't read or show", as AC91 (f) says.
  - **x-noquiet-pending** (a read still pending): "Not read yet" and "Kicked back · not read yet", as the spec's order puts it.
  - **x-cs-readfail-one, x-cs-readfail-one-cards, g8d-waiting-one-cant-show-last:**
    - before: "Kicked back · none when last read" / "0" / "Nothing here when last read"
    - after: "Kicked back · can't show when last read" / no count / "Can't show when last read"
    - The line above stays "✕ Can't read Alpha since 10:01: network error…", and under the title it stays "checked 3 min ago".
  - **Code:** src/public/lib/board.js:86, :106, :187, :237; src/public/sandbox.js:2020, :2030, :2431.
- **Signed out:**
  - g8d-waiting-signed-out-cant-show and x-cs-signedout are unchanged apart from clock digits: three "Can't read … since" lines, "Kicked back · can't read", and the lane "Can't read".
  - Shown alone and signed out, a can't-draw project (x-cs-signedout-one, g8d-waiting-one-signed-out-cant-show-last) gets state 5's new words "Can't show when last read". The line above still reads "Can't read Alpha since 10:01: Signed out — reload to sign in", as AC89 (a) round 3 has it.
  - g8d-home-signed-out-cant-show: only clock digits changed.
- **Unknown look, part A items 8, 23 and 27:**
  - "Can't read or show" and "Can't show when last read" are `.v2-empty.unknown`, 11px/400 IBM Plex Sans, rgb(92,95,102) in light and rgb(162,165,172) in dark. That is identical to the existing "Can't read" lane (x-cs-signedout).
  - The strip words are `v2-kw`, 11px/500 Plex Sans, identical to "can't read".
  - The lane head loses its Mono count, as the "Can't read" lane does.
  - The set of styles in use is identical before and after on every capture, so no new size, weight or font.
- **Items 10 and 25 (contrast):** the new lane and strip words measure 6.40:1 in light and 7.72:1 in dark, the same as "Can't read".
- **Item 12 (width):** scrollWidth equals clientWidth on all 152 after captures. On x-ext-noquiet the long Epsilon name wraps inside the width.
- **Item 13 and the screen reader:** the meaning is in words, not colour. ARIA on g8d-waiting-cant-read-or-show reads: region "Kicked back", paragraph "Kicked back · can't read or show"; region "Waiting on you", heading "Waiting on you" with no count, paragraph "Can't read or show". The alone screen reads the same way with "can't show when last read".
- **Item 6 (every project):** service-desk (g8d-), poom (x-poom-noquiet, x-poom-cs) and md-extremes (x-ext-noquiet, x-ext-cs, x-ext-cs-one) all render without error.
- **Nothing else moved:** after replacing digits, every capture outside the 13 targeted states has identical text before and after. Pixel differences there come only from clock ticks: "since 10:01"↔"10:02", ages, "checked 43 s"↔"0 s".
- **Tests and build (after tree):**
  - `node --test ../tests/desk/`: 1317 of 1317 passed (tests-after.log).
  - `node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)" (build.log).

**Blocking findings**
None.

**Non-blocking findings** (there before this round, not made worse)
- **N1. With every project shown, "checking…" under Waiting's title stays up indefinitely while reads fail.**
  - Where: g8d-waiting-cant-read-or-show, x-noquiet, x-noquiet-later, x-ext-noquiet. While any project has never been read in this opening, Waiting's line under the title says "checking…". Home says "Checking…" too (x-noquiet-home).
  - Why it misleads: on these screens the reads have already failed, and the red lines just below say "✕ Can't read … in this opening". Shown alone, the same project's title line says "Not read in this opening" (AC89 (a) state 2), and AC89 (a) says "a failed read is never called 'checking…'".
  - What allows it: AC82's every-project rule ("Checking…" before every project has been read once in this opening) and checklist item 4 both permit it.
  - Why it's a follow-up, not a FAIL: it is not a false "Quiet", and it is older than G8d (sandbox.js:2107 `checkedWords`, from stage 1a, a4c6e3f).
  - Is it misleading? Mildly. It suggests a read still in progress, while the desk is in fact retrying failed reads. It also gives no age, and it disagrees with the alone view. The words are a choice for you (question 1).

**Notes**
- "Can't read or show" also appears when every project can be read but none can be drawn (g8d-waiting-none-drawn: three "Can't show …" lines above it). That case falls within the ruling as you answered it ("when no project … can be both read and drawn"), so I have not raised it.
- Without its count, the "Waiting on you" head sits level with "Done · last 24 h". That is the existing unknown-lane layout, the same as "Can't read".
- Known follow-up, untouched: the `--soft` contrast.

**Questions for the owner** (asked, not picked)
1. With every project shown, suppose a project has never been read since the desk opened and its reads keep failing. Waiting's line under the title says "checking…", and Home says "Checking…". Shown alone, the same project says "Not read in this opening". Should the every-project line change?
   - (a) Say what is known instead, for example "Not read in this opening" while any project's first read has failed, on both Home and Waiting.
   - (b) Leave as built; the red "Can't read" lines just below explain it.
   - Changing Waiting alone would split it from Home's same rule (AC82), so either answer should cover both.

**Pairs for the owner** (before on the left, after on the right, each labelled "Made-up fixture data (test fixtures) - NOT real projects, NOT real failures")
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r3/owner-pairs-final/01-waiting-every-project-360-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r3/owner-pairs-final/02-waiting-alone-360-dark.png
