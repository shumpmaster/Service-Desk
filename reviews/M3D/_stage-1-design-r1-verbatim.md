# M3D stage 1 (S-001 after MD3): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-1 at e19ae0a.

---

Verdict: PASS

Design review of M3D stage 1 (S-001, AC89 (a), (b), (c), (h)). Branch build/builder/m3d-1 at e19ae0a, compared with 433c612. I did not see the Builder's summary. I worked in detached scratch worktrees at e19ae0a and 433c612 and have removed both. m3d-wt belongs to another session and was not touched. I changed nothing in the repo.

Every changed screen was captured at 360×740 and 414×896, light and dark. Scratch folder for all captures: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d-h/

TESTS
- Locked page tests plus ac88-dark (ac80-board, ac81-bar-type, ac48-62-63-look, ac88-dark) at e19ae0a: 52 of 52 pass.
- Full suite (`node --test tests/desk/`): 1074 of 1074 pass. Log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d-h/full-suite.txt

WHAT I CHECKED, ALL MATCHING (part A items 1–25, part B where mockup v2 applies, AC88 tokens)

(a) Waiting with one project, five read states. Captures: m3d-h/st-new/s1…s5-{360,414}-{light,dark}.png, base in m3d-h/st-base/, measurements in m3d-h/st-new/states.json, crops m3d-h/s2-c.png, m3d-h/s5-c.png, m3d-h/states-dark.png. Each state matches the spec's AC89 table in all 4 variants:
- State 1: "Checking…", no counts, empties say "Not read yet".
- State 2: "Not read in this opening", plus "Can't read Alpha since 16:00: network error: the desk's function could not be reached" above the lanes, no counts, empties say "Can't read".
- State 3: "checked 0 s ago", counts shown as the word "0", with no buttons.
- State 4: "checked 5 min ago", counts "checking…", cards kept.
- State 5: "checked 2 min ago", the can't-read line, cards kept, empties say "Nothing here when last read".
- In every state: low-contrast texts 0, no sideways scroll, no small targets.
- Base showed "checking…" in the failure states and 0-count buttons, so the fix is real.

(b) Deploy sheet. Captures: m3d-h/dep-new/sheet-*.png and board-*.png, base in m3d-h/dep-base/, crop m3d-h/zeta-dep.png. The words match the spec: "A deploy waiting for your approval on GitHub", "Its approver: not recorded (no record the desk reads names who approves a deploy)", "The run on GitHub". The base repeats and "Its status file" are gone.

