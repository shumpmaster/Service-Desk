# S-001 desk v2, stage 6b (the portfolio's read): the Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-6b at 6ff0050.

---

Verdict: FAIL

Round 2: build/builder/desk-v2-6b at 6ff0050, reviewing f393d3c..6ff0050. I worked read-only in fresh detached worktrees at 6ff0050 and f393d3c, now removed, and ran mutations in a separate copy, also removed. I did not see the Builder's summary.

B1, B2, N2 and N3 are fixed and their tests have teeth. It still fails on one new blocking finding, B3: the page's state line says "Quiet" while a portfolio card waits. That bug was already in 32d2eb5 and I missed it in round 1.

**Runs**
- `cd src && node --test ../tests/desk/*.test.mjs`: 1051 tests, 1051 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)". The worktree was clean afterwards.
- `bash governance/checks/check_all.sh . f393d3c`: "OK: all governance checks passed."
- `surface_guard.py diff --range f393d3c..6ff0050 --branch build/builder/desk-v2-6b`: "OK: 4 commit(s) … checked". 6ff0050 is by builder@agents.invalid with the `Agent-Session` and `Spec: S-001` trailers.
- `review_check.py pr 999 --base f393d3c`: FAIL, as expected before the verdicts are recorded. It is R3 and needs design-reviewer.md, owner.md and reviewer.md.

**Blocking**

B3 (Build). The state line and the tab title say "Quiet" next to a waiting portfolio card.
- Repro: the trial view with J7's portfolio, one card in its queue, and both projects quiet.
- Result: "1 needs you | state: 1 waiting on you · Quiet". With 30 cards it reads "30 waiting on you · Quiet".
- Script: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv6b-probe/fail-r2b.mjs (and fail-r2.mjs). Both need a worktree at 6ff0050 at …/scratchpad/rv6b-head.
- Cause: src/public/sandbox.js:1801, in `withPortfolio`: `` `${n} waiting on you · ${s.text}` ``. When the projects are quiet, `s.text` is "Quiet", and the same text goes into `document.title` at :4025.
- Why it matters: Terms' Quiet means nothing needs the owner, and AC87's V1 trace exists so the desk "never reads as quiet" over the portfolio. No test checks this state text.

**Round-1 findings: fixed**
- B1, with my probes rerun:
  - hidden.mjs now gives "back after 30 min, before any read answers: Checking… | state: Checking…". That matches hidden-nopf.mjs exactly.
  - Real failures still show the right words and time. Back from hidden with the read failing: "Can't read your portfolio since 13:31". A failure at 13:05 is still "Nothing needs you" inside the 6 minutes, then "Can't read your portfolio since 13:05" past them.
  - The 30-card first read no longer says "Can't read".
  - 404 with no access: "Can't read your portfolio: the desk's read access doesn't include it (Setup P1)".
- B2: card.mjs now gives `note: null`. A card with no options is still "can't parse". The fixture card in pf-fixtures.mjs dropped its made-up `item:` and `answer:` lines and gained a `Milestone:` line, which matches the template. That is not a weakening: a new case checks that an `answer:` line, if one appears, changes nothing.
- N3: the sheet head reads "portfolio · decision · PF-001-explore-1.md · PM1 · wait not recorded". `none (…)` or no line gives no milestone part.
- N2: M20, M23, M24 and M25 are now killed. So are M1 to M19, M21 and M22, and my new mutations M26 (B1 reverted), M27 (B2 reverted), M28 (no milestone in the head) and M30 (no milestone line).
- The portfolio's on-device cache moves to `desk-portfolio-blobs-v2`, and the old key is removed.

**Still holding**
- Security: probe.mjs gives the same results as round 1. Every crafted body is refused with no GitHub call, or reads only the portfolio's branch, tree or blobs, and the token is never echoed. api.js and github.js are unchanged in 6ff0050.
- Accepted views: byte-identical at f393d3c and 6ff0050 across 9 routes (acc-base2.txt and acc-head2.txt).

**Non-blocking**
- N7 (Build, test gap). Mutation M29 survives: removing home.js's rule `|| Boolean(pf && !pf.fresh && !pf.quietWords)` fails no test. That rule is what says "Checking…" when the projects have answered but a stale portfolio read is still in flight. The B1 test lets both answer in the same tick, so it never reaches that window. Without the rule, Home would briefly say "Nothing needs you" over an unread portfolio.
- N1 (the rarer records against the template's file names) is with Define, as you said.
- N4 to N6 from round 1 stand. In short:
  - N4: the pre-6b trial-view tests run without the portfolio.
  - N5: a `queue/README.md` would count as a card.
  - N6: the pull request should carry `Milestone: MD3`.

**Open question**
- With the B1 fix, a read that keeps coming back "pending" with no failure would show "Checking…" with no end. That would happen if a blob answers null without an error, which is rare. Should J23 set a bound after which it counts as a failure?

The probe scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv6b-probe/. They need the worktrees recreated at …/scratchpad/rv6b-head (6ff0050) and, for accepted.mjs, …/scratchpad/rv6b-base (f393d3c).