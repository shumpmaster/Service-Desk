Verdict: FAIL

I opened the sources I could reach. Nothing is filed, because no entry has two confirming sources and the memo's own counts don't meet the question's reading rule.

**Findings**

1. **F-gh-search-02 (search API limits): confirmed once, not twice.**
   - `docs.github.com/en/rest/search/search` confirms the memo's claim (memo lines 95–101). Unauthenticated is 10 requests a minute. Authenticated is 30 a minute, except code search at 10. A search returns up to 1,000 results. `incomplete_results` is set to true on a timeout.
   - The two other pages I opened don't state the numbers. Those are the REST rate-limits page and the rate-limit endpoint page. Each just points back to the search page. So the "two different vendor pages" rule (`governance/standards/sources.md`, lines 8–9) isn't met.
   - The entry stays out. It could be filed if a second page that states the figures turns up.

2. **F-vol-sd-01 (Service-Desk): not confirmed.**
   - One figure matches. A search for merged PRs from 2026-09-07 to 2026-11-01 returned `total_count` 251 and `incomplete_results: false` (memo line 25).
   - I didn't re-check the weekly and daily splits, the 7 closed unmerged, the 64 and 46 `desk-deploy` runs, or the Chicago-day figures.
   - The memo says these are estimates, not counts that read every record (lines 14 and 152). The question (`research/Q-018.md`, line 16) says to give a count only where every page was read. The "by week" and "busiest day" claims lack that.
   - Even the 251 total comes from one method, the platform's own totals. It isn't a second, independent source.

3. **F-vol-ml-01 (Model-Lab): not confirmed.**
   - The GitHub pulls page shows Open 1 and Closed 30, which is 31 in total (memo line 19). The open PR is #31, opened 2 Nov.
   - The other claims aren't confirmed: 23 merged on the UTC day, 28 on the Chicago day, 0 closed unmerged, and no deploy workflow.
   - Those came through a summarising fetch, which the question rules out (`research/Q-018.md`, line 16).
   - Memo line 111 says "31 PRs by 2026-11-03". The page I opened shows #31 as opened on 2 Nov and still open, so that wording is loose.

4. **P-count-01 (pattern): not confirmed.** Its only source is "this memo" (line 122). That's the Researcher's own reasoning, not an independent source.

5. **Owner involvement (memo lines 86–91): not confirmed.** I couldn't open `merged_by` or review data. The memo itself marks the agent-versus-owner reading as opinion, grade C.

6. **Memo coverage.** The memo gives no count for the two private repositories, for commits made without a pull request, or for the kinds of merged PR. It also didn't compare against Q-016, because `research/Q-016-memo.md` isn't in my pack. I can't verify any of that either. The memo isn't headed "map of questions", so the map rules don't apply.

**Open questions**
- A role with a shell and API access needs to make the full-read counts. That includes the two private repositories, commits without a PR, the kinds of PR, and the checks on `merged_by` and reviews.
- Is there a second vendor page that states the search rate limits? If so, F-gh-search-02 can be re-checked and filed.
- Someone with the Q-016 memo needs to compare its weekly row with 27/28/54/121/21.