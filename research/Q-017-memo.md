I've revised the memo (round 3). It's below, followed by the six-part contract. The source checker was right about #5: its most recent `governance` run failed, and no later run passed. #5's heading is now wrong, so I've rewritten the claim, the pattern evidence and the counts around it.

# Memo: Q-017, round 3. How accurate and complete are Service-Desk's pull-request descriptions? (2026-11-03)

*Researcher memo for the Source checker. It replaces round 2. Each statement is marked **fact**, **estimate** or **opinion** and given a grade:*
- ***A:*** *read word for word from the primary page.*
- ***B:*** *read from the primary page, but through the fetch tool's extraction (a model sits in between), or from one page only.*
- ***C:*** *inferred.*

*Changes from round 2 are marked **[R3]**.*

## 0. Bottom line

- **No required section is missing** from the 20 merged pull requests in the sample, judged by the rule dates in §1. *(estimate, B)* **[R3]** I re-opened the three PRs that adopted the rules (#65, #79, #222). I also re-opened the first sampled PR each rule bound: #70, #83 and #226 (§1). The other 14 bodies were not re-read in this round.
- **One sampled PR makes a claim its diff contradicts.** #31's body drops a condition from a ruling it records. *(fact, A; confirmed in round 2)*
- **Smaller mismatches:**
  - Later commits left #44's description out of date. *(fact, B; commit list re-opened in round 3)*
  - #239's body says "Nine locked cases rewritten". **[R3]** The commit list shows nine "Rewrite" commits in the PR's first round, two of them marked "(forced …)". It then shows a tenth, 16e1389, in round 3. The body doesn't mention it. *(fact, B)* Whether leaving it out was deliberate is an estimate (C).
- **"Nothing failed or was skipped" is a loose sentence:**
  - #135's opening says it, while its commits record FAIL verdicts from reviewers. *(fact, A)*
  - #175's reviewer read the sentence as being about CI checks. *(fact, B)*
- **[R3, corrected] Failed check runs that the description doesn't name:**
  - #5, #31 and #161 each have a failed check run on the head commit, and none of their descriptions names it. *(fact, B)*
  - **In #5 and #31 the failed run is the most recent run of that check. Both PRs were merged with it standing.**
  - In #161 a later run of the same check passed.
  - Round 2 said a later run also passed in #5. That was wrong.
- **You usually can't tell whether a description was edited.** It could be settled for only 2 of the 20. *(fact, B)*
- **Six of the 20 diffs could not be read in full**, because the fetch tool cut them short. *(fact, A about my method)*

## 1. The sample and how it was read

- **Open pull requests at 2026-11-02 12:00 UTC: none** *(fact, B)*. So the sample is **entirely merged**.
- **Two numbers were swapped:** #174 and #200 were closed without merging, so #175 and #201 replace them *(fact, B)*.
- **Final sample:** #5, 18, 31, 44, 57, 70, 83, 96, 109, 122, 135, 148, 161, 175, 187, 201, 213, 226, 239, 252.
- **Date span:** #5 was created 2026-10-01T11:10:58Z (**[R3]** re-opened in `pulls/5`). #252 was merged 2026-10-29T21:05:25Z (the checker confirmed this). *(fact, B)*
- **When each rule binds** *(estimate, B for the quotes, C for the dates as binding dates)*. The private model repo can't be read, so I used the PR in which Service-Desk adopted each rule:

| Rule | Adopted in | Merged (UTC) | Body says (**[R3]** re-opened) | Required on |
|---|---|---|---|---|
| "What this means for you" | #65 | 2026-10-13T23:51:13Z | "plain English first in everything written for you" | #70 and later |
| Milestone line, Context, Why | #79 | 2026-10-17T02:45:39Z | "from the next pull request on, every Service-Desk pull request names the milestone it serves and lists the facts behind it, each with its source, and its why" | #83 and later |
| Tasks | #222 | 2026-10-25T00:55:24Z | "Every pull request here now lists its tasks as tick boxes after its Why" | #226 and later |

- **[R3] The first sampled PR each rule bound, re-opened** *(fact, B)*:
  - **#70** (created 2026-10-14T04:27:17Z) has the headings "What this means for you" and "Detail".
  - **#83** (created 2026-10-17T22:14:56Z) has the headings "What this means for you", "Context", "Why", "What is in it" and "Checks". Its HTML page has the line "**Milestone: none** (a records fix to the review files of the model 3.5.0 sync; it changes no milestone's work)".
    - *Method warning:* the JSON extraction of #83 reported "Milestone line: None present". It was reading the empty GitHub `milestone` field, not the body.
  - **#226** (created 2026-10-25T05:26:04Z) has "What this means for you", "Context", "Why" and "Tasks" (with `[x]` and `[ ]` boxes), plus the line "Milestone: M3E".
- **Caveat on #44:** a `pr-body` check already ran on #57 but not on #44, and #44 uses a bold inline lead rather than a heading. Whether that broke a rule in force that day: **could not be determined**.
- **How each page was read:**
  - **Descriptions:** from the `pulls/N` JSON through the fetch tool (B). #5 and #83 were also read from their HTML pages.
  - **Diffs read word for word:** #5, 18, 31, 57, 83, 96, 109, 122, 161, 175, 201, 252.
  - **Diffs read only in part:** #44, 70, 135, 148, 187, 213, 226, 239.
  - **Check runs:** read with `commits/<head>/check-runs` for all 20. **[R3]** Re-opened for #5 and #31.
  - **Rate limit:** the unauthenticated limit of 60 requests an hour cut some comment reads short.

## 2. Per-PR record

*Column key:*
- ***Says:*** *what the description claims.*
- ***Left out / not borne out:*** *what the diff shows that the description leaves out, or contradicts.*
- ***Risk / fail / finding named?:*** *whether the description names failed checks, review findings or irreversible steps.*
- ***Edited?:*** *whether the description was changed after later commits.*
- ***Opening alone correct?:*** *whether the opening paragraph alone gives a correct account.*
- ***Relation:*** *to other PRs or to the milestone it names.*
- ***Status:*** *checked (✓) or could not be determined (?).*

| PR | Says | Left out / not borne out | Risk / fail / finding named? | Edited? | Opening alone correct? | Relation | Status |
|---|---|---|---|---|---|---|---|
| 5 | PACKS.toml: the Researcher gets its own previous memo, and the Source checker its own previous report | Nothing; matches "2 lines plus comments" | **[R3]** The head d7d0749 has 4 runs. `governance` passed 11:10:52–11:10:57, before the PR opened at 11:10:58. `governance` then **failed** 11:11:05–11:11:13, and no later run of it exists. Merged 11:28:14. The body says "`governance/checks/check_all.sh . origin/main` passed" and doesn't name the failed run. It names R3 | Cannot tell | Not required on this date | Names Q-001/2/4; right | Diff ✓; review ? |
| 18 | sources.md widened to any vendor's own pages | Nothing | All checks pass. Reviewer comment came back as a summary only | Cannot tell | Not required | Names #17; right | ✓; review ? |
| 31 | Records 6 move-to-Build values | **Not borne out:** drops "if O5's fallback is needed". **Left out:** "any API key needs the owner's ruling first" | **[R3]** The head 98cfcb4 has 10 runs. `decide` **failed** 17:14:40–17:14:50, its only run. The five jobs after it (prepare, session, collect, record, commit) were skipped. Both `governance` runs passed. PR opened 17:14:42 and merged 17:17:08 by shumpmaster. Not named | Cannot tell | Not required | Not checked | ✓ |
| 44 | M2; "5 Builder commits"; 158/158 tests "on c514b51" | 8 commits. After c514b51 (12:34:28) come 6206ebd "S-001 M2: fix the Reviewer's PR #44 findings (B1, N1-N6)" (13:00:59), 1e17757 "Create reviewer.md" and 2681cce "Create owner.md". The B1 fix isn't mentioned | B1 not named | **Not updated after later commits** (estimate, B) | Bold inline lead; correct as of c514b51 | M2; right | Diff partial ? |
| 57 | Ledger L-0007 | Nothing | All pass; says reversible | Cannot tell | Yes | — | ✓ |
| 70 | v3.3.2 sync; "Until both are there, the governance check stays red, and that is expected" | Nothing seen against the file list | **Names the red check.** Two `governance` runs failed on c498a4e. Merged 15:03:22 by shumpmaster; reviews/70 holds only reviewer.md | Cannot tell | Yes, though it also opens "Nothing failed or was skipped" | Names #67; not checked | ✓ |
| 83 | Fixes #81's verdict file; "Milestone: none" | Matches | All pass; names its own mistake | Cannot tell | Yes | #81, #82; right | ✓ |
| 96 | Records 3 answers | Matches | All pass | Cannot tell | Yes | M3A; right | ✓ |
| 109 | Files one question | Matches | All pass | Cannot tell | Yes | Right | ✓ |
| 122 | Files two M3A questions | Matches | All pass | Cannot tell | Yes | Right | ✓ |
| 135 | Job PRs "being recorded"; R3; 769 tests | Carries the S-001 spec amendment and notify changes; the spec change is cited only as a source | Opening: "Nothing failed or was skipped", while commits read "FAIL on A, E" and "FAIL on A (forged log lines)" | Cannot tell | No, if failed reviews count | Right | Diff partial ? |
| 148 | Design reviewer set up | Diff only partly read | Names the red check. Probable failed rounds not named (C) | Cannot tell | ? | — | ? |
| 161 | Marks M3A reached; opens "Nothing failed or was skipped" | Matches | Head 612cf90 has 7 runs. `governance` failed 14:32:30–14:35:42, starting 13 s before the PR opened at 14:32:43. A later `governance` run passed (14:32:49–14:36:57). Not named | Cannot tell | Yes on the latest run; no if every run counts | M3A; right | ✓ |
| 175 | j22.js becomes R3; replaces #174 | Matches | "Nothing failed or was skipped" while the diff holds round-1 and round-2 **Verdict: FAIL** reports. The reviewer's confirmation calls the sentence "accurate, apart from the verdicts that aren't recorded yet" | **Yes:** the confirmation says finding 2 was fixed in the PR's text | Yes under the checks reading | MD3; right | ✓ |
| 187 | Stage 7; "passed after fixes" | Diff partial | Names the reviewer's gap (summary only) | Cannot tell | Yes | MD3 | ? |
| 201 | Files two questions | Matches | All pass | Cannot tell | Yes | Right | ✓ |
| 213 | Step 8: tests only | Reviewer: "no src/ file changed" | Leaves out note 1 | Cannot tell | Yes | M3D | ✓ (diff partial) |
| 226 | "One thing failed and was fixed" | Spec +7/−1 flagged in Tasks | Names the round-1 FAIL | Edited within seconds of opening, not after commits | Yes | "Milestone: M3E" | Diff partial ? |
| 239 | "Nine locked cases rewritten, each in its own commit, two of them forced and named (AC80, AC89, AC91)" | Spec change not named as a change. **[R3]** 41 commits. Nine "Rewrite" commits in round 1 (e0015bd, 585cb35, ac47f6d, e25c44a, b9929fb, 50b89e0, a8d64b9, 69ec664, f554f7a); the last two say "(forced; not named in G8d's row)", which matches "two of them forced". A tenth, 16e1389 "Rewrite round 2's locked case …", comes in round 3 and isn't mentioned | Heap-limit risk: d262a10, 102b051 and 7aa633d ("one process ran out of heap"); the body names the test-command change. Reviewer record came back as a summary only | Cannot tell | Yes | M3E | Diff partial ? |
| 252 | 3 acceptances | Matches | All pass | Cannot tell | Yes | "Milestone: M3B" but it marks M3E, M3G and M3B; partly right | ✓ |

## 3. Counts and the rule used for each

| Kind | Rule | Count (of 20) | PRs |
|---|---|---|---|
| Required section left out | Required on that date (§1) and absent | **0** (estimate, B) | — |
| Claim the diff contradicts | A claim the diff contradicts, or a condition dropped | **1** | #31 |
| A later same-kind change left out of a stated count | A stated count that misses a later same-kind commit | **1** (B; intent C) | #239 |
| "Nothing failed" while the PR records a FAIL review verdict | Holds only if reviews count | **2** (+1 probable) | #135, #175; probable #148 |
| **[R3]** Latest run of a check on the head failed, not named | The most recent run of each check name on the head sha has conclusion failure, and the description doesn't mention it | **2** | #5 (`governance`), #31 (`decide`) |
| **[R3]** Any run on the head failed, not named | Any run with conclusion failure, not mentioned | **3** | #5, #31, #161 (#70 names its red check) |
| Out of date after later commits | Commits after the one the description cites | **1** | #44 |
| Content change left out | A changed file outside reviews/ and digests, not named as a change | **3** | #31, #135, #239 |
| Review finding not named | Missing from the description | **2** | #44, #213 |
| Milestone line partly wrong | — | **1** | #252 |
| Edited after later commits | Shown by the pages | yes 1 (#175); not updated 1 (#44); cannot tell 18 | — |

**Worked examples:**
1. **#31, dropped condition.** The body says "Redirect: a permanent redirect from the old address meets V4". The diff says "if O5's fallback is needed, a permanent redirect from the old address counts as meeting V4".
2. **#5, latest check failing, not named.** The body says "`governance/checks/check_all.sh . origin/main` passed". The last `governance` run on d7d0749 failed (11:11:05–11:11:13), and the PR merged at 11:28:14.
3. **#44, out of date.** The body says "on c514b51 … 158 of 158 tests". It is followed by 6206ebd "fix the Reviewer's PR #44 findings (B1, N1-N6)".

## 4. Patterns and opinions

- **What "nothing failed" covers:**
  - #175's reviewer tied the sentence to CI checks all three times *(fact, B; checker confirmed the quotes)*.
  - That #81's reviewer counted failed reviews as "failed" is an estimate (C).
  - *Opinion:* the sentence reads most naturally as being about checks, but an owner may take it to mean no review failed. A summary should state checks and review verdicts separately.
- **Reviewers check the wording of descriptions** *(fact, B)*. This applies to #81 and to #175 round 1 and round 2's finding 2. #175's round-2 finding 1 was about checks and was withdrawn.
- **[R3, corrected] Check runs on the head can come in pairs that disagree:**
  - In #161 a failed run was followed by a pass.
  - In #5 a pass was followed by a failure.
  - In #31 `decide` failed on its only run, and the jobs after it were skipped.
  - *Opinion:* "the latest run of each check name" is the better test, and under it #5 and #31 count and #161 doesn't.
  - *Estimate (C):* the paired runs look like a push trigger and a pull-request trigger. In #5 the failing run started 7 s after the PR opened.
  - Whether `decide` failing in #31 is a real failure or a designed way of skipping work could not be determined.
- **[R3] Method warning:** the fetch tool's extraction can misreport absent things. The #83 JSON extraction said there was no milestone line, and the HTML page showed one. Round 2's key count for `pulls/252` (48) did not reproduce for the checker (67). Absence claims resting on one extraction should be graded no higher than B, and counts should not be relied on.
- **Overall** *(opinion)*: 11 of 12 fully read diffs matched their descriptions. The author's text is not a sole source for:
  - whether anything failed (checks or reviews);
  - spec changes bundled into build PRs;
  - anything after the commit or round it names.

## 5. Proposed library entries (revised)

- **F-pr-desc-01a** (fact, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** in Service-Desk PR #31, the body states "Redirect: a permanent redirect from the old address meets V4". The diff reads "if O5's fallback is needed, a permanent redirect from the old address counts as meeting V4". The body leaves out "any API key needs the owner's ruling first". **[R3]** On head 98cfcb4, `decide` failed on its only run (17:14:40–17:14:50) and the five jobs after it were skipped. The PR was merged at 17:17:08 by shumpmaster, and the body doesn't mention the failure.
  - **Sources:** `/pull/31.diff`; `pulls/31`; `commits/98cfcb4…/check-runs`.
- **F-pr-desc-01b [R3, corrected]** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **Claim:**
    - **#5:** the head d7d0749 has a passing `governance` run (11:10:52–11:10:57, before the PR opened at 11:10:58), then a failing one (11:11:05–11:11:13). No later `governance` run exists, and the PR was merged at 11:28:14. The body says "`governance/checks/check_all.sh . origin/main` passed" and doesn't mention the failure.
    - **#161:** the head 612cf90 has a failing `governance` run (14:32:30–14:35:42), then a passing one (14:32:49–14:36:57). The body opens "Nothing failed or was skipped".
  - **Sources:** `commits/d7d0749f…/check-runs`; `commits/612cf90b…/check-runs`; `pulls/5`; `pulls/161`.
- **F-pr-desc-01c** (estimate, B; topics: pull-requests, accuracy)
  - **Claim:** in 20 merged Service-Desk PRs (created 2026-10-01 to merged 2026-10-29), none left out a section required on its date. Rule dates come from adoption PRs #65, #79 and #222, quoted in §1.
  - **Spot checks:** #70, #83 and #226 carry the sections first required of them. #83's milestone line was seen only on its HTML page.
  - **Sources:** `pulls/65`, `/79`, `/222`, `/70`, `/83`, `/226`; `github.com/…/pull/83`.
  - **Status:** the other 14 bodies were not re-read in round 3, so this may be held.
- **F-pr-desc-01d [R3, new]** (fact, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** #239's body says "Nine locked cases rewritten, each in its own commit, two of them forced and named (AC80, AC89, AC91)". Its 41 commits include nine round-1 commits titled "Rewrite …", the last two marked "(forced; not named in G8d's row)". There is also a later commit 16e1389, "Rewrite round 2's locked case 'a project the desk can't draw whose read fails keeps its can't-read words'", which the body doesn't mention.
  - **Sources:** `github.com/…/pull/239/commits`; `pulls/239`.
- **F-pr-desc-02** (fact, B; topics: pull-requests, change-reporting; shelf life 6 months)
  - **Claim and sources:** unchanged from round 2. The checker confirmed #175, and #81 was confirmed earlier.
- **F-gh-api-01a** (fact, B; topics: github; shelf life 12 months)
  - **Claim:** the unauthenticated GitHub REST core limit is 60 requests an hour. Unchanged; confirmed earlier.
- **F-gh-api-01b [R3, re-sourced, count removed]** (fact, B; topics: github; shelf life 12 months)
  - **Claim:** GitHub's REST "Get a pull request" response schema has no property for the body's edit history or last-edit time; its only update time is `updated_at`. GitHub's GraphQL PullRequest object documents `lastEditedAt` ("The moment the editor made the last edit.") and `userContentEdits` ("A list of edits to this content.").
  - **Sources:** `docs.github.com/en/rest/pulls/pulls#get-a-pull-request`; `docs.github.com/en/graphql/reference/pulls`.
  - **Note:** the REST half is an absence claim read through extraction (see the §4 method warning). The observed key count is dropped.
- **P-summary-failed-01 [R3, evidence corrected]** (pattern; topics: summaries, accuracy)
  - **Pattern:** an owner-facing change summary states the latest result of each check, and the review verdicts separately ("checks: …; reviews: N rounds, M failed"). It never says a bare "nothing failed" or "X passed".
  - **Evidence:**
    - #135 and #175: the sentence was true of checks while reviews had failed.
    - #5 and #31: the latest run of a check failed, and the body was silent or named only a local pass.
    - #161: the sentence stood beside an earlier failed run.
- **P-summary-asof-01** (pattern; topics: change-reporting)
  - **Pattern:** a summary names the head commit or round it describes.
  - **Evidence:**
    - #44's commits 6206ebd, 1e17757 and 2681cce all come after c514b51, the commit the body names.
    - **[R3]** #239's count of nine leaves out the round-3 rewrite.

## 6. Not confirmed, carried forward

- The 0-missing-sections count (01c): 14 bodies were not re-read.
- #148's probable failed review rounds (C).
- Six partial diffs, and review records seen only as summaries (#18, #187, #239).
- Whether #239 left out 16e1389 on purpose.
- Whether #31's `decide` failure is a real failure.

---

## Contract

**1. What I changed**
- **F-pr-desc-01b, §0, the #5 row, §3 and §4:** corrected for #5. Its latest `governance` run failed and it merged with that run standing. Round 2's "a later run passed" now applies only to #161.
- **New count rule, "latest run of a check failed, not named":** 2 PRs (#5, #31). The any-run count of 3 is kept.
- **#31:** added its full check-run picture (the only `decide` run failed, and the jobs after it were skipped).
- **F-gh-api-01b:** the 48-key count is dropped. The REST half is now sourced from GitHub's REST docs.
- **F-pr-desc-01c:** given quoted rule sources (#65, #79, #222) and spot checks of #70, #83 and #226.
- **#239:** the count issue is reframed. Nine round-1 rewrites match the body, and a round-3 rewrite is left out. This is filed as the new entry F-pr-desc-01d.
- **P-summary-failed-01 and P-summary-asof-01:** evidence updated.
- **§4:** method warning added.

**2. Why**
- The source check found the #5 "later run passed" claim false.
- It found the `pulls/252` key count did not reproduce.
- It found 01c, #44, #239 and #70 unopened or unsupported.

**3. What I verified** (13 fetches; all through the fetch tool, so grade B)
- **#5:**
  - `commits/d7d0749/check-runs`: 4 runs. `governance` succeeded 11:10:52–11:10:57, then failed 11:11:05–11:11:13.
  - `pulls/5`: created 11:10:58Z, merged 11:28:14Z, and the body sentence about `check_all.sh` passing.
- **#31:** `commits/98cfcb4/check-runs` shows 10 runs, with `decide` failing on its only run. `pulls/31` gives created 17:14:42Z, merged 17:17:08Z, merged by shumpmaster.
- **Rule adoptions:** `pulls/65`, `/79` and `/222` give the merge times and the rule quotes.
- **First PRs bound by each rule:** `pulls/70`, `/83` and `/226` for headings. #83's HTML page for "Milestone: none".
- **#44:** `pulls/44/commits` shows 8 commits, three after c514b51.
- **#239:** the HTML commit list shows 41 commits and 10 titled "Rewrite", 9 of them before round 2. `pulls/239` gives the body sentence.
- **REST docs:** "Get a pull request" has no property containing "edit"; it has `updated_at`.

**4. What is undone**
- 14 bodies not re-read for the section count.
- Six partial diffs.
- Unread reviews: #18, #187 and #239 (seen only as summaries), and the other review records from #83 onward.
- #148 is unresolved.

**5. Needed outside my lane**
- **An authenticated fetch** (`gh`, GraphQL `userContentEdits`) to:
  - get edit histories;
  - read full diffs;
  - count keys without an extraction model in between.
- **The model repo's version dates**, to confirm when each rule binds.
- **Recording this memo** in research/ (the Orchestrator).

**6. Open questions**
- Do the rules mean "nothing failed" to cover checks only, or reviews too?
- Should a failed check that a later run superseded count as a failure the description must name? Should a "latest run failed" PR like #5 or #31 have been mergeable?
- Is `decide` failing in #31 a designed way of skipping work?
- Did #239 leave out 16e1389 on purpose?
- Why did #70 merge with no owner.md?