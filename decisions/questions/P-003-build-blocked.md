Ruling: A — fix both faults, then build: re-prove the runner image and record it, and make the check run's copy keep main's ledger
Proxy: done at the owner's request (the owner picked an option in the session on 2026-11-11; the question, the options as put and the owner's answer are quoted verbatim below)

Question: questions/P-003-build-blocked.md (filed in #353, removed here)
Milestone: M4

Question, as put: The card fix's build is blocked by two desk faults, not by the work. (1) The Builder's shell was switched off: GitHub's runner image moved to November, and the desk's safety proof was last passed in September. (2) The check run compares a stale copy of the ledger, so it would fail even a perfect build. Until fixed, each timer run retries a Builder that can't build, then a stop card comes. How should I proceed? (Filed as questions/P-003-build-blocked.md in PR #353.)
Options, as put: A: fix both (Recommended); B: pause for the model; C: decide at the stop card.
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGNGhaxp9ABH6WFJJE2) on 2026-11-11, after the question file was pushed to #353, the pull request it was filed in. The owner chose the option in the session. #353 then merged, and this record follows on the default branch.

## The owner's words, verbatim
"A: fix both (Recommended)"

## How it is carried out
- The owner ran the safety proof by hand on 2026-11-11 (run 43018049218, runner image 20261101). It failed as in October (L-0007): every token, sandbox and commands-on check passed, but the commands-off session made no tool calls, so its two Read checks had nothing to judge.
- The proof's commands-off instructions now open with the same harmless Write step as the commands-on ones (governance/checks/orchestrator_git.py, PROOF_OFF), as the operating model's L-0129 suggested. When a proof passes, the runner settings record its image month (governance/RUNNER.toml), by a rule change with the Reviewer's verdict and the owner's.
- The check run's copy keeps main's ledger and adds the item branch's own entries after it, renumbering any whose id main already uses, and rebuilds the digest (governance/checks/orchestrator_git.py, keep_default_ledger). Measured on P-003's copy: 26 ledger entries before and 46 after; the surface and digest checks fail before and pass after.
- The final merge gate still merges the two ledgers by git, which will conflict, and the item branch's own ids still clash with main's. Both are left for a later ruling before P-003 lands, and are raised in the model (LL-046).
- Both faults are raised in the operating model. If a stop card comes before the fixes land, the Chief of Staff recommends `rebuild`, which resets the build rounds.
