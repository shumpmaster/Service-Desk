# M3D stage 7 (S-001 after MD3): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/m3d-7 at c2299cc.

---

Verdict: PASS

**Summary.** Round 2 (c2299cc, one commit on 3cc503c) fixes B1 to B3 and follows the Orchestrator's rulings on N1, N3 and N5.
- My reload repro is now fixed. With a reload 1 minute after the mark, or at 4 min 50 s, the card is kicked back by 5:10 after the mark. The day's count stays at 1.
- All round-1 mutants are now caught, and no test was weakened. One new mutant of the B1 fix survives (N1 below). I rate it non-blocking.
- On the `n !== '_TEMPLATE.md'` probe: the code now is that probe (`n !== FACTS_TEMPLATE`, src/lib/portfolio.js). So I ran it the other way round:
  - restoring round 1's wide `_` filter is caught;
  - removing the template rule is caught;
  - excluding `_TEMPLATE.md` in sub-folders too is caught.

**Runs**
- Full suite at c2299cc: 1139 pass, 0 fail (3 more than round 1). AC14 still reports 6,566 calls with 12 marks against 6,556 with none.
- `node src/tools/build.mjs`: PASS.
- `check_all.sh . 18fa305`: all pass.
- `surface_guard diff --range 18fa305..c2299cc --branch build/builder/m3d-7`: OK, 5 commits (1 merge skipped).
- `review_check pr 999 --base 18fa305`: R1. It fails only on the verdict files not yet recorded (reviewer, design-reviewer), as expected.
- No R3 path is touched. tests/desk/ac88-dark.test.mjs (the stage-8 guard) is unchanged from 18fa305 to c2299cc.

**Each point**
- **B1, fixed.**
  - A mark keeps `kickRead: true` only when it got a slot (sandbox.js `markCard`), and `readMarks` keeps only a literal `true`.
  - At load, `kickReadsDue` asks again the read for each kept mark that is still inside its 5 minutes and not yet kicked back or confirmed. It takes no slot (src/public/sandbox.js:4324, after `boardState.load`).
  - New mutants caught: no re-ask at load; the re-ask taking a slot; `readMarks` dropping the flag; `kickReadsDue` ignoring "kicked back", "confirmed", the 5-minute limit or the flag; the re-asked read made at +10 minutes.
- **B2, fixed.** Only `library/facts/_TEMPLATE.md` is left out. The test pins `_draft.md`, `sub/_TEMPLATE.md` and `_TEMPLATE.md.bak` as facts, and checks "Library facts: 1 · _draft.md" on the sheet.
- **B3, fixed.** These round-1 survivors are now caught: bade9f3's filter deleted, the extra read shifting the 5-minute cadence, the extra read's deadline set to a full 5 minutes, and a project card's mark asking a portfolio read. The other round-1 mutants are still caught.
- **N1 (ruling), done.** The intent row is the spec's alone. Putting the "<n> more" words back, in the library or in the sheet, is caught.
- **N3, done.** The pinning line now checks that no "Can't read" words show, and a mutant of it is caught.
- **N5, done.** The citations are correct: S-001.md:7946, 12333-12349 and 14020.
- **Nothing else changed.** The 9 files changed since 3cc503c are all this stage's. scheduler.js is untouched; B3 was tests only. The src/lib and src/public/lib copies match.
- **No test weakened.**
  - The intent assertion was changed to the spec's row, as the N1 ruling says.
  - The "Library facts: none yet" sheet check is kept, in a separate open.
  - The case that could never fail was replaced by a real check.

**Non-blocking notes**
- **N1. One gap in the B1 fix.**
  - Setting `kickRead: card.portfolio` instead of `kickRead: read` (sandbox.js `markCard`) survives every stage test.
  - Its effect: an 11th mark, or a mark made without storage, would get a read after a reload, past the cap of 10 and A3's count.
  - Today only a direct check of `kickReadsDue` and `readMarks` pins this, with no sandbox-level case. The code is correct.
- **N2. "Since" after a stuck read is not pinned.** When a read is abandoned after an earlier failure, it keeps that failure's "since" (scheduler.js:350, as AC34 says). Changing it to the ask time survives. The code is correct.
- **N3. The fixtures README lags.** tests/desk/fixtures/README.md doesn't list round 2's new made-up files: `library/facts/_draft.md`, `sub/_TEMPLATE.md`, `_TEMPLATE.md.bak` and `intent/2026-standing.md`. They are labelled made up inline, through `MADE_UP` in the test itself.
- **N4. Two tabs on one device each make the read.** A mark's read can be made in each tab that is open within the mark's 5 minutes. The cap and A3 count it once. This is rare.

**Open questions**
- Round 1's N2, N4 and N6 are with the Definer, as ruled. So is the case of other intent files beside the template's.

Worktree and scratch copies removed.