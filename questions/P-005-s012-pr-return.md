# Ruling needed: whether a pull request that goes back to draft and returns is one wait or two

Milestone: M6, M7, M8

WHY: The third plan review found that the missed-alert count can credit an alert or a showing from a pull request's first spell of waiting to a later spell, because both carry the same name on the waiting list (finding 2). That could make a late alert look on time and hide a miss from your V8 target. Whether the second spell is a new wait, with its own due time and its own 5 minutes, or the same wait carrying on, decides both your V7 wait times and which alerts count for V8. Nothing in the plan or your earlier answers says which.
OPTIONS:
  A. Two waits — each spell between ready for review and back to draft, merge or close is a wait of its own, with its own start. An alert or a showing counts for a spell only if it is dated inside that spell. Each time you are asked is timed and alerted on, and no earlier alert can hide a later miss.
  B. One wait — from the first time it was ready to its merge or close, including the time it sat in draft. The first alert covers it, so a later spell sends nothing new to be counted. Waits read longer than the time you were actually asked, and a return is never checked for an alert.
RECOMMENDATION: A. It matches the spec's rule that a step the alert route saw leave and come back is sent again, and it closes the review's finding without a special case.
RISK CLASS: R0 (specs/**, experiments/**)   REVERSIBILITY: reversible (computed from R0)   BLAST RADIUS: the spec's AC40, AC41 and their tests; E1's pull-request row, which has not run
DEFAULT: A   TIMEOUT: none — put to the owner in session; it waits until answered

## Context
- The third plan review of S-012, finding 2: "A pull request id (`pr:<number>`) is reused if the pull request goes back to draft and returns to ready … A line from an earlier wait could then make a later wait look shown or sent in time", and its open question "Is a pull request that returns to ready one wait or two?" (source: reviews/S-012/plan.md on item/P-005)
- Triage: "Should a pull request that returns to ready count as one wait or two? This is an owner or Chief of Staff ruling and affects both AC40 and AC41" (source: triage/P-005.md on item/P-005, section 6)
- AC23 and J5 send a step again when a run saw it gone and a later run finds it back (source: specs/S-012.md on item/P-005, AC23 and J5)
- The waiting list's id for a pull request is `pr:<number>` (source: specs/S-009.md:154)
