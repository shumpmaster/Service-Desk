# Six-part return: Q-019, researcher, revision 2 (2026-11-03)

## 1. What I changed
The full revised memo is below, for the Orchestrator to record as research/Q-019-memo.md. Against the round-2 source check:

- **Corrected: a quote I invented.** Revision 1 said github.js states that reviews, labels and milestone "do not appear". A fresh read finds no such comment. The claim now rests on the fields `PULLS_QUERY` asks for, which are listed and can be read. That reviews, labels and milestone are not among them is my inference (C). §2, §3 and F-desk-pr-01 are reworded to match.
- **Negative searches downgraded to estimates.** The checker pointed out that a summarising fetch cannot prove a word is missing from a file. Two claims rested on such searches:
  - the sender.mjs word search;
  - the check that none of the ten merge SHAs is in merges.jsonl.

  Both are now marked C. F-desk-notify-02 is withdrawn from the library proposals and stays in the memo as an estimate. The SHA check and "spec null on all" are taken out of F-desk-records-01's claim.
- **Headings of #263 and #267, re-read.**
  - #263: What this means for you / Milestone line / Context / Why / Tasks. Head branch `orch/add-model-lab`.
  - #267: What this means for you / Context / Why / Tasks. Head branch `claude/chief-of-staff-pr-briefing-7hv15p`.
  - So all 11 PRs in sample A carry the four sections.
- **The desk's PR paging (J12), new reading.** `PULLS_PAGE = 100`, and each read costs `PULLS_COST = 5` against "the blob call's budget of 25". When the budget runs out, the PR data comes back `null`. Whether the cursor is kept from one poll to the next is an estimate (C).
- **Questions moved from "undone" to "out of bounds".** The question says to name places that may not be read and not answer them:
  - Model-Lab's sender: Model-Lab may not be read.
  - The contents of ` · sprints:`: they are in docs/PROJECT.md.
  - S-032 or S-033: Personal-Org-Operating-Model still returns 404 when I fetch it.
- **A second source where one exists.**
  - PR #180's description names "Since you last looked" with "Mark as seen". It does not say where the mark is stored.
  - PR #263 corroborates that Model-Lab was added.
  - seen.js re-read: the "kept on the device only … nothing is stored on Cloudflare" quote is confirmed.
- **Line numbers.** I give none. See §2.

## 2. Why
The check failed the memo for five reasons:
- facts that rested on negative searches;
- no second independent source;
- no line numbers;
- sources it did not reopen;
- items the memo left undone.

I fixed what I can from inside my lane. Three of the five can't be fixed from inside it:
- **Line numbers.** One fetch of records.js named `classifyPull`'s line as 868 and also said 1,135 newlines come before it, which would put it at line 1,136. The summariser can't count lines, so any number I gave would be made up.
- **Independent sources.** For what the code does, the code is the only primary source. A truly independent read needs one that doesn't go through a summariser. I can add corroboration from PR pages, but not a second primary source.
- **Unopened sources.** The checker not reopening them is its own step, not mine.

## 3. What I verified
I have no shell, so I ran no commands. I made 10 WebFetch reads:

| Read | Result |
|---|---|
| records.js `classifyPull` | Quoted again; matches the memo. The line number contradicts itself (868 vs 1,136). |
| Sourcegraph blob page (tried for line numbers) | 404 |
| Personal-Org-Operating-Model | 404 |
| PR #263, PR #267 | Headings, branches, milestone line, no GitHub milestone or labels |
| github.js (2 reads) | Paging constants quoted; no "do not appear" comment |
| PR search "item branch" | Only #5 and #10, which are irrelevant, so no corroboration for the item-branch rule |
| PR search "seen", then PR #180 | "Mark as seen" corroborated; storage not stated |
| seen.js | Header and constants confirmed. The summariser found no 7-day constant, although PR #180 mentions "the 7-day bound". Not settled. |

## 4. What is undone
- Exact line numbers for every file.
- A second read of each load-bearing code fact that doesn't go through a summariser.
- Whether merges are notified, and whether the merge SHAs are in merges.jsonl. Both stay estimates until someone can search the raw files.
- Where the "7-day bound" from PR #180 lives in the code.
- Whether the PR cursor carries from one poll to the next.

