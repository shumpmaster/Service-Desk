# Desk Element Library

The quiet, round, neutral look for the whole desk, taken from the owner's Craft references.

This library holds every element seen in the owner's seven Craft screenshots (references 11 to 17 in Service-Desk `docs/design/references/`). The measures come from the external audit of those screenshots (`docs/design/audit-2026-11-14-craft-v7.md`, Part 2). Mockup v8 (`docs/design/mockups/timeline-v8-craft.html`) is the first desk screen built from them. The palette is neutral only for now; the owner will add colour later.

## Change, 27 November 2026 (round 8, a series of the phases and the wait on the line)
The owner's words (decisions/questions/P-005-design-round-8.md, answer 30), a comment on mockup v44's home: "Could we maybe concert this single phase indicator to a smaller series of the phases? Or something of the sort. And then put the waiting time on the line". New card: **PhaseSeries** (four small segments with the gates between, the current one named with its state; and the wait as a stretch on the project's strip, labelled). Notes added to WaitGroup, DeskHome, ProjectCard, BranchMap (main's words plain, gate captions kept clear), MapFilter (the hidden count said once), TopPills (the phase pill's number alone below 370), HandoverFlag (its dark colour) and PriorityList (the buttons on one line). Mockup v45 (docs/design/mockups/build-v45/).

## Change, 27 November 2026 (round 8, plain words; a branch toggle; session names and a handover flag)
The owner's words (decisions/questions/P-005-design-round-8.md): answer 27, "Now start the plain words test"; answer 28, on the plain-words options, "All recommended. The only thing I want to add is a branch toggle in the filters. And I want to add an automated session naming and handover required flags." New cards: **PlainTitle** (the rule: plain name first, code after in grey; a line on what each thing is; plain answers with the key beneath; plain role names; one clock), **Glossary** (the words and who does the work, saying the workers are AI), **BranchToggle** (in MapFilter's panel), **SessionName** and **HandoverFlag** (examples until the records carry them). Notes added to MapFilter, PriorityList, WaitSheet, SessionLink, AtWork, ProjectLine, KindSheet, GateRow, EventWeight and LevelRails. The test: docs/design/audit-2026-11-27-v43-plain-words.md. Mockup v44.

## Change, 27 November 2026 (round 8, home as a priority list of the owner's actions)
The owner's words (decisions/questions/P-005-design-round-8.md): answer 24, "I need the structure to be aimed at events that I’m needed on. Like a priority list for my actions"; answer 26, "This option A is the one, however. I don’t like that pr446 has effectively 3 things associated with it, unless those are all 3 independent questions?" New card **PriorityList**: one numbered list across projects, each row its project, event, question, why it ranks there and how long it has waited, Answer and Go to it; the projects follow without their waiting rows. The three questions of PR #446 were three independent questions, answered at 8:47 am on 14 November, so WaitSheet now counts 1 thing in The timeline. Notes on DeskHome, WaitGroup and WaitSheet. Mockup v43.

## Change, 27 November 2026 (round 8, home closed up and in glass, its waiting rows named, the filtered list)
The owner's comments on v40 (decisions/questions/P-005-design-round-8.md): answer 20, "Why so much empty space here?"; answer 21, "Can we make this Liquid Glass style too?"; answer 22, "Can you add the title of the “event” or step that is waiting on me on the main page?"; answer 23, "When things are filtered I would like the table to adjust and show me only that filtered view." As built into mockup v41. **HomeHeader**: the live label rides on the capsule's row and the title sits under it, so the empty slot above the title is gone (the header ends at 129, not 177, at 393). **WaitGroup**: home's project groups are glass like MapCard, rounded and inset apart from the square title band; each waiting row names the event it hangs from ("Stop 2.2.2.10 · Stop card 5 · S-011"). **ProjectLine**: worded to read on one line at 393. **MapFilter**: the list shows only what a cut matches, headings counting what is hidden.

