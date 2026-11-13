# The card fix's outside build — the plan, for the owner's approval (13 November 2026)

*Written by the Chief of Staff (session_01QBwHGMe3CduWFCmLZZ3pQ7), by the owner's answer C (decisions/questions/P-003-baseline-runner.md) and re-scope on stop card 16 (decisions/P-003/stop-16.md). Nothing in it has started. The approval is asked in questions/P-003-outside-build-plan.md.*

## What this means for you
The pipeline's attempt at the card fix failed. Its spec failed review three times, and the work was closed there by your answer. Nothing has been built since. This plan builds the fix outside the pipeline, the way the desk itself was first built, with two additions the pipeline's attempt asked for: a frozen spec, and a record of how today's desk behaves, made before any code changes, so the fix can be checked against it. The pipeline stopped partly because it had no way to pause the build while a separate reviewer runs today's code. A working session can pause. The new spec fixes the other fault, an unclear rule about failed reads. To make this work, five roles get records or duties their usual setup does not give them, and my session writes some of the loop's records; each one is listed below, and your approval records them. It takes about three working sessions, and after this one asks you six more times:
- the new spec's criteria, which also serve as the Build gate;
- the pull request's review, needed because it adds locked checks, which only you approve;
- the preview deploy;
- accepting the fix on the preview;
- the Launch gate;
- the live deploy.

The merge can be reverted and each deploy rolled back. Two things cannot be undone: closing the pipeline's item, already done, and anything pushed to this public repository, which may already have been copied.

## The work
The fix is milestone M4 of the card fix's plan (docs/projects/P-003.md). A decision card waits off your queue until my notes for it are on the main branch. It then shows with the notes' recommended word marked, and its notice is sent then. After a day without notes it shows marked "No Chief of Staff recommendation yet", and catches up when notes arrive. Gate cards, questions and pull-request cards stay as they are. The criteria are S-008's (AC1 to AC19, specs/S-008.md on the item/P-003 branch at its tip, 23c31dd2), carried over unchanged except where the fixes below need new words. The item/P-003 branch is kept until launch, so that S-009's lineage to S-008 resolves.

## How the build runs, with each step's writer
Every agent below is a fresh subagent of the working session, with a written brief that lists exactly which records it gets. "The session" means this Chief of Staff's session. Its commits are signed `chief-of-staff` in that role's own lane, and `orchestrator` for the orchestrator's paths. The second is a departure (see below). Builder branches stay local and are merged with `--no-ff` into the session's push branch, which holds every step's commits in order.

1. **Your approval, recorded.** The session, as `chief-of-staff`, writes your words in decisions/questions/P-003-outside-build-plan.md, with a `Proxy:` line if you answer in the session, and deletes the question file in the same pull request. The session, as `orchestrator`, writes a ledger ruling in docs/LEDGER.md under main's next free id (L-0051 today). The ruling says three things: the card fix is built outside the pipeline from a new spec, S-009; S-007 and S-008 are superseded; and every departure listed below is allowed for this build only.
2. **A reading of today's code.** A Reviewer reads src/ at the base commit and answers the questions S-008 could not:
   - How do the desk and the sender read queue/ and the dispatch log, and what form does a failed read take there?
   - Does the desk re-read while it is open?
   - What is the card-file name form?
   - How does the log reader treat two entries for one card?
   - Which entry points could an adapter call?
   The session records the return verbatim in reviews/S-009/src-reading.md. **Stop:** if no failed-read form exists that today's read path already handles, the build stops here and comes back to you.
