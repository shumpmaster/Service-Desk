# The card fix's outside build — the plan, for the owner's approval (13 November 2026)

*Written by the Chief of Staff (session_01QBwHGMe3CduWFCmLZZ3pQ7), by the owner's answer C (decisions/questions/P-003-baseline-runner.md) and re-scope on stop card 16 (decisions/P-003/stop-16.md). Nothing in it has started. The approval is asked in questions/P-003-outside-build-plan.md.*

## What this means for you
The pipeline's attempt at the card fix failed: its spec failed review three times, and you closed the work there. Nothing has been built since. You decide whether to approve this plan for building it outside the pipeline, in working sessions. It is not the bare route the desk itself was first built by: it keeps the pipeline's frozen spec, locked checks and reviews. It adds a record of how today's desk behaves, made before any code changes. My session runs today's code and keeps that record. A reviewer confirms the setup first, and later runs today's code a second time to check the record. That second run overlaps the reviewer's job you declined in your earlier choice, though the reviewer keeps no record. Two things cannot be undone: closing the pipeline's item, which is already done, and anything pushed to this public repository, which may already have been copied. Each merge can be reverted and each deploy rolled back.

Five roles get records or duties their usual setup does not give them, each listed below. It takes about four working sessions. After this one you will:
- rule the new spec's criteria;
- review and merge the build;
- approve two deploys;
- accept the fix on the preview;
- rule the Launch gate;
- merge five records pull requests.

## The work
The fix is milestone M4 of the card fix's plan (docs/projects/P-003.md):
- A decision card waits off your queue until my notes for it are on the main branch.
- It then shows with the notes' recommended word marked, and its notice is sent then.
- After a day without notes, it shows marked "No Chief of Staff recommendation yet", and it catches up when notes arrive.
- Gate cards, questions and pull-request cards stay as they are.

The criteria are S-008's (AC1 to AC19, specs/S-008.md on the item/P-003 branch at its tip, 23c31dd2), carried over unchanged except where the fixes below need new words. The item/P-003 branch is kept until launch, so that S-009's lineage to S-008 resolves.

## How the build runs, with each step's writer
- **Agents and briefs.** Every agent below is a fresh subagent with a brief that lists exactly which records it gets. Any role whose must-not-see paths would be in an ordinary checkout works in a sparse checkout that holds only its brief's paths. The Chief of Staff's notes files go to no agent.
- **"The session"** is the Chief of Staff's working session. Its commits are signed `chief-of-staff` in that role's own lane. Commits for the orchestrator's paths are signed `orchestrator`, which is a departure.
- **Branches.** Builder branches stay local. The session merges them into its push branch with `--no-ff`, also a departure, so the push branch holds every step's commits in order.
- **The locked checks' session.** The locked checks are written in a working session of their own, so the Check author and the Builder never share a session id, as the surface guard requires.
- **The base commit** is main's tip when S-009 is frozen. S-009 names it.

1. **Your approval, recorded.** The session, as `chief-of-staff`, records your words in decisions/questions/P-003-outside-build-plan.md, with a `Proxy:` line if you answer in the session, and deletes the question file. The session, as `orchestrator`, adds a ledger ruling to docs/LEDGER.md under main's next free id (L-0051 today). The ruling says:
   - the card fix is built outside the pipeline from a new spec, S-009;
   - S-007 and S-008 are superseded;
   - each departure below is allowed for this build only.
2. **A reading of today's code.** A Reviewer is given src/ and tests/ at the base commit, plus questions taken from S-008's known limits. It returns its answers:
   - How do the desk and the sender read queue/, notes files and the dispatch log, and what form does a failed read take there?
   - Does the desk re-read while it is open?
   - What is the card-file name form?
   - How does the log reader treat two entries for one card?
   - Which entry points could an adapter call?

   The session records the return verbatim in reviews/S-009/src-reading.md.

   **Stop:** if the reading finds no failed-read form that today's read path already handles, the build stops here and comes back to you.
