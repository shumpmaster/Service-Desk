# S-001 desk v2, stage 1b: the Design reviewer's review, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-1b at 337478e.

---

Orchestrator note, not part of the report: the fix that followed (476ceb6) changes only tests/desk/notify-j16-rule0.test.mjs and tests/desk/notify-j18-rule0.test.mjs, so nothing under src/public/ changed after this review.

Verdict: PASS

Stage 1b doesn't change anything on the screen. I rendered the page at 337478e and at e7a4979 and compared them at 360×740 and 414×896, in light and dark: the old stage 1a scenes plus a new set where the owner check is actually read. Element by element and pixel by pixel, the only differences are "checked N s ago" and "moved N s ago". Those depend on how long each run takes and differ the same way between two runs of the same commit. The three locked page tests pass on both commits. Nothing was skipped. One gap: the 1a harness turned out never to reach the owner-check read, so I added a harness for it (point 3).

**1. What changed on the page (the "No visible change" path).** The only page files that change are `src/public/lib/j22.js` and `src/public/lib/scheduler.js`. They are byte-identical to `src/lib/`, and `node src/tools/build.mjs` reports "PASS (2 connected projects; 31 page modules in step)".
- The new `ownerChecksApply(project, pulls)` (j22.js:405–409) adds three guards: no project, no list and a null list entry.
- None of them can be reached from `checksRead` (scheduler.js:771–773).
  - `st.project` is always set.
  - `pullsOf` (scheduler.js:247) always returns parsePulls' array of objects.
- So the result is the same as the old inline code for every input the page can produce. Nothing touches words, CSS, layout or behaviour.

**2. The 1a harness re-run on both commits.** Outputs are in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1b/old/` and `…/dr-1b/new/`, in the `cap`, `states`, `held` and `conf` folders.
- **Element signatures** (`r2/cap.mjs` with SIG, then `r3/sigdiff2.mjs`): 140 screens and 33,156 elements, 1 difference after ignoring ages.
  - That one is `x-sheet-long-360-light`. Its text cut at 6,000 characters moved by one character because "10 s ago" is one character longer than "7 s ago".
- **State logs:** `states3.json`, `states3-held.json` and all four logs are identical; `conf.json` differs only in "checked 1 s ago" against "0 s ago".
- **Pixels, old against new:** 0 of 60 states captures differ, 0 of 12 held and 1 of 56 conf. In cap, 11 of 160 differ. Every box sits on the age line (x 65–79, y 103–113) or on "moved N s ago" on the marks screen. I checked by eye: `…/dr-1b/crops/marks-414-light-old-new.png`.
- **Against your stage 1a captures in shots-conf/:** states 0 of 60 and held 0 of 12 differ, conf 1 of 56. For `after/` against the new cap, 44 of 160 differ, all in the same age boxes (`…/dr-1b/crops/waiting-alpha-414-light-1a-vs-1b.png`). Signatures against 1a show 2 differences, the same text-cut shift in light and dark. `cap.log` is identical to 1a's `log.txt` once ages are removed.

**3. States where the owner check is read.** The 1a fixtures' pull requests carry no `base.repo.private`, so `checksRead` was always false and the changed line was never exercised. The new harness is `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-1b/harness/cr.mjs`, with results in `…/dr-1b/{old,new}/cr/`.
- It runs 12 variants of a public v3 "Example" project with #140, an R1 change whose Reviewer verdict is PASS:
  - eight that read the check: none posted, "Owner: after agents", "Owner verdict needed", "Owner approved", "Owner requested changes", "Owner not required", "CI code changed", and a failed read;
  - four that must not: one pull request of unknown privacy, one private, all private, and v2.5 public.
- Each variant covers Home, Waiting, Waiting with folds open, and #140's sheet top and end. That is 192 screens and 240 captures per commit.
- **Request bodies:** `calls.json` is byte-identical between commits. The eight public variants ask for owner checks on 3 heads (0140…, 0126…, 0127…); the four others ask for none.
- **Signatures:** 29,840 elements, 0 differences.
- **Pixels:** 2 of 240 differ, both on the age line (`sheet140-pub-agents-360-light` top and end).
- **What renders is the same on both commits:**
  - "Owner: after agents" gives "With the agents: 1", 8 waiting, and "The agents still have findings to fix first."
  - "Owner verdict needed" gives "Verdict ↗"; "Owner approved" gives "Verdict in. Next, the merge."; "Owner requested changes" gives "You asked for changes".
  - The non-reading variants show 9 waiting with #140 as "Merge ↗".
- Dark capture side by side: `…/dr-1b/crops/pub-agents-360-dark-old-new.png`.

**4. Locked page tests.** `node --test` on `tests/desk/ac80-board.test.mjs`, `ac81-bar-type.test.mjs` and `ac48-62-63-look.test.mjs` passes 47 of 47 on 337478e and on e7a4979. The diff doesn't touch those files. As a cross-check, the full desk suite on 337478e passes 863 of 863.

**5. Other ways the page could change.** `src/public/sw.js` says it "caches nothing" and `_headers` sends `Cache-Control: no-cache`. So an installed phone can't run the new scheduler.js against an old j22.js, which would fail on the `ownerChecksApply` import.

**Checklist items touched** (all unchanged, from the evidence above):
- Item 3, waiting is real: the counts with and without the check match, and so does "With the agents".
- Item 6, every project: service-desk, poom and md-extremes render with no page errors and no sideways scrolling.
- Item 12, width: nothing scrolls sideways at either width.
- Item 21, board: lanes, kicked back, Done and the marks screen.
- Item 25, dark mode.

Part B doesn't apply, since this change doesn't carry out mockup v2. There are no new findings, and the known non-blocking ones from before (such as `--soft` contrast) are unchanged.

**Follow-ups and open questions**
- Suggested follow-up: the 1a harness never reaches `checksRead`. Future reviews of J22 or the board could reuse `cr.mjs`, or add `private: false` to the base fixtures.
- No open questions.

Both scratch worktrees are removed, and nothing was written in the repository.