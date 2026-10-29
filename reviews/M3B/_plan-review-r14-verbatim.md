# M3B plan: the Reviewer's round 14 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/definer/m3b-plan at 17746e9 (the plan, draft 13).

---

Verdict: PASS

This is round 14 of the plan review: draft 13, at 17746e9 on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only on the diff from 55a2484, and checked it against VT3's code on build/builder/vt3 in /home/user/sd-vt3 at 99154a5. Each reading is sound against AC25, J5, J7 and V5's line, VT3's row locks each one, and nothing regressed.

**The readings**
- **The offer waits for the reads:** the week's file carries V5's weekly median. Offering only once every v3 project's records and the dispatch log are read means a saved file never holds "not available until … has been read".
  - The build does exactly this: `weeklyNow`, sandbox.js:1628-1645, returns null unless each v3 project has `readOk` and `logLoaded`.
  - A week older than the dispatch-log months J2 reads gets a fixed "not available: the dispatch log months the desk reads no longer cover this week". That is honest, and consistent with V5's log-gone case in AC97.
- **A truncated portfolio tree counts as unread:** this matches portfolio.js:361's treatment of a truncated tree, and the build reads `snap.truncated` as no tree. Without a whole tree the desk can't tell a saved week from an unsaved one, so offering nothing is right.
- **J7's two keys:** `src/lib/configcheck.js` refuses any key in `portfolio` other than `repo` and `defaultBranch`. So `contentPrefill: false` and `webCommitsToDefault: false` can't reach the page's portfolio link, and testing them in the link builder's module is the only reachable place. AC17's Copy past `linkCap` stays tested on the page.
- **"One line a day":**
  - Splitting a window at midnight UTC, the first part ending `24:00:00`, keeps J5's one line per UTC day.
  - A zero-length window contains no time, so leaving it out loses nothing V1 counts.
  - A sub-second window kept as `13:02:11-13:02:11` keeps the evidence that the desk was open.
- **Every week saved:** the block and its "8 weeks" sentence go, matching Home's line, which already goes once the files land.
- **Landing and chevron:** landing with the whole block in view, and Home's chevron in `--ink2`, are both as the approved picture draws them.

**VT3's row locks each change:** the waits, the truncated tree, the split windows, the block gone once every week is saved, the J7 module cases, the landing at 360 and 414 px with one week and eight, and the `--ink2` chevron.

**Checks run.** `surface_guard diff --range 55a2484..17746e9` is OK. v3_checks trace, joins and ready, and spec_check status, are all OK. The working tree is clean.

**The sheet opening part-way with its close out of view.** I agree with your reading, with one condition.
- AC56 asks for "a visible close control at its top", plus closing on a tap outside and on Escape. The control stays at the sheet's top; any scrolled sheet already hides it, since the head scrolls with the content.
- The owner's approved frames draw this landing.
- The condition: the owner's note 9 was "no easy way to just close out the pop up". On a phone there is no Escape key, so on landing the only close is a tap outside. Your reading holds as long as some area outside the sheet is still visible to tap at 360 × 740 when the sheet lands.
  - The Design reviewer verified that a tap outside closes the sheet, but not that such an area is on screen at the landing.
  - VT3's design re-review should confirm it, or the head's close should stay pinned.

**Non-blocking findings (risks)**

N1. The offer is withheld silently.
- If one connected v3 project stays "can't read", or the portfolio tree is truncated, neither the line nor the block shows, and no word says why.
- Notes are kept 8 weeks, so a long outage could drop a week before it is saved, losing V1 and V2 evidence for that device.
- The can't-read state already shows elsewhere on the desk, so this isn't blocking. One quiet line in the sheet's block, such as "Weekly figures wait for <project>'s read", would make the wait visible.

**Open questions**
None.
