# Mockup v41 build layer

v41 is v40 plus this layer. It carries out the owner's comments on v40, round 8, answers 20 to 23 (decisions/questions/P-005-design-round-8.md):

- 20, on home's title band: "Why so much empty space here?"
- 21, on home's Longest wait row: "Can we make this Liquid Glass style too?"
- 22, on home's waiting row: "Can you add the title of the “event” or step that is waiting on me on the main page?"
- 23, on the map card's filter: "When things are filtered I would like the table to adjust and show me only that filtered view."

```
python3 v41.py ../timeline-v40-craft.html ../timeline-v41-craft.html
```

The code is in `source/`:

- `header.css`, `header.js`: the title block rises into the slim bar's slot. The live label sits on the capsule's row, centred on it; the title is under it, the mark under the title, and the band ends 14 below the mark. The slot catches no taps but the capsule's until the bar takes over. The bar takes over at 52 of the 64 points (32 with reduced motion, where it snaps), so the large and small titles never both vanish. The project lines start under the strip.
- `cards.css`: home's project groups become glass like the map card (v39), and each waiting row gets its event line. In dark, the secondary words are one step lighter on the glass (#a7a7ad). Solid under reduced transparency or more contrast.
- `events.js`: the event each waiting row hangs from, taken from the timeline's own rows:
  - Stop card 5 is 2.2.2.10 in S-011;
  - PR #446's three questions hang from the merge 2.2.2.5 in S-011;
  - the widget's call hangs from 1.8.1.2, its readiness check, in The brief.
- `filter41.css`, `filter41.js`: the filtered list.
  - v40's `fhApply` now hands the list to `__fh41`. Rows a cut leaves out are hidden; headings that hold matches stay, with "N hidden"; headings with none fold away.
  - The row at the pointer keeps its place while rows go and come back. Any touch, wheel or key ends that hold.
  - Hiding takes 240 and showing 320, on the standard curve; reduced motion snaps.
  - When nothing open matches, one line says so.

`v41.py` also makes three text patches to v40's code, each asserted to occur once:

- the two project-line wordings;
- `fhInfo` keeps each station's kind across the map's redraws, so a cut still matches rows of a phase the map is not drawing;
- the phase in view skips a phase the filter has folded away. Before this fix, the map and pill jumped to Launch.

## Checks

Playwright, Chromium. Runs: 393×852 and 360×740 in light and dark, plus 393 with reduced motion and with reduced transparency. Rows marked "v40" were measured in the same runs.

| Check | v40 | v41 |
|---|---|---|
| Console errors, sideways scroll | none | none in every run |
| Home header: live label / title / mark tops (393) | 88 / 107 / 155 | 46 / 65 / 111 |
| Home header ends (393 and 360) | 177 | 129, 48 shorter |
| Label centre vs capsule centre | label 39 below the capsule | 53.5 vs 53 |
| Tap at the slot left of the capsule (60, 50) | the hidden bar | passes through, nothing interactive there |
| Scroll handover, large title / small title opacity at 0, 20, 40, 52, 64 | small title only from 64 | small title from 52 (1 / .72 / .44 / .27, then the bar); reduced motion: both snap at 32 |
| Search: open, label hidden under it, Cancel | — | works, every run |
| Project lines at 393 | 2 lines each (48) | 1 line each (31) |
| Project lines at 360 | 2 lines each | "Nothing at work" on 1; the at-work line wraps cleanly onto 2 |
| Home cards | white, no blur | glass: `blur(28px) saturate(2.2)`, rgba(255,255,255,.56), or rgba(44,44,50,.58) in dark |
| Home cards, reduced transparency | — | solid #fff, no blur |
| Event lines at 393 | — | 4 of 5 on one line; the widget's wraps with "The brief" kept whole; none cut |
| Event lines at 360 | — | the stop's on one line; the others wrap cleanly; none cut |

**Contrast on the glass cards and title band.** Each figure is the worst against any background pixel under the text.

| | light 393 | dark 393 | light 360 | dark 360 |
|---|---|---|---|---|
| Event line | 6.10 | 6.86 | 6.18 | 6.98 |
| Event line's kind and number | 16.0 | 17.4 | 16.0 | 17.4 |
| Live label | 5.91 | 6.56 | 5.92 | 6.56 |
| Longest wait | 4.70 | 4.77 | 4.70 | 4.77 |
| Date / subtitle / holds up / wait | 6.19 to 6.37 | 5.44 to 7.25 | 6.15 to 6.37 | 5.44 to 7.25 |
| Project line | 6.40 to 6.53 | 5.12 to 5.49 | 6.43 to 6.54 | 5.23 to 5.57 |

In dark mode at the v40 greys, "nothing new" measured 4.34, so it was lifted to #a7a7ad.

**Rows shown per cut**, opening at S-011's landing:

| Cut | Events | Headings | Gates | Counts on the headings | Stop card 5 |
|---|---|---|---|---|---|
| Everything | 12 | 25 | 3 | — | at the pointer |
| Yours | 4 | 3 (Design, M6, S-011) | 3 | 9 hidden on each | at the pointer (393: 478–659 vs 569; 360: 422–603 vs 513) |
| Turning points | 4 | 3 | 3 | 9 hidden on each | at the pointer |
| Reviews and checks | 4 | 3 | 0 | 9 hidden on each | hidden; 2.2.2.12 at the pointer |
| Research | 0 | 0 | 0 | — | "Nothing open matches “Research”…" |
| Main only | 1 | 3 | 0 | 12 hidden on each | hidden; 2.2.2.5 at the pointer |
| Cleared with the cross | 12 | 25 | 3 | — | the row that was at the pointer stays there |

In every cut, the map and pill stay on Design and the map fades what is left out.

**Kept from v33 to v40**, project page, measured against v40 in the same runs:

| Check | v40 | v41 |
|---|---|---|
| Landing: Stop card 5 at the pointer (393) | 478–659 | same |
| Landing: Stop card 5 at the pointer (360 dark) | 422–603 | same |
| Map card | 382 | same |
| Card fold | 382→114→382 | same |
| Filter: pick Yours, clear | works | same |
| Home waiting-row tap | — | does what it did in v40 |

The rest was checked in v40 and is untouched by this layer: the top row, Why, the sheets, the wait sheet, and Chicago times.

## Short

- **The Research cut shows nothing.** Its matches sit in milestones that are folded, so nothing is rendered for it to show. The list says so in one line.
- **"9 hidden" appears three times.** The Design, M6 and S-011 headings each count everything hidden under them, so the same 9 shows on all three.
- **A map label overlaps the filter button.** With a cut picked, "2.3.2 Mockups v2 to v4" runs under the filter button's left edge. This layer does not touch the map's labels.

Screenshots are outside the repository, in `/tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/v41/`.
