I've revised the memo again, but Q-019 still can't be filed at depth 3. The one thing I could do this round was make the seen.js line numbers checkable by a summarising fetch. The rest of the code findings still need a shell or an Orchestrator ruling.

# Six-part return: Q-019, researcher, revision 5 (2026-11-03)

## 1. What I changed
- **seen.js line numbers (source check, item 1).** I re-read every number they rest on, asking the fetch only to quote short strings word for word, never to count:
  - the file header, "97 lines (95 loc) · 3.49 KB";
  - the four commits' add/delete counts and hunk headers;
  - the commit list, which has 4 commits.

  All of them matched round 4. The derivation (§9a) now also shows why each added block must sit where I say, and it gives the checker a recipe that never relies on the summariser counting lines.
- **Narrower seen.js claims.** I removed "`{ lastLooked }`" from the entry, because no cited range holds it. The constants are now cited to L1–L26 (the part of the file no commit has changed since it was created) instead of L1–L23. Only the header comment and the `createSeen` line are tied to L1–L23 by GitHub's own numbers.
- **Entries split by what can be checked (items 2, 5, 6):**
  - **Ready to file:**
    - F-desk-records-01a: merges.jsonl and labels, both already confirmed by the checker;
    - F-desk-seen-01 and F-desk-seen-02: seen.js, by line numbers taken from GitHub's own figures.
  - **Ready once the checker opens them:** F-desk-records-01b (dispatch-log, milestones page, the other nine merge SHAs).
  - **Held for a ruling or a shell:** F-desk-pr-01, F-desk-pr-02, F-desk-notify-01, and the new F-desk-since-01, which takes `SINCE_DAYS` out of the seen entry.
  - **Held for re-checking and the sample definitions:** F-desk-records-02.
- **Estimates (item 4).** I checked every entry: none contains a grade-C statement. The C items stay in the memo body only, and are listed in §10.
- **How things were read (item 7).** Each entry now says it was read through a summarising fetch. Grades stay B. I point to library precedent: F-wcag22-01, F-platform-targets-contrast-01 and F-webpush-08 were filed at grade A after summarising-fetch reads, once the checker matched the wording. Whether that applies here is the checker's call.

## 2. Why
- The checker couldn't reproduce the seen.js numbers. A fetch that is asked to count lines gives different answers every time; this round it put `markSeen` "at line 97". But it quotes a short literal string like `@@ -55,6 +55,21 @@` faithfully. So the evidence now rests only on quoted strings the server produced, plus arithmetic anyone can redo.
- Splitting the entries lets the parts the checker has already confirmed be filed without waiting on the blocked parts.

## 3. What I verified
I have no shell, so I ran no commands. These are this round's WebFetch reads:

| Read | Result, quoted |
|---|---|
| blob seen.js at e6dd6b8 | "97 lines (95 loc) · 3.49 KB". Its claim that `markSeen` is at line 97 is wrong (it contradicts its own 97-line total), so it is not used |
| API commits, path seen.js | 4 commits: a57ad0e (2026-10-23T19:14:16Z), 2aedcdd (10-22T13:40:58Z), 602baa2 (10-21T20:13:03Z), 2f695e9 (10-14T05:11:43Z) |
| commit 2f695e9 | status added, +66 −0, `@@ -0,0 +1,66 @@` |
| commit 602baa2 | +15 −0, `@@ -55,6 +55,21 @@ export function createSeen({ store, now }) {` |
| commit 2aedcdd | +4 −0, `@@ -28,6 +28,10 @@ export function createSeen({ store, now }) {`; adds `get latest()` |
| commit a57ad0e | +13 −1, `@@ -24,6 +24,7 @@ export function createSeen…` and `@@ -45,10 +46,21 @@ export function createSeen…` |

Everything else is carried over from round 4 and not re-fetched.

## 4. What is undone
- **Line numbers for the large files**: records.js, github.js, model.js, home.js, feed.js, sandbox.js, pulls.js, waiting.js, words.mjs, scheduler.js, sender.mjs and j11.js.
- **A second independent source for any code fact.** None is reachable.
- **Sample counts.** Only I have read them.
- **The C estimates** listed in §10.
- **OPERATING_MODEL.md, template-v3/ and specs/.** The repository returns 404.

## 5. Needed outside my lane
- **The Source checker**, on F-desk-seen-01 and -02: fetch the 4 commit URLs and the blob, and ask only for the quoted strings in §9a. On F-desk-records-01b: open the closed-pulls list for #265–#267, pulls/259–264, dispatch-log/2026-11.jsonl and the milestones page.
- **Someone with a shell**, at e6dd6b8: run `wc -l src/lib/seen.js` (expect 97), `sed -n '74,88p;27p' src/lib/seen.js`, and `grep -n` for each quoted string in the held entries.
- **An Orchestrator ruling** (by decision card if needed):
  - Can a function name plus a quoted search string stand in for line numbers in large files?
  - Can GitHub's hunk headers stand as line evidence?
  - Can "the code plus GitHub's server" count as two sources?
