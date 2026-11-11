I wrote the groundwork map for Q-022; it's below, ready for the Orchestrator to record verbatim. It has 47 questions in 15 areas, 8 owner questions, 5 research questions, 3 suggested experiments, 12 design traps and 7 proposed library entries. The most useful new finding: GitHub's own event feed keeps only 30 days and can lag up to 6 hours, so it can't be the source for a history view.

---

# Groundwork map — Q-022 — how one overseer follows many parallel pieces of delegated work, and sees which steps wait on them — 2026-11-11

This is a map of questions, not graded fact.

*Known items cite a library entry or a source and carry a grade. Only known items are graded. "Assumed" means the research question states it but I could not see the record. Project plans, docs/PROJECT.md and docs/handover/ are outside my pack (D-055).*

## Questions an expert would ask

### A. Today's practice and the do-nothing baseline
- A1 How does the owner find out today that something waits on them: opening the desk, GitHub notifications or GitHub Mobile pushes, or none of these? — the baseline cost; it decides whether anything new is needed; unknown; answered by O
- A2 How long does an owner-waiting item sit before the owner acts, and how often is one found late? — the main measure of value; it sets the value target; unknown (the dispatch log and decisions/ timestamps could measure it); answered by E
- A3 What does the Waiting screen show today, and how often is it opened? — the baseline; replace or sit beside; assumed (as the question describes it); answered by O / E
- A4 Which GitHub pushes can reach the owner's phone today? — GitHub may already cover part of the need; scope; known: GitHub Mobile can push for direct mentions, assignments, review requests and deployment approvals, each switched on separately, with a Working Hours schedule (F-gh-11, A). Watched repositories also notify on "CI activity, such as the status of workflows" (docs.github.com about-notifications, B). Unsaved inbox notifications are kept 3 months on the current page; older search snippets said 5 months (B, retention figure in conflict). Answered by R (already known)
- A5 What does doing nothing leave unsolved? Orchestrator events (stalls, budget pauses, failure cards), research and phase gates have no GitHub notification. — the gap any new view must fill; scope; assumed from the setup; answered by E (map events to records, see E1)

### B. What the owner needs to know, and when
- B1 When the owner opens the view, what is the first question to answer: what is mine to do, what is stuck or failed, or what got done? — first-screen priority; layout; unknown; answered by O
- B2 For each piece of work: where it is, who holds it, what it waits on, what failed and why. Which of these does the owner use, and which are just nice to have? — keeps the view small; scope; unknown; answered by O
- B3 What do people supervising several automated agents need in order to keep track? — the evidence base; design; known in part: modelled single-operator capacity fell by up to 67% once reorientation and loss of situation awareness were counted, and by 36% even under management-by-exception (F-supervisor-capacity-01, B). Situation awareness is usually framed as three levels: perception, comprehension, projection (Endsley 1995, via secondary summaries, C). Answered by R
- B4 Should the view show how long each item has been in its current state (age), not just its state? — ageing catches stuck work; design; known: the Kanban Guide makes WIP, Throughput, Work Item Age and Cycle Time mandatory, with Work Item Age defined as "The elapsed time between when a work item started and the current date" (kanbanguides.org, B, single authoritative source, read through a summarising fetch). Answered by R

