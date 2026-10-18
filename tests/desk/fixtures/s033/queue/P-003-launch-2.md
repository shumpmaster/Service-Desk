# Decision card — P-003 launch-2

item: P-003   kind: project   gate: launch   card: 2   route: launch-gate
answer: write `decisions/P-003/launch-2.md`, first line `Decision: <word>` (one of the words below).

## 1. The decision
The Launch gate: the launch review passed. The case for going live and graduating the product, with its own monitoring and feedback confirmed running, is in the gate document. Proceed, hold, recycle or kill?
The Launch gate, case 2.

## 2. Why it's yours
Route `launch-gate` of governance/ROUTING.toml (model S-012) sends this card to the owner. 

## 3. Background
- stage 6, role critic-gate, last verdict PASS
- plan round 1, build round 1, confirm used: no
- sessions this stage: 3 of 12

## 4. Options
- `proceed` — the Launch gate is passed: the product goes live and graduates (done), as `approve` does. A `Proxy:` line is refused on this word.
- `hold` — not yet: nothing moves; the Chief of Staff updates the case under the next number, the Critic reads it again, and a fresh card follows (needs a `Reason:` line).
- `recycle` — back into Launch (`Into: Launch`: the Builder, stage 6), Build (`Into: Build`: the Builder, stage 5, or the Check author, stage 4, when Build was passed with nothing needed), Design (`Into: Design`: a new spec superseding the current one, stage 3, the Definer, not a strike) or Discovery (`Into: Discovery`: stage 2, then a dor-fail card), as its next iteration, with a `Reason:` line; rounds reset.
- `kill` — the project is closed (kill). A `Proxy:` line is refused on this word.

## 5. Recommendation
The Critic: **The Critic's recommendation:** proceed — the launch review passed.
The proposer's recommendation is in section 1 of the case. The Chief of Staff's part: `decisions/P-003/launch-2-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- reviews/P-003/critic-gate.md

## Context
- stage 6, role critic-gate, last verdict PASS (source: status/P-003.toml)
- plan round 1, build round 1 (source: status/P-003.toml)
- the Launch gate's case 2 (source: docs/gates/P-003/launch-gate-2-case.md)

## 8. What approval merges
The item tip is not stamped yet: the commit job writes it here after it pushes the item branch. A launch card without a tip cannot be approved (model S-013 AC4).
