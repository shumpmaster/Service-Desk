# Q-013: revised memo, round 2

I've revised the Q-013 memo; it is below for the Orchestrator to record verbatim. I re-opened every page the round-1 memo relied on. Most quotes held, but six changed (listed below), and one round-1 claim that two sources agree (row 3.5) no longer holds. I added rows for status messages (WCAG 4.1.3), Apple's badge rules, Apple's loading guidance and NN/g on empty states. Visibly fading stale data and "new since your last visit" are still not covered by any source I could read.

---

# Research memo — Q-013 — phone-first glanceable status dashboard: published design guidance — 2026-10-08 (round 2)

**Researcher.** Depth 2. Topics: design, dashboards, accessibility, mobile. No library entry shares these topics (F-gh-09 is tagged mobile but covers GitHub Mobile and isn't relevant).

**How sources were read.** Every page was opened with web fetch, which returns a model's summary rather than the raw text. Quotes are as that model returned them. Each page used was re-opened this round and asked for exact wording. The Source checker should still compare each quote word for word.

Apple HIG pages were read through their public JSON form, `developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`, because the HTML pages render only in a browser. The cited address is the HTML page; the JSON is how it was read.

**Changes from round 1:**
- **Row 1.1:** now rests on the two Nielsen sentences re-confirmed this round.
- **Row 3.2:** two quotes were replaced. The "DOM elements dynamically added" sentence was not returned again, and the transform sentence came back with different wording. Authors added.
- **Row 3.5:** the NN/g "new or updated" point was a paraphrase, so it is withdrawn and the row is no longer called corroborated.
- **Row 4.3:** the chart example came back in different words on two fetches; both are shown.
- **Row 2.5:** the grey/purple meanings came back paraphrased this round and are marked as such.
- **New rows:** 2.6 (Kaplan), 2.7 (Apple Loading), 3.6 (Apple badges), 3.7 (WCAG 4.1.3). WCAG 2.2.2 now quotes its intent, and 2.5.5 lists its exceptions.

**Labels.**
- **Kind:** fact (what a standard requires), opinion (design advice from the source), or researcher's note (my own inference, ungraded).
- **Labels:** as the question defines them.
- **Grades:** A = guideline (single authoritative source) or corroborated; B = single source; C = weak.
- **Source-type flag:** IBM Carbon, the UK Government Analysis Function, Wilke's textbook and web.dev are outside the named source types (platform guideline, W3C standard, usability research). Their rows are flagged ⚑ for the checker to rule on.

## 1. Progressive disclosure for glanceable overviews

| # | Statement | Kind | Label / grade | Source and quote |
|---|---|---|---|---|
| 1.1 | The first screen should hold what users often need; detail comes on request. | opinion | **Corroborated** (Nielsen; Apple), A | Nielsen, "Progressive Disclosure", NN/g, 2006-12-03: "You have to disclose everything that users frequently need up front, so that they have to progress to the secondary display only on rare occasions." and "the very fact that something appears on the initial display tells users that it's important." https://www.nngroup.com/articles/progressive-disclosure/ — Apple HIG Widgets: "Create a layout that provides essential information at a glance and allows people to view additional details by taking a longer look." https://developer.apple.com/design/human-interface-guidelines/widgets |
| 1.2 | A glance surface doesn't need to show everything. Prioritise the most useful information; a tap opens the detail. | opinion | Guideline (single authoritative source), A | Apple HIG Live Activities: "Your Live Activity doesn't need to display everything. Think about what information people find most useful and prioritize sharing it in a concise way. When a person wants to learn more, they can tap your Live Activity to open your app where you can provide additional detail." https://developer.apple.com/design/human-interface-guidelines/live-activities |
| 1.3 | A tap should open the matching detail directly, not a general screen. | opinion | Guideline (single authoritative source), A | Apple HIG Widgets: "Deep link to details and actions that directly relate to the widget's content, and don't make people navigate to the relevant area in the app." Live Activities: "When people tap a compact Live Activity, open your app directly to the related details." |
| 1.4 | More than two disclosure levels usually has low usability. | opinion | **Single source**, B | Nielsen 2006: "In practice, designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." Search snippets from Uxcel and Justinmind repeat this point. They were not opened and look like restatements of Nielsen ("Not opened" section). |
| 1.5 | A summary signals that detail is worth opening when its label sets clear expectations for the next level. | opinion | Two NN/g authors (Nielsen; Budiu), same publisher. Checker to rule whether this counts as corroborated; until then **single source**, B | Nielsen 2006: "Label the button or link in a way that sets clear expectations for what users will find when they progress to the next level." — Budiu, "Information Scent", NN/g, 2020-02-02: the link label should be "a succinct yet accurate description of what the page is about." https://www.nngroup.com/articles/information-scent/ |
| 1.6 | A one-line text summary at the top helps people grasp the key point at a glance. A small chart can preview a larger one shown elsewhere. | opinion | Guideline (single authoritative source), A | Apple HIG Charting data: "You can also display brief descriptive text that serves as a headline or summary for a chart, helping people grasp essential information at a glance." and "…use a small chart to offer glanceable information about an individual item or to provide a snapshot or preview of a larger version of the chart that people can reveal in a different view." https://developer.apple.com/design/human-interface-guidelines/charting-data |
| 1.7 | Dashboards are for at-a-glance action. For quantities, colour shouldn't encode magnitude; length and 2D position are read accurately. | opinion | **Single source**, B | Laubheimer, "Dashboards: Making Charts and Graphs Easier to Understand", NN/g, 2017-06-18: "Color should not be used to communicate information about quantitative values or magnitude." and "We are quite adept at estimating how lengths compare, and we can also accurately estimate position in a 2D space". https://www.nngroup.com/articles/dashboards-preattentive/ |
| 1.8 | Not covered by the sources opened: what exactly belongs on a phone's first screen when several projects are shown; how many items fit; a time budget for "a few seconds"; gauges specifically. | — | not documented | — |

## 2. Unknown, stale or estimated values

| # | Statement | Kind | Label / grade | Source and quote |
|---|---|---|---|---|
| 2.1 | Use "0" only for a true zero. Use distinct marks for estimated, not available, not applicable, provisional and low-reliability values. (The guidance is for statistical tables.) | opinion | **Single source**, B ⚑ | UK Government Analysis Function, "Symbols in tables", 2022-01-11: "A zero or '0' should only be used when a data point is a true zero."; "e … Use this shorthand to show when a data point is estimated."; "x … Use this shorthand when data is unavailable for reasons other than those described in this list."; "p … Use this shorthand to show when data points are yet to be finalised, or are expected to be revised."; "u … Use this shorthand to show when data points are of low quality." https://analysisfunction.civilservice.gov.uk/policy-store/symbols-in-tables-definitions-and-help/ |
| 2.2 | Readers take a plotted point as exact unless its uncertainty is shown. | opinion | **Single source**, B ⚑ | Wilke, *Fundamentals of Data Visualization*, "Visualizing uncertainty": "When we see a data point drawn in a specific location, we tend to interpret it as a precise representation of the true data value." https://clauswilke.com/dataviz/visualizing-uncertainty.html |
| 2.3 | If people may check more often than the data updates, show when it was last updated. Don't hide stale data behind placeholders. | opinion | Guideline (single authoritative source), A | Apple HIG Widgets: "If people are likely to check your widget more frequently than you can update it, consider displaying text that describes when the data was last updated." and "…show content quickly without hiding stale data behind placeholder content." Also: "Use system functionality to refresh dates and times in your widget." |
| 2.4 | Leave the display unchanged while the underlying status is unchanged. | opinion | Guideline (single authoritative source), A | Apple HIG Live Activities: "If the underlying content or status remains the same, maintain the same display until the underlying content or status changes." |
| 2.5 | Status indicators should use at least two of colour, shape and symbol. Not-started and undefined states get their own colours. | opinion | **Single source**, B ⚑ | IBM Carbon, Status indicator pattern: "Relying solely on color to convey status is insufficient, especially for users with color vision deficiencies." and "status indicators should rely on at least two of the following elements: color, shape, or symbol." The grey (drafts / not started) and purple (outliers / undefined) meanings came back **paraphrased** this round, so the checker should confirm the wording. https://carbondesignsystem.com/patterns/status-indicator-pattern/ |
| 2.6 | An empty area is ambiguous: finished, still loading, or failed? Say plainly when there is no data. A wrong "no records" message is especially harmful. | opinion | **Single source**, B | Kaplan, "Designing Empty States in Complex Applications", NN/g, 2021-09-19: "A brief system message within the content area at completion of the process (e.g., 'There are no records to display for the selected date range') would be a simple yet effective way to increase the visibility of system status and, therefore, user confidence in the results." and "Inaccurate system-status messages for empty states are particularly harmful." https://www.nngroup.com/articles/empty-state-interface-design/ |
| 2.7 | While loading, show something soon. Placeholders are suggested, along with saying clearly that content is loading. This is in tension with row 2.3 (stale data versus placeholders on widgets); both are from Apple, for different contexts, and neither is chosen here. | opinion | Guideline (single authoritative source), A | Apple HIG Loading: "Show something as soon as possible."; "…consider showing placeholder text, graphics, or animations as content loads, replacing these elements as content becomes available."; "Clearly communicate that content is loading and how long it might take to complete." https://developer.apple.com/design/human-interface-guidelines/loading |
| 2.8 | Not covered by the sources opened: making stale data **visibly fade or degrade** (greying, fading, ageing marks); showing an unknown value in a gauge or number tile. An extended search found no usability study on fading or desaturating to show data age. | — | not documented | — |

## 3. A screen that updates itself every minute

| # | Statement | Kind | Label / grade | Source and quote |
|---|---|---|---|---|
| 3.1 | Auto-updating information that starts on its own and sits alongside other content needs a way to pause, stop or hide it, or to set how often it updates. The exception is when the updating is essential. Level A. The intent names "stock price updates" as an example. Whether a screen whose whole purpose is live status counts as "essential" is not documented (Q4). | fact | W3C standard, A | WCAG 2.2 SC 2.2.2: "For any auto-updating information that (1) starts automatically and (2) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it or to control the frequency of the update unless the auto-updating is part of an activity where it is essential." Intent: "Common time-based content includes automatically updated weather information, news, stock price updates, and auto-advancing presentations and messages." https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html |
| 3.2 | Sudden layout shifts cause wrong taps. Reserve space in advance and animate with transforms, not size or position changes. Shifts within 500 ms of user input are excluded from the CLS (Cumulative Layout Shift) measure. | fact (metric) + opinion | Guideline (single authoritative source, Google), A ⚑ (web.dev is Google developer guidance, not Material) | Mihajlija and Walton, "Cumulative Layout Shift (CLS)", web.dev: "A sudden shift in layout makes the user confirm a large order they intended to cancel."; "Layout shifts that occur within 500 milliseconds of user input will have the `hadRecentInput` flag set, so they can be excluded from calculations."; "It's best to create some space right away and show a loading indicator to avoid an unpleasant layout shift when the request completes."; "Instead of changing the `height` and `width` properties, use `transform: scale()`." https://web.dev/articles/cls |
| 3.3 | People miss changes outside where they are looking. Change one thing at a time, group what changes, use animation sparingly, and dim what didn't change. | opinion | **Single source**, B | Budiu, "Change Blindness in UX: Definition", NN/g, 2018-09-23: "Make one change at a time."; "Group all elements that will change simultaneously in the same region of the screen, to make sure that the motion will draw attention to all of them."; "Use animation to signal change, but avoid having too many competing animations on the screen to prevent a dilution of attention."; "Dim the areas of the screen that do not change, in order to attract attention to changes." https://www.nngroup.com/articles/change-blindness-definition/ |
| 3.4 | Use brief animation, up to 2 seconds, to signal that new information has arrived. Researcher's note (ungraded): this sits against row 4.5 unless it is reduced when Reduce Motion is on. | opinion | Guideline (single authoritative source), A | Apple HIG Widgets: "…use standard and custom animations with a duration of up to two seconds to let people know when new information is available or when content displays differently." Live Activities: "Use animations to reinforce the information you're communicating and to bring attention to updates." |
| 3.5 | Indicators draw attention to changing content and belong next to the element they describe. They add noise, so use few. A numbered badge suits a count of new or updated items when the exact number matters. | opinion | Two single sources on related points: NN/g (indicators), B; Carbon (numbered badge), B ⚑. **Not corroborated** (round 1 said corroborated; withdrawn) | Flaherty, "Indicators, Validations, and Notifications", NN/g, 2024-01-17: "Indicators are visual cues intended to attract users' attention to a particular piece of content or UI element that is dynamic in nature."; "They are associated with a UI element or with a piece of content, and should be shown in close proximity to that element."; "Indicators can introduce noise and clutter to your overall interface, and may distract users, so it is important to consider how many (if any) indicators to use in your design." https://www.nngroup.com/articles/indicators-validations-notifications/ — Carbon: "A numbered badge is used when a count of new or updated items is available, and it's important for the user to know the exact number of updates." |
| 3.6 | An unread badge must clear once the items have been seen, or people think there is new content when there isn't. Don't rely on a badge alone for essential information. (This covers the app-icon badge only; it is the nearest guidance found to "new since last visit".) | opinion | Guideline (single authoritative source), A | Apple HIG Notifications: "Keep badges up to date."; "Update your app's badge as soon as people open the corresponding notifications."; "You don't want people to think there are new notifications available, only to find that they've already viewed them all."; "Make sure badging isn't the only method you use to communicate essential information."; "Don't use a badge to convey numeric information that isn't related to notifications, such as weather-related data, dates and times, stock prices, or game scores." https://developer.apple.com/design/human-interface-guidelines/notifications |
| 3.7 | Status messages added without a change of context must reach assistive technology without moving focus. Level AA. | fact | W3C standard, A | WCAG 2.2 SC 4.1.3: "In content implemented using markup languages, status messages can be programmatically determined through role or properties such that they can be presented to the user by assistive technologies without receiving focus." https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html |
| 3.8 | Not covered: highlighting what is new **since the last visit** within a screen, as opposed to during a session or on an app badge; how long such a highlight should last. | — | not documented | — |

## 4. Standards lookup (where they differ, each is reported without choosing)

| # | Item | Source and quote | Grade |
|---|---|---|---|
| 4.1 | Colour not used alone | WCAG 2.2 SC 1.4.1 (Level A): "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html — Apple HIG Accessibility: "Convey information with more than color alone. … Offer visual indicators, like distinct shapes or icons, in addition to color to help people perceive differences in function and changes in state." https://developer.apple.com/design/human-interface-guidelines/accessibility | A each |
| 4.2 | Text contrast | **WCAG 1.4.3 (AA):** "…a contrast ratio of at least 4.5:1"; large text 3:1. Large scale is "at least 18 point or 14 point bold". https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html — **Apple:** "Up to 17 pts / All / 4.5:1"; "18 pts / All / 3:1"; "All / Bold / 3:1". Apple allows 3:1 for bold text at any size; WCAG requires 14 pt bold. — **Google Android:** "If the text is smaller than 18sp, or if the text is bold and smaller than 14sp, use foreground and background colors that result in a color contrast ratio of at least 4.5:1. For all other text, set the color contrast ratio to at least 3:1." https://developer.android.com/guide/topics/ui/accessibility/apps | A each |
| 4.3 | Graphics and UI contrast | WCAG 1.4.11 (AA): "…a contrast ratio of at least 3:1 against adjacent color(s)" for user interface components and graphical objects. Examples: "Status icons on an application's dashboard (without associated text) have a 3:1 minimum contrast ratio" and, for charts, "A graph uses a light background and ensures that the colors for each line have a 3:1 contrast ratio against the background." The round-1 fetch returned different chart wording, so the checker should take the raw text. Gauges and progress indicators are not named. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | A |
| 4.4 | Touch targets (the sources disagree, and the units differ: CSS px, pt, dp) | **WCAG 2.5.8 (AA):** "at least 24 by 24 CSS pixels", with exceptions for spacing, equivalent control, inline, user-agent control and essential. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html — **WCAG 2.5.5 (AAA):** "at least 44 by 44 CSS pixels", with exceptions for equivalent, inline text, user agent and essential. https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html — **Apple (iOS, iPadOS):** default control size 44x44 pt, minimum 28x28 pt (Accessibility table). — **Google Android:** "at least 48dpx48dp. Larger is even better." | A each |
| 4.5 | Reduced motion | **WCAG 2.3.3 (AAA):** "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed." The example notes an animation "that respects the `prefers-reduced-motion` CSS media query." https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html — **Apple:** "When this setting is active, ensure your app or game responds by reducing automatic and repetitive animations, including zooming, scaling, and peripheral motion." Material's own wording: not opened. | A each |

## Proposed library entries (for the Source checker)

- **F-wcag22-01** (fact, A; topics: accessibility, mobile; shelf life 24 months): WCAG 2.2 values for:
  - 1.4.1, 1.4.3 (4.5:1 and 3:1; large is 18 pt or 14 pt bold) and 1.4.11 (3:1)
  - 2.5.8 (24×24 CSS px, AA) and 2.5.5 (44×44 CSS px, AAA)
  - 2.3.3 (AAA), 2.2.2 (A) and 4.1.3 (AA)

  Covers rows 3.1, 3.7 and 4.1–4.5.
- **F-platform-targets-contrast-01** (fact, A per publisher; topics: accessibility, mobile; 12 months): Apple targets are 44×44 pt default and 28×28 pt minimum, plus Apple's contrast table. Android targets are 48×48 dp, with 4.5:1 / 3:1 contrast by sp size. The entry records that they disagree; no choice is made.
- **P-glance-disclosure-01** (pattern, B; topics: design, dashboards, mobile; 24 months):
  - Essentials go on the glance surface (corroborated).
  - Detail is one tap away, and the tap opens the matching detail (Apple).
  - Labels set expectations (NN/g).
  - Keep to at most two levels (single source).

  Rows 1.1–1.6.
- **P-stale-visible-01** (pattern, B; topics: design, dashboards; 12 months): show a last-updated time when people may look more often than the data updates; don't hide stale data behind placeholders; keep the display unchanged while the status is unchanged (all Apple). Say plainly when there is no data, not a blank area (NN/g). Rows 2.3, 2.4 and 2.6. Note the tension with 2.7.
- **P-zero-means-zero-01** (pattern, B ⚑; topics: design, dashboards; 24 months): "0" only for a true zero; distinct marks for estimated, unavailable, provisional and low-reliability values; plotted points are read as exact. Rows 2.1–2.2. Two single sources on related points, **not** corroborated.
- **P-live-update-layout-01** (pattern, B; topics: design, mobile; 24 months): reserve space; animate with transforms; one change at a time, grouped, with sparing animation (2 seconds or less per Apple); badges for new items must clear once seen. Rows 3.2–3.6.

## Not opened (no finding rests on these)

- **Material Design 3 pages** (https://m3.material.io/foundations/designing/structure, https://m3.material.io/components/badges/guidelines): only the title rendered. Expected Material's 48dp target and contrast guidance, and badge usage guidance.
- **Material Design 2 pages** (https://m2.material.io/design/usability/accessibility.html, https://m2.material.io/design/communication/data-visualization.html): only a header rendered. Expected accessibility guidance and guidance on missing or real-time data in charts.
- **NN/g video** (https://www.nngroup.com/videos/data-visualizations-dashboards/): a video, not readable.
- **Uxcel and Justinmind progressive-disclosure pages:** search snippets only. Expected a restatement of the two-level limit, probably derived from Nielsen.
- **Vendor and community pages on data freshness** (basedash.com, Databricks and Microsoft Fabric community threads, motherduck.com): search snippets only. Expected "stale data looks fine" and colour-coded last-refresh times. They are not usable as design guidance.
- **Third-party mirror of Apple's text** (glama.ai): not used; the Apple page itself was opened instead.
- **WCAG 2.2 main page** (https://www.w3.org/TR/WCAG22/): opened in round 1, but the summary misstated 2.5.8, so no row rests on it.

---

1. **What I changed:** Nothing on disk; I have no write lane. My output is the revised memo above, which replaces the round-1 text in `research/Q-013-memo.md`.

2. **Why:** The round-1 memo asked for a word-for-word recheck and left gaps. Re-checking found that one claim of agreement between sources (row 3.5) rested on a paraphrase, and that several quotes came back worded differently. Filling the gaps added the rows on status messages, badges, loading and empty states.

3. **What I verified:** About 30 web fetches and searches; no shell or commands.
   - **Confirmed as quoted:** the Nielsen, Apple (Widgets, Live Activities, Charting data, Accessibility), WCAG (1.4.1, 1.4.3, 2.2.2, 2.3.3, 2.5.5, 2.5.8) and Android quotes.
   - **Came back different:** web.dev (two quotes), NN/g Indicators (the round-1 paraphrase), WCAG 1.4.11's chart example and Carbon's grey/purple meanings. All are corrected in the memo.
   - **Still unreadable:** Material 3 and Material 2 pages, which return only a title.
   - **Opened, no finding:** "Transactional Panorama" (arXiv HTML). It has no user study and isn't usability research.

4. **What is undone:**
   - No source on stale data visibly fading.
   - No source on "new since last visit" inside a screen.
   - Nothing on gauges.
   - Material's own wording is missing.
   - The two-level limit still has only one source.

5. **Needed outside my lane:**
   - **Source checker:** compare every quote with the raw page, especially rows 2.5, 3.2 and 4.3. Rule whether two NN/g authors count as two sources (row 1.5). Rule whether the ⚑ sources (Carbon, UK Analysis Function, Wilke, web.dev) are allowed.
   - **Chief of Staff:** put a card to the owner if a level-5 expert is wanted for Q4.

6. **Open questions:**
   - **Q1:** Is a narrow follow-up wanted on visibly fading stale data and on "new since last visit"? Public guidance doesn't appear to cover them; an expert or a paid source might.
   - **Q2:** Should design systems (IBM Carbon), government statistics style guides and visualisation textbooks count as sources for this programme?
   - **Q3:** Should the Material pages be re-tried with a tool that renders JavaScript?
   - **Q4:** Does WCAG 2.2.2's "essential" exception cover a screen whose whole purpose is live status? This is an interpretation question, possibly for a level-5 expert.