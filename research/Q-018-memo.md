I've revised the Q-018 memo. Every finding from the source check is dealt with, but none of the counts the question asks for could be made. Only one small entry is ready for the Source checker to file.

## 1 What I changed

**Revised memo, for the Orchestrator to record as research/Q-018-memo.md:**

---

# Q-018 memo (revision 2): change volume per repository, 2026-11-03
*Researcher. Blind (D-055). Depth 2. Every item is marked fact, estimate or opinion, with a grade.*

### Status: no measure is counted
The question says a figure counts only if every page of records was read, not taken from a summary (research/Q-018.md, line 16). I have no shell. My fetch tool summarises each page, and it cut the API's paginated lists off after about six records. So **every measure, for all four repositories, is "not counted"**: no shell, and no reading of every record to the end. I give the figures from revision 1 only as estimates, so the people making the counts have something to check against. **None of them is offered for the library.**

### Context estimates for the public repositories (estimate, grade C, not for filing)
- **Service-Desk:** from GitHub's own totals (search `total_count` and the PR list headers), not from reading records.
  - Merged 2026-09-30 → 2026-11-01: about 251.
  - Merged by week (Mon–Sun, UTC, from 28 Sep): about 27 / 28 / 54 / 121 / 21.
  - Busiest day: about 36 merged on 19 Oct (about 33 on the Chicago day). Quietest days: 9 Oct and 11 Oct, with 0 each.
  - Opened in the window: about 259. Closed without merging: about 7. Still open at the window's end: 1.
  - `desk-deploy` runs: about 64, of which about 46 succeeded. No releases found.
  - The Source checker re-found one figure: 251 merged, `incomplete_results: false`. That is still one method, not a full-record count.
- **Model-Lab:** first PR 2026-11-01T16:59Z.
  - The pulls page shows **Open 1, Closed 30, so 31 PRs opened by the end of 2026-11-02. #31, opened 2 Nov, was still open when the Source checker read the page.** This corrects revision 1's loose "31 PRs by 2026-11-03".
  - Through the summarising fetch: about 23 merged on the UTC day 1 Nov, about 28 on the Chicago day, 0 closed without merging.
  - No releases found. None of its 5 workflows is named as a deploy workflow.
- **Peaks:** they cannot be compared. Service-Desk's estimated peak (19 Oct) comes before Model-Lab's first record.
- **Re-take of Service-Desk's merged count:** not counted. Comparing it with Q-016 needs research/Q-016-memo.md, which is not in my pack.

### Not counted, by measure (all to go to a role with a shell, using the Q-016 source-check methods and the question's limits on what may be read)
1. **All measures for Service-Desk and Model-Lab:** PRs merged, opened, still open and closed without merging; per day and per week; deploys and releases. Reason: summarising fetch only.
2. **All measures for Personal-Org-Operating-Model and the portfolio.** Reason: private, and my fetch cannot authenticate.
3. **Commits to the default branch without a PR, all four repositories.** Reason: this needs the first-parent history of each default branch.
4. **Kinds of merged PR, all repositories.** Reason: this needs each PR's list of changed file paths. 100% are "kind not determined".
5. **Owner involvement:** "cannot tell" for all.
   - Fact, grade B, not for filing: both sampled merge records (SD #265, ML #1) show `merged_by: shumpmaster`. The Source checker could not open `merged_by` or reviews.
   - Opinion, grade C: branch names (`claude/…`, `cos/…`, `orch/…`) and an `asks-merge` workflow suggest agents act through the owner's account. If so, the merge record cannot show whether the owner was involved.

### Proposed library entries (for the Source checker)
```yaml
- id: F-gh-search-02a
  form: fact
  claim: "GitHub REST code search is limited to 10 requests per minute (separate code-search rate-limit category since 2023-04-10)."
  grade: A
  topics: [github]
  shelf_life: 12 months
  sources:
    - https://docs.github.com/en/rest/search/search
    - https://github.blog/changelog/2023-03-10-changes-to-the-code-search-api/  # "The separate code search category will have a rate limit of 10 requests per minute."
```
**Held back, not proposed until a second page states them:**
- **F-gh-search-02b:** search allows 30 requests a minute authenticated and 10 unauthenticated; each search returns up to 1,000 results; `incomplete_results` is true on a timeout. Fact, grade A, but only one source (docs.github.com/en/rest/search/search).
- **Withdrawn:**
  - **F-vol-sd-01 and F-vol-ml-01:** these are estimates, not counts, so they don't belong in the library as facts.
  - **P-count-01:** its only source was my own reasoning. It stays here as an opinion, grade C: checking that platform totals agree with each other (days sum to weeks; opened = merged + closed + open) is a sanity check, not a count.

### Questions added (none closed)
- **N1.** Which merges and approvals did the owner make in person, and which did agents or workflows make through the owner's account? What record would show the difference?
- **N2.** Should a "deploy" include hand-started runs and failed runs?
- **N3.** Do PRs merged within a minute of each other count as one change for reading, or several?
- **N4.** If agents act through the owner's account, the question's test for "needed the owner" (merge record or review) can't separate owner from agent. Does the question need a different test?

---

## 2 Why
- **Search limits (finding 1):** the original entry had one source. I split out the one part that a second, separate GitHub page confirms (code search at 10 a minute). The rest is held back.
- **Service-Desk, Model-Lab and the pattern (findings 2–4):** under the question's reading rule my figures can't be counts. So they move to "not counted" with estimates for context, and their library entries are withdrawn rather than downgraded.
- **Model-Lab wording:** corrected to what the Source checker saw on the page.
- **Owner involvement and coverage (findings 5–6):** left as "cannot tell" and "not counted", with the reasons given.

## 3 What I verified (tool calls and results)
- **docs.github.com/en/rest/search/search:** two searches show it states 30 a minute (authenticated), 10 a minute (code search), 10 a minute (unauthenticated), up to 1,000 results, and `incomplete_results` on a timeout.
- **Rate limits for the REST API page:** says only "Some endpoints, like the search endpoints, have more restrictive limits." No numbers, which agrees with the Source checker.
- **About searching on GitHub page:** says nothing about limits.
- **github.blog changelog, 2023-03-10:** "The separate code search category will have a rate limit of 10 requests per minute." It states no other numbers.
- **Enterprise Server versions of the search page:** these are the same document for another product version, so I didn't use them as a second source.
- **Not re-fetched:** no repository data. A summarising fetch can't produce a count, so it wouldn't help.

## 4 What is undone
- Every count in the question, for all four repositories.
- The kinds of merged PR.
- Owner involvement.
- The comparison with Q-016.
- A second source for F-gh-search-02b.

## 5 What is needed outside my lane
- **A role with a shell and authenticated access** (Q-016 source-check methods, same limits on what may be read), to make every count listed under "Not counted" and to read `merged_by` and reviews.
- **Whoever has research/Q-016-memo.md**, to compare its weekly row once Service-Desk is counted.
- No level-5 expert or paid source is needed.

## 6 Open questions
- N1–N4, as listed in the memo.
- Is there a second GitHub page that states the non-code search limits and the 1,000-result cap? I didn't find one.

Sources:
- [REST API endpoints for search](https://docs.github.com/en/rest/search/search)
- [Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [About searching on GitHub](https://docs.github.com/en/search-github/getting-started-with-searching-on-github/about-searching-on-github)
- [Changes to the code search API (GitHub Changelog)](https://github.blog/changelog/2023-03-10-changes-to-the-code-search-api/)