## Change, 26 November 2026 (round 8, the map filter, home's search and lines, and home's title band)
The owner's rulings (decisions/questions/P-005-design-round-8.md, answer 18, a comment on the home title's option A: "I like option a here, but I want a better visual segregation of the title. Effectively some accenting or something that is reserved for the title and just condenses when scrolled as shown"; answer 19: "On the titles could we combine A, b and c somehow, my current concern is how the title looks identical to the cards / Go with the recommendations on the others"), as built into mockup v40. New: **MapFilter** (a glass filter button inside the map card's corner, six cuts with counts; what is left out goes faint on the map and quiet in the list), **HomeHeader** (home's title on a full-width glass band, not a card: the ground's glow behind it, a small-caps live label, a heavier title and a short blue-to-lavender mark, condensing into the slim bar), **ProjectLine** (who is at work and how much is new, one line per project; examples until the records exist). Changed: LargeTitle (back on home inside HomeHeader), SearchField (a magnifier in the capsule opening the field over the bar), DeskHome and BranchMap, each README ending with its v40 line.

## Change, 26 November 2026 (round 8, the map card's room, inner box and glass)
The owner's comment on v38 (decisions/questions/P-005-design-round-8.md, answer 17: "The branch map needs more space to breath away from the other elements. And I want the map to entirely fit within its own space within the outline here if that makes sense? And I want it to have the glass look as well not just flat white"), as built into mockup v39. Changed: **MapCard** (glass over the ground's field, 16 from the screen, 14 under the top row, 20 above the list, `map-card-pad` 12 with the whole map inside), **BranchMap** (drawn to the card's inner box; lane names clear of the right gate; `map-card-word`), **MapFold** (the slim card is glass). Tokens: `map-card` and `map-card-edge` changed, `map-card-word` and `map-card-pad` added, `shadow-map-card` softened.

## Change, 26 November 2026 (round 8, the ground and the map as a card)
The owner's ruling (decisions/questions/P-005-design-round-8.md, answer 16: "I like option a, ..."; "For the branch chart can you put an outline around it and step it out a bit that way it has some depth and doesn't inherently blend in with the timeline below"), as built into mockup v38. New: **Ground** (three pale fields, blue, lavender and a touch of mint, fixed behind everything; faint glows in dark; `ground-field-a` to `-c`, and `text-2-on-field` for secondary words on the tint; flat with reduced transparency or more contrast; it loosens the neutral grey ground and the one-blue rule for the background only) and **MapCard** (the branch map inset 10 from the screen's edges as a card: `map-card`, `radius-20`, a hairline `map-card-edge`, `shadow-map-card` falling onto the list, a 12-point gap under it). Changed: BranchMap and MapFold, each README ending with its v38 line.

## Change, 26 November 2026 (round 8, the look and feel)
The owner's ruling (decisions/questions/P-005-design-round-8.md, answers 14 and 15: "Draw all 4"; "I like all of them, ..."), option A of each look-and-feel item drawn on docs/design/mockups/options-r8-look/, as built into mockup v37. **A calmer map** (BranchMap, MilestoneMap; new tokens map-lane, map-main, map-dot): thinner, lighter lanes, routine commits outside the window as dots, a quieter window, gate captions without a slab. **Blue only for now or selected** (new tokens ink-button, ink-button-text, ink-dot, status-moving-dot): counts, the bell's dot and the new-since dots in ink, the at-work dot the soft green of moving, Answer an ink button (WaitSheet, AtWork, NewMark, KindRows, TopPills). **Fewer tags per row** (EventWeight, KindRows, YoursMark): the kind, a grey state and the time on the number line, only tinted states before the title, Why and the session at the row's foot, Answer on its own line. **Glass on what floats** (surface-floating and surface-sheet changed; new glass-edge and glass-edge-low): the top row, the tab bar, the round button, both menus and the sheets (TopPills, TabBar, RoundButton, PopoverMenu, BottomSheet); solid with reduced transparency. The owner's further ask, slight colour in the background, is drawn as options (docs/design/mockups/options-r8-ground/), not yet in the library.

## Change, 26 November 2026 (round 8, what serves no purpose and what was missing)
The owner's ruling (decisions/questions/P-005-design-round-8.md, answer 12: "I want all 8 as recommended"), option A of each item drawn on docs/design/mockups/options-r8-purpose/, as built into mockup v36. New: **WaitSheet** (the project pill's count opens what waits on you), **AtWork** (who is at work now), **NewMark** (new since you last looked) and **WaitTime** (how long each wait lasted). Changed: Gauge and LevelRails (each count said once), EventWeight (the usual actor's line dropped), NowBlock (retired from a project's page; a NOW tag on the stop), FixedCentre, SessionLink (what a session used) and TopPills. The last-looked time and the context meter are examples; the records they need are asked for in docs/design/requests/2026-11-26-timeline-records.md.