## 5. Needed outside my lane
- **Someone with a shell** (Orchestrator, Builder or Source checker) needs to run, at e6dd6b8:
  - `grep -n` for each quoted piece of text, which gives real line numbers and an independent read;
  - `grep -c` for merged/mergedAt in sender.mjs and for the ten SHAs in status/merges.jsonl.
- **Owner's word, through a Chief of Staff decision card:** is Personal-Org-Operating-Model private? If it is, this pack can't settle S-032 vs S-033 or §3 of the template.
- **The Orchestrator's ruling:** do function-name citations meet "which file and lines"? If not, depth 3 can't be reached through fetch alone.

## 6. Open questions
None closed. Number 4 is new.
1. S-032 or S-033 for the milestone rule? The desk's code comment says S-033, from 2026-10-17.
2. Should sample B be the first ten merged, or a spread across the two weeks?
3. Should sample A be kept as drawn (#258–#268) or as it stands now (#260–#269)?
4. Where is the "7-day bound" on the seen mark, which PR #180's description mentions?
5. Do the reviews/<milestone>/ folders count as a record that ties a PR to a milestone?

---

# Research memo — Q-019 — what the desk already shows and reads for pull requests, and which records tie a pull request to its plan — 2026-11-03 (revision 2)

**Researcher.** Depth 3. Research is blind: I have not seen any recommendation, ruling or docs/PROJECT.md.

**How it was read.** Everything comes from public GitHub, read with WebFetch, which passes each page through a summarising model. Code is pinned to Service-Desk commit e6dd6b8 (`e6dd6b822d64226fc9229fce9cbba7bae57273e2`), written below as `SD:`. Pull-request pages were read live on 2026-11-03.

**How citations work.** Each place is named by file, function and a quoted piece of text that can be found with `grep -n`. **No line numbers are given.** The summariser's line counts contradict themselves: one read of `classifyPull` gave line 868 and also 1,135 earlier newlines. Line numbers need a read that doesn't go through a summariser (see the return, §5).

**Grades.**
- B: text quoted by the summarising fetch.
- C: my own inference, or a search for absent text (an *estimate*).
- No A grades.

Every statement is a fact unless marked *estimate*.

**Independence.** Each code fact has one primary source: the code at e6dd6b8. Where a PR page says the same thing, I cite it as corroboration. It is not an independent read of the code.

## 0. Parts not answered, and why
- **Out of bounds by the question's own rules:**
  - The contents of Service-Desk's ` · sprints:` lists (docs/PROJECT.md).
  - Whether Model-Lab has a phone sender (Model-Lab may not be read). Nothing I may read answers it: Service-Desk's handover never names Model-Lab.
- **Can't be reached:** Personal-Org-Operating-Model returns HTTP 404, read again on 2026-11-03. So I have not checked OPERATING_MODEL.md §3, template-v3/ or specs/.
- **The rule's version may not match.** The desk's own comment dates the `Milestone:` line to "model S-033's J1, from 2026-10-17" (SD:src/lib/model.js, `parseRecord`; B). The question says S-032. I can't settle which is right.
- **Not read:** specs/S-001.md (not on Service-Desk's may-read list).

## 1. Waiting and merged pull requests on the desk

**What `/` serves.** `/` is "mockup v2 as built (sandbox.js, its routes under #/)", and "the accepted M1 and M2 views (AC43) are gone" from stage 8 (SD:src/public/app.js, header comment; B).

### A pull request waiting on the owner (B)
- **Source.** REST `${base}/pulls?state=open&per_page=100` (SD:src/lib/github.js, `urlsFor`).
- **Rule.** `classifyPull` (SD:src/lib/records.js; quoted again this round) returns not flagged in three cases:
  - `if (pr.draft)` → `'draft'`;
  - `if (pr.base !== project.defaultBranch)` → `` `into ${pr.base}` ``;
  - `project.model === 'v3'`, the head matches `ITEM_BRANCH_RE = /^item\/[A-Za-z0-9._-]+$/`, and `pr.headRepo` is the project's own repository → `'item branch (the Orchestrator merges it)'`.

  Otherwise it returns `{ flagged: true, why: 'waiting on your review or merge' }`.
- **The sheet.** `sheetView` (SD:src/lib/sandbox.js) shows:
  - `what: pr.title`;
  - `why: \`${pr.who}; ${pr.why}\``, where who is `'yours'` or `` `opened by ${pr.login}` `` (SD:model.js, `buildModel`);
  - the link `'Open the pull request in GitHub'` to `pr.url`;
  - a verdict box at `` `reviews/${pr.number}/owner.md` `` on `pr.head`, with a `fork` flag;
  - a reviewer box at `reviews/<n>/reviewer.md`.

  The sheet does not use the PR's body.
- **CI on the sheet.** The summary said the sheet shows "CI on [default branch]'s head", but I did not see the text quoted (*estimate*, C).
- **Home.**
  - It shows `` `Opened: ${pr.title}` `` (SD:src/lib/home.js, `projectEvents`).
  - It shows up to `COMMIT_LINES` commit lines per PR, then `` `${…} more on #${e.pr}` ``.
  - Merge commits are skipped (`if (x.parents >= 2 …) continue;`).
- **The asks-merge job** (SD:model.js, `buildModel`, comment "AC79 (2026-10-19): the asks-merge job's pull requests it may still merge: shown, not counted").
  - It acts only if `v.head === f.pr.headSha`.
  - While the job is recording, the PR is moved out of `flagged` into a `beingRecorded` list with `BEING_RECORDED_WORDS`. It is still shown, but not counted as waiting.
  - The phone sender leaves job candidates out (`if (jobs.has(n)) continue;`, SD:src/lib/waiting.js, `waitingSet`).

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
  - When the budget would be exceeded, that part comes back `null` (B, summarised).
  - *Estimate* (C): at most five pages, so 500 PRs, per blob call, and fewer if other reads use the budget. The summariser read "the page sends only its cursor" as meaning the cursor is kept between polls. I have not confirmed that.
- **Home.** It shows `` `Merged: ${p.title}` `` under the condition `if (v3 && snap && snap.pulls …)`, so v3 projects only (SD:home.js, `projectEvents`).
- **Timeline** (SD:src/lib/feed.js). Each merged PR row shows:
  - the mark `{ mark: '✓', word: 'merged' }`;
  - the date, or `'date not recorded'`;
  - `reviewMark`, from tree paths matching `REVIEW_VERDICT_RE` for that number;
  - `checksMark` (SD:src/lib/pulls.js);
  - from `sprintView`: the title, the body's Context and Why, `pr.head`, and a commits link labelled "Opens the pull request's commits on GitHub; each one says who made it."
- **Where a merged PR is placed:**
  1. under the milestone whose plan list names it (`r.sprints[m.id]`);
  2. otherwise under the milestone its `Milestone:` ids name (`named.get(m.id)`);
  3. otherwise in an untied group: "No milestone in the plan lists these sprints, and they name none."
- **Left off the Timeline:**
  - job merges (`pr.job === true`);
  - PRs not yet read (`!pullRead(pr)`);
  - `estimateMerge` and `valueCheckMerge` merges;
  - open PRs, and PRs closed without merging.

## 2. Which parts of a pull request the desk reads, and which it shows

| Part | Read? | Shown? | Source (B unless marked) |
|---|---|---|---|
| Title | yes | yes, as written ("a title [is] shown as written") | github.js `PULLS_QUERY`; home.js header comment |
| Body | yes | Only Context and Why, on merged Timeline rows. The `Milestone:` line is used for placement; whether it is ever shown as text is an *estimate* (C). Not used by the waiting sheet | pulls.js `MILESTONE_RE = /^Milestone:[ \t]*(.*)$/`, `prBodyParts`, `afterOpening`; sandbox.js `sheetView` |
| Diff | not in the query's field list | no | `PULLS_QUERY` |
| Changed files | GraphQL: count plus 2 paths; REST `/pulls/<n>/files`, at most 3 pages of 100 | not shown. Used for recorded answers, job candidates and estimate- or value-check-only merges | prfiles.js header; pulls.js `estimateOnly`, `valueCheckOnly` |
| Commits | last commit's rollup; REST `/pulls/<n>/commits` | commit first lines on Home; a commits link on merged rows | github.js `urlsFor`, `readBlobs`; home.js |
| Checks | rollup state | `checksMark` on merged rows (✓ ✕ … –) | pulls.js `checksMark` |
| GitHub reviews, review requests, labels, GitHub milestone | not among `PULLS_QUERY`'s fields or `urlsFor`'s REST URLs; that the desk reads them nowhere else is an *estimate* (C) | no | github.js `PULLS_QUERY`, `urlsFor` |
| Review verdict files | `reviews/<n>/*.md` on the default branch | review mark | feed.js `reviewMark`; reviews/README |
| Merge commit | oid, message, author | sets "job merge": `isJobMerge` checks author `'github-actions[bot]'` and exactly one `Merged-By: orchestrator` trailer | pulls.js `isJobMerge` |
| Author association | yes | an outside author's PR is notified without its title | waiting.js `outsideAuthor`, `waitingSet`; words.mjs `itemWords` |

**A later change may matter.** reviews/README says reviewers post verdicts as PR reviews from stage T2 (B, summarised). By the table above, the desk would not see those (*estimate*, C).

## 3. How "waits on the owner" is decided, and what it leaves out
- **Kinds.** `KINDS` in waiting.js lists eight: decision card, gate ruling, held loop, merge to do by hand, a card that went missing, question, pull request to merge, deploy to approve (B).
- **Not flagged:**
  - drafts;
  - PRs into a non-default branch;
  - same-repository `item/*` heads in v3 projects;
  - repositories not in src/config/projects.json.

  PRs the job is recording show as "being recorded" but are not counted (B).
- **Not used by `classifyPull`:** review requests, review state, labels, GitHub milestone, the PR's own checks, mergeability. Its quoted code tests only `draft`, `base`, `head` and `headRepo` (B).
- **Deploys.** Only where `"deploysNeedOwner": true`, which is Service-Desk alone (projects.json; B). The row reads `` `${title}: waiting for your approval` `` and `` `run ${r.runNumber}; its approver: ${NOT_RECORDED}` `` (model.js `buildModel`; B).

## 4. Changes that are not pull requests
- **Deploys.** Only waiting runs are shown (B). That no finished-deploy display exists anywhere is an *estimate* (C).
- **Direct commits.** Home's commit lines come only from each PR's own commits, and merge commits are skipped (B). That Home shows no direct commits to the default branch is an *estimate* (C).
- **Runs.** A `commits/${tip}` history link on the Timeline (feed.js `tasks`; B). This is a link, not a list.
- **Record-only commits** appear only as events their records produce (home.js `projectEvents`; B):
  - `Your answer recorded` and `Card answered`;
  - `` `Reached: ${m.name}` ``;
  - `` `withdrawn: ${path}` `` (model.js `buildModel`). The scheduler keeps the last 10: `st.withdrawn = [...].slice(-10)` (scheduler.js).

## 5. Freshness, and changes after a row is listed
- **Polling.** `POLL_MS = 60_000` per project and `PORTFOLIO_POLL_MS = 300_000`. A project is called stale after `STALE_MS = 180_000`. Polling stops when the page is not visible (`if (!desk.running || !isVisible())`) (scheduler.js; B).
- **Read times are kept per project only:** `lastSuccessAt`, `lastPollStart`, `recheckedAt`. I saw no time kept per row (B, and absence is C).
- **What Home says.** `` `Every project read ${…}ago` `` (home.js `briefingView`) and `` `checked ${…} ago` `` (`titleLine`) (B).
- **A PR that changes after it is listed:**
  - The row is rebuilt on each poll (*estimate*, C).
  - The job's state counts only while `v.head === f.pr.headSha` (B).
- **No second notification on change.** A key is `` `${project}|${kind}|${id}` `` (waiting.js `waitKey`), and keys already `sent` or `gaveUp` are kept, not sent again (sender.mjs `runSender`, "e.sent || e.gaveUp"; B). So a changed PR does not notify again (*estimate*, C).

## 6. Phone notifications, by project
- **Service-Desk.**
  - The handover: "Service-Desk's sender sends a phone notification the moment something starts waiting on you there" (docs/handover/service-desk.md; B; confirmed by the checker). The sender is the `desk-notify` workflow (B).
  - Wording (words.mjs; B):
    - `itemWords`: title is the project name; body "Waits on you: <kind words>: <what>", or "Waits on you: a pull request from someone outside the project".
    - `groupWords`: title `DESK_TITLE` ('Service Desk'); body "<n> things now wait on you in <project>".
  - The tap opens `` `${deskUrl}/?open=${key}` ``, with deskUrl `https://needs-you.pages.dev` (projects.json; B).
- **Personal-Org-Operating-Model.** "The operating-model project has no sender yet (found 2026-10-30: Setup N9 and CS16 were never done), so its items show on the desk but don't notify the phone" (handover; B; confirmed by the checker).
- **Model-Lab.**
  - It is in projects.json as v3 (B). PR #263, "Put Model-Lab on the desk…", added it, merged 2026-11-01 by shumpmaster (PR page; B).
  - The handover names only "today Service-Desk and Personal-Org-Operating-Model" (B; confirmed by the checker).
  - Whether Model-Lab has a sender: **out of bounds** (§0).
- **Merged changes not notified: an *estimate* (C) only.**
  - sender.mjs `runSender` sends from the collected waiting set (B).
  - The word functions it calls are item, group, summary, back-on, test, fail-test and cost. None is named for merges (B).
  - A summarised search found no "merged", "mergedAt", "completed" or "success" in sender.mjs. That is not proof the words are absent, and it needs `grep`.

## 7. Records that tie a pull request to a milestone, sprint, spec or plan

| Record | What it ties | What the desk does with it | Source (B unless marked) |
|---|---|---|---|
| PR body `Milestone:` line | PR → milestone ids, or `none (<reason>)` | `milestoneValue` splits ids on `', '` and reads `none (…)`. Used to place merged PRs | records.js `milestoneValue`; pulls.js `MILESTONE_RE` |
| Plan's ` · sprints:` | milestone → PRs and items. Ids `PR #\d+` or `[PQE]-\d{3,}`, split on `', '` | read; takes precedence over the PR's own line | j11.js `milestoneLines`. Contents out of bounds |
| status/`<item>`.toml `milestone` | research item → milestone | read | status/Q-019.toml `milestone = "Discovery-5"`; status/README |
| status/merges.jsonl | item → `item_tip`, `merge` SHA, `spec` | read for the merge gate. 10 lines, keys `item, item_tip, merge, spec`; **no PR-number key**. That none of #258–#267's merge SHAs appears in it, and that `spec` is null on all lines, are *estimates* (C) until grepped | merges.jsonl |
| dispatch-log/2026-11.jsonl | item → role, stage, spec, record, session… | read. 15 lines, **no PR-number or milestone field** | dispatch-log |
| reviews/`<n>`/ | PR → verdicts (`Verdict:` and the reviewed commit) | review mark | reviews/README; tree listing |
| reviews/`<M…>`/ (M3B, M3C, M3D, M3E, M3G) and reviews/`<item>`/ | milestone or item → reviews | not read by the per-PR review mark (*estimate*, C) | reviews/ listing at e6dd6b8 |
| Merge commit | PR → merge SHA, and its trailers | marks job merges | pulls.js `isJobMerge` |
| GitHub milestone and labels | — | not among the query's fields; empty on every sampled PR | samples |
| Spec headers | not read as such; `spec` appears only as a field (`spec: 'string'` in status types) | — | records.js |

### Samples
All samples were read from GitHub pages on 2026-11-03 (B). In round 2 the checker reopened only #267.

**Sample A, as drawn: the open PR #268 and the last ten merged, #258–#267 (11 PRs)**
- **`Milestone:` line: 11/11.**
  - Naming ids, 6/11: #267 "Discovery-5, Discovery-4"; #266 and #265 "Discovery-3"; #260, #259 and #258 "M3C".
  - `none (…)`, 5/11: #268, #264, #263, #262, #261. For example, #263 reads "none (the settings job "adding a project", running the graduated desk; L-0020 and L-0021)".
- **Sections "What this means for you / Context / Why / Tasks":** 11/11. #263 and #267 were re-read this round.
- **Spec id S-001 in the body:** 4/11 (#258, #259, #260, #263).
- **`reviews/<n>/` folder at e6dd6b8:** 2/11 (#259, #263).
- **GitHub milestone or labels:** 0/11.
- **Head branches:** none is `item/*`. Several share one branch:
  - #258–#260: `claude/ui-visual-emphasis-vfrpri`;
  - #264–#266: `claude/pr-briefing-visual-update-2zbuth`.

  #263 is `orch/add-model-lab` and #267 is `claude/chief-of-staff-pr-briefing-7hv15p`. All were merged by shumpmaster.
- **Merge SHAs:**
  - #258 fa50572, #259 8806dba, #260 1d7992b, #261 5f6454b, #262 95d114f;
  - #263 6b8f83b, #264 c0d6ef8, #265 eb249cd, #266 e300411, #267 7a91b6a.

  Whether any of them is in status/merges.jsonl: *estimate* (C), none.
- **` · sprints:` naming them:** out of bounds.

**Sample A, as it stands now.** #268 has been merged since the draw; there are 0 open PRs, and the last ten merged are #260–#269.
- **`Milestone:` line: 10/10.** Ids 4/10; `none` 6/10. #269 reads "none (the project item is not filed yet; this records where its plan goes)".
- **Spec id:** 2/10.
- **`reviews/<n>/` at e6dd6b8:** 1/10.

**Sample B: the first ten merged, #1–#10 (2026-09-30 to 10-01)**
- **`Milestone:` line: 0/10.** This fits a rule dated 2026-10-17.
- **GitHub milestone or labels:** 0/10.
- **Headings:** not uniform. They range from #1's "What this changes / … / Owner action" to none at all in #7, #8 and #9.
- **A Q-### id in the body:** 8/10. #1 names only L- and D- ids. #6 names Q-005 only by reference to PR #7.
- **`reviews/<n>/`:** 3/10 (#5, #6, #10).

**Choice of sample B.** It was taken as #1–#10; a spread across the two weeks may differ (*opinion*).

## 8. Milestones and progress, and whether they name pull requests
- **Home.**
  - The phase grid is `PHASES = ['Discovery', 'Design', 'Build', 'Launch', 'Done']`.
  - It shows `Reached: <milestone>` events.
  - Neither names PRs (home.js; B).
- **Timeline (v3).** Each milestone lists its merged PRs as sprint rows (§1). Unplaced PRs are grouped with the count words `· for the agents to file` (feed.js; B).
- **v2.5 projects.** The desk reads open sprint files instead, with the note `'sprint unclear'` (model.js `finishV25`; B).

## 9. Marks of what the owner has seen or done
- **Seen: on this device only** (SD:src/lib/seen.js; B, re-read this round).
  - Header: "'New since you last looked' (spec S-001, AC40). 'Last looked' is the end of the last window in which the desk was visible on this device for at least 10 s in a row", and "It is kept on the device only, under its own key, through the wrapped store (J5's rule), and nothing is stored on Cloudflare."
  - `SEEN_KEY = 'desk-seen-v1'`, stored as `{ lastLooked }`.
  - `SEEN_MIN_MS = 10_000`. `markSeen` backs "Mark as seen".
  - With no record, the page shows `'new-since markers off on this device'`.
  - Corroboration: PR #180 ("The new desk, stage 2: Home (trial view)", merged 2026-10-21) describes "'Since you last looked' with 'Mark as seen', four lines then '<n> more'". It also mentions "the 7-day bound, no record, failing storage", but does not say where the mark is stored (B). Where the 7-day bound is in the code is not established.
- **Done: shared, because it lives in git.**
  - Answers are committed through GitHub's new-file page, and "the desk itself writes nothing" (handover; B).
  - The desk reads them back as "Your answer recorded" and "Card answered" (B).
  - For PRs, the only done marks are GitHub's own state and a `reviews/<n>/owner.md` verdict (B).

## Proposed library entries (for the Source checker)

F-desk-notify-02 (revision 1) is **withdrawn**: it was an estimate built on a negative search. Its content stays in §6 as an estimate. In each entry, every source comment names the text to grep for line numbers.

```
---
id: F-desk-pr-01
form: fact
claim: "At Service-Desk commit e6dd6b8, classifyPull (src/lib/records.js) returns flagged:false for a draft ('draft'), for a base other than the project's default branch, and in v3 projects for a head matching ITEM_BRANCH_RE (^item/…) from the project's own repository; otherwise { flagged: true, why: 'waiting on your review or merge' }. Pull requests the asks-merge job is recording at their current head are shown as being recorded, not counted (model.js, AC79); job candidates are left out of notifications (waiting.js waitingSet, 'jobs.has(n)')."
grade: B
topics: [desk, pull-requests, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js   # grep "export function classifyPull"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/model.js     # grep "AC79 (2026-10-19)"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js   # grep "jobs.has(n)"
---
---
id: F-desk-pr-02
form: fact
claim: "At e6dd6b8 merged pull requests appear as 'Merged: <title>' on Home for v3 projects (home.js projectEvents) and as Timeline sprint rows (feed.js sprintView) with a merged mark, date, review mark from reviews/<n>/ files, checks mark, the description's Context and Why, the head branch and a commits link; placement is the plan's ' · sprints:' list, else the description's Milestone: ids, else an untied group. The desk reads pull requests by GraphQL at 100 a page, each read costing 5 of a budget of 25 (github.js PULLS_PAGE, PULLS_COST). The waiting pull request's sheet (sandbox.js sheetView) does not use the description."
grade: B
topics: [desk, pull-requests, milestones]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/feed.js     # grep "No milestone in the plan lists these sprints"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js     # grep "Merged: "
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/sandbox.js  # grep "function sheetView"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/github.js   # grep "PULLS_PAGE", "PULLS_COST"
---
---
id: F-desk-notify-01
form: fact
claim: "At e6dd6b8 the desk's sender keys each waiting item as <project>|<kind>|<id> and does not resend a key already sent or given up; an item's notification reads 'Waits on you: <kind words>: <title>' (title: the project's name), a group reads '<n> things now wait on you in <project>' (title: 'Service Desk'). The handover (2026-10-30 finding) says Service-Desk has a sender and Personal-Org-Operating-Model has none."
grade: B
topics: [desk, notifications]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/words.mjs   # grep "function itemWords", "function groupWords"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js     # grep "waitKey"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/sender.mjs  # grep "gaveUp"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/docs/handover/service-desk.md  # grep "has no sender yet"
---
---
id: F-desk-seen-01
form: fact
claim: "At e6dd6b8 the desk's 'last looked' mark is kept on the device only, under key desk-seen-v1 as { lastLooked }, moved when a visible window of at least 10 s ends or by 'Mark as seen'; the file's header says nothing is stored on Cloudflare."
grade: B
topics: [desk, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js   # grep "nothing is stored on Cloudflare", "SEEN_KEY", "SEEN_MIN_MS"
  - https://github.com/shumpmaster/Service-Desk/pull/180   # corroborates 'Mark as seen'; silent on storage
---
---
id: F-desk-records-01
form: fact
claim: "At e6dd6b8 Service-Desk's status/merges.jsonl (10 lines; keys item, item_tip, merge, spec) and dispatch-log/2026-11.jsonl (15 lines) have no pull-request-number field. Sample read 2026-11-03: a 'Milestone:' description line in 11/11 of PRs #258-#268 (6 naming ids, 5 'none (...)') and 0/10 of PRs #1-#10; GitHub milestone and labels empty on all 21."
grade: B
topics: [records, pull-requests, milestones]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/status/merges.jsonl
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/dispatch-log/2026-11.jsonl
  - https://github.com/shumpmaster/Service-Desk/pull/258   # through /pull/268, and /pull/1 through /pull/10
---
```

Sources:
- [Service-Desk tree at e6dd6b8](https://github.com/shumpmaster/Service-Desk/tree/e6dd6b822d64226fc9229fce9cbba7bae57273e2)
- [records.js at e6dd6b8](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js)
- [github.js at e6dd6b8](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/github.js)
- [seen.js at e6dd6b8](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js)
- [reviews/ listing at e6dd6b8](https://api.github.com/repos/shumpmaster/Service-Desk/contents/reviews?ref=e6dd6b822d64226fc9229fce9cbba7bae57273e2)
- [PR #180](https://github.com/shumpmaster/Service-Desk/pull/180), [PR #263](https://github.com/shumpmaster/Service-Desk/pull/263), [PR #267](https://github.com/shumpmaster/Service-Desk/pull/267)
- PR pages: https://github.com/shumpmaster/Service-Desk/pull/1 to /pull/10, and /pull/258 to /pull/269
- [Merged PRs, newest first](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc)
- [Personal-Org-Operating-Model (404)](https://github.com/shumpmaster/Personal-Org-Operating-Model)