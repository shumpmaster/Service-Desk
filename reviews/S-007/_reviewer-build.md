Verdict: FAIL

I found no S-007 build in this folder. The defect the spec fixes is still in the code, and the locked checks cannot run. The check log's PASS covers only the governance checks, not the spec's tests.

## Findings

**F1. The locked checks cannot run: the seam file is missing (blocks every criterion, AC1–AC19 and J1–J6).**
- `tests/acceptance/S-007/lib.mjs:15` loads `tests/desk/s007-seam.mjs`. That file does not exist; `ls tests/desk` lists no `s007-*` file.
- To reproduce: `node --test tests/acceptance/S-007/*.test.mjs` gives `# tests 12`, `# pass 0`, `# fail 12`. All 12 fail with `ERR_MODULE_NOT_FOUND: Cannot find module '.../tests/desk/s007-seam.mjs'`.
- `node --test tests/acceptance/S-007/` (the README's own command, `tests/acceptance/S-007/README.md`) also fails: `Cannot find module`, fail 1, on Node v22.23.4.

**F2. The recorded baseline is missing (spec line 23; rubric R9; mutant M37).**
- `tests/desk/S-007-baseline.json`, which `tests/acceptance/S-007/lib.mjs:22` expects, does not exist. So AC9 and AC14–AC17 have nothing to compare against, and `baseline-provenance.test.mjs` fails.

**F3. The reported defect is still in the code (AC3, AC2, AC4, AC6, J2; mutant M4).**
- `src/lib/board.js:454`: for any card that is not a gate card, `recWord = ... || recommendedWord(c)`.
- `src/lib/board.js:487-499`: `recommendedWord` takes the word only from the card's own `## 5.` section.
- Nothing in `src/lib` or `src/public/sandbox.js` reads a `-notes.md` file's `Recommendation:` line. `src/lib/records.js:34-36` and `:49-51` explicitly skip `-notes.md` files.
- Nothing in src produces the "No Chief of Staff recommendation yet" mark: `grep -rn "recommendation yet" src` finds nothing.
- So a `stop` card still shows its section-5 word as Recommended, which is the Q-019 `stop-1` failure the spec describes (spec line 16).

**F4. The one rule, the hold and the monitoring run don't exist (AC1, AC4, AC7, AC11, AC13; J3, J6; rubric R4, R8).**
- `grep` in `src/lib` finds no rule list, no held state, no age-from-`card`-entry logic and no monitor call. `src/lib/timeline.js:9,40` mentions monitoring, but that is the existing Launch-4 phase, not AC13's run.

**F5. The operating notes are missing (AC18; rubric R5).**
- Neither `docs/handover/desk-operations.md` nor `docs/handover/service-desk.md` has any of the three exact "not shown" lines, the mark, the held-card explanation, how to run AC13, or J6's check moments.
- The only near match is about the sender's own memory, not S-007: `docs/handover/desk-operations.md:465`.

**F6. The check log does not show that the build passes.**
- `reviews/S-007/checks.txt:2` says "Prepared the check tree (0 change(s) applied)", and `:395` says the discarded change set is "none". So no build change was checked.
- Lines `:5-389` ran only governance checks. `node --test tests/acceptance/S-007/` was never run, so the log's `verdict: PASS` (`:392`) doesn't speak to S-007.
- The log also contradicts itself: `:21` says "no frozen spec yet", then `:22` says "6 frozen or superseded spec(s)" and `:27` says "19 criteria in 1 frozen spec(s) checked".
- Claiming the work is done on this evidence is an unverifiable claim, which is itself a FAIL.

**F7. Join-up review (end of Build): the parts working together.** There are five views: the queue, Home's count, the board, the card sheet (`src/public/sandbox.js` and its generated copies) and the notification sender (`src/notify/**`).

| Check | Result |
|---|---|
| All views and the sender take one card list from one rule (AC11, J3–J5) | **Blocking.** There is no such list. The views still mark buttons through `answerButtons` and `recommendedWord` (`src/lib/board.js:448-499`). |
| Held decision cards are kept out of every view and every notice (AC1, AC14) | **Blocking.** No hold exists; decision cards show as before. |
| The mark and the three lines use the existing styles (rubric R7) | Can't be checked: nothing was built. |
| The non-blocking risk from the Design review: board and notifications have no failed-read line (spec line 154) | Still carried as a risk to the gate (open question 5). |

## Open questions
1. Was the builder's change set ever handed to this review folder? The log's "0 change(s) applied" suggests the build branch was empty or wasn't the one checked. If a build exists somewhere else, it needs a new check run that includes `node --test tests/acceptance/S-007/*.test.mjs`, and then a fresh review.
2. Was the mutant pass in `checks/S-007/mutants.md` run? With no seam, none of M1–M37 can be checked yet.
3. Smaller point: the README's run command, `node --test tests/acceptance/S-007/`, fails to resolve a directory on Node 22 even if the seam existed. A glob such as `tests/acceptance/S-007/*.test.mjs` works. Since the check is locked, this goes to the check author as a question, not an edit.