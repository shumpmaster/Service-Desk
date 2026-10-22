# S-001 desk v2, stage 8 (into the desk): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-8 at e3cb774.

---

Verdict: PASS

Stage 8 round 2, at e3cb774 (one commit on top of ec715da), over the whole range bd4097d..e3cb774. There are no blocking findings. The Team screen's text size is restored. The new guard and the new AC17 and AC18 tests catch every mutation I aimed at them, except two states the guard's fixtures never draw, and other tests catch those. Nothing else changed.

## Blocking findings
None.

## What I checked
1. **B1 is fixed.**
   - sandbox.css:239 restores `.sb-unb-t { font: var(--t-meta); }`, and :91 puts `.sb-unb-t.gap` back in the slate `.gap` list.
   - I drew every desk screen from the four fixtures at e3cb774 and cascaded them with bd4097d's sandbox.css and with today's, in light and dark. Words, layout, fonts and colours are all identical on every node. In round 1 the 16 `span.sb-unb-t.gap` nodes differed.
   - sandbox.js is unchanged in this commit, so the screens' words are unchanged.
2. **The new guard is sound.**
   - It is the test "AC44 step 4 (stage 8 …)" in ac88-dark.test.mjs:364-445.
   - Its kept copy, tests/desk/fixtures/stage8/sandbox-bd4097d.css, is byte-identical to `git show bd4097d:src/public/sandbox.css`.
   - It compares every element's declarations, its `::before` and `::after`, and each text's computed font and colour, in forced dark, the phone's own dark and light, over more than 250 screens and sheets.
   - **Mutations, removing rules that are still drawn:**

     | Mutation | Caught by |
     |---|---|
     | B1 reverted | the guard |
     | `.sb-tlink` removed | the guard |
     | `.sb-qlist > li > a` removed | the guard |
     | the lane stub rule removed | the guard |
     | the tile fade `::after` removed | the guard |
     | the Team sheet's title role removed | the guard |
     | `.sb-tap` removed | AC88's main test |
     | `.sb-stale::before` removed | AC42's test, in the full suite |

   - The guard missed the last two: the tap banner and the "can't read" sign are never drawn on the screens it walks. Other tests catch them, so nothing slips through today.
3. **The new AC17 and AC18 tests catch my round 1 misses.** ac17-18-sheets.test.mjs covers the decision card, a lettered and a numbered question, and the gate. All 7 mutations were caught:
   - the gate sheet's notes removed (round 1's N13);
   - the copy route removed (round 1's N19);
   - the lettered question's notes removed;
   - the numbered question's notes removed;
   - the decision card's notes removed;
   - "Copy" copying the wrong text;
   - the web-commit warning dropped.
4. **No test weakened.** This commit removes 3 test lines, and each is replaced by a stronger one:
   - the ac69 slate list gains `.sb-unb-t.gap`;
   - `everyScreen` takes a check function;
   - the one call to it.

   The test count goes from 1056 to 1059.
5. **app.js's import with no `.catch`.** Unchanged, as the coordinator directed, since the spec has no words for it.

## Commands run
- Full suite: 1059 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . bd4097d`: "OK: all governance checks passed."
- `surface_guard.py diff --range bd4097d..e3cb774 --branch build/builder/desk-v2-8`: "OK: 3 commit(s) … checked".
- `review_check.py pr 999 --base bd4097d`: risk class R3, with the flag "page-harness.mjs: test file deleted — needs the owner's verdict". Required: design-reviewer, owner and reviewer. Its only violations are the missing verdict files.
- e3cb774 is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **The guard covers only what the fixtures draw.** Tap banners, render-error, signed-out and the "can't read" lines are outside it; other tests cover the two I tried.
2. **The guard compares against bd4097d forever.** Any later intended change of look will fail it, so that change will have to rewrite or retire the guard.
3. **Round 1's other notes still stand:**
   - EXP-004's words still name the "Universe screen", which is gone, and the panel has no test.
   - The worker hands a tap to the first desk window, which could be an `?exp=001` panel.
   - The old header and footer show for a moment while the desk loads.
4. **For the merge:**
   - The owner's verdict is needed for R3 and the deleted-helper flag. The frozen record was accepted on #191 ("i accept it"), which answers my round 1 question.
   - The owner's pick on #189 should land before or with this branch.
   - AC44 step 4 still needs the owner's approval of the preview deploy.

## Open questions
None.

The worktree and all copies are removed. My scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (mutate6.py, sandbox-dump2.mjs).