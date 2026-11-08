# Chief of Staff's notes — P-003 stop-6 (the stop rule, Design)

**Recommendation: `criteria-wrong`.** The Definer writes a new spec that supersedes S-003, its review rounds start again from one, and it does not count against the Definer as a strike (`re-specify` would). The record's lines would be:
```
Decision: criteria-wrong

The fault began in the plan: I have now ruled the gap (B on the log-unread question) and the plan says it. Write the new spec to the plan as amended.
```
The second paragraph is optional, in your own words box. It tells the Definer which record now settles the point the last three reviews turned on.

**Merge the pull request that carries these notes before you answer.** It also brings your two answers of 8 November into the plan. Once you answer, the pipeline sends the work to the Definer at its next run, and the Definer should read the amended plan, not the old one.

## What happened (reviews/S-003/plan.md and triage/P-003.md on item/P-003; dispatch-log/2026-11.jsonl: review dispatched 03:17:11Z, FAIL 03:23:52Z, Triage 03:28:18Z to 03:34:08Z)
Your answers reached main at 03:07Z and 03:08Z (commits 7b8c0f5 and 916e4ab) and restarted the pipeline, whose last run had committed at 00:46:50Z; the next run recorded the Definer's last rewrite at 03:11:25Z. Its next runs sent S-003, as the Definer last wrote it, to the Critic's third plan review. That review failed. A third failed round is the plan's stop rule (section 6), so Triage traced the cause and this card came to you.

Triage's root cause: the approved plan said a decision card shows at once when the desk has not read the dispatch log; your stop-5 ruling says a card is held or shown only from the records on main. The two cannot both hold, and nobody had reconciled them in the plan. The Definer filled the gap itself (AC16, hide every decision card) and marked it as needing your ruling; the Critic failed it for that, and for AC16 contradicting the spec's own line saying no read decides a state. Triage puts the origin in the plan (Stage 2), with the Definer's wording a symptom. Its one question for you, whether a failed read hides every card or the plan's "at once" stands, is the one you have already answered: B, show the cards whose notes are on main and hide the rest, saying so.

The review ran on the spec as it stood, without your B: you chose at the start of this session to let it run rather than hold it.

## Why `criteria-wrong`
- **Not `re-specify`.** Triage puts the origin in the plan (Stage 2). It also faults the Definer for filling the gap with a rule of its own and for the line 23 contradiction, but the Definer marked AC16 as needing your ruling, and that ruling is now made. A strike would count the plan's fault against the Definer. Stop-5 went the other way because there Triage named the Definer's own errors.
- **Not `confirm`.** One focused check cannot pass this spec: its AC16 now says the opposite of your B, and its criteria for a read without the log (AC11, J1, J3, J5), its meaning of a miss and AC13 all have to change (the log-unread question's last paragraph).
- **Not `re-scope` or `drop`.** The problem the fix answers still stands, and the plan now carries both of your answers, so nothing is left open in it for the new spec.

## What the new spec has to do (from Triage and the Critic)
- Follow the amended plan: B for a read without the dispatch log; no decision card while queue/ or the notes cannot be read, with the line on the queue and Home; such cards not counted as misses (the plan's section 6).
- Remove the contradiction between "nothing about how a read went decides a state" and the rule for a failed read.
- Say how the replay of past records (AC13) treats a moment when the desk showed nothing because its read failed.
- Name what makes an open desk re-read when a card's day passes without a reload (AC4).
- Mark which claims were checked at source.

## Outside the Definer
- **The Orchestrator** (Triage's finding 4): the spec cited findings of the review's earlier rounds, which the third round overwrote in the same file, so the Critic could not check them. Round-numbered review files would stop this. I note it here; changing the pipeline is not mine.
- **Me**: Triage asks for the amended plan to be resubmitted to a readiness check by a fresh Critic. I have not done that; instead a fresh Critic read the plan change cold against your two answers and passed it (reviews/P-003-stop-6/critic.md). If you want the full readiness check as well, say so.

Nothing here is irreversible.
