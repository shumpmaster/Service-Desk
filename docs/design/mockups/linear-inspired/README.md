# Linear-inspired desk: screenshots

Screenshots of [../linear-inspired.html](../linear-inspired.html): the redesign direction
([../redesign-direction.html](../redesign-direction.html)) with Linear's general theme as a starting point. The
owner's words: "Can you mockup what the integration of linear UI elements would look like? Keep in mind im not
trying to recreate linear, just just using the general theme as a design starting point". Studied from the
owner's 36 Linear Mobile iOS screenshots. Eight phone frames at 414 × 896; not built.

- **Taken from Linear:** a white ground; thin rows with hairlines, no filled cards; a small status glyph at each
  row's start; small grey section headings with a count ("Waiting on you · 5"); the large bold title with a
  floating pill of icon buttons at the right; a grey id and age line; a quiet trailing action ("Merge ↗"); swipe
  right for Done; floating rounded sheets with lists; a snooze sheet; a dark toast ("Marked done · Undo"); a
  floating rounded bar.
- **Kept ours:** IBM Plex Sans with Plex Mono for ids and times; vermilion meaning "needs you" only, on the
  glyphs, the Waiting badge and the one accent button in a sheet; our own glyphs (◆ needs you, ↩ kicked back,
  ✓ done); our words; three labelled tabs, Waiting, Plan and Projects (Linear's bar is icons only).
- **Type:** 20, 15, 13 and 11 px from the audit's scale, plus 14 px for row titles (the one exception, at
  regular weight as Linear's are). Weights 400, 600 and 700.
- **One departure from the audit's brief:** the floating bar, sheets and icon pill use a soft shadow, as Linear's
  do; the brief said no shadows.
- **Snooze is a proposal, not ruled.** Its times are counted from 12:20 on Monday 19 Oct; 09:00 for "tomorrow"
  and "next week" is part of the proposal.
- **Content:** the same real items from 19 Oct as the redesign direction, shown as examples, with ages and times
  from their GitHub records as at 12:20 on 19 Oct, Chicago time. "checked 2 min ago" and the "At work now" line are
  examples.

| File | Frame |
|---|---|
| 1-waiting-lanes.png | Waiting, option L: the three lanes left to right, as compact rows with no fills |
| 2-waiting-grouped.png | Waiting, option G: one list grouped as Waiting on you, Kicked back, Done; #130 part-way through a swipe to Done; the toast confirms #126 |
| 3-card-sheet.png | A question's sheet: chips "Answer A/B/C", the recommendation tagged, shown after you tap C; one accent button |
| 4-snooze-proposal.png | The snooze sheet, marked "Proposal, not ruled" |
| 5-plan.png | Plan: the milestones ahead in order as thin rows, the rough finish at the right |
| 6-project-page.png | Service-Desk's page. Linear's Overview and Issues tabs were not taken, since one page fits |
| 7-all-clear.png | Waiting, all clear: one icon and one line, with when it was checked |
| 8-grouped-dark.png | Option G in dark mode |

Checked with Playwright Chromium, with the fonts confirmed loaded: nothing scrolls sideways at 360, 414 or 1280;
every tap area is at least 36 px; every piece of text is at least 4.5:1 (lowest 4.78:1); only the sizes above and
three weights appear; at most 8 distinct colours in a frame; no script errors. The capture served the Google Fonts
files from copies fetched with curl, since the headless browser can't reach Google Fonts in this environment.
