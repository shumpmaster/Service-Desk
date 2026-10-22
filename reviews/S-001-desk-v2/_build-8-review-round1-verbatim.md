# S-001 desk v2, stage 8 (into the desk): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-8 at ec715da.

---

Verdict: FAIL

One blocking finding. One CSS rule the Builder removed as unused is still in use. The Team screen's "Next" lines now mix two text sizes, which changes the design the owner picked "as built". The fix is one line. Everything else holds:
- The notification taps can't leave the desk's site.
- Old `?sandbox` addresses land on the same screen at `/`, with no reload loop.
- No "sandbox" or "trial view" words remain anywhere the owner sees.
- The experiment panels and AC17 and AC18's notes are kept.
- The frozen record of the old views is genuine.
- No test was dropped without its counterpart.

## Blocking findings

**B1. A removed rule is still drawn, so the owner's Team screen changes after the owner's pick.** Route: Build.
- **What was removed:** sandbox.css at bd4097d:361 had `.sb-unb-t { font: var(--t-meta) }`. Stage 8 removed it, and also took `.sb-unb-t.gap` out of the `.gap` list.
- **Where it is still drawn:** src/public/sandbox.js:2919 draws `sb-unb-t` on the owner's tile on the Team screen, for each "Next / Then / Later" line ("· unblocks: milestone not recorded" or "· unblocks MD3").
- **How I found it:** I drew every desk screen at ec715da (315 screens, from four fixtures). I cascaded them once with bd4097d's stylesheets and once with ec715da's, in light and dark.
  - The only difference anywhere was 16 nodes of `span.sb-unb-t.gap`, which went from `400 12px` to an inherited 13 px. They sit on the Team screens of text-fixture Alpha and md-extremes' Alpha, Beta, Gamma and Epsilon.
  - The words just before them on the same line ("· 3 h waiting") stay at 12 px. So one line now mixes 12 and 13 px.
  - The colour still holds, through the plain `.gap`.
