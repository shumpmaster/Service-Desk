# S-001 desk v2, stage 3 (the project page and its Timeline): the Design reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-3 at db35d08.

---

Verdict: PASS

**In short:** All three round-1 blockers are fixed at db35d08, and so are round-1 non-blocking 1 to 4:
- Opening "Details" now gives one clean column.
- A project the desk can't read says "not available" instead of zeros.
- The Experiments links are full-width 32 px rows.

The new ✕ icon sits at the right size beside its word, centred to within 0.5 px, but it is drawn darker than its neighbours. That and two smaller points are non-blocking. Home, Waiting and Plan are identical to 28b829d.

**What I ran:**
- Round 1's harness on db35d08, plus 28b829d for the comparison, each in its own detached scratch worktree, both now removed.
- Chromium through Playwright, served by tests/desk/fake-desk.mjs, with the same fixtures as round 1. Widths 360×740 and 414×896 in light and dark, plus the Timeline at 1024×1366.
- One fixture added to my scratch copy of setups3.mjs: `unread25`, a v2.5 project the desk can't read.
- Output is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3r2-out/ (`shots/`, `wide/`, `base/`, measures JSON, logs). The comparison script is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3r2-out/cmp.py; the marks probe is /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3r2-out/marks.js.

**Tests:**
- ac80-board, ac81-bar-type and ac48-62-63-look: 48 of 48 pass. That is 47 plus a new AC80+AC83 case for a kicked-back card on the page. The other edits are citation line numbers and AC81's ✕ check extended to the page, the Timeline and Team.
- The whole desk suite: 955 of 955 pass.
- All captures: no script errors and no sideways scroll.

## Round-1 findings

**B1, Details opened: fixed.**
- `.v2-pdetail` now computes `display: block; min-height: 0` (sandbox.css:1180).
- Opened, the summary is the full width: 328×71 at 360, 382×54 at 414. Below it, the body, Notifications and Actions usage stack at x=16 in one column, in both themes.
- Captures: shots/x-details-open-{360,414}-{light,dark}.png and shots/main-page-sd-details-*.png.
- Side gain: the closed Details no longer lays out 7 elements off-screen (round 1 counted 7 per page capture; now 0).

**B2, the can't-read project's zeros: fixed.**
- Zeta-unreadable now reads "At work now: not available · with the agents: not available" and "Experiments · not available". Its sheet reads "not available · experiments/", with no list and no "No experiment is registered" line. Home's tile still says "At work: not available".
- The unread v2.5 case (`v25Rows`) reads "CI on main: not read yet", "Latest in the ledger: not available" and "Records: not available". It drops the "Questions and cards" and "Agent runs" not-used rows.
- Captures: shots/x-zeta-414-dark.png, shots/x-zeta-exp-414-dark.png, shots/extremes-page-zeta-*.png, shots/x-poom-unread-414-light.png.

**B3, the Experiments links' tap targets: fixed.**
- Each link is 312×32 at 360 and 366×32 at 414, one per row, both themes. Failing targets on the sheet went from 5 to 0. Close is still 44×44.
- Captures: shots/x-experiments-{360,414}-{light,dark}.png.

**Non-blocking 1, sprint title margins: fixed.**
- `.v2-spt` has 0 margins. The title sits 6 px under its date row and 6 px over Technical, matching frame 7b's `gap: 6px`.
- Capture: shots/x-sprint-dash-360-{light,dark}.png.

**Non-blocking 2, the marks row: fixed.**
- Every mark, including a `<details>` mark ("– checks"), is 400 11 px in `--ink2`. Text midlines are equal to 0.0 px, in all 4 width/theme pairs and at 1024.
- The `<details>` summary keeps a 24 px tap height (44×24).
- Captures: shots/x-marks-*.png, shots/x-sprint-x-*.png; data in x-marks-*.json.

**Non-blocking 3, the gap under the pinned header: fixed.**
- The header now grows to the 8 px step, and the band pins flush under it:

