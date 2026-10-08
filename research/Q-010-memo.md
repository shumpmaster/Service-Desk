# Q-010 memo, revision 1: answer to the source check

**Researcher:** Q-010 · **Dated:** 2026-10-08 · **Revises:** `research/Q-010-memo.md` (same date) · **Depth:** 3 · **Topics:** design, dashboards, information-design, accessibility, mobile

Grades and labels mean the same as in the first memo. In this revision, **same publisher** means two pages from one body, such as two Apple pages. I don't count that as independent, but I flag it so the Source checker can decide, as it did for W3C. Rows not listed here stand as they were, still unchecked.

## A. Corrected rows

| # | Revised statement | Type / grade | Status |
|---|---|---|---|
| 1.1 | **Correction.** My first-round NN/g quote ("at-a-glance, single-screen view… must quickly communicate") was wrong. NN/g (Laubheimer): "collections of data visualizations, presented in a **single-page view** that imparts at-a-glance information on which users can act quickly." Few (read directly this round): "consolidated and arranged on a single screen so the information can be monitored at a glance." | F, B | **Confirmed** for *at-a-glance*. *Single page* vs *single screen*: the two sources word it differently, so "single screen" rests on Few alone. |
| 4.1 | Expressiveness principle: show "all of, and only, the information in the dataset attributes". Unordered data "should not be shown in a way that perceptually implies an ordering that does not exist." Hue and shape are **identity** channels. Size, saturation and luminance are **magnitude** channels. **Correction:** *spatial region* is an identity channel. Only *position on a scale* is a magnitude channel. | F, B | **Confirmed** by two independent course pages (CUNY; BCB5200). Both restate Munzner, *VAD* ch. 5, so the original is still unread. The Mackinlay 1986 attribution stays at C. |
| 5.4 | Reduce Motion. Apple HIG: cut "automatic and repetitive animations". Replace "transitions in x-, y-, and z-axes with fades". Apple App Store Connect criteria: where motion carries meaning, "consider providing a new animation that avoids motion… such as a dissolve, highlight fade, or color shift", rather than removing it. WCAG 2.3.3 (AAA): "Motion animation triggered by interaction can be disabled, unless… essential". A sufficient technique is "Using the CSS prefers-reduced-motion query to prevent motion". | F, B | **Confirmed** (Apple + W3C, independent) that you should honour the OS reduce-motion setting and let non-essential motion be turned off. *Use fades instead* comes from two Apple pages (same publisher). |
| 8.1a | New, side note. WidgetKit: a frequently viewed widget typically gets "40 to 70 refreshes" a day, "roughly… every 15 to 60 minutes". Timeline entries should be "at least about 5 minutes apart". | F, B | Single source. This matters only if a home-screen widget is ever in scope. |
| 9 · iOS | Apple accessibility table: default 44×44 pt, minimum 28×28 pt (iOS/iPadOS). Apple Buttons page: "a button needs a hit region of at least 44x44 pt". The two Apple pages **conflict** on the minimum. | F, B | **44 pt:** two Apple pages (same publisher). **28 pt minimum:** single source, contradicted by Apple's own Buttons page. |
| 9 · iOS spacing | Apple accessibility: "about 12 points of padding around elements that include a bezel… about 24 points… [for] elements without a bezel". | F, B | Single source |
| 9 · Android | "at least 48dpx48dp. Larger is even better." (developer.android.com accessibility guide). The Google Accessibility Help page says ≥48×48 dp, about 9 mm. | F, B | Two Google pages (same publisher). The ≥8 dp spacing is single source and not in the entry. Material 3 still didn't render. |
| 7.2, 7.3 | Unchanged wording. The only second places I found were copies of each paper's own abstract (search summaries, PubMed, the TU Wien bibliography). These aren't independent, and the author PDFs came back as binary. | F, B | **Single source** (one study each) |

## B. Proposed library entries (replacing the four not filed)

