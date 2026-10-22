# S-001 desk v2, stage 3 (the project page and its Timeline): the Design reviewer's confirmation, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-3 at 6cf4200.

---

Verdict: PASS

**In short:** The new commit, 6cf4200, breaks nothing visible.
- The failed-check ✕ is now the same grey as its word and the ✓ marks, in light and dark.
- Its hidden "failed" adds no width, gap or wrap, and a screen reader now reads "failed checks".
- An unread v2.5 project's new sentence wraps cleanly onto two lines on the page, the Timeline and Team. The Timeline header steps from 88 to 96 px to hold it, with nothing cut or overlapping.
- Apart from the ✕ pixels and the "checked N s ago" clock, every screen is unchanged since round 2.
- The three named tests pass (48 of 48), and so does the whole desk suite (958 of 958).

There are no new findings, blocking or not.

**What I ran**
- Round 2's harness, from …/dr-3r2-out/, on 6cf4200 in a detached scratch worktree. Both widths, both themes, plus 1024×1366 for the Timeline, in 194 captures.
- The same probes on db35d08 in a second detached worktree, for an exact before and after.
- Both worktrees are removed (`git worktree list` shows neither).
- All output is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3r2-out/c6cf/, with new scripts beside it: …/dr-3r2-out/marks3.mjs, …/dr-3r2-out/unread3.mjs, …/dr-3r2-out/cap3u.mjs and …/dr-3r2-out/imgdiff.mjs (a pixel diff run in Chromium; there is no PIL here).
- No script errors and no sideways scroll in any capture.

## 1. The ✕ icon's colour (items 10, 13, 26)

The icon's class is now `v2-k v2-smk vi-bad`. At both widths, in all 2 rows that carry it in this view:

| Theme | Icon on 6cf4200 | Its word and the ✓ marks | Icon on db35d08 |
|---|---|---|---|
| Light | rgb(92,95,102), 6.4:1 | rgb(92,95,102), 6.4:1 | rgb(24,25,28), 17.58:1 |
| Dark | rgb(162,165,172), 7.72:1 | rgb(162,165,172), 7.72:1 | rgb(236,237,239), 16.25:1 |

- The icon's stroke matches its colour, at 1.6 px.
- Its size and place are unchanged: 10×10, 2 px before its word, centre 0.4 to 0.5 px from the word's midline.
- Captures: c6cf/x-sprint-x-wt-dr3c-{360,414}-{light,dark}.png, with db35d08 beside them as x-sprint-x-wt-dr3c-base-*. Data: c6cf/marks-*.json.

## 2. The hidden span adds nothing visible

- `.sb-vh` (sandbox.css:78) is absolute, clipped and 1×1 px. Because it is absolute, it takes no part in the row's flex gap.
- Row width is 159 with scrollWidth 159. The marks are 51, 45 and 47 px wide, the gap from icon to word is 2 px, and the row sits on one line. Every mark's box and text box is identical to db35d08, at both widths and in both themes.
- **Screen reader:** the row read "✓ merged ✓ review checks" on db35d08 and now reads "✓ merged ✓ review failed checks".
- **Pixels against round 2:** the Timeline captures differ only in one 6×6 px box per ✕ icon: x=299 at 360, 353 at 414, 731 at 1024. That covers 2 or 3 icons per capture, and nothing else.
- Every ✕ the code makes has no reason attached (feed.js:331 and 496, pulls.js:365), so the hidden span never goes inside a `<details>` summary.

## 3. The unread v2.5 sentence (items 5, 12, 27, 32)

The text is "Where it's heading: not available until the project's records are read."

| Where | Type | 360 | 414 |
|---|---|---|---|
| Page | 15/21.75 400 Plex Sans, --ink | 2 lines (298 and 196 px), within its 328 px column | 2 lines (361 and 133 px), within 382 |
| Timeline phase line | 12/16.8 | 2 lines, the second aligned under the first at x=32 | 2 lines, likewise |
| Team phase line | 12/16.8 | 2 lines, likewise | 2 lines, likewise |

- **Header:** the Timeline header is sticky and steps from tlh-88 to tlh-96 (bottom 136.8 → 144.8). Its content's height is 87.6, so it fits inside the 8 px step. The content below keeps the same 12 px gap as before.
- **No band to pin:** this project's Timeline has no phase bands and is too short to scroll, so nothing pins under the header.
- **Contrast:** 17.58:1 light and 16.25:1 dark on the page and the Timeline; 15.39:1 and 16.6:1 on Team.
- **Tap target:** the phase line grows from 28 to 33.6 px tall.
- **Against db35d08:** the text, styles and tap targets are the same, apart from the sentence. Everything below moves by one constant: page +21 to 22 px, Timeline +8, Team +5 to 6. Home is identical.
- Captures: c6cf/x-unread-wt-dr3c-{page,tl,team}[-scrolled]-{360,414}-{light,dark}.png and c6cf/u25new/ (the full measure), with db35d08 in c6cf/u25base/ and x-unread-wt-dr3c-base-*.

## 4. Nothing else changed

- **Pixel diff against round 2:** 136 of 180 phone captures are identical, and 6 of the 13 at 1024. The rest differ only in two ways:
  - the ✕ icons above;
  - the "checked N s ago" clock. Its boxes sit on that text's line, at tops 99, 458, 473 and 370 in the measures.
- **Text and style comparison (cmp.py):** no style, position, accent or contrast change in any set. The only text change is the hidden "failed". A "cut" line near the end is my probe's 6000-character cap moving by the 14 added characters; the full text is identical.
- Results: c6cf/imgdiff-shots.txt and c6cf/imgdiff-wide.txt.

## 5. Tests

- ac80-board, ac81-bar-type and ac48-62-63-look: 48 of 48 pass.
- The whole desk suite: 958 of 958 pass (955 plus 3 new).
- src/lib/projectpage.js and src/public/lib/projectpage.js have the same blob (8976416).

## New findings

None, blocking or not. One small note, not a finding: at 414 on Team, "read." sits alone on the phase line's second line. No checklist item covers it.

The round-2 follow-ups and open questions stand unchanged. The Team screen's older look on a v2.5 project was already the same on db35d08, and is open point 8 in the design pack.