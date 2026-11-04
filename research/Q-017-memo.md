I've revised the memo as round 6, below. It replaces round 5 in full. The checker could not see commit 16e1389 because its fetch of #239's commit list stopped after 22 entries, while 16e1389 is entry 27. Fetched as five pages of ten, the full list shows it. Two other changes: I fixed the #5 quote and dates, and I found that #161's description says "Nothing failed or was skipped" while one of its runs failed.

---

# Memo: Q-017, round 6. How accurate and complete are Service-Desk's pull-request descriptions? (2026-11-04)

*Researcher memo for the Source checker. It replaces round 5 in full. Each statement is marked **fact**, **estimate** or **opinion** and given a grade:*
- ***A:*** *read word for word from the primary page.*
- ***B:*** *read from the primary page through the fetch tool's extraction (a model sits in between).*
- ***C:*** *inferred.*

*Changes from round 5 are marked **[R6]**.*

**[R6] Grades:** I have no shell, so every page went through the fetch tool. Nothing in this memo can be grade A. Round 5 gave "A/B" to the #135 and #175 findings; that is lowered to B.

**[R6] Independence:** every fact here is about one GitHub record, so each has only one primary source. Opening it again, or opening a second view of it, checks the extraction, not the record. That is the best this lane can supply (see §5 of the contract).

## 0. Bottom line

