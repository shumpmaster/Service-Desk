I have what I need. Now I'm writing revision 2 of the map, adding the new sourced items for areas F, H and P.

1. **What I changed.** I wrote revision 2 of the groundwork map (below), to be recorded verbatim as research/Q-016-memo.md. Revision 1 had already made all ten of the Source checker's round-1 corrections, so this round adds new material:
   - **F3, E2 and H1:** sourced facts on GitHub Copilot's pull-request summaries. It ignores the existing description, a summary does not update itself when the pull request changes, and large files are left out.
   - **F2 and G1:** a 2026 study of pull-request descriptions written by AI agents, which measures how often they claim changes that were not made.
   - **Area P,** which had no outside sources before:
     - the WMD Commission's finding that headline summaries and repetition in a daily brief misled their readers;
     - two studies on what release-note readers want;
     - a Microsoft trial of pull-request reminders.
   - **Research shortlist 4 and 5** are narrowed, and there are two new design traps.
   - **K1:** I took the quote back to the checker's lower-case reading.
   - **Records:** the "Not opened" and "Sources opened" lists are updated.
2. **Why.** Revision 1 named these gaps itself: area P had no sources, the Copilot pages returned 404, and GitHub's built-in summary options were unknown. Filling them gives Discovery outside evidence on how briefings and generated summaries go wrong before it writes the research requests.
3. **What I verified.** I made 12 web searches and 12 fetches, all through a summarising fetch, never raw.
   - **Confirmed:**
     - the WMD Commission quotes, on two narrow fetches of the report;
     - the arXiv abstracts for 2601.04886, 2204.05355 and 2011.12468;
     - the Microsoft Research page for Bi et al.;
     - two sentences on the Copilot how-to page.
   - **Not confirmed:**
     - the Copilot "not available in Copilot Free" line appeared only in a search snippet, so I left it as unknown;
     - the responsible-use page fetch reported landing on a different URL, so those quotes need a raw check.
   - **In the pack:** I checked the two library quotes against line 4 of each file. They match.
   - **Not checked:** the repository quotes in docs/ and CLAUDE.md are not in my pack. I carried them over from revision 1, where the checker had confirmed them, and did not re-open them.
4. **What is undone.**
   - The Copilot plan and licence terms, and its data terms.
   - The "Don't Disturb Me" bots study (seen only as a search result).
   - The BBC/EBU study on AI news answers (left out: it tests answers to news questions, not summaries of a supplied text).
   - Any repository reads or counts beyond Service-Desk.
5. **Needed outside my lane.**
   - The Orchestrator records the map verbatim.
   - The Source checker checks the new web items raw, especially the responsible-use page, and settles K1's capital letter against docs/PROJECT.md:558.
   - Nothing needs a level-5 expert or a paid source.
6. **Open questions.**
   - Should the new area-P items also be proposed as library entries? Revision 1 filed none, because this is a map.
   - Which venue is right for Bi et al. (ICSE 2022 or IEEE TSE 48(6))?

---

# Groundwork map — Q-016 — Keeping up with completed and waiting changes across several agent-built projects — 2026-11-02 (revision 2)

This is a map of questions, not graded fact.

*Made by the Researcher (S-020). Grades on known items are proposed; nothing here is marked checked. Items marked assumed or unknown are not sourced.*

**Method limits.**
- I had no shell and no write tool, so I could not run `git log` or the GitHub API.
- This revision was made only from the research pack. The repository quotes from docs/, CLAUDE.md and the model's repository are carried over from revision 1, where the Source checker confirmed them (research/Q-016-source-check.md:70-75). I did not re-open them this round.
- The pull-request counts in area D are the Source checker's (research/Q-016-source-check.md:9-37), not mine.
- I did not open the desk's code or look at the live desk.
- I saw every web page through a summarising fetch, not raw. New web items in this revision (F3, E2, F2, H1, P1) still need a raw check.

## Questions an expert would ask

