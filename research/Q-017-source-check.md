I've checked the main sources and found conflicts, so I'm writing up the verdict now.

Verdict: FAIL

I filed nothing in `library/`. Every proposed entry here is a fact or pattern, and some failed or rest on a source I couldn't confirm. I opened these sources:

- #31 diff
- #175 diff
- check-runs for #5's head (`d7d0749`) and #161's head (`612cf90`)
- the `pulls/252` JSON
- the GraphQL docs

**Confirmed**
- **F-pr-desc-01a, #31 diff** (memo lines 133–134). The diff has "if O5's fallback is needed, a permanent redirect from the old address counts as meeting V4." It also has "any API key needs the owner's ruling first." The body wording and the `decide` run on head `98cfcb4` were confirmed in the earlier round (`research/Q-017-source-check.md` lines 6–10). I did not re-open them, so this entry has one opening, not two independent ones.
- **F-gh-api-01a** (memo lines 149–150). The earlier round confirmed the 60-per-hour limit (`research/Q-017-source-check.md` line 14). I did not re-open it.
- **#175 reviewer quotes** (memo lines 113–116, 122–123, 145–146).
  - The diff has the "my mistake" confirmation: "I judged the branch head, but CI judges the pull request's merge ref."
  - The diff has round 2 finding 2 ("smaller" inaccurate).
  - Round 2 finding 1 was a governance failure on the branch head (`FAIL record_checks`).
  - This supports the narrowed F-pr-desc-02 for #175.
  - Its #81 half, the "all six … about the description" quote, was confirmed earlier (`research/Q-017-source-check.md` line 15). I did not re-open it.
- **GraphQL docs** (memo line 152). `lastEditedAt` reads "The moment the editor made the last edit." `userContentEdits` reads "A list of edits to this content."

**Not confirmed or contradicted**
1. **F-pr-desc-01b and the matching claim in P-summary-failed-01 (memo lines 24, 68, 124, 136, 159) are partly wrong for #5.**
   - The check-runs for `d7d0749` show a `governance` success at 11:10:52–11:10:57, then a `governance` failure at 11:11:05–11:11:13.
   - No later `governance` run passed. The failure is the latest one.
   - The memo says "in #5 … a later run of the same check passed" (lines 24 and 136). That is false for #5.
   - The counts of one failed and one passing run are right. So is the timing before the PR opened at 11:10:58.
   - The §4 opinion that the latest run is the better test (line 124) would count #5 as failing. The pattern evidence doesn't hold for #5.
   - #161 is correct. `governance` failed at 14:32:30–14:35:42, and the later `governance` run passed.
2. **F-gh-api-01b fails on its numbers.**
   - The memo says the `pulls/252` response has 48 top-level keys (lines 152, 192). My fetch counted 67.
   - Both counts come from a model-based extraction, so neither is reliable.
   - The "no key containing 'edit'" part agreed.
   - The claim is an observation from one extracted response, and the count doesn't reproduce. I can't confirm it.
3. **F-pr-desc-01c is not confirmed.** The memo itself says it rests on inferred rule dates (C) and that the 0-missing count was not re-checked (lines 167, 195). It has no second source. I did not open #65, #79 or #222.
4. **The memo's own gaps remain** (lines 194–198).
   - Six diffs are partial.
   - Several reviews are known only as summaries.
   - #148 is unresolved.
   - P-summary-asof-01 depends on #44. I did not open #44. It is also an extraction of commits, with no second source.
5. **The #239 "10 Rewrite commits" claim and the #70 merge state were not opened by me.** Both stay unconfirmed.
6. **The #175 date.** I could not verify the date range (2026-10-01 to 2026-10-29) beyond the `pulls/252` timestamps. #252 was created 2026-10-29T21:03:00Z and merged 21:05:25Z, which fits the end of the range. I did not open `pulls/5`, so the start is unconfirmed here.

**Open questions**
- Can an authenticated `gh` call return the real key count of `pulls/252` and the `userContentEdits` for the 20 PRs?
- Should the "later run passed" wording be removed for #5 from 01b and the P-summary-failed-01 evidence?
- Which meaning of "nothing failed" do the rules intend: checks only, or reviews too? #175's confirmation says the sentence is "accurate, apart from the verdicts that aren't recorded yet", so it appears to mean checks.