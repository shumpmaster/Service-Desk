# Research memo — Q-019 — what the desk already shows and reads for pull requests, and which records tie a pull request to its plan — 2026-11-03

**Researcher.** Depth 3. Blind: I have not seen any recommendation, ruling or docs/PROJECT.md.

**How it was read.** Everything was read from public GitHub with WebFetch, which passes each page through a summarising model. Code was pinned to Service-Desk commit **e6dd6b8** (`e6dd6b822d64226fc9229fce9cbba7bae57273e2`), written below as `SD:`. Pull-request pages were read live on 2026-11-03.

**How far to trust line numbers.** Line numbers are exact only where the fetch reproduced the whole file (waiting.js, seen.js, words.mjs, projects.json, merges.jsonl, status/README.md, reviews/README.md, queue/README.md). Everywhere else they are approximate (marked ~): the summariser counted the same block in model.js at ~176 on one read and ~194 on another. The Source checker should confirm the ~ lines against the raw file.

**Grades.**
- A: the whole file was reproduced verbatim.
- B: a fragment quoted by the summarising fetch.
- C: my own inference from code (marked *estimate*).

## 0. Parts I could not answer
- **Personal-Org-Operating-Model is unreachable.** Both `raw.githubusercontent.com/.../main/OPERATING_MODEL.md` and `api.github.com/repos/shumpmaster/Personal-Org-Operating-Model/contents/` return HTTP 404, so the repository is private or not at that name. I could not read OPERATING_MODEL.md §3, specs/ or template-v3/. The milestone-line rule and the template's section-3 form are therefore **unverified by me**. One thing does not match: the desk's code dates the `Milestone:` line to "model S-033's J1, from 2026-10-17" (SD:src/lib/model.js ~119–121, B), while the question says S-032.
- **Service-Desk's own ` · sprints:` lists** are in docs/PROJECT.md, which I must not read. I can say how the desk *parses* them (§7) but not how often they name pull requests.
- **The desk's spec (specs/S-001.md) was not read.** It was not on the may-read list for Service-Desk. The AC numbers below come from code comments only.
- **Model-Lab was not read**, including whether it has its own notification sender.

## 1. Waiting and merged pull requests on the desk

**The live page is the "trial view".** `/` loads mockup v2 (`sandbox.js` and its `#/` routes). The earlier M1 and M2 views were removed at stage 8 (SD:src/public/app.js L1–7, B).

**A pull request waiting on the owner (fact, B):**
- **Source.** GitHub REST `GET /repos/{owner}/{repo}/pulls?state=open&per_page=100` (SD:src/lib/github.js ~49).
- **Rule.** `classifyPull` (SD:src/lib/records.js ~1258–1268) flags it unless one of these holds:
  - it is a draft (`why: 'draft'`);
  - its base is not the default branch (`into <base>`);
  - it is a v3 project whose head branch matches `^item\/[A-Za-z0-9._-]+$` from the same repository (`'item branch (the Orchestrator merges it)'`).
  
  Otherwise the result is `{ flagged: true, why: 'waiting on your review or merge' }`.
- **Where it shows.**
  - In the waiting list, the row reads `{ text: f.pr.title, code: 'PR #<n>' }`.
  - Its sheet shows: the title; `<who>; <why>`, where who is `yours` or `opened by <login>` (SD:src/lib/model.js ~178); `"CI on <default branch>'s head: <ci>"`; the link "Open the pull request in GitHub" (`pr.url`); and a verdict box that writes `reviews/<n>/owner.md` on the PR's branch, or offers copy-only text when the branch is a fork or deleted (SD:src/lib/sandbox.js ~1765–1768).
  - On Home, under "Since you last looked", it appears as `Opened: <title>` with a link to the PR, followed by up to three of its branch commits as `<who>: <first line>` and then `<n> more on #<n>` (SD:src/lib/home.js ~495–530).
- **When it leaves the waiting list.** It is removed if the asks-merge job is recording it and the job's head equals the PR's head (SD:src/lib/model.js ~544–555). It is left out of the notification set if it is a job candidate (SD:src/lib/waiting.js L101–103, A).

