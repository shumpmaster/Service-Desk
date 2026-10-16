Verdict: FAIL

Build review, round 1, of build/builder/trial-view-2 (11 commits on orch/trial-view-2) against specs/S-001.md, notes 1 to 35. The build is broad and mostly solid: every check passes, and every marker the spec names has a test that fails when its rule is broken. It fails on one path, a J12 read that fails after an earlier read was kept on the device. There the desk treats the old list as current. That breaks AC72's wording and J12's own failure rule. I edited nothing in the repository; `git status` is clean.

**Runs (from /home/user/sd-tv2-bld)**
- `cd src && npm test`: 397 pass, 0 fail.
- `npm run build`: PASS (18 page modules in step; I also checked that src/lib and src/public/lib are identical).
- `surface_guard.py diff --range orch/trial-view-2..HEAD --branch build/builder/trial-view-2`: OK, 11 commits.
- `GOV_BRANCH=build/builder/trial-view-2 bash governance/checks/check_all.sh . orch/trial-view-2`: all 25 checks pass.

**Blocking**

B1. AC72 says "don't approve" where the spec requires "Can't check this deploy yet". src/lib/feed.js:787 checks only `!p.list`. When a list kept from an earlier read exists and today's J12 read failed (or the read at the new head hasn't arrived), the check runs against the old list. A deploy of a passed PR merged since that list gets "Doesn't match a reviewed pull request: don't approve" with "no merge of a passed pull request has this commit". The spec (S-001.md:3554-3555) says that when J12's read "has failed or not yet arrived": "Can't check this deploy yet". The test (tests/desk/ac69-72-audit-additions.test.mjs:246) covers only `list: null`.
- Reproducing case: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv/ac72-stale.test.mjs. It prints `{"kind":"bad","words":"Doesn't match a reviewed pull request: don't approve",...}` for PR #77's merge with a PASS verdict.
- Made worse by the retry hold (N2): after a failure, no read until 60 minutes have passed and the head has changed.
- Fix: have the snapshot say whether the kept list is current (no failure, read at the current head, no cold read under way). When it isn't, `deployCheck` returns the "Can't check" result with the failure as its reason. Add test cases for a kept list with a failure, and for a head change whose read hasn't answered.

B2. After a failed J12 read with a kept list, the Timeline shows old data as current, with no reason. src/lib/feed.js:328 sets `missing = null` when a kept list exists, and the note at feed.js:589 only appears when there is no list. So:
- a PR kept as open and merged since then shows the mark "open" (feed.js:438);
- a PR missing from the kept list shows "not recorded in what the desk reads" (feed.js:431).

J12 (S-001.md:4668-4669) says a refusal, rate limit or network failure makes "every pull request part of AC60" show "not available", with the reason one tap away.
- Reproducing case: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv/ac60-stale.test.mjs. It prints `PR #52 ["open","review","checks"]` for a merged PR, PR #44 "not recorded in what the desk reads", and `notes: []`.
- Fix: while `failure` is set, show the spec's "not available" with the reason for J12's parts. If keeping the old data with a visible flag is preferred, that needs a Definer ruling first. Add a test.

**Non-blocking (carried as risks)**

N1. The builder's reading C1 (only a 401 stops the blob call) is right for the spec as a whole. J12 says GraphQL's rate limit is "for J12 only" and "the REST polls are not slowed by it" (:4653-4655), and that the function doesn't parse the answer, so it can't see a `RATE_LIMITED` inside a 200. Stopping the call on GraphQL's limit would mark the whole read as rate-limited and slow REST. The conflict is the sentence at S-001.md:4623, "Only a rate limit or a 401 stops the rest of the call, as for compare". The Definer should reword it as "Only a 401 stops the rest of the call; GraphQL's rate limit is the page's to judge". The code (github.js:404-413) and its test (j12-pulls.test.mjs:88-106) are correct.

N2. The builder's reading "after any failed J12 read, wait until 60 minutes have passed and the head has changed" goes beyond the spec. The code is scheduler.js:173 and :186-193. The spec gives that hold only for `RATE_LIMITED` (:4653). Other failures fall under "like J11's reads", which are "tried again on a later cycle" (scheduler.js:420-421).
- Effect: a stalled project has no head changes by definition. After one failed J12 cold read it never gets J12 for the rest of the window, so AC71's stalled line (feed.js:741 needs `snap.pulls.list`) never shows there.
- The spec's own "whichever is later" for the rate limit has the same flaw on a quiet project. That is an open question for the Definer.
- Fix: retry non-rate-limit failures on a later cycle, with a modest backoff.

N3. The desk's verdict reader is looser than the project's own gate check. `verdictOf` (src/lib/j11.js:60-65) says PASS in five cases where governance/checks/review_check.py `parse_verdict` says malformed or FAIL:
- `Verdict:PASS`
- `Verdict:  PASS`
- `Verdict: PASS` followed by a later line quoting "Verdict: FAIL" mid-line
- an indented `  Verdict: FAIL` line before `Verdict: PASS`
- a byte-order mark before `Verdict: FAIL` with a later `Verdict: PASS` (a real FAIL read as PASS)

Reproducing case: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv/verdict.mjs. AC72's "Reviewer PASS" and AC60's "✓ review" rest on this reader. Fix: mirror `parse_verdict` exactly. reviews/README.md's "may appear only at the start of a line" supports the stricter reading. The risk is low because a merged PR has passed review_check.

