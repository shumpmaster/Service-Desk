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

**The redesign direction.** The owner has ruled it: desk mockup v2, with Home, "is the direction
for the whole desk" (decisions/questions/P-001-redesign-direction-v2.md, A, 2026-10-20). That answer
also closes questions/P-001-redesign-direction.md (decisions/questions/P-001-redesign-direction.md).
Mockup v2 as answered is orch/desk-mockup-v2 at d2afcfc: docs/design/mockups/desk-v2.html, with its
frames and notes in docs/design/mockups/desk-v2/README.md. So:
- every change is judged with checklist part A, against the standing rulings;
- a change that carries out the direction is also judged with part B, against mockup v2, only as far
  as v2 draws the point it touches. A point v2 does not draw is judged by part A alone;
- where a ruling made after d2afcfc differs from a frame (for example P-001-timeline-labels.md picks
  frame 7b's grey labels over 7a's coloured ones), the later ruling governs;
- the rulings on the board, the tabs and the typeface stay standing rulings, applied through part A;
- no other mockup counts as chosen unless a ruling chose it.

**Sized like Linear.** P-001-redesign-conflicts.md items 3 and 5 and P-001-text-box-size.md rule
that sizes, and the Timeline's visual formatting, follow Linear's. The owner ruled that "sized like
Linear" "is measured against the mockup you approve next" (decisions/questions/P-001-design-reviewer-stop.md,
A), and then approved mockup v2, whose answer says the Design reviewer "measures "sized like Linear"
against it" (P-001-redesign-direction-v2.md). So sizes are measured against the type scale and sizes
that docs/design/mockups/desk-v2/README.md states ("Sizes as close to Linear's as we could": 24, 18,
15, 13, 12 and 11 px; weights 400, 500 and 600; text boxes at 16 px; board text 11 and 12 px), as
set by the `--t-*` tokens in docs/design/mockups/desk-v2.html. The Timeline's formatting is measured
against frame 7b and its full-length capture. A size the mockup does not state is not a finding.

## The owner's standing rulings

All in decisions/questions/. Each is cited by file; read the file for the full words.

The agreed screens, and the owner's changes to them
- **P-001-design-pick.md.** The five agreed screens (Home, Project, Team, Timeline, and Queue with
  its response card) are the desk's one design direction; the design lab ends. They are drawn in
  docs/design/screens/01-home.html, 02-project.html, 03-team.html, 04-timeline.html and
  06-queue.html. As the direction it is replaced by P-001-redesign-direction-v2.md; the screens as
  built stand until a change carries out mockup v2. Its font line ("the phone's own font, not
  Inter") is replaced by P-001-redesign-type.md, below.
- **P-001-trial-view-notes-1.md** (2026-10-14 and 15):
  - Home: each card shows a brief summary from the project's README (shown clipped, as
    P-001-tile-summary-clip.md later ruled); the "latest" line moves into a bubble; the cards stay a
    two-column grid on the phone (replaced by P-001-home-tiles.md: full width on the phone); three
    collapsible groups, Active, Done, and Closed or not applicable.
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
    from the project's plan; "why: not recorded" until one exists (note 6). Narrowed by
    P-001-why-line.md: where no why is written yet, the phase's list says so once, and each milestone
    shows its why only once there is one. Softer text for those
    it does not take on (note 11).
  - The Timeline: one feed, newest at the top, a work breakdown (project, phases, milestones,
    sprints, tasks one tap away); each entry a plain-English title, then technical, context and
    why bullets; checkmarks on the right; planned milestones above Now; "Not tied to a milestone"
    gathered and flagged (notes 7, 8, 18, 21, 24).
  - Each phase its own colour; Technical, Context and Why each their own colour, always with the
    name in words (notes 13, 14); shades re-picked so no colour has two meanings; the swatches
    approved. Note 13 is narrowed by P-001-redesign-conflicts.md item 4: phases may be marked by
    some colour or by icons, so a phase marked by icons alone is not a finding. Note 14's own colours
    for Technical, Context and Why are replaced by P-001-timeline-labels.md: small grey words.
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
     Linear's visual formatting (measured as "Sized like Linear" above says). Whether the
     Technical, Context and Why labels stay is not ruled.
  4. Some colour or icons may mark phases. Whether Technical, Context and Why keep their own
     colours is not ruled.
  5. Text boxes and element sizes follow Linear's as closely as possible.
