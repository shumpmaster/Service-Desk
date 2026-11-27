# EventWeight

How heavy an event looks in a project's list comes from what it is, so the few that matter stand out. Chosen by the owner on 17 November 2026 (decisions/questions/P-005-design-round-6.md: answer 3, a comment on v21, "This entire flow here is solid, but in its current visual format every single event has the same weight and means nothing unique, can we change that"; answer 6, "I want to go with Option A").

- **Turning points**: a stop, a decision, a gate, a merge to main, or anything waiting on you. The icon disc grows to 34 (its icon 19), the title is 17 semibold and wraps, and the row takes 12 above and 10 below.
- **Checks**: a review or a check, passed or failed. The StatusMark row as it was: 26 disc, kind and tag, title in 15, the by-line.
- **Routine**: a commit (a draft or a revision) and other agent housekeeping. One quiet line: a 20 outlined icon in `text-2` with no corner mark, the title in 14 `text-2`, then any Needs or Why tag and the time in 12; the kind word, the plain Done tag and the by-line go. A failed or waiting tag would still show.
- Colour does not change: neutral greys and the soft status tints only. The order and the tree stay.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
- **v35 (round 8, answers 8 and 9):** a decision of the owner's says so (Yours, By proxy) and quotes the words it applies; a stop waiting on the owner reads Yours · waiting, the rule that fired and what it holds up, with Answer. See KindRows and YoursMark.
- **v36 (round 8, answer 12):** the line under an event drops the usual actor for its kind (a commit's spec writer, a review's plan reviewer, a decision's orchestrator, a check's Actions); "by you", an unusual actor and any line that adds something stay (item 2). A wait shows on its row (WaitTime, item 7).
- **v37 (round 8, answers 14 and 15; look item 3A, fewer tags):** the kind, a grey state (Done, Planned) and the time join the small number line ("2.2.2.10 · Stop · 9:42 am"); only the tinted states (NOW, Yours · waiting, Failed) stay before the title; Why and the session tag move to the row's foot, and a stop's Answer takes a line of its own under them.
- **v44 (round 8, answers 27 and 28):** PlainTitle's rule on every row; the usual actor named plainly when shown (the scheduler, the plan reviewer); a stop or decision that is done reads "Answered".
