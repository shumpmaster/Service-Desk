Verdict: PASS

The Reviewer's verdicts on QW3 (PR #246), verbatim: round 1 at 226bc81 (FAIL), round 2 at 2572838 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: FAIL

**What this means for you.** QW3 works as the spec asks, and the full suite passes at the tip. One required piece is built but not checked by any test: a question in "Questions for you" that waits on another question shows "Waits on question <k>". No test or capture draws that line. Deleting it leaves the whole suite green, yet two test titles say they check it. That missing check is the one blocking finding. Everything else is non-blocking.

**What was reviewed.** Branch build/builder/qw3 at its tip, **226bc81**. The brief's last sha, 27c8f9b, does not exist in this repository; 226bc81 is the commit with that subject ("the capture tool prints sizes"). The base is a0437b8. All runs were in scratch worktrees, which I have removed.

## Blocking

**B1. A section question's "Waits on" line is built but not locked, and two test titles claim it is.**
- **What the spec requires:**
  - AC94's "Each question shows" says: "under it, from QW3, its 'Waits on question <k>' line when it waits on another question (AC95), as on a lane card" (specs/S-001.md:10567-10568).
  - AC95 says: "In the section, a question that waits on another says it in its meta line's place" (specs/S-001.md:10856).
- **What is built:** the line is drawn at src/public/sandbox.js:2713, inside `sectionCard`.
  - I probed it at the tip by adding `questions/Alpha-second.md` to Alpha-pick's `Blocks:` line.
  - Alpha-second's card then draws `v2-place | v2-kd | v2-t | v2-m | v2-waits | v2-afirst | v2-qbody`, and the line reads "Waits on question 1". So it is built correctly.
- **The gap:**
  - `qw3BusiestState` has no question that waits on another, so no screen case draws this line.
  - No pure case checks a section row's `waitsOn`. The worked cases at ac96:200-214 check the order only.
  - The ac88-dark QW3 walk never meets the line, and neither do the `qw3-` captures.
- **Reproducing case:** delete line 2713 (my mutant R1). ac96-qw3-blockers, ac94-qw1-questions and ac95-qw2-places all still pass, and the full suite stays green.
- **The two test titles:**
  - tests/desk/ac96-qw3-blockers.test.mjs:358 says "'Waits on' under the meta line, on lane, gate-less, strip and section cards". Its count at :382 lists the seven lines, and none is on a section card.
  - tests/desk/ac88-dark.test.mjs:2255 says "'Answer first' and 'Waits on' on section, lane and strip cards". Only "Answer first" appears on section cards.
- **Fix:** add a section question that waits on another to the cases, and to the cascade walk or the captures.

## Non-blocking

- **N1. A held-up gate card's "Waits on" line has no case either** (mutant R2, src/public/sandbox.js:2488, the gate branch of `cardNode`). It is built: my probe has Alpha-pick block `queue/P-002-criteria-1.md`, and the gate card draws "Waits on question 1" under its meta line. The pure case counts gate entries (ac96:166-190), but no screen case draws one. Deleting line 2488 survives ac96, ac80 and ac95.
- **N2. The Builder's survivor, "never clearing the focus target", is confirmed** (src/public/sandbox.js:5244).
  - The case at ac96:458 taps the notification first and the "Waits on" line second, so a stale target cannot show.
  - Case that would catch it: tap "Waits on a question being asked in your session", blur, then make a notification tap to the same held question. With the mutant, the focus moves again.
  - The required focus move itself is locked (R21 and R29 are caught).
- **N3. The blocker tie rule is not locked independently of input order** (mutant R19, src/lib/board.js:1105).
  - The mutant replaces `sort(placeOrder)` with a raised-time-only stable sort, and it survives.
  - The reason: `boardView` passes `waitRows` already sorted by `raisedOrder`, and the "two devices" case at ac96:244 uses distinct raised times.
  - Real exposure: a waiting blocker and a kicked-back blocker raised at the same instant would come out in input order rather than code-unit key order.
- **N4. The `Cards waiting on it` list on a v2.5 question's sheet has no case** (mutant R23, src/public/sandbox.js:3165). AC96's "other readings" say it is "shown … for v2.5 and held questions too". Only the v2.5 *read* is locked (ac96:135-140).
- **N5. A stale comment** at tests/desk/ac88-dark.test.mjs:641 says both lines are "in `--t-small` `--ink`". Since f9bd815 they are `--t-body`.
- **N6. surface_guard fails over the full range a0437b8..tip** on f703df2, the Definer's commit, which arrived through the Orchestrator's merge ffcc1a6. QW1 and QW2 took the same route (7ae05da, 26b838b). The guard is OK over the Builder's own commits: 7 before the notes and 5 after.
- **N7. Committer field.** Every commit has committer "Claude <noreply@anthropic.com>". The environment sets this, and 421 commits already on main have it.
  - Author identities are correct (builder, definer, orchestrator @agents.invalid).
  - Every non-merge commit has `Agent-Session:` and `Spec: S-001`. The merge ffcc1a6 has `Agent-Session:`.
  - No commit message has a co-author line or model name.

