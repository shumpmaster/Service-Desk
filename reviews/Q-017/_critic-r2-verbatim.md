Both questions pass on round 2. Neither has a blocking finding, and every round-1 finding is closed or met well enough that I no longer count it as blocking. I did not independently verify the new visibility facts (the two public and two private repositories). I took them from your message, because a public page fetch cannot tell a private repository from a missing one.

## Q-017: Verdict: PASS

**Round-1 findings**
- **Closed, finding 1 (v3-only form):** The text now says the "What this means for you" paragraph applies to every pull request (S-026). The milestone line, Context, Why and Tasks sections are v3 only (S-032, S-034). It says Service-Desk is v3 and tells the Researcher to count a section as left out only where the rule required it on that pull request's date. This matches OPERATING_MODEL.md lines 79, 120 and 122 and the Service-Desk `"model": "v3"` entry in src/config/projects.json.
- **Closed, finding 2 (window and open pull requests):** The eight-week window is gone. The open set is fixed at 2026-11-02 12:00 UTC, with a count and a "mostly merged" statement.
- **Closed, finding 3 (unanswerable bullets):** The question now has "checked" or "could not be determined" per item, "cannot tell" for edits, "say for each how it was read", and a rule that no summary of a page may stand in for the page. It also covers an unfinished sample.
- **Closed, finding 4 (scope):** Service-Desk only, with the reasons stated. It was the right call, given the private repositories.
- **Closed, finding 5 (leading decision line):** It is now neutral: "can be described … from what its author wrote, would need another source, or would need checking first".
- **Closed, finding 6 (open judgement criteria):** It now asks for the rule per kind and two or three worked examples with pull-request numbers.
- **Closed, finding 7 (depth):** The fixed sample of 20, with an "if not finished" clause, fits depth 3.

**New check of the sample:** #5, #18, #31 and every 13th number after, up to #252, is 5+13k for k = 0 to 19, which gives 20 numbers. It is fixed before reading, so it cannot be picked by how good a description looks. It is consistent with the memo's 264 pull requests (#1 to #264, 251 merged) with no issues taking numbers.

**Non-blocking**
1. **WebFetch summarises.** "Do not use a summary of a page in place of the page" may be impossible with WebFetch, which is the memo's own "summarising fetch". The local clone is probably shallow, since the Source checker needed `git fetch --unshallow`. Add: "If the fetch tool returns only a summary, say so, and mark the item 'could not be determined' rather than judging from it."
2. **Model-Lab wording.** Q-017 says Model-Lab "is not to be read", while Q-018 allows reading its metadata and paths. Reword Q-017 to "its contents are not to be read".
3. **Substitution rule.** "Take the next number that merged" can collide with another sampled number, such as #252 giving #253. Add "skip a number already in the sample".
4. **Narrowed scope.** The scope is narrower than groundwork shortlist item 1, which named two repositories. Personal-Org-Operating-Model is v2.5 and private, and it is now out. The Chief of Staff should record that the result describes Service-Desk's v3 pull requests only, and where the other repository's check was routed.
5. **"Must hold or flag" in the decision line.** It mildly presupposes a described form that flags things. It is acceptable, but "must hold or say it is unknown" would be more neutral.
