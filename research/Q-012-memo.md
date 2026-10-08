# Q-012 memo: designing a phone-first status dashboard for overseeing several automated projects

**Researcher, 2026-10-08. Depth 3, graded memo. Topics: design, dashboards, information-design, accessibility, mobile.**

I checked the library first. No existing entry shares a topic with this question; the closest, F-gh-09, is tagged "mobile" but is about GitHub Mobile, so it doesn't apply.

**How I graded, using the question's own rules:**
- **Guideline (single authoritative source):** what Apple, Google or W3C prescribes.
- **Corroborated:** two sources by different authors say it.
- **Derivative of X:** a restatement of another source; it does not count as a second source.
- **Single source:** said by one source only.
- **Not documented:** none of the sources I read says it.

**Each statement is also labelled:** fact = what the page says; estimate; opinion = my synthesis, which is never a recommendation.

**Caveat for the Source checker:** I read pages through a summarising fetch tool. Text in "quotes" is what that tool returned as verbatim. Where it paraphrased, I mark it **[paraphrase]**, so check those against the page itself first. Some sources I couldn't read at all: Material Design 3 pages (m3.material.io returned only a title), and these PDFs: Few's "Dashboard Confusion" and "Why Most Dashboards Fail", Brehmer et al. "Timelines Revisited", and Song & Szafir's full text.

---

## 1. Progressive disclosure: what goes on the first screen, what one tap down, and how a summary shows detail is worth opening

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 1.1 | A dashboard shows at-a-glance information that people can act on quickly: "Dashboards are collections of data visualizations, presented in a single-page view that imparts at-a-glance information on which users can act quickly." | fact | **corroborated**, with 1.2 | Laubheimer, NN/g, 2017-06-18, nngroup.com/articles/dashboards-preattentive/ |
| 1.2 | "Dashboards are designed to help us monitor what's going on at a glance." Few's longer book definition ("single screen … monitored at a glance") appears only in secondary pages; I couldn't read it in his PDFs. | fact | corroborated (with 1.1); the book wording is unverified | Few, Perceptual Edge blog, 2006-09-20, perceptualedge.com/blog/?p=54 |
| 1.3 | Disclosure: "Initially, show users only a few of the most important options. Offer a larger set of specialized options upon request." | fact | **corroborated**, with 1.4 | Nielsen, NN/g, 2006-12-03, nngroup.com/articles/progressive-disclosure/ |
| 1.4 | "Use a disclosure control to hide details until they're relevant. … This organization helps people quickly find the most essential information without overwhelming them." | fact | guideline (single authoritative source); also corroborates 1.3 | Apple HIG, Disclosure controls |
| 1.5 | "Designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." | fact | single source | Nielsen 2006 (as in 1.3) |
| 1.6 | The link into the detail level must set expectations: "label the button or link in a way that sets clear expectations". | fact | **corroborated**, with 1.7 | Nielsen 2006 |
| 1.7 | Information scent is "the user's imperfect estimate of the value that the source will deliver to the user, derived from a representation of the source." Weak or misleading labels make users abandon, and erode trust **[paraphrase]**. | fact | corroborated (with 1.6) | Budiu, NN/g, 2020-02-02, nngroup.com/articles/information-scent/ |
| 1.8 | A glanceable surface with a longer look and a deep link: "Create a layout that provides essential information at a glance and allows people to view additional details by taking a longer look." Also: "Ensure that a widget interaction opens your app at the right location." Also: "Balance information density." | fact | guideline (single authoritative source); about widgets, not dashboards | Apple HIG, Widgets |
| 1.9 | Small charts can serve "as a snapshot or preview of a larger version of the chart that people can reveal in a different view". Use "brief descriptive text that serves as a headline or summary for a chart". | fact | guideline (single authoritative source) | Apple HIG, Charting data |
| 1.10 | Overview first, detail on demand: "Overview first, zoom and filter, then details-on-demand." | fact | single source (the original 1996 paper, cited by an abstract page) | Shneiderman, Stanford seminar abstract, 1998-02-20 |
| 1.11 | What counts as "most important" is decided by task analysis, field studies and how often things are used **[paraphrase]**. | fact | single source | Nielsen 2006 |

