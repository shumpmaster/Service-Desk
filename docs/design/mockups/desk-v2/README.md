# The desk, mockup v2: screenshots

Screenshots of [../desk-v2.html](../desk-v2.html), drawn on 19 Oct from the owner's rulings of that day, with a
Home tab added on 20 Oct at the owner's request (docs/design/references/owner-request-2026-10-20-home.md: "We got
rid of the home page - im not sure i like that", then "Mock it up in the same style as the mockup you just showed
me"). The bar on every frame is now **Home · Waiting · Plan**; the Projects tab is gone. It is a
mockup only: nothing is built. Linear's general look is the starting point, not a copy (the owner's words on
[../linear-inspired.html](../linear-inspired.html)). Any frame opens alone at `desk-v2.html?frame=<id>`
(`&theme=dark`, or `&full=1` for the whole length).

**Content.** Service-Desk items are real, from its records and GitHub as at 16:30 on 19 Oct, Chicago time:
PR #148 and its failing check, the open question `questions/P-001-redesign-direction.md` (raised 13:37, default C
after 48 hours), the owner's merges #133 and #135 and answer #149, milestones and "done when" lines from
docs/PROJECT.md §3, the Chief of Staff's estimates in intake/estimates.jsonl (rough finishes added up in order
from 19 Oct), standard-milestone states from `python3 governance/checks/v3_checks.py trace` on origin/main
(fc62f64), PR #89's title, Context and Why, and, for Home's "Since you last looked", merge and creation times from
GitHub and two commits on #148's branch (e814b48 at 16:23, 4eae196 at 16:26; Chicago time). The mockup's own commit
(16:48) came after the 16:30 snapshot, so it isn't listed. Personal-Org-Operating-Model (POOM) items are real too, but it is a
private repository, so only ids, counts and dates appear (sprint m1.4 open, L-0146 of 17 Oct, 146 ledger entries,
32 specs, CI passing on 17 Oct, no open pull requests). POOM has nothing open today, so it has no card: it shows in
the quiet line "Nothing waiting". Everything for **Members Letter** is made up (inventory §6) and carries an
"Example" tag on every frame where it appears. The Waiting badge (8) adds real and example cards, as one board does.
Not records: "checked 1 min ago", the last-looked time (15:40; the desk keeps it on the phone), and the portfolio repository, which the desk doesn't read yet. Its one captured
idea comes from inventory §5.

## Frames

