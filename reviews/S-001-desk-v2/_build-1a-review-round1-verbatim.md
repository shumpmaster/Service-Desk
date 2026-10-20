# S-001 desk v2, stage 1a: the Reviewer's round-1 build review, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/desk-v2 at bffdc1b, by a fresh Reviewer.

---

Verdict: FAIL

**What this means for you:** most of stage 1a is built and sound, but three things in the frozen spec are not met, so it can't land yet. First, after the agents push a new commit, a pull request whose verdict you already gave PASS briefly offers "Verdict ↗" again, which the spec forbids. Second, the "✕ <n> check failing" line on pull request cards is not built. Third, the build's limit on repeated reads resets at every opening, so on the spec's own busy-day count the desk would make about 11,000 calls against the 10,000 it promises. That convention adds worst cases together, so a real day may stay lower, but the promise isn't shown to hold. Nothing that needs you is hidden. There are no secrets and no new outside sites. The fonts are IBM's own files, byte for byte.

Reviewed: orch/desk-v2 at bffdc1b (it merges main, the spec branch at 3ce0d22 and the Builder's branch at f7b3184). The Builder's change is `git diff origin/build/definer/s001-desk-v2...origin/build/builder/desk-v2-1a`. I did not see the Builder's summary. The scratch worktree has been removed.

## Commands run
- `npm --prefix src run build`: `build: PASS (2 connected projects; 31 page modules in step)`, exit 0.
- `npm --prefix src test`: 820 tests, 820 pass, 0 fail, 0 skipped.
- `GOV_BRANCH=orch/desk-v2 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`: exit 1. Every check passes except `record_checks merges`, which fails on the orchestrator's merge commits 85341b3 and bffdc1b having no Item: trailer. That is the known orch/ failure you expected.
- `python3 governance/checks/review_check.py pr 999 --files-from <(git diff --name-only origin/main...HEAD)`: R1; required reviews design-reviewer, owner and reviewer; FAIL on the 3 missing verdicts, as expected. Running it with `--base origin/main` instead flags only `tests/desk/ac53-answer-boxes.test.mjs: assertion count fell from 103 to 91` (see finding 5).

## Findings

**1. BLOCKING: after a head change, rule 7 keeps the class but not the owner's verdict, so the card goes back to "Verdict ↗".**
- What the spec says: AC80 says "until J20 has read the new head, the card keeps the last head's judgement (its class, its verdict)". J22's rule 1 says the card is "never 'Verdict ↗' again (GitHub's new-file page would refuse a file that exists)".
- Where: src/lib/j22.js:532-550. The kept record `keep` (line 537) holds the file judgement `a` and `needed`, but not the owner's verdict word. At a new head whose list is unread, `own` is null (line 542), so the kept `a.needs` reaches rule 2.
- Reproduced with a script against the real 304144d risk-paths file. An R3 pull request with `reviews/304/owner.md` reading PASS on its branch:
  - at head A: `merge 2`;
  - at head B, J20 not yet read, with `prStep(pr(B), ctx, atA.keep)`: `verdict 1 A high-risk (R3) change, so it needs your verdict before the merge.`
- This lasts a cycle normally, and up to `FILES_RETRY_MS` (5 minutes) if J20's read of B fails. A common trigger is merging main into the branch after the owner's PASS.
- The only rule-7 test (tests/desk/j22-board-rules.test.mjs:211-213) checks a pull request with no verdict, so it can't catch this.

**2. BLOCKING: the "✕ <n> check failing" meta line on a pull request card is not built.**
- What the spec says: AC80 lists, for a pull request card, "for a pull request with a failing check, "✕ <n> check failing" (AC29's state, as drawn)". Its test list names "each card's kind line, meta, lock or clock line and failing check".
- Where: src/lib/board.js:194 and :212 set `failing: null` for every card. src/public/sandbox.js:1619 draws `card.failing`, so it never shows.
- Evidence: a grep for "check failing" across src/ and tests/ finds nothing, and no test covers it.
- Note: the page reads CI only for the default branch's head (AC29, src/lib/model.js:472-486). If no per-pull-request check state is meant to be read, the Definer should say what the card shows. Either way the frozen criterion is unmet, with nothing in the change saying why.