**A merged pull request (fact, B):**
- **Source.** A GraphQL query over `pullRequests(baseRefName: $base, first: 100, after: $after, orderBy: {field: CREATED_AT, direction: DESC})`, which fetches open, merged and closed alike (SD:src/lib/github.js ~66–77).
- **Home.** `Merged: <title>`, linking to the PR, in "Since you last looked". It is listed for v3 projects only (SD:src/lib/home.js ~536–543).
- **Timeline.** Each merged PR is a "sprint" row (SD:src/lib/feed.js ~557–604) showing:
  - a mark `✓ merged`;
  - the merge date (or `date not recorded`);
  - a review mark (`✓`, `✕` or `–`, read from `reviews/<n>/` verdict files on the default branch);
  - a checks mark;
  - the title;
  - the description's **Context** and **Why**;
  - the head branch;
  - a link to `<pr>/commits` labelled "Opens the pull request's commits on GitHub; each one says who made it." (`sprintView`, SD:src/lib/feed.js ~1148–1189).
- **What places it on the Timeline:**
  1. A milestone's ` · sprints:` list that names `PR #n` (the plan wins).
  2. Otherwise, its `Milestone:` ids, if the plan holds them.
  3. Otherwise, the group "Not tied to a milestone" ("No milestone in the plan lists these sprints, and they name none.", ~670–672).
- **Never placed:** the job's merges (`pr.job === true`), PRs not yet read, estimate-only merges and value-check-only merges (~584–590).
- **Closed but unmerged:** off the Timeline (~578 comment).

## 2. Which parts of a pull request the desk reads, and which it shows

| Part | Read? | Shown? | Source |
|---|---|---|---|
| Title | yes | yes, as written | github.js ~66–77; home.js L1–10 ("a title [is] shown as written") |
| Description (body) | yes, GraphQL `body` | **merged PRs only**: Context bullets and Why paragraphs on Timeline rows. The `Milestone:` line is used for placement, not shown as text (*estimate*, C). "What this means for you" marks where the opening paragraph ends (pulls.js ~66–68). **The waiting-PR sheet does not use the body** (sandbox.js ~1768, B) | pulls.js L74 `MILESTONE_RE = /^Milestone:[ \t]*(.*)$/`; `prBodyParts` L110 |
| Diff | no | no | — |
| Changed files | first 2 paths plus a count (GraphQL); REST `/pulls/<n>/files` up to 3 pages, for open PRs | not shown. Used to spot answer-recording PRs, job candidates and estimate/value-check-only merges | prfiles.js L1–4; pulls.js ~247–257 |
| Commits | last commit's `statusCheckRollup`; REST `/pulls/<n>/commits` | yes: up to 3 commit first lines per open PR on Home; a commits link on merged rows | github.js ~138–144; home.js ~524–532 |
| Checks | rollup state; check-runs; commit status | as a mark on merged rows. The waiting sheet shows CI of the **default branch's head**, not the PR's | pulls.js `checksMark` ~364; sandbox.js |
| Reviews (GitHub) | **no** (not in the query) | no. The review mark comes from `reviews/<n>/*.md` verdict files on the default branch | feed.js `reviewMark`; reviews/README L3–8 (A) |
| Labels, GitHub milestone, draft | labels and milestone not read; draft read from REST | no | github.js query (B) |
| Merge commit | `oid`, `message`, author | trailers decide "job merge" (`github-actions[bot]` with `Merged-By: orchestrator`) | pulls.js ~190–235 |
| Author association | yes | an outside author's PR is notified without its title | waiting.js L48–51, L104–105 (A); words.mjs L32 (A) |

## 3. How "waits on the owner" is decided, and what it leaves out
- **The waiting set.** It covers eight kinds: decision card, gate ruling, held loop, merge to do by hand, missing card, question, pull request to merge, deploy to approve (SD:src/lib/waiting.js L6–15, A). For PRs the rule is the `classifyPull` rule in §1 (B).
- **Not listed (fact, B):**
  - drafts;
  - PRs into a non-default branch;
  - v3 `item/*` branches from the same repository;
  - PRs the asks-merge job is recording or may merge (L101–103);
  - PRs in repositories not in `src/config/projects.json`.
- **Not considered at all (fact, B):** GitHub review requests, review state, labels, the PR's own checks and mergeability.
- **Waiting deploys.** Listed only where `deploysNeedOwner: true`, which is Service-Desk alone (projects.json, A). The row reads `"<title>: waiting for your approval"`, `"run <n>; its approver: not recorded"` (model.js, B).