```
id: LIB-F-q010-b1   form: fact   grade: B   shelf_life: 6 months   topics: [mobile, accessibility]
claim: "Touch targets: iOS controls 44×44 pt by default; Apple's Buttons page says a button needs a hit region of at least 44×44 pt. Android: at least 48×48 dp."
sources: developer.apple.com/design/human-interface-guidelines/accessibility ; developer.apple.com/design/human-interface-guidelines/buttons ; developer.android.com/guide/topics/ui/accessibility/apps ; support.google.com/accessibility/android/answer/7101858
note: each platform's figure rests on two pages from that platform's own publisher. The iOS 28 pt minimum is left out: one page only, and contradicted by the Buttons page.

id: LIB-F-q010-b2   form: fact   grade: B   shelf_life: 12 months   topics: [accessibility, mobile, design]
claim: "Honour the OS reduce-motion setting and let non-essential motion be disabled (WCAG 2.3.3 AAA; prefers-reduced-motion is a sufficient technique; Apple HIG Reduce Motion). Apple adds: where motion carries meaning, replace it with fades/dissolves rather than removing it."
sources: w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html ; developer.apple.com/design/human-interface-guidelines/accessibility ; developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria
note: the first sentence has independent sources (W3C + Apple). The fades sentence is Apple-only (two pages).

id: LIB-F-q010-e    form: fact   grade: B   shelf_life: 12 months   topics: [dashboards, mobile]
claim: "A tap on a glance surface should open the app at the matching content, not a generic screen: HIG 'don't make people navigate to the relevant area'; WidgetKit docs 'open the app at a scene that matches the content of the widget'."
sources: developer.apple.com/design/human-interface-guidelines/widgets ; developer.apple.com/documentation/widgetkit/linking-to-specific-app-scenes-from-your-widget-or-live-activity
note: two Apple pages (same publisher). Last-updated and stale-data parts dropped: HIG widgets only.

id: LIB-P-q010-b    form: pattern   grade: B   shelf_life: 36 months   topics: [information-design, design]
claim: "Show unranked kinds with identity channels (hue, shape, plus icon and text), not magnitude channels (size, saturation, luminance, position on a scale): unordered data should not imply an order (expressiveness principle, Munzner VAD ch. 5)."
sources: math.csi.cuny.edu/~mvj/GC-DataViz-S23/lectures/L5.html ; bsmity13.github.io/BCB5200/lectures/08_marks_channels.html
note: both pages restate Munzner; the original text is unread.
```

**Withdrawn:** LIB-F-q010-d (Brehmer 2019; Gschwandtner 2016). It stays in the memo as single-source rows 7.2 and 7.3.

---

## Six-part contract

**1. What I changed**
- Rewrote rows 1.1, 4.1, 5.4, 7.2/7.3 and the three platform rows in section 9. Added 8.1a and the iOS spacing row.
- Replaced LIB-F-q010-b with b1 and b2.
- Cut LIB-F-q010-e down to the deep-link claim and gave it a second source.
- Rebuilt LIB-P-q010-b on two pages I could read, and moved it from grade C to B.
- Withdrew LIB-F-q010-d.
- Nothing is written to disk; I have no write lane.

**2. Why**
- The source check failed b, d, e and P-b because each claim had one source or an unreadable one.
- It also found that my NN/g quote in 1.1 didn't match the page. That was my error. NN/g says "single-page view", and I've corrected it.