- **P-001-text-box-size.md**: A — text boxes keep text at least 16 px, so the phone never zooms;
  everything else is sized like Linear. The 16 px rule is enforced now; "sized like Linear" only
  once the next mockup is approved, as above.

What waits on the owner, and how it reads
- **P-001-design-discovery.md**: "I want to glance for a few seconds, but pick up enough information
  from that glance to know where to press into more details." "I like a clean, modern look, that
  facilitates a drill down workflow. I want to naturally live at that car dashboard level - but not
  get hit in the face with it right off the bat." Kinds of decision told apart visually, without
  ranking them (answer 6). "New since you last looked" markers: "Yes absolutely, I want to know all
  the agents that are working, what they’re working on, why they’re working on it, what has
  changed, etc…" (answer 8).
- **P-001-design-lab-1.md**: "Absolutely no fake numbers." The agent panel shows who has the ball.
  Each project keeps its own queue, grouped by kind of action; "I don't like to "cross boundaries"
  when I work."
- **P-001-build-path.md**, question 1: an open pull request waiting for the owner's approval or merge
  counts as "needs you"; other pull requests show as activity only. Narrowed later by
  **P-001-answer-pr-on-desk.md** (one the automatic job may merge shows as "Being recorded by the
  automatic job", not counted) and **P-001-board-after-agents.md** (one still waiting on the agents'
  fixes is not counted; a quiet line, "With the agents: <n>"), and **P-001-domain-review-count.md**
  (A: one waiting on a reviewer's verdict joins that line until every reviewer has given a verdict and
  it needs the owner).
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
- **P-001-acting-route.md**: A — the desk answers through prefilled GitHub links: each card's answer
  button opens GitHub's new-file page with the answer filled in, and the owner taps Commit; the desk
  holds no write credential.
- **P-001-github-app-links.md**: answer links stay as they are, pointing at GitHub's new-file page;
  the owner's phone opens github.com links in the browser, not the GitHub app.
- **P-001-notifications.md**: phone notifications are Web Push to the desk installed on the owner's
  iPhone Home Screen, sent by the Orchestrator's GitHub run when it raises a card. The file also
  records that permission is asked after a tap, never on load, and that the tap opens the card.
- **P-001-notify-job-merges.md**: A — a pull request the automatic job will merge sends no
  notification; only what truly needs the owner does, including one the job leaves for the owner.

Work ahead
- **P-001-m3a-date.md**, **P-001-m3a-finish.md**, **P-001-m3a-order.md**, **P-001-m3a-picks.md**: no
  owner-set date; a rough finish range "labelled an expectation, never a deadline"; the owner orders
  milestones only; picks that aren't milestones yet sit under "Not milestones yet".
- **P-001-m3a-when.md**: A — Work ahead is built now in the trial view, tried on the preview first;
  it joins the desk when the chosen design is accepted. **P-001-m3a-done-when.md**: A — M3A is done
  when the desk shows each milestone ahead with the Chief of Staff's rough estimate and a rough
  finish, the owner's chosen order is recorded from the desk, and later work that is not a milestone
  yet can be asked for from the desk as a milestone. **P-001-m3a-estimator.md**: A — the Chief of
  Staff makes one rough estimate per milestone, recorded in Service-Desk with its date.
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
- **P-001-gate-card.md**: gate rulings get their own card. **P-001-gate-buttons.md**: A — its choices
  show as buttons on the board and in its sheet; a tap only opens a filled-in answer the owner still
  saves on GitHub.
- **P-001-standard-milestones.md**: standard milestones folded, one line per phase, skipped ones named.
- **P-001-redesign-nav.md**: tabs at the bottom, one tap each; "maybe we end up with more than 3
  tabs". Its "Waiting opening first" and its Projects tab are replaced by P-001-home-tab.md, below.
- **P-001-redesign-type.md**: IBM Plex, with Plex Mono for references and times, and one vermilion
  accent meaning only "needs you". It is later than P-001-design-pick.md, and its blast radius is
  the page's typeface, so it replaces design-pick's font line. The desk's "needs you" colour,
  `--you`, is already #d23c0f in light and #ff6a3d in dark, the audit's vermilion.

Mockup v2 and its details (2026-10-20)
- **P-001-redesign-direction-v2.md**: A — mockup v2, with Home, is the direction for the whole desk,
  planned the board first, through the usual checks and build, in the trial view.
- **P-001-home-tab.md**: A — the desk opens on Home; the bar is Home · Waiting · Plan; Waiting keeps
  its badge, one tap away; no Projects tab.
