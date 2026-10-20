# S-001 desk v2, stage 1a: the Design reviewer's round-3 build review, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/desk-v2 at f535529, acting as design-reviewer. A FAIL at round 3 goes to the owner under the stop rule.

---

Verdict: FAIL

**In plain words.** Round 3 fixes round 2's blocking finding. When the board shows one project that hasn't been read yet, or can't be read, the line under the lanes now says "With the agents: not read yet · Being recorded by the automatic job: not read yet" (or "can't read"). It no longer shows two zeros, and there is nothing to tap. Once the project is read, its real counts come back. Every other screen is exactly as it was in round 2. But the same few lines of new code bring one new problem. Say a project was read and then stops being readable, for example after a network blip. If the owner has a question being asked in their session (the same applies to an answer being recorded), its line "Being asked in your session: 1" disappears from that project's filtered view. With it go the fold and its "Answer it here instead" button. The full board still shows the line. Before round 3 the filtered view showed it too. The fix is small and local. I changed nothing and committed nothing.

Change reviewed: origin/orch/desk-v2 at f535529. Round-3 code is `git diff 97c55c5 d79d9d1`: src/public/sandbox.js +7 (quietLines, 1719-1725), and src/lib/scheduler.js and src/public/lib/scheduler.js +4 each (saveWaits() at opening; `if (!waitsKept) return` before a waited read).

## How I got the evidence
- **Harness:** the round-2 harness at `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/r2/` (`cap.mjs`, `measure.js`, `sig.js`, `pixdiff.mjs`), plus new scripts in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/r3/`:
  - `states3.mjs`: the unread states;
  - `states3-held.mjs`: a held question;
  - `cap-nostore.mjs`: a store that refuses writes;
  - `sigdiff.mjs` and `sigdiff2.mjs`: style comparison.
- **Setup:** Playwright Chromium, the page's calls answered by tests/desk/fake-desk.mjs, the clock fixed at 2026-10-19T21:00Z, 360×740 and 414×896, light and dark.
- **Captures** are in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/shots-r3/`:
  - `after/` and `base/`: the full set, 140 captures each, from f535529 and 1c4d4f8, with style signatures;
  - `states/` and `states-base/`: 60 unread-state captures each, with `states3.json`;
  - `held/` and `held-base/`: the held-question captures;
  - `nostore-after/` and `nostore-base/`: the refusing-store captures;
  - `pixdiff.txt`.
- **Script errors:** none in any capture.
- **Tests:**
  - Locked tests (`node --test tests/desk/ac80-board.test.mjs tests/desk/ac81-bar-type.test.mjs tests/desk/ac48-62-63-look.test.mjs`): 46 pass, 0 fail.
  - Whole suite (`node --test tests/desk/*.test.mjs`): 834 pass, 0 fail.
- Both scratch worktrees (dr-1a-r3, dr-1a-r3base) are removed.

## F3-r2: resolved
The filtered view (`#/waiting/<name>`) now renders `<p class="v2-small v2-qsmall unknown">` with words and no buttons. Same at all four width and theme combinations, from `states3.json`:

| State | Small line under the lanes | Buttons | Lanes |
|---|---|---|---|
| Polls held, `#/waiting/Example` or `/Alpha` | "With the agents: not read yet · Being recorded by the automatic job: not read yet" | 0 | "Not read yet" |
| Both projects down, `#/waiting/Example` | "… can't read · … can't read" | 0 | "Can't read" |
| Alpha down, Example read, `#/waiting/Alpha` | the same | 0 | "Can't read" |
| Once read (`preread-then-read-filtered`, `partial-filtered-read`) | "With the agents: 1 · Being recorded by the automatic job: 0" | 2 (99×24 and 210×24), and both folds open | real counts |

- Not one digit in the quiet line or the lanes in any unread state.
- Style: 400/12px IBM Plex Sans, `--ink2`; contrast 6.4 light and 7.72 dark; on the scale (`--t-small`).
- Round 2 against round 3 on the same states: the only change anywhere is this line in the five filtered unread states (`states-base/` vs `states/`).
- Screenshots: `states/preread-filtered-360-light.png`, `states/alldown-filtered-414-dark.png`, `states/partial-filtered-down-*.png`.

## Regressions checked
- **Rounds 1 and 2 (F1, F2, F3 on the full board, the `:where()` lowering, sheet foot, marks, folds): none.**
  - 140 captures (main and md-extremes, both widths, both themes) compared between 1c4d4f8 and f535529: 33,156 elements, with computed colour, background, margin, padding, font, decoration, display, border, box and text.
  - **0 differences**, apart from the "checked N s ago" and "moved N s ago" ages.
  - Pixel diffs fall only in those ages (`shots-r3/pixdiff.txt`).
  - This covers: the sheet's "Done ✓" and "Close" pills and its 44×44 close; the record heading at 500/13; the marks (kicked back after 6 minutes, and "Confirming with GitHub" with its step and Undo); and every fold.
- **Scheduler change:** with `Storage.prototype.setItem` throwing (`cap-nostore.mjs`), Home, Waiting, Waiting/Example, marks and the verdict sheet render identically between round 2 and round 3: 20 captures, 0 differences.
- **Blocking regression found:** F4-r3, below.

