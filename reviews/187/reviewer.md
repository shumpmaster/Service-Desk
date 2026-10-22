Verdict: PASS

Confirmation review of b5668a2, on top of f393d3c, over the whole range 361b6b7..b5668a2. The under-way stub now stands out on every lane, and nothing else on the screens changed. The new stub test is stricter than the one it replaces except on one point: it no longer holds the stub's dashes short. That is non-blocking, and a small bound would close it.

## Blocking findings
None.

## What I checked
1. **The stub still meets AC49 and the owner's lanes ruling.**
   - sandbox.css:540 is now `.sb-lanes .lane.stub { stroke-width: 4; stroke-dasharray: 1.5 2.5; stroke-linecap: butt; }`.
   - It is still a short dashed stub, in its lane's grey: its colour comes from the shade rules, and no colour line changed.
   - No lane, curve or dot uses its weight or its dash: lanes are 2 px, dots 1.8 px, and the dashes in use are 6 4 and 0.01 4.
   - The lanes keep the ruled scheme of three greys with a line style each, so the ruling still holds.
2. **Nothing else changed.** I rendered every sandbox screen from the four fixtures, light and dark, at f393d3c and b5668a2.
   - Layout changed on exactly 109 nodes, all of them stubs: the dash went from 2 3 to 1.5 2.5 and the width from 2 to 4.
   - Words, fonts and colours: no change at all.
   - Lanes, curves and dots: unchanged.
3. **Accepted views (AC43) are still unchanged.** I rendered 8 accepted-view addresses at 84c1224 and b5668a2, and they are byte-identical.
4. **The test change is not a weakening, with one gap.**
   - **What was replaced:** one assertion added earlier in this stage, that the stub's dash is exactly "2 3".
   - **What the new checks require:** the stub is in its lane's grey, it is dashed, and its weight and dash differ from every line and curve on its log. They also require more than 20 stubs on more than 5 logs, with stubs on a solid, a dashed and a dotted lane.
   - **Round-2 note 1 is closed:** the lane test now runs forced dark, the phone's own dark and light, each at 360 and 414 px, and adds the md-extremes fixture.
   - **Mutations, 9 of 10 caught:**
     - the stub rule put back as it was at f393d3c;
     - the stub dashed like a lane (6 4) or dotted like one (0.01 4);
     - the stub not dashed, in another grey, or at a lane's weight;
     - lanes broken only under the phone's dark, or only at 414 px (both missed in round 2);
     - the stub broken only under the phone's dark.
   - **Missed:** a stub in long dashes ("40 2"). The new checks don't hold the dash short, which the old exact "2 3" did. See note 1.

## Commands run
- Full suite (`cd src && node --test ../tests/desk/*.test.mjs`): 1017 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 361b6b7`: "OK: all governance checks passed."
- `review_check.py pr 999 --base 361b6b7`: needs design-reviewer and reviewer. Its only violations are the two missing verdict files, and it found no weakened test. Across the range only the two new test files changed, with insertions only.
- `surface_guard.py diff --range 361b6b7..b5668a2 --branch build/builder/desk-v2-7`: "OK: 5 commit(s) … checked".
- b5668a2 is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **The stub test no longer holds the dash short.** AC49 says "short dashed stub". A bound, such as each dash at most 3 px on, would bring back what the old exact "2 3" held. That could be added here or at stage 8.
2. **Still owed by the pull request.** The dark Chromium captures at 360 × 740 and 414 × 896, beside frames H2 and 12. They would also show the 4 px stub at real size beside its lane.
3. **The ruling isn't merged yet.** The record is still only on pull request #185, which should land before or with this branch.

## Open questions
None new.

The worktrees and copies are removed. My scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (mutate4.py, sandbox-dump.mjs, accepted3.mjs). I left the r3-*.md, .log and .json files in the scratchpad alone, since I didn't create them.
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-7-review-confirmation-verbatim.md.)
