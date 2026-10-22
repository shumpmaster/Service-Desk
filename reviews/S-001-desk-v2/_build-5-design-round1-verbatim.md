# S-001 desk v2, stage 5 (Plan): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-5 at cd6134f.

---

Verdict: PASS

The Plan tab is ready to go ahead. It reads top down with the next milestone first, as you ruled. It matches the approved mockup's Plan screen, measured to the pixel. Rough finishes are labelled an expectation, and anything unknown is said in words, never as a made-up date. The vermilion diamond appears only where something waits on you. Nothing failed and nothing was skipped. Three small points are left for you or the spec writer, none of them blocking:
- When two projects are connected, one line can name another project's milestone without saying which project.
- Phases on Plan's rows are shown in grey words only, as the mockup draws them. Their colour appears only in a milestone's sheet.
- A "·" is missing from the "Current plan recorded" line.

Home, Waiting, the sheets, the project page and the Timeline look the same as before.

**What was reviewed:** build/builder/desk-v2-5 at cd6134f against 0be0d16, in detached worktrees (now removed). Captures are at 360×740 and 414×896, light and dark, with Playwright Chromium, the tests' fake-desk.mjs and Work ahead's fixtures (wa-fixtures.mjs: WORKED, LATER, the AC85 gate card). Plex loaded in every capture. Captures and JSON (rendered text, computed styles, contrast, targets) are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr5/shots/. The harness is dr5/cap5.mjs, and the frame 11 render is dr5/mock/ (all under that scratchpad).

## Locked page tests (on cd6134f)
| Test | Result |
|---|---|
| ac80-board | 28/28 pass |
| ac81-bar-type | 11/11 pass |
| ac48-62-63-look | 9/9 pass |
| ac86-plan | 14/14 pass |
| ac24-work-ahead | 31/31 pass |

## Evidence by checklist item
All 96 captures (24 states × 2 widths × 2 themes):
- **Item 12 (width):** no sideways scroll; `scrollWidth` equals the viewport, with 0 wide elements.
- **Item 6 (every project):** zero script errors with the service-desk, poom and md-extremes fixtures. Extremes covers 7 projects, including two long names and one that can't be read, which reads "Zeta-unreadable: its milestones are not available".
- **Items 10 and 25 (contrast):** lowest text contrast 5.18:1 light and 6.69:1 dark; Plan's own lowest is 5.97:1. Nothing under 4.5:1.
- **Item 11 (tap targets):** no undersized target. ⇅ is 44×44, move controls 36×32, rows at least 52.9 px tall, sheet close 44×44.
- **Items 27 and 23 (sizes, typeface):** sizes are only 11, 12, 13, 18 and 24 px; weights only 400, 500 and 600; IBM Plex Sans with Plex Mono for codes.
- **Item 26 (frame 11), at 414 light** (built plan-414-light.png against mock/frame11-414-light.png):
  - title 24/600; ⇅ pill 48 px with a 44 px button; sub line 12 px grey;
  - section head 11/500, height 28, with folder icon and a mono count;
  - row 382×52.9, padding 9/0, icon 16 px, name 13/500 at 257 px wide, mono line 11/400;
  - value 12 px grey for "your acceptance", 11 px mono for dates.
  - Every one is identical to frame 11. The order is groups, then the v2.5 lines, then "Not milestones yet" with its count, then "Ideas · from the portfolio" with "Not read yet…".
- **Items 29 and 14 (vermilion):** the only vermilion is the gate row's ◆, the ◆ on "1 waiting on you in your Queue", and the badge (accent dump, gate-414-light/dark). The gold ring means "next to reach"; the gold edge on a moved row is AC24's own rule. "after your ruling" and "your acceptance" are grey.
- **Item 5 (no made-up figures):**
  - na-noest: "Estimate: not made yet", then "Rough finish: not available: MD3 has no estimate yet" on MD3 and every row after it.
  - na-fail: "Estimate: not available" on all 6 rows.
  - na-past (24 Oct): "past its estimate of 3–5 days, made 18 Oct; waiting on a new one".
  - In all three, no value shows at the right.
- **Item 15 (sheets)**, for MD3, MD1, the gate row M3C and MD3 with no estimate, at both widths:
  - Opening a sheet puts focus on its close button.
  - Escape, the close button and a tap outside each close it to #/work, with focus back on the row it opened from.
  - A reload keeps the sheet open.
- **Draft:** it survives a reload (MD1, MD2, M3A, MD3, M3B, M3C, with "Draft not recorded · …"). With ⇅ closed, Plan still shows the draft line and the bar with "Record plan" (draft-closed-*.png).
- **Item 20 (times):** "recorded 18 Oct, 06:30" for a plan named 11:30Z is Chicago time.
- **Item 22 (tabs):** the Plan tab is current, and Home has no "Work ahead" control (AC86 test).
- **Rulings:**
  - Top down, next first (P-001-plan-order).
  - No owner-set date; "an expectation, never a deadline" (m3a-date, m3a-finish).
  - You order milestones only (m3a-order).
  - Picks sit under "Not milestones yet", one tap to ask (m3a-picks).
  - Records stay in Service-Desk, and "Record plan" opens shumpmaster/Service-Desk (portfolio-plan; AC86 test).

**Unchanged from 0be0d16:** I compared 172 screens (Home, Waiting, project pages, Timeline, Team, extremes) and 112 sheet captures. The only differences are the "checked N s ago" age text, a timing artefact. The text dump shows nothing else. Plan is the only screen that changed.

## Findings (none blocking)
1. **With two projects, a "not available" line names another project's milestone without its project.** Not blocking.
   - Capture: dr5/shots/two-360-light.png.
   - Under "Service-Desk · milestones ahead", MD3 to M3C read "Rough finish: not available: MD1 has no estimate yet". The MD1 meant is Example's, yet Service-Desk's own MD1 shows "your acceptance" two rows above.
   - Before this stage the one list named each row's project; grouping hides it.
   - Item 19 (plain words). AC24 step 4 fixes the words as "<code> has no estimate yet", and the spec outranks the checklist. It only arises with two or more v3 projects, and none is connected today. This is for the Definer (see question 1).
2. **"Current plan recorded 18 Oct, 06:30" leaves out AC24's "·"** (spec: "Current plan · recorded <date>, <time>"). Not blocking.
   - Capture: dr5/shots/current-414-light.png.
   - The words come from lib/workview.js:263 and predate this stage. The old uppercase gold label used to set them apart; the new 500-weight lead does not. Item 2.

## Notes (not findings)
- Frame 11's "•••" (More) is not built. AC86 names only ⇅.
- At 360 px the mono line can wrap ("about 2–4 / days") because of "about", which the spec requires.
- In the ordering view, rows carry about 20 px of empty space under them: the move column is 90.5 px tall against a 70.5 px row.
- An open ⇅ closes on a full page reload. Folds live in window memory everywhere in the desk, and the draft itself is kept.

## Open questions
1. **For the Definer:** with several projects, should the "not available: <code> …" words name the project (for example "Example's MD1"), now that Plan groups by project?
2. **For the owner:** P-001-redesign-conflicts item 4 says phases may be marked by some colour or icons. Plan's rows show the phase in grey mono words only, as frame 11 draws it, and AC24's "with its phase colour" survives only in the sheet. Do you want colour or an icon for the phase on Plan's rows too?
3. **For the Orchestrator:** the branch edits one line of the locked ac80-board.test.mjs (selector `sb-wa-you` → `v2-plyou`, at :623) with the assertion unchanged, and makes similar selector-only edits to ac82-home and j4-j14-j15. Is that allowed under the lock?