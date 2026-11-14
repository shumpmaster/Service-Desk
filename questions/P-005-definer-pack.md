# Ruling needed: let the timeline's spec writer see the item's experiment files and the owner's answers on it

Milestone: M6, M7, M8

WHY: The spec writer (the Definer) cannot see two things the timeline's spec now needs. First, the two experiment registrations still name the superseded spec S-010; only the Definer may change them, but its pack does not hold them, so it cannot re-point them, and the plan reviewer says that must happen before the spec freezes. Second, answers the owner gives on the spec's open questions are recorded under decisions/questions/, which the Definer's pack does not hold either; only a stop card's decision reaches it. Without this, the Definer's third round (the last before a stop card) cannot act on either. The pack file is a governance file, so this is R3: the same kind of fix as the plan reviewer's pack on 14 November.
OPTIONS:
  A. Fix the pack. In governance/PACKS.toml, the Definer's `may_read` gains "experiments/{item}-*.md" (only the item's own registrations) and "decisions/questions/{item}-*.md" (only the owner's answers filed under the item's name). Nothing else changes. On the timeline's tree that adds experiments/P-005-E1.md and -E2.md and the owner's P-005 answers.
  B. No fix. The registrations keep naming S-010, and answers reach the Definer only through a stop card. The third round very likely fails on the same findings, and the work reaches stop card 5.
RECOMMENDATION: A. It is the smallest change that lets the Definer act on the review's findings, and it adds only records about this item.
RISK CLASS: R3 (governance/**)   REVERSIBILITY: irreversible (computed from R3)   BLAST RADIUS: what the Definer receives in every project item here; no other role's pack
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The plan review, round 2: "The registrations still name S-010 … The re-point must happen before the freeze, not after" (source: reviews/S-011/plan.md on item/P-005, finding 5)
- The spec: re-pointing the registrations "is outside what this definer can do from this pack … that is for the Chief of Staff to route" (source: specs/S-011.md on item/P-005, open question 3)
- The Definer's pack today: `may_read` is specs/**, library/patterns/** and docs/design/JOIN_UP_REVIEW.md; its feedback is reviews/{spec}/plan.md and decisions/{item}/*.md (source: governance/PACKS.toml, `[roles.definer]`)
- The `{ruling}` in its `must_read` is set only for a project request entering at Build or Design, not for a plan round (source: governance/checks/orchestrator.py, `later_work_problem`; governance/checks/session_runner.py)
- experiments/** is the Definer's surface (source: governance/SURFACES.md, `surface:definer`)
- The plan reviewer's pack gained experiments/{item}-*.md on the owner's ruling "Fix the pack (Recommended)" (source: decisions/questions/P-005-critic-pack.md; docs/LEDGER.md, L-0053)
