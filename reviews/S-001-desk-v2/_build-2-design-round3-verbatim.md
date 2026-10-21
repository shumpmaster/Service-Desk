# S-001 desk v2, stage 2 (Home): the Design reviewer's round 3, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-2 at 818b3b2.

---

Verdict: PASS

**What this means for you.** Nothing failed or was skipped. Round 2's one blocking problem is fixed. When the reason a finish is unknown lies in another project, a project's tile now names that project, for example "Twin's MD1 has no estimate yet" or "Twin's MD1 is past its estimate". So a tile no longer seems to blame its own milestone. Plan's wording is unchanged. There is one new line: when the desk can't work out the plan at all, each tile now says "Next: not available" instead of wrongly saying "no milestone left to reach", and Plan explains why. Every other screen is exactly as it was, and all the tests pass. Nothing here is irreversible. The two questions left over from earlier rounds are still with the Definer, unchanged.

Rig: Playwright Chromium, with the tests' fake desk answering every call and round 2's clocks. IBM Plex Sans (400, 500, 600) and Plex Mono (400, 500) were confirmed loaded. I worked read-only in a detached worktree at 818b3b2, now removed. Captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3/shots/ (the Next cases) and /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3/cap/ (Home's full set). Logs and scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3/.

## 1. B-new: fixed (part A items 5 and 19)

- **Node, r2-twin.mjs.** With Twin first in the order, Service-Desk's tile reads "MD1 · rough finish: not available: Twin's MD1 has no estimate yet". Twin's own tile reads "MD1 · no estimate yet". With Service-Desk first: "MD1 · rough finish 19 Oct – 20 Oct", and Twin's tile "MD1 · no estimate yet".
- **Plan's words are unchanged.** Every row's finish is still "not available: MD1 has no estimate yet", with the project's name beside the row.
- **Browser, r2-next.mjs run unchanged.**
  - The past and Plan captures are byte-identical to round 2's: next-past-{360,414}-{light,dark}.png, next-past-plan-414-light.png and next-twin-plan-414-light.png.
  - Only the four next-twin tile captures changed. They now read "…: Twin's MD1 has no estimate yet". Capture folder: dr-3/r2next/.
- **Browser, my new script r3-next.mjs** (adds the cross-project past case and a long project name):
  - next-twinpast-*.png: "Next: MD1 · rough finish: not available: Twin's MD1 is past its estimate". Twin's own tile keeps Plan's words, "…: MD1 is past its estimate".
  - next-long-*.png: a project named "Epsilon-with-a-very-long-project-name-that-wraps". The tile names it in full, "…: Epsilon-with-a-very-long-project-name-that-wraps's MD1 is past its estimate".
  - next-sdfirst-*.png: the order with Service-Desk first.
- **Wrap and scale (items 12 and 27).**
  - Every Next line is 12 px / 16.8 px, weight 400, Plex Sans. The "Next:" lead is rgb(92,95,102); the words are rgb(24,25,28) in light and rgb(236,237,239) in dark.
  - The Twin forms take two lines (34 px) at 360 and 414.
  - The long-name form takes three lines (50 px) at 360 and two at 414. It breaks at the name's hyphens, with no cut and no ellipsis.
  - The line's scrollWidth equals its clientWidth (306 at 360, 360 at 414), and the page's scrollWidth equals the screen width in every case.
  - No page errors, in light or dark.
- **The logic is sound.** The project is named only when the milestone named in the reason belongs to another project (home.js:572-575). Where the tile's own milestone has no estimate filed, "no estimate yet" still comes first (home.js:570). The copies in src/lib and src/public/lib are identical.

## 2. "Next: not available" when Work ahead's view can't be built: honest, good form

- **How I tested it.** In the browser only, the page was served a copy of lib/workview.js whose workAheadView throws. The repository was untouched. Captures: next-unknown-{360,414}-{light,dark}.png and next-unknown-plan-414-light.png.
- **What the tile shows.** Service-Desk's tile reads "Next: not available", with its own "Now" and "At work" lines unchanged. POOM, an older-pipeline project, keeps "Next: sprint m1.4 · no estimate filed".
- **What Plan shows.** "Can't show Work ahead: made-up failure for the review" (sandbox.js:3302-3305). So the code comment's "Plan says why" holds.
- **Honesty (items 5 and 19).** It no longer claims "no milestone left to reach" or "not recorded" when the truth is unknown. The unknown is in plain words, with no made-up value, and a waiting gate keeps its own line (ac82 test).
- **Form (item 27).** 12 px / 400 Plex Sans, one line (17 px), the ◐ icon like every other v3 Next line, and no sideways scroll.

## 3. Nothing else changed

- **Home.** I re-ran round 2's full sets: main at 360, 414, 719, 720, 768 and 1024; quiet; quiet-off; extremes. That is 252 captures plus 3 probes.
  - 209 are byte-identical to round 2's r2-shots.
  - The other 46 differ only in "checked N s ago" or "Every project read N s ago".
  - With that clock text normalised, every capture's texts, fonts, sizes, weights, colours, positions, tap targets, accent use and Home measures are identical to round 2's: main 108/108, quiet 54/54, quiet-off 36/36, extremes 54/54.
  - The checking tile, Zeta's can't-read tile and Zeta's Status screen are byte-identical to round 2's.
- **Other screens.** Waiting, Plan, Status (Service-Desk, POOM, Alpha), Timeline and Team, 28 captures:
  - All 28 are byte-identical to round 2's captures of the branch (r2-cmp-new).
  - Against 5a7e55a (r2-cmp-base): 25 byte-identical, and 3 Waiting captures differ only by the clock.
  - The only other measured difference is that Plex Mono 500 is listed as loaded. The page opens on Home first, and the new Home uses Mono 500. Every text's family and weight is identical.
- **Width, contrast and errors.** Nothing scrolls sideways in any setup at any width. No page or console errors.

## 4. Tests

- **The three locked tests** (ac80-board, ac81-bar-type, ac48-62-63-look): 47 of 47 pass.
  - None of the three changed since 5764229.
  - The one commit on the branch that edits them is the stage's first, 602baa2. Round 1 reported it, and whether it was allowed is the Reviewer's call.
- **ac82-home and j24-since:** 45 of 45 pass.
- **The full desk suite:** 913 of 913 pass (908 in round 2, plus the 5 new tests).
- **`node tools/build.mjs`:** PASS.

## New findings

None, blocking or non-blocking.

## Follow-ups

1. **N8, for the Definer.** One new fact: there are now two different "Next: not available" lines. An unread tile shows the dashed "?" icon, the desk's "not recorded" icon (N8). A tile whose plan can't be built shows ◐. The Definer may want one rule for both. Item 30; not a finding.
2. **For filing.** Round 2's note on Plan is unchanged: Plan's own top line and rows still say "not available: MD1 has no estimate yet" without the project. Plan's rows carry the project's name beside them.
3. Round 2's N8 and my earlier open questions (round 1's N4 to N7 and three questions) stay with the Definer, unchanged.