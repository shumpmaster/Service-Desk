# Q-010 memo, revision 2: answer to the second source check

I've rebuilt row 4.1 and the pattern entry LIB-P-q010-b. Last round I wrongly said both course pages back the channel lists, and I have withdrawn that. The pattern now rests on a different source I could read directly: Mackinlay's 1986 paper. Munzner's channel lists remain single source.

**Researcher:** Q-010 · **Dated:** 2026-10-08 · **Revises:** `research/Q-010-memo.md` (revision 1) · **Depth:** 3 · **Topics:** design, dashboards, information-design, accessibility, mobile

Labels (F = fact, E = estimate, O = opinion; grades A–D; "same publisher") mean the same as in revision 1. Rows not listed here stand as filed or as they were. Rows 1.1, 5.4 and 9 were filed or confirmed and are unchanged.

## A. Corrected rows

| # | Revised statement | Type / grade | Status |
|---|---|---|---|
| 4.1 (retracted) | **Withdrawn:** my revision-1 statement that the CUNY L5 and BCB5200 pages both confirm "spatial region is identity; only position on a scale is magnitude". I re-read both pages. CUNY L5 does not contain the words "identity", "magnitude" or "spatial region"; it groups channels by Categorical and Ordinal data. BCB5200 defines the two kinds: identity channels tell "*what* or *where*", magnitude channels tell "*how much*". It gives no full lists, and says "Spatial position is the only channel on both lists". My revision-1 claim was wrong. | n/a | Retracted |
| 4.1a | **Expressiveness, from the primary.** Mackinlay (1986), *Automating the Design of Graphical Presentations of Relational Information*, ACM TOG; read as the SIGGRAPH '87 course-notes HTML in the Xerox PARC archive. A set of facts is expressible if a sentence "1) encodes all the facts in the set and 2) encodes only the facts in the set." His worked example: "Most people perceive the lengths of the bars as an encoding of an ordered or quantitative set", so a bar chart of the nominal Nation relation "expresses the fact that the countries are ordered, which is not correct." Munzner gives the same principle, as restated on both course pages: encoding "should express all of, and only, the information in the dataset attributes". BCB5200 adds that unordered data should not appear perceptually ordered. | F, B | **Confirmed, with a caveat:** two named authors, Mackinlay 1986 (primary, read) and Munzner 2014 (read only through restatements). Munzner builds on Mackinlay, so the checker should decide whether that counts as independent (see Q-010-d). |
| 4.1b | **Munzner's channel lists.** Identity channels, for categorical data: spatial region, colour hue, motion, shape. Magnitude channels, for ordered data: position on a common scale, position on an unaligned scale, length, tilt/angle, area, depth, colour luminance, colour saturation, curvature, volume. These lists come from gyanl.com/dv/marks-and-channels (credited to "Tamara Munzner, Visualization Analysis and Design"; no author or date). A 2016 blog post, syuanivy.wordpress.com "Chapter5: Marks and Channels", gives the same identity order and an equivalent magnitude order. Its wording differs ("aligned/unaligned spatial position"; "angle"), and it cites no source. | F, C | **Single source.** Both pages restate one primary (Munzner, *VAD* fig. 5.1). Her figure PDF and slide PDFs came back as binary. |
| 4.1c | A search-engine summary put "spatial region" among the **magnitude** channels and "tilt/angle" among the **identity** channels. That conflicts with both pages I read. | n/a | Not used. I note it because it may explain the inconsistent readings in the checker's round. |
| 9 · iOS (note only) | The Apple accessibility table, re-read, has columns headed "Default control size" (44x44 pt) and "Minimum control size" (28x28 pt). It introduces them with "Strive to meet the recommended minimum control size for each platform". It never says when the minimum applies. So 28 pt is a floor in a separate column, and the Buttons page's "at least 44x44 pt" applies to buttons. | F, B | Still **single source** for 28 pt. Filed entry b1 needs no change. |

## B. Proposed library entry (replaces LIB-P-q010-b)

```
id: LIB-P-q010-b    form: pattern   grade: B   shelf_life: 36 months   topics: [information-design, design, dashboards]
claim: "Don't encode unranked kinds of item with an encoding people read as ordered (e.g. bar length): an encoding must express all the facts in the data and only those, and an ordered-looking encoding of nominal data asserts an order that doesn't exist."
sources: xeroxparcarchive.computerhistory.org/pixel/imaging/documentationgraphicscourse/.automatedIdesign.tioga!7.html (Mackinlay 1986, primary) ; bsmity13.github.io/BCB5200/lectures/08_marks_channels.html (Munzner restated) ; math.csi.cuny.edu/~mvj/GC-DataViz-S23/lectures/L5.html (Munzner restated)
note: Munzner builds on Mackinlay, so the two authors may not be independent (Q-010-d). The identity/magnitude channel lists (row 4.1b) are deliberately NOT in the claim: single source, primary unread. Do not cite this entry for "use hue/shape for kinds".
```

---

## Six-part contract

**1. What I changed**
- Retracted my revision-1 claim that CUNY L5 and BCB5200 confirm the channel lists.
- Split row 4.1 into three rows:
  - 4.1a, the expressiveness principle, now resting on Mackinlay 1986 read directly.
  - 4.1b, the channel lists, now single source at grade C.
  - 4.1c, a note on the search summary that conflicts with the pages.
