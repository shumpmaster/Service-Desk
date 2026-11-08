Verdict: FAIL

I checked the spec against the plan (docs/projects/P-003.md), the sizing findings, the join-up review form, the cited library entries and the answer records. The rule's design holds together. Three things stop it being frozen.

**Blocking findings**

1. **The join-up review section does not follow the required form.**
   - The form is docs/design/JOIN_UP_REVIEW.md, lines 12–23. The spec's own section (specs/S-004.md:149–158) says the form was not in the definer's pack, and it is in this one.
   - It has no "Screens checked:" list and no "Fix" column. It has no "Needed changes to the records" line. It also swaps the "Consistent type, spacing and codes" row for "Consistent wording". The `Passes` ratings are not given as pass or blocking/non-blocking differences either.
   - The board and notices carrying no "not shown" line (S-004.md:156) is a real difference between views. It should be rated as a finding and carried as a risk. The spec does carry it as a risk (:194), but not in the form's rating.
   - Rewrite the section in the form's shape.

2. **A claim the pack cannot support: the risk that a shown card goes back to held is called "rare".**
   - The claim is at specs/S-004.md:198. The hold is meant to stop a new card appearing before its notes exist.
   - AC7 (:36) and J3 (:107) show a card at once, and notify, whenever the log has no `card` entry for it. That includes a brand-new card whose entry has not landed yet. If the entry arrives later with a raise time under a day old, the card goes back to held and its notice opens to "gone".
   - Nothing in the pack says in what order a card file and its `card` entry reach the main branch. "Rare" therefore cannot be checked.
   - AC13(b) (:51) builds a test around exactly this case, so the author knows it can happen.
   - The plan's wording is "raise time is not recorded (older than the log the desk reads)" (docs/projects/P-003.md:21). The spec widens this to any missing entry. It should either support "rare" with evidence or name this as a case that can show the original defect again.

3. **Claims that rest on a review file I cannot see.**
   - reviews/S-004/plan.md is not in the pack (the glob for reviews/ found nothing).
   - The spec relies on it for the "as the first plan review read it" citations: notifyview.js:337 (:59, :175, :185), the quotations matching lines 17–19 of the ruling record (:18), and the finding numbering (:13, :15).
   - The sizing findings back some of these: the tests folder at :41, the new read at :28–29, and the "gone" behaviour at :67. The notifyview.js:337 line is only partly covered, since the findings cite it second-hand.
   - governance/risk-paths.toml:20–24 is also not in the pack. It is cited through docs/PROJECT.md:616, which does contain it.
   - Under "an unverifiable claim is a FAIL", this blocks. Either give me the review file, or cite only what the pack holds.

**Non-blocking findings (carry them as risks)**

4. **The held-too-long count cannot find anything while the rule is unchanged.**
   - The spec says so itself (AC13, :55; J6, :134). For any card, the state at its due time is "shown" by construction, and the first half of V6 is not measured after launch.
   - This is disclosed and the plan asks for it (docs/projects/P-003.md:98). I am not failing on it, but the Launch gate should read it as "V6 cannot go red from the records".

5. **A far-future raise time holds a card longer than the plan's own claim.**
   - This contradicts docs/projects/P-003.md:122 ("every held card shows within a day or at once") and the Intent "never hidden for more than a day" (:137).
   - The spec discloses it (S-004.md:83, :191, open question 2), and I accept that. Please make sure the owner reads it as a plan-level deviation.

6. **Three baseline-dependent criteria rest on an unknown.**
   - AC14, AC15 and AC17 depend on behaviour of the sender and of notifyview that the definer says it has not seen (:185).
   - Recording a baseline run is a sound way to handle that. The fallback "stop and return" (:58) is a cost the owner should know about.

7. **The size is close to the stop rule.**
   - The estimate is 90–130 lines and 15–23 tests, against a stop rule of 24 tests (:179, :204).
   - Per docs/projects/P-003.md:100, a third failed plan-review round stops the work and goes to the owner. If this FAIL counts as that third round, the Orchestrator should apply the stop rule.

**Checks that passed**
- The spec header names M4, which is the milestone in the plan (docs/projects/P-003.md:46). The plan is the right item's document.
- The plan approval is dor-4.md ("proceed"). The criteria-wrong ruling is stop-6.md, which matches the supersession note.
- The J2 examples match the real note forms in the sizing findings at :32–39. That includes the bare-heading Q-003 case, which gives no word.

**Open questions**
1. Does a card's `card` entry normally reach the main branch in the same commit as its card file, or after it? That decides whether finding 2 is real.
2. Is a missing entry on a fresh card meant to show it at once? Or does the plan's "older than the log" mean only cards older than the part of the log the desk reads?
3. Can the missing reviews/S-004/plan.md be added to the pack, so the "as the review read it" citations can be checked?