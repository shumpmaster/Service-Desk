I rewrote the memo. I also re-checked sources the checker had not opened, so that every proposed entry now rests on quotes they can check.

# Memo: Q-017, round 2. How accurate and complete are Service-Desk's pull-request descriptions? (2026-11-03)

*Researcher memo for the Source checker. It replaces the round-1 memo. Every statement is marked **fact**, **estimate** or **opinion**, with a grade:*
- ***A:*** *read word for word from the primary page.*
- ***B:*** *read from the primary page, but through the fetch tool's extraction (a model sits in between), or from one page only.*
- ***C:*** *inferred.*

*Changes from round 1 are marked **[R2]**.*

## 0. Bottom line

- **No required section is missing** in the 20 merged pull requests sampled, judged by the rule dates in §1. *(fact, B; the round-1 source check did not confirm this, see §6)*
- **One sampled PR states a change that its diff contradicts.** #31 drops a condition from a ruling it records. *(fact, A; confirmed in round 1)*
- **Smaller mismatches:**
  - #44's description was left stale by later commits. *(fact, B)*
  - #239 says "Nine locked cases rewritten", but its commit list shows 10 commits whose titles begin "Rewrite". **[R2]** This is downgraded to an estimate, because the tenth may not count as a "locked case" in the author's sense (§2).
- **"Nothing failed or was skipped" is a loose sentence:**
  - #135's opening says it, while its commits record FAIL verdicts from reviewers. *(fact, A; confirmed)*
  - **[R2] Correction:** In round 1 I said #175's reviewer and #81's reviewer read the sentence two different ways. Re-reading the records, #175's reviewer tied the sentence to CI checks all three times. #81's record shows a reviews reading only by inference (§4).
- **Failed check runs that the description doesn't name:**
  - #5, #31 and #161 each carry a failed check run on the head commit that the description doesn't name. *(fact, B; #31 confirmed)*
  - **[R2]** In #5 and #161, a later run of the same check passed.
  - **[R2]** #161's failing run started 13 s before the PR was opened.
- **Whether a description was edited usually can't be seen.** It was settled for only 2 of the 20. *(fact, B)*
- **Six of the 20 diffs could not be read in full**, because the fetch tool cut them short. *(fact, A about my method)*

## 1. The sample and how it was read

- **Open pull requests at 2026-11-02 12:00 UTC: none** *(fact, B)*:
  - `pulls?state=open` returned an empty list.
  - A search for PRs created before that time and closed after it returned total_count 0.
  - So the sample is **entirely merged**.
- **Two numbers were swapped** *(fact, B)*. #174 and #200 were closed without merging, so #175 and #201 replace them.
- **Final sample:** #5, 18, 31, 44, 57, 70, 83, 96, 109, 122, 135, 148, 161, 175, 187, 201, 213, 226, 239, 252.
- **[R2] Date span:** #5 was created 2026-10-01T11:10:58Z and #252 was merged 2026-10-29T21:05:25Z *(fact, B: `pulls/5` and `pulls/252` JSON)*.
- **When each rule binds** *(estimate, C)*. The private model repo can't be read, so I used the PR in which Service-Desk adopted each rule:

| Rule | Adopted in | Merged (UTC) | Required on |
|---|---|---|---|
| "What this means for you" (plain English first) | #65 | 2026-10-13 23:51 | #70 and later |
| Milestone line, Context, Why | #79 ("from the next pull request on") | 2026-10-17 02:45 | #83 and later |
| Tasks | #222 | 2026-10-25 00:55 | #226 and later |

- **Caveat on #44:** a `pr-body` check already ran on #57 but not on #44, and #44 uses a bold inline lead rather than a heading. Whether that broke a rule in force that day: **could not be determined**.
- **How each page was read:**
  - **Descriptions:** from the `pulls/N` JSON through the fetch tool (B).
  - **[R2] #5's JSON came back paraphrased.** I re-read #5's body from the HTML page instead. It is close to word for word, but still grade B.
  - **Diffs read word for word:** #5, 18, 31, 57, 83, 96, 109, 122, 161, 175, 201, 252.
  - **Diffs read only in part:** #44, 70, 135, 148, 187, 213, 226, 239.
  - **Check runs:** `commits/<head>/check-runs` for all 20.
  - **Rate limit:** the unauthenticated limit of 60 requests an hour cut some comment reads short.

