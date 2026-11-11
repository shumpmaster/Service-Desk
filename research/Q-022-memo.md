I've revised the Q-022 groundwork map; the full text is below for the Orchestrator to record. Six of the seven failed items are now fixed or downgraded. The seventh, re-reading through the summarising tool, can't be fixed in my lane. Two of my earlier claims were wrong and are now removed. The map now has 51 questions; the question list and shortlists are otherwise unchanged.

---

# Groundwork map — Q-022 — how one overseer follows many parallel pieces of delegated work, and sees which steps wait on them — 2026-11-11 (revision 2)

This is a map of questions, not graded fact.

*Known items cite a library entry or a source and carry a grade; only known items are graded. "Assumed" means the research question states it but I could not see the record. Project plans, docs/PROJECT.md and docs/handover/ are outside my pack (D-055). Every outside page was read through a summarising fetch tool, not as raw text. Where a known item rests on a single source, it says so.*

## Questions an expert would ask

### A. Today's practice and the do-nothing baseline
- A1 How does the owner find out today that something waits on them: by opening the desk, from GitHub notifications or GitHub Mobile pushes, or none of these? — this is the baseline cost and decides whether anything new is needed; unknown; answered by O
- A2 How long does an owner-waiting item sit before the owner acts, and how often is one found late? — the main measure of value, which sets the value target; unknown (the dispatch log and decisions/ timestamps could measure it); answered by E
- A3 What does the Waiting screen show today, and how often is it opened? — the baseline for replacing it or sitting beside it; assumed (as the question describes it); answered by O / E
- A4 Which GitHub notifications can reach the owner today? — GitHub may already cover part of the need, which affects scope. Known:
  - GitHub Mobile can push for direct mentions, assignments, review requests and deployment approvals, each switched on separately, with a Working Hours schedule (F-gh-11, A).
  - "CI activity, such as the status of workflows" is a separate subscription option from "All activity in a repository" (docs.github.com about-notifications, B, single vendor page).
  - Workflow-run notifications go to the person who triggered the run; for scheduled workflows they go to whoever created the workflow or last changed its cron line (docs.github.com notifications-for-workflow-runs, B, single vendor page).
  - Notifications not marked Saved are kept 3 months; Saved ones are kept indefinitely (about-notifications and configuring-notifications pages, B).
  - Who triggers runs in this setup, and therefore who gets those notifications: unknown.
  - Answered by R (mostly known) / E
- A5 What does doing nothing leave unsolved? Orchestrator events (stalls, budget pauses, failure cards), research and phase gates have no GitHub notification. — the gap any new view must fill, which sets scope; assumed from the setup; answered by E (map events to records, see E1)

### B. What the owner needs to know, and when
- B1 When the owner opens the view, what is the first question it must answer: what is mine to do, what is stuck or failed, or what got done? — first-screen priority, which drives layout; unknown; answered by O
- B2 For each piece of work there is where it is, who holds it, what it waits on, and what failed and why. Which of these does the owner use, and which are only nice to have? — keeps the view small, which sets scope; unknown; answered by O
- B3 What do people supervising several automated agents need in order to keep track? — the evidence base for design. Known in part:
  - Modelled single-operator capacity fell by up to 67% once reorientation and loss of situation awareness were counted, and by 36% even under management-by-exception (F-supervisor-capacity-01, B).
  - Situation awareness is commonly framed as three levels: perception, comprehension and projection (Endsley 1995, *Human Factors* 37(1):32–64, DOI 10.1518/001872095779049543). I read the levels only on Wikipedia's Situation awareness page, which cites Endsley 1995a/b, and saw the paper's details in search results only. Grade C (secondary).
  - Answered by R
- B4 Should the view show how long each item has been in its current state (its age), not just the state? — ageing catches stuck work; design. Known: the Kanban Guide (2025 edition, Vacanti and Orderly Disruption Ltd) makes WIP, Throughput, Work Item Age and Cycle Time mandatory. It defines Work Item Age as "the elapsed time between when a work item started and the current date" (kanbanguides.org and prokanban.org, B). Both hosts carry the same guide by the same authors, so this is a single authority, not two independent sources. Answered by R

