Verdict: PASS

Commit 361b6b7 breaks nothing, so my stage 6a PASS stands. Home's tile and briefing say the same words as before in every state. A project the desk can't read now says "can't be read since HH:MM", with the same time as its tile. The stronger A3 case catches the leak I found before. No test was weakened. Every command passed. I found two new gaps in the tests and one small design point. None of them blocks.

**Commands** (run in a detached worktree at 361b6b7, now removed)
- `cd src && node --test ../tests/desk/*.test.mjs`: 1014 tests, 1014 pass, 0 fail. This matches the orchestrator's count.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 36 page modules in step)`.
- `bash governance/checks/check_all.sh . 84c1224`: ends `OK: all governance checks passed.`
- `python3 governance/checks/surface_guard.py diff --range 84c1224..361b6b7 --branch build/builder/desk-v2-6a`: `OK: 3 commit(s) in 84c1224..361b6b7 checked`.
- `python3 governance/checks/review_check.py pr 999 --base 84c1224`: risk class R1. Required verdicts: design-reviewer and reviewer. It fails only on the two verdict files that don't exist for a dry-run PR number, as in round 1. It raised no test-weakening flag.
- The commit is by `builder <builder@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers and no model names. src/lib/portfolio.js and src/public/lib/portfolio.js are identical.

**1. The tileNode refactor leaves Home's tile unchanged**
- The new `readStateOf` (src/public/sandbox.js:859-861) gives the same state as the old inline code: `box.drawError ? 'cant-read' : box.read ? box.read.read : 'checking'`.
- Its `since` (`box.read.since` when it isn't null) gives the same test and value as the old `box.read && box.read.since != null`. The tile still takes `box.read.words` from the box.
- The briefing's code is not in the diff. Its read list (sandbox.js:690) still reads `b.box.read` directly.
- Mutations of `readStateOf` (full suite each time):
  - `since` always null: caught by 3 tests (AC82 Design N2, AC82 Reviewer N-3, and AC87's page case).
  - A refused read shown as checking: caught by 5 tests (AC82 parts A4/A6, N2 and N-3; AC87; AC48 with AC82 on a stale read).
  - A good read shown as checking: caught by 5 tests (AC54 (a), AC82 tile top to bottom, two J13 tests, AC48 with AC82).
  - `since` taken only from a good read: caught by 3 tests.
  - The `drawError` branch dropped, or a missing `box.read` shown as ok: not caught. Both changes have no effect. A project with a draw error never reaches `tileNode`, because sandbox.js:3823 and :901 draw it through `b.error`, and the cap gets `error` too. `safeBox` always sets `box.read` (lib/universe.js:87-107).
- So the read, checking, can't-read and older-records states are all held by tests.

**2. The new words, against AC87 6a and the no-made-up rule**
- **"can't be read since HH:MM":**
  - Used for a read that was refused, failed, or went stale. The time is the tile's own `box.read.since`.
  - It goes through `hhmm(..., TZ)`, where `TZ = CONFIG.ownerTimeZone` (America/Chicago) (sandbox.js:944-947).
  - With no time, it says "can't be read". A build error still says "can't be read".
- **"not read yet":** used only while the read state is 'checking'. A v3 project has no phase view only while its records are not all read (lib/sandbox.js:53, :101, :109, :245). So the words are true.
  - The doc comment says "first read pending". 'checking' can also come later, on a re-check (universe.js:15-30), so the comment is slightly too narrow. That case still has no phase view only while reads are missing, so the words stay true.
- **"not recorded":** used when the records were read and hold no now run. That is true.
- **A tracked project whose read now fails** is still counted from its last-read records, as its tile draws them. A test checks this (ac87 test, `stale`).
- These words go beyond AC87's literal text, which gives only "<names>" or "none". That is still my round 1 note 1, routed to Define. None of them makes anything up.

**3. The new tests fail when their rule breaks**
- **The A3 case** now catches "every project reads its root VERSION": AC87's A3 case and J23 both fail. That closes note 5.
- **The cap's words and the Scorecard's no-key rule**, each mutation caught:
  - the cap's time in UTC;
  - `since` dropped;
  - `read` not passed to the cap;
  - a refused read shown as "not read yet" (2 tests);
  - checking shown as "not recorded" (2 tests);
  - an older-records project not counted;
  - "since" changed to "at" (2 tests);
  - a key put back on the Scorecard sheet;
  - a key in the block's words;
  - the versions sheet's paths not in mono.
- **The made-up VERSION files (9.9.9, 9.9.8):**
  - They are labelled NOT real in the test (ac87-portfolio.test.mjs, A3 case comment) and in tests/desk/fixtures/README.md:546-547.
  - They don't leak: `files()` and `j77Files()` build a new object on each call, and `more` goes only to that one app.
  - The real 77bfeae fixture has no root VERSION, so nothing real is overwritten.
  - 9.9.9 appears in only one other place, the J23 test, which already labels it made up.

**4. No test was weakened**
- Only two asserts were removed. Each was replaced by a stricter one:
  - the network-failure cap line;
  - the Scorecard list without the key line, plus a new no-key check over the block and all five sheets.
- **The "refused or network" page case** is stronger, not weaker:
  - The network case is still there.
  - A refused case (not-found) was added.
  - Each case now also checks the tile's "Can't read since", the matching time in the cap line and its sheet, and that "not read yet" never appears.
  - The old expected "not read yet" for a network failure was the wrong word that Design B2 found.
- A new pending case pins "Checking…" and "not read yet", then the phase once the read lands.

**New findings** (none blocks; carry as risks)
- **N1. No test pins the "since" time to the owner's zone on Home. Route: Build (tests).**
  - I changed both the tile's time and the cap's time to UTC at once. All 1014 tests still passed.
  - AC87 checks only that the cap's time matches the tile's.
  - The older box text is pinned (ac-desk.test.mjs:182, resilience.test.mjs:213). The v2 tile has not been pinned since stage 2.
  - The code is right today (TZ is America/Chicago).
- **N2. A brand-new blob read is not caught here. Route: none now.** My mutation adding a `README.md` read survived. But the test tree has no README.md, so the read never happens, and the mutation proves nothing. The A3 sum (AC14) is unchanged since round 1.
- **N3. Font size of the paths. Route: the design reviewer.** The new `.v2-pffrom .code` uses `--t-mono` at 11 px, inside a 12 px small line (sandbox.css:730, :1058).

**Open questions**
- Should Define confirm "can't be read since HH:MM" and "not read yet" in AC87 before 6b? This is my round 1 note 1, still open.
- I read the commit message, which summarises the Builder's work. My findings rest on the code, the tests and the mutations alone.

The scratch worktree and copies are removed. The main checkout is unchanged, and the branch is still at 361b6b7.
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-6a-review-confirmation-verbatim.md.)