### C. What interrupts and what waits
- C1 Which events justify interrupting the owner on the phone? — interruption budget; notification scope; known as a principle: interrupt only for things that are new and need action (P-notice-actionable-01, B). Repeated reminders lowered acceptance by 10% per 5-point rise in the share of repeats (F-alert-repeat-01, B). Overrides of 49–96% were mostly driven by low signal-to-noise (F-alert-override-01, B). Which events qualify here: unknown, answered by O
- C2 Is there a ceiling on interruptions per day? — avoids an alarm flood; sets the threshold; known from operations: EEMUA 191 says steady-state operation should average no more than one alarm every ten minutes, and fewer than ten alarms in the first ten minutes after a major upset (humanfactors101.com, secondary; the standard itself is paid, C). ISA-18.2 treats more than 10 alarms in 10 minutes as a flood (secondary summaries, C). These figures are for a full-time control-room operator, not a part-time owner; the owner's own ceiling is unknown. Answered by O / E
- C3 Should pushes be batched into a digest at set times rather than sent as they happen? — digest or live; design; known: phone notifications batched three times a day improved self-reported attention and stress against controls, and no notifications at all raised anxiety (F-batch-notify-01, B; wellbeing outcomes only). Answered by O / E
- C4 Can a superseded notice be replaced instead of piling up? — prevents repeats; mechanism; known: a Web Push Topic header replaces an undelivered message with the same topic (F-webpush-02b, A). On iOS, push works only for Home Screen web apps from 16.4 (F-webpush-01, A), and every push must be shown to the user (F-webpush-04, A). Answered by R (already known)

### D. Which events matter, and how they are classified
- D1 What is the full set of event kinds across a piece of work, including dispatches, returns, pass, fail, third-fail to Triage, retries, budget and usage-limit pauses, malformed returns, failure cards, cards raised and answered, gates, research memos, merges and deploys? — the base of any history or pipeline view; scope; unknown (governance/ROUTING.toml and the dispatch log were not in my pack); answered by R / E
- D2 Classify events as a fixed closed set, open labels, free text or none? — filtering and counting need a closed set; open labels drift; data model; unknown; answered by R
- D3 Do events with no GitHub equivalent (gates, cards, research, stops) fit the same scheme as GitHub events, or need their own? — one scheme or two; data model; unknown; answered by R / E
- D4 Who owns the event vocabulary: the Orchestrator's routing table or the view? — changes to routing must not silently break the view; data model; unknown; answered by O / R

### E. Reading events from the records
- E1 For each event kind, which record carries it, with what timestamp, and who wrote it? — whether the view can be built from records alone; feasibility; unknown; answered by E (rebuild one finished piece of work end to end from its records)
- E2 How should reconstructed or indirect steps be shown? These are local builder branches seen only through merge commits, verdicts filed by the Orchestrator for reviewers, and steps grouped by session. — avoids showing guesses as fact; design; unknown; answered by R / E
- E3 How does the view show that something is not recorded, without guessing? — honesty of the view; design; known as a principle: "Inaccurate system-status messages for empty states are particularly harmful" (P-stale-visible-01, B). Unknown for a timeline; answered by R
- E4 How does a reader go from an event to the record behind it, and do those links last? — traceability; link design; known: GitHub keeps checks, workflow runs, commit statuses, artifacts and logs for 90 days by default (private repositories can be set from 1 to 400 days) (docs.github.com Actions retention, B). Links to runs older than that will die. Answered by R (already known)
- E5 Can GitHub's activity feed serve as the history source? — a common shortcut; architecture; known: no. The Events API returns only events from the past 30 days, up to 300 per timeline, is "not built to serve real-time use cases", and its latency "can be anywhere from 30s to 6h" (docs.github.com/en/rest/activity/events, B; older Enterprise Server pages said 90 days, so this has changed). Answered by R (already known)