3. **The new spec, S-009.** The Definer writes it on `build/definer/S-009`, with commits carrying `Spec: S-009`, and lineage naming S-008 at 23c31dd2. Its brief adds three records:
   - S-008, from item/P-003;
   - S-008's plan review, from item/P-003;
   - the step-2 reading.

   Triage and docs/reports/** go to no one. S-009 fixes:
   - *Critic finding 1.* The spec's claim that the Reviewer may run code and commit under reviews/ was unsupported. S-009 names the session instead.
     - The session runs the adapter on every case at the base commit.
     - It commits the output unedited, as `orchestrator`, in reviews/S-009/baseline/record.json, with its SHA-256 in reviews/S-009/baseline/note.md.
     - The Reviewer only confirms the adapter beforehand (step 7) and re-runs the record afterwards (step 11).
     - The Builder's lane holds no reviews/ path, and the surface guard enforces that.
     - The pause the pipeline lacked comes between the Builder's two dispatches: the second dispatch comes only after the record is committed.
   - *Critic finding 2.* S-009 states the read place and failure form in its own words, so the Check author needs no reading of the code.
     - Failed queue/ and log reads are made at the read place step 2 found, keyed by path, in the form that read path already handles, never inside the rule.
     - The fix must read notes files through that same place, so a failure keyed to notes-file paths fails the notes read on the built code.
     - At the base commit, a failed notes read hits no read, because today's code reads no notes. Its baseline result is the no-failure run's.
   - *The non-blocking findings.*
     - The poison run replaces every file under src/, not only script files.
     - AC4's "without a reload" is worded to match step 2.
     - The stop at about 180 lines of code or 24 tests stays as the spec set it. The adapter is a test aid outside that count, as in S-008.

   The Critic's plan reviews follow, up to three rounds, with the same three records added. The session records each verdict in reviews/S-009/plan.md. A third failure comes back to you.
4. **Your criteria, which also serve as the Build gate.** The session, as `chief-of-staff`, files questions/P-003-S-009-criteria.md, in a pull request holding only that file. It is not a card in queue/, because the loop has closed P-003. The question holds:
   - S-009's criteria;
   - its join-up review;
   - Build's and Launch's standard lines (P-003's plan, section 3).

   Its Context cites the draft spec and reviews on their branches, which are not yet on main. There is no separate gate case and no gate Critic. Your answer is recorded in decisions/questions/, and the Definer then sets S-009 to frozen.
5. **Locked checks, in a session of their own.** The Check author writes the baseline cases in J7's form and the locked checks, all under tests/acceptance/, on `build/check-author/S-009`.
   - Its sparse checkout holds only specs/S-009.md, tests/acceptance/** and checks/**.
   - The checks read the record and note at paths the frozen spec fixes. Matching hashes show only that the two files agree. The protection against a changed record is the history (below) and the step-11 re-run.
   - The Critic then reviews the checks, for up to three rounds. Each verdict is recorded in reviews/S-009/_critic-checks.md. A third failure comes back to you.
6. **The adapter.** In its first dispatch, the Builder writes tests/desk/baseline/adapter.mjs only, on `build/builder/p003-adapter`, with no change under src/. It hands back with no passing check record, because the checks cannot pass before the record exists. The surface guard runs on its range, and the session merges the branch.
7. **The adapter confirmed.** The Reviewer reads the adapter against src/ at the base commit, read-only, and confirms that every output field comes from src/. If it cannot, the build stops and comes back to you.
8. **The baseline record.** The session runs the adapter once on every case. It runs them at the base commit, unpacked with `git archive` into a scratch folder outside the repository. It records the output as step 3 says.
9. **The fix.** In its second dispatch, the Builder works on `build/builder/p003-card-fix`, starting from the record's commit. Its brief adds the record and its note. It changes:
   - the rule in src/lib/;
   - the card sheet, Home, the queue and the board, and their served copies in src/public/lib/;
   - what the sender is handed, with no change to src/notify/**;
   - its own tests in tests/desk/;
   - the operating notes in docs/handover/P-003/.

   The restated size is about 90 to 130 lines of code and 15 to 23 tests, against the stop at about 180 lines or 24 tests, so the margin on tests is one.
10. **Checks.** The session runs the surface guard on the whole range of the build's pull request, then the full suite and the governance checks.
11. **Reviews**, each in a fresh session.
    - **The Reviewer, at stage 5.** Its brief adds the record, its note and the push branch's commit list: hash, author, trailers and paths, with no message bodies. It re-runs the adapter at the base commit, in a scratch copy the session makes, and checks that the output matches the record's bytes. It checks the commit order, and judges the fix, with its join-up review section (Build-5).
    - **The design reviewer**, because the change reaches src/public/**.

    The session records the Reviewer's verdict verbatim in reviews/S-009/_reviewer-build.md, as its card says, and copies it to reviews/<PR>/reviewer.md, where CI looks. It records the design reviewer's in reviews/<PR>/design-reviewer.md. Your review goes in reviews/<PR>/owner.md. It is required because tests/acceptance/** is R3, as is any change to src/lib/jobcand.js, ledgergrant.js or j22.js (governance/risk-paths.toml).
12. **The build's pull request**, merged by you with a merge commit, never squashed.
13. **The preview deploy.** It runs from main, on your approval of the merge commit (L-0004; the desk's deploy workflow).
14. **Your acceptance of the fix on the preview**, filed as a question by the session. M4 is reached on the preview (P-003's plan, section 6). Your answer is recorded in decisions/questions/. Then, in a commit whose `Owner-Ruling:` trailer names that record, the session adds ` · sprints: PR #<n>` and ` · reached: <date>` to M4, after the Critic checks the line.
15. **Before the Launch gate:**
    - The session runs the past-records V6 count once and records it in intake/value-checks.jsonl (Launch-4).
    - The Builder completes the handover package. Its monitoring and feedback section cites that count, and it sets out who does what once the fix is live (Launch-2).
    - The Reviewer reviews the package at stage 6 (Launch-3), including the cited count. The session records the verdict in reviews/S-009/reviewer.md.
16. **The Launch gate.** The session files it as a question, with the gate case written inside the question file. The Critic reads it cold first. Your answer rules going live (Launch-1).
17. **The live deploy.** It goes to the production environment on your approval (L-0004). Rollback means redeploying the previous deployment, then reverting the merge.
18. **The launch records.** The ledger entry and the improvement-register row in docs/IMPROVEMENT_REGISTER.md, both by the session as `orchestrator`. Then Launch-5's lessons, filed in the operating model's repository.

## The pull requests, and who merges them
| # | Holds | Merged by |
| --- | --- | --- |
| 1 | your approval recorded, the question deleted, the L-0051 ruling | you (it holds a ledger entry) |
| 2 | the criteria question only | the automatic merge |
| 3 | your criteria answer, the frozen spec | you (an R3 answer) |
| 4 | the build: checks, adapter, record, fix, reviews | you, after your review |
| 5 | the acceptance question only | the automatic merge |
| 6 | your acceptance answer, M4's reached line, the V6 count, the completed handover, the stage-6 review | you |
| 7 | the Launch gate question only, with its case inside it | the automatic merge |
| 8 | your launch answer, the ledger entry, the improvement row | you |
| 9 | the lessons, in the operating model's repository | you |

You merge five records pull requests (1, 3, 6, 8 and 9) and the build (4).

## Where this differs from the pipeline (recorded in L-0051)
- **The session.**
  - It commits as `orchestrator` for the ledger, the improvement register and every record under reviews/. SURFACES.md reserves that identity for the Orchestrator script, which copies records verbatim. The baseline record is one the session itself made, and L-0051 says so. Earlier Chief of Staff sessions used that identity only for handoff files (docs/handoff/2026-11-13-chief-of-staff-p005-5.md).
  - It runs today's code to make the baseline record.
  - It merges builder branches into its push branch, though AGENTS.md makes the Orchestrator the sole merger. The merges to main stay yours.
- **The Reviewer.**
  - Step 2: it reads code to inform a spec.
  - Step 7: it confirms the adapter before any build.
  - Both are outside its card's trigger, which is finished work.
  - Step 11: its brief adds the record, its note and the commit list. It re-runs today's code and checks commit order. Neither duty is on its card.
  - Step 15: its brief adds the V6 count record in intake/.
- **The Definer.** It is dispatched on this plan's approval, which is not one of its card's triggers. Its brief adds S-008 and its plan review from a branch other than main, and the step-2 reading.
- **The Critic.** For the plan review, its brief adds the same three records; its pack holds no reviews/ path. Its must-not-see list is kept.
- **The Builder.**
  - Its first dispatch hands back with no passing check record.
  - Its second dispatch's brief adds the record and its note.
  - Its step-15 brief adds the V6 count record.
- **The gates.** The Build gate is your criteria question, with no gate case or gate Critic. The Launch gate's case sits inside its question. Neither gate is a card in queue/.

Nothing else changes:
- The Check author's pack and duties.
- Every must-not-see list, kept by sparse checkouts and briefs.
- The surface guard, including its rule that the Check author and the Builder never share a session.
- The required reviews, your merges to main, and the stop rules.

## The history that proves the order
The build's branch shows, in order and checkable by anyone with `git log`:
1. the frozen spec;
2. the locked checks and cases;
3. the adapter commit, with no src/ change;
4. the baseline record commit, naming the base commit and the hashes of the adapter and the cases;
5. only then, the first commit that changes src/.

No locked check reads history, because the check run's copy may not hold it (LL-049, in the operating model's docs/LESSONS.md). The Reviewer checks the order in step 11, and its verdict records it.

## Stop rules
Each of these stops the build and brings it back to you, before any further change:
- **Plan review, and the checks' review:** a third failed round.
- **Step 2:** no failed-read form that today's read path already handles.
- **Step 7:** a Reviewer that cannot confirm the adapter.
- **Step 11:** a re-run that does not give the record's bytes.
- **The build:**
  - three failed build rounds;
  - about 180 lines of code, or 24 tests;
  - any change needed to src/notify/**;
  - an adapter that cannot run at the base commit, or that cannot run unchanged on the built code.

## Size and sessions
| Session | Steps | What happens |
| --- | --- | --- |
| 1 | 1 to 4 | your approval recorded, today's code read, the spec and its plan review, your criteria question |
| 2 | 5 | the locked checks and their review |
| 3 | 6 to 12 | the adapter, the record, the fix, its reviews and your merge |
| 4 | 13 to 18 | the deploys, your acceptance, the Launch gate and the records |

Each session ends with a handoff before its context fills. A long review round, or a wait on you, can add a session.

## What this plan does not do
- It does not reopen P-003 in the pipeline.
- It does not change the loop, the sender (src/notify/**), the role cards, the packs or the operating model.
- It does not answer S-008's open questions 1 to 7. They carry over to S-009 as yours, and none is needed before freeze.
