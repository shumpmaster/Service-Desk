I have what I need, so I'm writing round 4 now.

# Memo: Q-017, round 4. How accurate and complete are Service-Desk's pull-request descriptions? (2026-11-03)

*Researcher memo for the Source checker. It replaces round 3 in full. Each statement is marked **fact**, **estimate** or **opinion** and given a grade:*
- ***A:*** *read word for word from the primary page.*
- ***B:*** *read from the primary page, but through the fetch tool's extraction (a model sits in between).*
- ***C:*** *inferred.*

*Where a claim rests on two separate views of the same data (for example the check-runs endpoint and the workflow-runs endpoint), the memo says so. Two views of one GitHub record are not two independent sources. They do guard against a single bad extraction. Changes from round 3 are marked **[R4]**.*

## 0. Bottom line

- **No required section is missing.** Rules bound 15 of the 20 sampled PRs (#70 onward). **[R4]** All 15 bodies have now been read for headings and the milestone line: 12 in this round, plus #70, #83 and #226 in round 3, with #226 read again now. Every one carries the sections required on its date. *(The headings and lines are fact, B. "Required on its date" is an estimate, because the rule dates are inferred from adoption PRs (C).)*
- **One sampled PR makes a claim its diff contradicts.** #31's body drops a condition from a ruling it records. *(fact, B; diff and body both re-opened in round 4)*
- **[R4] #239's count is short by one and its "forced" count is short by one.**
  - The body says "Nine locked cases rewritten, each in its own commit, two of them forced".
  - There are ten "Rewrite …" commits. Three of them describe themselves as forced: 69ec664, f554f7a and 16e1389 ("The one locked case G8d's round 3 forces").
  - 16e1389 was committed at 17:13:08Z. The PR opened at 19:40:48Z, so the commit existed before the body was written. The omission is not a stale body. *(fact, B)*
- **[R4] #44's description is out of date, and this is now settled as fact (B).**
  - The PR opened at 12:36:38Z.
  - Commit 6206ebd ("fix the Reviewer's PR #44 findings (B1, N1-N6)") came at 13:00:59Z.
  - The description shows no "edited" marker.
- **Failed runs on the head commit that the description doesn't name: #5, #31 and #161.** *(fact, B, two views each)* **[R4]** The trigger now matters:
  - **#5:** the pull-request-triggered `governance` run failed and is the latest run. The push-triggered run passed. #5 is the only PR whose latest pull-request check failed.
  - **#31:** the failed job, `decide`, belongs to a different workflow, `orchestrator`, which runs on push. Both `governance` runs passed.
  - **#161:** the push-triggered `governance` run failed, and the pull-request-triggered run after it passed.
- **"Nothing failed or was skipped" is a loose sentence:** #135 and #175 say it while their commits or diffs record FAIL review verdicts. *(fact, A/B as before)*
- **[R4] Edit markers are readable after all.** The HTML page shows "• edited" on the description of 4 of the 20 PRs (#148, #175, #226, #239). The other 16 show none. *(fact, B; #175 and #226 are known to have been edited and served as checks on the method)* The page still doesn't show when an edit happened.
- Six diffs remain only partly read.

## 1. The sample and how it was read

- **Open pull requests at 2026-11-02 12:00 UTC: none** *(fact, B)*. So the sample is **entirely merged**.
- **Two numbers were swapped:** #174 and #200 were closed without merging, so #175 and #201 replace them.
- **Final sample:** #5, 18, 31, 44, 57, 70, 83, 96, 109, 122, 135, 148, 161, 175, 187, 201, 213, 226, 239, 252.
- **When each rule binds** *(the quotes are fact, B; reading the dates as binding dates is an estimate, C. The model repo is private.)*

| Rule | Adopted in | Merged (UTC) | Body says | Required on |
|---|---|---|---|---|
| "What this means for you" | #65 | 2026-10-13T23:51:13Z | "plain English first in everything written for you" | #70 and later |
| Milestone line, Context, Why | #79 | 2026-10-17T02:45:39Z | "every Service-Desk pull request names the milestone it serves and lists the facts behind it, each with its source, and its why"; **[R4]** also "Every pull request after it needs the Milestone line, Context and Why." | #83 and later |
| Tasks | #222 | 2026-10-25T00:55:24Z | **[R4] re-opened:** "Every pull request here now lists its tasks as tick boxes after its Why, and a check turns red on a ready one that leaves a task unexplained." | #226 and later |

- **[R4] Section check, from the `pulls/N` body field** *(fact, B)*:

| PR | Created | Headings | Milestone line | Tick boxes |
|---|---|---|---|---|
| 70 | 10-14 | What this means for you; Detail (R3) | not required | not required |
| 83 | 10-17 | WTMFY; Context; Why; What is in it; Checks (R3) | "Milestone: none (…)" on the HTML page | not required |
| 96 | 10-18 | WTMFY; Context; Why | "Milestone: M3A" | not required |
| 109 | 10-18 | WTMFY; Context; Why | "Milestone: none (notifications are not yet a milestone; …)" | not required |
| 122 | 10-19 | WTMFY; Context; Why | "Milestone: M3A" | not required |
| 135 | 10-19 | WTMFY; Context; Why | "Milestone: none (notifications are not yet a milestone; this shapes how the desk counts)" | not required |
| 148 | 10-19 | WTMFY; Context; Why (+ "What changes, by file:", "Known limits:") | "Milestone: none (a governance change the owner asked for)" | not required |
| 161 | 10-20 | WTMFY; Context; Why | "Milestone: M3A" | not required |
| 175 | 10-21 | WTMFY; Context; Why | "Milestone: MD3" | not required |
| 187 | 10-22 | WTMFY; Context; Why; Screenshots; Known follow-ups… | "Milestone: MD3" | not required |
| 201 | 10-23 | WTMFY; Context; Why | "Milestone: none (questions about the follow-up plan after MD3; …)" | not required |
| 213 | 10-24 | WTMFY; Context; Why; Known follow-ups… | "Milestone: M3D" | not required |
| 226 | 10-25 | WTMFY; Context; Why; Tasks; Before and after | "Milestone: M3E" | yes (11 ticked, 1 open) |
| 239 | 10-25 | WTMFY; Context; Why; Tasks; Before and after | "Milestone: M3E" | yes |
| 252 | 10-29 | WTMFY; Context; Why; Tasks | "Milestone: M3B" | yes |

- **How each page was read:**
  - **Descriptions:** from the `pulls/N` JSON, through the fetch tool (B). Edit markers and #83's milestone line come from the HTML `pull/N` pages.
  - **Diffs read in full:** #5, 18, 31, 57, 83, 96, 109, 122, 161, 175, 201, 252. **[R4]** #31 was re-read from `patch-diff.githubusercontent.com/raw/…/pull/31.diff`.
  - **Diffs read only in part:** #44, 70, 135, 148, 187, 213, 226, 239.
  - **Check runs:** read from `commits/<sha>/check-runs`. **[R4]** For #5, #31 and #161, also from `actions/runs/<id>` (event, workflow and conclusion) and from the HTML job pages.
- **[R4] Method notes:**
  - **The fetch tool cuts long JSON short.** `pulls/239/commits?per_page=100` came back with 21 complete entries and was cut off at the 22nd. That explains why the checker's API view showed fewer commits than the 41 on the HTML page. The entries that did come back match the HTML list, in the same order.
  - **`actions/runs?head_sha=` needs the full sha.** Short shas returned `total_count: 0` (seen twice).
  - **#5's job page says the run was "part of pull request #35".** This is probably the workflow run number, misread by the extraction. The API ties the run to head d7d0749 on branch `build/chief-of-staff/pack-feedback`, which is #5's head. I didn't rely on the job page for this.

## 2. Per-PR record

*Column key:*
- ***Says:*** *what the description claims.*
- ***Left out / not borne out:*** *what the diff shows that the description leaves out, or contradicts.*
- ***Risk / fail / finding named?:*** *whether the description names failed checks, review findings or irreversible steps.*
- ***Edited?:*** *whether the description was changed after later commits.*
- ***Opening alone correct?:*** *whether the opening paragraph alone gives a correct account.*
- ***Relation:*** *to other PRs or to the milestone it names.*
- ***Status:*** *checked (✓) or could not be determined (?).*

| PR | Says | Left out / not borne out | Risk / fail / finding named? | Edited? **[R4]** | Opening alone correct? | Relation | Status |
|---|---|---|---|---|---|---|---|
| 5 | PACKS.toml: each research role gets its own previous round | Nothing | **[R4]** Head d7d0749 has two `governance` runs: run 36853738999 (event push) succeeded 11:10:52–11:10:57; run 36853760813 (event pull_request) **failed** 11:11:05–11:11:13 ("Process completed with exit code 1"; the rest of the log didn't load). No later run. Merged 11:28:14. The body says "`governance/checks/check_all.sh . origin/main` passed". Not named | No marker | Not required on this date | Q-001/2/4; right | Diff ✓; review ? |
| 18 | sources.md widened to any vendor's own pages | Nothing | All pass; the reviewer comment came back as a summary only | No marker | Not required | #17; right | ✓; review ? |
| 31 | Records 6 move-to-Build values | **Not borne out:** drops "if O5's fallback is needed". **Left out:** "any API key needs the owner's ruling first" | **[R4]** `decide` (workflow `orchestrator`, `.github/workflows/orchestrator.yml`, event push) **failed** at the step "Decide (model S-012 step)". Its five later jobs were skipped. The `governance` push and pull_request runs both succeeded. Not named | No marker | Not required | Not checked | ✓ |
| 44 | M2; "5 Builder commits"; 158/158 tests "on c514b51" | 8 commits, three after c514b51, including 6206ebd (B1 fix) | B1 not named | **[R4] No marker. Opened 12:36:38; 6206ebd at 13:00:59. Not updated after a later commit (fact, B)** | Bold inline lead; correct as of c514b51 | M2; right | Diff partial ? |
| 57 | Ledger L-0007 | Nothing | All pass; says reversible | No marker | Yes | — | ✓ |
| 70 | v3.3.2 sync; "the governance check stays red, and that is expected" | Nothing seen | Names the red check | No marker | Yes (it also opens "Nothing failed or was skipped") | #67; not checked | ✓ |
| 83 | Fixes #81's verdict file; "Milestone: none" | Matches | All pass | No marker | Yes | #81, #82; right | ✓ |
| 96 | Records 3 answers | Matches | All pass | No marker | Yes | M3A; right | ✓ |
| 109 | Files one question | Matches | All pass | No marker | Yes | Right | ✓ |
| 122 | Files two M3A questions | Matches | All pass | No marker | Yes | Right | ✓ |
| 135 | Job PRs "being recorded"; R3; 769 tests | The S-001 spec amendment is cited only as a source | "Nothing failed or was skipped" while commits read "FAIL on A, E" | No marker | No, if failed reviews count | Right | Diff partial ? |
| 148 | Design reviewer set up | Diff only partly read | Names the red check; probable failed rounds (C) | **Edited** (timing ?) | ? | none (governance); right | ? |
| 161 | Marks M3A reached; "Nothing failed or was skipped" | Matches | **[R4]** The failed `governance` run 39440152795 is event **push** (14:32:30–14:35:42). The pull_request run 39440202782 succeeded (14:32:49–14:36:57). Not named | No marker | Yes for the PR check; no if every run counts | M3A; right | ✓ |
| 175 | j22.js becomes R3 | Matches | "Nothing failed or was skipped" beside round-1 and round-2 FAIL reports in the diff | **Edited**; the reviewer confirms finding 2 was fixed in the text | Yes under the checks reading | MD3; right | ✓ |
| 187 | Stage 7; "passed after fixes" | Diff partial | Names the reviewer's gap | No marker | Yes | MD3 | ? |
| 201 | Files two questions | Matches | All pass | No marker | Yes | Right | ✓ |
| 213 | Step 8: tests only | Reviewer: "no src/ file changed" | Leaves out note 1 | No marker | Yes | M3D | ✓ (diff partial) |
| 226 | "One thing failed and was fixed" | Spec +7/−1, flagged in Tasks | Names the round-1 FAIL | **Edited** (within seconds of opening, R2) | Yes | M3E | Diff partial ? |
| 239 | "Nine locked cases rewritten, each in its own commit, two of them forced and named" | **[R4]** 10 "Rewrite" commits; 3 call themselves forced (69ec664, f554f7a: "(forced; not named in G8d's row)"; 16e1389: "The one locked case G8d's round 3 forces … As G8d's row names it"). All existed before the PR opened at 19:40:48 | Heap risk: the body names the test-command change and says "it no longer runs out of memory". The round-3 review: "The one-process suite's heap: effectively no margin (non-blocking, carry as a risk)". Whether anyone re-reviewed after 7aa633d: ? | **Edited** (timing ?) | **[R4]** Opens "both reviewers passed all three rounds". The review r1, design r1 and review r3 files each show "Verdict: PASS"; r2 and design r3 not opened | M3E | Diff partial ? |
| 252 | 3 acceptances | Matches | All pass | No marker | Yes | "Milestone: M3B" but it marks M3E, M3G and M3B; partly right | ✓ |

## 3. Counts and the rule used for each

| Kind | Rule | Count (of 20) | PRs |
|---|---|---|---|
| Required section left out | Required on that date (§1) and absent from the body | **0** of 15 bound (estimate: dates are C) | — |
| Claim the diff contradicts | A claim the diff contradicts, or a condition dropped | **1** | #31 |
| Stated count misses a same-kind commit | A number in the body that is lower than the matching commits | **1** | #239 (9 vs 10; 2 forced vs 3) |
| "Nothing failed" beside a recorded FAIL verdict | Holds only if reviews count | **2** (+1 probable) | #135, #175; probable #148 |
| **[R4]** Latest pull_request-triggered check failed, not named | The latest run of a check started by the pull_request event has conclusion failure | **1** | #5 |
| Latest run of a check name failed, not named | Any event | **2** | #5, #31 (`orchestrator`/`decide`, push) |
| Any run on the head failed, not named | Any run, any event | **3** | #5, #31, #161 (#70 names its red check) |
| Out of date after later commits | No edit marker, and a commit later than the PR's opening that the body doesn't cover | **1** | #44 |
| Content change left out | A changed file outside reviews/ and digests, not named as a change | **3** | #31, #135, #239 |
| Review finding not named | Missing from the description | **2** | #44, #213 |
| Milestone line partly wrong | — | **1** | #252 |
| **[R4]** Description edited | "• edited" on the HTML page | **4 yes, 16 no** | #148, #175, #226, #239 |

**Worked examples:**
1. **#31, dropped condition.**
   - Body: "Redirect: a permanent redirect from the old address meets V4."
   - Diff (`decisions/questions/P-001-move-to-build-values.md`): "Redirect: if O5's fallback is needed, a permanent redirect from the old address counts as…"
2. **#5, latest PR check failing, not named.**
   - Body: "`governance/checks/check_all.sh . origin/main` passed."
   - Run 36853760813 (`governance`, event pull_request, head d7d0749) concluded failure at 11:11:13. Nothing ran after it, and the PR merged at 11:28:14.
3. **#239, stated count short.**
   - Tasks line: "Nine locked cases rewritten … two of them forced."
   - The commit list has ten "Rewrite …" commits. 16e1389 (17:13:08Z, before the 19:40:48Z opening) says "The one locked case G8d's round 3 forces".

## 4. Patterns and opinions

- **What "nothing failed" covers** *(opinion)*: the sentence reads most naturally as being about checks, but an owner may take it to mean no review failed. A summary should state checks and review verdicts separately.
- **[R4] Push and pull-request runs disagree** *(fact, B)*. #5 and #161 each have one run per event on the same head sha:
  - In #5 the pull_request run failed.
  - In #161 the push run failed.
  - *Opinion:* "the latest pull_request-triggered run of each check" is the test closest to what blocks a merge. Under it only #5 counts. Whether the repository requires checks before merging could not be determined (it needs settings access).
- **[R4] #31's `decide` failure is in the `orchestrator` workflow, not a PR check.** Whether it is a real failure or a designed way to stop work could not be determined: the log shows only the step name.
- **Method** *(fact, B)*: the extraction can cut lists short (#239's commits) and misreport absence (#83's milestone). Counts and absence claims should rest on two views.
- **Overall** *(opinion)*: 11 of the 12 fully read diffs matched their descriptions, and every required section was present. Even so, the author's text is not a sole source for:
  - whether anything failed (checks or reviews, by trigger);
  - counts of commits or cases;
  - spec changes bundled into build PRs;
  - anything after the commit it names.

## 5. Proposed library entries

- **F-pr-desc-01a** (fact, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** Service-Desk PR #31's body says "Redirect: a permanent redirect from the old address meets V4." The diff says "if O5's fallback is needed, a permanent redirect from the old address counts as…". The body leaves out "any API key needs the owner's…".
  - **Also:** on head 98cfcb4, job `decide` of workflow `orchestrator` (event push, run 37346950008) failed. Its five later jobs were skipped, and both `governance` runs (push and pull_request) succeeded. The PR merged at 17:17:08Z, and the body doesn't mention the failure.
  - **Sources:** `patch-diff…/pull/31.diff`; `pulls/31`; `commits/98cfcb4…/check-runs`; `actions/runs/37346950008`, `/37346969605`, `/37346949997`; job page 111887792010.
- **F-pr-desc-01b [R4]** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **#5:** on head d7d0749, `governance` push run 36853738999 succeeded (11:10:52–11:10:57). Pull_request run 36853760813 then failed (11:11:05–11:11:13), and no later run exists. The PR merged at 11:28:14Z. The body says "`governance/checks/check_all.sh . origin/main` passed".
  - **#161:** on head 612cf90, push run 39440152795 failed and pull_request run 39440202782 succeeded. The body opens "Nothing failed or was skipped".
  - **Sources:** `commits/<sha>/check-runs` and `actions/runs/<id>` for each run; `pulls/5`; `pulls/161`.
- **F-pr-desc-01c [R4]** (estimate, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** all 15 sampled PRs from #70 to #252 carry the sections required on their dates (§1 table). The rule dates are taken from adoption PRs #65, #79 and #222.
  - **Sources:** `pulls/65`, `/79`, `/222`, `/70`, `/83`, `/96`, `/109`, `/122`, `/135`, `/148`, `/161`, `/175`, `/187`, `/201`, `/213`, `/226`, `/239`, `/252`; HTML `pull/83`.
  - **Limit:** the binding dates are inferred (C) until the model repo's version dates can be read.
- **F-pr-desc-01d [R4, corrected]** (fact, B; topics: pull-requests, accuracy; shelf life 3 months)
  - **Claim:** #239's Tasks line says "Nine locked cases rewritten, each in its own commit, two of them forced". Its 41 commits include ten titled "Rewrite …".
  - **Forced commits:** 69ec664 and f554f7a say "(forced; not named in G8d's row)". 16e1389 (2026-10-25T17:13:08Z) says "The one locked case G8d's round 3 forces".
  - **Timing:** the PR was created at 19:40:48Z, after all three.
  - **Sources:** HTML `pull/239/commits`; `commits/69ec664`, `/f554f7a`, `/16e1389`; `pulls/239`; HTML `pull/239` for the Tasks line.
- **F-pr-desc-01e [R4, new]** (fact, B; topics: pull-requests, change-reporting; shelf life 3 months)
  - **Claim:** of the 20 sampled PRs, the description of #148, #175, #226 and #239 shows "• edited" on its HTML page, and the other 16 do not.
  - **#44:** opened 12:36:38Z, commit 6206ebd at 13:00:59Z, no marker. So its description was not updated after that commit.
  - **Sources:** HTML `pull/N` for all 20; `pulls/44`; `pulls/44/commits`.
- **F-pr-desc-02** (fact, B; topics: pull-requests, change-reporting; shelf life 6 months): unchanged (#175, #81).
- **F-gh-api-01a** (fact, B; topics: github; shelf life 12 months): the unauthenticated REST limit is 60 requests an hour. Unchanged.
- **F-gh-api-01b [R4, re-scoped: the REST absence half removed]** (fact, B; topics: github; shelf life 12 months)
  - **Claim:** GitHub's GraphQL PullRequest object documents:
    - `lastEditedAt`: "The moment the editor made the last edit."
    - `userContentEdits`: "A list of edits to this content."
    - `editor`: "The actor who edited this pull request's body."
    - `includesCreatedEdit`
  - **Also:** GitHub's docs say "Anyone with read access to a repository can view a comment's edit history", by clicking **edited**.
  - **Sources:** `docs.github.com/en/graphql/reference/pulls`; `docs.github.com/en/communities/moderating-comments-and-conversations/tracking-changes-in-a-comment`.
- **P-summary-failed-01 [R4]** (pattern; topics: summaries, accuracy)
  - **Pattern:** an owner-facing summary gives the latest result of each check by trigger, and gives review verdicts separately. It never says a bare "nothing failed" or "X passed".
  - **Evidence:** #5, #31, #161, #135 and #175.
- **P-summary-asof-01** (pattern; topics: change-reporting)
  - **Pattern:** a summary names the head commit it describes, and recounts from the commit list rather than from the author's tally.
  - **Evidence:** #44 (not updated after 6206ebd) and #239 (count short although written after the commits).
- **P-fetch-two-views-01 [R4, new]** (pattern; topics: change-reporting, github)
  - **Pattern:** a count or an absence read through a model extraction is confirmed from a second view before it is used.
  - **Evidence:** #239's API list was cut at 21 of 41; #83's milestone line was reported absent.

## 6. Not confirmed, carried forward

- The rule binding dates (C).
- Six partial diffs.
- #148's probable failed review rounds.
- Review records seen only as summaries (#18, #187).
- #239's review r2 and design r3 files, and whether anyone reviewed again after 7aa633d.
- When the four edited descriptions were edited.
- Whether #31's `decide` failure is designed.
- Whether checks were required before merging.

---

## Contract

**1. What I changed**
- Re-read the 12 rule-bound bodies not read in round 3, so the section count now covers all 15.
- Got a second view (workflow-run records) of the failed runs in #5, #31 and #161, which separates push runs from pull-request runs. #31's failure turned out to be in the `orchestrator` workflow.
- Corrected #239: there are 3 forced commits, not 2, and 16e1389 came before the PR opened. The two views of its commit list differed because the fetch tool cut the API list short.
- Settled #44 as fact.
- Added the edit-marker check for all 20 (new entry 01e).
- Removed the REST absence claim from F-gh-api-01b and sourced it from two GitHub docs pages instead.
- Added a third count rule (by trigger) and the P-fetch-two-views-01 pattern.

**2. Why**
- The source check failed round 3 for these reasons:
  - 01c was unsupported;
  - 01d was only partly confirmed, and its two commit views disagreed;
  - several facts had been opened only once;
  - 01b rested on an absence claim.

**3. What I verified** (about 55 fetches, all through the fetch tool, so grade B; no shell)
- **`pulls/N` bodies:** #96, 109, 122, 135, 148, 161, 175, 187, 201, 213, 226, 239 and 252, plus #44, #5 and #31; and adoption PRs #79 and #222.
- **HTML `pull/N` pages:** all 20, for edit markers.
- **#239 commits:** the HTML list, the API list (cut short) and three single-commit records.
- **Check runs:** check-runs for d7d0749, 98cfcb4 and 612cf90; seven `actions/runs/<id>` records; two job pages.
- **#31 diff:** the `.diff` view.
- **#239 review files:** three of them.
- **GitHub docs:** two pages.

**4. What is undone**
- Six partial diffs.
- #148.
- #239's review r2 and design r3 files.
- When the four edits happened.
- Binding dates.

**5. Needed outside my lane**
- **Authenticated access**, for:
  - GraphQL `userContentEdits` (edit timing);
  - full diffs and job logs;
  - branch protection settings.
- **The model repo's version dates.**
- **Recording this memo** in research/ (the Orchestrator).
- **Filing the entries that pass** (the Source checker).

**6. Open questions**
- Does "nothing failed" cover checks only, or reviews too?
- Which run should count as "the check": the pull-request run, the push run, or any run?
- Were checks required before merging (#5 merged with its pull-request check failing)?
- Is `orchestrator`/`decide` failing on push a designed stop?
- Does #239's "two of them forced and named" mean something other than the commits' own "forced" label?