| Case | Header bottom | Band top | Gap |
|---|---|---|---|
| Service-Desk, 360 and 414 | 96 | 96 | 0 |
| Members, 360 | 96 | 96 | 0 |
| Long name, 360 | 152 | 152 | 0 |
| Long name, 414 | 112 | 112 | 0 |
| 1024 | 88 (tlh-88) | 88 | 0 |

- At the seam, the band is directly under the header, with no feed showing through.
- It re-fits on a width change (414 → 360 → 414) before the next poll.
- Captures: shots/x-gap-*.png.

**Non-blocking 4, the false "1 more": fixed.**
- In AC61's fixture, the two-paragraph Why (34 px = scrollHeight 34) has no control at either width.
- A Context with one of its two parts hidden reads "1 more".
- Capture: shots/x-ac61-more-*.png. One wording point remains (new 3, below).

## The new ✕ icon (marks row)
- **Size:** 10×10, beside 11 px text.
- **Alignment:** 2 px before its word, with its centre within 0.4 to 0.5 px of the word's midline. Same at 360 and 414, light and dark, and in all 3 rows that carry it.
- **Its word:** "checks" stays beside it on one line at both widths.
- **Contrast:** 17.58:1 light, 16.25:1 dark.
- **Colour:** `--ink`, not the row's `--ink2` (new 1).

## New findings (all non-blocking)

1. **The ✕ is darker than the rest of its row.** (Part B item 26, frame 7b `.sp .stats { color: var(--ink2) }`, desk-v2.html:305; AC81 "in `currentColor`, sized to the text beside it".)
   - It renders rgb(24,25,28) light / rgb(236,237,239) dark. Its word and the ✓ and – beside it are rgb(92,95,102) / rgb(162,165,172).
   - Cause: sandbox.js:2152 gives the icon the class `v2-k v2-mk`. `.v2-mk` already exists at sandbox.css:880 for the board card's mark (`display:flex; font: var(--t-label); color: var(--ink)`), so the icon takes that colour.
   - Visible in shots/x-sprint-x-360-light.png and shots/x-sprint-x-414-dark.png.

2. **The ✕'s meaning is lost to a screen reader.** (Rulebook item 2: AC60 "✕ checks", "each a mark and a word"; AC81 "each keeps its word or its accessible name".)
   - The svg is `aria-hidden="true"`, so a failed check now reads as just "checks", while a passing one reads "✓ checks". The same applies to "✕ review".
   - Visually it passes. This is for the Reviewer to weigh against AC81.

3. **"2 more" when only one part is out of sight.** (Rulebook item 16; AC84 "<n> more ▸".)
   - In AC61's fixture, a Context of two facts shows the first fact cut on line 3, then "2 more" at both widths.
   - The code counts parts "not wholly shown", so the visible-but-cut first fact counts too. A reader expects two further facts and finds one.
   - No rule defines n, so this may be a question for the Definer rather than a fix.
   - Capture: shots/x-ac61-more-360-light.png.

## Nothing else changed
- **Home, Waiting and Plan:** db35d08 against 28b829d gives no difference at all in 16 captures: text, styles, positions, tap targets, accent users and contrast. Captures are in base/ and shots/main-{home,waiting,plan}-*.
- **Round 1 against round 2, page, Timeline, Team and extremes:** every difference traces to the fixes above. That covers B1's layout and B3's links, B2's three Zeta lines, and the ✕ moving from text to icon. It also covers the marks at 11 px, the tighter sprint titles, and the feed sitting 3 to 6 px lower under the taller header.
- No other text, colour, type size or accent use changed. The one extra failing target (tl-sd-full-open-414) is an inline source link inside a sentence, which falls under WCAG's inline exception; the same link already showed at 360 in round 1.

## Follow-ups (already at 28b829d, not part of this verdict)
- For a project the desk can't read, Home's tile and the page say "Phases: reading…" beside "Can't read since 16:00" (item 4).
- Its Record notes list "dispatch log: not found" and two more "not found" lines when nothing was read.
- An unread v2.5 project shows "Your last action: not recorded (operating model v2.5.1 …)" (item 5). Base shows the same line.

Round-1 non-blocking 5 to 8 and the open questions are unchanged and stay with the Definer.