### C. What interrupts and what waits
- C1 Which events justify interrupting the owner on the phone? — the interruption budget, which sets notification scope. Known as principles:
  - Interrupt only for things that are new and need action (P-notice-actionable-01, B).
  - Repeated reminders lowered acceptance by 10% for each 5-point rise in the share of repeats (F-alert-repeat-01, B).
  - Overrides of 49–96% were driven mostly by low signal-to-noise (F-alert-override-01, B).
  - Which events qualify here: unknown, answered by O
- C2 Is there a ceiling on interruptions per day? — avoids an alarm flood; sets the threshold. Known from process-plant operations:
  - EEMUA 191 treats less than one alarm per 10 minutes in steady state as "very likely to be acceptable". After a major upset it treats fewer than ten alarms in the first 10 minutes as "should be manageable, but may be difficult". Sources: humanfactors101.com alarms page and a Control Global article on ASM guidelines and ISA-18.2, two independent secondary sources that agree. The standard itself is paid. Grade C.
  - A widely used flood threshold: a flood starts when more than 10 new alarms arrive in a 10-minute period, and ends when a 10-minute period has fewer than 5. The figure agrees across sources, but the attribution conflicts. An ISA-CAP study guide (open-exam-prep.com) attributes it to ISA-18.2. Kim VanCamp ("Alarm Management by the Numbers", Chemical Engineering, 1 Mar 2016) attributes it to EEMUA 191. Grade C.
  - These figures are for a full-time control-room operator, not a part-time owner. The owner's own ceiling is unknown.
  - Answered by O / E
- C3 Should pushes be batched into a digest at set times rather than sent as they happen? — digest or live; design. Known: phone notifications batched three times a day improved self-reported attention and stress against controls, and no notifications at all raised anxiety (F-batch-notify-01, B; wellbeing outcomes only). Answered by O / E
- C4 Can a superseded notice be replaced rather than pile up? — prevents repeats; mechanism. Known:
  - A Web Push Topic header replaces an undelivered message with the same topic (F-webpush-02b, A).
  - On iOS, web push works only for Home Screen web apps, from iOS 16.4 (F-webpush-01, A).
  - Every push must be shown to the user (F-webpush-04, A).
  - Answered by R (already known)

### D. Which events matter, and how they are classified
- D1 What is the full set of event kinds across a piece of work? These include dispatches, returns, passes, fails, third fails sent to Triage, retries, budget and usage-limit pauses, malformed returns, failure cards, cards raised and answered, gates, research memos, merges and deploys. — the base of any history or pipeline view, which sets scope; unknown (governance/ROUTING.toml and the dispatch log were not in my pack); answered by R / E
- D2 Should events be classified as a fixed closed set, open labels, free text or none? — filtering and counting need a closed set, and open labels drift; data model; unknown; answered by R
- D3 Do events with no GitHub equivalent (gates, cards, research, stops) fit the same scheme as GitHub events, or need their own? — one scheme or two; data model; unknown; answered by R / E
- D4 Who owns the event vocabulary: the Orchestrator's routing table or the view? — changes to routing must not silently break the view; data model; unknown; answered by O / R

### E. Reading events from the records
- E1 For each event kind, which record carries it, with what timestamp, and who wrote it? — decides whether the view can be built from records alone; feasibility; unknown; answered by E (rebuild one finished piece of work end to end from its records)
- E2 How should reconstructed or indirect steps be shown? These are local builder branches seen only through merge commits, verdicts the Orchestrator files for reviewers, and steps grouped by session. — avoids showing guesses as fact; design; unknown; answered by R / E
- E3 How does the view show that something is not recorded, without guessing? — the honesty of the view; design. Known as a principle: "Inaccurate system-status messages for empty states are particularly harmful" (P-stale-visible-01, B). Unknown for a timeline; answered by R
- E4 How does a reader get from an event to the record behind it, and do those links last? — traceability, which drives link design. Known:
  - By default, checks, workflow runs, commit statuses, artifacts and logs are kept 90 days. The setting can range from 1 to 90 days for public repositories and from 1 to 400 days for private ones.
  - The page says: "Starting October 1, 2026, these policies will apply to checks, workflow runs, and commit statuses in addition to artifacts and logs. Until then, checks, workflow runs, and commit statuses are retained for 400+ days regardless of your configured retention period." The page still uses the future tense although that date has passed.
  - Source: docs.github.com Actions retention page, B, single vendor page.
  - So links to runs, checks and statuses older than the configured period (90 days by default) are now expected to break.
  - Answered by R (mostly known); whether the change has taken effect on these repositories can be checked by E
