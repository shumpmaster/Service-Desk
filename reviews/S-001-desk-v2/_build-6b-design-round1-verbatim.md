# S-001 desk v2, stage 6b (the portfolio's read): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-6b at 32d2eb5.

---

Verdict: FAIL

**Plain English.** Two things fail. First, when every project is quiet but a portfolio card is waiting, the page's tab title and its screen-reader status line say "1 waiting on you · Quiet". After you tap Done on that card, they say just "Quiet", even though the card is still in the portfolio's queue. Home's own briefing is right in both cases. Second, in the "Decisions across projects" sheet, each card's file path is drawn in the normal text font, not the code font. Everything else in this stage matches mockup frames H4, 11 and 12 and the spec's words:
- Home's foot in each state
- Quiet's 6-minute rule
- the board's "Portfolio" group and its card sheet
- the ideas list on Plan
- "Since you last looked"

Nothing here is irreversible. One thing to settle with the owner: a portfolio card marked Done can take up to about 10 minutes to be kicked back, not about 5.

Branch reviewed: build/builder/desk-v2-6b at 32d2eb5, against f393d3c. The scratch worktrees were removed. Captures and scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr6b-h/ (written as `dr6b-h/` below).

## Blocking findings

**F1. The status says "Quiet" while a portfolio card waits.** Rulebook part A item 4; Terms' Quiet ("also no card in its queue", specs/S-001.md:2269); AC80.
- Setup: the projects are quiet and one card is in the portfolio's queue.
  - `document.title` reads "Sandbox — 1 waiting on you · Quiet".
  - `#screen-state` reads "1 waiting on you · Quiet". It is 0×0 on screen, but it is `role=status aria-live=polite`, so screen readers announce it.
- After Done ✓, while the mark is unconfirmed and the file is still in the queue, both read "Quiet".
  - Before this change, a pending project mark kept counting in the title ("N waiting on you"), because `screenState` ignores marks.
- After a kick-back, both read "1 waiting on you · Quiet" again.
- Home's briefing is right throughout: "1 needs you", then "Nothing waiting on you · confirming with GitHub", then "1 needs you · 1 kicked back".
- Cause: `withPortfolio` in src/public/sandbox.js (around line 1806) builds `${n} waiting on you · ${s.text}` when `s.text` is "Quiet". It also takes `bd.counts`, which drops marked cards.
- Evidence: `dr6b-h/log-flowsall.txt`, rows c-0-*, c-2-*, c-3-*, at all four sizes. Also `dr6b-h/flows2/flows2.json`, row "screen-state", and `dr6b-h/flows5/flows5.json`, row "k-end".

**F2. File paths in "Decisions across projects" are in the sans font, not Plex Mono.** Part A items 19 and 23.
- The code gives each path `class="v2-small v2-mono"`, but it renders as IBM Plex Sans, 12 px, weight 400:
  - `queue/PF-001-explore-1.md`
  - `queue/PF-002-…`
  - `queue/PF-003-broken.md`
- The same path in the card's own sheet renders in IBM Plex Mono, 11 px.
- Evidence: `dr6b-h/pf/pf-cards-pf-decisions-360-light.png` and its text dump in `dr6b-h/pf/m-pf-cards-pf.json`.
- Lesser, same item: the rarer-records sheet lists file names (`R-001-made-up.md`, …) and the repository name (`shumpmaster/portfolio`) in the sans font.

## What passes, with evidence

**Pages that should not change**
- Accepted (non-sandbox) view: 100 captures on main and sdq, 360/414 × light/dark, with J7 naming the portfolio.
  - Base and new are pixel-identical, and every view's text is identical. Evidence: `dr6b-h/imgdiff-acc.txt`.
  - The portfolio read runs only in the trial view (`opts.j11`).
- Trial view with no portfolio in J7, 6a's state: 2,229 captures.
  - Setups: main, extremes, sdq, unread25, letters, quiet, plus tap, signed out and boom.
  - Rendered text is identical except for ages counting up.
  - Pixel diffs are only "checked N s ago" and other ages, plus a lane-drawing flake on member pages. That flake is also in the base: see N4.
  - Evidence: `dr6b-h/imgdiff-1.txt` and `dr6b-h/imgdiff-x.txt`.

**Width, contrast, type and colour** (840 captures, 10 portfolio states, 360×740 and 414×896, light and dark)
- No sideways scroll (item 12).
- No text under 4.5:1 (items 10 and 25).
- Sizes are only 11, 12, 13, 15, 18 and 24 px. Weights are only 400, 500 and 600 (item 27).
- Fonts are Plex Sans and Plex Mono, apart from F2.
- Vermilion appears only on the kind icons of waiting cards, the badge and the tile diamonds (items 14 and 29).
- Failure words use `--bad` with a ✕, as the projects' "Can't read …" lines do (item 13).
- Evidence: `dr6b-h/log-pf-*.txt` and `dr6b-h/pf/m-*.json`.

