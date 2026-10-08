# Q-010 research memo: phone-first status dashboard for one owner

**Researcher:** Q-010 · **Dated:** 2026-10-08 · **Depth:** 3 (graded memo) · **Topics:** design, dashboards, information-design, accessibility, mobile

**How to read this memo**
- Each statement is marked **[F]** fact, **[E]** estimate or **[O]** opinion.
- Each has a grade: **A** = the standard or platform page itself, read in full; **B** = one primary page read directly; **C** = seen only in a search summary, a secondary restatement or a page I couldn't parse.
- **Confirmed** means two independent sources state it. **Single source** and **not documented** follow the question's rule.
- The library holds no entries on these topics; the only `mobile` entry, F-gh-09, is about GitHub Mobile and doesn't apply.
- Some PDFs couldn't be read: the full Brehmer 2017 paper, Few's "Dashboard Confusion", Munzner's slides and Song & Szafir. Claims resting on them are graded C until the Source checker reads them.

---

## 1. What goes on the first screen, what goes one tap down

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 1.1 | A dashboard is a single-screen, at-a-glance view. Few: "consolidated and arranged on a single screen so the information can be monitored at a glance". NN/g (Laubheimer 2017): dashboards need "an at-a-glance, single-screen view… must quickly communicate important information" and are "not intended" for exploration. | F, B | **Confirmed** (NN/g read directly; Few's wording via several citing pages, C) |
| 1.2 | Progressive disclosure: show "only a few of the most important options" first and a larger set on request. "designs that go beyond 2 disclosure levels typically have low usability" (Nielsen 2006). | F, B | Single source |
| 1.3 | The way down must be "clearly visible", with a label that sets "clear expectations" of what's behind it (information scent) (Nielsen 2006). | F, B | Single source |
| 1.4 | The summary item is an entry point. Tapping it goes straight to that item's own detail, not to a general screen. NN/g cards: "a linked entry point to further details, rather than the full details themselves", suited to dashboards, mixed content and mobile. Apple HIG widgets: "Ensure that a widget interaction opens your app at the right location… don't make people navigate to the relevant area." | F, B | **Confirmed** |
| 1.5 | Keep each glance unit to one idea: "Display only the information that's directly related to the widget's main purpose" (Apple HIG widgets). | F, B | Single source |
| 1.6 | NN/g cards: cards do poorly when users must compare items or search for a specific one. A list does better for uniform items. | F, B | Single source |
| 1.7 | How a summary should signal that one item's detail is *worth* opening (as opposed to merely available) | — | **Not documented** in the sources read |
| 1.8 | Opinion: 1.1–1.4 together point to one row or card per project on the first screen, each opening that project's own detail, with no third level. | O | — |

## 2. Stage of work that can loop back, stall or wait, without implying a percentage

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 2.1 | When duration or completion can't be known, use an indeterminate indicator, not a filling bar. Apple HIG: determinate "for a task with a well-defined duration", indeterminate "for unquantifiable tasks". Material (m1): determinate "when the percentage complete is detectable". | F, A/B | **Confirmed** |
| 2.2 | Apple HIG: "People tend to associate a stationary indicator with a stalled process." Uneven progress (90 % in 5 s, then 5 min) "can even feel deceptive." | F, B | Single source |
| 2.3 | Named statuses, not quantities. GOV.UK task list: "Completed"/"Incomplete", plus "In progress" and "Cannot start yet" (grey text, row not linked, with a hint explaining the dependency). Use "adjectives rather than verbs", keep labels short, and give completed items no colour so attention goes to items needing action. | F, B | Single source |
| 2.4 | NN/g status trackers (Rosala 2019): "Present the latest update prominently". Date each update. During long silences "users start to think perhaps something went wrong". Avoid internal jargon in status labels. | F, B | Single source |
| 2.5 | How to show a stage that **loops back** (rework), and how per-project stage should roll up from per-item stage | — | **Not documented** |
| 2.6 | Opinion: 2.2 and 2.4 suggest showing "time since last change" next to a stage name as the honest sign of a stall, rather than motion or a bar. | O | — |

## 3. One-line "where it's heading" summary per project

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 3.1 | Plain-language status, latest update first, and setting expectations of wait time "where possible" (NN/g status trackers) | F, B | Single source |
| 3.2 | Few lists "supplying inadequate context" and "excessive detail or precision" among common dashboard mistakes | F, C | Single source (search summary only) |
| 3.3 | Any guidance on a phase / next work / what-it-unlocks summary line, or on keeping such a line from overclaiming | — | **Not documented** |

## 4. Telling kinds of item apart without ranking their urgency

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 4.1 | **Expressiveness principle:** an encoding should show all of the data's facts and only those facts. Categorical (nominal) data shouldn't be encoded in a way that implies order. Hue and shape are "identity" channels. Luminance, saturation, size and position are "magnitude" (ordered) channels. Sources: Munzner (lecture slides) and Mackinlay 1986 (via UW slides); hue is ranked most effective for nominal data. | F, C | **Confirmed** across two independent authors, but only through search summaries. Needs a primary read. |
| 4.2 | ColorBrewer qualitative schemes "do not imply magnitude differences between legend classes" | F, C | Single source |
| 4.3 | Add "distinct shapes or icons, in addition to color" for differences in function and state (Apple HIG) | F, A | **Confirmed** with WCAG 1.4.1 and GOV.UK Tag |
| 4.4 | GOV.UK Tag: few kinds ("The more you add, the harder it is for users to remember them"). Keep each kind's colour the same everywhere. Tags must not look tappable. GOV.UK task list: red is for errors only. | F, B | Single source |
| 4.5 | Opinion: by 4.1, if "irreversible / self-defaulting decision" and "routine merge" must look different but not ranked, separate them by hue plus shape or icon plus text, not by size, brightness or position. A wording caution: GOV.UK lets colour "draw the user's attention" to an especially important tag, which *is* a ranking. | O | — |

## 5. A screen that updates itself every minute

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 5.1 | **WCAG 2.2.2 (A):** auto-updating content that starts automatically and sits beside other content needs a way to "pause, stop, or hide it or to control the frequency of the update". There is no 5-second exception for auto-updating content. | F, A | Standard (normative) |
| 5.2 | Unexpected layout shift makes users "lose their place, miss-tap… confirm a large order they intended to cancel". The "good" score is CLS ≤ 0.1. Shifts within 500 ms of user input are treated as expected. Reserve space for content that loads later. (web.dev CLS) | F, B | Single source (Google) |
| 5.3 | Change blindness: changes far from the focus of attention go unseen. Use animation to signal change, but not many competing animations. Group changes in one region. "Make one change at a time" (NN/g, Budiu 2018). Animation should be "unobtrusive, brief, and subtle" (NN/g, Laubheimer 2020). | F, B | **Confirmed** (two NN/g authors; same organisation, so weakly independent) |
| 5.4 | Apple Reduce Motion: cut automatic and repeated animation, and replace x/y/z transitions with fades | F, A | Single source; WCAG 2.3.3 (AAA) agrees in principle |
| 5.5 | **WCAG 4.1.3 (AA):** status messages must reach assistive technology without taking focus | F, A | Standard |
| 5.6 | **WCAG 3.2.5 (AAA):** changes of *context* only on user request. A change of content alone isn't automatically a change of context. | F, A | Standard |
| 5.7 | A list that reorders itself confuses the user, who must then search for the moved item (US patent 7164423 background text) | F, C | Single source; weak source |
| 5.8 | Showing what's new since the last visit: a changed background or font weight. A badge counts unread items. "If everything… is called out as important, nothing is important." (CMS Design System via search) | F, C | Single source |
| 5.9 | Research-backed guidance on reorder-vs-hold policy, or on how "new since last visit" should work | — | **Not documented** in NN/g, WCAG, Apple or Material pages read |

## 6. Activity view: who is working on what, why, and what changed

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 6.1 | The W3C Activity Streams 2.0 data model: actor, object, target, origin, result, instrument, `published` time and a human-readable `summary`. It also covers actions "in the process of occurring, or may occur in the future". | F, B | Single source (a data standard, not design guidance) |
| 6.2 | WAI-ARIA feed pattern: set `aria-busy` while items are added or removed, and keep reading position tied to the focused item | F, B | Single source |
| 6.3 | A standard field for "why", and usability research on activity feeds | — | **Not documented**. The pages found were product blogs, excluded under the question's rules. |

## 7. Timelines on a 360 px screen

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 7.1 | Brehmer et al. 2017 (IEEE TVCG) design space: representation, scale and layout. Scales: chronological (linear *or logarithmic*), relative (to a baseline event), sequential (fixed spacing that doesn't match elapsed time), and sequential plus interim duration (the gap is written in). | F, C | **Confirmed** via Fouché et al. 2022's restatement plus search; original PDF not parsed |
| 7.2 | On phones, people completed range-over-time tasks faster with a linear layout than a radial one, with few differences in error (Brehmer, Lee, Isenberg, Choe, TVCG 2019; 87 participants) | F, B | Single source |
| 7.3 | For uncertain start or end times, use "ambiguation" (lighter colour value over the uncertain span) or error bars to judge durations. Use gradient or transparency to judge probability. (Gschwandtner et al., TVCG 2016) | F, B | Single source |
| 7.4 | Estimate: a sequential scale with written durations, or a log scale, are the published options that fit minutes and days on one axis. Planned items with no fixed time fit a sequential scale, which needs order, not dates. | E | — |
| 7.5 | A tested design for mixing past and planned-but-undated events on one phone timeline | — | **Not documented** |

## 8. Unknown, stale or estimated values

| # | Statement | Type / grade | Status |
|---|---|---|---|
| 8.1 | Apple HIG widgets: if people check more often than you can update, show "when the data was last updated". "show content quickly without hiding stale data behind placeholder content." | F, B | Single source |
| 8.2 | Missing data: Song & Szafir (TVCG 2019) tested zero-filling, interpolation and means, displayed as highlight, downplay or annotation. Highlighting missing data raised confidence. Breaking visual continuity lowered perceived quality and "can bias interpretation". Song et al. 2021: showing missing values changed how consistently people decided. | F, C (findings) / B (abstracts) | Single source per study |
| 8.3 | Uncertainty as a visual variable: sketchiness is "as intuitive as blur", but people preferred dashing over blur, greyscale or sketchiness (Boukhelifa et al., InfoVis 2012). A lighter value marks uncertain spans (7.3). | F, B | **Confirmed** that lightening, blur or dashing is read as uncertainty (two independent studies) |
| 8.4 | NN/g skeleton screens: suited to full-page loads of about 2–10 s, not to partial modules. Over 10 s, use a progress bar (Tankala 2023). | F, B | Single source |
| 8.5 | Making stale data visibly degrade over time (fading with age), and a tested marker that keeps "unknown" from being read as zero in a gauge | — | **Not documented** |

## 9. Standards lookup

| Item | Value | Type / grade | Status |
|---|---|---|---|
| Colour not used alone | WCAG 1.4.1 (A); Apple HIG; GOV.UK Tag; NN/g ("secondary grouping cue") | F, A | **Confirmed** |
| Text contrast | 4.5:1; large text 3:1, where large is ≥ 18 pt, or ≥ 14 pt bold (WCAG 1.4.3, AA). Apple restates this as 4.5:1 up to 17 pt and 3:1 at 18 pt or bold. | F, A | **Confirmed** (Apple derives from WCAG) |
| Graphics and UI contrast | 3:1 against adjacent colours; a threshold, not rounded, so 2.999:1 fails (WCAG 1.4.11, AA) | F, A | Single standard |
| Target size, web | 24 × 24 CSS px, with spacing/equivalent/inline/user-agent/essential exceptions (2.5.8, AA). 44 × 44 CSS px (2.5.5, AAA). | F, A | Standard |
| Target size, iOS | Default 44 × 44 pt, **minimum 28 × 28 pt** (current HIG table) | F, A | Single source. Note: many pages still say "44 pt minimum". |
| Target size, Android | ≥ 48 × 48 dp (about 9 mm), spaced ≥ 8 dp (Google Accessibility Help) | F, B | Single source (Material page not readable) |
| Reduced motion | WCAG 2.3.3 (AAA); `prefers-reduced-motion` is a sufficient technique. Apple: replace movement with fades. | F, A | **Confirmed** |

**Discarded:** a search summary said a "2026 NN/g report" puts the skeleton-screen window at 400 ms–3 s. The NN/g page itself says 2–10 s, so I didn't use it. A fetch summary called WCAG 4.1.3 AAA; the Understanding page says AA.

---

## Proposed library entries (for the Source checker)

```
id: LIB-F-q010-a   form: fact   grade: A   shelf_life: 24 months   topics: [accessibility, mobile]
claim: "WCAG 2.2: 2.5.8 (AA) targets ≥24×24 CSS px with five exceptions; 2.5.5 (AAA) ≥44×44 CSS px; 1.4.3 (AA) text 4.5:1, large (≥18pt / ≥14pt bold) 3:1; 1.4.11 (AA) UI/graphics 3:1, unrounded; 1.4.1 (A) colour not sole means; 4.1.3 status messages AA; 2.2.2 (A) auto-updating content needs pause/stop/hide or frequency control."
sources: w3.org/TR/WCAG22/ ; w3.org/WAI/WCAG22/Understanding/{target-size-minimum,target-size-enhanced,non-text-contrast,pause-stop-hide,status-messages}.html

id: LIB-F-q010-b   form: fact   grade: B   shelf_life: 6 months   topics: [mobile, accessibility, design]
claim: "Apple HIG (fetched 2026-10-08): iOS default control size 44×44 pt, minimum 28×28 pt; convey information with more than colour (shapes/icons); Reduce Motion → replace x/y/z transitions with fades. Google Android Accessibility Help: targets ≥48×48 dp (~9 mm), ≥8 dp apart."
sources: developer.apple.com/design/human-interface-guidelines/accessibility ; support.google.com/accessibility/android/answer/7101858

id: LIB-F-q010-c   form: fact   grade: B   shelf_life: 12 months   topics: [design, dashboards]
claim: "Determinate progress only when completion/duration is knowable, else indeterminate (Apple HIG progress indicators; Material m1). Apple: a stationary indicator reads as stalled."
sources: developer.apple.com/design/human-interface-guidelines/progress-indicators ; m1.material.io/components/progress-activity.html

id: LIB-F-q010-d   form: fact   grade: B   shelf_life: 36 months   topics: [information-design, mobile]
claim: "Phone range-over-time tasks were faster with linear than radial layouts, similar error (Brehmer et al., TVCG 2019). Uncertain temporal bounds: ambiguation (lighter value) or error bars for durations (Gschwandtner et al., TVCG 2016)."
sources: microsoft.com/en-us/research/publication/visualizing-ranges-over-time-on-mobile-phones-a-task-based-crowdsourced-evaluation/ ; repositum.tuwien.at/handle/20.500.12708/148266

id: LIB-F-q010-e   form: fact   grade: B   shelf_life: 12 months   topics: [dashboards, mobile]
claim: "Apple HIG widgets: deep-link a tap to the matching detail; show last-updated text when people check more often than data refreshes; don't hide stale data behind placeholders."
sources: developer.apple.com/design/human-interface-guidelines/widgets

id: LIB-P-q010-a   form: pattern   grade: B   shelf_life: 24 months   topics: [design, dashboards, information-design]
claim: "Glance screen = one single-screen summary whose items are linked entry points to their own detail; no more than two disclosure levels; the link label must set expectations."
sources: nngroup.com/articles/dashboards-preattentive/ ; nngroup.com/articles/progressive-disclosure/ ; nngroup.com/articles/cards-component/ ; Apple HIG widgets

id: LIB-P-q010-b   form: pattern   grade: C (until primary read)   shelf_life: 36 months   topics: [information-design, design]
claim: "Encode unranked kinds with identity channels (hue, shape, icon + text), never magnitude channels (size, luminance, position), per the expressiveness principle (Mackinlay 1986; Munzner)."
sources: cs.ubc.ca/~tmm/courses/436V-20/slides/marks.pdf ; courses.cs.washington.edu/courses/cse442/25au/lectures/CSE442-VisualEncoding.pdf
```

---

## Six-part contract

**1. What I changed.** Nothing on disk; I have no write lane. The memo above is for the Orchestrator to record verbatim in `research/Q-010.md` (memo section).

**2. Why.** Q-010 asks for a depth-3 graded memo to support the Service Desk design milestone. The library has no entries on these topics.

**3. What I verified.** I have no shell, so no commands; this is a list of reads.
- Read in the pack: `research/Q-010.md`, `BRIEF.md`, a grep for `design|dashboard|accessib|mobile|information` across the library topics (one match, not relevant), plus L-F1 and L-P1 for the entry format.
- Read directly with web fetch: WCAG 2.2 and five Understanding documents; Apple HIG accessibility, progress-indicators and widgets JSON; Google Android accessibility help; Material m1 progress page; NN/g pages on progressive disclosure, dashboards, cards, status trackers, change blindness, animation and skeleton screens; web.dev CLS; the W3C APG feed pattern and Activity Streams 2.0; GOV.UK task list and Tag; the Gschwandtner, Boukhelifa, Brehmer 2019 and Song & Szafir pages.
- Not parsed (PDFs): Brehmer 2017, Few's "Dashboard Confusion", Munzner's and UW's slides, arXiv 2301.07687. Claims resting on them are graded C.

**4. What is undone.**
- No primary read of Brehmer 2017's scale definitions, the Munzner and Mackinlay expressiveness wording, or Song & Szafir's detailed findings.
- No direct read of Material 3's touch-target page (it didn't render).
- No authoritative source found for: loop-back stages, "where it's heading" summary lines, new-since-last-visit, reorder policy, activity "why", undated planned events on timelines, or stale data that visibly fades.

**5. What is needed outside my lane.**
- The Source checker should re-read the C-graded items from their primary sources, perhaps with a PDF-capable fetch.
- Few's *Information Dashboard Design* and Munzner's *Visualization Analysis & Design* are paid books. Whether to buy them is a decision card for the Chief of Staff to put to the owner.
- The "not documented" gaps can't be closed without new research; only an expert or a usability test could close them.

**6. Open questions (added, not closed).**
- Q-010-a: Is there published research on showing rework or loop-back stages without implying progress?
- Q-010-b: Is there a tested way to mark stale or unknown values in gauges so they aren't read as zero (for example, ageing or fading)?
- Q-010-c: Should the iOS 28 pt minimum or the 44 pt default govern this design, given WCAG's 24 CSS px at AA and 44 CSS px at AAA?

Sources:
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [Understanding 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Understanding 3.2.5](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html), [Understanding 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Apple HIG Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators), [Apple HIG Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets)
- [Google touch target size](https://support.google.com/accessibility/android/answer/7101858?hl=en), [Material m1 progress](https://m1.material.io/components/progress-activity.html)
- [NN/g Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [NN/g Dashboards](https://www.nngroup.com/articles/dashboards-preattentive/), [NN/g Cards](https://www.nngroup.com/articles/cards-component/), [NN/g Status trackers](https://www.nngroup.com/articles/status-tracker-progress-update/), [NN/g Change blindness](https://www.nngroup.com/articles/change-blindness-definition/), [NN/g Animation](https://www.nngroup.com/articles/animation-purpose-ux/), [NN/g Skeleton screens](https://www.nngroup.com/articles/skeleton-screens/)
- [web.dev CLS](https://web.dev/articles/cls), [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/), [Activity Streams 2.0](https://www.w3.org/TR/activitystreams-core/)
- [GOV.UK task list](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/), [GOV.UK Tag](https://design-system.service.gov.uk/components/tag/), [CMS Design System badge](https://design.cms.gov/components/badge)
- [Brehmer et al. 2019](https://www.microsoft.com/en-us/research/publication/visualizing-ranges-over-time-on-mobile-phones-a-task-based-crowdsourced-evaluation/), [Timelines Revisited site](https://timelinesrevisited.github.io/), [Fouché et al. 2022](https://arxiv.org/pdf/2206.09910), [Gschwandtner et al. 2016](https://repositum.tuwien.at/handle/20.500.12708/148266), [Boukhelifa et al. 2012](https://www.aviz.fr/Research/UncertaintySketchy), [Song & Szafir](https://cmci.colorado.edu/visualab/MissingData), [Song et al. 2021](https://arxiv.org/abs/2109.08723)
- [Few, Dashboard Confusion](https://www.informationweek.com/data-management/dashboard-confusion), [Munzner marks slides](https://www.cs.ubc.ca/~tmm/courses/436V-20/slides/marks.pdf), [UW visual encoding slides](https://courses.cs.washington.edu/courses/cse442/25au/lectures/CSE442-VisualEncoding.pdf), [RColorBrewer docs](https://rdrr.io/pkg/RColorBrewer/man/ColorBrewer.html), [US patent 7164423](https://patents.google.com/patent/US7164423)