**3. What I verified** (web reads only; I have no shell)
- **Apple:** the HIG accessibility JSON gave the full size table, the padding text, the Reduce Motion list and the shapes/icons text. The Buttons JSON says "at least 44x44 pt"; the Layout JSON has no iOS size. The App Store Connect Reduced Motion criteria were read.
- **Apple WidgetKit:** the linking page JSON confirms the deep link. The keeping-up-to-date JSON gave the refresh budget and says nothing about last-updated labels.
- **Android:** the developer.android.com guide says 48dp×48dp, with no spacing figure. Material 3 rendered only its title.
- **W3C:** the WCAG 2.3.3 Understanding page was read; it is AAA, and prefers-reduced-motion is a sufficient technique.
- **Few:** InformationWeek "Dashboard Confusion" was read directly and the definition matches.
- **NN/g:** the dashboards page was re-read; it says "single-page view" and doesn't quote Few.
- **Expressiveness principle:** the CUNY L5 and BCB5200 course pages were read.
- **Failed reads:**
  - Brehmer 2019: the umd.edu copy returned 404, the isenberg.cc PDF was binary, HAL denied access, PubMed showed a cookie wall, Medium returned 403.
  - Gschwandtner 2016: the cvast PDF was binary and the bibliography page had no abstract.
  - Munzner's VAD-marks PDF was binary; ACM returned 403 and a Stanford slide deck was too large to fetch.

**4. What is undone**
- No primary read of Munzner ch. 5 or Mackinlay 1986.
- No independent second source for the two timeline studies.
- No second source for the iOS 28 pt minimum.
- No readable Material 3 touch-target page.
- Rows the checker didn't open (GOV.UK, web.dev CLS, Boukhelifa, Song & Szafir) are still unchecked.

**5. What is needed outside my lane**
- **A PDF-capable read:** for the author PDFs (isenberg.cc Brehmer_2019_VRO.pdf; cvast PubDat_242383.pdf) and Munzner's VAD-marks.pdf.
- **Fetched PDF copies:** my fetches saved copies to a path outside this folder, which I didn't open because of the brief's folder rule.
- **A paid book:** buying Munzner's *VAD* is still a decision card for the owner.

**6. Open questions (added, not closed)**
- **Q-010-c, sharpened:** Apple's accessibility page gives a 28 pt minimum, but its Buttons page says "at least 44x44 pt". Which one should a design criterion follow?
- **Q-010-d, new:** a single study's finding has only one primary source, its own paper. Should the "two independent sources" rule accept a peer-reviewed paper plus an independent paper that restates it, or should such findings always be filed as single source?
- **Q-010-e, new:** does "two pages from the same platform publisher" count as confirmed for that platform's own rules, as was accepted for W3C?

Sources:
- [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Apple HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Apple HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Apple HIG Widgets](https://developer.apple.com/design/human-interface-guidelines/widgets)
- [App Store Connect: Reduced Motion criteria](https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria), [WidgetKit: linking to app scenes](https://developer.apple.com/documentation/widgetkit/linking-to-specific-app-scenes-from-your-widget-or-live-activity), [WidgetKit: keeping a widget up to date](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)
- [Android: make apps more accessible](https://developer.android.com/guide/topics/ui/accessibility/apps), [Google Accessibility Help: touch target size](https://support.google.com/accessibility/android/answer/7101858)
- [WCAG 2.2 Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- [Few, Dashboard Confusion](https://www.informationweek.com/data-management/dashboard-confusion), [NN/g Dashboards](https://www.nngroup.com/articles/dashboards-preattentive/)
- [CUNY Data Visualization L5](https://www.math.csi.cuny.edu/~mvj/GC-DataViz-S23/lectures/L5.html), [BCB5200 Marks and Channels](https://bsmity13.github.io/BCB5200/lectures/08_marks_channels.html)
- [Brehmer et al. 2019, MSR page](https://www.microsoft.com/en-us/research/publication/visualizing-ranges-over-time-on-mobile-phones-a-task-based-crowdsourced-evaluation/), [Brehmer 2019 PDF (unreadable)](https://petra.isenberg.cc/publications/papers/Brehmer_2019_VRO.pdf), [Gschwandtner et al. 2016, reposiTUm](https://repositum.tuwien.at/handle/20.500.12708/148266), [Gschwandtner 2016 PDF (unreadable)](https://www.cvast.tuwien.ac.at/sites/default/files/bibcite/435/PubDat_242383.pdf), [Munzner VAD-marks (unreadable)](https://cs.ubc.ca/~tmm/talks/vad/VAD-marks.pdf)
