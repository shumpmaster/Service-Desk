Verdict: PASS

Build review, round 2, of build/builder/trial-view-2 at d6e1afe. The new work is ee284bf, 5608508 (the merge of orch/trial-view-2) and d6e1afe, reviewed against specs/S-001.md at draft 6 (5d8f500). I also reviewed the draft 6 diff, `git -C /home/user/sd-tv2 diff 69a64ff..5d8f500 -- specs/S-001.md`. Every round-1 finding is fixed, and each fix has a test that fails if the fix is undone. One new non-blocking risk comes from draft 6's own retry rule (N1 below). I edited nothing in the repository; `git status` is clean.

**Runs (from /home/user/sd-tv2-bld)**
- `cd src && npm test`: 402 pass, 0 fail.
- `npm run build`: PASS (18 page modules in step).
- `surface_guard.py diff --range orch/trial-view-2..HEAD --branch build/builder/trial-view-2`: OK, 14 commits (1 merge skipped).
- `GOV_BRANCH=build/builder/trial-view-2 bash governance/checks/check_all.sh . orch/trial-view-2`: "OK: all governance checks passed".
- The Builder's changes since orch/trial-view-2 are only under src/ and tests/: `git diff 5d8f500 HEAD -- specs/ reviews/ decisions/ governance/` is empty. Commits are under `builder <builder@agents.invalid>` with `Agent-Session:` and `Spec: S-001` trailers.

**Draft 6 spec diff: sound**
- **N1 (J12 401-only line), now :4639:** "Only a 401 stops the rest of the call; GraphQL's rate limit is the page's to judge" matches the code, github.js:404-413.
- **N2, now :4671-4674:** a 60-minute wait after `RATE_LIMITED`, then read again; any other failed read is tried again on a later cycle. N1 below is a cost of this rule.
- **N4, AC57 :2532-2541:** I measured the four run 3 and run 4 shades myself.
  - CIEDE2000: lowest 17.7 in the light theme and 15.3 in the dark, against the 14 colours and each other, as the spec says.
  - Contrast against page and card surfaces: at least 3.07:1 light and 5.25:1 dark.
- **N6a, AC60 :2879:** only merged PRs are placed by their own `Milestone:` line.
- **N6b/B1, AC72 :3567-3571:** the "not current → Can't check" rule.

**Round-1 findings, each fixed**
- **B1, fixed.** Code: feed.js:790-793, snapshot `current` at scheduler.js:552-553.
  - `current` follows the spec's three conditions: no failure set, the read at this head has answered, no cold read under way.
  - My repro /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv/ac72-stale.test.mjs now prints `{"kind":"cant","words":"Can't check this deploy yet","reason":"the pull requests' read failed: GitHub could not be reached"}`.
  - New tests: ac69-72-audit-additions.test.mjs (kept list with a failure; `current: false`) and j12-pulls.test.mjs (the snapshot after a reload, after a failed head-change read, and during a cold read).
  - Mutation check: removing the `current` line fails a test.
- **B2, fixed.** Code: feed.js:324-332.
  - My repro /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv/ac60-stale.test.mjs now gives "not available" with the failure's reason for PR #44 and PR #52, and the note "Pull requests: not available (…)".
  - Mutation check: putting the kept list back during a failure fails a test.
- **N2, fixed per draft 6.** Code: scheduler.js:175-178 and :194-195.
  - `RATE_LIMITED` waits 60 minutes with no head change needed; other failures are retried the next cycle, never twice in one cycle.
  - Tested, including a quiet project with no head change.
- **N3, fixed.** `verdictOf` (j11.js:64-74) now mirrors review_check.py's `parse_verdict`.
  - My /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv/verdict.mjs: the five former false PASSes now read 'other', and the byte-order-mark case reads FAIL, the same as review_check.
  - Its leading-character class covers Python's `isspace` set plus Cf characters.
- **N4, fixed.** sandbox.css:21, :47 and :60 hold the draft-6 values; `runShade` (sandbox.js:797-800) cycles runs 3 and 4 in turn; "Run <k> began" takes its run's shade. AC48's test checks the four values, and setting run 3 back to the agent blue fails it.
- **N5, fixed.** `closedAt` is no longer kept (pulls.js:133), and the kept-fields test was updated.
- **N6a.** Open PRs are not placed by a `Milestone:` line (feed.js:406), with a test.

**The Builder's two readings: neither contradicts the spec**
1. **Hiding open PRs' parts from J1's open list while a J12 failure is set** (feed.js:332). This is the literal reading of J12's "every pull request part of AC60 shows 'not available'" (:4685-4686), and it never shows a wrong statement. It does hide current J1 data that J12 says comes "from J1's open list on every poll" (:4652), so the two sentences pull apart. A one-line Definer clarification would settle it either way. `pullsIndex` is used only by the Timeline (feed.js:358), so the Queue (AC52) is unaffected.
2. **Showing nothing from the old kept list during a failure.** This is what J12's failure rule requires, and it is the B2 fix.

**New finding (non-blocking, a risk for the gate's case)**

N1. Draft 6's retry on every cycle can break AC14's margin of 10,000 function requests a day. When a J12 read keeps failing (no answer, or `data: null`), the next cycle sends a blob call holding only the pulls read.
- My count: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv/j12-calls.test.mjs gives, for 60 quiet minutes on Service-Desk, 60 calls when healthy and 120 when failing every time (60 of them blob calls with only the pulls read).
- At AC14's scenario (5 projects, 16 window-hours), that is up to 4,800 extra calls if all 5 are v3 and failing: 5,500 + 4,800 = 10,300, over the 10,000 margin, though under Free's 100,000.
- This is plausible before Setup CS13 has confirmed that the read token can use GraphQL, since a refusal fails the same way every time.
- Exposure today: one connected v3 project (src/lib/config.js), about +960 a day.
- The build does exactly what draft 6 says, so this belongs to the Definer. Fix: back off the retries (for example 5, 10, 20 … up to 60 minutes), or retry only on a cycle that already makes a blob call. Add an AC14 case with J12 failing throughout.

**Also verified**
- Chromium at 360×740, light and dark, every fold open, 8 screens, on the new CSS and AC70 markup: no sideways scroll, no element outside the viewport, no animations, no page errors.
- Not a finding: "Run 2 began" is in run 2's shade and "· why it went back: not recorded" stays slate (AC69 and AC70 as amended), and the AC69 test still passes.

**Join-up review (Reviewer, end of Build), update to round 1**

| Path through the product | Result | Fix |
|---|---|---|
| Queue deploy row while J12 has failed and an earlier list is kept | Works: "Can't check this deploy yet" with the reason | — |
| Queue deploy row after a head change, before the read at that head answers | Works: "Can't check this deploy yet" | — |
| Timeline while J12 has failed | Works: "not available" with the reason, and the note | — |
| Stalled project after a failed J12 read | Works: tried again next cycle, no head change needed | — |
| Run 3 and later on Status | Works: their own neutral-tinted shades | — |
| J12 read failing for a whole window | Up to double the function calls for that project | N1 (Definer) |

Every other path from round 1 still works together.

**Open questions for the Definer**
- N1: should a failed J12 read back off before retrying?
- Reading 1: should J1's open-list parts still show while J12 has failed?
