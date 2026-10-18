# Decision card — P-002 stop-1

item: P-002   kind: project   gate: stop   card: 1   route: stop-rule
answer: write `decisions/P-002/stop-1.md`, first line `Decision: <word>` (one of the words below).
Milestone: M2

## 1. The decision
The work reached the stop rule. What happens next?

## 2. Why it's yours
Route `stop-rule` of governance/ROUTING.toml (model S-012) sends this card to the owner. The build round limit is reached.

## 3. Background
- stage 5, role builder, last verdict FAIL
- plan round 2, build round 3, confirm used: no
- sessions this stage: 7 of 12
- spec: S-002

## 4. Options
- `resubmit` — back to the definition-of-ready check (stage 2, the Critic), rounds reset.
- `re-specify` — a new spec superseding the current one, back to the Definer (stage 3), who also marks the old spec superseded, with a ledger entry from the Orchestrator (model S-013 AC7), rounds reset; a strike (research: back to the Researcher, rounds reset).
- `kill` — .

## 5. Recommendation
The Chief of Staff's part: `decisions/P-002/stop-1-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- reviews/S-002/reviewer.md

## Context
- stage 5, role builder, last verdict FAIL (source: status/P-002.toml)
- plan round 2, build round 3 (source: status/P-002.toml)
- the spec, S-002 (source: specs/S-002-made-up.md)
