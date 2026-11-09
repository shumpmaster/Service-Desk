Ruling: A — approve the fix: the Check author's commits are bounded by its own surface in the scope check

Question: questions/P-003-check-author-scope.md (filed in #339, removed here)
Milestone: M4

Question, as put: Your retry on card 10 is running, but the scope-check fix (questions/P-003-check-author-scope.md) has no recorded answer, and without the fix the retry will most likely be refused again. Which option do you choose?
Options, as put: A: approve fix (Recommended); B: re-specify instead; C: one-off ledger ruling; Wait, not now.
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGLyWwT6VLiL5hC3LpG) on 2026-11-09 at about 13:53Z, after the question was on main (#339) and the owner had answered card 10 `retry` (decisions/P-003/failure-10.md). The owner chose the option in the session.

## The owner's words, verbatim
"A: approve fix (Recommended)"

## How it is carried out
- governance/checks/v3_checks.py, `check_scope`: the Check author's spec-scoped commits are bounded by its surface (governance/SURFACES.md, tests/acceptance/** and checks/**), as the Definer's are (model S-019 AC1). Any other path in its commits is still held to the spec's Areas touched. Every other builder is unchanged. The Definer's note text is unchanged; a separate check-author-lane note is added.
- Tested: a replayed Check author commit on item/P-003 fails the scope check before the fix and passes after; the model's test_s019_definer_own_lane, test_scope, test_s009_v3_checks, test_s010_v3_team, test_s005_followups and test_s013_records pass with it (docs/handoff/2026-11-09-chief-of-staff-p002-25.md).
- The model (Personal-Org-Operating-Model, tools/v3_checks.py) has the same gap; the Chief of Staff raises it there separately.
