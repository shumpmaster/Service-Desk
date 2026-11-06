# Chief of Staff's notes — P-003 dor-3 (the Design gate, gate 1)

**Recommendation: `hold`.** The case is fixed and read again, then comes back to you as a new card.
The record's lines would be:
```
Decision: hold

Reason: the case breaks its form (length, visuals) and does not show the milestone and Design lines I am asked to approve; fix it and have it read again
```
`proceed` is a fair answer too: the gate Critic says the substance supports it and that it would expect a
corrected case to support proceed. I recommend `hold` because the gate asks you to approve M4 and the
Design standard lines, and the case shows neither; you would be approving what you have not been shown.

## What the gate Critic found (reviews/P-003/_design-gate-1-critic.md on item/P-003, run gha-42250777923-1)
Its recommendation is "recycle into Design", which is not a word this gate allows (the Design gate recycles
only into Discovery, decisions/README.md); what it asks for, "fix the case and resubmit it", is what `hold`
does ("the case is updated and read again", OPERATING_MODEL.md, Phase gates). Its findings:
1. **Over the word cap**: about 480 words in sections 1 to 8, against about 350.
2. **No visuals**: none of the phase position, today against the change, fit against limits, D1 before D2,
   and the owner-time caps.
3. **M4 not shown**: section 8 gives its target but not its name, its "done when" or its why; the Design
   standard lines (Design-1 to 6) are only pointed to.
4. **Three citations**: "the brief is settled" cites a line about a future condition (cite the readiness
   pass instead); "the Build gate, which you rule" should cite docs/projects/P-003.md:71; "no unknown is
   left open" should pass on that the sizing reading is not independent of the brief (line 97).
Every other citation it checked holds.

## Why the dry runs missed this
The case passed its third dry run (reviews/P-003-design-gate-dry-run/), on a pack assembled by hand. The
pipeline's critic-gate pack evidently carries the gate case's form (the word cap and the visuals), which the
hand-built pack did not. The next dry run uses the pipeline's own pack, or holds the form explicitly.

## On `hold`, next
1. The Chief of Staff rewrites docs/gates/P-003/design-gate-1-case.md: about 350 words before the appendix;
   M4's line and the Design-1 to 6 calls shown; the visuals, each with a text alternative, from the same
   records; the three citations fixed.
2. A Critic dry run with the form in its pack, to a pass.
3. The case on main; the pipeline's gate Critic reads it again; a new card (dor-4) reaches you, with notes.
Nothing about the fix itself changes, and nothing is irreversible.

## Update, 2026-11-06: answered `hold`
The owner answered `hold` (decisions/P-003/dor-3.md, commit e296ee8) before these notes reached main, with
an empty `Reason:` line, which a hold cannot be read without. At the owner's request ("You are good to fill
it in for me, use the reason as what you described") the Chief of Staff filled in the reason given above,
under a `Proxy:` line. The desk's answer box starts a hold with an empty `Reason:` line and warns only in its
own check, so a record made straight on GitHub can miss it: a lesson for the desk.
