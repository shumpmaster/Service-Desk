# Decision card — P-003 failure-10

item: P-003   kind: project   gate: failure   card: 10   route: attempts
answer: write `decisions/P-003/failure-10.md`, first line `Decision: <word>` (one of the words below).
Milestone: M4

## 1. The decision
The work could not go on. What happens next?

## 2. Why it's yours
Route `attempts` of governance/ROUTING.toml (model S-012) sends this card to the owner. Two attempts in a row ended without a return (the last: error).

## 3. Background
- stage 4, role check-author, last verdict none
- plan round 0, build round 0, confirm used: no
- sessions this stage: 2 of 12
- spec: S-005 (supersedes S-002, S-003, S-004)
- `retry` returns to stage 4, role check-author

## 4. Options
- `retry` — back to where the work stopped.
- `re-specify` — a new spec superseding the current one, back to the Definer (stage 3), who also marks the old spec superseded, with a ledger entry from the Orchestrator (model S-013 AC7), rounds reset; a strike (research: back to the Researcher, rounds reset).
- `drop` — closed (drop). A `Proxy:` line is refused on this word.

## 5. Recommendation
The Chief of Staff's part: `decisions/P-003/failure-10-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- the status file: `status/P-003.toml`
- the spec: S-005

## Context
- stage 4, role check-author, last verdict none (source: status/P-003.toml)
- plan round 0, build round 0 (source: status/P-003.toml)
- the spec, S-005 (source: specs/S-005.md)
