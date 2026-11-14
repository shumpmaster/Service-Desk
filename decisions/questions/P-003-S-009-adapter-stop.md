Ruling: A — re-specify that one part: a new spec, extending the frozen S-009, changes only what the baseline record says about notices, recording each notice as the sender actually sends it (a summary, a group or a single card's notice, with its count and where it opens); the Check author rewrites only the affected cases and checks, a fresh Critic and Reviewer review them, and the owner approves their lock
Proxy: done at the owner's request (the owner answered the Chief of Staff in session session_01QBwHGMPz793eyNKDB5hVfm on 2026-11-14, verbatim: "My answer is A")

Question: questions/P-003-S-009-adapter-stop.md (filed in #437, removed here)
Milestone: M4

Question, as put: The card fix's build stopped before it began; today's notification sender cannot show which cards it notified, so how should the plan go on?
Options, as put: A: re-specify that one part, recording each notice as sent; B: narrow the test cases to at most two open cards on a run that is not the first; C: stop the card fix here.
Recommendation, as put: A.

How it was answered: in the Chief of Staff's session (session_01QBwHGMPz793eyNKDB5hVfm), on 2026-11-14 at about 00:00 UTC, after the question reached main with #437 (merged 2026-11-14T00:00:14Z). The owner named option A. An R3 question never defaults, so this is an answer.

## The owner's words, verbatim
"My answer is A"

## How it is to be carried out
- The Definer writes a new spec extending S-009 that changes only J7's notices: for `desk` cases and `sender` cases, each notice is recorded as the sender sends it (its kind, summary, group or item; its count; and where it opens), taken from the caught push call, and AC14's and J7's comparisons and coverage rules are restated on that form. Nothing else in S-009 changes. Its spec number is taken once the spec-number rule (Personal-Org-Operating-Model docs/LESSONS.md LL-053, the timeline session's step 2) gives one, so that no number is given twice.
- The Critic reviews the plan, for up to three rounds. The owner rules its criteria.
- The Check author, in a sparse worktree, rewrites only the affected baseline cases and checks. A fresh Critic reviews them, for up to three rounds, then a fresh Reviewer, then the owner's verdict, since tests/acceptance/** is R3.
- The Builder's adapter is then dispatched again, with the same sender warning, and the desk and open route through `loadSandbox` probed first.
- No change to the sender (src/notify/**), and no change under src/ before the baseline record exists.
