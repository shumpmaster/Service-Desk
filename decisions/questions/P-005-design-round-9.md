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
