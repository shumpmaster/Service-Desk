Verdict: PASS

The Design reviewer's verdict on G8c (PR #236), verbatim: round 1 at 366ad4e (PASS); round 2 (633c33e) changed tests only, so the screen is as judged. Recorded by the orchestrator.

## Round 1
Verdict: PASS

**Summary for the owner.** Nothing failed and nothing was skipped. Stage G8c does what your four answers asked. When a project hasn't been read even once since the desk opened, Home's briefing, its tile, the "Since you last looked" list, the cap row and the versions row now all say "in this opening". A project that was read earlier and then started failing keeps its time ("since 10:01") in all five places. The briefing now names projects in the same order as the tiles. A project the desk can't draw gets one quiet grey line, "<project> not shown, its lines may be missing", which sits under "Nothing new since…" or among the "not read" lines. On a Home tile, the line into the "now" circle now stops 3 px short of the arrow, so the arrow stands apart from it. That holds on v3 and v2.5 tiles, at both phone widths and in both themes. Nothing else on the desk moved, and every change can be undone. One older problem is still on the same screen and isn't caused by this change: when the desk can't draw a project whose reads are working, the cap row, the versions row and the group head still say it "can't be read" (questions 2 below).

**Evidence**
- **How I captured it.** Trees exported with `git archive` to the scratchpad. The "before" captures use 210a421's `src/` with 366ad4e's test fixtures, so both sides render the same made-up states.
  - The 13 `g8c-` shots ran through `tests/desk/tools/glance-shots.mjs`, with 360×740 and 414×896, light and dark, Chromium.
  - My own Playwright probe (`scratchpad/g8c-design/scripts/probe.mjs`) dumped rendered text, computed styles, contrast, accessible names and cell geometry.
  - IBM Plex Sans 400/500/600 and Plex Mono 400/500 were loaded.
- **Tests and checks.** Full suite in the exported tree: 1284 pass, 0 fail. `node tools/build.mjs`: PASS (36 page modules in step). `surface_guard.py diff --range 210a421..366ad4e`: OK, 10 commits.
- **Item 1 (rulings).**
  - **Same words everywhere.** `opening-two`, 360 light. Before, the briefing said "Can't read Service-Desk since 10:00" while the list said "not read in this opening". After, it reads:
    - briefing: "Can't read Service-Desk in this opening"
    - tile corner: "✕ Can't read in this opening"
    - list: "Service-Desk not read in this opening…"
    - cap row: "Service-Desk's phase: can't be read in this opening"
    - cap sheet: "Phase: can't be read in this opening · not counted"
    - versions row: "Service-Desk: can't be read in this opening"
    
    Alpha, read earlier, says "since 10:01" in every one of those places. Signed out with a mix of projects: each project goes its own way; the briefing still reads "Signed out — reload to sign in".
  - **One order.** The config order is SD, POOM, Alpha; the tile order is Alpha, SD, POOM.
    - Before, the briefing listed "SD | POOM | Alpha" while the list followed tile order.
    - After, the briefing, its accessible name ("Can't show Alpha: open Waiting"), the lines under "6 need you" and the grey lines all read Alpha, SD, POOM. This was checked in `order-three-quiet`, `order-three-waiting` (folded group), `order-two-*` and `cant-show-beside-two`.
  - **The "not shown" line.** In `cant-show`, it appears directly under "Nothing new since 18 Oct, 19:00". In `cant-show-beside-two`, it comes first in tile order among the "not read" lines, under G1's red "Not read in this opening" line (kept, as the red-line ruling says). Each project gets one line.
  - **The stopped line.** Measured in every theme and size:

    | Tile | Cell | Line left in the now cell | Gap to arrow | Arrow | Arrow to icon |
    |---|---|---|---|---|---|
    | v3 `nowShared('build')` and `('launch')`, 360 | 54 px | 8.2 px | 3.00 px | 6×8 | 3 px |
    | same, 414 | 65 px | 13.6 px | 3.00 px | 6×8 | 3 px |
    | v2.5 `sprintsState(1)`, 360 | 136 px | 49 px | 3.00 px | 6×8 | 3 px |
    | v2.5, 414 | 163 px | 62.5 px | 3.00 px | 6×8 | 3 px |

    In every case the previous cell's line runs right up to the cell edge. Other cells' incoming lines still end at `right: 50%` (27.2 px). Only the tile drawing has the `here` class (sandbox.css:905; sandbox.js:881).
