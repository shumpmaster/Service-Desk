# M3B stage VT1: the Reviewer's round 3 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/builder/vt1 at c43dd4e (VT1 round 3).

---

Verdict: PASS

**Scope.** This is round 3 of the Reviewer's check on stage VT1 of S-001 (M3B). I reviewed build/builder/vt1 at c43dd4e in /home/user/sd-vt1: the Builder's commits fa30f72, bbd0e11, 19c2fb2 and c43dd4e, on top of a092039. I planted every bug in a `git archive` copy at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/r3copy, not in the worktree. The worktree is clean at c43dd4e.

**Each round-2 finding is fixed, and each new test fails for its planted bug**
- **B1 (N3's "can't be drawn" half):** the new test is j25-value-checks.test.mjs:245, with `BAD_PR` on the planning project.
  - It first confirms that "Can't show this project" appears on Service-Desk.
  - Deleting the guard at sandbox.js:1506: caught.
  - Restoring round 1's filter (`&& !b.error`, J25 state `none`): caught.
  - Removing just one half of the guard still passes. That is expected, because the two halves always hold together: `draw()` sets `error` whenever `drawError` is set (sandbox.js:5249 and :5253).
- **N1 (V5 with its log gone, the final check `not measured`):** the new test is ac97-values.test.mjs:681. Deleting values.js:549 is caught (it previously survived).
- **N2 (another project's green icon):** the new test is ac97-values.test.mjs:687. Dropping `withLine.length === targets.length` at values.js:670 is caught (it previously survived).
- **N3 (the stale JSDoc):** both blocks are replaced. The comments now say the rule is keyed to the final check, on WN itself or after it. No code changed, and src/lib and src/public/lib are identical.
- **514b33e title nit:** the title now says "Met", matching what the test asserts. Only the title changed.

**Suite, build and guard**
- Full suite (`npm --prefix src test`): 1502 of 1502 pass. That is round 2's 1499 plus the three new tests.
- `node src/tools/build.mjs`: PASS (37 page modules in step).
- surface_guard passes on each of the four commits alone and on a092039..c43dd4e (4 commits). Each commit is authored by `builder` and carries its `Agent-Session` and `Spec: S-001` trailers.

**Nothing regressed**
- I replanted the round-2 bugs on c43dd4e: 38 of 39 caught. The one survivor (F6, the "Weekly check" filter in `notMeasured`) is equivalent: that line never has anything to filter.
- Comparing test titles between a092039 and c43dd4e: three added, one renamed (514b33e's title), none dropped.
- The page and CSS were not touched in round 3. Round 2's page plants (the green icon and the bar-label font) were caught at a092039 by ac88-dark and the page test.

**Join-up review (Build: the parts working together, for this stage)**
I ran these paths through the loaded sandbox page, not each part alone:
- Service-Desk's page → the targets row → the sheet → "<k> earlier checks" and "The whole target" → refresh and Escape (ac97-values-page; round 2's captures);
- a weekly value check's pull request merged → its Done row → its sheet, "not on the Timeline: a weekly value check" (j12-value-checks);
- the planning project failing to read, and failing to draw → another project's row in state 0 (j25-value-checks :229 and :245);
- the all-met state → the green left icon, walked by AC88's cascade and the stage-8 guard (ac88-dark, VT1_OPENS).

All of them work together. No blocking or non-blocking difference.

**Questions:** none. Q1 is settled as built (V4's lines before launch are ignored only while it is before launch, under "whatever its dates"), and Q2 as filed.

**Files:**
- /home/user/sd-vt1/tests/desk/j25-value-checks.test.mjs
- /home/user/sd-vt1/tests/desk/ac97-values.test.mjs
- /home/user/sd-vt1/src/lib/values.js
- my planted-bug runner and lists: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/mut2/