3. **The new spec, S-009.** The Definer writes it on `build/definer/S-009`, with commits carrying `Spec: S-009`. Its lineage names S-008 at 23c31dd2. Its brief carries S-008, S-008's plan review (reviews/S-008/plan.md) and the reading from step 2; triage/P-003.md and docs/reports/** go to no one. It fixes:
   - *Critic finding 1.* The spec's claim that the Reviewer may run code and commit under reviews/ was unsupported, and a project-plan line says the Orchestrator records reviews. The new spec follows that line. The Reviewer runs the adapter, which is test code, under its card's "Run checks and tests", and returns the output; it never commits and never writes a file. The session records the output verbatim in reviews/S-009/baseline/record.json, with its SHA-256 in reviews/S-009/baseline/note.md. The Builder's lane holds no reviews/ path, and the surface guard enforces that. The pause the pipeline lacked is the session's own: the Builder is dispatched twice, and the second time only after the record is committed.
   - *Critic finding 2.* At the base commit a failed notes read changes nothing, because today's code reads no notes, so its baseline result is the result of the run with no failure. Failed queue and log reads are made at the place step 2 found, in the form that read path already handles, and never inside the rule.
   - *The non-blocking findings.* The poison run replaces every file under src/, not only script files. AC4's "without a reload" is worded to match step 2. The stop at 24 tests stays. Your approval of the criteria is asked in step 4.
   - Then come the Critic's plan reviews, up to three rounds, with the same records as the Definer. A third failure comes back to you.
