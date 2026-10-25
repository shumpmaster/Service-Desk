# M3E stage G5: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g5 at e400666 (fix commits 8ff4592, 5c095d5 and e400666, on f5be3a8) (base 87bac4d).

---

Verdict: PASS

**Summary.** This verdict covers all of G5: round 1 (f5be3a8, which failed on B1) and this round's confirmation. The branch is build/builder/g5 at e400666, on base 87bac4d, in /home/user/sd-g5. I judged it from `git diff f5be3a8 e400666`, the spec, the Definer's amendment 0300026 (build/definer/g5-notes) and the tests. Of the commit messages I read only the subjects and trailers.

**B1 is fixed.** The counts now find each run's own Timeline block, and fall back to the `<Phase>-i<n>` key only when no block is the run's own. On `mix` and `gates`, the made-up project Alpha's Build line now matches its Timeline folds:
- Build's line reads "0 of 8 reached · 4 sprints · 4 not read".
- The folds read M1 "2 sprints · 2 not read", M2 "1 sprint · 1 not read" and M2B "2 sprints · 2 not read". #44 sits under M2 and M2B and counts once, which makes 4.
- Opened, rows M1, M2 and M2B each carry their fold's sprints, for example "work filed · gone back over · 2 sprints · 2 not read".

The run heads now take their own run's band: "Run 3 · planned | Run 2 · planned | Run 1 · dates not recorded · gone back over". Before, run 1 read "planned".

The head has its three forms:
- "Milestones by phase · <R> of <T> reached";
- "Milestones by phase · none tracked yet" where T sums to 0, never "0 of 0";
- "Milestones by phase" alone where the phases aren't tracked.

These match the Definer's amendment. Notes 1 and 3 stand as built, and the amendment writes them into AC92 (c). Everything else from round 1 still holds.

