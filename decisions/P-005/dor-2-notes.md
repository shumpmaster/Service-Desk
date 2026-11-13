# Chief of Staff's notes — P-005 dor-2 (the Design gate, case 1)

**Recommendation: `hold`.** The gate Critic recommends hold, and it expects to recommend proceeding on a redrafted case
(reviews/P-005/_design-gate-1-critic.md, on item/P-005). The plan itself holds up by its reading: $0, T1, acting
finishes on GitHub, each unknown has a fallback. The case is what needs work. This is the owner's ruling: a gate is never
answered by proxy (docs/LEDGER.md L-0049). On `hold`, the Chief of Staff writes case 2
(docs/gates/P-005/design-gate-2-case.md), the gate Critic reads it, and a fresh card follows.

## The gate Critic's findings, and what case 2 does with each
1. **Discovery-3 and Discovery-5 read "not reached", with no reason given.** The reasons are in the records, and
   neither is missing work:
   - Discovery-3: the timeline reads the groundwork ruling from `decisions/questions/P-005-groundwork.md` or
     `-discovery.md` (governance/checks/v3_checks.py, `file_part`). The owner's ruling is filed as
     `decisions/questions/P-005-groundwork-shortlist.md`, so the timeline does not find it. Q-022's source check passed
     (research/Q-022-source-check.md).
   - Discovery-5: it is reached only if every research item routed before the readiness pass has passed its source check
     (`research_settled`). Research Q-028, filed by this session at 04:48 under Discovery-5, was still open at the pass
     (05:00:53); Q-023 to Q-027, the plan's research, had passed. Q-028 serves the later copying-job question, not the
     brief.
   Case 2 says both in plain words. Whether to rename the ruling file or ask for the timeline rule to read it is a
   question for the Orchestrator's owner (the model), not this case.
2. **A risk the readiness check said to carry is in the appendix only**: M7's reach back through the whole life of the
   work depends on the copying job. Case 2 moves it into section 5.
3. **Citations that do not support their line**: the phase caption (case 2 cites the gate form's standard visual
   instead), "things wait on you too long" (case 2 quotes line 56: they "sit longer than they should", mostly from the
   owner's own busyness), and Q-028 unnamed (case 2 says what it is for).
4. **Length**: the Critic estimates 550 to 600 words. `v3_checks gates`, which CI runs, counts 350 (the cap) on case 1,
   leaving out citations, visuals and captions as the form says. The estimate looks like a count with citations in;
   case 2 stays within the check's count.

## Before case 1 was filed
Three cold reads by Critic helpers acting as the gate Critic: hold, hold, proceed (docs/handoff/2026-11-13-chief-of-staff-p005-7.md).
None caught the Discovery-3 and -5 reasons, since none could see the timeline's rule; the real Critic's finding stands.