- Rebuilt LIB-P-q010-b around the expressiveness principle and Mackinlay's bar-length example. The hue/shape advice and the lists are out of the claim.
- Added a note to the iOS row: the 44 pt and 28 pt figures sit in separate "Default" and "Minimum" columns.
- I've written nothing to disk because I have no write lane.

**2. Why**
- The source check failed P-b and row 4.1 because my two pages don't contain the channel lists I attributed to them. My re-reads agree with the checker: that was my error.
- I didn't look for a third derivative of Munzner to prop up the lists. Instead I looked for a separate primary for the part the pattern needs, and found Mackinlay.

**3. What I verified** (web reads only; I have no shell)
- **CUNY L5:** re-read. It has no "identity", "magnitude" or "spatial region", and does have the "all of, and only" quote.
- **BCB5200:** re-read. It defines the two kinds but gives no lists, says spatial position is on both, and has the "all of, and only" quote.
- **Mackinlay 1986 (Xerox PARC archive HTML):** read twice. Both quotes in row 4.1a are verbatim. Fig. 15 ranks perceptual tasks by data type, but uses tick marks rather than an order I could read, so I don't use it.
- **gyanl.com and syuanivy.wordpress.com:** read. The lists are as in row 4.1b.
- **Croud (2 March 2022):** read. It credits the principle to Munzner ch. 5 and gives no lists, so it isn't used.
- **SIGGRAPH HyperVis exp_eff page:** read. It is a paraphrase only, so it isn't used.
- **Apple accessibility JSON:** re-read. The table headings and intro sentence are as quoted.
- **Failed reads (binary PDFs):**
  - Munzner fig5.1.pdf and 436V-20 marks.pdf
  - Koop's NIU lecture11.pdf
  - Mackinlay's paper as a PDF from Berkeley

**4. What is undone**
- No primary read of Munzner ch. 5 or fig. 5.1, so row 4.1b stays at grade C.
- The other items from revision 1 are still open:
  - the two timeline studies (rows 7.2 and 7.3) have one source each;
  - there is no readable Material 3 page;
  - the iOS 28 pt minimum still has one source;
  - the rows nobody has checked (GOV.UK, web.dev CLS, Boukhelifa, Song & Szafir).

**5. What is needed outside my lane**
- **A PDF-capable read** of Munzner fig5.1.pdf (`cs.ubc.ca/~tmm/vadbook/eamonn-figs/fig5.1.pdf`), which would settle row 4.1b. The same applies to the author PDFs listed in revision 1.
- **Saved copies outside this folder:** the fetch tool saved binary copies outside this folder. I didn't open them, because the brief limits me to this folder.
- **Buying Munzner's *VAD*** is still a decision card for the owner.

**6. Open questions (added, not closed)**
- **Q-010-d, widened:** is a later author who builds on and cites an earlier principle (Munzner on Mackinlay) independent of it for the two-source rule?
- **Q-010-f, new:** do restatement pages from different, unrelated authors (course pages, blogs) that agree with each other ever count beyond "single source" when the primary is unread? I have assumed not.
- **Q-010-c (still open):** which iOS figure should a design criterion follow, the 28 pt "Minimum control size" or the 44 pt default and Buttons figure? Apple doesn't say when the minimum applies.

Sources:
- [Mackinlay 1986, SIGGRAPH '87 course notes (Xerox PARC archive)](https://xeroxparcarchive.computerhistory.org/pixel/imaging/documentationgraphicscourse/.automatedIdesign.tioga!7.html)
- [BCB5200 Marks and Channels](https://bsmity13.github.io/BCB5200/lectures/08_marks_channels.html), [CUNY Data Visualization L5](https://www.math.csi.cuny.edu/~mvj/GC-DataViz-S23/lectures/L5.html)
- [gyanl.com Marks and Channels](https://gyanl.com/dv/marks-and-channels), [syuanivy: Chapter5 Marks and Channels](https://syuanivy.wordpress.com/2016/03/08/chapter5-marks-and-channels/)
- [Croud: marks and channels](https://croud.com/resources/how-to-optimize-data-visualizations-with-marks-and-channels/), [SIGGRAPH HyperVis: expressiveness & effectiveness](https://education.siggraph.org/static/HyperVis/concepts/exp_eff.htm)
- [Apple HIG Accessibility (JSON)](https://developer.apple.com/tutorials/data/design/human-interface-guidelines/accessibility.json)
- Unreadable (binary): [Munzner fig5.1.pdf](https://www.cs.ubc.ca/~tmm/vadbook/eamonn-figs/fig5.1.pdf), [Munzner 436V-20 marks.pdf](https://www.cs.ubc.ca/~tmm/courses/436V-20/slides/marks.pdf), [Koop NIU lecture11.pdf](https://faculty.cs.niu.edu/~dakoop/cs627-2026sp/lectures/lecture11.pdf), [Mackinlay APT TOG86 PDF](https://courses.ischool.berkeley.edu/i247/f05/readings/Mackinlay_APT_TOG86.pdf)
