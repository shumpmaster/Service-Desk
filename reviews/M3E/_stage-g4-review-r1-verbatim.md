# M3E stage G4: the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g4 at a3c6ac7 (base 524f92f).

---

Verdict: PASS

G4 of "S-001 after the glance audit". I reviewed build/builder/g4 at a3c6ac7 on 524f92f, over 524f92f..a3c6ac7 in /home/user/sd-g4. I judged it from the diff, the spec on main (unchanged since 524f92f), and the tests. Of the commit messages I read only the subjects and trailers.

There are no blocking findings. Each of the nine planned tasks is done:
- **The calm row:** "Nothing waiting on you" is now soft (400, 13 px, `--ink2`). "◆ <n> wait on you" keeps 500 weight in `--ink`.
- **Ran again, said once:** two or more ran-again lines with no reason recorded become one line, such as "Design and Build ran again · why: not recorded", in the grey used for gaps the agents fill.
- **The Timeline:** it opens with the top of the Now line exactly a third of the way down the screen. In real Chromium that is 247 px at 360×740 and 299 px at 414×896.
- **The failed-load screen:** it shows the ✕, the words and a 44 px "Reload" button. It works with sandbox.js missing, and with sandbox.css missing too.
- **One date form:** "Your last action" and a member's page read "14 Oct, 09:40" for an earlier day and "09:30" alone for today. Both turn at midnight on the 15-second tick. J9's `whenText` is unchanged.
- **Waits row:** a gate card reads "the <Phase> gate for <item>". One item's two cards at one gate add their case, or their own "launch-<n>".
- **Done row:** a gate card's Done row keeps its item whole, under an exact G4 exception in the stage-8 guard.
- **Unread gate card:** a test now opens its sheet.

The two locked cases changed outside the row (87aa780) both had to change and lost no strength. No assertion was weakened. The public lib copies match. Nothing outside G4 changed. I wrote only scratch files, and `git status` in /home/user/sd-g4 is empty.

## Blocking findings
None.

## What I checked (planned tasks and changed criteria)
1. **The calm row (AC91 (j)).**
   - sandbox.js `pageTwoRows` passes `titleCls: 'soft'` only to the "Nothing waiting on you" row. The ✓ and "checked <age> ago" are unchanged.
   - ac91-glance-page checks the cascade in light and dark: the calm row is 13px/400/`--ink2`; "<n> wait on you" is 13px/500/`--ink`; "At work now" keeps class `v2-prtt`.
2. **Ran again, said once (AC91 (j)).**
   - `sayUnrecordedOnce` (src/lib/projectpage.js:176-183) acts only when two or more lines are unrecorded.
   - Phases come in `DESK_PHASES` order, each named once. The line keeps `missing: true`, so it gets class `gap`.
   - Recorded lines and "not available yet" lines keep their own form and date. A single unrecorded line stays in AC83's form.
   - Pure cases cover two phases, three phases, a phase twice, one phase twice, a mixed list, a single line and an empty list. On the page: the made-up `mix` project shows one combined line with no dates; Service-Desk's single line is unchanged.
   - The only caller is renderPage (sandbox.js:1382), so the Timeline keeps every date.
3. **The Timeline (AC91 (i), AC59, AC84).**
   - The `target.now` branch of `scrollToTarget` (sandbox.js:3210-3215) computes `scrollY + top − round(innerHeight/3)`, never below 0.
   - Sprint and milestone links keep their old under-the-band path; a test asserts it.
   - A refresh plus a tick makes no scroll call. The phase line's tap goes to the same third.
   - In Chromium (scratch captures), MD3, the nearest milestone above Now, shows under the pinned header and band.
4. **The failed-load screen (AC91 (k), AC89 (h)).**
   - `loadFailedScreen` and `loadFailedCross` are in app.js:41-68. The ✕ is app.js's own inline SVG, with the same path as `vi('bad')`.
   - The test copies app.js into an empty folder with no sandbox.js, so the real import fails. The view then holds one section containing only the alert line and the button, and `location.reload` is called.
   - The cascade checks pass with sandbox.css: `--t-lead`, ink, ✕ in `--bad`, min-height 44px, 500 15px. They also pass with style.css alone: the ✕ falls back to `--flag` red, and the button is still 44px.
   - Chromium captures, with the real index.html and app.js and sandbox.js (and, for one, sandbox.css) returning 404, show the ✕, the words and the Reload button in both themes. Nothing else is drawn.
5. **One date form (AC91 (l), AC55, AC49).**
   - `dayTimeText` (timefmt.js:265) gives `D Mon, HH:MM` for another day and `HH:MM` for today. That is `dayWords` + `hhmm`'s output, re-implemented rather than called.
   - It is used for `lastAction` and its live span, and on member pages: `memberPage`'s `at`, `rulingsGroup`, the helper lines, and `cosPage`'s pieces and helpers.
   - The midnight turn: "Your last action" is a live span. A member's page is redrawn by `memberDay` in the 15-second tick (sandbox.js:4795-4799). In a scratch copy I removed that block, and ac91-glance-page's midnight case then failed ("drawn again on the tick that crossed midnight"). So the case truly locks it.
   - `whenText` is unchanged, j9-pipeline.test.mjs is untouched, and the Team screen's cards keep their form (asserted in ac49).
   - AC55's today cases ("· 09:30") stand; the earlier-day and around-midnight cases are added.
6. **AC89 (c) waits row.**
   - `shortName` gives "the <Phase> gate for " plus the item as an id.
   - `shortNames` (board.js:467-482) groups by gate|item. When a group holds two or more cards, each adds ", case N" (from the short title) or its own `<gate>-<n>` as an id.
   - Covered both in pure cases and on the page, with `gates`, `sameItem`, and `caseLines: false`.
