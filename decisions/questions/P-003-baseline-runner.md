Ruling: C — build the card fix outside the pipeline, in a working session, as the desk itself was first built (P-001)
Proxy: done at the owner's request (the owner answered the Chief of Staff in session session_01QBwHGK3U2XXrCxaP2eUyHP on 2026-11-13, verbatim: "C")

Question: questions/P-003-baseline-runner.md (filed in #386, removed here)
Milestone: M4

Question, as put: The card fix's new spec needs someone to run today's code and keep the record, and no one in the pipeline may do that, so which way now?
Options, as put: A: let the check run make the comparison itself; B: give the Reviewer the job; C: build the card fix outside the pipeline, in a working session; D: let the loop go on.
Recommendation, as put: C.

How it was answered: in the Chief of Staff's session (session_01QBwHGK3U2XXrCxaP2eUyHP), on 2026-11-13, after the question was on the default branch (#386). The Chief of Staff had set out the four options and said the quickest path was to reply "C"; the owner replied with that one word. The answer came before the 48-hour timeout, so it is an answer, not a default.

## The owner's words, verbatim
"C"

## How it is carried out
- Stop card 16 (queue/P-003-stop-16.md) still needs its own word. C's word on that card is `re-scope`, which closes the pipeline's item for the card fix. That word refuses a `Proxy:` line, so the owner writes decisions/P-003/stop-16.md themselves; this ruling does not answer the card.
- Nothing is built outside the pipeline until the Chief of Staff has planned the build in a working session and the owner has approved the plan.
