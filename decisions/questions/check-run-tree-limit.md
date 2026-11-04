Ruling: A — fix it in the operating model, for the check run's copy only: leave out the design folder's images, let text files of any size through up to the total limit, at pack and unpack, and list what was left out

Question: questions/check-run-tree-limit.md
Milestone: none (the card fix's own milestone, M4, is still only a proposal in its plan, and the desk's standard "work is built" milestone, Build-2, was skipped)

Question, as put: How should the pipeline's check run get past the desk's large files, before any work reaches it?
Options, as put:
  A. Fix it in the operating model, for the check run's copy only: leave out the design folder's images, let ordinary text files of any size through up to the total limit, both when it is packed and when it is unpacked for the run, and list what was left out. Every other bundle, and every set of changes a builder returns, keeps today's limits.
  B. Fix it here only: shrink the two screenshots under 1 MB, and raise this project's per-file limit to 4 MB.
  C. Wait: rule it when the card fix reaches its check run.
Recommendation, as put: A.

How it was answered: the question was filed in PR #293 after the Critic's two cold readings (reviews/check-run-tree-limit/critic.md, PASS at round 2), and put to the owner in the Chief of Staff's session (session_01QBwHGKvycwrAfApqnamh2Q) on 2026-11-04 in plain text, once it was on the main branch, with the recommended word A. The owner answered in the session, saying they could not find the question on the desk.

## The owner's words, verbatim
"I can't find the check run question, please go with a"

## How it is carried out
- The Chief of Staff files the lesson and a short plan of its own in the operating model (Personal-Org-Operating-Model), queued after S-035 (one plan per project), now in its build. The plan covers the check run's copy only: design images left out, text files of any size let through up to the total limit, at pack (tools/orchestrator_git.py `tar`) and at unpack (`untar`), with how a "text file" is decided, and the left-out files listed as links are today.
- The model's builders make it, its Reviewer checks it, the owner merges it, and the desk takes it at its next model update. Every other bundle and every builder's change set keeps today's limits.
- If the card fix reaches its check run before that lands, the Chief of Staff puts option B to the owner as a stopgap.
- The owner could not find the question on the desk: a lesson for the desk (a filed question should show where the owner looks).
