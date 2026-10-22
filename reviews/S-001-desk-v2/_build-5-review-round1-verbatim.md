# S-001 desk v2, stage 5 (Plan): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-5 at cd6134f.

---

Verdict: FAIL

The stage 5 build (0be0d16..cd6134f) passes every check and test run. AC24's 31 cases are all kept, and 24 of 25 mutations were caught. It fails on two rules that break on Plan's list:
1. A waiting gate card in the form the model really writes turns every row into "after your ruling" and hides every rough finish.
2. A newer estimate line that can't be read is hidden on the row, which J14 forbids.

**What was run**
- Full suite `cd src && node --test ../tests/desk/*.test.mjs`: 996 tests, 996 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 35 page modules in step)". The tree was unchanged afterwards.
- `bash governance/checks/check_all.sh . 0be0d16`: "OK: all governance checks passed."
- `surface_guard.py diff --range 0be0d16..cd6134f --branch build/builder/desk-v2-5`: "OK: 2 commit(s) … checked".
- `review_check.py pr 999 --base 0be0d16`: "Risk class: R1". Every changed file is R1. The only flags are the two verdicts still to come ("missing verdict: reviews/999/design-reviewer.md", "missing verdict: reviews/999/reviewer.md").
- No write path was added. The diff adds no fetch, method, POST, PUT or storage calls; the only new device state is the ⇅ toggle, kept the way the screen's other folds are.
- Commits are by `builder <builder@agents.invalid>`, with the `Agent-Session:` and `Spec: S-001` trailers. No model names appear.

## Blocking findings

**B1. The gate ◆ and "after your ruling" wipe out the whole list when a real gate card waits. Routes to Define first (the rule is missing from the spec), then Build.**
- Code: `src/lib/workview.js` `waitingOn` counts gate cards whose `Milestone:` line names the row. The right-hand value then puts `if (r.gate)` first, ahead of "your acceptance" and the finish, and `r.icon = r.gate ? 'you' : …` replaces the state icon.
- The model writes a decision card's line from the spec header (`governance/checks/orchestrator.py` card_text, "Milestone: %s"; card_milestone reads `milestones:`). S-001's header is `milestones: M1, M2, M2B, MD1, MD2, MD3, M3A, M3B, M3C` (specs/S-001.md:15).
- How I reproduced it: AC86's own gate fixture, with that line in place of `Milestone: M3C`, rendered at `#/work`. All six rows came out the same way:
  `["st-you","MD1 · Design","after your ruling",["1 waiting on you in your Queue"]] … ["st-you","M3C · Launch · about 2–3 days","after your ruling",…]`
- So while any P-001 gate card waits, no row shows its state icon, and no row shows its rough finish. That includes MD1 and MD2, whose AC24 value "once you accept it" is replaced.
- This goes against AC86's lead, "each with its state … and a rough finish" (specs/S-001.md:7030-7032), and against "every rule of AC24 holds" (:7041-7046). The finish survives only in the sheets.
- Frame 11 draws the ◆ on a gate's own row ("Launch gate · waits on you", docs/design/mockups/desk-v2.html:840), not on milestone rows.
- Join-up difference: with a gate card that has no `Milestone:` line, Home's tile says "Next: the Launch gate, after your ruling" (src/public/sandbox.js:812-820, any gate card in the project), but Plan shows no ◆ at all. Same records, two answers.
- The AC86 test (tests/desk/ac86-plan.test.mjs:215-241) only tries a card naming one milestone.
- Define should settle which row a waiting gate card marks, and whether "after your ruling" replaces AC24's finish.

**B2. J14's "a newer estimate line could not be read" is missing from Plan's row, though the row shows the estimate and the finish worked out from the older line. Routes to Build (stage 5).**
- J14 says the row "also says 'a newer estimate line could not be read' under the estimate it shows, so an update that can't be read is never silently replaced by the line before it" (specs/S-001.md:10361-10364).
- How I reproduced it: the WORKED fixture plus a malformed later MD3 line (`low_days: 9.5`).
  - Row: `["3rd of 6","The chosen design running on the real back end","MD3 · Design · about 3–5 days",": No work filed yet · next to reach","21–23 Oct"]`, with no warning.
  - The sheet does say it.
