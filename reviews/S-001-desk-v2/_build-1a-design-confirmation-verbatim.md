# S-001 desk v2, stage 1a: the Design reviewer's confirmation of the last fix, verbatim

Dispatched by the orchestrator on 2026-10-21 against origin/orch/desk-v2 at 48a49e3, under the owner's answer A to P-001-desk-v2-1a-stop.

---

Verdict: PASS

**In plain words.** Round 3 had one blocking problem (F4-r3), and it is fixed. Take the board filtered to one project that was read and then can't be read. "Being asked in your session: 1" and "Your answer is being recorded: 1" now stay in that view, as the owner ruled (P-001-desk-v2-1a-stop, A). Their folds still open. The held question's fold still has its "Answer it here instead" button. The two counts on the line above them say "can't read" in words, with no number. A project that was read and is now being checked again says "checking…" instead of the untrue "not read yet". Once it is read again, its real counts come back. Every other screen is exactly as it was at f535529, apart from the "N s ago" ages. I found nothing new that needs fixing. I changed nothing and committed nothing.

**What I checked.** origin/orch/desk-v2 at 48a49e3, which holds the Builder's 0b8bdb9. The change is `git diff d79d9d1 0b8bdb9`: `quietLines` in src/public/sandbox.js (lines 1719-1732), plus two tests. The fix moves the two count pushes into an `else` branch, so the `asking` and `answerRecording` lines below them now run in both states. Line 1724 picks "checking…" when the project has a `lastSuccessAt`.

**How I got the evidence**
- Playwright Chromium, with the page's calls answered by tests/desk/fake-desk.mjs.
- Each state at 360×740 and 414×896, light and dark.
- I reran the round-3 harness (r2/cap.mjs with signatures, r3/states3.mjs, r3/states3-held.mjs). I also wrote one new script outside the repo, `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/conf/conf.mjs`. It uses the AC77 real fixtures for Service-Desk (a held question; an answer pull request with asks-merge) and covers the re-check state. I ran it on both 48a49e3 and f535529.
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/conf/fold-base.mjs` finds the off-scale elements in the held fold.
- Captures are in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1a-harness/shots-conf/`:
  - `after/`: the full set, 140 captures, with `measures.json`;
  - `held/`: with `states3-held.json`;
  - `states/`: with `states3.json`;
  - `conf/`: with `conf.json`;
  - `conf-base/`: the same script on f535529.
- No script errors in any after-run.
- **Tests:**
  - the locked tests (ac80-board, ac81-bar-type, ac48-62-63-look): 47 pass, 0 fail;
  - the whole suite (`node --test tests/desk/*.test.mjs`): 836 pass, 0 fail.
- Both scratch worktrees (dconf-1a, dconf-1a-base) are removed.

## 1. F4-r3 is fixed
All of the following hold at 360 and 414, in light and dark.

**Held question, filtered `#/waiting/Service-Desk`, read and then can't read** (`conf/asking-readthendown-filtered-*.png`, `-fold-*.png`)
- The small line reads "With the agents: can't read · Being recorded by the automatic job: can't read".
  - Its class is `v2-qsmall unknown`, with 0 buttons. No digit appears for an unknown.
- Next comes the line "Being asked in your session: 1".
  - It is a `<button class="v2-ql">`, 400/12, 328×28 at 360 and 382×28 at 414.
  - Tapping it sets `aria-expanded="true"` and opens `fold:asking`. The fold reads "Being asked in your session: answer there · Which piece of later work comes next? · P-001-next-work · The question and its options, to read".
  - The fold holds the button **"Answer it here instead"**, 130×28.
- At f535529 the same case showed only the small line. There was no held line, and `[data-k="ql:asking"]` was not found (`conf-base/`).

**Recorded answer, same state** (`conf/recorded-readthendown-filtered-*.png`, `-fold-*.png`)
- "Your answer is being recorded: 1" stays: a 28 px tall button.
- Its fold reads "Your answer is being recorded · Which piece of later work comes next? · PR #90".
- At f535529 the line was missing.

