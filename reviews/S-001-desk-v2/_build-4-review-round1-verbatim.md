# S-001 desk v2, stage 4 (the question and gate sheets): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-4 at 1862e4d.

---

Verdict: FAIL

The stage 4 sheets are mostly right. Every answer file I checked matches the spec character for character, with the box empty and filled. The gate's "Recommended" comes from the case, never the Critic. Both side fixes are right and tested. The suite and all the checks pass. One blocking defect remains. On a real Service-Desk question file, the question sheet states a default the file does not give, and the card and the sheet disagree.

## Blocking findings

**B1. The question sheet makes up a default on a real Service-Desk question file.** Routes to Build (back to the Builder).
- Where: `src/lib/sheets.js:103-105`. `undoLine`'s "otherwise" branch calls `defaultLabel` (`src/lib/records.js:328`). `defaultLabel` takes the first capital letter anywhere in the DEFAULT field: `(/[A-Z]/.exec(q.default) || [q.default])[0]`.
- The real case: Service-Desk's own `questions/P-001-design-pick.md` (commit f8dfd1b) reads `DEFAULT: none — this is your pick and never defaults (AC43)   TIMEOUT: none`, with REVERSIBILITY `reversible`.
- How I reproduced it: I ran `parseQuestion` on that file, then `undoLine(q, <raised>, 'America/Chicago')`. Output: `text: 'Reversibility: reversible · Default: per the question file: defaults to A (TIMEOUT not given)'`. The "A" comes from "AC43". The file says it never defaults.
- The card for the same file shows nothing (`questionMark` returns null). This build fixed the card with the new `defaultLetter` (`/^([A-Z])\b/`), but the sheet still uses the old letter pick.
- A second case with the same cause: `{reversibility:'reversible', default:'none', timeout:'48'}` gives `…Default: per the question file: defaults to none at 2026-10-22T12:00:00.000Z`. That is a raw ISO time, worded as if something happens then.
- What this breaks:
  - AC85: "These report what the file says".
  - AC12: "The desk must not imply that one will".
  - The owner's rule that nothing is made up.
- The AC85 test fixes the clumsy reading for P-001-design-lab-open in place (`ac85-sheets.test.mjs:201`): "defaults to none — these are yours and never default (TIMEOUT not given)". No case covers a DEFAULT of `none` with a capital later in the line, or with a TIMEOUT in hours.

