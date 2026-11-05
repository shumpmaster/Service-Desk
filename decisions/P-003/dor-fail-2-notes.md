# Chief of Staff's notes — P-003 dor-fail-2

**Recommendation: `resubmit`, but not yet.** Hold this card until a dry run of the readiness check
passes on the revised plan, with the real pack. As on card 1, this card's `resubmit` may be given by
the Chief of Staff (governance/ROUTING.toml, [gates.dor-fail]); it gives it in a record of its own
once the dry run passes and the revised plan is on main. **This is P-003's second FAIL; a third sends
it to Triage and a stop card**, so the next real check must be the one that passes.

## How this card came about
Card 1 was answered `resubmit` on 2026-11-04 at 20:39 UTC (decisions/P-003/dor-fail-1.md, commit
cbe714a), before card 1's notes and draft 2 of the plan reached main (pull request #294, merged 21:00).
The Orchestrator (run gha-41910243764-1) sent the check out again at 20:43 on draft 1, and the Critic
returned FAIL at 20:53 (reviews/P-003/_critic-dor.md, item/P-003 at 2ef6e3a). Draft 2 had already
failed its own dry run (reviews/P-003-dor-dry-run/), so nothing in this FAIL is new work lost.

## The real check's findings, and where each is answered
1. **No Discovery or Design standard lines in section 3** (blocking; model S-032). The same as the
   dry run's first finding. Needs the owner's ruling on those lines; asked after S-035 is adopted,
   with P-003's own-plan rewrite.
2. **The M4 line passes on its form.** No change, except its why, which is reworded (finding 3).
3. **Claims with no record in the check's files**: the M4 line's Critic record, the notes files, the
   code lines, and the why "answered the opposite way". Draft 2 already cites records in the pack
   where they exist; the why is reworded to what the records show and checked again; what stays
   outside the pack is named as such.
4. **The sizing is not independent of the brief.** The rewrite cites the sizing findings as a
   helper's reading, says plainly that it agreed with the brief, and lists what it added.
5. **Section 9 is fine.** No change.
6. **Card 1's answer gives no reasons.** True of every card answer; context only.
- **The open questions** (whether Part 1's standard lines cover P-003; the shared-brief ruling's
  record) are settled by S-035's own-plan form, which gives P-003 its own plan, lines and measure.

## Next (unchanged from card 1's notes)
1. S-035 is built and the desk adopts it. 2. P-003's plan is rewritten in S-035's own-plan form, and
the owner rules on the Discovery and Design standard lines; Part 1's stale statuses are tidied.
3. A dry run on the real pack passes. 4. The Chief of Staff answers `resubmit`. If the owner wants
P-003 before S-035's adoption, the Chief of Staff puts that choice to the owner.

## Update, 2026-11-05: the dry run passes, and this card is answered `resubmit`
P-003's plan was rewritten in its own form (docs/projects/P-003.md, PR #304), the owner ruled its standard
lines (decisions/questions/P-003-standard-lines.md, A), and the dry run with the real pack failed once on
three citations of records outside the pack (reviews/P-003-dor-dry-run/_critic-dry-run-2-verbatim.md),
then passed (_critic-dry-run-3-verbatim.md). The Chief of Staff answers `resubmit` in the same pull request
as the plan the dry run passed, so the real check reads that plan and not an older one, as happened on
card 1. Its check run, later, still needs model S-036 and S-037 at the desk's next model update.
