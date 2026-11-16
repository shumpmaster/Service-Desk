# Mockup v14 build layer

v14 is v13 plus this layer. It carries out the owner's fourth round, on the home page (decisions/questions/P-005-design-round-4.md, answers 6 to 8). Everything else behaves as in v13.

    python3 v14.py ../timeline-v13-craft.html ../timeline-v14-craft.html

On the home page (the library's DeskMap):

- **The desk map replaces the project cards.** Each project, in the desk's order, is one lane on a shared two-week axis, 31 October to now (14 November, 17:25, the mockup's now). Time is stretched toward now (square root), so today's events have room. The project cards are still drawn but hidden, so tapping a lane opens its project through v13's own path.
- **It opens large**, at 62 per lane, with the project's name, its waiting count in the blue badge, and its one line. **It folds** to 34 per lane, with the names, badges and pop-ups only, once the page is scrolled past 60 points, and stays pinned in the glass band. It opens again when scrolled back above 20. Lanes, names and pop-ups slide over 0.4 s; reduced motion swaps at once.
- **Pop-ups** come from the real NEEDS records, grouped by kind within a project: the timeline's stop card ("Your call", red) and its three questions ("3 questions", yellow), and the widget's failed gate ("Failed · your call", red). Each sits at its time on its lane, the others flowing left; one with no room on the left grows rightward. Tapping one scrolls to its rows in Needs you and lights them for about 1.5 s. If Needs you is folded away, nothing is lit.
- **Activity before today is an example**: the dots, the branch loops and operating model's green release.
- Coming back from a project redraws the map. A spacer at the foot leaves room to scroll far enough for the map to fold.
