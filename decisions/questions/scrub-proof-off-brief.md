Ruling: A — change the desk's copy now: the proof's commands-off session first writes a fixed harmless file, then does its two Reads
Proxy: done at the owner's request (the owner picked an option in the session on 2026-11-11; the question, the options as put and the owner's answer are quoted verbatim below)

Question: questions/scrub-proof-off-brief.md (filed in #355, removed here)
Milestone: M4

Question, as put: The safety proof can't pass because its commands-off session never starts. Its first instruction is "read this process's environment", which looks like credential-hunting on its own, so the session stops. Until the proof passes, Builders have no shell and P-003 can't be built. The model's own suggested fix is a harmless first step, but its frozen specs fix that wording. May the desk change its copy now? (Filed as questions/scrub-proof-off-brief.md in PR #355.)
Options, as put: A: change it now (Recommended); B: wait for the model; C: build outside the loop.
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGNGhaxp9ABH6WFJJE2) on 2026-11-11, after the question file was pushed to #355, the pull request it was filed in. #355 then merged, and this record follows on the default branch.

## The owner's words, verbatim
"A: change it now (Recommended)"

## How it is carried out
- governance/checks/orchestrator_git.py PROOF_OFF: step 1 writes off-check.txt holding the fixed text "harness check". It is never nonce A (L-0101), and it is not proof.txt. Then come the two Reads, as steps 2 and 3. Ledger L-0045.
- The change departs from the operating model's frozen S-015 AC12 and S-021 AC2. Against the model's tests, the copy fails 2 of 91, both on that wording. It is raised in the model as LL-047.
- Then the owner runs the proof again by hand. If it passes, governance/RUNNER.toml records its image month by a rule change.