**The Example fixture from round 3** (`held/held-readthendown-filtered-*.png`)
- It now reads "With the agents: can't read · Being recorded by the automatic job: can't read · Being asked in your session: 1".
- The full board in the same state is unchanged: "With the agents: 1 · Can't read Example since 16:02 · Being asked in your session: 1".

**Once read**, the filtered line shows the real counts "With the agents: 0 · Being recorded by the automatic job: 0", with 2 fold buttons, and the held line is there.

**Style of the small line:** 400/12px IBM Plex Sans; rgb(92,95,102) in light at 6.4:1, rgb(162,165,172) in dark at 7.72:1.

**Page checks:** scrollWidth equals innerWidth with 0 wide elements, no undersized tap targets, and no low-contrast text in any of these states.

## 2. "checking…" is on the scale and true
- **Probe:** Example (or Service-Desk with the held question) is read. The tab is hidden for 10 minutes, then made visible, with the re-read held off.
- **Wording:** the small line reads "With the agents: checking… · Being recorded by the automatic job: checking…" (`conf/recheck-example-rechecking-*.png`, `conf/recheck-asking-rechecking-*.png`).
  - At f535529 the same state said "not read yet" (`conf-base/`).
- **Style:** 400/12px Plex Sans; 6.4:1 in light and 7.72:1 in dark; 0 buttons. That is the `--t-small` role, so item 27 passes, with no off-scale size on the screen.
- **True:** the subtitle says "checked 10 min ago" at the same moment. The lanes still hold the last read's 6 cards. The project really has been read and is being checked again. The words match AC5's "Checking…" and the subtitle's "checking…".
- **With the held question,** "Being asked in your session: 1" stays during the re-check too.
- **After the re-read** the line returns to "0 · 0".
- A project never read still says "not read yet" (`states/preread-filtered-*`, unchanged).

## 3. Nothing else visible changed from round 3
- `r3/sigdiff2.mjs` compared f535529's 140 captures (`shots-r3/after/`) with these (`shots-conf/after/`): main and md-extremes, both widths, both themes.
  - 33,156 elements, covering computed colour, background, margin, padding, font, decoration, display, border, box and text.
  - **0 element differences.**
- It also flagged 3 body-text differences, all in `x-sheet-long-{360-dark,414-light,414-dark}`. They are age artefacts:
  - the harness cuts body text at 6000 characters before it normalises ages;
  - "7 s ago" against "10 s ago" or "11 s ago" moves the final "." across that cut.
- On the states and held runs, before and after differ only in the lines covered in 1 and 2.

## Checklist items touched
- Part A items 1, 2 and 3 (rulings, spec AC77/AC80, waiting is real): **PASS**. F4-r3 is closed.
- Items 4 and 5 (quiet is honest, no made-up figures): **PASS**. Unknowns are in words, and nothing says "Quiet".
- Items 8 to 14 and 25 (type, contrast, targets, width, colour, dark mode): **PASS**.
- Part B item 27 (sizes): **PASS**.

## Non-blocking follow-ups (they predate this change; identical at f535529)
1. **Lanes beside "checking…":** an empty lane in a project being re-checked still says "Not read yet" (sandbox.js:1680, untouched). The small line below it now says "checking…" (`conf/recheck-asking-rechecking-*`). This is the lane half of the Reviewer's round-3 open question 1.
2. **Hidden text in the held fold:** the closed "The question and its options, to read" `<details>` holds record text at 700/21.6, 400/14.4 and 700/16.848. It is not visible while closed, and it is identical on the full board at f535529 (`fold-base.mjs`). Whether it is on the scale when opened should be checked in a later review.
3. **Earlier lists:** round 3's follow-up list and open questions still stand. That includes the known-but-stale counts in the filtered view while it can't be read.

## Open questions
None new.