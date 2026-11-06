I've finished checking the case against its records and am now writing the Critic section.

## The Critic's independent view

The case is mostly accurate, and the brief it asks the owner to move on passed its readiness check. I found three faults, none of them about the substance of the fix.

- **Over the word cap.** Sections 1 to 8 run to roughly 480 counted words. The form allows 350.
- **Standard visuals missing.** The form asks for visuals in sections 2, 3, 4 and 6: the phase position, the owner's way of working today against the change, fit against limits, deliverable dependencies and the owner-time caps. The case has none. Section 4 has no dependency visual even though D2 depends on D1 (project document, line 39).
- **Weak support for one claim.** The first claim in section 8 rests on a line that doesn't say it.

The Design gate asks the owner to approve M4 and the standard lines. Section 8 gives M4's target and refers to the standard lines. It never states M4's name, its "done when" or its why, so the owner is asked to approve a milestone the case doesn't show.

**The Critic's recommendation:** recycle into Design. The substance supports proceeding: the readiness check passed, the cost is $0 at tier T1, and the risks have answers. But the case breaks its form on length and visuals, and the owner can't see the milestone they are asked to approve. Fix the case and resubmit it. This is not a call to redo Discovery. I'd expect a corrected case to support proceed.

**Citation check:**
- **Section 8, line 47.** "The brief is settled" cites `docs/projects/P-003.md:3`. That line says Part 1 *is settled when the owner approves* the move, so it describes a future condition and doesn't report that the brief is settled. The brief's real status is the readiness pass in `reviews/P-003/_critic-dor.md`.
- **Section 1, line 6.** "Nothing is built until the Build gate, which you rule" cites lines 56, 61 and 44. Line 44 is the M4 line (phase: Build), and it doesn't say the owner rules the Build gate. Line 71 does say it.
- **Section 1, line 8.** "No unknown is left open" cites line 107 of the project document, which says so. The brief itself notes that the sizing reading was briefed from draft 1 and is not independent (line 97). The case doesn't pass that limit on to the owner.
- **Section 3, line 19.** The dry-run claim holds: `_critic-dry-run-1-verbatim.md` is a FAIL for borrowing from `docs/PROJECT.md`, at lines 45 to 49.
- **Section 6, line 38.** The 91,414 tokens match line 3 of the sizing findings.
- **Section 1 and appendix.** The error, the two fails and the pass match the dispatch log.
- **Appendix, line 54.** The second resubmit was a proxy answer at the owner's request. That matches `decisions/P-003/dor-fail-2.md`.
- **Sections 5, 6 and 7.** The remaining lines I checked match lines 79 to 105 of the project document.
- **Visuals.** There are none, so no drawing can be checked against its text alternative.

**Milestones:**
- **Block and milestone lines.** The block shows Discovery only. M4 isn't in it, which is right for a Build-phase milestone with no sprint yet. I could not check the block against `v3_checks gates` output.
- **Discovery-1 and Discovery-6 (taken on).** They read "not recorded". The case discloses this in section 5, and by the rules it is not a finding.
- **Discovery-3 and Discovery-4 (skipped).** They read "not reached" and "not recorded". The case discloses this at appendix line 56. Skipped steps are not findings.
- **Discovery-2, 5, 7 and 8.** They read "reached". The records support that.
- **M4's line.** The name and "done when" read as achievements, and the why is plain.
- **M4's gaps.** The case never shows M4 to the owner. Its "done when" is long and bundles several states.
- **Design standard lines.** Their records say the owner rules them again at this gate. The case doesn't show Design-1 to Design-6 or their taken-on and skipped calls, apart from the pointer to the standard-lines ruling.