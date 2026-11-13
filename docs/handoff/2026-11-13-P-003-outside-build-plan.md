# The card fix's outside build — the plan, for the owner's approval (13 November 2026)

*Written by the Chief of Staff (session_01QBwHGMe3CduWFCmLZZ3pQ7), by the owner's answer C (decisions/questions/P-003-baseline-runner.md) and re-scope on stop card 16 (decisions/P-003/stop-16.md). Nothing in it has started. The approval is asked in questions/P-003-outside-build-plan.md.*

## What this means for you
The pipeline's attempt at the card fix failed. Its spec failed review three times, and you closed the work there. Nothing has been built since. This plan builds the fix outside the pipeline, the way the desk itself was first built. It adds two things the pipeline's attempt asked for: a frozen spec, and a record of how today's desk behaves, made before any code changes, so the fix can be checked against it.

The review's first fault was that no one named in the spec was allowed to run today's code and keep the record. In a working session, a reviewer runs the code and my session keeps the record, between two separate builder steps. The new spec fixes the other fault, an unclear rule about failed reads.

To make this work, five roles get records or duties their usual setup does not give them: the Reviewer, the Definer, the Critic, the Builder and my own session. Each is listed below, and your approval records them. It takes about three working sessions. After this one you are asked six more times, listed below, and you also merge two records pull requests.

The merge can be reverted and each deploy rolled back. Two things cannot be undone: closing the pipeline's item, which is already done, and anything pushed to this public repository, which may already have been copied.

The six asks after this one:
- the new spec's criteria, which also serve as the Build gate;
- the build's pull request, which you review and merge, because it adds locked checks, which only you approve;
- the preview deploy;
- accepting the fix on the preview;
- the Launch gate;
- the live deploy.

## The work
The fix is milestone M4 of the card fix's plan (docs/projects/P-003.md). A decision card waits off your queue until my notes for it are on the main branch. It then shows with the notes' recommended word marked, and its notice is sent then. After a day without notes it shows marked "No Chief of Staff recommendation yet", and catches up when notes arrive. Gate cards, questions and pull-request cards stay as they are. The criteria are S-008's (AC1 to AC19, specs/S-008.md on the item/P-003 branch at its tip, 23c31dd2). They are carried over unchanged except where the fixes below need new words. The item/P-003 branch is kept until launch, so that S-009's lineage to S-008 resolves.

## How the build runs, with each step's writer
Every agent below is a fresh subagent of the working session. Its brief lists exactly which records it gets. Any role whose must-not-see paths would be in an ordinary checkout works in a sparse checkout that holds only its brief's paths. The Chief of Staff's notes files go to no agent.

"The session" means this Chief of Staff's session. Its commits are signed `chief-of-staff` in that role's own lane, and `orchestrator` for the orchestrator's paths; the second is a departure. Builder branches stay local, and the session merges them into its push branch with `--no-ff`; that is also a departure. The push branch then holds every step's commits in order.

1. **Your approval, recorded.** The session, as `chief-of-staff`, records your words in decisions/questions/P-003-outside-build-plan.md, with a `Proxy:` line if you answer in the session, and deletes the question file. The session, as `orchestrator`, adds a ledger ruling to docs/LEDGER.md under main's next free id (L-0051 today). The ruling says:
   - the card fix is built outside the pipeline from a new spec, S-009;
   - S-007 and S-008 are superseded;
   - each departure listed below is allowed for this build only.

   This is pull request 1. It holds a ledger entry, so the automatic merge cannot take it, and you merge it.
2. **A reading of today's code.** A Reviewer gets only src/ and tests/ at the base commit, plus a list of questions taken from S-008's known limits. It answers them and returns its answers:
   - How do the desk and the sender read queue/ and the dispatch log, and what form does a failed read take there?
   - Does the desk re-read while it is open?
   - What is the card-file name form?
   - How does the log reader treat two entries for one card?
   - Which entry points could an adapter call?

   The session records the return verbatim in reviews/S-009/src-reading.md. **Stop:** if no failed-read form exists that today's read path already handles, the build stops here and comes back to you.
