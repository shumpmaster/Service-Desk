# Chief of Staff's notes — P-003 stop-16 (the card fix's new spec failed its plan review three times)

The card fix's new spec failed its plan review a third time and went to Triage, so this stop card waits on you. The second and third reviews failed it for the same reason: it needs someone other than the Builder to run today's code and keep the record, and no role in the pipeline has that job. Triage judges this a fault in the spec that a fourth rewrite could fix, and says you are needed only if no existing role can do the job. I disagree: every way it names still needs a role to run code and save the record partway through the build, and the pipeline has no such role or pause. So I recommend closing the card fix's item in the pipeline and building the fix in a working session outside it, as you did for the desk itself (decisions/P-001/stop-6.md; docs/LEDGER.md L-0007), with a separate reviewer and the normal merge. That is option C of your open question on who runs today's code (questions/P-003-baseline-runner.md), and I suggest you answer that question first. Closing the item cannot be undone: the item can never merge, so the new spec, its reviews and its ledger line stay on the item's branch, and the outside build must carry what it needs from them. If you choose option A or B instead, answer this card only after that change has landed. Until you answer, nothing moves, and waiting never counts as stalled.

**The word for C:** `re-scope`. When the time comes, the record's line is:
```
Decision: re-scope
```

## What happened (dispatch-log/2026-11.jsonl on main; status/P-003.toml)
- The Definer was dispatched to write S-008 at 16:31Z, after failure card 15's `re-specify` (the second strike), and returned at 16:40:21Z. The Critic failed its plan review at 16:54Z and 17:30Z. The second review says the spec "does not say who makes the baseline record" (quoted in questions/P-003-baseline-runner.md, Context); only the third review is now kept in reviews/S-008/plan.md.
- The Definer's third round (17:37Z to 17:46Z) named the Reviewer: it would read the Builder's adapter against today's code, run it, and commit the output under `reviews/S-008/baseline/`, with the Check author committing a copy beside the locked checks. It also added a "poison run" that fails any adapter giving results without the desk's code (docs/reports/P-003-definer.md on item/P-003).
- The Critic's third review failed it at 17:53:44Z (reviews/S-008/plan.md on item/P-003). Finding 1: the claim that the Reviewer may run code and commit under `reviews/` "is unsupported"; the cited project-plan lines only name review files, and a line between them says the Orchestrator records reviews. Finding 2: the spec does not say what a failed notes read means on today's code, which never reads notes, or how failed queue and log reads are made. Four findings were non-blocking.
- Triage returned at 18:11:34Z (triage/P-003.md on item/P-003): "a Define-stage (stage 3) fault", whose root cause is that the Definer "wrote a mechanism that needs a role to execute code and commit under `reviews/`", a lane that "doesn't exist"; criteria, build and checks are not the cause. It asks the Orchestrator to "Route this back to the Definer for plan round 4, with findings 1 and 2 as the required fixes", and says the owner is "needed only if no existing lane can execute and commit the baseline record". Triage worked from a partial pack: it did not open the spec, the project plan or the role cards. This card came at the same time.

## Why I disagree with Triage: no existing lane can do it, so a fourth round would not help
- Reviewer-class roles never commit, and the Orchestrator records their returns verbatim; the locked checks' paths belong to the Check author alone (governance/SURFACES.md).
- The pipeline has no pause between "the Builder commits the adapter" and "the Builder changes the code": after a Builder session the checks run first, and the Reviewer comes only after they pass (governance/ROUTING.toml, build-to-checks and checks-run-pass).
- Triage's alternative, also offered by the Critic, is that the Orchestrator records what the Reviewer produces. It meets the same missing pause, and the Reviewer would still have to run code during the build.

## The choices on this card
- **`re-scope` (recommended, for option C).** Closes the item. Refused by proxy, so it is yours. The outside build then needs a frozen spec of its own: a new one made from S-008 with the Critic's two blocking findings fixed, which supersedes S-008. It also needs today's code run and recorded before any change, a separate reviewer, the surface guard, and a merge without squash.
- **`re-specify` (for options A or B, after that change lands).** A new spec, back to the Definer, rounds reset, and a third strike. Sent now, before any change, it would very likely fail on the same finding again.
- **`criteria-wrong`.** Also a new spec with rounds reset, and not a strike (governance/ROUTING.toml, `[gates.stop]`), but it records that the criteria were wrong, and Triage found nothing wrong with them, so it would misrecord the cause. I do not recommend it.
- **`confirm`.** One more focused check of the same spec by the Critic, in a fresh session; it would fail on finding 1 again.
- **`drop`.** No grounds: the fix is still wanted.

## Not answered by proxy, and one mismatch
`re-scope` and `drop` are refused by proxy (governance/ROUTING.toml, `[proxy]`). The other words could be proxied, but each leads somewhere only after your open question is answered, and the standing grant for proxy answers covers the timeline work, not this item (docs/LEDGER.md L-0049). That question is marked reversible and defaults to C after 48 hours, but C leads to `re-scope`, which cannot be undone. So its default is only that these notes recommend `re-scope`; I will not answer this card for you, and nothing is built outside the pipeline until you answer.

## One thing to fix either way
The item's branch recorded S-007 superseded as L-0050, and main's L-0050 is now the source rule on vendor pages (docs/LEDGER.md on main, the entry filed for #390). If the item is ever merged, that id clashes; if it is closed, the outside build records S-007 and S-008 superseded under main's next free id.
