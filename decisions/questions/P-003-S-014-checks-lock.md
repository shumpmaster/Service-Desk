Ruling: A — lock the card fix's rewritten checks for its notices (the S-009 checks the notice form touches, rewritten under frozen S-014), and dispatch the Builder's adapter again
Proxy: done at the owner's request (the owner answered the Chief of Staff in session session_01QBwHGJoFFZQjbMT7zK1HWJ on 2026-11-19, verbatim: "A: Approve the lock (Recommended)")

Question: questions/P-003-S-014-checks-lock.md (filed in #461, removed here)
Milestone: M4

Question, as put: The card fix's rewritten checks have passed everything the ruling asks for: three Critic rounds and a fresh Reviewer, who also ran the real notification sender through them. One gap the Reviewer found was fixed before this question. Do you approve locking them? Locking is irreversible in practice: after it, these checks can change only through a new spec. Approval lets the Builder write the adapter again.
Options, as put: A: approve the lock; B: approve with changes you name; C: not now.
Recommendation, as put: A.

How it was answered: in the Chief of Staff's session (session_01QBwHGJoFFZQjbMT7zK1HWJ), on 2026-11-19 at about 04:20 UTC, by the question tool, while #461 was open. The owner then recorded their own verdict on #461 (reviews/461/owner.md, "Verdict: PASS") and merged it on 2026-11-19, so the question and the locked checks reached the default branch then. An R3 question never defaults, so this is an answer.

## The owner's words, verbatim
"A: Approve the lock (Recommended)"

## How it is to be carried out
- The checks under tests/acceptance/S-009/ are locked as merged in #461; they change from here only through a new spec.
- The Builder's adapter is dispatched again, as decisions/questions/P-003-S-009-adapter-stop.md:20 says: with the same sender warning, and with the desk and open routes through `loadSandbox` probed first. No change under src/.
- Then the Reviewer reads the adapter against src/ at the base commit fca41700, and the session makes the baseline record (specs/S-014.md:23).