**3. BLOCKING: AC14's budget is not shown on the spec's own count.**
- What A3 counts: the waited J20 read at 288 heads × 5 = 1,440 for the day (specs/S-001.md:12937-12946). AC80 says "each pull request head costs at most 5 such calls".
- What the build does: `HEAD_POLLS` is kept in per-opening memory (src/lib/scheduler.js:46-48, `newProjectState`'s `j22.headPolls`), so a head still open at the next opening gets 5 more.
- Measured: the Builder's own case 1 reports `9010 calls, 2660 waited-read calls over 538 heads seen` (test output, `# AC14 (AC80, case 1)`).
- Substituting that into A3's total: 9,817 − 1,440 + 2,660 ≈ 11,037, over 10,000.
- The test also doesn't run the day AC14 describes. The spec says "the same days run again" on top of AC79's day (A3's 7,577 is part of the 9,355 and the 9,817). tests/desk/ac14-budget.test.mjs:396-537 runs the board's cases on a day without AC79's candidates, J12 failing or the grant failing. So its "< 10,000" does not bound the 9,817 day.
- Fix: either keep each head's 5 across openings (on the device), or the Definer recounts A3 and the test runs the combined day.
- What is asserted: < 10,000; at most 5 waited reads a head per opening; one verdict call per head per opening (1,015 calls over 538 heads); a failing head's retries within 1 + 5; at most 16 blob calls a cycle (measured 7); at most 3 owner-check heads a poll. J1's 11 + 3 + 16 = 30 is checked in j6-j8-function.test.mjs (new J1 case).

**4. Non-blocking: a failed owner-check read is never asked again in that opening.**
- Where: src/lib/scheduler.js `applyOwnerChecks` adds any non-string answer to `refused`. A 5xx or a network failure gets the same treatment as a 403.
- What the spec says: J22 says only "a 403 is never asked again within an opening".
- The failure is on the safe side: the check reads "not read", so the pull request shows as a card. But (i) and rule 3 go unseen for the rest of the opening. The refused head also still takes one of the 3 places (`ownerChecksDue` filters after `ownerCheckHeads` has sliced to 3).
- Non-blocking risk.

**5. Non-blocking: the ac53 assertion drop (103 → 91) is the replaced design, not weakening.**
- What went: the whole-file "final box", "an edit by hand is never overwritten / Rebuild from my answers", the rule-line words, and the 44 px chip CSS. AC80 replaces all of these: the box is now the words box; "AC53's rule line is not on the board".
- What replaces them: each button's file, checked character for character, with the box empty and filled.
- Minor loosening, non-blocking: the lettered choice's accessible-name assertion (`c.textContent === "<L> <text>"`) is gone. An estimate-merge row regex became `includes()` (ac60/j12 files).
- Every other changed test file keeps or raises its test and assertion counts. No test was skipped or deleted. Rewritten cases follow the spec's list (Queue → Waiting/Done rows, bar → v2-bar, Deploys → Approve card with AC72's words in its sheet, the AC42 "@font-face" ban → AC81's same-origin check).

**6. Non-blocking: some AC80 cases are tested only at the unit level.**
- AC80's test list wants these on the rendered page: the FAIL, unread and "Owner: after agents" cases "each left out of every count"; rule 0 not kept across heads "a card at once and counted"; and the marked Merge card going to the agents.
- They are covered only in j22-board-rules.test.mjs and by `judgeMarks` in ac80-board.test.mjs:659.
- The page test at ac80-board.test.mjs:406 covers only the missing-reviewer case. The code path is shared, so non-blocking.

**7. Open question: the gate card's Critic line.**
- The card reads "Critic: its view is on GitHub" or "not recorded" (src/lib/board.js:236).
- AC80 and AC85 say "Critic: <its word>", the verdict word, and AC85 reads it from the record at stage 4.
- Is stage 1a's wording an accepted (C) reading until stage 4?

## Checked and holding
- **Scope:** the Builder touched only src/ and tests/. src/notify/**, src/config, src/functions, .github, governance, docs and intake are untouched. Nothing from stage 2 or later was built (no J24, portfolio or publishesModel).
- **J22 rule 0 and the reads:**
  - `ruleZero` takes no kept judgement. An unread list, a fork's pull request, a list of 300 files or more, or an unreadable risk-paths file each leave (i) alone. An unread verdict on the branch or in the tree counts as given. A file shown removed doesn't count.
  - `verdictPhase` runs only `if (opts.j11 && blobs.ok)` after `blobPhase`, outside the optional loop. It makes one call per head in AC52's order. A failed call goes on to the next head; only a rate limit or a 401 stops the rest.
  - `ownerCheckHeads` follows draft 4 (it leaves out an owner PASS/FAIL on the branch and a pull request with the agents by (ii); order is created_at then number).
  - The rule order matches J22.
- **`verdictOf` against `parse_verdict`:** a differential fuzz of 20,000 random texts (BOM, CR, Cf characters, \x1c, \x85, U+2028 and others) gave 0 mismatches.
- **Required reviewers against govlib `RiskPaths.required`:** 3 × 3,000 random path sets over the tree, on the HEAD file and the pr148 and 304144d files, gave 0 mismatches.
- **AC80:** checked in code and tests:
  - grouping in J7's order; `waiting/<name>`; the chip's ✕ replacing its history entry;
  - kick-back at ≥ 5 minutes, judged only on a new successful read, confirming first;
  - Done's 24 hours and "yesterday, <time>";
  - a pending Done row with its step button and "Undo";
  - the gate card's four buttons;
  - the words box carried into each file;
  - "With the agents" and "Nothing waiting" placed above the lanes, and under them when filtered.
- **AC81:**
  - one bar, the top row on Status, Timeline and Team only;
  - `p/<name>/queue[/<key>]` redirected with `location.replace`;
  - badge = waiting + kicked, hidden at 0.
- **Fonts:** I downloaded `@ibm/plex-sans@1.1.0` and `@ibm/plex-mono@2.5.0` with `npm pack`. All 10 woff2 files are byte-identical by SHA-256 to `package/fonts/split/woff2/*`, and LICENSE.txt is identical (OFL 1.1). Each `unicode-range` equals IBM's CSS beside the files (`fonts/split/woff2/IBMPlex*-<Weight>.css`).
- **Security:**
  - index.html is unchanged, with `default-src 'self'`.
  - The only new URLs are github.com links, plus scripts.sil.org inside the licence text.
  - The new function read is `api.github.com …/commits/{sha}/status` with `redirect: 'manual'`, v3 projects only.
  - No secrets in the diff, and no access widened.

## Open questions
1. Finding 2: is a per-pull-request check state meant to be read? If not, the spec should say what the card shows.
2. Finding 3: should the five-poll bound per head hold across openings (stored on the device), or should A3 be recounted per opening?
3. Finding 7: the Critic's word at stage 1a.
4. The Chromium checks at 360 × 740 and 414 × 896, light and dark, with their screenshots, belong in the pull request and couldn't be checked on the branch.
