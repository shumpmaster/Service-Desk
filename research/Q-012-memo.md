# Q-012 memo, revision 3

**Researcher, 2026-10-08. Graded memo, depth 3. Topics: design, dashboards, information-design, accessibility, mobile.** This revision replaces research/Q-012-memo.md (revision 2) and answers research/Q-012-source-check.md (verdict FAIL).

I checked the library again. Six entries are already filed (LIB-F-q12-a, b, c, d, e, g and LIB-F-q12-f), plus the pattern LIB-P-q12-a. No other entry shares a topic with this question. F-gh-09 is tagged "mobile" but covers GitHub Mobile, so it doesn't apply.

The grading rules are the same as in revision 2:
- **Guideline:** one authoritative source (Apple, Google or W3C).
- **Corroborated:** two sources by different authors say it.
- **Derivative of X:** a restatement of X, which does not count as a second source.
- **Single source:** only one source says it.
- **Not documented:** none of the sources I read says it.

Each statement is labelled fact, estimate or opinion. Opinions are my synthesis, not recommendations.

**How I read the sources.** I used a summarising fetch tool. Text in "quotes" is what the tool returned as verbatim on 2026-10-08. **[paraphrase]** marks text the tool did not return verbatim. **[r3]** marks statements I re-fetched in this round. The tool still can't read PDFs: the PDF reader fails with "pdftoppm is not installed". Pages that render with JavaScript (m3.material.io, and Apple's HTML pages) return only their titles.

**Rows not changed in this round.** Every row not marked [r3] is the same as in revision 2. The checker has independently confirmed the rows it lists as confirmed. The others rest on my own re-reads (see "Not yet independently checked" at the end).

---

## 1. Progressive disclosure

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 1.1 | "Dashboards are collections of data visualizations, presented in a single-page view that imparts at-a-glance information on which users can act quickly." | fact | corroborated, with 1.2 | Laubheimer, NN/g, 2017-06-18 |
| 1.2 | "Dashboards are designed to help us monitor what's going on at a glance—or at least, that's what they're supposed to do." I have not read Few's longer book definition. It is in a book, not a free page (see part 5). | fact | corroborated, with 1.1 | Few, Perceptual Edge blog, 2006-09-20 |
| 1.3 | "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request." | fact | corroborated, with 1.4 | Nielsen, NN/g, 2006-12-03 |
| 1.4 | "Use a disclosure control to hide details until they're relevant. … This organization helps people quickly find the most essential information without overwhelming them." | fact | guideline | Apple HIG, Disclosure controls |
| 1.5 | **[r3] Now one full verbatim sentence:** "In practice, designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." The tool placed it in the section "Usability Criteria for Progressive Disclosure". | fact | single source | Nielsen 2006 |
| 1.6 | "Label the button or link in a way that sets clear expectations for what users will find when they progress to the next level." | fact | corroborated, with 1.7 | Nielsen 2006 |
| 1.7 | Information scent is "the user's imperfect estimate of the value that the source will deliver to the user, derived from a representation of the source." Users "quickly decide that the page is not worth exploring any longer and simply leave". The page's only statement about trust concerns clickbait. | fact | corroborated, with 1.6, for the definition and the abandonment point only | Budiu, NN/g, 2020-02-02 |
| 1.8 | "Create a layout that provides essential information at a glance and allows people to view additional details by taking a longer look." Also: "Ensure that a widget interaction opens your app at the right location." "Balance information density." | fact | guideline; it is about widgets, not dashboards | Apple HIG, Widgets |
| 1.9 | Use a small chart "to offer glanceable information about an individual item or to provide a snapshot or preview of a larger version of the chart that people can reveal in a different view." Also: "You can also display brief descriptive text that serves as a headline or summary for a chart, helping people grasp essential information at a glance." | fact | guideline | Apple HIG, Charting data |
| 1.10 | "Overview first, zoom and filter, then details-on-demand." | fact | single source (a seminar abstract) | Shneiderman, Stanford seminar, 1998-02-20 |
| 1.11 | The page names three ways to decide what matters most: task analysis and field studies, frequency-of-use statistics, and observational usability testing. **[paraphrase]** | fact | single source | Nielsen 2006 |

**Not documented:**
- Which items belong on the first screen of a phone dashboard.
- How many items a phone overview should hold.

