# M3D stage 4 (S-001 after MD3): the Reviewer's round 3, with stage 6a round 3, verbatim

Dispatched by the orchestrator on 2026-10-24 as one hand-back of two reviews: D, stage 4 at 7349555 (after the Design reviewer's round-1 B1); E, stage 6a at 22eca92. Part D is stage 4's.

---

D passes. E fails on one blocking finding: at 414 px, one fixture row has about 15 px of empty space under it. E goes back to Build. All suites and governance checks are green for both. My scratch worktrees and copies are removed. I changed no repo files and made no commits.

## D. Stage 4, round 2: build/builder/m3d-4 at 7349555, on c4b66e9
Verdict: PASS

**Blocking findings:** none. The Design reviewer's B1 is fixed: each Chief of Staff "now" row opens its own piece's sheet, and that sheet names the piece in full.

**Evidence:**
- **The address form.**
  - Each "now" row links to `#/p/<project>/team/chief-of-staff/now/<lane>`, where the lane id (`cosLaneId`, "<session file> line <n>") is URL-encoded (sandbox.js `branchLog`).
  - `parseRoute` reads it as `now:<lane>`. `startSandbox` splits on the first `:` only.
  - `routeParts` (src/lib/page.js:13-19) splits before it decodes, so an encoded `/` stays inside one part.
  - `now` alone still opens the piece started last, as the tile names it (J13, :11143-11145). The test checks this.
  - src/lib/sandbox.js and src/public/lib/sandbox.js are byte-identical.
- **A reload, and a lane no longer under way.**
  - Opening the lane address cold shows that piece's Working now sheet ("Chief of Staff: Made-up piece A…") once the first read lands, and keeps it through a refresh.
  - An ended piece shows "Chief of Staff: <doing> · handed back <t>", in the same words as the Pieces of work group.
  - A lane gone from the log shows "This entry is no longer in the running log the desk reads."
  - The new ac49-lanes-after-md3 case checks all of this.
- **Focus going back.**
  - After a tap and Escape, focus returns to the row's own opener (`log:now:<lane>`). The test checks this for all four rows.
  - My probe: after a reload onto `now/four-b line 1` and Escape, focus lands on `log:now:four-b line 1`, as it should.
- **The rewritten j13-sessions case** (j13-sessions.test.mjs:318-320) now expects `/now/s-open%20line%201`. That is the stricter form, and it cites :3803, :3820-3822 and :4852 correctly. It is the only removed assert line in the range.
- **Mutations:**
  - Caught by the new case: D1 (all rows plain `now`), D2 (the piece chosen as the last one working), D4 (an ended piece given the working sheet), D5 (a gone piece given the plain sheet), D6 (`parseRoute` dropping the lane), D7 (opener keys colliding), D8 (an ended piece given generic words).
  - D3 survives; see the first note below.
- **Checks:**
  - Suite: 1100 pass, 0 fail.
  - build: PASS.
  - `check_all.sh . c4b66e9`: OK.
  - `surface_guard diff --range c4b66e9..7349555 --branch build/builder/m3d-4`: OK, 1 commit.
  - `review_check.py pr 999 --base c4b66e9`: R1, no "Flag:" lines, only the expected missing verdicts.

**Non-blocking notes (carry as risks):**
1. **D3 survives.** D3 changes `openerOf`'s new line, `if (sh.startsWith('now:')) return [\`log:${sh}\`];`, to return `'log:now'`. The test only closes sheets it opened by a tap, and a tap records its own opener. With D3 applied, a reload onto the lane address followed by Escape sends focus to "sheet-close" instead of the row. The real code is right, but this AC56 reload path has no test.
2. **The first draw on a reload is wrong for a moment.** Before the first read lands, a reloaded `now/<lane>` sheet says "This entry is no longer in the running log the desk reads." It corrects itself on the first read. This is not new: at c4b66e9 the plain `now` sheet says "…is not working now" and an `e/<i>` sheet says "no longer in the running log" at the same moment.

## E. Stage 6a confirmation: build/builder/m3d-6a at 22eca92, on f5cac07
Verdict: FAIL

**Blocking finding E1 (route: Build). AC89 (k)'s "the ordering view's rows have no empty space under them" (specs/S-001.md:7936) no longer holds for a row whose name fits on one line.**
- **The new rule.** sandbox.css now has `.v2-plli.ord:not(:has(.v2-plunder)) > .v2-plmove { grid-row: 1; padding: 0; }`. It stacks the two 32 px controls with their 4 px gap, so they need 68 px.
- **The row's own height.** A bare row with a one-line name is 9 + 17.55 (13 px/1.35 name) + 2 + 15.4 (11 px/1.4 meta) + 9 ≈ 53 px. The hidden `.sb-vh` text is `position: absolute` (sandbox.css:85) and adds nothing.
- **The result.** The list item grows to 68 px, which leaves about 15 px of empty space under the row's words. At f5cac07 the controls sat side by side (44 px), which is always shorter than the 53 px row.
- **Reproducing case: the test's own worked example (`waSetup` with `WORKED()`), at AC88's 414 px "dark (the phone)" width.**
  - I took the cascade's values from a probe and measured the text with the desk's own fonts (IBM Plex Sans Medium and Regular woff2, using fontTools). There is no letter-spacing on the name, and weight 500 maps to Medium (sandbox.css:440-445).
  - Name column: 414 − 32 gutter − 8 gap − 36 controls − 18 − 16 − 30 gaps − 89.8 for "27 Oct – 3 Nov" = 194.2 px.
  - "The desk's value targets shown" measures 186.4 px. So it is one line, the row is about 53 px, and about 15 px sits empty under it.
  - At 360 px all six fixture names wrap to two lines (70.5 px rows), so the 360 px case the Design reviewer raised (N1) is answered.
- **Why I rate it blocking.** Any one-line name at any width leaves the gap, and real milestone names can be short.
  - The commit says "Measured in Chromium at 360 and 414 px … no empty space under any row". My measurement contradicts that for this row, and the claim can't be checked from the repo, so per my rules it is a FAIL.
  - A real render of the ordering view at 414 px would settle it. No browser is available here.
- **The rewritten case can't catch this.** It pins declarations (padding 0, grid-row 1, no grid-auto-flow), not heights. Its comment's premise, "a row is at least as tall as the two 32 px controls with their 4 px gap (68 px)", is false for a one-line name.

**Other checks:**
- Nothing else changed: only sandbox.css (one rule and its comment) and the ordering case in ac89-words-drawing.test.mjs.
- Rows with lines under them keep the base `1 / span 2` with 6 px padding (80 px). With their two 12 px lines they are taller than that, so those rows are fine.
- Suite: 1123 pass, 0 fail.
- build: PASS.
- `check_all.sh . f5cac07`: OK.
- `surface_guard diff --range f5cac07..22eca92 --branch build/builder/m3d-6a`: OK, 1 commit.
- Whole-range guard `--range db1474e..22eca92`: OK, 3 commits.
- `review_check.py pr 999 --base f5cac07`: R1, no "Flag:" lines, only the expected missing verdicts.

## Open questions
1. E1: should the Design reviewer render the ordering view at 414 px with the worked example, to confirm the 15 px under "The desk's value targets shown" before Build reworks it?

My mutation and measurement scripts are kept in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/: mutate16.py for D1-D8, and rowfit.py for the row-height sums.