## Change, 26 November 2026 (round 8, gates, decisions, research and stops)

The owner chose option A for each kind (decisions/questions/P-005-design-round-8.md, answers 8 and 9: "Honestly love every option. Especially the research functionality"; "I want you to go with ever option you recommended so if those are all A then do that"), built into mockup v35. New cards: **YoursMark** (one mark on what is the owner's), **GateRow** (a gate as a row closing its phase, with its marks on the map and in the phase menu), **KindRows** (a decision quoting the owner's words, research as its own level with a Memo tag, a stop with its rule, what it holds up and Answer) and **KindSheet** (the one sheet all four open). Changed: EventWeight, BranchMap, PopoverMenu, LevelRails and BottomSheet, each README ending with its v35 line. The Answer button is an example: no record says the desk can record a stop card's answer.

## Change, 26 November 2026 (round 8, the twelve held changes)

The owner approved all twelve held changes as recommended (decisions/questions/P-005-design-round-8.md, answer 6), built into mockup v34. A new **MapFold** card: a handle at the band's foot folds the map to one line. Changed: TopPills (38 high), EventBubble (Why a quiet fill, a blue edge while open), SessionLink and ContextView (each link names its session; event rows numbered), FixedCentre (opens on what waits on you), BranchMap and MilestoneMap (one scale per phase; planned milestones as dashed rings), MilestoneSelect (a second tap clears), LevelRails (a milestone's name in full under its label; Chicago times with dates), Gauge (a dashed empty ring where nothing is on record), Motion (the push comes in from the right) and WaitGroup (Chicago times). Each card's README ends with its v34 line.

## Change, 25 November 2026 (round 8, the two reviews: polish and motion)

From the design reviewer's two reviews of mockup v32 (docs/design/audit-2026-11-25-v32-review.md and docs/design/audit-2026-11-25-v32-polish.md), within the owner's rulings (decisions/questions/P-005-design-round-8.md, answers 1 to 3). **One blue** in three roles: fill `accent` #0a6cff (the same in both themes, so white on it passes), text `accent-text`, and washes; the bell is in ink. **One type ramp** (11, 12, 13, 15, 17, 20, 22, 28; weights 400 and 600, 700 for the large and phase titles), **one radius scale** (6, 12, 20, 28, full), **one separator** colour as a retina hairline. **Dark mode** lifts by lightness (`surface-band`), keeps status washes in their hue, and lets done merges recede. A new **Motion** card holds one curve, one spring and four durations for the whole desk, and every control now answers a press (`press-fill`). Changed: Gauge, TopPills, EventBubble, SessionLink, BranchMap, MilestoneMap, FixedCentre, LevelRails, RoundButton, ContextView, BottomSheet, PopoverMenu, WaitGroup (each card's README ends with its v33 line).

## Change, 15 November 2026 (round 3)

The colour hold is lifted for status only (decisions/questions/P-005-design-round-3.md, answers 4 to 13). Status takes soft green, yellow and red (`status-ok`, `status-wait`, `status-bad` and their tinted forms) on gauges, event marks, tags and the branch map. Everything else stays neutral, with the one blue. The shapes for milestones and sprints are still on hold. New cards: Gauge, StatusMark, BranchMap and PhaseRow. On the timeline, BranchMap replaces LaneGraph.

## Change, 25 November 2026 (round 7, what a gauge counts)

The Gauge has its rule: a phase counts its milestones reached, a milestone its criteria met, a sprint its events done; red when stopped or after a third failed review, yellow when waiting on you or after a failed review, green when moving or done, no colour when not started; a milestone and a phase take the worst of what they hold, and the track carries the soft status colour so a gauge at 0 still shows it (decisions/questions/P-005-design-round-7.md, answers 24 to 26).

## Change, 25 November 2026 (round 7, two pills at the top, every phase kept)

A project's page has one row at the top (TopPills): Back, the project pill and the phase pill, each opening its list, then the bell and More; the slim title bar (ProjectHeader), the row of project pills and the four phase tiles (PhaseRow) are gone from a project's page. Every phase stays in the list, top down with its gates, its milestones folded unless opened; the phase pill and the map follow the phase in view. The map gives each sprint its own lane. The list's words are a little larger and an event's first line wraps (decisions/questions/P-005-design-round-7.md, answers 20 to 23).

