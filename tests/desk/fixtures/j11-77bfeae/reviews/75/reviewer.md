Verdict: PASS

Reviewed: cc54211fed1036287fe59e017f70040414df3d57 (build/builder/tile-clip, on 289781e)

In short: I couldn't break it. Everything the Builder claimed held up when I ran it myself, the change shows only with ?sandbox, and the replaced test was replaced only as far as the spec changed. There are no blocking findings.

## Blocking findings
None.

## Non-blocking notes (carry as risks)
1. **The browser evidence is not in the repository.** The committed AC54 test runs on a fake page that cannot lay out text. It gets "how many lines" by being told the measurements. It checks the three-line height, the fade colour per theme and equal heights in a row by reading the CSS. The real checks (three lines showing, the fade at 360 px in both themes, the crossing fixture really crossing) exist only in scratch scripts. They are the Builder's check.mjs and my p1.mjs. This is a limit of the test setup, not a defect, but a future CSS change could pass the suite and still break the layout.
2. **A small gap in the "nothing clips" CSS check.** In tests/desk/ac54-home.test.mjs, the loop that forbids overflow, clamp and nowrap matches `.sb-sum {`. It does not match the new `button.sb-sum {` rule, because "button" comes right before the dot. That rule is clean today (no overflow, clamp or nowrap), so this is a coverage gap only.
3. **Cards are still tall.** At 360 px on the Builder's fixtures each card is about 573 px high. The summary is now capped at three lines, but the phases list and the rest still make the card long. That follows the ruling, which only asked for the summary to be clipped. The owner may notice, though, since the complaint was tile height.

## Answers to the Builder's open questions
1. **An open "Latest" bubble covers the summaries in the row below it.** That is what a bubble does, and it closes with one tap, a tap outside or Escape. AC54(b) allows it. It is not a finding.
2. **The accessible name doesn't contain the visible words (R2).** Confirmed: "Show the whole summary of <name>" does not include the summary's text, so people using voice control can't say the visible words to press it. The spec sets this name on purpose (marked C). Carry it as a risk for the gate, not a build defect.
3. **The card link now reads only the name.** Fine, and arguably better for screen readers. A tap on the phases, the status lines, the fade, or a short summary's area still lands on the card's link. I checked this with hit tests on every card. "Why" and the pill sit outside the no-taps part, so they still work.
4. **Cards in different rows can differ in height.** The spec asks only that cards in the same grid row share one height, and that every summary area is three lines high. Both hold in every row I measured. Equal heights across rows is not required.

## Other checks
- **The replaced test.** Only the old AC54 "whole summary" test changed. Its check that the card holds all 600 characters is kept, and its list of CSS rules that must not clip only grew. What's new is narrow: the new summary box is the one rule allowed to hide lines, and it is checked to be exactly three lines high, with no ellipsis or line clamp anywhere in the sandbox. Every other change to the AC54 and AC56 tests only adds tests.
- **Commit identity and trailers.** The commit is by builder <builder@agents.invalid> and ends with `Agent-Session: session_012RJPVKAoLga2RkqLYRDcBY` and `Spec: S-001`. It has no model name and no AI co-author line. Its parent is 289781e.
- **Only the sandbox changed.** The commit touches only src/public/sandbox.css, src/public/sandbox.js and tests. app.js loads sandbox.js only with ?sandbox. Without ?sandbox, the page and its requests are identical to 289781e on both the real and the extremes fixtures, in both themes, and no sandbox file is requested.

## What I ran
All of it was in scratch clones of cc54211 and of the base 289781e under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-tc/. Nothing in the repository was edited, and /home/user/sd-tc-bld is clean at cc54211.
- **Suite, build and guards.**
  - `npm test`: 292 of 292 pass.
  - `npm run build`: PASS.
  - The surface_guard diff for 289781e..cc54211 with --branch: OK.
  - governance/checks/check_all.sh: all governance checks pass.
  - desk_config_check: PASS.
- **The Builder's browser check, re-run.** I re-ran tc/check.mjs against my own server on my clone: 53 PASS, ALL PASS. Output is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-tc/br/check-8811.txt.
- **My own summary and bubble probe** (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-tc/br/p1.mjs). It runs at 360 px in both themes, on the Builder's fixtures, the real fixtures (Service-Desk at 3117150 with its README at 4433c4f, plus the real Personal-Org-Operating-Model README) and H5's extremes. Extremes adds the 600-character text, a one-line summary, the crossing fixture and the long project name; I also ran extremes at 414 px. All pass: 83 checks on real, 181 on extremes. It checks that:
  - the yes/no answer on running past three lines stays put over time, with no flip-flopping;
  - each box is three lines high and its text starts at the box's top;
  - a box gets the fade and button exactly when the text is over three lines, and shows min(3, total) lines;
  - there is no ellipsis, cards in one row are the same height, and nothing scrolls sideways;
  - every summary bubble opens with one tap, both near the top and with the control just above the bottom band, lands wholly in view and clear of the band, and its text equals the summary;
  - a second tap closes it, with focus back on the summary;
  - every "Latest" bubble, at the top and at the bottom just above the band, opens with one tap, lands clear of the band and closes with a second tap;
  - there are no page errors.

  Outputs are p1-real.txt and p1-ext.txt in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-tc/br/.
- **The 360 px crawl and dock/band cover check** (rv2/br/crawl2.mjs), in both themes, on the build and on the base. 272 routes on real and 172 on extremes, the same on both. No sideways scroll, no overflow, nothing left under the bar at the end of a route, no errors, no requests leaving the site, no alerts.
- **"Latest" checks.** The touch-scroll check (rv2/br/r4.mjs) behaves the same on the build and the base: a press that becomes a scroll does not open a bubble. Tab and Enter (kb.mjs) open "Latest" on focus and move between the two bubbles, the same as the base.
- **Refresh, in the browser** (refresh.mjs). A summary bubble stayed open through 70 seconds, covering the 15-second ticks and a poll with 7 data requests. It was the same element, focus stayed on the summary and the scroll did not move. Its Close control measures 44 by 44.

## Open questions
None beyond the risks above. R2 (the accessible name) and note 1 (browser-only evidence) belong in the gate's case.
