# M3D stage 2 (S-001 after MD3): the Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-2 at a57ad0e.

---

Verdict: PASS

Stage 2 of the after-MD3 plan (M3D), commit a57ad0e on e19ae0a, reviewed over e19ae0a..a57ad0e. There are no blocking findings. What the owner types now survives a full reload, on that device only, and is dropped exactly when the spec says. The scroll comes back without fighting the owner. The "<n> more" sheet keeps its lines across a reload. Focus and Tab stay inside an open sheet, and a gate's sheet opened from Plan closes back to Plan. Four of my mutations were missed by the tests, though the code behaves correctly in each case; they are listed below as notes.

## Blocking findings
None.

## What I checked
1. **Privacy.**
   - The typed words live in their own store instance, under their own key, `desk-sheet-words-v1` (board.js; sandbox.js:4125-4126).
   - The only places that read them are `wordsBox`, `draftOf` and the copy route (sandbox.js:2234-2620). Those build the GitHub answer links the owner opens, as before.
   - No call to the desk's own function carries them, and nothing else stores them.
2. **Dropping.**
   - An emptied box: `setDraft` removes the words, and `saveDrafts` never stores an empty one.
   - Past 7 days: checked both when loading (`readDrafts`) and on each drawing.
   - The item no longer waiting: `draftsToDrop` drops words only for a project read successfully in this drawing, and never while that card's sheet is open (`openSheetCard`, Waiting or `work/card/…`). So a project not read yet, failing or stale keeps its words.
   - `boardOf`'s `projects` holds every project whatever the filter (sandbox.js:1733-1739), so a filtered Waiting can't drop other projects' words.
   - Storage refusing writes: caught. The words last for that window only, and nothing else changes.
3. **The scroll restore.**
   - It is kept on hidden or pagehide, and forgotten when the page comes back without a reload.
   - On load it is read and removed from storage at once, so it can't repeat across reloads.
   - It is put back only at the same address, and it ends at the owner's first pointerdown, wheel, touchstart or key, or within six drawings once every project has been read. So it can't fight the owner or loop.
4. **The "last looked" hold.**
   - `seen.hold()` is set on every drawing from the route, so it ends as soon as the "<n> more" sheet is gone.
   - While held, `hidden()` doesn't move "last looked", so the sheet comes back with its lines.
   - Holding only keeps more lines shown; it can never hide one.
5. **Plan's sheet address, `#/work/card/<id>`.**
   - This is new, and only Plan's gate row links there.
   - The `#/waiting/card/<id>` route and the notification taps (`/?open=<key>`) are unchanged.
   - A sheet is not a history step, and the sheet closes to `#/work`.
6. **The rewritten AC86 case** (ac86-plan:241-242) now expects the gate row's link to be `#/work/card/<id>`. That is AC89 (i)'s rule "a gate's sheet opened from Plan closes to Plan" (S-001.md:7902-7903). The rest of the case is unchanged.
7. **Stage 1's note is fixed:** `startDesk` now runs `console.error(err)` before showing its words.
8. **Mutations: 11 of 15 caught.**
   - Words dropped while their sheet is open.
   - No 7-day limit.
   - "Last looked" never held, or held for good.
   - No forget after coming back without a reload.
   - The scroll put back at another address.
   - Tab not kept in the sheet.
   - Plan's gate sheet closing to Waiting.
   - A reopened sheet taking no focus.
   - The words stored under the marks key.
   - D4 (an emptied box keeping its words) was "missed", but it doesn't change behaviour: `saveDrafts` already leaves empty words out. So it counts as caught.

## Commands run
- Full suite: 1082 pass, 0 fail.
- `node src/tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `bash governance/checks/check_all.sh . e19ae0a`: "OK: all governance checks passed."
- `surface_guard.py diff --range e19ae0a..a57ad0e --branch build/builder/m3d-2`: "OK: 1 commit(s) … checked".
- `review_check.py pr 999 --base e19ae0a`: risk class R1; needs design-reviewer and reviewer. Its only violations are the two missing verdict files, with no test-weakening flag. Only one test line was removed, the rewritten AC86 assertion.
- a57ad0e is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.

## Non-blocking notes
1. **No test holds the "can't be read" rule** (mutation D1 missed). Words typed for a project that can't be read are kept, but if `readOk` is removed, no test fails. That is the case where losing an answer would hurt most: a reload during a network outage. A reload-step case with the project failing would guard it.
2. **No test holds the scroll restore's end** (D7 missed). If the owner's touch, wheel or key no longer stopped it, no test would notice.
3. **No test holds removing the kept scroll after it is used** (D9 missed). Harmless today, because each hidden overwrites it and coming back forgets it.
4. **The restore's only bound is "every project read".** Before every project has been read once, the restore re-runs on each drawing. It still ends at the owner's own input, but scrolling that comes through none of those events, such as VoiceOver, could be pulled back once a poll until the first read completes. A time or drawing cap would bound it.
5. **A recorded answer's words are kept.** A question whose answer is being recorded counts as "present", so its words are kept until the answer merges. The spec drops them once the item no longer waits on the owner. This keeps them longer, which is the safe side: if the pull request closes unmerged, the words are still there. Define may want to say so. A held question has no box, so mutation D15 doesn't matter.

## Open questions
None.

The worktree and copies are removed. Other m3d2* entries remain in the scratchpad that I didn't make (m3d2, m3d2-base, m3d2-h, m3d2-sandbox.js, m3d2-wt); I left them alone. Disk is at 7.3 GB free. My mutation script is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev7-scripts/mutate9.py.