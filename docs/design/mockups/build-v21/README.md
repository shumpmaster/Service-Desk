# Mockup v21 build layer

v21 is v20 plus this layer. It carries out the owner's round 5, answers 8 and 10 to 14 (decisions/questions/P-005-design-round-5.md). Home, the header and the map are as in v20.

    python3 v21.py ../timeline-v20-craft.html ../timeline-v21-craft.html

The drawing is the live options' own code, in the order they were chosen, so the options and the mockup stay one: `../options-hierarchy/source/` (HIER = '2'), `../options-why2/source/` (WHY2 = 'B'), `../options-needs2/source/` (NEED4 = 'A'), `../options-bubble/source/` (BUB = '1') and `../options-chain/source/` (CHAIN = 'C'). The library's card is EventBubble.

- The list is a tree: a line down from an event's icon with an elbow into each row under it. A ringed icon has something under it; tapping it folds or opens that.
- Each event with a reason has a small outlined "Why"; tapping it opens the sentence in a bubble under the title.
- Each event with something unmet has a "Needs" tag, tinted by the worst state; tapping it opens a bubble with a plain checklist ("Before this can happen", how many are done, a line each with its mark, the words and who or what it waits on, then "Then:"). A chevron opens that need's own needs inside the bubble, with a trail back. Nothing moves the page.
- While the bubble is open, its chain is ringed in blue and joined by dotted lines on the floating map and in the list's margin; the rest fades.
- Requirements and reasons are examples, on S-011 only.
