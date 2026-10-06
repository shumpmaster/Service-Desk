# Decision card — P-001 failure-5

item: P-001   kind: project   gate: failure   card: 5   route: attempts
answer: write `decisions/P-001/failure-5.md`, first line `Decision: <word>` (one of the words below).

## 1. The decision
The work could not go on. What happens next?

## 2. Why it's yours
Route `attempts` of governance/ROUTING.toml (model S-012) sends this card to the owner. Two attempts in a row ended without a return (the last: error).

## 3. Background
- stage 3, role definer, last verdict none
- plan round 0, build round 0, confirm used: no
- sessions this stage: 2 of 12
- spec: S-001
- `retry` returns to stage 3, role definer

## 4. Options
- `retry` — back to where the work stopped.
- `re-specify` — a new spec superseding the current one, back to the Definer (stage 3), who also marks the old spec superseded, with a ledger entry from the Orchestrator (model S-013 AC7), rounds reset; a strike (research: back to the Researcher, rounds reset).
- `drop` — closed (drop). A `Proxy:` line is refused on this word.

## 5. Recommendation
The Chief of Staff's part: `decisions/P-001/failure-5-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- the status file: `status/P-001.toml`
- the spec: S-001
