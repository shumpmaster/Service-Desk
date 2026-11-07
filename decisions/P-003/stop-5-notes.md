# Chief of Staff's notes — P-003 stop-5 (the stop rule, Design)

**Recommendation: `re-specify`.** The Definer writes a new spec that supersedes S-002, and its rounds reset. The record's lines would be:
```
Decision: re-specify

Keep the spec to the desk's code: move AC13 to AC15 (the weekly value check, my reports, the card after 2026-12-31) out to the plan and the Launch gate. Whether a card is held or shown comes only from the records on main (the log and the notes), so every view and the sender agree; the open desk keeps no memory of its own.
```
The second paragraph is optional, in your own words box. It settles the two scope questions the Critic and Triage left open, so the new spec does not stop on them again.

## What happened (reviews/S-002/plan.md, triage/P-003.md on item/P-003; dispatch-log/2026-11.jsonl)
The Critic's first review of S-002 failed it, with three blocking findings:
1. **The views and the sender could disagree about a card.** The spec says a card the open desk has shown is never withdrawn. That memory would live in the browser, where the notification sender, a separate run, cannot see it.
2. **AC13 to AC15 are my duties, not code.** No Builder check can test them, and intake/ is outside the spec's areas.
3. **The side-by-side review of the five views was missing.**

It also found three smaller faults: J4 misdescribes a file, the spec doesn't say whether the sender's files change (those need your approval), and one ruling is quoted second-hand.

**Why a stop card on the first review:** the plan round counter carried over from Discovery, where the readiness check failed twice (dor-fail-1, dor-fail-2). This review counted as round 3, and the three-fail rule sent it to Triage. The counter works as designed ("the plan rounds are kept"), but S-002 itself was reviewed once. That answers Triage's open question 4.

## Why `re-specify`
- **Not `confirm`.** One more focused check cannot pass a spec with three blocking faults; it needs rewriting.
- **Not `criteria-wrong`.** Triage finds your intent sound, so the criteria are not wrong. The faults are in how the spec was written (Stage 3), with part of the cause in the plan's premise (Stage 2). `criteria-wrong` would spare the Definer a strike. It is defensible if you count the plan's premise as the cause, but Triage names the Definer's own errors (AC13 to AC15, J4, the missing review section).
- **Not `re-scope` or `drop`.** The problem the fix answers still stands: your screenshot of P-004's card today shows "Recommended" pointing at notes that are not on main.

## A fact the new spec can use
The sender already keeps a signed memory between runs, `desk-notify-state`, holding what it has sent for each card (src/notify/state.mjs:1-17). It already holds questions back until their answer is seen (src/notify/collect.mjs:143-189). "Notified once" can live there, as Triage's open question 2 asks, and the hold rule can be one function both the desk and the sender call.

## A self-implication
Triage notes that the readiness check and both Design-gate reads accepted the plan's "one list feeds every view and the sender" premise from the plan's own citation. My gate cases and notes did the same. The plan was ruled at the Design gate, so I do not amend it here. The correction reaches the Definer through your answer's second paragraph, which names the records as the one source. The plan's line can be corrected later, at your word.

## On `re-specify`, next
The Orchestrator marks S-002 superseded with a ledger entry and allocates a new spec id. The Definer writes it, and the Critic reviews it with rounds reset. Any change to src/notify/** still needs your approval (docs/projects/P-003.md:71). Nothing here is irreversible.