## What I checked and found right
- **Answer files.** I read the tests' expected texts against AC53 and AC80. I also ran in-memory mutations through a module load hook, so no file was changed. All of these match the spec, empty and filled:
  - lettered, with a `Milestone:` line;
  - numbered, with blank numbers left out and `;`/line breaks joined;
  - unsplittable;
  - the gate's four buttons: Hold and Recycle put the words on `Reason:` as one line, and Proceed and Kill indent each line by two spaces after line 2.
  
  Paths are unchanged, and nothing writes anywhere new. Mutations M3, M4 and M12 (dropping the words from the gate, lettered and numbered buttons) are each caught. M13 (the fold's text drifting from the link) is caught too.
- **"Recommended" on a gate.** It comes from the case's `**The proposer's recommendation:**` line (`j11.js` `PROPOSER_RE`). With no case file, no label shows. On a gate card, the Critic's and user representative's lines are passed over in `recommendedWord`. Mutations M1, M2 and M9 are each caught.
- **Side fix 1: a gate card in Done.** In the base code, `stepButton` hit `s.label.replace` with no label, which crashed. Now it renders the four buttons, as `P-001-board-done-button.md`, A, asks. Removing the fix (M5) is caught by the AC85 "Move to Done" test.
- **Side fix 2: "Settles as none".** Right: a card with TIMEOUT `none`, or a DEFAULT with no letter, shows nothing.
- **Parser and cache.** The cache key is now v7, and `OLD_BLOB_CACHE_KEYS` lists v1 to v6. `scheduler.js:190` still removes each old key.
- **Test rewrites.** Each one is the replaced design, not a weakening:
  - ac53: the option is split into its words and the description under them, and the test asserts the two together equal the file.
  - ac80: "Move to Done" on question and gate sheets; the opening and the foot replace the old headings.
  - md-sandbox: "Their views" replaces the old links and line, and "Recommended" sits on the case's word.
  - s033: the key is v7, and v5 is still dropped.
- **Fixtures.** The ac85 fixtures are made up and labelled NOT real (their README, and the fixtures README:524-530). The two real files are Service-Desk's own: P-001-next-work.md is identical to commit ccf320f, and P-001-design-lab-open.md is identical to commit bb6f8e7. P-003 and "Letters" are not real items. I saw no private operating-model content.

## Commands run
- `cd src && node --test ../tests/desk/*.test.mjs`: tests 975, pass 975, fail 0.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 35 page modules in step)`.
- `bash governance/checks/check_all.sh . 99a6437`: `OK: all governance checks passed.`
- `python3 governance/checks/surface_guard.py diff --range 99a6437..1862e4d --branch build/builder/desk-v2-4`: `OK: 2 commit(s) … checked`.
- `python3 governance/checks/review_check.py pr 999 --base 99a6437`: R1. Its only failures are the two verdicts not yet recorded (`reviews/999/design-reviewer.md` and `reviews/999/reviewer.md`). It flags no test weakening.
- Commits are `builder <builder@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers.

## Non-blocking notes
- **N1. A card fix with no test.** Removing `!letter` from `questionMark` (`board.js`, the stage 4 line `if (!rev.startsWith('reversible') || !letter || !hours)`) survives every test (M6). The card would then show "Settles as null · …" for a DEFAULT of `none` with a TIMEOUT in hours. The code is right today.
- **N2. Dropping v6 has no test.** Removing `'desk-blobs-v6'` from `OLD_BLOB_CACHE_KEYS` survives the full suite (M15). The tests only check v1 and v5.
- **N3. The v2.5 copy text with words typed has no test.** Passing `''` for the words survives (M7). The text's form predates stage 4: it is the lettered form, not AC19's bare `Ruling: <letter>` and the note.
- **N4. The board's four gate buttons leave out a reason typed in the sheet.** The test asserts this on purpose (`ac85-sheets.test.mjs`, "the sheet's words left in the sheet"). AC80's step table says "each its filled-in answer file, as in the sheet". An owner who types a reason and then taps Hold on the board gets an empty `Reason:`. Nothing is wrong or made up, but it reads against "as in the sheet".
- **N5. The accepted view has the same bug as B1.** Its `defaultLabel` would also say "defaults to A" for that file. This predates stage 4 and is outside this stage, but a fix in `records.js` would fix both.
- **N6. "1 hour" is singular.** The spec's wording is "<TIMEOUT> hours". This is fine, just noted.

## Join-up (this stage's parts together)
These paths were run end to end under the fake DOM, fake desk and fake clock:
- **The parts:** board card → sheet → words box → buttons and fold → answer file; gate card → case read (J11) → "Recommended"; the cache key.
- **Board to sheet:** they agree on the lock/clock line in every tested case. The exception is B1, where the card shows nothing and the sheet shows "defaults to A". That is blocking.
- **Gate sheet and gate card:** they agree on the Critic's and user representative's words.
- **Done:** marking from the sheet moves the card into Done, still confirming. "Undo" brings it back to the count.
- **The fold's files:** each is exactly what its link carries.

## Open questions (for Define)
- **Q1. Where "its record" is for the Critic and the user representative.** The build reads both lines from the gate card's section 5. I judge this sound. The Orchestrator writes those lines word for word from the Critic's checked `recommendation` and the representative's `user_verdict` (`governance/checks/orchestrator.py:923-934`, patterns at :108-113). The Critic's own file sits on the item branch, which the desk does not read. But AC85 and AC52 name the Critic's file (`reviews/<item>/_<phase>-gate-<n>-critic.md`) as the source. This is a gap for Define: the spec should name the card's section 5, or the status file's `gate_recommendation` and `user_verdict`, as the record.
- **Q2. N4.** Should the board's gate buttons carry the reason typed in the sheet?

The scratch worktree is removed. I briefly wrote one temporary copy of P-001-design-pick.md into the scratchpad to reproduce B1, then deleted it. No repository file was changed.