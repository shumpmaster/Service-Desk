# Groundwork map — Q-016 — Keeping up with completed and waiting changes across several agent-built projects — 2026-11-01

This is a map of questions, not graded fact.

*Made by the Researcher (S-020). Grades on known items are proposed; nothing here is marked checked. Items marked assumed or unknown are not sourced.*

**Method limits.**
- I had no shell and no write tool, so I could not run `git log`.
- Service-Desk's `.git` is a shallow clone, and its reflog (`.git/logs/HEAD`, 16 lines) holds only a handful of recent commits.
- The pull-request count below therefore comes from a web fetch, not from git. It is unverified.
- I did not open the desk's code or look at the live desk.
- I did not search for studies of how readers use summaries, briefings or change logs. Area P has no outside sources because of that.

## Questions an expert would ask

### A. How the owner keeps up today, and what "no change" leaves
- A1 What does the owner do now to learn what has merged and what waits, and how long does it take a week? — sets the baseline for any change in the owner's time; decides whether "do nothing new" is viable; unknown (V3 caps desk upkeep at 30 min/week, but reading time on GitHub is not recorded); answered by O, then E.
  - Source for the cap: docs/PROJECT.md:192, "V3: Owner upkeep: the owner's time on the desk itself (tokens, settings, adding repositories), at most 30 minutes a week after launch". Grade C: own project's target, not a measurement.
- A2 What has the owner missed, or learned late, about a change (merged or waiting)? — the cost of the no-change option; decides whether any new thing is needed; unknown; answered by O.
  - Related: the owner already names "Missed decisions" as something they would hate (docs/PROJECT.md:550). Grade C.
