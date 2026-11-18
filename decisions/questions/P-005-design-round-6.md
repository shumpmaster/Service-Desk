Ruling: (round 6, in progress) the home page takes a floating header too

Question: none filed. Put to the owner in the Chief of Staff's design session (session_01QBwHGMj7HvX9F7d4qu5ZkC) on 17 November 2026, following round 5 (decisions/questions/P-005-design-round-5.md), on mockup v21 and the open items of docs/handoff/2026-11-17-chief-of-staff-p005-16.md. These are design-mockup answers, given in the session reserved for the mockups, and this record says so rather than filing a question after its answers.
Milestone: Design-5 (the design fits together), M7, M8

## The owner's words, verbatim
At the start of the session the Desk Element Library and mockup v21 were watched; neither had comments.

Asked by the question tool: "Mockup v21 as a whole (https://claude.ai/artifact/LQopLKr9MHfN8vd35oNmeu). ... What do you think of it?" Options: "Good, move on"; "Good, with changes"; "Too much at once"; "Not working". The session's worker restarted before it was answered, so it was not asked.

1. A comment on mockup v21, written at 03:39 UTC on 17 November, on the home page's header (the large title "Timeline", the live line and the search): "Floating Header here too"

Read by the Chief of Staff as: the home page should get a floating header like a project's page has had since v16 (one slim bar that stays at the top as the page scrolls), instead of the large title that scrolls away. To be shown live, as home is now and with options, and asked.

Asked by the question tool: "Home's floating header (your comment on v21). On https://claude.ai/artifact/3vSPggQGUmXqFkuVDQkyK3: v21's home as it is, where the title, live line, bell and search all scroll away; then three live phones where home's header floats like a project's slim bar. Scroll inside each. Which one?" Options: "A: the slim bar only (Recommended)"; "B: the bar and the search"; "C: the bar and the project pills"; "Mix or none". Pictures: docs/design/mockups/options-home-header/ (now, home-A to home-C). The session's worker restarted before it was answered, so it was not asked; it is to be put again.

Two more comments on mockup v21, written at 03:41 and 03:42 UTC, reached the session at 03:52, before the home-header question was answered; they are recorded in the order written.
2. A comment on mockup v21, written at 03:41, on the blue window of the floating branch map (fitted to M6): "Can we wrap text within the blue box?"
3. A comment on mockup v21, written at 03:42, on the step 2.7.2 Spec S-011 and the events under it: "This entire flow here is solid, but in its current visual format every single event has the same weight and means nothing unique, can we change that"

Read by the Chief of Staff as: answer 2, the words beside the events inside the map's window should wrap onto more lines instead of being cut short. Answer 3, the order and the tree under a sprint stay, but each event should look as important as it is, so that the few that matter (a stop, a failed review, a merge, a freeze) stand out from routine ones. Answer 3 is the owner's first point on what on the timeline serves no purpose and what is missing (docs/handoff/2026-11-17-chief-of-staff-p005-16.md, "Open, for the owner", 2). Each to be shown live, as it is and with options, and asked, after the home header.

Asked again by the question tool, as above, with "(Your comments on the blue box and on event weight come next.)" added.
4. "A: the slim bar only (Recommended)"

Carried out: home's header floats in the glass band as one slim bar, the same as a project's page without Back: "Timeline" in 17 with the live line under it in 12, then the bell and More. The search and the rest of home scroll under it. To be built into the library (ProjectHeader, now for home too) and then mockup v22 over v21, with the next answers.

Shown in chat: the library with home's bar in ProjectHeader (https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W, version 18) and mockup v22 (https://claude.ai/artifact/LfZ6v5WPV7YhxaXvGnTJtg).

Asked by the question tool: "The words in the blue box (your comment on v21). On https://claude.ai/artifact/FQbAGYWFKh9BNVdeS5NA98: v22's map as it is, where each event in the window gets its kind and a short title, both cut short; then three live phones where the words wrap by whole words. Scroll the list inside each. Which one?" Options: "B: only the title, wrapped (Recommended)"; "A: kind, then the title wrapped"; "C: kind, then the whole title"; "Mix or none". Pictures: docs/design/mockups/options-map-wrap/ (now, wrap-A to wrap-C).
5. "B: only the title, wrapped (Recommended)"

Carried out: in the map's window, each event in view loses its kind word (its icon already says it), and its short title wraps by whole words onto up to three tighter lines, in the kind's place; the map keeps its height. To be built into the library (MilestoneMap) and then mockup v23 over v22.

