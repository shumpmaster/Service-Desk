# Spec <id> — <title>

status: draft | frozen | superseded   frozen_at: <commit>   workstream: <name>
work-type: <experiment | feature | fix | refactor | ui | infra | spike>   design_id: <id>   lineage: [<prior ids>]
mechanism: <one sentence: how this achieves the goal>
problem: <why; who is affected>

## Acceptance criteria (scenarios; owner-approved)
Each criterion is a plain scenario with a traceability ID linking it to the project's value target.
- AC1 [trace: V1 → AC1] — When …, then …

## Join sheets
For every connection between pieces: what one piece hands the other, its exact form, and examples
including awkward cases.
- **J1 —** <piece A> → <piece B>: <what is handed over, its exact form>. Awkward cases: <…>. A test marked `join-test: <spec id>/J1` covers it.

## Areas touched
*The areas (path globs) this work may change, comma-separated. CI checks the work stays inside them.*

## Facts relied on (each with evidence)
- <fact> — evidence: <file:line | command + output | spike or research memo>
- Known limits: <each with evidence, or "none that rest on unverified platform behaviour">

## Risks and mitigations

## Stop rule, rollback, cost
stop rule: plan rounds and build rounds, three each   rollback: <step>   cost: <budget>

## Open questions for the owner

---

## Brief for the surface owner
spec: specs/<id>.md (frozen @ <commit>)   surface owner: <agent id>   budget: <…>
Locked checks (read-only): <path>   In scope: the areas touched   Out of scope: everything else
Return: the six-part contract.
