Verdict: PASS

This is a groundwork map, so I filed no library entries. I did not edit any file. Every web page and API response was read through a summarising fetch, not raw. The memo says the same about itself (research/Q-016-memo.md:63).

**Shortlists.** The owner shortlist has 8 items (memo lines 266–273). The research shortlist has 5 (lines 276–280). Both are within the limits.

**Items marked known: sources opened and confirmed**
- **C3 (memo:98–100).** The GitHub notifications page has all four quotes: Done, Saved, Unsubscribing, and scheduled push notifications.
- **C4 (memo:102).** library/F-gh-09.md matches the iOS Universal Links claim, grade B.
- **D1 (memo:112–147).** I ran the GitHub search API for `repo:shumpmaster/Service-Desk is:pr is:merged`. `incomplete_results` was false on every call.
  - Oct 19–25: 121. Sep 28–Nov 1: 251.
  - Oct 26: 4, Oct 27: 1, Oct 28: 1, Oct 29: 3, Oct 30: 1, Oct 31: 6, Nov 1: 5.
  - The Oct 26–31 days sum to 16, which matches the memo's total, so the single-day rows are confirmed too.
  - The pull-request numbers shown match the memo (#243 on Oct 25, #264 on Nov 1).
  - I did not re-run the other weekly rows (Sep 28–Oct 4, Oct 5–11, Oct 12–18, Oct 26–Nov 1). They add up consistently with the total of 251.
- **E1 (memo:151–152).** The NN/g quotes are present. The line 4 text of library/patterns/P-glance-disclosure-01.md matches.
- **E2 and F3 (memo:156–158, 174).** The Copilot how-to page has both quotes. The page titled "Application card: GitHub Copilot Chat" has all five quoted sentences word for word:
  - the code-diff workflow;
  - the bulleted list of key changes;
  - the 400-line exclusion;
  - no automatic refresh;
  - requesting a new summary.
- **F2 (memo:167–171).** arXiv 2601.04886 matches on 23,247 pull requests, 406 (1.7%), 45.4%, and 51.7% lower acceptance (28.3% vs. 80.0%). The v2 date of 26 Jan 2026 and the authors match.
- **H2 (memo:195).** library/patterns/P-stale-visible-01.md line 4 matches.
- **I2 (memo:204).** The repository API gives visibility public, private false, created 2026-09-30T18:25:19Z.
- **I3 (memo:208).** The code-review page has "Copilot code review runs in an ephemeral development environment".
- **B2 and P1 (memo:86, 260).** Nath & Roy match on 32 professionals, the project-manager quote, 3,347 notes, 21 repositories, and PRs 32%, issues 29%, commits 19%. The venue is SANER 2022.
- **K3 (memo:224).** Nudge matches on 147 repositories, 60% for 8,500 pull requests, and 73% positive. The venue is TOSEM 2022.
- **P1 release notes (memo:257–259).**
  - The "significant discrepancies" quote is now correct.
  - The SMU record gives IEEE TSE, DOI 10.1109/TSE.2020.3038881, November 2020, with the same counts (32,425 notes, 1,000 projects, 15 practitioners, 314 respondents).
  - The researchr page lists the paper under "Journal-First Papers" at ICSE 2022.
  - Volume 48(6) is flagged in the memo as snippet-only, and I did not check it.
- **P1 intelligence briefing (memo:251–255).** The three WMD Commission quotes are present in the report.
- **O1 (memo:244–246).** library/facts/F-wcag22-01.md is grade A and cites three W3C pages. library/facts/F-platform-targets-contrast-01.md is grade A. I did not compare their claim text with the memo's paraphrase, because the grep returned only truncated lines.

**Findings from earlier rounds that are now closed**
- **Finding 1 (E2, H1).** The responsible-use text is confirmed at the application card page. H1 is graded B as a single vendor page, and the memo's stale-summary trap no longer rests on it alone.
- **Finding 2.** The misquote is fixed.
- **Finding 3.** The venue is settled.
- **Finding 4.** Repository-sourced statements are now labelled "pointer, unverified" and ungraded (memo:64–66). None is marked known or quoted. I could not open those repository files, so they stay unconfirmed and out of any filing. They are not presented as fact.
- **Finding 5.** The area D counts are re-checked above.

**Open questions**
1. The two sources behind D1 methods 1 and 2 (memo:113) are in a round-1 record that is not in this pack. I confirmed the totals with my own method, so the figures stand. That record cannot be cited.
2. The Copilot application card is one vendor page, and H1 rests on it. The "same publisher" rule needs two different vendor pages. I did not find a second page that makes the same statement. This is a single-source flag for the map. It would block any later filing.
3. The "pointer, unverified" items need a checker who has the Service-Desk docs/handover, docs/LEDGER.md and CLAUDE.md. Research shortlist item 3 covers this.
4. A raw (non-summarised) fetch of the web items is still outstanding.
5. Should the area-P items become library entries? Not from a map, as the duties say.