**Home's foot (frame H4)** — `dr6b-h/pf/pf-none-home-foot-*.png`, `pf-cards-…`, `pf-access-…`, `pf-fail-…`
- Empty queue: "None in the portfolio's queue" with ✓, "Rarely needed", and the 6b line under the rows, as drawn.
- With cards: "3 in the portfolio's queue · waiting on Waiting, under "Portfolio"".
- Refused access, and a failing read, use the spec's words.

**Quiet's 6-minute rule** (item 4)
- Last good read 21:00:03. The briefing flips at 21:06:05 to "Can't read your portfolio since 16:05". It is never "Nothing needs you" past 6 minutes, probed every 5 s.
- Evidence: `dr6b-h/flows4/flows4.json` and `dr6b-h/flowsall/q-*.png`.
- Refused access shows "Can't read your portfolio: the desk's read access doesn't include it (Setup P1)": `dr6b-h/pf/pf-q-access-home-360-dark.png`.

**The board's "Portfolio" group and card sheet** — `dr6b-h/pf/*waiting-pfgroup*`, `*pfcard_*`, `dr6b-h/flows5/k-kicked-*`
- The group is a heading, not a filter; it comes after the projects' groups and shows its count.
- Each card shows "Decision", its title from "## 1. The decision", its file name in Mono, and "Open ↗".
- The card sheet shows the card's sections, the recommendation with its code words in Mono, "Open on GitHub ↗" to the right blob URL, the phone note, no answer link, and Done ✓ / Undo / Close.
- Close is 44×44. Escape and a tap outside close the sheet. A refresh keeps it open (`dr6b-h/sheetchk.mjs` output).
- Every other target is at least 24 px tall.

**Plan's "Ideas · from the portfolio"** — `dr6b-h/pf/*plan-ideas*`
- Newest first, with the count shown.
- Each state in words with its own mark. "state not recorded" uses the dashed circle with "?".
- Dates are in Plex Mono.
- With no ideas file, and on failure, it shows the spec's words.

**"Since you last looked"** — `dr6b-h/flowsall/s-since-*.png`
- Shows "An idea moved to approved: A made-up reading-list app", marked "portfolio · ideas", linking to Plan. This is the mockup's own line.

**Locked page tests on 32d2eb5**
- ac80-board 28/28, ac81-bar-type 11/11, ac48-62-63-look 9/9, ac88-dark 3/3.
- ac88-dark's edit only adds the portfolio's screens; it weakens nothing.

## Non-blocking findings and follow-ups

- **N1. Kick-back can take up to about 10 minutes.** Marks are judged only at the 5-minute portfolio reads, so a Done portfolio card is kicked back at the first read 5 or more minutes after the tap. Measured: Done at 21:01:08, kicked back at 21:10:20.
  - P-001-board-bounce says "about 5 minutes". The spec's 5-minute read makes this follow, and the test encodes it (ac87-portfolio-6b.test.mjs:150).
  - Home stays honest meanwhile: "confirming with GitHub". This is a question for the owner or the Definer, not a fix.
- **N2. A portfolio card that can't be parsed is long on the board.** It shows its file name twice ("PF-003-broken.md" as title and as meta), and its "can't parse: …" note runs 6 or more lines in the narrow lane. Item 19, note only. Evidence: `dr6b-h/pf/pf-cards-waiting-pfgroup-360-dark.png`.
- **N3. Idea rows have no "›".** Frame 11 draws one, but AC87 gives an idea no place to open, so this is not a finding.
- **N4. Pre-existing: running-log lanes sometimes drawn out of place.** In long capture runs the lanes are sometimes offset or overflow the panel, on both base and new.
  - Examples: `dr6b-h/cap-base/main-Members_m_critic_full-414-light.png` and `dr6b-h/cap-new/main-Service_Desk_m_definer_full-360-light.png`.
  - Isolated re-captures are identical on both sides, 8 of 8 (`dr6b-h/lanes-base`, `dr6b-h/lanes-new`). This is a stage-7 follow-up.
- **N5. Pre-existing: Home's tile names are 17 px tall targets** (`v2-ta`, for example 56×17), on the base as well.

## Open questions

1. **Setup P1.** I found no record that the owner has done it, yet J7 now names the portfolio. If the token does not yet include the repository, every trial-view Home will show the red "Can't read your portfolio … (Setup P1)" line. The spec says 6b lands once P1 is done (S-001:1819, 2930). The orchestrator should confirm.
2. **N1's timing.** Should a portfolio Done be judged sooner, or is up to about 10 minutes acceptable under "about 5 minutes"? For the owner.
3. **Commit trailers.** The builder commits carry `Agent-Session: session_012RJPVKAoLga2RkqLYRDcBY`, the same id as this session. Not a design point; flagged for the orchestrator.