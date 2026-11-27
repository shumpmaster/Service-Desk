*By the Design reviewer, at the owner's request (decisions/questions/P-005-design-round-8.md, answers 11 and 27): the plain-words test of mockup v43 (docs/design/mockups/timeline-v43-craft.html), played as a capable newcomer with no context handed the owner's phone. No verdict was asked for. Recorded verbatim by the orchestrator, session session_01QBwHGLabYiZK6jrjfzcfBm; its screenshots and text dumps stayed outside the repository.*

PLAIN-WORDS TEST, TIMELINE MOCKUP v43 (advisory, no verdict)

File read: /home/user/Service-Desk/docs/design/mockups/timeline-v43-craft.html, rendered with Playwright/Chromium at 393x852, light. Screenshots and innerText dumps are in /tmp/claude-0/-home-user/67d42b21-7eee-5036-b646-6a41ffe8737b/scratchpad/plainwords/ (01-home .. 81-plan-actions, .png and .txt). No repository file changed. TIMELINE-CURRENT.md was read only afterwards, to mark rulings.

Not covered: dark mode, other widths, the "Go to it" buttons, and the quiet projects' own pages (operating model, Model-Lab, portfolio) were not opened. The Plan tab is disabled on home, so it was only seen inside a project.

---------------------------------------------------------------
1. COULD THE NEWCOMER TELL WHAT IS GOING ON?
---------------------------------------------------------------

Partly. A stranger handed this phone would get the shape of things in seconds: there are a few projects, two things are waiting on the phone's owner, one has waited nine days and one under two hours, and each project moves through four phases (Discovery, Design, Build, Launch) with a decision point between them. The milestone names are the strongest writing on the page ("Every unknown has a test", "It's live"), and the Why bubbles and the plan's actions read like a person explaining. What the stranger would not get is what any of it is about. Nothing says what "The timeline" or "Home-screen widget" is for, what a "spec" is, or who the Chief of Staff, the orchestrator, Triage and the spec writer are (nothing says they are software agents rather than staff). The main question on the phone, "S-011 failed three plan reviews: what happens next?", has a code for its subject, and its answer choices are code words ("criteria-wrong", "re-specify") explained in more code ("the plan rounds reset; not a strike"). The headline of each event is the weakest text ("Stop card 5", "First draft", "Merged PR #445"), while the best text sits one tap away behind "Why".

Screen by screen:

