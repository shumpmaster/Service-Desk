# Mockup v24 build layer

v24 is v23 plus this layer. It carries out the owner's round 6, answers 3 and 6 (decisions/questions/P-005-design-round-6.md), the first half of answer 6. Home and the map are as in v23.

    python3 v24.py ../timeline-v23-craft.html ../timeline-v24-craft.html

The drawing is the live option's own code, `../options-weight/source/` (`weight.css` and `weight.js` with `WT = 'A'`), so the option the owner chose and the mockup stay one. The library's card is EventWeight.

- Each event in a project's list takes a weight from what it is. Turning points (a stop, a decision, a gate, a merge to main, anything waiting on you): a 34 icon and the title in 17 semibold, with more air. Checks (reviews, checks): as before. Routine (commits): one quiet line, a 20 outlined icon, the title in 14 grey, any Needs or Why tag and the time.
