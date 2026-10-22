Verdict: PASS

**Plain English.** Nothing failed or was skipped in this round. Both round-1 findings are fixed in every state, at 360 and 414 px, light and dark:
- A portfolio card now counts as waiting in the page's status line and tab title until its file leaves the queue, even after you tap Done. It never sits beside "Quiet".
- File and repository names in the two portfolio sheets now use the code font.

The new words read right everywhere they appear:
- "Checking…" when you come back to the page and the portfolio is due a read.
- A well-formed card no longer shows "can't parse".
- A card's sheet names its milestone.

Nothing else moved. The view the desk shows today, outside the trial view, is pixel-identical to before. Nothing here is irreversible.

Range: f393d3c..8d20e79; new this round: 6ff0050, 44fc001, 8d20e79. Fresh detached worktrees were made for 8d20e79, 32d2eb5 and f393d3c, and removed after. Captures are in `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6b-h/`, written as `dr6b-h/` below.

## Round-1 findings

**F1, fixed.** Part A item 4; Terms' Quiet; AC80. The status line and tab title, at all four sizes (`dr6b-h/log-flowsall2.txt` and `dr6b-h/log-flows5b.txt`):

| Moment | Status line and title |
|---|---|
| One card waiting | "1 waiting on you" |
| After Done ✓, unconfirmed | "1 waiting on you" |
| Kicked back | "1 waiting on you" |
| File has left the queue (confirmed) | "Quiet" |

- "· Quiet" never appears beside a waiting card.
- Home's briefing is unchanged: "1 needs you", then "Nothing waiting on you · confirming with GitHub", then "1 needs you · 1 kicked back".

**F2, fixed.** Part A items 19 and 23. All four sizes, from the text dumps in `dr6b-h/pf2/m-*.json`:

| Sheet | Names now in IBM Plex Mono 11 px |
|---|---|
| "Decisions across projects" (`dr6b-h/pf2/pf-cards-pf-decisions-360-dark.png`) | `queue/PF-00…md`, `shumpmaster/portfolio` |
| Rarer records (`dr6b-h/pf2/pf-cards-pf-rare-414-light.png`) | `R-001-made-up.md`, `R-002-made-up.md`, `shumpmaster/portfolio` |

- Contrast is 6.4:1 in light and 7.72:1 in dark.

## The new words

These come from `dr6b-h/flows6all/flows6.json` and its `.png` captures, at 360 and 414, light and dark.

**Back from hidden, past 6 minutes, with the read still in flight**
- Briefing, status line and title read "Checking…" with the clock mark. The portfolio block still shows the queue as last read.
- After the read, back to "Nothing needs you" / "Quiet". It never reads "Can't read" when nothing has failed (part A item 4).
- Captures: `dr6b-h/flows6all/h-1-back-checking-*.png` and `h-2-back-read-*.png`.

**First read still filling in** (a made-up portfolio with 30 cards, more than one blob call carries)
- Status line and title: "30 waiting on you · Checking…". Then "30 waiting on you" once the next read finishes.
- Captures: `dr6b-h/flows6all/f-1-filling-*.png` and `f-2-read-*.png`.

**Failures**
- A refused read: "Not quiet: Can't read your portfolio: the desk's read access doesn't include it (Setup P1)". With projects waiting: "6 waiting on you · Can't read your portfolio since 16:00".
- These match the projects' own state-line words.

**Card sheet head**
- Reads "portfolio · decision · PF-001-explore-1.md · PM1 · wait not recorded" in Plex Mono 11 px.
- Capture: `dr6b-h/pf2/pf-q-one-pfcard_PF_001_explore_1_md-360-light.png`.

**A card in the portfolio template's form** (no "answer:" line)
- No "can't parse" note on the board or in the sheet.
- A truly broken card still shows "can't parse: no title under "## 1. The decision"; no options under "## 4. Options"". The answer-path note is gone.
- Capture: `dr6b-h/pf2/pf-x-cards-waiting-pfgroup-360-dark.png`.

## Nothing else moved

**Against 32d2eb5**, same fixtures, 840 captures (`dr6b-h/pf-r1` vs `dr6b-h/pf2`; `dr6b-h/imgdiff-pf-r1-r2.txt`):
- The only text changes are the intended ones: the "can't parse" notes, "PM1", and the names in Mono.
- Pixel diffs outside the changed sheets and the board are "checked N s ago" ages only.
- Two pf-fail differences ("since 16:01", and a "No movement…" line) were in my round-1-head rerun made under load. Round 1's original captures match round 2 on both.

**Against f393d3c, trial view with no portfolio in J7**: 2,264 captures across main, extremes, sdq, unread25, letters, quiet, tap, signed out and boom (`dr6b-h/imgdiff-r2.txt`).
- Rendered text is identical except for ages.
- Pixel diffs are ages and the stage-7 running-log lane flake on 23 member pages (round 1's N4). That flake was also seen on the base.

**Accepted views against f393d3c**: 100 captures on main and sdq, 360/414 × light/dark. Pixel-identical, and every view's text identical (`dr6b-h/imgdiff-acc2.txt`).

**Width, contrast and type**: 840 portfolio captures plus the flows.
- No sideways scroll.
- No text under 4.5:1.
- Sizes only 11, 12, 13, 15, 18 and 24 px; weights only 400, 500 and 600.
- Vermilion only on waiting cards' kind icons, the badge and the tile diamonds.

## Tests on 8d20e79
- Locked tests pass and are unchanged since round 1: ac80-board 28/28, ac81-bar-type 11/11, ac48-62-63-look 9/9, ac88-dark 3/3.
- Portfolio tests also pass: ac87-portfolio-6b 20/20, ac87-portfolio 13/13, j23-portfolio 18/18.

## Non-blocking and follow-ups
- **Harness note, not a page finding.** One flow capture (t-pf-cards, 414 light) showed "Can't read your portfolio since 16:00". It came from my flow script, which calls the page inside its network handler, under heavy load. A rerun was correct (`dr6b-h/flows6re`), and none of the 840 plain captures fail.
- **Carried from round 1, unchanged, outside this stage:**
  - N4: the running-log lane flake.
  - N5: Home's tile names are 17 px tall targets, already on the base.
- N1 (kick-back can take up to about 10 minutes) and N2 are with the planner, as you said.

## Open questions
None. Setup P1 is recorded as done ("P1 done", 2026-10-22), which closes round 1's question 1.
(Recorded verbatim by the orchestrator from reviews/S-001-desk-v2/_build-6b-design-round2-verbatim.md.)
