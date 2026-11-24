# Mockup v27 build layer

v27 is v26 plus this layer. It carries out the owner's round 7, answers 2 to 5 (decisions/questions/P-005-design-round-7.md). Home is as in v26.

    python3 v27.py ../timeline-v26-craft.html ../timeline-v27-craft.html

The drawing is the live options' own code: `../options-sessions/source/` (`SS = 'A'`) and `../options-context/source/` (`CX = 'A'`), as shown on `../options-context/` (cx-A). The library's cards are SessionLink and ContextView.

- Each event of M6 and Design-5 carries one tag on its first line: Claude whenever a conversation stands behind it (the session that did it; for a pipeline step, the Chief of Staff session at work on P-005 when it ran, matched by time from sessions/chief-of-staff/; for the owner's merge, the session that prepared it), otherwise Run, otherwise PR. Its bubble opens the conversation, with the run or pull request beside it. The links are real.
- Holding the round button (about half a second) turns the Context view on or off; a tap still jumps to Now. Every phase and gate is one line; the current phase opens to its milestones, sprints and events, each row a number, a title and its link, in the same order and numbers as the full list. The map and the phase row step aside.
- Events outside M6 and Design-5, and other projects, carry no link yet: only those were matched to their sessions.
