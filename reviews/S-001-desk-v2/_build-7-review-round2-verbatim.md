# S-001 desk v2, stage 7 (dark mode and the screens no frame redraws): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-7 at f393d3c.

---

Verdict: PASS

Round 2 of the stage 7 review, at f393d3c, over the whole range 361b6b7..f393d3c. There are no blocking findings. The running log's lanes now match the owner's ruling, and all three Design review points are fixed. The new tests caught each fix when I reverted it. No test was weakened, and the accepted views and every word are unchanged.

## Blocking findings
None.

## What I checked
1. **B1: the lanes, as the owner ruled ("Greys + line styles").**
   - sandbox.css:535-544 and :752-753 give the four lanes, in turn: `--ink` solid, `--ink2` dashed, `--ink3` dotted, `--ink` dashed. Each lane's straight lines and its curves out and back take its line. Its dots take its form: filled, a ring, a dotted ring, a ring.
   - I rendered every member page, the owner's included, in light and in dark (forced, and the phone's own setting) and compared with 83118c1. Every pair of lanes now differs, either in line style or in a grey far apart. Lanes 2 and 4 share the dash, but `--ink2` and `--ink` are 23 apart in light and 18 in dark.
   - The stub keeps its 2 3 dash. The only change on stubs is `stroke-linecap: butt`, which is already the default, so it draws the same.
   - Nothing else on those pages changed. Lanes are 2 px wide, so the dotted lane draws 2 px dots every 4 px.
   - The wrong comment at sandbox.css:722 is corrected.
2. **F1: the tap line.** `.sb-tap` now sets `color: var(--ink)` (sandbox.css:384). It beats style.css's `.gone { color: var(--warn) }` on source order, at the same weight.
3. **F2: record panels.** `.v2-fd > .sb-record` joins the `--bg2` panel (:934). The Summary sheet's quote gets its own panel with `.sb-sheet .sb-quote { background: var(--surf2) }` (:427). Rendered: #f7f7f8 on the sheet's #ffffff in light, #141517 on #0f1012 in dark.
4. **F3: the first link in a group.** `.sb-qlist > li > a` is now at least 24 px tall (:346). That reaches 1,369 lone list links, those on members' pages among them. This is the only other layout change in the round, and AC88's 24 px rule asks for it.
5. **Mutations: 12 of 13 caught.** Each of these made the AC88 or lane test fail:
   - F1, both F2 parts and F3 reverted;
   - F3's link set to 20 px;
   - lane 4 back to `--ink2`;
   - lanes 2 and 4 drawn solid;
   - a lane's curves not following its line;
   - lane 4's dots filled like lane 1's;
   - lane 3 dashed like lane 2;
   - lanes broken on the owner's page only;
   - the stub losing its dash.
6. **Accepted views (AC43) are still unchanged.** I rendered 8 accepted-view addresses at 84c1224 and f393d3c. The page and its cascaded style, light and dark, are byte-identical.
7. **Words are unchanged.** Every sandbox screen from the four fixtures shows the same nodes and the same words as at 83118c1, and the fonts are unchanged too.
8. **No test weakened.** Across 361b6b7..f393d3c only two test files were added, ac88-dark.test.mjs and css-cascade.mjs. No existing test was touched.

## Commands run
- Full suite (`cd src && node --test ../tests/desk/*.test.mjs`): 1017 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 361b6b7`: "OK: all governance checks passed."
- `surface_guard.py diff --range 361b6b7..f393d3c --branch build/builder/desk-v2-7`: "OK: 4 commit(s) … checked".
- `review_check.py pr 999 --base 361b6b7`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files.
- All four commits are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **The lane test runs only forced dark and light, both at 360.** It skips the phone's own dark setting and 414 px, so a mutation that broke lanes only under the phone's setting was missed. No lane rule sits inside a media query today, and my own phone-dark render matched forced dark. The test should add that case, so this can't regress unseen.
2. **Four lanes, three line styles.** The ruling names three styles, so the fourth lane repeats the dash and is told apart by grey. That meets the ruling's goal, "every lane looks different at a glance in light and dark". Define may want to note it.
3. **The ruling isn't merged yet.** sandbox.css and the test cite decisions/questions/P-001-desk-v2-lanes.md, which is still only on cos/desk-v2-lanes-answer (pull request #185). It should land before or with this branch.
4. **Owed by the pull request.** The Chromium captures in dark, at 360 × 740 and 414 × 896, beside frames H2 and 12, are still to come. They would also show that the dotted lane reads well at 2 px, and that the faint `--bg2` panel in dark (mockup v2's own pair) is visible.
5. **The helper still doesn't merge shorthands with longhands.** For the tap line it reports font-weight 600, from style.css's `.gone`, where a browser shows 500 because `.sb-tap`'s `font` shorthand resets it. That matters only for the large-text rule, at 700, so it is harmless today.

## Open questions
None new. Round 1's question about removing the dead rules at stage 8 still stands.

The worktrees and copies are removed. My scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (accepted3.mjs, sandbox-dump.mjs, mutate3.py). I left the r2-*.log files in the scratchpad alone, since I didn't create them.