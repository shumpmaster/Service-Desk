# M3B stage VT3: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/builder/vt3 at 99154a5 (VT3's work over 55a2484).

---

Verdict: PASS

VT3 is built and tested against its row. I found nothing that fails it. The gaps below are untested branches, cases the spec makes unreachable, and spec ambiguities. They go to the gate as risks or questions.

**Runs (branch build/builder/vt3 in /home/user/sd-vt3, 6 commits over 55a2484)**
- `npm --prefix src test`: 1542 tests, 1542 pass, 0 fail.
- `node src/tools/build.mjs`: PASS (2 connected projects; 39 page modules in step).
- `surface_guard.py diff --range 55a2484..build/builder/vt3 --branch build/builder/vt3`: OK, 6 commits, exit 0.
- The worktree is clean (`git status` empty). The bugs I planted and my probe tests exist only in the scratch copy at /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt3copy.

**Blocking findings:** none.

**Planted bugs (one at a time; ran ac25-weekly, ac25-weekly-page, ac82-home and ac87-portfolio)**
Caught (16):
- times rounded instead of cut, in two places
- the week still running offered
- launch week marked as a trial
- "Last week's…" never used
- "Records from" always written
- no split at midnight UTC
- items not filtered to their week
- `off` ignored
- the tree ignored
- an open card counted to now instead of to the week's end
- the week's lower edge moved
- trial weeks drawn before counted weeks
- a soft-box class on Home's line
- no scroll to the block
- the "kept 8 weeks" words dropped

Survived (7):
- B3: AC18's warning not drawn (sandbox.js:1683).
- B8: a card answered after the week counted to its answer, not cut at the week's end (values.js:265).
- B23: the dispatch-log months guard removed (values.js:258).
- B24: the "not read" guard removed (values.js:256).
- B26: the copy-to-clipboard on tap removed (sandbox.js:1673).
- B27: "Your weekly figures" put on every project's targets sheet (sandbox.js:1702). This has no visible effect today, because only Service-Desk has a targets sheet.
- B30: a truncated tree treated as unread (control plant; no test either way).

**Locked cases**
- 9090ae8 (AC82, tests/desk/ac82-home.test.mjs:115) and 6b4a4bd (AC87, tests/desk/ac87-portfolio.test.mjs:75) are real.
- Each keeps every old assertion, the old order included, and adds a second page load with a week to save.
- With that week, each asserts the order `…'portfolio','home-weekly','home-more-detail'`, and AC82's also checks that "More detail" stays last. Both commits are named and marked forced.
- Small error: 6b4a4bd's message says the AC87 fixture "names no portfolio", but it does draw the portfolio block. It is wording only.

**Join-up review, through the loaded page (Reviewer, end of Build)**
- **Notes to file.** I added a made-up v3 project, Alpha, to `vt3State` and loaded the page with an empty store at Tue 10 Nov 17:58:00.777 Chicago. I ticked it for 3 minutes and marked `Alpha|pr|80` "Didn't need me" through its sheet, then reloaded at Mon 16 Nov.
- **Home.** It showed "Last week's desk figures are ready to save".
- **The targets' sheet.** It opened at "Your weekly figures" with the trial line and "Save the week of 9 Nov ↗".
- **The file.** Path `metrics/service-desk/2026-W46-<device>.md`. The body, in J5's form:
  - the trial line
  - V5 "2h 10m over 7 cards"
  - "Records from: 2026-11-10"
  - windows `2026-11-10: 23:58:00-24:00:00` and `2026-11-11: 00:00:00-00:02:03` (cut from .776)
  - all 7 first-shown keys, including Service-Desk's real card
  - the mark at 23:59:02Z
- **Screens.** I ran tests/desk/tools/vt3-shots.mjs in Chromium. The sheet scrolls sideways 0 px at 360 and 414, light and dark. Home's line sits between the portfolio block and "More detail".
- **Differences, all non-blocking:** N2, N3 and N5 below.

