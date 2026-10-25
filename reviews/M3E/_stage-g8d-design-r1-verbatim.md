# M3E stage G8d: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8d at f554f7a (G8d's work over 3058cc0).

---

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