- **P-001-home-tiles.md**: A — project tiles on Home are full width on the phone, one per row; two to
  a row only on a wider screen.
- **P-001-portfolio-tab.md**: A — no Portfolio tab yet; the portfolio sits at the foot of Home, and a
  fourth tab comes when it holds more.
- **P-001-timeline-labels.md**: A — on the Timeline, Technical, Context and Why are small grey words;
  colour is left for what needs the owner.
- **P-001-why-line.md**: A — where no standard milestone's why is written yet, the phase's list says
  so once; each milestone shows its why only once there is one.
- **P-001-domain-review-count.md**, **P-001-gate-buttons.md**: above.

This setup
- **P-001-design-reviewer-stop.md**: A — the round-3 findings fixed, the setup sent to the owner with
  no fourth review. **P-001-design-reviewer-verdict.md**: A — a fresh Reviewer confirms only that the
  round-3 findings are fixed; its verdict is recorded, then the setup goes to the owner.

Mockup v2's own "Not ruled" list (desk-v2/README.md) has items with no owner answer yet: 1c (the
README summary on each tile), 1d (four "since you last looked" lines), 1e (the tile's strip read left
to right), 5 (own and standard milestones together) and 7 (Plan read top down). They are not rulings;
where one meets a ruling, it is listed under "Conflicts awaiting the owner".

**Spec points, not owner conflicts.** These are for the Definer to bring into specs/S-001.md, not
for the owner: S-001 AC42 allows no web font from another origin, so IBM Plex would be served from
the desk itself; S-001 AC62's "Every word kept" test predates P-001-redesign-conflicts.md, item 1;
AC54's two-column grid predates P-001-home-tiles.md; AC57's "why: not recorded" on each milestone
predates P-001-why-line.md; AC48's colours for Technical, Context and Why predate
P-001-timeline-labels.md; AC57's key above the phase boxes is not drawn in mockup v2 (conflict 2).

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
   screens as built and changed by those rulings (or, where it carries out mockup v2, part B)? Name
   the ruling it breaks.
2. Spec: does it keep the S-001 criteria it touches among AC35 to AC41 and AC48 to AC79, where no
   later ruling replaces them?
3. Waiting is real: does everything counted as waiting need the owner now, and does everything not
   counted show as its ruling says? (P-001-build-path.md question 1, P-001-answer-pr-on-desk.md,
   P-001-board-after-agents.md, P-001-domain-review-count.md, P-001-notify-deploys.md;
   PROJECT.md intent, "False alarms")
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
   per phase; does a skipped one read as skipped, with its why; and where no why is written yet,
   does the phase's list say so once, with each milestone's why shown once there is one?
   (P-001-standard-milestones.md; P-001-redesign-conflicts.md, item 2; P-001-why-line.md;
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
    finding. On the Timeline, Technical, Context and Why are grey words, not colours.
    (S-001 AC48, AC69; P-001-trial-view-notes-2.md, note 32; P-001-redesign-type.md;
    P-001-timeline-labels.md)
15. Sheets and refresh: does every sheet and bubble have a visible close control and close on a tap
    outside it or Escape; and does a refresh keep open sheets, scroll position and typed text?
    (P-001-trial-view-notes-1.md, notes 9 and 14; S-001 AC56)
16. Long text: is a long summary or ruling line shown as three lines, faded, with the whole text one
    tap away? (P-001-tile-summary-clip.md; P-001-design-lab-answers-followup.md)
17. Answering: where a ruling asks for an answer box (a sheet that answers a question, as
    P-001-trial-view-notes-1.md note 15 rules), does each question have its own, with one choice per
    option, the recommendation labelled and not picked, and room around each choice? A board card
    whose answer is one button per option, each opening a filled-in answer file, passes.
    (P-001-board-answer.md, C; P-001-trial-view-notes-1.md, note 15; P-001-answer-choice-spacing.md)
18. Kinds of decision: do different kinds of ask look different, without one drawn as more urgent
    for its kind alone? (P-001-design-discovery.md, answer 6; S-001 AC38)
19. Plain words first: does each line say what it is in plain words, with codes after it in small
    monospace, and technical detail one step down? (P-001-trial-view-notes-1.md, note 10;
    P-001-trial-view-notes-2.md, note 21; S-001 AC48)
20. Times: are times shown in America/Chicago? (P-001-s001-owner-questions.md)
21. Board: where the change touches the board, does it keep one board grouped by project, all three
    lanes at once, a "kicked back" lane for a card GitHub hasn't confirmed in about 5 minutes, Done
    holding the last 24 hours, a Done card's step button and "Undo" until confirmed, and a gate
    card's choices as buttons on the card and in its sheet? (P-001-board-scope.md,
    P-001-board-layout.md, P-001-board-bounce.md, P-001-board-done-keep.md, P-001-board-done-button.md,
    P-001-gate-card.md, P-001-gate-buttons.md)