N4. A third or later run's column uses the agent blue: `--run3: var(--agent)` at src/public/sandbox.css:21. That gives blue a second meaning, against AC48 ("each colour has one meaning", "no colour on the desk has two meanings"). Also, `.sb-began` (sandbox.css:371) always uses run 2's gold, even for run 3 and later. No fixture has a third run, so nothing tests it. Fix: pick a shade outside the 14 meaningful colours, and have `.sb-began` take its run's own shade.

N5. src/lib/pulls.js:133 keeps `closedAt` on the device. No criterion uses it, and J12's "What the page keeps" lists only fields AC60, AC61 and AC72 use. Fix: drop it from `keptPull`; the query can still ask for it.

N6. The builder's other readings:
- **Only merged PRs placed** (feed.js:404): matches AC60 for untied PRs (:2887-2890). For a PR named only by its `Milestone:` line, the spec doesn't limit it to merged ones, and AC61 (c) reads an open PR's body from J1. Not a contradiction; an open question for the Definer.
- **Untied sprints newest first:** the spec sets no order inside a fold, and newest first fits the screen's bottom-up reading. No contradiction.
- **"Verdict: PASS with notes" counted as neither:** consistent with review_check (malformed) and reviews/README.md. AC72's "has no Reviewer verdict" matches the gate's view. No contradiction.
- **Related open question:** a PR outside the newest 100, kept as open and merged later, gets AC72 "don't approve" until the next day's cold read. That is J12's known gap, but AC72 doesn't address it.

**Verified and holding**
- **J12 and the function:**
  - The only new outbound request is a POST to `https://api.github.com/graphql` with the query text fixed in the function; the test checks the sent body is exactly `{query, variables}`.
  - The cursor is checked against `^[A-Za-z0-9+/=_-]{1,200}$`, and extra keys or a v2.5 project get a 400. The read costs 5 of the 25 budget.
  - The answer goes back raw, or `null` when GitHub can't be reached.
  - Storage: `desk-pulls-v1` lives in its own store (sandbox.js:2172). A failed write turns off only that store, and the blob cache keeps working (test at j12-pulls.test.mjs:268).
  - The fixture and the made-up error answers are labelled "NOT as GitHub sent it" and "MADE UP", in tests/desk/fixtures/README.md and in each file's `note`.
  - Riding J12 in that minute's first blob call is backed by A3 and A4 (:5143-5150).
- **AC72:**
  - Push runs use `head_sha`.
  - Hand-started runs take the 40 hex characters straight after `deploy ` (feed.js:764, with a lookahead against a 41st).
  - An unreadable title gives "Can't check this deploy yet".
  - No row offers an approval of its own.
- **Colours:** the values match the spec. My own CIEDE2000 over all 91 pairs gives 0 under 10. The closest are 11.44 (light theme, coral and red) and 11.02 (dark theme, amber and gold), as the spec says.
- **Chromium at 360×740, light and dark, every fold opened, 8 screens:**
  - no sideways scroll and no element outside the viewport;
  - `document.getAnimations()` is empty, and the endless glow is removed;
  - no page errors.
- **Coral:** in the browser it paints only the owner's things (the pill, the "needs you" diamond, the owner's tile, "Your last action", the queue rows that need the owner, the badge).
- **Text boxes:** both are 16 px, and the viewport doesn't block pinch-zoom.
- **Security:** no change to `_headers`, the CSP or the HTML, and no new innerHTML path.
- **Tests catch broken code:** 17 mutations, each tested in a scratch copy then reverted. 16 failed the tests. The one that passed (trimming AC70's quoted reason) changes nothing in the fixture, so it tells us nothing.

**Join-up review (Reviewer, end of Build), in the docs/design/JOIN_UP_REVIEW.md form**

Parts checked together: the desk function (api.js, github.js), the scheduler with J12, and the views (feed.js, sandbox.js), run as one in Chromium. The function was answered by the tests' fake desk over HTTP, from the 3117150 fixture, J12's built answer and the Alpha fixture. I also ran the unit-level repros.

| Path through the product | Result | Fix |
|---|---|---|
| Home card → Service-Desk → phase marker → Timeline | Works: Now line in view at 360 px | — |
| Team "On the Timeline ›" → sprint | Works: Q-013 opened and in view at 360 and 414 px | — |
| Every screen with every fold open, 360 px, light and dark | Works: no sideways scroll, no animation | — |
| Queue deploy row while J12 has failed and an earlier list is kept | Breaks: "don't approve" instead of "Can't check this deploy yet" | B1 |
| Timeline while J12 has failed and an earlier list is kept | Breaks: old marks shown as current, no reason | B2 |
| Stalled project whose J12 cold read failed once | Stalled line never appears that window | N2 |
| Run 3 and later on Status | Takes the agent blue | N4 |

**Open questions for the Definer**
- Reword S-001.md:4623 (N1).
- Fix "until the next head change or for 60 minutes, whichever is later" for quiet projects (N2).
- Should an open PR named by its `Milestone:` line be shown (N6)?
- How should AC72 treat a PR outside the newest 100 that merged after it was kept as open (N6)?

**Not checked:** a full audit of every shown string for invented words (spot-checked only); AC62's spacing and type scales measured independently; a side-by-side comparison against the mockups.