- E5 Can GitHub's activity feed serve as the history source? — a common shortcut; architecture. Known: no.
  - The Events API returns only events from the past 30 days, up to 300 per timeline.
  - It is "not built to serve real-time use cases", and event latency "can be anywhere from 30s to 6h".
  - Sources: docs.github.com/en/rest/activity/events; the Enterprise Server 3.17 page says the same. Grade B: both are vendor pages, not independent.
  - Answered by R (already known)

### F. Trust
- F1 Which records does the Orchestrator write and which do the agents write themselves, and should the view mark the difference? — self-reports can be optimistic; design. Known in part:
  - Optimistic bias degraded reporting quality among 561 project managers (F-status-optimism-01, B).
  - On GitHub, App installation tokens attribute activity to the app's bot account (L-F1, A; L-F10, A).
  - Whether that separates the Orchestrator from the agents here: unknown, answered by R / E
- F2 How would the owner notice that the view is wrong or stale? — a wrong view that is trusted is worse than none; checks. Known: automation complacency under multi-task load "cannot be prevented by training or instructions" (F-automation-complacency-01, B). Unknown for this view; answered by R / E
- F3 Who tells the owner if the Orchestrator itself, or the view, has stopped? — a silent stop looks like "nothing waiting", so this needs a heartbeat or dead-man signal; unknown; answered by O / R
- F4 If a model writes a digest or briefing, how is it checked? — accuracy, and whether summaries are allowed at all. Known:
  - Summary errors rise with length and with the number of sources (F-sum-long-multi-01, B).
  - Automatic faithfulness checkers are weak on hard cases (F-sum-detectors-weak-01, A).
  - The check should be done by a party other than the author, with the source passages at hand (P-sum-independent-grounded-check-01, C).
  - An "AI-generated" label lowers perceived accuracy (F-trust-ai-label-01, B).
  - Answered by R (already known)
- F5 What does the owner rely on the view for: deciding, or only reminding? — sets how strictly its accuracy must be checked; unknown; answered by O

### G. Freshness
- G1 How current must the view be: live, within minutes, or once at each sitting? — architecture and cost; unknown; answered by O
- G2 How does the reader see the as-of time, and how do half-finished states show? — trust; design. Known: show when data was last updated if people may check more often than it updates, and don't hide stale data behind placeholders (P-stale-visible-01, B). Not documented: fading stale data. Answered by R (already known)
- G3 What delays come from the likely mechanisms? — sets honest freshness claims. Known, if those mechanisms are used:
  - Actions schedules run at most every 5 minutes and can be delayed or dropped at the start of the hour (F-gh-12, A; F-gh-12b, A).
  - Workers KV writes can take up to 60 s to be seen elsewhere (F-cf-kv-01, A).
  - Which mechanism the desk uses: unknown; answered by R
- G4 Does on-screen auto-updating need a pause control? — accessibility. Known: WCAG 2.2.2 requires one unless the updating is essential; whether a status screen counts as essential is not documented (F-wcag22-01, A). Answered by R (already known)