| Screen | Verdict | Why |
|---|---|---|
| Home, opening sentence ("2 things need you, in 2 projects. Start at the top.") | clear | |
| Home, priority list | mostly | Row 1's question is plain. Row 2's is not (S-011, "plan reviews"). The small line above each ("Stop 2.2.2.10 · Stop card 5 · S-011") is all code. |
| Home, projects | mostly | Status lines are good sentences, but no line says what each project is. "Nothing at work" and "9 new" are unexplained. |
| Home, quiet projects | mostly | "The spec-number fix is released as 3.7.3", "Four pull requests merged overnight": plain grammar, unknown subjects. |
| Home, Answer sheet | lost | "Answer" opens a sheet with no answers: "Done", "Close", "Open on GitHub", "by orchestrator → you", "Feeds not recorded". |
| Timeline project, map card | lost | Every label is a code: "2.2.1 S-010", "2.5.1 E1 and E2", "PR #443", "main", "2.2 M6". |
| Timeline project, filter panel | mostly | "Yours", "Reviews and checks" are fine; "Turning points" and "Main only" are not explained. |
| Phase headings, milestone rows, gates | mostly | Names are plain. "0 of 38 criteria met (S-011)", "criteria not on record", "Show 4 unused milestones" are not. |
| Sprint rows | lost | "Spec S-010 · superseded by S-011", "E1 and E2", "PR #445": the title is a code. |
| Event rows | mostly to lost | The order of events can be followed (draft, review failed, revised, review failed, stop). What was drafted and why it matters cannot. |
| Plan actions (2.2.2.7.x) | clear | The best-written part: a verb-first title, then a reason. |
| Why bubbles | mostly | Real sentences; they lean on "spec", "freeze", "round", "orchestrator". |
| Needs bubbles | clear | "Before this can happen · 1 of 3 done · on you / done / blocked · Then: ...". |
| Session-link bubble ("CoS 13 Nov") | lost | "P-005 stop card 4: the desk's update to 3.7.3, the plan reviewer's pack...", "matched by time", "4 helpers, 139,766 tokens", "Context: 62% at its peak". |
| Gate sheets | mostly | "What it decides / What it waits for / Your choices" is a good frame. "The Critic's view", "Recycle", "Kill", "never by proxy", "graduate" need a line each. |
| Decision sheets | mostly | "What it changed" is plain. "Your words: criteria-wrong (Recommended)" is not. |
| Research sheet (Q-028) | mostly | "The question" and "The decision it serves" work. "graded A", "lesson LL-051", "Read as not reached" do not. |
| Stop sheet (from the project) | lost at the point of decision | The newcomer learns it stopped and what it holds up, then cannot pick among the five answers. |
| Wait sheet (from the pill's count) | mostly | Same strengths and codes as home row 2. |
| At-work sheet | mostly | "The pipeline", "Its helpers", "Triage traced the third plan failure" are unexplained. |
| Context view | mostly | A clean outline, but each row is a number plus a log title and every link reads "CoS 13 Nov". |
| Home-screen widget project page | lost | See the data faults below; also "Readiness card", "by reviewer (readiness)", "0 of 0 milestones reached". |
| Phase menu, project menu | clear | |
| More menu | clear, but empty of real items | Only "Mockup only: preview the feed" (Live, Late, Stopped) and Close. |
| Late and Stopped banners | mostly | Sentences are plain, but times switch to 24-hour UTC ("from 15:14", "Stopped since 15:07 UTC") under a header that says "11:25 am CT". "The outside check" is unexplained. |

Four faults on the page that would mislead a newcomer outright:

- **Widget page, Design gate.** It reads "Passed · You said proceed · 13 Nov, 10:10 am · after one hold" while the project sits in Discovery with "0 of 8 milestones reached". Its sheet says "Whether the timeline work goes from Discovery into Design", which is the other project's gate. Its phase menu also says "Design gate · passed 13 Nov".
- **Widget page, the pill's count.** Tapping it opens "1 thing waits on you in The timeline" with stop card 5, not the widget's own waiting item.
- **Two different sheets for one stop.** Home's "Answer" and the Needs-you tab open the sheet with Done / Open on GitHub and no choices. The project's "Answer stop card 5" opens the sheet with the five choices.
- **The widget's waiting item has three names.** Home calls it "Review 1.8.1.2 · Readiness check failed", its sheet is headed "Gate · Home-screen widget", and on the project page the item waiting is "1.8.1.3 · Gate · Readiness card".

---------------------------------------------------------------
2. WHAT THE NEWCOMER COULD NOT FOLLOW
---------------------------------------------------------------

Where a meaning is given, it comes from the page itself. Where the page does not explain a term, the entry says so.

A. CODES AND IDS

| Item | Where (example) | Newcomer's likely reading | What it means | Plain rewrite |
|---|---|---|---|---|
| S-010, S-011 | Home row 2; sprint titles "Spec S-011"; map; stop sheet | A part number or ticket | A "spec"; S-011 replaced S-010. The page never says what a spec is or what this one covers. | "The written plan for the records work (second version)", with S-011 in grey after it |
| M6, M7, M8, M9, M10 | Home "Holds up 3 milestones (M6, M7, M8)"; milestone rows "2.2 M6"; map chip "2.2 M6" | Motorways, or months | Older ids of milestones 2.2, 3.6, 3.7, 3.8, 3.9, each of which has a plain name beside it in the list | Use the names: "Holds up 3 milestones: the records, the one timeline, what needs you first". (The home wording is quoted in the note on R8 answers 24 and 26.) |
| 2.2 next to M6 | Milestone row "MILESTONE 2.2 M6" | Two ids for one thing; which is real? | Position number plus the older id | Show one. Touches R6 answers 13 and 14 (numbers follow the order; "M6 is now 2.2"). |
| 2.2.2.10, 1.8.1.2, 2.2.2.7.5 | Every event row; home "Stop 2.2.2.10"; Context view | A version number or legal clause | Phase . milestone . sprint . event . action, by position | Keep it small and grey at the end of the line, never leading it. The numbers themselves are an owner ruling (kept from v12; R6 answers 13 and 14), so the placement would be the owner's question. |
| PR #443 to #446, "#444", "#58" | Map, under "main"; "Merged PR #445"; sprint "2.3.1 PR #445"; session bubble | "Public relations"; unknown | Pull request numbers on GitHub. The page does not say what a pull request is. | "Change 445, added to the project" or name what it brought: "The first mockup, added" |
| E1 and E2 | Sprint "2.5.1 E1 and E2"; "Run E1: how long your steps wait today" | Unknown | Two experiments; the event titles do explain each | "Two experiments: how long you wait, and whether the records are enough" |
| Q-028 | "RESEARCH 1.5.1 Q-028"; map "1.5.1 Research Q-028" | Unknown | A research question; the sheet's title explains it ("how long GitHub keeps run results") | Use the sheet's title as the row title, code after |
| P-005 | Session bubble; Records lines | Unknown | Cannot be told from the page (appears only in file paths and session notes) | "The timeline project (P-005)", or drop it |
| D-044, S-024, S-038, L-0008, LL-051, F-gh-runs-count-cap-01 | Records blocks; "(lesson LL-051)" in a milestone's own explanation | Noise | Record ids; not explained | Keep in Records only; take LL-051 out of the sentence |
| 3.7.3 | Home "The spec-number fix is released as 3.7.3" | A version of something | A version of the operating model (session bubble: "the fix in the operating model... merged as 3.7.3") | "The rulebook's fix for doubled plan numbers is out (version 3.7.3)" |
| v2, v3, v4 | "Mockups v2 to v4", "v3: the motion pass" | Versions of a picture | Mockup versions | "Second mockup: the desk drawn as a trunk" |
| Discovery-5, Design-5 | Research sheet "Serves Discovery-5"; Records "milestone = "Discovery-5"" (Design-5 only in screen-reader labels) | Unknown | The standard id of milestone 1.5 | "Serves milestone 1.5, What already exists is known". Hidden in rows by R6 answers 13 and 14, yet it shows on this sheet. |
| File paths | Every Records block ("decisions/P-005/stop-5-notes.md", "status/P-005.toml (plan_round 3)") | Developer material | Where the record lives | Fold under "Where this is written down" |

B. ROLE AND SYSTEM NAMES

| Item | Where | Likely reading | What it means | Plain rewrite |
|---|---|---|---|---|
| Chief of Staff | Home "Chief of Staff · since 7:52 am"; at-work row and sheet | A human employee | An AI session ("A Claude session · Chief of Staff", in the link bubble only) | "The lead assistant (an AI session)" |
| CoS 13 Nov, CoS 14 Nov | A tag on nearly every event; Context view | A date stamp, or "cost" | A link to the Chief of Staff's conversation that began that day | "Open the conversation". Touches round 8 item 9 ("CoS 14 Nov" in place of "Claude"). |
| orchestrator / the Orchestrator | "by orchestrator → you"; "Written by the Orchestrator"; "Applied by the Orchestrator" | A person or tool | Cannot be told from the page beyond "it stops and asks you" (Why bubble) | "The scheduler that moves work along" plus a one-line definition |
| Triage | "Triage's root cause"; "Triage traced the cause" | A hospital term | Whatever finds the cause after a stop; not explained | "The cause, as traced after the stop:" |
| spec writer, plan reviewer | Why bubbles, plan fold, stop sheet | People | Agents; not said | Keep the names (they are plain) and say once that they are AI helpers |
| "definer" | Wait sheet Records: "P-005-definer-pack.md" | Unknown | Appears to be the spec writer's file; the page does not say | Leave in Records only |
| reviewer (readiness), gate reviewer | "by reviewer (readiness)", "by gate reviewer" | Lower-case mystery | Not explained | "checked by the readiness reviewer" |
| the Critic | Gate sheets: "with the Critic's view beside it" | A journalist | Not explained | "with a second opinion arguing against it" |
| read-only helper; helpers | "by a read-only helper"; "4 helpers, 139,766 tokens"; "Its helpers: 4 reviewers" | Unknown | Sub-sessions of the AI | "4 assistant runs" |
| the pipeline | At-work row: "the pipeline waits on your answer" | Plumbing | The automated run of work; not explained | "the automated work is paused until you answer" |
| the desk | "the desk records them"; "The desk reads every 2 minutes"; "The timeline is the desk" | Furniture | This app or system; not said | "this app" |
| main | Map; "by you · main"; filter "Main only" | Unknown | The main line of the project that merged work lands on; not said | "the finished line", or caption the map once |
| the outside check | Stopped banner | Unknown | Not explained | "a separate monitor" |
| GitHub, Claude | "Open on GitHub", "Open in Claude", "The run on GitHub" | Many will know these; a non-developer may not | Outside sites | "Open the record (GitHub)", "Open the conversation (Claude)" |

C. JARGON AND PROCESS WORDS

| Item | Where | Likely reading | What it means | Plain rewrite |
|---|---|---|---|---|
| spec | Throughout | Spectacles; "specification" at best | Never defined | "the written plan for a piece of work" |
| plan review, round 1/2/3; "plan rounds, build rounds" | Event titles; stop sheet "the stop rule: three plan rounds, three build rounds" | Rounds of a game | A reviewer checks the spec; each try is a round; three failures stop the work (Why bubble 9) | "Third check of the plan failed"; "After three failed checks, work stops and asks you" |
| stop card, "Stop card 5" | Event title; button "Answer stop card 5"; home | A football card | The question raised when the stop rule fires; the fifth in this project | "Work stopped: the plan failed its third check" |
| readiness check, "Readiness card" | Widget page and home | Unknown | A check on a project's brief; not explained | "The check that the brief is ready to be judged" |
| the brief | "1.8.1 The brief"; "A brief ready to rule on" | A short document, roughly | Not explained | "The one-page case for doing the project" (the page does not hold the true description) |
| gate; Design gate, Build gate, Launch gate | Rows, map, menu | A barrier, roughly right | The owner's decision point between phases; the sheet explains it well | Row subtitle: "Your decision: may this go into Build?" |
| "Recycle", "Kill", "Hold" | Gate sheet | Violent or odd | Explained in the sheet | Fine with their lines; the Launch sheet gives Hold, Recycle and Kill no lines |
| "go live and graduate"; "The go-live and the graduation" | Launch gate | School | "leaves the desk, owning its own running" (sheet) | "goes live and runs on its own" |
| "By proxy"; "Under your proxy: resubmit"; "never by proxy" | Event 1.8.1.2; Build gate sheet | Someone voted for you | Not explained. It also sits beside "by you" on the same row, which contradicts it. | "Answered for you under your standing instruction" |
| "Your words: criteria-wrong (Recommended)"; "Applies your words" | Decision rows and sheets | The owner typed gibberish | The label of the option the owner picked | "You chose: write a new plan (the recommended option)". Touches R8 answers 8 and 9. |
| criteria-wrong, re-specify, confirm, re-scope, drop | Stop sheet answers | Unknown | Each has a line, itself in jargon | See section D |
| "rounds reset", "not a strike", "counted as a strike" | Stop and decision sheets; title "New spec S-011, rounds reset" | Baseball | The page does not say what a strike costs | "the count of failed checks starts again at zero and nothing is held against the project" |
| freeze / frozen | "S-011 frozen"; "Your approval to freeze"; "then they freeze" | Paused or stuck (the opposite) | Locked as final after approval | "The plan is approved and locked" |
| criteria; "0 of 38 criteria met (S-011)"; "criteria not on record" | Milestone rows | Unknown | The tests that prove a milestone | "0 of 38 checks passed"; "its checks aren't written yet" |
| pack | "the spec writer's pack never held..."; "the pack fix" | A bag | The files an agent is given (one Why bubble says "never given them") | "the files the plan writer was given" |
| re-point | Stop sheet root cause | Unknown | Make the experiments refer to the new spec (action 2.2.2.7.5 says it plainly) | "update the two experiment files to refer to the new plan" |
| registered | "Both experiments registered" | Signed up | Not explained | "Both experiments written down, not yet run" |
| source check; "graded A / B"; "library entry filed" | Research sheet | Unknown | Not explained | "its sources were checked (passed on the third try)"; "how well backed: two facts strongly, one by a single page" |
| join-up review | Milestone 2.3 "0 of 1 join-up review passed" | Unknown | Not explained | "the check that the parts fit together" |
| "superseded by" | Sprint 2.2.1 | Formal | Replaced | "replaced by the second version" |
| "unused milestones" | "Show 4 unused milestones" | Discarded | Milestones with nothing on record (About text) | "Show 4 milestones with nothing recorded yet" |
| "milestones written at the Design gate"; "0 of 0 milestones reached" | Widget page | Broken | Not yet defined | "Its milestones are written once Discovery is approved" |
| "Feeds M6, M7, M8"; "Feeds not recorded" | Home answer sheet | A news feed | Holds up | "Holds up ..." |
| "AROUND IT" | Home answer sheet | Unknown | Recent events near this one | "What led to this" |
| tokens; "Context: 62% at its peak"; "matched by time" | Session bubble | Unknown | AI usage figures; "matched by time" is not explained | "How much AI work it used"; fold away |
| "Context view" | Round button hold | The same word as the "Context" meter | An outline of the project | "Outline" |
| "Turning points", "Main only" | Filter | Unknown | Not explained on the panel | "Big moments (stops, decisions, merges)"; "Only what was added to the project" |
| "9 new", "nothing new" | Home, phase heading | New what? | Events since you last looked (About text only) | "9 events since you last looked" |
| "Who is at work and what is new are examples until the desk records them."; "an example"; "Answer is an example." | Home; plan fold; sheets | Is this real or not? | Mockup honesty notes | Keep for the mockup; a handed-over phone would need them gone or labelled "sample data" |

D. TITLES THAT READ LIKE LOG ENTRIES

| Title | Where | What is missing | Plain rewrite (using words already on the page) |
|---|---|---|---|
| "Stop card 5" | 2.2.2.10, the Now row | What stopped and why | "Work stopped: the plan failed its third check. Your call." |
| "New spec S-011, rounds reset" | 2.2.2.1 | Subject and reason | "A fresh plan was started, as you asked" (Why: "You said to write a new spec after stop card 4...") |
| "First draft" | 2.2.2.2 | Of what, by whom | "The spec writer wrote the first draft from your six answers" |
| "Spec revised", "Spec revised again", "Spec revised, round 4" | 2.2.2.4, .8, .11 | What changed | "The spec writer fixed what the first check found" |
| "Plan review failed, round 1/2/3" | 2.2.2.3, .6, .9 | Why it failed | "Check 2 failed: two wordings still clashed" |
| "Merged PR #446: three questions for you" | 2.2.2.5 | Leads with a code | "Three questions were sent to you (phone widths, a milestone's wording, the spec writer's files); you answered at 8:47 am" |
| "Merged PR #445"; "Merged PR #444: the answer, the number fix, the pack fix" | 2.3.1.3, 2.2.1.8 | What it brought | "The first mockup was added to the project" |
| "Checks passed" (row reads "Check · Checks passed · Checks passed") | 2.3.1.2 | Which checks, on what | "The first mockup passed its automatic checks" |
| "Motion map"; "v3: the motion pass"; "v2: the desk as a trunk" | 2.3.2.x | Nouns with no verb | "Second mockup drawn: the desk as a trunk" |
| "Readiness card"; "Readiness check started" | Widget 1.8.1.x | What is being checked | "You were asked: resubmit the brief or stop?" |
| "You said resubmit / hold / proceed"; "Gate case reviewed again" | 1.8.1.x | Resubmit or hold what | "You held the decision and asked for a better case" |
| "S-011 frozen" | 2.2.2.13 | Reads as stuck | "You approve the plan and it is locked" |
| "Spec S-010", "Spec S-011", "PR #445", "E1 and E2", "Q-028" | Sprint and research titles | The title is the code | "First plan for the records work (replaced)"; "Second plan for the records work" |
| "The spec writer's plan · 5 of 6 done / the work between the two events · an example" | 2.2.2.7 | "plan" clashes with "plan review" | "What the spec writer did to answer check 2: 5 of 6 steps done, 1 blocked" |
| "S-011 failed three plan reviews: what happens next?" | Home row 2; stop sheet title | Subject is a code | "The plan for the records work failed its third check. What next?" |

The stop sheet's five answers (the labels appear to be the system's own option keys):

