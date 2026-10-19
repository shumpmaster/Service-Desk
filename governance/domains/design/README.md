# Domain pack: design

Read by `design-reviewer` (roster class `reviewer`). Required on the paths that
governance/risk-paths.toml maps to this domain: `src/public/**`, the page the owner sees.
Like security, the domain is configuration, not a framework: this pack, a reviewer-class agent
on the roster, a `[paths."…"]` table in risk-paths.toml, and (T2+) a human in CODEOWNERS for
its paths. It has no domain CI check yet.

Why it exists, in the owner's words (2026-10-19): "an agent with an inscrutable eye for modern UI
that is capable of ensuring that the UI remains clean, easy to use, not heavy, and ultimately
modern - and most importantly that the UI is doing what it needs to to be optimally execute the
strategy/intention behind the project instead of becoming a bloated "live database" look but also
not an AI generated doppleganger." (source: docs/design/references/owner-request-2026-10-19-design-steward.md)

## Context

**What the design must serve.** The desk's job is in docs/PROJECT.md: Strategy (§2), the value
targets V1 to V5 (§6) and the intent (Part 2). In short: put what needs the owner, and the means
to answer it, on one phone screen; never miss a decision; never flag what doesn't need the owner;
let the owner trust "quiet".

**Every project, not only Service-Desk.** The desk shows every project run under the operating
model, at any tier, in any phase, using any mix of the model's parts. The owner pointed out on
2026-10-19 that the desk "became more representative of what this project looks like, rather than
what all projects are supposed to look like" (source: docs/design/references/owner-request-2026-10-19-scope.md).
The inventory of what the model gives every project is docs/design/inventory-2026-10-19.md; it
cites the model by section (OPERATING_MODEL §3, §5, §8).

**How the owner designs.** Through plain words and screenshots, never self-design: the desk does not
edit its own layout, and holds no write credential (decisions/questions/P-001-design-step.md).

**The order of authority.**
1. The owner's standing rulings, below. A standing ruling always beats a checklist item.
2. A later ruling on the same point replaces an earlier one. Where this pack says so below, the
   earlier one is named as replaced.
3. The frozen spec, specs/S-001.md, where no later ruling replaces it.
4. This pack's checklist.

Where two rulings, or a ruling and the spec, seem to disagree on a point no later ruling settles,
the reviewer names both and asks. It never picks a side.