### F. Trust
- F1 Which records are written by the Orchestrator and which by the agents themselves, and should the view mark the difference? — self-reports can be optimistic; design; known in part: optimistic bias degraded reporting quality among 561 project managers (F-status-optimism-01, B). On GitHub, App installation tokens attribute activity to the app's bot account (L-F1, A; L-F10, A). Whether that separates the Orchestrator from the agents here: unknown, answered by R / E
- F2 How would the owner notice that the view is wrong or stale? — a wrong view that is trusted is worse than none; checks; known: automation complacency under multi-task load "cannot be prevented by training or instructions" (F-automation-complacency-01, B). Unknown for this view; answered by R / E
- F3 Who tells the owner if the Orchestrator itself, or the view, has stopped? — a silent stop looks like "nothing waiting"; heartbeat or dead-man signal; unknown; answered by O / R
- F4 If a digest or briefing is written by a model, how is it checked? — accuracy; whether summaries are allowed; known: summary errors rise with length and with the number of sources (F-sum-long-multi-01, B). Automatic faithfulness checkers are weak on hard cases (F-sum-detectors-weak-01, A). Check with a party other than the author, with the source passages at hand (P-sum-independent-grounded-check-01, C). An "AI-generated" label lowers perceived accuracy (F-trust-ai-label-01, B). Answered by R (already known)
- F5 What does the owner rely on the view for: deciding, or only reminding? — sets how strictly accuracy is checked; unknown; answered by O

### G. Freshness
- G1 How current must the view be: live, minutes, or once at each sitting? — architecture and cost; unknown; answered by O
- G2 How does the reader see the as-of time, and how do half-finished states show? — trust; design; known: show when data was last updated if people may check more often than it updates, and don't hide stale data behind placeholders (P-stale-visible-01, B). Not documented: fading stale data. Answered by R (already known)
- G3 What delays come from the likely mechanisms? — sets honest freshness claims; known, if those mechanisms are used: Actions schedules run at most every 5 minutes and can be delayed or dropped at the start of the hour (F-gh-12, A; F-gh-12b, A). Workers KV writes can take up to 60 s to be seen elsewhere (F-cf-kv-01, A). Which mechanism the desk uses: unknown; answered by R
- G4 Does auto-updating on screen need a pause control? — accessibility; known: WCAG 2.2.2 requires one unless the updating is essential; whether a status screen counts as essential is not documented (F-wcag22-01, A); answered by R (already known)

### H. Volume, reach and readability
- H1 How many events arrive per day across all projects, and how many are owner-waiting? — density, grouping, interruption budget; unknown; answered by E (count from the dispatch log and GitHub over two weeks)
- H2 How far back should the view reach, and when does finished work age out? — scope and storage; unknown; answered by O
- H3 Which groupings stay readable: by project, piece of work, branch, milestone, agent role or state? Which is the default? — layout; unknown; answered by O / E
- H4 Does collapsing (for example, folding retries into one line) hide failures the owner needs? — readability against loss; design; unknown; answered by E
- H5 Do GitHub read limits allow polling every project? — feasibility; known: 5,000 REST requests an hour per token, and a conditional request that returns 304 doesn't count (F-gh-01, A). Code search is limited to 10 a minute (F-gh-search-02a, A). Answered by R (already known)

### I. One view or many
- I1 One view across all projects, one per project, or both? And how does the owner move between them? — navigation; unknown; answered by O
- I2 Replace the Waiting screen or sit beside it? What is lost or duplicated? — two screens disagreeing about the same item is a trust failure; scope; unknown; answered by O / E

### J. Owner actions, and waiting shown without alarm
- J1 Does the owner act from the view, or only see and then go to the card or GitHub? — scope, keys and risk; unknown; answered by O
- J2 If the owner acts from the view, how does the action stay recorded as the owner's own and not the app's? — authority; key design; known: GitHub App user tokens attribute actions to the user plus the app, and installation tokens to the bot (L-F10, A). Keep credentials outside the agents' reach (LIB-P-a, A). Answered by R (already known)
- J3 How do owner-waiting items stand out without looking like faults? — red-for-waiting reads as failure; design; known: colour must not be the only signal (WCAG 1.4.1, F-wcag22-01, A; Apple, F-platform-targets-contrast-01, A). The right visual language here: unknown; answered by E
- J4 Does approving every production deploy belong in this view? — one of the main owner-waiting kinds; scope; known context: DORA found no evidence that formal external change approval lowered change failures (F-change-approval-01, B). The policy itself is the owner's call; answered by O

