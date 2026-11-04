# The briefing work's Discovery: a read-only helper's audit of pull requests, counts and the desk's code

*Recorded verbatim by the Chief of Staff's session (session_01QBwHGLAD7AxQEHaeDupxMw) on 2026-11-04. This is the return of a read-only helper that held a shell and no write tools for the repositories, sent after the owner dropped research Q-017 and Q-019 (decisions/Q-017/stop-3.md, decisions/Q-019/stop-2.md), to do what that research could not: audit pull-request descriptions against their diffs (Q-017's ground, research/Q-017.md), make Q-018's counts (research/Q-018.md, research/Q-018-memo.md), and read what the desk shows and reads for pull requests (Q-019's ground, research/Q-019.md, starting from its memo on item/Q-019). It has not been through the source checker, so nothing in it enters the library; it is a Discovery record for the briefing work (P-002). The helper reported roughly 150k tokens (its run: 181,479 tokens, 66 tool uses, about 12.5 minutes). Its return follows, unchanged.*

---

I could do all three parts with a shell and full history, and the results are below.

- **Descriptions.** I checked 30 merged Service-Desk pull requests. Most descriptions are right: 24 of 30 match what changed. One says something the change did not do, three leave out real parts of the change, and two make claims that can't be checked from the change itself. The main fault is that a description is often not updated after commits are added later. 26 of the 30 got more commits after they were opened.
- **Merge commits.** They do not always carry the description, even though the setup guide says they do. 40 of 260 pull-request merges have no description at all, and 11 of those came after the rule was written.
- **Counts.** About 7 pull requests are merged into the desk's own repository each day, with a peak of 36 in one day. More changes than that reach main without any pull request: 189 automated run commits, 13 item merges and 43 files created in GitHub's web editor.
- **What the desk reads.** The Researcher's memo is mostly right. It is wrong on two points: the sheet for a waiting pull request does use its description (the milestone it unblocks and its Context section), and the desk keeps at most 300 pull requests, not 500.

What I could not do: GitHub's GraphQL is blocked here (HTTP 403), so I could not see edit history and cannot say whether descriptions were edited after merge, except by comparing them with merge commits. For large pull requests (#44, #135, #148, #226, #239) I checked the description against the list of changed files and specific parts of the diff, not line by line. I did not read the reviews or check runs on the pull-request pages. I wrote nothing outside the scratchpad clones.

---

## Part 1: Pull-request descriptions against their diffs (Q-017)

**Sample, fixed before reading any description.**
- Q-017's own rule: #5, #18, #31, then every 13th number up to #252 (20 numbers). Two of those were closed without merging, so I took the next number that merged: #174 became #175 and #200 became #201.
- Pull requests open at 2026-11-02 12:00 UTC: **none** (REST pulls `state=all`, filtered on created before the cut and not closed by it). So the sample is all merged.
- To reach 30 I added the 10 most recently merged: #263–#269, #271, #273 and #275.
- Every one is a first-parent merge on main.
- The description is the REST `pulls/<n>` body. The diff is `git diff <merge>^1 <merge>` in a full clone.

**Method.** For each pull request:
- I read the "What this means for you" paragraph (or the opening paragraph before that rule) and the Tasks list.
- I compared them with `git diff --stat`, with targeted `git diff ... | grep` on specific claims, and with the PR's commit list (`pulls/<n>/commits`).

Labels used:
- **A**: accurate
- **I-omit**: incomplete; the diff did something the description leaves out
- **X**: inaccurate; the description says something the diff did not do
- **U**: unverifiable from the repository