4. **Your criteria, which also serve as the Build gate.** The session files the ask as a question, in questions/P-003-S-009-criteria.md, as `chief-of-staff`. It is not a card in queue/, because the loop has closed P-003 and must not pick it up. The ask holds three things: S-009's criteria, its join-up review, and Build's and Launch's standard lines for you to rule (P-003's plan, section 3). There is no separate Build gate case or gate Critic. Your answer is recorded in decisions/questions/. The Definer then sets S-009 to frozen on its branch.
5. **Locked checks.** The Check author writes the baseline cases in J7's form and the locked checks, all under tests/acceptance/, on `build/check-author/S-009`, before any work exists. Its brief holds the frozen spec only. It never gets src/, the step-2 reading, docs/handover/** or any builder return. The checks read the record and its note at paths the frozen spec fixes, and compare the record's hash with the note's. That shows only that the record was not changed after it was made; the order is proved by history (below). The Critic then reviews the checks against the spec, as the pipeline's stage 4 would, and the session records the verdict in reviews/S-009/_critic-checks.md.
6. **The adapter.** In its first dispatch, the Builder writes tests/desk/baseline/adapter.mjs only, on `build/builder/p003-adapter`, with no change under src/. The surface guard runs on its range, and the branch is merged into the push branch.
7. **The baseline record.** The session unpacks the base commit into a scratch folder outside the repository (`git archive`), with the adapter and cases added. The Reviewer then reads the adapter against src/ and confirms that every field comes from src/. If it confirms, it runs the adapter once on every case there and returns the output, and the session records the output as step 3 says, on the push branch. If it cannot confirm, there is no record, and the build stops and comes back to you.
8. **The fix.** In its second dispatch, the Builder works on `build/builder/p003-card-fix`, starting from the record's commit. It changes:
   - the rule in src/lib/;
   - the card sheet, Home, the queue and the board, and their served copies in src/public/lib/;
   - what the sender is handed, with no change to src/notify/**;
   - its own tests in tests/desk/;
   - the operating notes in docs/handover/P-003/.
   The restated size is about 90 to 130 lines of code and 15 to 23 tests, plus the adapter.
9. **Acceptance.** The session runs:
   - the surface guard on each builder range;
   - the full suite;
   - the governance checks.

   Then come the reviews, each in a fresh session:
   - the Reviewer, whose brief says that the step-7 record was made by an earlier Reviewer session;
   - the design reviewer, because the change reaches src/public/**.

   The session records their verdicts verbatim in reviews/<PR>/reviewer.md and reviews/<PR>/design-reviewer.md. Your review goes in reviews/<PR>/owner.md. It is required because tests/acceptance/** is R3, and because any change to src/lib/jobcand.js, ledgergrant.js or j22.js is R3 too (governance/risk-paths.toml).
10. **One pull request, merged by you with a merge commit**, never squashed.
11. **The preview deploy, on your approval** (the preview environment, L-0004).
12. **Your acceptance of the fix on the preview.** M4 is reached on the preview (P-003's plan, section 6). On your ruling, the session adds ` · sprints: PR #<n>` and ` · reached: <date>` to M4 in docs/projects/P-003.md, as `chief-of-staff`, in a commit whose `Owner-Ruling:` trailer names your acceptance record.
13. **The launch review and the first count.** The Reviewer reviews the handover package at stage 6 (Launch-3), and the session records the verdict. The session runs the past-records V6 count once (Launch-4).
14. **The Launch gate**, filed as a question with its gate case, as `chief-of-staff`. Your answer rules going live (Launch-1).
15. **The live deploy, on your approval** (the production environment, L-0004). Rollback means redeploying the previous deployment, then reverting the merge.
16. **The launch records**, in one records pull request after the live deploy: the ledger entry, as `orchestrator`; the improvement-register row in docs/IMPROVEMENT_REGISTER.md; and Launch-5's lessons for the operating model.

## Where this differs from the pipeline (recorded in L-0051)
- **The session commits as `orchestrator`.** This covers the ledger, reviews/ and the review records, which SURFACES.md reserves for the Orchestrator script. An earlier Chief of Staff session did this only for a handoff file (docs/handoff/2026-11-13-chief-of-staff-p005-5.md).
- **The Reviewer, step 2.** It reads src/ to inform a spec, which is not on its card; its card's trigger is finished work. Its return goes to the Definer and the Critic only.
- **The Reviewer, step 7.** It runs the adapter at the base commit before the build, under its card's "Run checks and tests"; that trigger is also outside its card. It writes no file.
- **The Definer, step 3.** Its brief adds the step-2 reading and S-008's plan review from a branch that is not main. Neither is on its must-not-see list.
- **The Critic, steps 3 and 5.** Its brief adds the step-2 reading, so it can check S-009's claims about today's code. Its must-not-see list (docs/reports/**, docs/briefs/**) is untouched.
- **The Build gate** is your criteria question (step 4), and **the Launch gate** is a question (step 14); neither is a card in queue/.

These do not change:
- The Check author's and the Builder's packs.
- Every must-not-see list.
- The surface guard, the reviews, your merge, and the stop rules.

## The history that proves the order
The push branch shows, in order and checkable by anyone with `git log`:
1. the frozen spec;
2. the locked checks and cases;
3. the adapter commit, with no src/ change;
4. the baseline record commit, naming the base commit and the hashes of the adapter and cases;
5. only then, the first commit that changes src/.

No locked check reads history, since the check run may not hold it (LL-049, in the operating model's docs/LESSONS.md). The Reviewer checks the order in step 9, and its verdict records it.

## Stop rules
- **Plan review:** a third failed round comes back to you.
- **Step 2:** if no failed-read form exists that today's read path already handles, the build stops and comes back to you.
- **The build stops and comes back to you, before any further change, on any of these:**
  - three failed build rounds;
  - about 180 lines or 24 tests;
  - any change needed to src/notify/**;
  - an adapter that cannot run at the base commit, or unchanged on the built code;
  - a Reviewer that cannot confirm the adapter.

## Size and sessions
- **Session 1:** steps 1 to 4: the record of your approval, the reading of today's code, the spec and its plan review, then your criteria question.
- **Session 2:** steps 5 to 9: the checks and their review, the adapter, the record, the fix and its reviews.
- **Session 3:** steps 10 to 16: the pull request through the launch.

Each session ends with a handoff before its context fills. A long review round, or a wait on you, can add a session.

## What this plan does not do
- It does not reopen P-003 in the pipeline.
- It does not change the loop, the sender (src/notify/**), the role cards, the packs or the operating model.
- It does not answer S-008's open questions 1 to 7. They carry over to S-009 as yours, and none is needed before freeze.
