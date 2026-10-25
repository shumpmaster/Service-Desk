# M3E stage G8d: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8d at f554f7a (G8d's work over 3058cc0).

---

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
