# S-001 desk v2, stage 2 (Home): the Design reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-2 at 5764229.

---

Verdict: FAIL

**What this means for you.** All four round-1 points I asked to be fixed are fixed:
- **B1:** on a tablet-wide screen, Home's column now fills the width (up to 960 px) and no longer shifts when you fold a group.
- **N1:** the fold's headings are back in the mockup's sizes.
- **N2:** a tile that is still loading, or can't be read, now says "not available" instead of "not recorded".
- **N3:** a "Since you last looked" line that is cut at three lines now fades at the cut.

Every other screen is unchanged, and all the tests pass. The new "Next:" wording fails on one point. When the reason a finish is unknown lies in another project, the tile names that project's milestone by its bare code. So Service-Desk's tile can say "MD1 has no estimate yet" when Service-Desk's own MD1 has one. The tile doesn't say the missing estimate belongs to another project. That is the same kind of untrue statement the Reviewer's B1 was fixed for. The fix is small and nothing here is irreversible.

Evidence comes from my Playwright Chromium captures, with the tests' fake desk answering every call. The clock is set to 2026-10-19 16:00 Chicago time, and IBM Plex Sans and Plex Mono were confirmed loaded. Captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-2/r2-shots/, called r2-shots/ below. Measurements are in its measures-*.json files and in dr-2/r2-*.log. The scratch worktrees are removed.

## Round-1 findings

**B1, Home's column at 720 px and wider: fixed.** `<html>` now carries `v2-home-page` (sandbox.js:3311-3314). The 720 px rule is now `html.sb.v2-page.v2-home-page body { max-width: 960px }` (sandbox.css:1088). `<html>` is `display: block`.

| Screen width | Body width | Left edge | After each of the 3 folds |
|---|---|---|---|
| 720 | 720 | 0 | unchanged |
| 768 | 768 | 0 | unchanged |
| 1024 | 960 | 32 | unchanged |

- Probes: probe-col.mjs and probe-col2.mjs.
- Waiting and Plan stay at 560 px, centred.
- Tiles are two to a row: 340, 364 and 460 px wide at 720, 768 and 1024.
- At 719 px the body is 560 px, one tile a row. At 360 and 414 the body fills the screen.
- Light and dark both hold.
- Captures: r2-shots/main-home-tiles-1024-light.png, folded-720.png, folded-1024.png, main-groups-toggled-{720,768,1024}-*.png.
- Side effect, expected: Home's content sits 4 px higher (the marker's top went from 21 to 17). Round 1's `.v2-home { padding-top: 4px }` was also being applied to `<html>`.

**N1, the fold's headings: fixed.** "Notifications" and "GitHub Actions this month" are now 13 px, weight 500 (`html.sb .v2-home .sb-h3`, sandbox.css:1077).
- No 16 px / 700 text is left on Home.
- Every size on Home, across main, quiet, quiet-off and extremes, is in the scale: 11 px (Plex Mono at 400 and 500, Plex Sans at 400 to 600), 12 px at 400 to 600, 13 px at 400 to 600, 15 px at 500 and 24 px at 600.
- Captures: r2-shots/main-home-foot-full-*.png.

**N2, "not available" on an unread or checking tile: fixed.**
- The checking tile reads "Now: not available / At work: not available / Next: not available" (r2-shots/checking-sd-414-light.png).
- The can't-read tile (Zeta) reads the same, followed by the red "Can't read since 16:00: not-found" line (r2-shots/zeta-branchcr-414-light.png).
- Round 1's doubled "· Phases: reading…" is gone.
- A v2.5 project keeps "No dispatch log: not used here".

**N3, the fade on cut since lines: fixed.** `.v2-e1.over::after` (sandbox.css:984-987) fades across 65 × 18.8 px at the third line's end.
- In the extremes sheet, 10 of 25 lines are cut, and all 10 carry `.over`. No uncut line has it.
- The gradient ends in the ground it sits on: #ffffff in light and rgb(15,16,18) in dark, both equal to `--bg`. Home's ground is `--bg` too (sandbox.css:813).
- Captures: r2-shots/fade-sheet-extremes-360-{light,dark}.png.

## The new "Next:" wording (task 2)

**Size and wrap: pass.**
- It renders at 12 px / 16.8 px, weight 400, IBM Plex Sans, within the scale (part B, item 27).
- The longest forms take two lines, 34 px high, at both 360 and 414 px, with no cut and no ellipsis: "Next: MD1 · rough finish: not available: MD1 is past its estimate" and "…: MD1 has no estimate yet".
- Nothing scrolls sideways (item 12), in light or dark.
- Captures: r2-shots/next-past-{360,414}-*.png and next-twin-{360,414}-*.png. The script is dr-2/r2-next.mjs.

