# M3E stage G7b: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g7b at 9fcc448 (fix commit 9fcc448, on 4167c78) (G7b's work over 39da454).

---

Verdict: PASS

9fcc448 fixes round 1's B1. I found no new blocking issue.

**Checked** (read-only; scratch worktree at 9fcc448, `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g7b-r2`):
- **The code** (`git diff 4167c78 9fcc448`, src/public/sandbox.js:955-961): `sinceReads` now keeps a can't-draw box's read whenever that read is `'cant-read'`. It still passes no read while that read succeeds. The briefing (home.js:125-128) and the group head (sandbox.js:985) treat this state the same way, so all three now agree.
- **The new case** (tests/desk/ac91-g7b-since-missing.test.mjs, the "B1, round 1" test): Alpha can't be drawn (`BAD_PR`, labelled NOT real), and then its read fails.
  - While its read succeeds there is no line, and the list still reads "Nothing new since".
  - After the read fails, it asserts the grey line with the briefing's time, G1's red "Not read since HH:MM" line, where the lines sit, and the full grey look (`assertGrey`).
  - The pure `read: null` case is kept.
- **The new case fails on the old code:** I ran it against 4167c78 and it gave 0 pass, 1 fail, as the commit says.
- **My round-1 probe at 9fcc448** (`/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/probe/cantshow-r2.mjs`): the briefing says "Can't read Alpha since 10:02". The list says "Not read since 10:02", followed by "Alpha not read since 10:02, its lines may be missing". Before the read fails, it still reads "Nothing new since 18 Oct, 19:00" with no line.
- **G1's line changes in this state:** "Not read since" now shows in place of "Nothing new since". The commit message names this change. No locked G1 case covers the state, and the G1 files pass unchanged.

**Tests run at 9fcc448:**
- ac91-g7b-since-missing: 11 of 11 pass.
- ac54, ac56, ac80, ac82, ac87, ac89-after-md3, ac91-glance-home, j24-since, ac92-glance-palette and ac88-dark: 192 of 192 pass. ac88-dark includes the cascade want-list and the stage-8 guard with `G7B_ONCE`, which is unchanged.
- I did not run the full suite, as you asked. The Builder reports 1257 of 1257.

**Also:**
- surface_guard diff on 4167c78..9fcc448: OK, 1 commit.
- The commit is by builder <builder@agents.invalid>, with `Agent-Session:` and `Spec: S-001` trailers.
- It also corrects 1cbfa10's out-of-date `G7B_ONCE` note (round 1, note 3).

**Notes still open from round 1, none blocking:**
- Note 2: where a read succeeded in this opening but holds no time, the line says "in this opening" while the briefing says "Can't show". That state is probably unreachable.
- Note 4: the tab bar covers the missing line in the 360 px full-page captures. That is the capture tool's fixed bar, not the page.
- Note 5: the pull request's Tasks section was not checked, because no PR number was given.

The scratch worktree `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rv-g7b-r2` is still registered on /home/user/sd-g7b. I removed the temporary one I made at 4167c78.
