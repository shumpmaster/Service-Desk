# S-001 desk v2, stage 4 (the question and gate sheets): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-4 at 61b9e93.

---

Verdict: PASS

Round 2 of the review of S-001 stage 4 (the question and gate sheets). Branch build/builder/desk-v2-4 at 61b9e93, checked against base 99a6437. I worked in a detached worktree. I changed no file in the repository: every mutation ran in memory through a Node load hook. The worktree and my probe files are removed.

**The blocking finding is fixed.** The card, the sheet, the accepted view and Home's briefing now share one rule, `defaultLetter` in `src/lib/records.js:326`. They agree on every case I tried. Nothing is made up, nothing true is lost, and no test was weakened.

## Round-1 findings

**B1, the sheet made up "defaults to A": FIXED.**
- **The rule:** `defaultLetter` (`/^([A-Z])\b/`) is now used by `defaultLabel` (records.js:340), the sheet's `undoLine` (sheets.js:94), the card's `questionMark` (board.js:87) and Home's `settleAt` (home.js:111). A DEFAULT that names no letter is quoted as written (records.js:344).
- **The fixture is the real file.** `tests/desk/fixtures/trial-view/P-001-design-pick.md` matches `git show f8dfd1b:questions/P-001-design-pick.md` byte for byte. The README entry calls it real.
- **Reproduction re-run on the fixed code**, with the real file and a raised time:
  - Sheet: `Reversibility: reversible · Default: per the question file: DEFAULT none — this is your pick and never defaults (AC43)`
  - Card: null. Home: null. Accepted view: the same quoted words.
- **On 1862e4d the same run gave:** `…defaults to A (TIMEOUT not given)` on both the view and the sheet.
- **The second case** (`DEFAULT none`, TIMEOUT 48): the sheet now says `…Default: per the question file: DEFAULT none`, with no ISO time. The card and Home show nothing.
  - On 1862e4d, Home's `settleAt` gave a settle time for this case (172800000). So the briefing would have said "one question settles itself". That is fixed too.
- **Mutations:**
  - Putting the old capital-anywhere pick back fails 3 tests: ac11-12 #6, and ac85 #36 and #50.
  - Removing the new quote line fails the same 3.
  - Putting Home's `!q.default` back fails ac85 #50.

**N1, the card's no-letter guard: now tested.** Removing `!letter` from `questionMark` fails ac85 #37 and #50.

**N2, dropping v6 from storage: now tested.** Removing `'desk-blobs-v6'` from `OLD_BLOB_CACHE_KEYS` fails ac85 #51.

**N3, the v2.5 copy text with words typed: now tested.** Passing `''` for the words in `src/public/sandbox.js:2090` fails ac85 #52.

**N4 (the board's gate buttons leave out a reason typed in the sheet) and N6 ("1 hour"):** unchanged and still non-blocking. Q2 below still stands.

**N5, the accepted view had the same bug: FIXED** by the shared rule, and the new ac11-12 test covers it.

## The accepted view (AC11/AC12) and Home's briefing (AC82)
- **Nothing made up.**
  - All real DEFAULT values I found still read as before: `A`, `B` or `C` with TIMEOUT 48 in Service-Desk, and the same in the operating model.
  - The `none — …` lines are now quoted rather than read as a letter.
- **Nothing true lost on real files.**
  - A DEFAULT starting with a letter, such as `C — …`, `A. Keep` or `B (…)`, still gives the letter and the time.
  - Irreversible questions and a missing reversibility read exactly as before.
- **The lowercase edge.** `DEFAULT: a` is now quoted (`per the question file: DEFAULT a`), and the card and Home show nothing. This is honest. Every real file uses a capital letter.
- **The tests.**
  - ac11-12: one test added, none changed.
  - ac82 and ac54: not touched. They pass.
  - ac85: one changed line, the expected text for P-001-design-lab-open. It went from `…defaults to none — these are yours and never default (TIMEOUT not given)` to `…DEFAULT none — these are yours and never default`. That is a correction, not a weakening. The old text made "none" read like a letter, and called a TIMEOUT "not given" when the file says `none`.

## The rest of 61b9e93
- It touches only the 10 files it names.
- The `src/lib` and `src/public/lib` copies of records.js, sheets.js, home.js, board.js and scheduler.js are identical.
- The `fmt` that `undoLine` now passes to `defaultLabel` can never be used: when the sheet reaches that point, the question has no letter, or no TIMEOUT in hours, or is not reversible. It is harmless.
- `review_check.py pr 999 --base 99a6437` flags no test weakening. Its only failures are the two verdicts not yet recorded (`reviews/999/design-reviewer.md` and `reviews/999/reviewer.md`).
- The commit is by `builder <builder@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers.

## New findings (none blocking)
- **R2-N1. The "start of field" anchor has no test.** If you drop `^` from `defaultLetter`'s pattern, every test still passes, because no case has a capital standing alone after other words. A file with `DEFAULT: none (see option B)` would then read "defaults to B". This routes to Build as a test to add, if the Orchestrator wants it.
- **R2-N2. A marked-up letter is quoted, not read.** A DEFAULT of `(A)` or `**B**` is now quoted. The card and Home then count nothing settling, though the file means a letter. No real file uses these forms. AC82 says it counts questions "whose file gives both DEFAULT: and TIMEOUT:". The build counts only those whose DEFAULT starts with a letter, which seems right under AC12's rule against implying a default. This is an open question for Define (Q3 below).

## Runs
- **Suite** (`cd src && node --test ../tests/desk/*.test.mjs`): 979 tests, 979 pass, 0 fail.
- **Build** (`node src/tools/build.mjs`): `build: PASS (2 connected projects; 35 page modules in step)`.
- **Checks** (`bash governance/checks/check_all.sh . 99a6437`): `OK: all governance checks passed.`
- **Surface guard** (`python3 governance/checks/surface_guard.py diff --range 99a6437..61b9e93 --branch build/builder/desk-v2-4`): `OK: 3 commit(s) in 99a6437..61b9e93 checked (0 merge(s) skipped, 0 exempt, 0 human)`.
- **Review check:** as above, only the two missing verdicts.

## Join-up (this stage's parts together)
On the real file and the made-up cases, the card, the sheet, the accepted view and Home's settle count now agree. With no letter: no clock on the card, the quote in the sheet and view, and nothing counted on Home. With a letter: the same letter and time everywhere. The round-1 mismatch between the card and the sheet is gone. My other round-1 join-up results are unchanged.

## Open questions
- **Q1 (for Define, from round 1, still open):** the spec should name the gate card's section 5, or the status file's `gate_recommendation` and `user_verdict`, as the record of the Critic's and the user representative's words. It names the Critic's file, which the desk does not read.
- **Q2 (from round 1, still open):** should the board's gate buttons carry the reason typed in the sheet (N4)?
- **Q3 (for Define, new):** should AC82's "gives both DEFAULT: and TIMEOUT:" be worded "a DEFAULT naming an option letter"? That would match the one rule built here.