### K. Other work on the same screens
- K1 How does the view relate to the check-status mark logged on 2026-11-04, the pull-request briefing Discovery (Q-016), and the desk follow-ups (P-001, later-work.md)? — avoids building one thing twice or two things that conflict; sequencing; unknown (none of these were in my pack); answered by O / R

### L. Access, keys and data
- L1 What read access across private repositories is needed: contents, pull requests, Actions, deployments? With which token type? — security; known: fine-grained PATs can be limited to chosen repositories (L-F5, B). App installation tokens last 1 hour (L-F1, A). Keep user tokens server-side and the App private key sign-only in a key vault (L-P1, B). The exact permissions: unknown; answered by R
- L2 Does any record content leave the repositories (to a host cache, a push service, or a model for a digest)? — privacy; architecture; unknown; answered by O / R

### M. Reading on a small screen
- M1 What goes on the first phone screen, and what goes one step down? — layout; known as a principle: what is frequently needed up front, and a tap opens the matching detail (P-glance-disclosure-01, B). Not documented: what belongs on the first screen for several projects; answered by E
- M2 Touch targets, contrast, motion and status announcements — accessibility; known: WCAG 2.2 figures (F-wcag22-01, A); Apple and Android figures differ (F-platform-targets-contrast-01, A). Answered by R (already known)

### N. Cost and value
- N1 How much daily time will the owner give to following the work? — sets the size of the view; unknown; answered by O
- N2 What would show it was worth it: shorter wait on owner items, fewer late finds, less time per sitting? And can it be tried cheaply (a static mock, or a weekly hand-made digest) before building? — value target; unknown; answered by E
- N3 What does it cost to build and keep, including breakage when the routing table changes? — upkeep; unknown; answered by R / E

### O. Other fields
- O1 How do CI run views, history graphs, kanban boards, and air-traffic and operations displays show one decision-maker many parallel flows, and where did they mislead, overload or get ignored? — design traps; known cases: at Milford Haven (1994), operators faced 275 alarms in the last 11 minutes before the explosion (humanfactors101.com citing HSE, C; the primary is the HSE report). In air-traffic studies, two automation tools that were fine alone combined to clutter the display (rosap.ntl.bts.gov DOT report, seen in search only, C). The 6 Aug 2001 President's Daily Brief item went without follow-up: it was the 36th related item that year and was read as "historical in nature" (F-briefing-case-pdb-01, B). A systematic scan of the fields: unknown; answered by R

## Owner shortlist
1. When you open the desk, what do you most want to see first: what's yours to do, what's stuck or failed, or what got done?
2. Which things should buzz your phone, and which can wait until you next look? Roughly how many buzzes a day is too many?
3. How do you notice today that something is waiting on you, and has anything sat waiting longer than it should have?
4. Do you want to act from the new view (answer, approve, merge), or only see and then go to the card or GitHub?
5. One view across all projects, one per project, or both?
6. Should anything new replace the Waiting screen, sit beside it, or become part of it?
7. How far back do you want to see: today, this week, or the whole life of a piece of work?
8. How many minutes a day would you spend following the work, and what result would make a new view worth having?

## Research shortlist
1. Which record carries each event kind in an agent pipeline run by an orchestrating script (GitHub objects, repository files, the dispatch log)? Who writes each, with what timestamp, and which events are missing, ambiguous or reconstructed? — decision: whether a view can be built from records alone, and which records must be added first; what each answer would change: complete records allow a records-only build, gaps become requests to change what the Orchestrator writes; topics: monitoring, change-reporting, agents; depth: 2
2. How do operations, CI and workflow-board practice decide what interrupts a single supervisor and what waits, and what overload, misleading and ignored-display failures are recorded? — decision: the interruption rule and the first-screen layout; what each answer would change: the push budget and the first-screen content; topics: monitoring, dashboards; depth: 3
3. How do status and history views show their as-of time, where each item came from, and steps that were not recorded, and how do readers detect a stale or wrong view? — decision: trust and freshness design; what each answer would change: how gaps, provenance and as-of time are shown; topics: dashboards, monitoring; depth: 3
4. What are the options for a closed event vocabulary, open labels or free text in audit logs, CI and incident tools, and what does each gain or lose for filtering, counting and change over time? — decision: the event data model; what each answer would change: the schema and its owner; topics: change-reporting, monitoring; depth: 2
5. What read-only access does a cross-repository status view on GitHub need (permissions per endpoint, webhooks versus polling, latency, retention of runs, notifications and events), and what data leaves the repositories under each option? — decision: architecture and keys; what each answer would change: token type, hosting, and whether a cache or push service is acceptable; topics: agents, monitoring; depth: 2

