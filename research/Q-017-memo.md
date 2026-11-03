# Memo — Q-017 — How accurate and complete are Service-Desk's pull-request descriptions? — 2026-11-03

*Researcher memo for the Source checker. Every statement is marked **fact**, **estimate** or **opinion**, with a grade. **A** means read directly, word for word, from the primary page. **B** means read from the primary page but through the fetch tool's extraction, or from one page only. **C** means inferred.*

## 0. Bottom line

- **No required section is missing.** In the 20 merged pull requests sampled, none leaves out a section that the rules required on its date. *(fact, B)*
- **Only one sampled PR states a change that its diff contradicts.** #31 drops a condition from a ruling it records. A further 3 PRs carry smaller mismatches about the process: a description left stale by later commits (#44), and an "N cases rewritten" count one short of the commits (#239). The bigger risk is elsewhere:
  - **"Nothing failed or was skipped" means two different things.** In #135 and #175 the opening says nothing failed, while the PR's own commits or diff record FAIL verdicts from reviewers. The project's reviewers judged that sentence two different ways (#81 and #175). *(fact, A for the records quoted; opinion on what it means)*
  - **Failed CI runs go unmentioned.** Three heads carry a failed run that the description never mentions (#5, #31, #161). *(fact, B)*
  - **Spec amendments carried in a PR are cited but not called changes.** In #135 and #239, specs/S-001.md is cited as a source but never named as something the PR changes. *(fact, B)*
- **Whether a description was edited usually can't be seen.** That was settled for only 2 of 20 PRs. *(fact, B)*
- **Six of the 20 diffs could not be read in full, because the fetch tool cut them short.** On those six, any judgement of what was left out is incomplete. *(fact, A about my own method)*

## 1. The sample and how it was read

- **Open pull requests at 2026-11-02 12:00 UTC: none** *(fact, B)*:
  - `pulls?state=open` returned an empty list.
  - A search for PRs created before that time and closed after it returned total_count 0.
  - #265 closed at 2026-11-02 00:35 and #266 opened at 12:11, either side of the cut-off.
  - So the sample is **entirely merged**.
- **Two numbers were swapped** *(fact, B: search `is:closed is:unmerged` returned 7 PRs: #62, #82, #142, #147, #174, #179, #200)*:
  - #174 was closed without merging, so #175 replaces it.
  - #200 was closed without merging, so #201 replaces it.
- **Final sample (20):** #5, 18, 31, 44, 57, 70, 83, 96, 109, 122, 135, 148, 161, 175, 187, 201, 213, 226, 239, 252.
- **When each rule binds** *(estimate, B)*. The private model repo can't be read, so I used the PR in which Service-Desk adopted each rule:

| Rule | Adopted in | Merged (UTC) | Required on |
|---|---|---|---|
| "What this means for you" (plain English first) | #65 | 2026-10-13 23:51 | #70 and later |
| Milestone line, Context, Why | #79 ("from the next pull request on") | 2026-10-17 02:45 | #83 and later |
| Tasks | #222 | 2026-10-25 00:55 | #226 and later |

  Caveat: a `pr-body` CI check already ran on #57 (2026-10-08) but not on #44. So some form rule bound earlier than #65 *(fact, B)*. #44 uses a bold inline "**What this means for you:**" rather than a heading. Whether that broke a rule in force that day: **could not be determined**.
- **How each page was read:**
  - **Description:** the GitHub REST `pulls/N` JSON, with the fetch tool told to quote the body word for word. The tool runs a model in between, so being word-perfect is likely but not something I could check independently (grade B). Some `issues/N/comments` and some raw review files came back only as summaries. Where that happened, the table says "summary only" and I don't judge from it.
  - **Diff, and why six are incomplete:**
    - Read word for word (`patch-diff…/pull/N.diff`): #5, 18, 31, 57, 83, 96, 109, 122, 161, 175, 201, 252.
    - #70: file list from the API plus partial diff extracts.
    - #44: API file list, but the paging came back inconsistent, so it is incomplete.
    - #135, 148, 187, 213, 226, 239: headers and file lists only, and truncated. For #148 that was 9 of 110 files; for #239, 28 of 39.
  - **Commits:** API or HTML for 13 PRs. For #83, 96, 109, 122, 187, 213 and 226 I have the commit count only.
  - **Checks:** `commits/<head>/check-runs` for all 20.
  - **Reviews:** described per PR below. The API's unauthenticated limit of 60 an hour cut the comment reads short (it returned HTTP 403 once; `rate_limit` showed limit 60).

## 2. Per-PR record

Column key: **Says** is what the description claims. **Left out / not borne out** compares it with the diff. **Risk / fail / finding named?** covers failed checks, review findings and irreversible steps. **Edited?** asks whether the description was changed after later commits. **Opening alone correct?** asks whether the opening paragraph alone gives a correct account. **Relation** is to other PRs or to the milestone it names. **Status** is checked (✓) or could not be determined (?).

| PR | Says | Left out / not borne out | Risk / fail / finding named? | Edited? | Opening alone correct? | Relation | Status |
|---|---|---|---|---|---|---|---|
| 5 | PACKS.toml: the Researcher gets its own previous memo, the Source checker its own previous report | Nothing; the diff matches "2 lines plus comments" | One governance run failed on the head, 15 s after the PR opened; not named. It does say R3 needs both verdicts. The reviewer comment came back as a summary | Cannot tell | Not required on this date | Names Q-001/2/4; right | Diff ✓; review ? |
| 18 | sources.md widened to any vendor's own pages | Nothing in the diff (the reviews/18 files came later and are required records) | All checks pass. The reviewer comment (summary only) lists 3 open items; the description names the merge order relative to #17 | Cannot tell | Not required on this date | Names #17 and the Q-006 card; right | ✓; review ? |
| 31 | Records 6 move-to-Build values | **Not borne out:** "a permanent redirect … meets V4", while the file says "*if O5's fallback is needed*, a permanent redirect … counts as meeting V4". **Left out:** "any API key needs the owner's ruling first" | A `decide` job failed on the head; not named. Cause not determined | Cannot tell | Not required on this date | Names the Critic's points 1 and 4; not checked | ✓ |
| 44 | M2: answering, the Agents view, CI, hold/merge cards; "5 Builder commits"; 158/158 tests "on c514b51" | The PR has 8 commits, including "fix the Reviewer's PR #44 findings (B1, N1–N6)". The reviewer record (summary) gives 175 tests in round 2. The description never mentions the B1 fix | The round-1 blocking finding B1 is not named. All final checks pass | **Not updated after later commits** (estimate, B) | Bold inline lead; correct as of c514b51 | "Milestone M2 of spec S-001"; right | Diff partial ? |
| 57 | Ledger L-0007: scrub proof deferred | Nothing (digest regenerated, as stated) | All pass; says the change is reversible | Cannot tell | Yes | — | ✓ |
| 70 | v3.3.2 sync; governance check red until reviews/70 files are in | Nothing seen against the file list | **Names the red check.** It merged red; reviews/70/reviewer.md was committed to main at 15:15, after the merge, and I found no owner.md (directory listing, B) | Written after the last commit | Yes | Names #67; not checked | ✓ |
| 83 | Fixes #81's verdict file; moves the full report unchanged | Matches; the new file's blob (dac0f3b6) is identical to the old one | All pass; names its own mistake | Cannot tell | Yes | Names #81 and #82; right | ✓ |
| 96 | Records 3 answers; removes 3 question files | Matches | All pass | Cannot tell | Yes | M3A; names #95; right | ✓ |
| 109 | Files one question on the Critic's failure of draft 6 | Matches (title says "fifth check", body says "sixth draft"; the file shows both are true) | All pass | Cannot tell | Yes | "none" with a reason; right | ✓ |
| 122 | Files two M3A questions | Matches | All pass | Cannot tell | Yes | M3A; right | ✓ |
| 135 | Job PRs shown as "being recorded"; R3; 769 tests | Carries the S-001 spec amendment (drafts 1–7, 7 Definer commits) and changes the notification sender (src/notify/grant.mjs, collect.mjs). The spec change is cited only as a source, not as something this PR changes | **Opening says "Nothing failed or was skipped",** yet the PR's own commits are titled "…round 1 … verbatim: **FAIL** on A, E" and "…: **FAIL** on A (forged log lines)" | Cannot tell | Not under rule R-fail (§3) | "none" with a reason; names #130; right | Diff partial ? |
| 148 | Sets up the Design reviewer; governance red until verdicts | Diff only partly read (9/110 headers); the commits match the listed areas | Names the red check and 4 known limits. "Nothing failed" while a stop-rule ruling exists after round 3 (`P-001-design-reviewer-stop`): probable failed rounds (estimate, C) | Cannot tell | Probably not under R-fail (?) | "none" with a reason | ? |
| 161 | Marks M3A reached | Matches (1 line; the 2nd commit only moves the field) | A governance run failed on the head, then a second passed; not named. Cause not determined | Cannot tell | Yes | M3A; names #160 and #90; right | ✓ |
| 175 | j22.js becomes R3; replaces #174 | Matches the diff | **"Nothing failed or was skipped"** while the diff holds round-1 and round-2 **Verdict: FAIL** reports. The final checks pass. It doesn't say the check stays red pending verdicts | **Yes:** the review confirmation says "Finding 2 is fixed in the PR's text" | Yes as to checks; no under R-fail | MD3; replacing #174 stated; right | ✓ |
| 187 | Stage 7: dark mode and remaining screens; "passed after fixes" | Diff partial (14/15 headers) | Names the dash-length gap the reviewer found (review read as summary) | Cannot tell | Yes | MD3; right | ? |
| 201 | Files two questions | Matches | All pass | Cannot tell | Yes | "none" with a reason; right | ✓ |
| 213 | Step 8: tests and tools only; passed first time | Reviewer (word for word): "no src/ file changed"; matches | Names notes 2 and 3; **leaves out note 1** (wrong spec citations in ac84 tests) | Cannot tell | Yes | M3D; consistent with #252's "reached 2026-10-24" | ✓ (diff partial) |
| 226 | Glance step 5; "One thing failed and was fixed" | Spec +7/−1, flagged in Tasks as "AC83 changed" | **Names the round-1 FAIL (B1)**; Tasks lists one item not done (R3-b) | pr-body ran 3× within seconds of opening; edited, but not after commits | Yes | M3E; right | Diff partial ? |
| 239 | Glance 8d; test command changed; "Nine locked cases rewritten" | Spec +325/−38 not named as a change. There are **10** `[REWRITE]` commits; the 10th (16e1389) rewrites a round-2 case | Heap-margin risk in the reviewer record (summary only) not named | Cannot tell | Yes | M3E; right | Diff partial ? |
| 252 | Records 3 acceptances and the header request | Matches | All pass | Cannot tell | Yes | "Milestone: M3B" but it marks M3E, M3G and M3B; **partly right** | ✓ |

## 3. Counts and the rule used for each

| Kind | Rule used | Count (of 20) | PRs |
|---|---|---|---|
| Required section left out | Section required on that date (§1) and absent | **0** | — |
| Statement about the change not borne out by the diff | A claim contradicted by the diff, or a dropped condition | **1** (plus 1 count mismatch) | #31; count: #239 |
| Process statement not borne out (R-fail) | The opening says "nothing failed" while the PR's commits or diff record a FAIL verdict | **2** (+1 probable) | #135, #175; probable: #148 |
| Stale after later commits | The description's checked commit or counts precede later commits that change them | **1** | #44 |
| Content change left out | A changed file outside reviews/ and digests, not named as a change | **3** | #31 (API-key clause), #135 and #239 (spec amendments) |
| Failed check on the head not named | A check-run with conclusion failure on the head sha, not mentioned | **3** | #5, #31, #161 (#70 and #148 named theirs) |
| Review finding not named | A blocking or non-blocking finding in a word-for-word record, absent from the description | **2** | #44 (B1), #213 (note 1) |
| Milestone relation wrong or partial | The milestone line or a cross-PR claim doesn't fit the diff | **1 partial** | #252 |
| Edited after later commits | Shown by the pages | yes 1 (#175); not updated 1 (#44); cannot tell 18 | — |

**Worked examples, so another reader can repeat the judgement:**
1. **#31, dropped condition.** Compare the description's bullet "Redirect: a permanent redirect from the old address meets V4" with the diff line "+- Redirect: if O5's fallback is needed, a permanent redirect … counts as meeting V4". The condition is gone, which is a mismatch.
2. **#135, R-fail.** The opening says "Nothing failed or was skipped." The PR's commit list (/pull/135/commits) includes 875894b "…verbatim: FAIL on A, E for landing" and 2bbeb57 "…verbatim: FAIL on A (forged log lines)". This is the same test that the reviewer applied to #81 (round-2 finding: "the opening said 'Nothing failed or was skipped.'", quoted in #83's diff), and that #226 meets ("One thing failed and was fixed").
3. **#44, stale.** The body says "Checked by the orchestrator on c514b51 … 158 of 158 tests". The commits show 6206ebd "fix the Reviewer's PR #44 findings (B1, N1–N6)" and two review-record commits after c514b51.

## 4. Patterns and opinions

- **What "failed" covers is not settled** *(fact, A; then opinion)*. The two readings:
  - **Checks only:** #175's Reviewer confirmation reads "Nothing failed or was skipped" as being about checks ("accurate, apart from the verdicts that aren't recorded yet").
  - **Reviews too:** #81's round-2 finding treated the same sentence as false because review rounds had failed.

  *Opinion:* until this is fixed, an owner-facing summary can't take "nothing failed" at face value. It should list check runs and review verdicts separately.
- **Reviewers already check description accuracy** *(fact, A: reviews/81 rounds 1–6 and reviews/cs24 rounds 1–2 failed on description wording alone)*. *Opinion:* the reviewer record, where one exists, is a better second source than the description itself.
- **The description is fixed at opening** *(estimate, B)*. Commits that land after the PR opens (fixes, review records) usually aren't reflected unless a reviewer re-reads the text (#175 against #44).
- **Overall** *(opinion)*: the author's text is a good guide to what changed in small record PRs: 11 of 12 fully read diffs matched, the exception being #31. It is not reliable on its own for:
  - whether anything failed;
  - spec changes bundled into build PRs;
  - anything after the last commit it names.

## 5. Proposed library entries (for the Source checker)

- **F-pr-desc-01** (fact, grade B, topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** in 20 merged Service-Desk PRs (#5–#252, 2026-10-01 to 10-29), 0 left out a section required on their date. 1 contained a statement about the change contradicted by its diff (#31), and 3 had a failed check-run on the head that the description didn't name (#5, #31, #161).
  - **Sources:** github.com/shumpmaster/Service-Desk/pull/{N}; api.github.com/repos/shumpmaster/Service-Desk/pulls/{N}; …/commits/{sha}/check-runs.
- **F-pr-desc-02** (fact, grade A, topics: pull-requests, change-reporting; shelf life 6 months)
  - **Claim:** Service-Desk's Reviewer has failed PRs on description wording alone: #81 rounds 1–6, and #174/#175 rounds 1–2.
  - **Sources:** the #83 diff (reviews/81/reviewer.md removed lines); the #175 diff (reviews/cs24/_review-round1/2-verbatim.md).
- **F-gh-api-01** (fact, grade B, topics: github; shelf life 12 months)
  - **Claim:** the unauthenticated GitHub REST core limit is 60 requests an hour. The REST pull-request JSON does not expose a description's edit history.
  - **Sources:** api.github.com/rate_limit (response read 2026-11-03). The second half is an observation from the pulls/N fields read; it needs a docs source.
- **P-summary-failed-01** (pattern, topics: summaries, accuracy)
  - **Pattern:** an owner-facing change summary states check runs and review verdicts separately ("checks: …; reviews: N rounds, M failed"), never a bare "nothing failed".
  - **Evidence:** #81 and #175 read the sentence differently; #135 and #175 are examples.
- **P-summary-asof-01** (pattern, topics: change-reporting)
  - **Pattern:** a summary names the head commit it describes. A reader treats any commit after it as not covered.
  - **Evidence:** #44.

---

## Contract

1. **What I changed:** nothing. I have no write lane; the memo above is for the Orchestrator to record.
2. **Why:** this answers Q-017 at depth 3 from a fixed sample, using the method the question set.
3. **What I verified:**
   - About 110 fetches of the GitHub REST API, `.diff` pages, the commit and checks APIs, and raw review files.
   - All 20 PR bodies.
   - Word-for-word diffs for 12 PRs.
   - Check-runs on the head of all 20.
   - Open PRs at the cut-off: 0, confirmed by two searches.
4. **What is undone:**
   - Full diffs for #44, 70, 135, 148, 187, 213, 226 and 239.
   - Issue comments and PR reviews for #83–#252.
   - Commit lists for #83, 96, 109, 122, 187, 213 and 226.
   - The review records for #187, 226 and 239 came back as summaries only.
5. **Needed outside my lane:**
   - An authenticated fetch (`gh` or GraphQL `userContentEdits`) to see edit histories and read the large diffs in full.
   - The model repo's version dates, to confirm when each rule binds.
6. **Open questions:**
   - Which reading of "nothing failed" do the rules intend?
   - Why did #70 merge with governance red and no owner.md?
   - What caused the `decide` failure on #31 and the governance failure on #161?