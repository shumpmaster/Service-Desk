# S-001 desk v2, stage 7 (dark mode and the screens no frame redraws): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-7 at 83118c1.

---

Verdict: FAIL

One blocking finding. In the running log on a team member's page, the work lanes no longer look different from each other, which breaks a standing owner ruling (AC49). Everything else holds: the accepted views are unchanged, every word is kept, the type is on AC81's scale, the Builder's reading of vermilion is sound, and the new AC88 test catches real defects.

## Blocking findings

**B1. The running log's lanes lose AC49's distinct shades, and in dark they are less distinct than in light.** Route: Define, then Build.
- **The rule:** AC49 (S-001.md:3259-3261) says "lanes of the same kind take different shades of their colour". It quotes the owner: "the branches should be a different color or shade. Right now i cant easily tell what is and isnt the same responsibility." No note in AC49 changes this. AC81's list of criteria it overrides (:6383-6385) leaves out AC49. AC88 (:7153-7154) asks for every mark to be "as distinct as in light".
- **The code:** sandbox.css:732-733 maps the four lane shades to `--ink`, `--ink2`, `--ink3`, `--ink2`. Lanes take shades 0 to 3 in turn (src/public/lib/sandbox.js:1445). The comment at sandbox.css:722 says "a lane is told by its place and its words, AC49". The spec says nothing of the kind.
- **Rendered on Service-Desk's member pages:**
  - At 361b6b7 the lane strokes were #1d5bd6, #5b8be6, #0f3f9e and #8fb0ee. Each pair was at least 11 apart by CIEDE2000.
  - At 83118c1 they are #18191c, #5c5f66, #6a6d75 and #5c5f66. Lanes 2 and 4 are the same colour. Lanes 2 and 3 are 5.3 apart in light and only 2.5 in dark.
  - The owner's own lanes behave the same way.
- **Why Define:** AC81's tokens have no four greys that are clearly apart. `--ink2` and `--ink3` are 5.3 and 2.5 apart, and AC81 rules out the agent blue and any other meaningful colour. So the Builder can't meet both AC49 and AC81 as written. No test catches this.

## Non-blocking notes

1. **Accepted views are unchanged (AC43): verified.**
   - Stage 7 touches only sandbox.css and sandbox.js. style.css, app.js and index.html are untouched.
   - sandbox.css is loaded only by `startSandbox`, which runs only under `?sandbox`.
   - The link underline rule (sandbox.css:76) sits under `html.sb`.
   - I rendered 8 accepted-view addresses at 84c1224 and at 83118c1: the Universe, two projects, asked, agents, a question, and a missing project. The page and its cascaded style, light and dark, are byte-identical. That holds even with sandbox.css cascaded in.
2. **Words and layout are kept.** I rendered every trial-view screen from the four fixtures at 361b6b7 and 83118c1. Same node count, and every word identical. Only three layout changes:
   - a 2 px underline offset on old-look links;
   - "On the Timeline ›" is now a 24 px tall target (inline-flex, `min-height`), as AC88's 24 × 24 rule asks;
   - `padding: 0` on code inside the record folds. Nothing set padding there before, so it changes nothing.

   Every computed size and weight at head is on AC81's scale. My view of the Builder's readings:
   - **Capitals and letter spacing dropped:** accept. Mockup v2 has no capitalised labels, `--t-label` has none, and the words themselves are unchanged.
   - **Team sheet titles 24 → 18 px:** accept. AC81 names `--t-sheet` as "a sheet's title".
   - **"On the Timeline ›" at 24 px:** that is the target's height, not its text. The text stays 12 px (`--t-small`).
3. **Vermilion: the Builder's reading holds; this is not a gap for Define.**
   - AC69's own note says "in the trial view … vermilion stays only on what waits on the owner". AC81 governs where AC69 differs (:6383-6385), and its list (:6522-6524) is the kind icons, the ◆, the badge and the briefing's mark.
   - The ◆ stays vermilion beside "Waiting on you", both in "who has the ball" and on the owner's tile. The state is still in words; an open ask reads "answered open … so far".
   - Drawn vermilion at head: only the ◆, the badge and the kind icons.
   - AC69's test file is unchanged and passes. It checks one way only: any rule using `--you` must be on its allow-list. My mutation putting a gap in vermilion was caught by it. Define may still want AC69 to record that the owner tile's edge and the queue rows' edges are now ink.
4. **Dead CSS kept for the guard tests: acceptable.** Neither AC88 nor the stage asks for removal, and each stage must keep every test it doesn't replace. These rules are no longer drawn:
   - `.sb-pill.*`, `.sb-btn.you`, `.sb-gmark.you`, `.sb-needs`, `.sb-q`;
   - the uppercase rules `.sb-lbl`, `.sb-keyh`, `.sb-pstate`, `.sb-rtag`, `.sb-gh`, `.sb-pband-n`, `.sb-now-t`;
   - `.sb-box textarea`, and the base `.sb-bubble` shadow (bubbles are drawn only inside new-screen containers, whose rules win).

   `.sb-tlink`'s own `color` never applies either: `html.sb a:where(:not(.v2 *))` at (0,1,2) beats it at (0,1,0). Removing these rules and their guards could be done at stage 8.
5. **tests/desk/css-cascade.mjs is sound for what AC88's test claims.** I mutated the rules that actually win:
   - **Caught (13):**
     - an off-token text colour, low contrast, an off-token border;
     - a fade ending in the wrong ground;
     - a text box at 13 px;
     - an unmapped old token;
     - drift in the dark block;
     - a literal only under the phone's dark setting, and one only under forced dark;
     - an old literal shadow on the Team sheet;
     - an off-token lane stroke (SVG);
     - the old screens taken off the v2 ground.
   - **Not checked by the helper (gaps):**
     - unknown pseudo-classes such as `:nth-child`, which it treats as never matching;
     - `@supports`, `@layer` and `@container`, which it skips;
     - `opacity`, which it leaves out of contrast;
     - `accent-color` and `::placeholder`;
     - shorthands and longhands are not merged, so `groundOf` prefers `background-color` even where a later `background` wins.
   - None of these hides a defect today. There is no `@supports` or `:nth-child`, opacity is used only on marks, the one `accent-color` uses a token, and no drawn node has both background properties. It would be safer if the helper failed loudly on a pseudo-class or at-rule it doesn't know.
   - My first mutation batch hit declarations that never win, so its misses don't count. The helper was right each time.
6. **Test coverage.** The test draws the project screens for only two of md-extremes' five projects. I ran it with all five, and it passes.
7. **Owed by the pull request.** The Chromium captures at 360 × 740 and 414 × 896 in dark, beside frames H2 and 12, are not on the branch. Neither are the checks for sideways scroll and target sizes. They must be on the pull request before merge.

## Commands run
- Full suite (`cd src && node --test ../tests/desk/*.test.mjs`): 1016 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 361b6b7`: "OK: all governance checks passed."
- `surface_guard.py diff --range 361b6b7..83118c1 --branch build/builder/desk-v2-7`: "OK: 2 commit(s) … checked".
- `review_check.py pr 999 --base 361b6b7`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files. It found no weakened test, and the diff only adds two test files.
- Commits are signed `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Open questions
1. For Define: how should AC49's lane shades work on AC81's tokens? The owner could accept one grey with each lane's words, or three greys (ink, ink2, line2) plus a dashed fourth lane, or allow a lane palette as an exception.
2. Should stage 8 remove the dead rules, with their guard tests rewritten?

The worktrees and mutation copies are removed. My scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (accepted.mjs, sandbox-dump.mjs, mutate.py, mutate2.py). They need the worktrees re-created to run again.