Suggested experiments:
- **E1.** Count events per day per kind across all projects for two weeks, and measure how long owner-waiting items wait.
- **E2.** Rebuild one finished piece of work end to end from its records alone, and list what can't be rebuilt.
- **E3.** For a week, give the owner a static mock or a hand-made digest beside the Waiting screen, then compare time-to-answer and items found late.

## Design traps to avoid
- Building the history from GitHub's activity feed. It keeps 30 days and at most 300 events, and lags up to 6 h (E5).
- Pushing every event to the phone. Repeats and low signal-to-noise drive overrides, and floods swamp operators (C1, C2, O1).
- Showing reconstructed steps (local branches, filed verdicts, grouped sessions) as if they were observed (E2, E3).
- Colour-only states, or red for "waiting on you", which makes waiting look like a fault (J3).
- Treating agent-written status like Orchestrator-written status. Self-reports skew optimistic, and readers grow complacent (F1, F2).
- No as-of time, or a silent stop of the Orchestrator or the view that reads as "nothing waiting" (F3, G2).
- A model-written digest of many sources sent unchecked. Errors rise with length and source count (F4).
- Two screens disagreeing about the same item (I2).
- Links to Actions runs that expire after 90 days (E4).
- A role-by-work table that is mostly empty cells on a phone (H3, M1).
- An event vocabulary owned by the view that silently drifts from the routing table (D4).
- Measuring value by how often the view is opened rather than by shorter waits or fewer late finds (N2).

## Gaps found in existing questions or plans
- Q-022: it does not ask who watches the watcher, that is, how the owner learns the Orchestrator or the view has stopped (F3).
- Q-022: it does not ask what piles up while the owner is away for days, or how the view summarises a return after an absence.
- Q-022: it does not ask about the noise GitHub already sends. Watched repositories notify on CI activity, so GitHub may already be adding to the problem (A4).
- Q-022: it does not ask how links stay valid once GitHub's retention runs out (E4).

