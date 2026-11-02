Verdict: PASS

The Critic's check of research/Q-019.md for gaps and neutral phrasing, on a different model from its writer, verbatim: round 1 (FAIL), round 2 (PASS; non-blocking findings 1 to 3 applied). Each Critic session checked two or three questions in one return; each round below is the part of the return about this question, with any opening lines that cover all of them. Recorded by the orchestrator. Session session_01QBwHGLTq16QWmY6X4bJYoG, 2026-11-02.

## Round 1
**Verdict: FAIL**

The cited records say what the question claims.
- OPERATING_MODEL.md line 120 is the S-032 "Why and context" rule. It requires `Milestone: M&lt;id&gt;` in each pull request.
- Q-016-memo.md areas A3, A4, K2 and K3 are the open items the question names.
- docs/handover/service-desk.md lines 19-27 match what the question says about the desk and the sender.
- src/lib/seen.js confirms that a device-only seen-mark exists. src/lib/pulls.js carries `mergedAt`, so merged pull requests are already read in some form. Both facts make the question answerable from code.

**Blocking**

1. **The "What each answer would change" paragraph hints at the hoped-for result and presupposes new work.**
   - The text is "records that already tie pull requests to milestones and aims make a connected account possible from existing data, and gaps in them set what would have to be recorded; an existing seen-mark sets what can be reused".
   - This names the owner's wish in the owner's own words: connecting the dots (answers 2, 3, 4) and "remember on every device" (answer 6). It also frames the work as building a "connected account" with a reusable seen-mark.
   - The opening clause, "narrows any new work to what is missing", assumes new work happens. Round 1 of Q-016 failed on the same kind of presupposition.
   - The decision line has the same problem: "What any new way of keeping up with changes would replace, duplicate or add to". This drops the no-change option the groundwork memo requires (A3, trap 10).
   - Suggested decision line: "Whether the desk and the projects' records already do what any new way of keeping up with changes would do, what such a way would then replace, duplicate or add to, and which existing records it could draw on."
   - Suggested "each answer would change": "What the desk already shows and reads sets what a new way of keeping up would replace, duplicate or add to, or whether none is needed. What the records tie together, and how reliably, sets what any use of them could rely on and where they are silent. An existing seen-mark sets what exists to build on or leave alone."

2. **The blind is breached by the instruction "answer from the desk's code and records".**
   - The Researcher must not see docs/PROJECT.md, decision cards or rulings (researcher.md line 26).
   - "Its records" invites docs/PROJECT.md, decisions/ and the ledger. docs/PROJECT.md holds the brief, the owner's leanings and the owner's hated-list.
   - Name the allowed set: src/, docs/handover/, the model's OPERATING_MODEL.md and its specs, the projects' pull-request pages, reviews/, and the portfolio and project record files.
   - Exclude decisions/, questions/, docs/PROJECT.md, docs/reports and docs/briefs.
   - The Q-016 memo also excluded Model-Lab. Say so, since /home/user/Model-Lab sits beside the other clones.
   - One consequence needs a decision: line 9 and the desk's "milestone list" bullet need the project document's milestone list, and that is in docs/PROJECT.md, which the Researcher must not see. Either the Chief of Staff quotes the structure (section 3, the line form) or the bullet drops that example.

**Non-blocking**

3. **Depth 2 does not fit the work.**
   - "How reliably each is filled" across the projects and the portfolio is a sampling job, not one source.
   - The Researcher has no shell, so merge commits are unreadable (only `.git/logs/HEAD`, as the memo used).
   - Either set depth 3, or reword to "which records exist, what the specs say about older ones (S-032: 'older pull requests are not rewritten'), and the state of a stated sample (the open pull request(s) and the last 10 merged, read from their GitHub pages)".
   - Drop "merge commits" or say they are read from the pull-request page.

4. **Line 9 states the milestone rule as fact and leaves out its limit.**
   - Add "required from the version of the model that introduced it; older pull requests were not rewritten (S-032)", so that "required" is not read as "filled".

5. **Gaps against the decision.**
   - Add whether the desk shows changes that are not pull requests (deploys, direct commits, record-only commits) and what it shows for them. Memo N1 and K1 and the decision's "any new way of keeping up with changes" cover this. Right now the question is pull-request-only.
   - Add whether the desk shows when each row was last refreshed (memo H2) and what it does with a pull request that changes after it is listed.
   - The notification bullet should ask for each project separately. The handover says Personal-Org-Operating-Model has no sender yet (lines 10-11 and 35-37).

6. **Scope.**
   - Shortlist item 3 asks only what the rows show and what parts are read. This draft adds the milestone/aim links (J2, E3, C2) and the seen-mark.
   - The additions are traceable to the memo, so they are fine. But "project aim" and "shared between devices" are the owner's phrasing (answers 3 and 6). Memo C2 says "whether a phone and a desktop need to agree", and "milestone" has memo J2. Prefer "project's purpose as written in its plan" or drop "aim". For the seen-mark bullet, use "kept on one device or shared", not the owner's "across devices".

## Round 2
## Q-019

**Verdict: PASS**

**Round-1 findings**
- **Closed, blocking 1 (hint at the hoped-for result, and presupposed new work).** The "connected account" and "narrows any new work" wording is gone. The decision line now reads "Whether the desk and the projects' records already do what any new way ... would do", and the no-change option is back. The "each answer would change" text is neutral. "Aim" and "across devices" are gone: the seen-mark bullet now says "kept on one device or shared".
- **Closed, blocking 2 (blind breach).** The second paragraph of the question now has explicit read and not-read lists. It excludes decisions/, questions/, docs/PROJECT.md, docs/reports/, docs/briefs/, Model-Lab and the portfolio's contents. It also tells the Researcher to say so where an answer sits in a place not to be read.
- **Closed, 3 to 6.** Depth is now 3 with a stated sample. The "older pull requests were not rewritten" limit is stated. Non-pull-request changes, row freshness and per-project notifications are added. The wording of the seen-mark bullet is fixed.

**Checks run**
- The cited paths exist: Service-Desk's status/, dispatch-log/, queue/, reviews/, and template-v3/docs/PROJECT.md in the model repository.
- The ` · sprints: PR #40, PR #41` form is in the model's template and its tests.
- The S-032 rule is at OPERATING_MODEL line 120.
- Memo areas A3, A4, H2, K2, K3 and N1 exist.
- The new public/private fact fits. Only Service-Desk's pull-request pages are named for web reading. The two private repositories are read from the local clones, or not at all.

**Blocking:** none.

**Non-blocking**
1. **The path "template-v3/docs/PROJECT.md" collides with the ban on "any repository's ... docs/PROJECT.md".** A Researcher could stall on it. Add "(the model's template file, which is allowed)" or move the form into the question text.
2. **The sample could overstate how reliably the line is filled.** "The open pull requests and the last ten merged" are all recent and so all fall after the rule. The question itself says older pull requests were not rewritten. Add a second small sample from before the rule, for example ten merged earlier in the project.
3. **The quoted milestone-line form stops at `phase:`.** Line 120 says every project milestone line also ends in ` · why: &lt;reason&gt;`. Add it, or say "among other parts".
