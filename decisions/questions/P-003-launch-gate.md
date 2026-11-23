Ruling: A — proceed: the card fix goes live on the owner's approval of the deploy, and passes to the desk's own running with the Chief of Staff's weekly check
Proxy: done at the owner's request (the owner answered the Chief of Staff in session session_01QBwHGLJhqD3tRfLqA4zdvm on 2026-11-23, in chat; the words are quoted verbatim below)
Milestone: Launch-1, M4

Question: questions/P-003-launch-gate.md (filed in #470, removed here)

Question, as put: "do you approve putting the card fix on the live desk, and passing it to the desk's own running?" The case and the gate Critic's round-3 view sat inside the question file (#470, main 24664c2).

Options, as put (in the question file, and summed up in the session):
- A. Proceed: the fix goes live on your approval of the deploy, and passes to the desk's own running with the Chief of Staff's weekly check; the four risks are carried as written; the count's watched code and script are fixed before its first weekly run, and the lessons are filed straight after your ruling.
- B. Proceed as A, and also file the design reviewer's two optional points (Home's new lines' red cross, and naming their project) as later work.
- C. Hold: name what must change first; the case is rewritten as the gate's second case.
- D. Kill: the fix stays on the preview only and is rolled back there.
Recommendation, as put: A.

How it was answered: in the Chief of Staff's session (session_01QBwHGLJhqD3tRfLqA4zdvm), on 2026-11-23 at about 15:11 UTC, after #470 had filed the question (merged by the asks-merge job at about 22:54 UTC on 2026-11-22). The owner asked "Okay so what do I need to do?"; the Chief of Staff summed up the question, recommended A, described B to D, said going live can be undone, and offered to put the question as a tap-to-answer prompt. The owner replied in chat, choosing A.

## The owner's words, verbatim
"Yes A"

## How it is to be carried out
- Launch-1 is ruled: the card fix goes live. The live deploy runs from main on the owner's separate approval (L-0004; the outside-build plan's step 17). Rollback: redeploy the previous production deployment, then revert the M4 merge (docs/handover/P-003/operating-notes.md, "Rolling back").
- Launch-5 is ruled: the fix passes to the desk's own running, with the Chief of Staff's weekly V6 count from the week it goes live.
- The ledger entry L-0058 and an improvement-register row land with this record (the plan's pull request 8). The lessons for the operating model are filed in the operating model's repository next (the plan's pull request 9).
- Before the first weekly count: widen its watched code to src/lib/ (reviews/S-009/reviewer.md, N3) and fix count.mjs for weekly reuse (N5).
- The design reviewer's two optional points (reviews/465/design-reviewer.md, Q1 and Q2) are not filed as later work by this answer.
