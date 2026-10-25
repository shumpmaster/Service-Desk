# M3E stage G9c: the Reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9c at 1b8b472 (G9c's work over 55cff67).

---

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