**Honesty: the past-its-estimate and failed-read forms pass; the cross-project reason fails (B-new, below).**
- "MD1 · rough finish: not available: MD1 is past its estimate" matches Plan's own words (next-past-plan-414-light.png).
- "M1 · rough finish: not available" appears where Plan reads "Estimate: not available". The quiet fixture's Calm tile is an example.

## New findings

**B-new (blocking). Part A items 5 and 19, with the Reviewer's B1: a tile names another project's milestone by bare code, so its line is untrue.**
- **Cause:** a tile's Next is the first milestone its own project hasn't reached (sandbox.js:973-975). So any "<code> has no estimate yet" or "<code> is past its estimate" naming a different milestone always means another project's milestone. roughFinish (workahead.js:344-349) builds the reason from the bare `r.code`, and nextLine (home.js:569) puts it on the tile with no project name.
- **Reproduced:** Service-Desk plus a made-up v3 project "Twin", listed first in the owner's order. All of Service-Desk's milestones are estimated; Twin's MD1 is not.
  - Service-Desk's tile, drawn first on Home, reads "Next: MD1 · rough finish: not available: MD1 has no estimate yet".
  - Twin's tile, below it, reads "Next: MD1 · no estimate yet".
  - Captures: r2-shots/next-twin-360-light.png, next-twin-plan-414-light.png. Scripts: dr-2/r2-twin.mjs (node), r2-next.mjs (browser).
- **Why it matters:** Plan puts the project's name beside each row; the tile has no such context. Codes like M1 and MD1 will repeat across projects.
- **Reach:** this needs two planned v3 projects with an unestimated milestone earlier in the order. Today's configuration has one v3 project, but the rulebook judges the desk for every project.
- **Not spec-mandated:** AC82 (S-001.md:6684-6687) gives only "rough finish <range>" and "no estimate yet". The "rough finish: not available: <reason>" form is the builder's, and the test marks it "the Definer to confirm" (ac82-home.test.mjs:284-286).
- **Remedy (for the Builder and Definer, not me):** name the project when the code isn't the tile's own.

**N8 (non-blocking). Item 30 / README's three states: the unread "Next: not available" now carries the "not recorded" icon.**
- The icon is `unrec`, a dashed circle with "?" (sandbox.js:767; sandbox.css:128-129). The desk's own keys label that icon "not recorded" (feed.js:663 and :802; AC82's "a dashed circle with "?" where its state is not recorded").
- So the icon says "not recorded" while the words say "not available". N2's fix was meant to keep those two apart.
- The words carry the meaning, and a "?" for unknown is defensible. That's why it isn't blocking.
- Captures: r2-shots/zeta-branchcr-414-light.png, checking-sd-414-light.png.

**Rig note.** Eighteen captures flag one small target: a tile's name link (17 px tall), at 360 full-page and in the 720/768 sheet and summary captures. The 24 px circle around it touches the fixed tab bar's "Home" button, which overlaps it at the screen's foot. That is my measure's artifact, as in round 1; it is not a page change.

## Nothing else changed (task 3)

- **Other screens:** 25 of 28 captures of Waiting, Plan, Status (Service-Desk, POOM, Alpha), Timeline and Team are byte-identical to 5a7e55a (dr-2/r2-cmp-new against r2-cmp-base). The other 3 are Waiting, where only "checked 1 s ago" against "4 s ago" differs. Against my round-1 captures: 27 of 28 identical, and the 28th differs only by that clock.
- **Home:** every text's font, weight, size and colour was compared with round 1, leaving out the clock and position. The only differences are N1's headings, N2's lines, and on-screen counts that moved with the 4 px shift.
- **Rig difference:** Calm's README text differs because my setups.mjs got a longer README late in round 1, not because of the branch.
- **Width and contrast:** nothing scrolls sideways in any setup at any width, and nothing on Home is under 4.5:1.

## Tests (task 4)

- ac80-board, ac81-bar-type and ac48-62-63-look: 47 of 47 pass. None of the three was edited by the fix commits.
- ac82-home: 23 of 23 pass.
- The full desk suite: 908 of 908 pass.
- `node tools/build.mjs`: PASS.

## Follow-ups

1. **B-new:** for the Builder, through the Orchestrator, and for the Definer to settle the "rough finish: not available: <reason>" form in AC82. Should the reason name the other project ("Twin's MD1 has no estimate yet")? Plan, which already shows these words (AC24, M3A), could carry the same ambiguity in its own rows. That predates this change and is a follow-up to file there.
2. **N8:** for the Definer. Should the unread "Next" keep the dashed "?" icon, or carry none?
3. Round-1 points N4 to N7 and my three open questions are still with the Definer, unchanged, as expected.