**The redesign direction.** "A direction the owner has ruled" means one thing here: the owner's
answer, in words, to questions/P-001-redesign-direction.md. That question is on hold while the
inventory is done (docs/design/references/owner-request-2026-10-19-scope.md: "The redesign-direction
question is held"), and its timeout default does not apply while it is held. Until the owner
answers it:
- a change is judged against the agreed screens and the standing rulings, with checklist part A;
- the rulings on the board, the tabs and the typeface are standing rulings, applied through part A;
  they do not switch on part B;
- part B (the design audit's brief) applies only after that answer, and only as far as it says;
- no mockup counts as chosen unless a ruling chose it.

## The owner's standing rulings

All in decisions/questions/. Each is cited by file; read the file for the full words.

The agreed screens, and the owner's changes to them
- **P-001-design-pick.md.** The five agreed screens (Home, Project, Team, Timeline, and Queue with
  its response card) are the desk's one design direction; the design lab ends. They are drawn in
  docs/design/screens/01-home.html, 02-project.html, 03-team.html, 04-timeline.html and
  06-queue.html. Its font line ("the phone's own font, not Inter") is replaced by
  P-001-redesign-type.md, below.
- **P-001-trial-view-notes-1.md** (2026-10-14 and 15):
  - Home: each card shows a brief summary from the project's README (shown clipped, as
    P-001-tile-summary-clip.md later ruled); the "latest" line moves into a bubble; the cards stay a
    two-column grid on the phone; three collapsible groups, Active, Done, and Closed or not
    applicable.
  - Status: a "Your last action:" line above the waiting bar; "not recorded" when no record gives one.
  - The "More detail" views redrawn in the new design.
  - A back control that goes one screen back, beside the one to Home.
  - Every sheet has a visible close control, and closes on a tap outside it or Escape.
  - "Done today" rows say what was ruled in words, with the code after it.
  - The Timeline rebuilt to agreed screen 4; milestones as "Bold headings, no colour".
  - A refresh keeps the screen as the owner left it: open sheets, scroll, typed text.
  - Wherever a ruling is asked: each question on its own, with its own answer box (the options as
    choices, the recommendation labelled but not picked, and a text box for the owner's words).
- **P-001-trial-view-notes-2.md** (batch 2, 2026-10-16), approved as drawn in
  docs/design/mockups/status-and-timeline.html (version 6), other-screens.html, colour-swatches.html
  and audit-additions.html:
  - Phases, milestones and tasks read from the bottom up everywhere (note 15).
  - A phase that runs again branches right, one column of dots per run; every phase box lists all
    its runs, earlier ones smaller; a branched-away phase has a lighter dot, said in words too
    (notes 1, 2, 10, 25).
  - One spacing scale (note 3). Every text box's text at least 16 px; pinch-to-zoom not locked
    (note 4).
  - A clear type scale: headings, body text, labels, quoted record text and small print each look
    different (note 5). Its "Every word of text stays" is replaced by P-001-redesign-conflicts.md.
  - Status shows every standard milestone with whether the project takes it on, and a "why" line
    from the project's plan; "why: not recorded" until one exists (note 6). Softer text for those
    it does not take on (note 11).
  - The Timeline: one feed, newest at the top, a work breakdown (project, phases, milestones,
    sprints, tasks one tap away); each entry a plain-English title, then technical, context and
    why bullets; checkmarks on the right; planned milestones above Now; "Not tied to a milestone"
    gathered and flagged (notes 7, 8, 18, 21, 24).
  - Each phase its own colour; Technical, Context and Why each their own colour, always with the
    name in words (notes 13, 14); shades re-picked so no colour has two meanings; the swatches
    approved.
  - Timeline statuses as an icon inside a plain circle, not by colour (note 23).
  - Home's tile: phases bottom up, a small branch drawing, circle icons, a phase-colour stripe, and
    a plain line such as "Design, second time through" in place of "2 of 4 phases finished"
    (note 28; S-001 AC58, AC65).
  - Queue: each item names the milestone it unblocks and why, with its Context one tap away; the
    Queue's group icons go neutral, only the "needs you" diamond keeps colour (note 29).
  - Team: each agent card names the sprint it is on and the milestone it feeds, linked into the
    Timeline, with the circle icons (note 30).
  - One phase marker in every project screen's header, such as "Design · run 2" (note 31).
  - Coral only for what is the owner's (note 32). The ruling that sent a project back shown at each
    branch point (note 33). A stalled-project signal after 3 days (note 34). Each waiting deploy
    says whether it matches a pull request the Reviewer passed (note 35).
  - The owner's description of themself, a generalist who understands process flow, is a standing
    guide: plain terms, from goal to phases to milestones to tasks, technical detail one step down
    (note 21).
- **P-001-design-lab-open.md** (answers 1 to 11): drop Home's "Tell your Chief of Staff…" bar; the
  Team screen inside each project, with each Home card lighting where an agent works; "now" is the
  first phase run with an own milestone that has no work filed; milestones record "reached";
  waiting deploys count as needing the owner; hold cards under Decisions; three upcoming lines and
  30 minutes for "Just finished"; the gate document linked; a re-scoped project stays in Active.
  Answer 4 ("2 of 4 phases finished" in words) is replaced by trial-view notes 2, note 28.
- **P-001-tile-summary-clip.md**, **P-001-design-lab-answers-followup.md**: long summaries and ruling
  lines show three lines, faded, with the whole text one tap away; the owner's file is never edited.
- **P-001-answer-choice-spacing.md**: each answer choice gets more room.

The redesign's five conflicts (2026-10-19)
- **P-001-redesign-conflicts.md**, as read in its file:
  1. "Every word of text stays" no longer holds: text that crowds the page can be cut. The clear
     type scale stays.
  2. Every standard milestone stays shown, the skipped ones too, shown with care (folded, as
     P-001-standard-milestones.md rules).
  3. The Timeline as built stays: one feed, newest at the top, its structure cleaned up and given
     Linear's visual formatting. Whether the Technical, Context and Why labels stay is not ruled.
  4. Some colour or icons may mark phases. Whether Technical, Context and Why keep their own
     colours is not ruled.
  5. Text boxes and element sizes follow Linear's as closely as possible.
- **P-001-text-box-size.md**: A — text boxes keep text at least 16 px, so the phone never zooms;
  everything else is sized like Linear.

What waits on the owner, and how it reads
- **P-001-design-discovery.md**: "I want to glance for a few seconds, but pick up enough information
  from that glance to know where to press into more details." "I like a clean, modern look, that
  facilitates a drill down workflow. I want to naturally live at that car dashboard level - but not
  get hit in the face with it right off the bat." Kinds of decision told apart visually, without
  ranking them (answer 6). "New since you last looked" markers: "Yes absolutely, I want to know all
  the agents that are working, what they're working on, why they're working on it, what has
  changed, etc…" (answer 8).
- **P-001-design-lab-1.md**: "Absolutely no fake numbers." The agent panel shows who has the ball.
  Each project keeps its own queue, grouped by kind of action; "I don't like to "cross boundaries"
  when I work."
- **P-001-build-path.md**, question 1: an open pull request waiting for the owner's approval or merge
  counts as "needs you"; other pull requests show as activity only. Narrowed later by
  **P-001-answer-pr-on-desk.md** (one the automatic job may merge shows as "Being recorded by the
  automatic job", not counted) and **P-001-board-after-agents.md** (one still waiting on the agents'
  fixes is not counted; a quiet line, "With the agents: <n>").
- **P-001-notify-deploys.md**: a deploy waiting for approval counts as waiting on the owner now. It
  replaces line 1 of P-001-design-lab-answers-followup.md for Service-Desk.
- **P-001-asks-merge-on-desk.md**: merged asks-merge pull requests leave the Timeline.
- **P-001-cos-sessions-on-desk.md**: the Chief of Staff's sessions show on the Team screen only.
- **P-001-notify-more-detail.md**: the current desk's Home keeps a closed "More detail" fold holding
  the notifications switch and the Actions usage bar.
- **P-001-notify-which-view.md**: notifications on now with the older view; then the Home Screen icon
  and notification taps open the new design (`?sandbox`).
- **P-001-usage-and-context.md**: B — the desk shows tokens and context-window use from the first
  version. **P-001-o6-fallback.md**: A — where the agent tool does not report context-window use, the
  reported figures show and context-window reads "not available". This replaces the B of
  **P-001-dor-fixes-round3.md**, question 3, a day earlier.
- **P-001-s001-owner-questions.md**: the desk shows times in America/Chicago; a v2.5 project's ruling
  is offered as text to copy.

Work ahead
- **P-001-m3a-date.md**, **P-001-m3a-finish.md**, **P-001-m3a-order.md**, **P-001-m3a-picks.md**: no
  owner-set date; a rough finish range "labelled an expectation, never a deadline"; the owner orders
  milestones only; picks that aren't milestones yet sit under "Not milestones yet".
- **P-001-portfolio-read.md**, **P-001-portfolio-plan.md**: the desk reads the portfolio repository,
  read only; the plan and estimates move there once it does; Work ahead looks the same.

The board, the tabs and the typeface (2026-10-19)
- **P-001-board-direction.md**, **P-001-board-bounce.md**: the board is the waiting-on-you screen; a
  card GitHub doesn't confirm within about 5 minutes moves to a "kicked back" lane, never back.
- **P-001-board-scope.md**: C — one board, grouped by project: in each lane a project's cards sit
  together under its name, and a tap on a project's name shows only that project.
- **P-001-board-layout.md**: all three lanes at once, smaller: "When im on mobile the text can be
  small because its closer to my face."
- **P-001-board-answer.md**: one button per option, the recommendation labelled, not chosen.
- **P-001-board-done-keep.md**: Done keeps the last 24 hours. **P-001-board-done-button.md**: a Done
  card keeps its step button and "Undo" until GitHub confirms it.
- **P-001-gate-card.md**: gate rulings get their own card.
- **P-001-standard-milestones.md**: standard milestones folded, one line per phase, skipped ones named.
- **P-001-redesign-nav.md**: tabs at the bottom, one tap each, Waiting first; "maybe we end up with
  more than 3 tabs".
- **P-001-redesign-type.md**: IBM Plex, with Plex Mono for references and times, and one vermilion
  accent meaning only "needs you". It is later than P-001-design-pick.md, and its blast radius is
  the page's typeface, so it replaces design-pick's font line. The desk's "needs you" colour,
  `--you`, is already #d23c0f in light and #ff6a3d in dark, the audit's vermilion.

Still open: questions/P-001-redesign-direction.md (on hold, above).

**Spec points, not owner conflicts.** These are for the Definer to bring into specs/S-001.md, not
for the owner: S-001 AC42 allows no web font from another origin, so IBM Plex would be served from
the desk itself; S-001 AC62's "Every word kept" test predates P-001-redesign-conflicts.md, item 1.

## Refute checklist

Each item is a yes-or-no question on a screenshot, the rendered text, the computed styles or the
diff, with its source. Spec criteria are in specs/S-001.md.

**What part A judges.** Part A judges what the change adds or alters. A failure already on a screen
before the change, and not made worse by it, is a non-blocking finding: report it, with its
evidence, as a follow-up to file, not a FAIL. Known follow-up: the `--soft` colour in
src/public/sandbox.css (#8a919a light, #6f7680 dark) measures 3.18:1 on the light card surface and
3.88:1 on the dark one, under item 10's 4.5:1 for text.

### Part A: every change, now

1. Rulings: does the change keep every standing ruling above that covers what it touches, and the
   agreed screens as those rulings changed them? Name the ruling it breaks.
2. Spec: does it keep the S-001 criteria it touches among AC35 to AC41, AC48 to AC72 and AC77 to
   AC79, where no later ruling replaces them?
3. Waiting is real: does everything counted as waiting need the owner now, and does everything not
   counted show as its ruling says? (P-001-build-path.md question 1, P-001-answer-pr-on-desk.md,
   P-001-board-after-agents.md, P-001-notify-deploys.md; PROJECT.md intent, "False alarms")
4. Quiet is honest: does the screen never say "Quiet" while a project is unread or can't be read,
   showing "Checking…" or "Can't read since HH:MM" instead? (S-001 AC4, AC5; PROJECT.md intent,
   "Missed decisions")
5. No made-up figures: is every number, date, bar or trend taken from a record; is an unknown shown
   in words, never as a value or zero; is every estimate labelled as one? (P-001-design-lab-1.md;
   P-001-m3a-date.md; P-001-o6-fallback.md; S-001 AC41)
6. Every project: does each screen the change touches render without error or sideways overflow
   from each project fixture in tests/desk/fixtures/: `service-desk/`, `poom/` (the older pipeline;
   lines only, the repository is private) and `md-extremes/` (5 projects, 12 waits, long titles)?
   (the owner's scope point, docs/design/references/owner-request-2026-10-19-scope.md; S-001 AC42,
   "survives the extremes") The made-up "Members Letter" of docs/design/inventory-2026-10-19.md §6,
   which uses every part of the model, has no fixture yet; it joins this item once one exists.
7. Standard milestones: is every standard milestone shown, the skipped ones too, folded one line
   per phase; does a skipped one read as skipped, with its why; and does a missing why read
   "why: not recorded"? (P-001-standard-milestones.md; P-001-redesign-conflicts.md, item 2;
   P-001-trial-view-notes-2.md, notes 6 and 11)
8. Type roles: do headings, body text, labels, quoted record text and small print each look
   different? (P-001-trial-view-notes-2.md, note 5; P-001-redesign-conflicts.md, item 1)
9. Text boxes: is every text box's text at least 16 CSS px, and is zoom left unlocked?
   (P-001-text-box-size.md; P-001-trial-view-notes-2.md, note 4; S-001 AC63)
10. Contrast: is every piece of text at least 4.5:1 against its background, in light and dark?
    (WCAG 2, success criterion 1.4.3, level AA) WCAG's own exceptions apply: large-scale text (at
    least 24 px, or 18.66 px bold) needs 3:1, and incidental text and logotypes need none. The
    spec's own bar for drawing, not text: S-001 AC57's run-3 and run-4 column shades need at least
    3:1 against the page and card surfaces; they are judged by that, not by 4.5:1.
11. Tap targets: is every sheet's and bubble's close control at least 44 by 44 CSS px (S-001 AC56),
    and every other target at least 24 by 24 CSS px (WCAG 2.2, success criterion 2.5.8, level AA)?
    WCAG's own exceptions apply, in its words: "Spacing: Undersized targets (those less than 24 by
    24 CSS pixels) are positioned so that if a 24 CSS pixel diameter circle is centered on the
    bounding box of each, the circles do not intersect another target or the circle for another
    undersized target; Equivalent: The function can be achieved through a different control on the
    same page that meets this criterion; Inline: The target is in a sentence or its size is
    otherwise constrained by the line-height of non-target text; User agent control: The size of
    the target is determined by the user agent and is not modified by the author; Essential: A
    particular presentation of the target is essential or is legally required for the information
    being conveyed."
12. Width: does nothing scroll sideways at 360 px and 414 px wide? (S-001 AC42, "works at 360 px";
    S-001's tests and the audit's captures use 360×740 and 414×896)
13. Colour alone: does every colour that carries a meaning also have a word, an icon or a shape?
    (S-001 AC42; P-001-trial-view-notes-2.md, notes 2 and 13)
14. One meaning per colour: does each meaningful colour keep its one meaning, and is coral
    (`--you`, the vermilion) used only for the owner's own things as S-001 AC69 lists them, never on
    a gap the agents fill? AC69's own list, as its test (tests/desk/ac69-72-audit-additions.test.mjs,
    OWNER_CORAL) allows it, includes the "Your last action" line and its label; that use is not a
    finding. (S-001 AC48, AC69; P-001-trial-view-notes-2.md, note 32; P-001-redesign-type.md)