**Opinion (grade C).** The sources agree on three things:
- Put a few of the most important items first.
- Keep one level of detail below that. This now rests on the verbatim sentence in 1.5.
- Make each label predict what the detail screen holds.

## 2. A stage that can loop back, stall or wait

Rows 2.1 to 2.5 are the same as in revision 2. The checker confirmed 2.1 to 2.4 verbatim.

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 2.1 | "Determinate, for a task with a well-defined duration, such as a file conversion"; "Indeterminate, for unquantifiable tasks, such as loading or synchronizing complex data". Also: "An indeterminate progress indicator shows that a process is occurring, but it doesn't help people estimate how long a task will take." | fact | guideline | Apple HIG, Progress indicators |
| 2.2 | "Be as accurate as possible when reporting advancement … Showing 90 percent completion in five seconds and the last 10 percent in 5 minutes … can even feel deceptive." | fact | guideline | Apple HIG, Progress indicators |
| 2.3 | "People tend to associate a stationary indicator with a stalled process or a frozen app." | fact | guideline | Apple HIG, Progress indicators |
| 2.4 | "if the progress moves quickly only to hang on the last percentage remaining, the user will become frustrated and the benefits of showing progress will be negated." Also: "Percent-done progress indicators should be used for longer processes that take 10 or more seconds." | fact | single source for this specific failure (stalling at the end). For the narrower shared point, see 2.6. | Sherwin, NN/g, 2014-10-26 |
| 2.5 | "Present the latest update prominently, so users can find it first." "Maintain all previous updates alongside dates." "For processes that take a long time, provide regular updates, even if they are of low granularity." | fact | single source | Rosala, NN/g, 2019-02-03 |
| 2.6 | **[r3] New row, which makes the grade basis explicit.** Two authors each say that a percent-done indicator advancing at an uneven pace harms the user. Apple says it "can even feel deceptive" (2.2). Sherwin says it frustrates the user and negates the benefit (2.4). They describe different failures: Apple a general unevenness, Sherwin a stall at the end. They agree only on the shared point. | fact | corroborated, for the shared point only | 2.2 and 2.4 |

**Not documented:** how to draw a stage that loops back. **[r3]** The Material 3 progress page returned only its title (it renders with JavaScript), so it is still unread.

**Opinions (grade C):**
- 2.1 and 2.4 suggest that a fill bar or a percentage would misstate open-ended work.
- 2.3 suggests that on Apple platforms a static marker can read as "stalled".

## 3. A one-line "where it's heading" summary

These rows are the same as in revision 2.

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 3.1 | "Descriptive text titles, subtitles, and annotations help emphasize the most important information in a chart and can highlight actionable takeaways." Also: "Although a descriptive headline or summary can make a chart more accessible, it doesn't take the place of accessibility labels." | fact | guideline | Apple HIG, Charting data |
| 3.2 | "When an external event or the passage of time caused a change in the state of the system, explain it in brief but understandable terms." | fact | single source | Harley, NN/g, 2018-06-03 |
| 3.3 | "Throughout the user journey, ensure you set expectations for the wait time. Where possible, state exactly what the wait time will be." | fact | single source | Rosala 2019 |

**Not documented:** how to write a forward-looking summary without overclaiming. The nearest statements are 2.2 and Budiu's clickbait sentence (1.7).

## 4. Telling kinds of item apart without ranking them