### H. Volume, reach and readability
- H1 How many events arrive per day across all projects, and how many wait on the owner? — drives density, grouping and the interruption budget; unknown; answered by E (count from the dispatch log and GitHub over two weeks)
- H2 How far back should the view reach, and when does finished work age out? — scope and storage; unknown; answered by O
- H3 Which groupings stay readable: by project, piece of work, branch, milestone, agent role or state? Which is the default? — layout; unknown; answered by O / E
- H4 Does collapsing (for example, folding retries into one line) hide failures the owner needs? — readability against loss; design; unknown; answered by E
- H5 Do GitHub's read limits allow polling every project? — feasibility. Known: 5,000 REST requests an hour per token, and a conditional request that returns 304 doesn't count (F-gh-01, A). Code search is limited to 10 requests a minute (F-gh-search-02a, A). Answered by R (already known)

### I. One view or many
- I1 One view across all projects, one per project, or both? How does the owner move between them? — navigation; unknown; answered by O
- I2 Replace the Waiting screen or sit beside it? What is lost or duplicated either way? — two screens disagreeing about the same item is a trust failure; scope; unknown; answered by O / E

### J. Owner actions, and waiting shown without alarm
- J1 Does the owner act from the view, or only look and then go to the card or GitHub? — scope, keys and risk; unknown; answered by O
- J2 If the owner acts from the view, how does the action stay recorded as the owner's own and not the app's? — authority; key design. Known: GitHub App user tokens attribute actions to the user plus the app, and installation tokens attribute them to the bot (L-F10, A). Keep credentials outside the agents' reach (LIB-P-a, A). Answered by R (already known)
- J3 How do owner-waiting items stand out without looking like faults? — red-for-waiting reads as failure; design. Known: colour must not be the only signal (WCAG 1.4.1, F-wcag22-01, A; Apple, F-platform-targets-contrast-01, A). The right visual language here is unknown; answered by E
- J4 Does approving every production deploy belong in this view? — one of the main kinds of owner-waiting item; scope. Known context: DORA found no evidence that formal external change approval lowered change failures (F-change-approval-01, B). The policy itself is the owner's call; answered by O

### K. Other work on the same screens
- K1 How does the view relate to the check-status mark logged on 2026-11-04, the pull-request briefing Discovery (Q-016) and the desk follow-ups (P-001, later-work.md)? — avoids building one thing twice, or two things that conflict; sequencing; unknown (none of these were in my pack); answered by O / R

### L. Access, keys and data
- L1 What read access across private repositories is needed (contents, pull requests, Actions, deployments), and with which token type? — security. Known:
  - Fine-grained PATs can be limited to chosen repositories (L-F5, B).
  - App installation tokens last 1 hour (L-F1, A).
  - Keep user tokens server-side, and the App private key sign-only in a key vault (L-P1, B).
  - The exact permissions: unknown; answered by R
- L2 Does any record content leave the repositories (to a host cache, a push service, or a model for a digest)? — privacy; architecture; unknown; answered by O / R

### M. Reading on a small screen
- M1 What goes on the first phone screen, and what goes one step down? — layout. Known as a principle: put what is frequently needed up front, and let a tap open the matching detail (P-glance-disclosure-01, B). Not documented: what belongs on the first screen across several projects; answered by E
- M2 Touch targets, contrast, motion and status announcements — accessibility. Known: WCAG 2.2 figures (F-wcag22-01, A); Apple's and Android's figures differ (F-platform-targets-contrast-01, A). Answered by R (already known)

### N. Cost and value
- N1 How much time a day will the owner give to following the work? — sets the size of the view; unknown; answered by O
- N2 What would show it was worth it: shorter waits on owner items, fewer late finds, or less time per sitting? Can it be tried cheaply first, with a static mock or a weekly hand-made digest? — the value target; unknown; answered by E
- N3 What does it cost to build and keep, including breakage when the routing table changes? — upkeep; unknown; answered by R / E

