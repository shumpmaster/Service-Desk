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
The inventory of what the model gives every project, and its three test projects, is
docs/design/inventory-2026-10-19.md; it cites the model by section (OPERATING_MODEL §3, §5, §8).

**How the owner designs.** Through plain words and screenshots, never self-design: the desk does not
edit its own layout, and holds no write credential (decisions/questions/P-001-design-step.md).

**The order of authority.**
1. The owner's standing rulings, below. A standing ruling always beats a checklist item.
2. The frozen spec, specs/S-001.md, where it has not been replaced by a later ruling.
3. This pack's checklist.
Where two of the owner's rulings, or a ruling and the spec, seem to disagree, the reviewer names
both and asks; it never picks a side.

**Until the owner rules on the redesign direction.** The question "Is the redesign mockup the
direction for your whole page?" is open (questions/P-001-redesign-direction.md; its default, C,
builds the board only and leaves the other screens as they are). Until it is ruled:
- a change is judged against the agreed screens and the standing rulings, with checklist part A;
- part B (the design audit's brief, docs/design/audit-2026-10-19.md §5 and §6) applies only to a
  change that carries out a direction the owner has ruled, and only as far as that ruling says;
- no item of part B is enforced where it meets a conflict listed under "Conflicts awaiting the
  owner";
- no mockup counts as chosen unless a ruling chose it.

## The owner's standing rulings

All in decisions/questions/. Each is cited by file; read the file for the full words.

The agreed screens
- **P-001-design-pick.md.** The five agreed screens (Home, Project, Team, Timeline, and Queue with
  its response card) are the desk's one design direction; the design lab ends. They are drawn
  in docs/design/screens/01-home.html, 02-project.html, 03-team.html, 04-timeline.html and
  06-queue.html. Its font line: "the desk uses the phone's own font, not Inter".
- **P-001-trial-view-notes-1.md**, the owner's changes to those screens (2026-10-14 and 15):
  - Home: each card shows a brief summary from the project's README; the "latest" line moves into a
    bubble; the cards stay a two-column grid on the phone; three collapsible groups, Active, Done,
    and Closed or not applicable.
  - Status: a "Your last action:" line above the waiting bar; "not recorded" when no record gives one.
  - "More detail" views redrawn in the new design ("Rebuild in new design").
  - A back control that goes one screen back, beside the one to Home.
  - Every sheet has a visible close control, and closes on a tap outside it or Escape.
  - "Done today" rows say what was ruled in words, with the code after it.
  - The Timeline rebuilt to agreed screen 4; milestones stand out as "Bold headings, no colour".
  - A refresh keeps the screen as the owner left it: open sheets, scroll, typed text.
  - Wherever a ruling is asked: each question on its own, with its own answer box (the options as
    choices, the recommendation labelled but not picked, and a text box for the owner's words).
- **P-001-trial-view-notes-2.md**, batch 2 (2026-10-16), approved as drawn in
  docs/design/mockups/status-and-timeline.html (version 6), other-screens.html, colour-swatches.html
  and audit-additions.html:
  - Phases read from the bottom up everywhere, Discovery at the bottom, Done at the top (note 15).
  - A phase that runs again branches right; one column of dots per run; every phase box lists all
    its runs, earlier ones smaller; a branched-away phase has a lighter dot, said in words too
    (notes 1, 2, 10, 25).
  - One spacing scale (note 3). Every text box's text at least 16 px; pinch-to-zoom not locked
    (note 4).
  - "a clear type scale, with headings, body text, labels, quoted record text and small print each
    looking different, so long pages don't blur together. Every word of text stays." (note 5)
  - Status shows, in order, every standard milestone with whether the project takes it on, and a
    "why" line from the project's plan for each; "why: not recorded" until one exists (note 6).
  - Softer text for milestones the project does not take on (note 11).
  - The Timeline: one continuous feed, a work breakdown (project, phases, milestones, sprints,
    tasks one tap away); each entry a plain-English title, then technical, context and why
    bullets; checkmarks on the right; planned milestones above Now; "Not tied to a milestone"
    gathered and flagged (notes 7, 8, 18, 21, 24).
  - Each phase its own colour; Technical, Context and Why each their own colour, always with the
    name in words (notes 13, 14); shades re-picked so no colour has two meanings ("Pick distinct
    shades"); the swatches approved.
  - Statuses on the Timeline as an icon inside a plain circle, not by colour (note 23).
  - Coral only for what needs the owner; agent-owned gaps neutral (note 32). The ruling that sent a
    project back shown at each branch point (note 33). A stalled-project signal after 3 days (note 34).
  - The owner's description of themself, a generalist who understands process flow, is a standing
    guide: plain terms, from goal to phases to milestones to tasks, technical detail one step down.
- **P-001-design-lab-open.md** (answers 1 to 11): drop Home's "Tell your Chief of Staff…" bar; the
  Team screen inside each project, with each Home card lighting where an agent works; "now" is the
  first phase run with an own milestone that has no work filed; the phase checklist in words with no
  bar; milestones record "reached"; waiting deploys count as needing the owner; hold cards under
  Decisions; three upcoming lines and 30 minutes for "Just finished"; the gate document linked;
  a re-scoped project stays in Active.
- **P-001-tile-summary-clip.md** and **P-001-design-lab-answers-followup.md**: long summaries and
  ruling lines show three lines, faded, with the whole text one tap away; the owner's file is never
  edited.
- **P-001-answer-choice-spacing.md**: each answer choice gets more room.

What counts as waiting
- **P-001-design-discovery.md**: "I want to glance for a few seconds, but pick up enough information
  from that glance to know where to press into more details." "I like a clean, modern look, that
  facilitates a drill down workflow. I want to naturally live at that car dashboard level - but not
  get hit in the face with it right off the bat." Waits bucketed by project. Kinds of decision told
  apart visually, without ranking them.
- **P-001-design-lab-1.md**: "Absolutely no fake numbers." The agent panel shows who has the ball.
  Each project keeps its own queue, grouped by kind of action; "I don't like to "cross boundaries"".
- **P-001-answer-pr-on-desk.md**: pull requests the automatic job may merge show as "Being recorded
  by the automatic job", not counted. **P-001-board-after-agents.md**: one still waiting on the
  agents' fixes is not counted; a quiet line, "With the agents: <n>".
- **P-001-notify-deploys.md**: a deploy waiting for approval counts as waiting on the owner now
  (this replaces line 1 of P-001-design-lab-answers-followup.md for Service-Desk).
- **P-001-asks-merge-on-desk.md**: merged asks-merge pull requests leave the Timeline.
- **P-001-cos-sessions-on-desk.md**: the Chief of Staff's sessions show on the Team screen only.
- **P-001-notify-more-detail.md**: the current desk's Home keeps a closed "More detail" fold holding
  the notifications switch and the Actions usage bar.

Work ahead
- **P-001-m3a-date.md**, **P-001-m3a-finish.md**, **P-001-m3a-order.md**, **P-001-m3a-picks.md**: no
  owner-set date; a rough finish range "labelled an expectation, never a deadline"; the owner orders
  milestones only; picks that aren't milestones yet sit under "Not milestones yet".
- **P-001-portfolio-read.md**, **P-001-portfolio-plan.md**: the desk reads the portfolio repository,
  read only; the plan and estimates move there once it does; Work ahead looks the same.

The board and the redesign (2026-10-19)
- **P-001-board-direction.md**, **P-001-board-bounce.md**: the board is the waiting-on-you screen; a
  card GitHub doesn't confirm within about 5 minutes moves to a "kicked back" lane.
- **P-001-board-layout.md**: all three lanes at once, smaller: "When im on mobile the text can be
  small because its closer to my face."
- **P-001-board-answer.md**: one button per option, the recommendation labelled, not chosen.
- **P-001-board-done-keep.md**: Done keeps the last 24 hours. **P-001-board-done-button.md**: a Done
  card keeps its step button and "Undo" until GitHub confirms it.
- **P-001-gate-card.md**: gate rulings get their own card.
- **P-001-standard-milestones.md**: standard milestones folded, one line per phase, skipped ones named.
- **P-001-redesign-nav.md**: tabs at the bottom, Waiting first; "maybe we end up with more than 3 tabs".
- **P-001-redesign-type.md**: IBM Plex, Plex Mono for references and times, and one vermilion
  accent meaning only "needs you".

Still open, so not rulings: questions/P-001-board-scope.md (one board, or one per project) and
questions/P-001-redesign-direction.md.

## Refute checklist

Each item is a yes-or-no question on a screenshot, the rendered text, the computed styles or the
diff, with its source. Spec criteria are in specs/S-001.md.

### Part A: every change, now

1. Rulings: does the change keep every standing ruling above that covers what it touches, and the
   agreed screens as those rulings changed them? Name the ruling it breaks.
2. Spec: does it keep the look criteria of S-001 it touches (AC41, AC42, AC48 to AC72)?
3. Waiting is real: does everything counted as waiting need the owner now, and is everything not
   counted shown as its ruling says? (P-001-board-after-agents.md, P-001-answer-pr-on-desk.md,
   P-001-notify-deploys.md; PROJECT.md intent, "False alarms")
4. Quiet is honest: does the screen never say "Quiet" while a project is unread or can't be read,
   showing "Checking…" or "Can't read since HH:MM" instead? (S-001 AC4, AC5; PROJECT.md intent,
   "Missed decisions")
5. No made-up figures: is every number, date, bar or trend taken from a record; is an unknown shown
   in words, never as a value or zero; is every estimate labelled as one? (P-001-design-lab-1.md;
   P-001-m3a-date.md; S-001 AC41)
6. Every project: does the change render without error or overflow for each of the three test
   projects in docs/design/inventory-2026-10-19.md §6: Service-Desk; Personal-Org-Operating-Model,
   on the older pipeline; and the made-up "Members Letter", which uses everything? (the owner's
   scope point, docs/design/references/owner-request-2026-10-19-scope.md; S-001 AC42, "survives
   the extremes")
7. Not used, against not recorded: does a part a project skips read as skipped, with its why, and
   never as missing; and does a part it uses but has not recorded read "not recorded"?
   (P-001-standard-milestones.md; P-001-trial-view-notes-2.md, notes 6 and 11)
8. Every word kept: does the change keep the words of every screen part it does not rebuild under a
   ruling? (P-001-trial-view-notes-2.md, note 5; S-001 AC62)
9. Text boxes: is every text box's text at least 16 CSS px, and is zoom left unlocked?
   (P-001-trial-view-notes-2.md, note 4; S-001 AC63)
10. Contrast: is every piece of text at least 4.5:1 against its background, in light and dark?
    (WCAG 2, success criterion 1.4.3, level AA)
11. Tap targets: is every sheet's and bubble's close control at least 44 by 44 CSS px (S-001 AC56),
    and every other tap area at least 24 by 24 CSS px (WCAG 2.2, success criterion 2.5.8, level AA)?
12. Width: does nothing scroll sideways at 360 px and 414 px wide? (S-001 AC42, "works at 360 px";
    S-001's tests and the audit's captures use 360×740 and 414×896)
13. Colour alone: does every colour that carries a meaning also have a word, an icon or a shape?
    (S-001 AC42; P-001-trial-view-notes-2.md, notes 2 and 13)
14. One meaning per colour: does each meaningful colour keep its one meaning, and does the
    "needs you" colour mark only what needs the owner? (S-001 AC48, AC69;
    P-001-trial-view-notes-2.md, note 32 and "Pick distinct shades")
15. Sheets and refresh: does every sheet and bubble have a visible close control and close on a tap
    outside it or Escape; and does a refresh keep open sheets, scroll position and typed text?
    (P-001-trial-view-notes-1.md, notes 9 and 14; S-001 AC56)
16. Long text: is a long summary or ruling line shown as three lines, faded, with the whole text one
    tap away? (P-001-tile-summary-clip.md; P-001-design-lab-answers-followup.md)
17. Answering: does each question have its own answer box, with one choice per option, the
    recommendation labelled and not picked, and room around each choice? (P-001-board-answer.md;
    P-001-trial-view-notes-1.md, note 15; P-001-answer-choice-spacing.md)
18. Kinds of decision: do different kinds of ask look different, without one drawn as more urgent
    for its kind alone? (P-001-design-discovery.md, answer 6)
19. Plain words first: does each line say what it is in plain words, with codes after it in small
    monospace, and technical detail one step down? (P-001-trial-view-notes-1.md, note 10;
    P-001-trial-view-notes-2.md, note 21; S-001 AC48, "The shared look")
20. Motion: is reduced motion respected? (S-001 AC42)
21. Dark mode: do items 9 to 14 hold in the dark theme too? (S-001 AC62, "each screen at 360 px in
    the light and dark themes")
22. Generic kit: does the change add none of the marks the research names as the generic "AI"
    look: Inter everywhere, purple gradients, rounded shadowed cards, default component tokens?
    (docs/design/references/research-2026-10-19-modern-mobile-design.md, summary, "Generic "AI"
    look"; the owner's request above)

### Part B: once the owner rules a direction

Each applies only to a change that carries out a ruled direction, only as far as the ruling says,
and never where it meets a conflict below. "Brief N" is docs/design/audit-2026-10-19.md §6;
"principle N" is docs/design/references/research-2026-10-19-modern-mobile-design.md §12.

23. Does every screen's title say its job in six words or fewer? (brief 1)
24. At 414×896, does the top 400 CSS px of the opening screen hold the waiting count and the first
    waiting item with its verb? (brief 2; principle 1)
25. Does no field read "not recorded", "not available", "none" or "no … yet" on the main path,
    outside Details? (brief 3; see conflict 1)
26. Only the sizes 20, 15, 13 and 11 px, at most three weights, nothing under 11 px? (brief 4;
    audit §5, "Type scale"; see conflict 2)
27. Colour from tokens only: at most five neutrals, one accent, two status colours, and ten
    distinct computed colours per screen per theme? (brief 5; see conflict 3)
28. Does the accent mark only "needs you" and the primary action? (brief 6; P-001-redesign-type.md)
29. One filled button per card, and at most one per sheet or screen? (brief 7)
30. No legend or key on any screen? (brief 8; see conflict 4)
31. No card inside a card; never border, left rule and shadow together? (brief 9)
32. One app-level bar of labelled tabs, no per-project tab bar, no link to the screen you are on;
    does each tab have a ruling that names it? (brief 10; P-001-redesign-nav.md; see conflict 5)
33. Does each sheet open at 60% height or less, showing its title, the decision and the action
    before any scrolling? (brief 11)
34. At most one free-text box per sheet? (brief 12; see conflict 6)
35. Do record ids appear only in mono meta lines, never in a title? (brief 13)
36. Does an empty view show one sentence and "checked N min ago"? (brief 14; principle 12)
37. Is each main-path screen at most 1,800 CSS px long with fixture data? (brief 15; see conflict 7)
38. Is every tap area at least 36 px? (audit §5, "Card anatomy")
39. IBM Plex Sans, with Plex Mono for references, ages and times, confirmed loaded?
    (P-001-redesign-type.md; see conflict 8)
40. No gradients, no avatars, no shadows? (audit §5, "What makes it distinctive")

An unverifiable claim is a FAIL. "Looks good" is a FAIL. Taste alone is not a finding: each finding
names a checklist item, a ruling or a criterion.

## Conflicts awaiting the owner

Places where the audit's brief (part B) and a standing ruling or the spec point different ways. The
orchestrator puts them to the owner with the redesign-direction question. Until then the ruling and
the spec stand, and the part B item is not enforced. The reviewer never picks a side.

1. **"Not recorded" lines.** Brief 3 and audit §4.1 cut them. P-001-trial-view-notes-1.md note 6
   ("not recorded" for the last action), P-001-trial-view-notes-2.md notes 6, 8 and 27 ("why: not
   recorded" until one exists; each Timeline line "or reads "not recorded"") and S-001 AC41 ("Unknown
   shows its words") keep them.
2. **Type.** Brief 4 and audit §5 set four sizes. P-001-trial-view-notes-2.md note 5 asks for a type
   scale where headings, body text, labels, quoted record text and small print each look different,
   and S-001 AC62 sets seven roles. Note 5's "Every word of text stays" also meets the audit's cuts
   (§4).
3. **Colour.** Brief 5 and audit §5 ("Phases get no colour") allow one accent and two status colours.
   P-001-trial-view-notes-2.md notes 13 and 14 give each phase, and Technical, Context and Why, a
   colour of their own (swatches approved); S-001 AC48 gives 14 colours a meaning each.
4. **Legends.** Brief 8 and audit §4.4 cut every key. S-001 AC57 puts a key above the phase boxes
   (plan review round 2, B2).
5. **Navigation.** Brief 10 allows at most three app-level tabs and no per-project bar.
   The agreed screens of P-001-design-pick.md carry a per-project bar, "Status · Timeline · + · Team
   · Queue" (docs/design/README.md, "The shared look"), and
   P-001-redesign-nav.md allows more than three tabs. Audit §2 also folds Queue, Team and Timeline
   into other screens, against the five agreed screens, P-001-design-lab-1.md (each project keeps
   its own queue) and P-001-design-lab-open.md answer 2 (Team inside each project).
6. **Answer boxes.** Brief 12 and audit §4.5 allow one free-text box per sheet.
   P-001-trial-view-notes-1.md note 15 gives each question its own text box.
7. **Length and cuts.** Brief 15 caps a screen at 1,800 CSS px, and audit §4 cuts standard
   milestones, the runs, Timeline's Technical, Context and Why chips, "Not tied to a milestone",
   the half-width card and the "More detail" fold. P-001-standard-milestones.md,
   P-001-trial-view-notes-2.md (notes 1, 2, 7, 8, 14, 21, 25), P-001-trial-view-notes-1.md (note 3,
   the two-column grid), P-001-tile-summary-clip.md and P-001-notify-more-detail.md keep them.
8. **Reading order.** Audit §4.4 orders lists top-down. P-001-trial-view-notes-2.md note 15 reads
   phases, milestones and tasks from the bottom up everywhere.
9. **Typeface and accent.** P-001-redesign-type.md chose IBM Plex and one vermilion accent for the
   redesign. P-001-design-pick.md chose the phone's own font for the agreed screens; S-001 AC42
   allows no web font from another origin; S-001 AC48 and AC69 keep coral as "needs you". Which
   holds for changes to the agreed screens until the direction is ruled?

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

**No visible change.** When the diff changes nothing that renders (for example the security
headers, the service worker, notification logic or configuration), say so, with the evidence: what
changed, and why nothing on screen changes (the file is never loaded as page code, or the changed
lines draw nothing). Then the verdict may PASS without screenshots. A change that alters any words,
layout, colour or behaviour the owner sees is a visible change.

## Periodic audits

Besides each pull request, the design reviewer audits the whole desk:
- when the owner accepts each Design milestone (for Service-Desk, MD1 to MD3; for another project,
  its own Design milestones), and
- once a month.

The audit scores every screen against part A, and, for each direction the owner has ruled, part B,
for all three test projects. It uses the form of docs/design/audit-2026-10-19.md: a short verdict,
the job of each screen, a scorecard, the bloat list by impact, what to keep, and choices for the
owner. It opens with a plain-English paragraph. Anything that meets a standing ruling is put as a
choice for the owner, never as a fix. The orchestrator records it verbatim at
docs/design/audit-<date>.md. The audit changes nothing itself.

## Verdict

`Verdict: PASS | FAIL`, then evidence for each checklist item that applies (the screenshot, the text
or style dump, the file and line), or the "No visible change" evidence, then open questions. The
orchestrator records the verdict verbatim in reviews/<PR>/design-reviewer.md. The design reviewer
never fixes what it finds.