These rows are the same as in revision 2. The checker confirmed 4.2 verbatim.

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 4.1 | "Qualitative schemes do not imply magnitude differences between legend classes, and hues are used to create the primary visual differences between classes." | fact | corroborated, with 4.2(a) | Brewer, ColorBrewer |
| 4.2 | (a) "people do not perceive different colors as being in a particular order, so color should not be used to communicate information about quantitative values or magnitude"<br>(b) "color properties such as hue or saturation are helpful as a secondary grouping cue, rather than as the main way of showing groups or categories"<br>(c) "Shape or clear visual grouping are more reliable signals for relatedness"<br>(d) "using color properties can help reinforce those relationships"<br>(e) "the combination of color and shape together make for a more noticeable signal than either alone" | fact | (a) corroborated, with 4.1; (b) to (e) single source | Laubheimer 2017 |
| 4.3 | "Offer visual indicators, like distinct shapes or icons, in addition to color to help people perceive differences in function and changes in state." | fact | guideline; it corroborates 4.2(c) | Apple HIG, Accessibility |
| 4.4 | "If the color red only appeared on the dashboard next to items that needed attention, people would able to spot the problems much faster." ("would able" is the source's own wording.) | fact | single source | Few 2006 |

**Tension (grade C).** 4.1 and 4.2 support using hue to tell categories apart. 4.4 shows that a reserved colour reads as "needs attention", which ranks items.

**Not documented:** how to mark decisions that can't be undone, or that take effect by default if nobody acts.

## 5. A screen that updates itself every minute

Rows 5.1 to 5.8 are the same as in revision 2.

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 5.1 | WCAG 2.2.2 (Level A): information that updates automatically, starts automatically and appears alongside other content needs "a mechanism for the user to pause, stop, or hide it or to control the frequency of the update unless … essential." | fact | guideline | W3C, Understanding 2.2.2 |
| 5.2 | Technique G76: "The objective of this technique is to let the user control if and when content is updated, in order to avoid confusion or disorientation". Also: "When a page is refreshed, the screen reader's 'virtual cursor', which marks the user's current location on the page, is moved to the top". G76 is sufficient for 2.2.4 and 3.2.5, both Level AAA. | fact | guideline | W3C, G76 |
| 5.3 | SC 3.2.5 (AAA): "Changes of context are initiated only by user request or a mechanism is available to turn off such changes." Also: "A change of content is not always a change of context." | fact | guideline | W3C, Understanding 3.2.5 |
| 5.4 | "Unexpected layout shifts can disrupt the user experience in many ways, from causing them to lose their place while reading if the text moves suddenly, to making them click the wrong link or button." A good Cumulative Layout Shift (CLS) score is 0.1 or less, measured at the 75th percentile. Shifts within 500 ms of user input carry a `hadRecentInput` flag and **can be** excluded. **[paraphrase]** | fact | single source (Google web.dev, not a design guideline) | Mihajlija & Walton, web.dev |
| 5.5 | Change blindness is "people's tendency to ignore changes in a scene when they occur in a region that is far away from their focus of attention." Remedies: "Make one change at a time."; "Group all elements that will change simultaneously in the same region of the screen…"; "Use animation to signal change, but avoid having too many competing animations on the screen…"; "Dim the areas of the screen that do not change, in order to attract attention to changes." | fact | single source | Budiu, NN/g, 2018-09-23 |
| 5.6 | "Indicators are conditional— they are not always present, but appear or change depending on certain conditions." "If a notification is contextual and relates to a specific element in the interface, an icon indicator on the element can communicate where that notification applies and catch the user's attention." | fact | single source | Flaherty, NN/g, 2024-01-17 |
| 5.7 | SC 4.1.3 (AA): "status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus." | fact | guideline | W3C, Understanding 4.1.3 |
| 5.8 | "ensure your app or game responds by reducing automatic and repetitive animations, including zooming, scaling, and peripheral motion". Also: "Replacing transitions in x-, y-, and z-axes with fades to avoid motion". | fact | guideline | Apple HIG, Accessibility |

**Not documented:**
- An authoritative rule on reordering a list under the user's finger.
- A "new since your last visit" marker.

**Tension (grade C).** 5.5 recommends animation to signal a change. 5.8 and WCAG 2.3.3 say motion must be reducible.

## 6. An activity view

No acceptable source covers this. The nearest guidance is 2.5.

## 7. Timelines on a 360 px screen

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 7.1 | **[r3] Corrected.** The abstract says verbatim: "Informed by a survey of 263 timelines, we present a design space for storytelling with timelines that balances expressiveness and effectiveness, identifying 14 design choices characterized by three dimensions: representation, scale, and layout." The project page's Figure 6 caption mentions "a scale transition from chronological to sequential", which confirms that both are scale options. **Withdrawn:** revision 2 said the paper "names three scales". Search-engine summaries in this round list five scales (chronological, relative, logarithmic, sequential, collapsed). That list is **unverified**, and so is the definition of the sequential scale ("the distance between time points is fixed and does not correspond to the temporal distance"), which also comes only from a search summary. | fact (the abstract and caption); the scale list and definitions are unverified | single source (the paper's own abstract and project page). The scale list and definitions are **not graded and not proposed.** | Brehmer, Lee, Bach, Riche & Munzner, IEEE TVCG 23(9), 2017. Abstract via research.ed.ac.uk; caption via timelinesrevisited.github.io. The PDFs (aviz.fr, timelinesrevisited.github.io/preprint.pdf, microsoft.com) are unread. |
| 7.2 | "Another interesting approach is collapsing time and/or using different representations for different granularities." | fact | single source (an interview) | Brehmer quoted by Rodrigues, Storybench, 2017-05-19 |

