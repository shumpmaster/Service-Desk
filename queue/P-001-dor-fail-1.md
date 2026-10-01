# Decision card — P-001 dor-fail-1

item: P-001   kind: project   gate: dor-fail   card: 1   route: dor-fail
answer: write `decisions/P-001/dor-fail-1.md`, first line `Decision: <word>` (one of the words below).

## 1. The decision
The project failed the definition-of-ready check. Resubmit a revised project document, or stop?

## 2. Why it's yours
Route `dor-fail` of governance/ROUTING.toml (model S-012) sends this card to the chief-of-staff or owner. The project failed the definition-of-ready check.

## 3. Background
- stage 2, role critic, last verdict FAIL
- plan round 1, build round 0, confirm used: no
- sessions this stage: 1 of 12

## 4. Options
- `resubmit` — back to the definition-of-ready check (stage 2, the Critic); the plan rounds are kept, so a third FAIL still leads to Triage and a stop card.
- `stop` — closed (stop). A `Proxy:` line is refused on this word.

## 5. Recommendation
The Chief of Staff's part: `decisions/P-001/dor-fail-1-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- the recorded return: `reviews/P-001/_critic-dor.md`
- the status file: `status/P-001.toml`