## Checked and holding

- **Full suite:** **1444 of 1444 pass** at 226bc81 (4 min 11 s).
- **New cases fail on the old source:**
  - On a0437b8 with the tip's tests, ac96 fails on import alone.
  - With stub exports added (no blocker behaviour, same words), all **22 of 22** ac96 cases fail.
  - The ac88-dark QW3 walk fails on a0437b8 too.
- **Locked cases:** none removed or rewritten. The only existing test file changed is ac88-dark.test.mjs, with 0 removed lines. Its additions are:
  - an extra `--ink` check inside `okBadCheck`, which only adds checks to earlier walks;
  - `QW3_ONCE` and the QW3 walk.

  fixtures/README.md is additions only. The row names `QW3_ONCE`.
- **`QW3_ONCE` is exact.** An extra declaration on `.v2-afirst` fails the walk (R25), and "QW3_ONCE met exactly" catches any listed exception left unmet.
- **Heap**, measured with `--trace-gc` as in QW2's review: ac88-dark peaks at 1174.2 MB used (1217.9 MB committed) against a 2096 MB limit. The base peaks at 1172.6 MB (1217.5 MB). This matches the Builder's 1216 MB, so the file needs no split.
- **My planted bugs:** 28 non-equivalent, 23 caught. R28 was equivalent (a held question is never in `cards`). Caught:
  - the loop fallback (R4);
  - duplicates (R5);
  - a held entry's words (R6);
  - numbered before held (R7);
  - rising order of the places (R8, R17);
  - a line naming only uncounted entries making a blocker (R9);
  - held after the blockers (R10);
  - column-0 `WHY:`, the line after `WHY:`, the second line, the `## Context` stop (R11, R12, R13, R16);
  - the split on ", " (R14);
  - a queue/ subfolder (R15);
  - another project's entry (R18);
  - kicked-back cards counted (R20);
  - tabindex and the focus move (R21, R29);
  - the list under Unblocks (R22);
  - z-index and `--t-small` (R24, R26);
  - each number its own link (R27).

  The 5 survivors are R1 (B1), R2 (N1), R3 (N2), R19 (N3) and R23 (N4).
- **Spec checklist**, against AC96, AC95's blocker parts, QW3's row, readings (l), (m), (n) and (p), CS28 and P-001-m3g-held-place B. Each item is built and locked:
  - the `Blocks:` parse edge cases (ac96:85-141);
  - loops, including ceb432d's case (ac96:216-229);
  - own-project counting with the rest listed in words (ac96:166-190, 293-303);
  - the held blocker after the blockers, with no "Done ✓";
  - one project shown;
  - both kinds of "Waits on" tap;
  - the sheet's list under Unblocks;
  - AC77's hold read whole with each `Blocks:` placement, v3 and v2.5 (ac96:114-141), and on screen (Alpha-held is held).

  The real read path carries `text` (src/lib/model.js:107), and the page passes only held rows as `asking` (src/public/sandbox.js:2042).
- **The desk still writes nothing.** The src diff adds no fetch, storage or write call.
- **Fixtures** are labelled NOT real in qw3-fixtures.mjs:1-5, in fixtures/README.md (QW3 section), and in inline texts.
- **The two copies match:** src/lib and src/public/lib, for board.js and records.js.
- **Captures:** I reran the `qw3-` captures in Chromium. At 414 px every check passes. At 360 px the only failure is the known one (below). No capture scrolls sideways.

## Open questions

- **The known 360 px point, not mine to settle:** "Waits on a question being asked in your session" takes three lines in a lane card at 360 px, light and dark. It fails in every `qw3-` capture at that width (two lines per capture), against AC95's "may wrap to two lines". At 414 px it fits in two.

Files are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad:
- the suite log: rv-qw3-full.log
- the heap logs: rv-qw3-heap-tip.log and rv-qw3-heap-old.log
- the mutants and their runner: rv-qw3-tools/mutants.py and rv-qw3-tools/run.py
- the captures: rv-qw3-shots/
- the capture log: rv-qw3-shots.log

## Round 2
Verdict: PASS

