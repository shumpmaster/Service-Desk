Verdict: PASS

I tried to refute the spec and found no blocking defect. This is a plan review of specs/S-005.md against docs/projects/P-003.md and the other files in the pack.

**What I checked**

- **Header and milestone.** The header names `milestones: M4` (specs/S-005.md:7). M4 is the milestone listed in the plan's section 3 (docs/projects/P-003.md:46), in P-003's own plan, so no other item's milestone is named.
- **The owner's ruling.**
  - decisions/P-003/stop-7.md asks for four things: keep the narrow reading, say why a new card's entry lands with its card file, write the join-up section in the form, and not grow the spec.
  - AC7 and the supersession note (S-005.md:11, :32) keep the narrow reading, and Facts relied on cites stop-7.md:3 for the reason (S-005.md:170).
  - The join-up section follows docs/design/JOIN_UP_REVIEW.md:12-33, with the same five checks, "Screens checked", "Needed changes to the records" and "Sign-off" (S-005.md:147-163).
  - Each difference is rated non-blocking and carried to the Build gate as a risk.
  - I could not check "do not grow the spec" (see open question 1).
- **Recycle ruling.** decisions/P-003/criteria-8.md asks for a path with a line on every fact under "Facts relied on", with no criterion changed. Every fact in S-005.md:169-186 cites a path and line. I confirmed these cited lines:
  - docs/projects/P-003.md:15, :21-23, :34, :46, :89, :105, :109, :111, :120 and :133.
  - docs/PROJECT.md:85, :121, :125, :127, :540, :588 and :616.
  - library/facts/F-cf-02.md:4-5, which is grade A.
  - research/P-003-sizing-findings.md:41, which supports `tests/desk/`.
- **Consistency with the plan.**
  - The failed-read rules (AC16, AC17) match plan §1 (docs/projects/P-003.md:22-23).
  - AC4, AC6 and AC7 match plan §1 (docs/projects/P-003.md:20-21).
  - The V6 wording and the "failed read is not a miss" rule match plan §6 (docs/projects/P-003.md:103, :109).
  - Gate cards stay unchanged (AC9), and the spec asks for no change to src/notify/**, with a stop if one turns out to be needed (J5).
- **Internal logic.**
  - I found no contradictions among AC1-AC8, J1 (skew, duplicate entries, `dor-fail` against `dor`), J2 (examples), J3 (state changes) and J6 (check moments).
  - The J6 worked examples recompute correctly. The skewed card is held at 11-11 10:00 and shown at 11-12 09:00, so it is reported in the second figure and is not a V6 miss.
  - AC13 admits that the V6 count cannot see a card shown with neither mark.
- **Behaviour I cannot see.** The pack holds no src/. The spec says so and tests against a recorded baseline run committed before any change under src/ (S-005.md:23, :190). I accept that: the baseline check can be verified without the spec describing today's behaviour.

**Non-blocking findings**

1. specs/S-005.md:188 cites specs/S-004.md:161 and :164. S-004 is not in my pack, so I could not verify those lines. The same fact is supported directly by research/P-003-sizing-findings.md:41, so this is not a failure. The citation should point there.
2. specs/S-005.md:14 and :188 say that the P-001-card-recommendation record and the sizing memo are not in the definer's pack. Both are in mine (decisions/questions/P-001-card-recommendation.md, research/P-003-sizing-findings.md). The spec's quotations of that record match it (lines 14, 19 and 23). The "not in pack" notes are harmless.
3. Test count: 19 criteria and 6 join tests are estimated at 15 to 23 tests, against a stop rule of 24 (S-005.md:180-183). This only works if tests are heavily shared. The spec flags it, and the stop rule applies.
4. Plan §6 says the Chief of Staff counts V6 by rerunning the rule. The spec shows that V6's first half, a card shown with neither mark, can't be counted after launch (AC13, J6, open question 4). It is disclosed and covered by pre-launch tests (J4, AC11). It is a known gap against the plan's measure, to be carried to the Launch gate.
5. The brief's header says `status: draft`, `frozen_at: —`, and the acceptance criteria are not yet owner-approved (S-005.md:18). That is expected before freeze.

**Open questions**

1. Did this revision stay within "do not grow the spec" (stop-7.md:3)? S-004 is not in my pack, so I cannot compare sizes.
2. Should the Builder's "state the J1 field names" step (S-005.md:75) be a Build-time return item that the Reviewer checks? The spec's own open question 6 already rests on this unknown.
3. Plan §9 (docs/projects/P-003.md:137-139) holds only its instruction and no target-user line. That is the plan's concern, not the spec's, and the plan's Design gate was approved (decisions/P-003/dor-4.md). I mention it only for completeness.