22. Tabs and Home: where the change touches navigation, does the desk open on Home, with the bar
    Home · Waiting · Plan at the bottom, Waiting's badge, no Projects tab and no Portfolio tab; and
    are Home's project tiles full width on the phone, with the portfolio at Home's foot?
    (P-001-home-tab.md, P-001-home-tiles.md, P-001-portfolio-tab.md, P-001-redesign-nav.md)
23. Typeface: does every font the change sets use IBM Plex Sans, with Plex Mono for references and
    times? (P-001-redesign-type.md)
24. Motion: is reduced motion respected? (S-001 AC42)
25. Dark mode: do items 9 to 14 hold in the dark theme too? (S-001 AC62, "each screen at 360 px in
    the light and dark themes")

### Part B: a change that carries out the direction (mockup v2)

Each item applies to a change that carries out P-001-redesign-direction-v2.md, only as far as mockup
v2 draws the point, with later rulings applied (see "The redesign direction"). "Frame" and
"README" mean docs/design/mockups/desk-v2.html and docs/design/mockups/desk-v2/README.md. The audit's
brief (docs/design/audit-2026-10-19.md §6) was the background to v2 and is not enforced on its own:
where v2 draws a point, v2 governs; a brief item v2 does not draw is not a finding.

26. Frames: does each screen the change carries out match the frame that draws it, as far as the
    frame draws it? Name the frame and the difference.
27. Sizes: are the only text sizes 24, 18, 15, 13, 12 and 11 px, the only weights 400, 500 and 600,
    text boxes 16 px and board text 11 and 12 px, as the README states and the `--t-*` tokens set?
    (P-001-redesign-conflicts.md item 5; P-001-text-box-size.md; "Sized like Linear" above)
28. Home: does the desk open on Home with its briefing, counted from what the board counts, one tap
    to Waiting; "Since you last looked" with its time and "Mark as seen"; one full-width tile per
    project with its phases as a timeline; and the portfolio, read only, at its foot? (frames H1,
    H4, H5; P-001-home-tab.md, P-001-home-tiles.md, P-001-portfolio-tab.md)
29. Accent: is vermilion used only for "needs you": the kind icons of cards waiting on the owner,
    the diamond, the badge and the spend alert, with agent-owned gaps in a grey diamond? (README,
    "IBM Plex Sans with Plex Mono"; P-001-redesign-type.md; P-001-trial-view-notes-2.md, note 32)
30. Three states: does "not used by this project" read "Not used" or "skipped" with a why, "not
    recorded yet" show a dashed circle with "?", and "no record in the model" a slashed circle?
    (README, "The three states told apart"; frames 6, 6b and 8)
31. Project page: does it show, as frame 5 draws, Overview and Timeline at the top, the one sentence,
    the phase strip with an icon and words for each phase, why the phase ran again, the last action,
    what waits and who is at work, then milestones by phase, folded, read from the bottom up?
32. Timeline: does it match frame 7b: one feed, newest at the top, opened at Now, a compact pinned
    header and phase bands, a thin rail in the phase's colour, one status icon in a circle per
    milestone, sprints folded, and Technical, Context and Why in grey? (P-001-redesign-conflicts.md
    item 3; P-001-timeline-labels.md)
33. Gate sheet: does it show the case's opening (three lines, faded, the whole case one tap away),
    the Critic's view, the user representative's verdict, then each choice saying what follows, with
    "Can't be undone" on the one that can't be? (frame 4; P-001-gate-card.md, P-001-gate-buttons.md)
34. Undo and timeouts: are "Can't be undone" and "settles itself" told apart on the card and in the
    sheet, by icon and words, never by colour alone? (README; frames 3 and 3b; S-001 AC38)
35. Keys: is no legend or key added? Mockup v2 draws none; each icon carries its word (frame 5,
    "an icon and words for each").

An unverifiable claim is a FAIL. "Looks good" is a FAIL. Taste alone is not a finding: each finding
names a checklist item, a ruling or a criterion.

**Watch for (not enforced).** The marks the research names as the generic "AI" look: "Inter
everywhere, purple gradients, rounded shadowed cards, default component tokens"
(docs/design/references/research-2026-10-19-modern-mobile-design.md, summary). Name any you see as a
note, not a finding.

## Conflicts awaiting the owner

Points where the design audit and a standing ruling or the spec pointed different ways. For each,
whether mockup v2, as the owner approved it, takes a side. Where it does, the point is settled as
drawn in v2. Where it doesn't, the point stays open: the ruling and the spec stand, and the reviewer
never picks a side.

Settled as drawn in mockup v2
1. **Unknown values in words.** Audit brief 3 removed "not recorded" lines. Mockup v2 keeps unknowns
   as words: "unknowns are words ("not set yet", "not recorded yet")" (README, "No figure presented
   as real that isn't"), "why it went back" reads "not recorded" when no record gives one (README,
   "Runs"), and the three states are drawn apart (frames 6, 6b, 8). P-001-why-line.md then sets one
   such line per phase for missing whys.
2. **Legends.** Audit §4.4 and brief 8 cut every key; S-001 AC57 puts one above the phase boxes.
   Mockup v2 draws no key on any frame, and its phase strip gives "an icon and words for each"
   (README, frame 5). AC57's key is a spec point (above).
3. **Navigation.** The built project screens carry the bar "Status · Timeline · Team · Queue" (S-001
   AC48; the lab's "+" is not built). Mockup v2 replaces it: the app bar is Home · Waiting · Plan
   (P-001-home-tab.md), what waits is one board for all projects, filtered by a tap on a project's
   name (frames 1 and 2; P-001-board-scope.md), and a project's page has "Overview and Timeline at
   the top" (frame 5). The Timeline itself is kept by P-001-redesign-conflicts.md item 3. Team is
   not settled: see 8.
4. **Technical, Context and Why.** Settled by P-001-timeline-labels.md: the labels stay, as small
   grey words (frame 7b).
5. **Reading order of phases and milestones.** Audit §4.4 ordered lists top-down. Mockup v2 reads
   them from the bottom up, as P-001-trial-view-notes-2.md note 15 rules (README, "Bottom up";
   frame 5).
6. **Other cuts.** The two-column grid is replaced by full-width tiles (P-001-home-tiles.md). The
   runs and the branch drawing stay: every run listed, earlier ones smaller (README, "Runs";
   frames 6 and H5).
7. **"Not tied to a milestone".** Audit §4.14 cut it. Mockup v2 keeps it, in a grey diamond, as
   agent-owned (README, "IBM Plex Sans with Plex Mono": "Agent-owned gaps, such as "Not tied to a
   milestone", use a grey diamond").

Still open
8. **Team's screen and logs.** Audit §4.7 cut Team's tiles to one "At work now" line and moved the
   running logs to Details. Mockup v2 draws "At work now" lines on the project page and tiles
   (frames 5, 9, H5), but no Team screen and no running log. P-001-design-lab-open.md answer 2
   (Team inside each project), P-001-trial-view-notes-1.md note 11 (each member's running log) and
   P-001-trial-view-notes-2.md note 30 (each agent card's sprint and milestone) are not replaced.
9. **Answer boxes on a sheet with several questions.** Audit brief 12 allowed one free-text box per
   sheet; P-001-trial-view-notes-1.md note 15 gives each question its own. Mockup v2 draws only
   one-question sheets (frames 3, 3b, 4), so it does not settle a sheet with several.
10. **Plan and the tile strip.** P-001-trial-view-notes-2.md note 15 reads phases, milestones and
    tasks from the bottom up everywhere. Mockup v2 reads Plan top down and draws each tile's phase
    strip left to right, and lists both as not ruled (README, "Not ruled", items 7 and 1e).
11. **The "More detail" fold.** P-001-notify-more-detail.md keeps a closed fold on the current
    desk's Home, holding the notifications switch and the Actions usage bar. Mockup v2 does not draw
    where those two go in the new design.

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
- **Known limit: no ready way to render the fixtures in a real browser yet.** The fixtures under
  tests/desk/fixtures/ feed a fake DOM in tests/desk/sandbox-helpers.mjs and a fake desk function in
  tests/desk/fake-desk.mjs, and `md-extremes` is put together in code (tests/desk/sandbox-fixtures.mjs).
  The first review builds a Playwright setup outside the repository. Mockup v2's README, on frame 7c,
  notes how one capture served the page's calls from the tests' fake desk function.

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

The audit scores every screen against part A, and each screen that carries out mockup v2 against
part B, from each project fixture item 6 names (Members Letter once a fixture exists).
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
