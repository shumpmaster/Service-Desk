# M3E stage G4: the Reviewer's confirmation (round 2), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g4 at 1d3217c (fix commits 44d9683 and 1d3217c, on a3c6ac7) (base 524f92f).

---

Verdict: PASS

Round 2 confirmation of G4: I reviewed a3c6ac7..1d3217c (fixes 44d9683 and 1d3217c) in /home/user/sd-g4, against the Definer's text in ea13729 on build/definer/g4-notes. I judged from the diff, not the commit bodies. All three fixes are built as that text says. Nothing else changed, no locked test was weakened, and the guard's G4 exception is still exact. My round-1 notes 1 and 2 are both closed. I wrote only scratch files, and `git status` is empty.

## Evidence
1. **Every id in the waits row is kept whole (AC89 (c), "After G4's reviews").**
   - The new rule is `.v2-wn > .v2-mono { display: inline-block; }` (sandbox.css:993), not `nowrap`.
   - An id longer than the line still wraps inside itself, through the existing `.v2-prt .v2-mono { overflow-wrap: anywhere }` (:981).
   - `.v2-wn` is used only by the waits row (sandbox.js:1247).
   - A new test in ac89-after-md3 lists all nine ids in the row, including "Q-020 stop-1" and "launch-1/2". For each, at 360 and 414 px in light and dark, it checks inline-block, no white-space, and overflow-wrap anywhere. It also checks the two-line cut (`max-height: calc(2 * 1.4em)`) and the tap are unchanged.
   - Chromium recapture: "the Build gate for / P-002" now moves to the next line whole, in light and dark.
   - The guard: `G4_ONCE` gains one key, `span.v2-mono (waits row id)`, pinned to `display: (none) → inline-block`. It matches only a `v2-mono` span whose parent is `span.v2-small.v2-wn` inside `.v2-prt`. Set equality and the `G[1234]` catch-all still hold.
2. **Sheets over a member's page use the one date form.**
   - `workingNow`: Started and Last check-in now use `dayTimeText`, and Update uses `memberEntryWords`. Next check-in stays `hhmm`.
   - `cosWorkingNow`: Started, Last check-in, and Update (`helperWords(…, dayTimeText)`) all use the one form.
   - The handed-back piece's sheet (sandbox.js:3399) calls `cosPieceWords(…, dayTimeText)`.
   - These two functions are called only from `renderMember`, so the Team screen's cards keep J9's form.
   - Tests cover an earlier day, today, the Chief of Staff's sheets, and a page-level handed-back sheet ("handed back 17 Oct, 02:00", matching its row).
3. **Times after " · " on a member's page.**
   - New `memberEntryWords` (src/lib/sandbox.js:1293) gives `headlineWords(e)` + " · " + `dayTimeText`.
   - It is used for every log row, every group item, and every "latest:" line in `memberPage`, and for Working now's Update.
   - The Rulings line now reads "latest: <file> · <time>". A proxy ruling keeps " (proxy)" after its words, a verdict keeps its comma, and an anomaly's ": <error>" follows the time.
   - `headlineWords` moved from feed.js to records.js with the same body. feed.js re-exports it and no longer uses `entryWords`.
   - Chromium capture: "Q-012: waiting on you — card stop-1 · 8 Oct, 12:22".
4. **Rewritten locked cases.** Each keeps exact equality, so none is weaker.
   - **AC49 member rows (ac49):** stronger. It now also checks proxy, anomaly, the Rulings and Returns "latest:" lines, and the time-last form on every row.
   - **AC62 member-page transform:** the snapshot's ", <t>" becomes " · <t>", with proxy moved before it and ": error" kept after. A new guard asserts that every J9-dated run on those pages is an entry line. The comparison is still deepEqual, and the list of six pages still pins which pages change.
   - **The midnight case in ac91-glance-page:** only the separator changed.
   - **1d3217c:** the AC83 message is reworded; the assertion is unchanged.
   - **md-sandbox.test.mjs:** two cases changed, both forced and of equal strength:
     - AC49's Working now Update now reads `· 14:55`.
     - AC49 B1's Rulings regex now reads `Alpha-old.md · `.
5. **Nothing else changed.** The 16 files are the src/lib code and its src/public/lib copies (`cmp` shows feed, records and sandbox identical), sandbox.css, one sandbox.js line, the tests, and the fixtures README (made-up parts labelled NOT real).

## Commands run
- `npm test`: 1207 pass, 0 fail (round 1 had 1203; this round adds 4 tests).
- `build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)".
- `check_all.sh . 524f92f`: "OK: all governance checks passed."
- `surface_guard diff 524f92f..1d3217c --branch build/builder/g4`: "OK: 5 commit(s) … checked".
- `review_check pr 999 --base 524f92f`: R1. The only failures are the two missing-verdict lines (design-reviewer and reviewer). No test-weakening flag was raised.
- Commits 44d9683 and 1d3217c are by `builder <builder@agents.invalid>`, with Agent-Session and `Spec: S-001` trailers.
- Chromium recaptures (g4-page-*, g4-member-page) are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-review/shots-r2/.

## Findings
None blocking. Non-blocking:
1. **For the Definer:** the two md-sandbox.test.mjs cases (item 4) are not named in G4's revised row or build-plan line, which name only "AC49's member-row cases and AC62's member-page snapshot". Both are forced by the new text.
2. **For the Design reviewer, optional:** on member pages at 360 px, a long row's time can wrap at its space ("8 Oct, / 16:48"). It is not an id, and no rule covers it.

Round-1 note 1 is closed by fix 1, and note 2 by fix 2. Whether the second gate card's distinguishing part should fall inside the two-line cut is now with the owner (P-001-glance-waits-gates), which the spec defers to G5.