**Not documented:**
- Timeline layout at 360 px.
- Placing undated planned items next to past events.

**Opinion (grade C), conditional.** If the sequential definition is confirmed, a sequential scale is the option in this design space that doesn't need event durations to be comparable. Until then this is opinion on an unverified premise.

## 8. Values that are unknown, stale or estimated

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 8.1 | **[r3] The wording now matches the checker's full-sentence read.** The survey, citing Song & Szafir 2019, says: "highlighting the missing data and local linear imputation resulted in higher perceived confidence and data quality". It also says that visualizations which "break the visual continuity of a graph reduce the perception of quality in data and can bias interpretation". I could not get the original abstract in this round: experts.colorado.edu returned metadata only (IEEE TVCG 25(1):914–924, DOI 10.1109/tvcg.2018.2864914), and the NSF PAR copy is a PDF. | fact | derivative of Song & Szafir (via the survey) | Alsufyani, Forshaw & Fernstad, arXiv 2410.03712v1 |
| 8.2 | "users may not notice that data is missing when it is replaced by a default value" (the survey, citing Eaton et al. 2005) | fact | derivative of Eaton et al. | the same survey |
| 8.3 | "emptiness plus explanation was the most preferred technique with the highest degree of decision confidence" (the survey, citing Andreasson & Riveiro 2014) | fact | derivative of Andreasson & Riveiro | the same survey |
| 8.4 | Users "may not grasp that such predictions are subject to uncertainty". Also: "quantile dotplots reduce the variance of probabilistic estimates by ~1.15 times compared to density plots". The setting is a phone app showing bus arrival times. | fact | single source | Kay, Kola, Hullman & Munson, CHI 2016 |
| 8.5 | "If people are likely to check your widget more frequently than you can update it, consider displaying text that describes when the data was last updated." | fact | guideline | Apple HIG, Widgets |
| 8.6 | "Create an effective placeholder appearance by combining static interface components with semi-opaque shapes that stand in for dynamic content." | fact | guideline; it is about loading states | Apple HIG, Widgets |
| 8.7 | "Write succinct labels that describe the current value and both endpoints of the range." | fact | guideline | Apple HIG, Gauges |

**Not documented:**
- Stale data that visibly degrades over time.
- Unknown values shown inside a gauge.

## 9. Standards lookup

Where the platforms differ, I report each with its source and don't choose between them. Every row is the same as in revision 2 except Apple's touch target.

| Topic | Source | Text |
|---|---|---|
| Colour not used alone | WCAG 1.4.1 (A) | "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." |
| Colour not used alone | Apple HIG | "Convey information with more than color alone." |
| Text contrast | WCAG 1.4.3 (AA) | 4.5:1. Large text 3:1 (at least 18 point, or 14 point bold). |
| Text contrast | Android Developers | Text "smaller than 18sp, or if the text is bold and smaller than 14sp" needs "at least 4.5:1". All other text needs "at least 3:1". |
| Graphics contrast | WCAG 1.4.11 (AA) | 3:1 for graphical objects, including "each line in a graph". Example: "Status icons on an application's dashboard (without associated text) have a 3:1 minimum contrast ratio." |
| Touch target | WCAG 2.5.8 (AA) / 2.5.5 (AAA) | 24×24 CSS px, with five exceptions / 44×44 CSS px |
| Touch target | **[r3]** Apple HIG, Accessibility (JSON endpoint) | The tool returned the column headers verbatim as "Platform \| Default control size \| Minimum control size", and the row as "iOS, iPadOS \| 44x44 pt \| 28x28 pt". The sentence before the table: "Strive to meet the recommended minimum control size for each platform to ensure controls and menus are comfortable for all when tapping and clicking." On padding: "about 12 points of padding around elements that include a bezel. For elements without a bezel, about 24 points of padding". In this round the HTML page returned only its title, so the checker's earlier "minimum 44" HTML reading still can't be compared against a rendered page. |
| Touch target | Android Developers / Google Accessibility Help | "at least 48dp x 48dp" / "at least 48x48dp, separated by 8dp of space or more" |
| Reduced motion | WCAG 2.3.3 (AAA) | "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed." |
| Reduced motion | Apple HIG | See 5.8. |

