Verdict: PASS

The Reviewer's verdicts on G8d (PR #239), verbatim: round 1 at f554f7a (PASS), round 2 at d968b1e (PASS), round 3 at 102b051 (PASS). The test-command port 7aa633d (a cherry-pick of ae48d55) was reviewed on G9's branch. Recorded by the orchestrator.

## Round 1
Verdict: PASS

I found no blocking findings. I worked read-only in /home/user/sd-g8d. All runs were in the scratch worktree /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g8d at f554f7a, which I have removed along with my probe scripts. `/home/user/sd-g8d` is clean.

**Evidence**
- **Tests run**:
  - The 4 test files G8d changed or added (ac91-g8d, ac80-board, ac89-after-md3, ac91-g8c-home): 78/78 pass.
  - The 20 other desk test files that reach the changed functions (ac88-dark, ac54-home, ac87-portfolio, ac82-home, ac91-glance-*, ac92-glance-palette, resilience, page-app and others): 267/267 pass.
  - `surface_guard.py diff --range 3058cc0..f554f7a --branch build/builder/g8d`: OK, 13 commits.
  - Identity and trailers are right: builder <builder@agents.invalid>, with Agent-Session and Spec: S-001 on all 13 commits.
- **Every rewrite was forced**: I ran the old (3058cc0) ac80-board, ac89-after-md3 and ac91-g8c-home against the new source. Exactly 9 old cases fail, and they are the 9 rewritten ones:
  - G8c's "not on Home, kept as built" case;
  - the page half of AC89 (h);
  - AC89 (a)'s five-state case, "states 1 then 2" and "state 2 for a failed read";
  - "the v2.5 project shown alone";
  - AC80's one-project state 2 case;
  - and the 2 not named in the row: AC80 "Nothing waiting…/Can't read" and Part A item 5 F3.
  - Each is rewritten in its own commit (e0015bd, 585cb35, ac47f6d, e25c44a, b9929fb, 50b89e0, a8d64b9, 69ec664, f554f7a), each touching only its case, and each carries a comment giving its reason.
- **None is weakened**: every "since" regex became an exact "in this opening" match plus a no-time check. Some got stronger:
  - G8c's case now checks the exact text of the line and of the page's `v2-prtt`, and adds POOM's quiet line.
  - AC80's case 69ec664 adds a step that checks a project read earlier and then failing keeps its time.
  - In the five-state case, s2.cards changing false→true is what the build-plan line asks for ("its unused `cards: false` … made to say what is drawn"). The flag is not read anywhere in src/public/sandbox.js. The no-tree path still asserts 0 cards (ac89 "states 1 then 2"; ac91-g8d.test.mjs:368-380).
- **No read added**: no scheduler or fetch code changed. `readInOpening` (src/public/sandbox.js:980) is reused in `readOf` (:1929), `pageTwoRows` (:1349) and `renderPipeline` (:1627).
- **`lastSuccessAt` and `readInOpening` agree**:
  - `oneProjectView` treats a project as read in this opening when `lastSuccessAt` is set (src/lib/board.js:159-160); `readInOpening` also requires `lastSuccessAt >= openedAt`.
  - `lastSuccessAt` starts null (scheduler.js:126) and is set only to `clock.now()` after a whole cycle succeeds (:1354). `openedAt` is `clock.now()` at desk creation (:243) and is never reassigned. So any `lastSuccessAt` is ≥ `openedAt`, and the two always agree while the clock runs forward.
  - Using the same value that picks state 2 or state 5 also keeps the line's words in step with the state.
- **`readStateOf`'s new 'cant-show' changes nothing else**:
  - Its only callers are `tileNode` (:908) and `portfolioOf` (:1104).
  - `tileNode` never sees a box with a draw error: `safeBox` and `buildProject` always set `b.error` alongside it (:4721, :4725), so the tile goes to the "Can't show this project" catch (:1054-1059), as built.
  - In the portfolio, `unknownWhy` checks 'cant-show' first and `nowCant` maps it to "can't be shown". portfolio.js:617 reads the box's own read, not this.
  - The briefing (`sinceReads`) and the page (`pageWaits` :1309) are unchanged.
- **A can't-draw project whose read fails** keeps 'cant-read' and its time, and the head counts it with `readFails` (:1027). I checked this in the DOM for a project never read in this opening (blobFail plus BAD_PR, a probe of my own): the cap and versions row say "Alpha: can't be read in this opening", the head says "1 can't be read", and there is no "can't be shown". The "since" variant and the signed-out variant are locked in ac91-g8d.test.mjs:445-470.
- **`IN_OPENING`** now lives in src/lib/board.js:105, is re-exported from home.js:52, and identity is asserted at ac91-g8d.test.mjs:106. The lib copies are byte-identical to the src/public/lib ones.
- **No G8D_ONCE needed, confirmed**: no CSS changed. The new head part is `span.v2-hgb` keyed `hgb-shown:` (sandbox.js:1046). The stage-8 guard walks G8D_OPENS with `sameLook`, asserts the part is drawn, and passes. In AC88's cascade check, the want-list gains only "ruled: a group head's can't-be-shown count", and the new `okBadPlace` rule is no wider than the existing `v2-hgb` rule.
- **Made-up fixtures are labelled NOT real**: `blobFailState`, `cantShowState` and `G8D_OPENS` in glance-fixtures.mjs and tests/desk/fixtures/README.md:903-923, plus BAD_PR, blobFail and the reader that never answers.