15. Sheets and refresh: does every sheet and bubble have a visible close control and close on a tap
    outside it or Escape; and does a refresh keep open sheets, scroll position and typed text?
    (P-001-trial-view-notes-1.md, notes 9 and 14; S-001 AC56)
16. Long text: is a long summary or ruling line shown as three lines, faded, with the whole text one
    tap away? (P-001-tile-summary-clip.md; P-001-design-lab-answers-followup.md)
17. Answering: does each question have its own answer box, with one choice per option, the
    recommendation labelled and not picked, and room around each choice? (P-001-board-answer.md;
    P-001-trial-view-notes-1.md, note 15; P-001-answer-choice-spacing.md)
18. Kinds of decision: do different kinds of ask look different, without one drawn as more urgent
    for its kind alone? (P-001-design-discovery.md, answer 6; S-001 AC38)
19. Plain words first: does each line say what it is in plain words, with codes after it in small
    monospace, and technical detail one step down? (P-001-trial-view-notes-1.md, note 10;
    P-001-trial-view-notes-2.md, note 21; S-001 AC48)
20. Times: are times shown in America/Chicago? (P-001-s001-owner-questions.md)
21. Board: where the change touches the board, does it keep one board grouped by project, all three
    lanes at once, a "kicked back" lane for a card GitHub hasn't confirmed in about 5 minutes, Done
    holding the last 24 hours, and a Done card's step button and "Undo" until confirmed?
    (P-001-board-scope.md, P-001-board-layout.md, P-001-board-bounce.md, P-001-board-done-keep.md,
    P-001-board-done-button.md)
