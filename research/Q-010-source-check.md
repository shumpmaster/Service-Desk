Verdict: FAIL

Three of the seven proposed entries passed and are filed. Four are not filed. Each of those has a claim that rests on one source, or on a source I could not read, and an unverifiable claim is a FAIL.

**Confirmed and filed (all in `library/`)**

- **`facts/LIB-F-q010-a-wcag22-mobile-dashboard-criteria.md`:** I opened the WCAG 2.2 text and the Understanding page for each criterion. Each one matches the memo (`research/Q-010-memo.md` lines 60, 64, 102–105):
  - 2.5.8 is 24×24 CSS px with five exceptions.
  - 2.5.5 is AAA at 44×44.
  - 1.4.3 is 4.5:1, and 3:1 for large text (18pt, or 14pt bold).
  - 1.4.11 is AA at 3:1, and 2.999:1 fails.
  - 1.4.1 is Level A.
  - 4.1.3 is AA.
  - 2.2.2 is Level A with no five-second exception for auto-updating content.
  - Both sources are from W3C, so I labelled them "same publisher". This is a standard, not a vendor-behaviour claim.
- **`facts/LIB-F-q010-c-determinate-vs-indeterminate-progress.md`:** Apple's progress-indicators page and Material m1 both support it. I read the Apple page through its JSON endpoint. I narrowed the entry to the determinate/indeterminate rule. The "stationary indicator reads as stalled" claim comes from Apple only, so I left it out.
- **`patterns/LIB-P-q010-a-glance-screen-linked-entry-points.md`:** NN/g's cards page and Apple's widgets page both support "linked entry points to their own detail". NN/g's dashboards page supports the at-a-glance framing.
  - I narrowed the entry and dropped the two-disclosure-level limit and the "label sets expectations" rule. Both come from the one NN/g progressive-disclosure page.
  - The memo quotes NN/g's dashboards page as "single-screen" (line 18), but what I read said "single-page view". The entry says "single-page".

**Not filed**

- **`LIB-F-q010-b`:** each part of it has only one source.
  - The iOS 28 pt minimum comes from one Apple page. A plain fetch of that page gave a summary saying 44 pt is the minimum. The Apple JSON endpoint gave the table with a 44 pt default and 28 pt minimum, but nothing second confirms it.
  - Android 48 dp comes from one Google page. The Material page was never read.
  - Reduce Motion comes from Apple only. I did not open WCAG 2.3.3.
  - The "shapes or icons" part is supported by Apple and WCAG 1.4.1, but it doesn't make up for the rest.
- **`LIB-F-q010-d`:** the Brehmer 2019 and Gschwandtner 2016 findings are each seen on one page only. The Microsoft page confirms linear was faster than radial, with similar accuracy and 87 participants. The TU Wien page confirms ambiguation and error bars. Neither has a second source.
- **`LIB-F-q010-e`:** it rests on the Apple widgets page alone. Every quote matches, but one page is one source.
- **`LIB-P-q010-b`:** both PDFs (Munzner's slides and the UW slides) came back as unreadable binary. I could not confirm the expressiveness principle, so the entry stays out.

**Open questions**

- Other claims in the memo that are not in the proposed entries were not opened. These include the GOV.UK pages, the web.dev CLS page, the Boukhelifa and Song & Szafir studies, and Few's article. They remain unchecked and are not filed.
- The memo marks 1.1 as confirmed on Few's wording, which it says it saw only through citing pages (grade C). That does not count as a second source.
- The 28 pt versus 44 pt question (Q-010-c) stays open until a second Apple page or a PDF-capable read confirms the 28 pt minimum.
