# M3E stage G8d: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8d at d968b1e (round-2 commits 5d060e4, 2f76ee9, d968b1e, on e7c87e9) (G8d's work over 3058cc0).

---

Verdict: PASS

There are no blocking findings. The work is the three commits on G8d's branch (e7c87e9..d968b1e): 5d060e4 (source), 2f76ee9 (locked cases) and d968b1e (capture entries). I ran everything in a scratch worktree at d968b1e and have removed it along with my probe files. /home/user/sd-g8d is clean.

**Evidence**
- **Tests:** I ran the 43 desk test files that reach the changed code: 603/603 pass. That includes ac91-g8d, ac80-board, ac89-after-md3, ac91-g8c-home, ac88-dark (which walks the 3 new G8D_OPENS screens), ac54/82/87 and resilience.
- **Other checks:** `surface_guard.py diff --range e7c87e9..d968b1e --branch build/builder/g8d` is OK (3 commits). Identity is builder <builder@agents.invalid>, and every commit has its Agent-Session and Spec: S-001 trailers. `node src/tools/build.mjs` passes ("36 page modules in step").
- **Every round-2 case is locked:** I put back e7c87e9's sandbox.js and universe.js (keeping the new lib exports so the test file still imports) and ran the new ac91-g8d. Exactly 5 round-2 cases then fail:
  - every project shown;
  - alone shown;
  - gone on the next draw;
  - N5;
  - the G8D_OPENS round-2 walk.

  The cases for a failing read, N1, N2, N3 and N4 pass on the old code too. That is right: they lock words that were already correct, and the spec asks for them as cases.
- **No locked case was changed or weakened:** the only test file touched is ac91-g8d.test.mjs. Its diff adds cases and otherwise touches only the header comment and the import lines. No other test file changed, so no rewrite was owed.
- **Can't-read wins over can't-show:**
  - `cantShown` is `drawError && !readFails` (src/public/sandbox.js:973).
  - `readOf` gives `cantRead` and `cantShow` as exclusive flags, and `ok` is false when it can't show (:1931-1932).
  - `boardView` tests `cantRead` before `cantShow` (src/lib/board.js:920-928); a can't-show project never reaches `nothingWaiting`, even with `ok` left true (the locked "E" input).
  - `oneProjectView` takes the can't-show branch only when `r.read !== 'cant-read'` (board.js:183).
- **Keys are by kind and project:** `ql:show:<project>` vs `ql:cant:<project>` in `quietLines` (sandbox.js:2516) and above the lanes (:2546). `boardOf` passes the same box to `oneProjectView` that `readOf` uses (:2026). The single-project unknown becomes 'cant-show', so the lane has no count and says "Can't show", and the strip says "Kicked back · can't show" (`stripEmptyWords`, board.js:70-73). Nothing else reads `nothingWaiting`, `ok` or `cantLines`.
- **No import cycle:** I walked every import from universe.js, in both src/lib and src/public/lib (25 modules each). There is no cycle through universe.js; board.js and portfolio.js mention universe only in comments. The copies are byte-identical (`cmp`).
- **Made-up fixtures are labelled NOT real:** `blobFailNoCardState` and `cantShowAmongState` in glance-fixtures.mjs, the 3 new G8D_OPENS entries, and the BAD_PR, signed-out and never-answering variants, in tests/desk/fixtures/README.md (its new section at the end).
- **N1–N5 each have a case:** in tests/desk/ac91-g8d.test.mjs, from the "the Reviewer's N1" test on. N3's fixture is checked to really reach the blob phase (`blobCalls`).

**The Builder's found-not-built note: within round 2's spec, but a gap in the spec, not a build defect.** I reproduced it in the DOM with every project shown:
- on `cantShowState`, with every other project failing, there are three red lines ("Can't read Service-Desk in this opening", "Can't read Personal-Org-Operating-Model in this opening", "Can't show Alpha"), yet the lane says "Waiting on you 0 Nothing here" and the strip says "Kicked back · none";
- the same happens with two can't-show projects and the rest failing.

Why it is within the spec: the spec covers every-project-shown in AC80 and AC91 (c), and there it asks only for the quiet line. The owner's "no counts" is worded for "that project shown alone". The lanes' Part A item 5 rule in AC91 (f) (S-001.md ~8923) says "none" "while any is read", and a can't-draw project is read. Why it is still a gap: it goes against Part A item 5's purpose ("an unknown is said in words, never as a 0"), the same kind of false all-clear the owner just ruled out. The plainest case is a desk whose only connected project can't be drawn: every project shown then reads "0 · Nothing here". I suggest the Definer decide whether the rule should become "while any is read **and drawn**" ("can't show" otherwise). Carry it as a risk.

**Notes (non-blocking)**
- N1: I could not render the `g8d-` captures here (no Playwright or Chromium). The tool has the 3 entries (glance-shots.mjs:223-225), and SIZES/THEMES give 360×740 and 414×896, light and dark. The same states are drawn and checked in the DOM by the G8D_OPENS walk. The PNGs belong in the pull request for the Design reviewer.
- N2: In `oneProjectView`'s can't-show branch, a project never read successfully whose read is not failing gets state 1 with "Checking…" under the title and "Can't show" above the lanes. I don't think the desk reaches this, since a draw error needs a held read; the spec's table doesn't cover it.
- N3: The every-project-shown case checks the briefing, cap, versions row and group head beside Waiting, but not the tile. The tile is locked in round 1's unchanged cases.

**Open questions**
- Q1 (for the Definer): with every project shown and no project both readable and drawable, should the lanes and strip say "Can't show" (or similar) instead of "Nothing here", a 0 and "none"? This is the gap above.