**Non-blocking notes** (carry as risks)
- N1: The row's "each cause … in each of those places" is not locked for Waiting's quiet line with every project shown under the 3-minute cause. Only the failed-read cause is locked there; the other three places cover both causes. I probed it: it correctly shows "Can't read Service-Desk in this opening".
- N2: The row's signed-out "each by its own in each of these places" lacks a page case for a project read before the sign-out. I probed POOM's page: "Can't read since 10:02", which is correct.
- N3: On the blob-failure path, the row's "an empty lane 'Can't read'" is not asserted. The fixture's Waiting lane holds 6 cards, Done always reads "Hold a card and drag it here", and only the strip's "Kicked back · can't read" (which comes from the same empty-lane words) is asserted. The row's "the small line's two counts in words" is asserted as no small line (ac91-g8d.test.mjs:359), which matches state 2 as built and AC80's locked F3-r2 case.
- N4: The "never read but can't be drawn" branch of the cap and versions rows is locked only in the pure test (ac91-g8d.test.mjs:149). It is correct in the DOM (my probe).
- N5: `boxStateText` (src/lib/universe.js:57) writes 'in this opening' as a literal instead of using `IN_OPENING`. The words are the same, but they could drift apart later.
- N6: On a backwards wall-clock step between opening and the first success, `oneProjectView` and `readInOpening` could disagree. This edge was already there before G8d, and `universe.js`'s `readState` has the same guard.

**Open questions**
- Q1: Does the row's "the small line's two counts in words" for state 2 with cards mean "no small line, as state 2 has it", as built and locked? If the Definer meant a line of counts in words, it is not drawn.

## Round 2
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

## Round 3
Verdict: PASS

No blocking findings. The work is the six commits in 657694e..102b051 (8446e28, 16e1389, 3b582a3, 374a1cd, d262a10, 102b051). I ran everything in a scratch worktree at 102b051. I've removed that worktree and my probe files; /home/user/sd-g8d is clean.

**Checks**
- **Surface guard and build:** `surface_guard.py diff --range 657694e..102b051 --branch build/builder/g8d` is OK (6 commits). Each commit is by builder <builder@agents.invalid> with the trailers `Agent-Session: session_017seyaGqUxAff6E8dKWHDCR` and `Spec: S-001`. `node tools/build.mjs` passes ("36 page modules in step").
- **Targeted tests:** 677/677 pass across the 47 files that reach board.js, sandbox.js or glance-fixtures (ac91-g8d alone is 32/32).
- **Full suite in one process:** I also ran `node --test ../tests/desk/` once, as the suite runs: 1317/1317, exit 0.

**Every round-3 test is locked**
- **Old sandbox.js, new tests:** with 657694e's src/public/sandbox.js put back, 6 of the 8 round-3 cases fail:
  - every project shown, none read and drawn;
  - the case with a last read's cards;
  - the cases kept beside it ("Not read yet" with a read pending, which used to say "Nothing here");
  - state 5 alone shown;
  - signed out;
  - gone once read and drawn again.

  The other two pass, which is right: the pure-function case tests board.js, and the "kept" case locks words that were already correct.
- **Two mutations in board.js:**
  - Deleting the `if (succeeded && cantShow) return { state: 5, … cantShowLast …}` line fails 4 cases (the pure case, state 5, signed out, gone again).
  - Counting a pending read of a can't-draw project as pending fails the pure case, so the Builder's choice is locked.

**The one rewritten locked case (16e1389) is forced and not weakened**
- **Forced:** 657694e's ac91-g8d.test.mjs run on the round-3 source fails exactly one case: round 2's "a project the desk can't draw whose read fails keeps its can't-read words" (case 17). It fails at `assert.doesNotMatch(board, /Can't show/)`, because the board now holds "Kicked back · can't show when last read".
- **Nothing else removed:** across the range, that is the only assertion line taken out of the test file; the rest of the removed lines are the two import lines.
- **Not weakened:** the replacement asserts no "Can't show Alpha" anywhere on the board, no `.v2-ql` line starting "Can't show ", no `ql:show:` key, and a `ql:cant:Alpha` line, and it keeps the line above the lanes. The new state-5 case pins the lane to exactly "Can't show when last read". This is the rewrite G8d's row names.