7. **AC91 (h) follow-ups.**
   - **Done row:** `doneNode` uses `gateTitleNode` when `r.id` contains `|gate|`. The text and the link's name are unchanged. The confirming card and the confirmed row each have one `.v2-gitem`, inline-block in both themes at 360 and 414. A PR row has none. In Chromium, "case / 1 · P-004" wraps with the item whole.
   - **Unread card:** the new `blobNull` in fake-desk makes a card's file listed but unread. Its title, "The Launch gate · P-004", is the same on the board, in the sheet and on Plan. The sheet shows "The card's file: not available" in 12px/400/`--ink2`, and no opening.
8. **The stage-8 guard's G4 exception (exact).**
   - `G4_ONCE` pins only `display: (none) → inline-block` on `span.v2-gitem`, and only where its parent is `a.v2-t` in `li.v2-card.conf`, or `a.v2-dt` in `li.v2-drow`.
   - The guard asserts set equality, and the catch-all now excludes `G[1234]`. The walk adds the Done-rows screen with a both-rows assertion.
   - The M3D and G3 exceptions are untouched. G4's other changes use existing rules, apart from the failed-load screen's new rules, which only that screen reaches.
9. **The two cases outside the row (87aa780), for the Definer.**
   - **AC62 "every word kept":** forced, since the member pages' dates change. The snapshot is transformed only on `#/p/*/team/*` routes, with an exact regex, and still compared with deepEqual. The exact list of six changed pages is asserted, and every other screen is compared as before. Full strength.
   - **AC89 (m) with (h)** in ac89-loading-taps: forced, since it pinned the old `replaceChildren(... p.sb-stale ...)` line. It now pins `loadFailedScreen(words)` and the section's class, and still pins the render-error screen's own form. Same strength, with the runtime check in ac91-glance-load.
   - **The other rewrites** are all marked "rewritten in G4", and each is equal or stronger:
     - AC59, AC84, AC83 two-rows, AC83 ran-again: equal or stronger.
     - AC89 (c), AC89 (h): stronger.
10. **Nothing outside G4.** There are 31 files: the G4 code, its src/public/lib copies, tests, fixtures and README (made-up parts labelled NOT real), and the capture tool. `cmp` shows board, page, projectpage, sandbox and timefmt identical in src/lib and src/public/lib. The spec and the J9 tests are untouched.

## Join-up (the parts working together)
- **Project page:** the waits row's names, the soft calm row, the combined ran-again line and "Your last action" all sit together on the same page (captures g4-page-quiet, -mix, -gates, -gates-one-item).
- **Gate cards:** a gate card reads the same on Waiting, in its Done row, in its sheet and on Plan, read or unread.
- **Timeline:** the phase line's tap and opening the Timeline give the same third-down position.
- **Differences found:** none blocking. See notes 1 and 2.

## Commands run
- `cd src && npm test`: 1203 pass, 0 fail.
- `cd src && node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 524f92f`: "OK: all governance checks passed."
- `surface_guard.py diff --range 524f92f..a3c6ac7 --branch build/builder/g4`: "OK: 3 commit(s) … checked".
- `review_check.py pr 999 --base 524f92f`: R1; requires design-reviewer and reviewer. The only failures are those two "missing verdict" lines; no test-weakening flag was raised.
- `node tests/desk/tools/glance-shots.mjs <scratch>/shots g4-`: 40 captures, none scrolling sideways. The Now line sits at 247/247 and 299/299 px. I viewed the Timeline, the failed load (light, dark, no CSS), the mix and one-item pages, the Done gates, and the unread sheet.
- Mutation in a scratch copy: removing the midnight redraw fails the midnight case.
- All three commits are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **A gate item splits at its hyphen in the waits row.** In capture g4-page-mix-360x740-light, the row reads "the Build gate for P- / 002". The `.v2-wn` ids have no inline-block rule, so the item G4 now adds to the gate name can split. AC89 (c) does not ask for it to be kept whole there; only the short title's places do. The row's other ids, such as "a merge of P-002", could split in the same way. Route: the Design reviewer, and the Definer if wanted.
2. **The Working now sheet over a member's page still uses J9's form.** For example: "handed back Oct 14 09:40" (sandbox.js:3398, `cosPieceWords` without `dayTimeText`), and the "Started", "Last check-in" and "Update" values in `workingNow` and `cosWorkingNow` (src/lib/sandbox.js:1543-1600). Meanwhile the row under the sheet reads "14 Oct, 09:40". AC91 (l) names "the dates on a team member's page" and lists what keeps J9's form; this sheet (AC41) is in neither list. Route: the Definer, to say which form the sheet takes.
3. **For the Definer:** the AC62 and AC89 (m) rewrites (item 9) and the new `G4_ONCE` are not named in the G4 row. All are forced and exact.
4. **Minor:**
   - ac83-page.test.mjs:509's message ("one line for each phase that ran again") now compares against the combined count. Its fixtures have one unrecorded line, so its result is unchanged.
   - `memberDay` is never cleared on leaving the member page, so the midnight tick redraws once on whatever screen is open. This is harmless.
   - `dayTimeText` re-implements `dayWords` + `hhmm` instead of calling them. The output is identical.
5. **The pull request's own captures still need to be made** and judged by the Design reviewer. Mine are scratch only, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-review/shots/.

## Open questions
- Note 2: should the Working now sheet over a member's page take the one date form?
- Note 1: should ids in the waits row be kept whole?