- The row does show "may be out of date" for a stale estimate (workview.js `r.mono`), so the newer-line warning is missing only here.
- Mutation M21 (removing the sheet's warning) also survives every test. That gap was already there at 0be0d16.

## Non-blocking notes (risks for the gate's case)
- **N1. A milestone with work filed can get the "no work filed" ring.** Rule 3 (work filed in a run still to come) gets `planned`, the dashed ring AC86 calls "no work filed" (:7052). AC24 gives rule 3 the empty ring "as Status shows it" (:8345-8347), so the Builder kept the page's icon. But the state's words are now only in the sheet and in the screen reader's text. On the list, M3A after its PR is filed looks the same as a milestone with no work. AC86's "half-filled for work filed" and AC24 disagree here, so Define should say which wins.
- **N2. A soft check mark can appear on a milestone not reached.** Rule 4 (work filed, run gone back over) gets `pastcheck`, a soft check, on a milestone ahead. It matches the page (AC59), but AC24 says "lighter fill" and AC86's list of icons doesn't cover it. Define should confirm.
- **N3. The Builder's readings of the unclear parts.** I judge these within the spec, but Define should confirm them:
  - **Full row in a sheet:** AC24's whole row moves to a milestone sheet, with frame 11's two-line row on the list. This follows AC86's "only its place and look change".
  - **⇅ in place:** ⇅ switches Plan into the ordering on the same screen. The card "Rough finish, in this order" and the bar show only there, or once a draft exists.
  - **Header counts:** AC24's "<n> milestones to go · <m> reached" now comes from the group's count and "Reached · m".
  - **v2.5 lines:** they come before "Not milestones yet", as AC86 says. The Reached and Dropped folds sit between the groups and them, which AC86's order doesn't mention.
  - **Dashed ring:** "dashed ring for no work filed" matches AC86 and frame 11.
- **N4. New fixed words in the sheet that no spec or mockup lists.** "Added up in your order from today. An expectation, never a deadline." and the "Done when", "Estimate", "Rough finish" and "On the Timeline" blocks. AC24 wants such words shown to the owner before the PR (:8531-8532). None uses a banned word.
- **N5. Things that check out on "nothing made up":**
  - "22–25 Oct" is AC24's same dates written shorter; mutation M4 was caught.
  - "about <low>–<high> days" shows only for a usable estimate, not for 0-to-0, past or missing ones (M8 caught).
  - Ideas shows no count while the portfolio is unread (M16 caught).
  - "Rough finish from today, <date>" uses today in Chicago, as frame 11 does (M23 caught).

## AC24's 31 cases
All 31 are kept with the same names. Each still asserts the same values. They now read state, estimate and finish from the milestone's sheet, and open ⇅ before moving rows or reading the card or bar. A few assertions are stricter: J14's failed read now counts six rows, and AC82's finish check is now exact.

The 25 mutations were run on a copy outside git, against AC24, AC86, J4/J14/J15 and AC82. All were caught except M21:
- finish arithmetic (16 failed);
- plan body reversed (4);
- bottom-up order (13);
- the sheet showing the wrong row's finish (11);
- no copy fallback;
- no "past" or "not available" line;
- no "not in your recorded plan";
- the bar hidden with a draft;
- the waiting line dropped;
- reader place words dropped;
- the estimate note dropped;
- the right-hand value for a gate, for 0-to-0, or with no finish.

## Join-up review (Build: the parts working together)
Parts checked together: Home, Plan, Plan's sheets, the board and the Timeline, rendered with the same fixture under the fake DOM.

| Path | Result |
|---|---|
| Home tile "Next: MD1 · rough finish …" → Plan's MD1 sheet | Same finish (ac82 test) |
| Plan row "1 waiting on you in your Queue" → board for that project | Works (`#/waiting/Service-Desk`) |
| Sheet "On the Timeline" → Timeline at the milestone | Lands at `#/p/Service-Desk/timeline/ms/MD3`, scrolled to it (AC66's route) |
| Plan icons vs the project page's icons | Same, from FEED_ICON (AC24 states test) |
| Gate card waiting: Home vs Plan | **Differ (B1)**: Home shows the ◆ for any gate card; Plan only by `Milestone:` line, and then on every named row |

## Open questions
1. **For Define (B1):** does a waiting gate card mark a gate row of its own, as frame 11 draws it? Or does it mark own milestones, and if so which ones, given that cards name the spec's whole milestone list? And should "after your ruling" replace AC24's finish or sit beside it?
2. **For Define (N1):** for work filed in a run still to come, should Plan use AC86's "half-filled for work filed" or AC24's ring "as Status shows it"?

The scratch worktree and copies are removed. Nothing in the repository was changed.