# MilestoneSelect

Selecting a milestone without losing the phase. Chosen by the owner on 25 November 2026 (decisions/questions/P-005-design-round-7.md: answer 18, "I don't like how the timeline perspective gets thrown off when you select a milestone"; answer 19, "A is good, but yeah we need the whole phase map").

- **The map never zooms.** It always shows the whole current phase, drawn as MilestoneMap draws a milestone: each sprint on its own lane (a little closer, 40 apart), every event as its icon, the words in the window and on main, the window in the centre.
- **The selected milestone** (tapped in the list; the one in progress when the page opens) has its stretch of the map outlined with a dashed blue line over a faint tint, and a chip names it; the chip's cross clears it.
- The FixedCentre arrow and the window follow the scroll as before.
- Replaces MilestoneMap's zoom; MilestoneMap's drawing stays.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
- **v34 (round 8, answer 6):** a second tap on the selected milestone folds it and clears the selection; a third opens and selects it again (item 7).