## 4. Changes that are not pull requests
- **Deploys.** Only *waiting* deploy runs are shown (§3). I found no code that shows finished deploys (B, from a summary of model.js; *estimate* that none exists elsewhere, C).
- **Direct commits to the default branch.** Home does not show them. Its commit lines come only from per-PR commit reads, and merge commits are skipped (home.js ~511–541, B).
- **Commits outside PRs.** The Timeline's history link opens `https://github.com/<repo>/commits/<tip>` for runs (feed.js `tasks`, B). That is a link, not a list.
- **Record-only commits** are seen indirectly, as the events their records make: "New card", "Card answered", "Your answer recorded", agent outcomes from dispatch-log, "Reached: <milestone>" (home.js ~445–550, B).
- **Removed items.** A PR or card that disappears from the tree is logged as `withdrawn: <path>`, keeping the 10 most recent (scheduler.js ~636–640; model.js, B).

## 5. Freshness, and changes after a row is listed
- **Polling.** One cycle per project per 60 s while the page is visible (`POLL_MS = 60_000`, `STALE_MS = 180_000`), plus a portfolio read every 5 minutes (SD:src/lib/scheduler.js L1–4, ~15–16, B).
- **Read times.** Kept per project only (`lastSuccessAt`, `lastPollStart`, `recheckedAt`); **there is no per-row read time** (B). Home shows `"Every project read <duration> ago"` and `"checked <duration> ago"` (home.js ~75, ~343, B). One summary of model.js found no staleness wording there; the wording lives in home.js.
- **A PR that changes after it is listed.** The next poll rebuilds the row from GitHub (*estimate*, C: the model is rebuilt each cycle). A closed PR drops off the waiting list. A job verdict counts only while its recorded head equals the PR's current head (model.js ~544–555, B).
- **Notifications are not re-sent on change.** The key is `<project>|pr|<number>` (waiting.js L26–29, A), and an entry already `sent` or `gaveUp` is skipped (run.mjs ~288, B). So a changed PR does not notify again (*estimate*, C).

## 6. Phone notifications, by project
- **Service-Desk.** Its `desk-notify` workflow sends one push "the moment something starts waiting on you there" (docs/handover/service-desk.md ~47–48, B).
  - Title: the project name. Body: `Waits on you: a pull request to merge: <title>`, or `…a pull request from someone outside the project`. Three or more new items in one run become `"<n> things now wait on you in <project>"` (SD:src/notify/words.mjs L28–40, A).
  - The tap opens `<deskUrl>/?open=<key>`; deskUrl is `https://needs-you.pages.dev` (L19–21; projects.json, A).