### O. Other fields
- O1 How do CI run views, history graphs, kanban boards, and air-traffic and operations displays show one decision-maker many parallel flows, and where did they mislead, overload or get ignored? — design traps. Known cases:
  - **Milford Haven, 1994.** HSE lists "Excessive number of alarms in emergency situation reduced effectiveness of operator response" (hse.gov.uk case study, B). The figure of 275 alarms in the last 11 minutes appears only on humanfactors101.com, citing HSE (C).
  - **Air traffic (FAA, 2005).** In an FAA human-in-the-loop simulation with 12 controllers, URET and CPDLC caused no display clutter alone, but "both tools in combination made it difficult for D-side controllers to find the information they needed quickly". Source: Sollenberger et al., DOT/FAA/CT-TN04/28, Feb 2005, abstract on rosap.ntl.bts.gov. Grade B: one primary study, small sample, abstract only (the PDF did not render).
  - **President's Daily Brief, 6 Aug 2001.** The item went without follow-up: it was the 36th related item that year and was read as "historical in nature" (F-briefing-case-pdb-01, B).
  - A systematic scan of these fields: unknown; answered by R

## Owner shortlist
1. When you open the desk, what do you most want to see first: what's yours to do, what's stuck or failed, or what got done?
2. Which things should buzz your phone, and which can wait until you next look? Roughly how many buzzes a day is too many?
3. How do you notice today that something is waiting on you? Has anything sat waiting longer than it should have?
4. Do you want to act from the new view (answer, approve, merge), or only see things there and then go to the card or GitHub?
5. One view across all projects, one per project, or both?
6. Should anything new replace the Waiting screen, sit beside it, or become part of it?
7. How far back do you want to see: today, this week, or the whole life of a piece of work?
8. How many minutes a day would you spend following the work, and what result would make a new view worth having?

## Research shortlist
1. Which record carries each event kind in an agent pipeline run by an orchestrating script (GitHub objects, repository files, the dispatch log)? Who writes each, with what timestamp, and which events are missing, ambiguous or reconstructed?
   - Decision: whether a view can be built from records alone, and which records must be added first.
   - What each answer would change: complete records allow a records-only build; gaps become requests to change what the Orchestrator writes.
   - Topics: monitoring, change-reporting, agents. Depth: 2.
2. How do operations, CI and workflow-board practice decide what interrupts a single supervisor and what can wait, and what overload, misleading-display and ignored-display failures are recorded?
   - Decision: the interruption rule and the first-screen layout.
   - What each answer would change: the push budget and the first-screen content.
   - Topics: monitoring, dashboards. Depth: 3.
3. How do status and history views show their as-of time, where each item came from, and steps that were not recorded, and how do readers detect a stale or wrong view?
   - Decision: trust and freshness design.
   - What each answer would change: how gaps, provenance and as-of time are shown.
   - Topics: dashboards, monitoring. Depth: 3.
4. What are the options for a closed event vocabulary, open labels or free text in audit logs, CI and incident tools, and what does each gain or lose for filtering, counting and change over time?
   - Decision: the event data model.
   - What each answer would change: the schema and who owns it.
   - Topics: change-reporting, monitoring. Depth: 2.
5. What read-only access does a cross-repository status view on GitHub need (permissions per endpoint, webhooks versus polling, latency, retention of runs, notifications and events), and what data leaves the repositories under each option?
   - Decision: architecture and keys.
   - What each answer would change: the token type, hosting, and whether a cache or push service is acceptable.
   - Topics: agents, monitoring. Depth: 2.

Suggested experiments:
- **E1.** Count events per day, per kind, across all projects for two weeks, and measure how long owner-waiting items wait.
- **E2.** Rebuild one finished piece of work end to end from its records alone, and list what can't be rebuilt. Include whether runs older than the retention period still resolve.
- **E3.** For a week, give the owner a static mock or a hand-made digest beside the Waiting screen, then compare time-to-answer and items found late.