- **The owner:** is Personal-Org-Operating-Model private?

## 6. Open questions
None closed as unimportant.
1. Is the milestone rule from S-032 or S-033? The desk's code says S-033 twice.
2. Should sample B be #1–#10, or a spread across the first two weeks?
3. Should sample A stay as drawn (#258–#268)? #268, #269 and #271 have merged since.
4. Do the `reviews/<milestone>/` folders count as records that tie a PR to a milestone?
5. Does the desk read issues labelled `needs-you` (8 of them, all issues), and is that a ninth kind of waiting?

---

# Research memo — Q-019 — what the desk already shows and reads for pull requests, and which records tie a pull request to its plan — 2026-11-03 (revision 5)

**Researcher.** Depth 3. Research is blind: I have not seen any recommendation, ruling or docs/PROJECT.md.

**How it was read.**
- Everything was read from public GitHub through WebFetch, which passes each page through a summarising model.
- Code is pinned to Service-Desk commit e6dd6b8 (`e6dd6b822d64226fc9229fce9cbba7bae57273e2`), written below as `SD:`.
- Pull-request pages, the REST API and the search API were read live on 2026-11-03.

**How citations work.**
- **Line numbers (`Lnn`)** are given only where GitHub's own numbers fix them:
  - seen.js, from its file header and the four commits' hunk headers and add/delete counts (§9a);
  - status/merges.jsonl, L1–L10 (confirmed by the source check).
- **Every other citation** is a file, a function, and a quoted string to search for with `grep -n`. This does not yet meet the question's file-and-lines requirement (§10).
- **Not used:** line positions counted by the summariser.

**Grades.**
- B: a quote or full read from the primary source through the summarising fetch, or a number GitHub's server produces (file header, hunk header, add/delete count, search total_count).
- C: my inference, or a search for absent text in a file I couldn't read in full (an *estimate*).
- No A grades.

Every statement is a fact unless marked *estimate* or *opinion*.

**Independence.** Each code fact has one primary source: the code at e6dd6b8, together with its own commit history. A pull-request page or a search that agrees counts as corroboration, not as an independent source.

## 0. Parts not answered, and why
- **Out of bounds by the question's own rules:**
  - what Service-Desk's ` · sprints:` lists contain (they are in docs/PROJECT.md);
  - whether Model-Lab has a phone sender (Model-Lab may not be read).
- **Can't be reached:** Personal-Org-Operating-Model returns HTTP 404. So OPERATING_MODEL.md §3, template-v3/ and specs/ are unchecked.
- **The model version may not match.** The question says S-032. The desk's code names S-033 twice:
  - the `Milestone:` line is "model S-033's J1, from 2026-10-17" (SD:src/lib/model.js, `parseRecord`; B);
  - a card's `Milestone:` line is "model S-033 AC5" (SD:src/lib/records.js, `cardMilestoneLine`; B).
- **Not read:** Service-Desk's specs/S-001.md (not on the may-read list).

## 1. Waiting and merged pull requests on the desk
**What `/` serves.** "mockup v2 as built (sandbox.js, its routes under #/)"; "the accepted M1 and M2 views (AC43) are gone" from stage 8 (SD:src/public/app.js, header comment; B).

### A pull request waiting on the owner (B)
- **Source:** REST `${base}/pulls?state=open&per_page=100` (SD:src/lib/github.js, `urlsFor`).
- **Rule:** `classifyPull` (SD:src/lib/records.js; grep "export function classifyPull").
  - Its doc comment: "Whether a PR needs the owner (Terms, AC2): open (the list holds only open PRs), not a draft, based on the default branch, and not an Orchestrator item branch in a v3 project … a fork's PR from a branch of that name is flagged like any other (review N7)."
  - It returns not flagged in three cases:
    - `if (pr.draft)` → `'draft'`;
    - `if (pr.base !== project.defaultBranch)` → `` `into ${pr.base}` ``;
    - in v3, a head matching `ITEM_BRANCH_RE = /^item\/[A-Za-z0-9._-]+$/` with `pr.headRepo` (compared ignoring case) equal to `project.repo` → `'item branch (the Orchestrator merges it)'`.
  - Otherwise it returns `{ flagged: true, why: 'waiting on your review or merge' }`.
- **The sheet** (SD:src/lib/sandbox.js, `sheetView`):
  - `what: pr.title`;
  - `why: \`${pr.who}; ${pr.why}\``, where who is `'yours'` or `` `opened by ${pr.login}` `` (model.js `buildModel`);
  - the link 'Open the pull request in GitHub';
  - a verdict box at `` `reviews/${pr.number}/owner.md` `` on `pr.head`, with a `fork` flag;
  - a reviewer box at `reviews/<n>/reviewer.md`.

  It doesn't use the description. Whether it shows CI on the default branch's head is an *estimate* (C).
- **Home** (home.js `projectEvents`):
  - `` `Opened: ${pr.title}` ``;
  - up to `COMMIT_LINES` commit lines per PR, then `` `${…} more on #${e.pr}` ``;
  - merge commits are skipped (`if (x.parents >= 2 …) continue;`).
- **The asks-merge job** (model.js `buildModel`; grep "AC79 (2026-10-19)"):
  - it acts only if `v.head === f.pr.headSha`;
  - a PR being recorded shows under `BEING_RECORDED_WORDS` and isn't counted as waiting;
  - the phone sender leaves job candidates out (`if (jobs.has(n)) continue;`, waiting.js `waitingSet`);
  - sender.mjs logs that "the automatic job may still merge".

### A merged pull request (B)
- **Source:** GraphQL `PULLS_QUERY` (github.js) reads `pullRequests(baseRefName: $base, first: 100, after: $after, orderBy: {field: CREATED_AT, direction: DESC})` with these fields:
  - `number title body state createdAt mergedAt closedAt headRefName`;
  - `mergeCommit { oid message author { name } }`;
  - `changedFiles files(first: 2) { nodes { path } }`;
  - `commits(last: 1) { … statusCheckRollup { state } }`;
  - `pageInfo`.
- **Paging:**
  - `PULLS_PAGE = 100` and `PULLS_COST = 5` of a budget of 25;
  - `pullsVariables` passes `after`;
  - a part over budget comes back `null`.
  - *Estimate* (C): at most 500 PRs per blob call.
- **Home:** `` `Merged: ${p.title}` `` only for v3 (`if (v3 && snap && snap.pulls …)`, home.js).
- **Timeline** (feed.js). Each row shows:
  - `{ mark: '✓', word: 'merged' }`;
  - the date, or 'date not recorded';
  - `reviewMark` (from `REVIEW_VERDICT_RE` paths);
  - `checksMark` (pulls.js);
  - from `sprintView`: the title, the description's Context and Why, `pr.head`, and a commits link ("Opens the pull request's commits on GitHub; each one says who made it.").
- **Where a merged PR is placed:**
  1. under the milestone whose plan list names it (`r.sprints[m.id]`);
  2. otherwise under the milestone its `Milestone:` ids name (`named.get(m.id)`);
  3. otherwise in the group "No milestone in the plan lists these sprints, and they name none."
- **Left off the Timeline:**
  - job merges (`pr.job === true`);
  - PRs not yet read (`!pullRead(pr)`);
  - merges that change only estimates (`estimateMerge`) or only value checks (`valueCheckMerge`);
  - open PRs, and PRs closed without merging.

## 2. Which parts of a pull request the desk reads, and which it shows

| Part | Read? | Shown? | Source (B unless marked) |
|---|---|---|---|
| Title | yes | yes, as written | github.js `PULLS_QUERY`; home.js |
| Description | yes | Context and Why only, on merged rows. `Milestone:` is used to place merged PRs; whether it is ever shown as text is an *estimate* (C). Not used on the waiting sheet | pulls.js `MILESTONE_RE = /^Milestone:[ \t]*(.*)$/`, `prBodyParts`; sandbox.js `sheetView` |
| Form of the `Milestone:` line | the code says it "reads it and checks no form (the model's checks do, in the project's own CI)" | — | records.js `milestoneValue` |
| Diff | not among the query's fields | no | `PULLS_QUERY` |
| Changed files | count plus 2 paths (GraphQL); REST `/pulls/<n>/files`, at most 3 pages of 100 | no. Used for recorded answers, job candidates, and estimate- or value-check-only merges | prfiles.js; pulls.js `estimateOnly`, `valueCheckOnly` |
| Commits | last commit's rollup; REST `/pulls/<n>/commits` | first lines on Home; a link on merged rows | github.js `urlsFor`; home.js |
| Checks | rollup state | `checksMark` (✓ ✕ … –) | pulls.js |
| GitHub reviews, review requests, labels | not in `PULLS_QUERY` or `urlsFor`. That nothing else reads them is an *estimate* (C) | no | github.js |
| GitHub milestone | not in the query; the repository has none | no | github.js; milestones page |
| Review verdict files | `reviews/<n>/*.md` on the default branch | review mark | feed.js `reviewMark` |
| Merge commit | oid, message, author | "job merge" = author `'github-actions[bot]'` plus exactly one `Merged-By: orchestrator` trailer | pulls.js `isJobMerge` |
| Author association | yes | an outside author's PR is notified without its title | waiting.js `outsideAuthor`; words.mjs `itemWords` |

**A later change may matter.** reviews/README says reviewers post verdicts as PR reviews from stage T2. The desk wouldn't see those (*estimate*, C).

## 3. How "waits on the owner" is decided, and what it leaves out
- **Kinds.** `KINDS` in waiting.js lists eight (B): decision card, gate ruling, held loop, merge to do by hand, card gone missing, question, pull request to merge, deploy to approve.
- **The `needs-you` label** ("A card waits on the owner (the Orchestrator's alerts)"). It is on 8 items, all issues and no PRs (search API, total_count 8; B). Whether the desk reads it is not established.
- **Not flagged** (B):
  - drafts;
  - PRs into a branch other than the default;
  - in v3 projects, `item/*` heads from the same repository;
  - repositories not in src/config/projects.json.

  PRs the job is recording are shown but not counted.
- **Not tested by `classifyPull`:** review requests, review state, labels, GitHub milestone, the PR's own checks, mergeability. Its code tests only `draft`, `base`, `head` and `headRepo` (B).
- **Deploys.** Only where `"deploysNeedOwner": true`, which is Service-Desk alone (B). The row reads `` `${title}: waiting for your approval` `` and `` `run ${r.runNumber}; its approver: ${NOT_RECORDED}` `` (model.js; B).

## 4. Changes that are not pull requests
- **Deploys.** Only waiting runs are shown (B). That finished deploys don't show is an *estimate* (C).
- **Direct commits.** Home's commit lines come only from PRs' own commits, and merge commits are skipped (B). That direct commits don't show is an *estimate* (C).
- **The Timeline** has a `commits/${tip}` history link (feed.js `tasks`; B). It is a link, not a list.
- **Record-only commits** show only as the events their records produce (home.js; B):
  - `Your answer recorded` and `Card answered`;
  - `` `Reached: ${m.name}` ``;
  - `` `withdrawn: ${path}` ``. The scheduler keeps the last 10 (`st.withdrawn = [...].slice(-10)`).

## 5. Freshness, and changes after a row is listed
- **Polling** (scheduler.js; B):
  - `POLL_MS = 60_000` and `PORTFOLIO_POLL_MS = 300_000`;
  - stale after `STALE_MS = 180_000`;
  - stops while the page is hidden (`if (!desk.running || !isVisible())`).
- **Times are kept per project only:** `lastSuccessAt`, `lastPollStart`, `recheckedAt` (B). That no time is kept per row is an *estimate* (C).
- **What Home says:** `` `Every project read ${…}ago` `` (`briefingView`) and `` `checked ${…} ago` `` (`titleLine`) (B).
- **A PR that changes after it is listed:**
  - the row is rebuilt on each poll (*estimate*, C);
  - the job's state counts only while `v.head === f.pr.headSha` (B).
- **No second notification on a change.**
  - The key is `` `${project}|${kind}|${id}` `` (waiting.js `waitKey`; B).
  - Keys already sent or given up are carried forward without resending: `if (!bootstrap && e && (e.sent || e.gaveUp)) next.keys[h] = e;` (sender.mjs `runSender`; B).
  - So a changed PR doesn't notify again (*estimate*, C).

## 6. Phone notifications, by project
- **Service-Desk.**
  - Handover: "Service-Desk's sender sends a phone notification the moment something starts waiting on you there" (docs/handover/service-desk.md; B). The sender is the `desk-notify` workflow (B).
  - Wording (words.mjs; B):
    - `itemWords`: the title is the project's name; the body is "Waits on you: <kind words>: <what>", or "…a pull request from someone outside the project";
    - `groupWords`: the title is 'Service Desk'; the body is "<n> things now wait on you in <project>".
  - A tap opens `` `${deskUrl}/?open=${key}` `` on `https://needs-you.pages.dev` (B).
- **Personal-Org-Operating-Model.** "The operating-model project has no sender yet (found 2026-10-30: Setup N9 and CS16 were never done), so its items show on the desk but don't notify the phone" (handover; B).
- **Model-Lab.** It is in projects.json as v3, added by PR #263 (B). Whether it has a sender is out of bounds.
- **Merged changes are not notified: an *estimate* (C).**
  - sender.mjs's 7 `deliver(` calls send `backOnWords`, `testWords`, `summaryWords` (twice), `groupWords`, `itemWords` and `costWords`.
  - Its one `pushOnce(` call is in `failTest`.
  - Items come from `c = await collect(…)`. None of these is for merges.
  - It stays C because the list came through the summariser, not grep.

## 7. Records that tie a pull request to a milestone, sprint, spec or plan

| Record | What it ties | What the desk does with it | Source |
|---|---|---|---|
| The description's `Milestone:` line | PR → milestone ids, or `none (<reason>)` | `milestoneValue` splits on `', '` and checks no form; used to place merged PRs | records.js; pulls.js `MILESTONE_RE` (B) |
| The plan's ` · sprints:` | milestone → `PR #\d+` or `[PQE]-\d{3,}` | read; takes precedence over the PR's own line | j11.js `milestoneLines` (B). Contents out of bounds |
| status/`<item>`.toml `milestone` | item → milestone | read | e.g. status/Q-019.toml `milestone = "Discovery-5"` (B) |
| status/merges.jsonl | item → `item_tip`, `merge`, `spec` | read for the merge gate | L1–L10 (B; confirmed by the source check) |
| dispatch-log/2026-11.jsonl | item → role, stage, spec, record, session | read; 15 lines, no PR or milestone field | (B) |
| reviews/`<n>`/ | PR → verdicts | review mark | reviews/README (B) |
| reviews/`<M…>`/ (M3B, M3C, M3D, M3E, M3G), reviews/`<item>`/ | milestone or item → reviews | not read by the per-PR mark (*estimate*, C) | reviews/ listing |
| Merge commit | PR → merge SHA and trailers | marks job merges | pulls.js `isJobMerge` (B) |
| GitHub milestone | none exist | — | milestones page (B) |
| GitHub labels | 12 exist; no PR carries any | — | search API: `is:pr no:label` 265 = `is:pr` 265; control `label:needs-you` 8, all issues (B) |
| Spec headers | not read as such; `spec` only as a field | — | records.js (B) |

**status/merges.jsonl (B).**
- **Items:** L1 Q-001, L2 Q-004, L3 Q-002, L4 Q-005, L5 Q-006, L6 Q-008, L7 Q-007, L8 Q-011, L9 Q-013, L10 Q-016. `"spec": null` on every line.
- **Merge SHA prefixes:** 92e1dd0, 22afcd0, 2253706, 108bdd5, a6435a2, e207665, 581b312, 5de587e, 3a0f0c9, 167038a.
- **No pull-request-number key.**
- **No match with sample A.** Sample A's merge SHAs, from `api.github.com/repos/shumpmaster/Service-Desk/pulls/<n>` (B):

  | PR | Merge SHA |
  |---|---|
  | #258 | fa50572fee5e0b74481a3b4a230e4745c079b4c1 (confirmed by the source check) |
  | #259 | 8806dbabafbae501aa3f0c45a9e704787b5f055f |
  | #260 | 1d7992be45331ec1f9a60781f66b9362f10a10ca |
  | #261 | 5f6454b3f39a9ab0750483fabb38cca4a17d04e4 |
  | #262 | 95d114fd03088a79271a17337d9829addb485450 |
  | #263 | 6b8f83b43f135c33f0a905561f0c8cfd86da70c3 |
  | #264 | c0d6ef8d7eeb3c9eede06fd2ebd3bc96e67dda8f |
  | #265 | eb249cd4696c730d03c4d2c714e1611bbd8634c0 |
  | #266 | e300411b4c5b575a71be96d27a28a32574285932 |
  | #267 | 7a91b6a6657ce0cee003c2b94e203d737dd70821 |

  None of these shares a prefix with merges.jsonl.

### Samples
These are my reads of the GitHub pages on 2026-11-03 (B; nobody else has checked them yet).

**Sample A, as drawn: the open PR #268 and the last ten merged, #258–#267 (11 PRs).**
- `Milestone:` line: 11/11.
  - Naming ids, 6/11: #267 "Discovery-5, Discovery-4"; #266 and #265 "Discovery-3"; #260, #259 and #258 "M3C".
  - `none (…)`, 5/11: #268, #264, #263, #262, #261.
- Sections "What this means for you / Context / Why / Tasks": 11/11.
- Spec id S-001 in the description: 4/11 (#258, #259, #260, #263).
- `reviews/<n>/` at e6dd6b8: 2/11 (#259, #263).
- GitHub milestone: 0/11. Labels: 0/11 (and none on any PR, per the search API).
- No head branch is `item/*`.
- #268 has since merged (2026-11-03T02:43:02Z), as have #269 and #271.

**Sample A, redrawn earlier today (#260–#269):**
- `Milestone:` line 10/10 (ids 4, `none` 6);
- spec id 2/10;
- `reviews/<n>/` 1/10.

**Sample B: the first ten merged, #1–#10 (2026-09-30 to 10-01).**
- `Milestone:` line: 0/10. The search API agrees: 0 of the 16 merged PRs created before 2026-10-02 have "milestone" in the description (B).
- GitHub milestone or labels: 0/10.
- Headings: not uniform.
- A Q-### id: 8/10.
- `reviews/<n>/`: 3/10 (#5, #6, #10).
- *Opinion:* a spread across the two weeks might give different counts.

## 8. Milestones and progress
- **Home.** `PHASES = ['Discovery', 'Design', 'Build', 'Launch', 'Done']` and `Reached: <milestone>` events. Neither names PRs (home.js; B).
- **Timeline (v3).** Milestones list their merged PRs as sprint rows. Untied PRs are grouped under `· for the agents to file` (feed.js; B).
- **v2.5 projects.** The desk reads open sprint files instead, with `'sprint unclear'` (model.js `finishV25`; B).

## 9. Marks of what the owner has seen or done
- **Seen: on this device only** (SD:src/lib/seen.js, 97 lines; B).
  - **L1–L23:** the header comment and `export function createSeen({ store, now })`. The comment reads: "'New since you last looked' (spec S-001, AC40). 'Last looked' is the end of the last window in which the desk was visible on this device for at least 10 s in a row; a shorter flash doesn't count. It is kept on the device only, under its own key, through the wrapped store (J5's rule), and nothing is stored on Cloudflare. With no record (first visit, a private window, cleared or failing storage) nothing is marked new and the desk says so."
  - **L1–L26 (unchanged since the file was created):** the constants `SEEN_KEY = 'desk-seen-v1'`, `SEEN_MIN_MS = 10_000` ("a constant to tune in the lab") and `MARKERS_OFF = 'new-since markers off on this device'`. Their exact lines are not settled (grep "SEEN_KEY").
  - **L27:** the line a57ad0e added, the `held` flag.
  - **L46–L66:** a57ad0e's second hunk. It adds `hold(on)` and the `held` getter, and makes `hidden()` leave "last looked" alone while the "<n> more since" sheet holds it (AC89). The range includes context lines.
  - **L74–L88:** `markSeen()` ("Mark as seen", AC40 as AC82 changes it). It sets "last looked" to now on this device (added in 602baa2).
  - **No 7-day constant** in the file (full read).
- **The 7-day bound** (home.js; B): `export const SINCE_DAYS = 7;` ("At most the last 7 days (AC82, C)"), used as `const floor = nowMs - SINCE_DAYS * 86400e3;` in `sinceView`. PR #180 mentions "Mark as seen" and "the 7-day bound". It backs up the feature, but says nothing about where the mark is kept.
- **Done: shared, because it lives in git.**
  - Answers are committed through GitHub's new-file page, and "the desk itself writes nothing" (handover; B).
  - The desk reads them back as "Your answer recorded" and "Card answered".
  - For PRs, the only done marks are GitHub's own state and `reviews/<n>/owner.md` (B).

### 9a. How the seen.js line numbers were worked out, and how to check them
**The numbers, all produced by GitHub's server and re-read on 2026-11-03:**
- The blob header reads "97 lines (95 loc) · 3.49 KB".
- The API commit list for the path at e6dd6b8 has 4 commits.

| Commit | Date | Adds / deletes | Hunk header(s), as quoted | Lines after |
|---|---|---|---|---|
| 2f695e9 | 2026-10-14T05:11:43Z | +66 −0 (status added) | `@@ -0,0 +1,66 @@` | 66 |
| 602baa2 | 2026-10-21T20:13:03Z | +15 −0 | `@@ -55,6 +55,21 @@ export function createSeen({ store, now }) {` | 81 |
| 2aedcdd | 2026-10-22T13:40:58Z | +4 −0 | `@@ -28,6 +28,10 @@ export function createSeen({ store, now }) {` | 85 |
| a57ad0e | 2026-10-23T19:14:16Z | +13 −1 | `@@ -24,6 +24,7 @@ …` and `@@ -45,10 +46,21 @@ …` | 97 |

**The arithmetic.** The assumption is GitHub's default of 3 context lines.
- **Total.** 66 + 15 + 4 + 12 = 97, which matches the blob header.
- **Each added block is contiguous.** If a hunk's additions were split, context lines would sit between the pieces. Then the hunk would hold more than 6 context lines, unless it touched the start or end of the file.
  - 602baa2's hunk: old L55–L60 in a 66-line file. 6 context lines means 3 before and 3 after, so the 15 added lines are new L58–L72.
  - 2aedcdd: 4 lines added at L31–L34.
  - a57ad0e's first hunk: 1 line added at L27.
- **markSeen moves down.**
  - 2aedcdd's addition is above the block, so the block moves +4, to L62–L76.
  - a57ad0e's hunks end at old L54 and add 12 lines in net, so the block moves +12, to **L74–L88**.
- **a57ad0e's second hunk** spans new L46–L66 (start 46, 21 lines).
- **createSeen's position.** The hunk headers' function context, "export function createSeen…", is the nearest such line above each hunk. So `createSeen` is at or above L23, and L1–L26 are as created.

**Check recipe for a summarising fetch.** Ask only for verbatim quotes of: the blob's "N lines" header, the commit-list count, and for each commit, the seen.js `additions`/`deletions` and `@@` strings. Don't ask it for line positions: this round it put `markSeen` "at line 97", which contradicts its own total.

## 10. Estimates, and what keeps entries back
**Estimates (C), kept out of every entry:**
- whether the waiting sheet shows CI;
- the 500-PRs-per-call cap;
- whether `Milestone:` is ever shown as text;
- that reviews and labels are read nowhere else;
- PR reviews from stage T2;
- that finished deploys and direct commits don't show;
- that no time is kept per row;
- that rows are rebuilt on each poll;
- that a changed PR doesn't notify again;
- that merges aren't notified;
- that `reviews/<M…>/` folders aren't read.

**Entries held back.** F-desk-pr-01, F-desk-pr-02, F-desk-notify-01 and F-desk-since-01 cite large files by function and search string only. Under Q-019.md's file-and-lines requirement, they wait for a shell or an Orchestrator ruling.

## Proposed library entries (for the Source checker)

**Ready to file.**
```
---
id: F-desk-records-01a
form: fact
claim: "At Service-Desk commit e6dd6b8, status/merges.jsonl has 10 lines, all question items (Q-001 to Q-016), keys item, item_tip, merge, spec, with spec null on every line and no pull-request-number key. On 2026-11-03 no pull request in the repository carried a label (search API: is:pr no:label total_count 265, incomplete_results false; is:pr 265; control label:needs-you returns 8 issues and 0 PRs)."
grade: B
topics: [records, pull-requests]
shelf_life: 3 months
read_via: summarising fetch (WebFetch); search totals are server numbers
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/status/merges.jsonl#L1-L10
  - https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+is:pr+no:label
  - https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+is:pr
  - https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+label:needs-you
---
---
id: F-desk-seen-01
form: fact
claim: "At Service-Desk commit e6dd6b8, src/lib/seen.js (97 lines per GitHub's file header) opens, within L1-L23, with a header comment saying 'last looked' is the end of the last window in which the desk was visible on this device for at least 10 s in a row, is kept on the device only under its own key, and that nothing is stored on Cloudflare; createSeen({ store, now }) is declared at or above L23 (per the hunk headers' function context). SEEN_KEY = 'desk-seen-v1' and SEEN_MIN_MS = 10_000 lie in L1-L26, unchanged since the file was created."
grade: B
topics: [desk, dashboards]
shelf_life: 3 months
read_via: summarising fetch; line ranges from GitHub's file header and hunk headers (memo §9a)
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js#L1-L26
  - https://api.github.com/repos/shumpmaster/Service-Desk/commits?sha=e6dd6b822d64226fc9229fce9cbba7bae57273e2&path=src/lib/seen.js
  - https://api.github.com/repos/shumpmaster/Service-Desk/commits/a57ad0ec76f919dfd83759a21be50c65fc64af20   # '@@ -24,6 +24,7 @@ export function createSeen'
---
---
id: F-desk-seen-02
form: fact
claim: "At e6dd6b8, src/lib/seen.js L74-L88 holds markSeen() ('Mark as seen'), which sets 'last looked' to now on this device (added in 602baa2), and L46-L66 is commit a57ad0e's change adding hold(on), the held getter and a hidden() that leaves 'last looked' alone while the '<n> more since' sheet holds it; the line ranges are derived from GitHub's hunk headers and add/delete counts assuming the default 3 context lines (memo §9a)."
grade: B
topics: [desk, dashboards]
shelf_life: 3 months
read_via: summarising fetch; ranges by arithmetic on server-produced hunk headers
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js#L46-L88
  - https://api.github.com/repos/shumpmaster/Service-Desk/commits/602baa2da6474922a06651f934590f59ece39195   # '@@ -55,6 +55,21 @@', +15 -0
  - https://api.github.com/repos/shumpmaster/Service-Desk/commits/2aedcdd953d0b4434b81de2ea3e23945a2848744   # '@@ -28,6 +28,10 @@', +4 -0
  - https://api.github.com/repos/shumpmaster/Service-Desk/commits/a57ad0ec76f919dfd83759a21be50c65fc64af20   # '@@ -45,10 +46,21 @@', +13 -1
---
```

**Ready once the checker opens the sources.**
```
---
id: F-desk-records-01b
form: fact
claim: "None of the merge commit SHAs of Service-Desk PRs #258-#267 (pulls API merge_commit_sha) appears in status/merges.jsonl at e6dd6b8; dispatch-log/2026-11.jsonl (15 lines) has no pull-request-number or milestone field; on 2026-11-03 the repository had no GitHub milestones."
grade: B
topics: [records, pull-requests, milestones]
shelf_life: 3 months
read_via: summarising fetch
sources:
  - https://api.github.com/repos/shumpmaster/Service-Desk/pulls/258   # through /pulls/267, merge_commit_sha (memo §7 table)
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/status/merges.jsonl#L1-L10
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/dispatch-log/2026-11.jsonl
  - https://github.com/shumpmaster/Service-Desk/milestones?state=all
---
```

**Held: they need a shell or a ruling on line numbers.** The claims are unchanged from revision 4, and none contains a C estimate.
```
---
id: F-desk-pr-01
form: fact
claim: "At Service-Desk commit e6dd6b8, classifyPull (src/lib/records.js) returns flagged:false for a draft ('draft'), for a base other than the project's default branch, and in v3 projects for a head matching ITEM_BRANCH_RE (^item/…) from the project's own repository (a fork's same-named branch is flagged); otherwise { flagged: true, why: 'waiting on your review or merge' }. Pull requests the asks-merge job is recording at their current head are shown as being recorded, not counted (model.js, AC79); job candidates are left out of notifications (waiting.js waitingSet, 'jobs.has(n)')."
grade: B
topics: [desk, pull-requests, dashboards]
shelf_life: 3 months
read_via: summarising fetch; cited by function and search string, no line numbers
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js   # grep "export function classifyPull"
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
read_via: summarising fetch; cited by function and search string, no line numbers
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
read_via: summarising fetch; cited by function and search string, no line numbers
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/words.mjs   # grep "function itemWords", "function groupWords"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/waiting.js     # grep "waitKey"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/sender.mjs  # grep "e.sent || e.gaveUp"
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/docs/handover/service-desk.md  # grep "has no sender yet"
---
---
id: F-desk-since-01
form: fact
claim: "At e6dd6b8 the desk's Home lists new-since lines from at most the last 7 days: home.js 'export const SINCE_DAYS = 7;', used in sinceView as 'nowMs - SINCE_DAYS * 86400e3'."
grade: B
topics: [desk, dashboards]
shelf_life: 3 months
read_via: summarising fetch; cited by search string, no line numbers
sources:
  - https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js   # grep "SINCE_DAYS"
  - https://github.com/shumpmaster/Service-Desk/pull/180   # corroborates the 7-day bound
---
```

**Held: needs re-checking and settled sample definitions (open questions 2 and 3).**
```
---
id: F-desk-records-02
form: fact
claim: "Sample read 2026-11-03 from Service-Desk's pull-request pages: a 'Milestone:' description line in 11/11 of PRs #258-#268 (6 naming ids, 5 'none (...)') and in 0/10 of PRs #1-#10; GitHub's search finds 0 of the 16 merged PRs created before 2026-10-02 with 'milestone' in the description."
grade: B
topics: [records, pull-requests, milestones]
shelf_life: 3 months
read_via: summarising fetch; researcher's own reads, not yet re-checked
sources:
  - https://github.com/shumpmaster/Service-Desk/pull/258   # through /pull/268, and /pull/1 through /pull/10
  - https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+milestone+in%3Abody+created%3A%3C2026-10-02
---
```

Sources:
- [seen.js at e6dd6b8](https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/seen.js); [its commits](https://api.github.com/repos/shumpmaster/Service-Desk/commits?sha=e6dd6b822d64226fc9229fce9cbba7bae57273e2&path=src/lib/seen.js&per_page=20); commits [2f695e9](https://api.github.com/repos/shumpmaster/Service-Desk/commits/2f695e9e55b1cd20705dbe4f413a650870636acc), [602baa2](https://api.github.com/repos/shumpmaster/Service-Desk/commits/602baa2da6474922a06651f934590f59ece39195), [2aedcdd](https://api.github.com/repos/shumpmaster/Service-Desk/commits/2aedcdd953d0b4434b81de2ea3e23945a2848744), [a57ad0e](https://api.github.com/repos/shumpmaster/Service-Desk/commits/a57ad0ec76f919dfd83759a21be50c65fc64af20)
- [records.js at e6dd6b8](https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/records.js?plain=1); [its 16 commits](https://api.github.com/repos/shumpmaster/Service-Desk/commits?sha=e6dd6b822d64226fc9229fce9cbba7bae57273e2&path=src/lib/records.js&per_page=100)
- [home.js](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/lib/home.js), [sender.mjs](https://github.com/shumpmaster/Service-Desk/blob/e6dd6b822d64226fc9229fce9cbba7bae57273e2/src/notify/sender.mjs), [merges.jsonl](https://raw.githubusercontent.com/shumpmaster/Service-Desk/e6dd6b822d64226fc9229fce9cbba7bae57273e2/status/merges.jsonl), [tree at e6dd6b8](https://github.com/shumpmaster/Service-Desk/tree/e6dd6b822d64226fc9229fce9cbba7bae57273e2)
- Pulls API: [#258](https://api.github.com/repos/shumpmaster/Service-Desk/pulls/258), [#259](https://api.github.com/repos/shumpmaster/Service-Desk/pulls/259), [#260](https://api.github.com/repos/shumpmaster/Service-Desk/pulls/260), [#261](https://api.github.com/repos/shumpmaster/Service-Desk/pulls/261), [#262](https://api.github.com/repos/shumpmaster/Service-Desk/pulls/262), [#263](https://api.github.com/repos/shumpmaster/Service-Desk/pulls/263), [#264](https://api.github.com/repos/shumpmaster/Service-Desk/pulls/264), [closed list (#265–#271)](https://api.github.com/repos/shumpmaster/Service-Desk/pulls?state=closed&per_page=20&sort=created&direction=desc)
- Search API: [is:pr no:label](https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+is:pr+no:label&per_page=1), [is:pr](https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+is:pr&per_page=1), [is:pr is:merged](https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+is:pr+is:merged&per_page=1), [label:needs-you](https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+label:needs-you&per_page=3), [is:pr label:needs-you,desk-notify](https://api.github.com/search/issues?q=repo:shumpmaster/Service-Desk+is:pr+label:needs-you,desk-notify&per_page=5); [labels API](https://api.github.com/repos/shumpmaster/Service-Desk/labels?per_page=100)
- [Milestones](https://github.com/shumpmaster/Service-Desk/milestones?state=all); [search: merged before 2026-10-02 with "milestone"](https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged+milestone+in%3Abody+created%3A%3C2026-10-02)
- [PR #180](https://github.com/shumpmaster/Service-Desk/pull/180), [PR #263](https://github.com/shumpmaster/Service-Desk/pull/263), [PR #267](https://github.com/shumpmaster/Service-Desk/pull/267); PR pages /pull/1–/pull/10 and /pull/258–/pull/269
- [Personal-Org-Operating-Model (404)](https://github.com/shumpmaster/Personal-Org-Operating-Model)