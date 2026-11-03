I'm partway through re-opening the memo's sources. #5, #44, #65 and #239 are done. I have enough for a verdict, so I'm writing it up now.

Verdict: FAIL

I filed nothing in `library/`. Several proposed entries are unconfirmed, and an unverifiable claim is a FAIL. I wrote no library files, and the "may read" files (the library and `docs/playbooks/software.md`) were not needed.

**Confirmed, opened this round**
- **#5 check runs (memo lines 70, 109, 139).** The check-runs for `d7d0749f…` match the corrected memo.
  - `governance` succeeded 11:10:52–11:10:57.
  - `governance` then failed 11:11:05–11:11:13.
  - No later `governance` run exists.
  - The `pulls/5` API data gives created 11:10:58Z and merged 11:28:14Z. Its body has "`governance/checks/check_all.sh . origin/main` passed".
  - The round-3 correction holds. This is a single fetch-tool extraction, so it is grade B.
- **#44 commits (memo line 73).**
  - There are 8 commits.
  - `c514b51` is followed by `6206ebd` ("fix the Reviewer's PR #44 findings (B1, N1-N6)"), `1e17757` and `2681cce`.
  - This supports P-summary-asof-01's #44 evidence.
  - One opening, so it is not a second independent source.
- **#65 (memo line 40).** Merged 2026-10-13T23:51:13Z. The quote "plain English first in everything written for you" matches.
- **#239 (memo lines 88 and 148).** The HTML commit list shows 41 commits and `16e1389` "Rewrite round 2's locked case…". The nine round-1 "Rewrite" commits match the shas the memo lists.

**Not confirmed or contradicted**
1. **F-pr-desc-01d (#239) is only partly confirmed.**
   - The API call `pulls/239/commits?per_page=100` returned only the 9 round-1 commits. Page 2 came back empty. The HTML page showed 41. The two views disagree and I can't tell why.
   - I did not confirm the "(forced; not named in G8d's row)" markers on the last two commits.
   - I did not confirm that `16e1389` falls in round 3.
   - I did not open the `pulls/239` body for the "Nine locked cases rewritten" sentence.
   - The fetch tool also appears to have mixed the first "Rewrite" commits into a list headed by `fcb3718`. That is another sign the extraction is unreliable.
2. **F-pr-desc-01c is not confirmed.**
   - Memo lines 172 and 146 say 14 bodies were not re-read, so the 0-missing count is unsupported.
   - Rule binding dates are inferred (grade C).
   - I opened #65 only. I did not open #79, #222, #70, #83 or #226.
3. **Not re-opened, so one opening only:** F-pr-desc-01a (#31 diff and check-runs), F-pr-desc-02, F-gh-api-01a, F-gh-api-01b (REST and GraphQL docs) and F-pr-desc-01b's #161 half. The earlier round confirmed several of these (`research/Q-017-source-check.md` lines 13–22), but earlier confirmation is not a second source. Two independent sources are needed for load-bearing facts.
4. **F-gh-api-01b is an absence claim.** It rests on a model extraction, which the memo's own method warning (line 126) says shouldn't be relied on.
5. **The memo's own gaps:**
   - Six partial diffs.
   - #148 unresolved.
   - Reviews seen only as summaries.
   - #31's `decide` failure may be by design.
   - The "latest run" test is an opinion.
6. **The memo is not a groundwork map**, so every entry must pass individually. None can be filed yet.

**Open questions**
- Can an authenticated `gh` or GraphQL call give the true `pulls/239/commits` list and the 20 PRs' `userContentEdits`?
- Does "nothing failed" cover checks only, or reviews too?
- Can the model repo's version dates be read, to turn the inferred rule dates into confirmed ones?
- Why did the API and HTML views of #239's commits disagree?