## 2. Per-PR record

*Column key:*
- ***Says*** *is what the description claims.*
- ***Left out / not borne out*** *compares it with the diff.*
- ***Risk / fail / finding named?*** *covers failed checks, review findings and irreversible steps.*
- ***Edited?*** *asks whether the description was changed after later commits.*
- ***Opening alone correct?*** *asks whether the opening paragraph alone gives a correct account.*
- ***Relation*** *is to other PRs or to the milestone it names.*
- ***Status*** *is checked (✓) or could not be determined (?).*

| PR | Says | Left out / not borne out | Risk / fail / finding named? | Edited? | Opening alone correct? | Relation | Status |
|---|---|---|---|---|---|---|---|
| 5 | PACKS.toml: the Researcher gets its own previous memo, the Source checker its own previous report | Nothing; the diff matches "2 lines plus comments" | **[R2]** The head d7d0749 has 4 runs. `governance` passed (started 11:10:52, before the PR opened at 11:10:58). A second `governance` failed (11:11:05–11:11:13). The body says "`check_all.sh . origin/main` passed" and doesn't name the failed run. It names R3 | Cannot tell | Not required on this date | Names Q-001/2/4; right | Diff ✓; review ? |
| 18 | sources.md widened to any vendor's own pages | Nothing | All checks pass. The reviewer comment came back as a summary only | Cannot tell | Not required | Names #17; right | ✓; review ? |
| 31 | Records 6 move-to-Build values | **Not borne out:** drops "if O5's fallback is needed". **Left out:** "any API key needs the owner's ruling first" | The `decide` run failed on head 98cfcb4; not named | Cannot tell | Not required | Not checked | ✓ |
| 44 | M2; "5 Builder commits"; 158/158 tests "on c514b51" | **[R2]** The PR has 8 commits. After c514b51 come 6206ebd "S-001 M2: fix the Reviewer's PR #44 findings (B1, N1-N6)" (13:00:59), 1e17757 "Create reviewer.md" and 2681cce "Create owner.md". The B1 fix is not mentioned | The round-1 blocking finding B1 is not named | **Not updated after later commits** (estimate, B) | Bold inline lead; correct as of c514b51 | M2; right | Diff partial ? |
| 57 | Ledger L-0007 | Nothing | All pass; says reversible | Cannot tell | Yes | — | ✓ |
| 70 | v3.3.2 sync; "the governance check stays red, and that is expected" | Nothing seen against the file list | **[R2]** **Names the red check.** Two `governance` runs failed on head c498a4e. It was merged by shumpmaster at 15:03:22. reviews/70 holds only reviewer.md, committed in 42c831c at 15:15:48 | Cannot tell | Yes, though it also opens "Nothing failed or was skipped" | Names #67; not checked | ✓ |
| 83 | Fixes #81's verdict file | Matches | All pass; names its own mistake | Cannot tell | Yes | #81, #82; right | ✓ |
| 96 | Records 3 answers | Matches | All pass | Cannot tell | Yes | M3A; right | ✓ |
| 109 | Files one question | Matches | All pass | Cannot tell | Yes | Right | ✓ |
| 122 | Files two M3A questions | Matches | All pass | Cannot tell | Yes | Right | ✓ |
| 135 | Job PRs "being recorded"; R3; 769 tests | Carries the S-001 spec amendment and notify changes; the spec change is cited only as a source | **Opening: "Nothing failed or was skipped",** while its commits read "FAIL on A, E" and "FAIL on A (forged log lines)" | Cannot tell | No, if failed reviews count | Right | Diff partial ? |
| 148 | Design reviewer set up | Diff only partly read | Names the red check. Probable failed rounds not named (estimate, C) | Cannot tell | ? | — | ? |
| 161 | Marks M3A reached; opens "Nothing failed or was skipped" | Matches | **[R2]** Head 612cf90 has 7 runs. One `governance` run failed (14:32:30–14:35:42, starting 13 s before the PR opened at 14:32:43). A second `governance` run passed (14:32:49–14:36:57). Not named | Cannot tell | Yes as to final checks; no if every run counts | M3A; right | ✓ |
| 175 | j22.js becomes R3; replaces #174 | Matches | "Nothing failed or was skipped" while the diff holds round-1 and round-2 **Verdict: FAIL** reports. **[R2]** The reviewer's confirmation calls the sentence "accurate, apart from the verdicts that aren't recorded yet" | **Yes:** the confirmation says finding 2 was fixed in the PR's text | Yes under the checks reading (§4) | MD3; right | ✓ |
| 187 | Stage 7; "passed after fixes" | Diff partial | Names the reviewer's gap (summary only) | Cannot tell | Yes | MD3 | ? |
| 201 | Files two questions | Matches | All pass | Cannot tell | Yes | Right | ✓ |
| 213 | Step 8: tests only | Reviewer: "no src/ file changed" | Leaves out note 1 | Cannot tell | Yes | M3D | ✓ (diff partial) |
| 226 | "One thing failed and was fixed" | Spec +7/−1 flagged in Tasks | Names the round-1 FAIL | Edited within seconds of opening, not after commits | Yes | M3E | Diff partial ? |
| 239 | "Nine locked cases rewritten, each in its own commit, two of them forced and named (AC80, AC89, AC91)" | **[R2]** The spec change is not named as a change. The HTML commit list (41 of 41) shows **10** titles beginning "Rewrite": e0015bd, 585cb35, ac47f6d, e25c44a, b9929fb, 50b89e0, a8d64b9, 69ec664, f554f7a, and 16e1389 "Rewrite round 2's locked case …". 16e1389 rewrites a case locked within this PR, so "nine" may deliberately exclude it (estimate, C). No "[REWRITE]" tag exists; round 1's wording was wrong | Heap-limit risk: commits d262a10, 102b051 and 7aa633d deal with it, and the body names "the test command" change. The reviewer record came back as a summary only | Cannot tell | Yes | M3E | Diff partial ? |
| 252 | 3 acceptances | Matches | All pass | Cannot tell | Yes | "Milestone: M3B" but it marks M3E, M3G and M3B; partly right | ✓ |

