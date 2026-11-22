# Handover package — the card fix (P-003)

## What this means for you

Nothing failed; three things were skipped or have not run yet. By your ruling the fix went without hidden tests. The weekly check has run once, on past cards, and found none held too long; the reports of each miss, your feedback route and the year-end review start only once the fix is live. And the weekly check cannot see a screen that drops a card's mark, so that half is covered by tests before launch only. If you approve going live, a stop, failure or failed-readiness card may wait up to a day before you see it, until your Chief of Staff's notes recommend an answer; it then shows with that answer marked, or after a day with a line saying there is no recommendation yet. You approve the deploy and answer cards as before. Nothing here is irreversible: the fix can be rolled back.

*The card fix's handover package (spec S-014; plan docs/projects/P-003.md, Launch-2 and Launch-3), by the Builder.
M4 was reached on the preview on 2026-11-22 by the owner's acceptance (decisions/questions/P-003-preview-acceptance.md);
going live is ruled at the Launch gate, which comes after this package. It sits beside the desk's own package,
docs/handover/service-desk.md, and its notes, docs/handover/desk-operations.md, and changes neither.*

## What it does

The desk's decision cards (a card whose gate is `dor-fail`, `stop` or `failure`) now show the Chief of Staff's
recommendation, or say they have none (S-014's title). One rule in the desk's shared card code, `decisionStates` in
src/lib/model.js, works out each decision card's state from the records on the main branch (queue/, the notes files
`decisions/<item>/<gate>-<n>-notes.md`, and the dispatch log) and a moment, and feeds the queue, Home's count, the
board, the card sheet and the notification sender alike (specs/S-014.md, mechanism; plan section 7).

- A decision card is held until its notes on the main branch name one of its answer words; it then shows with that
  word's button marked Recommended.
- If no such notes come within a day of its raise time, it shows anyway, marked "No Chief of Staff recommendation
  yet", with no button marked.
- A card's own Recommendation section no longer marks an answer. Gate cards (`dor`, `criteria`, `launch`),
  questions and pull requests are unchanged.
- While the desk cannot read the records it needs, it hides the decision cards it cannot judge and says so on the
  queue and Home, in one of three "not shown" lines.

The full rules are in docs/handover/P-003/operating-notes.md, "What a held decision card is, and when it shows".

## How to run it

There is nothing new to start or schedule: the fix is part of the desk's page code and the notification sender,
which run as before (docs/handover/service-desk.md, "How to run it"; docs/handover/desk-operations.md). Going live is
the desk's usual deploy, approved by the owner (docs/handover/desk-operations.md, "Approving a deploy").

For everything specific to the fix, the operating notes are the one place; they are not repeated here:
- what a held card is and when it shows: docs/handover/P-003/operating-notes.md, "What a held decision card is, and
  when it shows";
- the mark: the same file, "What \"No Chief of Staff recommendation yet\" means";
- the three "not shown" lines: the same file, "The three \"not shown\" lines";
- running the rule on the records at a commit and a moment, and working out the two weekly figures: the same file,
  "Running the rule on the records at a commit and a moment (AC13)" and "J6's check moments and the two figures";
- rolling back (redeploy the previous production deployment, then revert the merge, in that order): the same file,
  "Rolling back".

The Chief of Staff's part in running it is the notes for every decision card: a card waits for them for up to a day
(plan section 4; "Who does what once live", below).

## What to watch

- **A decision card waiting up to a day.** That is the fix working, not a fault. A card held longer than a day after
  its recorded raise time is a V6 miss (plan section 6).
- **"No Chief of Staff recommendation yet" on a card.** The card waited a day without notes naming an answer word.
  Notes whose line names no answer word, or a word in the wrong case, count as no notes (operating-notes.md).
- **A "not shown" line on the queue or Home.** The desk could not read queue/, a notes file, or the dispatch log.
  One unreadable notes file hides every decision card (operating-notes.md; specs/S-014.md, risks). The cards come back
  by themselves on the first read that gets the records.
- **Two notices for one card.** The sender is unchanged (AC14): it may notify again when a recommendation arrives
  after a card showed without one, or when a card shows a second time (specs/S-014.md, open question 1).
- **The live desk running different code from the main branch.** The weekly count reads the main branch's code, not
  the live deployment; a deploy that lags the main branch, or a rollback, means they differ (specs/S-014.md, risks).
- **Two design points left open.** On Home the new lines are plain grey with no cross, where the queue's are red with
  one, and a Home line with several projects shown does not name its project (reviews/465/design-reviewer.md, Q1 and
  Q2). The owner's acceptance did not file them as later work (decisions/questions/P-003-preview-acceptance.md).

## Its own monitoring and feedback