- **Item 2 (spec).** Matches the G8c row, AC91 (c), AC92 (b) and AC89 (a)/(h).
  - Waiting's quiet line, its one-project line and a project page's waits row still say "since 10:00", as the ruling's limit to Home settles.
  - Pixel diffs before/after show no change on `opening-two` Waiting, the SD page or `mix` Home.
- **Items 4 and 5 (honest quiet, no made-up figures).** No "Quiet" shows while a read fails. "in this opening" is never shown without a time held for the project, and never stands in for one.
- **Item 6 (every project).** `service-desk`, `poom` (v2.5) and the made-up project all render. The full suite's AC88 walk covers `md-extremes`.
- **Items 10 and 25 (contrast, dark).** Grey lines: #5c5f66 on white is 6.40:1 (light); #a2a5ac on #0f1012 is 7.72:1 (dark). Briefing red lines are at least 6.40:1.
- **Item 12 (width).** No sideways scroll on any capture, before or after.
- **Items 13, 14, 19 (colour, coral, plain words).** The new line is 12 px, IBM Plex Sans 400, `--ink2`, a `<p>` with no icon. It isn't a link, isn't hidden from screen readers, and adds no colour meaning and no coral.
- **Screen reader.** The grey lines are read as plain text in tile order. The briefing's accessible name follows its first line in tile order. The tile drawing stays `aria-hidden`.
- **Nothing else moved.** The G8 shots before and after (Timeline, project strip, opened phase, Plan, tiles) give identical arrow measurements. Pixel diffs show only the 2 px line rows inside now cells; every other differing row is the "checked N s ago" clock (checked by crop).

**Blocking findings:** none.

**Non-blocking notes**
1. **Older follow-up, not made worse (items 4 and 5).** For a project the desk can't draw whose read works (`cant-show`), the cap row says "Alpha's phase: can't be read since 10:00" and the versions row "Alpha: can't be read since 10:00". The group head counts it as "1 can't be read". Meanwhile the briefing says "Can't show Alpha", the tile "Can't show this project…", and now the list "Alpha not shown…". The capture before G8c has the same cap and versions words. Cause: `readStateOf` maps `drawError` to 'cant-read' (sandbox.js:963), which feeds `portfolioOf`. File as a follow-up.
2. **Older, accessibility.** The briefing is one link whose `aria-label` holds only its first line. The second and later can't-read lines under it are not in its accessible name, so a screen reader hears only one project. This dates from AC82, not G8c.
3. **For your eye, not a finding.** On a v2.5 tile with a long grey line, a 3 px gap is small at 1×. Pair 4 shows it zoomed; the spec fixes the 3 px.
4. **Note on the capture tool.** It times states with Playwright's clock, so "since 10:01/10:02" varies by a minute between runs. This is fixture timing, not desk behaviour.

**Questions for the owner (asked, not picked)**
1. Your answer limited "in this opening" to Home. So a tile that says "Can't read in this opening" opens a project page whose waits row says "Can't read since 10:00", and Waiting's quiet line also keeps "since 10:00". Should Waiting, the project page and the v2.5 Pipeline view say "in this opening" too, or stay as built?
2. For a project the desk can't draw but can read, should the cap row, the versions row and the group head's count say it "can't be shown" instead of "can't be read since <time>"? Or should it stay as built until the follow-up in note 1 is ruled?

**Pairs for the owner** (all made-up fixture data, NOT real; labelled on the image), in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8c-design/owner-pairs-final/`:
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8c-design/owner-pairs-final/01-in-this-opening-everywhere-360-light.png`: whole Home page. Service-Desk, never read, now says "in this opening" in all five places; Alpha keeps "since 10:01".
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8c-design/owner-pairs-final/02-tile-order-and-not-shown-414-dark.png`: the briefing reorders to tile order (Alpha, Service-Desk, POOM), and the grey "Alpha not shown" line joins the "not read" lines in that order.
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8c-design/owner-pairs-final/03-not-shown-under-nothing-new-360-light.png`: a project the desk can't draw; the grey line now sits under "Nothing new since…".
- `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8c-design/owner-pairs-final/04-line-stops-before-arrow-360-light-and-414-dark.png`: zoomed tile drawings, v3 (360 light) and v2.5 (414 dark). The line used to run under the arrow; now it stops 3 px before it.

All other captures and dumps are in `/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8c-design/`: the `g8c-` shots in `shots-before/` and `shots-after/`, my probe output in `probe-before/` and `probe-after/` (with `probe.json`), and the G8 regression shots in `shots-before-g8/` and `shots-after-g8/`.