| PR | Merge | Verdict | Evidence |
|---|---|---|---|
| 5 | 461e5d1 | A | governance/PACKS.toml +5/−2, as described |
| 18 | abfebbf | A | sources.md plus reviews/18/{owner,reviewer}.md |
| 31 | c608688 | A | the question file plus docs/PROJECT.md |
| 44 | 0f5c1e9 | **X** | Says "5 Builder commits … touching only src/**, tests/desk/** and docs/handover/**". The PR has 6 builder commits (fix commit 6206ebd came later) plus 2 owner commits adding reviews/44/owner.md and reviewer.md |
| 57 | e98264c | A | The ledger is described. digest/project.md and docs/DIGEST.md also changed: routine, but "nothing else changes" is loose |
| 70 | 72d2895 | A | The "he" line was "the owner himself", now "the owner" (diff line 374–375). decisions/README.md is mentioned in the body. The reviews/70 files came in later, in direct commit 42c831c |
| 83 | 04931eb | A | reviews/81/reviewer.md −39 lines; full report moved |
| 96 | 231c01a | A | 3 answers recorded, 3 question files removed |
| 109 | 745bc2e | A | one question file |
| 122 | bdb924a | A | two questions |
| 135 | ef9b9ff | **I-omit** | specs/S-001.md +645/−141 (spec drafts 1–5, commits 49daf31…365bc8d). The body never says the spec was amended. "769 tests pass" is U |
| 148 | e4ccb86 | A | 110 files (.claude/agents, governance/domains/design, mockups), as described |
| 161 | 87ce4f0 | A | one line in docs/ |
| 175 | 27a39df | A | "adds one line": risk-paths.toml +1 (`src/lib/j22.js`); the rest is review records |
| 187 | c67cb25 | A | test count is U |
| 201 | 35b3025 | A | two questions |
| 213 | eada213 | A | "tests and tools only": tests/desk and reviews only |
| 226 | 5a78579 | A | Matches its Tasks. The merge commit body is replaced by "Merged by the Orchestrator as the owner's overnight proxy (docs/LEDGER.md L-0019)"; the description does not say who merges |
| 239 | c7ca39d | **U** | "The test suite now runs each file on its own". The diff changes only `"node --test ../tests/desk/"` to `"../tests/desk/*.test.mjs"` (src/package.json). That the run behaves this way can't be seen in the diff |
| 252 | b4b7156 | **I-omit** | `Milestone: M3B` only, but docs/PROJECT.md marks M3E, M3G and M3B `reached: 2026-10-29` |
| 263 | 6b8f83b | A | Matches the Tasks. "milestones (merged in Model-Lab)" is U |
| 264 | c0d6ef8 | **U** | "It is now in the lessons log": no lessons file in the diff. The lessons log is Model-Lab docs/LESSONS.md, which I did not read |
| 265 | eb249cd | A | The source check says area D's count was wrong (research/Q-016-source-check.md L7, L42) |
| 266 | e300411 | A | |
| 267 | 7a91b6a | A | five intake files plus five questions |
| 268 | aee556d | A | |
| 269 | 64ae701 | A | |
| 271 | 043701a | A | its claims about the operating-model draft are U |
| 273 | fb89d0a | A | |
| 275 | 0156ab2 | **I-omit** | Title and body describe only Q-017's notes. The diff also adds decisions/Q-019/stop-2-notes.md (commit ee770b7, 00:54Z, about 3 h after the PR opened at 22:01Z) and handoff commit 994461c ("the owner widens the card fix"). The body was not updated |

**Totals (30).** The opening paragraph alone gave a correct account in 24 of 30.

| Verdict | Count | PRs |
|---|---|---|
| Accurate | 24 | |
| Incomplete | 3 | #135, #252, #275 |
| Inaccurate | 1 | #44 |
| Main claim unverifiable | 2 | #239, #264 |

Minor unverifiable sub-claims (test counts, effects in other repositories) also appear in #135, #187, #263 and #271.

**Worst examples:** #135 (spec rewrite not stated), #275 (a second notes file added after opening, body not updated), #44 (commit count and path scope stale after later commits), #252 (milestone line names one of three milestones).

**Commits added after opening** (`pulls/<n>/commits`, compared with `created_at`): 26 of 30 PRs got more commits after they were opened. For example, #148 had 29 of 33 after opening and #265 had 10 of 11. This is where the stale descriptions come from.

**Edits after merge.** GraphQL `userContentEdits` was refused (HTTP 403), so I can't tell directly. The REST body compared with the merge commit body, across the 30:

