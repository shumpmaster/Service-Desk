# M3E stage G3: the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/g3-gate-titles at da491c2 (base 648dcd2).

---

Verdict: PASS

G3 of "S-001 after the glance audit": I reviewed build/builder/g3-gate-titles at da491c2 on 648dcd2, over 648dcd2..da491c2, in /home/user/sd-g3. I judged it from the diff, the spec and the tests. I read only the commit's subject and trailers, not its body.

There are no blocking findings. Every gate now has one short title, and the same words appear on its card on Waiting, as its sheet's title, as the sheet's name for screen readers, and on Plan's gate row. With a case line the title reads "The Launch gate, case 1 · P-004"; without one it reads "The Launch gate · P-004". The gate sheet now opens with the card's whole question, under the title, held to three lines with "Read it all", and it stays open through a refresh. Gate titles are cut at two lines and other card titles keep three. The item at the end of a title always moves to the next line in one piece. Two cards at the same gate now read apart. Each changed locked test had to change, and none lost strength. The guard's G3 exception is exact, and moving the stage-5 pin into it was forced. In real Chromium, at both widths and in both themes, no gate title is cut and nothing scrolls sideways. I wrote only scratch files.

## Blocking findings
None.

## What I checked
1. **The short title's form.** `gateTitle` (src/lib/sheets.js:233-241):
   - It takes the second non-blank line of section 1 and keeps it only if it matches `^(<GATE_TITLE>, case \d+)\.?$` for the card's own gate. It drops the full stop, then adds " · " and the card's `item:` from its header line (`cardItem`, :218).
   - Otherwise it gives "<GATE_TITLE> · <item>". That covers a missing line, a line in another form such as "You rule on the gate…", a line naming another gate, and an unread card (the item then comes from the path).
   - These match orchestrator.py's writer at :888-891 (`"%s, case %d." % (GATE_TITLE[gate], st["gate_n"])` straight after GATE_QUESTION) and its header line at :883. The spec cites :893-895; the file has moved slightly, and nothing turns on it.
   - `GATE_TITLE` in src/lib/j11.js:30 is word for word orchestrator.py:105.
   - "ready to go live?" appears nowhere (ac91 test 1).
2. **The same words in all three places.**
   - board.js:396 makes `title: gateTitle(c)`. The sheet's aria-label (sandbox.js:2803) and its h2 (:2691) use the same function. Plan's row takes `card.title` (workview.js:86).
   - `gateTitleNode` (sandbox.js:2191) only splits the string after its last " · ", so the text and the accessible name are unchanged.
   - Lib copies: `diff` shows src/lib and src/public/lib are identical for board, j11, sheets and workview. The build says "36 page modules in step".
3. **Two-line cuts for gate titles only.**
   - `.v2-card.gate .v2-tt` is 2 × 1.33em, `.v2-clip.v2-stt` is 2 × 1.3em (the sheet title is `--t-sheet`, line height 1.3), and `.v2-plli.gate .v2-plname` is 2 × 1.35em (sandbox.css:1188, :1260, :1266).
   - `.v2-tt` stays at three lines for other cards. The ac91 cascade test asserts a question card keeps three, in light and dark, at 360 and 414.
4. **The item kept unbroken.** `.v2-gitem { display: inline-block }`, with no `nowrap` (md-sandbox:600 and AC42 hold). In Chromium at 360 px, "P-004" wraps whole onto the second line on the card and in the sheet.
5. **The opening.**
   - `gateOpening` returns section 1's first line word for word, or "not recorded" for an empty section, or null when the card is unread.
   - It is drawn with `clipNode('gopen:…', …, 'v2-lead')`, which uses the existing `.v2-clip.v2-lead` rule: `--t-lead`, 3 × 1.45em, with the fade.
   - It sits between the title and "The case opens" (ac85 rewritten and ac91 order assertions).
   - "Read it all" appears only past three lines. It stays open after a `POLL_MS` refresh because `clipOpen` lives at module level (ac91 test 4).
