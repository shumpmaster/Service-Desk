# S-001 after MD3: the plan Reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/definer/s001-after-md3 at da6bab2.

---

Verdict: FAIL

Draft 2 fixes everything from round 1, and the owner's four answers are written in as they read. It fails on one point. The new five-state table for one unreadable project (AC89 (a)) describes when the board's counts read "checking…" differently from how main works, while saying "as stage 1a built". Built as written, the counts would flash "checking…" during the routine poll every minute. The rest are small notes.

**Checks (worktree /home/user/sd-def-md3-after, da6bab2)**
- `bash governance/checks/check_all.sh . origin/main`: 24 PASS and 1 FAIL, the trace check: "specs/S-001.md names M3D, not in docs/PROJECT.md section 3 (model S-023 AC5)". This is expected until #202 merges.
- Judged against #202: in a detached scratch worktree I merged da6bab2 into `cos/after-md3-answers` (clean merge). There, check_all reports "OK: all governance checks passed." The scratch worktree is removed.
- `python3 governance/checks/surface_guard.py diff --range origin/main..da6bab2 --branch build/definer/s001-after-md3`: "OK: 3 commit(s) … checked" (exit 0).

## Blocking finding

**R2-B1. AC89 (a)'s table sets its fourth state off the wrong event, and its "HH:MM" rule misses the 3-minute cause.**
- The table's fourth row is "read, and a new read is asked and not yet answered … the quiet lines, their two counts reading 'checking…' (as stage 1a built)". Main does not work that way:
  - main shows "checking…" counts only when the project's read state is `checking` (src/public/sandbox.js:1748-1750 and :2070-2076);
  - that state comes from `readState` (src/lib/universe.js:13-31), which is about freshness: no success within 3 minutes of being in view, or reads still arriving across cycles;
  - during a routine 60-second poll the last success is under 3 minutes old, so the state is `ok` and the counts show numbers.
- So rows 3 and 4 overlap on every poll. A Builder following the table would make the counts blink to "checking…" once a minute.
- Fix: define row 4 as main's state, read in this opening but not fresh, for example back in view after a while. A routine poll in flight stays row 3.
- The "HH:MM" rule ("the time of the first failure since the last success") covers failed reads only. For the 3-minute cause there is no failure: main gives the last success, or the opening's start (universe.js:19-20, :26-28). The rule should say which time that case uses.
- Everything else in the table is something main can tell apart:
  - `lastSuccessAt` against `openedAt`, which is set once at load and matches Terms' "an opening";
  - `failure.since`;
  - `visibleSince`, so out-of-view time doesn't count, as the note says.
- Route: Definer.

## Round 1 findings and notes: all resolved
- **B1:** AC69 now says the owner tile's edge is `--tie`/`--line2` and the waits rows' edge is `--ink`. Both are right (src/public/sandbox.css:278, :515, :236).
- **B2:** Risks now gives 48 a day on A3's 9,952 (spec :14693-14697), and the opening paragraph tells the owner.
- **Notes 1 to 10:**
  - question 1's reason is corrected, as recorded in P-001-agent-status-hide;
  - AC90's Team part has moved to stage 4;
  - stage 6 is split into 6a and 6b;
  - the item-30 fixtures sit in stages 4 and 6a;
  - the `defaultLabel` closure is now cited to `defaultLetter`;
  - CS27 cites Personal-Org-Operating-Model's workflows at 5dc43c2, and I confirmed that list;
  - AC44 step 4 cites reviews/192/;
  - the counts and wording are fixed, and the audit's "three plus (g)" is right.

## The other things you asked me to check
- **The lane rule** can be built and tested:
  - it is the same "lowest free, one-row gap" search `branchLayout` already does for places across (src/lib/sandbox.js:1434-1450). With at most four lanes open together, the look is the place minus one, so only line 1450 changes;
  - I put a counter into `branchLayout` in a scratch copy and ran ac88-dark and ac49. Across the fixtures: at most 11 lanes on one log, at most 3 open together, and today's turn-taking gives no clash. The spec's figures hold;
  - the colour distances recompute exactly: `--ink`/`--ink2` 23.0 light, 18.1 dark; `--ink2`/`--ink3` 5.3 light, 2.5 dark.
- **A3 and the cap:**
  - 9,817 + 125 + 10 = 9,952, which leaves 48 under 10,000;
  - with a second device's 10 more, 9,962.
- **Stages 6a and 6b:** 6b (AC89 (m), three small items) fits one pull request easily. 6a, AC89 (d) to (g) and twelve (k) items, is large but all small changes to words and drawing; it fits one pull request.
- **The owner's answers:** all four match their records in #202. M3D's line in the spec is word for word the approved line, and the spec header names M3D.

## Non-blocking notes
1. **The cap of 10 a day narrows an owner promise without telling the owner.**
   - From the 11th portfolio mark in a day on one device, a kick-back takes up to about 10 minutes. M3D's approved line says "within about 5 minutes", and P-001-board-bounce says "about 5".
   - Portfolio cards are rare, but the opening paragraph should say so in one line.
   - The cap also needs device storage to count. Say what happens without it: the count resets each opening, so the total isn't bounded by 10.
   - "A second device … 10 more" holds for each further device too, so 9,962 is the total for two devices, not a ceiling.
2. **AC49's lane rule:**
   - say "the first look … no open lane is using" rather than "the next look". "Next" can be read as taking turns, which is the rule this replaces;
   - say which look a fifth lane open at the same time takes. The test checks "the limit is as stated", but the spec gives no rule for it.
3. **AC69's list of where vermilion is drawn leaves out src/public/sandbox.css:128, `.sb-ic.i-you`.** That rule draws the ◆ on the owner's tile and in "who has the ball" (src/public/sandbox.js:417, :2914). The words are right; the citation is incomplete.
4. **The opening paragraph still says the lanes limit "is put to you",** though later in the same paragraph it is answered.
5. **"The `Milestone: none (…)` reasons of draft 2 are no longer needed"** should say draft 1.
6. **Question 4 under "Answered: after MD3" gives options A, B and C "as they were put",** but decisions/questions/P-001-lanes-alike.md records two options worded differently. Quote the record, or say "as drafted".
7. **Lanes open together, five or more.** M3D's line, like the lanes-alike ruling's first line, says lanes open together are "never" alike. Known limit 6 also covers five or more open at once. The question as put did tell the owner "(up to four at once)", so nothing is hidden, but the stage 4 review should keep the tested limit in view.

## Open questions
- None for the owner beyond note 1, which is the Definer's call to put in the opening paragraph or not.
