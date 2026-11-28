Ruling: (round 9, in progress) mockup v46 looks great so far; the background a tad lighter

Question: none filed. Put to the owner in the Chief of Staff's design session (session_01QBwHGLtK9q6QMZYqnjMV1m) on 27 November 2026, following round 8 (decisions/questions/P-005-design-round-8.md), on mockup v46 and the open items of docs/handoff/2026-11-27-chief-of-staff-p005-19.md. These are design-mockup answers, given in the session reserved for the mockups, and this record says so rather than filing a question after its answers.
Milestone: Design-5 (the design fits together), M7, M8

## The owner's words, verbatim
At the start of the session the Desk Element Library (https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W) and mockup v46 (https://claude.ai/artifact/NTBCigkbdJkUPujwtoBu6w) were watched; neither had comments.

Asked in chat: "What do you think of v46 as a whole? ... Does the top of the screen look right on your phone now?"
1. "It looks great so far, maybe just lighten the background up a tad?"

Read by the Chief of Staff as: v46 holds as a whole; the top of the screen is taken as right on the phone (no fault raised). The background, in light, is to be a little lighter; the colour field itself (round 8, answers 15 and 16) stays. Dark is not named and is left as it is. "A tad" is drawn as options before anything is built.

Shown live: https://claude.ai/artifact/EbMsTLRAtNLzFquCu24XEj (docs/design/mockups/options-r9-lighter/): v46 as it is, on home and a project's page, then A, the grey under the colour one step lighter (#f7f8fb), the colour as it is; B, the grey as it is, the colour about a third softer; C, a little of each (#f6f7fa; blue .18, lavender .17, mint .12), recommended; D, lighter still for range (#fafbfd; about half the colour). To be asked.

Asked in chat: "Which one: A, B, C or D? I'd go with C."
2. "C"

Carried out: the library first (version 62: Ground's tokens `ground` #f6f7fa and the fields at 18, 17 and 12% in light; the index's change note published with it), then mockup v47 (https://claude.ai/artifact/HxRB1vUVmJ5mZc6iRPV9Xe; docs/design/mockups/build-v47/), a layer over v46: in light the ground half a step lighter and its colour fields a little softer; dark unchanged.

The open items, in the order of docs/design/audit-2026-11-27-v46-screens.md. First, the Needs-you tab.

Shown live: https://claude.ai/artifact/Em83dGzLKTf7wJb3EahmEs (docs/design/mockups/options-r9-needs/): v47's Needs-you tab as it is (an older sheet for the first waiting thing only), light and dark; then A, one list: Waiting on you (home's rows), Sent, being recorded, Kicked back, one line for what is with the AI team, and Answered (last 24 hours open, older folded) in words, recommended; B, A with an In order / By project switch; C, the board's three lanes (Yours, With the team, Done); and sheets for the other kinds of ask: a question, a pull request to merge, a deploy to approve, and Start the next session (examples). The answered rows are real rulings from the mockup's days (13 and 14 November), not rounds 8 and 9, to keep the mockup's clock. Found on the way: since v45 (v43's priority list), coming back from a project page to home loses home's priority list (it falls back to the older grouped cards); to be fixed in the next layer. To be asked.

A comment on the Needs-you options page (https://claude.ai/artifact/Em83dGzLKTf7wJb3EahmEs, thread b9563f4d), on the pull-request sheet, sent to Claude:
3. "I like the earlier option you recommended. For this one, can you find a way to incorporate the actual checks instead of just “checks passed”"

Read by the Chief of Staff as: the Needs-you tab is option A (one list: waiting, being recorded, kicked back, with the AI team, answered), as recommended. On the sheet for a pull request to merge, the single line "Its checks passed" becomes the actual checks: each one named, with its result. How they are shown is drawn as options first, starting from the sheet as it is.

Shown live: https://claude.ai/artifact/8HLnfTGGtUbkAA1rZAnRP2 (docs/design/mockups/options-r9-pr-checks/): the pull-request sheet as it is ("Its checks passed"), then A, every check named in two groups, the automatic checks (the pull request's form, the rules, the build and tests, the signal to the desk; each with its result, time and code, tapping through to its run) and the AI reviews (each verdict with one line from its record), running or yours first, recommended; B, two summary lines unfolding into A's rows, the rules unfolding again into all 47 in plain words; C, the checks as a story in time order from the push to ready for you. Found in the records: the leak scan does not run on pull requests; the rules number 47; a change to the rules needs the owner's own verdict, so its rules check shows "46 of 47 passed, the last is yours". To be asked, with whether that last line should show.

Asked in chat: "1. A, B or C? 2. The last rule. Should "the last is yours" show, or fold into the Merge answer? ..."
4. "A and no"

Read by the Chief of Staff as: the pull-request sheet shows every check named, in two groups, option A. The rule that waits on the owner's own verdict does not show as a check waiting on the owner: the rules show as passed, and the Merge answer says that merging gives the owner's own say the rules ask for.

To be built, library first, then mockup v48 as a layer over v47: the Needs-you tab, option A (answer 3); the four sheets for the other kinds of ask, with the pull request's checks as option A (answers 3 and 4); and the fault found on the way (home's priority list lost on coming back from a project).

Carried out: the library first (version 63: NeedsTab, AskSheets and CheckList, new; notes on TabBar, PriorityList and KindSheet; the index's change note with it), then mockup v48 (https://claude.ai/artifact/3wzVaea9sUUou2dUZHii3X; docs/design/mockups/build-v48/), a layer over v47: the Needs-you tab as one list, option A, its badge counting only what home counts (2), with the four other kinds of ask in a section of their own marked as examples; a sheet for each of them; the pull request's checks named in two groups, option A, the rules shown as passed and the Merge answer saying merging gives the owner's own say; and home's priority list kept on coming back from a project (a fault since v45: a renamed row title stopped the list rebuilding). Found on the way: in the real records the owner's-verdict rule is met only after a merge, so the desk would read it as met by the merge (a records item).

The second screen the desk lacks: a gate open for the owner's ruling, and a reader for any record.

Shown live: https://claude.ai/artifact/8fUthnqJ5W9CevK6PKzBit (docs/design/mockups/options-r9-gate/): v48's gate sheet as it is (passed, no links) and a Records line as plain text; then, for the open gate (the timeline's Design gate as it stood on 13 November, after case 2; the open state an example), A, a sheet: the ask, the case's opening with Read the whole case, what the Critic says, the user representative (not needed: the owner is the user), each choice with what follows, Kill marked "Can't be undone", records as rows, recommended; B, a full page with the choices at the foot; C, a short sheet with the ask, the choices and one row per piece of evidence; with the gate row "Yours · open" in the list and first on home with its four choices. For the reader, A, one plain page for any record, its opening paragraph first, Open on GitHub at the foot, back to where it came from, recommended; B, a sheet stacked over the sheet. Found in the records: the owner answered "Linked" to "The gate document: shown inside the desk too, or only linked on GitHub?" (decisions/questions/P-001-design-lab-open.md, answer 9); both readers show records inside the desk, so this is put to the owner. To be asked, with whether Kill is rightly "Can't be undone" and whether home's gate row carries the four choices.

Asked in chat: "1. The open gate: A, B or C? 2. The reader: A or B? 3. Reading records inside the desk ... Do you want that now, or should records stay links only? 4. Kill is marked "Can't be undone" ... Is that right? 5. Home's gate row carries the four choices as buttons ... Keep that on home?"
5. "I approve all of your recommendations"

Read by the Chief of Staff as: 1, the open gate as option A (a sheet); 2, the reader as option A (one plain page, opening paragraph first, Open on GitHub, back); 3, records are read inside the desk, with GitHub one tap away, which sets aside P-001-design-lab-open answer 9 ("Linked") for the timeline design; 4, Kill is marked "Can't be undone"; 5, home's gate row carries the four choices as buttons. Said in the reply, for the owner to correct.

The third screen the desk lacks: a project with no plan, and the empty and can't-read states.

Shown live: https://claude.ai/artifact/2XTq9U7PYPJ5xyR7csEp1h (docs/design/mockups/options-r9-states/): a quiet project as v48 opens it (an older layout, "undefined" on every row: v30's layer reuses the name of the table of state words); then A, the same page as a planned project (top row with "No phases yet", the map card with a summary line and a branch map of main and its recent branches, a plain list of what happened, oldest first, with real state words), recommended; B, the summary line and the list only, no map; C, A with an empty plan block at the top. And one way each: home with nothing waiting; a project being read ("Checking…"); a project the desk cannot read ("Can't read since 9:14 am", Try again, Open on GitHub) on its page and on home; the first open, with no "new since you last looked" marks. Found in the records: none of the three quiet projects has a status file with a phase (Model-Lab's records show plans of its own, P-002). To be asked.

Carried out: the library first (version 64: GateOpen and RecordReader, new; notes on GateRow, KindSheet, NeedsTab and PriorityList; the index's change note with it), then mockup v49 (https://claude.ai/artifact/EZ97rpmD1ufjTEP6jt6nnJ; docs/design/mockups/build-v49/), a layer over v48: the open gate as a sheet, option A, shown as "Yours · open" in the list and first on home with its four choices (the open state an example; home, the badge and the tab say 3); one plain reader for any record, option A, opened from every Records row (nine records carry their real text; any other opens a short reader titled from its file).

Asked in chat: "1. A, B or C for a project with no plan? I recommend A, the same page as every other project. 2. Are the four states right as drawn? ... 3. Should the desk read the plans inside each project's repository?"
6. "I agree, only caveat is the branch map you drew up looks very different than the others"

Read by the Chief of Staff as: 1, a project with no plan is option A, the same page as every other project; 2, the four states as drawn (nothing waiting, checking, can't read, the first open); 3, the desk should read the plans inside each project's own repository (for Model-Lab, its P-002 records), a records item for the building session, added to the records request; until then the mockup keeps "No plan yet". The caveat: the branch map drawn for a project with no plan must look like the others: the same BranchMap drawing (lanes, stations, labels, card) as a planned project's map, with main and its recent branches and no phase or milestone lanes. Said in the reply, for the owner to correct.

Shown live: docs/design/mockups/options-r9-states/ (https://claude.ai/artifact/2XTq9U7PYPJ5xyR7csEp1h).

Carried out: the library first (version 65: ProjectStates, new; notes on BranchMap, MapCard, ProjectSummary, PriorityList and DeskHome; the index's change note with it), then mockup v50 (https://claude.ai/artifact/JcbihG5gjpDtvXwNVmYCVD; docs/design/mockups/build-v50/), a layer over v49: operating model, Model-Lab and portfolio open the same page as The timeline, option A, their maps drawn by the mockup's own branch-map renderer from their real merges (no phase lanes, the phase pill "No phases yet", the list oldest first with Now at its end); the four states under More's "Mockup only" (Nothing waiting, Checking, Can't read, First open); the "undefined" state words fixed at their source (v30's `SL` renamed). Left for the owner: Model-Lab's and portfolio's records hold merges only, so each branch rises and drops back at every merge and their maps look busier than The timeline's.
