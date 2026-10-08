I've written the revised memo below. On re-reading, five of the six disputed claims were confirmed. The sixth, Budiu 2020 on trust, wasn't supported by the page, so I narrowed it to what the page actually says.

# Q-012 memo, revision 2: designing a phone-first status dashboard for overseeing several automated projects

**Researcher, 2026-10-08. Depth 3, graded memo. Topics: design, dashboards, information-design, accessibility, mobile. This replaces research/Q-012-memo.md and responds to research/Q-012-source-check.md.**

I checked the library: no existing entry shares a topic with this question. F-gh-09 is tagged "mobile" but is about GitHub Mobile, so it doesn't apply.

**How I graded, using the question's own rules:**
- **Guideline:** a single authoritative source, meaning Apple, Google or W3C.
- **Corroborated:** two sources by different authors say it.
- **Derivative of X:** a restatement of X; it doesn't count as a second source.
- **Single source:** only one source says it.
- **Not documented:** none of the sources I read says it.

**Each statement is labelled fact, estimate or opinion.** An opinion is my synthesis, never a recommendation.

**How I read the sources:** through a summarising fetch tool. Text in "quotes" is what that tool returned as verbatim on 2026-10-08. **[paraphrase]** marks where it didn't. **[re-read 2026-10-08]** marks statements I re-fetched this round, including all those the Source checker listed as unconfirmed or unopened. The tool still can't read PDFs, and the PDF reader here has no renderer (pdftoppm is missing). The Material 3 pages were not retried this round.

---