## Design traps to avoid
- Building the history from GitHub's activity feed. It keeps 30 days and at most 300 events, and lags up to 6 h (E5).
- Pushing every event to the phone. Repeats and low signal-to-noise drive overrides, and floods swamp operators (C1, C2, O1).
- Showing reconstructed steps (local branches, filed verdicts, grouped sessions) as if they were observed (E2, E3).
- Colour-only states, or red for "waiting on you", which makes waiting look like a fault (J3).
- Treating agent-written status like Orchestrator-written status. Self-reports skew optimistic, and readers grow complacent (F1, F2).
- No as-of time, or a silent stop of the Orchestrator or the view that reads as "nothing waiting" (F3, G2).
- Sending a model-written digest of many sources unchecked. Errors rise with length and with the number of sources (F4).
- Two screens disagreeing about the same item (I2).
- Links to Actions runs, checks and statuses that expire with the retention period (90 days by default) (E4).
- Adding tools or panels that are fine alone but clutter the display together (O1, the FAA case).
- A role-by-work table that is mostly empty cells on a phone (H3, M1).
- An event vocabulary owned by the view that silently drifts from the routing table (D4).
- Measuring value by how often the view is opened rather than by shorter waits or fewer late finds (N2).

## Gaps found in existing questions or plans
- Q-022: it does not ask who watches the watcher, that is, how the owner learns that the Orchestrator or the view has stopped (F3).
- Q-022: it does not ask what piles up while the owner is away for days, or how the view summarises the backlog on their return.
- Q-022: it does not ask what GitHub already sends, and to whom. Workflow-run notifications go to whoever triggered the run, and CI activity is a separate opt-in. Whether these reach the owner depends on whose identity the Orchestrator runs under, which is unknown (A4).
- Q-022: it does not ask how links stay valid once GitHub's retention runs out, now that the 1 Oct 2026 change applies retention to runs, checks and statuses (E4).

## Proposed library entries (for the Source checker)
- **F (fact):** The GitHub Events API timeline includes up to 300 events, only from the past 30 days. The API is "not built to serve real-time use cases", and latency "can be anywhere from 30s to 6h".
  - Sources: https://docs.github.com/en/rest/activity/events ; https://docs.github.com/en/enterprise-server@3.17/rest/activity/events
  - Grade B (vendor pages, not independent; summarising fetch). Shelf life 6 months. Topics: github, monitoring.
- **F (fact):** GitHub notifications not marked Saved are kept 3 months; Saved ones are kept indefinitely. "CI activity, such as the status of workflows" is a subscription option separate from "All activity in a repository". Workflow-run notifications go to the user who triggered the run; for scheduled workflows they go to the user who created the workflow, or who last changed its cron syntax.
  - Sources: https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications ; https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications ; https://docs.github.com/en/actions/concepts/workflows-and-actions/notifications-for-workflow-runs
  - Grade B (vendor pages). Shelf life 6 months. Topics: github, notifications.
- **F (fact):** By default, checks, workflow runs, commit statuses, artifacts and logs are kept 90 days. Settings range from 1 to 90 days for public repositories and from 1 to 400 for private ones. "Starting October 1, 2026, these policies will apply to checks, workflow runs, and commit statuses in addition to artifacts and logs. Until then, checks, workflow runs, and commit statuses are retained for 400+ days regardless of your configured retention period."
  - Source: https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization
  - Grade B (single vendor page, still in the future tense after the date). Shelf life 6 months, shortened because of the date change. Topics: github, monitoring.
- **F (fact):** The Kanban Guide (2025 edition) has four mandatory flow measures: WIP, Throughput, Work Item Age and Cycle Time. Work Item Age is "the elapsed time between when a work item started and the current date".
  - Sources: https://kanbanguides.org/english/ ; https://prokanban.org/the-kanban-guide/ (the same guide by the same authors, so a single authority)
  - Grade B. Shelf life 36 months. Topics: dashboards, monitoring.
- **F (fact):** EEMUA 191 treats less than one alarm per 10 minutes in steady state as "very likely to be acceptable", and fewer than ten alarms in the 10 minutes after a major upset as "should be manageable, but may be difficult".
  - Sources: https://humanfactors101.com/topics/alarms/ ; https://www.controlglobal.com/protect/safety-instrumented-systems/article/11382017/alarm-management-asm-alarm-management-guidelines-and-isa-182-how-do-they-stack-up-control-global
  - Grade C (two independent secondaries; the standard is paid). Shelf life 60 months. Topics: monitoring, notifications.