| Label | The page's own line | Plain rewrite |
|---|---|---|
| criteria-wrong | "A new spec replaces S-011 and goes back to the spec writer; the plan rounds reset; not a strike." | "Start a fresh plan. The count of failed checks goes back to zero." |
| re-specify | "The same new spec, counted as a strike." | "Start a fresh plan, and count this against the project." (The page does not say what a strike costs.) |
| confirm | "One focused check, offered once; it would find the known faults again." | "Run one more check (it is expected to fail the same way)." |
| re-scope | "Closes the timeline work as it stands; nothing in Triage argues for it." | "Close this project as it stands, to be redefined." (How it differs from drop cannot be told.) |
| drop | "Closes the timeline work." | "Close this project." |

E. STATUS WORDS

| Word | Where | Problem | Rewrite |
|---|---|---|---|
| "Done" on a Stop or Decision | "2.2.1.5 · Stop · Done" | A stop that is done? | "Answered" |
| "Done" as a button | Home answer sheet, top right | Looks like "mark as done" | "Close" (a Close button is already there) |
| "Reached" / "Not reached" / "Not started" / "Under way" / "Next · not started" / "Stopped" / "Waits on you" | Milestone rows | Seven states with no legend; "Not reached · criteria not on record" sits inside a phase marked "done" | One legend, and a reason on each exception |
| "3 of 8 milestones reached · done · 13 Nov" | Discovery heading | Done with 3 of 8? | "Finished 13 Nov; 3 of its 8 milestones were needed and reached" (if that is what the record says) |
| "Yours", "Yours · waiting", "Yours to rule", "BUILD GATE · YOURS" | Tags, map | "Yours" belongs to whoever holds the phone | "Your decision", "Waiting for your decision" |
| "Answered" in the event line | "2.2.2.5 · Merge · Answered" | A merge was answered? | "Merged; its questions answered" |
| "Planned" / "planned · an example" | Future events | Fine; "an example" confuses | |
| "1 blocked" | Plan fold | Fine | |
| "Failed" with no state on the number line | "2.2.2.3 · Review · 6:29 am" | Fine | |
| "now" / "NOW" | Phase heading, event tag | Fine | |
| "Live", "Late", "Stopped" (feed) | Header | "Stopped" collides with a stopped project | "Not updating since ..." |
| "Nothing at work" | Home, widget row | Odd English | "Nobody is working on this" |
| "waiting is never counted as stalled" | Home answer sheet | A rule aimed at insiders | Drop it |
| Percent rings "100" / "0", "38%", "14%" | Rings, phase menu | 38% of what? | Caption once: "milestones reached" |
| Times | "13 Nov 03:44" (1.8.1 rows), "15:36" (home sheet), "15:07 UTC" against "9:36 am", "11:25 am CT" | Three clocks on one phone | One clock everywhere. Chicago time with a date on older events is already ruled in round 8; these rows miss it. |

