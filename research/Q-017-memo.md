I've revised the memo as round 5, below. It replaces round 4 in full. The main fix is to #239. The commit list is now confirmed in two views, and both show 10 "Rewrite" commits. I withdrew the claim that the "forced" count was short, because the wording can be read more than one way. The 41-commit list behind the round-1 numbers was read by me, through the fetch tool, from three API pages and the HTML commit list.

---

# Memo: Q-017, round 5. How accurate and complete are Service-Desk's pull-request descriptions? (2026-11-04)

*Researcher memo for the Source checker. It replaces round 4 in full. Each statement is marked **fact**, **estimate** or **opinion** and given a grade:*
- ***A:*** *read word for word from the primary page.*
- ***B:*** *read from the primary page through the fetch tool's extraction (a model sits in between).*
- ***C:*** *inferred.*

*Two views of one GitHub record are not two independent sources. They do guard against one bad extraction. Changes from round 4 are marked **[R5]**.*

## 0. Bottom line

- **No required section is missing.** Rules bound 15 of the 20 sampled PRs (#70 onward), and all 15 bodies carry the sections required on their dates. *(The headings are fact, B. "Required on its date" is an estimate, because the rule dates are inferred from the PRs that adopted each rule (C).)*
- **One sampled PR makes a claim its diff contradicts.** #31's body drops a condition from a ruling it records. *(fact, B; the checker confirmed it in round 4)*
- **[R5] #239's "Nine locked cases rewritten" matches round 1 only.**
  - The PR has ten "Rewrite …" commits *(fact, B, two views agree on every sha)*.
  - Nine came before the round-2 spec. Two of those nine call themselves "(forced; not named in G8d's row)". That matches "nine … two of them forced" exactly.
  - The tenth, 16e1389, is a round-3 rewrite committed at 17:13:08Z, before the PR opened at 19:40:48Z.
  - So the count line leaves out round 3's rewrite *(estimate, B/C)*.
  - The round-4 claim that the "forced" count was short by one is **withdrawn**.
  - Whether the body mentions 16e1389 anywhere else could not be determined: two views disagree.
- **[R5] #44's body says "5 Builder commits" and checks "on c514b51".** The PR has six `S-001 M2` commits. The sixth, 6206ebd ("fix the Reviewer's PR #44 findings (B1, N1-N6)"), was committed at 13:00:59Z, after the PR opened at 12:36:38Z. *(fact, B)*
  - Whether the description was ever edited is now an estimate, not a fact. The edit-marker reading is an absence read through extraction, and the re-check returned the PR title rather than the post header.
- **Failed runs on the head commit that the description doesn't name: #5, #31 and #161.** *(fact, B; re-opened in round 5 as single-run records and as `runs?head_sha=` lists)*
  - **#5:** the pull_request `governance` run failed, and no run came after it.
  - **#31:** the `orchestrator` push run failed. Both `governance` runs passed.
  - **#161:** the push `governance` run failed. The pull_request `governance` run and three other pull_request workflows passed.
- **"Nothing failed or was skipped" is a loose sentence.** #135 and #175 say it while their commits or diffs record FAIL review verdicts. *(fact, A/B; not re-opened in round 5)*
- Six diffs remain only partly read.

## 1. The sample and how it was read

- **Open pull requests at 2026-11-02 12:00 UTC: none** *(fact, B)*. So the sample is **entirely merged**.
- **Two numbers were swapped:** #174 and #200 were closed without merging, so #175 and #201 replace them.
- **Final sample:** #5, 18, 31, 44, 57, 70, 83, 96, 109, 122, 135, 148, 161, 175, 187, 201, 213, 226, 239, 252.
- **When each rule binds.** The quotes are fact (B). Reading the merge dates as binding dates is an estimate (C), because the model repo is private.

| Rule | Adopted in | Merged (UTC) | Required on |
|---|---|---|---|
| "What this means for you" | #65 | 2026-10-13T23:51:13Z | #70 and later |
| Milestone line, Context, Why | #79 | 2026-10-17T02:45:39Z | #83 and later |
| Tasks | #222 | 2026-10-25T00:55:24Z | #226 and later |

- **Section check:** unchanged from round 4 (same table). The bodies were read from the `pulls/N` JSON (B). #83's milestone line came from the HTML page.
- **Diffs read in full:** #5, 18, 31, 57, 83, 96, 109, 122, 161, 175, 201, 252.
- **Diffs read only in part:** #44, 70, 135, 148, 187, 213, 226, 239.
- **[R5] Method notes:**
  - **The extraction's own tallies are unreliable, but its lists were not.** For #239's commits it reported "6" while listing 10 "Rewrite" titles, "16 entries" while listing 15, and "10 entries" while listing 11. Every count in this memo is my own count of the listed shas, not the tool's figure. The checker's "six" probably came from such a tally.
  - **Withdrawn:** round 4's explanation that the API list was "cut off at the 22nd entry".
  - **Pagination fixes the API view.** `pulls/239/commits?per_page=15` pages 1–3 list 15 + 15 + 11 = 41 shas, in the same order as the HTML list.
  - **Times now come from `run_started_at` and `updated_at`.** Round 4 gave job-level times. The run-level times below differ from those by a few seconds.
  - **`actions/runs?head_sha=` needs the full sha.**

## 2. Per-PR record

Rows not listed here are unchanged from round 4.

| PR | Change in round 5 |
|---|---|
| 5 | **[R5] Re-opened.** Run 36853760813: `governance`, event pull_request, **failure**, head d7d0749…, branch `build/chief-of-staff/pack-feedback`, 11:11:02–11:11:26Z. Run 36853738999: `governance`, push, success, 11:10:49–11:11:09Z. `runs?head_sha=d7d0749f8bc7…` gives total_count 2 (these two). PR created 11:10:58Z and merged 11:28:14Z. The body says "`governance/checks/check_all.sh . origin/main` passed; `surface_guard` OK." The failed run is not named. ✓ |
| 31 | **[R5] Re-opened.** `runs?head_sha=98cfcb45…` gives total_count 3: `orchestrator` push 37346950008 **failure** (17:14:36–17:14:51Z); `governance` push 37346949997 success; `governance` pull_request 37346969605 success. PR created 17:14:42Z and merged 17:17:08Z. The extraction found no "orchestrator", "decide" or "fail" in the body (an absence read, B). ✓ |
| 44 | **[R5]** Eight commits, of which six are `S-001 M2` commits (b20eb56, ce172bc, 2bf1543, 6752116, c514b51, 6206ebd). The body says "It is 5 Builder commits" and "Checked by the orchestrator on c514b51: … 158 of 158 tests passing". 6206ebd came at 13:00:59Z, after the opening (12:36:38Z) and after c514b51 (12:34:28Z). **Edited?** Changed to "cannot tell", because the marker reading was absence-only and the re-check was off target. **Diff:** partial. |
| 161 | **[R5] Re-opened.** `runs?head_sha=612cf90b…` gives total_count 5: `governance` push 39440152795 **failure** (14:32:27–14:35:51Z); `governance` pull_request 39440202782 success (14:32:47–14:37:08Z); `pr-body` and `desk-build` pull_request success; `desk-notify-ready` pull_request success (14:43:36Z). ✓ |
| 239 | **[R5] Says:** "Nine locked cases rewritten, each in its own commit, two of them forced and named (AC80, AC89, AC91)". It is a Tasks line with no "(added: …)" tag, unlike the lines added in later rounds. **Commits:** see §3, example 3. **Body mention of 16e1389 elsewhere:** could not be determined. The JSON extraction says no such mention exists. The HTML extraction says yes, but its quote is 16e1389's commit title, which probably came from the page's commit timeline. **Edited:** yes, timing unknown. **Diff:** partial. |

## 3. Counts and the rule used for each

| Kind | Rule | Count (of 20) | PRs |
|---|---|---|---|
| Required section left out | Required on that date and absent from the body | **0** of 15 (estimate; dates C) | — |
| Claim the diff contradicts | A claim the diff contradicts, or a condition dropped | **1** | #31 |
| **[R5]** Stated count lower than the matching commits | A number in the current body below the count of same-kind commits on the PR | **2** | #44 (5 vs 6 `S-001 M2` commits); #239 (9 vs 10 "Rewrite" commits) |
| "Nothing failed" beside a recorded FAIL verdict | Holds only if reviews count | **2** (+1 probable) | #135, #175; probable #148 |
| Latest pull_request-triggered check failed, not named | The latest run started by the pull_request event concluded failure | **1** | #5 |
| Any run on the head failed, not named | Any run, any event | **3** | #5, #31, #161 |
| Review finding not named | Missing from the description | **2** | #44, #213 |
| Milestone line partly wrong | — | **1** | #252 |
| **[R5]** Description edited | "• edited" seen on the HTML page | **4 seen**; the other 16 are "not seen", not "no" | #148, #175, #226, #239 |

**Worked examples:**

1. **#31, dropped condition.**
   - Body: "Redirect: a permanent redirect from the old address meets V4."
   - Diff: "if O5's fallback is needed, a permanent redirect from the old address counts as meeting V4."
2. **#5, latest PR check failed, not named.**
   - Body: "`check_all.sh . origin/main` passed".
   - Run 36853760813 (pull_request, failure, ended 11:11:26Z) is one of only two runs on d7d0749. The PR merged at 11:28:14Z.
3. **#239, count covers round 1 only.**
   - Round-1 rewrites, before the round-2 spec cc76993: e0015bd, 585cb35, ac47f6d, e25c44a, b9929fb, 50b89e0, a8d64b9, 69ec664, f554f7a. That makes **9**.
   - 69ec664 and f554f7a end "(forced; not named in G8d's row)". That makes **2**.
   - Round-3 rewrite: 16e1389 ("Rewrite round 2's locked case 'a project the desk can't draw whose read fails keeps its can't-read words'"). Its message body says "The one locked case G8d's round 3 forces (tests/desk/ac91-g8d.test.mjs; … AC89 (a))" and "As G8d's row names it". Its author and committer dates are both 2026-10-25T17:13:08Z, and it changes one file (+6/−1).
   - *Estimate (C):* the line was written in round 1 and not updated when round 3 added a tenth rewrite.
   - *Opinion:* "named (AC80, AC89, AC91)" reads like the criteria list that every Tasks line carries, not a list of forced cases. If 16e1389 counts as "forced and named", the "two" would be short as well. The wording doesn't settle this, so the finding is not claimed.

## 4. Patterns and opinions

These are unchanged from round 4, plus one addition:

- **[R5]** *(fact, B)*: the extraction misstated its own totals in three of four list views, but the items it listed agreed across views. Counts should be made from listed identifiers, never from the tool's tally.

## 5. Proposed library entries

- **F-pr-desc-01a** (fact, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** the #31 diff half, as before (the checker confirmed it in round 4).
  - **[R5] Run half:** re-opened as `actions/runs/37346950008` and `runs?head_sha=98cfcb45…`, which agree.
  - **Removed:** the job-level detail ("five later jobs skipped", job page 111887792010) was not re-opened, so it is dropped from the claim.
- **F-pr-desc-01b** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **[R5]** Restated with run-level times. #5 and #161 were re-opened as single-run records plus `runs?head_sha=` lists (§2).
  - **Sources:** `actions/runs/36853760813`, `/36853738999`, `/39440152795`, `/39440202782`; `actions/runs?head_sha=<full sha>` for both heads; `pulls/5`; `pulls/161`.
- **F-pr-desc-01c** (estimate, C for the dates; topics: pull-requests, accuracy; shelf life 3 months): unchanged. It still rests on single reads of the 15 bodies.
- **F-pr-desc-01d [R5, rewritten]** (fact, B, for the commits and the quote; estimate, C, for "round 1 only")
  - **Claim:** #239's body Tasks line reads "Nine locked cases rewritten, each in its own commit, two of them forced and named (AC80, AC89, AC91)". The PR has 41 commits, ten titled "Rewrite …" (shas in §3, example 3).
  - **Round 1:** nine of the ten come before cc76993, and two of those nine carry "(forced; not named in G8d's row)".
  - **Round 3:** the tenth, 16e1389, was committed 2026-10-25T17:13:08Z, before the PR was created at 19:40:48Z.
  - **Not claimed:** that the forced count is short, or that the body leaves 16e1389 out entirely.
  - **Sources:** `pulls/239`; `pulls/239/commits?per_page=15&page=1..3`; HTML `pull/239/commits`; `commits/16e1389`; and the commits 69ec664 and f554f7a (the checker confirmed both in round 4).
- **F-pr-desc-01e [R5, narrowed]** (fact, B)
  - **Claim:** the descriptions of #148, #175, #226 and #239 show "• edited" on their HTML pages.
  - **Dropped:** "the other 16 show none" is now an unconfirmed absence read.
  - **Moved:** #44 goes to a new entry, 01f.
- **F-pr-desc-01f [R5, new]** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **Claim:** #44's body says "It is 5 Builder commits" and "Checked by the orchestrator on c514b51". Its commit list holds six `S-001 M2` commits, and the sixth, 6206ebd ("fix the Reviewer's PR #44 findings (B1, N1-N6)", 13:00:59Z), came after the PR was created (12:36:38Z).
  - **Sources:** `pulls/44`; `pulls/44/commits`.
- **F-pr-desc-02, F-gh-api-01a, F-gh-api-01b:** unchanged and not re-opened.
- **Patterns:**
  - **P-summary-failed-01:** unchanged.
  - **P-summary-asof-01:** evidence restated as #44 (01f) and #239 (01d, round-1 count).
  - **P-fetch-two-views-01:** evidence restated as the extraction miscounting its own lists, and #83.

## 6. Not confirmed, carried forward

- Rule binding dates (C).
- Six partial diffs.
- #148's probable failed review rounds.
- Review records seen only as summaries (#18, #187).
- #239's review r2 and design r3 files, and any re-review after 7aa633d.
- When the edits happened, and the 16 descriptions with no marker seen.
- Whether the #239 body mentions 16e1389 anywhere.
- What "two of them forced and named" means.
- Whether #31's `decide` failure is designed.
- Whether checks were required before merging.

---

## Contract

**1. What I changed**
- **#239 (01d):** rewritten. The ten "Rewrite" commits are now confirmed in two views, sha by sha. The "forced short by one" claim is withdrawn. The finding is now "the count line covers round 1 (9, 2 forced) and not round 3's tenth rewrite".
- **Withdrawn:** round 4's "cut off at the 22nd entry" explanation, replaced by the extraction's miscounted tallies.
- **01a and 01b:** run records re-opened, with run-level times. 01a's job-page details were dropped.
- **01e:** narrowed to the positive "edited" markers.
- **#44:** moved to a new entry, 01f, which rests on a content count (5 vs 6) instead of a missing marker.

**2. Why**
- The source check failed 01d on four points: the meaning of "forced", the count of Rewrite commits, the 16e1389 quote and time, and the pagination explanation.
- It also noted that the other entries had been opened only once.

**3. What I verified** (21 fetches, all through the fetch tool, so grade B; no shell)
- **`pulls/239`, three times:** the full Tasks line, including "and named (AC80, AC89, AC91)"; 41 commits; created 19:40:48Z.
- **`commits/16e1389`:** the message, including the quoted phrase; dates 17:13:08Z.
- **HTML `pull/239/commits`:** 41 shas, 10 "Rewrite" titles listed (the tool's own tally said 6).
- **API `pulls/239/commits`, pages 1–3:** 41 shas in the same order, 10 "Rewrite".
- **HTML `pull/239`:** the Tasks line matched. The question of whether 16e1389 is mentioned elsewhere came back contradicting the JSON.
- **Run records:** five `actions/runs/<id>` and three `runs?head_sha=` lists, all consistent.
- **`pulls/5`, `/31`, `/44` and `/44/commits`.**
- **HTML `pull/44`:** the reply about the marker was off target.

**4. What is undone**
- Six partial diffs, #148, #239's r2 and design r3 files, and edit timing.
- 01c's 15 bodies have not had a second read.
- The diff halves of 01b and 02 were not re-opened.
- Whether #239's body mentions 16e1389.

**5. Needed outside my lane**
- **Authenticated `gh` or GraphQL access**, for:
  - `userContentEdits` (edit timing and the 16 unmarked descriptions);
  - the raw body text without extraction (to settle the 16e1389 question);
  - branch protection.
- **The model repo's version dates.**
- **Recording this memo** (the Orchestrator).
- **Filing the entries that pass** (the Source checker).

**6. Open questions**
- What does "two of them forced and named (AC80, AC89, AC91)" mean? Only the author's process can settle it.
- Does "nothing failed" cover reviews?
- Which run counts as "the check"?
- Were checks required before merging?
- Is `orchestrator`/`decide` failing on push a designed stop?