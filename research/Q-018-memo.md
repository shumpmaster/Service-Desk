I couldn't make the full-read counts the question requires. My tools can't do it: I have no shell, and my fetch tool summarises pages and cut the API lists off after about six records. What I found instead are GitHub's own totals for Service-Desk, and every Model-Lab page read in small pieces. They are internally consistent, but I mark them as estimates for a role with a shell to confirm. The private repositories, commits made without a pull request, the kinds of change and owner involvement are all not counted. My memo follows for the Orchestrator to record.

---

## 1. What I changed
Nothing on disk; I have no write lane. My output is the memo below, which goes to the Source checker. It is research/Q-018-memo.md if recorded verbatim.

---

# Q-018 memo — change volume per repository — 2026-11-03
*Researcher. Blind (D-055). Depth 2. Every item is marked fact, estimate or opinion, with a grade.*

### Method, and why nothing here is a "count" under the question's rule
- I have no shell. My fetch tool turns each page into a summary. The API's paginated lists were cut off after about six records per page (seen on `/pulls?per_page=100` for both public repositories). So **I made no count in the question's sense.** Every figure below is an **estimate**.
- **Service-Desk figures** come from totals GitHub calculates itself: the search API's `total_count` (`incomplete_results: false` every time) and, once that hit its limit, the pull-request list's header ("Closed N") on github.com. The limit for anonymous search is 10 requests a minute (docs.github.com/en/rest/search/search, fact, grade A). Checks that make these figures trustworthy:
  - The daily totals add up exactly to each week's total, for all five weeks.
  - The weekly totals add up to the window total (251).
  - Opened, merged and closed-without-merging agree with each other: 259 − 251 − 7 = 1 still open, which is #265.
- **Model-Lab figures** come from `/pulls?state=all&per_page=6`, pages 1–6, every page read. That is 31 records, matching the web list's "Open 1, Closed 30" and the search total of 31. They still came through the summarising fetch.
- The day boundaries in the web queries were given in UTC. America/Chicago days use UTC−5 (CDT) before 2026-11-01 07:00Z.