- **F (fact):** A common alarm-flood threshold: a flood starts when more than 10 new alarms arrive in a 10-minute period, and ends at a 10-minute period with fewer than 5. Attribution conflicts: ISA-18.2 per open-exam-prep.com; EEMUA 191 per VanCamp, Chemical Engineering, 1 Mar 2016.
  - Sources: https://open-exam-prep.com/study-guides/isa-cap/system-design-hmi-alarms-enterprise/alarm-management-isa182 ; https://www.chemengonline.com/?p=115704
  - Grade C. Shelf life 60 months. Topics: monitoring, notifications.
- **F (fact):** At Milford Haven (24 July 1994), HSE found "Excessive number of alarms in emergency situation reduced effectiveness of operator response". A secondary source, citing HSE, gives 275 alarms in the last 11 minutes before the explosion.
  - Sources: https://www.hse.gov.uk/comah/sragtech/casetexaco94.htm (B, for the finding) ; https://humanfactors101.com/topics/alarms/ (C, for the figure)
  - Shelf life 120 months. Topics: monitoring.
- **F (fact):** In an FAA human-in-the-loop simulation (12 air-traffic controllers), URET and CPDLC each caused no display clutter alone, but "both tools in combination made it difficult for D-side controllers to find the information they needed quickly".
  - Source: Sollenberger, Willems, Della Rocco, Koros, Truitt, DOT/FAA/CT-TN04/28 (Feb 2005), https://rosap.ntl.bts.gov/view/dot/71673
  - Grade B (single primary study, abstract only). Shelf life 120 months. Topics: dashboards, monitoring.
- **P (pattern):** Show each event with its record link, its author class (Orchestrator or agent) and its as-of time. Mark reconstructed steps as reconstructed. Interrupt only for new items the owner must act on, within a daily budget. Add panels only when tested together.
  - Opinion, grade C. Draws on P-stale-visible-01, P-notice-actionable-01, F-status-optimism-01, F-alert-override-01, F-supervisor-capacity-01 and the facts above.
  - This is an inference, not a finding, and it is untested for overseeing agents.

---

1. **What I changed:**
   - **Question count:** corrected to 51.
   - **CI notifications (A4):**
     - Watching a repository does not bring CI activity: GitHub lists CI activity as a separate subscription option.
     - Added that workflow-run notifications go to whoever triggered the run.
     - Removed the "5 months" retention figure.
     - Rewrote the matching gap item and library entry.
   - **Alarm figures (C2):**
     - The flood threshold is now credited to the two sources I opened, with their disagreement over attribution (ISA-18.2 or EEMUA 191) stated openly.
     - The EEMUA 191 rates now rest on two independent pages I opened. The ABB paper is gone.
   - **Endsley (B3):** now cites the Wikipedia page I opened and the paper's details. It stays at grade C.
   - **Air-traffic clutter (O1):** now cites the FAA report's abstract, which I read, with authors and report number; grade B. Added a matching design trap and library entry.
   - **Milford Haven (O1):** split into the HSE finding, which I read on HSE's own page (B), and the 275-alarm figure, which only the secondary page gives (C).
   - **Actions retention (E4):** added GitHub's 1 Oct 2026 change and shortened that entry's shelf life to 6 months.
   - **Events API (E5):** removed my earlier claim that older Enterprise Server pages said 90 days. The 3.17 page says 30 days.
   - **Single sources:** each single-source known item now says so.
   - **Experiment E2:** now also checks whether old run links still work.
