# The card fix's outside build — the plan, for the owner's approval (13 November 2026)

*Written by the Chief of Staff (session_01QBwHGMe3CduWFCmLZZ3pQ7), by the owner's answer C (decisions/questions/P-003-baseline-runner.md) and re-scope on stop card 16 (decisions/P-003/stop-16.md). Nothing in it has started. The approval is asked in questions/P-003-outside-build-plan.md.*

## What this means for you
The pipeline's attempt at the card fix failed: its spec failed review three times and the work was closed there, by your answer. Nothing has been built since. This is how I would build it outside the pipeline, the way the desk itself was first built, with two things added that the pipeline's attempt asked for. First, a frozen spec. Second, a record of how today's desk behaves, made before any code changes, so the fix can be checked against it. The pipeline failed partly because it had no way to pause the build while a separate reviewer runs today's code. A working session can pause it. The new spec fixes the other fault, an unclear rule about failed reads. Two of the pipeline's steps change, and you are told where below. Your criteria card also serves as the Build gate. The checks still get the Critic's review. It takes about three working sessions, not one, and asks you five times: this plan, the new spec's criteria, the pull request's review (it adds locked checks, which only you approve), the deploy, and launch. The merge can be reverted and the deploy rolled back. Two things cannot be undone: closing the pipeline's item, which is already done, and anything pushed to this public repository, which may already have been copied.

## The work
The fix is milestone M4 of the card fix's plan (docs/projects/P-003.md): a decision card waits off your queue until my notes for it are on the main branch, then shows with the notes' recommended word marked, and its notice is sent then. After a day without notes it shows marked "No Chief of Staff recommendation yet", and catches up when notes arrive. Gate cards, questions and pull-request cards stay as they are. The criteria are S-008's (AC1 to AC19, specs/S-008.md on the item/P-003 branch), carried over unchanged except where the fixes below need new words.

## How the build runs, with each step's writer
Every agent below is a subagent of the working session, with a written brief. The briefs carry S-008, its plan review and its triage verbatim from the item/P-003 branch, at its tip commit 23c31dd2, since none of them is on main. "The session" means this Chief of Staff's session. It commits as `orchestrator` only for the paths that are the orchestrator's (governance/SURFACES.md), as earlier Chief of Staff sessions have (docs/handoff/2026-11-13-chief-of-staff-p005-5.md). It commits as `chief-of-staff` for its own lane.

1. **Your approval, recorded.** The session, as `chief-of-staff`: your words in decisions/questions/P-003-outside-build-plan.md. The session, as `orchestrator`: a ledger ruling in docs/LEDGER.md under main's next free id (L-0051 today). The ruling says the card fix is built outside the pipeline from a new spec, S-009, and that S-007 and S-008 are superseded. It also records the departures listed under "Where this differs from the pipeline". L-0003 is the precedent, but this time the spec is frozen first.
2. **A reading of today's code.** The Reviewer, fresh, with a shell and no write tool, reads src/ at the base commit. It answers the questions S-008 could not, and returns its answers. Its questions:
   - How does the desk read queue/ and the dispatch log? Where would a failed read show up, for the desk and for the sender?
   - Does the desk re-read while it is open?
   - What is the card-file name form?
   - How does the log reader treat two entries for one card?
   - Which entry points could an adapter call?
   The session records the return verbatim in reviews/S-009/src-reading.md, as `orchestrator`. The Definer reads that record instead of src/ itself, so its pack does not change.
3. **The new spec, S-009.** The Definer writes it on `build/definer/S-009`, with commits carrying `Spec: S-009` and lineage to S-008. It fixes:
   - *Critic finding 1:* the spec's claim that the Reviewer may run code and commit under reviews/ was unsupported. The new spec has the Reviewer run the adapter and return its output; it never commits. The session records the output verbatim as the baseline record in reviews/S-009/baseline/record.json, with a note giving its SHA-256 in reviews/S-009/baseline/note.md. Recording reviewer returns is the orchestrator's lane. The Builder can never write reviews/, and the surface guard enforces that. The pause the pipeline lacked is the session's own: the Builder is dispatched twice, and the second time only after the record is on the branch.
   - *Critic finding 2:* at the base commit, a failed notes read changes nothing, because today's code reads no notes. Its baseline result is therefore the result of the run with no failure. Failed queue and log reads are made at the place step 2 found, in the form that read path already handles, and never inside the rule.
   - *Non-blocking findings:* the poison run replaces every file under src/, not only script files. AC4's "without a reload" is worded to match what step 2 found. The stop at 24 tests stays. Your approval of the criteria is asked on S-009's criteria card.
   - Then come the Critic's plan reviews, up to three rounds. A third failure comes back to you.
