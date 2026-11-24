# LevelRails

How a project's list tells its levels apart: rails, a label for each level, one size per level, and quiet marks. Chosen by the owner on 24 November 2026 (decisions/questions/P-005-design-round-7.md: answer 8, "a better visual delineation on the different hierarchy elements"; answer 9, "the rails, with a label of some sort and a more subtle & modern icon set with proper indentation and text sizing"; answers 10 to 15, the revisions).

- **Top down** (ReadingOrder), every level numbered from phase to action: 2, 2.2, 2.2.2, 2.2.2.3, 2.2.2.7.1.
- **The phase heading** starts at the left with no ring: PHASE, its name in 22 bold, Now and its percent; a soft grey rule under it. Under the heading, one box per milestone in the list's order, in its status colour (outlined if planned), a blue tick where Now sits, and the current milestone (the one the map is fitted to) raised and ringed with its number. Tapping a box goes to its milestone.
- **A milestone**: MILESTONE, its number and name in 17 semibold; a thin 30 ring with its percent inside, no % sign. Its sprints hang from a 2-point rail through the ring.
- **A sprint**: a thin accent bar in its status colour, SPRINT, its number and name in 15 semibold, and ten small squares to the right of the title, as many filled as tenths done, in the same colour (the owner's picture, docs/design/references/2026-11-24-segmented-progress.jpg, its lower style); the event count moves to the line under. Its rows hang from a neutral 1-point rail.
- **A row under a sprint** (an event, or an agent's plan): its fourth number on a line of its own at the top, then the kind and tags, the title in 15 (turning points semibold), the details in 12. Icons are thin line icons with no disc, in the quieter ink; main's in full ink.
- **Nothing moves**: folding or opening a row keeps the tapped row where it was on the screen.
- Colour: only the soft status colours and the one blue.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