- **Why it blocks:**
  - The owner's ruling (P-001-desk-v2-pick.md, A) is "mockup v2 as built (stages 1a to 7 …) becomes the owner's desk", and AC44 step 4 makes "the candidate step 3 recorded" the default view.
  - Stage 7 passed this line at 12 px (`--t-small`, AC81's role for secondary lines).
  - The commit says these were "the rules nothing draws any more", and for this rule that is not true.
- **Fix:** keep `.sb-unb-t { font: var(--t-meta); }`. No test catches this today. A guard would help, for example AC88's cascade checking font size per role.

I also listed every removed rule whose class names all still appear in the page's JavaScript, using the suite's own CSS parser. `.sb-unb-t` was the only one actually drawn. The other candidates (`.sb-btn.you`, `.sb-more > summary .sb-h2.flat`, `.sb-pband.plan`) never match, because the page never gives those class combinations.

## What I checked and found sound
1. **Notification path (R3: words.mjs).**
   - `openUrl` is `${deskUrl}/?open=${encodeURIComponent(key)}`, and `homeUrl` is `${deskUrl}/`.
   - **The service worker:** sw.js `safeAddress` still sends any address not on the desk's origin to the desk's root. On a tap it hands the address to the first open desk window, and navigates that window if it doesn't take it within a second.
   - **The page:** sandbox.js:4153 takes only the `open` key from the handed address and never navigates to it.
   - **Old addresses:** app.js `dropSandbox` uses only `history.replaceState`. That can't leave the origin; a cross-origin target throws and is caught. It doesn't reload, so it can't loop.
   - No secret appears anywhere new. The only "token" matches are usage figures in the record.
2. **`?sandbox` forwarding.**
   - `deskAddress` drops `sandbox` and `sandbox=…` and keeps the other parameters in order, and the hash.
   - Then the desk follows `open=` and drops it.
   - `?exp=` still opens the experiment panels.
   - Tests notify-ac74-desk:186-206 and notify-ac78-desk cover this, through app.js itself.
3. **What was removed.**
   - The accepted views went. AC36 ("Every view M1 and M2 built stays reachable") is met through the desk's own views. Hold and merge sheets now carry the whole record, as `fullText`.
   - AC17 and AC18's notes are on every answering sheet (`linkNotes`).
   - The EXP-001 and EXP-004 panels are kept, in app.js.
   - Across all 315 screens, the only changes from bd4097d are the marker removed and the whole-record fold added on hold sheets.
   - The manifest's `start_url` is "/", and `id` is still "/".
4. **Words the owner sees.** No string literal in src/public, src/lib or src/notify says "sandbox", "trial view", "candidate", "older view" or "new design". The tab title reads "Service Desk — <state>".
5. **The frozen fixture.** I ran tests/desk/tools/accepted-views-snapshot.mjs against an export of bd4097d's own accepted page. It rebuilt fixtures/accepted-views-bd4097d.json byte for byte. AC55's test compares the record both ways, as the live comparison did, so the record is sound.
6. **Tests.**
   - Across the 38 changed test files: 426 tests before and 426 after, and assertions went from 2,975 to 3,016. No file lost tests or assertions.
   - page-harness.mjs held no tests. It only loaded the accepted page, and every case that used it now drives the desk with a counterpart.
   - The rewritten guard tests keep their cited spec lines: ac48-62-63 (:173-226, :371-379), ac69 (:35-42), ac81 (:336-345), ac83 (:537-544), md-sandbox (:639-647) and ac55 (:402-470). page-app and notify-ac75 keep each case's criterion on the desk.
   - AC14's cases still run with A3's 9,817.
7. **Mutations: 16 of 19 caught** by the full suite and build:
   - the item tap or the Home tap back to `?sandbox`;
   - `start_url` back to `/?sandbox` (the build also fails);
   - forwarding that drops the hash, drops other parameters, or keeps `sandbox=1`;
   - app.js not putting the address right, or reloading instead;
   - the worker handing the tap to the wrong window, or letting it leave the origin;
   - the marker back on Home;
   - the decision card losing AC17 and AC18's notes, or the web-commit warning dropped;
   - the hold or merge sheet losing its whole record;
   - the tab title back to "Sandbox".

## Commands run
- Full suite: 1056 pass, 0 fail at ec715da, and 1056 pass at bd4097d.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . bd4097d`: "OK: all governance checks passed."
- `surface_guard.py diff --range bd4097d..ec715da --branch build/builder/desk-v2-8`: "OK: 2 commit(s) … checked".
- `review_check.py pr 999 --base bd4097d`: risk class R3, from src/notify/words.mjs. It flags "tests/desk/page-harness.mjs: test file deleted — needs the owner's verdict". Required: design-reviewer, owner and reviewer. Its only violations are the missing verdict files.
- Both commits are by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **New sheet code without tests.**
   - Mutation N13 (AC17 and AC18's notes removed from the gate sheet) was missed.
   - N19 (AC17's copy route removed from every sheet) was missed too.
   - I probed with `contentPrefill: false`: the copy route does render, on a decision card, a gate card and a question.
   - No page-level AC17 test existed at bd4097d either, so this is not a weakening. A test for the gate and question sheets, and for AC17's copy route, would guard this new code.
2. **The EXP-004 panel.**
   - It has no test (N17 was missed); it had none at bd4097d either.
   - Its words still say "Q4: on the Universe screen, record each box's CI field", and that screen is gone (app.js:50).
3. **The worker hands a tap to `desks[0]`.** If that window is an `?exp=001` panel, it won't take the handover and gets navigated away, ending a running experiment. That needs a desktop experiment tab open while a phone tap lands, so it is rare.
4. **index.html still has the old header and footer.** They are hidden once the desk starts, but they show for a moment while it loads. Also, app.js imports the desk with no `.catch`: if the desk's code fails to load, the page stays at "Checking…" with no error.
5. **Internal names keep "sandbox":** sandbox.js and sandbox.css, `startSandbox`, the `sb` class. The owner never sees them, so I read "the sandbox … removed" as the view and its flag, which are gone.
6. **Merge order.**
   - The owner's pick is still only on pull request #189.
   - bd4097d carries stage 6b, still in review as #190.
   - Both should land before or with this branch.
   - AC44 step 4 also needs the owner's approval of the preview deploy.

## Open questions
1. Owner: R3 and the deleted-helper flag need your verdict as well as the reviewers'. Do you accept the frozen record of the old views (reproduced byte for byte above) as the stand-in for drawing them?

The worktree and all copies are removed. My scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/: sandbox-dump2.mjs (the cascade with old vs new CSS), removed.mjs, mutate5.py and probe-copy.mjs.