- **Personal-Org-Operating-Model.** "has no sender yet (found 2026-10-30 …), so its items show on the desk but don't notify the phone" (handover ~56–58, B).
- **Model-Lab.** It is in projects.json (added by PR #263, 2026-11-01), but the handover still says the desk connects "today Service-Desk and Personal-Org-Operating-Model" (~40–41). I have not established whether it has a sender.
- **Merged changes are not notified.** The sender works only from the waiting set. I found no code that notifies on merges, finished deploys or other non-waiting events (run.mjs summary, B; words.mjs has no such wording, A).

## 7. Records that tie a pull request to a milestone, sprint, spec or plan

| Record | What it ties | What the desk does with it | Source |
|---|---|---|---|
| PR description `Milestone:` line | PR → milestone ids, or `none (<reason>)` | read; places merged PRs on the Timeline | records.js `milestoneValue` ~1036–1087; pulls.js L74, L101 (B) |
| Plan's milestone line ` · sprints: PR #40, P-003` in docs/PROJECT.md §3 | milestone → PRs and items | read; it wins over the PR's own line. Ids accepted: `PR #\d+` or `[PQE]-\d{3,}`, split on `', '` | j11.js ~285–291 (B). Contents not read (out of bounds) |
| status/`<item>`.toml `milestone` | research item → milestone (e.g. `milestone = "Discovery-5"`) | read by parseStatus | status/Q-019.toml L12 (A); status/README L6–7 (A) |
| status/merges.jsonl | item → `item_tip`, merge SHA, `spec` (all 10 lines have `"spec": null`) | read (`parseMerges`) for the merge gate. **No PR number** | merges.jsonl L1–10 (A) |
| dispatch-log/*.jsonl | item → role, stage, spec, record, session. Lines routed for a project item carry phase and iteration | read. **No PR number or milestone** in 2026-11.jsonl's 15 lines | dispatch-log/2026-11.jsonl (B); status/README L6–7 (A) |
| reviews/`<n>`/ | PR number → reviewer verdicts (`Verdict:` and `Reviewed: <head commit>`) | read for the review mark | reviews/README L3–16 (A) |
| Merge commit (on the PR page) | PR → merge SHA; trailers such as `Merged-By:` | read for job merges | pulls.js ~190–235 (B) |
| GitHub milestone and labels | — | not read; empty in every sampled PR | §7 sample |
| Spec headers | not read by the desk as such; `spec` appears only as a status, log or merges field | — | records.js ~981 (B) |

**Samples, read from each PR's GitHub page on 2026-11-03 through the summarising fetch (B):**

*Sample A: the one open PR (#268) and the last ten merged (#258–#267), 11 PRs*
- **`Milestone:` line present: 11/11.**
  - Naming ids, 6/11: #267 "Discovery-5, Discovery-4"; #266 and #265 "Discovery-3"; #260, #259, #258 "M3C".
  - `none (<reason>)`, 5/11: #268, #264, #263, #262, #261.
- **Body sections** "What this means for you / Context / Why / Tasks": 11/11.
- **Spec id in the body** (S-001): 4/11 (#258, #259, #260, #263).
- **`reviews/<n>/` directory** on main at e6dd6b8: 2/11 (#259, #263). Other reviews are filed under item names (e.g. reviews/Q-019, reviews/P-002-route), which the desk's per-PR review mark does not read (*estimate*, C).
- **GitHub milestone or labels set:** 0/11.
- **`item/*` head branch:** 0/11. All 10 merges were by shumpmaster.
- **Tie to status/merges.jsonl by SHA:** none of the five merge SHAs reported (#267 7a91b6a, #266 e300411, #263 6b8f83b, #262 95d114f, #261 5f6454b) appears there. The other five SHAs were not reported.
- **` · sprints:` naming these PRs:** not answerable (docs/PROJECT.md is out of bounds).

*Sample B: ten merged in the first two weeks, taken as the first ten merged, #1–#10 (2026-09-30 to 10-01; 60 PRs merged from 09-30 to 10-13)*
- **`Milestone:` line: 0/10.** This fits the rule post-dating them (model.js comment dates it to 2026-10-17).
- **GitHub milestone or labels:** 0/10.
- **Headings:** not uniform. They range from "What this changes / Checks / After merging / Owner action" (#1) to no headings at all (#8, #9).
- **An item id (Q-###) named in the body:** 8/10 (all but #1 and #6).
- **`reviews/<n>/`:** 3/10 (#5, #6, #10).

**Choice of sample B.** The question says "ten merged in the first two weeks" without saying which ten, so I took #1–#10. A spread across the two weeks may differ.

## 8. Milestones and progress, and whether they name pull requests
- **Home.** Each project's tile shows its phases in a grid (Discovery, Design, Build, Launch, Done) and `Reached: <milestone>` events. These do not name PRs (home.js ~550–564, B).
- **Timeline (v3 projects).** Milestones from docs/PROJECT.md §3 are grouped by phase and iteration. **Each milestone row lists its PRs as sprint rows**, using the plan's ` · sprints:` list or the PR's `Milestone:` line. Unplaced merged PRs gather under "Not tied to a milestone · <n> sprints · <k> for the agents to file" (feed.js ~520–672, B).
- **v2.5 projects** (Personal-Org-Operating-Model). The desk reads open sprint files instead: `sprint unclear` or `sprint: <absent>` (model.js ~972–983, B).

## 9. Marks of what the owner has seen or done
- **Seen — on one device only.** The "New since you last looked" marker is kept in device storage under `desk-seen-v1` as `{ lastLooked }`. It moves only when a visible stretch of 10 s or more ends, or when the owner taps "Mark as seen". "Nothing is stored on Cloudflare". With no record, markers are off and the page says `new-since markers off on this device` (SD:src/lib/seen.js L1–9, L59–88, A).
- **Done — shared, because it lives in git.** The owner's answers are commits made through GitHub's new-file page (the desk "writes nothing", handover ~40–45, B). The desk reads them back as "Your answer recorded" and "Card answered" (home.js ~454–502, B). For PRs, the only done mark is GitHub's own state (merged or closed) and an `reviews/<n>/owner.md` verdict, if the owner wrote one.

## Proposed library entries (for the Source checker)
All are pinned to commit e6dd6b8 and come through a summarising fetch.

```
---
id: F-desk-pr-01
form: fact
claim: "At Service-Desk commit e6dd6b8 the desk flags an open pull request as waiting on the owner when its base is the default branch, it is not a draft, and (v3 projects) its head is not a same-repository item/* branch; GitHub reviews, labels, milestones and the PR's own checks are not read for this. Asks-merge job candidates are left out of notifications."
grade: B
topics: [desk, pull-requests, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js   # classifyPull ~1258-1268
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/github.js     # query ~49, ~66-77
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js    # L88-116
---
---
id: F-desk-pr-02
form: fact
claim: "At e6dd6b8 merged pull requests appear on the desk as 'Merged: <title>' on Home (v3 projects) and as Timeline sprint rows with merged mark, date, review mark (from reviews/<n>/ files), checks mark, the description's Context and Why, and a commits link; placement is by the plan's ' · sprints:' list, else the description's Milestone: line, else 'Not tied to a milestone'. The waiting-PR sheet does not show the description."
grade: B
topics: [desk, pull-requests, milestones]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/feed.js    # ~520-672, sprintView ~1148-1189
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js    # ~536-543
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/sandbox.js # ~1765-1768
---
---
id: F-desk-notify-01
form: fact
claim: "At e6dd6b8 the desk's phone notifications are sent once per newly waiting item (key project|kind|id), worded 'Waits on you: <kind>: <title>'; no notification exists for merges or other non-waiting events. Only Service-Desk has a sender (handover, 2026-10-30)."
grade: A for wording (words.mjs reproduced in full); B for scope
topics: [desk, notifications]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/words.mjs
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/docs/handover/service-desk.md
---
---
id: F-desk-seen-01
form: fact
claim: "At e6dd6b8 the desk's 'last looked' mark is stored only on the device (key desk-seen-v1), moved by a visible window of at least 10 s or by 'Mark as seen'; nothing is stored on Cloudflare."
grade: A
topics: [desk, dashboards]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js
---
---
id: F-desk-records-01
form: fact
claim: "In Service-Desk's records at e6dd6b8, status/merges.jsonl ties items to merge SHAs (spec null on all 10 lines) with no PR number, and dispatch-log/2026-11.jsonl carries no PR number or milestone; the PR-to-milestone ties are the description's Milestone: line and the plan's ' · sprints:' list. Sample: Milestone: line in 11/11 of PR #258-#268 (6 with ids, 5 'none (...)'), 0/10 of #1-#10; GitHub milestone and labels empty in all 21."
grade: B
topics: [records, pull-requests, milestones]
shelf_life: 3 months
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/status/merges.jsonl
  - https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr
---
```

---

## Six-part return
1. **What I changed:** nothing. I have no write lane; this memo is my output.
2. **Why:** to answer Q-019 at depth 3 from the desk's code and records, with two stated samples.
3. **What I verified:** about 60 WebFetch reads. Code was pinned to Service-Desk tree e6dd6b8, taken from the API tree listing. The 21 PR pages (#1–#10, #258–#268) were read live. Personal-Org-Operating-Model returned 404 on raw and API (repeatable). There were no commands; I hold no shell.
4. **What is undone:**
   - OPERATING_MODEL.md §3, the template's section 3 and specs/ (repository unreachable).
   - The ` · sprints:` fill rate (docs/PROJECT.md is out of bounds).
   - Merge SHAs for #258, #259, #260, #264 and #265.
   - Exact line numbers for the ~ citations.
   - Whether J12's GraphQL paging reaches all past PRs.
   - Whether Model-Lab has a sender.
5. **Needed outside my lane:**
   - Read access to Personal-Org-Operating-Model, or the owner confirming it is private. The Chief of Staff may need a decision card.
   - The Source checker to confirm the ~ line numbers against the raw files.
6. **Open questions (new, none closed):**
   - Is the milestone rule S-032 or S-033 (the desk's code says S-033, from 2026-10-17)?
   - Should sample B be the first ten merged or a spread across the two weeks?
   - Does Model-Lab have a notification sender?

Sources:
- [Service-Desk at e6dd6b8 (src/lib, src/notify, src/config, status, reviews, queue, dispatch-log, docs/handover)](https://github.com/shumpmaster/Service-Desk/tree/e6dd6b822d64226fc9229fce9cbba7bae57273e2)
- [Service-Desk pull requests list](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr)
- [Merged PRs, 2026-09-30 to 10-13](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+merged%3A2026-09-30..2026-10-13+sort%3Acreated-asc)
- PR pages: https://github.com/shumpmaster/Service-Desk/pull/1 through /pull/10, and /pull/258 through /pull/268