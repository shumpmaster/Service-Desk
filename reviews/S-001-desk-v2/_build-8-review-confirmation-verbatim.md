# S-001 desk v2, stage 8 (into the desk): the Reviewer's confirmation, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-8 at f634c86.

---

Verdict: PASS

Confirmation review of f634c86, on top of e3cb774, over the whole range bd4097d..f634c86. There are no blocking findings. Every screen now starts 14 px down, as in mockup v2. The web-commit note now has the eye mark. The guard's new exception lets through exactly that spacing change and nothing else.

## Blocking findings
None.

## What I checked
1. **What changed.**
   - sandbox.css:533-534 adds two rules:
     - `html.sb.v2-page main#view > .sb-screen { padding-top: 14px; }`
     - `html.sb.v2-page main#view > .v2-timeline > .v2-tlhead { margin-top: -14px; }`
   - sandbox.js:2158 changes the web-commit note's mark from `vi('bad')` to `vi('eye')`. That eye already exists (:1588) and is the blast-radius line's mark (:2296).
2. **Nothing else changed.** I drew every desk screen from the four fixtures at f634c86 and cascaded them with e3cb774's stylesheet and with f634c86's, in light and dark.
   - Words, fonts and colours: no change.
   - Layout changes are only these:
     - 160 `section.sb-screen` gain `padding-top: 14px` where there was none;
     - 128 `section.sb-screen.v2` go from `padding-top: 4px` to 14px;
     - 27 `section.sb-screen.sb-detail` gain 14px where there was none;
     - 7 `div.v2-tlhead` gain `margin-top: -14px`.
3. **The exception is exactly as narrow as the finding.**
   - It is `STAGE8_TOP` (ac88-dark.test.mjs:377-385). It lets through only:
     - a `.sb-screen` that is a direct child of `main#view`, with `padding-top` going from 4px or none to 14px;
     - a `.v2-tlhead` inside `.v2-timeline`, with `margin-top` going from none to -14px.
   - The guard also requires all three forms to occur.
   - All 10 mutations were caught by the guard:
     - the screen's top padding at 20px instead of 14px;
     - a bottom padding added to screens;
     - a top margin added to screens;
     - `.sb-hdr`'s padding changed (it is drawn on 1,464 nodes);
     - 14px top padding on a sheet;
     - 14px top padding on `.sb-tile`;
     - the Timeline head's margin at -10px;
     - a -14px margin on `.v2-phead` as well;
     - the Timeline head's padding changed;
     - both new rules removed, which trips the "exception was met" check.
4. **No test weakened.** The test diff only adds lines: the exception, the record of what was let through, and the check that it was met.

## Commands run
- Full suite: 1059 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . bd4097d`: "OK: all governance checks passed."
- `surface_guard.py diff --range bd4097d..f634c86 --branch build/builder/desk-v2-8`: "OK: 4 commit(s) … checked".
- `review_check.py pr 999 --base bd4097d`: risk class R3, still with the flag "page-harness.mjs: test file deleted — needs the owner's verdict". Required: design-reviewer, owner and reviewer. Its only violations are the missing verdict files.
- f634c86 is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **No test pins the note's mark.** The AC18 tests check the words and where the note sits, so the ✕ could come back unnoticed. That is minor.
2. **Still needed before merge:**
   - the owner's verdict, for R3 and the deleted-helper flag;
   - the owner's pick on #189;
   - the owner's approval of the preview deploy (AC44 step 4).

## Open questions
None.

The worktree and all copies are removed. My scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/ (mutate7.py, sandbox-dump2.mjs).