## Blocking finding
**F4-r3: the filtered view drops "Being asked in your session" and "Your answer is being recorded" for a project that was read and then can't be read.**
- **Breaks:** Part A item 3 ("does everything not counted show as its ruling says?"), and S-001 AC77 ("the desk shows it as such"; as changed by AC80: "a held question shows in the board's quiet line 'Being asked in your session: <n>', its fold holding … 'Answer it here instead'"). Also item 5: the unknown is not stated in words; the line just vanishes.
- **Cause:** sandbox.js:1719-1725. When `bd.unread` is set, quietLines returns right after the small line, before lines 1736-1737 push the asking and answerRecording lines. In this state the model from the last read is still in use:
  - the full board still lists the line;
  - the filtered "Waiting on you" lane can still show the last read's cards.
- **Reproducing case** (`r3/states3-held.mjs`): the Example fixture's question gets "Asked in session: cs-held-1" after its Milestone line; read; Example then fails; 2 polls; `#/waiting/Example`.
  - f535529, filtered: the quiet area is only "With the agents: can't read · Being recorded by the automatic job: can't read". No held line.
  - f535529, full board in the same state: "With the agents: 1 · Can't read Example since 16:02 · Being asked in your session: 1".
  - 1c4d4f8, filtered, same case: "… Being asked in your session: 1" (`held-base/`).
- Same result at 360 and 414, light and dark.
- **Screenshots:** `shots-r3/held/held-readthendown-filtered-360-light.png` and `held-readthendown-waiting-*.png`.
- **How it is reached:** Home's pill, the Status screen's queue button and the top row's "Waiting" all open this view (AC81). Any failed read after a good one gets there.

## Evidence per checklist item (what round 3 touches: the filtered view's quiet area)
### Part A
1. **Rulings — FAIL** through F4-r3 (AC77 under P-001-board-scope C's filtered view). F3-r2's ruling (P-001-design-lab-1.md, "Absolutely no fake numbers") is now kept.
2. **Spec — FAIL** on F4-r3 (AC77). AC80's one small line under the lanes is kept, with real counts once read.
3. **Waiting is real — FAIL** (F4-r3: a not-counted item no longer shows). Badge and counts are unchanged (7, 6 and 1 in the states run).
4. **Quiet is honest — PASS.** No "Quiet" anywhere; the subtitle is "checking…" before a read.
5. **No made-up figures — PASS** for F3-r2. The held line's silent drop is counted under F4-r3.
6. **Every project — PASS.** main, poom, service-desk and md-extremes all render; 0 script errors.
8. **Type roles — PASS.** The new line is small (400/12).
9. **Text boxes — PASS.** `.v2-input` is 16px; zoom is unlocked (unchanged).
10. **Contrast — PASS** for what the change adds: 6.4 light, 7.72 dark.
11. **Tap targets — PASS.** The unread line has no target. `.v2-qs` is 24 px tall once read. No undersized target in any state.
12. **Width — PASS.** scrollWidth equals innerWidth in every state; 0 elements past the edge.
13. **Colour alone — PASS:** words.
14. **One meaning per colour — PASS.** `--you` is used only by the badge and the owner-waiting kind icons.
15. **Sheets and refresh — PASS** (unchanged; 0 differences).
21. **Board — PASS** apart from F4-r3.
22. **Tabs and Home — PASS** (unchanged).
23. **Typeface — PASS.** All v2 text is IBM Plex Sans or Mono (web fonts, CDP); 0 requests to another origin.
25. **Dark mode — PASS** on items 9 to 14. F4-r3 shows in dark too.

Items 7, 16 to 20 and 24 are not touched: 0 differences.

### Part B (frame 2)
- **26 — PASS** apart from F4-r3. Frame 2 draws only the read state.
- **27 — PASS.** The new text is 400/12. No off-scale size in any capture (scale check in `states3.mjs`).
- **29 — PASS.**
- **35 — PASS.**

## Non-blocking follow-ups
These were already there before round 3 and are unchanged by it:
- **Old Home, everything down:** `.sb-hg-bad` "2 can't be read" is 4.39:1 in light. Identical at 1c4d4f8 (`states-base/`).
- **No time on "can't read" in the filtered view:** its words, now including the new line, still carry no "since HH:MM", and with everything down the subtitle stays "checking…". This was noted in round 2. Nothing says Quiet.
- **Everything else in round 2's follow-up list still stands:** `--soft` at 3.18 and 3.88; old-screen text under 4.5:1; Team's `a.sb-tlink` spacing; old screens not in Plex; two-column tiles.

## Open questions
1. **Read, then can't read, filtered — mixed signals on one screen.** The "Waiting on you" lane still shows the last read's card and its count (1). The new line says "With the agents: can't read". The full board in the same state says "With the agents: 1" (`states/readthendown-*`). Neither is a made-up figure. Should the filtered view and the full board agree on whether a known-but-stale count is shown? This is for the Definer.
2. **Round 2's open questions 1 and 2 are still open:** the partly read board's lane counts, and whether a read 0 on the filtered line should still open an empty fold.
