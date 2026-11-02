I've finished the checks and am writing up revision 3 now.

1. **What I changed.** I wrote revision 3 of the groundwork map (below), to be recorded verbatim as research/Q-016-memo.md. It addresses each failed finding in the round-2 source check:
   - **Finding 1 (E2, H1):** I found where GitHub's pull-request-summary text lives now. It is in "Application card: GitHub Copilot Chat" at https://docs.github.com/en/copilot/responsible-use/chat, sections 6 and 7. I cite that URL directly and quote it word for word, including the full sentence about the bulleted list. H1 and the large-file point are marked as single-vendor-source items. The stale-summary design trap no longer depends on them.
   - **Finding 2:** the misquote is fixed to "significant discrepancies".
   - **Finding 3 (venue):** settled. Bi et al. is a journal paper in IEEE TSE (DOI 10.1109/TSE.2020.3038881, online November 2020). It was presented in the ICSE 2022 Journal-First track. The volume and issue, 48(6), come only from a search snippet, and I say so.
   - **Finding 4 (repository quotes, K1, I2):**
     - Every claim taken from docs/, CLAUDE.md or LEDGER is now an ungraded pointer, marked "assumed, unverified". There are no verbatim quotes or grades on them, so the K1 capital-letter question no longer arises.
     - I removed three items that carried the owner's stated leanings: "What the owner would hate", the "Exceptions first" principle, and the "named fear of false alarms" trap. B2 is now unknown and goes to the owner.
     - I2 (Service-Desk is public) is re-confirmed from the GitHub API.
   - **Finding 5 (area D):** I re-checked the counts a third way, using the GitHub search API's `total_count`. All the weekly figures, Oct 19, Oct 25, Oct 26–31 taken together, and the total of 251 match.
   - **Broken citations:** revision 2 cited lines 9–75 of research/Q-016-source-check.md. That file now holds round 2 only and has 31 lines. I now cite those points as "round-1 source check (record not in this pack)".
2. **Why.** The checker could not confirm the responsible-use URL, found a misquote, and left the venue open. Neither of us can open the repository files from this pack, so claims resting on them can't pass a check. My role card also says I must not see docs/PROJECT.md or the owner's leanings. Revision 2 should not have carried them as graded facts.
3. **What I verified.** I ran 5 web searches and 17 fetches, all through a summarising fetch, never raw.
   - **Copilot application card** (docs.github.com/en/copilot/responsible-use/chat): page title "Application card: GitHub Copilot Chat". Every sentence quoted in E2 and H1 came back word for word.
     - Both older responsible-use URLs returned the same card. The tool did not report the final URL, so a redirect is not confirmed.
   - **Copilot how-to page:** the two sentences in E2 and F3 match. The page says nothing about refreshing, size limits or plans.
   - **Bi et al. venue:**
     - the researchr ICSE page says "ICSE 2022 Journal-First Papers";
     - the SMU repository record gives IEEE TSE, DOI 10.1109/TSE.2020.3038881, November 2020;
     - a search snippet gives 48(6), 1 June 2022, and "significant discrepancies".
   - **GitHub search API** (`is:pr is:merged`, `incomplete_results: false` on every call):

     | Range | `total_count` |
     |---|---|
     | Sep 28–Oct 4 | 27 |
     | Oct 5–11 | 28 |
     | Oct 12–18 | 54 |
     | Oct 19–25 | 121 |
     | Oct 26–Nov 1 | 21 |
     | Oct 26–31 | 16 |
     | Oct 25 | 22 |
     | Oct 19 | 36 |
     | Up to Nov 1 | 251 |

     All of these match revision 2.
   - **Repository record:** `visibility: "public"`, `private: false`, created 2026-09-30T18:25:19Z.
   - **Library entries:** I checked the quotes in P-glance-disclosure-01, P-stale-visible-01, F-wcag22-01, F-platform-targets-contrast-01 and F-gh-09 against the files. They match.
4. **What is undone.**
   - A raw (non-summarised) check of the web items.
   - The single-day rows for Oct 26–31 and Nov 1, which were confirmed only as totals.
   - The Copilot plan and data terms.
   - The "Don't Disturb Me" bots study.
   - The repository pointers, which are still unverified.