| Comparison | Count | PRs |
|---|---|---|
| Identical | 15 | |
| The commit adds only trailers (`Merged-By: orchestrator`, `Delegation: L-0017`) | 5 | #96, #109, #122, #201 and one other |
| Commit body empty | 7 | #5, #31, #70, #252, #263, #264, #265 |
| Commit has other text (GitHub's default merge message or the proxy note) | 4 | #18, #44, #57, #226 |

None shows a post-merge edit. Across all PR merges, 40 of 260 have an empty body (#5, #16–#32, #35, #36, #42, #43, #65, #66, #70, #72–#76, #250–#252, #254–#258, #263–#265). Eleven of these come after docs/SETUP.md:60 ("Merge commits keep each pull request's Context and Why", added in ac42fec on 2026-10-17). The merge commit is therefore not a reliable copy of the description.

## Part 2: Counts (Q-018)

**Repositories read.** Service-Desk, Personal-Org-Operating-Model and Model-Lab, plus the portfolio (src/config/projects.json L7–L19, at 95b5859).

**History.** Full clones, not shallow, in `/tmp/claude-0/-home-user/13e2545c-f1be-50c3-9d62-15b37f0491ed/scratchpad/audit/`. Every first-parent commit on `main` is classified by parent count, author name and committer name; for Model-Lab and the portfolio I used only the subject line, as Q-018 allows.

| Kind | Rule |
|---|---|
| PR, owner account | 2 or more parents and a subject ending `(#N)` or starting `Merge pull request #N`; author not `github-actions[bot]` |
| PR, asks-merge job | same, author `github-actions[bot]` (all 86 carry `Merged-By: orchestrator`) |
| Item merge | `Merge item/…`, by orchestrator, no PR |
| Direct, orchestrator bot | 1 parent, author `orchestrator` ("Orchestrator run gha-…: status, dispatch log…") |
| Direct, web UI | 1 parent, committer `GitHub` ("Create stop-2.md" and similar) |
| Other | the rest |

**Totals (end: Service-Desk 2026-11-04T01:37Z).** Under the owner account, Service-Desk has 173 merges by `shumpmaster` and 1 by `Claude`. The Claude one, 15db2ff, reuses the subject "Merge pull request #28", so #28 appears twice. PR state counts are from the REST API.

| Repo | PR owner account | PR job | Item merge | Direct bot | Direct web | Other | All | First record | PRs: merged / closed unmerged / open now |
|---|---|---|---|---|---|---|---|---|---|
| Service-Desk | 174 | 86 | 13 | 189 | 43 | 2 | 507 | 2026-09-30 | 259 / 7 / 0 |
| Personal-Org-Operating-Model | 38 | 0 | 0 | 0 | 1 | 0 | 39 | 2026-09-24 (last 2026-10-24) | 38 / 0 / 0 |
| Model-Lab | 34 | 0 | 0 | 1 | 1 | 0 | 36 | 2026-11-01 | 34 / 0 / 2 |
| portfolio | 5 | 0 | 0 | 1 | 0 | 0 | 6 | 2026-10-15 | 5 / 0 / 0 |

- Service-Desk's 7 closed unmerged: #62, #82, #142, #147, #174, #179, #200.
- Git (259 unique PR numbers) and the REST API (259 merged) agree.

**Per UTC day**, from first record to 2026-11-03, zero days included:

| Repo, kind | Median | Mean | Max (date) | Chicago-day peak |
|---|---|---|---|---|
| Service-Desk, all PRs merged (35 days) | 5 | 7.4 | 36 (10-19) | 33 (10-19) |
| Service-Desk, PR job | 0 | 2.5 | 28 (10-19) | |
| Service-Desk, direct bot | 0 | 5.1 | 37 (10-01) | 39 (10-01) |
| Service-Desk, direct web | 0 | 1.2 | 10 (10-25) | |
| Service-Desk, all first-parent | 9 | 14.1 | 59 (10-01) | 61 (10-01) |
| Personal-Org-Operating-Model, PRs (41 days) | 0 | 0.9 | 6 (10-01) | 10-13 |
| Model-Lab, PRs (3 days) | 6 | 11.0 | 23 (11-01) | 28 (11-01) |
| portfolio, PRs | 0 | 0.2 | 4 (11-01) | |

**Per week (Mon–Sun UTC).** Each repository's first week is counted as a full week even where the repository started mid-week.

| Week of | Service-Desk PR owner | Service-Desk PR job | Item merge | Bot | Web | Other | Total |
|---|---|---|---|---|---|---|---|
| 09-28 | 27 | 0 | 7 | 92 | 5 | 0 | 131 |
| 10-05 | 29 | 0 | 2 | 47 | 14 | 2 | 94 |
| 10-12 | 26 | 28 | 0 | 0 | 1 | 0 | 55 |
| 10-19 | 63 | 58 | 0 | 0 | 15 | 0 | 136 |
| 10-26 | 21 | 0 | 0 | 0 | 3 | 0 | 24 |
| 11-02 (partial) | 8 | 0 | 4 | 50 | 5 | 0 | 67 |

- Service-Desk, five full weeks: PRs merged median 29, mean 50.4, max 121; all changes median 94, mean 88, max 136.
- Personal-Org-Operating-Model PRs by week: 5, 13, 6, 11, 3, then 0.
- Model-Lab: 23 (week of 10-26, which is only Nov 1), then 11 partial.
- Portfolio: 0, 0, 5.
- Peaks in different repositories don't line up: Service-Desk 10-19, Personal-Org-Operating-Model 10-01 and 10-13, Model-Lab and the portfolio 11-01.

**Deploys and releases.**
- `desk-deploy` runs (REST `actions/workflows/desk-deploy.yml/runs`): total 64, of which 46 success, 17 cancelled and 1 failure; 58 started by push and 6 by dispatch.
- Releases: 0 in all four repositories.

**Owner involvement.**
- 86 merges are by the job.
- 174 are made through the owner's account. Five of these say in the merge commit that the Orchestrator merged them "as the owner's overnight proxy (L-0019)": #226, #227, #228, #230, and Glance step 4 (5f39e1f).
- So a merge through the owner's account does not prove the owner merged it: "cannot tell" for the rest.

**Caveats.**
- Git commit time stands for the merge time.
- Repositories are merge-commit only (no squash merges found).
- The 13 item merges and 43 web commits reach main with no PR.
- The Q-018 memo's estimates check out: weekly 27/28/54/121/21 (my 29 for 10-05 includes the duplicate #28); 36 on 10-19 (33 on the Chicago day); 7 closed without merging; 64 deploy runs, 46 of them successful.

## Part 3: What the desk reads and shows for pull requests (Q-019)

src/ at HEAD 95b5859 is identical to the memo's pin e6dd6b8 (`git diff --stat e6dd6b8 HEAD -- src` is empty). src/public/lib/* duplicates src/lib/*.

**What it reads:**
- **Open pull requests**: REST `pulls?state=open&per_page=100` (github.js:102; notify/collect.mjs:93). Fields kept (records.js:824–846): number, title, url, draft, base, head, headRepo, login, headSha, baseRepoPrivate, author_association, created_at, updated_at, and `parts: prBodyParts(body)`, that is the `Milestone:` line, Context and Why (pulls.js:54, 124).
- **Merged and all pull requests**: GraphQL PULLS_QUERY (github.js:70–78): `number title body state createdAt mergedAt closedAt headRefName mergeCommit{oid message author{name}} changedFiles files(first:2) commits(last:1){statusCheckRollup}`.
  - 100 per page (github.js:67), at most 3 pages and 300 kept (pulls.js:9–10, 376; scheduler.js:805).
  - Service-Desk already has 266 pull requests, so it is close to that cap.
- **Per pull request**: `pulls/<n>/files` (github.js:108; prfiles.js:40) and `pulls/<n>/commits` (github.js:109), for at most MAX_PRS = 10 (github.js:33).
- **Checks on job-candidate heads** (sender only): collect.mjs:283–285.
- **Not read**: GitHub reviews, review requests, the PR's own labels, GitHub milestones. There are no such calls. The only label use is the sender's own `desk-notify` alarm issue (notify/issue.mjs:6, 72, 92). `needs-you` appears only in the desk's URL (projects.json:6).

**What it shows:**
- **Waiting**: `classifyPull` (records.js:862–869).
- **Waiting sheet** (sandbox.js:986–993): title, who and why, verdict and reviewer boxes, and the GitHub link.
  - It also shows **"Unblocks <milestone>"** from the plan list, else from the body's `Milestone:` line, and a **Context fold from the body**: feed.js:769–791, rendered in src/public/sandbox.js:3256–3270 and 3695.
  - Its own checks: "Its own checks: not read by the desk; its GitHub page shows them" (src/public/sandbox.js:2072, 3689–3692).
- **Home**:
  - "Opened: <title>" (home.js:353);
  - commit lines from open PRs, merge commits skipped (home.js:367), 3 per PR (home.js:28);
  - "Merged: <title>" for v3 only, leaving out job merges and `item/*` heads (home.js:376–380). So Personal-Org-Operating-Model (v2.5) merges never show on Home (home.js:375 comment).
- **Timeline**: merged sprint rows (feed.js:494–502); placement from the plan list, else the `Milestone:` line, else "No milestone in the plan lists these sprints, and they name none." (feed.js:567–589); skips (feed.js:456–462).
- **Direct commits**: no list. There is only a history link (feed.js:529).
- **Deploys**: only waiting runs, Service-Desk only (model.js:518–526).

**Records that tie a pull request to a plan:**
- The body's `Milestone:` line (pulls.js:54; records.js:280, which "checks no form").
- The plan's ` · sprints:` list (j11.js:234; timeline.js:427).
- `status/<item>.toml` `milestone` (e.g. status/Q-019.toml: `milestone = "Discovery-5"`).
- status/merges.jsonl: 13 lines at HEAD (10 at e6dd6b8), keys item, item_tip, merge and spec, no PR number.
- dispatch-log/*.jsonl: 375 lines across 2026-10 and 2026-11. Its keys (item, role, stage, spec, session, verdict, card…) include no PR number and no milestone.
- reviews/<n>/: 88 numbered folders, read by feed.js:957 and j11.js:20.
- Merge commit trailers (pulls.js:257–261).

**Q-019 memo claims, checked:**

| Claim | Verdict | Evidence |
|---|---|---|
| `classifyPull` (draft / into / item branch / flagged) | confirmed | records.js:853–869 |
| The waiting sheet "doesn't use the description" | **wrong** | feed.js:774–789; src/public/sandbox.js:3256–3270, 3695 |
| Waiting sheet shows CI (estimate) | resolved: it says the PR's checks are not read | sandbox.js:2072 |
| PULLS_QUERY fields; PULLS_PAGE 100; PULLS_COST 5 | confirmed | github.js:67–78 |
| "At most 500 PRs per blob call" (estimate) | **wrong** | 3 pages and 300 kept (pulls.js:9–10) |
| Home "Merged:" only for v3 | confirmed | home.js:376 |
| Home merged rows | partly: also skips job merges and item/ heads | home.js:378 |
| `parents >= 2` merge-commit skip | confirmed | home.js:367 |
| COMMIT_LINES | confirmed: 3 | home.js:28 |
| Timeline marks and placement; Left-off list | confirmed | feed.js:456–462, 494–502, 567–589 |
| `isJobMerge` | confirmed | pulls.js:257–261 |
| KINDS (8) | confirmed | waiting.js:6–15 |
| waitKey | confirmed | waiting.js:27 |
| `jobs.has(n)` | confirmed | waiting.js:104 |
| `e.sent \|\| e.gaveUp` | confirmed | sender.mjs:242 |
| itemWords / groupWords | confirmed | words.mjs:30–41 |
| `?open=` | confirmed | words.mjs:21 |
| Sender's 7 deliver calls; no merge notice | confirmed (7 `deliver(`, sender.mjs:214–306; grep finds none for merges) | sender.mjs |
| Sender runs only `--project Service-Desk` | confirmed | .github/workflows/desk-notify.yml:97 |
| Model-Lab sender | not found: Model-Lab's workflow list has no desk-notify | file paths only |
| POLL_MS / STALE_MS / PORTFOLIO_POLL_MS | confirmed | scheduler.js:19, 20, 66 |
| Polling stops when hidden | confirmed; the quoted string is part of longer conditions | scheduler.js:313, 339, 1409 |
| `withdrawn` keeps 10 | confirmed | scheduler.js:924 |
| "Every project read … ago" | confirmed | home.js:223 |
| "checked … ago" | confirmed | home.js:79 |
| SINCE_DAYS 7 | confirmed | home.js:26, 405 |
| seen.js 97 lines; comment L1–5; constants L7–9 | confirmed | `wc -l` = 97 |
| seen.js `createSeen` "at or above L23" | confirmed, exactly L16 | |
| seen.js `held` L27; `hold(on)` L53; getter L56 | confirmed | |
| seen.js `markSeen` L74–88 | confirmed: comment L74–77, function L78–88, stores `{lastLooked}` on the device at L85 | |
| No 7-day constant in seen.js | confirmed | |
| Deploy rows, Service-Desk only | confirmed | model.js:518–526; projects.json:9 |
| PHASES | confirmed | home.js:437 |
| 'sprint unclear' | confirmed | model.js:858 |
| Model version S-033 cited | confirmed | model.js:107; records.js:262, 288 |
| Handover sender quotes | confirmed | docs/handover/service-desk.md:26, 35–37, 109 |
| "the desk itself writes nothing" | confirmed | docs/handover/service-desk.md:23 |
| `needs-you` label read? (open) | not read | grep finds it only in the desk's URL |
| merges.jsonl 10 lines, spec null, no PR key | confirmed at e6dd6b8 (13 lines now) | |
| dispatch-log 15 lines, no PR or milestone field | confirmed at e6dd6b8; still none at HEAD | |
| Sample A `Milestone:` 11/11 (6 naming ids, 5 none) | confirmed | REST bodies |
| Sample A: S-001 in the description 4/11 | **partly: 3/11** (#258, #259, #260; #263's body has none) | REST bodies |
| Sample A: reviews/<n>/ 2/11 | confirmed | `git ls-tree e6dd6b8` |
| Sample B: `Milestone:` 0/10; Q-id 8/10; reviews 3/10 (#5, #6, #10) | confirmed | REST bodies; `git ls-tree` |

## Commands run (key ones)

- `git clone --no-checkout https://github.com/shumpmaster/<repo>` for the four repositories, into the scratchpad.
- `git log --first-parent --format='%H|%P|%an|%cn|%cI|%s' HEAD`, piped to inline python (kinds, day and week stats, America/Chicago).
- `git log --first-parent --merges --format='%H%x1f%an%x1f%B%x1e'`, for trailers, proxy text and empty bodies.
- `gh api "repos/shumpmaster/<repo>/pulls?state=all&per_page=100&page=N"` (pages 1–3), plus `pulls/<n>`, `pulls/<n>/commits`, `actions/workflows/desk-deploy.yml/runs` and `releases`.
- `git diff --stat|--dirstat|--name-only <merge>^1 <merge>`, plus targeted `git diff … | grep`.
- `git grep -n -E '<pattern>' HEAD -- src ':!src/public/lib'`, `git show HEAD:<file> | sed -n`, `git show HEAD:src/lib/seen.js | wc -l` (97).
- `gh api graphql` was refused: "GitHub GraphQL is not available from Claude Code sessions" (403).

## Not done / limits

- **Edit history**: there is no GraphQL, so I can't tell whether descriptions were edited, except by comparing them with merge commits.
- **Depth on large PRs**: #44, #135, #148, #226 and #239 were judged on the changed-file list and targeted greps, not a full line-by-line read.
- **Not read**: the reviews and check runs on the PR pages.
- **Test counts**: "N tests pass" claims are unverified, since they need CI logs.
- **Model-Lab and the portfolio**: I read only subjects, authors, dates and paths. Model-Lab claims inside Service-Desk PRs (#263, #264) are marked unverifiable.
- **Owner versus agent**: whether the owner merged in person can't be told from the owner account.
- **Q-019 memo**: I did not re-check its claim that 0 of the 16 PRs merged before 2026-10-02 contain "milestone".
- **Token use**: not visible to me; roughly 150k tokens.
