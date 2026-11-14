Ruling: A — take 3.7.3 now: the operating model's spec-number fix (S-038) is taken into the desk before any new spec number is drawn

Question: questions/P-005-model-3.7.3.md (filed in #443, removed here)
Milestone: M6, M7, M8, M4

Question, as put: Should the desk take the operating model's spec-number fix (version 3.7.3) now? One tool is copied straight from the model. The other keeps the desk's own ledger change from your earlier P-003 ruling and gets only the spec-number change on top of it: that merge had no conflict, and the model's tests passed against the result. Two new specs wait to draw a number: the timeline work's, and the card fix's notices. This is a governance change (R3), irreversible under the desk's risk rules.
Options, as put: "Take 3.7.3 now (Recommended)"; "Wait for a full sync".
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGKbJwQiq23S3G2JJet) on 2026-11-14 at about 04:58Z, after #443 put the question file on the default branch. The owner chose the option by the session's question tool.

## The owner's words, verbatim
"Take 3.7.3 now (Recommended)"

## How it is carried out
- governance/checks/orchestrator.py: copied byte for byte from Personal-Org-Operating-Model tools/orchestrator.py at 8ed88f7 (#58).
- governance/checks/orchestrator_git.py: the model's change from b55addc to 8ed88f7 (S-038 only) applied onto the desk's copy with `git merge-file`, no conflict; the desk's own ledger-composition lines (decisions/questions/P-003-build-blocked.md) are kept unchanged.
- Checked: with both desk copies in a scratch copy of the model at 8ed88f7, `python3 -m unittest test_s038_spec_ids test_s015_orchestrator_git` passes (70 tests).
- governance/OPERATING_MODEL_VERSION reads 3.7.3. No workflow file changes. Ledger L-0052.
