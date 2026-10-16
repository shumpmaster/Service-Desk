Verdict: PASS

Reviewed: 065c528 (specs/S-001.md, draft 3), against draft 2 56f95fe and base 93ee86e. My round-2 verdict is recorded at 6fedf4e.

Draft 3 fixes the one round-2 blocking finding. It settles all four (C) choices and fixes N1 to N3. Nothing is blocking, so this does not need to go to the owner's card under the stop rule. A few wording gaps remain; carry them as risks.

## Round-2 findings
- **B1 (a bubble taller than the screen), fixed.**
  - AC55 now has a rule for it, marked (C): the bubble is held to the screen's height less a margin, sits above the bottom bar, and scrolls up and down inside itself, never sideways.
  - Its "Close" stays in view while it scrolls.
  - The test screen sizes are named: 360×740 and 414×896.
  - AC54's "Latest" and whole-summary bubbles follow the same rule, written into AC54 in both places.
  - The AC52 and AC55 tests check the rule with the owner's real record. AC55's test also checks that "Close" is in view at the top and after scrolling to the end.
  - The earlier contradiction with "wholly inside the viewport" is gone, because a held bubble does sit wholly inside it.
- **Choice 1, time and code after a clipped line: accepted, now clearer.** They sit outside the button, and a tap on them does not open the bubble. Both tests check this.
- **Choice 2, a short line keeps its own height: accepted, unchanged.**
- **Choice 3, the control's name: accepted as a carried risk.**
  - The name "Show the whole of <record's code>" does not contain the owner's visible words, which is against WCAG 2.5.3 ("Label in Name").
  - That risk is now written into the spec. The spec also says the name is kept to match AC54(a), and that both names change together if the owner asks.
  - S-001 sets no WCAG standard, so no criterion breaks. This belongs in the gate's case.
- **Choice 4, profile approvals: fixed.** The clip now covers rulings only, matching AC52's "each ruling row".
- **N1, fixed.** Each bubble sits clear of the project screens' bottom bar, in the rule and in both tests.
- **N2, fixed.** AC56's close checks now name both whole-line bubbles. A new refresh step 3b puts the "Done today" bubble open and scrolled part way, and AC52's test points to AC56's checks.
- **N3, fixed.** "With no sheet or bubble open" is now in AC48, its test and the brief.

## Blocking findings
None.

## Non-blocking notes (carry as risks)
- **R1. A step count in AC56's test is out of date.** specs/S-001.md:2029 still says the refresh check runs "in four steps, one per screen". There are now seven: 1, 1b, 2, 2b, 3, 3b and 4. This is wording only (I raised it before as R1 in the tile-clip review); the steps themselves are listed.
- **R2. The working brief does not mention the new bubble rule.** The brief's bullet (about specs/S-001.md:3880-3888) does not mention the tall-bubble rule or the bottom-bar clearance, and does not say that AC54's existing bubbles change too. The ACs govern and carry the rule, so a Builder working from the ACs gets it right. One clause in the brief would keep the two in step.
- **R3. Step 3b leaves a detail open.** It does not say whether the bubble's scroll position must survive a poll. AC56's general rule about state surviving a poll probably covers it, but the step only sets the state up and does not name the check.
- **R4. Cosmetic.** One rewrapped line in "Where the build stands" (about specs/S-001.md:186) runs past the file's usual line width.

## What I ran
- `git log` and `git diff 56f95fe..065c528 -- specs/S-001.md` (with `--stat`). Besides the spec, only reviews/S-001-design-lab-answers/_plan-review-round2-verbatim.md changed.
- `python3 governance/checks/surface_guard.py diff --range 93ee86e..065c528 --branch orch/answer-spacing`: OK, 6 commits checked, exit 0.
- **Merge clone** (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/mc3):
  - I cloned /home/user/sd-ac, fetched https://github.com/shumpmaster/Service-Desk main (e34574d) and checked it out.
  - I merged orch/answer-spacing (065c528) with `--no-ff`, made as the owner the way the GitHub pull-request merge lands.
  - `bash governance/checks/check_all.sh . HEAD^1` passed: "OK: all governance checks passed.", exit 0. So `record_checks merges` passes as well.
- A grep in specs/S-001.md for the old step count.
- No repository files were changed. The clone is in the scratchpad only.

## Open questions
None for the owner.