Shown in chat: the library with MilestoneMap's words wrapped (https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W, version 19) and mockup v23 (https://claude.ai/artifact/4vRgmS5kZR9tVNHNhYt2vm).

Asked by the question tool: "Each event as heavy as it is (your comment on S-011's events). On https://claude.ai/artifact/KF6cNjABjSB8gPwsYBf2kY: v23 as it is, where every event gets the same row; then three live phones. Each event gets a weight by rule: turning points (stop, decision, gate, merge, anything waiting on you), checks (reviews), routine (commits). Scroll S-011 inside each. Which one?" Options: "A: three sizes (Recommended)"; "B: sizes, and the between folds"; "C: turning points on cards"; "Mix or none". Pictures: docs/design/mockups/options-weight/ (now, wt-A to wt-C).
The session's worker restarted before it was answered, so it was not asked.

6. A comment on the options page (https://claude.ai/artifact/KF6cNjABjSB8gPwsYBf2kY), on option A's phone, sent at 12:27 UTC on 17 November: "I want to go with Option A. What i want to change is the labels that are shown. Any situation where something touches main branch should get a label. Anything not on main should only get labels if it is inside the blue box."

Read by the Chief of Staff as: option A (three sizes) is taken for the list. The labels are the words on the floating branch map: every event that touches main (a merge onto main, and anything else drawn on the main line) carries its words wherever it sits on the map; an event on a sprint's branch carries words only while it is inside the blue window, as now. To be shown live on the map before it is built, since main's labels outside the window must find room among squeezed icons.

Carried out, the first half of answer 6: option A, three sizes, built into the library (EventWeight, version 20) and mockup v24 (https://claude.ai/artifact/3BpztpWcFsYrLULCjT5nse). The second half, the labels on the map, is drawn two ways next.

Shown on the page, as a reply on the comment: v24 and the options page for the labels on main (https://claude.ai/artifact/NNscwEgNkcYsp5prha2ZwE): v24 as it is, then "1: under each icon" and "2: spread along main" (recommended). Pictures: docs/design/mockups/options-main-labels/ (now, ml-1, ml-2).
7. Said in the session, after the options page for labels on main: "option 2 please"

Carried out, the second half of answer 6: on the fitted map, every event on main carries its short title in one row in a strip under main, each label as near its icon as it can sit without touching the one before, joined to its icon by a thin line; a sprint's events keep their words only inside the window. To be built into the library (MilestoneMap) and then mockup v25 over v24.

Shown in chat: the library with words on main in MilestoneMap (https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W, version 21) and mockup v25 (https://claude.ai/artifact/3w8kRCDDa7SauhJZyKHuG7).

Asked by the question tool: "Now that v25 (https://claude.ai/artifact/3w8kRCDDa7SauhJZyKHuG7) has your round 6 changes (home's floating bar, the wrapped words in the blue box, event weight, words on main), what do you think of the timeline as a whole? Your view of v21 as a whole was cut off by a restart, so this question stands in for it. ..." Options: "Good, move on"; "Good, with changes"; "Too much at once"; "Not working".
8. "The Phase reads top down, then the milestones read bottom up - that needs to be fixed"

Read by the Chief of Staff as: on a project's page the phase's heading sits at the top and reads downward, but the milestones under it run newest first (planned at the top, Design-1 at the bottom), and the events inside a sprint run newest first too. The whole list should read one way. To be shown live, as it is and both ways, and asked.

Asked by the question tool: "One reading direction (your view of v25). On https://claude.ai/artifact/3G4qNmWTrdoT8ev3bS5bpJ: v25 as it is, where the phase heading reads down but everything under it runs newest first; then two live phones that read one way at every level. Which one?" Options: "A: top down, oldest first (Recommended)"; "B: newest first, headings at the root"; "Mix or none". Pictures: docs/design/mockups/options-order/ (now, ord-A, ord-B).
9. "Where I struggle with this is that it looks like milestones were performed out of order? So neither options really work for me"

Read by the Chief of Staff as: the trouble is the milestone numbers. They follow the plan's order (2.1 to 2.7), but the milestones are worked in another order and two run at once (M6 and Design-5), so any list by time makes the numbers jump. Answered in chat with that cause, and three fixes drawn, each keeping the inside of a sprint top down, oldest first.

Asked by the question tool: "Milestones that don't look out of order. On https://claude.ai/artifact/1h9D1pYjS97Jj95D4qKN6f: v25 as it is, then three fixes. Fold M6 in each to see the milestones together. Which one?" Options: "2: grouped by state (Recommended)"; "1: the plan's order"; "3: order of work, no numbers"; "Mix or none". Pictures: docs/design/mockups/options-order2/ (now, o2-1 to o2-3); options-order/ kept for the record, its layer now also keeps its order through in-place redraws.
10. "Hmm honestly none of those seem right to me. What makes more sense to me conceptually is organizing the timeline by when things should have been done then somehow showing where they dragged on and why"

Read by the Chief of Staff as: the list's order should come from each milestone's (and sprint's) planned finish, its due date, so the order is the plan's intent in time; then each item shows how far it ran past that date, and why. The records do not yet carry a due date or a reason for a slip, so the dates and reasons drawn are examples, and real ones would be a request for the building session.

Asked by the question tool: "By when it was due, and how far it dragged. On https://claude.ai/artifact/QEMx4jr3SFP2ZdNAjCEJkc: v25 as it is, then three live phones. In all three, milestones run by due date, their numbers follow that order (M6 becomes 2.2), Now sits at the clock, and each shows on time or how long it dragged, with a Why. Due dates and reasons are examples. Which one?" Options: "A: a bar on each row (Recommended)"; "B: words only"; "C: one shared time axis"; "Mix or none". Pictures: docs/design/mockups/options-due/ (now, due-A to due-C).
11. "So looking at design as an example - I see 2.1/2.2/2.3… and the design milestone is all over the place. This is where my brain gets thrown off."

Read by the Chief of Staff as, to be confirmed: each milestone row carries two numbers that disagree. The position number (2.1, 2.2, 2.3) runs in order, but the standard milestones' own names (Design-1, Design-5, Design-6, Design-3) carry the model's numbering, so "2.3 Design-5" reads as two orders at once.

Asked by the question tool, to confirm the reading above before drawing: "... So a row reads '2.3 Design-5': two orders at once. Is that what throws you off?" Options: "Yes, the two numbers"; "Partly"; "No, something else".
12. "Yes, maybe the issue is that I’m picturing the fluid milestones as rigid fixed steps."

Read by the Chief of Staff as: yes, the two numberings; and underneath, the milestones are outcomes that can be worked side by side, not steps in a fixed order, so the page should stop presenting them as numbered steps. To be drawn: rows with one naming only, in due order with the drag (as in due option A), and milestones shown as the phase's goals, apart from the flow of time.

Asked by the question tool: "Milestones as goals, not steps. On https://claude.ai/artifact/LiEd3RgzZQSJdkvCvokYCL: the due-date order as it was, then two live phones with no step numbers anywhere, each milestone by its name only, keeping the due order and drag bars. Which one?" Options: "2: names only, goals up front (Recommended)"; "1: names only"; "Mix or none". Pictures: docs/design/mockups/options-fluid/ (now = options-due's due-A, fl-1, fl-2).
13. "I think I’m over working it, all I really want is an established order of operations basically so I can read things in the order they occurred or were meant to I guess?"

Read by the Chief of Staff as: one plain order, top down, at every level: each thing where it happened, or, if it has not happened yet, where it is meant to happen; the numbers follow that same order, so they never jump; nothing else added (no bars, no goals strip, no group headings). To be shown against v25, and asked once.

Asked by the question tool: "One order of operations. On https://claude.ai/artifact/QPCV8xRaP4sXL2o3ypcUsQ: v25 as it is, then one live phone: top down at every level, each thing where it happened or is meant to, numbers following that order, the standard milestone ids hidden, nothing else added. Is this it?" Options: "Yes, that's it (Recommended)"; "Close, but…". Pictures: docs/design/mockups/options-sequence/ (now, seq); built from options-order (ORD = 'A') and options-due (DUE_OPT = 'N').
14. "Yes, that's it (Recommended)"

Carried out: one order of operations, top down at every level (phase, milestones, a sprint's events, a plan's actions): each thing where it happened, or where it is meant to; milestones placed by when their work began or is meant to begin, with Now at the clock; the numbers follow that order; a standard milestone's own id (Design-5) is hidden so only one number shows; nothing else added. Start times are examples until the records carry them. To be built into the library and then mockup v26 over v25.

Shown in chat: the library with ReadingOrder (https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W, version 22) and mockup v26 (https://claude.ai/artifact/WZtRzxpycyXM4gkf8esKqK).
