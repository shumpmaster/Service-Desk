# Chief of Staff's notes — P-003 criteria-8 (the Build gate, case 1)

**Recommendation: `recycle`, into Design.** The gate Critic recommends hold, and I agree with its reason: do not freeze a spec the desk's evidence check is known to refuse. But a hold would not fix that. On a hold the Definer does not run; I would only rewrite the case. A recycle into Design sends the same spec back to the Definer to fix the citations. The plan is then reviewed again, and you get a corrected case and a fresh card. It is not a strike, and the review rounds start again from one. The record's lines would be:
```
Decision: recycle
Into: Design
Reason: Before the freeze, give each fact under "Facts relied on" in S-005 a path with a line, or a command, so the desk's evidence check passes; change no criterion and do not grow the spec.
```

## What happened (reviews/P-003/_build-gate-1-critic.md and dispatch-log/2026-11.jsonl on item/P-003)
The case landed on main at 22:38Z (PR #331). The pipeline started on its own and dispatched the gate Critic at 22:43:33Z, and its record arrived at 22:46:12Z. It found the spec sound: "the plan review passed it with no blocking finding, and the plan, V6 and cost figures agree with the records". It recommends hold, because "proceeding freezes AC1 to AC19, and the case says the evidence check rejects eleven of the spec's facts", and the case never says why you should proceed anyway.

It also found slips in the case itself, all mine to fix:
- **"Eleven" had no record.** The count is real. I reran the check on a copy of the spec marked frozen, and `governance/checks/spec_check.py facts` gave "FAIL: 11 violation(s)", at lines 169, 170, 173 to 177, 180 and 184 to 186 of specs/S-005.md on item/P-003. The case cited only two of those lines, which the Critic could not count from. The next case cites the command.
- **"No card is held longer than a day" was too strong.** The spec itself says a skewed raise time, or a failed read, can hold a card longer.
- **The wrong citations:** the status file for "the plan passed"; the stop rule as covering build rounds (it covers plan rounds); and the stop on any change to the notification sender was left out.
- **"Its one sizable risk"**, where section 5 lists six risks.
- **The type and spacing difference** from the join-up review was not carried as a risk.
- **Form:** over 350 words, and no thumbnails of the screens, with no line saying P-003 has none.

## The three choices
- **`recycle` (recommended).** The Definer cites lines for the eleven facts, the Critic reviews the plan again, then I write case 2 with the slips above fixed. The gate Critic reads it, and a fresh card comes to you. Cost: about four pipeline runs. Risk: the plan's sixth review could find something new, as earlier rounds have done, though this rewrite touches only the evidence lines. A failed review still has its rounds, since they start again from one.
- **`proceed`, with a note to the Definer.** This is the fastest route, and it works because the Definer's freeze session reads your record. Write `Decision: proceed`, then a blank line, then: "When you freeze S-005, first give each fact under 'Facts relied on' a path with a line, or a command, so the desk's evidence check passes; change no criterion and nothing else." The cost: no one reviews those rewritten lines before they freeze, and the case's slips stay on the record uncorrected. If the Definer misses one, the freeze is refused and a failure card comes to you.
- **`hold`** (the Critic's word). I fix the case and the Critic reads it again, but the spec's facts stay as they are. So you would face the same refused freeze on the next card. Only pick it if you want the corrected case before deciding.

`kill` is not in question: nothing in the review faults the fix itself.

## Outside this card
- **For the Orchestrator** (not mine to change): the gate Critic says the dispatch log and the earlier rulings the case cited "were not among the files I read". The gate pack's list names the dispatch log (governance/PACKS.toml, `critic-gate`), so either the pack did not deliver it or the Critic did not open it. Either way, it could not check the appendix's round counts, nor confirm the milestone block was machine-printed. Worth a look in the run's pack manifest.
- Nothing here is irreversible.