What watches the fix against V6 is the Chief of Staff's, not built into the desk, by the owner's ruling
(decisions/P-003/stop-5.md; specs/S-014.md, the monitoring section's note; plan sections 4 and 6). The desk shows
the feedback questions and the review card by the rules for their kind, with no change for them (S-014, AC19).

**(a) The weekly V6 count.**
- Where it runs: in the Chief of Staff's session, from the repository root with the main branch's full history,
  rerunning the fix's rule at each check moment on the records of the main-line commit current then, as
  operating-notes.md's "J6's check moments and the two figures" sets out (plan section 6; intake/v6/README.md).
- Who: the Chief of Staff (plan section 4).
- Record: one line per run in the weekly value check, intake/value-checks.jsonl (plan section 6).
- **Shown running before launch (Launch-4).** The one run on past records, on 2026-11-22, is the V6 line of
  intake/value-checks.jsonl: time 2026-11-22T21:02:52Z, from 2026-09-30 to 2026-11-22, figure "0 held too long of 39
  past cards, before launch", value null, state "not measured", source "intake/v6/2026-11-22-past-records.json,
  intake/v6/count.mjs, dispatch-log/, queue/". Its folder, intake/v6/, holds:
  - README.md: what was counted (every decision card that reached the main branch's first-parent history, up to main
    at 3a6613a, 2026-11-22T20:32:08Z, with the moments ending at 2026-11-22T21:02:52Z: 39 cards, the first arriving
    2026-10-01T02:22Z), how (`node intake/v6/count.mjs 3a6613a 2026-11-22T21:02:52Z`, through the sender's own
    reader), and the result: V6 held-too-long misses 0 of 39, cards held a day after reaching the main branch 0,
    failed reads 0;
  - count.mjs: the script that ran it;
  - 2026-11-22-past-records.json: the result, one row per card (`cards` 39, `v6Misses` 0, `secondReported` 0).
- What that run shows: the count working, not V6's result. The rule as built never holds a card past its day, so 0
  is the expected figure; V6's window starts when the fix is live (intake/v6/README.md; operating-notes.md, "What the
  figures can and cannot find"). It cannot find a view showing a card with neither mark; that half of V6 is guarded
  by the tests before launch (operating-notes.md; specs/S-014.md, open question 4).
- Weekly runs: none yet. They start the week the fix goes live (plan section 6).

**(b) The report of each miss.**
- Where and who: the Chief of Staff reports each miss to the owner in plain words the same week, and records each
  miss with the count in intake/value-checks.jsonl (plan section 6, line 111).
- Record: the miss in that week's line of intake/value-checks.jsonl, and the report to the owner.
- Has not run: there can be no miss before the fix is live, and the pre-launch run found none.

**(c) The owner's feedback on the fix.**
- Where and who: the owner gives it to the Chief of Staff, who files it as a question (questions/<name>.md); the
  owner rules, and the answer is recorded in decisions/questions/ (plan sections 4 and 6). On the desk it shows as any
  question (S-014, AC19).
- Record: the question file, then its answer in decisions/questions/.
- Has not run: none has been filed for the fix yet; it starts at launch.

**(d) The review card after 2026-12-31.**
- Where and who: after 2026-12-31, the Chief of Staff files a review card putting V6's result to the owner (plan
  section 6). If it is a decision card it waits for its notes, or a day, like any decision card; if a gate card, it
  shows as today (S-014, AC19).
- Record: the card file in queue/ and, once answered, its answer.
- Has not run: it is due only after 2026-12-31.

## When to escalate to the owner

The Chief of Staff or an agent stops and puts it to the owner, in a session or as a filed question
(AGENTS.md section 5):
- **A V6 miss** in a weekly count: reported to the owner in plain words the same week (plan section 6). A held-too-long
  figure other than 0 means the rule's code on the main branch has changed since M4 (operating-notes.md).
- **A rollback is needed:** the owner redeploys and the revert goes by pull request, as operating-notes.md's
  "Rolling back" says; the deploy is the owner's (plan section 4).
- **A change to the notification sender's own files,** for example to stop it notifying twice: the owner approves it,
  as for every change to those files (plan section 4; specs/S-014.md, open question 1).
- **The owner's feedback on the fix:** filed as a question for the owner's ruling (plan section 6).
- **The build or a fix to it growing past the stop rule's size,** or a third readiness or plan-review round failing:
  work stops and comes back to the owner (plan section 6, stop rule).

## Value target

From docs/projects/P-003.md section 6 (line 103), quoted:

V6: Decision cards shown to the owner with neither the Chief of Staff's recommended button marked nor the "No Chief of Staff recommendation yet" mark, 0, from the day M4 is live to 2026-12-31

A miss is any decision card shown with neither mark, or any decision card held off the owner's queue more than a day
after it was raised; a card not shown because a read could not get the records is not a miss (plan section 6).
Before launch: 0 held too long of 39 past cards, state "not measured" (intake/value-checks.jsonl).

## Who does what once live

From docs/projects/P-003.md section 4 (Launch-2):

| Who | What |
| --- | --- |
| The Chief of Staff | Writes the notes for every decision card, which a card waits on for up to a day; runs the weekly V6 count, reports each miss, files the owner's feedback on the fix as questions, files the review card after 2026-12-31, and records the lessons for the operating model at handover, in the operating model's lessons file |
| The owner | Answers the cards; rules at the Launch gate and approves the live deploy; rules on the feedback questions; approves any change to the notification sender's own files |
| The Builder | Owns the fix's code and these operating notes; the code is rolled back as docs/handover/P-003/operating-notes.md, "Rolling back", says |
| The Reviewer (and the design reviewer, for the page's code) | Reviews the build and this package (governance/risk-paths.toml; decisions/questions/P-003-preview-acceptance.md) |
