# Decision card — P-001 stop-6

item: P-001   kind: project   gate: stop   card: 6   route: triage-return
answer: write `decisions/P-001/stop-6.md`, first line `Decision: <word>` (one of the words below).

## 1. The decision
The work reached the stop rule. What happens next?

## 2. Why it's yours
Route `triage-return` of governance/ROUTING.toml (model S-012) sends this card to the owner. Triage traced the failure chain to its root cause; its recorded return is linked below.

## 3. Background
- stage 3, role critic-triage, last verdict none
- plan round 3, build round 0, confirm used: no
- sessions this stage: 6 of 12
- spec: S-001

## 4. Options
- `re-specify` — a new spec superseding the current one, back to the Definer (stage 3), who also marks the old spec superseded, with a ledger entry from the Orchestrator (model S-013 AC7), rounds reset; a strike (research: back to the Researcher, rounds reset).
- `criteria-wrong` — a new spec superseding the current one, back to the Definer (stage 3), who also marks the old spec superseded, with a ledger entry from the Orchestrator; rounds reset; not a strike.
- `confirm` — one focused check by the stage's checker, round set to 2 (offered once).
- `re-scope` — closed (re-scope). A `Proxy:` line is refused on this word.
- `drop` — closed (drop). A `Proxy:` line is refused on this word.

## 5. Recommendation
The Chief of Staff's part: `decisions/P-001/stop-6-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- the recorded return: `triage/P-001.md`
- the status file: `status/P-001.toml`
- the spec: S-001
