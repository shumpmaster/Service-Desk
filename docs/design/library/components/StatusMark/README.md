# StatusMark

The state of an event or a step, without a gauge. Chosen by the owner on 15 November 2026 (decisions/questions/P-005-design-round-3.md, answers 8 and 9: "I like option 2 with the text tags as shown in option 1. To indicate things like awaiting merge, check status etc..").

- The event keeps its kind's icon on a 26 `fill` disc (a merge on main keeps its dark `main-mark` disc). A step, the agent's plan between events, is shown the same way with the list-checks icon.
- A 14 round mark on the icon's lower right corner, ringed in `ground`: a check in `status-ok` on `status-ok-mark` (done, fine); an hourglass in `status-wait-tag` on `status-wait-mark` (waiting on you); a cross in `status-bad` on `status-bad-mark` (failed or blocked); a grey hourglass in `text-2` on `surface` for work under way that waits on no one (checks running). The state reads without colour too.
- The state as a text tag after the kind: waiting tinted yellow (`status-wait-tag` on `status-wait-tag-bg`, 4.7:1), failed or blocked tinted red (`status-bad-tag` on `status-bad-tag-bg`, 4.7:1), done or under way a plain grey word in `text-2`. Tags can name the state in the desk's words: Awaiting merge, Awaiting your answers, Checks running, 1 blocked.
- Red keeps meaning a problem (`status-bad` has the same value as `problem`).
- How gate, decision, research and stop show (the model's own steps) is still to be discussed; they keep their own icons for now.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