- **No required section is missing.** Rules bound 15 of the 20 sampled PRs (#70 onward), and all 15 bodies carry the sections required on their dates. *(The headings are fact, B. "Required on its date" is an estimate, C, because the rule dates are inferred.)*
- **#31's body drops a condition from a ruling it records.** *(fact, B)*
  - Body, re-read in round 6: "Redirect: a permanent redirect from the old address meets V4. This answers the Critic's weak point 1."
  - Diff: "if O5's fallback is needed, a permanent redirect from the old address counts as meeting V4." The diff was not re-opened this round.
- **#239's "Nine locked cases rewritten … two of them forced" matches round 1 only.** The PR has ten "Rewrite …" commits; nine come before the round-2 spec, and the tenth is the round-3 rewrite 16e1389. *(fact, B, for the commits; estimate, C, for "round 1 only")*
  - **[R6]** 16e1389 has now been read in two views: as its own commit record, and as entry 27 of 41 on the paginated commit list.
- **#44's body says "It is 5 Builder commits (`Spec: S-001`)" and "Checked by the orchestrator on c514b51".** The PR has six `S-001 M2` commits. The sixth, 6206ebd, was committed at 13:00:59Z, after the PR opened at 12:36:38Z. *(fact, B; read twice)*
- **Failed runs on the head commit that the description doesn't name: #5, #31 and #161.** *(fact, B; `runs?head_sha=` re-read in round 6 for all three)*
- **[R6] #161's body says "Nothing failed or was skipped in this pull request."** The push `governance` run on its head commit failed. *(fact, B; the quote comes from a single read)*
- **"Nothing failed or was skipped" also sits beside FAIL review verdicts in #135 and #175.** *(fact, B; not re-opened)*
- Six diffs remain only partly read.

## 1. The sample and how it was read

- **Open pull requests at 2026-11-02 12:00 UTC: none** *(fact, B)*. So the sample is **entirely merged**.
- **Two numbers were swapped:** #174 and #200 were closed without merging, so #175 and #201 replace them.
- **Final sample:** #5, 18, 31, 44, 57, 70, 83, 96, 109, 122, 135, 148, 161, 175, 187, 201, 213, 226, 239, 252.
- **When each rule binds.** The quotes are fact (B). Reading the merge dates as binding dates is an estimate (C).

| Rule | Adopted in | Merged (UTC) | Required on |
|---|---|---|---|
| "What this means for you" | #65 | 2026-10-13T23:51:13Z | #70 and later |
| Milestone line, Context, Why | #79 | 2026-10-17T02:45:39Z | #83 and later |
| Tasks | #222 | 2026-10-25T00:55:24Z | #226 and later |

- **Diffs read in full:** #5, 18, 31, 57, 83, 96, 109, 122, 161, 175, 201, 252.
- **Diffs read only in part:** #44, 70, 135, 148, 187, 213, 226, 239.
- **Method notes:**
  - **[R6] Use pages of 10.** With `per_page=15`, page 2 (entries 16–30) has twice come back cut off after entry 22 (d968b1e): once in round 4 and once in the checker's round-5 check.
    - With `per_page=10`, pages 1–5 came back complete: 10 + 10 + 10 + 10 + 1 = 41 entries.
    - 16e1389 is entry 27, which is page 3, item 7.
  - The extraction's own counts are unreliable, so every count here is my count of the shas it listed.
  - **[R6]** Yes/no searches through the extraction are unreliable too. Asked to search #239's body, it said "locked case: none found" while quoting the line "Nine locked cases rewritten…".
  - `actions/runs?head_sha=` needs the full sha. **[R6]** Re-confirmed: the 8-character `98cfcb45` gave total_count 0, and the full sha gave 3.

## 2. Per-PR record

Rows not listed here are unchanged from rounds 4 and 5.

| PR | Record |
|---|---|
| 5 | **[R6] Dates added; quote corrected.** PR created 2026-10-01T11:10:58Z and merged 2026-10-01T11:28:14Z. Head `d7d0749f8bc7d959e35ed3af94bb635cce31211f`. `runs?head_sha=` gives total_count 2: run 36853760813, `governance`, pull_request, **failure**, 2026-10-01T11:11:02–11:11:26Z; and run 36853738999, `governance`, push, success, 11:10:49–11:11:09Z. Both on branch `build/chief-of-staff/pack-feedback`. The body says, word for word as extracted: "`governance/checks/check_all.sh . origin/main` passed; `surface_guard` OK." The failed run is not named. ✓ |
| 31 | **[R6] Re-read.** Head `98cfcb45e9db477050f5c1fb70ac089072831ef8`. Created 2026-10-05T17:14:42Z; merged 17:17:08Z. Runs: `orchestrator` push 37346950008 **failure** (17:14:36–17:14:51Z); `governance` push 37346949997 success; `governance` pull_request 37346969605 success (17:14:46–17:15:08Z). ✓ |
| 44 | **[R6] Re-read.** Created 2026-10-08T12:36:38Z. Eight commits: b20eb56, ce172bc, 2bf1543, 6752116, c514b51 (12:34:28Z), 6206ebd ("S-001 M2: fix the Reviewer's PR #44 findings (B1, N1-N6)", 13:00:59Z), 1e17757 ("Create reviewer.md") and 2681cce ("Create owner.md"). Body: "It is 5 Builder commits (`Spec: S-001`)…"; "Checked by the orchestrator on c514b51: … 158 of 158 tests passing". *Opinion:* "5" may count commits carrying a `Spec: S-001` trailer, and I did not read the trailers. **Edited?** Cannot tell. **Diff:** partial. |
| 161 | **[R6] Re-read.** Head `612cf90bbc1ec8cd94a65d5f3d67f71424e1599d`. Created 2026-10-20T14:32:43Z; merged 14:43:33Z. Five runs: `governance` push 39440152795 **failure** (14:32:27–14:35:51Z); pull_request `governance` 39440202782, `pr-body` 39440202552 and `desk-build` 39440202589 all success; `desk-notify-ready` 39441862109 success, started 14:43:36Z, which is after the merge. **Body:** "Nothing failed or was skipped in this pull request." *(B, single read)* ✓ |
| 239 | **[R6] Commits read in full** (pages of 10; §3, example 3). Created 2026-10-25T19:40:48Z. **Body mentions 16e1389 or round 3 elsewhere?** Could not be determined: the body search gave contradictory results (§1). **Edited:** yes, timing unknown. **Diff:** partial. |

## 3. Counts and the rule used for each

| Kind | Rule | Count (of 20) | PRs |
|---|---|---|---|
| Required section left out | Required on that date and absent from the body | **0** of 15 (estimate; dates C) | — |
| Claim the diff contradicts | A claim the diff contradicts, or a condition dropped | **1** | #31 |
| Stated count lower than the matching commits | A number in the current body below the count of same-kind commits on the PR | **2** | #44 (5 vs 6); #239 (9 vs 10) |
| "Nothing failed" beside a recorded FAIL review verdict | Holds only if reviews count | **2** (+1 probable) | #135, #175; probable #148 |
| **[R6]** "Nothing failed" beside a failed run on the head | The body says nothing failed, and any run on the head commit concluded failure | **1** | #161 |
| Latest pull_request-triggered check failed, not named | The latest run started by the pull_request event concluded failure | **1** | #5 |
| Any run on the head failed, not named | Any run, any event | **3** | #5, #31, #161 |
| Review finding not named | Missing from the description | **2** | #44, #213 |
| Milestone line partly wrong | — | **1** | #252 |
| Description edited | "• edited" seen on the HTML page | **4 seen**; the other 16 are "not seen", not "no" | #148, #175, #226, #239 |

**Worked examples:**

1. **#31, dropped condition.**
   - Body: "Redirect: a permanent redirect from the old address meets V4."
   - Diff: "if O5's fallback is needed, a permanent redirect from the old address counts as meeting V4."
2. **#5, latest PR check failed, not named.**
   - Body: "`governance/checks/check_all.sh . origin/main` passed; `surface_guard` OK."
   - Run 36853760813 (pull_request, failure, ended 2026-10-01T11:11:26Z) is one of only two runs on d7d0749. The PR merged at 2026-10-01T11:28:14Z.
3. **#239, count covers round 1 only.**
   - **Round-1 rewrites, all before the round-2 spec cc76993 (15:23:47Z): 9.**
     - Page 1: e0015bd, 585cb35, ac47f6d.
     - Page 2: e25c44a, b9929fb, 50b89e0, a8d64b9, 69ec664, f554f7a. All are timed 13:56:46–13:58:57Z.
   - **Forced: 2.** 69ec664 and f554f7a end "(forced; not named in G8d's row)".
   - **[R6] Round-3 rewrite: 16e1389e7640407ca7601c0fb7c1090807399447.**
     - It is page 3, item 7, between 8446e28 (17:12:51Z, also its parent) and 3b582a3 (17:15:34Z).
     - Its title reads "Rewrite round 2's locked case "a project the desk can't draw whose read fails keeps its can't-read words"".
     - Its message opens "The one locked case G8d's round 3 forces (tests/desk/ac91-g8d.test.mjs; …; AC89 (a))" and contains "As G8d's row names it".
     - Author and committer dates are both 2026-10-25T17:13:08Z. It changes 1 file (+6/−1).
   - Pages 4 and 5 contain no "Rewrite" commit. Two commits come after the PR was created: de1969b (19:41:01Z) and be929af "Create owner.md" (20:03:29Z).
   - *Estimate (C):* the line was written in round 1 and not updated when round 3 added a tenth rewrite.
   - *Opinion:* whether "two of them forced and named" should have become three is not settled by the wording, so that is not claimed.

## 4. Patterns and opinions

These are unchanged from round 5, plus two additions:

- **[R6]** *(fact, B)*: a list page of 15 was cut off at entry 22 twice, while pages of 10 came back whole. Use small pages, and check that the page sizes add up to the stated total.
- **[R6]** *(fact, B)*: the extraction's yes/no searches can contradict its own quotes. Absence findings made through it should be graded "could not be determined".

## 5. Proposed library entries

- **F-pr-desc-01a** (fact, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** #31's body states the redirect ruling without the condition "if O5's fallback is needed" that its diff carries. The `orchestrator` push run 37346950008 on head 98cfcb45… concluded failure.
  - **Sources:** `pulls/31`, read in rounds 5 and 6; the #31 `.diff`; `actions/runs?head_sha=98cfcb45e9db477050f5c1fb70ac089072831ef8`, read in rounds 5 and 6.
- **F-pr-desc-01b** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **Claim:** on #5 (2026-10-01) and #161 (2026-10-20), a `governance` run on the head commit failed, and the body does not name it.
    - On #5 it was the pull_request run.
    - On #161 it was the push run, and **[R6]** #161's body says "Nothing failed or was skipped in this pull request."
  - **Sources:** `pulls/5` and `pulls/161`; `actions/runs?head_sha=` with each full sha (read in rounds 5 and 6); the run ids in §2.
- **F-pr-desc-01c** (estimate, C for the dates; topics: pull-requests, accuracy; shelf life 3 months): unchanged.
- **F-pr-desc-01d** (fact, B, for the commits and the quote; estimate, C, for "round 1 only")
  - **Claim:** as in round 5, with 16e1389's position given: page 3, item 7, of `pulls/239/commits?per_page=10`.
  - **Sources:** `pulls/239`; `pulls/239/commits?per_page=10&page=1..5`; `commits/16e1389`, read in rounds 5 and 6; HTML `pull/239/commits`.
  - **For the checker:** fetch with `per_page=10`, not 15.
- **F-pr-desc-01e** (fact, B): unchanged. "Edited" markers on #148, #175, #226 and #239.
- **F-pr-desc-01f** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **Claim:** as in round 5, re-read in round 6. The quote now includes "(`Spec: S-001`)".
  - **Sources:** `pulls/44`; `pulls/44/commits`.
- **F-pr-desc-02, F-gh-api-01a, F-gh-api-01b:** unchanged and not re-opened.
- **Patterns:**
  - **P-summary-failed-01:** evidence now adds #161, a "nothing failed" sentence beside a failed run.
  - **P-summary-asof-01:** unchanged (#44, #239).
  - **P-fetch-two-views-01:** evidence restated as truncation at page size 15, miscounted tallies, and contradictory absence searches. **[R6]** These are the researcher's and the checker's own observations; the checker may hold this pattern until they are seen elsewhere.

## 6. Not confirmed, carried forward

- Rule binding dates (C).
- Six partial diffs.
- #148's probable failed review rounds.
- Review records seen only as summaries (#18, #187).
- #239's review r2 and design r3 files.
- Edit timing, and the 16 descriptions with no marker seen.
- Whether the #239 body mentions 16e1389 or round 3.
- What "two of them forced and named" means.
- What #44's "5 Builder commits (`Spec: S-001`)" counts.
- Whether #31's `orchestrator` failure is designed.
- Whether checks were required before merging.
- The #135 and #175 findings, which have not been re-opened since round 4.

---

## Contract

**1. What I changed**
- **01d:** 16e1389 is now read in two views, with its full sha, its place in the list (entry 27 of 41) and its parent, 8446e28. All five commit pages are accounted for.
- **#5:** the quote now carries its full `governance/checks/` path, and 2026-10-01 is added to the times. All times now carry dates.
- **#161:** its body quote, "Nothing failed or was skipped in this pull request.", is added, with a new count row and a new piece of pattern evidence.
- **#44:** the quote now includes "(`Spec: S-001`)", and one possible reading of "5" is noted.
- **Grades:** the "A/B" grades are lowered to B.
- **Method:** two new method notes, one on page size and one on unreliable yes/no searches.

**2. Why**
- **Checker's fail 1, 01d:** its fetch cut off at entry 22 (d968b1e), and 16e1389 is entry 27.
- **Checker's note on #5:** the quote dropped its path, and the date was missing.
- **Checker's fail 2, entries opened only once:** 01a, 01b and 01f have now been read a second time.

**3. What I verified** (14 fetches, all through the fetch tool, so grade B; no shell)
- **`commits/16e1389`:** full sha; message; dates 17:13:08Z; 1 file, +6/−1; parent 8446e28.
- **`pulls/239/commits?per_page=10`, pages 1–5:** 10/10/10/10/1 entries. Ten "Rewrite" commits: nine on pages 1–2 before cc76993, and 16e1389 on page 3.
- **`pulls/239` body search:** returned contradictory results, so this is left as could not be determined.
- **`pulls/5` and its `runs?head_sha=`:** results match §2.
- **`pulls/31` and its `runs?head_sha=`:** 3 runs with the full sha. The short sha gave 0.
- **`pulls/161` and its `runs?head_sha=`:** 5 runs.
- **`pulls/44` and `pulls/44/commits`:** results match §2.

**4. What is undone**
- Six partial diffs, #148, #239's r2 and design r3 files, and edit timing.
- 01c's 15 bodies have not had a second read.
- The #31 diff, #135, #175, #213 and #252 were not re-opened.
- The #161 quote comes from one read.

**5. Needed outside my lane**
- **A ruling on the evidence standard (Chief of Staff, owner).** Facts about a single GitHub record cannot have two independent sources. Either the standard for these is "the primary record, opened twice", or no entry here can pass.
- **Authenticated `gh` or GraphQL, or a shell, without extraction.** This would give grade A, raw bodies, `userContentEdits` and branch protection.
- **The model repo's version dates.**
- **Recording this memo** (the Orchestrator).
- **Filing the entries that pass** (the Source checker).

**6. Open questions**
- What does "two of them forced and named (AC80, AC89, AC91)" mean?
- What does #44's "5 Builder commits (`Spec: S-001`)" count?
- Does "nothing failed" cover reviews and push runs?
- Which run counts as "the check"?
- Were checks required before merging?
- Is the `orchestrator` push failure on #31 a designed stop?