5. **Needed outside my lane.**
   - The Orchestrator records the map verbatim.
   - A Source checker with access to Service-Desk's docs/handover/, docs/LEDGER.md and CLAUDE.md, or a pack that holds them, settles the pointers.
   - The Chief of Staff should decide whether docs/PROJECT.md content belongs in a blind researcher's map at all.
   - Nothing needs a level-5 expert or a paid source.
6. **Open questions.**
   - Should the area-P items become library entries? I'd say not from a map; they could go through research shortlist 5.
   - Is a single vendor page enough to file H1, or does it wait for a raw check?

---

# Groundwork map — Q-016 — Keeping up with completed and waiting changes across several agent-built projects — 2026-11-02 (revision 3)

This is a map of questions, not graded fact.

*Made by the Researcher (S-020). Grades on known items are proposed; nothing here is marked checked. Items marked assumed or unknown are not sourced and not graded.*

**Method limits.**
- I had no shell and no write tool. I saw every web page and API response through a summarising fetch, not raw. The web items in E2, F2, F3, H1 and P1 still need a raw check.
- **Repository pointers.** Neither I nor the round-2 Source checker could open Service-Desk's docs/, docs/handover/, docs/LEDGER.md or CLAUDE.md from this pack.
  - Every statement drawn from them is marked **"pointer, unverified"**, paraphrased rather than quoted, and ungraded. Each is a place to look, not a fact.
  - A round-1 source check confirmed them. That record is no longer in this pack: research/Q-016-source-check.md now holds round 2 only.
- **Blindness (D-055).** My role card bars me from docs/PROJECT.md and from the owner's leanings. This revision removes items that stated the owner's preferences. The remaining docs/PROJECT.md pointers are named as places the owner or a checker should look, not read by me.
- I did not open the desk's code or look at the live desk.

## Questions an expert would ask

### A. How the owner keeps up today, and what "no change" leaves
- A1 What does the owner do now to learn what has merged and what waits, and how long does it take a week? — sets the baseline for the owner's time; decides whether "do nothing new" is viable; unknown; answered by O, then E.
  - Pointer, unverified: Service-Desk's brief is reported to cap the owner's upkeep of the desk itself at 30 minutes a week (docs/PROJECT.md, the V3 target). Reading time on GitHub is reported nowhere.
- A2 What has the owner missed, or learned late, about a change (merged or waiting)? — the cost of the no-change option; decides whether anything new is needed; unknown; answered by O.
- A3 What do the desk and GitHub already cover, and what is left unsolved? — avoids duplicating the desk; assumed (pointers only).
  - Pointer, unverified: the desk's handover reportedly lists pull requests to merge or give a verdict on, and deploys to approve, each opening a sheet with its context (docs/handover/service-desk.md).
  - Pointer, unverified: the brief reportedly leaves code review and diffs on GitHub, with the desk linking to them.
  - Whether merged changes appear anywhere on the desk is unknown; answered by R or O.
- A4 Does the desk's idea of "needs the owner" cover every kind of waiting change? — a change that waits but is not in the desk's list is a missed item; unknown; answered by R.
  - Pointer, unverified: the brief reportedly defines it as an open queue card, or a PR or question waiting on the owner's verdict. How a PR is judged to be waiting is unknown.