4. **Your criteria card, which also serves as the Build gate.** The session, as `orchestrator`, raises the card in queue/ with the join-up review and the open questions S-008 carried. Your answer goes in decisions/P-003/, in your words or by proxy only if the card allows one. Then the Definer sets S-009 to frozen, with its freeze commit, on its branch.
5. **Locked checks.** The Check author writes them on `build/check-author/S-009`, without seeing src/ or any builder return. It writes the baseline cases in J7's form and the locked checks, all under tests/acceptance/, before any work exists. The check reads the record and its note from reviews/S-009/baseline/ at paths fixed in the frozen spec. It checks the record's hash against the note, so no copy of the record is needed. The Critic then reviews the checks against the spec, as the pipeline's stage 4 would.
6. **The adapter.** In its first dispatch, the Builder writes tests/desk/baseline/adapter.mjs only, on `build/builder/p003-adapter`, with no change under src/. The surface guard runs on its range.
7. **The baseline record.** The Reviewer confirms that the adapter takes every field from src/. It then runs the adapter once on every case, in a copy of the base commit unpacked to a scratch folder outside the repository, and returns the output. The session records the output as step 3 describes. If the Reviewer cannot confirm the adapter, there is no record, and the build stops and comes back to you.
8. **The fix.** In its second dispatch, starting from the record's commit, the Builder works on `build/builder/p003-card-fix`. It changes:
   - the rule in src/lib/;
   - the card sheet, Home, the queue and the board, and their served copies in src/public/lib/;
   - what the sender is handed, with no change to src/notify/**;
   - its own tests in tests/desk/;
   - the operating notes under docs/handover/.
   Restated size: about 90 to 130 lines of code and 15 to 23 tests, plus the adapter.
9. **Acceptance.** Before acceptance, the session runs:
   - the surface guard on each builder range;
   - the full suite;
   - the governance checks.
   Two reviewers judge the work, each in a fresh session that wrote nothing it judges:
   - the Reviewer;
   - the design reviewer, because the change reaches src/public/**.
   The session records their verdicts verbatim as `orchestrator` in reviews/<PR>/reviewer.md and reviews/<PR>/design-reviewer.md. Your review is required too, in reviews/<PR>/owner.md, because tests/acceptance/** is R3 (governance/risk-paths.toml). So is any change to the three shared files the sender runs, if the build needs one.
10. **One pull request, merged by you with a merge commit** (no squash). The builder branches stay local and are merged into the session's push branch with `--no-ff`, so each commit keeps its author.
11. **Deploy, on your approval** (L-0004): preview first, then live. Rollback means redeploying the previous deployment, then reverting the merge.
12. **Launch records.** Your launch answer comes first. Then come the records:
   - the session marks M4 done in docs/projects/P-003.md, as `chief-of-staff`;
   - the ledger entry and the improvement-register row go in the same pull request, as `orchestrator` (AGENTS.md §4);
   - the operating notes are already in the Builder's handover (step 8).

## Where this differs from the pipeline
- **The pipeline's Orchestrator script is replaced** by the Chief of Staff's session, which dispatches the steps and commits the orchestrator's records, as for the desk itself (L-0003).
- **The Build gate is your S-009 criteria card** (step 4), not a separate card.
- Every other step is the pipeline's: the plan review, the locked checks and their review, the build, the reviews and your merge. No role card or pack changes. Step 2 gives the Definer what it needs without src/. Step 5 needs no copy made by the Check author.

## The history that proves the order
The merged branch shows, in order and checkable by anyone with `git log`:
1. the frozen spec;
2. the locked checks and cases;
3. the adapter commit, with no src/ change;
4. the baseline record commit, naming the base commit and the hashes of the adapter and cases;
5. only then, the first commit that changes src/.

No locked check reads history, since a locked check cannot rely on git history being there (LL-049 in the operating model's LESSONS). The Reviewer checks the order at the build's review instead, and its verdict records it.

## Stop rules
- **Plan review:** a third failed round comes back to you.
- **Build:** any of the following stops the build and comes back to you, before any further change:
  - a third failed build round;
  - about 180 lines or 24 tests;
  - any change needed to src/notify/**;
  - an adapter that cannot run at the base commit, or that cannot run unchanged on the built code.

## Size and sessions
- **Session 1:** steps 1 to 4: the record of your approval, the reading of today's code, the spec and its plan review, then your criteria card.
- **Session 2:** steps 5 to 8: the checks and their review, the adapter, the record, and the fix.
- **Session 3:** steps 9 and 10, then the deploy and the launch records.

Each session ends with a handoff before its context fills. A long review round can add a session.

## What this plan does not do
- It does not reopen P-003 in the pipeline.
- It does not change the loop, the sender (src/notify/**), the role cards or the operating model.
- It does not answer S-008's open questions 1 to 7. They carry over to S-009 as yours, and none is needed before freeze.