6. **Cases the spec names.** Two gate cards at one gate, whose first lines are word-for-word the same, read apart on the board and on Plan, both with and without case lines. A card without its case line is covered on the board, in the sheet and on Plan (ac91 tests 2 and 3, fixture `gates`, labelled NOT real in the fixtures README).
7. **Rewritten locked cases, all marked "rewritten in G3":**
   - **ac80 kinds case:** gains the gate title assertion and a decision-card control assertion. Stronger.
   - **ac85 gate-sheet case:** the title, plus the opening's text, class and position. Stronger.
   - **ac85 pure case:** the old "phase said once" and "Launch gate: not recorded" assertions are replaced by the new rule's case-line, no-case-line and unread cases. Forced.
   - **ac85 AC89 (j) cut case:** gate titles now measured at two lines, with a new "two lines: no fade, no control" check on the sheet. The CSS assertions are exact, plus a new `.v2-card.gate .v2-tt` rule. Equal or stronger.
   - **ac86 B1 case:** the row's title. Forced, same strength.
8. **The stage-8 guard.**
   - G3_ONCE pins four exact before→after values, each to its own element by parent: the gate card's v2-tt, the sheet's v2-stt, Plan's gate v2-plname, and v2-gitem only inside those three.
   - Set equality is asserted at ac88:884-885, and the catch-all excludes `G[123]` (ac88:886).
   - The stage-5 move is forced. M3D5 has set equality (ac88:874-875), so its old pin `calc(3 * 1.45em) → calc(3 * 1.3em)` would go unmet and fail. Rewording it under M3D5 would label G3's change as stage 5's.
   - The new G3 pin starts from the true before value (`.v2-clip`'s 3 × 1.45em). M3D5 is still checked before G3, and its v2-tt 3-line pin is still met by non-gate cards.
9. **Nothing outside G3.** There are 18 files: the gate title/sheet/Plan code, a comment-only change in workview.js, the tests, the fixtures plus their README, and the capture tool. The sandbox.js hunks are imports, `cardTitle`/`gateTitleNode`, `sheetHead`'s comment, `gateSheetParts` and `planGateRow` only.

## Join-up (the parts working together)
- A gate card's title on Waiting, a tap on it, the sheet's title and name, Plan's gate row, and that sheet opened over Plan all show the same words (ac91 test 1; captures g3-waiting-gates, g3-sheet-gate-case, g3-plan-gates, g3-plan-sheet).
- The sheet's head line still reads "<project> · gate · <item> · waiting …".
- No differences found.

## Commands run
- `cd src && npm test`: 1186 pass, 0 fail.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 648dcd2`: "OK: all governance checks passed."
- `surface_guard.py diff --range 648dcd2..da491c2 --branch build/builder/g3-gate-titles`: "OK: 1 commit(s) … checked".
- `review_check.py pr 999 --base 648dcd2`: R1; needs the design-reviewer's and the reviewer's verdicts. Only those two "missing verdict" lines failed, and no test-weakening flag was raised.
- `node tests/desk/tools/glance-shots.mjs <scratch> g3-`: 32 captures. None scrolls sideways, and no gate title is cut; each takes one or two lines. I viewed the board and the case sheet at 360 light.
- The commit is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **For the Definer: the guard change is not named in the spec.** The G3 row's tests column names only AC85, AC80 and AC86's cases. It does not name the rewritten AC89 (j) cut case (ac85-sheets "AC89 (j), rewritten in G3"), the new G3_ONCE, or the stage-5 (M3D5) `max-height` pin moved into G3's exception. All three are forced and exact (item 8). Route: the Definer's parallel amendment names them.
2. **The unread-card readings are the Builder's.**
   - An unread gate card is titled "<GATE_TITLE> · <item from its path>". Before G3 it was "card launch-1" on the board and "Launch gate: not recorded" in the sheet.
   - Its sheet opening reads "The card's file: not available" (sandbox.js:2694). These are new words, and no test reaches that branch.
   - Both are honest and consistent with AC89 (h). Route: the Definer words them, or a test covers the branch in a later stage.
3. **A Done row still draws a gate's title as plain text** (sandbox.js:2250). There, "P-004" could split at its hyphen. The spec names only the card, the sheet and Plan's row, so this is not G3's to fix. It is for the Design reviewer.
4. **The spec's line "the whole in the sheet's head line" is ambiguous.** The build reads it with AC89 (j)'s note: the sheet's title is also cut at two lines, with "Read it all". In practice the title never needs a cut: two lines at most at 360 px.
5. **The spec cites orchestrator.py:893-895 for the case line.** It is at :888-891 today. A citation drift only.
6. **The pull request's own captures still need to be made** and judged by the Design reviewer. Mine are scratch only, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g3-review/shots/.

## Open questions
None beyond notes 1 and 2.

I changed no tracked file, and `git status` in /home/user/sd-g3 is empty.
