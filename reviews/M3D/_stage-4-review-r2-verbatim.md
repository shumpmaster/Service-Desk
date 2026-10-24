# M3D stage 4 (S-001 after MD3): the Reviewer's round 2, with stage 5 round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 as one hand-back of two reviews: A, stage 4 at c4b66e9; B, stage 5 at db1474e. Part A is stage 4's.

---

Both reviews pass, with no blocking findings. Review A: stage 4's guard exception is now pinned to exact values, and the two cases from my notes are held. Review B: stage 5 puts a Copy inside each choice's box and changes no answer file or its words. Its answering points match AC89 (j), and its guard exception is pinned and exact. Each review's verdict and details follow.

# A. Stage 4, round 2 (build/builder/m3d-4 at c4b66e9; whole range 7f01fd5..c4b66e9)

Verdict: PASS

## Blocking findings
None.

## What I checked
1. **B1 is fixed.**
   - `M3D4_ONCE` (ac88-dark.test.mjs:423-430) pins each excepted declaration on `button.sb-idle` and `div.sb-idlelist` to its value, before and after, per theme.
   - The test requires the excepted set to equal the pinned set exactly (:520-521).
   - My round 1 mutations are now caught by the guard:
     - G1 (the idle line's min-height down to 20px);
     - G6 (its font changed);
     - G2 (its colour in vermilion), also caught by AC69's test.
2. **I1 and I6 are now held.**
   - I1 ("Just finished" members folded with the idle ones) is caught by the new case in ac67-90-team-after-md3, which uses Service-Desk's real log at 22:00 UTC on 8 Oct.
   - I6 (a reason only one card has moved to the head) is caught by the new case that uses four made-up outcome lines, labelled NOT real in fixtures/README.md.
3. **Dropping the `sb-brow-of` exception is right.** That element now has rules it had none of at bd4097d. If any screen the guard walks drew it, its declarations would show up as differences and fail the guard. The guard passes, so none draws it. Its look is still guarded by AC49's lanes test, which caught "cut at three lines" in round 1.
4. **Nothing else changed.** Only three test files changed: ac67-90 and fixtures/README.md are pure additions, and ac88-dark changes only the exception. No `src/` file changed.

## Commands run
- Full suite: 1099 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 7f01fd5`: "OK: all governance checks passed."
- `surface_guard.py diff --range 7f01fd5..c4b66e9 --branch build/builder/m3d-4`: "OK: 2 commit(s) … checked".
- `review_check.py pr 999 --base 7f01fd5`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files, with no test-weakening flag.

## Notes and open questions
None new.

# B. Stage 5 (build/builder/m3d-5, db1474e against 657b85e)

Verdict: PASS

## Blocking findings
None.

## What I checked
1. **Every answer route writes the same file and words.**
   - `answerLink` and `answerPlan` are unchanged, and the Copy copies `b.plan.copy` as before.
   - I probed `answerPlan` for a decision card and a question, with and without the owner's words (including ü, & and #). The copied text equals the prefilled link's `value`, character for character (4 of 4). The file name is the same, and the copy-route link carries no `value`.
   - The only intended change is the v2.5 copy text, now AC19's own form (`v25Ruling`), as AC89 (j) asks.
2. **AC17 as changed (P-001-audit-copy, A).**
   - Each choice's box holds its own Copy, on the question, gate and decision-card sheets. A numbered question has one Copy, beside its one Answer.
   - `linkNotes` keeps only AC18's message, and nothing else is stacked above the choices. The cause's words sit under them.
   - The texts are in the fold, and the decision card's "The whole record" fold now holds each answer's file too.
3. **The board's gate buttons carry the sheet's reason** (`gateButtons`). They are the same links the sheet builds, made from the typed words kept on the device. Nothing new is sent anywhere.
4. **The past settle time.**
   - The time is `raisedAt + hours`, worked out in milliseconds, then shown as a date by `dayDateTime` in `ownerTimeZone`.
   - Shown in UTC instead, it fails the AC85 and AC82 cases across the 1 Nov clock change (mutation Q6).
   - The sheet, the card and Home's briefing each say "Was due to settle…" (Q7 and Q8 caught).
5. **The default line** quotes the file's DEFAULT words exactly, apart as `v2-dq`, and never says "DEFAULT" twice. Altering the words is caught by AC85's and AC12's tests (Q9).
6. **The guard exception is pinned and exact** (`M3D5_ONCE`): `span.v2-tt` inside `a.v2-t`, with 3 declarations, and `span.v2-clip.v2-stt` inside `h2.v2-stitle`, with 2. The test requires the set to be exactly these (Q-G1, Q-G2 and Q-G4 caught). Plan's gate-row cut uses a rule that was already there (sandbox.css:1149), which AC85's test asserts.
7. **The rewritten cases** each match their cited lines:
   - AC17 (ac17-18-sheets) against :2911-2927: one Copy per box, none above, each Copy equal to its file in the fold with and without the owner's words, a link with the file name only, the cause under the choices. Both ways are covered: `contentPrefill: false`, and a text past `linkCap`.
   - AC85's default, settle, v2.5 and board-buttons cases against :7911-7917.
   - AC12's case in ac11-12-views against :7916-7917.
8. **Mutations: 16 of 19 caught.**
   - Caught:
     - the gate's or the numbered question's Copy removed;
     - a Copy copying other text;
     - the cause stacked above the choices;
     - the board ignoring the reason;
     - UTC dates;
     - a past time read as still settling;
     - the briefing counting a past one as ahead;
     - the default words altered;
     - the record losing its numbers;
     - "every line" on a split failure;
     - the v2.5 blank line dropped;
     - the decision fold losing its files;
     - the guard's three.
   - Missed: Q5, Q15 and G3, below.

## Commands run
- Full suite: 1106 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 657b85e`: "OK: all governance checks passed."
- `surface_guard.py diff --range acbb392..db1474e --branch build/builder/m3d-5`: "OK: 3 commit(s) … checked (1 merge(s) skipped …)".
- `review_check.py pr 999 --base acbb392`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files, with no test-weakening flag. The 46 removed test lines are the AC17 case replaced, and the AC85 and AC12 assertions rewritten.
- db1474e is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **The copy-failure words and the per-Copy names.** The spec gives neither: "Copy failed: select the text in the fold below", and the accessible name "Copy: <the choice's label>". Both are true to the layout and acceptable as C, but Define should write them in as C. No test holds the failure words (Q15 missed).
2. **No test holds the card's due mark just past its time** (Q5 missed). The card's "Was due…" boundary is only tested well past the settle time; a case within an hour of it would hold the boundary.
3. **No test holds the Copy box's look** (G3 missed). The guard never sees `.v2-obtns`, because no fixture it walks copies. AC17's test checks only what the box holds.
4. **Two v2.5 copy functions disagree on one input.**
   - Stage 5's new `v25Ruling` (sheets.js), which the sheet uses, matches `links.js`'s older `v25RulingText` on 12 of 15 inputs.
   - They differ only when the owner's words start with a blank line: the sheet's drops it, while `v25RulingText` (answerPlan's v2.5 route) leaves two blank lines.
   - One shared function would keep every route the same.
5. **A TIMEOUT of "none" reads "not given".** A lettered DEFAULT with `TIMEOUT: none` reads "TIMEOUT: not given", though the file does give it. This wording was already there (the old `defaultLabel`) and just moved.

## Open questions
1. For Define: write in the copy-failure words and the per-Copy accessible name as C?

Both worktrees and every copy are removed. Disk is at 7.0 GB free. My mutation script is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/mutate12.py.