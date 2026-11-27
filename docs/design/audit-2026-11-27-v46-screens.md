*By the Design reviewer, on the model the owner named, at the owner's request (decisions/questions/P-005-design-round-8.md, answer 33): an advisory review of mockup v46 (docs/design/mockups/timeline-v46-craft.html) for screens or pages the desk lacks. No verdict was asked for. Recorded verbatim by the orchestrator, session session_01QBwHGLabYiZK6jrjfzcfBm; its screenshots stayed outside the repository. The Chief of Staff opened its screenshot of a quiet project and saw the "undefined" tags it reports.*

ADVISORY REVIEW OF MOCKUP v46: WHAT OTHER SCREENS WOULD EARN A PLACE (no verdict)

1. IN PLAIN ENGLISH

Mockup v46 does two things well: home tells the owner what needs them, in order, and a project's page lets them read what happened and why, down to each step. Almost everything else on the phone is missing or a leftover. Four of the bar's controls lead nowhere or to an old sheet (Plan, Needs you, the bell on home, More). Three of the five projects open in an older layout that prints the word "undefined" on every row. The sheets name their records as file paths that cannot be tapped, so the owner cannot read the gate case, the stop card, the memo or a handover from the phone. No screen shows what the owner has already ruled, what is planned next across projects, the list of AI sessions, or usage and spend. The highest-stakes moment, a gate that is open for the owner's ruling, is not drawn: v46 shows only a gate that passed and one not yet reached. Nothing shows what the desk looks like in the minutes after the owner answers.

2. INVENTORY OF v46 (rendered at 393×852, light, Playwright and Chromium; no console errors)

Home
- Title band, live label, condensing bar: works.
- "?" (words and who does the work): works. A sheet with the glossary, the AI cast and session names.
- Magnifier: placeholder. The field opens and takes text; typing and Enter change nothing; Cancel closes it.
- Bell: dead end on home. Its code scrolls to a ".needs" block that no longer exists. On a project's page it goes back to home.
- More: placeholder. Holds only "Mockup only: preview the feed" (Live, Late, Stopped) and Close. The Late and Stopped banners themselves work and are the only error states drawn.
- Priority list (2 rows): works. The row and "Decide what's next" open the choices sheet; "Show on timeline" opens the project at the event.
- Projects list, phase series, wait on the line: works. "Nothing waits on you in operating model, Model-Lab, portfolio" unfolds three rows.
- "About this mockup": works (notes).

Tab bar
- Desk: works (home, or scroll to top).
- Plan: dead end. Disabled on home. On a project's page it is lit as the current tab and a tap does nothing, so the mockup treats a project's page as "Plan".
- Needs you: leftover. It opens an older-style sheet for the first waiting thing only ("S-011 failed three plan reviews", Around it, Record, "Open on GitHub"), not the v44 choices sheet and not a list. On home it shows the stop, though the list's first row is the widget.
- Round button: works on a planned project (tap lands on Now; hold opens the Context view, with real session links). Hidden on home.

A project's page (The timeline, Home-screen widget)
- Back, project pill (menu of projects), phase pill (phases and gates): work.
- The count on the project pill: works (the "Waiting on you" sheet with "Go to it").
- Summary line and "About this project": works. No links in it.
- Map card, filter (six cuts, branch switches), fold handle, milestone chip: work.
- List: phases, milestones, sprints, events fold and open: works.
- Why bubble, Needs bubble, "Needed by": work.
- Session tag bubble: works. "Open in Claude" and "The run on GitHub" are the only real links I found outside the Context view.
- "At work now" row and sheet: works. Records as plain text.
- Stop sheet (5 choices) and Readiness card sheet (2 choices): work as examples. A tap on a choice adds one line, "The mockup sends nothing"; nothing shows what follows.
- Gate sheets (Design gate, passed; Build gate, not reached): work. Records as plain text. No gate is shown open.
- Decision sheet: placeholder ("an example: no record yet") on the planned decision I opened.
- Research level and memo sheet (Q-028): works. Records as plain text; the memo itself cannot be read.

Quiet projects (operating model, Model-Lab, portfolio)
- Fault. They open in an older layout: a large title, project chips, "No plan on record for this project in the mockup", a MAIN / BRANCH list, and "undefined" in every row's state tag. No map card, no pills, no summary line.

Not present anywhere: settings, notification history, spend, ledger, sessions list, handover text, any answered-rulings list, first run, a signed-out or can't-read state for one project.

3. CANDIDATE SCREENS, RANKED BY BENEFIT

