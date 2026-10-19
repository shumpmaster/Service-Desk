# Build review (Reviewer), round 2, of M3A Work ahead at 077f1b4 (verbatim)

Verdict: PASS

Round 2 of the Work ahead build review at 077f1b4 passes: A is fixed exactly as AC60 now says, B to H are fixed, nothing regressed, and the spec at 077f1b4 and the code agree. Two non-blocking notes remain (K and L below), and nothing needs to go back to anyone.

**Re-run:** build PASS (26 page modules in step); `npm test` 725 of 725 pass. I did not re-run check_all.

For the owner:
- A rough-estimate pull request now stays off the Timeline only when its `Milestone:` line is exactly `none (a rough estimate)`. Stray spaces inside the brackets, or a capital letter, put it back on the Timeline like any other pull request.
- When the plan you just recorded lands, your draft now clears with no notice. The "set aside" notice shows only when a different plan lands.
- Before you move a row, the screen says "No changes yet".
- "Record plan" stays off, with "Record plan is off until your milestones are read", until everything is read and at least one milestone shows. It can no longer record an empty plan over yours.
- When a link can't carry the whole plan or ask, the screen now says why, shows the text and gives a Copy button.

**A. Fixed: AC60's exact match (Builder's a3f2805).**
- What changed: src/lib/pulls.js:110-117 adds `milestoneLineValue`, which trims the whole value and nothing inside it. `estimateLine` is `=== 'none (a rough estimate)'`, worked out when the pull request is kept. src/lib/feed.js:342-346 now needs `estimate === true && estimateLine === true` on the planning project.
- Probe results:
  - `none (a rough estimate)` → true;
  - `   none (a rough estimate)   ` → true;
  - `Milestone:none (a rough estimate)` → true;
  - a trailing `\r` → true;
  - `none ( a rough estimate)` → false;
  - `none (a rough estimate )` → false;
  - `none (A rough estimate)` → false;
  - `none  (a rough estimate)` → false;
  - a trailing `.` → false;
  - a first `Milestone: MD3` line → false.
- The kept entry holds only the yes or no, never the line. An entry without `estimateLine` reads as no. The key stays `desk-pulls-v3`, as J12's draft-6 text says.

**B. Fixed: "Record plan" off until the reads are in (workview.js:235-237).**
- Probes:
  - docs/PROJECT.md unread: "Record plan is off until your milestones are read", with no link;
  - the current plan unread: the same words;
  - no `planning: true` entry: "Can't record plans…", judged first, as the spec says;
  - all milestones reached: the same "off" words.
- In the page, the button is disabled and the words show (360-r1-record-off-unread.png).

**C. Fixed: draft cleared quietly when your own plan lands (workview.js:161-168, sandbox.js:2145).**
- Page-harness probe: after recording your own draft, there is no notice, "Current plan recorded 18 Oct, 13:01" shows, and the draft key is gone.
- A plan in another order gives the notice, and the next move clears it.

**D. Fixed: "No changes yet" before a move (workview.js:220-227).**
- The state line reads "No changes yet" with no plan, with a plan that can't be read and with a plan not yet read. "No plan recorded yet" still heads the order.
- "Draft not recorded · your changes are on this phone only" shows only after a move.

**E and F. Fixed: the copy fallback (workview.js:66-82, sandbox.js:2088-2112 and 2175).**
- The words name the cause and match draft 6: "Too long for a link…; copy the plan below, then paste it there" and "This repository doesn't take prefilled content…".
- The text and "Copy the plan" or "Copy the ask" show below the bar, so the sticky bar stays one line high (360-r1-record-copy-too-long-foot.png, 414-r1-record-copy-no-prefill-foot.png).

**G. Fixed: impossible dates in estimates (workahead.js:206-210).**
- Malformed: 2026-02-30, 24:00, :60 and 2027-02-29.
- Still read: 2028-02-29, `+00:00` and fractions of a second.

**H. Fixed: the Home control.** It is one text node, "Work ahead ›", with its space (414-r1-home.png). AC62's "every word kept" exceptions now name it, which matches screen-text.mjs.

**Tests:** no test was weakened. The only removed expectation is the old "Draft not recorded · no plan recorded yet", replaced as the D ruling says. Each of A, B, C, D, E/F, G and H has a test, and the kept-key lists add `estimateLine`.

**Screenshots:** the r1 shots at 360 and 414, light and dark, show the fixes as described. Nothing scrolls sideways. The bar showing mid-page in the full-page shots is the sticky bar captured in a full-page image.

**Notes, non-blocking:**
- **K (Definer).** Draft 6 names the "Too long for a link…" words for the plan only. For J15's ask, the code says "…copy the ask below…". This matches AC17's form, and today's asks are about 150 characters against the 6000 cap, so it can't show yet. Worth one line in the spec's list of words the mockup does not draw.
- **L (Builder).** `WA.draft` ("Draft · not recorded", workahead.js:53) is no longer used. It is harmless, but could be removed.

**Open questions:** none.

Probe scripts (scratch only, nothing in the repo changed): /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probe/r2a.mjs and /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probe/r2b.test.mjs.
