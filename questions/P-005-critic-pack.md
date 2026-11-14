# Ruling needed: let the plan reviewer see the experiment files a spec cites, and its own earlier review

Milestone: M6, M7, M8

WHY: The timeline's spec failed three plan reviews and reached its stop card. Triage traced the main cause to the plan reviewer's pack, not to the spec: the reviewer never received the two experiment files the spec cites, nor its own earlier review, so it failed every criterion that rests on them as unverifiable. Any new spec for this work, and any spec that cites experiments, would fail the same way. The pack file is a governance file, so this is R3.
OPTIONS:
  A. Fix the pack. In governance/PACKS.toml the Critic's `may_read` gains "experiments/{item}-*.md" (only the item's own experiment registrations), and it gains `include_feedback = ["reviews/{spec}/plan.md"]` (its own earlier plan review, as the Definer already gets). Nothing it must not see changes. Measured on the timeline's plan review: 1,167 files before, 1,170 after, the three added being experiments/P-005-E1.md, experiments/P-005-E2.md and reviews/S-010/plan.md.
  B. No fix. The next plan review of this work fails for the same reason, and the round is spent.
RECOMMENDATION: A. It is the root cause Triage found, the change is three files, and it adds nothing the reviewer should not see.
RISK CLASS: R3 (governance/**)   REVERSIBILITY: irreversible (computed from R3)   BLAST RADIUS: what the plan reviewer receives in every project item here; no other role's pack
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- Triage: the pack for the critic's plan review left out experiments/P-005-E1.md, experiments/P-005-E2.md and reviews/S-010/plan.md, in round 1 and round 3; the Definer's pack did carry the earlier review (source: triage/P-005.md on item/P-005; reviews/S-010/_control/0-a5c0dc6f6815.json, 0-67883f3f4d34.json, 0-052eb42fba0c.json)
- The plan review's main finding: AC40, AC41 and J11 cite experiment files "not in the pack" (source: reviews/S-010/plan.md on item/P-005)
- The Critic's pack today: no experiments/ path, and no include_feedback (source: governance/PACKS.toml, `[roles.critic]`)
- The same kind of pack gap was fixed for the Check author on your ruling (source: docs/LEDGER.md, L-0039)
- Measured with `governance/checks/session_runner.py pack` for the define-to-plan-review entry on P-005's tree: 1,167 files before, 1,170 after (source: this session)
- The same gap is in the operating model's template, to be raised there (source: Personal-Org-Operating-Model template-v3/governance/PACKS.toml, `[roles.critic]`)