**What the guidance does not cover (not documented):** a rule for which specific items belong on a phone dashboard's first screen; a number of items for a phone overview (Laubheimer gives no count).

**Opinion (C):** the sources agree on three things. Put a small set of the most important items first. Use exactly one step down. Make each summary's label predict what the detail screen holds.

## 2. Showing a stage that can loop back, stall or wait, without implying percent complete

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 2.1 | Apple: "Determinate, for a task with a well-defined duration … Indeterminate, for unquantifiable tasks". Also: "An indeterminate progress indicator shows that a process is occurring, but it doesn't help people estimate how long a task will take." | fact | guideline (single authoritative source) | Apple HIG, Progress indicators |
| 2.2 | Apple: "Be as accurate as possible when reporting advancement … Showing 90 percent completion in five seconds and the last 10 percent in 5 minutes … can even feel deceptive." | fact | guideline; also corroborates 2.4 | Apple HIG, Progress indicators |
| 2.3 | Apple: "People tend to associate a stationary indicator with a stalled process or a frozen app." | fact | guideline (single authoritative source) | Apple HIG, Progress indicators |
| 2.4 | NN/g: if progress "hangs on the last percentage remaining, the user will become frustrated and the benefits of showing progress will be negated." Use percent-done only for actions of 10 seconds or more. | fact | corroborated with 2.2 (that misleading progress harms) | Sherwin, NN/g, 2014-10-26, nngroup.com/articles/progress-indicators/ |
| 2.5 | Status trackers: "Present the latest update prominently". Show previous updates "alongside dates" **[partly paraphrase]**. For long waits, "provide regular updates, even if they are of low granularity". | fact | single source | Rosala, NN/g, 2019-02-03, nngroup.com/articles/status-tracker-progress-update/ |

**Not documented:** how to draw a stage that can loop back. I found no platform guideline or study on it. Apple's and Google's progress guidance covers only one-way tasks.

**Opinion (C):**
- 2.1 and 2.4 suggest that a fill bar or percentage would misstate open-ended work.
- 2.3 is a caution: on Apple platforms, a static marker can read as "stalled", so a waiting state needs its own label.

**Reading gap:** I didn't read Material 3's progress-indicator page, because it didn't render.

## 3. A one-line "where it's heading" summary per project

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 3.1 | Descriptive text "help[s] emphasize the most important information … and can highlight actionable takeaways". A summary "doesn't take the place of accessibility labels." | fact | guideline (single authoritative source) | Apple HIG, Charting data |
| 3.2 | "When an external event or the passage of time caused a change in the system's state, explain it in brief but understandable terms." | fact | single source | Harley, NN/g, 2018-06-03, nngroup.com/articles/visibility-system-status/ |
| 3.3 | "Where possible, state exactly what the wait time will be." | fact | single source | Rosala 2019 |

**Not documented:** guidance on writing forward-looking summaries (current phase, upcoming work, what it unlocks) without overclaiming. Statements 2.2 and 1.7 (misleading labels erode trust) are the nearest evidence I found.

## 4. Telling kinds of item apart without ranking their urgency

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 4.1 | "Qualitative schemes do not imply magnitude differences between legend classes, and hues are used to create the primary visual differences between classes." | fact | **corroborated**, with 4.2 | Brewer, ColorBrewer, colorbrewer2.org/learnmore/schemes_full.html |
| 4.2 | Colour shouldn't encode magnitude because "people do not perceive different colors as being in a particular order". Hue or saturation are "helpful as a secondary grouping cue, rather than as the main way of showing groups"; shape and proximity are more reliable **[paraphrase]**. | fact | corroborated (with 4.1) | Laubheimer 2017 |
| 4.3 | Apple: "Offer visual indicators, like distinct shapes or icons, in addition to color to help people perceive differences in function and changes in state." | fact | guideline (single authoritative source) | Apple HIG, Accessibility |
| 4.4 | Few: "If the color red only appeared on the dashboard next to items that needed attention, people would able to spot the problems much faster." | fact | single source | Few 2006 |

