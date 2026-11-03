Q-019 is still not fileable at depth 3. Line numbers came back for two short files but not for the large ones, and I couldn't fix the one-primary-source problem. The full revision 3 (return and memo) is below for the Orchestrator to record as research/Q-019-memo.md.

# Six-part return: Q-019, researcher, revision 3 (2026-11-03)

## 1. What I changed
- **Line numbers I can check against GitHub's own count.**
  - **seen.js:** read back whole and numbered. That gives 97 lines, the same as GitHub's file header ("97 lines (95 loc)"). §9 and F-desk-seen-01 now cite lines.
  - **status/merges.jsonl:** all 10 lines read back in full and numbered.
- **Open question 4 (the 7-day bound) is answered.** It is not in seen.js; the whole file was read. It is in home.js: `export const SINCE_DAYS = 7;` with the comment "At most the last 7 days (AC82, C)", used by `sinceView` as `const floor = nowMs - SINCE_DAYS * 86400e3;`.
- **Two estimates are now facts (B).** Both rest on full reads, not searches.
  - None of the ten merge SHAs from sample A is in status/merges.jsonl.
  - `spec` is `null` on all 10 lines, and every item there is a question (Q-001 … Q-016).
- **A second source for two claims, from GitHub's own server.**
  - **Sample B:** GitHub's search finds 0 of the 16 merged pull requests created before 2026-10-02 with "milestone" anywhere in the description. This backs up the 0/10 in sample B.
  - **GitHub milestones:** the repository's milestones page says "You haven't created any Milestones". So no pull request can carry one.
  - **Labels:** stay an estimate. A label search came back with all 265 pull requests, but a negated version of the same search gave the same count, so I can't tell whether the filter was applied.
- **sender.mjs: every place it sends.** I listed every `deliver(` and `pushOnce(` call: 7 `deliver` calls and 1 `pushOnce`. They send the back-on, test, summary (twice), group, item, cost and fail-test messages, and the items come from `c = await collect(…)`. "Merges are not notified" stays an estimate (C), but it now rests on that list rather than a word search.
- **records.js: new details from a word-for-word excerpt.**
  - `ITEM_BRANCH_RE` is followed by an 8-line doc comment and then `classifyPull`.
  - That comment says a fork's PR from an `item/` branch "is flagged like any other (review N7)".
  - `milestoneValue`'s comment says "The desk reads it and checks no form (the model's checks do, in the project's own CI)".
  - `cardMilestoneLine` names "model S-033 AC5". That is a second file in the desk's code naming S-033.
- **Why records.js has no line numbers, shown.** GitHub says the file has 1,022 lines. Five reads by the summariser gave 868, 875, 897 and 1,136 for the function and 1,076 lines in total. For sender.mjs (GitHub: 378 lines) the numbered copy ended at line 326 and repeated two numbers.

## 2. Why
The round-2 check failed the memo for five reasons: no line numbers, no second independent source, estimates built on negative searches, sources it did not reopen, and parts left undone. In this round:
- **Negative searches:** replaced, where a file is small enough, by a full read whose line count matches GitHub's.
- **Second source:** added where GitHub's server can give one (search counts, the milestones page).
- **Undone parts:** the 7-day bound is now answered.

The rest can't be fixed through a summarising fetch.

## 3. What I verified
No shell, so I ran no commands. I made 17 WebFetch reads:

| Read | Result |
|---|---|
| seen.js, raw, numbered | 97 lines; matches GitHub's header |
| seen.js, GitHub page | "97 lines (95 loc) · 3.49 KB" |
| records.js, GitHub page (`?plain=1`) | "1022 lines (943 loc)"; no line anchors in what I received |
| records.js, raw (2 reads) | Excerpts word for word; the line counts don't agree with each other or with 1,022 |
| commits touching records.js (API), then commit b25d0de's diff | Its only records.js hunk is at line 222, so no help for `classifyPull` |
| merges.jsonl, raw, numbered | 10 lines, read in full |
| sender.mjs, GitHub page | "378 lines (360 loc)" |
| sender.mjs, raw (3 reads) | First half refused; second half numbered wrongly (ends at 326); every send call listed |
| home.js, raw | `SINCE_DAYS = 7` and its use |
| PR search: merged, "milestone" in the description | 197 results (word match only, so not a count of `Milestone:` lines) |
| PR search: merged, created before 2026-10-02, with and without "milestone" | 0 with; 16 without |
| PR searches with and without `no:milestone` / `no:label` | 265 every time; can't tell whether the filters were applied |
| Milestones page | none ever created |
| Labels page | 12 labels, including `needs-you` and `desk-notify` |
| Personal-Org-Operating-Model | 404 again |

