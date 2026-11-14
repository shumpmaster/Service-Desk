# Ruling needed: take the operating model's spec-number fix (version 3.7.3) into the desk before any new spec number is drawn

Milestone: M6, M7, M8, M4

WHY: The Orchestrator gave the timeline work a spec number another spec already held, because it counts only the specs a status file names (docs/LESSONS.md LL-053 in the operating model). The operating model fixed that in version 3.7.3, which the owner merged: a new number now counts every spec file on the main branch and on every item branch. The desk still runs 3.7.2, so the timeline's next spec (if stop card 4 is answered with a new spec) and the card fix's next spec would both draw numbers under the old rule. Two tools change; both are governance checks here, so this is R3.
OPTIONS:
  A. Take 3.7.3 now. governance/checks/orchestrator.py is copied byte for byte from the model at 8ed88f7. governance/checks/orchestrator_git.py gets only the model's S-038 change, applied onto the desk's own copy, which keeps its ledger lines from the owner's ruling (decisions/questions/P-003-build-blocked.md); the merge had no conflict. OPERATING_MODEL_VERSION reads 3.7.3, with a ledger entry. No workflow line changes.
  B. Wait for a full model sync. Every new spec number until then is checked by hand before it merges.
RECOMMENDATION: A. It is the fix you asked for, it is small, and both waiting specs need it before they draw a number.
RISK CLASS: R3 (governance/**)   REVERSIBILITY: irreversible (computed from R3)   BLAST RADIUS: how the Orchestrator picks a new spec number, and one list the decide job builds; no other rule, no src/ code
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The fault: P-005 was given S-009, which the card fix's spec already held (source: decisions/questions/P-005-spec-id-clash.md; operating model docs/LESSONS.md, LL-053)
- Your ruling "Both, in order (Recommended)": step 2 fixes the rule in the operating model, and "the desk takes it at its next model update" (source: decisions/questions/P-005-spec-id-fix.md)
- The fix, S-038, frozen on your approval, built tests first, reviewed PASS, released as 3.7.3 and merged by you (source: Personal-Org-Operating-Model specs/S-038-spec-ids.md, reviews/58/reviewer.md, #58 at 8ed88f7)
- The desk's orchestrator.py is byte-identical to the model's 3.7.2 copy; its orchestrator_git.py differs only by its own ledger-composition lines (source: `cmp` and `diff` against the model at b55addc, this session)
- The model's S-038 change applies onto the desk's orchestrator_git.py with no conflict, and with the merged copy the model's S-038 tests and its loop tests pass, 70 tests (source: `git merge-file`, then `python3 -m unittest test_s038_spec_ids test_s015_orchestrator_git` in a scratch copy of the model, this session)
- The desk runs 3.7.2 (source: governance/OPERATING_MODEL_VERSION)
