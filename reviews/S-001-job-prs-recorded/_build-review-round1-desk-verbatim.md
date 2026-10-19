# Build review (Reviewer, desk), round 1, of the being-recorded build at 8317f02 (verbatim)

Verdict: FAIL

For the owner:
- In one rare case the desk can show a pull request as "Being recorded by the automatic job" while your phone has already told you it waits on you, and it keeps showing that until you reload the desk. The spec promises this never lasts longer than about a minute. The case: the ruling record that backs the job's permission is deleted while the ledger itself stays the same.
- Everything else I checked does what the spec says: the counting, the 3-call cap, the grant check, the words, both views and the cost. The worst-case day measured 6,561 desk calls, against the spec's estimate of 7,577 and the 10,000 limit.
- One step was skipped. The two new shared files were meant to become owner-approval paths before this work lands (Setup CS23). That change is on its own branch and has not landed, so this build must wait for it.
- Fixing the first point is small. I found two minor gaps in the tests.

Checks I ran: all 7 AC79-related test files pass (79 of 79); AC14's AC79 case reports 6,561 calls and 1,123 AC79 blob calls; and two repro scripts of my own, below.

**A. (Blocking, to the Builder) The grant can stand on the page after the sender has lost it.**
- AC79 says the grant stands only when the form check finds an entry "its decided_by naming a record in the tree". The code checks that against the tree only once, when it reads the ledger blob:
  - src/lib/jobwatch.js:356-359 (`formGrant(text, has)`);
  - src/lib/jobwatch.js:309 (the blob is read again only when the ledger's sha changes);
  - src/lib/jobwatch.js:189-197 (`noteLedger` reacts only to a sha change);
  - src/lib/ledgergrant.js:97.
- If the named decisions/questions/ record is deleted and the ledger is unchanged, the sender's `findGrant` finds no grant, so it has no job candidates and counts and notifies the pull request. The page keeps the old form and the old grant line (src/lib/jobwatch.js:217-249), so it shows "recording" for the rest of the opening.
- Reproduced in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r1.mjs: `page after record deleted: recording` while `sender counts #7: true`.
- Fix: check the cached ledger text against the current tree on every cycle. If the record is gone, the form finds no entry or another id, so the page counts.
- Add a matrix case for this.

**B. (Non-blocking, to the Builder) A capped head can go back to "Being recorded" on the same head.**
- The spec says "A head that would need a fourth counts until its head changes." But `judgeAll` (src/lib/jobwatch.js:405-426) still judges capped heads. It counts them only while they still need a read (:423).
- Reproduced in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r2.mjs: the head is capped with 3 calls, then a check run starts on the same head, and the verdict becomes `recording`.
- It is safe, because it is judged on complete reads, but it differs from the spec's words. Either keep a capped head counted until its head changes, or the Definer accepts this.
- The cap test hides it: tests/desk/ac79-being-recorded.test.mjs:304-314 tests "a new head" in a fresh `pageJobs`, which is a new opening, not a new head within the same opening.

**C. (Non-blocking, to the Builder) A grant read whose merge job did not run marks the grant failed for the whole opening.**
- src/lib/jobwatch.js:378 sets `grant.failed` when the log form says `ran: false`. The spec says the grant line comes from "the newest judging run whose `merge` job ran", so the page should move on to the next run, not stop.
- It is the safe side and rare (asks-merge.yml has a single job, and a skipped job makes the run `skipped`), but it can switch option B off for a whole opening.

**D. (Non-blocking, to the Builder) Test gaps; nothing was weakened.**
- The matrix case "before the first judgment answers: counted" is never asserted directly. The nearest is a comment at tests/desk/ac79-desk.test.mjs:248, and the head-time-pending count at :128-130.
- AC77's two changed assertions (tests/desk/notify-ac77-desk.test.mjs:162, :418) only check `includes('Your answer to …')`, which the old ": the automatic job merges it…" ending would also pass. A negative assertion exists only for the being-recorded row (ac79-desk.test.mjs:195).
- AC73's test (notify-ac73-set.test.mjs) is stronger than before: it now asserts `beingRecorded` is [107, 965].

**E. (Blocking for landing, to the Orchestrator) Setup CS23 has not landed.**
- The spec says: "Until it lands, the move waits." The brief's step 7 says "once Setup CS23 has landed".
- The CS23 commit 2462c1f exists only on cos/cs23-r3-paths. It is not an ancestor of 8317f02 or of origin/main (d8026fa). governance/risk-paths.toml at the tip lacks both paths, so they are still R1 and no owner verdict is required by the checks.
- Land CS23 first, then rebase or merge, then rerun the surface guard and review_check.

**F. Checks that held (no finding):**
- Poll `jobs` part read last and set to `null` past 30 requests: src/lib/github.js:370-373.
- 304 handling and blob calls only when something changed: jobwatch.js:458.
- Dry pass: jobwatch.js:259-297.
- 3-call cap with failures counted: jobwatch.js:350-353.
- `seenMs` is created_at and `retriedMs` is null: jobwatch.js:294.
- Sticky (b)/(d): jobwatch.js:400-417.
- Grant from the newest read run, epoch per ledger change, failure not retried: jobwatch.js:203-249.
- Judging runs filtered to the default branch in the shared module: jobcand.js `isJudgingRun`.
- Log form with no token on the redirect and the 65,536-character cap: github.js:440-496.
- Model and views: the row leaves `flagged` (model.js:520-540), sits under Merges after the counted rows uncounted and opens only its link (sandbox.js:1272-1282, 1323-1335), no sheet (sandbox.js:1553-1560), accepted-view activity row (app.js:426-428). Quiet, Home and the owner's tile are tested.
- Rule (c) words only after 30 minutes from first sight: jobwatch.js:418.
- AC14's arithmetic: 5,500 + 288 + 60 + 215 + 864 + 50 + 100 + 500 = 7,577, and the test measured 6,561.
- The screenshots match the spec: grey edge, no coral, "NONE" count, Quiet on Home, the row in the activity list, and the left-for-you words in bold meta size.

**G. The Builder's readings** (5a-5h, in your list's order):
1. Next-page rule for a head's three lists only: within the spec. The runs list is by definition "the latest 30", one page, as the sender reads it.
2. Grant line from a run started after the page saw the ledger change: within the spec, and stricter than "completed after".
3. A failed ledger blob counts: within the spec ("any read failing").
4. Rule (d) words only when the log says no grant stands: within the spec. A mismatch or a missing line is the page's own count.
5. A rate-limited AC79 call counts as failed: within the spec.
6. The new `recording` kind in tapDecision: within the spec's intent (never "That no longer waits on you"). The Definer may want to note it in AC74.
7. The row kept out of "Done today": within the spec, since it is still open.
8. A failed head-time read lets (c) run from created_at: within the spec. The page counts either way: as rule (c) once created_at is 30 minutes old, otherwise as pending.

**H. Module names:** `src/lib/jobcand.js` and `src/lib/ledgergrant.js` match the spec's guide names exactly (AC79 "The shared parts"). The src/public/lib copies are identical, and PAGE_LIB is updated (src/tools/build.mjs).

Open questions:
- Definer: should "naming a record in the tree" also restart the grant line's epoch when the tree changes, not only when the ledger's sha changes? Rechecking the form against the current tree is enough for safety.
- Definer: confirm B (stick to the spec's words, or accept judging capped heads).
