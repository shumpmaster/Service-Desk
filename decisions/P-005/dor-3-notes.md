# Chief of Staff's notes — P-005 dor-3 (the Design gate, case 2)

**Recommendation: `proceed`.** The gate Critic recommends proceed (reviews/P-005/_design-gate-2-critic.md, on
item/P-005): the owner has the ask, the plan, the risks including the copying job, the costs and the stop rule, and
none of the faults left is a reason to hold again. This is the owner's ruling: a gate is never answered by proxy
(docs/LEDGER.md L-0049), and proceeding at this gate ends that proxy in practice.

## One correction the owner should know first
Case 2's appendix says "the Chief of Staff has reported this to the operating model's owner" about the timeline rule
behind Discovery-3. That was not yet true when the case was written: the report was still listed as to-do
(docs/handoff/2026-11-13-chief-of-staff-p005-8.md, "Next", item 3). The case is not edited, since its Critic has read
it. This session makes the report now, as rows in the operating model's lessons log, and says so to the owner in
the session where this card is put.

## The gate Critic's remaining points, and what each means for the ruling
1. **Length.** The Critic estimates about 600 words. The count CI applies (`v3_checks gates`, which leaves out
   citations, visuals, their text alternatives and captions, as the gate form says) raises no length fault on case 2.
   The Critic's count includes those parts, as it did on case 1. Not a reason to hold; the difference in counting is
   reported to the operating model.
2. **Q-028 "filed under Discovery-5" and the report line cite no record.** True: the milestone tag shows only in the
   timeline's own block. See the correction above.
3. **An extra citation on the Q-028 line** (reviews/P-005/_critic-dor.md does not mention Q-028). The claim is
   supported by research/Q-028-source-check.md (PASS) and the dispatch log. No effect on the ruling.
4. **A dispatch-log anomaly left out**: a source-checker session for Q-028 (05:56:59) was logged as "returned, not
   dispatched; ignored" at the same moment as the PASS. It does not change why Discovery-5 reads not reached: that
   rule needs every research item routed before the readiness pass to have passed by then
   (governance/checks/v3_checks.py, `research_settled`), and Q-028 passed at 06:03:19, after the pass at 05:00:53.
   It is reported to the operating model with the other two.
5. **Discovery-3 and Discovery-5.** The Critic: "met in substance but unrecorded". Agreed.
6. **M7's wording** still reads "through the whole life of the work". Since case 2 was filed the owner approved the
   daily copying job in all four repositories (decisions/questions/P-005-copying-job.md), so the dependency the
   readiness check flagged is now ruled, though not yet built. The owner may approve M7 as written, or ask for the
   wording to say that results GitHub deleted before the job ran show as "no longer kept"; after this gate a
   rewording needs only the Critic's check, not a ruling.

## Not a fault of the case
The case's milestone block no longer matches what `v3_checks gates` reads from the timeline today, because records
were added after it was filed (the hold ruling, the second gate Critic step, the later Q-028 steps). It matched when
case 2 merged with its checks green (#420). It matters only if the case file is changed again.
