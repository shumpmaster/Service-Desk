# Mockup v18 build layer

v18 is v17 plus this layer. It carries out the owner's round 5 on the branch map (decisions/questions/P-005-design-round-5.md, answers 1 and 4). Everything else is as in v17.

    python3 v18.py ../timeline-v17-craft.html ../timeline-v18-craft.html

The drawing is the live option's own code, `../options-map-fit/source/` (`fit.css` and `fit.js` with `FIT_OPT = 'C'`), so the option the owner chose and the mockup stay one. The library's card is MilestoneMap.

- Tapping a milestone's row selects it (and opens it); the page opens with the milestone in progress (M6) selected. Folding the selected milestone, or the cross on the chip at the map's lower right, brings back the whole phase.
- The map shows only the selected milestone's sprints across the full width, lanes 50 apart. Every event wears its icon; planned events sit at the right as open rings; an icon closer than 20 to its neighbour shrinks to 72%.
- The events in view in the list take about six times the room, sit under the window, and carry their kind and a short title in two lines. As the list scrolls, the spread follows; the map redraws in a step when rows come and go.
- The floating band is about 20 points taller while a milestone is selected.