**Note on a tension (C):** statements 4.1 and 4.2 support hue for telling categories apart. Statement 4.4 shows that a reserved colour reads as "needs attention", which is a ranking signal.

**Not documented:** distinguishing irreversible or self-defaulting decisions specifically.

## 5. A screen that updates itself every minute

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 5.1 | WCAG 2.2.2 (Level A): "For any auto-updating information that (1) starts automatically and (2) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it or to control the frequency of the update unless … essential." | fact | guideline (single authoritative source) | W3C, Understanding 2.2.2 |
| 5.2 | WCAG technique G76: "let the user control if and when content is updated, in order to avoid confusion or disorientation caused by automatic refreshes". A refresh moves a screen reader's virtual cursor to the top **[paraphrase]**. G76 supports 2.2.4 and 3.2.5, both Level AAA. | fact | guideline | W3C, Technique G76 |
| 5.3 | WCAG 3.2.5 (AAA): "A change of content is not always a change of context." | fact | guideline | W3C, Understanding 3.2.5 |
| 5.4 | Layout shift: "Unexpected layout shifts can disrupt the user experience … to making them click the wrong link or button." Good CLS (Cumulative Layout Shift) is "0.1 or less"; shifts within 500 ms of user input are excluded. | fact | single source (Google's web.dev, not a platform design guideline) | Mihajlija & Walton, web.dev/articles/cls, updated 2023-04-12 |
| 5.5 | Change blindness: "people's tendency to ignore changes in a scene when they occur in a region that is far away from their focus of attention." Mitigations: animation, grouping, dimming unchanged areas, one change at a time **[paraphrase]**. | fact | single source | Budiu, NN/g, 2018-09-23, nngroup.com/articles/change-blindness-definition/ |
| 5.6 | Indicators "are conditional—they are not always present, but appear or change depending on certain conditions." Badges show where change happened without requiring a response **[paraphrase]**. | fact | single source | Flaherty, NN/g, 2024-01-17, nngroup.com/articles/indicators-validations-notifications/ |
| 5.7 | Status messages must be announced to assistive technologies "without receiving focus" (WCAG 4.1.3, Level AA). | fact | guideline | W3C, Understanding 4.1.3 |
| 5.8 | Reduced motion (Apple): respond "by reducing automatic and repetitive animations"; "Replacing transitions … with fades". | fact | guideline | Apple HIG, Accessibility |

**Not documented:**
- An authoritative rule on reordering a list under the user's finger.
- A "new since your last visit" marker. Practitioner forums describe a "new items" pill, but they are not acceptable sources here.

**Opinion (C):** there is a tension between 5.5 (animation makes change noticeable) and 5.8 / 2.3.3 (motion must be reducible).

## 6. An activity view: who is working on what, why, and what changed

**Not documented** in any acceptable source I found. The search returned only vendor blogs (getstream.io, knock.app), which are excluded.

The nearest guidance is NN/g's status tracker article (statement 2.5): show the latest update first, keep earlier updates with dates, and give each item "the date and time" **[paraphrase]**.

## 7. Timelines on a 360 px screen

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 7.1 | Brehmer et al. (IEEE TVCG 2017) define timeline scales. **Chronological:** spacing by actual time, linear or logarithmic. **Relative:** spacing from a baseline event. **Sequential:** "the distance between time points is fixed and does not correspond to the temporal distance." | fact | derivative of Brehmer et al. (I took the definitions from a search snippet that seems to come from arXiv 2206.09910; I couldn't read the original PDF) | aviz.fr/~bbach/timelines/Brehmer2016timelines.pdf (unread) |
| 7.2 | "Another interesting approach is collapsing time and/or using different representations for different granularities." | fact | single source (an interview) | Brehmer quoted by Rodrigues, Storybench, 2017-05-19 |

**Not documented:**
- 360 px timeline layout.
- Placing undated planned items next to past events.

**Opinion (C):** if verified, a sequential scale is the design-space option that doesn't need event lengths to be comparable.

## 8. Values that are unknown, stale or estimated

| # | Statement | Type | Grade | Source |
|---|---|---|---|---|
| 8.1 | "Highlighting the missing data and local linear imputation resulted in higher perceived confidence and data quality, while those that break the visual continuity of a graph reduce the perception of quality in data." | fact | derivative of Song & Szafir (quoted in a survey; the authors' own page confirms only the study's scope) | Alsufyani, Forshaw & Fernstad, arXiv 2410.03712 (2024-09-27); Song & Szafir, IEEE TVCG 2019, cmci.colorado.edu/visualab/MissingData |
| 8.2 | "Users may not notice that data is missing when it is replaced by a default value." | fact | derivative of Eaton et al. (as quoted in the same survey) | arXiv 2410.03712 |
| 8.3 | "Emptiness plus explanation was the most preferred technique with the highest degree of decision confidence." | fact | derivative of Andreasson & Riveiro 2014 | arXiv 2410.03712 |
| 8.4 | Users "may not grasp that such predictions are subject to uncertainty". Quantile dotplots "reduce the variance of probabilistic estimates by ~1.15 times compared to density plots". This is the phone-screen context. | fact | single source | Kay, Kola, Hullman & Munson, CHI 2016, idl.uw.edu/papers/when-ish-is-my-bus |
| 8.5 | Stale data: "If people are likely to check your widget more frequently than you can update it, consider displaying text that describes when the data was last updated." | fact | guideline (single authoritative source) | Apple HIG, Widgets |
| 8.6 | Placeholders: "semi-opaque shapes that stand in for dynamic content". | fact | guideline (loading state, not unknown values) | Apple HIG, Widgets |
| 8.7 | Gauges: "Write succinct labels that describe the current value and both endpoints of the range." | fact | guideline; says nothing on unknown values | Apple HIG, Gauges |

**Not documented** by any authoritative source:
- Making stale data visibly degrade over time.
- How to show an unknown value inside a gauge.

The search found only vendor and practitioner pages.

## 9. Standards lookup

Where guidelines disagree, each is reported with its source; I don't choose between them.

| Topic | Source | Text (fact; grade: guideline, single authoritative source) |
|---|---|---|
| Colour not used alone | WCAG 1.4.1 (Level A) | "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." |
| Colour not used alone | Apple HIG, Accessibility | "Convey information with more than color alone." |
| Text contrast | WCAG 1.4.3 (Level AA) | Text needs 4.5:1. Large text needs 3:1; large means "at least 18 point or 14 point bold". |
| Text contrast | Android Developers | 4.5:1 if text is "smaller than 18sp, or if the text is bold and smaller than 14sp"; otherwise 3:1. |
| Graphics contrast | WCAG 1.4.11 (Level AA) | 3:1 for UI components and graphical objects, including "each line in a graph". The page's examples include dashboard status icons **[paraphrase]**. |
| Touch target | WCAG 2.5.8 (Level AA) | 24×24 CSS px, with exceptions for spacing (a 24 px circle), an equivalent control, inline targets, user-agent control, and essential presentation. |
| Touch target | WCAG 2.5.5 (Level AAA) | 44×44 CSS px. |
| Touch target | Apple HIG | iOS/iPadOS: default 44×44 pt, minimum 28×28 pt (from a table, **[paraphrase]**). Spacing: "about 12 points of padding around elements that include a bezel … about 24 points" without one. |
| Touch target | Android / Google Accessibility Help | "at least 48dpx48dp"; "separated by 8dp of space or more". |
| Reduced motion | WCAG 2.3.3 (Level AAA) | "Motion animation triggered by interaction can be disabled, unless … essential." Techniques C39 and SCR40 use `prefers-reduced-motion`. |
| Reduced motion | Apple HIG | See statement 5.8. |

---

## Proposed library entries (for the Source checker)

I have not marked any of these as checked.

```yaml
- id: LIB-F-q12-a-wcag-target-size
  form: fact
  claim: "WCAG 2.2 SC 2.5.8 (AA): pointer targets at least 24x24 CSS px, with five exceptions (spacing, equivalent, inline, user agent control, essential); SC 2.5.5 (AAA): 44x44 CSS px."
  grade: A (guideline, single authoritative source)
  shelf_life: 24 months
  topics: [accessibility, mobile, design]
  sources: [https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html, https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html]
- id: LIB-F-q12-b-platform-target-sizes
  form: fact
  claim: "Platform touch-target guidance differs: Apple HIG iOS/iPadOS default 44x44 pt, minimum 28x28 pt; Android/Material 48x48 dp separated by 8 dp or more. Reported without choosing."
  grade: A (each a guideline); Apple's figures came from a table via a summarising fetch, so check them
  shelf_life: 12 months
  topics: [accessibility, mobile, design]
  sources: [https://developer.apple.com/design/human-interface-guidelines/accessibility, https://developer.android.com/guide/topics/ui/accessibility/apps, https://support.google.com/accessibility/android/answer/7101858]
- id: LIB-F-q12-c-contrast
  form: fact
  claim: "WCAG 2.2: text 4.5:1, large text (18 pt / 14 pt bold) 3:1 (1.4.3 AA); UI components and graphical objects 3:1 (1.4.11 AA); colour not the only means (1.4.1 A)."
  grade: A
  shelf_life: 24 months
  topics: [accessibility, design]
  sources: [https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html, https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html, https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html]
- id: LIB-F-q12-d-auto-update-control
  form: fact
  claim: "WCAG 2.2.2 (A): auto-updating information that starts automatically and sits beside other content needs a way to pause, stop, hide or control update frequency unless essential; G76 (for AAA 2.2.4/3.2.5) lets users request updates instead."
  grade: A
  shelf_life: 24 months
  topics: [accessibility, dashboards]
  sources: [https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html, https://www.w3.org/WAI/WCAG22/Techniques/general/G76]
- id: LIB-F-q12-e-progress-honesty
  form: fact
  claim: "Determinate progress only for tasks with a well-defined duration; uneven or stuck progress reads as deceptive or frustrating (Apple HIG; NN/g Sherwin 2014). Apple: a stationary indicator is associated with a stalled process."
  grade: B (corroborated on the honesty point; the stationary-indicator point is a single guideline)
  shelf_life: 24 months
  topics: [design, dashboards]
  sources: [https://developer.apple.com/design/human-interface-guidelines/progress-indicators, https://www.nngroup.com/articles/progress-indicators/]
- id: LIB-F-q12-f-missing-data
  form: fact
  claim: "Highlighting missing data raised perceived confidence and quality; breaking visual continuity lowered it (Song & Szafir 2019); default-value substitution can hide missingness (Eaton et al., via survey)."
  grade: C (derivative; read via the Alsufyani et al. 2024 survey; original abstract not read)
  shelf_life: 36 months
  topics: [information-design, dashboards]
  sources: [https://arxiv.org/html/2410.03712v1, https://cmci.colorado.edu/visualab/MissingData]
- id: LIB-F-q12-g-categorical-hue
  form: fact
  claim: "Hue differences (qualitative schemes) do not imply magnitude; colour should not encode magnitude and works best as a secondary grouping cue."
  grade: B (corroborated: Brewer; Laubheimer/NN/g)
  shelf_life: 36 months
  topics: [information-design, design]
  sources: [https://colorbrewer2.org/learnmore/schemes_full.html, https://www.nngroup.com/articles/dashboards-preattentive/]
- id: LIB-P-q12-a-glance-then-one-step
  form: pattern
  claim: "Glance surface shows a few most-important items with a headline/summary; detail is exactly one level down, reached by a label that predicts its content; the last-updated time is shown when people check more often than data updates. Opinion drawn from the cited facts."
  grade: C (opinion over corroborated facts)
  shelf_life: 24 months
  topics: [dashboards, design, mobile]
  rests_on: [Nielsen 2006, Apple HIG Disclosure controls, Apple HIG Widgets, Budiu 2020, Laubheimer 2017]
  sources: [https://www.nngroup.com/articles/progressive-disclosure/, https://developer.apple.com/design/human-interface-guidelines/widgets]
```

---

## Six-part contract

**1. What I changed.** Nothing on disk: I have no write tool. My output is this memo, for the Orchestrator to record verbatim in research/.

**2. Why.** Q-012 asks for a depth-3 graded memo to inform the design milestone. I applied Q-012's own grading rules, which replace Q-010's two-source rule.

**3. What I verified.**
- I searched the library for the question's topics: one hit, F-gh-09, which is not relevant.
- I made about 45 web searches and fetches. The table above records exactly which statements are verbatim and which are paraphrase.
- Failures:
  - Material 3 pages and Apple HIG HTML returned only a title. The Apple HIG JSON endpoint worked.
  - Few's PDFs, Brehmer's PDF and the Song & Szafir PDF couldn't be read (they returned binary, and no PDF renderer is available).

**4. What is undone.**
- Material 3 guidance on progress indicators, badges and motion.
- Brehmer et al.'s original scale definitions (7.1 is derivative).
- Song & Szafir's own abstract wording (8.1).
- Few's book definition of a dashboard (1.2).
- Six topics are not documented in any acceptable source: loop-back stage display, the activity view, reorder rules, a "new since last visit" marker, visibly degrading stale data, and unknown values in gauges.

**5. What is needed outside my lane.**
- The Source checker should read the original PDFs and the m3.material.io pages with a tool that renders them, and re-check every **[paraphrase]** item.
- No paid source or level-5 expert is needed. Few's book is paywalled, but its definition isn't essential.

**6. Open questions (I'm adding these, not closing any).**
- Is there any published HCI study of showing work stages that loop back (non-monotonic progress)? I found none. Should a field-scan follow-up look for one?
- Should the "derivative" timeline scale definitions be accepted, or should the design step wait until the original PDF has been checked?

**Sources:**
- [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [3.2.5](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html), [G76](https://www.w3.org/WAI/WCAG22/Techniques/general/G76)
- Apple HIG: [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators), [Charting data](https://developer.apple.com/design/human-interface-guidelines/charting-data), [Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets), [Gauges](https://developer.apple.com/design/human-interface-guidelines/gauges), [Disclosure controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls)
- Google: [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/apps), [Touch target size](https://support.google.com/accessibility/android/answer/7101858?hl=en), [web.dev CLS](https://web.dev/articles/cls)
- NN/g: [Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [Dashboards preattentive](https://www.nngroup.com/articles/dashboards-preattentive/), [Information scent](https://www.nngroup.com/articles/information-scent/), [Visibility of system status](https://www.nngroup.com/articles/visibility-system-status/), [Indicators](https://www.nngroup.com/articles/indicators-validations-notifications/), [Status trackers](https://www.nngroup.com/articles/status-tracker-progress-update/), [Progress indicators](https://www.nngroup.com/articles/progress-indicators/), [Change blindness](https://www.nngroup.com/articles/change-blindness-definition/), [Skeleton screens](https://www.nngroup.com/articles/skeleton-screens/)
- Others: [Few 2006](https://www.perceptualedge.com/blog/?p=54), [Shneiderman](https://hci.stanford.edu/seminar/abstracts/97-98/980220-shneiderman.html), [ColorBrewer](https://colorbrewer2.org/learnmore/schemes_full.html), [Song & Szafir](https://cmci.colorado.edu/visualab/MissingData), [Alsufyani et al. survey](https://arxiv.org/html/2410.03712v1), [Kay et al. 2016](https://idl.uw.edu/papers/when-ish-is-my-bus), [Brehmer et al. PDF](https://aviz.fr/~bbach/timelines/Brehmer2016timelines.pdf), [Storybench 2017](https://www.storybench.org/expressive-timelines-notes-from-microsofts-matthew-brehmer-on-the-power-of-visualizing-time/)