**d262a10 and 102b051 remove no checked-for state (where each moved)**
- **G8D_OPENS's "none can be drawn" and "signed out alone" screens:** both are still asserted, in the every-project case (ac91-g8d.test.mjs:946-947 loop) and the signed-out case (:1052).
- **The "screens draw their words" case:** its checks now run in the cases that open those screens through `openR3` (:944, :946, :1013). The cases also assert that G8D_OPENS holds exactly the two round-3 names.
- **The separate "every project unreadable" page:** now asserted on the "Can't read or show" case's reference page (:941-943).
- **State 5's look:** measured without a reference page, as 11px, weight 400, not mono, --ink2, plus `.v2-empty.unknown`, and the strip as 11px, 500, --ink2. The exact font-family match is replaced by "not mono".
- **The cards screen:** opened by its own case (:971), not walked.
- **State 2 for a can't-draw project:** the spec's words ("Can't read", "Kicked back · can't read", no "Can't show") are asserted in round 2's locked case, first step (:630-647).
- **Two DOM checks went with the dropped case (non-blocking):** for the BAD_PR project in state 2, "Not read in this opening" and no lane count. They are now covered only in two parts: the pure case fixes state 2 and `unknown` (:925), and the N3 case (:752) asserts both in the DOM on the same path without BAD_PR. The spec doesn't ask for them here.

**everyProjectUnread's order and the view.unread fix are right**
- **Order:** board.js:107-113 follows AC91 (f)'s rule step for step. Any project with `read==='ok'` and no drawError gives null. Else, if every read fails, 'cant'. Else, if any read neither fails nor is a can't-draw, 'pending'. Else 'cant-read-or-show'. With no project shown it gives 'pending', as before.
- **Identity:** sandbox.js:2020 maps each `shown` entry from its own `b.box` (`readState(b)`, `b.box.drawError`). That box's drawError is set before `boardOf` runs (sandbox.js:4729-4735, including when `buildProject` throws). It is the same box `readOf` and `cantShown` use, so `undrawn` and `cantShown` agree, and null happens exactly when some project is `ok`. The quiet-line keys are unchanged (`ql:show:` / `ql:cant:`).
- **Alone shown:** `cantShow: Boolean(drawError)` (:2029) and 'cant-show-last' (:2030) are only read as truthy (laneNode, strip). The small-line branch needs `!one`, so the new value reaches nothing else.

**The Builder's choice (a pending read of a can't-draw project counts as can't be drawn)**
It matches the spec's text. AC91 (f) defines "can't be drawn" as "its box's `drawError`, its read not failing", and "pending" as "the desk drawing what it holds", which is not true when the desk can't draw. It also agrees with the alone-shown words settled in N2 ("Can't show" in states 1 and 4). The one tension is the C note: "a read still pending may yet give a drawn board". If the Definer meant that note to cover this case too, it would say "Not read yet" instead. I'm not raising it as a finding.

**No 0 anywhere in these states**
- **The cases:** they assert no "Nothing here", "none", ": 0" or bare "0" leaf on the board (`assertNoQuiet`).
- **My own DOM probe:** I covered nine states, including signed out with every project shown, the cards case and the pending case, which the cases check only in part. No 0 count, no "none", no "Nothing here". The only "0" drawn is the age under the title, "checked 0 s ago", which is a time, not a count.

**Copies, fixtures, captures**
- **Copies:** src/lib/board.js and src/public/lib/board.js are byte-identical.
- **Made-up fixtures:** `noneDrawnState`, `cantShowLastState`, the two G8D_OPENS round-3 entries, the drawn-state-5 and reads-working-again variants, and the six new capture entries are each labelled NOT real (tests/desk/fixtures/README.md, the end section; glance-fixtures.mjs doc comments; the glance-shots.mjs comment).
- **No CSS:** no CSS or declaration was added, so there is no G8D_ONCE.
- **Captures:** glance-shots.mjs has the 6 `g8d-` entries, at 360×740 and 414×896, light and dark. I couldn't render them here (no Chromium or Playwright), so the PNGs are owed to the Design reviewer in the pull request.

**The one-process suite's heap: effectively no margin (non-blocking, carry as a risk)**
- **What I measured:** the heap limit here is 2096 MB. At exit the suite retained 1981 MB after a forced GC, with a sampled peak of 2007 MB. That is about 90–115 MB of nominal headroom.
- **What is really left:** the Builder's run aborted at test 1316 of 1317 before 102b051, and 102b051 only removed 4 page opens (about 5 MB at about 1.25 MB a page). So the real margin before V8 gives up (ineffective mark-compacts near the limit) is a few page opens.
- **What it means:** the next stage that adds a handful of sandbox page opens will abort `npm test` again. Cutting cases won't scale. The fix is a toolchain decision for the Definer or orchestrator: run the files as separate processes (`node --test` given the file list, as I did), or raise `--max-old-space-size`.
- **Run time:** the full run took about 22 minutes, with other sessions' suites running on the machine at the same time.

**Open questions**
- Q1 (for the Definer, optional): should a pending read of a project the desk can't draw say "Not read yet", per the C note, instead of "Can't read or show"? As built, it follows the definition.
