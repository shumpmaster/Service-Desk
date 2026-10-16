Verdict: FAIL

Reviewed: 63391bf (lab-answers, on base 87e0bb1) and e9221da (answer-choice spacing, on base 93ee86e, landed at 87e0bb1). The merge tree I built against the real main is byte-identical to 63391bf.

In short: the spacing build passes. The lab-answers build does almost everything it claims, and I reproduced the Builder's results. It fails on one point, which no test covers. If a poll brings in a new ruling while the owner has the "Your last action" whole-line bubble open, the bubble disappears. AC56 forbids a refresh closing anything the owner opened.

## Blocking finding

**B1. A poll that brings a new ruling closes the open "Your last action" bubble (breaks AC56's refresh rule).**
- **What happens:**
  1. The owner opens "Your last action"'s whole-line bubble on Status and scrolls it part way.
  2. A poll finds a new ruling file whose time has not been read yet.
  3. AC55's rule switches the line to "Your last action: not available yet" (src/lib/sandbox.js:956).
  4. `lastActionNode` (src/public/sandbox.js:653-673) then draws only that text, so the line box and its bubble are gone. Nobody but the refresh closed it.
- **Why it breaks the spec:** AC56 counts "a history read or any other read arriving" as a refresh. Through every refresh, "any open sheet or bubble" must stay, and "Only the owner closes what the owner opened". By analogy with sheets, even "when the thing a sheet is about leaves" the sheet stays open and says so.
- **Reproducing case:**
  - Script: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/q2.mjs, mode `add`, against /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/srv2.mjs (extremes dataset, history replies delayed 25 s, `/__add` commits a new ruling to Alpha).
  - Output: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/q2-add.txt. At t+10s the bubble is open, scrolled to 120. At t+15s the line reads "not available yet" and the bubble is gone. It stays gone for good, also after the time arrives.
- **What is not affected:** the same case on Queue (step 3b, "Done today"'s bubble) keeps the bubble open and scrolled through the poll and the history read (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/q2-queue.txt). Only Status breaks.
- **Why the tests miss it:** AC56's step 2b test uses changed data, but never a new ruling whose time is still unread.
- **This is the Builder's open question 2.** The spec has a real conflict here (AC55's "not available yet" against AC56's "stays open"). The Builder should not settle it alone; it goes back through the Definer. My suggestion: keep the open bubble on screen, unchanged, while the line waits, and say so in it, as the sheet rule does.

## Non-blocking notes (carried as risks)

- **N1. Short rulings changed form.** On Status, a short ruling's time and code now start their own line, and the " · " is hidden (src/public/sandbox.css:453). AC55's stated form is "Your last action: <words> · <time>", and nothing in the amendment changes it for short lines. Card answers keep the old form, so the two now look different (screenshot /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/la/status-short-360x740-light.png). Readable, but a spec difference. (Open question 1.)
- **N2. A turned phone does not move an open bubble.** `placeBubble` returns once a place is set (src/public/sandbox.js:1559). With a below-or-above bubble open at 360×740, turning to 740×360 leaves it partly outside the screen and under the bottom bar. Seen on real Service-Desk "Done today" and on Gamma's Status and Queue in extremes (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/bub-real.txt and bub-ext.txt). Bubbles held in the screen are fine. Home's bubbles always placed themselves this way; this build extends it to the project screens.
- **N3. The words "(proxy)" end up inside the bubble.** For a record made at the owner's request, the bubble's text is the line plus " (proxy)", in both places. AC55 asks for "the whole line, word for word". It is marked, not reworded, but strictly it adds words.
- **N4. `--sb-clear: 65px` is hard-coded** (src/public/sandbox.css:455). The bar measured 65 px at 320, 360 and 414 px and at 125% and 150% root text size, and has no safe-area padding, so it is correct today. The AC55 test pins the number, but nothing ties it to the bar's drawn height. (Open question 3.)
- **N5. One commit in range lacks a Spec trailer:** fd78485, the chief-of-staff's owner record. Its Agent-Session trailer is present and surface_guard accepts it.
- **N6. Keyboard focus never opens "Latest" (old behaviour).** In my earlier probe (rv2/br/r4.mjs), tabbing onto "Latest" with the keyboard does not open it, though AC54 says focus opens it. The base, before both builds, does exactly the same, so these builds did not cause it.

## The lab-answers claims, checked

- **Bar, deferred words and band gone; nothing fixed to Home's bottom:** confirmed. Shown by the Builder's Chromium check, both themes, 360 and 414; by my crawl; and by the new md-sandbox AC48 assertions.
- **Clip on rulings only, in both places, with a real button:** confirmed. The button is named "Show the whole of <code>", the time and code sit outside it, and a profile approval's `Decision:` line is not clipped. One quibble: the label "Your last action:" sits inside the button.
- **Bubble rules:** confirmed. Bubbles are held to the screen less a margin and clear of the bar, scroll up and down, never sideways, keep Close sticky, and are held (`held`) when too tall. My elementFromPoint checks found Close and the bubble's bottom edge never covered by the bar, at both sizes and both themes, with the control at the top of the screen or just above the bar.
- **`placeBubble` clears `.sb-dock`:** confirmed.
- **AC56 close and refresh 2b and 3b:** both pass with the 15-second tick and with the minute's poll (I re-ran the Builder's check with `--poll`). The exception is B1.
- **The loosened test:** only ac54-home.test.mjs's `.sb-bubble` rule was loosened, and only for the exact `max-height: calc(100(d)vh - var(--sb-clear, 0px) - 16px)` and `overflow-y: auto; overflow-x: hidden;`. Every other removed test line was a band reference or an unused import.
- **Results reproduced:** 305 of 305 tests pass, the build passes, and the Builder's Chromium check gives 306 PASS, both as-is and with `--poll`.
- **Mutation checks:** removing sticky, removing `overflow-x: hidden`, clipping `Decision:` lines, setting `--sb-clear` to 0, and adding back a fixed element on Home were each caught by the tests. Removing either one of the two "held" paths alone was not caught, because the other path covers it; removing both was caught (4 tests failed).

## Spacing build (e9221da)

- Layout only: sandbox.css, sandbox.js and the AC53 test.
- The Builder's check gives 56 PASS: the letter in its own column 12 px from the text, wrapped lines under the text, 12 px 16 px inside each box, 12 px between boxes, the accessible names "C Drop it", and the picked mark not moving the text.
- Compared with the owner's screenshot, the note's three points are met, and the words and order are unchanged.

## Join-up review (Reviewer, end of Build: the parts working together)

- Home, Status, Queue and the other project screens work together in both themes at 360 px, on the real fixtures and on H5's extremes:
  - 272 routes on the real data, 172 on the extremes.
  - No sideways scroll, nothing overflowing, no page errors, no requests leaving the page, nothing left under the bottom bar.
- Only one bubble is open at a time, and Home's "Latest" and summary bubbles still work together. The earlier tile-summary check (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-tc/br/check.mjs) gives 52 PASS on the new code.
- "Latest" opens on one tap, a second tap closes it, and the tap never opens the project. A touch that turns into a scroll behaves the same as before.
- Without ?sandbox, the 6 accepted routes are identical between 93ee86e and 63391bf.
- Differences rated: B1 is blocking; N1 and N2 are non-blocking risks.

## Answers to the Builder's open questions

1. **Time and code on their own line for short rulings:** this differs from AC55's stated form (N1). Keep " · <time> <code>" inline when the line is not clipped, or get the Definer to amend the form.
2. **The line box replaced while waiting:** yes, and it closes an open bubble. That is B1, and it blocks. Escalate the AC55/AC56 conflict to the Definer.
3. **`--sb-clear: 65px`:** it matches the bar today (N4). Better to measure the bar, or give it a fixed height in CSS that the test ties to `--sb-clear`.

## What I ran

All in scratch clones under /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/: `la` at 63391bf, `base` at 93ee86e, `mc` the merge clone, `mut` for mutation checks.

- The full test suite and the build, on 63391bf and on the merge clone: 305 pass, build PASS.
- surface_guard over 93ee86e..63391bf with no `--branch`: OK, 10 commits.
  - Per branch: lab-answers 87e0bb1..63391bf OK; answer-spacing 93ee86e..e9221da OK; orch 93ee86e..87e0bb1 OK.
  - Passing `--branch build/builder/lab-answers` over the whole 93ee86e range reports 7 violations. These are the orch branch's own definer, chief-of-staff and orchestrator commits, so that range is the wrong one to use with that flag.
- **Identity and trailers:** every commit has the right agent name and email (`builder`, `definer`, `orchestrator`, `chief-of-staff` @agents.invalid). Each has an Agent-Session trailer, and all but fd78485 have Spec: S-001 (see N5). No model names or AI co-author lines. 87e0bb1 is a real `--no-ff` merge.
- **check_all against the real main:** I cloned https://github.com/shumpmaster/Service-Desk main (e34574d). I merged lab-answers into orch/answer-spacing `--no-ff` as orchestrator, then merged that into main `--no-ff` as shumpmaster <furchken@gmail.com>. Then `GOV_BRANCH=orch/answer-spacing check_all.sh . origin/main` gave "all governance checks passed" (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/checkall.txt).
- **The Builders' browser checks, re-run on my clones:**
  - lab-answers: 306 PASS, and 306 PASS with `--poll` (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/la/check.txt and check-poll.txt).
  - spacing: 56 PASS (/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/ac/check.txt).
- **My own checks**, scripts in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv-la/br/:
  - srv.mjs: the "real" dataset is Service-Desk's own tree at 63391bf, each record's real first-commit time, and the operating model's ledger and README. The owner's time zone is set to Pacific/Kiritimati only so that the 15–16 Oct rulings count as "today".
  - crawl.mjs: the 360 px crawl in both themes, new and base, on the real and extremes data (crawl-885x.json, crawl-886x.json).
  - bub.mjs: every whole-line bubble opened by one tap, bottom-bar cover checks, a turned phone, and Home's "Latest" one-tap (bub-real.txt, bub-ext.txt).
  - dock.mjs: the bar's height, from which the 65 px figure was checked.
  - plain.mjs: the accepted views without ?sandbox, new against base (plain-new.json, plain-base.json).
  - q2.mjs with srv2.mjs: B1 (q2-add.txt, q2-queue.txt).
  - The earlier probes rv-tc/br/check.mjs and rv2/br/r4.mjs.
- I did not read the Builders' own summaries.
- **A slip, now undone:** a shell redirect once created an empty file, /home/user/sd-ac/plain-base.json, in the orchestrator's worktree. I deleted it straight away, and `git status` there is clean. Nothing else was written outside the scratchpad. All scratch servers are stopped.
