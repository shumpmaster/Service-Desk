Ruling: A — fix the pack: the plan reviewer may read the item's experiment registrations and is given its own earlier plan review

Question: questions/P-005-critic-pack.md (filed in #443, removed here)
Milestone: M6, M7, M8

Question, as put: Should the timeline's plan reviewer be allowed to see the item's own experiment files and its own earlier plan review? Not having them was the main cause of the three failed reviews. On the timeline's case this adds exactly three files to its pack, and nothing it shouldn't see. This is a governance change (R3), irreversible under the desk's risk rules.
Options, as put: "Fix the pack (Recommended)"; "No fix".
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGKbJwQiq23S3G2JJet) on 2026-11-14 at about 04:58Z, after #443 put the question file on the default branch. The owner chose the option by the session's question tool.

## The owner's words, verbatim
"Fix the pack (Recommended)"

## How it is carried out
- governance/PACKS.toml, `[roles.critic]`: `may_read` gains `experiments/{item}-*.md`; a new `include_feedback = ["reviews/{spec}/plan.md"]`. `must_read` and `must_not_see` are unchanged.
- Measured with `governance/checks/session_runner.py pack` for the define-to-plan-review entry (P-005, S-010) on P-005's tree: 1,167 files before, 1,170 after; the three added are experiments/P-005-E1.md, experiments/P-005-E2.md and reviews/S-010/plan.md.
- The model's template has the same gap: Personal-Org-Operating-Model docs/LESSONS.md, LL-054 (#59). Ledger L-0053.
