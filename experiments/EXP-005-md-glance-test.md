# Experiment registration — EXP-005

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (AC35, AC38, AC41, AC44)   milestone: MD, on the preview once the chosen design is the
desk's default view (AC44 step 3)
runner:
- **The owner,** on the phone, on the preview (about 15 minutes in all, counted against the
  pre-launch 2 hours a week).
- **The Chief of Staff** prepares the prompts, keeps the answer sheet, and records the result
  (S-001 Setup CS12). It doesn't see the screen before the owner answers.
- **The Builder** builds nothing for it.

result: docs/handover/experiments/EXP-005-result.md, recorded by the Builder from the Chief of
Staff's hand-over (or committed by the owner)
rulings: decisions/questions/P-001-design-step.md (the design step and its acceptance on the
preview); decisions/questions/P-001-design-discovery.md, answer 3 ("I want to glance for a few
seconds, but pick up enough information from that glance to know where to press into more
details")

## Hypothesis
After looking at the desk's first screen for 5 seconds, the owner can say correctly:
- **G1:** which connected projects have something waiting on him, and how many things each;
- **G2:** which project he would open first, and what kind of thing waits there (a card, a
  question that never defaults or defaults on a timeout, or a pull request; S-001 Terms, "Decision
  kind");
- **G3:** whether any project can't be read, or is stale, or the desk is still checking.

## Method
1. The owner opens the preview on the phone, signed in, and waits until the state line no longer
   says "Checking…". He keeps the screen covered or turned away until the Chief of Staff says go.
2. He looks at the first screen for 5 seconds, without scrolling or tapping, then turns the phone
   face down.
3. He answers G1, G2 and G3 aloud or in writing to the Chief of Staff, from memory.
4. He then takes a screenshot of the same screen, unchanged. The screenshot is the truth the
   answers are scored against.
5. **Five glances**, on at least three different days, at whatever the projects hold then. If
   no glance in the first four had a flagged item, or none had a can't-read or stale project, the
   fifth glance is taken when one exists; if none occurs before MD would otherwise be accepted,
   that is noted and G3's can't-read case is unscored.
- Nothing about the real projects is staged or changed for the test.

## Measure
For each glance:
- G1: correct only if every project with something waiting is named, with its count, and none is
  named wrongly.
- G2: correct if the kind named matches what is flagged in the project he names. Which project he
  chooses is his choice and isn't scored.
- G3: correct if he names exactly the projects shown as can't-read or stale, or says "none" when
  there are none, or "still checking" when the state line said so.
- Time from the 5-second glance to the answer, as a note only.

## Sample
Five glances by one person, the owner. This is the user the desk is for; the small sample is by
design (S-001 Known limits).

## Exclusions
- A glance where the screen changed in the 5 seconds (a poll landed and redrew a box) is scored
  but noted; if it changed what G1 to G3 should be, it is excluded and taken again.
- A glance where the state line still said "Checking…" at go is excluded and taken again.
- A glance interrupted by the Access sign-in page is excluded and taken again, and noted
  (discovery map A6).

## Deciding threshold
- **Pass:** G1 correct in all five glances, G3 correct in all five, and G2 correct in at least
  four. Then AC44 step 4 is met.
- **Fail:** any other result. The failing question goes back to the design lab, the merged design
  is fixed forward through the normal route, and the test is taken again: five new glances, the
  same threshold.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/S-001-m2-design, before any run
