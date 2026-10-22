Verdict: PASS

Both blocking points from round 1 are fixed. Nothing was skipped. The Scorecard sheet no longer explains its marks, and no other sheet or row does. When the desk can't read a project, the block at the foot of Home now says "can't be read since" a time, and that time matches the project's tile. "Not read yet" shows only while a first read is still pending. The file paths in the versions sheet are now in the code typeface. Home's tiles and summary at the top are pixel-identical to the earlier build in every state I tried. The rest of the desk is unchanged apart from the live "checked … ago" age, and the three locked page tests pass. I found one new point, and it is not blocking. If a project read fine earlier and then fails, the cap sheet still shows its phase from the last good read without saying it can't be read now. The tile and the summary do say so.

Evidence is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/. Made-up projects are labelled NOT real in setups6a.mjs, rsprobe.mjs and rsprobe2.mjs there.

## Round-1 findings

**B1, no key: FIXED** (part B item 35)
- In all 12 Scorecard sheet captures (360 and 414, light and dark; real, build and long setups), the sheet reads only:
  - "Targets: no record for this in the model yet", with the slashed circle;
  - "Your time across projects: not recorded yet", with the dashed "?".
- Each mark is 16×16. No "The marks…" line remains.
- No sheet or block text in the 132 captures contains "The marks", "slashed circle" or "dashed circle".
- Against round 1, the only pixel changes in those sheets are where the removed line was.
- Captures: shots-r2/build-sheet-scorecard-360-light.png and shots-r2/m-all.json.

**B2, can't-read words: FIXED** (part A items 4 and 5). I tested this with a new probe, rsprobe.mjs, at 360 and 414, light and dark (output in rs-new/).
- **First read held (t0):**
  - The Delta-pending tile says "Checking…".
  - The cap line says "Delta-pending's phase: not read yet", and its sheet row says "Phase: not read yet · not counted".
- **Read refused (not-found):**
  - The tile says "Can't read since 13:00: not-found", and the briefing says "Can't read Bravo-refused since 13:00".
  - The cap line says "Bravo-refused's phase: can't be read since 13:00", and the sheet row says "Phase: can't be read since 13:00 · not counted".
- **Network failure, sent as an aborted request:** the same words and time as the refused read, matching the tile's "Can't read since 13:00: network error…".
- **After the first read lands (t1):** "not read yet" is gone, and Delta-pending's row reads "Now: Design · not counted".
- **Round-1 setup:** md-extremes plus Zeta-unreadable now reads "Zeta-unreadable's phase: can't be read since 13:00" (shots-r2/extremes-foot-414-dark.png). In the stage-3 harness clock, the tile, briefing and cap all say 16:00 (cmp-r2/measures-extremes-ext.json).
- Captures: rs-new/rs-t0-360-light-foot.png and rs-new/rs-t0-414-dark-capsheet.png.

**N4, paths in Plex Mono: FIXED** (item 19, item 23)
- "governance/OPERATING_MODEL_VERSION" and "VERSION" are now `span.code` in IBM Plex Mono, 11/400, with a 15.4 px line height.
- The words around them stay Plex Sans 12/400.
- Contrast is 6.4:1 in light and 7.72:1 in dark. 11 px is on the type scale (item 27).
- Captures: shots-r2/build-sheet-versions-414-dark.png and shots-r2/m-all.json.

