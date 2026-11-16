# Mockup v15 build layer

v15 is v14 plus this layer. It carries out the owner's fourth round, later (decisions/questions/P-005-design-round-4.md, answers 9 to 12). Everything else behaves as in v14, and inside a project as in v13.

    python3 v15.py ../timeline-v14-craft.html ../timeline-v15-craft.html

Home is drawn by the live option's own code, `../options-home-suggest/source/sug.js` and `sug.css`, with `SUG = 'C23'`, so the option the owner chose and the mockup stay one. This layer adds `v15.css` (question rows on up to two lines, aligned to the project's name) and `v15.js` (removes v14's desk map after v14 draws it). The library's card is WaitGroup.

- One sentence: how many things wait on you, in how many projects, and how many projects are quiet.
- A group for each project with something waiting, the longest wait first: the project's row (its current phase's gauge by v13's rule, the name with its waiting count, when it last moved, its one line), a slim two-week strip of the events that matter (merges dark, a stop or gate waiting red, questions yellow, now blue; the desk's real events only), then its waiting rows. Each row says what it holds up ("Holds up M6, M7, M8", or the phase when it feeds no milestone); the one waiting a week or more wears a red "Longest wait" tag. Each thing waiting shows once; tapping it opens its sheet, as in v13.
- The quiet projects fold into one row; tapped, they open as project rows with their strips.
- Tapping a project row opens the project.
