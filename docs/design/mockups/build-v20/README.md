# Mockup v20 build layer

v20 is v19 plus this layer. It carries out the owner's comment on v19 and its answer (decisions/questions/P-005-design-round-5.md, answers 6 and 7). Everything else is as in v19.

    python3 v20.py ../timeline-v19-craft.html ../timeline-v20-craft.html

The drawing is the live option's own code, `../options-map-centre/source/centre.js` with `CENTRE = '2'`, so the option the owner chose and the mockup stay one. The library's card is MilestoneMap.

- On the map fitted to a selected milestone, the events in view spread 68 apart under the window, which sits in the middle; what came before is spread evenly over the left side, what comes after over the right.
- At either end of the milestone (nothing before, or nothing after) the window slides to that edge instead of leaving a half empty.
- With M6's 17 events before the newest ones, the left side is tight and its sprint names can crowd.
