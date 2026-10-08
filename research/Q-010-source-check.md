Verdict: FAIL

I filed three of the four proposed entries. The pattern entry LIB-P-q010-b is not filed, and memo row 4.1 is not confirmed. I checked every claim by reading the pages myself. The Apple pages only rendered through their `tutorials/data` JSON endpoints.

**Filed (in `library/facts/`)**
- **`LIB-F-q010-b1-touch-targets-ios-android.md`** (memo rows 9·iOS and 9·Android; lines 15 and 17):
  - Apple's accessibility table gives a 44×44 pt default for iOS and iPadOS.
  - Apple's Buttons page says "at least 44x44 pt".
  - Android's developer guide says "at least 48dp×48dp. Larger is even better."
  - Google's Accessibility Help page says 48×48 dp, 8 dp spacing and about 9 mm.
  - Each platform's figure rests on two pages from one publisher.
  - I left out the iOS 28 pt minimum, because it comes from one page and the Buttons page contradicts it.
  - I also left out the 8 dp spacing, which appears on the Google help page only.
- **`LIB-F-q010-b2-reduce-motion.md`** (row 5.4; line 13):
  - The Reduce Motion claim has two independent sources. The W3C Understanding page for 2.3.3 describes the prefers-reduced-motion technique for disabling non-essential animation. Apple's accessibility page says to replace transitions in the x-, y- and z-axes with fades.
  - I did not re-confirm the AAA level this round. I read it in an earlier round.
  - The "replace with dissolve, highlight fade or colour shift" part comes from Apple alone (the accessibility page and the App Store Connect criteria). I quoted the App Store Connect page for it.
- **`LIB-F-q010-e-widget-deep-link.md`** (memo section B; line 34):
  - The HIG widgets page says "don't make people navigate to the relevant area in the app".
  - The WidgetKit linking page says "open the app at a scene that matches the content of the widget".
  - The memo's wording says "glance surface". I narrowed the entry to widgets and Live Activities, because the sources say nothing about web dashboards.

**Not filed or not confirmed**
- **`LIB-P-q010-b`** (memo lines 38–41):
  - The two course pages (CUNY L5 and BCB5200) are both restatements of Munzner. The original is unread, so they are not independent of each other.
  - Their channel lists don't agree. My CUNY read found no "identity" or "magnitude" headings and no "spatial region". A first read of the same page listed spatial region as a magnitude channel. BCB5200 lists spatial position as an identity channel.
  - The page-reader tool gave inconsistent summaries of the CUNY page, so I couldn't confirm which is right.
  - Both pages do state the expressiveness quote "all of, and only, the information in the dataset attributes" and that unordered data should not suggest an order.
- **Row 4.1** (line 12) is not confirmed. The memo says both pages confirm "spatial region is identity; only position on a scale is magnitude". My reads contradict that.
- **Row 1.1** (line 11) is confirmed.
  - NN/g says "single-page view that imparts at-a-glance information".
  - Few says "consolidated and arranged on a single screen so the information can be monitored at a glance".
  - Both quotes match the memo.
  - "Single screen" rests on Few alone, as the memo says.
  - I filed no entry for this row.
- **Rows 7.2, 7.3, 8.1a and the iOS spacing row** have one source each. I didn't file them and didn't re-open them.
- **Brehmer 2019, Gschwandtner 2016, GOV.UK, web.dev CLS, Boukhelifa and Song & Szafir** remain unchecked. I did not open them this round, and `LIB-F-q010-d` stays withdrawn.

**Open questions**
- **Q-010-e (owner ruling needed):** the source standard covers "how a vendor's own product behaves". It is unclear whether Apple and Google design recommendations, such as touch-target sizes, count as behaviour. I filed b1, b2 and e on the narrow reading, with the claims worded as "Apple/Android guidance" and labelled "same publisher". If the owner rules otherwise, they should be withdrawn.
- **Q-010-c:** is the 28 pt iOS minimum real? Apple's accessibility table says 28 pt, and the Buttons page says 44 pt. It stays unresolved.
- **P-b needs a primary or a PDF-capable read** of Munzner, *Visualization Analysis & Design*, ch. 5, to settle the channel lists.
- **Q-010-d:** I have no ruling on whether a paper plus a derivative that restates it counts as two sources. I treated derivative restatements as not independent.
