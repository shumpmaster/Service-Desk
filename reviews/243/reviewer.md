Verdict: PASS

The Reviewer's verdicts on G9c (PR #243), verbatim: round 1 at dca5e9d (FAIL), round 2 at 1b8b472 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: FAIL

The source does what the seven rulings ask, and the suite passes. I'm failing the stage on two cases the row requires: each looks locked, but a plant in the shipped code survives the whole suite (1365 of 1365 still pass).

**Blocking findings**

B1. Nothing pins the signed-out line "at the top" of the quiet lines.
- The rulings require it (P-001-glance-waiting-signed-out.md, A: "at the top of Waiting's quiet lines"), and so do AC91 (c) at specs/S-001.md:9575 ("above "With the agents"") and :9600 ("the other quiet lines keep their places under it"). The row asks for a screen case with "the other quiet lines as built under it", each "asserting the quiet lines' words and order exactly".
- tests/desk/ac91-g9c-quiet-lines.test.mjs:510 checks `all[0] === SO`. But in all three signed-out states the quiet lines are only `[["ql:signed-out", …]]` (I probed them), so that check proves nothing about order.
- The test at :529 claims "the other quiet lines as built under it" in its title. After the sign-out its lines are `[SO, R, RP]`, with no other quiet line present.
- How I reproduced it: I moved `if (bd.signedOutLine) lines.push(…)` (src/public/sandbox.js:2553) below the "With the agents" and "Nothing waiting" lines. The full suite still passed 1365 of 1365.
- Needed: a signed-out screen case where another quiet line (Nothing waiting, With the agents or Being asked) is still drawn, asserting the whole list.

B2. "States 3 to 5 never get a 'Still reading' line" is locked only on the test's own copy of `readOf`.
- AC91 (c), specs/S-001.md:9515, says "A project read earlier in this opening (states 3 to 5) never gets one". The row asks for "a project in state 3 and one in state 4, none".
- The pure case (tests/desk/ac91-g9c-quiet-lines.test.mjs:63-70, :130-133) feeds `boardView` from a copy of the derivation written in the test. The code that ships derives `onWay` in sandbox.js:1963 (`!readInOpening(name)`), and no case covers it in state 4.
- How I reproduced it: I changed sandbox.js:1963 to `r.read !== 'ok'`, so a project re-reading in state 4 gets "Still reading <project>…". The full suite still passed 1365 of 1365.
- Needed: a Waiting screen case, every project shown, with a project in state 4. One way is the "older" setup at :598-604, where the made-up project is read once and then its re-reads are held, opened on '#/waiting'.

**Checked and confirmed**
- **Full suite:** `npm --prefix src test` at dca5e9d gives 1365 of 1365 passing (about 7.5 minutes).
- **surface_guard:** "OK: 11 commit(s) in 55cff67..dca5e9d checked".
- **Identity and trailers:** all 11 commits are authored `builder <builder@agents.invalid>`, each with `Agent-Session: session_017seyaGqUxAff6E8dKWHDCR` and `Spec: S-001`. None has a co-author line. The committer is "Claude <noreply@anthropic.com>", the same as the Definer's and orchestrator's commits on the base.
- **Rewrites forced:** I ran the 55cff67 versions of ac91-g8d.test.mjs and ac91-g9b-checking-line.test.mjs on the new source. Exactly the four rewritten cases fail:
  - g8d:317, signed-out quiet lines;
  - g8d:493/500, G8D_OPENS, whose text now holds "Signed out — reload to sign in" and no "Can't read Service-Desk in this opening";
  - g8d:638, the can't-draw project signed out;
  - g9b:366, which wanted 'checking…' and got 'checked 0 s ago'.
- **None weakened:** each keeps its one-project, page and Pipeline parts. 6f99ead adds a per-project "in this opening" check above the lanes.
- **582f5b2, the rewrite the row did not name:** it is forced by the same signed-out rulings and changes only the signed-out branch. The row's "no other expected" missed it; that miss is the Definer's.
- **New cases fail on 55cff67:**
  - The new file fails to import there (`READING_WORDS` is missing).
  - With the pure imports stubbed out, 18 of its 22 tests fail. The 4 that pass are the "as built / unchanged" ones (:397, :479, :619, :649), as they should.
  - The new G9c walk in ac88-dark fails on the old source.