**What this means for you.** Round 2 fixes the one blocking problem from round 1, and the four smaller gaps I raised are now covered by tests. Every bug I planted is now caught, including the five that got through last round. The full suite passes. Both rewritten older tests really had to change, and neither checks less than before. At 12 px the long "Waits on a question being asked in your session" line now fits in two lines on a 360 px phone. So the point that was going to the owner no longer comes up.

I reviewed build/builder/qw3 at **2572838** (round 1 was at 226bc81). The three scratch worktrees I used have been removed.

## Blocking
None.

## Non-blocking
- **N1 (carried).** Every commit's committer field reads "Claude <noreply@anthropic.com>". The environment sets this, and 421 commits already on main show it. The author identities are correct, and all 8 new Builder commits and f329f94 carry `Agent-Session:` and `Spec: S-001`. No commit has a co-author line or a model name.
- **N2 (carried).** surface_guard over the whole range from the base flags the Definer's commits. They came in through the Orchestrator's merges (ffcc1a6, cac9bb3), the route QW1 and QW2 took. Over the Builder's round-2 commits (cac9bb3..tip) it reports OK, 8 commits.
- **N3.** On the heap, the Builder's summary says 1194 MB. I measured 1214.6 MB used at peak (1263.3 MB committed) out of 2096 MB, using `--trace-gc` as in round 1. That matches the 1215.1 MB in the Builder's own 1586c92 message. It leaves about 880 MB to spare, so the file doesn't need splitting.

## What I checked
- **Full suite.** 1447 of 1447 pass at 2572838.
- **Survivors re-planted.** All five are now caught:
  - R1: the section card's "Waits on" line removed.
  - R2: the gate card's "Waits on" line removed.
  - R3: the focus target never cleared (the case at ac96 test 21 taps, blurs, then taps the notification).
  - R19: blocker ties sorted by raised time only (test 13).
  - R23: the "Cards waiting on it" list shown on v3 questions only (test 22).
- **New plants on the round-2 changes.** All 10 are caught:
  - R31: the entry's code not in mono.
  - R32: the row title's clip class dropped.
  - R33: the title cut at 4 lines instead of 3.
  - R34: the held line given `.v2-body` again.
  - R35 and R36: either line set back to `--t-body`.
  - R37: the held line in `--ink2`.
  - R38: an extra declaration on `.v2-heldl`.
  - R39: the screen reader's " · " dropped.
  - R40: the place and kind no longer a block of their own.
- **The two forced rewrites.**
  - 6fe62d9 (ac94-qw1-questions.test.mjs:387-395): with its old version put back at the tip, exactly test 10 fails. The new version checks more than the old one: the line's class, that it sits right under the title, and that no `.v2-body` carries the words.
  - 1586c92 (ac88-dark.test.mjs, QW1 walk, around :2223-2229): with its old version put back, the walk fails on exactly the `span.v2-heldl` exceptions. The rewrite allows only that one new exception and requires it to match `QW3_ONCE`'s own entries.
- **`QW3_ONCE` is exact with the new rules.** It pins `.v2-afirst` and `.v2-waits` at 12px/1.4, the row's three parts (`.v2-wlk`, `.sb-vh`, `.v2-tt`) and `.v2-heldl`. The "met exactly" check holds, and an extra declaration fails it (R38).
- **The size correction matches the spec.** Settled point 3 as corrected, AC95 and the design review's N1 to N3:
  - `.v2-afirst`, `.v2-waits` and `.v2-heldl` use `--t-small` `--ink` (sandbox.css, the hunk after :628).
  - The sheet list stays `--t-small`.
  - An uncounted entry's code is `.v2-mono`, and its words are `.v2-small`, which is `--t-small` `--ink2` (sandbox.css:553-554).
  - A row's title is cut at three lines with the fade (`.v2-wlist .v2-tt`, sandbox.css:652).
- **Round 1's B1 and N1 are fixed.** The fixtures now include a section question that waits on another and a held-up gate card. The ac88 walk requires a "Waits on" line on a section card, a gate card, a strip card and a lane card. The two test titles now match what the tests check.
- **Captures.** I reran the `qw3-` Chromium captures: all 16 pass at 360 and 414 px, light and dark, and the run exits 0. Each shows at most 2 lines per "Waits on" line, boxes at least 24.8 px and links at least 25 px tall. None scrolls sideways.
- **The desk still writes nothing.** The round-2 changes to src add no fetch, storage or write call.

## Open questions
None.

Files are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/:
- the full-suite log: rv2-qw3-full.log
- the heap log: rv2-heap.log
- the forced-rewrite runs: rv2-forced94.log and rv2-forced88.log
- the mutants and their runner: rv-qw3-tools/mutants.py and rv-qw3-tools/run.py
- the captures and their log: rv2-shots/ and rv2-shots.log

