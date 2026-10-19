# Build review (Reviewer, desk), round 3, of the being-recorded build at 9496aaa (verbatim)

Verdict: PASS

(Round 3, tip 9496aaa; delta d599d01 and 17a14a3, checked against draft 6.)

For the owner:
- The gap I raised last round is closed: when your phone is told a pull request waits on you, the desk now counts it too.
- Two more safeguards work as written:
  - the desk takes the automatic job's word only from a run that finished cleanly;
  - a pull request the job hasn't judged within 45 minutes of its checks finishing now counts on both your phone and the desk. The desk shows no special words for it and stops counting once the job judges it.
- One new edge case is very rare and short-lived. If the phone's sender fails to download one job log while a pull request has been stuck for over 45 minutes, the phone can tell you about it while the desk still shows it as being recorded, until the sender's next run. I'd note it as a known limit rather than hold this up.

Checks I ran: the 4 AC79-related test files pass, 56 of 56. The page copies of the shared modules are identical, the build passes, and the worktree is unchanged. I did not rerun the full suite; you report 769 of 769.

**Round 2's R1 (ancestry check for dispatched runs only): fixed, as draft 6 says.**
- src/notify/collect.mjs:249-260 now checks ancestry only for `workflow_dispatch` runs.
- My /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r3.mjs now gives `sender counts #7: false | page: recording`: the two sides agree.
- The Builder added r3's case as a test (ac79-being-recorded.test.mjs, "desk R1") and a sender-side one (notify-j16-jobs.test.mjs, "desk R1").
- A dispatched run off the default branch's history is still ignored by the sender, and the page still counts every candidate a dispatched run names. So it is safe in both directions.

**Verdicts only from a successful merge job (J16 (b), draft 6): matches.**
- src/lib/jobcand.js treats a `merge` job concluded `failure`, `timed_out` and so on as the forged case: every candidate it names counts until a newer successful, well-formed run judges it. Skipped and cancelled jobs still judge nothing.
- On the page these show as `forged` (counted, no words, not held as left).
- Tests cover failure, timed_out, cancelled and success on both sides.

**Rule (e), 45 minutes unjudged: matches draft 6.**
- The clock runs from `done`, the latest `completed_at` of the counted checks. It only applies once all counted checks have completed.
- `judged` is set only by a successful, well-formed run's verdict line for this pull request, a `merged` line included (jobcand.js, the `judged` flag and the `UNJUDGED_MS` check after the loop).
- The page counts it as `unjudged`, with `words: null`, and never sets `sticky` (src/lib/jobwatch.js, the `p.v.unjudged` branch before `p.v.left`).
- Probe /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r5.mjs: at 47 minutes it is counted, `why: 'unjudged'`, no words, `sticky null`. After a later run judges it, it goes back to `recording`, as the sender does.
- Tests check 44 minutes (not counted) against 45 (counted, no words) on both sides.

**R2. (Non-blocking, to the Definer; carry as a known limit) A sender-side log download failure can trigger rule (e) while the page shows "Being recorded".**
- **Cause:** the sender treats a log it could not download as "not judged" (collect.mjs `readLog` gives null; jobcand.js skips it). With checks done over 45 minutes ago, rule (e) then fires and the sender notifies. The page read the same log, and the newest verdict there is transient (for example a pending status), so the page shows "Being recorded".
- **Reproduced** in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev/r4.mjs: normally `sender counts #7: false | page: recording`; with the sender's log fetch returning 502, `sender counts #7: true`.
- **Before draft 6** a failed sender read only ever made the sender count less, so this direction could not happen.
- **How rare:** it needs a candidate whose checks are done but which the job keeps judging as transient for over 45 minutes, plus a failed download on the sender's side. It clears at the sender's next successful read.
- **Options for the Definer:**
  1. Let rule (e) not fire on the sender when a log it needed could not be read, and treat that run as "not read" (AC76 keeps the last set). This weakens the bound only while logs stay unreadable.
  2. Name it as a known limit in AC79 and J16 (e).
- Page-side failures never cause this, since the page counts on any failed read.

Open questions:
- Definer: option 1 or option 2 for R2.
