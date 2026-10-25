# M3E stage G7b: the Reviewer's round 1 (FAIL, B1), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g7b at 4167c78 (G7b's work over 39da454).

---

Verdict: FAIL

The stage is close. Every test the row lists is there and locked, and every check I ran passed. One state the spec covers is not met: a project the desk can't draw whose read also fails gets no grey line, though Home's briefing says it can't be read (B1). The fix is a one-line change in `sinceReads`.

**What I ran** (scratch worktree `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g7b` at 4167c78):
- **The new test file** (tests/desk/ac91-g7b-since-missing.test.mjs): 10 of 10 pass.
- **tests/desk/ac88-dark.test.mjs:** 6 of 6 pass. That covers the cascade want-list and the stage-8 guard with `G7B_ONCE`.
- **15 related files, 266 of 266 pass:** ac54, ac56, ac80, ac82, ac83, ac87, ac89-after-md3, ac91-glance-home/-gates/-page/-waiting, ac92-glance-counts/-palette/-standard, and j24-since.
- **surface_guard diff --range 39da454..4167c78:** OK, 4 commits.
- **The g7b- Chromium captures:** re-taken; every missing line is 1 or 2 lines and none is cut.
- **Not run:** the full suite (about 17 minutes).

## Blocking

**B1. A project the desk can't draw whose read then fails gets no missing line, while the briefing says "Can't read <project> since HH:MM".**
- **Where:** src/public/sandbox.js:957, in `sinceReads`: `read: b.box.drawError ? null : b.box.read`.
- **Why it matters:** `safeBox` (src/public/lib/universe.js:87-97) keeps a real `readState` on a box with a draw error, so that read can be `cant-read` with its own since time. The briefing names such a project as can't-read (src/public/lib/home.js:125-128). AC91 (c) as changed says "while any connected project can't be read (AC89 (a)'s 'can't be read' …), the list ends with one line for each such project", and the time is "as the briefing's 'Can't read <project> since HH:MM' gives it".
- **Failing path:** probe at `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/probe/cantshow.mjs`.
  1. Open `unreadState()` with `BAD_PR` pushed to Alpha's pulls and "last looked" at `SINCE_LATE`.
  2. Advance 1 s, then one poll.
  3. Set `s.repos[Alpha].fail = { kind: 'network' }` and advance 3 polls.
  4. Briefing: "Can't read Alpha since 10:01". List: "Nothing new since 18 Oct, 19:00". `since-miss` is absent.
- **What the owner sees:** the quiet list the ruling was meant to end, beside a can't-read briefing.
- **The Builder's reading:** "a 'Can't show' project gets no line" holds only while that project's read succeeds. A draw error alone is not one of AC89 (a)'s read failures.
- **Fix:** pass `b.box.read` whenever `b.box.read.read === 'cant-read'`, draw error or not. This also stops G1's "Not read since" line, which reads the same values, from saying "Nothing new". Add a case for a project that can't be drawn and whose read fails. The pure case at test :91 (`read: null` → no line) can stay.
- **Alternative:** if the orchestrator prefers that "Can't show" always wins, that is a spec ruling for the Definer, not a Builder reading.

## Join-up (the parts working together)
- **Briefing, list and tile:** in every G7b state except B1, the line's HH:MM matches the briefing's "Can't read <project> since HH:MM". Test :129 checks it in the fake DOM. In the captures, the tile corner, the cap row and the versions row match too. One capture at 360 px dark first looked like "10:00" against "10:01"; a full-resolution crop showed 10:01 in both, so it was a downscaling artifact.
- **The group head's "<n> can't be read" and the lines:** these agree, except for B1's project. The head counts a draw error as can't-read; the list leaves it out.
- **The "<n> more" link and its sheet:** the count is unchanged (test :210). The sheet holds no missing line.
- **The look:** the cascade want-list and `G7B_ONCE` agree with the CSS the stage adds.

## Checked and holding
- **Every test the row lists is locked:** each has its own case with `ac-test:` marks for AC91 and AC92:
  - one project since a time
  - "in this opening"
  - two projects in tile order (proven different from the config's and the briefing's order)
  - signed out, from the start and after reads
  - the list empty, with the red line kept and then the grey line
  - "<n> more": the line after it, outside the four lines and the count
  - "Checking…", including the first paint
  - a read that recovers, with its line gone on the first draw after; the last one gone takes the box too
  - `--ink2` and never `--bad`, no icon, not a link, both themes, no cut
  - on AC88's want-list
  - `G7B_ONCE`
  - the g7b- captures of `unread`, signed-out and `ext`
- **No locked case changed or weakened:** the only existing test touched is ac88-dark.test.mjs, and only by additions. The final "nothing else excepted" filter admits `G7B ` only after `G7B_ONCE` is asserted set-equal (:1412-1415). No G1 case was touched, and the G1 files pass.
- **`G7B_ONCE` is exact:** `div.v2-smiss` display, gap and margin-top, which is exactly the rule added at sandbox.css:799. The key is limited to a `div.v2-smiss` whose parent is `.v2-home`.
- **The guard leaving out the "<n> more" screen is justified.** I ran a copy of the guard with that screen put back (`/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/probe/ac88-more.test.mjs`). The only new difference is G1's `span.v2-e1.over` `max-height: calc(3 * 1.45em) → calc(2 * 1.45em)`, which G1's own comment (ac88-dark:860-862) already leaves to AC82's and AC91's cases.
- **Per-project state is keyed by identity:** `since-miss:${project.name}`. configcheck.js:103-105 makes names unique and plain (no ":"), and `DESK.states` uses the same key.
- **No read added:** the lines come from `box.read` and `DESK.states`, as G1's line does. home.js and its src/public copy are identical.
- **Other rules:** no line while "Checking…" (only `cant-read` reads are taken). The line goes on the next draw after a success. It is not counted in "<n> more". It is `--ink2`, never `--bad`.
- **Fixtures:** every made-up part is labelled NOT real — fixtures/README.md, `G7B_OPENS`, `lookedAt`, `EXT_LONG`, and fake-desk's `hold`.
- **Commits:** all four are by builder <builder@agents.invalid>, with `Agent-Session:` and `Spec: S-001` trailers.

## Non-blocking notes and questions
1. **The other Builder readings hold:**
   - The code lives in src/public/sandbox.js, as the build plan says.
   - A project failing from the start reads "in this opening".
   - No lines in the "<n> more" sheet: the ruling places them under the list on Home.
   - No lines with the markers off: there is no list for them to end.
   - The guard leaving out "<n> more": see above.
2. **Time with no successful read:** where a project's read succeeded in this opening but holds no since time, the line says "in this opening" while the briefing says "Can't show <project>". That state is probably unreachable; I note it only.
3. **Commit 1cbfa10's message is out of date:** it lists a line `overflow-wrap` pin in `G7B_ONCE`, which 4167c78 then removed. The pull request body should describe the final three-declaration exception.
4. **Captures:** at 360 px the full-page captures show the tab bar over the missing line. That is the capture tool's fixed bar, not the page.
5. **Not verified:** the pull request's Tasks section, since no PR number was given.

The scratch worktree is still registered on /home/user/sd-g7b; it can be removed with `git -C /home/user/sd-g7b worktree remove --force /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g7b`.