## Change, 25 November 2026 (round 7, the whole phase on the map)

Selecting a milestone no longer zooms the map (MilestoneSelect): the map always shows the whole current phase, drawn as MilestoneMap draws a milestone, and the selected milestone's stretch is outlined in dashed blue with a chip that names it and clears it (decisions/questions/P-005-design-round-7.md, answers 18 and 19).

## Change, 25 November 2026 (round 7, a fixed centre)

A project's list has a fixed centre (FixedCentre): a small blue pointer in the left margin at the middle of the list's window; the row level with it is lightly washed in blue, and a small blue arrow on the branch map points at its event (decisions/questions/P-005-design-round-7.md, answers 8, 16 and 17).

## Change, 24 November 2026 (round 7, the levels on rails)

A project's list tells its levels apart (LevelRails): each level steps in on its own rail and says what it is (PHASE, MILESTONE, SPRINT), with one size per level and thin line icons with no disc. The phase heading starts at the left with no ring, and a strip of its milestones under it, in their status colours, Now and the current one marked. Milestone rings show their percent inside; a sprint has a thin accent bar in its status colour and ten small squares to the right of its title. Every row under a sprint carries its fourth number on a line of its own. Folding or opening keeps the tapped row in place. The list stays top down (decisions/questions/P-005-design-round-7.md, answers 8 to 15).

## Change, 24 November 2026 (round 7, links back and the Context view)