## 4. What is undone
- Line numbers for the large files: records.js, github.js, model.js, home.js, feed.js, sandbox.js, pulls.js, waiting.js, words.mjs, scheduler.js and sender.mjs.
- A second primary read of the code facts. The code at e6dd6b8 is still the only primary source for what the code does.
- Sample A's counts have not been re-checked by anyone other than me.
- Whether any pull request carries a label: an estimate.

## 5. Needed outside my lane
- **Someone with a shell**, at commit e6dd6b8:
  - `grep -n` for each quoted piece of text (the memo names a search string for every citation), which gives the large files' line numbers;
  - `grep -ci merg src/notify/sender.mjs`.
- **The Orchestrator's ruling, through a decision card if needed:** can a function name plus a quoted search string stand in for line numbers on files over about 100 lines? And can the code itself, plus corroboration from GitHub's server, stand as "two sources" for what the code does? If both answers are no, depth 3 can't be met through fetch alone.
- **The owner's word:** is Personal-Org-Operating-Model private? It still returns 404.

## 6. Open questions
None closed as unimportant.
1. S-032 or S-033 for the milestone rule? Two places in the desk's code say S-033.
2. Should sample B be the first ten merged, or a spread across the two weeks?
3. Should sample A be kept as drawn (#258–#268) or as it stands now? #271 has since merged and one PR is open.
4. Answered: the 7-day bound is `SINCE_DAYS` in home.js.
5. Do the `reviews/<milestone>/` folders count as a record that ties a PR to a milestone?
6. New: the `needs-you` label ("A card waits on the owner (the Orchestrator's alerts)"). Does the desk read issues with this label, and is it a ninth kind of waiting?

---

# Research memo — Q-019 — what the desk already shows and reads for pull requests, and which records tie a pull request to its plan — 2026-11-03 (revision 3)

**Researcher.** Depth 3. Research is blind: I have not seen any recommendation, ruling or docs/PROJECT.md.

**How it was read.**
- All reads are of public GitHub through WebFetch, which passes each page through a summarising model.
- Code is pinned to Service-Desk commit e6dd6b8 (`e6dd6b822d64226fc9229fce9cbba7bae57273e2`), written below as `SD:`.
- Pull-request pages and GitHub searches were read live on 2026-11-03.

**How citations work.**
- **Line numbers (`Lnn`)** are given only for seen.js and merges.jsonl. Each was read back whole and numbered, and the count matches GitHub's own file header.
- **Every other citation** is a file, a function, and a quoted string to search for with `grep -n`.
- **Why not line numbers everywhere.** For records.js (GitHub: 1,022 lines), five summariser counts gave 868, 875, 897 and 1,136 for one function and 1,076 lines in total. For sender.mjs (GitHub: 378 lines) a numbered copy ended at line 326.

**Grades.**
- B: a word-for-word quote or full read from the primary source, or a count from GitHub's server.
- C: my inference, or a search for absent text in a file I could not read in full (an *estimate*).
- No A grades.

Every statement is a fact unless marked *estimate*.

**Independence.** Each code fact has one primary source: the code at e6dd6b8. A pull-request page or a GitHub search that agrees is cited as corroboration, not as an independent read of the code.

## 0. Parts not answered, and why
- **Out of bounds by the question's own rules:**
  - What Service-Desk's ` · sprints:` lists contain (they are in docs/PROJECT.md).
  - Whether Model-Lab has a phone sender (Model-Lab may not be read).
- **Can't be reached:** Personal-Org-Operating-Model returns HTTP 404 (read again on 2026-11-03). So I have not checked OPERATING_MODEL.md §3, template-v3/ or specs/.
- **Which model version the rule comes from may not match.** The question says S-032. The desk's code names S-033 in two places:
  - the `Milestone:` line is "model S-033's J1, from 2026-10-17" (SD:src/lib/model.js, `parseRecord`; B);
  - a card's own `Milestone:` line is "model S-033 AC5" (SD:src/lib/records.js, `cardMilestoneLine`; B).

  I can't settle which is right.
- **Not read:** specs/S-001.md (it is not on the may-read list).

## 1. Waiting and merged pull requests on the desk

**What `/` serves.** `/` is "mockup v2 as built (sandbox.js, its routes under #/)", and "the accepted M1 and M2 views (AC43) are gone" from stage 8 (SD:src/public/app.js, header comment; B).

### A pull request waiting on the owner (B)
- **Source.** The REST list `${base}/pulls?state=open&per_page=100` (SD:src/lib/github.js, `urlsFor`).
- **Rule.** `classifyPull` (SD:src/lib/records.js; grep "export function classifyPull"; quoted word for word this round).
  - Its doc comment: "Whether a PR needs the owner (Terms, AC2): open (the list holds only open PRs), not a draft, based on the default branch, and not an Orchestrator item branch in a v3 project … a fork's PR from a branch of that name is flagged like any other (review N7)."
  - It returns not flagged in three cases:
    - `if (pr.draft)` → `'draft'`;
    - `if (pr.base !== project.defaultBranch)` → `` `into ${pr.base}` ``;
    - `project.model === 'v3'`, the head matches `ITEM_BRANCH_RE = /^item\/[A-Za-z0-9._-]+$/`, and `pr.headRepo` (compared ignoring case) is `project.repo` → `'item branch (the Orchestrator merges it)'`.
  - Otherwise it returns `{ flagged: true, why: 'waiting on your review or merge' }`.
  - `ITEM_BRANCH_RE` is defined directly above the 8-line doc comment, so `classifyPull` starts 9 lines after it.
- **The sheet** (SD:src/lib/sandbox.js, `sheetView`). It shows:
  - `what: pr.title`;
  - `why: \`${pr.who}; ${pr.why}\``, where who is `'yours'` or `` `opened by ${pr.login}` `` (SD:model.js, `buildModel`);
  - the link `'Open the pull request in GitHub'` to `pr.url`;
  - a verdict box at `` `reviews/${pr.number}/owner.md` `` on `pr.head`, with a `fork` flag;
  - a reviewer box at `reviews/<n>/reviewer.md`.

  The sheet does not use the PR's description. Whether it shows CI on the default branch's head is an *estimate* (C).
- **Home** (SD:src/lib/home.js, `projectEvents`).
  - It shows `` `Opened: ${pr.title}` ``.
  - It shows up to `COMMIT_LINES` commit lines per PR, then `` `${…} more on #${e.pr}` ``.
  - Merge commits are skipped (`if (x.parents >= 2 …) continue;`).
- **The asks-merge job** (SD:model.js, `buildModel`; grep "AC79 (2026-10-19)").
  - It acts only if `v.head === f.pr.headSha`.
  - While the job is recording a PR, the PR is shown under `BEING_RECORDED_WORDS` and is not counted as waiting.
  - The phone sender leaves job candidates out (`if (jobs.has(n)) continue;`, SD:src/lib/waiting.js, `waitingSet`).
  - sender.mjs logs a count of them: "the automatic job may still merge" (B).

### A merged pull request (B)
- **Source.** The GraphQL `PULLS_QUERY` (SD:github.js) reads `pullRequests(baseRefName: $base, first: 100, after: $after, orderBy: {field: CREATED_AT, direction: DESC})`, with these fields:
  - `number title body state createdAt mergedAt closedAt headRefName`;
  - `mergeCommit { oid message author { name } }`;
  - `changedFiles files(first: 2) { nodes { path } }`;
  - `commits(last: 1) { … statusCheckRollup { state } }`;
  - `pageInfo { hasNextPage endCursor }`.
- **Paging (J12)** (SD:github.js).
  - `PULLS_PAGE = 100` ("100 to a page, with the fields the Timeline and the Queue's deploy check use").
  - `PULLS_COST = 5` ("the read counts 5 against the blob call's budget of 25").
  - `pullsVariables` passes `after`.
  - When the budget would be exceeded, that part comes back `null`.
  - *Estimate* (C): at most five pages (500 PRs) per blob call, fewer if other reads use the budget. Whether the cursor is kept from one poll to the next is not confirmed.
- **Home.** It shows `` `Merged: ${p.title}` `` only when `if (v3 && snap && snap.pulls …)`, so for v3 projects only (SD:home.js, `projectEvents`).
- **Timeline** (SD:src/lib/feed.js). Each merged PR row shows:
  - the mark `{ mark: '✓', word: 'merged' }`;
  - the date, or `'date not recorded'`;
  - `reviewMark`, from tree paths matching `REVIEW_VERDICT_RE` for that number;
  - `checksMark` (SD:src/lib/pulls.js);
  - from `sprintView`: the title, the description's Context and Why, `pr.head`, and a commits link labelled "Opens the pull request's commits on GitHub; each one says who made it."
- **Where a merged PR is placed:**
  1. under the milestone whose plan list names it (`r.sprints[m.id]`);
  2. otherwise under the milestone its `Milestone:` ids name (`named.get(m.id)`);
  3. otherwise in an untied group: "No milestone in the plan lists these sprints, and they name none."
- **Left off the Timeline:**
  - job merges (`pr.job === true`);
  - PRs not yet read (`!pullRead(pr)`);
  - merges that change only estimates (`estimateMerge`) or only value checks (`valueCheckMerge`);
  - open PRs, and PRs closed without merging.

## 2. Which parts of a pull request the desk reads, and which it shows

| Part | Read? | Shown? | Source (B unless marked) |
|---|---|---|---|
| Title | yes | yes, as written | github.js `PULLS_QUERY`; home.js header comment |
| Description | yes | Only Context and Why, on merged Timeline rows. The `Milestone:` line is used for placement; whether it is ever shown as text is an *estimate* (C). The waiting PR's sheet does not use it | pulls.js `MILESTONE_RE = /^Milestone:[ \t]*(.*)$/`, `prBodyParts`; sandbox.js `sheetView` |
| Form of the `Milestone:` line | the desk "reads it and checks no form (the model's checks do, in the project's own CI)" | — | records.js `milestoneValue` comment |
| Diff | not in the query's field list | no | `PULLS_QUERY` |
| Changed files | GraphQL: the count plus 2 paths; REST `/pulls/<n>/files`, at most 3 pages of 100 | not shown. Used for recorded answers, job candidates and estimate- or value-check-only merges | prfiles.js header; pulls.js `estimateOnly`, `valueCheckOnly` |
| Commits | the last commit's check rollup; REST `/pulls/<n>/commits` | commit first lines on Home; a commits link on merged rows | github.js `urlsFor`; home.js |
| Checks | rollup state | `checksMark` on merged rows (✓ ✕ … –) | pulls.js `checksMark` |
| GitHub reviews, review requests, labels | not among `PULLS_QUERY`'s fields or `urlsFor`'s URLs. That the desk reads them nowhere else is an *estimate* (C) | no | github.js |
| GitHub milestone | not among the query's fields. The repository has none: "You haven't created any Milestones" | no | github.js; GitHub milestones page |
| Review verdict files | `reviews/<n>/*.md` on the default branch | review mark | feed.js `reviewMark`; reviews/README |
| Merge commit | oid, message, author | sets "job merge": author `'github-actions[bot]'` and exactly one `Merged-By: orchestrator` trailer | pulls.js `isJobMerge` |
| Author association | yes | an outside author's PR is notified without its title | waiting.js `outsideAuthor`; words.mjs `itemWords` |

**A later change may matter.** reviews/README says reviewers post verdicts as PR reviews from stage T2. The desk would not see those (*estimate*, C).

## 3. How "waits on the owner" is decided, and what it leaves out
- **Kinds.** `KINDS` in waiting.js lists eight: decision card, gate ruling, held loop, merge to do by hand, a card that went missing, question, pull request to merge, deploy to approve (B).
- **The `needs-you` label.** The repository has one ("A card waits on the owner (the Orchestrator's alerts)", labels page; B). Whether the desk reads it is not established (open question 6).
- **Not flagged** (B):
  - drafts;
  - PRs into a non-default branch;
  - same-repository `item/*` heads in v3 projects;
  - repositories not in src/config/projects.json.

  PRs the job is recording are shown but not counted.
- **Not used by `classifyPull`:** review requests, review state, labels, GitHub milestone, the PR's own checks, mergeability. Its quoted code tests only `draft`, `base`, `head` and `headRepo` (B).
- **Deploys.** Only where `"deploysNeedOwner": true`, which is Service-Desk alone (projects.json; B). The row reads `` `${title}: waiting for your approval` `` and `` `run ${r.runNumber}; its approver: ${NOT_RECORDED}` `` (model.js `buildModel`; B).

## 4. Changes that are not pull requests
- **Deploys.** Only waiting runs are shown (B). That nothing shows finished deploys is an *estimate* (C).
- **Direct commits.** Home's commit lines come only from each PR's own commits, and merge commits are skipped (B). That Home shows no direct commits to the default branch is an *estimate* (C).
- **The Timeline** has a `commits/${tip}` history link (feed.js `tasks`; B). It is a link, not a list.
- **Record-only commits** show only as the events their records produce (home.js `projectEvents`; B):
  - `Your answer recorded` and `Card answered`;
  - `` `Reached: ${m.name}` ``;
  - `` `withdrawn: ${path}` `` (model.js). The scheduler keeps the last 10: `st.withdrawn = [...].slice(-10)` (scheduler.js).

## 5. Freshness, and changes after a row is listed
- **Polling** (scheduler.js; B).
  - `POLL_MS = 60_000` per project and `PORTFOLIO_POLL_MS = 300_000`.
  - A project is called stale after `STALE_MS = 180_000`.
  - Polling stops when the page is not visible (`if (!desk.running || !isVisible())`).
- **Times are kept per project only:** `lastSuccessAt`, `lastPollStart`, `recheckedAt`. I saw no time kept per row (B; that there is none is C).
- **What Home says.** `` `Every project read ${…}ago` `` (home.js `briefingView`) and `` `checked ${…} ago` `` (`titleLine`) (B).
- **A PR that changes after it is listed:**
  - the row is rebuilt on each poll (*estimate*, C);
  - the job's state counts only while `v.head === f.pr.headSha` (B).
- **No second notification on a change.**
  - The key is `` `${project}|${kind}|${id}` `` (waiting.js `waitKey`; B).
  - A key already sent or given up is carried forward and not sent again: `if (!bootstrap && e && (e.sent || e.gaveUp)) next.keys[h] = e;` (sender.mjs `runSender`; B).
  - So a PR that changes does not notify again (*estimate*, C).

## 6. Phone notifications, by project
- **Service-Desk.**
  - The handover says "Service-Desk's sender sends a phone notification the moment something starts waiting on you there" (docs/handover/service-desk.md; B). The sender is the `desk-notify` workflow (B).
  - Wording (words.mjs; B):
    - `itemWords`: the title is the project's name; the body reads "Waits on you: <kind words>: <what>", or "Waits on you: a pull request from someone outside the project".
    - `groupWords`: the title is `DESK_TITLE` ('Service Desk'); the body reads "<n> things now wait on you in <project>".
  - A tap opens `` `${deskUrl}/?open=${key}` ``, with deskUrl `https://needs-you.pages.dev` (B).
- **Personal-Org-Operating-Model.** The handover: "The operating-model project has no sender yet (found 2026-10-30: Setup N9 and CS16 were never done), so its items show on the desk but don't notify the phone" (B).
- **Model-Lab.** It is in projects.json as v3 (B). It was added by PR #263, merged 2026-11-01. Whether it has a sender is out of bounds (§0).
- **Merged changes are not notified: an *estimate* (C), now resting on a list of every send call** (sender.mjs; B for the list).
  - The items come from `c = await collect({ project, config, checkout, gh, … })`.
  - The 7 `deliver(` calls send: `backOnWords`, `testWords`, `summaryWords` (two calls: when the sender is first set up, and when nothing waits), `groupWords`, `itemWords`, and `costWords`.
  - The one `pushOnce(` call is in `failTest`.
  - None is for merges. This stays C because the list came from a summariser, not grep.

## 7. Records that tie a pull request to a milestone, sprint, spec or plan

| Record | What it ties | What the desk does with it | Source |
|---|---|---|---|
| The description's `Milestone:` line | PR → milestone ids, or `none (<reason>)` | `milestoneValue` splits ids on `', '` and checks no form. Used to place merged PRs | records.js `milestoneValue`; pulls.js `MILESTONE_RE` (B) |
| The plan's ` · sprints:` | milestone → PRs and items: `PR #\d+` or `[PQE]-\d{3,}`, split on `', '` | read; takes precedence over the PR's own line | j11.js `milestoneLines` (B). Contents out of bounds |
| status/`<item>`.toml `milestone` | research item → milestone | read | e.g. status/Q-019.toml `milestone = "Discovery-5"` (B) |
| status/merges.jsonl | item → `item_tip`, `merge` SHA, `spec` | read for the merge gate | L1–L10, read in full (B). See below |
| dispatch-log/2026-11.jsonl | item → role, stage, spec, record, session… | read. 15 lines, no PR-number or milestone field | dispatch-log (B) |
| reviews/`<n>`/ | PR → verdicts | review mark | reviews/README (B) |
| reviews/`<M…>`/ (M3B, M3C, M3D, M3E, M3G) and reviews/`<item>`/ | milestone or item → reviews | not read by the per-PR review mark (*estimate*, C) | reviews/ listing at e6dd6b8 |
| Merge commit | PR → merge SHA and trailers | marks job merges | pulls.js `isJobMerge` (B) |
| GitHub milestone | none exist in the repository | — | milestones page (B) |
| GitHub labels | 12 exist; on every sampled PR, none | — | labels page; samples (B). All 265 PRs unlabelled: *estimate* (C) |
| Spec headers | not read as such; `spec` appears only as a field | — | records.js (B) |

**status/merges.jsonl, read in full (B).**
- **Items:** L1 Q-001, L2 Q-004, L3 Q-002, L4 Q-005, L5 Q-006, L6 Q-008, L7 Q-007, L8 Q-011, L9 Q-013, L10 Q-016. Every line has `"spec": null`.
- **Merge SHAs, first 7 characters:** 92e1dd0, 22afcd0, 2253706, 108bdd5, a6435a2, e207665, 581b312, 5de587e, 3a0f0c9, 167038a.
- **No match with sample A.** None of sample A's merge SHAs (fa50572, 8806dba, 1d7992b, 5f6454b, 95d114f, 6b8f83b, c0d6ef8, eb249cd, e300411, 7a91b6a) is among them.
- **No PR-number key.** So nothing in this file ties a merge to a PR.

### Samples
All read from GitHub pages on 2026-11-03 (B).

**Sample A, as drawn: the open PR #268 and the last ten merged, #258–#267 (11 PRs)**
- **`Milestone:` line: 11/11.**
  - Naming ids, 6/11: #267 "Discovery-5, Discovery-4"; #266 and #265 "Discovery-3"; #260, #259 and #258 "M3C".
  - `none (…)`, 5/11: #268, #264, #263, #262, #261.
- **Sections "What this means for you / Context / Why / Tasks":** 11/11.
- **Spec id S-001 in the description:** 4/11 (#258, #259, #260, #263).
- **`reviews/<n>/` folder at e6dd6b8:** 2/11 (#259, #263).
- **GitHub milestone:** 0/11; the repository has none.
- **Labels:** 0/11.
- **Head branches:** none is `item/*`.
  - #258–#260 share `claude/ui-visual-emphasis-vfrpri`.
  - #264–#266 share `claude/pr-briefing-visual-update-2zbuth`.
  - #263 is `orch/add-model-lab`; #267 is `claude/chief-of-staff-pr-briefing-7hv15p`.
- **Merge SHAs:** none is in merges.jsonl (B, above).

**Sample A, as it stands now.**
- On the redraw earlier today, the last ten merged were #260–#269, with 0 open.
  - `Milestone:` line: 10/10 (ids 4/10, `none` 6/10).
  - Spec id: 2/10.
  - `reviews/<n>/`: 1/10.
- A later search shows #271 merged and 1 PR open, so "now" keeps moving.

**Sample B: the first ten merged, #1–#10 (2026-09-30 to 10-01)**
- **`Milestone:` line: 0/10.**
  - GitHub's own search agrees: 0 of the 16 merged PRs created before 2026-10-02 have the word "milestone" anywhere in the description (B, from GitHub's server). This fits a rule dated 2026-10-17.
- **GitHub milestone or labels:** 0/10.
- **Headings:** not uniform. They range from #1's "What this changes / … / Owner action" to none at all in #7, #8 and #9.
- **A Q-### id in the description:** 8/10.
- **`reviews/<n>/`:** 3/10 (#5, #6, #10).

**Choice of sample B.** It was taken as #1–#10; a spread across the two weeks may differ (*opinion*).

## 8. Milestones and progress, and whether they name pull requests
- **Home.** The phase grid is `PHASES = ['Discovery', 'Design', 'Build', 'Launch', 'Done']`, and Home shows `Reached: <milestone>` events. Neither names PRs (home.js; B).
- **Timeline (v3).** Each milestone lists its merged PRs as sprint rows (§1). PRs tied to no milestone are grouped together with the words `· for the agents to file` (feed.js; B).
- **v2.5 projects.** The desk reads open sprint files instead, with `'sprint unclear'` (model.js `finishV25`; B).

## 9. Marks of what the owner has seen or done
- **Seen: on this device only** (SD:src/lib/seen.js, read in full; 97 lines, matching GitHub's header; B).
  - **L1–L5:** "'New since you last looked' (spec S-001, AC40). 'Last looked' is the end of the last window in which the desk was visible on this device for at least 10 s in a row; a shorter flash doesn't count. It is kept on the device only, under its own key, through the wrapped store (J5's rule), and nothing is stored on Cloudflare. With no record (first visit, a private window, cleared or failing storage) nothing is marked new and the desk says so."
  - **L7–L9:** `SEEN_KEY = 'desk-seen-v1'`, `SEEN_MIN_MS = 10_000` ("a constant to tune in the lab"), `MARKERS_OFF = 'new-since markers off on this device'`.
  - **L49–L58:** while the "<n> more since <time>" sheet is open, `hold` keeps "last looked" from moving (AC89).
  - **L59–L73:** `hidden()` saves `{ lastLooked: end }` when the visible window lasted at least 10 s and the sheet is not holding it.
  - **L74–L88:** `markSeen()` ("Mark as seen", AC40 as AC82 changes it) sets "last looked" to now, on this device.
  - **No 7-day limit here.** The file has no 7-day constant (full read).
- **The 7-day bound** is in home.js (B): `export const SINCE_DAYS = 7;` ("At most the last 7 days (AC82, C)"), used in `sinceView` as `const floor = nowMs - SINCE_DAYS * 86400e3;`. PR #180 (merged 2026-10-21) also mentions "Mark as seen" and "the 7-day bound" (B; corroborates the feature, not where the mark is stored).
- **Done: shared, because it lives in git.**
  - Answers are committed through GitHub's new-file page, and "the desk itself writes nothing" (handover; B).
  - The desk reads them back as "Your answer recorded" and "Card answered" (B).
  - For PRs, the only done marks are GitHub's own state and a `reviews/<n>/owner.md` verdict (B).

## Proposed library entries (for the Source checker)

Each source comment names the text to grep. Line numbers are given only where a full read matched GitHub's count.

```
---
id: F-desk-pr-01
form: fact
claim: "At Service-Desk commit e6dd6b8, classifyPull (src/lib/records.js) returns flagged:false for a draft ('draft'), for a base other than the project's default branch, and in v3 projects for a head matching ITEM_BRANCH_RE (^item/…) from the project's own repository (a fork's same-named branch is flagged); otherwise { flagged: true, why: 'waiting on your review or merge' }. Pull requests the asks-merge job is recording at their current head are shown as being recorded, not counted (model.js, AC79); job candidates are left out of notifications (waiting.js waitingSet, 'jobs.has(n)')."
grade: B
topics: [desk, pull-requests, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js   # grep "export function classifyPull"; 9 lines below "export const ITEM_BRANCH_RE"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/model.js     # grep "AC79 (2026-10-19)"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js   # grep "jobs.has(n)"
---
---
id: F-desk-pr-02
form: fact
claim: "At e6dd6b8 merged pull requests appear as 'Merged: <title>' on Home for v3 projects (home.js projectEvents) and as Timeline sprint rows (feed.js sprintView) with a merged mark, date, review mark from reviews/<n>/ files, checks mark, the description's Context and Why, the head branch and a commits link; placement is the plan's ' · sprints:' list, else the description's Milestone: ids, else an untied group. The desk checks no form of the Milestone: line (records.js milestoneValue). Pull requests are read by GraphQL at 100 a page, each read costing 5 of a budget of 25 (github.js PULLS_PAGE, PULLS_COST). The waiting pull request's sheet (sandbox.js sheetView) does not use the description."
grade: B
topics: [desk, pull-requests, milestones]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/feed.js     # grep "No milestone in the plan lists these sprints"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js     # grep "Merged: "
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/sandbox.js  # grep "function sheetView"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/github.js   # grep "PULLS_PAGE", "PULLS_COST"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js  # grep "checks no form"
---
---
id: F-desk-notify-01
form: fact
claim: "At e6dd6b8 the desk's sender keys each waiting item as <project>|<kind>|<id> and carries forward, without resending, a key already sent or given up; an item's notification reads 'Waits on you: <kind words>: <title>' (title: the project's name), a group reads '<n> things now wait on you in <project>' (title: 'Service Desk'). The handover (2026-10-30 finding) says Service-Desk has a sender and Personal-Org-Operating-Model has none."
grade: B
topics: [desk, notifications]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/words.mjs   # grep "function itemWords", "function groupWords"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js     # grep "waitKey"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/sender.mjs  # grep "e.sent || e.gaveUp"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/docs/handover/service-desk.md  # grep "has no sender yet"
---
---
id: F-desk-seen-01
form: fact
claim: "At e6dd6b8 the desk's 'last looked' mark is kept on the device only, under key desk-seen-v1 as { lastLooked }, moved when a visible window of at least 10 s ends (not while the '<n> more since' sheet holds it) or at once by 'Mark as seen'; the file's header says nothing is stored on Cloudflare. Home lists new-since lines from at most the last 7 days (home.js SINCE_DAYS = 7)."
grade: B
topics: [desk, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js#L1-L9    # also L59-L88; file 97 lines per GitHub header, read in full
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js          # grep "SINCE_DAYS"
  - https://github.com/shumpmaster/Service-Desk/pull/180   # corroborates 'Mark as seen' and the 7-day bound; silent on storage
---
---
id: F-desk-records-01
form: fact
claim: "At e6dd6b8 Service-Desk's status/merges.jsonl has 10 lines, all question items (Q-001 to Q-016), keys item, item_tip, merge, spec, with spec null on every line and no pull-request-number key; none of the merge SHAs of PRs #258-#267 appears in it. dispatch-log/2026-11.jsonl (15 lines) has no pull-request-number field. The repository has no GitHub milestones. Sample read 2026-11-03: a 'Milestone:' description line in 11/11 of PRs #258-#268 (6 naming ids, 5 'none (...)') and 0/10 of PRs #1-#10 (GitHub search: 0 of 16 merged PRs created before 2026-10-02 contain 'milestone' in the description)."
grade: B
topics: [records, pull-requests, milestones]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/status/merges.jsonl#L1-L10
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/dispatch-log/2026-11.jsonl
  - https://github.com/shumpmaster/Service-Desk/milestones?state=all
  - https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+milestone+in%3Abody+created%3A%3C2026-10-02
  - https://github.com/shumpmaster/Service-Desk/pull/258   # through /pull/268, and /pull/1 through /pull/10
---
```

Sources:
- [Service-Desk tree at e6dd6b8](https://github.com/shumpmaster/Service-Desk/tree/e6dd6b822d64226fc9229fce9cbba7bae57273e2)
- [records.js at e6dd6b8 (raw)](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js) and [GitHub view, 1,022 lines](https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js?plain=1)
- [seen.js at e6dd6b8, 97 lines](https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js)
- [home.js at e6dd6b8](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js)
- [sender.mjs at e6dd6b8, 378 lines](https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/sender.mjs)
- [merges.jsonl at e6dd6b8](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/status/merges.jsonl)
- [Commits touching records.js](https://api.github.com/repos/shumpmaster/Service-Desk/commits?sha=e6dd6b822d64226fc9229fce9cbba7bae57273e2&path=src/lib/records.js&per_page=3) and [commit b25d0de's diff](https://github.com/shumpmaster/Service-Desk/commit/b25d0de5e5f498ebf1bd04b7478a67a11650867e.diff)
- [Milestones](https://github.com/shumpmaster/Service-Desk/milestones?state=all), [Labels](https://github.com/shumpmaster/Service-Desk/labels)
- [Search: merged before 2026-10-02 with "milestone" in the description (0)](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+milestone+in%3Abody+created%3A%3C2026-10-02), [the same without the word (16)](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+created%3A%3C2026-10-02)
- [Search: no milestone and no label (265)](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+no%3Amilestone+no%3Alabel), [all PRs (265)](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr)
- [PR #180](https://github.com/shumpmaster/Service-Desk/pull/180), [PR #263](https://github.com/shumpmaster/Service-Desk/pull/263), [PR #267](https://github.com/shumpmaster/Service-Desk/pull/267); PR pages /pull/1 to /pull/10 and /pull/258 to /pull/269
- [Personal-Org-Operating-Model (404)](https://github.com/shumpmaster/Personal-Org-Operating-Model)