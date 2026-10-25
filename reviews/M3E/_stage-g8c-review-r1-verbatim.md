# M3E stage G8c: the Reviewer's round 1 (FAIL, B1), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8c at 366ad4e (G8c's work over 210a421).

---

Verdict: FAIL

G8c (M3E), `git diff 210a421 366ad4e` on build/builder/g8c, checked against S-001's G8c row and build-plan line, AC91 (c), AC89 (a) and (h), AC92 (b), AC82's note, and the six P-001-glance-* records.

What I ran in the scratch worktree at 366ad4e:
- Targeted tests: 188/188 pass (ac91-g8c-home, ac91-g7b-since-missing, ac82-home, ac87-portfolio, ac89-after-md3, ac91-glance-home, ac92-glance-palette, md-sandbox, ac92-glance-arrow, ac87-portfolio-6b, ac91-glance-waiting, ac91-glance-page).
- A second batch: 82/82 pass (ac88-dark, css-cascade, ac54-home, j23-portfolio, j23-versions, ac80-board).
- `node tools/build.mjs`: PASS, so the src/lib and src/public/lib copies of home.js and portfolio.js are identical.
- `surface_guard.py diff --range 210a421..366ad4e --branch build/builder/g8c`: OK, 10 commits.
- The scratch worktree and my probe file are removed.

## Blocking

**B1. The never-read red foot does appear on the page, and Home has no case for it.**

The row lists, among Home's places, "the tile's foot beside a corner that says what waits ("✕ Can't read in this opening: <reason>")". The Builder's first open point says this can't appear on the page, so it is locked only in the pure `tileFoot` case (tests/desk/ac91-g8c-home.test.mjs:131-132).

That premise is wrong. The scheduler builds `desk.model` from `st.tree` whenever a tree is held (src/lib/scheduler.js:1451-1459). `st.lastSuccessAt` is set only when the whole cycle succeeds (src/lib/scheduler.js:1353-1354). So a first poll that answers while its blob phase fails gives a project with cards that has never been read in this opening.

How I reproduced it (made up, NOT real):
- `unreadState({ who: MIX_PROJECT })` with `repos[MIX_PROJECT].blobFail` set to every file's `gitSha`, or to one file's.
- Open `#/`, then advance 1 s and 2 × POLL_MS.
- Alpha's corner shows "6 wait on you".
- Its red foot shows "Can't read in this opening: GitHub error, or the network between Cloudflare and GitHub".
- The briefing shows "Can't read Alpha in this opening" and the grey line "Alpha not read in this opening, …".

So the code's words are right (src/public/sandbox.js:913-915). But:
- **The locked case states a false claim.** ac91-g8c-home.test.mjs:216's title ("a project never read holds no cards") and its comment at :237-239 ("the red foot … needs cards from a read in this opening") are both untrue.
- **Nothing on the page would catch a regression.** Every page case for the foot beside a waits corner is for a project read earlier (e.g. :184-185). Dropping `opening` from the `tileFoot` call at sandbox.js:915 would pass the whole suite.

The fix needs a Home case on this path, using fake-desk.mjs's `blobFail` labelled NOT real in tests/desk/fixtures/README.md. It should assert:
- the corner reads "<n> wait on you";
- the foot reads exactly "Can't read in this opening: <reason>", in `--bad` with its ✕, and gives no time;
- the case's title and comment are corrected.

## Non-blocking notes

- **The seven rewritten locked cases (8b18966, b3e9a6e, 5ddce35, 380f51d, dc87b75, afc25fd, 9baf59a).** Each is in its own commit, names its ruling and its file, and is forced by opening-wording, cant-read-order or cant-show-line B. None is weakened: old regexes became exact strings plus no-time checks, and the config-order claim was swapped for its counterpart. Where AC87's literal '13:00' went, a read-then-fail half now checks the owner's zone against the call time, plus a not-UTC check. G7b's B1 case keeps its later steps. The other candidates the row names (ac91-glance-home, ac92-glance-palette, md-sandbox, ac88-dark's "can't read" state) hold a read before the failure, so they are rightly left as they were.
- **`G8C_ONCE`.** It holds exactly one declaration, `::before right: 50% → calc(50% + 19px)` on `span.v2-c.here.l`, per theme. It is checked set-equal, and the leftover-exceptions check knows the `G8C ` prefix (`G[12345678] ` doesn't match it). One mismatch: the docstring at tests/desk/ac88-dark.test.mjs:1318 says `div.v2-rw`, while the key at :1329 checks `span.v2-rw`.
- **"Never read".** `readInOpening` (sandbox.js:967-975) is G7b's `succeeded` moved into a function: `lastSuccessAt` at or after `openedAt`, read from the reader's state with no read added. It is keyed by project name, the scheduler's own key (scheduler.js:175), and the briefing, the tile and `portfolioOf` all use the same name.
- **Off Home.** `quietLines`, board.js, the page's waits row (sandbox.js:1335) and universe.js are untouched, and the test at ac91-g8c-home.test.mjs:304 asserts "since HH:MM" on each.
- **The `here` class and the CSS rule.** Only the Home tile's now cell gets the class, and no other `.here` rule matches it.
- **The tile order fed to the briefing.** Every built project is placed in one of `HOME_GROUPS`, so `tileOrdered` loses none. The briefing's `flagged` count is a sum, so the new order doesn't change it.
- **Made-up fixtures.** `openingState`, `signedOutMixedState`, `orderState`, `sprintsState(1)`, `g8cStore` and `G8C_OPENS`, the reader that never answers and the refusing portfolio are each labelled NOT real in tests/desk/fixtures/README.md.
- **The Builder's second open point (`briefingView`'s "Can't show" for a failing read with no time).** I agree it is out of G8c and harmless. For a project never read, the no-time case already says "in this opening". For one read earlier, `readState` always gives a cant-read read its `since` (src/lib/universe.js:14, 20, 28), so the branch can't be reached. It is older than G8c and outside the ruling.

## Open question

The B1 path also shows that, before G8c and outside it, Home's corner gives "<n> wait on you" from a project no read of which has succeeded. AC89 (a)'s table, written for Waiting, gives its state 2 "no cards". Should Definer or Design reviewer confirm that Home showing those cards is intended?
