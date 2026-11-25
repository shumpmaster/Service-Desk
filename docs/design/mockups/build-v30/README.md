# Mockup v30 build layer

v30 is v29 plus this layer. It carries out the owner's round 7, answers 18 and 19 (decisions/questions/P-005-design-round-7.md). Home is as in v29.

    python3 v30.py ../timeline-v29-craft.html ../timeline-v30-craft.html

The drawing is the live option's own code, `../options-select/source/`: sel.css and sel.js (`SL = 'A'`), and whole.py, whose checked patches let the fitted map (round 5) take every milestone of the current phase. The library's card is MilestoneSelect.

- Selecting a milestone no longer zooms the map. The map always shows the whole current phase, drawn as the fitted map drew one milestone: each sprint on its own lane (40 apart), every event as its icon, the words in the window and on main, the window in the centre.
- The selected milestone (tapped in the list; the one in progress when the page opens) is outlined on the map in dashed blue over a faint tint, with a chip naming it; the chip's cross clears it.
- The fixed centre's arrow and the window follow the scroll as before.
