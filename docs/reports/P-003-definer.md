I've written the draft spec for P-003 at `specs/S-002.md`. It is not frozen or committed: this folder isn't a git repository, so nothing went to `build/definer/P-003`.

## 1. What I changed
I created `specs/S-002.md` from `specs/_TEMPLATE.md`. It is the only file I wrote.
- **Header:** `status: draft`, `work-type: fix`, `design_id: P-003`, `lineage: [S-001]`, `milestones: M4`.
- **"## The defect":** names the owner's ruling record, `decisions/questions/P-001-card-recommendation.md`, and the two wrong answers it led to (Q-019/stop-1 and Q-017/stop-2).
- **15 success criteria, each traced to V6:**
  - **AC1–AC8:** when a decision card is held, when it shows with the notes' word and that button marked, the after-a-day "No Chief of Staff recommendation yet" mark, and the mark giving way when notes arrive later. Also: notes with no usable word count as no notes, a card with no recorded raise time shows at once, a card once shown is never taken back off the queue, and notes only on another branch don't count.
  - **AC9–AC10:** gate cards, questions and pull-request cards stay as they are; the desk writes nothing and costs nothing new.
  - **AC11:** all five views and the notification sender agree on each card, and each card is notified at most once.
  - **AC12–AC15:** how M4 runs after graduation. It needs nothing new to run and its operating notes say how to roll it back; V6 is added to the weekly value check with a counting rule; the owner can report a wrong mark; and V6's result goes to the owner after 2026-12-31.
- **Join sheets J1–J5:** examples and tricky cases for each connection, such as `dor-fail` not being taken for a `dor` gate card, the exact-match rules for reading the recommended word, and notes that are later removed.
- **Rest of the template:** areas touched, facts with sources, risks, the stop rule, rollback, $0 cost, two questions for the owner, and the brief for the Builder. No experiment is registered, since the plan skips Design-3.

## 2. Why
The Design gate passed (`dor-4`: proceed), so S-002 has to be defined against the plan in `docs/projects/P-003.md`. Every rule and risk in the plan's sections 1 and 7 became a criterion. The earlier feedback (`dor-fail-1/2`, `dor-3`) was about the plan and the gate's case, not a spec, so I had nothing to fix from it here.

## 3. What I verified
- A search for criteria lines with a trace found 15, and every one traces to V6.
- I checked the line references I cite: `docs/PROJECT.md:540` shows the card file name `queue/Q-003-failure-1.md` (I corrected it from 539), and `docs/PROJECT.md:85` shows the answer record form.
- Library entries I rely on: F-cf-02 (rolling back a deploy is instant), P-notice-actionable-01 (notify once, when new) and F-automation-complacency-01 (the owner may lean on the mark).
- I ran no code; the folder has no source.

## 4. What is undone
- **Freeze and commit:** neither is done; the spec goes to the Critic's plan review first.
- **Test folder:** I listed `test/**` in the areas touched, but the desk's real test path isn't in my pack, so it is a guess.
- **Dispatch-log field names:** I couldn't see them. J1 hands them to the Builder to state in its test.
- **Second-hand facts:** the ruling record and `research/P-003-sizing-findings.md` aren't in my pack. Every fact that rests on them is taken from the plan's own quotes, and the spec says so.

## 5. What is needed outside my lane
- **Critic:** the plan review, including checking the sizing-findings facts and the ruling record at their source.
- **Check author:** the locked checks, and setting their path at freeze.
- **Owner:** approval of any change to `src/notify/**` (the plan's section 4 requires it), then the scenario card.
- **Chief of Staff:** running the weekly V6 check (AC13–AC15) once M4 is live.

## 6. Open questions
1. **AC5:** when notes arrive for a card already showing "No Chief of Staff recommendation yet", I send no second notification, so the owner isn't told twice. Should it send one saying the recommendation has arrived?
2. **J2:** the recommended word must match the card's word exactly, so `Drop` won't mark `drop` and the card counts as having no notes. Is that strictness wanted?
3. **Work type:** I labelled this `fix` with a "## The defect" section, because the plan calls it "the card fix" and its ruling says "Proceed with the fix". The Critic may prefer `feature`, since the owner filed it as "own addition".