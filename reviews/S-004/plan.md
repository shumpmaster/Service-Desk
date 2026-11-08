Verdict: FAIL

I checked the spec against its plan (docs/projects/P-003.md), the sizing findings, and the owner's records. The quotations in the spec's "The defect" section match decisions/questions/P-001-card-recommendation.md:17-19. The "criteria-wrong" ruling is in decisions/P-003/stop-6.md:1-3. The header's `milestones: M4` is the one milestone in plan §3 (line 46). The spec fails on the monitoring criterion, which contradicts itself and measures nothing.

## Blocking finding

**1. AC13 and J6 give a count that can never find a held-too-long card (specs/S-004.md:51, 78, 102, 123).**
- J6 (line 78) defines a held-too-long miss as a card whose state is `held` when the rule is run at its raise time plus 24 hours.
- The age rule (line 23) says an age of 24 hours or more counts as "a day ago or more", and AC4 (line 31) shows such a card.
- At exactly raise time plus 24 hours the age is exactly 24 hours, so the rule gives `shown`. The state is therefore never `held` at the moment J6 tests.
- The same holds for the future-dated raise time. J6 calls it a held-too-long miss "once its raise time plus 24 hours is past", and Risks (line 102) and open question 2 (line 123) say the count will find it. At that moment the age is again 24 hours, so the rule shows the card and the count reports no miss.
- So the count can only report 0. It does so because the rule is run against its own boundary, not because the desk behaved. AC13's claim that the count "can find a held-too-long card" is false as written.
- This is the half of V6 the spec says it can measure, and it was the plan's "monitoring criterion" (plan §6, line 98). The spec must define the miss on something the rule's output can actually show. One option is the card's real hold, measured against a read at a moment before the 24-hour mark. Open questions 2 and 4 (lines 123 and 125) and the AC18 operating notes (line 52) depend on the same wrong claim.

## Non-blocking findings (carry to the gate as risks)

**2. Join-up review, Design (not in the spec, so added here).** The spec has no join-up section in the docs/design/JOIN_UP_REVIEW.md form. The views are the queue, Home's count, the board, the card sheet and notifications. This project has no design files.

| Check | Result | Fix |
|---|---|---|
| One meaning per status signal | Mostly passes. The "No Chief of Staff recommendation yet" mark appears only on the card sheet (AC4, line 31). The queue row, the board, Home and the notice show neither the word nor the mark. | Non-blocking: say so in the case. |
| One navigation | Passes. Nothing new is added. | None. |
| Consistent wording | The three "not shown" lines (AC16, AC17, lines 38-39) are on the queue and Home only. The board and notices show nothing, so a card is silently missing there. Plan §2 and the Intent (line 138) say the owner would hate a card "silently missing". | Non-blocking: carry as a risk. |
| No two screens doing the same job | Passes. J4 and AC11 make every view take the one card list. | None. |
| Data available from the records | Passes. The only new read is the notes blob (sizing findings §3). | None. |

**3. Wording on repository reads.** AC10 and AC12 (lines 43, 50) say the desk reads notes "through the repository reads it already makes" and needs nothing new. The sizing findings (lines 28-29 of research/P-003-sizing-findings.md) say a new record kind and a new blob read per card with notes. This is the same mechanism but not the same reads. Reword it so a check author does not treat any new read as a breach.

**4. Hard-to-verify claims rest on records that are not in this folder.**
- The plan reviews, reviews/S-003/plan.md and reviews/S-004/plan.md, and specs/S-003.md are not in this folder. The spec says openly that it relies on them second-hand (line 99).
- The source files (notifyview.js, model.js and others) are not in this folder either. AC9 and AC14 to AC17 are correctly pushed onto recorded baseline runs.
- AC14's "baseline sender handed the same sequence of card lists" (line 56) depends on how the sender detects a changed card, which the spec says it does not know. It is checkable by test, but I could not verify that the sender can be fed lists this way.

**5. Size.** Tests are 15 to 23 against the stop rule's 24 (line 95), and J5 can stop the build if `src/notify/**` needs a change. This is disclosed and acceptable.

**6. Cosmetic.** The AC numbering runs out of order: AC16 and AC17 come before AC9.

## Open questions
- What should "held more than a day after it was raised" mean in the count when the rule itself shows a card at 24 hours? Should the check use the card's real hold time against the real dispatch log?
- Is the earliest-entry pick in J1 for two `card` entries (line 60) acceptable? Plan §8 says "raised" means "the card's `card` entry", and the plan does not say which entry to take.
- Should the board and the notification carry the "not shown" line? That would change the sender, which needs the owner's approval.