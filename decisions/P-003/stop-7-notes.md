# Chief of Staff's notes — P-003 stop-7 (the stop rule, Design)

**Recommendation: `criteria-wrong`.** As at stop 6: the Definer writes a new spec that supersedes S-004, its review rounds start again from one, and no strike is counted (`re-specify` would count one). Triage puts two of the three blocking findings on what the Definer and the Critic were given to read, not on the Definer, so a strike would be unfair. The record's lines would be:
```
Decision: criteria-wrong

Keep the plan's narrow reading: a card shows at once only when its raise time is older than the log the desk reads. A new card's log entry lands with its card file, so drop "rare" and say why. Write the join-up section in the form in docs/design/JOIN_UP_REVIEW.md. Cite only files you were given, never an earlier review round. Do not grow the spec.
```
The second paragraph is optional, in your own words. It is the part that matters most this time: it answers the one question Triage put to you, and it stops the two pack faults from failing the next spec too.

## What happened (dispatch-log/2026-11.jsonl; reviews/S-004/plan.md and triage/P-003.md on item/P-003)
You started the pipeline by hand at 16:32Z, after it had stalled from 13:59Z (the five-run chain cap, with the 30-minute schedule not firing behind it). The Definer rewrote S-004 (16:44:20Z) and fixed the second review's one blocking point: the held-too-long count now checks each card at every moment its state can change, not only at the 24-hour mark. The Critic's third review failed it at 16:55:36Z on three new blocking findings. A third failed round is the plan's stop rule (section 6), so Triage traced the cause (17:01:43Z) and this card came to you.

The three findings, and where Triage puts each:
1. **The join-up section is not in the required form.** The Definer was never given the form (the spec says so; its second-round report says it copied the shape from the review instead). A pack fault, not the Definer's.
2. **"Rare" is unsupported.** The spec shows a card at once whenever its log entry is missing, which is wider than the plan's "older than the log the desk reads", and calls the case where a new card shows and then goes back to held "rare" with no evidence. Triage calls this the Definer's own slip.
3. **The spec cites the earlier review rounds, which the Critic cannot see**, because each round overwrites the same review file. Triage flagged the same fault at stop 6, and it was not fixed. A process fault, the Orchestrator's.

## The question Triage put to you, answered from the records
Triage's open question 1 is whether a card's log entry reaches main in the same commit as its card file. **It does.** The Orchestrator's commit step writes the card and its entry together; I checked cards dor-4, stop-5, stop-6 and stop-7 (commits 3f2a75e, 5ae0966, c93bb2a, faa1dd9), and each card file arrived with its own entry. So for a card the pipeline raises, the entry is never missing, and the shown-then-held flip cannot happen. It could happen only for a card file that arrives some other way.

That settles your question (Triage's question 2) in favour of the plan as written: "shows at once" means a card older than the log the desk reads, not a fresh card with no entry. No plan change is needed. If you would rather have the wider reading, that is a plan change, and I would amend section 1 first.

Triage's question 3 also has an answer: the join-up form was missing in round 2 as well (the Definer's report of 16:44Z says it used "the form the review used"). Finding 1 was repeating.

## Why `criteria-wrong`
- **Not `confirm`.** It sends the same spec back to the Critic with no rewrite. Two of the findings need the spec rewritten (the join-up section and AC7's wording), so it could not pass.
- **Not `re-specify`.** That counts a strike against the Definer. Triage faults it for one wording slip; the other two findings come from what it and the Critic were given.
- **Not `re-scope` or `drop`.** The defect the fix answers (a card shown, then gone) still stands, and the design holds: the Critic said "the rule's design holds together". Every finding this round is about how the spec is written and checked.

## The risk to weigh
This is P-003's third stop in Design (stops 5, 6, 7) and its third spec. Each round has fixed the last round's findings and drawn new ones, and the spec has grown each time (Triage's secondary point; tests now estimated at 15 to 23, against the stop rule's 24). Two of this round's findings would recur on a new spec unless the Definer has the form and cites no earlier round, which is why the note above says so. If the next spec stops a fourth time, I would recommend narrowing the work (`re-scope`) rather than another rewrite.

## Outside the Definer
- **The Orchestrator** (not mine to change): number review files by round, and put docs/design/JOIN_UP_REVIEW.md in the Definer's and Critic's packs at Design. Also the stall: a run at the chain cap of 5 starts no follow-up, and the schedule mostly does not fire, so the pipeline stopped from 13:59Z until you started it.
- **For you at the Launch gate, from the Critic's non-blocking findings:** the held-too-long figure cannot go red while the rule is unchanged; a far-future raise time can hold a card longer than a day, against the plan's "never hidden for more than a day"; three criteria depend on a baseline run, with "stop and return" as the fallback.

Nothing here is irreversible.
