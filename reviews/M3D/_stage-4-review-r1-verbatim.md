# M3D stage 4 (S-001 after MD3): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-4 at acbb392.

---

Verdict: FAIL

Stage 4 of the after-MD3 plan (M3D), commit acbb392 on 7f01fd5, reviewed over 7f01fd5..acbb392. The work itself is right:
- **Team screen:** idle members fold into "<n> idle ›" and the key is gone.
- **Lanes:** each takes the first look no lane open where it starts is using, and the old turn-taking is gone.
- **Chief of Staff's log:** each helper and end row names its own piece.

It fails on one point the brief asks the Reviewer to check. The stage-8 guard's new exception lets through any value of its listed properties, not just this stage's values, so it is wider than the change.

## Blocking findings

**B1. The stage-8 guard exception is wider than the change.** Route: Build.
- **Where:** tests/desk/ac88-dark.test.mjs:415-431, `M3D4_PROPS` / `M3D4_EXCEPT`.
- **The rule it breaks:** the brief's after-MD3 rule (specs/S-001.md:15549-15553) asks for an exception "for exactly what it changes", and says "the Reviewer checks the exception is no wider than the change".
- **What it does:** it passes any value of 11 properties on `button.sb-idle`, 2 on `div.sb-idlelist` and 6 on `span.sb-brow-of`. That covers display, min-height, margin-top, font, color, max-height and the rest. Stages 1 and 3 pinned each declaration's exact value.
- **Evidence:**
  - With the idle line's `min-height` cut from 44px to 20px (`.sb-idle`, sandbox.css:285), every test still passes: the guard, AC67/AC90's test, AC49's and AC69's (mutation G1). That would break the 44 px control the CSS comment promises.
  - Changing its font from `--t-meta` to `--t-body` also passes everything (G6).
  - A vermilion colour is caught, but by AC69's test, not the guard (G2).
- **Fix:** pin each excepted declaration's value, as `M3D1_WAITS` and `M3D3_ONCE` do. Then check that each one is met, and that nothing else is let through.

## What I checked and found sound
1. **The idle fold (AC67, changed by P-001-audit-team, B).**
   - The list is exactly the members whose word is "Idle". Everyone else stays a card, after the owner's tile: working, just finished, waiting on the owner, not recorded.
   - The line reads "<n> idle ›", with none drawn when no one is idle, and it opens in place.
   - The key is gone.
   - On all 9 Team screens, "Who has the ball" is unchanged. On member pages, no words changed; only the lane drawings did.
   - The device key `desk-team-idle-v1` holds only `{ <project name>: true|false }`, nothing sensitive.
2. **AC90's Team part.** Where two or more cards share "not recorded in what the desk reads", it is said once at the head of the cards or of the opened idle list: "<k> of <n> members · last work …", or "<n> members · …". Those cards drop it. The count is right: the AC66/67 case gives "5 of 10 members".
3. **The lane rule (AC49, changed).**
   - `branchLayout` (lib/sandbox.js:1472-1483) takes lanes oldest first. So any lane already given a look started at or before this one, and the overlap test reduces to "still open where this lane starts", with the one-row gap.
   - With all four looks in use, a fifth lane takes look 0, `--ink` solid.
   - The turn-taking line, `shade++ % 4`, is gone.
4. **Piece names on the Chief of Staff's log.** Helper and end rows carry `of: x.start.doing`, their own piece's words, and orphan rows carry none. A row is cut at one line, with its fade checked by AC88 (ac88-dark:163). Its summary sheet shows the row whole, with the piece.
5. **Rewritten tests.**
   - AC49's branch log, AC66/67's two cases, AC69's walker, J13's three cases, md-sandbox's Team case, screen-text's route finder and the AC88 lanes test now open the idle fold before reading every card. That only lets them reach every member; what each proves is unchanged.
   - The fold's own behaviour is proved separately, in ac67-90-team-after-md3: absent until tapped, its count, kept after a reload, no line with none idle.
   - The key assertions are replaced by "no key", as the ruling says.
   - AC88's `fourLanes ≥ 4` becomes `≥ ways.length`, met by the made-up four-open log, because the fixtures' logs now open at most three lanes together. That is honest.
6. **Mutations: 18 of 22 caught.**
   - On the lanes and piece names (all 8):
     - turn-taking back;
     - a fifth lane taking the last look;
     - no one-row gap;
     - the newest lanes taken first;
     - a helper row naming no piece;
     - an end row naming another piece;
     - the sheet without the piece;
     - the cut removed.
   - On the fold and the guard:
     - the idle count off by one;
     - idle cards shown while folded;
     - the fold not kept on the device;
     - the key back;
     - the head count taken from the list size;
     - the line shown with no one idle;
     - the piece cut at three lines;
     - vermilion on the idle line;
     - a new padding on the idle line;
     - the cards restyled.
   - Missed: G1 and G6 (B1 above), I1 and I6 (notes 1 and 2).

## Commands run
- Full suite: 1097 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . 7f01fd5`: "OK: all governance checks passed."
- `surface_guard.py diff --range 7f01fd5..acbb392 --branch build/builder/m3d-4`: "OK: 1 commit(s) … checked".
- `review_check.py pr 999 --base 7f01fd5`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files, with no test-weakening flag.
- acbb392 is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **No fixture has a "Just finished" member** (mutation I1 missed). If "Just finished" members were folded with the idle ones, no test would fail. The code is right today. A fixture with such a member would hold AC67's "stay as cards".
2. **No case has a lone shared reason** (I6 missed). If a reason only one card has were moved to the head, no test would fail. This is the same gap as stage 3's on Home.
3. **"<k> of <n> members"** is the Builder's reading, as on Home in stage 3. AC90's "Where" gives only "<k> members · …".

## Open questions
None.

The worktrees and copies are removed. One other entry remains in the scratchpad, m3d4, which I didn't make; I left it alone. Disk is at 7.1 GB free. My mutation script is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/mutate11.py.