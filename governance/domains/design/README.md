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
not an AI generated doppleganger." (source: docs/design/references/owner-request-2026-10-19-design-steward.md,
on orch/board-mockup)

## Context

**What the design must serve.** The desk's job is in docs/PROJECT.md: Strategy (§2), the value
targets V1 to V5 (§6) and the intent (Part 2). In short: put what needs the owner, and the means
to answer it, on one phone screen; never miss a decision; never flag what doesn't need the owner;
let the owner trust "quiet". A screen that shows records without helping that job is bloat, however
true the records are.

**Every project, not only Service-Desk.** The desk shows every project run under the operating
model, at any tier, in any phase, using any mix of the model's parts. The owner pointed out on
2026-10-19 that the desk "became more representative of what this project looks like, rather than
what all projects are supposed to look like" (source: docs/design/references/owner-request-2026-10-19-scope.md,
on orch/board-mockup). So judge every change as a frame for any project. Never cut a part only
because Service-Desk leaves it empty, and never add one only because Service-Desk has it. The
inventory of what the model gives every project is docs/design/inventory-2026-10-19.md (on
orch/board-mockup); it cites the model by section (OPERATING_MODEL §3, §5, §8).

**How the owner designs.** Through plain words and screenshots, never self-design: the desk does not
edit its own layout, and holds no write credential (decisions/questions/P-001-design-step.md).

**The owner's design rulings to date.** Each is quoted or cited by its file in decisions/questions/.
A change that goes against one is a FAIL unless a later ruling replaces it.

- Glance, then drill down. "I want to glance for a few seconds, but pick up enough information from
  that glance to know where to press into more details." "I like a clean, modern look, that
  facilitates a drill down workflow. I want to naturally live at that car dashboard level - but not
  get hit in the face with it right off the bat." Kinds of decision look different, without ranking
  them. (P-001-design-discovery.md)
- No made-up figures. "no made up numbers or scores - the visual was just appealing";
  "Absolutely no fake numbers." The owner doesn't like to "cross boundaries" between projects.
  (P-001-design-lab-1.md)
- Long text is clipped to its first three lines, faded, with the whole text one tap away; the
  owner's files are never edited. (P-001-tile-summary-clip.md, P-001-design-lab-answers-followup.md)
- Answer choices need room: the letter apart from its text, space inside and between boxes.
  (P-001-answer-choice-spacing.md)
- The board is the waiting-on-you screen. A card marked done that GitHub doesn't show done after about
  5 minutes moves to a lane of its own ("kicked back"), never back where it came from.
  (P-001-board-direction.md, P-001-board-bounce.md)
- Board layout A: all three lanes at once on a phone, with smaller text and elements. "When im on
  mobile the text can be small because its closer to my face." (P-001-board-layout.md)
- One answer button per option ("Answer A", "Answer B"…), the recommendation labelled, not chosen.
  (P-001-board-answer.md)
- Done keeps the cards finished in the last 24 hours. (P-001-board-done-keep.md)
- Standard milestones come back folded: one line per phase that opens to the list, skipped ones
  named. (P-001-standard-milestones.md)
- Gate rulings get their own card: the case's opening, the Critic's view and, where one runs, the
  user representative's verdict, with the owner's choices as buttons. (P-001-gate-card.md)
- The desk reads the portfolio repository, read only; the plan and estimates move there once it
  does, and Work ahead looks the same. (P-001-portfolio-read.md, P-001-portfolio-plan.md)
- Tabs at the bottom, one tap each, Waiting first, not one scrolling screen; "maybe we end up with
  more than 3 tabs". (P-001-redesign-nav.md)
- IBM Plex Sans, with Plex Mono for references and times, and one vermilion accent that means only
  "needs you". This replaces the phone's-own-font line of P-001-design-pick.md. (P-001-redesign-type.md)
- A pull request still waiting on the agents' fixes doesn't count as waiting on the owner. It shows
  in a quiet line, "With the agents: <n>". (P-001-board-after-agents.md)
- A card moved to Done keeps its step button and "Undo" until GitHub confirms it.
  (P-001-board-done-button.md)

Still open, so not rulings: one board or one per project (questions/P-001-board-scope.md), and the
redesign as the whole page's direction (questions/P-001-redesign-direction.md).

## Refute checklist

Each item is a question with a yes-or-no answer on a screenshot, the rendered text or the computed
styles. Sources: the design brief draft, docs/design/audit-2026-10-19.md §6 ("brief N"), and the
Researcher's principles, docs/design/references/research-2026-10-19-modern-mobile-design.md §12
("principle N"), both on orch/board-mockup.

The job
1. Opening screen: at 414×896, does the top 400 CSS px show the waiting count and the first waiting
   item with its one verb? (brief 2; principle 1)
2. Waiting is real: does everything counted as waiting need the owner now? A pull request still with
   the agents, or anything else the owner can't act on, is a FAIL. (P-001-board-after-agents.md;
   PROJECT.md intent, "False alarms")
3. Quiet is honest: does an empty view say so in one sentence with when it was checked? Does a failure
   use other words and never say "nothing waiting"? (brief 14; principle 12)
4. Every project: does the change hold for each of the three test projects in
   docs/design/inventory-2026-10-19.md §6 (Service-Desk; Personal-Org-Operating-Model on the older
   pipeline; the made-up "Members Letter", which uses everything)? Does any part appear, or vanish,
   only because of what Service-Desk happens to record?
