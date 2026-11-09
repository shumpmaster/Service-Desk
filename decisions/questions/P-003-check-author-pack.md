Ruling: A — approve the fix: the Check author may read its own locked checks (tests/acceptance/** and checks/**)

Question: questions/P-003-check-author-pack.md (filed in #343, removed here)
Milestone: M4

Question, as put: The Critic sent the tests back, but the pipeline gave the Check author a folder without them, so it fixed nothing. The list of what each role may read lets the Critic and Builder see the tests, but not the Check author that wrote them. Until this is fixed, every round repeats, and after the third fail you get a stop card. How should I handle it? (Filed as questions/P-003-check-author-pack.md in PR #343.)
Options, as put: A: approve the fix (Recommended); B: no fix now; C: fix in the model first.
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGN37HCacjWVWzYVhq5) on 2026-11-09 at about 15:10Z, after the question file was pushed to #343, the pull request it was filed in. The owner chose the option in the session. The question file was not yet on the default branch when it was put; this record and the file's removal land in the same pull request.

## The owner's words, verbatim
"A: approve the fix (Recommended)"

## How it is carried out
- governance/PACKS.toml, `[roles.check-author]`: `may_read` gains `tests/acceptance/**` and `checks/**`, the paths the Critic, Builder and Reviewer already read. Holdouts are always excluded. `must_not_see` (src/**, docs/handover/**, docs/reports/**) is unchanged.
- Measured: `session_runner.py pack` for the round-2 entry (P-003, checks-fail, S-005) on item/P-003 builds a pack of 4 files besides the library and playbooks before the fix, and 23 after: its card, the brief, the spec, the Critic's findings, checks/S-005's mutants and rubric, both READMEs and the 15 scripts in tests/acceptance/S-005. There is still no src/, docs/reports/ or docs/handover/ in it.
- The model (Personal-Org-Operating-Model, template-v3/governance/PACKS.toml) has the same gap; the Chief of Staff raises it there.
