Ruling: A — fix the pack: the Definer may read the item's experiment registrations and the owner's answers filed under the item's name

Question: questions/P-005-definer-pack.md (filed in #446, removed here)
Milestone: M6, M7, M8

Question, as put: "Let the spec writer (Definer) see the item's own experiment files and your answers filed under the item's name, so it can re-point E1/E2 from S-010 to S-011 and act on your answers? Governance change (R3), irreversible, never defaults. (questions/P-005-definer-pack.md)"
Options, as put: "Fix the pack (Recommended)"; "No fix".
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGL7cLBqyQ4o1BxNuyh) on 2026-11-14 at about 14:47Z, after #446 put the question file on the default branch. The owner chose the option by the session's question tool.

## The owner's words, verbatim
"Fix the pack (Recommended)"

## How it is carried out
- governance/PACKS.toml, `[roles.definer]`: `may_read` gains `experiments/{item}-*.md` and `decisions/questions/{item}-*.md`. `must_read`, `must_not_see` and `include_feedback` are unchanged.
- Measured with `governance/checks/session_runner.py pack` for the plan-fail entry (P-005, S-011), on the source tree `orchestrator_git.py tree` builds for P-005 from main at 4ae7d08 and item/P-005 at a8e9274: 224 files before, 240 after. The 16 added are experiments/P-005-E1.md and -E2.md and the 14 records decisions/questions/P-005-*.md then on main; this pull request's three answers add three more once merged.
- Ledger L-0055. The operating model's template has the same gap (its Definer's pack), to be raised there.