5. Three states told apart: does the screen keep "not used by this project" (say so once, or hide),
   "not recorded yet" (a gap for the agents, under Details) and "can't be recorded" (never shown as
   a gap) apart? (inventory §4)
6. No "not recorded" lines: does a search of the rendered text find no "not recorded", "not available",
   "none" or "no … yet" on the main path, outside the Details list of record gaps? (brief 3)
7. No made-up figures: does every number, bar or trend come from a record, with an unknown drawn as
   unknown? (P-001-design-lab-1.md)
8. Rulings kept: does the change keep every ruling listed under Context? Name the ruling it breaks.

Not a live database
9. Relevance: is every ID, time, chip and label on the main path needed to decide what to do? Do
   record IDs appear only in mono meta lines, never in a title? (principle 2; brief 13)
10. One action: one filled button per card, at most one per sheet or screen? A question card has one
    answer button per option, none pre-chosen? (brief 7; principle 4; P-001-board-answer.md)
11. No legends: does no screen carry a legend or key, and does every status glyph have a word in the
    same row? (brief 8; principle 8)
12. No nested boxes: no card inside a card? Rows or lane cards use a fill or a hairline, never a
    border, a left rule and a shadow together? (brief 9; principle 3)
13. Sheets: do details open in a sheet that shows the title, what is being decided and the action
    before any scrolling? At most one free-text box per sheet? (briefs 11, 12; principle 11)
14. Short pages: is each main-path screen at most two phone screens long (1,800 CSS px) with fixture
    data? Is long text clipped to three lines, the rest one tap away? Does a tip show once and close?
    (brief 15; P-001-tile-summary-clip.md)
15. Navigation: one app-level bar of labelled tabs at the bottom, Waiting first? No per-project tab
    bar, and no link to the screen you are on? Is a new tab's job named in a ruling or the pull
    request's Why? (brief 10; principle 10; P-001-redesign-nav.md)

The look
16. Type sizes: only 20, 15, 13 and 11 px, plus 14 px for row titles if the chosen mockup keeps it
    (docs/design/mockups/linear-inspired/README.md does; redesign-direction.html does not)? At most
    three weights (400, 600, 700)? Nothing under 11 px? Body text not bold? (audit §5; brief 4)
17. Typeface: IBM Plex Sans, with Plex Mono for references, ages and times, confirmed loaded?
    (P-001-redesign-type.md)
18. Colour: every colour from a token on `:root`; at most five neutrals, one accent and two status
    colours; at most ten distinct computed colours per screen per theme? (brief 5)
19. Accent: does vermilion mark only "needs you" and the owner's action, never a heading, a phase or
    decoration? (brief 6; principle 7; P-001-redesign-type.md)
20. Contrast: is every piece of text at least 4.5:1 against its background, in light and dark?
    (WCAG 2 level AA for normal text; the linear-inspired mockup's README records this check)
21. Tap targets: is every tap area at least 36 px? (audit §5)
22. Width: does nothing scroll sideways at 360 px and 414 px wide, in light and dark?
23. Dark mode: do items 16 to 22 hold in dark mode too?
24. Motion: does Done move at once, with pending GitHub steps shown in the row? Is reduced motion
    respected? (principle 13)

Not an AI-generated doppelganger
25. Is the screen free of the generic tells: decorative gradients, emoji as decoration, cards inside
    cards, everything bold, avatars, rounded shadowed cards everywhere, the default kit look? Shadows
    only where the chosen mockup uses them (the linear-inspired mockup's floating bar and sheets)?
    Labels in the owner's plain voice? (principle 15; research summary, "Generic AI look"; audit §5)

An unverifiable claim is a FAIL. "Looks good" is a FAIL. Taste alone is not a finding: each finding
names a checklist item or a ruling.

## Evidence

- Screenshots at 360×740 and 414×896, light and dark, of every screen the change touches, taken with
  Playwright and Chromium (pre-installed in the cloud session). Render the changed page on the
  preview site, or served locally with fixture data; the 2026-10-19 audit used the trial view,
  `/?sandbox`.
- With each screenshot: the rendered text (for items 6 and 9), and a dump of computed font sizes,
  weights and colours (items 16 to 20). Measure page width against the viewport for item 22.
- Check that the fonts loaded before judging type. A capture on Linux falls back to other fonts.
- Fixture wording ("A made-up…") is not judged; the structure around it is.
- Keep screenshots outside the repository. The reviewer writes nothing inside it.

## Periodic audits

Besides each pull request, the design reviewer audits the whole desk:
- when the owner accepts each Design milestone (for Service-Desk, MD1 to MD3; for another project,
  its own Design milestones), and
- once a month.

The audit judges every screen against this checklist and all three test projects. It uses the form
of docs/design/audit-2026-10-19.md: a short verdict, the job of each screen, a scorecard, the bloat
list by impact, what to keep, and choices for the owner. It opens with a plain-English paragraph.
The orchestrator records it verbatim at docs/design/audit-<date>.md. Changes it proposes reach the
owner as questions, or a builder through a brief; the audit changes nothing itself.

## Verdict

`Verdict: PASS | FAIL`, then evidence for each checklist item (the screenshot, the text or style
dump, the file and line), then open questions. The orchestrator records the verdict verbatim in
reviews/<PR>/design-reviewer.md. The design reviewer never fixes what it finds.
