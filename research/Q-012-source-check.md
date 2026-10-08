Verdict: FAIL

The memo is a graded memo, not a discovery map. I re-opened the sources behind the revision-3 changes and filed two entries. Many rows are still unverified, and the brief treats an unverifiable claim as a FAIL. Nothing was committed because the folder is not a git repository.

**Confirmed this round (live fetches, 2026-10-08)**
- **Memo line 30 (row 1.5), Nielsen:** a targeted fetch returned the full sentence verbatim: "In practice, designs that go beyond 2 disclosure levels typically have low usability because users often get lost when moving between the levels." The first fetch returned only a truncated form.
  - The tool put it under "Managing Complexity". The memo says "Usability Criteria for Progressive Disclosure", so the heading is wrong. I recorded the sentence as confirmed and the heading as not.
- **Memo line 36 (row 1.11), Nielsen:** the page names task analysis and field studies, frequency-of-use statistics, and observational usability testing. This matches.
- **Memo line 28 (row 1.3), Nielsen:** "Initially, show users only a few of the most important options." matches.
- **Memo line 56 (row 2.4), Sherwin:** the full sentence matches. It includes "the benefits of showing progress will be negated". The 10-or-more-seconds sentence also matches.
- **Memo line 159 (section 9, Apple row):** the JSON endpoint gives "iOS, iPadOS | 44x44 pt | 28x28 pt" and the sentence before the table, as the memo says. The tool also stated that the document calls 44 pt the default, not the minimum. The HTML page was not rendered, so the 28 pt versus 44 pt question is still open.
- **Memo line 122 (row 7.1), Brehmer:** the abstract matches verbatim, including "263 timelines", "14 design choices" and "representation, scale, and layout". The Figure 6 caption reads "a scale transition from chronological to sequential (2) and a representation transition from radial to linear (3)". The revised row is accurate. The withdrawn "three scales" claim is correctly withdrawn.

**Filed**
- `library/facts/LIB-F-q12-e2-progress-honesty.md`: grade B for the shared point only. It supersedes entry e and records the "negated" clause. The Apple "indeterminate" quotes were confirmed in the earlier round and not re-opened.
- `library/facts/LIB-F-q12-h-disclosure-levels.md`: grade C, single source.
- Entry e is untouched.

**Not filed**
- **b2** (platform target sizes):
  - It adds nothing over the filed entry b, which already holds the Apple 44/28 table and the Android and Google figures.
  - The Android and Google halves were not re-opened this round.
  - The Apple HTML conflict is unresolved, so b's caution stands.
- **The 7.1 scale list and the "sequential" definition:** unverified and not proposed. The PDFs cannot be read.
- **Song & Szafir original, Few's book definition, and the Material 3 pages:** unread.
- **Rows not independently re-opened:** 1.2, 1.9, 1.10, 2.5, 3.1–3.3, 5.2–5.8 and 8.4–8.7. These rest on the Researcher's own re-reads and are unconfirmed. Nothing from them is filed.
- **Rows 8.1–8.3:** confirmed last round against the survey only. The originals are unread, and the filed entry f stays derivative.

**Open questions**
- Can someone render Apple's Accessibility HTML page in a browser, and the three PDFs (Brehmer, Song & Szafir, the arXiv 2206.09910 body) with a renderer? Without that, the 28 pt minimum and the 7.1 scale details stay open.
- Should LIB-P-q12-a be superseded to quote Nielsen's sentence verbatim, now that entry h exists? That is a decision for the Researcher or the owner, not for me.
- To reach PASS, either the unverified rows must be opened by a source-checker with a renderer, or the memo must drop them. Dropping them is not my call.