Each event carries one SessionLink on its first line: Claude whenever a conversation stands behind it (the session that did it; for a pipeline step, the Chief of Staff session at work on the project when it ran; for the owner's merge, the session that prepared it), otherwise the GitHub run, otherwise the pull request; its bubble opens the conversation, with the run or pull request beside it. Holding the RoundButton turns on the ContextView: the same order and numbers, every phase on one line and the current phase open to its events, each row a number, a title and its link (decisions/questions/P-005-design-round-7.md, answers 2 to 5).

## Change, 18 November 2026 (round 6, one order of operations)

A project's list reads top down at every level, each thing where it happened or where it is meant to; milestones are placed by when their work began or is meant to begin, with Now at the clock, and the numbers follow that order, so they never jump. A standard milestone's own id (Design-5) is not shown in the row (ReadingOrder; decisions/questions/P-005-design-round-6.md, answers 8 to 14).

## Change, 17 November 2026 (round 6, words on main)

On the fitted map (MilestoneMap) every event on main carries its words wherever it sits: one row in a strip under main, each label as near its icon as it can sit without touching the one before, joined to it by a thin line. A sprint's events carry words only inside the window (decisions/questions/P-005-design-round-6.md, answers 6 and 7).

## Change, 17 November 2026 (round 6, each event as heavy as it is)

A project's list weighs each event by what it is (EventWeight): turning points (a stop, a decision, a gate, a merge to main, anything waiting on you) take a larger icon and a 17 semibold title; checks (reviews) keep their row; routine (commits) shrinks to one quiet line. Colour does not change (decisions/questions/P-005-design-round-6.md, answers 3 and 6).

## Change, 17 November 2026 (round 6, the words in the map's window)

On the fitted map (MilestoneMap) each event in the window loses its kind word, since its icon says it, and its short title wraps by whole words onto up to three lines in that place; the map keeps its height (decisions/questions/P-005-design-round-6.md, answers 2 and 5).

## Change, 17 November 2026 (round 6, home's floating header)

Home's header floats too: the same slim bar as a project's page without Back, "Timeline" in 17 with the status under it, the bell and More, alone in the glass band at about 57 high; the search and the rest of home scroll under it (ProjectHeader; decisions/questions/P-005-design-round-6.md, answers 1 and 4). LargeTitle no longer appears on the desk.

## Change, 17 November 2026 (round 5, the event's tags and bubble)

A project's list is a tree, and every ringed icon folds what sits under it. What an event needs and why it happened leave the space under the event: a "Needs" tag (tinted by the worst state) and a "Why" tag on its first line each open a bubble. The Needs bubble is a plain checklist; a chevron opens the next layer inside it, and nothing moves the page. While it is open, its chain is ringed and joined on the map and in the list (EventBubble; decisions/questions/P-005-design-round-5.md, answers 10 to 14). NeedsList and WhyLine are kept for the record.

## Change, 16 November 2026 (round 5, the window in the centre)

On the fitted map (MilestoneMap) the window over the events in view sits in the middle, what came before on the left and what comes after on the right; at either end of the milestone it slides to that edge (decisions/questions/P-005-design-round-5.md, answers 6 and 7).

## Change, 16 November 2026 (round 5, why things happen)

Each event that happened carries one plain sentence under it saying why, on a dotted line down to the event before it (WhyLine), so the plan reads as a story while you scroll; the agent's plan stays as the detail of how, and planned events keep their NeedsList (decisions/questions/P-005-design-round-5.md, answer 5). Reasons are examples until the records carry them.

## Change, 16 November 2026 (round 5, the map fits a milestone)

Tapping a milestone's row selects it, and the branch map fits to it (MilestoneMap): only its sprints, across the full width, every event as its icon, planned ones as open rings; the events in view below spread apart under the window with their kind and a short title, the rest squeeze to the sides. A chip names the milestone; its cross brings back the whole phase (decisions/questions/P-005-design-round-5.md, answers 1 and 4).

## Change, 16 November 2026 (round 5, what an event needs)

An event that still needs something shows it, hung from the event by a thin line (NeedsList): "Needs first" with how many are done, then each requirement as a small row, the plan's check column, the kind's icon, the tag its own event wears and its title, then "Then unlocks" the same way. Done events show nothing extra. A requirement that is an action of an agent's plan reads as that action, and the action in ActionPlan says "Needed by" and the event (decisions/questions/P-005-design-round-5.md, answers 1 to 3). Requirements are examples until the records carry them.

## Change, 16 November 2026 (round 4, the project header)

A project's page has one floating header (ProjectHeader): a slim bar with the title in 17 and the status in 12, the project pills right under it, slimmer, then the branch map and the phase row, all floating together; the large title leaves a project's page (decisions/questions/P-005-design-round-4.md, answers 13 to 16).

## Change, 16 November 2026 (round 4, later)

Home is grouped by what waits. The owner asked whether the desk map really worked and chose a calmer home: one summary sentence, then a group for each project with something waiting (the project's row with its gauge, its one line and a slim strip of the events that matter, and its waiting rows, each saying what it holds up, the longest wait first and marked), and the quiet projects folded into one row (WaitGroup; decisions/questions/P-005-design-round-4.md, answers 9 to 12). DeskMap leaves home and is kept for the record.

## Change, 16 November 2026 (round 4)

Home becomes a map. The project cards give way to DeskMap: every project as one lane on a shared two-week axis, opening large at the top of home and folding slim and pinned as you scroll to Needs you. What waits on the owner pops up on its project's lane in the StatusMark tint and, tapped, lights its row in Needs you (decisions/questions/P-005-design-round-4.md, answers 6 to 8). ProjectCard stays in the library but is no longer used on home.

## Principles

- **Neutral first, one blue.** The only hue is blue, and it means one thing: selected, or now. Nothing is coloured for decoration. The one exception is status: soft green, yellow and red say whether a phase, milestone, sprint or event is on track, waiting on you, or stopped (round 3).
- **Rows, not boxes.** Lists are plain rows on the ground, split by inset hairlines. Cards are kept for things you can open.
- **Round shapes.** Controls are capsules and circles; sheets and popovers have a 28 radius. Nothing is square.
- **The timeline's track is pressed in.** The trunk and its branches are a 6-point groove (`groove`, `shadow-groove`), the opposite of the raised chips; done work fills it (`groove-fill`).
- **Main stands out.** On the lane graph, main's groove is wider and darker (`groove-main`) and its icons sit on dark discs (`main-mark`); every branch takes its own lane while it is open.
- **The work between events is a plan.** Each step shows its actions (ActionPlan): what was planned, why, any problem and what was done about it, ticked off as it goes, numbered from phase to action. Red (`problem`) is used only for problems.
- **Chips are raised.** A light top edge, a darker bottom edge and a small drop make chips read as pressable; the selected chip lifts a little more.
- **Floating controls are glass.** Top buttons, the capsule, the tab bar and the round button float over the content: `surface-floating` is 78% opaque and blurs what is behind, and `shadow-float` adds a soft drop and a white inner edge. Sheets and popovers are frosted the same way. Rows and text never cast a shadow.
- **The system font.** One family at a few sizes: 27, 19, 17, 15 and 13. Weight does the work, not colour.
- **Everything rises.** Settings and tools come up in bottom sheets; short choices open as popovers from the button that asked.

## Foundations

**Colour.** Tokens are semantic (`ground`, `surface`, `text-1`, `accent`). Light is sampled from the references. Dark is **assumed**: the references show no dark mode, so its values follow the usual iOS dark neutrals, and they are not yet reviewed.

**Type.** The system font (`sans`) only. On an iPhone or Mac it is SF Pro, as in the references; elsewhere the nearest system face stands in. Ids such as S-011 sit in captions in the same font: the references have no monospace, and the desk's monospace breadcrumb is dropped.

**Icons.** Craft draws Apple's SF Symbols, which a web page cannot use. The library uses Phosphor (MIT licence), the closest open set: **regular** weight for list rows, **bold** for controls, tabs and menus, and the **filled** form for anything selected (the selected tab, the selected chip, the waiting bell). Sizes: 22 in rows and chips, 24 in top buttons, 26 in the capsule and menus, 27 in the tab bar. The circled More is drawn by hand to match SF's.

**Spacing.** 16 is the screen margin, 8 the gap between chips and cards, 12 the sheet inset and 24 the gap between sections. Section headings sit 8 in from the title (x 24). On a 393 by 852 screen: status bar 54, top buttons 6 below it, the large title at y 136, search at y 188, the tab bar 22 from the bottom. Measures are points, used as px.

**Size.** The fixed control sizes (44 hit, 40 chip, 48 row, 42 menu row, 62 tab bar, 56 round button, 36 capsule) are tokens in their own family.

## Legibility: three values made darker

Words must reach 4.5:1 against what they sit on. Three reference values fall short, so the tokens use a darker value; the original grey is kept, for icons only:

| Use | Reference | Token value | Ratio |
|---|---|---|---|
| Secondary words (`text-2`) | #7e8084, 3.6:1 on ground | #6b6d71 | 4.7:1 on ground, 5.2:1 on white |
| Apply fill (`accent`) | #3a85f6, white 3.6:1 | #2f6fd6 | 4.8:1 |
| Blue text button (`accent-text`) | #0a80d7, 4.1:1 on white | #0a6fc0 | 5.2:1 |
| Icons and placeholders (`icon`) | #7e8084 | kept | 3.6:1, so never words on their own |

`text-3` (2.2:1) and `text-4` (1.5:1) are for marks such as dots, chevrons and counts, never for words that matter. The other text pairs pass: `text-1` 15.2:1 on ground; selected-chip label 6.3:1; Now title 4.7:1; Done label 15.9:1; Cancel 6.6:1.

## Using the elements

- One LargeTitle per screen. Groups get a SectionHeading. Sheets use CapsLabel inside them.
- The TabBar holds the main sections as icons only, and each still needs a name for screen readers. The one RoundButton beside it is Now.
- A row of named FilterChips switches projects: every chip shows its name, and the selected one adds its count (the owner's choice, 15 November 2026). Chips are raised a little by `shadow-chip`.
- Only one NowBlock per plan.
- A BottomSheet always has a Done; Apply and Cancel pairs sit at the foot of a sheet.
- Motion: opening a project is a push, the desk out to the right and the plan in from the left, already on Now, in about half a second (the owner's choice, 15 November 2026). Nothing draws from the top down. Sheets still rise. The reduced-motion setting turns motion off.

## Open, the owner's to choose

- Colour: on hold except for status. The owner, 15 November 2026: "Hold tight on the colors for now, the design needs to be ironed out"; later that day the owner chose red, yellow and green gauges and marks, made softer (round 3, answers 4, 7, 9 and 13).
- The key shapes for milestones and sprints, and how "planned" is drawn on the trunk (TimelineTrunk shows a dashed ring as a placeholder). The owner, 15 November 2026: "I think that will get changed around a bit as well".
- Positions: DeskHome puts the elements together at phone width. Comment on any card to move, resize or drop an element.