F. BUTTONS AND LINKS WHOSE RESULT IS UNCLEAR

| Control | Where | What the newcomer expects | What it does | Fix |
|---|---|---|---|---|
| "Answer" | Home rows; Needs-you tab | A place to answer | A summary sheet with no choices and "Open on GitHub" | Open the choices sheet the project page uses, or rename "See the question" |
| "Answer stop card 5" | Now row | Unclear what answering does | Opens five choices; the footer says "the Orchestrator applies it on its next run" | "Choose what happens next" |
| "Go to it" | Home | Go to what? | Per TIMELINE-CURRENT.md it opens the project at that event; not tested | "Show it on the timeline" |
| "Open on GitHub" | Home answer sheet | Leaving the app to an unknown place | "you finish the step yourself" (About text only) | "Answer on GitHub (opens the question's page)" |
| "CoS 13 Nov" tag | Every event | A date label | Opens the session bubble | See B |
| "Why" | Event rows | Clear | | |
| "Needs 2" | Planned events | Needs two what? | Opens "Before this can happen" | "Waiting on 2 things" |
| "Needed by Spec revised, round 4" | Plan action | Clear enough | Jumps to that event | |
| Round button (target icon, no words) | Bottom right | Unknown | Tap jumps to Now; a hold turns the Context view on and it stays on ("Hold the round button to leave") | A one-time hint |
| Three tab icons (house, calendar, tray) | Bottom | Calendar means dates | Desk, Plan, Needs you; no visible words; Plan is disabled on home | Labels under the icons |
| Bell | Top | Notifications | Jumps home to the list | |
| Map chip "2.2 M6 ×" | Map card | Unknown | Clears the selected milestone | "Showing: The records can carry the timeline ×" |
| Grey bar under the map | Map card | Unknown | Folds the map | Fine once tried |
| Filter chips | Filter panel | Mostly clear | "What is left out goes faint..." explains it | |
| Milestone strip bars | Under the phase heading | Decoration | Jump to a milestone | Fine |
| "Show 4 unused milestones" | List | See C | | |
| More (...) | Top right | Settings | Only the mockup's feed preview | Nothing to fix in a mockup |
| The black "1" in the project pill | Top | A notification count | Opens the wait sheet (the wrong project's on the widget page) | |

---------------------------------------------------------------
3. PATTERNS, WITH A PROPOSED RULE FOR EACH
---------------------------------------------------------------

1. **Code first, name second or absent.** "Spec S-011", "2.2 M6", "PR #445", "Q-028", "Stop 2.2.2.10 · Stop card 5 · S-011".
   Rule: plain name first; code after it, small and grey; never a code as the only subject of a sentence.
   Touches R8 answer 22 (the event line on home) and the v12 / R6 answers 13 and 14 ruling on numbers. The rule keeps both and changes only order and weight.

2. **The headline is a log label and the explanation is hidden behind Why.** The Why sentences are consistently better than the titles they sit under.
   Rule: every event title says who did what to what; a failure says what failed in the same line. The Why sentence, or its first clause, becomes the title or an always-visible second line.

3. **Nothing says what a thing is for.** Projects, phases, sprints, specs, experiments and gate rows have a name and a count but no purpose line. Milestones are the exception and are the best-understood level.
   Rule: every project, phase and sprint carries one sentence of "what this is", shown at least once where it first appears.

4. **Missing subjects and actors.** "First draft", "Checks passed", "Motion map", "Hold", "Feeds not recorded". Actors appear as "by reviewer (readiness)" on some rows and not at all on others.
   Rule: a title is a sentence with a subject; the actor is named the same way on every row.

5. **The cast is never introduced.** Chief of Staff, orchestrator, Triage, the Critic, spec writer, plan reviewer, helpers, the desk, the pipeline. Nothing says these are AI agents.
   Rule: each role name gets a five-word gloss at first use or one tap away, and the page says once that the workers are AI sessions.

6. **System option keys shown as the owner's words.** "criteria-wrong (Recommended)" appears as "Your words" five times.
   Rule: an answer is shown as a plain action; the system's key, if kept, is grey beneath it.
   Touches R8 answers 8 and 9 (a decision carries your words). Whether "your words" must be the literal key is a question for the owner.

7. **Jargon explained with jargon.** "rounds reset; not a strike"; "the stop rule: three plan rounds, three build rounds"; "Passed its source check"; "criteria not on record".
   Rule: an explanation may not use a term the page has not explained.

8. **"Yours" and "you" assume the reader is the owner.** Fine for the owner, but the owner's stated test is a stranger.
   Rule: keep "you" (it is the owner's phone) but say what is wanted: "Your decision" rather than "Yours".

9. **One thing, several names; one word, several things.** The widget's waiting item is Review, Gate and Readiness card. "Stop" is a stop card, a stopped feed and a stopped milestone. "plan" is the spec writer's plan, a plan review and the project plan. "Context" is a view and a meter. "Done" is a state and a button.
   Rule: one name per thing and one meaning per word across the desk.

10. **Mixed clocks.** am/pm Chicago, 24-hour unlabelled, and UTC.
    Rule: one format everywhere (already ruled in round 8; three places miss it).

11. **Mockup honesty notes in the reading line.** "an example", "Answer is an example", "no end recorded", "matched by time".
    Rule: nothing to change for the mockup; they would have to leave before the hand-the-phone test can pass.

12. **Raw records as content.** File paths and ids in Records blocks, and an id inside a sentence ("lesson LL-051").
    Rule: paths live under a folded "Where this is written down"; no record id inside a sentence.

---------------------------------------------------------------
4. CANDIDATE APPROACHES FOR A PLAIN-WORDS PASS
---------------------------------------------------------------

A. **Plain-first titles, codes second in grey.**
   Rewrite event, sprint and home titles as sentences; codes and position numbers move to the end of the line.
   Fixes the most for the least chrome.
   Cost: titles grow from one line to two on most event rows (the Now row is already tall). The desk needs a plain title per event and per sprint, which today's records do not hold; the current titles look derived from commit and PR subjects. Order and weight of the home event line and of the numbers touch R8 answer 22 and R6 answers 13 and 14.

B. **A "what this is" line under every project, phase, milestone and sprint.**
   Project: one sentence on home and at the top of its page. Phase: one sentence ("Design: decide exactly what will be built and how it will be proven"). Sprint: what the piece of work is.
   Cost: one more line per heading, roughly 20 points each. To save height it could show only on the open level, or on first view. Needs a description field on the project and sprint records. Phase text could be fixed copy from the operating model, with no new record.

C. **Promote the Why sentence.**
   Show the first clause of Why as the event's second line, always visible, and keep the bubble for the rest.
   Cost: no new record beyond what Why already needs. The About text says reasons are examples and "no record says yet why an event happened", so that request already stands. Adds a line per event. Touches the ruling that Why is a tag opening a bubble (R6, v21) and the round 8 "fewer tags per row" look.

D. **Glossary and cast sheet.**
   One sheet from a "?" in the top capsule or the More menu: who the workers are, and what spec, round, stop card, gate, freeze and criteria mean. Optionally a dotted underline on first use that opens the one entry.
   Cost: almost no space; fixed copy, no new records. Weakest against the owner's test: a stranger has to go and look, and the titles stay cryptic. Best as a complement to A or B.

E. **Plain role names and plain answer labels.**
   Replace or gloss the roles ("Chief of Staff (lead AI assistant)", "the scheduler", "second opinion") and rewrite the stop and gate choices as actions ("Start a fresh plan"), with the system key in grey.
   Cost: small in space. Needs a plain label per option on stop cards and gate choices. Whether "your words" may be shown as a plain rewrite of the key the owner tapped is the owner's call (R8 answers 8 and 9). "CoS 14 Nov" on the session tag is a round 8 ruling (item 9).

F. **A "plain / detailed" toggle.**
   One switch in More: plain hides numbers, codes, session tags and Records; detailed is today's page.
   Cost: every screen is drawn and reviewed twice, and all the plain text of A, B and E is still needed. The owner would normally sit in detailed, so the default would still fail the hand-over test.

Reviewer's reading, not a ruling: A with C addresses most of the table; B answers "what is this project"; D and E are cheap additions; F costs the most for the least.

---------------------------------------------------------------
5. RECORDS THAT WOULD NEED TO CARRY PLAINER TEXT
---------------------------------------------------------------

For the request to the building session. Each is something the page shows today as a code or log label, where the plain version could not be told from the page.

| Record | What it would need to carry |
|---|---|
| Project record | One sentence on what the project is and who it is for (The timeline, Home-screen widget, operating model, Model-Lab, portfolio). Home's status line is already a plain sentence; keep that field. |
| Sprint / spec record | A plain name and a one-line purpose ("the plan for changing the records so they can feed the timeline"), plus which spec it replaces and why. |
| Event records (commit, review, check, merge, stop, decision, gate) | A plain title (actor, verb, object) and a one-line outcome. Reviews: the one-line reason for pass or fail. Merges: what the merge brought. Checks: which checks. |
| Why per event | Already listed as not recorded; the same field serves approach C. |
| Stop card | A plain question; for each choice a plain label and a plain consequence, including what a "strike" costs and how re-scope differs from drop; the cause in plain words. |
| Gate records | A plain line on what the gate decides (the sheets have this; the rows do not) and a line per choice (the Launch sheet's Hold, Recycle and Kill have none). |
| Decision records | A plain rendering of the answer beside the literal words or key, and whether it was the owner or the standing proxy. |
| Research request | The question as its title (the Q-028 sheet has it; the row and map do not), and a plain confidence line. |
| Experiments | A plain name each (E1, E2); the planned events already carry it. |
| Milestones | Plain names exist. Missing: why a milestone reads "not reached" inside a finished phase, in plain words, and the plain names used wherever M6, M7, M8 appear. |
| Roles | A short plain description per role (Chief of Staff, Orchestrator, Triage, Critic, spec writer, plan reviewer, readiness reviewer, gate reviewer, helper). Fixed copy from the operating model would do. |
| Session records | A plain one-line "what this session was doing". Today's text is the session's own working note ("P-005: check #444 and the loop on stop card 4..."). |
| Waiting items | One kind and one title per item, so home, the sheet and the project row name the same thing. |
| Fixed copy, no record needed | Phase descriptions, the state legend, the filter chips' meanings, the glossary. |

Open questions for the owner (not decided here):

1. May the position number and the code move behind the plain name and go grey, on home's event line (R8 answer 22) and on the rows (R6 answers 13 and 14)?
2. May "your words" be shown as a plain sentence, with the literal option key beneath (R8 answers 8 and 9)?
3. May the "CoS 14 Nov" tag take a plainer label (round 8 item 9)?
4. May the Why sentence show on the row rather than only in the bubble?
5. Is the test's reader someone who knows the workers are AI agents, or must the page say so?
