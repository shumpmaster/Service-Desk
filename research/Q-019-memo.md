# Six-part return: Q-019, researcher, revision 1 (2026-11-03)

## 1. What I changed
I wrote a revised memo, given in full below, for the Orchestrator to record as research/Q-019-memo.md. Against the source check:
- **Line numbers.** For the large code files I now cite each place by its function name and a quoted piece of text, which can be found by text search. The two readings disagreed by hundreds of lines (`classifyPull`: the check found 825–833, my re-read 1138–1147, my first memo ~1258), so neither count can be trusted. I give line numbers only for short files, and still mark them ~.
- **Grades.** I dropped every A. Even the "verbatim" copies of waiting.js and seen.js repeated or skipped line numbers, so nothing read this way is safely exact. Each library entry now has one grade.
- **Handover.** On re-read, the "today Service-Desk and Personal-Org-Operating-Model" text is present (~L19–20), and Model-Lab is not named. The sender sentences sit at ~L25–27 and ~L35–37, not ~47–48 and ~56–58.
- **PR #267.** Its description line reads "Milestone: Discovery-5, Discovery-4", re-read from the PR page.
- **Code claims the checker did not open.** All re-read, and confirmed or corrected:
  - Corrected: pull requests the asks-merge job is recording are moved to a "being recorded" list. They are not dropped from the page.
  - Corrected: "trial view" was my wording, not app.js's. I removed it.
  - Corrected: the run.mjs claim actually rests on sender.mjs.
  - Corrected: the grouped notification's title is "Service Desk", not the project name.
