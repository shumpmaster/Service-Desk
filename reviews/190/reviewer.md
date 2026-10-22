Verdict: PASS

Confirmation review of 8d20e79 on build/builder/desk-v2-6b, on top of 44fc001; the whole range is f393d3c..8d20e79. I worked read-only in fresh detached worktrees at 8d20e79 and f393d3c, now removed, and ran mutations in a separate copy, also removed. I did not see the Builder's summary.

There are no blocking findings.

**Runs**
- `cd src && node --test ../tests/desk/*.test.mjs`: 1056 tests, 1056 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)". The worktree was clean afterwards.
- `bash governance/checks/check_all.sh . f393d3c`: "OK: all governance checks passed."
- `surface_guard.py diff --range f393d3c..8d20e79 --branch build/builder/desk-v2-6b`: "OK: 6 commit(s) … checked". 8d20e79 is by builder@agents.invalid with `Agent-Session` and `Spec: S-001`.
- `review_check.py pr 999 --base f393d3c`: FAIL, only because the verdicts aren't recorded yet. It needs reviews/999/design-reviewer.md, owner.md and reviewer.md.

**F1: the state line and tab title now follow the projects' rule**
- `withPortfolio` (src/public/sandbox.js, around line 1803) now passes `lastPf.cards.length`, meaning every card in the queue whether marked or not, instead of the board's counts, which leave marked cards out.
- That is the projects' rule. `screenState` (universe.js) counts each box's `flaggedCount` and never sees marks, and `sandboxBoxes` takes away only the agents' items.
- The new F1 test walks one card through:
  - Marked: "1 waiting on you" on the state line and in the title, while Home's briefing reads "Nothing waiting on you · confirming with GitHub", as it does for a project's card.
  - Kicked back: still "1 waiting on you".
  - Its file gone from the queue: confirmed, and "Quiet".
- Mutations kill both "count zero" (M36) and "count unmarked cards only", which is the old behaviour (M37).
- Nothing else changed meaning. `portfolioScreenState` only had its comment changed. My earlier probes give the same results at 8d20e79:
  - r3.mjs: one card gives "1 waiting on you" everywhere; a held read gives "Checking…" everywhere; released, it goes quiet.
  - fail-r2b.mjs and hidden.mjs: same as round 3.
  - card.mjs: `note: null`.

**F2: fonts only**
- The repository line reads word for word as before ("Read from shumpmaster/portfolio, read only."), now with the name in Plex Mono.
- The rarer-records lines read word for word as `rareLine` gave them, each name now in Plex Mono.
- The queue's path drops `v2-small` and keeps `v2-mono`. The new test checks Plex Mono at 11 px in light and dark.

**The changed rarer-records case is not weakened**
- It still checks each whole line ("Rulings: 2 · R-001-made-up.md, R-002-made-up.md", "Library facts: 1 · F-001-made-up.md", "Standing intent: 1 · 2026-standing.md"). It now reads each list item's text instead of text runs, because the names became their own elements.
- These mutations are all killed: count dropped (M38), separator changed (M39), second name dropped (M43), names not mono (M40), repository not mono (M41), path in small sans (M42).
- All 43 mutations, M1–M43, are killed.

**Security and accepted views still hold**
- probe.mjs output is byte-identical to round 2's.
- The accepted views are byte-identical at f393d3c and 8d20e79 across 9 routes.

**Non-blocking notes (carried, unchanged)**
- N1 is with Define: the rarer records against the template's file names.
- N4: the pre-6b trial-view tests run without the portfolio.
- N5: a `queue/README.md` would count as a card.
- N6: the pull request should carry `Milestone: MD3`.
- Wording: the state line reads "Not quiet: Can't read your portfolio …" with a capital "C" after the colon.

**Open question (unchanged)**
- A read that keeps coming back "pending" with no failure stays "Checking…" for good. Should J23 set a bound after which it counts as a failure?

Probe scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv6b-probe/, including mutate4.mjs. They need worktrees recreated at …/scratchpad/rv6b-head (8d20e79) and, for accepted.mjs, …/scratchpad/rv6b-base (f393d3c).
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-6b-review-confirmation-verbatim.md.)