### A. How the owner keeps up today, and what "no change" leaves
- A1 What does the owner do now to learn what has merged and what waits, and how long does it take a week? — sets the baseline for any change in the owner's time; decides whether "do nothing new" is viable; unknown (V3 caps desk upkeep at 30 min/week, but no one records reading time on GitHub); answered by O, then E.
  - Source for the cap: docs/PROJECT.md:192, "V3: Owner upkeep: the owner's time on the desk itself (tokens, settings, adding repositories), at most 30 minutes a week after launch". Grade C: own project's target, not a measurement.
- A2 What has the owner missed, or learned late, about a change (merged or waiting)? — the cost of the no-change option; decides whether anything new is needed; unknown; answered by O.
  - Related: the owner names "Missed decisions" as something they would hate (docs/PROJECT.md:550, under "What the owner would hate", :548). Grade C.
- A3 What do the desk and GitHub already cover, and what is left unsolved? — avoids duplicating the desk; known in part.
  - The desk lists "pull requests to merge or give a verdict on, and deploys to approve" (docs/handover/service-desk.md:21-22). Each opens a sheet "with its context" (:22). Grade C.
  - Its scope excludes "Code review and diffs: those stay on GitHub, and the desk links to them" (docs/PROJECT.md:48). Grade C.
  - Whether completed (merged) changes appear anywhere on the desk is unknown; answered by R or O.
- A4 Does the desk's idea of "needs the owner" cover every kind of waiting change? — a change that waits but is not in the desk's list is a missed item.
  - The brief defines it as "an open card in a connected project's `queue/`, or a PR or question that waits on the owner's verdict" (docs/PROJECT.md:420-421). Grade C.
  - How a PR is judged "waiting on the owner's verdict" is unknown; answered by R.

