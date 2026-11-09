# Chief of Staff's notes — P-003 stop-11 (the stop rule, Build: the locked checks)

**Recommendation: `checks-wrong`.** The tests failed three Critic reviews, but only the first round was a real attempt. Rounds two and three were empty, because the Check author's pack left out the tests it was sent back to revise. That fault is fixed now (L-0039, #343). This word is the only one that gives the Check author fresh rounds with the fix in place. It names the right cause, and it counts no strike. The record's lines would be:
```
Decision: checks-wrong

The criteria are not wrong. Carry S-005 forward unchanged in the new spec, with only its id, its supersedes line and anything the plan review requires. Do not grow it. The checks failed because the Check author's revision rounds never saw the tests (L-0039).
```
The second paragraph is optional, in your own words. It matters here, because the Definer reads your record and nothing else from this stop.

## What happened (dispatch-log/2026-11.jsonl; reviews/S-005/_critic-checks.md, docs/reports/P-003-check-author.md and triage/P-003.md on item/P-003)
- **Round 1, 14:16Z:** the Critic failed the Check author's tests with four findings, for example that nothing tied the baseline commit to main.
- **Round 2:** you restarted the pipeline at 15:00Z. The Check author was sent back, but its folder held no tests or checks. It changed nothing and listed the fixes it would make.
- **15:08Z to 15:16Z:** run 848 counted the empty round, and run 849 sent the unchanged tests back to the Critic.
- **15:20Z:** the Critic failed them again (round 2). The Check author was sent back a third time and was again empty.
- **15:29Z:** the Critic was dispatched a third time. Its verdict arrived only at 18:30Z: the chain cap stopped the pipeline at 15:32Z, and merging #343 at 18:26Z started it again.
- **18:30Z to 18:43Z:** the third FAIL (plan round 3) sent the item to Triage at 18:37Z, and this card came to you at 18:43Z.
- **The fix came too late for this stop.** It was on main from 18:26Z, but no Check author round ran after that.

## What Triage says, and what it missed
- **Triage puts the cause at stage 4, in the Check author's work, and not in the spec or its criteria.** The plan review of S-005 passed. The Critic's third read found a run command that would also run the helper scripts, and a monitor check that is never compared with the rule. It also found loose "recommends" checks, and a duplicates rule that leans on the Builder's own declaration. The rest are smaller gaps.
- **Triage was misinformed on two points.**
  - It calls this "the first failed checks round, so the stop rule is not reached". The card says plan round 3, and the dispatch log shows three Critic FAILs.
  - It never learned that rounds two and three were empty. Its pack held neither the tests nor the Check author's reports.
  - The second point makes its conclusion stronger, not weaker: the Check author only ever made one attempt.
- **Its open question 2, whether locked checks can be revised in place:** within the three rounds they could be, since route checks-fail sends them back to revise. After the stop, a check is only superseded with its spec. That is what `checks-wrong` does.

## What `checks-wrong` costs
- **The path:** the Definer writes a new spec, S-006, that supersedes S-005. The Critic reviews it, and a criteria card comes to you to approve. The Definer then freezes it, and the Check author writes the checks with up to three fresh Critic rounds. Only then does the Builder start.
- **Your part:** one more card, the criteria card.
- **The Definer's part:** one more Definer pass and one plan review, each of which could find something new in a carried-forward spec.
- **What the new Check author gets:** the old S-005 tests, now that its pack includes them. It will not get the Critic's S-005 findings, because the pack carries only the current spec's review. The Critic's first S-006 review will find the same gaps again if they remain. With the fix, the Check author can then act on them.

## Why not the others
- **Not `confirm`.** It sends the same unchanged tests to the Critic at round 2. One more FAIL makes round 3, which goes back to Triage, and `confirm` is offered only once. It cannot pass.
- **Not `criteria-wrong`.** It works the same way, but records the cause as wrong criteria, which nothing here shows.
- **Not `re-specify`.** It counts a strike against the Definer, whose spec passed its review.
- **Not `re-scope` or `drop`.** At stop 7 I said a fourth stop should mean narrowing the work. This is the fourth stop on P-003, but not of the same kind. Stops 5 to 7 were the spec failing its review. This one is the pipeline not letting the Check author do its job. The spec and the design still stand.

## The risk to weigh
- **A carried-forward spec still goes through a plan review.** If the Critic finds something new in it, the rounds there can stop as well. Your note above asks the Definer to change nothing it doesn't have to.
- **The pipeline itself stalled twice this afternoon, at 14:30Z and 15:32Z.** Each time, a run at the chain cap of 5 started no follow-up, and the 30-minute schedule did not fire behind it. Expect to start it by hand again during the next stretch. The Orchestrator owns this, and it is not mine to change.

Nothing here is irreversible.
