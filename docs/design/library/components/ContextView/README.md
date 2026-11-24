# ContextView

The project at a glance, held from the round button. Chosen by the owner on 24 November 2026 (decisions/questions/P-005-design-round-7.md: answer 4, "a page toggle ... that filters the view to a scaled down timeline with simple motion that shows our same current phase/milestone/ task etc but simple the number and title plus the link ... Call this context view"; answer 5, "A: current phase open (Recommended)").

- **Turned on and off by holding the RoundButton** (about half a second); a tap still jumps to Now. The button turns blue while it is on, and a small label says which view you are in. On a keyboard, Shift with Enter or Space.
- **What it shows:** the same order and numbers as the full list (ReadingOrder). Every phase and gate is one line; the current phase opens to its milestones, sprints and events. Each row is a number (events have none, a status dot instead), a title, and its SessionLink. A milestone or sprint links to the Claude session most of its events link to; a gate links to the owner's ruling.
- **What steps aside:** the branch map and the phase row; the slim bar, the project pills and the tab bar stay.
- **Motion:** the list settles in from slightly larger, each row a beat after the one above, then lands on Now. The reduced-motion setting turns it off.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
