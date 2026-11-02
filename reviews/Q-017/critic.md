Verdict: PASS

The Critic's check of research/Q-017.md for gaps and neutral phrasing, on a different model from its writer, verbatim: round 1 (FAIL), round 2 (PASS; non-blocking findings 1, 2, 3 and 5 applied; 4 met in the pull request, which records that the sample is Service-Desk's only and why). Each Critic session checked two or three questions in one return; each round below is the part of the return about this question, with any opening lines that cover all of them. Recorded by the orchestrator. Session session_01QBwHGLTq16QWmY6X4bJYoG, 2026-11-02.

## Round 1
Verdict: FAIL

**Blocking**

1. **The setup says something that is only true for part of the sample.** Q-017 says descriptions "in this setup are required to follow a fixed form". It lists the milestone line, Context, Why and Tasks, citing OPERATING_MODEL §2 and §3.
   - The first part is general. OPERATING_MODEL.md line 79 (S-026) applies it to every pull request: the "What this means for you" heading, with CI checking the form.
   - The rest binds v3 projects only. Line 120 says "In a v3 project CI checks the form of these lines and sections", and line 122 says "In a v3 project, each sprint that is a pull request lists its *Tasks*". Lines 411-412 say the same.
   - src/config/projects.json marks Personal-Org-Operating-Model as `"model": "v2.5"`. Service-Desk and Model-Lab are v3.
   - So the Milestone, Context, Why and Tasks sections are not required on Personal-Org-Operating-Model's pull requests. A Researcher who believes they are would count their absence as an omission by the author.
   - Suggested wording: "The opening 'What this means for you' paragraph is required in every project (S-026). The Milestone line, Context, Why and Tasks sections are required only in v3 projects (S-032, S-034): Service-Desk is v3, Personal-Org-Operating-Model is v2.5 (src/config/projects.json). Count a section as left out only where the project's model required it on that date."
   - The same applies to the last bullet, which asks whether a description relates the change to "the milestone, sprint or project aim it names". Personal-Org-Operating-Model has no sprint or milestone line to check against.

2. **The time window does not fit the data, and the question does not say so.** It asks for "the last eight weeks".
   - Service-Desk's first merge was 2026-09-30 (research/Q-016-memo.md, area D), so only about five weeks exist. Today is 2026-11-02.
   - Only #265 was open at the memo's count, so "merged and open" cannot be sampled evenly.
   - Say "the last eight weeks, or since the repository's first pull request if that is later".
   - Fix an as-of date and time.
   - Say that if fewer than a few open pull requests exist, the sample is mostly merged and the Researcher states it.

3. **Several bullets cannot be answered by the Researcher, and the question gives no way to say so.** The Researcher has Read, Grep, Glob, WebSearch and WebFetch, and no shell.
   - Diffs, commits, checks and reviews can be fetched for a public repository. The memo (I2) confirms only Service-Desk is public. Personal-Org-Operating-Model's visibility is "still to check".
   - If it is private, the whole second repository is unreachable. The local clone's `.git` history is mostly not readable without a shell.
   - "Whether the description was edited after later commits" is not shown on GitHub's public page, which only says "edited".
   - The question needs these clauses:
     - "If a repository's pull requests cannot be fetched, say so and sample only what can be read."
     - "Say for each item whether it was checked or could not be determined."
   - The first-draft count error in the memo (a summarising fetch that showed only 25 items) shows the risk. Add: "Use the raw page or the diff, not a summary of it, and say how each pull request was read."
   - Without this, a Researcher with no shell will guess at the unreachable parts.

**Non-blocking**

4. **Model-Lab is left out without saying why.** It is v3 and a connected project. The memo says it is not to be read, but this question does not mention that. One sentence is enough: "Model-Lab is outside this sample (research/Q-016-memo.md, 'Not opened on purpose')".

5. **The decision line and the first answer line presuppose a "shown account".** "What such an account would have to leave out or flag" assumes some summary will be shown and flagged. That echoes the owner's answer 7 (summaries wanted, with a "not checked" label) and the Chief of Staff's reading of it. It also leans toward the author-text-first option.
   - Neutral version: "Whether a change can be described to the owner from what the author wrote, would need another source, or would need checking first; and what a description of a change must hold or flag to be reliable." The "What each answer would change" paragraph is balanced.

6. **The judgement criteria are open.** "Any risk … the change carries" and "how each was judged" are the Researcher's own call. Ask for the rule used per item, and for a few worked examples with the pull request number, so the Source checker can recheck them.

7. **Depth.** Depth 3 with about 20 pull requests and five measures each is heavy but fits. Cap it ("if the sample cannot be finished, say how many were done") rather than let it expand.

8. **The citations check out.** The citations to the Q-016 memo (areas D and E3) and OPERATING_MODEL §2 and §3 match. The "Older pull requests were not rewritten" claim is supported by line 120.

## Round 2
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
