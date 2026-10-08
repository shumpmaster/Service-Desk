Verdict: PASS

Every quoted row in the memo matched its source, with the exceptions below. I filed four of the six proposed entries and held two back. I could only read pages through a summarising fetch, never raw HTML, so each match is the fetch's word-for-word report. I did not commit anything; there is no git repository here.

## Findings (all in `research/Q-013-memo.md`)

**Confirmed against the cited page**
- **Rows 1.1–1.7:**
  - The Nielsen, Budiu and Laubheimer quotes matched.
  - The Apple Widgets, Live Activities and Charting data quotes matched.
  - One small difference: Nielsen's sentence reads "Second, label the button or link…", and the memo capitalises "Label". The meaning is unchanged.
- **Rows 2.1–2.7:**
  - The UK Analysis Function, Wilke, Kaplan and Apple Loading quotes matched.
  - The Carbon quotes matched, including "at least two of the following elements: color, shape, or symbol".
  - Apple Widgets row 2.3 failed on the first fetch. A second, narrower fetch returned both sentences exactly, so it passes.
  - The Carbon grey and purple meanings came back as "drafts or unstarted tasks" and "outliers or undefined statuses". Both match the memo's paraphrase, so I did not file them.
- **Rows 3.1–3.7:**
  - The web.dev quotes matched (authors Mihajlija and Walton).
  - The WCAG 2.2.2 and 4.1.3 quotes matched, as did the Budiu, Flaherty and Apple Notifications quotes.
  - The Carbon numbered-badge sentence matched exactly.
- **Rows 4.1–4.5:**
  - The WCAG 1.4.1, 1.4.3, 1.4.11, 2.5.8, 2.5.5 and 2.3.3 values and exceptions matched.
  - The Apple Accessibility values matched: 44×44 pt default, 28×28 pt minimum, the contrast table, and the Reduce Motion quote.
  - The Android quotes matched: 48dp, "Larger is even better.", and the 18sp/14sp rule with "For all other text… at least 3:1."

**Rulings the memo asked for**
- **Row 1.5:** I rule it is not corroborated. Budiu's page says a link label should accurately describe the page. Nielsen's says the label should set expectations for the next level. These are related points, not the same one, so the claim stays single source, grade B.
- **Row 3.5:** I agree with the memo's withdrawal of "corroborated". The NN/g and Carbon points are related but separate.
- **The ⚑ sources (Carbon, UK Analysis Function, Wilke, web.dev):** the brief names platform guidelines, accessibility standards and usability research. `governance/standards/sources.md` has no wider ruling, and I can't widen it. Rows resting only on those sources are held out of the library until the owner rules (Q2 in the memo).

## Filed
- `library/facts/F-wcag22-01.md`, grade A, covers rows 3.1, 3.7 and 4.1–4.5.
- `library/facts/F-platform-targets-contrast-01.md`, grade A per publisher, records the Apple, Android and WCAG disagreements without choosing.
- `library/patterns/P-glance-disclosure-01.md`, grade B, covers rows 1.1–1.6.
- `library/patterns/P-stale-visible-01.md`, grade B, covers rows 2.3, 2.4 and 2.6, and notes the tension with 2.7.

## Not filed
- **P-zero-means-zero-01:** it rests only on the UK Analysis Function and Wilke, both ⚑. The quotes themselves are confirmed.
- **P-live-update-layout-01:** it depends on web.dev (⚑, row 3.2) and Carbon (⚑, row 3.5). The quotes are confirmed. I held it back with the other ⚑ entry.

## Open questions
1. **Q2:** may design systems, government style guides, textbooks and web.dev count as sources? The two held entries wait on this ruling.
2. **Q4:** does the WCAG 2.2.2 "essential" exception cover a screen whose whole purpose is live status? The sources don't say. The filed entry marks it not documented.
3. **Gaps the memo reports and I did not try to fill:** visibly fading stale data, "new since last visit", gauges, Material's own wording, and a second source for the two-level limit.
4. **Q3:** the Material pages still need re-trying. They sit in the memo's "Not opened" list, which I did not check, as the brief says.