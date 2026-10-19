# Build review (Reviewer, desk), round 2, of the being-recorded build at 739f98e (verbatim)

Verdict: PASS

(Round 2, tip 739f98e. This report replaces round 1's.)

For the owner:
- All four round-1 problems are fixed, and the two permission files are now owner-approval paths, as planned.
- Merging in Work ahead broke nothing, and the full test suite and build pass.
- One rare gap remains, and it is in the spec rather than the build. To guard against a spoofed run, the phone's sender now ignores job runs on commits newer than its own copy of the code. In a narrow timing case, your phone can then be told about a pull request that the desk still shows as "Being recorded", for a minute or two, until the sender's next run. A one-line narrowing would close it. I'd fix it before launch, but it need not hold this review.

Checks I ran:
- Full suite: 763 of 763 pass. `node tools/build.mjs` reports PASS with 29 page modules in step.
- AC14's AC79 case still measures 6,561 calls against A3's 7,577.
- The worktree is unchanged.

**Round-1 findings: each fixed**
- **A (grant record deleted).** `recheckForm` runs every cycle against the kept ledger text (src/lib/jobwatch.js, `recheckForm`, called in `runPhase` after `noteLedger`). My repro (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r1.mjs) now gives `page after record deleted: count grant`, and the sender counts too. A test covers it both within an opening and in a fresh one.
- **B (capped head).** `judgeAll` now counts a capped head before anything else. My repro (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r2.mjs) gives `same head, capped: true … why: 'capped'`. The cap test now checks a new head within the same opening, not a fresh `pageJobs`.
- **C (grant run whose merge job didn't run).** `applyReads` marks the grant failed only for a failed read. A test shows the page reading run 2, then run 1, then judging "recording".
- **D (test gaps).** The two cases are now asserted:
  - "before the first judgment answers" (ac79-being-recorded test, and ac79-desk.test.mjs at T0+1s);
  - the old 17 October words absent (notify-ac77-desk.test.mjs:163, :420).
- **No test weakened.** The one assertion removed (the old `p2` cap check) was replaced by a stronger same-opening one. notify-ac73-set.test.mjs only gains `head_sha: head` on its run, which the sender's new filter needs.

**Merge with Work ahead (2877ebc): no interactions found**
- **model.js:** Work ahead adds only record kinds, reads and the v2.5 sprint fields. The `beingRecorded` removal from `flagged` and its activity row are unchanged.
- **sandbox.js:** Queue placement is intact (`recordingRow`, `sb-reclist` after the counted rows, the sheet guard, `noteDepartures`, the `recording` tap). Work ahead's "N waiting on you in your Queue" (workview.js `waitingOn`) counts only questions and cards from `q.rows`, so a being-recorded pull request is never in it.
- **pulls.js / J12 kept list (`desk-pulls-v3`) and feed.js:** these change the Timeline's estimate-only merges. AC79 reads J1's open list, not J12. An estimate-only pull request (intake/estimates.jsonl) is never a job candidate.
- **The rest:** PAGE_LIB keeps both sides, the src/public/lib copies match, and risk-paths.toml now holds both CS23 paths (round 1's E is resolved).

**The Builder's open readings**
1. **Dispatch runs count everything while unread: safe.** `dispatchOnTop` and `p.dispatched` only add counts. A dispatch run's own verdict is never taken, and no grant line is taken from one. The worst case is a failed read of that log, which counts every candidate for the opening.
2. **The sender's ancestry rule: not strictly safe** (finding R1).

**R1. (Non-blocking, to the Definer; carried as a risk) The ancestry rule, applied to every run, can let the sender notify while the page shows "Being recorded".**
- **Where:** J16 (b) in draft 5 (specs/S-001.md:8285-8288) applies the `head_sha` ancestry check to every judging run, and src/notify/collect.mjs:249-257 does exactly that. So the build matches the spec. The gap is between this rule and AC79's promise.
- **How:**
  - The sender ignores a run on a commit newer than its checkout, even a real `workflow_run` or `schedule` run.
  - So the sender can leave a pull request on an older run's final reason, while the page takes the newer run's transient or merged line and shows "Being recorded".
  - This is the spec's own case "after a fix on the default branch".
  - It lasts until the sender's next run, which asks-merge's completion triggers: usually a minute or two.
- **Reproduced** in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r3.mjs: `sender counts #7: true | page: recording`.
- **How rare:** the newer run has to finish between the sender's checkout and its read of the runs list, which is usually only seconds.
- **Fix (one line):** apply the ancestry check only to `workflow_dispatch` runs, the only ones a tag can spoof. The Facts say real `workflow_run` and `schedule` runs report the default branch. The page already counts every candidate a dispatch run names, so that narrowing keeps both directions safe.
- **Route:** the Definer changes J16 (b), then the Builder changes collect.mjs:249-257. It is an R3 path, so the owner's verdict is needed.

Open questions:
- Orchestrator: land R1's narrowing now, or carry it into the gate's case as a risk.