3. **The new spec, S-009.** The Definer writes it on `build/definer/S-009`, with commits carrying `Spec: S-009`. Its lineage names S-008 at 23c31dd2. Its brief adds three records: S-008, S-008's plan review (reviews/S-008/plan.md) and the reading from step 2. Triage and docs/reports/** go to no one. The spec fixes:
   - *Critic finding 1.* The old spec's claim that the Reviewer may run code and commit under reviews/ was unsupported, and the desk's first plan says the Orchestrator records reviews. The new spec has the Reviewer run the adapter, which is test code, under its card's "Run checks and tests". The Reviewer returns the output and never commits or writes a file. The session records the output verbatim, committing as `orchestrator`, in reviews/S-009/baseline/record.json, with its SHA-256 in reviews/S-009/baseline/note.md. The Builder's lane holds no reviews/ path, and the surface guard enforces that. The session's pause is between the Builder's two dispatches, and the second comes only after the record is committed.
   - *Critic finding 2.* At the base commit a failed notes read changes nothing, because today's code reads no notes, so its baseline result is the result of the run with no failure. Failed queue and log reads are made at the place step 2 found, in the form that read path already handles, and never inside the rule.
   - *The non-blocking findings.* The poison run replaces every file under src/, not only script files. AC4's "without a reload" is worded to match step 2. The stop at 24 tests stays, and the adapter counts toward the stop at about 180 lines. Your approval of the criteria is asked in step 4.

   Then come the Critic's plan reviews, up to three rounds. The Critic's brief adds the same three records. A third failure comes back to you.
