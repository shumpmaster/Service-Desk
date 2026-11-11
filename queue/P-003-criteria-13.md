# Decision card — P-003 criteria-13

item: P-003   kind: project   gate: criteria   card: 13   route: gate-view
answer: write `decisions/P-003/criteria-13.md`, first line `Decision: <word>` (one of the words below).
Milestone: M4

## 1. The decision
The Build gate: the plan review passed. The case for freezing the criteria and moving into Build is in the gate document. Proceed, hold, recycle or kill?
The Build gate, case 3.

## 2. Why it's yours
Route `gate-view` of governance/ROUTING.toml (model S-012) sends this card to the owner. The plan review passed; the acceptance criteria need the owner's approval.

## 3. Background
- stage 3, role critic-gate, last verdict none
- plan round 1, build round 0, confirm used: no
- sessions this stage: 0 of 12
- spec: S-007 (supersedes S-002, S-003, S-004, S-005, S-006)

## 4. Options
- `proceed` — the Build gate is passed: the Definer freezes the spec (stage 3, definer-freeze), as `approve` does; with a line `Nothing needed: Build`, on a case holding "Nothing needed in Build", the frozen return then passes Build with nothing needed (a `Proxy:` line is refused with it).
- `hold` — not yet: nothing moves; the Chief of Staff updates the case under the next number, the Critic reads it again, and a fresh card follows (needs a `Reason:` line).
- `recycle` — back into Design (`Into: Design`: the Definer, stage 3, same spec) or Discovery (`Into: Discovery`: stage 2, then a dor-fail card), as its next iteration, with a `Reason:` line; rounds reset.
- `kill` — the project is closed (kill). A `Proxy:` line is refused on this word.
Also accepted, as before:
- `approve` — the Definer freezes the spec (stage 3, definer-freeze).
- `revise` — back to the Definer (stage 3).
- `stop` — closed (stop). A `Proxy:` line is refused on this word.

## 5. Recommendation
The Critic: **The Critic's recommendation:** proceed. The case's recommendation to proceed is supported. The corrections below should be made before the owner reads it, and none of them changes the substance. The remaining risk is the one the case already names. Today's sender and desk behaviour (src/) is outside every pack, so AC9 and AC14 to AC17 can only be tested against a baseline run in Build. Build stops if that run needs a change to src/notify/**.
The user representative: not needed. The brief records that the owner is the user (docs/projects/P-003.md, section 9).
The proposer's recommendation is in section 1 of the case. The Chief of Staff's part: `decisions/P-003/criteria-13-notes.md`.

## 6. If you don't decide
Nothing moves: the item waits on this card. Waiting never counts as stalled and never uses the budget (model S-012 AC6).

## 7. Who has checked it
- the case: `docs/gates/P-003/build-gate-3-case.md` (default branch)
- the Critic's view: `reviews/P-003/_build-gate-3-critic.md` (branch item/P-003)
- the plan review, with Design's join-up review: `reviews/S-007/plan.md` (branch item/P-003)
- the recorded return: `reviews/P-003/_build-gate-3-critic.md`
- the status file: `status/P-003.toml`
- the spec: S-007

## Context
- stage 3, role critic-gate, last verdict none (source: status/P-003.toml)
- plan round 1, build round 0 (source: status/P-003.toml)
- the spec, S-007 (source: specs/S-007.md)
- the Build gate's case 3 (source: docs/gates/P-003/build-gate-3-case.md)