### Service-Desk (public; first pull request #1 created 2026-09-30T19:06Z, so the period starts on 2026-09-30)
| Item | Value | Mark | Grade |
|---|---|---|---|
| Merged 2026-09-07 → 2026-11-01 | **251** | estimate | B |
| By week (Mon–Sun, UTC): 09-07, 09-14, 09-21 / 09-28* / 10-05 / 10-12 / 10-19 / 10-26 | 0, 0, 0 (repository not yet started) / 27 / 28 / 54 / **121** / 21 | estimate | B |
| Opened in the window | 259 | estimate | B |
| Closed without merging | 7 (#62, #82, #142, #147, #174, #179, #200; 12–23 Oct) | estimate | B |
| Still open at 2026-11-01 24:00Z | 1 (#265, created 23:49Z, merged 2026-11-02 00:35Z) | estimate | B |
| Pull requests now | 261 in total, 0 open (numbers reach #267, so 6 numbers are issues) | estimate | B |
| Partial day, 2026-11-02 00:00–12:00Z | merged 1 (#265), opened 0, open at 12:00 0 | estimate | B |

*The week of 09-28 counts only from 09-30.

**Merged per day (UTC), 30 Sep → 1 Nov:**
- **Week of 09-28:** 30 Sep 1; 1 Oct 14; 2 Oct 1; 3 Oct 4; 4 Oct 7
- **Week of 10-05:** 4, 2, 6, 14, 0, 2, 0
- **Week of 10-12:** 3, 2, 6, 2, 4, 9, 28
- **Week of 10-19:** **36**, 17, 6, 13, 11, 16, 22
- **Week of 10-26:** 4, 1, 1, 3, 1, 6, 5

Busiest and quietest (estimate, B):
- **Busiest day:** 2026-10-19 (36).
- **Quietest days:** 2026-10-09 and 2026-10-11 (0 each).
- **Typical day:** median 4 a day; mean 7.6 over 33 days.
- **Busiest week:** 19–25 Oct (121).
- **Quietest full week:** 26 Oct–1 Nov (21).

**America/Chicago days (estimate, B): the peak does not move.**
- 19 Oct is still the busiest day, at 33 (against 36 in UTC).
- The day before (Chicago 18 Oct) has 27; the day after (Chicago 20 Oct) has 19. Chicago 8 Oct has 14.
- The Chicago week of 19–25 Oct has 119, still the busiest.

**Re-take to the new end time:** 251 merged up to 2026-11-01 end of day, and 252 up to 2026-11-02 12:00Z. **I cannot say whether this agrees with Q-016,** because research/Q-016-memo.md is not in my pack. Whoever has it should compare the weekly row above.

**Deploys and releases:**
- **Releases page:** none found (`/releases` returned an empty array). Fact, B.
- **Deploy workflow runs** (`desk-deploy.yml`, one of 9 workflows): 64 runs created in the window, 46 of them successful. Successful runs by week: 0 / 5 / 8 / 24 / 9, matching 46. Estimate, B.
- The busiest deploy week is the same as the busiest merge week.
- The one run I sampled was started by hand from the Actions tab (event `workflow_dispatch`). The other runs' triggers are not known.

### Model-Lab (public; first pull request #1 created 2026-11-01T16:59Z, so the window is a single UTC day, 2026-11-01)
| Item | Value | Mark | Grade |
|---|---|---|---|
| Opened on 2026-11-01 (UTC) | 25 (#1–#25) | estimate | B |
| Merged on 2026-11-01 (UTC) | **23** (#1–#23, from 18:02Z to 23:44Z) | estimate | B |
| Closed without merging | 0 | estimate | B |
| Still open at 2026-11-01 24:00Z | 2 (#24, #25) | estimate | B |
| Partial day, 2026-11-02 to 12:00Z | opened 4 (#26–#29), merged 5 (#24–#28, all at 00:35–00:36Z), open at 12:00 1 (#29) | estimate | B |
| Releases | none found (empty array) | fact | B |
| Deploys | none found: no release, and none of its 5 workflows (asks-merge, governance, orchestrator, pr-body, scrub-proof) is a deploy workflow | fact | B |

- **America/Chicago days:** Chicago 1 Nov has 28 merges (#1–#28). That is 23 in UTC plus the five merges at 00:35Z, which fall on the evening of 1 Nov in Chicago.
- **Merges arrive in bursts:** groups of 3–5 merged within about a minute of each other (for example 18:44:41–18:44:57, 20:35:10–20:36:37 and 00:35:48–00:36:27). Fact, B.

### Totals for the two public repositories (window end, 2026-11-01)
- **Merged:** 274. **Opened:** 284. **Closed without merging:** 7. **Still open at the end:** 3. (Estimate, B.)
- **Same-day peaks:** they cannot be compared. Service-Desk's peak (19 Oct) comes before Model-Lab's first record. On the only shared day, 1 Nov, the two together merged 28 (UTC), fewer than Service-Desk alone on 19 Oct.

### Not counted (each needs a role with a shell, using the Q-016 source-check methods and the same reading limits)
1. **Personal-Org-Operating-Model and portfolio, every measure:** both are private, and my fetch cannot authenticate.
2. **Commits to the default branch without a pull request, all four repositories:** this needs the default branch's first-parent history. The API's commit list gives no total without paging, and my fetch shows no headers.
3. **Kinds of merged pull request:** this needs each PR's list of changed file paths (254 + 30 PRs). The branch name prefixes (`cos/`, `orch/`, `claude/`) look like they show which role made a PR, not what kind of change it is. That reading is my opinion, grade C. Kind: "not determined" for all.
4. **Exact counts to confirm every estimate above:** Service-Desk's figures come from GitHub's totals, not records read to the end. Model-Lab's came through a summarising fetch.

### Owner involvement: "cannot tell" for all, as things stand
- **Who opened them:** every pull request in both public repositories was opened by `shumpmaster`. For Service-Desk, `is:pr -author:shumpmaster` returns 0. For Model-Lab, all 31 records show that author. Fact, B.
- **Who merged them:** both merge records I sampled (SD #265, ML #1) show `merged_by: shumpmaster`. Fact, B.
- **Reviews:** no merged Service-Desk PR has an approving review. Fact, B.
- **Why I can't tell:** branch names such as `claude/…-7hv15p`, `cos/session-…` and `orch/…`, plus an `asks-merge` workflow, suggest agents open and possibly merge PRs under the owner's account. If so, the account name does not separate the owner from agents. Opinion, C.
- **What would settle it:** evidence of how each merge was made, for example timeline events, matching `asks-merge` runs to merges, or which token the agents use. I added this as question N1 below.

### Proposed library entries (for the Source checker)
```yaml
- id: F-gh-search-02
  form: fact
  claim: "GitHub REST search: unauthenticated up to 10 requests/minute; authenticated up to 30/minute (except code search, 10); each search returns up to 1,000 results; incomplete_results signals results cut short by timeout."
  grade: A
  topics: [github, pull-requests]
  shelf_life: 12 months
  sources: [https://docs.github.com/en/rest/search/search]
- id: F-vol-sd-01
  form: fact
  claim: "Service-Desk merged 251 pull requests from 2026-09-30 (first PR) to 2026-11-01 UTC, by week (Mon-Sun, from 28 Sep) 27/28/54/121/21; busiest day 19 Oct (36 UTC, 33 America/Chicago); 7 closed unmerged; 46 successful desk-deploy runs; no releases. From GitHub search totals, not a full-record count."
  grade: B
  topics: [pull-requests, change-volume]
  shelf_life: 1 month (dated snapshot)
  sources: [api.github.com search/issues; github.com/shumpmaster/Service-Desk/pulls list headers; actions/workflows/376990170/runs]
- id: F-vol-ml-01
  form: fact
  claim: "Model-Lab's first pull request was 2026-11-01T16:59Z; 23 merged that UTC day (28 on the America/Chicago day), 0 closed unmerged; 31 PRs by 2026-11-03, all authored by the owner account; no releases or deploy workflow."
  grade: B
  topics: [pull-requests, change-volume]
  shelf_life: 1 month
  sources: [api.github.com/repos/shumpmaster/Model-Lab/pulls?state=all&per_page=6 pages 1-6]
- id: P-count-01
  form: pattern
  claim: "When records cannot be read to the end, take the platform's own totals for nested periods and check that days sum to weeks and weeks to the window, and that opened = merged + closed-unmerged + still-open; report these as estimates."
  grade: C
  topics: [change-volume, change-reporting]
  shelf_life: 24 months
  sources: [this memo]
```

### Questions added (none closed)
- **N1.** Which merges and approvals were made by the owner in person, and which by agents or workflows acting through the owner's account? What record would show the difference?
- **N2.** For "deploy", should hand-started (`workflow_dispatch`) runs and failed runs count, or only successful runs that put a change live?
- **N3.** Do several pull requests merged within a minute of each other count as one change for reading, or as several?

---

## 2. Why
These are my researcher duties for Q-018. Where the question's rule on counting couldn't be met, I said so and handed those counts on, rather than presenting estimates as counts.

## 3. What I verified (tool calls and results)
- **Service-Desk search totals:** window 251; weekly 0/0/0/27/28/54/121/21; days 19–25 Oct add up to 121 (calls made through the search API).
- **Daily totals from the web list:** days 26 Oct–1 Nov add up to 21; 30 Sep–4 Oct to 27; 5–11 Oct to 28; 12–18 Oct to 54.
- **America/Chicago checks:** 18 Oct 27, 19 Oct 33, 20 Oct 19; week 119; 8 Oct 14.
- **Web list headers:** closed without merging 7; open 0 and closed 261; opened in the window 259; not authored by `shumpmaster` 0; approved and merged 0; merged in the partial day 1 (#265).
- **Model-Lab:** pulls pages 1–6 at 6 per page gave 31 records with times.
- **Releases:** empty arrays for both repositories.
- **Workflows:** Service-Desk has 9, Model-Lab has 5. `desk-deploy` runs in the window: 64 in all, 46 successful, 0/5/8/24/9 by week.
- **Merge records:** `merged_by` was `shumpmaster` on SD #265 and ML #1.
- **Failures:** the search API returned HTTP 403 nine times (rate limit), and the web list was used instead. Page 1,000,000 of the runs list returned HTTP 422.

## 4. What is undone
- **Private repositories:** every measure for Personal-Org-Operating-Model and the portfolio.
- **Commits without a pull request:** all four repositories.
- **Kinds of merged pull request:** all, so 100% are "kind not determined".
- **Owner involvement:** "cannot tell" for all.
- **Agreement with Q-016:** not compared.
- **Exact counts:** none of the public-repository figures has been confirmed by a count that reads every record to the end.

## 5. What is needed outside my lane
- **A role with a shell and authenticated access**, using the Q-016 source-check methods and this question's reading limits, to count:
  - every measure for the two private repositories;
  - commits on each default branch's first-parent line that are not the merge of a numbered pull request;
  - the changed file paths of each merged PR, to sort them by kind;
  - `merged_by` and reviews for each PR;
  - and to confirm all my estimates.
- **The Orchestrator or Source checker**, to compare the Service-Desk weekly row with Q-016 area D.
- **No level-5 expert or paid source is needed.**

## 6. Open questions
- **N1–N3**, as listed in the memo.
- **Owner attribution:** if agents act through the owner's account, the question's test for "needed the owner" (merge record or review) cannot be answered from the records. The question may need a different test.