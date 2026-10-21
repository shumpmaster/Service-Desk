# S-001 desk v2, stage 2 (Home): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-2 at 2d3eeec.

---

Verdict: FAIL

**What this means for you.** Stage 2's Home is mostly right, but it fails on two blocking points and one missing test. First, a tile can say a milestone has "no estimate yet" when it has one. Second, the new commits read can make GitHub calls of its own while the page is open, which the spec rules out. The missing test is the awkward case of a pull request from a fork. Every other test the spec lists exists and fails when its rule is broken. The full suite passes (896 of 896), and the build, the surface guard and the governance checks pass. The shorter Home test file is the old Home's removed "Latest" bubble, not weaker testing. Nothing here is irreversible.

## Checks run (scratch worktree at 2d3eeec, now removed)
- Full suite: `cd src && node --test ../tests/desk/*.test.mjs` gave tests 896, pass 896, fail 0. AC14 with J24: 6,326 calls, against 6,286 without it.
- `node src/tools/build.mjs` gave "build: PASS (2 connected projects; 32 page modules in step)".
- `bash governance/checks/check_all.sh . 5a7e55a` gave "OK: all governance checks passed."
- `python3 governance/checks/surface_guard.py diff --range 5a7e55a..2d3eeec --branch build/builder/desk-v2-2` gave "OK: 3 commit(s) … checked".
- `python3 governance/checks/review_check.py pr 999 --base 5a7e55a` failed only on the three missing verdict files: design-reviewer, owner (test-weakening flag) and reviewer. That is expected before review.

## Blocking findings

**B1. A tile can say "no estimate yet" when an estimate exists (owner rule: nothing made up).** Routes to Build. The words for these cases may need Define.
- `src/lib/home.js:562-563`: any finish AC24 marks "not available" becomes "`<id>` · no estimate yet". It is called from `src/public/sandbox.js:935`.
- AC24's chain (`src/lib/workahead.js:339-356`, `src/lib/workview.js:213`) marks a finish not available in three cases where an estimate may exist:
  - the milestone is past its estimate;
  - the estimates read failed (the finish is unset);
  - an earlier milestone in the order, in any project, has no estimate.
- Reproduced with M3A's fixture. Service-Desk MD1 is estimated 2–3 days, made 18 Oct, viewed 17 Nov. The tile reads "Next: MD1 · no estimate yet". Plan reads "Rough finish: not available: MD1 is past its estimate". Probe: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p4-past.test.mjs`.
- AC82 gives words only for "with one" and "without one". Define should say what the tile shows for a past estimate and for a failed read. Until then, Build must not show the false line.