1. Needs you (the tab): everything that waits, and what you ruled
- Job: "What is mine, in every project, and what did I already decide?" Home shows the ranked list; this tab is the full inbox and its history.
- Shows: Waiting (the same rows as home, with a switch to group by project); "Sent, being recorded" (an answer tapped but not yet confirmed); "Kicked back" (not confirmed after about 5 minutes); "With the AI team: n" as one quiet line; Answered (last 24 hours open, older folded), each row saying what was ruled in words, with the code after it.
- Lives: the third tab, with its badge.
- Serves: R8 answers 24 and 26; P-001-home-tab.md (Waiting tab with a badge); P-001-board-bounce.md, P-001-board-done-keep.md, P-001-board-after-agents.md, P-001-domain-review-count.md; P-001-trial-view-notes-1.md ("Done today" rows in words); P-001-design-discovery.md answer 6.
- For the owner to settle, not for me: answer 4 of P-001-design-discovery.md ("bucketed by project") was set aside for home by R8 answer 24; whether this tab offers the by-project view. Also whether P-005's desk keeps the board's three lanes (P-001-board-layout.md) or this list replaces them.
- Records: status/*.toml, queue/ (49 files), decisions/questions/ exist. New: an answer started from the desk (records request item 6; P-005-acting.md A finishes it on GitHub), one kind and name per waiting thing (item 14).
- Also missing inside it: sheets for the other kinds of ask. v46 draws a stop, a readiness card and a gate; I found no sheet for a question (each with its own answer box, trial-view-notes-1 note 15), a pull request to merge, a deploy to approve (P-001-notify-deploys.md) or "Start the next session" (R8 answer 28).
- Size: large.

2. A gate open for your ruling, and a reader for any record
- Job: "Let me read the case and rule", and, everywhere else, "let me read the thing this sheet cites".
- Shows: the gate sheet in its open state: the ask in one paragraph, the case's opening (three lines, faded, whole case one tap away), the Critic's view, the user representative's verdict, each choice saying what follows, "Can't be undone" on the one that can't. The reader: one plain page for a record's text (gate case, stop card, memo, ruling, handover), its opening paragraph first, with "Open on GitHub".
- Lives: the gate row and the priority list; the reader from every "Records" line in every sheet.
- Serves: domain pack part B item 33 and P-001-gate-card.md, P-001-gate-buttons.md; P-001-design-lab-open.md (the gate document linked); R8 answer 11 ("hand someone my phone"); AGENTS.md §4 Plain English first (every such record already opens with the paragraph).
- Records: all exist (docs/gates/, decisions/, research/ 77 files, docs/handoff/ 80 files). New: addresses below the project (item 5).
- Size: medium (gate state), small (reader, one template).

3. A project with no plan, and the empty and can't-read states
- Job: "Is this project really quiet, or can the desk not see it?"
- Shows: the same page shell as a planned project (pills, summary line, a plain list of events) for a project with no phases on record; home with nothing waiting; a project being read ("Checking…") or unreadable ("Can't read since 9:14 am"); the first open with no last-looked time.
- Lives: the existing pages.
- Serves: the domain pack's "Every project, not only Service-Desk" (owner-request-2026-10-19-scope.md); checklist items 4 and 5; part B item 30 (not used, not recorded, no record told apart); S-001 AC4 and AC5. It also removes the "undefined" fault.
- Records: exist. Nothing new.
- Size: medium.

4. Plan (the tab): what is next across projects
- Job: "What is coming, in what order, and roughly when?"
- Shows: per project, the milestones ahead in the owner's order, each with the Chief of Staff's rough estimate and a rough finish "labelled an expectation, never a deadline"; the next gate that will be the owner's; "Not milestones yet" at the foot; a way to ask for a change of order.
- Lives: the second tab.
- Serves: P-001-m3a-date.md, -finish.md, -order.md, -picks.md, -done-when.md, -estimator.md; P-001-spend-and-planning.md question 2; P-001-usage-and-context.md ("important for me to see timelines"); P-001-design-discovery.md answer 2.
- For the owner: is Plan this cross-project page, or the project's own page as v46's lit tab implies? And its reading order (pack conflict 10 is still open; the timeline list reads top down by R7 answer 8).
- Records: status/plan.json and the current desk's src/public/lib/workahead.js exist. New: milestone and sprint start times (item 1).
- Size: medium.

5. Sessions and handovers
- Job: "Which AI sessions are or were at work, which one must hand over, and where do I start the next one?"
- Shows: per project, sessions newest first: plain name, role, at work or ended, since when, context use, "Handover needed" with why, helpers and tokens, "Open in Claude"; an ended session's handover opens in the reader, with "Start the next session".
- Lives: from the "At work now" sheet ("All sessions") and the About sheet; not a tab.
- Serves: R8 answer 28; R7 answers 2 and 4; P-001-usage-and-context.md B; P-001-design-discovery.md answers 5 and 8. The mockup's own portfolio data carries "log the idea of a listing of every session" (PR #13).
- Touches, for the owner: P-001-cos-sessions-on-desk.md (Chief of Staff's sessions on the Team screen only) and pack conflict 8 (Team's screen is unsettled). TIMELINE-CURRENT.md says options-sessions drew a Sessions list in round 7 and tags were built; I did not read round 7, so ask before treating the list as wanted.
- Records: sessions/chief-of-staff/ (50 files), docs/handoff/ exist. New: names, context use, handover flags (items 9, 15), the run at work now (item 7).
- Size: medium.

6. The bell: what changed since you looked
- Job: "What happened while I was away, that I do not have to act on?"
- Shows: a short feed across projects since the last look, grouped by project, each entry two lines with a tap through; the notifications sent; "Mark as seen".
- Lives: the bell. Needs you keeps the actions, so the two do not overlap.
- Serves: P-001-design-discovery.md answer 8; R8 answer 12 item 6 ("9 new" today has nowhere to go); P-001-glance-since.md; part B item 28.
- Records: events exist. New: when the owner last looked (item 8); no record of notifications sent that I found.
- Size: medium.

7. More: settings and usage
- Job: "Turn notifications on; see what the work is using."
- Shows: the notifications switch (permission asked after a tap), the Actions usage bar, tokens per project where recorded, the spend ceiling and its 80% alert once a spend record exists, the glossary, the mockup notes.
- Lives: the More menu, replacing the feed preview.
- Serves: P-001-notifications.md; P-001-notify-more-detail.md and pack conflict 11 (these two have no home in the new design); P-001-usage-and-context.md B; AGENTS.md spend_ceiling; P-001-spend-and-planning.md question 1 (spend only once recorded); P-001-design-lab-1.md ("Absolutely no fake numbers").
- Records: helpers' tokens exist (174 of 184 lines). New: sessions' own tokens, runs' tokens (items 9, 10), any spend record. Time zone is ruled (Chicago) and the theme follows the phone, so neither needs a setting.
- Size: small now; the spend part waits on records.

8. Search results
- Job: "Find that ruling, event or project by a word."
- Shows: results grouped as waiting, projects, events, rulings, each opening its place.
- Lives: the magnifier, which already opens.
- Serves: R8 answers 16 and 19 (search kept as a magnifier).
- Records: exist; needs addresses (item 5).
- Size: small to medium.

Dropped, and why
- Ledger or decisions browser: 746 lines of coded entries read as the "live database" the owner asked to avoid (owner-request-2026-10-19-design-steward.md). The Answered list (1) and the reader (2) cover its use.
- Research library page: 157 fact files; same reason. Research already has its level and sheet; search can reach the rest.
- Cross-project dashboard: home is that. Usage goes in 7.
- Separate activity feed: it is the bell (6).
- Rulebook page: the glossary sheet works; add words to it.
- Project settings page: "About this project" exists; add who is at work and usage there. I found no project setting the owner changes from the phone.
- Onboarding: one owner; the empty states (3) and the notification step (7) are enough.
- Separate handover reader and gate case page: both are the one reader (2).

4. ORDER FOR THE NEXT DESIGN SESSION

1. Needs you tab: the tab is in the bar today and opens a leftover; it is the desk's stated job.
2. Gate open for ruling, with the record reader: the highest-stakes action is undrawn, and every sheet's records become readable with one template.
3. No-plan project and can't-read states: three of five projects show a broken page today.
4. Plan tab: the second dead tab; its rulings already exist.
5. Sessions and handovers: the owner asked for names and flags (R8 answer 28); needs the Team question put first.
6. The bell and More: small, and they clear the last two dead controls.

WHAT I DID NOT CHECK
- Dark mode, 360 and 414 widths, reduced motion, a real phone or the Claude app; this was one pass at 393×852 light.
- The element library artifact and the published v46 artifact; I rendered the repository file only.
- An answered decision's sheet, a milestone's sheet, the dotted glossary words in the list, and the Home-screen widget's page beyond its landing and About sheet.
- Rounds 2 to 7 of P-005, docs/PROJECT.md in full, OPERATING_MODEL.md, the inventory of 2026-10-19 and the round 8 record beyond its answer lines; citations to those come from TIMELINE-CURRENT.md and the domain pack.
- Whether the real desk already sends or logs notifications in a form the bell could read.

FILES
- Mockup: /home/user/Service-Desk/docs/design/mockups/timeline-v46-craft.html (tab handlers at lines 3560 to 3571, 3670 to 3672 and 3757)
- Screenshots (outside the repository): /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/screens-review/
  - home: /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/screens-review/01-home-top.png
  - Needs-you leftover sheet: /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/screens-review/tabneeds-1.png
  - quiet project with "undefined": /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/screens-review/omshot-1.png
  - project page: /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/screens-review/proj-1.png
  - About this project: /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/screens-review/aboutshot-2.png
- No repository file was changed.