---

## Proposed library entries (for the Source checker; none marked as checked)

```yaml
- id: LIB-F-q12-e2-progress-honesty      # supersedes LIB-F-q12-e (filed entries can't be edited)
  form: fact
  claim: "Two authors say a percent-done indicator that advances unevenly harms the user. Apple HIG: 'Showing 90 percent completion in five seconds and the last 10 percent in 5 minutes ... can even feel deceptive.' NN/g (Sherwin 2014): 'if the progress moves quickly only to hang on the last percentage remaining, the user will become frustrated and the benefits of showing progress will be negated.' They describe different failures (uneven pace vs a stall at the end); only the shared point is corroborated. Apple also: determinate is 'for a task with a well-defined duration', indeterminate 'for unquantifiable tasks'; 'People tend to associate a stationary indicator with a stalled process or a frozen app.'"
  grade: B for the shared point (corroborated); A for each Apple guideline sentence taken alone
  shelf_life: 24 months
  topics: [design, dashboards]
  sources: [https://developer.apple.com/design/human-interface-guidelines/progress-indicators, https://www.nngroup.com/articles/progress-indicators/]
  note: the "negated" clause and the indeterminate quotes were confirmed by the checker on 2026-10-08

- id: LIB-F-q12-h-disclosure-levels
  form: fact
  claim: "Nielsen (NN/g, 2006-12-03): 'In practice, designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels.'"
  grade: C (single source; an expert practitioner article, not a study)
  shelf_life: 60 months
  topics: [design, dashboards, mobile]
  sources: [https://www.nngroup.com/articles/progressive-disclosure/]
  note: would let LIB-P-q12-a cite this sentence verbatim instead of its current paraphrase

- id: LIB-F-q12-b2-platform-target-sizes  # supersedes LIB-F-q12-b only if the checker agrees
  form: fact
  claim: "Apple HIG Accessibility table, columns 'Platform | Default control size | Minimum control size': 'iOS, iPadOS | 44x44 pt | 28x28 pt' (JSON endpoint). Android/Google: at least 48x48 dp, separated by 8 dp or more. Reported without choosing."
  grade: A (each a guideline); keep the caution until the HTML page is rendered
  shelf_life: 12 months
  topics: [accessibility, mobile, design]
  sources: [https://developer.apple.com/design/human-interface-guidelines/accessibility, https://developer.android.com/guide/topics/ui/accessibility/apps, https://support.google.com/accessibility/android/answer/7101858]
```

I'm not proposing 7.1's scale list or definitions, or anything based on Song & Szafir's own paper.

---

## Six-part contract

**1. What I changed.** I have no write tool, so the memo text above is my only output. Nothing is on disk.
- **1.5:** the earlier excerpt is replaced by Nielsen's full verbatim sentence.
- **7.1:** I withdrew revision 2's "names three scales". Search summaries list five scales, so that claim was wrong. I narrowed the row to what is verified: the abstract (14 choices across three dimensions) and the figure caption naming chronological and sequential scales. The scale list and definitions are marked unverified, and the timeline opinion is now conditional.
- **8.1:** the wording now matches the checker's full sentences ("…and data quality", "…and can bias interpretation").
- **2.4 and 2.6:** I separated the single-source statement from the narrower point two authors share, so entry e's grade has an explicit basis.
- **Section 9, Apple row:** added the verbatim column headers and the sentence before the table.
- **Entries:** proposed e2 to supersede e, with the "negated" clause; a new entry h for the verbatim Nielsen sentence; and b2 to supersede b.

**2. Why.** The source check failed on statements it couldn't verify: Nielsen's two-level sentence, Brehmer's scales (7.1), the Song & Szafir original, Few's book, Material 3, and sections it didn't re-open. It also asked whether entry e's grade still holds and raised the Apple 28 pt against 44 pt conflict. While re-checking 7.1, I found that revision 2's "three scales" was itself a misstatement, so I withdrew it.

