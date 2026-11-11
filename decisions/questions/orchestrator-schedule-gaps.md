Ruling: A — raise the loop's timer gaps in the operating model as a lesson, and add a desk improvement-register row; no desk change now

Question: questions/orchestrator-schedule-gaps.md (filed in #348, removed here)
Milestone: M4

Question, as put: The desk's loop should wake every 30 minutes, but GitHub fires that timer only every 4–8 hours. When the loop hits its limit of 5 self-starts in a row, work waits hours for it (3 stalls on 9 Nov, one about 6 hours). The limit is the operating model's rule. What should I do? (Filed as questions/orchestrator-schedule-gaps.md in PR #348.)
Options, as put: A: raise upstream (Recommended); B: A plus a desk alert; C: leave it.
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGNGhaxp9ABH6WFJJE2) on 2026-11-10, after the question file was pushed to #348, the pull request it was filed in. The owner chose the option in the session. The question file was not yet on the default branch when it was put, because the asks-merge workflow does not merge a pull request with a merge commit among its commits (governance/checks/asks_merge.py, `history_problem`); this record and the file's removal land in the same pull request.

## The owner's words, verbatim
"A: raise upstream (Recommended)"

## How it is carried out
- The lesson is raised in the operating model (Personal-Org-Operating-Model, docs/LESSONS), with the run counts below, for its owner to merge.
- The desk gets a ledger entry and an improvement-register row saying that nothing on the desk changes, with the measured timer runs.
- Nothing on the desk changes: the timer, the chain cap of five (model S-015 AC10) and the workflows stay as they are. The Chief of Staff checks for stalls each session and reports them; a manual start stays the owner's call.
- Measured since the question was filed: the Definer's second round of S-007 was dispatched at 13:20Z on 10 November and its work landed at 13:23Z, but the loop did not run again until the timer at 19:19Z, which recorded the outcome and dispatched the Critic then, six hours late (dispatch-log/2026-11.jsonl on main; item/P-003 at 36fd1e9d).
