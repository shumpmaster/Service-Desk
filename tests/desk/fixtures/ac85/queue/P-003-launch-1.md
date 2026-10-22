# Decision card — P-003 launch-1

item: P-003   kind: project   gate: launch   card: 1   route: launch-gate
answer: write `decisions/P-003/launch-1.md`, first line `Decision: <word>` (one of the words below).

## 1. The decision
The Launch gate: the launch review passed. The case for going live and graduating the product, with its own monitoring and feedback confirmed running, is in the gate document. Proceed, hold, recycle or kill?
The Launch gate, case 1.
You rule on the gate and on the user representative's verdict.

## 2. Why it's yours
Route `launch-gate` of governance/ROUTING.toml (model S-012) sends this card to the owner. NOT a real record: made up for AC85's test.

## 3. Background
- stage 6, role user-rep, last verdict PASS
- plan round 1, build round 2, confirm used: no
- sessions this stage: 3 of 12

## 4. Options
- `proceed` — the Launch gate is passed: the product goes live and graduates (done), as `approve` does.
- `hold` — not yet: nothing moves; the Chief of Staff updates the case under the next number, the Critic reads it again, and a fresh card follows (needs a `Reason:` line).
- `recycle` — back into an earlier phase as its next iteration (`Into: <Phase>` and a `Reason:` line); rounds reset.
- `kill` — the project is closed (kill). A `Proxy:` line is refused on this word.

## 5. Recommendation
The Critic: **The Critic's recommendation:** recycle into Design — the handover package names no on-call hours, and the sign-up asks for a card before a sample letter.
The user representative (a simulation, not real users): **The user representative's verdict:** reject — "I'd leave at the card form. Show me a letter first."
The proposer's recommendation is in section 1 of the case. The Chief of Staff's part: `decisions/P-003/launch-1-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- the case: `docs/gates/P-003/launch-gate-1-case.md` (default branch)
- the Critic's view: `reviews/P-003/_launch-gate-1-critic.md` (branch item/P-003)
