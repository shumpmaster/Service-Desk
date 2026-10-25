# M3E stage G9b: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9b at 704aba7 (G9b's work over 978d9d3).

---

Verdict: PASS

**Scope:** stage G9b of S-001, round 1, on branch build/builder/g9b at 704aba7, in /home/user/sd-g9b. The Builder's four commits are 9e5ffc2, 50c0d66, 3e9561e and 55eb74d, on top of 978d9d3. Everything that wrote files ran in scratch worktrees, now removed. /home/user/sd-g9b is clean at 704aba7.

**What I checked, and what I found**
- **The behaviour is built as the spec says.**
  - `titleLine` is at /home/user/sd-g9b/src/lib/home.js:73. Its src/public/lib copy is byte-identical.
  - It returns `ONE_WORDS.notRead` ("Not read in this opening") while any project has `read === 'cant-read'` and no read has succeeded in this opening. Otherwise it gives the as-built words: "Checking…" on Home, "checking…" on Waiting, and "checked <age> ago" from the stalest read.
  - The wiring is at /home/user/sd-g9b/src/public/sandbox.js:722-730 (`titleReads`, `homeChecked`, `waitingChecked`), :1084 and :2571.
  - One project shown alone still uses `one.under`. The "Nothing waiting on you" row on a project's page still uses `checkedWords`. No CSS changed.
  - Two things the pure cases assume match the code. The scheduler's pending outcome clears `failure` and sets `checking` (/home/user/sd-g9b/src/lib/scheduler.js:1357-1361). `safeBox` keeps the real read on a box it can't draw (/home/user/sd-g9b/src/public/lib/universe.js:93-104).
- **Every case the row and AC91 (c) list is locked** in /home/user/sd-g9b/tests/desk/ac91-g9b-checking-line.test.mjs (19 tests):
  - several projects in mixed states (:74-93, :246-275);
  - every first read failed (:277-283);
  - the failed project later read, on the first draw after it (:216-225);
  - signed out three ways (:122-127, :324-342);
  - the 3-minute cause (:79-88, :296-312);
  - the blob-failure path (:314-322);
  - state 5 (:95-101);
  - a project the desk can't draw (:115-120);
  - one project shown alone in states 1, 2 and 5 (:129-134, :344-364);
  - the page's "Nothing waiting on you" row unchanged (:366-377);
  - the screen state, with AC4's title, unchanged (:202);
  - AC91 (f) in both of its forms (:207, :232-244);
  - light and dark on every entry of `G9B_OPENS`, including Home's red list line kept `--bad` (:407-436).
  - The ac88 want-list adds "grey: the line under the title" (/home/user/sd-g9b/tests/desk/ac88-dark.test.mjs:676-686 and :873), and a new last test walks `G9B_OPENS` (:1894-1924).
- **My own probes, at 704aba7, all passed:**
  - a project the desk can't draw whose first read failed, on screen → "Not read in this opening";
  - a project the desk can read but can't draw → "checked …";
  - state 5 with every project shown → "checked 3 min ago";
  - the portfolio's read failing → "checked …";
  - the failed project reading with no explicit redraw → the line changes on its live tick.
- **The cases fail on the old code.** 978d9d3's src with the new tests fails at import (`WAITING_CHECKING` is missing). So I added a shim giving `titleLine` the old behaviour: 14 of 19 fail and 5 pass. The 5 that pass are the cases meant to stay as built (tests 2, 8, 9, 17 and 18).
- **No locked case was rewritten.** `git diff 978d9d3 55eb74d -- tests/` only adds to ac88-dark.test.mjs: an import, a new branch in `okBadCheck`, one want-list entry and one new test. 978d9d3's own ac88-dark.test.mjs passes on G9b's source, 6 of 6.
- **surface_guard** on 978d9d3..55eb74d with `--branch build/builder/g9b`: "OK: 4 commit(s) … checked".
- **Commit identity:** the four commits are by `builder <builder@agents.invalid>`, each with `Agent-Session:` and `Spec: S-001` trailers. None has a model name or co-author line.
- **Full suite** (`npm --prefix src test` at 704aba7): 1342 of 1342 pass, 0 fail, in 252 s.
- **ac88-dark's heap:** 1172 MB peak of the 2096 MB limit at 704aba7, against 1140 MB at 978d9d3. I sampled heapUsed every 50 ms, which reads higher than the Builder's 1103 MB figure, and is still well under the limit.
- **The made-up fixtures are labelled NOT real:** `failedHeldState` and `G9B_OPENS` (/home/user/sd-g9b/tests/desk/glance-fixtures.mjs:749-785), the fixtures README (/home/user/sd-g9b/tests/desk/fixtures/README.md:995-1015), and the two-held-reads, never-answering and mended-reads variants.

**Blocking findings**
None.

**Non-blocking findings**
- **N1.** G9b's row, as the Definer revised it in dfe5319, says that on G7b's desk the lanes show "Nothing here", the lane's count and "Kicked back · none". The case at /home/user/sd-g9b/tests/desk/ac91-g9b-checking-line.test.mjs:207 asserts only the empty-lane words and the strip, not the lane's count. The count is unchanged code that other files already lock, so the risk is low.
- **N2.** Over the whole branch range (978d9d3..704aba7), surface_guard fails. It flags 692e6e1 and 18e05bd (chief-of-staff) and dfe5319 (definer), because it applies the builder-branch rule to commits merged in from the push and definer branches. The Builder's own range passes. Landing should guard the Builder's range, or check those commits against their own branches.
- **N3.** The line takes each project's read from the `built` captured at the last draw. So the change to "Not read in this opening" after 3 minutes, or after a failed read, comes only on the next draw. The ruling text ("no tick of its own", P-001-glance-checking-slow.md, A) allows this, and the 3-minute case calls an explicit redraw to show it. It is recorded here as a known behaviour.

**Open questions**
- G9b's pull request body must name `titleLine` in src/lib/home.js and its src/public/lib copy, as the row requires. It must also say that no locked case was rewritten. I had no PR body to check.
