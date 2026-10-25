# M3E stage G8: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8 at 3c4bb80 (round-2 commits 23e634d and 75bee71, with the merges e5a19b4, e975d3f and 3c4bb80, on 16e05bd) (G8's work over 1382866).

---

Verdict: PASS

**Summary for the owner (round 2).** Nothing failed and nothing was skipped. The latest build still puts the small dark "now" arrow on all five drawings, with the same size and place as in round 1, and the old grey up-arrow is still gone. The green and red marks from the colour stage and the new grey "not read since …, its lines may be missing" lines under "Since you last looked" now show beside the arrows. Nothing overlaps or clashes in light or dark, at 360 or 414 px wide. Nothing scrolls sideways. One thing you may notice: if the desk can't read a project, its tile still shows the arrow on the last drawing it could read. That is the same moment its "Now:" words already show, and the tile says in red that it can't be read. Your two questions from round 1 (the arrow sitting on a line into the now circle on a Home tile, and the filled ▲/▼ move buttons on Plan while reordering) are unchanged by this round. All of it can be undone.

**What was checked (3c4bb80, exported read-only with `git archive`)**
- Round-2 source changes: src/ changed only for G7b (`sinceMissingLines` in lib/home.js, `sinceReads`/`sinceNode` in sandbox.js, `.v2-smiss` in sandbox.css). Nothing touches `.v2-here`, `hereMark` or the Now line. 23e634d and 75bee71 are test-only (ac57-58-65-phases, ac92-glance-arrow, ac88-dark). The spec now reads "its top edge 9 px above the bar's top, so a 3 px gap above the bar" (S-001.md:8956). That matches the 3 px I measured, which closes my round-1 note 3.
- Arrows unchanged: I re-captured 17 of my G8 states (all five drawings, the shared-key runs, v2.5 one, two and no open sprints, and Plan grouped and while reordering) at 360×740 and 414×896, light and dark. That is 68 captures.
  - All 68 match round 1's 16e05bd captures in every arrow's box, clip-path, fill, ground, contrast, aria-hidden, animation and offsets.
  - All 68 also match in rendered text.
  - 49 are pixel-identical. The other 19 differ only in a small block, almost all at the "checked N s ago" line near the top, which is capture-timing noise.
- G7 and G7b beside the arrows: five new Home states (made-up read failures, NOT real; the fixture tool's g7b- states) × 2 sizes × 2 themes:
  - Service-Desk not read since a time.
  - The same with four lines and "<n> more".
  - Two projects, one not read in this opening.
  - Signed out.
  - `ext` with Beta and the long Epsilon name failing.
- Results across those captures:
  - Missing lines: 12 px `--ink2`, 6.4:1 light and 7.72:1 dark. The long name wraps at 360 px.
  - Scroll and errors: sideways scroll 0 px and 0 page errors everywhere.
  - Arrows: one per drawable tile, still `--ink` and still hidden from screen readers. A project with no read in this opening has no drawing and so no arrow; signed out shows 0 arrows.
  - Colours: green ✓ and red ✕ marks sit in their own cells or lines. None touches an arrow. On Service-Desk's tile the green Discovery ✓ is on run 1, and the arrow is on run 2 before the ◐.
- Targeted tests on 3c4bb80: ac92-glance-arrow, ac91-g7b-since-missing, ac57-58-65-phases, ac92-glance-palette, ac88-dark, ac82-home, ac83-page, ac84-timeline and ac86-plan, 139 tests, all pass.

**Blocking findings:** none.

**Non-blocking notes**
1. Checklist item 4 (Quiet is honest) holds. A tile the desk can't read (e.g. Service-Desk "✕ Can't read since 10:01") keeps its last-read drawing and so its arrow, alongside its "Now: Design, run 2" words, which were already there before G8. The red can't-read line is on the tile and the briefing, so this is not a false "quiet". I'm noting it only because the arrow is a new "now" mark on stale data.
2. Round 1's notes 1 and 2 (the tile arrow on an incoming line; the Plan ▲/▼ beside the ▶) stand, with their owner questions as already filed.

**Questions for the owner:** none new; round 1's two stand.

**Owner pair added**
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/07-home-unread-arrows-and-missing-line-NOT-real-360x740-light.png — Home with Service-Desk's read made to fail (a made-up failure, NOT real; Alpha made up, NOT real). Before (1382866) vs after (3c4bb80): the grey "Service-Desk not read since 10:01, its lines may be missing" line, and the arrows on both tiles, including the one that can't be read.
- Pairs 01 to 06 from round 1 are unchanged and still current (the arrows are identical at 3c4bb80).

Round-2 captures and JSON are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/r2/, made with /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/scripts/cap8r2.mjs. Test output: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/r2-tests.txt. Nothing in the repository was changed (/home/user/sd-g8 is clean, HEAD 3c4bb80).