**Non-blocking findings (risks for the gate)**
- **N1: AC18's message and the no-prefill Copy can't be reached on the page.** The row asks for both on the page; they are tested only at the module level (ac25-weekly.test.mjs, last test). The page's drawing of the warning (sandbox.js:1683) has no test, so B3 survives. Setting either key in J7's `portfolio` through the fixture's unused `pfConf` hook (vt3-fixtures.mjs:86) makes the function refuse the portfolio read ("Can't read your portfolio"), so the block never appears. This confirms the Builder's point 1.
- **N2: a file can be offered before V5's figure is ready, and committing it ends the offer for good.** The offer appears once the planning project's doc and the portfolio tree are read. `logLoaded` can still be false while the dispatch-log blob waits for a later blob call (model.js:616-624). The link then carries "V5 median (weekday cards): not available until Service-Desk has been read" (values.js:256). If the owner saves that, the week's file is in the tree and is never offered again, yet J5 says the Chief of Staff's V5 count is "the median line". The fake server answers at once, so I could not reproduce the timing; this is from the code. Suggest withholding the offer, or at least the link, until every v3 project is read.
- **N3: a truncated portfolio tree is used as if whole** (sandbox.js:1636, `tree: snap ? snap.tree : null`). Elsewhere the desk treats a truncated tree as unread (portfolio.js:361; scheduler.js:399 records it as a failed read). A saved week could be offered again, and GitHub would then refuse the duplicate file name. The risk is low today, because the portfolio holds only ideas/IDEAS.md. Suggest `!snap.truncated`, as in B30.
- **N4: `v5Week` has untested branches** (values.js:256, 258, and the cut at 265). B8, B23 and B24 all survive. Weeks older than the two UTC months J2 reads can be offered for up to 8 weeks, and their files say "not available: the dispatch log months the desk reads no longer cover this week".
- **N5: midnight UTC.** A window that crosses midnight UTC is written as two parts, the first ending `24:00:00` (weekly.js:87). For Chicago this happens on any evening use after 18:00 in winter (19:00 in summer), so it is common. It is reasonable, but J5 doesn't define it.

**Questions (the Builder's flagged points, judged as a spec reader)**
1. **J7's check refuses the two keys the row asks to test.** This is a real conflict inside the spec. The module tests are the most that can be done; the spec owner should drop those two page cases or allow the keys in J7.
2. **The V5 line for an unread project or an old week.** J5 is silent. The Builder's words are clear, but see N2: the spec should say whether the offer waits for the reads.
3. **"One line a day".** It doesn't cover a window crossing midnight UTC or one of zero length. The Builder splits at midnight with `24:00:00` and leaves zero-length windows out; sub-second windows that cut to the same second are kept. Both are acceptable readings, but J5 should state them, since the Chief of Staff parses the file.
4. **Once every week is saved, the block is gone, the "8 weeks" sentence with it.** This matches the build plan ("Home's line and the sheet's 'Your weekly figures', gone once that repository's tree holds the file"). Acceptable.
5. **A truncated tree.** See N3. The spec doesn't say; the desk's own rule elsewhere says treat it as unread.

**The Home sentence.** "The desk reads your portfolio repository and never changes it (your ruling, P-001-portfolio-read)" is still literally true. The ruling (decisions/questions/P-001-portfolio-read.md) is "nothing on the desk can change it": the desk makes no write and adds no call, and the owner commits on GitHub's own page under their own account. The owner's later answer C put the file there knowingly. In the capture, though, the sentence sits directly above "Last week's desk figures are ready to save ›", which saves into that same repository. A reader may see a contradiction. The words are fixed in the spec (S-001.md:9138), so this is for the Chief of Staff or the Design reviewer (for example "…never changes it; the weekly files you save there yourself"), not a VT3 defect.

Captures are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/ (vt3-*.png).
