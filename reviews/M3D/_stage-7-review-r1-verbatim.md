# M3D stage 7 (S-001 after MD3): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/m3d-7, 18fa305..bade9f3.

---

Verdict: FAIL

**Summary.** Stage 7 does most of what it should. All the required checks run clean except the expected review check. A portfolio Done card is kicked back at about 5 minutes. The cap is 10 a day, the day turns at midnight in `ownerTimeZone`, and no read is made without storage. The read budget holds: 6,566 calls against 6,556 with no marks, so 10 more, which fits A3's 9,952. The queue's README.md and .gitkeep are not cards, and a read that stays pending counts as failed. No R3 path is touched. The stage-8 guard (tests/desk/ac88-dark.test.mjs) is unchanged from 18fa305 to the head, and no CSS changed in this stage. The head merge 3cc503c adds exactly 22eca92's patch (`git diff f5cac07 22eca92` is identical to `git diff bade9f3 3cc503c`), and at the head the build and the ac88/ac89 tests pass. Three blocking findings remain: a reload loses the 5-minute read, the library-facts rule leaves out more than the spec says, and the tests miss several points, including all of bade9f3.

**Runs (at bade9f3)**
- `cd src && node --test ../tests/desk/*.test.mjs`: 1136 pass, 0 fail. AC14's diagnostic: "6566 calls with 12 marks and 10 reads after them; 6556 with none".
- `node src/tools/build.mjs`: PASS (36 page modules in step).
- `check_all.sh . 18fa305`: all pass.
- `surface_guard diff --range 18fa305..bade9f3`: OK, 2 commits.
- `review_check pr 999 --base 18fa305`: R1. It fails only on the two verdict files not yet recorded (reviewer, design-reviewer), as expected.

Note: the stage is two commits on 18fa305 (7308e45, then bade9f3), not one. I judged 18fa305..bade9f3.

**Blocking findings**

B1. **A reload between a mark and its read loses that read.** Marks 1 to 10 can then take about 10 minutes, outside AC89 (l)'s stated limits (specs/S-001.md:7949-7957) and M3D's gate case (:2348-2350).
- The read is asked only in `markCard` (src/public/sandbox.js:1927). `extraDue` lives only in the scheduler's memory (src/lib/scheduler.js:259, 327-331), and nothing in a new opening asks again for the marks already kept on the device.
- The day's slot is still used up (`{"day":"2026-10-22","n":1}`).
- Reproduced in the sandbox harness with the same storage:
  - Reload 1 minute after the mark: still "Confirming" at 5:10, kicked back only between 5:10 and 7:00.
  - Reload at 4:50: still "Confirming" at 9:40, kicked back at about 9:52.

B2. **library/facts/ leaves out more than the spec says.** The spec names one file: "`library/facts/_TEMPLATE.md` is the model template's file, not a fact" (:12335-12337; AC87 :7731-7733 counts facts "by name and count").
- src/lib/portfolio.js:404 and 407 drop every name starting with `_`, nested ones too. So an owner's `library/facts/_draft.md` is never counted.
- No test pins the exact rule: changing the filter to `n !== '_TEMPLATE.md'` survives every stage test.

B3. **The tests don't pin several scheduling points, including the whole of bade9f3.** Each of these mutants survives ac89-portfolio-reads, ac87-portfolio-6b, j23-portfolio and AC14's "AC89 (l)" case:
- Deleting bade9f3's only change, the filter at scheduler.js:425.
- An extra read resetting the 5-minute cadence (scheduler.js:368-369, `lastPollStart` always set).
- An extra read's deadline set to a full 5 minutes instead of "when the next 5-minute read falls due" (scheduler.js:372; J23 :12343-12345).
- Dropping the `card.portfolio` check, so a project card's mark asks a portfolio read and uses a slot (sandbox.js:1927).

I checked by hand that bade9f3 works: with a 3-second read under way when a mark's read falls due, the desk asks the portfolio 2 times, not 3, and `extraReads` is 0. But no test fails without it.

These 17 mutants were caught: cap 11, day in UTC, an unchecked write, `since` now, no deadline, a late answer applied, README.md or any file as a card, the read at +4 or +10 minutes, no cap at the page, the intent words, the intent file not named apart, and the template rule removed.

**Non-blocking notes**

N1. **On-screen words not in the spec.**
- `intentLine` and its drawing add "; <n> more · <names>" when intent/ holds other files besides PORTFOLIO-INTENT.md (portfolio.js:419, sandbox.js:1067).
- The spec gives the row only as "Standing intent: intent/PORTFOLIO-INTENT.md (its words not read)" (:12338-12339) and doesn't cover this case.
- Every other new word is the spec's.

N2. **A false "Can't read" for a healthy read.**
- When a mark's read falls due just before the regular 5-minute read, its deadline is that gap, as little as 1 ms (scheduler.js:372).
- Reproduced: the read due 1 s early, every read answering in 2 s. "Can't read your portfolio since 13:04" showed for about 2 s, until the regular read answered.
- This follows J23's words literally, but it says a healthy read failed. It should be rare, about one mark in a few hundred.

N3. **The test's "Checking…" line checks nothing.**
- `assert.notEqual(r1.state, 'cant')` (ac89-portfolio-reads.test.mjs:211) can never fail, because `portfolioRead` has no state called 'cant'.
- The point is still pinned by 6b's existing test: a mutant was caught by j23-portfolio's "review round 1, B1" case.

N4. **A read is counted failed while the page is hidden.** If the read is under way when the page hides, its deadline still fires in the background. So on return the desk says "Can't read your portfolio since <ask time>" until the read made at once answers. Reproduced.

N5. **Citations a line or two off.**
- The tests cite S-001.md:7944-7949 / 7944-7962; AC89 (l) is at 7946.
- They cite 12334-12354; the J23 change is at 12333-12349.
- They cite 14019; the A3 after-MD3 sum is at 14020.

N6. **Smaller points.**
- The `extra: false` field in the portfolio state is never used (scheduler.js:259).
- A corrupt value under `desk-pf-kick-reads-v1` makes the store unusable, so no such read is made for that opening.
- A read under way at the mark's due time that then fails drops the mark's read (scheduler.js:425 runs on any outcome), so that mark waits for the next 5-minute read.

**Open questions**
1. B1: should the page ask, at load, the read for each kept portfolio mark still within its 5 minutes, without using another slot? Or is the reload case to be written in as a known limit?
2. N1: when intent/ holds other files beside the template's, should the row name them, and in what words? The spec needs to say.
3. N2 and N4: should a mark's read get its own deadline (or the regular read wait for it), and should hidden time stop counting toward the deadline?

Worktree and scratch copy removed (`git worktree list` clean).