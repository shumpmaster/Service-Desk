# Mockup v16 build layer

v16 is v15 plus this layer. It carries out the owner's round 4 on the project's header (decisions/questions/P-005-design-round-4.md, answers 13 to 16). Home is as in v15.

    python3 v16.py ../timeline-v15-craft.html ../timeline-v16-craft.html

The drawing is the live option's own code, `../options-pills-header/source/` (`pills.css` and `pills.js` with `PILLS = 'B'`, `hdr.css` and `hdr.js` with `HDR = '1'`), so the option the owner chose and the mockup stay one. The library's card is ProjectHeader.

- On a project with a plan, the page's header moves into the floating band: one slim bar (Back, the title in 17 with "Live · as of 17:25 UTC" under it in 12, the bell and More, a little smaller), the project pills right under it at 32 high, then the branch map and the phase row. About 275 points float on a 393 by 852 phone.
- The large title leaves a project's page. Tapping a pill switches project in place; Back goes home.
- Projects with no plan in the mockup have no floating band, so they keep v15's header and pills.