2. **Why:** The source check found that seven sources did not say what I claimed. Two of my claims were simply wrong: the CI-activity one and the 90-day one. The others needed different or extra sources, a lower grade, or an open statement of their limits.
3. **What I verified (fetch and search tools only; no commands run):**
   - **GitHub notifications:**
     - The about-notifications page lists "CI activity" separately and says 3 months.
     - The configuring-notifications page says 3 months.
     - The workflow-run notifications page sends them to whoever triggered the run, or the cron author.
   - **GitHub retention:** the retention page gives the 1 Oct 2026 text quoted in E4.
   - **Events API:** the Enterprise Server 3.17 page says 30 days, 300 events, 30 s to 6 h.
   - **Alarm sources:**
     - The ISA study guide gives the >10-in-10-minutes flood definition.
     - Control Global gives the EEMUA "very likely acceptable" and "manageable" figures.
     - The Chemical Engineering article (VanCamp, 2016) credits the flood definition to EEMUA 191.
   - **Endsley:** Wikipedia gives the three levels, citing Endsley 1995a/b.
   - **FAA report:** its landing page gives the abstract quoted in O1.
   - **Kanban:** prokanban.org gives the same guide text as kanbanguides.org.
   - **Milford Haven:** HSE's case study page has the "excessive number of alarms" line but not the 275 figure.
   - **What failed:**
     - The ABB and FAA PDFs did not render, because the PDF reader isn't installed here.
     - The exida tag page had no definition.
     - Every page was read through a summarising tool.
4. **What is undone:**
   - **Single-source facts:** I found no independent second source for GitHub's own limits (Events API, retention). Only the vendor states these, so they stay at B on vendor pages alone.
   - **Kanban:** it is a single authority.
   - **Unopened sources:**
     - the full text of the FAA report
     - the HSE full report holding the 275 figure
     - Endsley 1995 itself
     - EEMUA 191 and ISA-18.2, which are paid
   - **Outside my pack:** everything that depends on records I can't see (D1, E1, G3, K1).
5. **Needed outside my lane:**
   - **Source checker:** re-check the revised entries, ideally reading raw page text, since we both used the same summarising tool.
   - **Owner decision card:** buying EEMUA 191 or ISA-18.2 would settle the attribution conflict.
   - **PDF reading:** a source checker able to read PDFs could check the FAA full text, the HSE report and the ABB paper.
   - **Experiments:** E1 to E3 need registering.
   - **Routing and dispatch log:** whoever may read ROUTING.toml and the dispatch log can answer D1, and whose identity triggers runs (A4).
6. **Open questions:**
   - **Single-authority facts:** should vendor and guide facts with a single authority (GitHub limits, the Kanban Guide) count as meeting the two-source rule, or stay below the bar for load-bearing use?
   - **2001 briefing case:** does it belong in this ground, or only in the briefing work?
   - **Watching the watcher:** should "who watches the watcher" (F3) become its own research request?

Sources:
- [GitHub Events API](https://docs.github.com/en/rest/activity/events)
- [GitHub Events API, Enterprise Server 3.17](https://docs.github.com/en/enterprise-server@3.17/rest/activity/events)
- [GitHub: about notifications](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications)
- [GitHub: configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications)
- [GitHub: notifications for workflow runs](https://docs.github.com/en/actions/concepts/workflows-and-actions/notifications-for-workflow-runs)
- [GitHub Actions retention](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization)
- [Kanban Guide (kanbanguides.org)](https://kanbanguides.org/english/)
- [Kanban Guide (prokanban.org)](https://prokanban.org/the-kanban-guide/)
- [Human Factors 101: alarms](https://humanfactors101.com/topics/alarms/)
- [Control Global: ASM guidelines and ISA-18.2](https://www.controlglobal.com/protect/safety-instrumented-systems/article/11382017/alarm-management-asm-alarm-management-guidelines-and-isa-182-how-do-they-stack-up-control-global)
- [ISA-18.2 study guide](https://open-exam-prep.com/study-guides/isa-cap/system-design-hmi-alarms-enterprise/alarm-management-isa182)
- [VanCamp, Alarm Management by the Numbers](https://www.chemengonline.com/?p=115704)
- [HSE: Texaco Milford Haven case study](https://www.hse.gov.uk/comah/sragtech/casetexaco94.htm)
- [FAA DOT/FAA/CT-TN04/28 (abstract)](https://rosap.ntl.bts.gov/view/dot/71673)
- [Wikipedia: Situation awareness](https://en.wikipedia.org/wiki/Situation_awareness)
- [Endsley 1995 bibliographic record](https://citedrive.com/en/discovery/toward-a-theory-of-situation-awareness-in-dynamic-systems)