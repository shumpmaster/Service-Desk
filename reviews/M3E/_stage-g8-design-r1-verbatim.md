# M3E stage G8: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8 at 16e05bd (G8's work over 1382866).

---

Verdict: PASS

**Summary for the owner.** Nothing failed and nothing was skipped. The small dark "now" arrow is now on all five drawings you approved: the Timeline's Now line (where the short bar was), above the now phase on a project's strip, beside the now run on each Home tile, beside the next milestone to reach on Plan, and beside the next milestone to reach when you open the phase that is now. The grey up-arrow that used to sit at the top of an opened phase is gone. Each arrow is the same solid ink triangle, the size and place the spec and your approved mock set. It is easy to see in light and dark, never makes the page scroll sideways at phone width, doesn't move, and screen readers skip it; the words beside it ("now", "Now", "next to reach") are unchanged. Where two or three runs share the same name, the arrow is on the right run only. All of it can be undone. You have two questions to answer, both about cases the mock didn't draw. First, on a Home tile, when a line leads into the now circle, the arrow lands on that line and can look like the line's arrowhead. That will be the usual look for a project in its first run. Second, on Plan while you reorder, the new arrow shares the screen with the filled ▲/▼ triangles on the move buttons. Neither breaks your ruling.

**Evidence, by checklist item**
- Item 1 (rulings, P-001-glance2-arrow A): there are 0 arrows on all 124 before-captures and 1 to 5 arrows on the after-captures, in exactly the five places. The old reading arrow (`.v2-arrow`) counted 2–8 per opened page before and 0 after. Its CSS is removed (sandbox.css, old :1024-1025). The `.v2-nowl::before` bar is gone: computed `content: none`. "↑ start at the foot" stays as text, as AC92 (b) says (note 15's bottom-up order is unchanged).
- Item 2 (AC92 (b)): measured in Chromium at both widths and in both themes:
  - Timeline: 8×10 px, pointing right, centred 0.3 px off the rail.
  - Strip: 10×6 px, pointing down, centred 0 px off the bar, with its top 9 px above the bar's top (a 3 px gap). This is the mock's `top:-9px` exactly.
  - Tile: 6×8 px, 3 px left of the icon, 0 px off its centre.
  - Plan: 6×8 px at x 4–10, inside the 16 px margin, level with the icon.
  - Opened phase: 6×8 px, 0 px off the thin line, level with the icon.
  - Every arrow is `clip-path: polygon(...)` on an empty span, with none pointing up.
- Run identity: verified against made-up fixtures (NOT real):
  - `mix`: the arrow is on Design run 2, not on either "Build-i1" run.
  - `nowShared('build')`: on run 1's Build, not run 3's, in both the tile and the opened phase ("Run 1 · now").
  - `nowShared('launch')` on `gates`: on run 2's Launch only, not runs 3 and 4. This holds on the tile, the strip, the opened phase (under "Run 2 · … · now") and the Timeline (the "Launch · run 2" block).
  - v2.5: one arrow when one sprint is open, none with two open or none open. Its Timeline has no Now line, before or after.
- Items 6 and 12 (every project, width): fixtures `text` (Service-Desk), POOM and `md-extremes` (`ext`: Alpha, Epsilon long name, Delta v2.5) render with 0 page errors. Sideways scroll is 0 px in all 124 after-captures (31 screens × 360×740 / 414×896 × light / dark). Rendered text is identical before and after (only "checked N s ago" timing noise), and every page height is identical, so no layout moved.
- Items 10, 13, 14, 25 (contrast, colour): the fill is `--ink` (#18191c light, #ecedef dark). As a graphic it measures 16.99–17.58:1 in light and 15.15–16.25:1 in dark, well over 3:1. It adds no colour and no vermilion.
- Item 24 (motion): computed `animation-name: none` and `transition-duration: 0s` on every arrow.
- Screen readers: every arrow has `aria-hidden` true (`hereMark`, sandbox.js:1311) and empty text. The words "run 2 · now", "next to reach", "Now · 14 Oct" and "Now: Design, run 2" are unchanged.
- Items 26, 27, 35 (part B): mockup v2 doesn't draw the arrow. The build matches the owner-approved glance mock (changes2.js q3: same sizes and offsets, and its r2-q3 shots). It changes no text size and adds no key.
- Tests: the full suite on 16e05bd gives 1254 pass, 0 fail. ac92-glance-arrow.test.mjs gives 8/8.

**Blocking findings:** none.

**Non-blocking notes**
1. **Arrow on a line (Home tile).** When the now cell has a line coming in from the left (class `l`, e.g. Alpha's Launch run 2 in `nowShared('launch')`), the arrow sits 3 px before the icon, on top of the connector. It then looks like an arrowhead on that line ("Build leads to Launch") more than a "you are here" mark. The spec's placement (AC92 (b), "3 px left of the now phase run's icon") and the mock both put it there. But the mock's q3 shot only showed the first-in-row case, which has no line. Every project in its first run past Discovery will look like this. Pair 04 shows both cases.
2. **Other filled triangles on Plan.** While reordering, the move buttons draw filled ink ▲/▼ triangles (`vi('up'|'down')`, sandbox.js:3712). They share the screen with the new ▶. They sit inside grey buttons with labels, and AC92 (b)'s "no two triangles mean two things" names only the opened phase's reading arrow, so this breaks no ruling. Ordering mode also shows two ▶ in one list, one for each project's next-to-reach row, with the project's name on each row.
3. "Centred 9 px above the bar" (AC92 (b)) is built as top edge 9 px above, centre 6 px above. That is the mock's value and what the test pins. The spec's words could be read either way; worth tightening in a later draft.
4. No pre-existing failures beyond the known `--soft` follow-up turned up on these screens.

**Questions for the owner (asked, not picked)**
- On a Home tile where a line runs into the now circle, should the arrow stay where it is (on the line, as the spec and mock place it)? Or should that case be drawn differently, for example with the line stopping short or the arrow moved off the line?
- On Plan while you reorder, are the filled ▲/▼ move buttons fine beside the ▶ "now" arrow? Or would you rather the move buttons use a different shape?

**Owner pairs** (side by side, before 1382866 | after 16e05bd), in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/01-timeline-now-line-360x740-light.png — Timeline: the Now line's bar becomes the arrow on the rail (Service-Desk test copy).
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/02-page-strip-414x896-dark.png — project page: the down arrow over Design, run 2.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/03-opened-phase-360x740-light.png — opened Design: the grey up-arrow gone; the arrow on the line at MD3, next to reach.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/04-home-tiles-NOT-real-360x740-light.png — Home: the made-up Alpha (NOT real), arrow on the line into Launch run 2 (note 1), above Service-Desk's arrow before its circle.
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/05-plan-414x896-dark.png — Plan: the margin arrow at MD3, next to reach (the Alpha group below is made up, NOT real).
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/owner-pairs-final/06-plan-ordering-360x740-light.png — Plan while reordering: ▶ beside "3", with the ▲/▼ move buttons on the same screen (note 2).

All 124 before and 124 after captures, with per-shot JSON (text, computed styles, arrow geometry), are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/before/ and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/after/. The capture script is /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8-design/scripts/cap8.mjs. Nothing in the repository was changed.
