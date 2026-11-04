# Chief of Staff's notes — P-003 dor-fail-1

**Recommendation: `resubmit`, but not yet.** Hold the card until a dry run of the readiness check
passes on the revised plan. This card's `resubmit` may be given by the Chief of Staff
(governance/ROUTING.toml, [gates.dor-fail]), so the owner need not answer it; the Chief of Staff
gives it, in a record of its own, once the dry run passes and the revised plan is on main.

Written before the card was raised. The readiness check's return (reviews/P-003/_critic-dor.md, on
the item/P-003 branch, run gha-41906533531-1) is a FAIL, the first for P-003. The try before it was
refused by the pack's size limit and gave no verdict, which the owner's answer B fixed (pull requests
#286 and #287). A third FAIL sends P-003 to Triage and a stop card, so the next try must fix every
finding, not only the first.

## The real check's findings
1. **No document under review.** The check's brief is the general one ("do your role's duties"), with
   no spec, since P-003 has none before its Design gate; the Critic could not tell that P-003's
   section of the project document is its Discovery exit. Answered in draft 2: the section opens
   "This section is P-003's Discovery exit", mapping each of the definition of ready's nine points.
   The general brief is the model's; the gap is a lesson for the model (P-004 meets it too).
2. **A cited review is missing** (the size-limit ruling cites its Critic record under reviews/). Not
   part of P-003's brief; no change.
3. **The M4 line could not be read**, and 5, **long lines hidden**: the Critic searched rather than
   read, and its search hid lines over a few hundred characters. Answered: the prose is wrapped, and
   M4 is given again in parts beside the whole line.
4. **The sizing cites code the check cannot see.** Answered: the section cites the sizing findings,
   not code lines, and names which records sit outside the check's files.
6. **Points on the size-limit ruling card**: context only; no change.

## The dry run (a Critic helper, the real pack built by the session runner), 2026-11-04: FAIL
(reviews/P-003-dor-dry-run/_critic-dry-run-1-verbatim.md)
Draft 2 failed. What it found, and what each needs:
- **Section 3 has no Discovery or Design standard lines** (model S-032). Part 1's section 3 was
  approved before that rule; it holds Build and Launch lines only. Needs Discovery and Design lines,
  which the owner rules at a Design gate. This fails any readiness check on this document today.
- **Where a later-work milestone may sit.** Section 3 says milestones are drafted there in
  Discovery; P-003's is drafted in its Part 2 section, as the owner's ruling carries it out
  (decisions/questions/P-001-card-recommendation.md). Model S-035, approved today (L-0152 in the
  model), gives later work a plan of its own, which settles this.
- **Part 1 contradicts itself** in places P-003 borrows: O5 both closed and open; V4 both dropped and
  dated; "proposed" and "not yet approved" on things the owner has since ruled. Part 1 needs a
  tidy pass, recorded against the owner's rulings.
- **P-003's own value and stop rule** are borrowed from Part 1, whose stop rule is about the desk's
  first launch. S-035's own-plan form gives P-003 its own measure, target, date and miss.
- **Claims not backed in the check's files**: answered in draft 2 where a record in the pack exists
  (the card-fix ruling for M4's place; the sizing findings for the notes' recommendations). The M4
  line's why ("the opposite way to what they meant") is the Critic-checked line's own wording; the
  records show the cards answered against the notes, not the owner's intent, so its why is reworded
  before the gate and the line checked again.
- **Owners and limits**: draft 2 now names the hand-written card sheet and the notification sender's
  reach. Open: whether the sender's files change, which would need the owner's approval.

## Next
1. S-035 is built and the desk adopts it. 2. P-003's plan is rewritten in S-035's own-plan form,
with its own measure and stop rule, and Part 1 gets its Discovery and Design standard lines (an owner
ruling) and its tidy pass. 3. A dry run on the real pack passes. 4. The Chief of Staff answers
`resubmit`. If the owner wants P-003 sooner than S-035's adoption, the alternative is the same
fixes inside this document as it stands; the Chief of Staff would put that choice to the owner.