**N6, focus after a reload: the Builder's account matches.** This is not blocking and goes to the Definer.
- `nav.start()` sets no `focusNext`, so no sheet takes focus when a reload reopens it.
- Probe (focusprobe.mjs; logs in log-focus-base.txt and log-focus-new.txt):
  - At 84c1224, the Waiting card sheet (#/waiting/card/Alpha|pr|80) and Plan's milestone sheet (#/work/ms/Alpha/M1) both reopen with focus on BODY, and focus stays on BODY after Escape.
  - At 361b6b7, #/pf/versions behaves the same way.
  - When opened by a tap, all three put focus on sheet-close.
- So this is the desk's existing behaviour, not something 6a added. My round-1 N6 stands as a follow-up across all sheets.

**N1, N2, N3, N5:** unchanged. The block's text and layout changed only where described here.

## The shared `readStateOf`: Home unchanged against 84c1224
- I ran rsprobe.mjs at 84c1224 and at 361b6b7 in three states:
  - t0: one project still being read, one refused, one network failure, three read;
  - t1: every project read;
  - t2: a project refused after a good read.
- Each was captured at 360 and 414, light and dark.
- **Element captures:** all 84 are pixel-identical (12 briefings and 72 tiles; imgdiff-rs.txt). The briefing, group-head and tile texts are also identical in all 12 runs.
- **Full pages:** in all 12, the first differing row is where the new block starts, 143 px above the old page's end, where "More detail" began (topdiff.mjs).

## Nothing else changed against round 1
- **Screens:** 180 compared (imgdiff-r2-vs-r1.txt).
  - The only text change is the Zeta cap line in extremes-home-ext (4 captures; at 414 it adds one line).
  - Every other pixel difference is the live "checked … ago" age at y≈103 on Home and Waiting, or y≈462–488 on the project page.
- **Sheets:** 220 compared against 84c1224 (imgdiff-sh-r2-vs-base.txt). 216 are identical, and 4 differ only in the age line.
- **Block captures:** 132 compared with round 1 (imgdiff-shots-r2-vs-r1.txt). The 60 that differ are all explained:
  - Scorecard and versions sheets: the two fixes.
  - extremes: the Zeta words.
  - long: the unread project now says "not recorded" instead of "not read yet".
- **Why the long setup's words changed:** my cap6a harness sends a refused network call as an empty 200 answer. The desk takes that as a good read with nothing in it, and its tile says "Now: not recorded" and "the project's files haven't been read yet", so the cap now matches the tile. The desk makes a single call (/api/poll), so this answer can't happen in real use. It is not a finding.
- **Page checks:**
  - Nothing scrolls sideways and no text is under contrast in any of the 132 block captures or the 180 screens.
  - The only spacing failures are round 1's P2 tile links ("Beta" 28×17, "Service-Desk" 79×17), as before.
  - There are no page errors and no portfolio calls.
- **Tests:**
  - The locked tests pass: ac80-board 28/28, ac81-bar-type 11/11 and ac48-62-63-look 9/9. Their files are unchanged from 84c1224.
  - ac87-portfolio 13/13, ac82-home 26/26 and ac86-plan 19/19 also pass.

## New findings
- **N7, not blocking** (part A item 4, AC87's cap row). A project that read well and then fails keeps its last-read phase in the cap, with no "can't be read" word.
  - In rsprobe t2, Echo-later's read is refused at 13:02. The tile says "Can't read since 13:02: not-found", and the briefing says "Can't read Echo-later since 13:02".
  - The cap line omits it ("In Build or Launch: none · …"), and its sheet row reads "Now: Design · not counted".
  - Cause: `capEntry` calls `unknownWhy` only when there is no tracked phase (src/lib/portfolio.js and src/public/lib/portfolio.js, the `error || !pv || !pv.tracked` line).
  - Why it is not blocking: the phase comes from a real record, as on the tile, and nothing says "Quiet". But the cap could miss a move into Build without saying it is behind.
  - Captures: rs-new/rs-t2-414-dark-capsheet.png and rs-new/rs.json.

## Open questions
1. N7: should a cap row say "… · can't be read since HH:MM" when the phase is from an earlier read? This needs a decision from the Orchestrator and Definer. The brief's B2 wording ("a project the desk can't read now") would cover it, but AC87 doesn't say.
2. N6 goes to the Definer as a desk-wide point: focus on sheets reopened by a reload.
3. Round-1 N1 (where the marks sit) is still open for the owner.

My two scratch worktrees are removed. The harness and captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6a-h/.
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-6a-design-round2-verbatim.md.)