## Proposed library entries (for the Source checker)
- **F (fact):** GitHub Events API keeps only events from the past 30 days, up to 300 per timeline; "not built to serve real-time use cases"; latency "30s to 6h". Source: https://docs.github.com/en/rest/activity/events. Grade B (single vendor page, read through a summarising fetch; older Enterprise Server pages say 90 days). Shelf life 6 months. Topics: github, monitoring.
- **F (fact):** GitHub notifications not marked Saved are kept 3 months; Saved ones are kept indefinitely; watched repositories notify on "CI activity, such as the status of workflows". Source: https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications. Grade B. Conflict: search snippets of the configuring-notifications pages said 5 months, and that page was not opened. Shelf life 6 months. Topics: github, notifications.
- **F (fact):** By default, Actions checks, workflow runs, commit statuses, artifacts and logs are kept 90 days; private repositories can be set from 1 to 400 days, public from 1 to 90. Source: https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization. Grade B. Shelf life 12 months. Topics: github, monitoring.
- **F (fact):** The Kanban Guide's four mandatory flow metrics are WIP, Throughput, Work Item Age and Cycle Time; Work Item Age is "The elapsed time between when a work item started and the current date". Source: https://kanbanguides.org/english/. Grade B (summarising fetch). Shelf life 36 months. Topics: dashboards, monitoring.
- **F (fact):** EEMUA 191 guidance: in steady state, average no more than one alarm every ten minutes; fewer than ten in the first ten minutes after a major upset. Sources: https://humanfactors101.com/topics/alarms/ and https://library.e.abb.com/public/72f20c70c7b44d889d463db81df5c38d/SCADA%20Alarm%20Management%20White%20Paper.pdf (ABB seen in search only). Grade C (secondary; the standard is paid). Shelf life 60 months. Topics: monitoring, notifications.
- **F (fact):** Milford Haven 1994: operators had to deal with 275 alarms in the 11 minutes before the explosion. Source: https://humanfactors101.com/topics/alarms/ (citing HSE). Grade C until the HSE report is read. Shelf life 120 months. Topics: monitoring.
- **P (pattern):** Opinion, grade C. Show each event with its record link, author class (Orchestrator or agent) and as-of time. Mark reconstructed steps as reconstructed. Interrupt only for new owner-actionable items within a daily budget. Draws on P-stale-visible-01, P-notice-actionable-01, F-status-optimism-01, F-alert-override-01, F-supervisor-capacity-01 and the facts above; it is an inference, not a finding, and is untested for overseeing agents.

---

1. **What I changed:** Nothing on disk; I have no write tool. The map above is the whole output.
2. **Why:** Q-022 begins "Groundwork map:", so my agent file asks for a groundwork map in the research/_GROUNDWORK.md form rather than a memo.
3. **What I verified:**
   - I read research/Q-022.md, research/_GROUNDWORK.md and the library entries that share its topics.
   - I fetched four pages: GitHub Events API, GitHub notifications, Actions retention and the Kanban Guide. I also read humanfactors101.com on alarms.
   - I ran searches for ISA-18.2, EEMUA 191, air-traffic display clutter and Endsley.
   - All fetches went through a summarising tool, not raw pages. I didn't mark any of my own facts as checked.
4. **What is undone:** Everything that depends on records outside my pack:
   - which records carry which event (D1, E1)
   - how the desk is hosted (G3)
   - the Q-016, P-001 and later-work contents (K1)
   - the ABB and DOT reports, read in search results only
   - the HSE primary report on Milford Haven
5. **Needed outside my lane:**
   - The Source checker should check the 7 proposed entries, especially the 3-month versus 5-month conflict on GitHub notification retention.
   - Reading the primary EEMUA 191 or ISA-18.2 text means buying them, so it needs a decision card to the owner.
   - E1 to E3 would need to be registered as experiments.
   - Whoever may read ROUTING.toml and the dispatch log format can answer D1 directly.
6. **Open questions:**
   - Does the 2001 briefing case belong in this ground, or only in the briefing work?
   - Should "who watches the watcher" (F3) be its own research request?

Sources:
- [GitHub Events API](https://docs.github.com/en/rest/activity/events)
- [GitHub notifications](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications)
- [GitHub configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications)
- [GitHub Actions retention](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization)
- [Kanban Guide](https://kanbanguides.org/english/)
- [Human Factors 101: alarms](https://humanfactors101.com/topics/alarms/)
- [ABB SCADA alarm management white paper](https://library.e.abb.com/public/72f20c70c7b44d889d463db81df5c38d/SCADA%20Alarm%20Management%20White%20Paper.pdf)
- [ISA-18.2 study guide (secondary)](https://open-exam-prep.com/study-guides/isa-cap/system-design-hmi-alarms-enterprise/alarm-management-isa182)
- [DOT/FAA air-traffic display report](https://rosap.ntl.bts.gov/view/dot/71673/dot_71673_DS1.pdf)
- [Situation awareness (secondary)](https://EN.wikipedia.com/wiki/Situation_awareness)