22. Tabs: where the change touches navigation, are the tabs at the bottom, one tap each, with
    Waiting opening first? (P-001-redesign-nav.md)
23. Typeface: does every font the change sets use IBM Plex Sans, with Plex Mono for references and
    times? (P-001-redesign-type.md)
24. Motion: is reduced motion respected? (S-001 AC42)
25. Dark mode: do items 9 to 14 hold in the dark theme too? (S-001 AC62, "each screen at 360 px in
    the light and dark themes")

### Part B: once the owner answers the redesign direction

Each item applies only after the owner answers questions/P-001-redesign-direction.md, only as far as
that answer says, and never against a standing ruling or a conflict listed below. "Brief N" is
docs/design/audit-2026-10-19.md §6; "principle N" is
docs/design/references/research-2026-10-19-modern-mobile-design.md §12. Brief 3 (no empty fields)
and brief 4 (four text sizes) are left out: P-001-redesign-conflicts.md and P-001-text-box-size.md
now rule those points.

26. Does every screen's title say its job in six words or fewer? (brief 1)
27. At 414×896, does the top 400 CSS px of the opening screen hold the waiting count and the first
    waiting item with its verb? (brief 2; principle 1)
28. Colour from tokens only: at most five neutrals, one accent, two status colours, and ten
    distinct computed colours per screen per theme? (brief 5; see conflict 4)
29. Does the accent mark only "needs you" and the primary action? (brief 6)
30. One filled button per card, and at most one per sheet or screen? (brief 7)
31. No legend or key on any screen? (brief 8; see conflict 2)
32. No card inside a card; never border, left rule and shadow together? (brief 9)
33. One app-level bar of labelled tabs, no per-project tab bar, no link to the screen you are on?
    (brief 10; see conflict 3)
34. Does each sheet open at 60% height or less, showing its title, the decision and the action
    before any scrolling? (brief 11)
35. At most one free-text box per sheet? (brief 12; see conflict 5)
36. Do record ids appear only in mono meta lines, never in a title? (brief 13)
37. Does an empty view show one sentence and "checked N min ago"? (brief 14; principle 12)
38. Is each main-path screen at most 1,800 CSS px long with fixture data? (brief 15)
39. Is every tap area at least 36 px? (audit §5, "Card anatomy")
40. No gradients, no avatars, no shadows? (audit §5, "What makes it distinctive")

An unverifiable claim is a FAIL. "Looks good" is a FAIL. Taste alone is not a finding: each finding
names a checklist item, a ruling or a criterion.

**Watch for (not enforced).** The marks the research names as the generic "AI" look: "Inter
everywhere, purple gradients, rounded shadowed cards, default component tokens"
(docs/design/references/research-2026-10-19-modern-mobile-design.md, summary). Name any you see as a
note, not a finding.

## Conflicts awaiting the owner

Points where the audit's brief and a standing ruling or the spec point different ways, and no later
ruling settles them. Until the owner rules, the ruling and the spec stand, and the part B item is
not enforced. The reviewer never picks a side.

1. **Unknown values in words.** Brief 3 removes any field reading "not recorded", "not available",
   "none" or "no … yet" from the main path. P-001-redesign-conflicts.md, item 1, lets crowding text
   be cut, but does not say whether an unknown's line goes. P-001-trial-view-notes-1.md note 6,
   P-001-trial-view-notes-2.md note 6 ("why: not recorded"), P-001-o6-fallback.md ("not available") and S-001 AC41 ("Unknown
   shows its words") show them.
2. **Legends.** Brief 8 and audit §4.4 cut every key. S-001 AC57 puts a key above the phase boxes
   (plan review round 2, B2).
3. **Navigation.** Brief 10 allows one app-level bar and no per-project bar; audit §2 folds Queue,
   Team and Timeline into other screens. The built project screens carry a bar, "Status · Timeline ·
   Team · Queue" (S-001 AC48; the lab's "+" is not built), and P-001-design-lab-1.md (each project
   keeps its own queue) and P-001-design-lab-open.md answer 2 (Team inside each project) keep those
   screens. P-001-redesign-nav.md rules the app-level tabs, not whether the project bar stays.
4. **Technical, Context and Why.** Audit §4.14 cuts the Timeline's Technical, Context and Why labels,
   and brief 5 allows one accent and two status colours. P-001-trial-view-notes-2.md notes 7, 8 and
   14 give them labels and colours of their own; P-001-redesign-conflicts.md, items 3 and 4, leaves
   both unruled.
5. **Answer boxes.** Brief 12 and audit §4.5 allow one free-text box per sheet.
   P-001-trial-view-notes-1.md note 15 gives each question its own text box.
6. **Reading order.** Audit §4.4 orders lists top-down. P-001-trial-view-notes-2.md note 15 reads
   phases, milestones and tasks from the bottom up everywhere.
7. **Other cuts.** Audit §4 also cuts Home's half-width card, Status's phase runs and the "More
   detail" fold. P-001-trial-view-notes-1.md note 3 and P-001-tile-summary-clip.md keep the two-column
   grid; P-001-trial-view-notes-2.md notes 1, 2 and 25 keep the runs and the branch drawing;
   P-001-notify-more-detail.md keeps the fold on the current desk's Home.

## Evidence

- Screenshots at 360×740 and 414×896, light and dark, of every screen the change touches, taken with
  Playwright and Chromium (pre-installed in the cloud session). Render the changed page on the
  preview site, or served locally with fixture data; the 2026-10-19 audit used the trial view,
  `/?sandbox`.
- With each screenshot: the rendered text, and a dump of computed font sizes, weights and colours.
  Measure page width against the viewport for item 12.
- Check that the fonts loaded before judging type. A capture on Linux falls back to other fonts.
- Fixture wording ("A made-up…") is not judged; the structure around it is.
- Keep screenshots outside the repository. The reviewer writes nothing inside it.

**No visible change.** Configuration, the security headers, the service worker and notification
logic can all change what the owner sees, so a change to them is not exempt by its kind. The path
applies only when the evidence shows that nothing renders differently: name what changed, and show
why no screen changes (for example, the before and after renders of the screens it could reach
match). Then the verdict may PASS without the full screenshot set. A change to any words, layout,
colour or behaviour the owner sees is a visible change.

## Periodic audits

Besides each pull request, the design reviewer audits the whole desk:
- when the owner accepts each Design milestone (for Service-Desk, MD1 to MD3; for another project,
  its own Design milestones), and
- once a month.

The audit scores every screen against part A, and against part B once the owner has answered the
redesign direction, from each project fixture item 6 names (Members Letter once a fixture exists).
It uses the form of docs/design/audit-2026-10-19.md: a short verdict, the job of each screen, a
scorecard, the bloat list by impact, what to keep, and choices for the owner. It opens with a
plain-English paragraph. Anything that meets a standing ruling is put as a choice for the owner,
never as a fix. The orchestrator records it verbatim at docs/design/audit-<date>.md. The audit
changes nothing itself.

## Verdict

`Verdict: PASS | FAIL`, then evidence for each checklist item that applies (the screenshot, the text
or style dump, the file and line), or the "No visible change" evidence, then non-blocking findings
already present before the change, then open questions. The orchestrator records the verdict
verbatim in reviews/<PR>/design-reviewer.md. The design reviewer never fixes what it finds.
