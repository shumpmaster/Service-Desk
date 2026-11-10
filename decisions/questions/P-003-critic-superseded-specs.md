Ruling: A — approve the fix: the Critic may read specs/**, so it can check what a new spec carries forward

Question: questions/P-003-critic-superseded-specs.md (filed in #346, removed here)
Milestone: M4

Question, as put: The new spec, S-006, failed its plan review three times. Every round, the Critic said it couldn't check your 'carry S-005 forward unchanged' ruling, because it isn't given S-005. Only the spec under review goes in its folder, while the Definer reads every spec. The third review also found two small wording slips in AC13. Should I let the Critic read the earlier specs? (Filed as questions/P-003-critic-superseded-specs.md in PR #346.)
Options, as put: A: approve the fix (Recommended); B: no fix; C: attach a diff instead.
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGN37HCacjWVWzYVhq5) on 2026-11-10, after the question file was pushed to #346, the pull request it was filed in. The owner chose the option in the session. The question file was not yet on the default branch when it was put; this record and the file's removal land in the same pull request.

## The owner's words, verbatim
"A: approve the fix (Recommended)"

## How it is carried out
- governance/PACKS.toml, `[roles.critic]`: `may_read` gains `specs/**`, which the Definer already reads. `must_not_see` (docs/reports/**, docs/briefs/**) is unchanged. The critic-triage and critic-gate roles have their own entries and are unchanged.
- Measured: `session_runner.py pack` for the plan-review entry (P-003, define-to-plan-review, S-006) on item/P-003 gives specs/S-006.md only before the fix. After it, the pack holds specs S-002 to S-006, specs/_TEMPLATE.md and the stray specs/S-005.facts.tmp, and no other file changes.
- The model (Personal-Org-Operating-Model, template-v3/governance/PACKS.toml) has the same gap; the Chief of Staff raises it there.