- A3 What do the desk and GitHub already cover, so what is left unsolved? — avoids duplicating the desk; known in part.
  - The desk lists "pull requests to merge or give a verdict on, and deploys to approve" (docs/handover/service-desk.md:21-22), each opening a sheet "with its context" (:22). Grade C: the project's own handover.
  - Its scope excludes "Code review and diffs: those stay on GitHub, and the desk links to them" (docs/PROJECT.md:48). Grade C.
  - Whether completed (merged) changes appear anywhere on the desk is unknown from the documents I read; answered by R (read the desk's code and records) or O.
- A4 Does the desk's idea of "needs the owner" cover every kind of waiting change? — a change that waits but is not in the desk's list is a missed item.
  - The brief defines it as "an open card in a connected project's `queue/`, or a PR or question that waits on the owner's verdict" (docs/PROJECT.md:420-421). Grade C.
  - How a PR is judged "waiting on the owner's verdict" is unknown; answered by R.

### B. What the owner needs to learn about a change, and when
- B1 For a change waiting on the owner, what is the least the owner must see to decide (what it does, risk, checks, reviews, what happens on approve or reject)? — drives summary content; unknown; answered by O.
- B2 For a change already merged, does the owner need to know about each one, a group of them, or only exceptions? — decides per-change summary against digest against nothing; assumed that the owner wants exceptions first.
  - The owner's carried-forward intent says "Exceptions first, activity second. Quiet is the success state." (docs/PROJECT.md:555). Grade C.
- B3 What should be seen before a merge, and what only after? — timing; unknown; answered by O.
- B4 Does the owner want changes shown singly or beside others? — drives ordering and grouping; unknown; answered by O.
- B5 Which of the owner's decisions depend on a change summary, and which on the original pull request? — sets how much the owner relies on it (see G); unknown; answered by O.

### C. What "seen or dealt with" means
- C1 What states can a change be in for the owner (new, read, acknowledged, acted on, cleared) and which does the owner want recorded? — design of the state model; decides whether a record is kept and where; unknown; answered by O.
- C2 Where would a "seen" mark live, given the desk "writes nothing" to repositories and "Nothing is stored on Cloudflare"? — a design constraint.
  - Sources: "the desk itself writes nothing" (docs/handover/service-desk.md:23); "Nothing is stored on Cloudflare" (docs/PROJECT.md:213). Grade C.
  - The desk already notes on-device marks ("didn't need me", times opened): docs/PROJECT.md:206-208. Grade C.
  - Whether device-only marks are enough for a phone and a desktop used by one person is unknown; answered by O and R.
- C3 What does GitHub already offer for state? — a baseline to compare.
  - "Remove a notification from the inbox with **Done**." and "**Saved** notifications are flagged in your inbox." Source: https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications (fetched through a summarising tool, not raw HTML). Grade B (one vendor page, summarised).
  - "Unsubscribing also removes the notification from your inbox." Same source.
  - "You can customize and schedule push notifications in the GitHub Mobile app." Same source.
- C4 After the owner sees a change, what does the reader do next (open GitHub, answer, nothing)? — shapes the link or action on the summary; unknown; answered by O.

### D. How many changes arrive
- D1 How many pull requests merge per week across all the projects, and how many open and wait? — sets whether per-change reading, a digest or exception-only is feasible; partly known, see the count below.
- D2 How does volume differ by project and kind (feature, record-only, governance, settings)? — decides grouping and what to skip; unknown beyond Service-Desk; answered by R (needs repository access to each project).
- D3 Does volume rise when many agents run at once? — determines peak load against average; unknown; answered by R.

**Count of merged pull requests per week (Service-Desk only).**
- Method tried: `git log` was not possible (no shell).
- A web fetch of `https://github.com/shumpmaster/Service-Desk/pulls?q=is:pr+is:merged`, summarised by the fetch tool, reported "251 results" and these merge dates:

| Date | Merged | PRs |
|---|---|---|
| Oct 25 | 4 | #240-#243 |
| Oct 26 | 4 | #244-#247 |
| Oct 27 | 1 | #248 |
| Oct 28 | 1 | #249 |
| Oct 29 | 3 | #250-#252 |
| Oct 30 | 1 | #253 |
| Oct 31 | 6 | #254-#259 |
| Nov 1 | 5 | #260-#264 |

- The listed days sum to 25 merged PRs in 8 days, about 22 a week (25 ÷ 8 × 7), or about 3 a day.
- Status: unverified and not graded.
  - The repository may be private, and I cannot explain why the fetch returned data.
  - The numbers come from a summariser, not from raw pages.
- Partial corroboration from files I read:
  - PR #256 is cited in docs/handover/service-desk.md:112.
  - PR #261 is cited in docs/LEDGER.md:294.
  - The brief's milestone lines name PR #40/#41 as reached 2026-10-07 and PR #77 by 2026-10-20 (docs/PROJECT.md:106,110).
  - PR numbers are shared with issues, so the highest number (#264) is an upper bound on the PRs opened. It is consistent with 251 merged.
- Not counted: Personal-Org-Operating-Model, Model-Lab (not to be read), the portfolio repository, and a per-week series beyond the last 8 days.

### E. What a per-change summary can hold
- E1 What fits on a phone at a glance for one change (a line, a few lines, a card)? — a size limit for the summary; partly known.
  - "Compared with desktop and even laptop screens, phone screens accommodate a lot less content." and "The gist should always come before the minutiae." Source: https://www.nngroup.com/articles/mobile-ux/ (summarising fetch). Grade B.
  - Library pattern: "put what users often need on the first screen and the rest one step down … Keep to at most two disclosure levels (Nielsen only, single source). Not documented: what belongs on a phone's first screen for several projects, item counts, a time budget for a glance" (library/patterns/P-glance-disclosure-01.md:4). Grade B (as filed).
  - The size for this owner and these changes is unknown; answered by E.
- E2 Which parts of a pull request matter for the summary: description, diff, checks, reviews, linked records? — decides what is read, and what could mislead; unknown; answered by R and O.
  - The description form is fixed: "What this means for you", a milestone line, "Context" with sources, "Why", "Tasks" (research/Q-016.md:9). CI checks the form, not the content (same line). Grade C.
- E3 Is the required "What this means for you" paragraph already a per-change summary? — if good enough, the "summary" may exist; unknown; answered by R (sample real PRs for accuracy and completeness) and E.
  - Related: "Older pull requests were not rewritten" (research/Q-016.md:9). Grade C. The Service-Desk ledger says PRs carry the Milestone, Context and Why sections only "from the one after this on" (docs/LEDGER.md:214), so coverage varies by date. Grade C.

### F. How summaries could be produced
- F1 Options: taken from the author's text, generated from the change, written by a person, or a mix. What does each do to accuracy, cost and who checks it? — core design choice; unknown; answered by R, then E.
- F2 For a "taken from the author" summary, how often is the description missing, stale or wrong? — if often, it cannot be relied on; unknown; answered by R (sample audit).
- F3 For a generated summary, which model or tool and who pays? — sets cost and terms; unknown.
  - The project's AI ceiling is $0 pay-per-use API spend, and "any API key use needs the owner's ruling first" (docs/PROJECT.md:158-161). Grade C.
  - Cloud sessions "bill to the claude.ai subscription and can't use an API key" (cited from library LIB-F-c in docs/PROJECT.md:367). Not re-opened by me.
  - GitHub's own Copilot summary feature: I could not open its documentation page (see "Not opened"). Availability, plan and terms are unknown.
- F4 Who checks a summary, given the agents are the authors and may flatter their own work? — the independence problem; unknown; answered by O and R.
  - Context: the setup separates builders and reviewers by role, with the reviewer recording verdicts (/home/user/Service-Desk/CLAUDE.md, "Before accepting a builder's branch"). Grade C.

### G. Where a summary can mislead
- G1 What are the ways a summary fails (omitted risk, flattering account, stale or missing description, wrong scope), and how would each be noticed? — design traps; unknown; answered by R and E.
- G2 What does the owner rely on the summary for (decide to merge, decide to ignore, know it happened)? — the harm if wrong; unknown; answered by O.
- G3 What happens when it fails (a missed risk, a wrong merge)? — need for a back-stop, such as a link to the original and a mark for unchecked content; unknown; answered by O and E.
- G4 Is a flagged "unverified" summary better than none? — design choice; unknown; answered by E.
- G5 The desk's own V1 and V2 (missed decisions, false alarms) already measure two failures. Could the same marks measure summary failures? — reuse of existing machinery; assumed.
  - Source for the existing measures: docs/PROJECT.md:190-191. Grade C.

### H. A summary after the change moves on
- H1 What events change a change after the summary was written (new commits, edited description, review findings, red checks, merge, close), and which of them must update or void the summary? — staleness is a main failure; unknown; answered by R and E.
- H2 How does the reader know which state a summary describes? — needs a visible "as of" mark; partly known.
  - "If people may check more often than the data updates, show text saying when it was last updated, and show content quickly without hiding stale data behind placeholder content" (library/patterns/P-stale-visible-01.md:4). Grade B (as filed; Apple HIG, single authoritative source).
  - Whether to tie a summary to a commit SHA is unknown; answered by R.
- H3 Does regenerating on each push cost too much or churn the owner's attention? — cost and noise; unknown; answered by E.

### I. Data leaving the repositories
- I1 If anything is generated, what content leaves which repository, to whom, under what terms? — privacy and the data boundary; partly known.
  - The brief's boundary: "It may send their content only to GitHub and Cloudflare, plus Anthropic if U3 leads to sessions. No secret is ever sent to a model." (docs/PROJECT.md:165-167). Grade C.
  - So sending diffs or descriptions to a model outside that list is outside the current boundary and needs the owner's ruling. Inference: C.
- I2 Which repositories are private, and do their diffs hold secrets or personal data? — decides what may be sent; unknown; answered by R.
  - Related: the desk's read token is fine-grained and read-only (docs/handover/desk-operations.md:81, "Contents: read, Metadata: read, Pull requests: read and Actions: read"). Grade C.
- I3 Do the owner's accounts and plans allow a hosted summary tool, and under what retention terms? — terms; unknown. GitHub's Copilot code-review page says "Copilot code review runs in an ephemeral development environment" and "We use this information to improve the product and the quality of Copilot's suggestions" (the second refers to thumbs up/down feedback). Source: https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review (summarising fetch). It is about code review, not summaries, so it does not answer this. Grade B for what it says only; the question stays unknown; answered by R (vendor terms) and O.

### J. Order, grouping, filtering, navigation
- J1 What orders the list (urgency, project, milestone, time, kind, state)? — decides readability at volume; unknown; answered by O and E.
  - Existing practice for waiting cards: "its place in its project's published order, a question other cards wait on first … then the rest oldest first" (docs/PROJECT.md:116). Grade C.
- J2 Is grouping by milestone feasible, given each PR's milestone line is required? — possible only where the line exists; assumed (older PRs lack it; see E3).
- J3 How many filter or navigation levels does a phone allow? — see E1 and the two-level limit in P-glance-disclosure-01; unknown for this case; answered by E.

### K. Relation to the desk and GitHub
- K1 What does each option replace, duplicate or add against the desk and GitHub? — avoids building a second status page; partly known.
  - The desk's pull-request rows "come from the projects' repositories, and the portfolio repository is read for its records" (research/Q-016.md:9). Grade C.
  - The desk is "Never a source of truth" (docs/PROJECT.md:558-559). A stored summary must not become one. Grade C.
- K2 Do the desk's PR rows already carry a summary-like line or link, and could they carry the PR's own "What this means for you" paragraph at no new cost? — the cheapest option; unknown; answered by R (read the desk's code and a live row).
- K3 Do notifications already reach the owner's phone? — a notifications-only option depends on it.
  - "Service-Desk's sender sends a phone notification the moment something starts waiting on you there" (docs/handover/service-desk.md:25-27). "Your operating-model project has no notification sender yet" (:10-11). Grade C.
  - Whether it also covers merged-change events is unknown.

### L. Time and cost, and how to try it cheaply
- L1 What is the owner's time to read and keep up, per option, and what is the agents' cost to produce and maintain it? — value case; unknown; answered by E.
  - The owner's spend rule is "Spend follows value … Every paid service carries its value case" (docs/PROJECT.md:532-533). Grade C.
- L2 What is the cheapest trial (a week of owner reading a hand-picked or generated digest, a prototype list on the preview)? — an experiment design; unknown; answered by E.
- L3 What measure shows value (time to catch up, missed or late items, owner's own rating)? — needed before scope is set; unknown; answered by O and E.

### M. The form pull requests are written in
- M1 Would the PR form need to change (e.g. a one-line "summary for the desk" field), and what would it cost the projects? — a change to the model's rules; unknown; answered by R and O.
  - Current rule: CI checks form, not content (research/Q-016.md:9). Grade C. The rule is set in the model's own repository under its spec process, so changing it is outside this project's lane. Inference: C.
- M2 Does a stricter or extra field help if the content is never checked? — a form check does not make the content true; assumed.

### N. Changes that are not pull requests
- N1 What share of changes are direct commits, deploys or record-only commits that never go through a PR? — a summary approach limited to PRs would miss them; unknown; answered by R.
  - Known examples: the owner commits answer files "straight to main from the web" (docs/PROJECT.md:343-344); deploys wait for the owner's approval (docs/handover/service-desk.md:39-40). Grade C.
- N2 Do deploys and records need the same treatment as PRs? — unknown; answered by O.

### O. Reading on a small screen
- O1 Length, layout, images and charts, accessibility for a phone. — a hard constraint (phone first, docs/PROJECT.md:54; "Phone first" at :517, Grade C).
  - The library holds checked accessibility entries (library/facts/F-wcag22-01.md, F-platform-targets-contrast-01.md). I did not open them for this map; pointer only.
  - Whether images or charts add anything for a change summary is unknown; answered by R and E.

### P. What other fields do
- P1 How do change logs, release notes, intelligence or executive briefings, and status reports brief one decision-maker, and where did they mislead, get skipped, or add little? — outside evidence to check designs against; unknown; I found no source I opened that covers this; answered by R.
  - Only general phone-reading guidance was opened: "Flooding them with details and asking them to parse walls of text for relevant facts is not interruption friendly." (https://www.nngroup.com/articles/mobile-ux/, summarising fetch). Grade B; this is not evidence on briefings.

## Owner shortlist
1. How do you find out today that a change has merged or is waiting on you, and about how long does that take you in a week?
2. Can you remember a change you missed, saw late, or merged without enough understanding? What was it?
3. For a change waiting on you, what do you need to see to decide without opening GitHub?
4. For changes already merged, do you want to know about each one, only the ones that went wrong or surprised you, or none?
5. Would you rather get a short list when you open the desk, a once-a-day or once-a-week note, or a phone alert, or a mix?
6. What would "I have dealt with this" mean for you (looked at it, decided, nothing more), and should the desk remember it across your phone and computer?
7. If a short summary were wrong or left out a risk, what would you do about it, and would you still want it if it carried a visible "not checked" label?
8. Are you willing to let the text of your pull requests and changes go to an outside AI service to write summaries, and is any project too private for that?

## Research shortlist
1. How accurate and complete are the descriptions of Service-Desk's and Personal-Org-Operating-Model's recently merged and open pull requests, compared with what the change did (sample of about 20, with the omissions and mismatches counted)? — decision: whether a summary can be taken from the author's text; depth: 3.
2. How many changes of each kind (merged pull requests, direct commits, deploys, records) arrive per day and week across every connected project and the portfolio repository, counted from git history and the pull-request list over the last 8 weeks? — decision: whether per-change, digest or exception-only is readable, and what each costs; depth: 2.
3. What do the desk's current pull-request rows show for a waiting pull request and for a merged one, and which parts of a pull request (description, diff, checks, reviews, linked records) does it already read? — decision: what a new summary would replace, duplicate or add; depth: 2.
4. What do GitHub's built-in options (notification inbox states, Mobile push, Copilot pull-request summaries, any generated-summary feature) offer, require (plan, licence) and send out of the repository, and on what terms? — decision: whether anything beyond the desk is needed, and the data-boundary ruling for I1; depth: 3.
5. What does published evidence show on how change logs, release notes, executive or intelligence briefings and status reports serve (or fail) one decision-maker facing many events, and what is known of errors in machine-generated summaries? — decision: design traps and the shape of any summary or digest; depth: 3.

## Design traps to avoid
- Treating the required "What this means for you" paragraph as accurate because CI checks its form. CI does not check the content (E3, F2, G1).
- A flattering account written by the same agent that made the change (F4, G1).
- A summary shown without the state it describes, so a merged or red change still reads as ready (H1, H2).
- Building a second status page that duplicates the desk, or storing seen-marks in a way that makes the desk a source of truth (K1, C2).
- Sending private repository content to an outside service without the owner's ruling (I1, F3).
- Counting every merge as needing the owner. This risks the owner's named fear of false alarms (B2, G5).
- Assuming a good enough hand-written summary exists for older pull requests (E3).
- Treating the volume from one project, or from one recent burst of days, as typical (D1, D2).
- Choosing the form before the owner says what "dealt with" means (C1).

## Gaps found in existing questions or plans
- Q-016: it does not ask what the desk's current PR rows show or whether merged changes appear (A3, K2). It does not ask whether the notification path covers merged-change events (K3). It does not name the existing data boundary in docs/PROJECT.md:165-167 as a constraint for generated summaries (I1). It does not ask whether a summary may carry a "not checked" label, or whether the owner would still use it (G4, shortlist 7). The 22-per-week count above is from one project and 8 days only.

## Not opened
- https://docs.github.com/en/copilot/using-github-copilot/using-copilot-to-create-or-update-pull-request-descriptions: HTTP 404.
- https://docs.github.com/en/copilot/how-tos/use-copilot-for-common-tasks/use-copilot-to-create-or-update-pull-request-summaries: HTTP 404.
- The Copilot code-review page opened, but it holds nothing on pull-request summaries (see I3).
- Raw pages: I saw the NN/g mobile page, the GitHub notifications page and the GitHub pull-request list only through a summarising fetch, not as raw text. I treat their quotes as unconfirmed. The pull-request list page is for a repository I cannot confirm is public, so its figures are unverified.
- Not opened on purpose, per instructions: decisions/, questions/, docs/reports/, docs/briefs/, the portfolio repository, Model-Lab.
- Not opened though in scope: the desk's source code, docs/handover/desk-operations.md in full, the model's OPERATING_MODEL.md and S-026/S-032/S-034 specs in full (only search lines seen), and the library's WCAG and platform-target entries.

## Sources opened
- /home/user/Service-Desk/research/Q-016.md
- /home/user/Service-Desk/research/_GROUNDWORK.md
- /home/user/Service-Desk/docs/PROJECT.md (all)
- /home/user/Service-Desk/docs/handover/service-desk.md (lines 1-70)
- /home/user/Service-Desk/docs/handover/desk-operations.md (search lines only: 42, 56, 81, 152-202, 264, 307, 363, 530)
- /home/user/Service-Desk/docs/LEDGER.md (lines 214 and 290-294, plus search lines)
- /home/user/Service-Desk/library/patterns/P-glance-disclosure-01.md
- /home/user/Service-Desk/library/patterns/P-stale-visible-01.md
- /home/user/Service-Desk/.git/logs/HEAD
- /home/user/Service-Desk/CLAUDE.md (as supplied in context)
- /home/user/Personal-Org-Operating-Model/CHANGELOG.md, digest/model.md, specs/S-026-plain-english-first.md, specs/S-032-why-and-context.md, template/AGENTS.md, tools/governance_checks.py, reviews/38/reviewer.md (search lines only)
- The library file list (names only): /home/user/Service-Desk/library/
- https://github.com/shumpmaster/Service-Desk/pulls?q=is%3Apr+is%3Amerged (summarising fetch; unverified)
- https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review (summarising fetch)
- https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications (summarising fetch)
- https://www.nngroup.com/articles/mobile-ux/ (summarising fetch)
