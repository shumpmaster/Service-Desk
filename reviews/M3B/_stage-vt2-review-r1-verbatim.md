# M3B stage VT2: the Reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-28 against build/builder/vt2 at 599b903 (VT2's work over e1ba0c6).

---

Verdict: PASS

I found no blocking findings. VT2's row is built and tested, apart from the two test gaps under N1. Nothing in the worktree was changed (`git status` is clean). I planted every bug in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/vt2copy`.

**Runs**
- **Full suite** (`npm --prefix src test`): 1523 run, 1523 pass, 0 fail. The test count went from 1486 at e1ba0c6 to 1507 on the branch: 20 new in the two ac25 files and 1 in ac88-dark. No test was removed.
- **`node src/tools/build.mjs`:** PASS (2 connected projects; 38 page modules in step). src/lib/metrics.js and src/public/lib/metrics.js are identical.
- **surface_guard:** OK, 5 commits checked. All are by `builder <builder@agents.invalid>`, each with `Spec: S-001` and `Agent-Session:` trailers and no AI co-author lines.
- **ac88-dark in its own process:** 13 pass. The heap peaked at about 1174 MB, sampled (RSS 1429 MB), against a 2096 MB limit.

**Planted bugs: 28 caught, 2 survived**
Caught:
- **Notes module:** keeping 9 weeks, marks never dropped, no Monday split, a first-shown time overwritten, marking an item that was never noted, noting with no window open, dropping windows by their end, times rounded to the second, `off` ignoring a failed write.
- **Page wiring:** no 15-second tick, no close on pagehide, no open on the visible event, no `readNow` check, every card noted rather than only counted ones, a portfolio card noted.
- **Placement:** no control on question and gate sheets, on "No longer waiting", on "being recorded", or on deploy sheets; the control above "Done ✓ · Close".
- **Behaviour and look:** the control shown while storage throws; "Not noted on this device" removed; the word "Undo"; a mark that also moves the card; `--you` colour; a 20 px height; no hairline; an 8 px→10 px padding change (caught by the stage-8 guard and by VT2_ONCE).

Survived:
- **M17:** src/public/sandbox.js:5234 given `tz: 'UTC'` instead of `TZ`.
- **M22:** src/public/sandbox.js:5235 calling `metrics.open()` even when the page loads hidden.

**The rewritten locked case (9af9e6e) is a real, forced rewrite.** I put the old filter back (without `|VT2 `) in the copy and ran it. "AC44 step 4 (stage 8…)" fails, listing VT2's declarations, e.g. `VT2 dark button.v2-dnmb … border-radius: 8px → 0`. The new filter lets through only declarations VT2_ONCE lists on the keyed elements; any other change still fails. VT2's own walk pins VT2_ONCE exactly. One caveat: the added line `[...excepted].filter(/^VT2 /).every(x => VT2_FLAT.includes(x))` (ac88-dark.test.mjs:2201) is always true, because `VT2_EXCEPT` only ever returns strings from VT2_FLAT. VT1's matching line (:2197) is the same.

**Join-up review (end of Build): the parts working together on the loaded page**
I walked the page on everyKind:
- **Every counted kind ends with "Didn't need me":** card, question, gate, hold, merge, pr, deploy and missing. Question and gate sheets end `[v2-foot]` then `[v2-dnm]`; the others end `[v2-acts] Done ✓Close` then `[v2-dnm]`. The same holds for the gate sheet over Plan (`#/work/card/…`) and on `#/waiting/Alpha/card/…`.
- **Portfolio card:** its sheet ends at "Done ✓Close", with no control and no note.
- **Main screens:** `#/`, `#/p/Alpha`, `#/waiting` and `#/work` carry no control outside a sheet.
- **Notes:** all 8 kinds are noted under their AC73 keys (e.g. `Gamma|missing-card|status/P-001.toml`).
- **Storage throwing:** the targets' sheet adds "Not noted on this device" as its third part. Nothing else on the sheet or on Home changes.

No difference is blocking. N1 to N4 below are carried as risks.

**Non-blocking findings**
- **N1. Two criteria are tested only in the pure module, not on the page.**
  - M17: the page could split windows at Monday 00:00 UTC (and drop weeks by UTC edges) and every test still passes. The Chicago split is checked only in ac25-metrics.test.mjs:101, with the zone passed in directly.
  - M22: a page loaded in a background tab would open a window and could note first-shown times while hidden. That would make V1's first-shown times early. No test loads the page hidden.
  - The code is right in both places today; both gaps need a test.
- **N2. Items still waiting after 8 weeks lose their first-shown time and their mark (your question 3).** At src/lib/metrics.js:84-91, first-shown times and marks are dropped by their own time. So an item still waiting about 9 weeks later is noted again with a new time. Its mark is dropped too, so its sheet goes back from "Marked as not needing you · Unmark" to "Didn't need me". Reproduced: noted and marked on 2026-10-07; on 2026-12-09, `hasShown` is false and `marked` is false, and it is re-noted at 2026-12-09T15:00Z. The spec supports both "kept once per AC73 key; keeps its first time" and "each week's notes kept 8 weeks… dropped". The build follows dropping, which is defensible but untested. It needs a ruling before VT3 writes week files from these notes.
- **N3. Some confirming and kicked-back combinations are neither tested nor in the capture list.** The row asks for "a card's, a question's and a gate's sheet … unmarked and marked, confirming and kicked back". There is no test or capture of a gate's confirming or kicked-back sheet, nor a question's kicked-back sheet. The code path is shared, which lowers the risk. The `vt2-` captures in docs/design/builds/m3b-vt2/ do not exist yet; as with VT1 (b1800ff), they are the Orchestrator's job for the pull request.
- **N4. The page has no `pageshow` handler** (src/public/sandbox.js:5512-5529). Windows reopen only on `visibilitychange`. Restoring from the back-forward cache should fire it, as the HTML spec requires. A browser that does not would lose every window and note until the next visible event.

**Your four spec points, read as a spec reader**
1. **Placement:** AC25 as changed, the VT2 row and reading (k) all say "the sheet's last line". Draft 3's note says the place "above 'Done ✓ · Close'" was "replaced in draft 3". So the build-plan entry (specs/S-001.md:21297) is stale and the build is right. That line should be corrected in the spec.
2. **Wording:** the VT2 row is the stage's own criterion and quotes "Not noted on this device", so it wins. J5's base storage line (S-001.md:14141, "metrics not recorded on this device") was not reworded in its M3B note and should be made to match.
3. **Re-noting:** see N2. The spec is unclear and needs a ruling.
4. **Seconds vs milliseconds:** storing milliseconds keeps more than the second and rounds nothing, so it meets "kept to the second, never rounded". VT3 should truncate to the second when it writes the file, never round. A test should hold it to that.

**Questions**
- Who rules on N2, and when: before VT3 opens?
- Should N1's two page tests (a page loaded hidden, and the Monday split through the page in Chicago) be added in this pull request's next round, or carried?