**3. What I verified.** These were tool calls; I have no shell.
- **Nielsen progressive-disclosure page (WebFetch):** returned the full two-level sentence verbatim. Confirmed.
- **Apple Accessibility:**
  - **JSON endpoint (two WebFetch calls):** returned the table headers "Default control size | Minimum control size" with the row 44x44 / 28x28, plus the sentence before the table. The tool reported that no text calls 44 pt a minimum.
  - **HTML page:** returned only its title. The conflict is not settled.
- **Brehmer et al.:**
  - **Edinburgh research portal:** the abstract was confirmed verbatim. It doesn't name the individual scales.
  - **timelinesrevisited.github.io:** the Figure 6 caption names chronological and sequential. No definitions are on the page.
  - **aviz.fr PDF and project preprint PDF:** came back as binary. Reading the saved file failed with "pdftoppm is not installed".
  - **Semantic Scholar:** HTTP 403.
  - **Two searches (standard and extended):** returned the five-scale list and the sequential definition, as search summaries only.
- **Song & Szafir:** a search found the paper and the DOI. experts.colorado.edu returned metadata without the abstract.
- **m3.material.io progress indicators:** returned only the page title.

**4. What is undone.**
- The 7.1 scale list and definitions.
- Song & Szafir's own wording.
- Few's book definition.
- The Material 3 pages.
- A rendered check of Apple's HTML table.
- The six topics with no documentation: loop-back stages, the activity view, reorder rules, a "new since last visit" marker, visibly degrading stale data, and unknown values in gauges.
- **Not yet independently checked:** the checker did not re-open sections 1.2, 1.9–1.11, 2.5, 3.x, 5.2–5.8 and 8.4–8.7. They still rest on my own re-reads, which can't count as checks of my own facts.

**5. What is needed outside my lane.**
- A PDF renderer (poppler-utils) or a human read of three PDFs: Brehmer TVCG 2017, Song & Szafir via NSF PAR, and the arXiv 2206.09910 body.
- A browser render of Apple's Accessibility page and of m3.material.io.
- Few's book (*Information Dashboard Design*) is a paid source. If its definition is wanted, the Chief of Staff would need to put a decision card to the owner. Otherwise 1.2 stands on the blog post alone.
- The checker needs to re-open the sections listed above.
- No level-5 expert is needed.

**6. Open questions.** These are added; none are closed.
- Does the checker accept e2's split, with B for the shared uneven-progress point and the separate failures kept apart, or should e stay as filed?
- Should LIB-P-q12-a be superseded so it quotes Nielsen's sentence verbatim (entry h)?
- Has any HCI study looked at showing progress that moves backwards, meaning stages that loop back? This needs a follow-up field scan.
- Should the timeline design wait until 7.1 is checked against the PDF?

Sources:
- [Nielsen, Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Apple HIG Accessibility (JSON)](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json), [Apple HIG Accessibility (HTML)](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Brehmer et al. abstract, Edinburgh](https://www.research.ed.ac.uk/portal/en/publications/timelines-revisited-a-design-space-and-considerations-for-expressive-storytelling(8cde76b9-c274-4baa-bedd-9dbf1dc944dd).html), [Timelines Revisited project page](https://timelinesrevisited.github.io/), [preprint PDF (unread)](https://timelinesrevisited.github.io/preprint.pdf), [aviz.fr PDF (unread)](https://aviz.fr/~bbach/timelines/Brehmer2016timelines.pdf), [Microsoft PDF (unread)](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/10/Brehmer-TVCG-2017.pdf), [Semantic Scholar (403)](https://www.semanticscholar.org/paper/Timelines-Revisited:-A-Design-Space-and-for-Brehmer-Lee/57492e6f4dc675352226000a3bdfef4651ea23ea)
- [Song & Szafir metadata, CU Experts](https://experts.colorado.edu/display/pubid_251271), [Song & Szafir project page](https://cmci.colorado.edu/visualab/MissingData), [NSF PAR PDF (unread)](https://par.nsf.gov/servlets/purl/10111567), [Alsufyani et al. survey](https://arxiv.org/html/2410.03712v1)
- [Material 3 progress indicators (title only)](https://m3.material.io/components/progress-indicators/guidelines)
- Every other source is as listed in revision 2: research/Q-012-memo.md.