Ruling: A — fix both first: the Definer limits rule (c) to notifications and rewrites question 13 to name every coverage rule; a fresh Critic checks only those lines; on a PASS the spec is frozen, and a failed check comes back to the owner
Proxy: done at the owner's request (the owner answered the Chief of Staff in session session_01QBwHGJGYoFwkxVunu5XDbF on 2026-11-13, verbatim: "Fix both first (Recommended)")

Question: questions/P-003-S-009-pre-freeze.md (filed in #419, removed here)
Milestone: M4

Question, as put: Before the card fix's spec is frozen, should two points from its last check be fixed?
Options, as put: A: fix both first; B: freeze as it stands.
Recommendation, as put: A.

How it was answered: in the Chief of Staff's session (session_01QBwHGJGYoFwkxVunu5XDbF), on 2026-11-13 at about 14:41 UTC, by the question tool. The question was put before its file was filed, against AGENTS.md §5; it was filed right after in #419 with the same options (docs/handoff/2026-11-13-chief-of-staff-p002-47.md). #419 was merged by the owner at 14:42:39Z. The answer is recorded here, as that handoff quotes it, by the next Chief of Staff session (session_01QBwHGMmHGgB3fLufS5ELH2), at the owner's instruction in its start prompt. An R3 question never defaults, so this is an answer.

## The owner's words, verbatim
"Fix both first (Recommended)"

## How it is carried out
- The Definer limits rule (c) in specs/S-009.md to `via: "notice"` cases (round 5, N-A), and rewrites question 13 to name rule (c), the twin rule and the open-card rule (round 5, N-B). It may also fix round 5's N-C phrase.
- A fresh Critic checks only those lines, as plan review round 6.
- On a PASS, the Definer freezes S-009, and the Check author writes the locked checks (plan step 5).
- On a FAIL, it comes back to the owner.

## What happened
- The Definer made the fixes N-A, N-B and N-C on build/definer/S-009 (84b3891), changing lines 11, 156, 169 and 288 only and no criterion; merged with a merge commit (a0d8ab6).
- A fresh Critic checked those lines as plan review round 6: PASS (reviews/S-009/plan.md, round 6). Its non-blocking N2: question 13 does not name the notes-failing rule, which the spec shows the owner elsewhere (specs/S-009.md:260, :270); carried as a risk.