### B. What the owner needs to learn about a change, and when
- B1 For a change waiting on the owner, what is the least the owner must see to decide (what it does, risk, checks, reviews, what happens on approve or reject)? — drives summary content; unknown; answered by O.
- B2 For a change already merged, does the owner need to know about each one, a group of them, or only exceptions? — decides between a per-change summary, a digest and nothing; assumed that the owner wants exceptions first.
  - The only source is a carried-forward principle not yet reconfirmed by the owner (docs/PROJECT.md:553-556): "Exceptions first, activity second. Quiet is the success state." (:556). Grade C, weak.
  - Outside, and different readers: in a survey of 32 professionals, "project managers are more interested in learning about new features than less critical bug fixes" (Nath & Roy, SANER 2022, https://arxiv.org/abs/2204.05355). Grade B for what it says; small sample, and not about one owner.
- B3 What should be seen before a merge, and what only after? — timing; unknown; answered by O.
- B4 Does the owner want changes shown singly or beside others? — drives ordering and grouping; unknown; answered by O.
- B5 Which of the owner's decisions depend on a change summary, and which on the original pull request? — sets how much the owner relies on it (see G); unknown; answered by O.

### C. What "seen or dealt with" means
- C1 What states can a change be in for the owner (new, read, acknowledged, acted on, cleared), and which does the owner want recorded? — the design of the state model; decides whether a record is kept and where; unknown; answered by O.
- C2 Where would a "seen" mark live, given the desk "writes nothing" to repositories? — a design constraint; partly answered by existing practice.
  - "the desk itself writes nothing" (docs/handover/service-desk.md:23). Grade C.
  - For the V1/V2 figures, "Nothing is stored on Cloudflare" (docs/PROJECT.md:212). This is said of those figures only. Grade C.
  - Existing answer: the desk notes on the device the times it was open and the owner's "didn't need me" marks (docs/PROJECT.md:205-206). Once a week it offers a prefilled link that commits those figures to the owner's private portfolio repository (:206-209). Grade C.
  - Whether that suits "seen" marks on changes, and whether a phone and a desktop must agree, is unknown; answered by O and R.
- C3 What does GitHub already offer for state? — a baseline to compare against.
  - "Remove a notification from the inbox with **Done**." and "**Saved** notifications are flagged in your inbox." (https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications; the checker found them word for word, research/Q-016-source-check.md:66). Grade A (vendor documentation of its own product).
  - "Unsubscribing also removes the notification from your inbox." Same source.
  - "You can customize and schedule push notifications in the GitHub Mobile app." Same source.
- C4 After the owner sees a change, what does the reader do next (open GitHub, answer, nothing)? — shapes the link or action on the summary; unknown; answered by O.
  - Related library fact: on iOS, tapping a GitHub link opens GitHub Mobile rather than Safari, and long-pressing then "Open" turns this off for later taps (library/F-gh-09.md, grade B). So a desk link may land in the app.

### D. How many changes arrive
- D1 How many pull requests merge per week across all the projects, and how many open and wait? — sets whether per-change reading, a digest or exception-only is feasible; merged: known for Service-Desk; waiting: one snapshot only; other projects unknown.
- D2 How does volume differ by project and kind (feature, record-only, governance, settings)? — decides grouping and what to skip; unknown beyond Service-Desk; answered by R.
- D3 Does volume rise when many agents run at once? — peak load against average; unknown, but the series below swings widely; answered by R.

**Count of merged pull requests (Service-Desk only).**
- Source: the Source checker's own count (research/Q-016-source-check.md:9-37), as of 2026-11-01. I did not run it.
- **Method 1:**
  - Call: `gh api repos/shumpmaster/Service-Desk/pulls?state=closed&per_page=100&page=1..4`.
  - Kept PRs with `merged_at` set, grouped by UTC date.
  - Result: 258 closed, of which 251 merged (#1 to #264).
- **Method 2:**
  - Command, after `git fetch --unshallow`: `TZ=UTC git log origin/main --first-parent --merges`.
  - Result: 251 PRs.
  - The two sets are identical, and every merge date matches.
- Grade A (two independent methods on primary records, agreeing).
- Why my first count was wrong: a summarising fetch of the list page held only GitHub's first 25 results (#240 to #264), so Oct 25 came out as 4 instead of 22.

Merged per day, last 8 days (UTC):

| Day | Merged | Note |
|---|---|---|
| Oct 25 | 22 | #222-#243 |
| Oct 26 | 4 | |
| Oct 27 | 1 | |
| Oct 28 | 1 | |
| Oct 29 | 3 | |
| Oct 30 | 1 | |
| Oct 31 | 6 | |
| Nov 1 | 5 | #260-#264; #264 merged 23:44:20Z, so this row and the total of 251 hold only from after that time |

Total in those 8 days: 43 (42 before #264 merged).

Merged per week (Monday to Sunday):

| Week | Merged |
|---|---|
| Sep 28-Oct 4 | 27 |
| Oct 5-11 | 28 |
| Oct 12-18 | 54 |
| Oct 19-25 | 121 (Oct 19 alone: 36) |
| Oct 26-Nov 1 | 21 |

- Average: about 55 a week since the first merge on 2026-09-30. Open on 2026-11-01: #265.
- What it means for the map: weekly volume swings by a factor of about six (21 to 121). A design has to be tried against both a quiet and a busy week. Assumed, answered by E: a peak of 36 in a day is beyond what can be read one change at a time.
- Not counted: Personal-Org-Operating-Model, the portfolio repository, and Model-Lab (not to be read).

### E. What a per-change summary can hold
- E1 What fits on a phone at a glance for one change (a line, a few lines, a card)? — a size limit; partly known.
  - "Compared with desktop and even laptop screens, phone screens accommodate a lot less content." and "The gist should always come before the minutiae." (https://www.nngroup.com/articles/mobile-ux/; confirmed raw by the checker). Grade B (one source).
  - Library pattern: "put what users often need on the first screen and the rest one step down … Keep to at most two disclosure levels (Nielsen only, single source)". The same entry says what belongs on a phone's first screen for several projects is not documented (library/patterns/P-glance-disclosure-01.md:4). Grade B as filed.
  - The size for this owner is unknown; answered by E.
- E2 Which parts of a pull request matter for the summary: description, diff, checks, reviews, linked records? — decides what is read and what could mislead; unknown; answered by R and O.
  - The description form is fixed, and CI checks the form, not the content (research/Q-016.md:9). Grade C.
  - One existing generator reads the change and not the description: "GitHub Copilot does not take into account any existing content in the pull request description, so start with a blank description for best results." (https://docs.github.com/en/copilot/how-tos/copilot-on-github/copilot-for-github-tasks/create-a-pr-summary). Grade A for what the vendor says of its own product, to be checked raw.
  - Its output, per GitHub's responsible-use text: "a prose paragraph giving an overview of the changes, followed by a bulleted list of key changes linked to the respective lines of code". Also: "Files with more than 400 combined additions and deletions are excluded from summarization." (https://docs.github.com/en/copilot/responsible-use/pull-request-summaries; the fetch reported landing at https://github.com/features/copilot/trust-center). Grade B until the checker confirms where the text lives.
- E3 Is the required "What this means for you" paragraph already a per-change summary? — if it is good enough, the summary may already exist; unknown; answered by R (sample real PRs) and E.
  - "Older pull requests were not rewritten" (research/Q-016.md:9). Grade C.
  - The Service-Desk ledger says PRs carry the Milestone, Context and Why sections only "from the one after this on" (docs/LEDGER.md:214), so coverage varies by date. Grade C.

### F. How summaries could be produced
- F1 Options: taken from the author's text, generated from the change, written by a person, or a mix. What does each do to accuracy and cost, and who checks it? — the core design choice; unknown; answered by R, then E.
- F2 For a summary taken from the author, how often is the description missing, stale or wrong? — if often, it cannot be relied on; unknown for these projects; answered by R (sample audit).
  - Outside evidence, from agent-written PRs:
    - Gong, Pinna, Bian & Zhang (arXiv 2601.04886, v2 26 Jan 2026) analysed 23,247 agent-authored PRs from five agents and found that "406 PRs (1.7%) exhibited high PR-MCI" (message-code inconsistency).
    - The most common type was "descriptions claim unimplemented changes" (45.4%).
    - High-MCI PRs "had 51.7% lower acceptance rates (28.3% vs. 80.0%)".
  - Grade B: one preprint, read through its abstract only. The rate in these projects may differ.
- F3 For a generated summary, which model or tool, and who pays? — sets cost and terms; partly known.
  - The project's AI ceiling is $0 pay-per-use API spend, and "any API key use needs the owner's ruling first" (docs/PROJECT.md:158-161). Grade C.
  - Cloud sessions "bill to the claude.ai subscription and can't use an API key" (library LIB-F-c, cited at docs/PROJECT.md:367). I did not re-open it.
  - GitHub Copilot offers a pull-request summary on request: you pick the Copilot icon in the description or comment field, then "Summary". The page says: "Review the generated summary carefully." (create-a-pr-summary page above). Grade A, to be checked raw.
  - Which Copilot plans include it, and its data terms, are unknown. A search snippet said it is not in Copilot Free, but the pages I fetched did not show this. Answered by R.
- F4 Who checks a summary, given the agents are the authors and may flatter their own work? — the independence problem; unknown; answered by O and R.
  - Context: the setup separates builders and reviewers by role, and the reviewer records verdicts (Service-Desk CLAUDE.md, "Before accepting a builder's branch"). Grade C.

### G. Where a summary can mislead
- G1 How does a summary fail (omitted risk, flattering account, stale or missing description, wrong scope), and how would each failure be noticed? — design traps; partly known from outside.
  - Agent-written descriptions most often claim changes that were not made (F2). Grade B.
  - Short headlines and repetition: see P1 (WMD Commission). Grade A for what the report found.
  - For these projects: unknown; answered by R and E.
- G2 What does the owner rely on the summary for (decide to merge, decide to ignore, know it happened)? — the harm if it is wrong; unknown; answered by O.
- G3 What happens when it fails (a missed risk, a wrong merge)? — the need for a back-stop, such as a link to the original and a mark for unchecked content; unknown; answered by O and E.
- G4 Is a flagged "unverified" summary better than none? — design choice; unknown; answered by E.
- G5 The desk's V1 and V2 already measure two failures (missed decisions, false alarms). Could the same marks measure summary failures? — reuse of existing machinery; assumed. Source for the measures: docs/PROJECT.md:190-191. Grade C.

### H. A summary after the change moves on
- H1 What events change a pull request after its summary was written (new commits, edited description, review findings, red checks, merge, close), and which of them must update or void the summary? — staleness is a main failure; partly known.
  - GitHub's own generated summary does not follow the change: "When updates or changes are made to the pull request, the summary is not automatically refreshed." (responsible-use text, E2 source). Grade B until checked.
  - Which events matter here is unknown; answered by R and E.
- H2 How does the reader know which state a summary describes? — needs a visible "as of" mark; partly known.
  - "If people may check more often than the data updates, show text saying when it was last updated, and show content quickly without hiding stale data behind placeholder content" (library/patterns/P-stale-visible-01.md:4). Grade B as filed.
  - Whether to tie a summary to a commit SHA is unknown; answered by R.
- H3 Would regenerating on each push cost too much or churn the owner's attention? — cost and noise; unknown, and the daily peaks in D make it matter; answered by E.

### I. Data leaving the repositories
- I1 If anything is generated, what content leaves which repository, to whom, and under what terms? — privacy and the data boundary; partly known.
  - The brief's boundary: "It may send their content only to GitHub and Cloudflare, plus Anthropic if U3 leads to sessions. No secret is ever sent to a model." (docs/PROJECT.md:165-167). Grade C.
  - So sending diffs or descriptions to a model outside that list needs the owner's ruling. Inference, grade C.
  - Copilot runs on GitHub, which is inside the named list. Whether its model terms fit the boundary's intent is unknown; answered by R and O.
- I2 Which repositories are private, and do their diffs hold secrets or personal data? — decides what may be sent; partly known.
  - The GitHub API reports shumpmaster/Service-Desk as `visibility: public` (research/Q-016-source-check.md:51). Grade A (API record, via the checker).
  - The portfolio repository is described as the owner's private repository (docs/PROJECT.md:208-209). Grade C.
  - The other repositories are still to check; answered by R.
  - The desk's read token is fine-grained and read-only: "Contents: read, Metadata: read, Pull requests: read and Actions: read" (docs/handover/desk-operations.md:78,81). Grade C.
- I3 Do the owner's accounts and plans allow a hosted summary tool, and under what retention terms? — terms; unknown.
  - The Copilot code-review page says "Copilot code review runs in an ephemeral development environment" (https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review, confirmed by the checker). Grade B for what it says. It is about code review, not summaries; answered by R and O.

### J. Order, grouping, filtering, navigation
- J1 What orders the list (urgency, project, milestone, time, kind, state)? — readability at volume; unknown; answered by O and E.
  - Existing practice for waiting cards: "its place in its project's published order, a question other cards wait on first … then the rest oldest first" (docs/PROJECT.md:116). Grade C.
- J2 Is grouping by milestone feasible, given each PR's milestone line is required? — only where the line exists; assumed (older PRs lack it; see E3).
- J3 How many filter or navigation levels does a phone allow? — see E1 and the two-level limit in P-glance-disclosure-01; unknown here; answered by E.

### K. Relation to the desk and GitHub
- K1 What does each option replace, duplicate or add against the desk and GitHub? — avoids building a second status page; partly known.
  - The desk's pull-request rows "come from the projects' repositories, and the portfolio repository is read for its records" (research/Q-016.md:9). Grade C.
  - "the desk is never a source of truth" (docs/PROJECT.md:558; lower case as the Source checker read it). A stored summary must not become one. Grade C.
- K2 Do the desk's PR rows already carry a summary-like line, and could they show the PR's own "What this means for you" paragraph at no new cost? — the cheapest option; unknown; answered by R.
- K3 Do notifications already reach the owner's phone? — the notifications-only option depends on it.
  - "Service-Desk's sender sends a phone notification the moment something starts waiting on you there" (docs/handover/service-desk.md:25-27). "Your operating-model project has no notification sender yet" (:10-11). Grade C.
  - Whether it covers merged-change events is unknown.
  - Outside: a Microsoft reminder service for overdue PRs, tried on 147 repositories, "was able to reduce pull request resolution time by 60% for 8,500 pull requests", and recipients rated "73% of these notifications as positive" (Maddila et al., "Nudge", ACM TOSEM 2022, https://arxiv.org/abs/2011.12468; abstract only). Grade B. It concerns teams, not one owner.

### L. Time and cost, and how to try it cheaply
- L1 What is the owner's time to read and keep up under each option, and the agents' cost to produce and maintain it? — the value case; unknown; answered by E.
  - "Spend follows value … Every paid service carries its value case" (docs/PROJECT.md:532-533). Grade C.
- L2 What is the cheapest trial (a week of the owner reading a hand-made or generated digest; a prototype list on the preview)? — experiment design; unknown; it should cover a busy and a quiet week (D); answered by E.
- L3 What measure shows value (time to catch up, missed or late items, the owner's own rating)? — needed before scope is set; unknown; answered by O and E.

### M. The form pull requests are written in
- M1 Would the PR form need to change (for example a one-line "summary for the desk" field), and what would that cost the projects? — a change to the model's rules; unknown; answered by R and O.
  - CI checks form, not content (research/Q-016.md:9). Grade C. The rule lives in the model's own repository, so changing it is outside this project's lane. Inference, grade C.
- M2 Does a stricter or extra field help if the content is never checked? — a form check does not make the content true; assumed. F2's outside evidence bears on this.

### N. Changes that are not pull requests
- N1 What share of changes are direct commits, deploys or record-only commits that never go through a PR? — a PR-only approach would miss them; unknown; answered by R.
  - Known examples: the owner commits answer files "straight to main from the web" (docs/PROJECT.md:343-344); deploys wait for the owner's approval (docs/handover/service-desk.md:39-40). Grade C.
- N2 Do deploys and records need the same treatment as PRs? — unknown; answered by O.

### O. Reading on a small screen
- O1 Length, layout, images and charts, and accessibility on a phone. — a hard constraint (phone first, docs/PROJECT.md:54 and :516; Grade C).
  - The library holds checked accessibility facts:
    - colour not the only signal, contrast, and 24×24 CSS px targets (library/facts/F-wcag22-01.md, grade A);
    - how platform target sizes and contrast rules differ (library/facts/F-platform-targets-contrast-01.md, grade A).
  - Whether images or charts add anything to a change summary is unknown; answered by R and E.

### P. What other fields do
- P1 How do change logs, release notes, intelligence or executive briefings and status reports brief one decision-maker, and where have they misled, been skipped, or added little? — outside evidence to test designs against; partly known.
  - **Intelligence briefing (misleading summaries).** The 2005 WMD Commission said of the President's Daily Brief and the SEIB: "These daily reports were, if anything, more alarmist and less nuanced than the NIE." It added: "the PDBs and SEIBs, with their attention-grabbing headlines and drumbeat of repetition, left an impression of many corroborating reports where in fact there were very few sources." It suggested "the elimination of the inherently misleading 'headline' summaries in PDBs and other senior policymaker briefs." (Overview of the Report, https://govinfo.library.unt.edu/wmd/report/report.html). Grade A for what the Commission found.
    - Its bearing here is an inference, grade C: a daily feed that repeats the same claim across many items can look corroborated when it rests on one source. In this setup, one agent's description could be repeated across the desk, a digest and a notification.
  - **Release notes (readers disagree).** Bi, Xia, Lo, Grundy & Zimmermann studied 32,425 release notes from 1,000 GitHub projects, interviewed 15 practitioners and surveyed 314 respondents. They report "significant disagreement" between producers and users on how release notes should be written and used (https://www.microsoft.com/en-us/research/?p=842125). Grade B. The page gives ICSE 2022, while a search result gave IEEE TSE 48(6); the venue is to be checked.
  - **Release notes (contents).** Nath & Roy found PRs (32%), issues (29%) and commits (19%) are the artefacts most often named in release notes (3,347 notes, 21 repositories; https://arxiv.org/abs/2204.05355). Grade B.
  - **Reminders:** Nudge (K3). Grade B.
  - **Phone reading:** "Flooding them with details and asking them to parse walls of text for relevant facts is not interruption friendly." (https://www.nngroup.com/articles/mobile-ux/). Grade B; general guidance, not evidence on briefings.
  - Still unknown: evidence on executive status reports and digests being skipped, and studies on one reader facing many machine-made summaries; answered by R.

## Owner shortlist
1. How do you find out today that a change has merged or is waiting on you, and about how long does that take you in a week?
2. Can you remember a change you missed, saw late, or merged without enough understanding? What was it?
3. For a change waiting on you, what do you need to see to decide without opening GitHub?
4. For changes already merged, do you want to know about each one, only the ones that went wrong or surprised you, or none?
5. Would you rather get a short list when you open the desk, a once-a-day or once-a-week note, a phone alert, a mix, or nothing beyond what you have now?
6. What would "I have dealt with this" mean for you (looked at it, decided, nothing more), and should the desk remember it across your phone and computer?
7. If a short summary were wrong or left out a risk, what would you do about it, and would you still want it if it carried a visible "not checked" label?
8. Are you willing to let the text of your pull requests and changes go to an outside AI service to write summaries, and is any project too private for that? (Service-Desk is already public; the answer matters for the others.)

## Research shortlist
1. How accurate and complete are the descriptions of Service-Desk's and Personal-Org-Operating-Model's recently merged and open pull requests, compared with what each change did (a sample of about 20, with omissions, claims of changes not made, and mismatches counted)? — decision: whether a summary can be taken from the author's text; depth: 3.
2. How many changes of each kind (merged pull requests, direct commits, deploys, records) arrive per day and week across every connected project and the portfolio repository, counted from git history and the pull-request list over the last 8 weeks? Service-Desk's merged pull requests are already counted (area D). — decision: whether per-change, digest or exception-only reading works, and what each costs; depth: 2.
3. What do the desk's current pull-request rows show for a waiting and for a merged pull request, and which parts of a pull request (description, diff, checks, reviews, linked records) does the desk already read? — decision: what a new summary would replace, duplicate or add; depth: 2.
4. Which plans and licences include GitHub's built-in pull-request summaries and mobile notification controls, what content they send to which model, and under what retention and training terms? — decision: whether anything beyond the desk and GitHub is needed, and the data-boundary ruling in I1; depth: 3.
5. What does published evidence show on executive status reports, digests and machine-made summaries serving (or failing) one reader who faces many events: how often they are skipped, and how often errors or omissions go unnoticed? — decision: design traps and the shape of any summary or digest; depth: 3.

## Design traps to avoid
- Treating the required "What this means for you" paragraph as accurate because CI checks its form (E3, F2, M2).
- A flattering account, or a claim of changes not made, written by the same agent that made the change (F2, F4, G1).
- A summary shown without the state it describes, so a merged or red change still reads as ready. GitHub's own summaries do not refresh themselves (H1, H2).
- Short headline summaries, and the same claim repeated across several surfaces, so one source looks like many (P1, G1).
- A generated summary that silently skips large files (E2).
- Building a second status page that duplicates the desk, or storing seen-marks so that the desk becomes a source of truth (K1, C2).
- Sending private repository content to an outside service without the owner's ruling (I1, F3).
- Counting every merge as needing the owner, which risks the owner's named fear of false alarms (B2, G5).
- Assuming a good-enough hand-written summary exists for older pull requests (E3).
- Judging volume from one project or one week. Service-Desk's weekly merges ran from 21 to 121 (D1, D2).
- Choosing the form before the owner says what "dealt with" means (C1).
- Offering only new things and leaving "nothing beyond what exists" off the table (owner question 5, A3).

## Gaps found in existing questions or plans
- Q-016 does not ask:
  - what the desk's current PR rows show, or whether merged changes appear (A3, K2);
  - whether the notification path covers merged-change events (K3);
  - whether a summary may carry a "not checked" label, or whether the owner would still use one (G4, shortlist 7);
  - whether a summary may leave out parts of a change (E2).
- It does not name the data boundary in docs/PROJECT.md:165-167 as a constraint (I1).
- It does not note the desk's existing device mark plus weekly committed record (C2).

## Not opened
- Copilot plan and licence pages, and the Copilot data-terms page for summaries.
- "Don't Disturb Me" (arXiv 2103.13950) on bot notification overload: seen only as a search result.
- The BBC/EBU 2025 studies on AI assistants and news: left out, because they test answers to questions, not summaries of a supplied text.
- The full text of the arXiv and Microsoft papers: abstracts only.
- The WMD Commission's Chapter One: only the Overview passages were reached.
- Not opened on purpose, per instructions: decisions/, questions/, docs/reports/, docs/briefs/, the portfolio repository, Model-Lab.
- Not opened though in scope: the desk's source code, and the model's OPERATING_MODEL.md and S-026/S-032/S-034 in full.

## Sources opened (this revision)
- research/Q-016.md, research/_GROUNDWORK.md, research/Q-016-memo.md (revision 1), research/Q-016-source-check.md
- library/patterns/P-glance-disclosure-01.md, P-stale-visible-01.md, P-notify-permission-01.md; library/F-gh-09.md; library/facts/F-wcag22-01.md, F-platform-targets-contrast-01.md
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/copilot-for-github-tasks/create-a-pr-summary (also the docs API body and the enterprise-cloud copy)
- https://docs.github.com/en/copilot/responsible-use/pull-request-summaries (fetch reported landing at https://github.com/features/copilot/trust-center)
- https://arxiv.org/abs/2601.04886
- https://arxiv.org/abs/2204.05355
- https://arxiv.org/abs/2011.12468
- https://www.microsoft.com/en-us/research/?p=842125
- https://govinfo.library.unt.edu/wmd/report/index.html and report.html
- https://sgp.fas.org/news/secrecy/2005/03/033105.html (it held no PDB text and is not cited)
- The repository files and web pages listed in revision 1, carried over as checked there; not re-opened.

## What I changed (from revision 1)
- **New sourced items:**
  - F3, E2, H1: GitHub Copilot pull-request summaries (not refreshed automatically, ignores the existing description, leaves out large files).
  - F2, G1: the 2026 study of agent-written PR descriptions.
  - P1: WMD Commission findings on headline summaries, two release-note studies, and Nudge (also in K3).
  - B2: the Nath & Roy reader finding.
  - C4: a pointer to F-gh-09.
  - O1: a summary of the library's accessibility facts.
- **K1:** the quote is back to lower case, as the Source checker read it.
- **Research shortlist 4 and 5:** narrowed to what is still unknown.
- **Design traps:** two new ones (headline summaries and repetition; large files left out), and the stale-summary trap now cites GitHub's own behaviour.
- **Method limits, "Not opened" and "Sources opened":** rewritten for this round. The repository quotes are carried over, not re-opened.