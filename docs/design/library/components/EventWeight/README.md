# EventWeight

How heavy an event looks in a project's list comes from what it is, so the few that matter stand out. Chosen by the owner on 17 November 2026 (decisions/questions/P-005-design-round-6.md: answer 3, a comment on v21, "This entire flow here is solid, but in its current visual format every single event has the same weight and means nothing unique, can we change that"; answer 6, "I want to go with Option A").

- **Turning points**: a stop, a decision, a gate, a merge to main, or anything waiting on you. The icon disc grows to 34 (its icon 19), the title is 17 semibold and wraps, and the row takes 12 above and 10 below.
- **Checks**: a review or a check, passed or failed. The StatusMark row as it was: 26 disc, kind and tag, title in 15, the by-line.
- **Routine**: a commit (a draft or a revision) and other agent housekeeping. One quiet line: a 20 outlined icon in `text-2` with no corner mark, the title in 14 `text-2`, then any Needs or Why tag and the time in 12; the kind word, the plain Done tag and the by-line go. A failed or waiting tag would still show.
- Colour does not change: neutral greys and the soft status tints only. The order and the tree stay.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
- **v35 (round 8, answers 8 and 9):** a decision of the owner's says so (Yours, By proxy) and quotes the words it applies; a stop waiting on the owner reads Yours · waiting, the rule that fired and what it holds up, with Answer. See KindRows and YoursMark.
