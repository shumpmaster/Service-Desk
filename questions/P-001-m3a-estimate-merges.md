# Ruling needed: Who merges each new rough estimate?

Milestone: M3A
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: Your Chief of Staff records a new rough estimate whenever work on a milestone moves, likely a few times a week. Each lands as a small pull request. The automatic job may merge only your filed questions, their answers, tidy-ups and the Chief of Staff's notes of its work, so each estimate would wait for your merge and show as waiting on you while open. Left unruled, you merge each one.
OPTIONS:
  A. You merge each one — Nothing changes. Each estimate is a small pull request in your Queue, a few a week; until you merge it, Work ahead shows the estimate before it.
  B. The automatic job merges them too — They land within minutes and never wait on you, like your filed questions. It needs a small operating-model change first, made and reviewed in the model's own project and then taken up here, with a check that an estimate is only ever added, never changed, and your standing permission for the job widened to cover them. Until then, as A.
RECOMMENDATION: B — the estimates are your Chief of Staff's record, not a choice of yours, so they should not take your time.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: how estimates reach Work ahead, and, for B, the operating model's automatic merges
DEFAULT: B   TIMEOUT: 48

## Context
- The Chief of Staff makes one rough estimate per milestone, when it is planned and again as work moves, recorded in Service-Desk with its date (source: decisions/questions/P-001-m3a-estimator.md)
- The estimates go in intake/estimates.jsonl, in the Chief of Staff's lane, added to and never rewritten (source: specs/S-001.md, J14, on branch build/definer/s001-m3a-milestones)
- The automatic job merges only four kinds of pull request: filing a question, closing one with a reversible answer, tidying one away, and adding the Chief of Staff's session lines (source: governance/checks/asks_merge.py:27-38)
- The owner's permission for the job covers only those four kinds (source: docs/LEDGER.md, L-0017)
- Nothing checks today that an estimate line is never changed (source: specs/S-001.md, J14, on branch build/definer/s001-m3a-milestones)
