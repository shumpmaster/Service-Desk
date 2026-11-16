# Ruling needed: which pull requests the wait count times as waiting on the owner

Milestone: M6, M7, M8

WHY: The timeline's third plan review failed on this rule (finding 1). The spec and the baseline experiment both count a pull request as waiting on the owner only if the desk would list it at the window's end. By then any pull request that was merged or closed in the window has left the list, and any still listed is still open, so no pull-request wait can ever end inside a window. Your V7 target then never sees a finished pull request. The rule is the measure of your own value target, so its meaning is yours to set. Until it is ruled, the next spec writer has to guess, and the next review can fail on the guess.
OPTIONS:
  A. At any moment while it was open — a pull request counts if the desk's rules would have listed it as waiting on you at any time between its start and its end (or the window's end, if still open), judged on the records as they stood at that time. It hides no wait. The count must rerun the listing rule at each of the pull request's own changes, which the spec writer states once for the count and the baseline alike.
  B. At the moment it became ready — a pull request counts if the desk's rules would have listed it when it was marked ready for review (or opened, if never a draft). Simpler to run, but a pull request that only came to need you later, for example when a required review was added, is never counted.
RECOMMENDATION: A. It is the reviewer's own suggested fix, it matches the plan's words "a pull request that needs the owner, ready, to merged", and like the spec's other monitoring rules it can only add waits, never hide one.
RISK CLASS: R0 (specs/**, experiments/**)   REVERSIBILITY: reversible (computed from R0)   BLAST RADIUS: the spec's AC40 and AC41, and the baseline experiment E1's pull-request row, which has not run
DEFAULT: A   TIMEOUT: none — put to the owner in session; it waits until answered

## Context
- The third plan review of S-012, finding 1: "no pull-request wait can end inside the window … The rule should say which pull requests count as needing the owner at some point in their life, not at the window's end" (source: reviews/S-012/plan.md on item/P-005)
- The same rule is in the baseline experiment: "one the desk's card-making code puts on its waiting list, run on the records at the window's end" (source: experiments/P-005-E1.md line 26 on item/P-005)
- The registration says nothing has been run (source: experiments/P-005-E1.md line 3 on item/P-005)
- Triage traced the third failure to this rule, copied into the spec from E1, and names this question for the owner (source: triage/P-005.md on item/P-005, sections 2 and 5)
- The plan's measure of V7: "a pull request that needs the owner, ready, to merged" (source: docs/projects/P-005.md:135)