- **Edits outside the row's named places are in scope:**
  - home.js and its public copy: the head now uses `SIGNED_OUT_STATE.text`, which the row requires.
  - projectpage.js: `pageCheckedWords`, the row's pure function, plus its copy.
  - 4a3d56c, fake-desk `blobHold`, glance-shots.
  - The src/lib and src/public/lib copies are byte-identical.
- **ac88-dark heap:** peak heapUsed (sampled every 50 ms) is 1151 MB of 2096 MB, against 1051 MB at 55cff67, an increase of about 100 MB. The new file peaks at 124 MB.
- **Fixtures labelled NOT real:** tests/desk/fixtures/README.md:1017-1050 covers every made-up part the row lists.
- **Captures:** all 5 `g9c-` shots are produced in light and dark at both sizes. None is cut; each line takes one line.

**Builder's issue 2 (the portfolio line sticking): not a G9c defect, and the spec settles it**
- With the real reader, a project's read can't "never answer". Every call goes through `callFunction`, which aborts after 30 s (scheduler.js:1604-1624, wired at sandbox.js:4686 and app.js:111). So each project cycle ends, and `pfTurn()` (scheduler.js:1392) asks the portfolio, which arms `pfAbandon` (:372).
- Only the test's `hold` reaches the stuck state.
- What's left is J23's existing queueing: the portfolio waits while any project's poll is under way or due (scheduler.js:304, :319, :335). In theory, long staggered cycles could starve it.
- Even then its state is `pending` (portfolio.js:347). AC91 (c) defines "on its way" as exactly that state, so the line is what the spec says to show. The spec bounds only a read that was asked (`pfAbandon`).

**Non-blocking findings**
- N1. Builder's issue 1 is confirmed. At 360 px, "Still reading Alpha…" and "Still reading the portfolio…" share a row, separated only by the 10 px gap (`.v2-quiet` is flex-wrap, sandbox.css:576). Grey lines have no icon, so the two can read as one line naming two things, which P-001-glance-g9c-several.md, A rules out. Built as the spec says (`p.v2-ql`, no CSS change), so this is for the Design reviewer. Capture: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/g9c-waiting-first-paint-360x740-light.png
- N2. Several screen cases filter the quiet lines instead of asserting them whole (:371, :374, :720), and :500 asserts only `all[0]`. The row says "exactly". Today's whole lists match, but the filters would hide a stray line.
- N3. A stale comment: src/lib/home.js:54 (and its public copy) still cites "sandbox.js `checkedWords`", which no longer exists.

**Open questions**
- Q1. J23: should a portfolio read still waiting its turn after 5 minutes count as failed, like `pfAbandon`? This belongs to J23, not G9c.
- Q2. Should the row's "no other expected" list be corrected to name ac91-g8d.test.mjs:500 (582f5b2)?

All scratch worktrees are removed. /home/user/sd-g9c is clean at dca5e9d.

## Round 2
Verdict: PASS

G9c round 2 at 1b8b472 passes. B1, B2 and N2 from round 1 are closed: each planted bug now fails its own new case. The full suite passes 1368 of 1368 (run in a scratch worktree).

**Blocking findings**
None.

**Round-1 findings, re-checked by re-planting each bug and running the G9c file, ac91-g8d, ac91-g9b-checking-line and ac88-dark**
- **B1 is closed.**
  - Planted bug: I moved `if (bd.signedOutLine) lines.push(…)` below the "Nothing waiting" line.
  - Result: exactly one case fails, the new `agentsState` case in tests/desk/ac91-g9c-quiet-lines.test.mjs, which asserts `[SO, AGENTS]` whole.
- **B2 is closed.**
  - Planted bug: I changed sandbox.js `readOf`'s `onWay` to `r.read !== 'ok'`.
  - Result: exactly one case fails, the new screen case for states 3 and 4. It uses the page's own `readOf` and checks `readState` reads `checking` with a success in this opening.
- **N2 is closed.** The cases that used to filter now assert whole lists: the two-held, `hang`, portfolio, recording, three-state signed-out and G9C_OPENS cases.
- **N3 is closed** (b92720e).
- **Q2 is answered** by b32363e.