## Checks run (at e400666)
- `cd src && npm test`: 1223 pass, 0 fail. It was 1219 at f5be3a8; this round adds 4 cases.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 87bac4d`: "OK: all governance checks passed."
- `surface_guard.py diff --range 87bac4d..e400666 --branch build/builder/g5`: "OK: 6 commit(s) … checked".
- `review_check.py pr 999 --base 87bac4d`: R1, requires design-reviewer and reviewer. The only failures are those two "missing verdict" lines. No test-weakening flag.
- **The new cases fail on the old lookup.** In a scratch copy of the whole tree at e400666, I put back the old `x.run === run || key` lookup and `bandLookup`'s key-only find. All three new cases then fail:
  - the pure two-runs-one-key case (wrong block);
  - Alpha's page case (actual "0 of 8 reached · no sprints filed yet");
  - the AC83 run-heads case (actual "Run 1 · planned").

  The head case tests e400666's change, which that mutation left in place. On the old head it would give "0 of 0 reached".
- I also checked `gates`: Build is fixed as above, and Launch's three "Launch-i1" runs each head their own band.
- Round 1 (f5be3a8): 1219 pass. The 36 g5- Chromium captures had nothing scrolling sideways.
- **Commits:** all six are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.
- `cmp`: board.js, model.js, projectpage.js and records.js are identical in src/lib and src/public/lib.
- The worktree is clean. I wrote only scratch files.

## Blocking findings
None. Round 1's B1 is fixed and locked, as above:
- `blockOf` is at src/lib/projectpage.js:276-279 and is used at :283 and :291, and in sandbox.js `bandLookup` at :1215.
- The new cases are in ac92-glance-counts.test.mjs (the two B1 cases and the head's forms) and ac83-page.test.mjs (the run heads).

## What I checked (planned tasks, both rounds)
1. **Every milestone once per phase, R of T, the checklist in words (AC92 (c)).**
   - The six classes are in the spec's order.
   - Own milestones count once over every run, which covers F2, and dropped ones are left out.
   - F1, Launch-4, NOT_RECORDED_IDS, Discovery-3, the finished phase and ALL_24's "4 of 4" are all cases.
   - Nothing reads "0 of <n>".
   - With k of 0 the not-tracked part is left out ("none tracked (5) · 2 skipped"), as the amendment now writes it, and a case covers it.
2. **Each sprint once per phase, in the one sprint form.** s, m and w are right, and now right on runs that share a key.
   - On `text` with pulls: Build 16, Design 26 and Discovery 38 equal the Timeline's folds.
   - Alpha: 4, as its Timeline.
3. **The head's sums (AC83 changed):** "8 of 15 reached" on `text`, plus the three forms above.
4. **The Timeline's fold (AC84 changed):** every milestone fold and "Not tied to a milestone" use the one form. Each fold's merged count is checked against its ✓ marks.
   - AC60's "named by its pull request" fold keeps its words, as the amendment rules.
5. **An opened phase's rows add their sprints:** "work filed · 1 sprint · 1 merged" on `text`, and Alpha's M1, M2 and M2B as above.
6. **Details' CI line:** "y of x workflows passed[, z running]".
   - Deploy, Orchestrator and notification runs are left out of x.
   - Skipped and cancelled are counted as passed (`NOT_FAILING`), as the spec says.
   - No part when AC29's state is "none" or x is 0, and none when the runs aren't read.
7. **F1 and F2:** both are cases, pure and on the page (`mix` with `laterLaunch`): Launch "0 of 2 reached" over "1 tracked · 4 not tracked".
8. **Ruling B and every settling (AC89 (c)):**
   - The name stands in the place of the first card, and the count still counts each card ("8 wait on you" over 7 names).
   - Cases cover three items and three cases, mixed case lines, cases before one item and before two, rising order, two gates, an unread gate card left unjoined, and cards split across Kicked back and Waiting on you.
   - Ids and words are asserted. The cut and the tap are unchanged.
9. **R3-a:** class 5, now written into AC92 (c) by the amendment. **R3-b** is not done, as G6's. The deferral is right: the plan review r3 says "G6 should pick one and test it".
10. **G5_ONCE:** still exact. ac88-dark.test.mjs is unchanged this round: one declaration, `display: (none) → block`, on `span.v2-sdl` in `span.v2-sd` in `.v2-stdr`, with set equality asserted.
11. **g5- captures:** the tool adds nine states. The PR's own captures are still to make and judge.
12. **The locked cases outside the row, for the Definer.** Each was forced and keeps its full strength:
    - **7137571, AC83+AC29:** the old CI pin is kept whole, `ciPassed(model)` is added, and `ciPassed(null) === ''` is asserted.
    - **f5be3a8, AC57 reached on the page:** "Yours: …" and "run 1: M1 reached" no longer exist. The line is now asserted as an exact count, and M1's and MD2's rows are still asserted.

    The amendment now names "the locked cases G5 changed outside its row".
13. **Nothing outside G5, no locked test weakened.** This round changes only the 5 files above. Its test diff removes no line except two import lines that were widened. 5c095d5 (`bandLookup`) fixes a fault from before G5, with the same root cause, and is locked by its own case. Across all of G5, the 20 files are all G5 code, copies, tests, fixtures, README and the capture tool. The spec is untouched on the branch.

## Join-up (the parts working together)
- **The page and the Timeline** agree on every reviewed state: `text` with and without pulls, `mix` with Service-Desk and Alpha, and `gates`. They agree on each phase's sprints, each opened row's sprints, and each run head's band.
- **The waits row** matches the board's names, count and order, including a card kicked back.
- **The CI line** matches AC29's state.
- **Differences found:** none blocking. See note 1.

## Non-blocking notes (carried as risks)
1. **The joined gate name falls past the cut at 360 px.** In round 1's g5-page-gates-two-360x740-light, the waits row is cut at "the Launch gate for P-00…", so ruling B's "both usually show" is not reached in that fixture. The cut itself is unchanged, as ruled. Route: the Design reviewer.
2. **What the PR body must say.** It names R3-a's choice, which the amendment now writes in. It marks R3-b not done, as G6's. It names 5c095d5 as a fix to code from before G5, and the head's "none tracked yet" as the Definer's note 2.

## Open questions
None. Round 1's three are settled by amendment 0300026.

Files:
- /home/user/sd-g5/src/lib/projectpage.js
- /home/user/sd-g5/src/public/lib/projectpage.js
- /home/user/sd-g5/src/public/sandbox.js
- /home/user/sd-g5/tests/desk/ac92-glance-counts.test.mjs
- /home/user/sd-g5/tests/desk/ac83-page.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/mut/
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/t/probe3.test.mjs
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-review/npmtest3.txt
