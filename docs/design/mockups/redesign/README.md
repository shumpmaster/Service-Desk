# Redesign direction: screenshots

Screenshots of [../redesign-direction.html](../redesign-direction.html), the shape proposed in the design audit of
19 Oct ([../../audit-2026-10-19.md](../../audit-2026-10-19.md), §5 and §6) drawn as eight phone frames at 414 × 896.
It is a direction, not built. The opening screen is the approved board (version 5) across all projects, restyled to
the audit's type and colour, with one bar of three tabs: Waiting, Plan, Projects.

- **Type:** four sizes, 20, 15, 13 and 11 px (nothing under 11), and three weights, 400, 600 and 700. IBM Plex Sans,
  with IBM Plex Mono for refs, ages and times, loaded from Google Fonts.
- **Colour:** five neutrals (page, surface, line, ink, ink-2), vermilion as the only accent (what needs you, and your
  action), green for confirmed and crimson for failing, all as tokens. At most 9 distinct colours in any frame.
- **Cards:** a fill, with no border, rule or shadow, and one verb pill each. The sheet is about 55% high, with one
  accent button; a question's options are chips, the recommendation tagged and never picked for you.
- **Content:** real items from 19 Oct, shown as examples. Ages and times come from their GitHub records, as at 12:20 on
  19 Oct, Chicago time. The all-clear Done list is 19 Oct's real merges and answers. "checked 2 min ago" and the
  "At work now" line are examples. Milestones, rough finishes (the Chief of Staff's estimates of 19 Oct, added up in
  order from 19 Oct), the phase sentence and Personal-Org-Operating-Model's sprint m1.4 are the real records.

| File | Frame |
|---|---|
| 1-waiting.png | Waiting, the opening screen: 5 waiting, 1 kicked back, 2 done |
| 2-card-sheet.png | The card sheet for a question, after you tap "Answer C" |
| 3-plan.png | Plan: the milestones ahead in order, each with its rough finish |
| 4-projects.png | Projects: one row per project, with the Details list at the foot |
| 5-project-page.png | Service-Desk's page: the sentence, the phase strip, "At work now", its own milestones around NOW |
| 6-details.png | The Details list at the foot of Projects (a shorter frame, scrolled to the foot) |
| 7-all-clear.png | Waiting, all clear: "Nothing waiting on you", with today's Done list |
| 8-waiting-dark.png | Frame 1, dark |

Checked with Playwright Chromium, with the fonts confirmed loaded: nothing scrolls sideways at 360, 414 or 1280; every
tap area is at least 36 px; every piece of text is at least 4.5:1 (lowest 4.78:1, white on the vermilion pills); only
the four sizes and three weights appear; no "not recorded", "not available" or "none" in any frame; no script errors.
In this environment the headless browser can't reach Google Fonts itself, so the capture served the same font files,
fetched beforehand with curl; the page itself loads them from Google Fonts.
