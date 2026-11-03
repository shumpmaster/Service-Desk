Verdict: PASS

The one entry the memo proposes is confirmed and filed. The memo makes no count, so Q-018 itself is still unanswered. Everything the question asks for is still outstanding (see the open questions).

**Findings**

1. **F-gh-search-02a: confirmed by two sources, filed at `library/facts/F-gh-search-02a.md`.** The memo proposes it at lines 41–50. I opened both pages through a summarising fetch.
   - `docs.github.com/en/rest/search/search` says: "The Search code endpoint requires you to authenticate and limits you to 10 requests per minute."
   - The GitHub changelog post of 2023-03-10 says: "The separate code search category will have a rate limit of 10 requests per minute." It also says the change takes effect on 10 April 2023, which matches the "since 2023-04-10" in the claim.
   - The two pages are from the same publisher but are separate documents, which meets the two-source rule.
   - I filed it with grade A, a 12-month shelf life and a checked-on date of 2026-11-03. The record names me as the one who opened the sources.

2. **F-gh-search-02b is held back, as the memo says (lines 51–52).** The 30 and 10 requests a minute, the 1,000-result cap and `incomplete_results` come from one page only. The memo also found no second page. Rate-limit figures like these are load-bearing, so this needs two sources.

3. **F-vol-sd-01, F-vol-ml-01 and P-count-01 are withdrawn (memo lines 53–55).** I filed nothing from them. The memo labels the Service-Desk and Model-Lab figures (lines 15–26) as estimates and "not for filing". I did not re-verify them. The memo states they are not counts, so nothing in it presents them as fact.

4. **Owner involvement (memo lines 35–37).** I left it unfiled. The `merged_by: shumpmaster` sample (SD #265, ML #1) is marked "not for filing". The agent-versus-owner reading is opinion, grade C.

5. **Not counted.** The memo declares these uncounted instead of guessing (lines 13 and 30–37).
   - All counts for all four repositories.
   - Commits made without a pull request.
   - Kinds of merged PR.
   - Owner involvement.
   - The comparison with Q-016.

   This follows the question's rule at `research/Q-018.md` line 16. The memo is not headed "map of questions", so the map rules don't apply.

**Open questions**
- A role with a shell and authenticated access must make the counts. They cover all four repositories, including the two private ones. They also cover commits made without a PR, the kinds of merged PR, and the checks on `merged_by` and reviews.
- Someone who has `research/Q-016-memo.md` must compare its weekly row with the re-taken Service-Desk count.
- Is there a second GitHub page that states the non-code search limits and the 1,000-result cap? If one turns up, F-gh-search-02b can be filed.
- Memo questions N1–N4 are unresolved. The main one is that the question's test for "needed the owner" cannot separate the owner from agents acting through the owner's account.