**The own-row change matches AC91 (c)'s new bullet and the row**
- `.v2-qread { flex-basis: 100%; }` is at sandbox.css:582. It applies only to grey read lines, a project's and the portfolio's. The signed-out, can't-read, can't-show and portfolio red lines don't get it.
- The cascade case `runsOf` covers each "Still reading" line after a red line, after another "Still reading" line, before the portfolio's line and before "Being recorded…". It also shows "With the agents" sharing a row with "Nothing waiting" and the red lines sharing rows. It checks 360 and 414 px, light and dark.
- I ran the capture tool's g9c- measurements in Chromium: all 7 Waiting states at both sizes and both themes print "rows: ok", and it exits 0.
  - Each "Still reading" line is the box's full width (328/328 px and 382/382 px), and the next line starts below it.
  - Nothing is cut and nothing scrolls sideways.
  - "With the agents: 1" sits beside "Nothing waiting: Alpha".
- Planted bug: I dropped `v2-qread` from the line.
  - The own-row case fails, and so does the G9c walk in ac88-dark.
  - The capture tool exits 1, for example: "Still reading the portfolio…" shares a row with "Still reading Alpha…".

**G9C_ONCE is exact**
- Planted `margin-top: 2px` on `.v2-qread`: the guard fails with "v2-qread: margin-top: (none) → 2px" in the G9b walk and the G9c walk.
- Planted a wider selector, `.v2-qread, .v2-quiet > .v2-ql.still`:
  - It fails the stage-8 test, the G9b walk, the G9c walk and the own-row case.
  - The flex-basis that leaks onto other quiet lines is not excepted.

**6726d56 was forced, and the row should name it as found in the build**
- I ran ac88-dark as it stood at 9980f85, before 6726d56, on the round-2 source.
- Only the G9b walk fails, at "no exception met that the walks above had not met: no G9B_ONCE". The cause: G9B_OPENS's `failedHeldState` Waiting screen now draws the line with `flex-basis: 100%`.
- The rewrite is not weaker: it still checks every other exception, and each `G9C` entry must be the one pinned declaration.
- 9980f85 also edits the stage-8 test's allow-list. That follows the precedent of G8c (366ad4e) and G9 (ff06012), which registered their ONCE in the same place.

**Other checks**
- **surface_guard:**
  - Builder-only ranges pass: `--range 466076e..9c4a8ab` gives "OK: 7 commit(s)", and `55cff67..dca5e9d` gives "OK: 11 commit(s)".
  - The plain range 55cff67..1b8b472 fails only on the merged-in commits 8a12ccc and cad8594 (chief-of-staff) and 883c3d4 and b32363e (definer).
  - I checked each of the 18 entries in the Builder's mine.json against git: sha, author, parents, message and paths all match.
- **Identity and trailers:** all 7 new commits are by `builder <builder@agents.invalid>`, with `Agent-Session: session_017seyaGqUxAff6E8dKWHDCR` and `Spec: S-001`, and no co-author lines.
- **ac88-dark heap:** peaks at 1126 MB of the 2096 MB limit, sampling heapUsed.
- **Fixtures:** `agentsState`, `recordingState`/`RECORDING_NOW` and the state-4 read are labelled NOT real in tests/desk/fixtures/README.md:1044-1053 and in glance-fixtures.mjs.

**Non-blocking findings**
- N1. G9c's row and build-plan line name only ac91-g8d.test.mjs:500 as found in the build. They should also name tests/desk/ac88-dark.test.mjs's G9b walk (6726d56), which the own-row ruling forced. This is the Definer's to add.
- N2. The plain-range surface_guard run fails on Definer and Chief of Staff commits merged into `build/builder/g9c`. It's only a process artifact, but whoever runs the guard before merging should use the builder-only ranges above or `--commits-from`.

**Open questions**
- Q1, carried from round 1: should J23 count a portfolio read still waiting its turn after 5 minutes as failed? That is J23's question, not G9c's.

All scratch worktrees are removed, and /home/user/sd-g9c is clean at 1b8b472. The round-2 captures are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots2/