### B. What the owner needs to learn about a change, and when
- B1 For a change waiting on the owner, what is the least the owner must see to decide (what it does, risk, checks, reviews, what happens on approve or reject)? — drives summary content; unknown; answered by O.
- B2 For a change already merged, does the owner need to know about each one, a group of them, or only exceptions? — decides between a per-change summary, a digest and nothing; unknown; answered by O.
  - Outside, and different readers: in a survey of 32 professionals, "project managers are more interested in learning about new features than less critical bug fixes" (Nath & Roy, SANER 2022, https://arxiv.org/abs/2204.05355). Grade B for what it says; small sample, and not about one owner.
- B3 What should be seen before a merge, and what only after? — timing; unknown; answered by O.
- B4 Does the owner want changes shown singly or beside others? — drives ordering and grouping; unknown; answered by O.
- B5 Which of the owner's decisions depend on a change summary, and which on the original pull request? — sets how much the owner relies on it (see G); unknown; answered by O.

### C. What "seen or dealt with" means
- C1 What states can a change be in for the owner (new, read, acknowledged, acted on, cleared), and which does the owner want recorded? — the state model; decides whether a record is kept and where; unknown; answered by O.
- C2 Where would a "seen" mark live? — a design constraint; assumed (pointers only).
  - Pointer, unverified: the handover reportedly says the desk writes nothing to repositories.
  - Pointer, unverified: the brief reportedly keeps some figures on the device and offers a weekly prefilled link that commits them to the owner's portfolio repository.
  - Whether that suits "seen" marks, and whether a phone and a desktop must agree, is unknown; answered by O and R.
- C3 What does GitHub already offer for state? — a baseline to compare against; known.
  - The GitHub notifications page (https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications) says: "Remove a notification from the inbox with **Done**." and "**Saved** notifications are flagged in your inbox." Grade A (vendor documentation of its own product). Confirmed in the round-1 check, whose record is not in this pack, so it needs a re-check.
  - Same page: "Unsubscribing also removes the notification from your inbox."
  - Same page: "You can customize and schedule push notifications in the GitHub Mobile app."
- C4 After the owner sees a change, what does the reader do next (open GitHub, answer, nothing)? — shapes the link or action on the summary; unknown; answered by O.
  - Related library fact: on iOS, tapping a GitHub link opens GitHub Mobile rather than Safari. Long-pressing then "Open" turns this off for later taps (library/F-gh-09.md, grade B). So a desk link may land in the app.

### D. How many changes arrive
- D1 How many pull requests merge per week across all the projects, and how many open and wait? — sets whether per-change reading, a digest or exception-only is feasible.
  - Merged pull requests: known for Service-Desk.
  - Waiting pull requests: one snapshot only.
  - Other projects: unknown.
- D2 How does volume differ by project and kind (feature, record-only, governance, settings)? — decides grouping and what to skip; unknown beyond Service-Desk; answered by R.
- D3 Does volume rise when many agents run at once? — peak load against average; unknown, but the series below swings widely; answered by R.

**Count of merged pull requests (Service-Desk only).** Three methods agree:
- **Methods 1 and 2:** in round 1, the Source checker paged through the pulls API (`merged_at`, UTC) and separately ran `TZ=UTC git log origin/main --first-parent --merges`. Both gave 251 merged PRs (#1 to #264) as of 2026-11-01. That record is not in this pack.
- **Method 3 (mine, 2026-11-02):** the GitHub search API, `repo:shumpmaster/Service-Desk is:pr is:merged merged:<range>`, reading `total_count`, with `incomplete_results: false` on every call. It confirms:
  - all five weekly figures below;
  - Oct 19 (36) and Oct 25 (22);
  - Oct 26–31 taken together (16);
  - the total of 251 up to Nov 1.
- Grade A for the weekly figures and the total (primary records, independent methods agreeing). The single-day rows for Oct 26–31 and Nov 1 are confirmed only as a sum.

Merged per day, last 8 days (UTC):

| Day | Merged | Note |
|---|---|---|
| Oct 25 | 22 | #222-#243; confirmed by method 3 |
| Oct 26 | 4 | |
| Oct 27 | 1 | |
| Oct 28 | 1 | |
| Oct 29 | 3 | |
| Oct 30 | 1 | |
| Oct 31 | 6 | Oct 26–31 sum of 16 confirmed by method 3 |
| Nov 1 | 5 | #260-#264 |

Merged per week (Monday to Sunday):

| Week | Merged |
|---|---|
| Sep 28-Oct 4 | 27 |
| Oct 5-11 | 28 |
| Oct 12-18 | 54 |
| Oct 19-25 | 121 (Oct 19 alone: 36) |
| Oct 26-Nov 1 | 21 |

- Average: about 55 a week since the repository was created on 2026-09-30.
- What it means for the map: weekly volume swings by a factor of about six (21 to 121), so a design has to be tried against both a quiet and a busy week.
- Assumed, answered by E: a peak of 36 in a day is beyond what can be read one change at a time.
- Not counted: Personal-Org-Operating-Model, the portfolio repository, and Model-Lab (not to be read).

### E. What a per-change summary can hold
- E1 What fits on a phone at a glance for one change (a line, a few lines, a card)? — a size limit; partly known.
  - The NN/g mobile UX article (https://www.nngroup.com/articles/mobile-ux/) says: "Compared with desktop and even laptop screens, phone screens accommodate a lot less content." and "The gist should always come before the minutiae." Grade B (one source).
  - Library pattern: "put what users often need on the first screen and the rest one step down … Keep to at most two disclosure levels (Nielsen only, single source)". The same entry says what belongs on a phone's first screen for several projects is not documented (library/patterns/P-glance-disclosure-01.md:4). Grade B as filed.
  - The size for this owner is unknown; answered by E.
- E2 Which parts of a pull request matter for the summary: description, diff, checks, reviews, linked records? — decides what is read and what could mislead; unknown for this setup; answered by R and O.
  - The description form is fixed, and CI checks the form, not the content (research/Q-016.md:9). Grade C (the question's own statement).
  - One existing generator reads the change and ignores the description: "GitHub Copilot does not take into account any existing content in the pull request description, so start with a blank description for best results." (https://docs.github.com/en/copilot/how-tos/copilot-on-github/copilot-for-github-tasks/create-a-pr-summary). Grade A for what the vendor says of its own product.
  - The application card (https://docs.github.com/en/copilot/responsible-use/chat, §6 "Performance") says how it works: "When a user requests a summary, a workflow uses the code diffs from files to build a prompt and requests Copilot to generate an overall summary." and "The output consists of a prose paragraph giving an overview of the changes, followed by a bulleted list of key changes linked to the respective lines of code."
  - The same card (§7 "Limitations") says: "Files with more than 400 combined additions and deletions are excluded from summarization."
  - Grade B for these card items: one vendor page on its own product, read through a summarising fetch. Earlier URLs (…/responsible-use/pull-request-summaries) now serve the same card.
- E3 Is the required "What this means for you" paragraph already a per-change summary? — if good enough, the summary may already exist; unknown; answered by R (sample real PRs) and E.
  - "Older pull requests were not rewritten" (research/Q-016.md:9). Grade C.
  - Pointer, unverified: Service-Desk's ledger reportedly marks the point from which PRs carry the Milestone, Context and Why sections (docs/LEDGER.md), so coverage would vary by date.

### F. How summaries could be produced
- F1 The options are: taken from the author's text, generated from the change, written by a person, or a mix. What does each do to accuracy and cost, and who checks it? — the core design choice; unknown; answered by R, then E.
- F2 For a summary taken from the author, how often is the description missing, stale or wrong? — if often, it cannot be relied on; unknown for these projects; answered by R (sample audit).
  - Outside evidence comes from Gong, Pinna, Bian & Zhang (arXiv 2601.04886, v2 26 Jan 2026), on 23,247 agent-authored PRs from five agents:
    - "406 PRs (1.7%) exhibited high PR-MCI" (message-code inconsistency);
    - the most common type was "descriptions claim unimplemented changes" (45.4%);
    - high-MCI PRs "had 51.7% lower acceptance rates (28.3% vs. 80.0%)".
  - Grade B: one preprint, abstract only. The rate in these projects may differ.
- F3 For a generated summary, which model or tool, and who pays? — sets cost and terms; partly known.
  - Pointer, unverified: the brief reportedly sets the AI ceiling at $0 pay-per-use API spend, with any API key use needing the owner's ruling. It cites library LIB-F-c (cloud sessions bill to the claude.ai subscription and can't use an API key); I did not re-open that entry.
  - GitHub Copilot makes a summary on request; the how-to page above says "Review the generated summary carefully." Grade A.
  - The application card (§7) says: "Users can request a new summary, but should carefully review the updated output—it carries the same risks of inaccuracy as the original." Grade B.
  - Which Copilot plans include it, and its data terms, are unknown; answered by R.
- F4 Who checks a summary, given the agents are the authors and may flatter their own work? — the independence problem; unknown; answered by O and R.
  - Pointer, unverified: Service-Desk's CLAUDE.md reportedly separates builder and reviewer roles, with the reviewer recording verdicts.

### G. Where a summary can mislead
- G1 How does a summary fail (omitted risk, flattering account, stale or missing description, wrong scope), and how would each failure be noticed? — design traps; partly known from outside.
  - Agent-written descriptions most often claim changes that were not made (F2). Grade B.
  - Short headlines and repetition: see P1 (WMD Commission). Grade A for what the report found.
  - For these projects: unknown; answered by R and E.
- G2 What does the owner rely on the summary for (decide to merge, decide to ignore, know it happened)? — the harm if it is wrong; unknown; answered by O.
- G3 What happens when it fails (a missed risk, a wrong merge)? — the need for a back-stop such as a link to the original and a mark for unchecked content; unknown; answered by O and E.
- G4 Is a flagged "unverified" summary better than none? — design choice; unknown; answered by E.
- G5 Could the desk's existing measures of missed decisions and false alarms also measure summary failures? — reuse of existing machinery; assumed. Pointer, unverified: the brief's V1 and V2 targets.

### H. A summary after the change moves on
- H1 What events change a pull request after its summary was written (new commits, edited description, review findings, red checks, merge, close), and which must update or void the summary? — staleness is a main failure; partly known.
  - For GitHub's own generator, the application card (https://docs.github.com/en/copilot/responsible-use/chat, §7) says: "Pull request summaries are only created when users request them manually. When updates or changes are made to the pull request, the summary is not automatically refreshed." Grade B: one vendor page on its own product, summarising fetch, to be checked raw. Nothing else in this map rests on it alone.
  - Which events matter here is unknown; answered by R and E.
- H2 How does the reader know which state a summary describes? — needs a visible "as of" mark; partly known.
  - Library pattern: "if people may check more often than the data updates, show text saying when it was last updated, and show content quickly without hiding stale data behind placeholder content" (library/patterns/P-stale-visible-01.md:4). Grade B as filed.
  - Whether to tie a summary to a commit SHA is unknown; answered by R.
- H3 Would regenerating on each push cost too much or churn the owner's attention? — cost and noise; unknown, and the daily peaks in D make it matter; answered by E.

### I. Data leaving the repositories
- I1 If anything is generated, what content leaves which repository, to whom, and under what terms? — privacy and the data boundary; assumed (pointer only).
  - Pointer, unverified: the brief reportedly limits where the desk may send repository content to GitHub and Cloudflare, plus Anthropic under one condition, and never secrets to a model.
  - If so, sending diffs to any other model needs the owner's ruling. Whether Copilot's model terms fit that intent is unknown; answered by R and O.
- I2 Which repositories are private, and do their diffs hold secrets or personal data? — decides what may be sent; partly known.
  - The GitHub API reports shumpmaster/Service-Desk as `"visibility": "public"`, `"private": false` (https://api.github.com/repos/shumpmaster/Service-Desk, fetched 2026-11-02). Grade A (primary record).
  - The other repositories are to check; answered by R.
  - Pointer, unverified: the portfolio repository is reportedly private, and the desk's token is reportedly fine-grained and read-only (docs/handover/desk-operations.md).
- I3 Do the owner's accounts and plans allow a hosted summary tool, and under what retention terms? — terms; unknown.
  - The Copilot code-review page says "Copilot code review runs in an ephemeral development environment" (https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review). Grade B for what it says. It is confirmed in the round-1 check, not re-opened here, and it is about code review, not summaries. Answered by R and O.

### J. Order, grouping, filtering, navigation
- J1 What orders the list (urgency, project, milestone, time, kind, state)? — readability at volume; unknown; answered by O and E.
  - Pointer, unverified: the brief reportedly orders waiting cards by the project's published order, then cards others wait on, then oldest first.
- J2 Is grouping by milestone feasible, given each PR's milestone line is required? — only where the line exists; assumed (older PRs lack it; see E3).
- J3 How many filter or navigation levels does a phone allow? — see E1 and the two-level limit in P-glance-disclosure-01; unknown here; answered by E.

### K. Relation to the desk and GitHub
- K1 What does each option replace, duplicate or add against the desk and GitHub? — avoids building a second status page; partly known.
  - The desk's pull-request rows "come from the projects' repositories, and the portfolio repository is read for its records" (research/Q-016.md:9). Grade C.
  - Pointer, unverified: the brief reportedly says the desk is never a source of truth. If so, a stored summary must not become one.
- K2 Do the desk's PR rows already carry a summary-like line, and could they show the PR's own "What this means for you" paragraph at no new cost? — the cheapest option; unknown; answered by R.
- K3 Do notifications already reach the owner's phone? — the notifications-only option depends on it; assumed (pointers only).
  - Pointer, unverified: the handover reportedly says Service-Desk sends a phone notification when something starts waiting on the owner, and that the operating-model project has no sender yet.
  - Whether merged-change events are covered is unknown.
  - Outside: a Microsoft reminder service for overdue PRs, tried on 147 repositories, "was able to reduce pull request resolution time by 60% for 8,500 pull requests". Recipients rated "73% of these notifications as positive" (Maddila et al., "Nudge", ACM TOSEM 2022, https://arxiv.org/abs/2011.12468; abstract only). Grade B. It concerns teams, not one owner.

### L. Time and cost, and how to try it cheaply
- L1 What is the owner's time to read and keep up under each option, and the agents' cost to produce and maintain it? — the value case; unknown; answered by E.
- L2 What is the cheapest trial (a week of the owner reading a hand-made or generated digest; a prototype list on the preview)? — experiment design; unknown; it should cover a busy and a quiet week (D); answered by E.
- L3 What measure shows value (time to catch up, missed or late items, the owner's own rating)? — needed before scope is set; unknown; answered by O and E.

### M. The form pull requests are written in
- M1 Would the PR form need to change (for example a one-line "summary for the desk" field), and what would that cost the projects? — a change to the model's rules; unknown; answered by R and O.
  - CI checks form, not content (research/Q-016.md:9). Grade C.
  - The rule lives in the model's repository (OPERATING_MODEL.md §2–3, cited in the question), so changing it is outside a single project's lane. Inference, grade C.
- M2 Does a stricter or extra field help if the content is never checked? — a form check does not make the content true; assumed. F2's outside evidence bears on this.

### N. Changes that are not pull requests
- N1 What share of changes are direct commits, deploys or record-only commits that never go through a PR? — a PR-only approach would miss them; unknown; answered by R.
  - Pointer, unverified: the owner reportedly commits answer files straight to main from the web, and deploys reportedly wait for the owner's approval.
- N2 Do deploys and records need the same treatment as PRs? — unknown; answered by O.

### O. Reading on a small screen
- O1 Length, layout, images and charts, and accessibility on a phone. — a hard constraint; the owner reads mostly on a phone (research/Q-016.md:9; grade C).
  - The library holds checked accessibility facts:
    - colour not the only signal, contrast, and 24×24 CSS px targets (library/facts/F-wcag22-01.md, grade A);
    - how platform target sizes and contrast rules differ (library/facts/F-platform-targets-contrast-01.md, grade A).
  - Whether images or charts add anything to a change summary is unknown; answered by R and E.

### P. What other fields do
- P1 How do change logs, release notes, intelligence or executive briefings and status reports brief one decision-maker, and where have they misled, been skipped, or added little? — outside evidence to test designs against; partly known.
  - **Intelligence briefing (misleading summaries).** The 2005 WMD Commission (Overview of the Report, https://govinfo.library.unt.edu/wmd/report/report.html) found:
    - of the President's Daily Brief and the SEIB: "These daily reports were, if anything, more alarmist and less nuanced than the NIE.";
    - "the PDBs and SEIBs, with their attention-grabbing headlines and drumbeat of repetition, left an impression of many corroborating reports where in fact there were very few sources.";
    - it suggested "the elimination of the inherently misleading 'headline' summaries in PDBs and other senior policymaker briefs."
    - Grade A for what the Commission found.
    - Its bearing here is an inference, grade C: a feed that repeats one claim across many items can look corroborated. Here, one agent's description could be repeated across the desk, a digest and a notification.
  - **Release notes (readers disagree).** Bi, Xia, Lo, Grundy & Zimmermann studied 32,425 release notes from 1,000 GitHub projects, interviewed 15 practitioners and surveyed 314 respondents. They found "significant discrepancies between different stakeholders on how release notes should be written and used" (https://www.microsoft.com/en-us/research/?p=842125). Grade B.
    - Venue: IEEE Transactions on Software Engineering, DOI 10.1109/TSE.2020.3038881, published online November 2020 (https://ink.library.smu.edu.sg/sis_research/5928). It was presented in the ICSE 2022 Journal-First Papers track (https://conf.researchr.org/details/icse-2022/icse-2022-journal-first-papers/24/An-Empirical-Study-of-Release-Note-Production-and-Usage-in-Practice).
    - The issue, vol. 48 no. 6 (June 2022), appeared only in a search snippet.
  - **Release notes (contents).** Nath & Roy found PRs (32%), issues (29%) and commits (19%) are the artefacts most often named in release notes (3,347 notes, 21 repositories; https://arxiv.org/abs/2204.05355). Grade B.
  - **Reminders:** Nudge (K3). Grade B.
  - **Phone reading:** "Flooding them with details and asking them to parse walls of text for relevant facts is not interruption friendly." (https://www.nngroup.com/articles/mobile-ux/). Grade B; general guidance, not evidence on briefings.
  - **Still unknown:** evidence on executive status reports and digests being skipped, and studies on one reader facing many machine-made summaries; answered by R.

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
1. How accurate and complete are the descriptions of Service-Desk's and Personal-Org-Operating-Model's recently merged and open pull requests, compared with what each change did? Use a sample of about 20, counting omissions, claims of changes not made, and mismatches. — decision: whether a summary can be taken from the author's text; depth: 3.
2. How many changes of each kind (merged pull requests, direct commits, deploys, records) arrive per day and week across every connected project and the portfolio repository, counted from git history and the pull-request list over the last 8 weeks? Service-Desk's merged pull requests are already counted (area D). — decision: whether per-change, digest or exception-only reading works, and what each costs; depth: 2.
3. What do the desk's current pull-request rows show for a waiting and for a merged pull request, and which parts of a pull request (description, diff, checks, reviews, linked records) does the desk already read? This should also confirm the repository pointers in this map. — decision: what a new summary would replace, duplicate or add; depth: 2.
4. Which plans and licences include GitHub's built-in pull-request summaries and mobile notification controls, what content they send to which model, and under what retention and training terms? — decision: whether anything beyond the desk and GitHub is needed, and the data-boundary ruling in I1; depth: 3.
5. What does published evidence show on executive status reports, digests and machine-made summaries serving (or failing) one reader who faces many events? How often are they skipped, and how often do errors or omissions go unnoticed? — decision: design traps and the shape of any summary or digest; depth: 3.

## Design traps to avoid
- Treating the required "What this means for you" paragraph as accurate because CI checks its form (E3, F2, M2).
- A flattering account, or a claim of changes not made, written by the same agent that made the change (F2, F4, G1).
- A summary shown without the state it describes, so a merged or red change still reads as ready (H1, H2).
- Short headline summaries, and the same claim repeated across several surfaces, so one source looks like many (P1, G1).
- A generated summary that silently leaves out parts of a change, such as large files in GitHub's own tool (E2).
- Building a second status page that duplicates the desk, or storing seen-marks so that the desk becomes a record others rely on (K1, C2).
- Sending private repository content to an outside service without the owner's ruling (I1, F3).
- Counting every merge as needing the owner, which risks false alarms (B2, G5).
- Assuming a good-enough hand-written summary exists for older pull requests (E3).
- Judging volume from one project or one week: Service-Desk's weekly merges ran from 21 to 121 (D1, D2).
- Choosing the form before the owner says what "dealt with" means (C1).
- Offering only new things and leaving "nothing beyond what exists" off the table (owner question 5, A3).

## Gaps found in existing questions or plans
- Q-016 does not ask:
  - what the desk's current PR rows show, or whether merged changes appear (A3, K2);
  - whether the notification path covers merged-change events (K3);
  - whether a summary may carry a "not checked" label, or whether the owner would still use one (G4, shortlist 7);
  - whether a summary may leave out parts of a change (E2).
- It does not name the desk's data boundary as a constraint (I1; pointer, unverified).
- The research pack for a blind researcher does not hold the Service-Desk repository files that Q-016 itself points to. Every claim from them is therefore unverifiable at research time (method limits).

## Not opened
- Copilot plan and licence pages, and the Copilot data-terms page for summaries.
- "Don't Disturb Me" (arXiv 2103.13950) on bot notification overload: seen only as a search result.
- The BBC/EBU 2025 studies on AI assistants and news: left out, because they test answers to questions, not summaries of a supplied text.
- The full text of the arXiv, IEEE and Microsoft papers: abstracts and records only.
- The WMD Commission's Chapter One: only the Overview passages were reached (round 2).
- Not opened, by instruction or role: docs/PROJECT.md, decisions/, questions/, docs/reports/, docs/briefs/, the portfolio repository, Model-Lab.
- Not opened though in scope: Service-Desk's docs/handover/, docs/LEDGER.md, CLAUDE.md and code (not in this pack), and the model's OPERATING_MODEL.md and S-026/S-032/S-034 in full.

## Sources opened (this revision)
- research/Q-016.md, research/_GROUNDWORK.md, research/Q-016-memo.md (revision 2), research/Q-016-source-check.md (round 2)
- library/patterns/P-glance-disclosure-01.md, P-stale-visible-01.md; library/F-gh-09.md; library/facts/F-wcag22-01.md, F-platform-targets-contrast-01.md
- https://docs.github.com/en/copilot/responsible-use/chat (title "Application card: GitHub Copilot Chat")
- https://docs.github.com/en/copilot/responsible-use/pull-request-summaries and https://docs.github.com/en/copilot/responsible-use-of-github-copilot-features/responsible-use-of-github-copilot-pull-request-summaries (both returned the same application card)
- https://docs.github.com/en/copilot/how-tos/copilot-on-github/copilot-for-github-tasks/create-a-pr-summary
- https://conf.researchr.org/details/icse-2022/icse-2022-journal-first-papers/24/An-Empirical-Study-of-Release-Note-Production-and-Usage-in-Practice
- https://ink.library.smu.edu.sg/sis_research/5928
- **Failed:** https://researchr.org/publication/BiXLGZ22 (connection refused) and the Monash page (403)
- https://api.github.com/repos/shumpmaster/Service-Desk
- https://api.github.com/search/issues with `repo:shumpmaster/Service-Desk is:pr is:merged`, for the ranges in area D
- **Carried from revision 2, not re-opened this round:** the arXiv abstracts (2601.04886, 2204.05355, 2011.12468), https://www.microsoft.com/en-us/research/?p=842125, the WMD Commission report, the NN/g mobile-UX article, the GitHub notifications and code-review pages. All were confirmed by the round-2 Source checker, except the notifications and code-review pages, which were confirmed in round 1.

## What I changed (from revision 2)
- **E2 and H1:** GitHub's summary text is now cited at its current home, the Copilot Chat application card, §6 and §7, with full quotes. Both are graded B as one vendor page, and the stale-summary trap no longer rests on H1.
- **P1:** "significant disagreement" is corrected to "significant discrepancies". The venue is settled: IEEE TSE (DOI 10.1109/TSE.2020.3038881), presented in the ICSE 2022 Journal-First track.
- **Area D:** confirmed by a third method (search API counts), and its citation no longer points at a source-check record that is no longer in the pack.
- **I2:** re-confirmed from the GitHub API directly.
- **Repository-sourced items:** all are now ungraded "pointer, unverified" paraphrases. The K1 quote is removed, so its capital letter no longer matters.
- **Owner's leanings removed under D-055:** the "What the owner would hate" item in A2, the "Exceptions first" principle in B2 (now unknown, answered by O), and the "named fear" wording in the false-alarm trap.
- **New gap noted:** the pack does not hold the repository files Q-016 points to.