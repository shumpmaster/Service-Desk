# M3D stage 6a (S-001 after MD3): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-6a at dc6325c. Round 2 is reviews/M3D/_stage-2-review-r2-verbatim.md, part B; round 3 is reviews/M3D/_stage-4-review-r3-verbatim.md, part E.

---

Verdict: FAIL

Stage 6a of the after-MD3 plan (M3D), commit dc6325c on db1474e, reviewed over db1474e..dc6325c. Most of the stage is right: the new words match the spec, the CI row's new read pieces use no new calls, and "<n> more" now counts only parts not shown at all. It fails on two points:
- Plan now loses a second waiting gate card altogether.
- The rewrite of an AC86 case leaves AC24's rule for counting decision cards with no test.

## Blocking findings

**B1. A second waiting gate card disappears from Plan.** Route: Build. Define instead, if the spec means one gate per project.
- **The change:** `waitingOn` (src/lib/workview.js:57-66) no longer counts gate cards on a milestone row, as AC89 (k) asks: "its own row says it waits".
- **Why that loses a card:** Plan draws at most one gate row per project. `gateCardOf` (src/public/sandbox.js:825-828) returns the first gate card, and workview.js:283-285 sets one `g.gate`.
- **Reproduced** with a probe: two waiting Launch-gate cards in Service-Desk, P-003 and P-004, both `Milestone: M3A`, using AC85's made-up card.
  - At db1474e: one gate row (P-003), and M3A reads "… 2 waiting on you in your Queue".
  - At dc6325c: the same one gate row, and M3A reads nothing. P-004 waits on the owner but now appears nowhere on Plan. The board still shows both.
- **Fix:** give each waiting gate card its own row (AC86's "a gate card waiting on the owner is a row of its own"), or keep counting the gate cards that have no row.

**B2. AC24's rule for counting decision cards lost its only test.** Route: Build.
- **What was replaced:** ac86-plan.test.mjs:252-254 used to hold "AC24's own rule is unchanged: a card whose `Milestone:` line names a milestone counts on that row". It now asserts that no milestone row counts the gate card, as AC89 (k) asks.
- **What is missing:** no case was added for a non-gate decision card with a `Milestone:` line.
- **Evidence:** mutation W1, `waitingOn` skipping every card, passes all of ac89-words-drawing, ac24, ac86, ac82, ac83, ac84, ac69-72, md-sandbox, j13, j4-j14-j15, ac90, ac66-67-68, ac80 and ac85.
- **The rule it breaks:** the brief's "never drops one without its counterpart".
- **Fix:** add a case where a decision card with `Milestone: <id>` counts "1 waiting on you in your Queue" on that row.

## What I checked and found sound
1. **The v2.5 CI row reads nothing new.**
   - `parseWorkflowRuns` now also reads `updated_at`, and `ciRunOf` picks a failing run first, then a running one, then the latest.
   - Both work on the same run-list pages as before, which `readList` keeps as GitHub's raw text (lib/github.js:329). There are no new calls, so A3 is unchanged.
   - fake-desk.mjs only passes a fixture's `updatedAt` through as `updated_at`; it weakens nothing.
2. **The words.** These match AC89 (d), (e) and (k) word for word:
   - (e): "Cost: not known yet · from the usage record when it ends" and "not recorded: the Chief of Staff can't read its own cost";
   - (k): "Run <k> began <date>", "<id> · rough finish not available: <reason>" with its own code left out, " · may be out of date", " · a newer estimate line could not be read", "workflow and date not read", and "source check failed" spoken;
   - (d): "Your merges?" kept for v3 only.
3. **"<n> more"** counts only parts whose top is below the box's foot. A part cut at the third line counts as shown and reads "more" (`hiddenParts`, sandbox.js:2826-2840).
4. **No guard exception was needed.** The stage-8 guard cascades the same drawn tree with bd4097d's stylesheet and with today's, so any changed declaration on a walked node would fail it. The suite passes, so none of the new rules reaches a walked screen. Those rules cover sprint marks inside closed folds, the ⇅ view, an unparseable portfolio card's note, and bubble notes.
5. **The rewritten cases** each match their cited lines:
   - ac24 (:7934-7935), the rule-3 half-filled icon;
   - ac69-72 and ac84, "Run <k> began <date>";
   - ac82, Next's words;
   - ac83, the CI row;
   - md-sandbox, "<n> more" counting parts not shown at all;
   - j13, the Cost and Update lines in words;
   - ac86, the gate card no longer counted (but see B2).
6. **Mutations: 9 of 10 caught**, all by ac89-words-drawing, some also by ac24 or ac82:
   - the CI row naming the oldest run;
   - "<n> more" counting cut parts;
   - "Your merges?" kept on v2.5;
   - the rule-3 row's old icon;
   - the failed source check spoken plainly;
   - a phase said "ahead" twice;
   - the portfolio file named twice;
   - "may be out of date" lost;
   - the tile naming its own code twice.
   - Only W1 was missed (B2).

## Commands run
- Full suite: 1121 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . db1474e`: "OK: all governance checks passed."
- `surface_guard.py diff --range db1474e..dc6325c --branch build/builder/m3d-6a`: "OK: 1 commit(s) … checked".
- `review_check.py pr 999 --base db1474e`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files, with no test-weakening flag. B2 is a lost counterpart that review_check can't see.
- dc6325c is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **The move controls side by side is a layout choice.** AC89 (k) asks only that the ordering view's rows have "no empty space under them". Putting the two move controls side by side is one way to do that, and the spec doesn't say how. That is for the Design reviewer, or the owner if it departs from frame 11.
2. **" · <workflow> · date not read"** is the Builder's own wording, for a run whose read gives no time. The spec gives only "workflow and date not read". Define could write it in as C.
3. **The Chief of Staff's Cost line when not working** reads "not recorded: no piece of its work is under way". AC89 (e) says "not recorded" otherwise. The extra reason is true; Define may want to confirm it.

## Open questions
1. For Define: can a project have more than one gate card waiting at once? If so, should Plan show a row for each (B1)?

The worktrees and copies are removed. Other r6* entries remain in the scratchpad that I didn't make (r6, r6-full.txt, r6-in-commit.md, r6-verdict.md, r6.py); I left them alone. Disk is at 6.5 GB free. My probe and mutation scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (probe-twogates.test.mjs, mutate13.py).