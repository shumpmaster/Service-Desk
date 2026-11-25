# TopPills

A project page's top: one row, and every phase kept in the list below it. Chosen by the owner on 25 November 2026 (decisions/questions/P-005-design-round-7.md: answer 20, "I want every phase, milestone combination shown on the table, I just want the ones we aren't looking at collapsed"; answer 21, "redesign the phase tiles to add more space for the text timeline ... get rid of the header on this page"; answer 22, "Convert the project Pills and the phase pills into two separate pills, that act as dropdown filters. And place both of them in the top. Then do a final pass on space optimization and readability."; answer 23, "Yes, build it into v31").

- **One row at the top**, floating with the map: Back, the **project pill** (the project's name and how many things wait on you), the **phase pill** (the phase in view, its small progress ring and name), then the bell (Needs you) and More. The slim title bar (ProjectHeader on a project's page), the row of project pills and the four phase tiles (PhaseRow) are gone; the live line is no longer shown.
- **The project pill** opens the list of projects with what waits in each; choosing one switches to it.
- **The phase pill** opens the phases, top down, with the gates between them and each phase's percent; choosing one goes to it in the list. As the list scrolls, the pill follows the phase at the FixedCentre, and so does the map (MilestoneSelect).
- **Every phase stays in the list**, top down, with the gates between them: each phase with all its milestones as rows, folded unless opened. Nothing is swapped out.
- **The map** gives each sprint a lane of its own, 40 apart; a sprint's name steps aside where it would sit on an event's words.
- **Legibility**: the list's titles 15.5 and detail lines 12.5, the map's words 10.5; an event's first line wraps rather than cut its status. The floating top is about 339 high on a 393 by 852 screen.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