- **Samples.** All 21 pages were re-read, plus #269, which was new.
  - Every merge SHA in sample A is now checked: none of the 10 is in merges.jsonl.
  - The reviews/<n>/ counts were checked against the directory listing at e6dd6b8.
  - Corrected: sample B has three PRs with no headings (#7, #8, #9), not two.
  - Sample A has drifted since it was drawn. #268 has been merged, so I report the sample as drawn and also as it stands now.
- **"No notification for merges."** This is now an estimate (C), based on a search of sender.mjs and words.mjs.

## 2. Why
The source check (FAIL) found wrong line numbers, a handover claim it could not find, an unconfirmed #267 value, unopened sources, an unsafe A grade, and an entry with two grades.

## 3. What I verified
I hold no shell, so there were no commands. I made about 45 WebFetch reads, using the same summarising fetch as the checker. Code is pinned to commit e6dd6b8.

| What I read | Result |
|---|---|
| handover, words.mjs, waiting.js, seen.js, projects.json, status/README, status/Q-019.toml | numbered copies (numbering not exact) |
| records.js, model.js, github.js, pulls.js, home.js, feed.js, sandbox.js, scheduler.js, j11.js, prfiles.js, app.js, sender.mjs | quoted pieces, each with its function name |
| run.mjs | it only hands off to sender.mjs |
| merges.jsonl | 10 lines, keys `item`, `item_tip`, `merge`, `spec` |
| dispatch-log/2026-11.jsonl | 15 lines, no PR or milestone field |
| reviews/ listing at e6dd6b8 (API) | read in full |
| PR pages #1–#10, #258–#269 | read |
| open PR list | 0 open |
| Personal-Org-Operating-Model | HTTP 404 again |

## 4. What is undone
- OPERATING_MODEL.md §3, the template's section 3, and specs/: the repository returns 404.
- How often ` · sprints:` lists name PRs: that is in docs/PROJECT.md, which I may not read.
- Exact line numbers for the large files.
- Headings of #263 and #267, and head branches of #263 and #267: carried from round 1, not re-read.
- Whether Model-Lab has a sender.
- Whether the desk's GraphQL paging (J12) reaches every past PR.

## 5. Needed outside my lane
- **Exact line numbers.** Someone with a shell needs to run `grep -n` on the raw files: Orchestrator, Builder or Source checker. Alternatively, the checker can accept function-name citations.
- **The operating-model repository.** Read access, or the owner's word that it is private. That needs a decision card from the Chief of Staff.

## 6. Open questions
None closed; my new ones are 4 and 5.
1. Is the milestone rule S-032, as the question says, or S-033? The desk's code says S-033, from 2026-10-17.
2. Should sample B be the first ten merged, or a spread across the two weeks?
3. Does Model-Lab have a notification sender?
4. For sample A, should the Orchestrator keep it as drawn (#258–#268, with #268 open), or as it stands now (#260–#269)?
5. Do the reviews/<milestone>/ folders (M3B to M3G) count as a record tying reviews to milestones? The desk's per-PR review mark does not read them.

---

# Research memo — Q-019 — what the desk already shows and reads for pull requests, and which records tie a pull request to its plan — 2026-11-03 (revision 1)

**Researcher.** Depth 3. Research is blind: I have not seen any recommendation, ruling or docs/PROJECT.md.

**How it was read.** Everything comes from public GitHub, read with WebFetch, which passes each page through a summarising model. Code is pinned to Service-Desk commit e6dd6b8 (`e6dd6b822d64226fc9229fce9cbba7bae57273e2`), written below as `SD:`. Pull-request pages were read live on 2026-11-03.

**How citations work.** Each place is named by file, function and a quoted piece of text that can be found by text search. Line numbers appear only for short files, marked ~. Even whole-file copies from the fetch repeated or skipped numbers, so no line number here is exact.

**Grades.**
- B: text quoted by the summarising fetch.
- C: my own inference (an *estimate*).
- No A grades: nothing was read in a form I can call exact.

Every statement is a fact unless marked *estimate*.

## 0. Parts I could not answer
- **Personal-Org-Operating-Model returns HTTP 404**, on the repository page, raw files and the API, read on 2026-11-03. So I have not checked OPERATING_MODEL.md §3, template-v3/ or specs/.
- **The rule's model version may not match.** The desk's own comment dates the `Milestone:` line to "model S-033's J1, from 2026-10-17" (SD:src/lib/model.js, `parseRecord`; B). The question says S-032.
- **Service-Desk's ` · sprints:` lists** are in docs/PROJECT.md, which is out of bounds. §7 covers only how the desk parses them.
- **Not read:** specs/S-001.md (not on Service-Desk's may-read list), and Model-Lab.

## 1. Waiting and merged pull requests on the desk

**What `/` serves.** `/` is "mockup v2 as built (sandbox.js, its routes under #/)", and "the accepted M1 and M2 views (AC43) are gone" from stage 8 (SD:src/public/app.js, header comment; B).

### A pull request waiting on the owner (B)
- **Source.** REST `${base}/pulls?state=open&per_page=100` (SD:src/lib/github.js, `urlsFor`).
- **Rule.** `classifyPull` (SD:src/lib/records.js) passes over a pull request in three cases:
  - it is a draft (`'draft'`);
  - its base is not the default branch (`into ${pr.base}`);
  - it is a v3 project, and the head matches `ITEM_BRANCH_RE` from the same repository (`'item branch (the Orchestrator merges it)'`).

  Otherwise it returns `{ flagged: true, why: 'waiting on your review or merge' }`.
- **The sheet.** `sheetView` (SD:src/lib/sandbox.js) shows:
  - `what: pr.title`;
  - `why: \`${pr.who}; ${pr.why}\``, where who is `'yours'` or `` `opened by ${pr.login}` `` (SD:model.js, `buildModel`);
  - the link `'Open the pull request in GitHub'` to `pr.url`;
  - a verdict box at `` `reviews/${pr.number}/owner.md` `` on `pr.head`, with a `fork` flag;
  - a reviewer box at `reviews/<n>/reviewer.md`.

  The sheet does not use the PR's body.
- **CI on the sheet.** The summary says the sheet shows "CI on [default branch]'s head". It credited this to the sheet's shared base fields, but I did not see the text quoted, so this is an *estimate* (C).
- **Home.**
  - It shows `` `Opened: ${pr.title}` `` (SD:src/lib/home.js, `projectEvents`).
  - It shows up to `COMMIT_LINES` commit lines per PR, then `` `${…} more on #${e.pr}` ``.
  - Merge commits are skipped (`if (x.parents >= 2 …) continue;`).
- **The asks-merge job** (SD:model.js, `buildModel`, comment "AC79 (2026-10-19): the asks-merge job's pull requests it may still merge: shown, not counted").
  - It acts only if `v.head === f.pr.headSha`.
  - While the job is recording, the PR is moved out of `flagged` into a `beingRecorded` list with `BEING_RECORDED_WORDS`. It is still shown, but not counted as waiting.
  - In the job's `count` state, the job's words are added to the row.
  - The phone sender leaves job candidates out (`if (jobs.has(n)) continue;`, SD:src/lib/waiting.js, `waitingSet`).

### A merged pull request (B)
- **Source.** The GraphQL `PULLS_QUERY` (SD:github.js) reads `pullRequests(baseRefName: $base, first: 100, after: $after, orderBy: {field: CREATED_AT, direction: DESC})`, with these fields:
  - `number title body state createdAt mergedAt closedAt headRefName`;
  - `mergeCommit { oid message author { name } }`;
  - `changedFiles files(first: 2) { nodes { path } }`;
  - `commits(last: 1) { … statusCheckRollup { state } }`.
- **Home.** It shows `` `Merged: ${p.title}` `` under the condition `if (v3 && snap && snap.pulls …)`, so v3 projects only (SD:home.js, `projectEvents`).
- **Timeline** (SD:src/lib/feed.js). Each merged PR row shows:
  - the mark `{ mark: '✓', word: 'merged' }`;
  - the date, or `'date not recorded'`;
  - `reviewMark`, from tree paths matching `REVIEW_VERDICT_RE` for that number;
  - `checksMark` (SD:src/lib/pulls.js);
  - from `sprintView`: the title, the body's context and why, `pr.head`, and a commits link labelled "Opens the pull request's commits on GitHub; each one says who made it."
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
| Diff | no | no | `PULLS_QUERY` |
| Changed files | GraphQL: count plus 2 paths; REST `/pulls/<n>/files`, at most 3 pages of 100 | not shown. Used for recorded answers, job candidates and estimate- or value-check-only merges | prfiles.js header; pulls.js `estimateOnly`, `valueCheckOnly` |
| Commits | last commit's rollup; REST `/pulls/<n>/commits` | commit first lines on Home; a commits link on merged rows | github.js `urlsFor`, `readBlobs`; home.js |
| Checks | rollup state | `checksMark` on merged rows (✓ ✕ … –) | pulls.js `checksMark` |
| GitHub reviews, review requests, labels, GitHub milestone | no: "do not appear" in github.js | no | github.js |
| Review verdict files | `reviews/<n>/*.md` on the default branch | review mark | feed.js `reviewMark`; reviews/README |
| Merge commit | oid, message, author | sets "job merge": `isJobMerge` checks author `'github-actions[bot]'` and exactly one `Merged-By: orchestrator` trailer | pulls.js `isJobMerge` |
| Author association | yes | an outside author's PR is notified without its title | waiting.js `outsideAuthor`, `waitingSet`; words.mjs `itemWords` |

**A later change may matter.** reviews/README says reviewers post verdicts as PR reviews from stage T2 (B, summarised). The desk does not read GitHub reviews (see the table).

## 3. How "waits on the owner" is decided, and what it leaves out
- **Kinds.** `KINDS` in waiting.js lists eight: decision card, gate ruling, held loop, merge to do by hand, a card that went missing, question, pull request to merge, deploy to approve (B).
- **Not flagged:**
  - drafts;
  - PRs into a non-default branch;
  - same-repository `item/*` heads in v3 projects;
  - repositories not in src/config/projects.json.

  PRs the job is recording show as "being recorded" but are not counted. Job candidates are left out of phone notifications (§1).
- **Not considered at all:** review requests, review state, labels, GitHub milestone, the PR's own checks, mergeability (B, from what the query asks for).
- **Deploys.** Only where `"deploysNeedOwner": true`, which is Service-Desk alone (projects.json, ~L9; B). The row reads `` `${title}: waiting for your approval` `` and `` `run ${r.runNumber}; its approver: ${NOT_RECORDED}` `` (model.js `buildModel`; B).

## 4. Changes that are not pull requests
- **Deploys.** Only waiting runs are shown. That no finished-deploy display exists anywhere is an *estimate* (C).
- **Direct commits.** Home's commit lines come only from each PR's own commits, and merge commits are skipped (B). That Home shows no direct commits to the default branch is an *estimate* (C).
- **Runs.** A `commits/${tip}` history link on the Timeline (feed.js `tasks`; B). This is a link, not a list.
- **Record-only commits** appear only as events their records produce (home.js `projectEvents`; B):
  - `Your answer recorded` and `Card answered`;
  - `` `Reached: ${m.name}` ``;
  - `` `withdrawn: ${path}` `` (model.js `buildModel`). The scheduler keeps the last 10: `st.withdrawn = [...].slice(-10)` (scheduler.js).

## 5. Freshness, and changes after a row is listed
- **Polling.** `POLL_MS = 60_000` per project and `PORTFOLIO_POLL_MS = 300_000`. A project is called stale after `STALE_MS = 180_000`. Polling stops when the page is not visible (`if (!desk.running || !isVisible())`) (scheduler.js; B).
- **Read times are kept per project only:** `lastSuccessAt`, `lastPollStart`, `recheckedAt`. No time is kept per row (B).
- **What Home says.** `` `Every project read ${…}ago` `` (home.js `briefingView`) and `` `checked ${…} ago` `` (`titleLine`) (B).
- **A PR that changes after it is listed:**
  - The row is rebuilt on each poll (*estimate*, C).
  - The job's state counts only while `v.head === f.pr.headSha` (B).
- **No second notification on change.** A key is `` `${project}|${kind}|${id}` `` (waiting.js `waitKey`), and keys already `sent` or `gaveUp` are kept, not sent again (SD:src/notify/sender.mjs `runSender`; B). So a changed PR does not notify again (*estimate*, C).

## 6. Phone notifications, by project
- **Service-Desk.**
  - The handover: "Service-Desk's sender sends a phone notification the moment something starts waiting on you there" (docs/handover/service-desk.md ~L25–27; B). The sender is the `desk-notify` workflow (~L35).
  - Wording (words.mjs; B):
    - `itemWords`: title is the project name; body "Waits on you: <kind words>: <what>", or "Waits on you: a pull request from someone outside the project".
    - `groupWords`: title `DESK_TITLE` ('Service Desk'); body "<n> things now wait on you in <project>".
  - The tap opens `` `${deskUrl}/?open=${key}` ``, with deskUrl `https://needs-you.pages.dev` (projects.json ~L6; B).
- **Personal-Org-Operating-Model.** "The operating-model project has no sender yet (found 2026-10-30: Setup N9 and CS16 were never done), so its items show on the desk but don't notify the phone" (handover ~L35–37; B).
- **Model-Lab.**
  - It is in projects.json as v3 (~L15–17; B). PR #263 added it, merged 2026-11-01 (PR page; B).
  - The handover still names only "today Service-Desk and Personal-Org-Operating-Model" (~L19–20; B) and never mentions Model-Lab.
  - Whether it has a sender: not established.
- **Merged changes are not notified** (*estimate*, C):
  - sender.mjs `runSender` sends only from the collected set. Searches for "merged", "mergedAt", "completed" and "success" found nothing (B).
  - The word functions it calls are item, group, summary, back-on, test, fail-test and cost. None is for merges.

## 7. Records that tie a pull request to a milestone, sprint, spec or plan

| Record | What it ties | What the desk does with it | Source (B) |
|---|---|---|---|
| PR body `Milestone:` line | PR → milestone ids, or `none (<reason>)` | `milestoneValue` splits ids on `', '` and reads `none (…)`. Used to place merged PRs | records.js `milestoneValue`; pulls.js `MILESTONE_RE` |
| Plan's ` · sprints:` | milestone → PRs and items. Ids `PR #\d+` or `[PQE]-\d{3,}`, split on `', '` | read; takes precedence over the PR's own line | j11.js `milestoneLines`. Contents out of bounds |
| status/`<item>`.toml `milestone` | research item → milestone | read | status/Q-019.toml ~L12 `milestone = "Discovery-5"`; status/README ~L7–9 |
| status/merges.jsonl | item → `item_tip`, `merge` SHA, `spec` | read for the merge gate. 10 lines, keys `item, item_tip, merge, spec`, all `spec: null`, **no PR number** | merges.jsonl |
| dispatch-log/2026-11.jsonl | item → role, stage, spec, record, session… | read. 15 lines, **no PR number or milestone field** | dispatch-log |
| reviews/`<n>`/ | PR → verdicts (`Verdict:` and the reviewed commit) | review mark | reviews/README; tree listing |
| reviews/`<M…>`/ (M3B, M3C, M3D, M3E, M3G) and reviews/`<item>`/ | milestone or item → reviews | not read by the per-PR review mark (*estimate*, C) | reviews/ listing at e6dd6b8 |
| Merge commit | PR → merge SHA, and its trailers | marks job merges | pulls.js `isJobMerge` |
| GitHub milestone and labels | — | not read; empty on every sampled PR | samples |
| Spec headers | not read as such; `spec` appears only as a field (`spec: 'string'` in status types) | — | records.js |

### Samples
All samples were read from GitHub pages on 2026-11-03 (B).

**Sample A, as drawn: the open PR #268 and the last ten merged, #258–#267 (11 PRs)**
- **`Milestone:` line: 11/11.**
  - Naming ids, 6/11: #267 "Discovery-5, Discovery-4"; #266 and #265 "Discovery-3"; #260, #259 and #258 "M3C".
  - `none (…)`, 5/11: #268, #264, #263, #262, #261.
- **Sections "What this means for you / Context / Why / Tasks":** 9/9 re-read. #263 and #267 were not re-read for this; round 1 found the same four.
- **Spec id S-001 in the body:** 4/11 (#258, #259, #260, #263).
- **`reviews/<n>/` folder at e6dd6b8:** 2/11 (#259, #263).
- **GitHub milestone or labels:** 0/11.
- **Head branches:** none is `item/*`. Several share one branch: #258–#260 `claude/ui-visual-emphasis-vfrpri`, #264–#266 `claude/pr-briefing-visual-update-2zbuth`. All were merged by shumpmaster.
- **Merge SHAs against status/merges.jsonl:** 0 of 10 appear there.
  - #258 fa50572, #259 8806dba, #260 1d7992b, #261 5f6454b, #262 95d114f
  - #263 6b8f83b, #264 c0d6ef8, #265 eb249cd, #266 e300411, #267 7a91b6a
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
- **Seen: on this device only** (SD:src/lib/seen.js, header comment and `createSeen`; B).
  - Key `SEEN_KEY = 'desk-seen-v1'`, stored as `{ lastLooked }`.
  - It moves when a visible window of at least `SEEN_MIN_MS = 10_000` ends, or on `markSeen` ("Mark as seen").
  - The header says the mark is "kept on the device only … and nothing is stored on Cloudflare".
  - With no record, the page shows `'new-since markers off on this device'`.
- **Done: shared, because it lives in git.**
  - Answers are committed through GitHub's new-file page, and "the desk itself writes nothing" (handover ~L22–23; B).
  - The desk reads them back as "Your answer recorded" and "Card answered" (B).
  - For PRs, the only done marks are GitHub's own state and a `reviews/<n>/owner.md` verdict (B).

## Proposed library entries (for the Source checker)

```
---
id: F-desk-pr-01
form: fact
claim: "At Service-Desk commit e6dd6b8, classifyPull (src/lib/records.js) flags an open pull request as 'waiting on your review or merge' unless it is a draft, its base is not the default branch, or (v3 projects) its head is a same-repository item/* branch; github.js requests no reviews, review requests, labels or milestone. Pull requests the asks-merge job is recording at their current head are shown as being recorded, not counted; job candidates are left out of notifications (waiting.js waitingSet)."
grade: B
topics: [desk, pull-requests, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js   # function classifyPull
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/github.js    # PULLS_QUERY, urlsFor
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/model.js     # buildModel, "AC79 (2026-10-19)"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js   # waitingSet, "jobs.has(n)"
---
---
id: F-desk-pr-02
form: fact
claim: "At e6dd6b8 merged pull requests appear as 'Merged: <title>' on Home for v3 projects (home.js projectEvents) and as Timeline sprint rows (feed.js sprintView) with a merged mark, date, review mark from reviews/<n>/ files, checks mark, the description's Context and Why, the head branch and a commits link; placement is the plan's ' · sprints:' list, else the description's Milestone: ids, else an untied group. The waiting pull request's sheet (sandbox.js sheetView) does not use the description."
grade: B
topics: [desk, pull-requests, milestones]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/feed.js     # sprintView, reviewMark, "No milestone in the plan lists these sprints"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js     # projectEvents, "Merged: "
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/sandbox.js  # sheetView
---
---
id: F-desk-notify-01
form: fact
claim: "At e6dd6b8 the desk's sender keys each waiting item as <project>|<kind>|<id> and does not resend a key already sent or given up; an item's notification reads 'Waits on you: <kind words>: <title>' (title: the project's name), three or more in one run read '<n> things now wait on you in <project>' (title: 'Service Desk'). The handover (2026-10-30 finding) says only Service-Desk has a sender; Personal-Org-Operating-Model has none."
grade: B
topics: [desk, notifications]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/words.mjs   # itemWords, groupWords
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js     # waitKey
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/sender.mjs  # runSender, "e.sent || e.gaveUp"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/docs/handover/service-desk.md  # "has no sender yet (found 2026-10-30"
---
---
id: F-desk-notify-02
form: fact
claim: "At e6dd6b8 a search of src/notify/sender.mjs for 'merged', 'mergedAt', 'completed' and 'success' found no match, and the notification wordings it calls (words.mjs: item, group, summary, back-on, test, fail-test, cost) include none for merges or finished deploys; estimate: the desk does not notify on merged changes."
grade: C
topics: [desk, notifications, pull-requests]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/sender.mjs
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/words.mjs
---
---
id: F-desk-seen-01
form: fact
claim: "At e6dd6b8 the desk's 'last looked' mark is kept on the device only, under key desk-seen-v1 as { lastLooked }, moved when a visible window of at least 10 s ends or by 'Mark as seen'; the file's header says nothing is stored on Cloudflare."
grade: B
topics: [desk, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js   # SEEN_KEY, SEEN_MIN_MS, markSeen
---
---
id: F-desk-records-01
form: fact
claim: "At e6dd6b8 Service-Desk's status/merges.jsonl (10 lines; keys item, item_tip, merge, spec; spec null on all) and dispatch-log/2026-11.jsonl (15 lines) carry no pull-request number, and none of the merge SHAs of PRs #258-#267 appears in merges.jsonl. Sample read 2026-11-03: a 'Milestone:' description line in 11/11 of PRs #258-#268 (6 naming ids, 5 'none (...)') and 0/10 of PRs #1-#10; GitHub milestone and labels empty on all 21."
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
- [reviews/ listing at e6dd6b8](https://api.github.com/repos/shumpmaster/Service-Desk/contents/reviews?ref=e6dd6b822d64226fc9229fce9cbba7bae57273e2)
- [Merged PRs, newest first](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc)
- [Open PRs](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Aopen)
- PR pages: https://github.com/shumpmaster/Service-Desk/pull/1 to /pull/10, and /pull/258 to /pull/269
- [Personal-Org-Operating-Model (404)](https://github.com/shumpmaster/Personal-Org-Operating-Model)