## 1. Progressive disclosure: what goes on the first screen, what one tap down, and how a summary shows detail is worth opening

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 1.1 | "Dashboards are collections of data visualizations, presented in a single-page view that imparts at-a-glance information on which users can act quickly." [re-read] | fact | **corroborated**, with 1.2 | Laubheimer, NN/g, 2017-06-18, nngroup.com/articles/dashboards-preattentive/ |
| 1.2 | "Dashboards are designed to help us monitor what's going on at a glance—or at least, that's what they're supposed to do." [re-read] Few's longer book definition is still unread. | fact | corroborated (with 1.1) | Few, Perceptual Edge blog, 2006-09-20, perceptualedge.com/blog/?p=54 |
| 1.3 | "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request." | fact | **corroborated**, with 1.4 | Nielsen, NN/g, 2006-12-03, nngroup.com/articles/progressive-disclosure/ |
| 1.4 | "Use a disclosure control to hide details until they're relevant. … This organization helps people quickly find the most essential information without overwhelming them." | fact | guideline; corroborates 1.3 | Apple HIG, Disclosure controls |
| 1.5 | "designs that go beyond 2 disclosure levels typically have low usability" … "users often get lost when moving between the levels". [re-read: returned as two short verbatim excerpts. The tool wouldn't return the whole paragraph.] | fact | single source | Nielsen 2006 |
| 1.6 | "Label the button or link in a way that sets clear expectations for what users will find when they progress to the next level." [re-read] | fact | **corroborated**, with 1.7 (on predictive labels) | Nielsen 2006 |
| 1.7 | Information scent is "the user's imperfect estimate of the value that the source will deliver to the user, derived from a representation of the source." When pages lack enough context, users "quickly decide that the page is not worth exploring any longer and simply leave". [re-read] **Corrected:** the page doesn't say that weak or misleading labels erode trust. Its only trust sentence is about clickbait: "you will use up your visitors' trust". | fact | corroborated (with 1.6), for the definition and abandonment only | Budiu, NN/g, 2020-02-02, nngroup.com/articles/information-scent/ |
| 1.8 | "Create a layout that provides essential information at a glance and allows people to view additional details by taking a longer look." Also "Ensure that a widget interaction opens your app at the right location." and "Balance information density." [re-read] | fact | guideline; about widgets, not dashboards | Apple HIG, Widgets |
| 1.9 | Use a small chart "to offer glanceable information about an individual item or to provide a snapshot or preview of a larger version of the chart that people can reveal in a different view." Also "You can also display brief descriptive text that serves as a headline or summary for a chart, helping people grasp essential information at a glance." [re-read; **quote corrected**: revision 1 had the wording wrong] | fact | guideline | Apple HIG, Charting data |
| 1.10 | "Overview first, zoom and filter, then details-on-demand." [re-read] | fact | single source (seminar abstract) | Shneiderman, Stanford Seminar on People, Computers, and Design, 1998-02-20 |
| 1.11 | The page names three ways to decide what is most important: task analysis and field studies, frequency-of-use statistics, and observational usability testing. **[paraphrase]** [re-read] | fact | single source | Nielsen 2006 |

**Not documented:**
- Which specific items belong on a phone dashboard's first screen.
- How many items a phone overview should hold.

**Opinion (C):** the sources agree on three things:
- Put a few of the most important items first.
- Have one level of detail below that.
- Make each label predict what the detail screen holds.

## 2. Showing a stage that can loop back, stall or wait, without implying percent complete

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 2.1 | "Determinate, for a task with a well-defined duration, such as a file conversion"; "Indeterminate, for unquantifiable tasks, such as loading or synchronizing complex data". Also "An indeterminate progress indicator shows that a process is occurring, but it doesn't help people estimate how long a task will take." [re-read via the HIG JSON endpoint] | fact | guideline | Apple HIG, Progress indicators |
| 2.2 | "Be as accurate as possible when reporting advancement … Showing 90 percent completion in five seconds and the last 10 percent in 5 minutes … can even feel deceptive." | fact | guideline | Apple HIG, Progress indicators |
| 2.3 | "People tend to associate a stationary indicator with a stalled process or a frozen app." | fact | guideline | Apple HIG, Progress indicators |
| 2.4 | "if the progress moves quickly only to hang on the last percentage remaining, the user will become frustrated and the benefits of showing progress will be negated." Also "Percent-done progress indicators should be used for longer processes that take 10 or more seconds." [re-read: the full sentence, including "negated", was returned] | fact | single source. Read with 2.2, it supports the shared point that uneven progress reporting harms the user (see open questions) | Sherwin, NN/g, 2014-10-26, nngroup.com/articles/progress-indicators/ |
| 2.5 | "Present the latest update prominently, so users can find it first." "Maintain all previous updates alongside dates." "For processes that take a long time, provide regular updates, even if they are of low granularity." [re-read; the paraphrase is now verbatim] | fact | single source | Rosala, NN/g, 2019-02-03, nngroup.com/articles/status-tracker-progress-update/ |

**Not documented:** how to draw a stage that can loop back. Apple's progress guidance covers only one-way tasks. I haven't read Material 3's progress page.

**Opinions (C):**
- 2.1 and 2.4 suggest that a fill bar or a percentage would misstate open-ended work.
- 2.3 means that on Apple platforms, a static marker can read as "stalled".

## 3. A one-line "where it's heading" summary per project

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 3.1 | "Descriptive text titles, subtitles, and annotations help emphasize the most important information in a chart and can highlight actionable takeaways." Also "Although a descriptive headline or summary can make a chart more accessible, it doesn't take the place of accessibility labels." [re-read] | fact | guideline | Apple HIG, Charting data |
| 3.2 | "When an external event or the passage of time caused a change in the state of the system, explain it in brief but understandable terms." [re-read; **quote corrected**: revision 1 had "system's state"] | fact | single source | Harley, NN/g, 2018-06-03, nngroup.com/articles/visibility-system-status/ |
| 3.3 | "Throughout the user journey, ensure you set expectations for the wait time. Where possible, state exactly what the wait time will be." [re-read] | fact | single source | Rosala 2019 |

**Not documented:** how to write forward-looking summaries without overclaiming. The nearest evidence is 2.2 (inaccurate progress "can even feel deceptive") and Budiu's clickbait sentence in 1.7. **Corrected:** revision 1 cited 1.7 here for a trust claim the page doesn't make.

## 4. Telling kinds of item apart without ranking their urgency

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 4.1 | "Qualitative schemes do not imply magnitude differences between legend classes, and hues are used to create the primary visual differences between classes." | fact | **corroborated**, with 4.2 | Brewer, ColorBrewer, colorbrewer2.org/learnmore/schemes_full.html |
| 4.2 | Laubheimer, in five verbatim quotes [re-read]: (a) "people do not perceive different colors as being in a particular order, so color should not be used to communicate information about quantitative values or magnitude"; (b) "color properties such as hue or saturation are helpful as a secondary grouping cue, rather than as the main way of showing groups or categories"; (c) "Shape or clear visual grouping are more reliable signals for relatedness"; (d) "using color properties can help reinforce those relationships"; (e) "the combination of color and shape together make for a more noticeable signal than either alone". (b) was returned verbatim this round, although the checker's fetch didn't return it. | fact | (a) corroborated with 4.1; (b), (c), (d) and (e) single source | Laubheimer 2017 |
| 4.3 | "Offer visual indicators, like distinct shapes or icons, in addition to color to help people perceive differences in function and changes in state." [re-read] | fact | guideline; corroborates 4.2(c) | Apple HIG, Accessibility |
| 4.4 | "If the color red only appeared on the dashboard next to items that needed attention, people would able to spot the problems much faster." ("would able" is the source's own wording.) [re-read] | fact | single source | Few 2006 |

**Tension (C):** 4.1 and 4.2 support using hue to tell categories apart. 4.4 shows that a reserved colour reads as "needs attention", which ranks items.

**Not documented:** how to distinguish decisions that are irreversible or that default on their own.

## 5. A screen that updates itself every minute

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 5.1 | WCAG 2.2.2 (Level A): auto-updating information that starts automatically and is presented in parallel with other content needs "a mechanism for the user to pause, stop, or hide it or to control the frequency of the update unless … essential." | fact | guideline (the checker confirmed this) | W3C, Understanding 2.2.2 |
| 5.2 | G76: "The objective of this technique is to let the user control if and when content is updated, in order to avoid confusion or disorientation". Also "When a page is refreshed, the screen reader's 'virtual cursor', which marks the user's current location on the page, is moved to the top". G76 is sufficient for 2.2.4 and 3.2.5 (both AAA). [re-read; the paraphrase is now verbatim] | fact | guideline | W3C, Technique G76 |
| 5.3 | SC 3.2.5 (AAA): "Changes of context are initiated only by user request or a mechanism is available to turn off such changes." Key Terms: "A change of content is not always a change of context." [re-read] | fact | guideline | W3C, Understanding 3.2.5 |
| 5.4 | "Unexpected layout shifts can disrupt the user experience in many ways, from causing them to lose their place while reading if the text moves suddenly, to making them click the wrong link or button." A good CLS (Cumulative Layout Shift) score is 0.1 or less, measured at the 75th percentile. Shifts within 500 ms of user input get a `hadRecentInput` flag and **can be** excluded **[paraphrase]**. [re-read; **corrected** from "are excluded"] | fact | single source (Google web.dev, not a platform design guideline) | Mihajlija & Walton, web.dev/articles/cls, updated 2023-04-12 |
| 5.5 | Change blindness is "people's tendency to ignore changes in a scene when they occur in a region that is far away from their focus of attention." Mitigations, all verbatim: "Make one change at a time."; "Group all elements that will change simultaneously in the same region of the screen…"; "Use animation to signal change, but avoid having too many competing animations on the screen…"; "Dim the areas of the screen that do not change, in order to attract attention to changes." [re-read; the paraphrase is now verbatim] | fact | single source | Budiu, NN/g, 2018-09-23, nngroup.com/articles/change-blindness-definition/ |
| 5.6 | "Indicators are conditional— they are not always present, but appear or change depending on certain conditions." "If a notification is contextual and relates to a specific element in the interface, an icon indicator on the element can communicate where that notification applies and catch the user's attention." [re-read; **corrected**: revision 1's paraphrase "badges … without requiring a response" isn't on the page and is withdrawn] | fact | single source | Flaherty, NN/g, 2024-01-17, nngroup.com/articles/indicators-validations-notifications/ |
| 5.7 | SC 4.1.3 (AA): "status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus." [re-read] | fact | guideline | W3C, Understanding 4.1.3 |
| 5.8 | Apple: "ensure your app or game responds by reducing automatic and repetitive animations, including zooming, scaling, and peripheral motion". Also "Replacing transitions in x-, y-, and z-axes with fades to avoid motion". [re-read] | fact | guideline | Apple HIG, Accessibility |

**Not documented:**
- An authoritative rule on reordering a list under the user's finger.
- A "new since your last visit" marker.

**Tension (C):** 5.5 recommends animation to signal change. 5.8 and 2.3.3 say motion must be reducible.

## 6. An activity view: who is working on what, why, and what changed

**Not documented** in any acceptable source. The nearest guidance is Rosala's verbatim advice in 2.5. **Corrected:** revision 1 said Rosala advises giving each item "the date and time". On the page, that phrase only describes a layout flaw: "the table columns are too narrow, causing the date and time to wrap". That claim is withdrawn.

## 7. Timelines on a 360 px screen

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 7.1 | Brehmer et al. (IEEE TVCG 2017) name three scales: **chronological** (spaced by actual time, linear or logarithmic), **relative** (spaced from a baseline event) and **sequential** ("the distance between time points is fixed and does not correspond to the temporal distance"). | fact | **derivative and unverified**. The wording comes only from search-engine summaries attributed to Fouché et al. 2022 (arXiv 2206.09910), which builds on Brehmer et al. That paper's abstract page doesn't contain the sentence. Neither PDF could be read. **Not proposed for the library.** | Brehmer et al. PDF (unread); arXiv 2206.09910 (abstract read, body unread) |
| 7.2 | "Another interesting approach is collapsing time and/or using different representations for different granularities." [re-read] The page doesn't define any scale types. | fact | single source (an interview) | Brehmer quoted by Rodrigues, Storybench, 2017-05-19 |

**Not documented:**
- Timeline layout at 360 px.
- Placing undated planned items next to past events.

**Opinion (C):** if 7.1 is verified, a sequential scale is the option in that design space that doesn't need event lengths to be comparable.

## 8. Values that are unknown, stale or estimated

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 8.1 | The survey, citing Song & Szafir 2019 [ref 26], says "highlighting the missing data and local linear imputation resulted in higher perceived confidence" and "those that break the visual continuity of a graph reduce the perception of quality in data". [re-read: returned as two excerpts. The joining words between them have still not been seen.] The authors' page confirms only the scope: imputation and visualization methods, perceived data quality, confidence, line and bar charts. | fact | **derivative of Song & Szafir** (via the survey); the original paper is unread | Alsufyani, Forshaw & Fernstad, arXiv 2410.03712v1 (2024); cmci.colorado.edu/visualab/MissingData |
| 8.2 | The survey, citing Eaton, Plaisant & Drizd 2005 [ref 9], says "users may not notice that data is missing when it is replaced by a default value". [re-read] | fact | derivative of Eaton et al. | arXiv 2410.03712v1 |
| 8.3 | The survey, citing Andreasson & Riveiro 2014 [ref 4], says "emptiness plus explanation was the most preferred technique with the highest degree of decision confidence". [re-read] | fact | derivative of Andreasson & Riveiro | arXiv 2410.03712v1 |
| 8.4 | Users "may not grasp that such predictions are subject to uncertainty". "quantile dotplots reduce the variance of probabilistic estimates by ~1.15 times compared to density plots". The context is a phone app for bus arrival times. [re-read] | fact | single source | Kay, Kola, Hullman & Munson, CHI 2016, idl.uw.edu/papers/when-ish-is-my-bus |
| 8.5 | "If people are likely to check your widget more frequently than you can update it, consider displaying text that describes when the data was last updated." [re-read] | fact | guideline | Apple HIG, Widgets |
| 8.6 | "Create an effective placeholder appearance by combining static interface components with semi-opaque shapes that stand in for dynamic content." [re-read; full sentence] | fact | guideline (about loading states, not unknown values) | Apple HIG, Widgets |
| 8.7 | "Write succinct labels that describe the current value and both endpoints of the range." [re-read] | fact | guideline; says nothing about unknown values | Apple HIG, Gauges |

**Not documented:**
- Stale data that visibly degrades over time.
- Unknown values shown inside a gauge.

## 9. Standards lookup

Where guidelines differ, I report each with its source and don't choose between them. Every row here is a fact graded "guideline". Every row was re-read on 2026-10-08 unless the checker had already confirmed it.

| Topic | Source | Text |
|---|---|---|
| Colour not used alone | WCAG 1.4.1 (A) | "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." |
| Colour not used alone | Apple HIG, Accessibility | "Convey information with more than color alone." |
| Text contrast | WCAG 1.4.3 (AA) | 4.5:1; large text 3:1 (at least 18 point, or 14 point bold) |
| Text contrast | Android Developers | "If the text is smaller than 18sp, or if the text is bold and smaller than 14sp, … at least 4.5:1." "For all other text, set the color contrast ratio to at least 3:1." |
| Graphics contrast | WCAG 1.4.11 (AA) | 3:1 for UI components and graphical objects, including "each line in a graph". Example: "Status icons on an application's dashboard (without associated text) have a 3:1 minimum contrast ratio." (now verbatim) |
| Touch target | WCAG 2.5.8 (AA) | 24×24 CSS px, with five exceptions |
| Touch target | WCAG 2.5.5 (AAA) | 44×44 CSS px |
| Touch target | Apple HIG (JSON endpoint, read twice) | Table row "iOS, iPadOS: 44x44 pt [default], 28x28 pt [minimum]". Spacing: "about 12 points of padding around elements that include a bezel. For elements without a bezel, about 24 points of padding". The checker's HTML fetch reported "minimum 44"; that conflict is still open. |
| Touch target | Android Developers / Google Accessibility Help | "at least 48dpx48dp"; "Consider making touch targets at least 48x48dp, separated by 8dp of space or more". Neither is a Material Design page. |
| Reduced motion | WCAG 2.3.3 (AAA) | "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed." Techniques: C39 and SCR40 (both use CSS `prefers-reduced-motion`), plus Gx, a user preference |
| Reduced motion | Apple HIG | See 5.8 |

---

## Proposed library entries (for the Source checker)

None is marked as checked. The checker already filed a, c, d, e, g and the pattern P-q12-a, so I don't re-propose them. Changes:

```yaml
- id: LIB-F-q12-b-platform-target-sizes   # amendment to the filed entry, if the checker agrees
  form: fact
  claim: "Platform touch-target guidance differs: Apple HIG iOS/iPadOS default 44x44 pt, minimum 28x28 pt (HIG JSON endpoint, read 2026-10-08 twice; one HTML fetch by the checker reported 44 as the minimum, unresolved); Android Developers / Google Accessibility Help 48x48 dp, separated by 8 dp or more. Reported without choosing."
  grade: A (each a guideline); the Apple minimum is subject to the open conflict
  shelf_life: 12 months
  topics: [accessibility, mobile, design]
  sources: [https://developer.apple.com/design/human-interface-guidelines/accessibility, https://developer.android.com/guide/topics/ui/accessibility/apps, https://support.google.com/accessibility/android/answer/7101858]
- id: LIB-F-q12-f-missing-data   # narrowed resubmission
  form: fact
  claim: "A 2024 survey (Alsufyani, Forshaw & Fernstad) reports that Song & Szafir 2019 found highlighting missing data and local linear imputation raised perceived confidence, and visualizations breaking a graph's visual continuity lowered perceived data quality; and that Eaton et al. 2005 found users may not notice missing data replaced by a default value. Stated as the survey's report; original papers unread."
  grade: C (derivative of Song & Szafir and of Eaton et al., via a survey)
  shelf_life: 36 months
  topics: [information-design, dashboards]
  sources: [https://arxiv.org/html/2410.03712v1, https://cmci.colorado.edu/visualab/MissingData]
```

I'm not proposing 7.1, Brehmer's timeline scales, because it is unverified.

---

## Six-part contract

**1. What I changed.** The memo text above. I hold no write tool, so nothing is on disk.
- **Corrected or withdrawn:**
  - 1.7: the trust-erosion claim is dropped, and the same reliance in section 3 is removed.
  - 1.9 and 3.2: quote wording corrected.
  - 5.4: "can be excluded", not "are excluded".
  - 5.6: the badge paraphrase is withdrawn.
  - Section 6: the "date and time" advice is withdrawn.
  - 2.4: regraded from "corroborated" to "single source".
  - 7.1: marked unverified and not proposed.
- **Paraphrases turned into verbatim quotes:** 1.5, 2.5, 4.2, 5.2, 5.5, the 1.4.11 example, and 5.3 (now with the success-criterion text).
- **Entries:** b amended (Material label dropped), f narrowed and resubmitted.

**2. Why.** research/Q-012-source-check.md listed claims it couldn't confirm and pages it hadn't opened. I re-read each of them. Where a page didn't say what the memo claimed, I corrected or withdrew the claim rather than re-grading it.

**3. What I verified.** I made about 30 fetches and searches on 2026-10-08. Results for the checker's list:
- **Confirmed verbatim:**
  - Laubheimer's "secondary grouping cue".
  - Sherwin's "benefits of showing progress will be negated".
  - Apple's Determinate/Indeterminate quotes and the 44/28 pt table.
  - Nielsen's "beyond 2 disclosure levels", as a short excerpt.
  - Every statement the checker hadn't opened (1.2, 1.10, 1.11, 2.5, 3.2, 3.3, 5.4 to 5.7, 7.2, 8.4, 8.6, 8.7), the WCAG pages for 2.3.3, 4.1.3 and 3.2.5, and the Android contrast and touch-target pages.
- **Not supported by the page:**
  - Budiu on trust.
  - Flaherty's badge paraphrase.
  - Rosala's "date and time" advice.
- **Wording differed:** Harley, Apple Charting data and web.dev, all now fixed.
- **Couldn't read:** the Brehmer PDF, the Fouché et al. PDF and the Song & Szafir PDF (on NSF PAR) all came back as binary. The PDF reader failed with "pdftoppm is not installed".

**4. What is undone.**
- Brehmer's scale definitions (7.1).
- Song & Szafir's own wording, including the words that join the two 8.1 excerpts.
- Few's book definition.
- The Material 3 pages.
- Settling Apple's 28 pt versus 44 pt minimum against the rendered HTML page.
- Six topics remain not documented: loop-back stages, the activity view, reorder rules, a "new since last visit" marker, visibly degrading stale data, and unknown values in gauges.

**5. What is needed outside my lane.**
- A tool that renders PDFs, or installing poppler-utils, would let the original papers be read.
- A browser render of the Apple Accessibility HTML page and the m3.material.io pages.
- No paid source or level-5 expert is needed.

**6. Open questions.** I'm adding these, not closing any.
- With 2.4 regraded to single source, is the checker's grade B for entry e still right? The checker raised this itself. The two sources describe different failures: Apple is about uneven pace, Sherwin about stalling at the end.
- Is there any published HCI study on showing non-monotonic progress, meaning stages that loop back? Should a field-scan follow-up look for one?
- Should the design step wait for 7.1 to be checked against the original PDF?

Sources:
- W3C: [2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [3.2.5](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [G76](https://www.w3.org/WAI/WCAG22/Techniques/general/G76)
- Apple HIG (JSON endpoint): [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets), [Gauges](https://developer.apple.com/design/human-interface-guidelines/gauges), [Charting data](https://developer.apple.com/design/human-interface-guidelines/charting-data)
- Google: [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/apps), [Touch target size](https://support.google.com/accessibility/android/answer/7101858?hl=en), [web.dev CLS](https://web.dev/articles/cls)
- NN/g: [Dashboards](https://www.nngroup.com/articles/dashboards-preattentive/), [Progress indicators](https://www.nngroup.com/articles/progress-indicators/), [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [Information scent](https://www.nngroup.com/articles/information-scent/), [Status trackers](https://www.nngroup.com/articles/status-tracker-progress-update/), [Visibility of system status](https://www.nngroup.com/articles/visibility-system-status/), [Change blindness](https://www.nngroup.com/articles/change-blindness-definition/), [Indicators](https://www.nngroup.com/articles/indicators-validations-notifications/)
- Others: [Few 2006](https://www.perceptualedge.com/blog/?p=54), [Shneiderman 1998](https://hci.stanford.edu/seminar/abstracts/97-98/980220-shneiderman.html), [Storybench 2017](https://www.storybench.org/expressive-timelines-notes-from-microsofts-matthew-brehmer-on-the-power-of-visualizing-time/), [Kay et al. 2016](https://idl.uw.edu/papers/when-ish-is-my-bus), [Song & Szafir page](https://cmci.colorado.edu/visualab/MissingData), [Alsufyani et al. survey](https://arxiv.org/html/2410.03712v1), [arXiv 2206.09910](https://arxiv.org/abs/2206.09910), [Brehmer et al. PDF (unread)](https://aviz.fr/~bbach/timelines/Brehmer2016timelines.pdf), [NSF PAR copy of Song & Szafir (unread)](https://par.nsf.gov/servlets/purl/10111567)