## 3. Counts and the rule used for each

| Kind | Rule | Count (of 20) | PRs |
|---|---|---|---|
| Required section left out | Required on that date (§1 dates) and absent | **0** (B) | — |
| Statement about the change contradicted by the diff | A claim the diff contradicts, or a dropped condition | **1** | #31 |
| Count possibly one short | The stated count differs from the commit titles | **1 possible** (C) | #239 |
| "Nothing failed" while the PR records a FAIL review verdict | Holds only if reviews count as "failed" (§4) | **2** (+1 probable) | #135, #175; probable #148 |
| "Nothing failed" while a check run on the head failed, the description silent | Holds under the checks reading | **[R2] 1** | #161 (#70 names its red check) |
| Stale after later commits | Commits after the one the description cites | **1** | #44 |
| Content change left out | A changed file outside reviews/ and digests, not named as a change | **3** | #31, #135, #239 |
| Failed check run on the head not named | Any run on the head sha with conclusion failure, not mentioned | **3** | #5, #31, #161 (in #5 and #161, a later run passed) |
| Review finding not named | Missing from the description | **2** | #44, #213 |
| Milestone line partly wrong | — | **1** | #252 |
| Edited after later commits | Shown by the pages | yes 1 (#175); not updated 1 (#44); cannot tell 18 | — |

**Worked examples:**
1. **#31, dropped condition** (as in round 1; confirmed). The body's "Redirect: a permanent redirect from the old address meets V4" against the diff's "if O5's fallback is needed, a permanent redirect … counts as meeting V4".
2. **#135, "Nothing failed" against failed reviews.** The opening sentence against commits 875894b and 2bbeb57 ("FAIL on A, E" and "FAIL on A (forged log lines)").
3. **#44, stale.** "on c514b51 … 158 of 158 tests" against the later commit 6206ebd "fix the Reviewer's PR #44 findings (B1, N1-N6)".

## 4. Patterns and opinions

- **[R2, corrected] What "nothing failed" covers.**
  - **#175's reviewer tied the sentence to CI checks every time** *(fact, B: #175 diff, reviews/cs24)*:
    - Round 1: "'Nothing failed or was skipped': true. check_all exited 0, every line read PASS, and there were no FAIL or SKIP lines". That review's own verdict was FAIL, but the FAIL "rests only on the owner-facing 'What this means for you' paragraph".
    - Round 2, finding 1: "the branch's checks fail, so 'Nothing failed or was skipped …' is false".
    - Confirmation: "Finding 1 was my mistake: I judged the branch head, but CI judges the pull request's merge ref", and the sentence "is accurate, apart from the verdicts that aren't recorded yet".
  - **#81's record** *(fact, B: #83 diff)*: it lists "R2 finding 1: the opening said 'Nothing failed or was skipped.'" without stating why that was false. "R3 finding 1: the opening named only the first failed review" shows that the reviewer expected failed reviews to be mentioned.
  - That #81's reviewer counted failed reviews as "failed" is therefore an **estimate, C**, not a fact.
  - *Opinion:* the sentence is read most naturally as being about checks. An owner reading it can still assume no review failed, and in #135 and #175 reviews had failed. A summary for the owner should state checks and review verdicts separately.
- **Reviewers check description wording** *(fact, B)*:
  - #81: "all six blocking findings are about the description".
  - #175: round 1's FAIL rests only on the "What this means for you" paragraph, and round 2's finding 2 ("smaller" is inaccurate) is about wording.
  - #175's round-2 finding 1 was about checks and was withdrawn.
- **Check runs triggered by the push can fail before or just after a PR opens and be followed by a pass** (#5, #161). *Opinion:* "a failed check run on the head" overstates what the author knew. The better test is the latest run of each check.
- **Overall** *(opinion)*: 11 of 12 fully read diffs matched their descriptions. The author's text is not a sole source for:
  - whether anything failed;
  - spec changes bundled into build PRs;
  - anything after the commit it names.

## 5. Proposed library entries (revised)

- **F-pr-desc-01a** (fact, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** in Service-Desk PR #31, the description states "Redirect: a permanent redirect from the old address meets V4". The diff reads "if O5's fallback is needed, a permanent redirect … counts as meeting V4". The description also omits "any API key needs the owner's ruling first". The head 98cfcb4 has a failed `decide` run that the description doesn't mention.
  - **Sources:** `/pull/31.diff`; `pulls/31`; `commits/98cfcb4…/check-runs`.
- **F-pr-desc-01b** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **Claim:** the heads of Service-Desk PRs #5 and #161 each have one failed `governance` run and one passing `governance` run. Neither description mentions the failure. #5's says "`check_all.sh . origin/main` passed". #161's opens "Nothing failed or was skipped in this pull request".
  - **Sources:** `commits/d7d0749f…/check-runs`; `commits/612cf90b…/check-runs`; `pulls/5`, `pulls/161`, `github.com/…/pull/5`.
- **F-pr-desc-01c** (estimate, B; topics: pull-requests, accuracy)
  - **Claim:** in 20 merged Service-Desk PRs (created 2026-10-01 to merged 2026-10-29), none left out a section required on its date. This rests on rule dates inferred from adoption PRs #65, #79 and #222.
  - **Sources:** `pulls/N` for the sample; `pulls/65`, `/79`, `/222`.
  - **Status:** submitted as unconfirmed; it may be held.
- **F-pr-desc-02 [R2, narrowed]** (fact, B; topics: pull-requests, change-reporting; shelf life 6 months)
  - **Claim:** Service-Desk's Reviewer has failed PRs on description wording:
    - #81: all six rounds' blocking findings are "about the description".
    - #175: round 1's FAIL "rests only on the owner-facing 'What this means for you' paragraph", and round 2's finding 2 calls "smaller" inaccurate.
    - #175's round-2 finding 1 was about checks, and the reviewer withdrew it as "my mistake".
  - **Sources:** `/pull/83.diff` (removed lines of reviews/81/reviewer.md); `/pull/175.diff` (reviews/cs24/_review-round1-verbatim.md, _review-round2-verbatim.md, _review-confirmation-verbatim.md). #174's page was not read; round 1 names "the PR body (#174)" only as quoted in #175's diff.
- **F-gh-api-01a** (fact, B; topics: github; shelf life 12 months)
  - **Claim:** the unauthenticated GitHub REST core limit is 60 requests an hour.
  - **Sources:** `api.github.com/rate_limit` (confirmed in round 1).
- **F-gh-api-01b [R2, re-sourced]** (fact, B; topics: github; shelf life 12 months)
  - **Claim:** the REST pull-request JSON has no field giving a description's edit history. The `pulls/252` response has 48 top-level keys, none containing "edit"; the nearest is `updated_at`. GitHub's GraphQL PullRequest object documents `lastEditedAt` ("The moment the editor made the last edit.") and `userContentEdits` ("A list of edits to this content.").
  - **Sources:** `api.github.com/repos/shumpmaster/Service-Desk/pulls/252`; `docs.github.com/en/graphql/reference/pulls`.
  - **Caveat:** the first half is an observation of one response, not a docs statement.
- **P-summary-failed-01 [R2, evidence revised]** (pattern; topics: summaries, accuracy)
  - **Pattern:** an owner-facing change summary states the latest result of each check and the review verdicts separately ("checks: …; reviews: N rounds, M failed"), never a bare "nothing failed".
  - **Evidence:**
    - #135 and #175: the sentence was true of checks while reviews had failed.
    - #161: the sentence stood beside a failed earlier run.
    - #175's reviewer read it as being about checks.
- **P-summary-asof-01** (pattern; topics: change-reporting)
  - **Pattern:** a summary names the head commit it describes.
  - **Evidence:** #44's commits 6206ebd, 1e17757 and 2681cce all come after c514b51, the commit the body names.

## 6. Not confirmed, carried forward

- The "0 missing sections" count (01c) and the rule dates are B/C; the checker has not opened them.
- #148's probable failed review rounds (C).
- Six partial diffs, and review records seen only as summaries (#18, #187, #239).

---

## Contract

1. **What I changed:**
   - **F-pr-desc-02:** narrowed to #81, #175's round 1 and #175's round-2 finding 2. The citation to #174 is dropped and the withdrawn round-2 finding 1 is recorded.
   - **§4, "nothing failed":** corrected. #175's reviewer read the sentence as being about checks every time; that #81's reviewer counted reviews is now an estimate (C).
   - **F-pr-desc-01:** split into 01a (#31), 01b (#5 and #161, with run timings showing a later pass) and 01c (the section count, marked unconfirmed). The date range is now sourced.
   - **F-gh-api-01:** split. The edit-history half now has the observed REST key list and GraphQL docs as its sources.
   - **#239:** the "[REWRITE]" tag is gone and the count is downgraded to an estimate, with all 10 shas listed.
   - **#44 and #70:** commit and check evidence added, so the checker can look these up directly.
   - **#5's body:** re-read from the HTML page, because the JSON fetch came back paraphrased.
2. **Why:** the source check failed F-pr-desc-02 as overstated, F-pr-desc-01 as unverified with an unsourced date range, and F-gh-api-01's second half as unsourced. It also flagged the §4 reading of #175 as contradicted, and #44, #239 and #70 as unopened.
3. **What I verified** (about 17 fetches):
   - **#175 diff:** three review records quoted, including that round-2 finding 1 was withdrawn as the reviewer's mistake.
   - **#83 diff:** #81's findings quoted.
   - **#5:** `pulls/5`, the HTML page and its check runs (4 runs, 1 `governance` failure).
   - **#161:** `pulls/161` and its check runs (7 runs, 1 `governance` failure).
   - **#44:** the commit list (8 commits).
   - **#239:** API and HTML commit lists (41 commits, 10 titles beginning "Rewrite") and the body sentence.
   - **#70:** the body, merge time and merger, check runs (2 `governance` failures), the reviews/70 listing (reviewer.md only) and commit 42c831c.
   - **#252:** the key list (48 keys, none containing "edit").
   - **GitHub docs:** the GraphQL pulls reference (lastEditedAt and userContentEdits).
4. **What is undone:**
   - The 20 bodies were not re-read to re-confirm the 0-missing-sections count.
   - The six partial diffs are still partial.
   - Reviews for #83–#252 and the review records that came back as summaries are unread.
   - #148 is unresolved.
5. **Needed outside my lane:**
   - An authenticated fetch (`gh` or GraphQL `userContentEdits`) to see edit histories and read the large diffs in full.
   - The model repo's version dates, to confirm when each rule binds.
   - Recording this memo: the Orchestrator.
6. **Open questions:**
   - Which reading of "nothing failed" do the rules intend: checks only, or reviews too?
   - Should a failed check run followed by a passing run of the same check count as a failure the description must name?
   - Does "Nine locked cases" in #239 deliberately leave out 16e1389?
   - Why did #70 merge with no owner.md?