# S-001 desk v2, stage 6b (the portfolio's read): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-6b at 32d2eb5.

---

Verdict: FAIL

Scope: f393d3c..32d2eb5 (2aedcdd, 5c88823, 32d2eb5) on build/builder/desk-v2-6b. I worked read-only in detached worktrees at f393d3c and 32d2eb5, now removed. Mutations ran in a separate archive copy, also removed. I did not see the Builder's summary.

Two blocking findings, both routed to Build. The security side holds up. In both blocking cases, the screen says something that isn't true when it reads a portfolio made from the model's real template or opens in the usual way.

**Runs**
- `cd src && node --test ../tests/desk/*.test.mjs`: 1045 tests, 1045 pass, 0 fail. At f393d3c it was 1017 pass.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)". The worktree was clean afterwards.
- `bash governance/checks/check_all.sh . f393d3c`: "OK: all governance checks passed."
- `surface_guard.py diff --range f393d3c..32d2eb5 --branch build/builder/desk-v2-6b`: "OK: 3 commit(s) … checked". All three commits are by builder@agents.invalid, with `Agent-Session:` and `Spec: S-001` trailers.
- `review_check.py pr 999 --base f393d3c`: FAIL, as expected before review. The class is R3 (src/config/projects.json). It is missing design-reviewer.md (src/public/**), owner.md and reviewer.md.

**Blocking findings**

B1 (Build). Home's briefing says the portfolio can't be read when no read has failed: it just hasn't been tried yet.
- Repro: sandbox with J7's portfolio. Open and let the reads finish, so the briefing says "Nothing needs you". Hide the page for 30 minutes, then show it.
- Before any read answers, the briefing reads "Can't read your portfolio since 13:00". On the same screen, the state line reads "Checking…".
- The same run with no portfolio in J7 gives "Checking… | state: Checking…".
- Script: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv6b-probe/hidden.mjs (and hidden-nopf.mjs). Both need a worktree at 32d2eb5.
- Cause:
  - src/lib/portfolio.js, `portfolioRead`, the quietWords block (`if (!fresh) { … else { const since = f ? f.since : snap.lastSuccessAt; quietWords = … cantSince … } }`) words a stale read with no failure as a failure.
  - src/lib/home.js:134 (`if (pf && pf.quietWords) cant.push(pf.quietWords)`) then puts it ahead of the "checking" rule.
- Coming back from the background after more than 6 minutes is the usual way the owner opens the phone app. The words last until the portfolio's read answers, which waits behind every project's cycle.
- J23 keeps "Can't read your portfolio since HH:MM" for a failure. Not being quiet while a read is due and in flight is right; saying "Can't read" then is made up.
- The same wording shows with no time ("Can't read your portfolio") while a first read with more than 25 missing blobs is still filling in. That is the `pending` outcome in scheduler.js pfCycle.

B2 (Build). Every portfolio card written in the model's own card form is flagged "can't parse".
- src/lib/portfolio.js, `parsePortfolioRecord`, uses `parseCard` (src/lib/records.js:107-130). That adds the note 'no answer path on the "answer:" line' when a card has no `answer:` line.
- `portfolioRead` then sets `cantParse` from any note, and `portfolioCards` shows `can't parse: …` on the board card and in its sheet.
- The model's portfolio template (Personal-Org-Operating-Model portfolio-template/queue/_DECISION_CARD.md, which J23 cites) has no `answer:` line. J23 says "No answer path is read or built: this spec reads no portfolio answer form (C)".
- Repro: a made-up card in the template's section form with no answer line gives `{ title: 'Whether to try the made-up thing?', note: 'can't parse: no answer path on the "answer:" line' }`. Script: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv6b-probe/card.mjs.
- The tests miss this because the fixture card in tests/desk/pf-fixtures.mjs (`cardText`) has an `answer: write decisions/PF-001/explore-<n>.md` line, which the template doesn't have.

**Security review: holds**
I tried 27 crafted bodies against `handle()` (probe.mjs in the same folder). Every one either:
- was refused with a 400 and made no GitHub call, or
- read only `/repos/shumpmaster/portfolio/branches/main`, `…/git/trees/<GitHub's tree sha>?recursive=1` or `…/git/blobs/<40-hex>`.

What I tried:
- Mixing `target` and `project` in either order.
- A `__proto__` key in the body and in the ETags.
- ETags for another repository, for `shumpmaster/Portfolio` in a different case, and with an injected CRLF. The CRLF one makes no GitHub call and answers `cant-read`.
- Uppercase, empty, 0 and false heads.
- `PORTFOLIO` and `"portfolio "` as the target.
- 5000 copies of one sha (refused as too large a body), a sha with `?recursive=1` or `\n` after it, and blobs given as an object.
- Poll keys in a blob call and the other way round.
- `project: "portfolio"`.
- A J7 portfolio that is malformed, equals a project's repo in a different case, or has a `..` branch. Each is refused as "no portfolio in J7".

Other checks:
- A `Target` key on a project body only ever reads Service-Desk.
- Nothing writes: every request is a GET with the same read token. There is no new secret, and the token never shows up in a reply or a log.
- A portfolio failure (403, 404, 500, network, Cloudflare, signed out, a failing blob call) leaves every project's calls, times and `lastSuccessAt` the same. Mutation M12 (a failure clearing a project's read) is killed.
- The change to projects.json is exactly J7's `portfolio` line.
- The fixtures are made up and labelled NOT real. I found no real portfolio file name or content in the diff.
- The accepted views render byte-identical at f393d3c and 32d2eb5 across 9 routes (accepted.mjs, acc-base.txt and acc-head.txt), and app.js never reads the portfolio.

**Spec items that check out**
- `PORTFOLIO_POLL_MS` is 300,000 and the portfolio reads after the projects' polls. The AC14 day stays inside A3: 200 polls and 30 blob calls in 16 open hours, 6,556 calls in all.
- Quiet's 6-minute rule.
- The "Portfolio" group: it comes after the projects', is counted in Waiting's badge, has "Open ↗" linking to the card file on GitHub, is confirmed when the file leaves the queue, and is kicked back with "The card file is still in the portfolio's queue".
- J23's failure words, "Since you last looked" for an idea's change, and the phone note.

**Tests**
- The two rewritten tests are sound. j7-config now also checks the committed file whole. ac87-portfolio's 6a cases run with no portfolio in J7, as AC87's test asks.
- helpers.mjs's CONFIG dropping `portfolio` matches J7's "Absent, it builds".
- Mutations: 21 of 25 killed. The survivors:
  - M20: a truncated tree counted as a good read.
  - M23: the function only checking that `portfolio` exists.
  - M24: blobs over the size limit still asked for.
  - M25: the limit raised to 100 MB.

**Non-blocking notes (carried as risks)**
- N1 (Define, then Build). The rarer records don't match the model's template. On a portfolio shaped like it, the sheet reads:
  - "Library facts: 1 · _TEMPLATE.md". J23 says "none yet" only for a folder holding just its README, but the template's facts folder holds `_TEMPLATE.md`.
  - "Standing intent: 1 · PORTFOLIO-INTENT.md". J23 says "beyond its template's name" and the template's file is PORTFOLIO-INTENT.md. The code guesses that `_` or README marks a template instead.
  - Script: rare.mjs.
- N2 (Build). The scheduler's skip of blobs over 1 MB and the truncated-tree outcome have no page-level test (M20, M24, M25 survive). The function's defence for a malformed J7 portfolio is untested (M23). My probe shows the code does refuse it.
- N3 (Build). A portfolio card's sheet head is "portfolio · decision · <file> · wait not recorded". It doesn't use the card's `Milestone:` line, though J23 says it is read "when it has one". The portfolio.js comment at line 265 claims it is read.
- N4. The pre-6b sandbox suite runs without the portfolio. Only the 6b, J23, AC88 and AC14 cases run the trial view with the committed J7.
- N5. A file like `queue/README.md` or `.gitkeep` would count as a card. That follows J23's words; the template has no such file today.
- N6. docs/PROJECT.md doesn't mark MD3 reached, so the pull request should carry `Milestone: MD3`.

**Open questions**
1. For J23: should the "Can't read" words wait for a read that actually failed, or until one is due and unanswered for some time?
2. Should J23 name the template's own files, `library/facts/_TEMPLATE.md` and `intent/PORTFOLIO-INTENT.md`? And can a name-only read tell standing intent from the template at all, when intent is written into PORTFOLIO-INTENT.md itself?

Probe scripts and outputs are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rv6b-probe/. They expect a worktree at 32d2eb5 (and at f393d3c for accepted.mjs) under the scratchpad path to be recreated first.