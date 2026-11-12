# P-003 failure-15 — the Chief of Staff's notes

*Chief of Staff, 2026-11-12 (session_01QBwHGJ3hswptz72UnDUYou). Advice for the owner's decision on queue/P-003-failure-15.md; not a decision. The card came at 05:20Z (dispatch log) and was committed to main at 05:31Z.*

**Recommendation: `re-specify`, the word your recommended option A gives on a failure card. It counts as a strike.** You have not yet answered the question on which way to go (questions/P-003-baseline-proof.md), and its default, A, does not fall due until about 03:40Z on 14 November. So answer the question first, or answer it in the same breath as this card. If you choose B, C or D instead, see "The choices". Nothing here is irreversible, and waiting on this card costs nothing: no run starts on P-003 until it is answered. If you choose A, the record's lines are:
```
Decision: re-specify

Fix the baseline run only: the old behaviour is recorded from the unchanged code before the build, by a run the Builder cannot change, and kept with the locked tests; drop the git-history provenance test. Since the Check author may not see src/, the new spec says who runs the Builder's adapter against the unchanged code and how the record is guarded. Carry everything else from S-007 unchanged, and list every changed line.
```

## A correction to option A's wording
Option A in the question says "the Check author records the old behaviour from the unchanged code". The Check author may not do that as worded: its charter forbids it to see the desk's code (.claude/agents/check-author.md, "Must not see"), and S-007's recorder runs the old behaviour through a test adapter the Builder writes (tests/acceptance/S-007/record-baseline.mjs and README.md on build/check-author/S-007, which load tests/desk/s007-seam.mjs). The instruction above keeps A's direction, a record made before the build that the Builder cannot change, and leaves who runs it, and how it is guarded, to the new spec. This was found in handoff part 34 (docs/handoff/2026-11-12-chief-of-staff-p002-34.md, "Done", on PR #365).

## What happened (dispatch-log/2026-11.jsonl and status/outcomes.jsonl on main)
- The pipeline's timer started no run from 03:01Z to 04:51Z. A merge to main at 04:51Z started one, which applied the second round's error at 04:55Z (attempts 1) and sent the work back to the Builder.
- The third Builder session ran from 05:00:55Z: 51 turns against a limit of 50, about $3.24 by its own estimate, ending `error` (GitHub Actions run 43158483853). This time it wrote one file, the test adapter tests/desk/s007-seam.mjs (23,515 bytes, artifact collected-0), but no baseline, no change under src/ and no report. Because the session ended in an error, nothing of it was pushed: item/P-003 holds only the run's control record (commit a8ad3f91).
- Two attempts in a row without a return raise a failure card (route `attempts`, governance/ROUTING.toml), so card 15 came at 05:20Z. Sessions this stage: 4 of 12.

## Why `re-specify`
The fault is still the one the question describes: S-007 proves its baseline from git history that the Builder's folder and the check run's copy do not have (questions/P-003-baseline-proof.md, Context). No retry or rebuild changes that, and the last two sessions both ran out of turns. A failure card does not offer `criteria-wrong`, the no-strike word a stop card would give for the same fix, so `re-specify` is the only word here that fixes the spec. It is logged as a strike: the second on this work, after stop card 5 (dispatch log, `"strike":true` on decisions/P-003/stop-5.md). It sends the work to the Definer with the rounds reset; the new spec then needs its plan review, a criteria card for you, freezing and new locked tests before the Builder runs again.

## The choices
- **`re-specify` (recommended; option A).** As above.
- **`retry` or `rebuild` (option D).** Back to the Builder. Most likely another error or an empty build at about $3 a session, then another card. The one thing that would get you a stop card, and so `criteria-wrong` without a strike, is this path: the Builder returns, the Reviewer fails it to round 3, Triage, then a stop card. That is two or more paid sessions that cannot pass, to save one strike. I do not recommend it.
- **Option B (change the pipeline) or C (build outside it).** Neither is a word on this card. Leave the card waiting, which costs nothing, and answer it once that work is done: `retry` after B, or as C's plan says.
- **`drop`.** Ends the card fix. Nothing points that way.

## The pipeline
Nothing is stalled that matters now. Every open item waits on you: P-003 on this card, P-004 on its readiness card (the widget session's) and Q-026 on its stop card (the timeline session's). The timer is still sparse: its scheduled runs today came at 02:41Z and 10:39Z, though it is set for every 30 minutes (LL-045). Once you answer this card, the merge of the answer starts a run itself, so no manual start should be needed; if none starts within the hour, a manual start is your call.

## If you choose A
At the new spec's plan review I will check that the baseline run is settled without the Check author seeing the code, and that the nineteen criteria fit the Builder's 50 turns or the spec says why not.