| File | What it shows |
|---|---|
| H1-home-414.png, -360 | Home, opening first. (1) A briefing: "8 need you · 7 waiting, 1 kicked back · oldest 4 h · one question settles itself Wed 13:37 · one can't be undone", counted from frame 1's cards and saying it mixes real and example ones; one tap to Waiting. (2) "Since you last looked · 15:40" with "Mark as seen": the four newest of 11 lines, each a tap to where it happened (real for Service-Desk: the Chief of Staff's and the Reviewer's work on #148, answers #151/#152 recorded; one example idea), "7 more" one tap away. (3) One tile per project: phase (colour, icon, words), what waits (vermilion only when it needs the owner), who is at work, the next milestone with its rough finish |
| H2-home-dark-414.png, -360 | H1, dark |
| H3-home-all-clear-414.png, -360 | A made-up moment with everything answered, said so on the frame: "Nothing needs you"; "since you last looked" and the tiles stay |
| H4-home-portfolio-foot-414.png, -360 | Home scrolled to its foot: the last tiles, then "Across your projects · read only" (the cap, decisions across projects, the scorecard, model versions, the rare parts), moved here from the foot of Projects |
| 1-waiting-414.png, -360 | Waiting: one board, three lanes at once, each project's cards together under its name. Quiet lines above: "With the agents: 2" and "Nothing waiting: Personal-Org-Operating-Model". Service-Desk's real verdict and question; Members Letter's gate card (Critic, user representative, four choice buttons), a question that can't be undone, a deploy, a spend alert and a verdict; one card kicked back; Done for the last 24 hours, with one card still "Confirming with GitHub" (step button and Undo) |
| 2-waiting-one-project-414.png | After a tap on "Service-Desk": only its cards; the chip's ✕ shows all three projects again |
| 3-question-sheet-irreversible-414.png, -360 | A question's sheet: one "Answer A/B/C ↗" button per option, the recommendation labelled, not chosen; "Can't be undone · never settles itself"; a text box for the owner's own words (16 px); a 44 px close |
| 3b-question-sheet-settles-414.png | Service-Desk's real open question: "Settles itself as C on Wed 21 Oct, 13:37 if left · Reversible". Its buttons open the real answer file, filled in |
| 4-gate-sheet-414.png, -360 | A gate ruling: the case's opening (3 lines, faded, the whole case one tap away), the Critic's view, the user representative's verdict, the Launch standard milestones and definition of ready in one line, then Proceed, Hold, Recycle and Kill, each saying what follows; Kill marked "Can't be undone"; a box for the reason |
| 5-project-service-desk-414.png, -360 | Service-Desk's page: Overview and Timeline at the top, the one sentence, the phase strip (phase colours, an icon and words for each), why Design ran again (not recorded), the last action, what waits and who is at work, then **milestones by phase**: one folded line per phase, the project's own and the 24 standard ones together, read from the bottom up |
| 6-standard-milestones-open-414.png | Design opened: run 2 in full (yours, then the model's six), run 1 smaller. "Not recorded yet" (dashed circle, "?") and "No record for this in the model yet" (slashed circle) look and read differently. One line, not one on each row, says no "why" is written yet |
| 6b-standard-skipped-members-letter-414.png | A project with all 24 lines written (example): Design-2 reads "skipped · why: …" in softer text, never as missing; each milestone has its why |
| 7a-timeline-colour-labels-414.png, -360, -full-414 | The Timeline as built, cleaned up: one feed, newest at the top, opened at Now, a compact pinned header and pinned phase bands, a thin rail in the phase's colour, one status icon in a circle per milestone, sprints folded with PR #89 open, and Technical, Context and Why **with their own colours** |
| 7b-timeline-grey-labels-414.png, -full-414 | The same, with the three labels and their edges **in grey** |
| 7c-current-timeline-414.png | The Timeline today, for comparison: the real trial view (`?sandbox`) in Chromium, its calls answered by the tests' fake desk function from tests/desk/fixtures (Service-Desk's records at 3117150, pull requests up to #77, so it reads 16 Oct), with a sprint fold open. It renders in the phone's own font (DejaVu on Linux) |
| 8-project-poom-414.png | POOM's page, older pipeline: sprints m1.1–m1.4 in place of phases, nothing waiting, CI, the ledger's latest, the record counts, then "Not used by this project" (phases, Timeline, questions, agent runs), each saying why |
| 9-project-members-letter-414.png | Members Letter's page (example), everything at once: the example banner, the gate waiting, a spend alert at 82%, two agents at work, a security review still to come, experiments (one result filed, one running), milestones by phase, value target and stop rule, a research sub-project, the T2 parts |
| 11-plan-414.png | Plan: each project's milestones ahead in order with the Chief of Staff's rough finish ("an expectation, never a deadline"), work that isn't a milestone yet, then ideas from the portfolio |
| 12-waiting-dark-414.png | Frame 1 in dark mode |

Frame 10 (the Projects tab) is **removed**: its tiles are now on Home and its portfolio block at Home's foot. Every
other frame was re-captured with the new bar, under the same file names. Two corrections from the Home work, on
frames 1, 2, 5 and 12: the owner's newest answer was #152 at 16:20, so the Done lane now opens with it and frame 5's
"Your last action" reads 16:20 (they said 16:11).

## Which ruling each choice follows

All rulings are in decisions/questions/. Where two disagree, the later one is followed and named.

- **Tabs: Home · Waiting · Plan, Home opening first** (owner-request-2026-10-20-home.md, which changes
  P-001-redesign-nav.md's "Waiting opens first"; the tabs stay labelled at the bottom). Each tab has one job: Home
  is the glance (what needs you, what changed, where each project stands); Waiting is acting; Plan is what comes
  next, ideas included. Projects' two jobs moved to Home: its tiles, and its portfolio block at the foot. A
  decision card from the portfolio's queue would wait on the board, under "Portfolio" (inventory §2 H).
- **Home's briefing** counts what the board counts, and one tap opens Waiting (the orchestrator's proposal the
  owner asked to see drawn).
- **"Since you last looked"**: what changed and who worked on what (P-001-design-discovery.md, answer 8: "I want
  to know all the agents that are working, what they're working on, why they're working on it, what has
  changed"), with a "Mark as seen" control and the since-time; each line opens where it happened.
- **One tile per project on the front page**, everything about it inside its tile (P-001-design-lab-1.md, ruling 6),
  with its README summary (P-001-trial-view-notes-1.md, note 1). The board stays one board across projects, as
  P-001-board-scope.md (C) later ruled.
- **One board, grouped by project**, a tap on a project's name to show only it (P-001-board-scope.md, C).
- **Three lanes at once, small text** (P-001-board-layout.md, A: "the text can be small because its closer to my
  face"): board text is 11 and 12 px.
- **Kicked back** is its own lane, never back where the card came from (P-001-board-direction.md, P-001-board-bounce.md).
- **Done keeps 24 hours** (P-001-board-done-keep.md, B). **A Done card keeps its step button and Undo while
  confirming with GitHub**, then only the time (P-001-board-done-button.md, A).
- **One answer button per option**, the recommendation labelled, not chosen (P-001-board-answer.md, C), each
  with room (P-001-answer-choice-spacing.md) and a box for the owner's words (P-001-trial-view-notes-1.md, note 15).
- **"With the agents: n"**, not counted (P-001-board-after-agents.md, A).
- **Gate card of its own**: the case's opening, the Critic's view, the user representative's verdict, the
  choices as buttons, on the card and in its sheet (P-001-gate-card.md, A). The four words are the model's
  (`GATE_STANDARD_WORDS` in src/lib/sandbox.js).
- **Can't be undone, and settles itself at a timeout**, told apart on the card and in the sheet, by icon and
  words, never colour (S-001 AC38; AC12's default label; P-001-board-done-button.md, the orchestrator's note).
- **Kinds of ask look different**, never ranked: an icon and a word for each kind (P-001-design-discovery.md, answer 6; AC38).
- **Safe-to-approve** on the deploy: "Matches #11 · Reviewer PASS" (P-001-trial-view-notes-2.md, note 35).
- **Every standard milestone stays shown**, folded to one line per phase that opens to the list, skipped ones
  named with a why (P-001-standard-milestones.md, A; P-001-redesign-conflicts.md, answer 2: "we need to be
  thoughtful when incorporating them"). *The care taken:* each phase line shows the project's own milestones and
  the standard ones together, which is the "holistic phase & milestone look" the owner asked for
  (P-001-trial-view-notes-2.md, note 6), and nothing opens until tapped.
- **Bottom up**: Discovery at the foot, Launch at the top, the first milestone of a phase at the foot of its list
  (P-001-trial-view-notes-2.md, note 15; a light line with an arrow pointing up, note 12, made thin, note 19).
- **Runs**: every run listed, earlier ones smaller (note 2); "why it went back" at each branch, "not recorded" when
  no record gives one (note 33).
- **Phase colour or icons** (P-001-redesign-conflicts.md, answer 4): the approved swatches
  (docs/design/mockups/colour-swatches.html), always with the phase's name.
- **The Timeline as built stays**, cleaned up in structure, in Linear's visual style (P-001-redesign-conflicts.md,
  answer 3): one feed, newest at the top, the plain-English title first, then the bullets, status marks on the
  right (P-001-trial-view-notes-2.md, notes 7–8, 13–14, 18, 21, 23–24, 26). *Cleaned up:* the boxed, upper-case
  labels and nested cards are gone; sticky bands are lighter; the project's name and the Overview/Timeline switch
  stay pinned in one compact bar; the Now line is the only heavy rule. Sprint titles are the PR's own
  (the spec follow-ups of 16 Oct, answer 1).
- **Status icons** inside a plain circle (note 23); the gold ring means "next to reach" (follow-up 3).
- **Text cut where it crowded**; a clear type scale kept (P-001-redesign-conflicts.md, answer 1, which ends
  "every word stays"). **Sizes as close to Linear's as we could**: 24, 18, 15, 13, 12 and 11 px; weights 400,
  500 and 600 (answer 5). **Text boxes at 16 px** (P-001-text-box-size.md, A).
- **IBM Plex Sans with Plex Mono** for ids and times; **vermilion only for "needs you"**: the kind icons of cards
  waiting on the owner, the diamond, the badge, the spend alert (P-001-redesign-type.md, A). Agent-owned gaps, such
  as "Not tied to a milestone", use a grey diamond (note 32).
- **The three states told apart** (inventory §4): *not used by this project* reads "Not used" or "skipped" with a
  why (POOM's page, Members Letter's Design-2); *not recorded yet* is a dashed circle with "?"; *no record in the
  model* is a slashed circle. It applies to the 10 standard milestones the model's trace never reads
  (`NOT_RECORDED_IDS` in src/lib/timeline.js), which no project can fill until the model changes.
- **The portfolio, read only** (P-001-portfolio-read.md, A); the plan across projects looks the same wherever it is
  kept (P-001-portfolio-plan.md, A).
- **Home's tiles sit in three collapsible groups**, Active, Closed or not run by the desk, and Done, each with its README summary (P-001-trial-view-notes-1.md, notes 1 and 4); the grid of note 3 is open choice 1b.
- **Every sheet has a visible 44 px close** and closes on Escape or a tap outside (notes-1, note 9).
- **"Your last action"** above the waiting line (notes-1, note 6).
- **No figure presented as real that isn't** (P-001-design-lab-1.md: "Absolutely no fake numbers"): Members
  Letter is tagged; unknowns are words ("not set yet", "not recorded yet"); estimates are labelled as estimates.

## Not ruled: shown for the owner to judge

1. **Keep a Projects tab as well as Home?** Shown without it: Home's tiles open each project's page.
   *Recommendation: no Projects tab*; a fourth tab would repeat Home's tiles. Revisit with a Portfolio tab once the
   portfolio holds more than one idea and a cap.
1b. **Full-width project tiles on Home, or the two-column grid** the trial view's Home had (P-001-trial-view-notes-1.md,
   note 3: "a grid of sorts so I could look across multiple projects")? Shown full width. At 360 px a half-width
   tile is about 156 px wide, so each of its four facts wraps to two lines, and Personal-Org-Operating-Model's tile
   ran to about 520 px; full width keeps each fact on one line, and all three tiles take about one screen.
   *Recommendation: full width* while each tile carries four facts. This goes against note 3, so it is the owner's call.
1c. **The README summary on each Home tile** (notes-1, note 1) adds two lines per tile. *Recommendation: keep it*;
   it is the only line that says what each project is.
1d. **How many "since you last looked" lines before "more"?** Shown: four, so the tiles start on the first screen at
   414 px. *Recommendation: four.*
2. **Technical, Context and Why: keep the labels' own colours (7a), or grey (7b)?** Not ruled
   (P-001-redesign-conflicts.md, readings 3 and 4). *Recommendation: 7b, grey.* The colours earn little once each
   label is in words, and on 11 px text dusty rose sits at 4.51:1, just over the line.
3. **One "why not written yet" line per phase list**, in place of "why: not recorded" on every row
   (notes-2, note 6 put it on every row; answer 1 of the conflicts allows cutting crowding text). *Recommendation:
   one line*, with each row's own why shown once it exists.
4. **Does a pull request waiting on a domain reviewer's verdict count under "With the agents"?** The orchestrator
   suggested it as a later question (P-001-board-after-agents.md). Shown that way for Members Letter's #12.
   *Recommendation: yes.*
5. **Own and standard milestones together, one line per phase**, on the project page (frame 5). The ruling says
   "one line per phase"; joining the two lists is this mockup's reading of note 6. *Recommendation: keep them together.*
6. **Gate choices on the card as well as in the sheet.** The ruling says "with your choices as buttons", and this
   mockup puts them on the card. *Recommendation: keep them on the card.* A tap opens the filled-in answer, which
   the owner still commits on GitHub, so a mis-tap commits nothing.
7. **Reading order of Plan**: next first, top down, as the approved Work ahead mockup reads, while phases and
   milestones read from the bottom up (note 15; rulebook conflict 8). *Recommendation: keep Plan top down*, as it
   lists what comes next, not a breakdown.

## Checks

Playwright with Chromium (`/opt/pw-browsers`), each frame opened alone at 414×896 and 360×740 (frame 7c is a
screenshot and isn't measured): 38 captures with the Home frames and the full-length Timelines, plus the gallery
at 360 and 1280. The headless
browser can't reach Google Fonts here, so the capture served the same IBM Plex files, fetched beforehand with
curl. Fonts were confirmed loaded in every capture; the page itself loads them from Google Fonts.

| Check | Result |
|---|---|
| Sideways scroll at 360 and 414 (page, every screen and sheet) | none: 0 px in all 38 captures and the gallery |
| Tap areas (WCAG 2.5.8, 24 px; links inline in text excepted) | smallest 26 px (the gate card's four buttons); board buttons and "Mark as seen" 28 px; rows 40–44 px; tabs 52 px |
| Close controls | 44 × 44 px on every sheet |
| Text contrast (each text element against its effective background, light and dark) | all ≥ 4.5:1; lowest 4.51:1 ("Context", dusty rose, 7a only); next lowest 5.18:1; dark mode lowest 6.69:1; text-box placeholder 4.83:1 |
| Text boxes | 16 px in every sheet |
| Type | sizes 11, 12, 13, 15, 18, 24 px; weights 400, 500, 600 |
| Script errors | none |

## Unsure

- **Fonts.** S-001 AC42 allows no web font from another origin, so a built desk would carry the Plex files itself.
  The earlier ruling for the phone's own font (P-001-design-pick.md) is replaced for the redesign by
  P-001-redesign-type.md; the rulebook's conflict 9 asks which holds for the current screens until the direction is ruled.
- **Where rows sit on the Timeline as of 19 Oct** (M3A in Build run 2, MD1–MD3 under Now) is drawn by hand from the
  records, following the feed's rules as the tests show them; the built desk would work them out itself.
- **The 7c comparison reads 16 Oct**, as the tests' fixtures stop at #77; the mockup reads 19 Oct.
