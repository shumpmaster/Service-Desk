# M3G stage QW3: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw3 at 2572838 (QW3's work over a0437b8).

---

Verdict: PASS

Round 2 fixes round 1's B1. "Answer first", "Waits on" and "Also asked in your session" now render at the picture's 12 px. The held line takes two lines at 360 px and breaks exactly where the picture breaks it. The sheet's codes are in monospace, and its long titles are cut at three lines with the fade. Compared with round 1, the only visible change outside the new fixture cases is the held line's size. The suite passes 1447 of 1447, and every measure in the qw3 capture run passes. I found nothing blocking. One note is below (N1).

**Blocking**
None.

**What I checked** (my own Chromium renders at 2572838; IBM Plex Sans 400, 500 and 600 and Plex Mono loaded)

- **Sizes against the picture.** All checks are against P-001-m3g-picture, A.
  - Every `.v2-afirst` and `.v2-waits` line is IBM Plex Sans 12 px/16.8, weight 400, `--ink`. That is 17.6:1 in light and 16.3:1 in dark.
  - My round-1 width measurements put the picture's text at 12 px.
  - Lane and strip cards are back to only 11 and 12 px text. This meets item 27 (board text 11 and 12 px). The "Waits on" link is 12 px, weight 400, under a 12 px, weight 500 title.
  - At 360 the held line breaks as "Waits on a question being" / "asked in your session". Line 1 is 138 px wide, the same break as the picture's frame 1.
  - The held line's box is 41.6 px tall, two lines, at 360 and at 414.
- **The new lines** (the fixture's new cases).
  - A section question that waits on another: Alpha-second shows "Waits on question 1" under its meta line, then "Answer first · cards 7 and 8 wait on it", then its choices.
  - The held-up gate card in Gamma's lane shows "Waits on question 1" under its meta line, on the gate card's own surface.
  - "Answer first · cards 2, 5 and 7 wait on it" fits on one line.
  - Section order is unchanged: Alpha's two blockers, then the held question; Beta's blocker, then its held question (P-001-m3g-held-place, B).
- **Targets (item 11).** Every "Waits on" box is at least 24.8 px tall and every link 25 px. The sheet rows are 39.6 to 73.2 px tall.
- **The sheet.**
  - Each row in "Cards waiting on it" shows its place and kind whole on the first line, then the title. Titles are cut at three lines with the fade (`.over`), as on the board. An example is "7 of 12 waiting · Decision": three lines, cut and faded.
  - Screen readers still get the whole row text, with " · " between its parts.
  - The uncounted entries are in `--t-small` `--ink2` (6.40:1 light, 7.72:1 dark). Each code is in Plex Mono 11 px: "#999", "queue/P-404-stop-1.md", "card 7".
  - Nothing in the sheet scrolls sideways.
- **The held line's change** (N1 from round 1). "Also asked in your session: answer in one place" is now `.v2-heldl`, 12 px, `--ink`, matching the picture.
- **Taps and focus** (unchanged from round 1).
  - "Waits on question 1" opens Alpha-pick's sheet, and "and 2" opens Alpha-second's.
  - Escape closes the sheet.
  - The held tap scrolls to the held card and focuses it, with Alpha alone shown too. With the keyboard the focus ring shows (2 px solid ink, light and dark); with a finger, no ring.
- **Width (item 12).** Nothing scrolls sideways on Waiting or Alpha alone at 360 and 414, light and dark (scrollWidth − innerWidth = 0).
- **Nothing else moved since round 1.** I rendered 226bc81 and 2572838 with the fixture that has no `Blocks:` lines.
  - Plan (`#/work`), the Alpha and Gamma pages and Alpha's Timeline are pixel-identical in all 8 width and theme combinations.
  - On Waiting, a dump of every text element's style and position differs only on the held line (13 → 12 px, `.v2-body` → `.v2-heldl`) and on the clock's minute.
  - Home was shown unchanged against the base in round 1, and round 2 changed nothing it renders.
- **Tests.**
  - `npm --prefix src test`: 1447 pass, 0 fail.
  - `node tests/desk/tools/glance-shots.mjs <dir> qw3-`: no failures, "held line at 12px" on every capture.
  - The worktree is clean.

**Non-blocking**

N1. At 12 px, "Waits on questions 1 and 2" in a 360 lane wraps as "Waits on questions 1 and" / "2", as the picture draws "Waits on questions 2 and" / "3".
- Question 2's link is " and" at the end of line 1 (23 × 25 px, right beside "1") plus "2" alone on line 2 (7 × 25 px). A hit test confirms it: a finger on "and" opens question 2.
- It passes item 11 under WCAG 2.5.8's Inline exception, and AC95 asks only for 24 px tall. So this is a note, not a finding.
- A possible follow-up for the Definer: a no-break space between "and" and the number, so "and 2" moves to line 2 together, giving a 33 × 25 px link as at 13 px.

N2. Carried over from round 1's N4, unchanged and present before QW3: shorter cards in the Kicked back strip spread their rows to the tallest card's height.

**Questions for the owner**
None.

**Captures for the owner**, the refreshed set in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw3/shots/ (written 06:47, the tip's commit time):
1. qw3-busiest-360x740-light.png: **the one to show beside the picture's frame 1** (docs/design/builds/m3g-picture/m3g-f1-board-360-light-full.png). Same width and theme, and it shows the held line's two-line break as drawn.
2. qw3-one-alpha-414x896-dark.png
3. qw3-held-sheet-360x740-light.png: the list, and the codes in monospace.
4. qw3-blocker-sheet-360x740-light.png: a title cut at three lines with the fade.

My own renders of the same 16 are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/shots2/. The round-1 comparison files are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/cmp/, and the suite log is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/rev/suite2.txt.