**B2. The commits read makes a call of its own while the page is open (J24, A3).** Routes to Build.
- J24 says the read "rides in the blob call that makes J20's read of the same head".
- `src/lib/scheduler.js:409-416` makes a first read due whenever a pull request's `updated_at` passes "last looked". A comment or label does that, with no head change and so no J20 read.
- `src/lib/scheduler.js:1047` then makes a blob call for it alone.
- Reproduced: one open pull request, updated before "last looked". Mid-opening its `updated_at` moves and its head does not. Result: one blob call holding only `{"commits":[21]}`, and `desk.j24('Alpha').alone` = 1. Probe: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p1-alone.test.mjs`.
- This breaks AC14's own rule in `j24Bounds`: a call carrying commits alone only in the opening's first cycle. AC14's day never moves `updated_at` without a new head, so it misses this.
- Fix: let such a read wait for a call made anyway, as retries do, and add the case to J24's test.

**B3. J24's fork case does not test its rule.** Routes to Build.
- `tests/desk/j24-since.test.mjs:166-169` passes only because its commits map has no entry for the fork's pull request (#9). The reader never sees a fork.
- Mutation: drop `canRecord(pr, st.project)` from `commitsDue` (`src/lib/scheduler.js:398` onward). j24-since and ac14 still pass.
- J24 lists the fork as an awkward case to cover. The test needs a reader case with a fork's pull request that is updated after "last looked", and an assertion that no commits are asked for it.

## Mutations (run on a copy, all restored)
**Caught (each failed at least one named test):** merges not skipped; 4 lines a pull request; 5 lines; no clamp for a commit dated ahead; no "You"; the cap at 51; a 4th page; the function's budget ignoring commits; a retry making its own call; no 7-day bound; "Mark as seen" not stored; v2.5 merges listed; `item/` merges listed; answers not gathered; reads regardless of `updated_at`; no per-pull-request cut; the tile reading right to left; group starting states; the briefing count off by one; quiet while a mark waits for GitHub; "rough" dropped; More detail moved.

**Not caught (non-blocking, see N2):**
- The "Now:" quoted reason dropped (`home.js:526`).
- "went back on `<date>`, why not recorded" reworded (`home.js:532`).
- Only the first of several working members shown (`home.js:545`).
- "checked `<age>` ago" taken from the freshest read, not the stalest.
- "1 wait on you" in place of "1 waits on you".

"Never a verdict call" holds by structure: verdict calls are their own direct call at `scheduler.js:958`.

## Test weakening
- **`ac54-home.test.mjs`, 186 to 173 assertions:** this is the replaced design, not a weakening. What went is the "Latest" bubble's hover, focus and Escape cases (P-001-latest-bubble, A) and the two-column cases (P-001-home-tiles, A). The summary, one-bubble, B1 focus-order, group and storage cases were moved onto the tiles, and they still check the clip, the fade, the 44 px rules and the closed headers. One small loss: the second group's "1 project" count is no longer asserted.
- **Other rewritten files:** ac24, ac48 (Home off AC62's word snapshot, as AC81 allows), ac56, ac69, ac80, ac81, j13, j4, md-sandbox and notify-ac52 each keep or raise their count, and each rewritten case says what replaced it.
- **One unneeded narrowing:** `ac57-58-65-phases.test.mjs:422` now checks fixed widths only after `@font-face` and outside media queries. The old whole-sheet check still passes on the new CSS, and `md-sandbox`'s AC42 test still covers the whole sheet, so nothing is lost overall. Restoring it would be tidier.

## Function and untrusted data (no blocking finding)
- `commits` is checked well: whole numbers from 1 to 1e9, no repeats, at most 8, 3 budget each (8 × 3 = 24 ≤ 25). Pages follow Link, at most 3. A failure is a null answer; a rate limit or a 401 stops the call. All of this is tested.
- No token reaches the page: only GitHub's response bodies go back.
- Commit names and messages are drawn as text nodes. `h()` uses `innerHTML` only for `renderMarkdown` output (`sandbox.js:140`).
- Note: pages pass raw, as J24 requires, so a worst-case answer is 8 × 3 full pages. That is the same form J20 already uses.

## Non-blocking notes
- **N1.** Service-Desk's tile reads "Now: Design, run 2 · why it went back: not recorded". Frame H5 draws "went back on 8 Oct, why not recorded". The build's Status screen has no run date either, so this is truthful, not made up. Design reviewer to judge.
- **N2.** No test covers these rules from AC82's text: the quoted reason, the dated "went back" form, several workers joined by ", ", "checked" from the stalest read, and the singular "1 waits on you".
- **N3.** "Commits on #n couldn't be read" and "#n: more commits than the desk reads" are timed at the pull request's `updated_at`, not at an event of their own.
- **N4.** Some fallback words are not in the spec: "Can't show `<name>`", "no milestone left to reach", "no open sprint", "No agent run recorded", "Chief of Staff working", "`<item>` card `<gate>-<n>`".

## Where the spec and the owner's answers could pull apart (route to Define)
- **AC75 and P-001-settings-place.** The build keeps both AC75's "Notifications" top line (until notifications are on) and the fold at the foot. That is the right reading of the frozen spec: AC82 does not change AC75. But frame H1 draws no top line. And the owner's "Closed until you open it" was about where the switch goes, while the top line shows that switch unopened. Define should say whether AC75's top line survives on the new Home.
- **P-001-tile-summary.** The question asked about "the project's one-line summary". The spec keeps three lines with a fade (tile-summary-clip), and frame H5 clamps to two. The build follows the spec. Define could confirm three is meant.

## Join-up review (Build, stage 2)
Parts checked together: the page under the fake DOM, with the reader, the fake function and the real function handler, from J11's fixture, AC52's one-of-each, a v2.5 project and M3A's fixtures.

| Path through the product | Result |
|---|---|
| Home briefing, then Waiting | Works. Counts equal the badge and the tiles, with a mark made. |
| Tile tap, then Status in stage 1a's form | Works. |
| "Since" line taps | Works. Cards and questions open their sheets on Waiting, outcomes open Team, pull requests open GitHub. |
| "Mark as seen" | Works. The list empties; reads stop for pull requests not updated since. |
| Plan tab, then Work ahead | Works. |
| Tile "Next:" against Plan | Breaks when an estimate is past or the read failed (B1). |
| Reader, function and page for commits | Works, except the mid-opening call of its own (B2). |
| More detail fold, then Notifications and usage | Works. Last on Home and closed. |

## Open questions
1. The Chromium captures (360, 414 and 720 px, light and dark, beside H1 to H5) belong in the pull request, which is not open yet. I can't check them; they must be there before merge.
2. Define: the tile's words for a past estimate and a failed estimates read (B1); AC75's top line; how many summary lines.

Probes, kept for rerun (set `W=<a checkout at 2d3eeec>` and run `node --test` from its src folder):
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p1-alone.test.mjs`
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p4-past.test.mjs`
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/p5-routes.test.mjs`
- `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probes/mutate.py` (with `m1.json` and `m2.json` in the same folder)