4. **Your criteria, which also serve as the Build gate.** The session, as `chief-of-staff`, files the ask as a question, questions/P-003-S-009-criteria.md, in a pull request of its own that the automatic merge can take. It is not a card in queue/, because the loop has closed P-003 and must not pick it up. The question holds:
   - S-009's criteria;
   - its join-up review;
   - Build's and Launch's standard lines for you to rule (P-003's plan, section 3).

   There is no separate Build gate case and no gate Critic. Your answer is recorded in decisions/questions/ once the question is on main. The Definer then sets S-009 to frozen on its branch.
5. **Locked checks.** The Check author writes the baseline cases in J7's form and the locked checks, all under tests/acceptance/, on `build/check-author/S-009`. Its sparse checkout holds only specs/S-009.md, tests/acceptance/** and checks/**, before any work exists. It never gets src/, the step-2 reading, docs/handover/** or any builder return. The checks read the record and its note at paths the frozen spec fixes. Matching hashes show only that the two files agree; the protection against a changed record is the history (below). The Critic then reviews the checks against the spec, for up to three rounds (a third failure comes back to you). The session records each verdict in reviews/S-009/_critic-checks.md.
6. **The adapter.** In its first dispatch, the Builder writes only tests/desk/baseline/adapter.mjs, on `build/builder/p003-adapter`, with no change under src/. It hands back without a passing check record, because the locked checks cannot pass before the record exists. That is a departure. The surface guard runs on its range, and the session merges the branch.
7. **The baseline record.** The session unpacks the base commit (`git archive`) into a scratch folder outside the repository, with the adapter and cases added. The Reviewer then reads the adapter against src/ and confirms that every field comes from src/. If it confirms, it runs the adapter once on every case there and returns the output. The session records it as step 3 says, on the push branch. If the Reviewer cannot confirm, there is no record, and the build stops and comes back to you.
8. **The fix.** In its second dispatch, the Builder works on `build/builder/p003-card-fix`, starting from the record's commit. It changes:
   - the rule in src/lib/;
   - the card sheet, Home, the queue and the board, and their served copies in src/public/lib/;
   - what the sender is handed, with no change to src/notify/**;
   - its own tests in tests/desk/;
   - the operating notes in docs/handover/P-003/.

   The restated size is about 90 to 130 lines of code and 15 to 23 tests.
9. **Acceptance.** The session runs the surface guard on the whole range of the build's pull request, then the full suite and the governance checks. The reviews follow, each in a fresh session:
   - The Reviewer reviews at stage 5. Its brief adds the record, its note and the push branch's history, so it can check the order. The brief also says the record was made by an earlier Reviewer session.
   - The design reviewer reviews, because the change reaches src/public/**.

   The session records their verdicts verbatim in reviews/<PR>/reviewer.md and reviews/<PR>/design-reviewer.md. Your review goes in reviews/<PR>/owner.md. It is required because tests/acceptance/** is R3, and because any change to src/lib/jobcand.js, ledgergrant.js or j22.js is R3 (governance/risk-paths.toml).
10. **The build's pull request**, merged by you with a merge commit, never squashed.
11. **The preview deploy**, on your approval (the preview environment, L-0004).
12. **Your acceptance of the fix on the preview.** M4 is reached on the preview (P-003's plan, section 6). On your ruling, the session, as `chief-of-staff`, adds ` · sprints: PR #<n>` and ` · reached: <date>` to M4 in docs/projects/P-003.md. The commit's `Owner-Ruling:` trailer names your acceptance record.
13. **Before the Launch gate:**
   - The Reviewer's stage-6 review of the handover package (Launch-3) is recorded in reviews/S-009/launch-reviewer.md.
   - The session runs the past-records V6 count once (Launch-4).
   - The session sets out who does what once the fix is live (Launch-2), in the handover package's operating notes, by the Builder, and in the gate case.
14. **The Launch gate**, filed as a question with its gate case, by the session as `chief-of-staff`, read cold by the Critic first. Your answer rules going live (Launch-1).
15. **The live deploy**, on your approval (the production environment, L-0004). Rollback means redeploying the previous deployment, then reverting the merge.
16. **The launch records**, in pull request 3, which you merge:
   - the ledger entry and the improvement-register row in docs/IMPROVEMENT_REGISTER.md, both by the session as `orchestrator`;
   - Launch-5's lessons for the operating model, filed by the session in Personal-Org-Operating-Model's lessons file in a pull request there.

## Where this differs from the pipeline (recorded in L-0051)
- **The session.** It commits as `orchestrator` for the ledger, the improvement register and every record under reviews/. SURFACES.md reserves that identity for the Orchestrator script, and earlier Chief of Staff sessions used it only for handoff files (docs/handoff/2026-11-13-chief-of-staff-p005-5.md). The session also merges builder branches into its push branch. AGENTS.md makes the Orchestrator the sole merger, so the session's merges are a departure too; the merges to main stay yours.
- **The Reviewer.**
  - Step 2: it reads src/ to inform a spec. That is not on its card, whose trigger is finished work. Its return goes to the Definer and the Critic only.
  - Step 7: it runs the adapter at the base commit before any build, again outside its card's trigger. It writes no file.
  - Step 9: its brief adds the record, its note and git history, beyond its pack's reviews/{spec}/checks.txt, and it checks commit order, which is not on its card.
- **The Definer.** It is dispatched on this plan's approval, which is not one of its card's triggers (a move into Design, a sub-project, a "criteria were wrong" ruling). Its brief adds the step-2 reading and S-008's plan review, taken from a branch that is not main.
- **The Critic.** For the plan review, its brief adds the step-2 reading and S-008's plan review; its pack holds no reviews/ path. Its must-not-see list (docs/reports/**, docs/briefs/**) is kept.
- **The Builder.** Its first dispatch hands back with no passing check record (step 6).
- **The gates.** The Build gate is your criteria question (step 4), with no gate case or gate Critic. The Launch gate is a question (step 14). Neither is a card in queue/.

Nothing else changes:
- The Check author's pack and duties.
- Every must-not-see list, kept by sparse checkouts and briefs.
- The surface guard, the required reviews, your merges and the stop rules.

## The history that proves the order
The push branch shows, in order and checkable by anyone with `git log`:
1. the frozen spec;
2. the locked checks and cases;
3. the adapter commit, with no src/ change;
4. the baseline record commit, naming the base commit and the hashes of the adapter and the cases;
5. only then, the first commit that changes src/.

No locked check reads history, because the check run's copy may not hold it (LL-049, in the operating model's docs/LESSONS.md). The Reviewer checks the order in step 9, and its verdict records it.

## Stop rules
Each of these stops the build and brings it back to you, before any further change:
- **Plan review, and the checks' review:** a third failed round.
- **Step 2:** no failed-read form exists that today's read path already handles.
- **Build:**
  - three failed build rounds;
  - about 180 lines, adapter included, or 24 tests;
  - any change needed to src/notify/**;
  - an adapter that cannot run at the base commit, or that cannot run unchanged on the built code;
  - a Reviewer that cannot confirm the adapter.

## Size and sessions
- **Session 1:** steps 1 to 4: your approval recorded, the reading of today's code, the spec and its plan review, then your criteria question.
- **Session 2:** steps 5 to 9: the checks and their review, the adapter, the record, the fix and its reviews.
- **Session 3:** steps 10 to 16: the build's pull request through the launch.

Each session ends with a handoff before its context fills. A long review round, or a wait on you, can add a session.

## What this plan does not do
- It does not reopen P-003 in the pipeline.
- It does not change the loop, the sender (src/notify/**), the role cards, the packs or the operating model.
- It does not answer S-008's open questions 1 to 7. They carry over to S-009 as yours, and none is needed before freeze.