(c) Project page waits row. Captures: m3d-h/m3d-h-letters-*.png, letters-row-{light,dark}.png, eps-row.png.
- Alpha shows "#80 · question Alpha-pick · the Build gate · Q-020 stop-1 · a governance hold · a merge of P-002", ids in Plex Mono 11px, 2 lines. Base was 5–6 lines of titles.
- Letters and the long Epsilon name are cut at 2 lines (34 of 67 px), with class `over` and a 60 px fade into the page background (#fff light, #0f1012 dark).
- At 360 the page scroll width is 360, so nothing scrolls sideways.

(h) Unread states that read as read:
- Zeta's tile and page say "Phases: not available" (base: "reading…"). Capture: m3d-h/zeta-tile-c.png.
- Record notes say "not read" (base: "not found").
- An unread v2.5 page says "Your last action: not available".
- Portfolio cap sheet: "Now: Design · can't be read since 16:03 · not counted". Versions rows: "Members: can't be read since 16:00", "Alpha: not recorded · can't be read since 16:03".
- Held-question fold (m3d-h/held-m3d1-wt-*.png vs held-m3d-base-*.png): headings are 13px/500 and paragraphs and list items 13px/400, all on mockup tokens (--t-row, --t-body); lists use discs. Base was 19.5/700 and 15.21/700 with no list markers.
- Failed load of the desk's code (m3d-h/load-m3d1-wt-*.png, load.png): "The desk couldn't load. Reload to try again." replaces "Checking…", the footer is hidden and the title is set. Base stayed on "Checking…".

Nothing else moved against 433c612. I ran the whole harness (dr8-h: main, extremes, sdq, unread25, letters, six portfolio setups, signed-out, render failure, three tap links) on both commits and compared every set. Diffs are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d-h/seq/cmp-*.txt. Known harness timing noise (sb-branch, sb-lanes) is excluded. The only differences:
- main: 4 of 620 captures, the Alpha page waits row.
- extremes: 40 of 1028 captures. Waits rows on every project page, `over` on Epsilon, "Phases: not available" in 12, and Zeta's notes "not found" → "not read".
- sdq: 4 of 224, the waits row.
- unread25: 12 of 208. Notes and sprint "not read", and the v2.5 last action.
- letters: 4 of 136, the waits row with `over`.
- pf-x-cards: 52 of 108, all "Phases: not available" on the Home tile behind the sheets.
- signed-out: 4 of 4. "Phases: not available", and at 414 the portfolio rows re-wrap because the text is shorter.
- No differences: pf-cards, pf-q-one, pf-access, pf-fail, pf-none, the render failure, and all three tap links.
- No sandbox or trial words appear anywhere at head.

The stage-8 guard's new exception (ac88-dark M3D1_WAITS) is exactly the waits-row change:
- It allows only display, position, max-height and overflow, only on span.v2-small.v2-wn inside .v2-prt of a.v2-prow.
- The test asserts that this is the only exception besides stage 8's own.
- It matches the STRUCT and SIZE diffs above.
- See the open question below about the held fold.

FINDINGS (none blocking)

N1. The failed-load screen is drawn in style.css's old look (items 14, 19, 23).
- The header state line is bold amber (rgb(138,90,0) light, rgb(255,204,128) dark), the same words are repeated in the body, and the page uses system-ui on #fafafa / #121212 instead of the v2 tokens.
- Captures: m3d-h/load-m3d1-wt-360-740-light.png, m3d-h/load-m3d1-wt-414-896-dark.png.
- The spec only sets the words, so this is non-blocking. I'm carrying it as a risk for the Definer.

N2. The Home cap row names a project without its phase (item 19):
- "In Build or Launch: none · Members's phase: can't be read since 16:00 · Alpha · can't be read since 16:03".
- The bare "Alpha" reads oddly next to "Members's phase".

N3. The deploy sheet has three controls that open the same run page: the run's title link, "Approve on GitHub ↗" and "The run on GitHub" (item 19, one action per control). Capture: m3d-h/dep-new/sheet-360-dark.png.

N4. Two wordings for the same unread state: v2.5 says "Your last action: not available", while v3 unread says "not available yet".

N5. Older problems, unchanged by this stage:
- The raw reason in "Can't read since 16:00: not-found" (m3d-h/zeta-tile-c.png).
- "CI on main: not read yet" on a project that can't be read.
- "Members's".

FOLLOW-UPS AND OPEN QUESTIONS
- Q1 (Orchestrator, Reviewer): the stage-8 guard never renders an open held-question fold, so the fold restyle in sandbox.css (.v2-qfold .sb-record …) is not covered by any exception. Should the guard add a fold-open capture so later changes there get caught?
- Q2 (Definer): should the failed-load screen take the v2 look and drop the repeated words (N1)?
- Q3 (Reviewer, Orchestrator): the locked ac80-board cases were rewritten for the AC89 (a) table, and the waits assertion now expects '#126'. The edits match the spec. Whether a builder may edit a locked check is the process question raised in earlier stages.
- Environment note: the scratch disk filled during the first parallel capture run, and Chromium tabs crashed. I deleted only those partial capture sets from my own scratch folder. I then re-ran without screenshots, one setup at a time, and compared the JSON reports, so the compares above are complete. About 350 MB is free on / now.