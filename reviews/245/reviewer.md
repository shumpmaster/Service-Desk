Verdict: PASS

The Reviewer's verdicts on QW2 (PR #245), verbatim: round 1 at 8e530a5 (PASS), round 2 at 2b1d664 (PASS). After round 2 only the spec's wording changed (2471536, the Reviewer's round-2 N1). Recorded by the orchestrator.

## Round 1
Verdict: PASS

Stage QW2 of S-001 (M3G), round 1. I reviewed build/builder/qw2 at 8e530a5 against base 2516b26 without changing anything. All scratch worktrees under the scratchpad have been removed. My logs are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rvqw2/.

**Blocking findings**
None.

**What I checked, with evidence**
- **Full suite:** `node --test ../tests/desk/*.test.mjs` on 8e530a5 gave 1419 of 1419 passing, 0 failing, in 275 s (rvqw2/full.log).
- **Heap:** I ran tests/desk/ac88-dark.test.mjs under `--trace-gc`. It peaks at 1203.6 MB against the 2096 MB limit; base 2516b26 peaks at 1151.7 MB, so QW2 adds about 52 MB. That is within the "about 980 MB to spare" known limit, and the file does not need splitting.
- **The new cases fail on the old source:** I ran the head tests on base src.
  - tests/desk/ac95-qw2-places.test.mjs fails at import.
  - ac80, ac85, ac87-6b, ac91, ac16-19, ac79, ac94, notify-ac77-desk-reads and notify-ac77-desk each have at least one failure.
- **Forced rewrites are truly forced:** I ran the pre-rewrite versions on the head source.
  - All seven cases in b0cb865 fail at d954262's versions:
    - ac16-19 #10
    - ac79-desk #6
    - ac94 #35
    - notify-ac77-desk-reads #1, #3 and #15
    - notify-ac77-desk #11
  - The three in 40f7740 fail at 2516b26's versions: ac85 #1, ac87-6b #3, and ac91's "strip opens by itself" #7.
  - The cases 09fd417 labels "not forced" (AC80's two card-layout cases and AC91 (f)'s strip-order case) do pass at 2516b26's versions. The labels are honest.
- **No rewrite is weakened:** each keeps its original check after the sheet closes and adds the hold check. Two notes:
  - ac77 draft 7 checks the held words under the open sheet: tests/desk/notify-ac77-desk-reads.test.mjs:125-127. Those words come from the section card, not the sheet (src/public/sandbox.js:2647), so that check is not vacuous.
  - ac94's case adds "its words dropped" on close.
- **Planted bugs:** all 20 were caught (rvqw2/mut.log, mutated on board.js in both copies and sandbox.js):
  - no-raised-time cards first
  - locale ties
  - portfolio not last in the strip
  - kicked cards dropped from N
  - a kicked card placed by its kick's time
  - never holding
  - holding without waiting for the sheet's item (`found`)
  - a straight-opened sheet never held
  - `heldView` ignoring the screen
  - the portfolio's label taken by name
  - the accessible text without its project
  - the sheet's place taken from the fresh board
  - the held sheet's words missing
  - a drag not held
  - the place line under the kind line
  - the place line grey
  - the section not in place order
  - the strip newest first
  - no place line on a held question
  - N counted over a subset
- **QW2's row and AC95's test list are all built and locked.** Cases are at tests/desk/ac95-qw2-places.test.mjs:114, 139, 181, 211, 220, 238, 270, 281, 331, 364, 411, 454 and 484. Coverage:
  - "Portfolio" in the accessible text: tests/desk/ac91-glance-waiting.test.mjs:270.
  - Two-digit places: Alpha has 12 cards (tests/desk/qw2-fixtures.mjs:56-71), as AC94's settled point 6 requires.
  - The code is at src/lib/board.js:980 (`PLACE_WORDS`), :1001 (`placeOrder`), :1017 (`placesOf`), :1032 (`heldView`), :1045 (`heldBoard`), and src/public/sandbox.js:2287 (`placeLine`), :3156 (`placeOfSheet`), :5058-5061.
  - Readings (e), (k), (n) and (p) are as written.
- **`STRIP_ONCE` is exactly G2's look:** it is at tests/desk/ac88-dark.test.mjs:1563-1598, and src/public/sandbox.css:613-615 is byte-identical to G2's 17cc026:610-612. It is no wider:
  - It pins a subset of those declarations (`min-width: 0` is not pinned).
  - It is keyed only to elements inside `section.v2-kstrip`.
  - It is asserted met exactly (ac88-dark.test.mjs:2187).
  - No stylesheet changed in 2516b26..HEAD, so having no `QW2_ONCE` is right.
- **Home, a page and Plan keep their orders:** they read `waits` (sandbox.js:911 and :1325), which is still sorted as before (board.js `waitRows.sort(raisedOrder)` and kicked newest first). This is asserted at ac95-qw2-places.test.mjs:178. No Home, page or Plan test changed, and all pass.
- **Fixtures are labelled NOT real:** the file header (qw2-fixtures.mjs:1-21), the titles ("(made up, NOT real)"), and tests/desk/fixtures/README.md's QW2 section.
- **Identity and trailers:** all 13 Builder commits are by `builder <builder@agents.invalid>`, each with `Agent-Session:` and `Spec: S-001`. None has model or co-author lines, and none touches specs/ or governance/.
  - surface_guard is OK over 2516b26..f6c1afb (8 commits) and 26b838b..8e530a5 (5 commits).
  - Over the whole range it fails only on the Definer's 01f4734, which came in through the orchestrator's merge 26b838b, as reported.

**Non-blocking findings**
- **N1 (the Builder's open question):** what "the first board drawn under it" means.
  - `heldBoard` (src/lib/board.js:1045-1050, called at src/public/sandbox.js:5059) holds the first board drawn once `sheetFound` is true.
  - I opened straight at `Alpha|pr|81` on `qw2BusiestState` and ran two polls with the sheet open. The held board drew 12 place lines (Alpha's only) instead of the 34 drawn after close. It still said "Still reading Beta…", "…Gamma…", "…Delta…", "…Epsilon…" and "Still reading the portfolio…", though those reads had landed, while the badge read 33.
  - My judgement: this follows AC95's "Settled from QW2's build", 3. Read literally, "the first board drawn" would freeze a board drawn before any read, which is worse. AC40 makes the whole board hold, and the sheet covers most of it (see the qw2-held-sheet capture). So it is acceptable.
  - The Definer should write this reading into AC95, including that a held board keeps its unread projects' lines and its "Still reading…" lines until the sheet closes. The orchestrator might put it to the owner if wanted.
- **N2:** no locked case covers N1's multi-project consequence. The only straight-opened case uses one project (ac95-qw2-places.test.mjs:454). 8e530a5 moved the cascade walk and the qw2-sheet capture to open from the board (tests/desk/qw2-fixtures.mjs:144-152), so no walk or capture shows a straight-opened sheet over a part-read board. Add a case once N1 is settled.
- **N3:** the spec text misnames a forced case.
  - QW2's row ("the locked cases QW2 changes, each forced and named: AC91 (f)'s strip-order case …") and settled point 1 ("besides AC91 (f)'s strip order") call the strip-order case forced. It was not: base's version passes on the new source.
  - The forced AC91 (f) case is "the strip opens by itself" (40f7740).
  - The Builder's labels are right; the Definer should correct the spec wording.
- **N4:** QW2's row does not name the seven rewrites in b0cb865, which change AC16, AC79, AC94 (settled 2) with AC56, and AC77 (two files). The stage note allows naming them "in its row or its pull request's body", so the PR body must list them.
- **N5:** a gate's sheet opened over Plan now also shows " · <k> of <N> waiting", because `cardSheet`'s default is `places = bd.places` (sandbox.js:3162, :5102). That matches AC95 (the sheet's small line), and Plan's rows and order are unchanged, but no case locks it.
- **N6:** 1541290 commits only the capture script (tests/desk/tools/glance-shots.mjs). The 20 `qw2-` PNGs, including qw2-held-sheet, are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw2-design/shots/. The orchestrator should record them as it did QW1's (docs/design/builds/m3g-qw1/).

**Join-up review (Build, the parts together; a stage review, not the stage-5 close)**
Parts checked together: board.js's places, sandbox.js's cards, section, strip and sheets, the hold during a sheet or drag, the badge, and the one-project view. They were run as the sandbox under the fake DOM in the full suite and in my probes.

| Path through the product | Result | Fix |
|---|---|---|
| Waiting, busiest board → each card's place → tap → sheet's small line → close | Works together; places agree between card and sheet (ac95:331) | — |
| Sheet open, read changes order → close | Held, then new places (ac95:411) | — |
| Notification or address straight at a sheet, other projects still reading | Held board keeps "Still reading…" and those projects' cards out until close | N1 / N2 |
| "Done ✓" from a sheet | Sheet closes; card into Done with no place (probe) | — |
| One project shown | Places kept; chip says "1 of 5 projects" (ac95:270) | — |

**Open questions**
1. N1: should the held board hold only places and card order, letting quiet lines such as "Still reading <project>…" and newly read projects' groups come in under an open sheet? Or does AC40's "nothing on Waiting moves" cover them, as built? This is for the Definer, and the owner if wanted.

## Round 2
Verdict: PASS

QW2 round 2, checked read-only against build/builder/qw2 at 2b1d664 (/home/user/sd-qw2). I ran everything in scratch worktrees under the scratchpad and removed them afterwards. The working tree is clean.

**Blocking findings**
None.

**What I checked, with evidence**
- **Full suite:** at 2b1d664 it passes 1421 of 1421, with 0 failing, in 239 s. The log is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rvqw2/full2.log.
- **Scope of the round:** 2b1d664 changes only tests/desk/ac95-qw2-places.test.mjs. Nothing under src changed between 8e530a5 and 2b1d664.
- **Identity and trailers:** 2b1d664 is by `builder <builder@agents.invalid>` with `Agent-Session:` and `Spec: S-001`. 928f07e is by `definer`, merged by `orchestrator` in a21c7b7. surface_guard over a21c7b7..2b1d664 is OK (1 commit).
- **Re-planted bugs:** I planted six bugs and ran tests/desk/ac95-qw2-places.test.mjs. Each new case catches the plants aimed at it:

| Plant | Where | N2 case | N5 case |
|---|---|---|---|
| P1: hold nothing | board.js | fails | passes |
| P2: hold the board before the sheet finds its item | board.js | fails | passes |
| P3: no place over Plan | `places` = empty Map at sandbox.js:5102 | passes | fails |
| P4: hold released once a project is read | `heldView` | fails | passes |
| P5: hold only once every project is read | `found` at sandbox.js:5059 | fails | passes |
| P6: a wrong place over Plan | k+1 at sandbox.js:5102 | passes | fails |

- **The N2 case** (ac95-qw2-places.test.mjs:489-521) locks what it claims:
  - The other projects' and the portfolio's first reads are held. It uses the fake desk's existing `hold` at fake-desk.mjs:140 and :328; no fixture change.
  - The board holds through two polls once the reads come in: the same cards and places, and the five "Still reading…" lines kept.
  - The sheet keeps " · 3 of 12 waiting", while the badge moves from 12 to 33.
  - Once closed, the other projects' places show, 33 in all.
- **The N5 case** (ac95-qw2-places.test.mjs:523-556) locks what it claims:
  - Each of two made-up Launch-gate sheets opened over Plan ends its small line with the exact place the board gives that card.
  - Plan's rows are unchanged under each sheet, and Plan shows no place line.
  - "Plan's order as before" also holds by construction: `renderWorkAhead(built, …)` takes no board view, and QW2 does not touch it.
- **The spec now matches the build** (928f07e, merged in a21c7b7):
  - The "When the order changes" passage and settled point 3 say the held board is the one drawn once the sheet is open on its item. It is held whole: "Still reading <project>…" stays and unread projects' cards stay out until the sheet closes, with the badge live. That is what `heldBoard` (src/lib/board.js:1045) and sandbox.js:5058-5061 do, and what the N2 case locks.
  - The corrected N3 wording now matches what I measured in round 1:
    - Settled point 1 and QW2's row now call the AC91 (f) strip-order case "named, not forced" (its base version passes on the new source).
    - They now call "the strip opens by itself" forced (40f7740).
  - QW2's row and settled point 1 now name the seven b0cb865 rewrites by file. The Criteria column adds AC16, AC77, AC79 and AC94 as changed. AC95's test list and QW2's row name the N1/N2 and N5 cases.

**Non-blocking findings**
- **N1:** settled point 5 still reads "**The build must change:** the build adds nothing to a held question's sheet line" (specs/S-001.md, AC95's "Settled from QW2's build", 5). Point 3 now says its change was made ("e1f73f7 and `heldBoard` do so"), but point 5 does not. The change is built (src/public/sandbox.js:3156-3160) and locked (ac95-qw2-places.test.mjs:331). The Definer may want to add the same "made in e1f73f7" note to point 5. This is wording only.
- **N2:** the N5 case checks the place against the board, not against fixed numbers (`/^\d+ of \d+ waiting$/`). That is enough for what it claims (P6 is caught). The fixed numbers are already locked by the other place cases.

**Open questions**
None.

