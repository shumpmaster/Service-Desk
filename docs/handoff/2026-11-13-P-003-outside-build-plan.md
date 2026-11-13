# The card fix's outside build — the plan, for the owner's approval (13 November 2026)

*Written by the Chief of Staff (session_01QBwHGMe3CduWFCmLZZ3pQ7), by the owner's answer C (decisions/questions/P-003-baseline-runner.md) and re-scope on stop card 16 (decisions/P-003/stop-16.md). Nothing in it has started. The approval is asked in questions/P-003-outside-build-plan.md.*

## What this means for you
Nothing has failed and nothing has been built. This is how I would build the card fix outside the pipeline: the fix that makes every decision card show my recommendation, or say it has none, before you answer it. It follows the way the desk itself was first built, with two things added that the pipeline's attempt asked for: a frozen spec, and a record of how today's desk behaves, made and kept before any code changes, so the fix can be checked against it. The two faults that stopped the pipeline are fixed by the outside build itself: a working session can pause the build while a separate reviewer runs today's code, and I record its result word for word, which the pipeline had no role or pause for. It takes about three working sessions. You are asked five times: to approve this plan, to approve the new spec's criteria, to review the pull request (it adds locked checks, which only you approve), to approve the deploy, and at launch. The merge can be reverted and the deploy rolled back; closing the pipeline's item, already done, is the only step that cannot be undone.

## The work
The fix is milestone M4 of the card fix's plan (docs/projects/P-003.md): a decision card waits off your queue until my notes for it are on the main branch, then shows with the notes' recommended word marked; after a day without notes it shows marked "No Chief of Staff recommendation yet". The criteria are S-008's nineteen (AC1 to AC19, specs/S-008.md on the item/P-003 branch), carried unchanged except where the Critic's findings below need words changed.

## How the build runs (in order)
1. **Your approval of this plan**, recorded word for word, with a ledger ruling under main's next free id (L-0051 today): the card fix is built outside the pipeline from a new spec, S-009, and S-007 and S-008 are superseded (they exist only on item/P-003, so their own ids never clash with main's). Like L-0003 for the desk, but the spec is frozen first.
2. **The new spec, S-009** (the Definer, on `build/definer/S-009`, commits `Spec: S-009`). Made from S-008, with lineage to it. Unlike the pipeline's Definer, this one reads src/ at the base commit, so the spec can state what today's code does instead of guessing. Fixes:
   - *Critic finding 1, who runs today's code and keeps the record:* the build's Reviewer (a fresh subagent with a shell and no write tools) reads the adapter against the base commit's src/, runs it once on every case in a clean checkout of the base commit, and returns the output. I, committing as the orchestrator, record that return verbatim under reviews/S-009/baseline/, with its SHA-256; recording reviewer returns verbatim is the orchestrator's lane (governance/SURFACES.md, reviews/**). The pause between "adapter committed" and "code changed" is the session's own: the Builder is dispatched twice, and the second dispatch happens only after the record is on the branch.
   - *Critic finding 2, failed reads on today's code:* the spec says that at the base commit a `notes` failure changes nothing (today's code reads no notes), so its baseline result is the no-failure run's; and that `queue` and `log` failures are made at the transport the read path already uses (the desk's fetch of that path, the sender's read of the checkout), failing in the form that read path already handles, never inside the rule. The Definer names the exact place from src/; the Reviewer confirms it.
   - *Non-blocking findings:* the poison run replaces every file under src/, not only script files (finding 5); whether the desk re-reads while open (AC4's "without a reload") is checked in src/ and AC4 worded to match (finding 4); the stop at 24 tests stays (finding 6); your approval of the criteria is asked on S-009's own criteria card (finding 3).
   - *Known limits closed by reading src/:* the tests folder (tests/desk/ exists), the card-file name form, how the log reader treats two entries for one card, and the operating notes' file.
   - Then the Critic's plan review, up to three rounds. Third failure → back to you.
3. **Your criteria card for S-009**, then the spec is frozen (status, freeze commit) before anything is built.
4. **Locked checks** (the Check author, on `build/check-author/S-009`, without seeing src/): the baseline cases in J7's form, and the locked checks under tests/acceptance/. Before any work exists.
5. **The adapter** (the Builder's first dispatch, on `build/builder/p003-adapter`): tests/desk/baseline/adapter.mjs only, no change under src/. Surface guard on the range.
6. **The baseline record**: the Reviewer's run, recorded by me (step 2's fix); then the Check author commits a byte-for-byte copy beside the locked checks. If the Reviewer cannot confirm the adapter takes every field from src/, there is no record and the build stops and comes back to you.
7. **The fix** (the Builder's second dispatch, on `build/builder/p003-card-fix`, from the record's commit): the rule in src/lib/, the card sheet, Home, the queue and the board, their served copies in src/public/lib/, the Builder's tests in tests/desk/, and the operating notes under docs/handover/. Restated size: about 90 to 130 lines of code and 15 to 23 tests, plus the adapter.
8. **Acceptance**: the surface guard on each builder range, the full suite and the governance checks, then the Reviewer (a fresh session that wrote nothing it judges) and the design reviewer, since the change reaches src/public/**. Their verdicts go word for word into reviews/<PR>/. Your review is required too: tests/acceptance/** is R3 (governance/risk-paths.toml), and so is any change to the three shared files the sender runs, if the build needs one.
9. **One pull request, merged by you with a merge commit** (no squash). The builder branches stay local and are merged into the session's push branch with `--no-ff`, so each commit keeps its author.
10. **Deploy, on your approval** (L-0004): preview first, then live; rollback is the previous deployment, then a revert of the merge.

## The history that proves the order
On the merged branch, in this order and checkable by anyone with `git log`: the frozen spec; the locked checks and cases; the adapter commit (no src/ change); the baseline record commit, naming the base commit and the adapter's and cases' hashes; the Check author's copy; and only then the first commit that changes src/. No locked check reads history (LL-049, operating model); the Reviewer checks the order at the build's review, and its verdict records it.

## Stop rules
- Plan review: a third failed round comes back to you.
- Build: three build rounds; about 180 lines or 24 tests; any change needed to src/notify/**; or an adapter that cannot run at the base commit, or unchanged on the built code. Each stops the build and comes back to you, before any further change.

## Size and sessions
- Session 1: steps 1 to 3 (the spec and its plan review), then your criteria card.
- Session 2: steps 4 to 7 (checks, adapter, record, the fix).
- Session 3: step 8 and the pull request; then deploy and the launch records (M4's close, the operating notes, the improvement row).
A session ends with a handoff before its context fills; a long review round can add a session.

## What this plan does not do
It does not reopen P-003 in the pipeline, change the loop, the sender (src/notify/**) or the operating model, or answer the S-008 open questions 1 to 7, which carry to S-009 as yours, none needed before freeze.
