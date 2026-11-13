# S-009 AC18 rubric: the operating notes (locked)

*Check author, from specs/S-009.md (frozen) AC18 (lines 65-71). Judged at the build's review on the
operating notes under docs/handover/P-003/. The mechanical part is
tests/acceptance/S-009/s009-ac18-operating-notes.test.mjs, which checks only that the notes are there and name the mark. Each item passes only if the notes say
it in plain words; a pointer to the spec or the code alone does not pass.*

| # | The notes say | Pass when |
|---|---|---|
| 1 | What a held decision card is and when it shows | A `dor-fail`, `stop` or `failure` card is kept off the queue, Home's count and the board until its notes with a recommended word are on the main branch, or a day (24 hours) after its raise time in its `card` entry, or at once if that entry is not in the part of the log the desk reads. |
| 2 | What "No Chief of Staff recommendation yet" means | It means the card showed without notes with a recommended word, no button is marked, and the mark gives way to the notes' word on the next read once such notes arrive. |
| 3 | Each of the three "not shown" lines | Each line's words are given with what could not be read; that they show on the queue and Home only; that a read that fails altogether (for example offline or signed out) hides every decision card while other cards stay shown with today's "Can't read" line; and that the cards come back by themselves once the records are read. |
| 4 | How to run the rule at a commit and a moment | A reader can follow the steps to get, for each decision card in queue/ at a commit, its id, its raise time as recorded (or "not recorded") and its state at a chosen moment, and the failed-read flag when the records cannot be got. |
| 5 | J6's check moments and two figures | The main line, the commit current at a moment, a card's arrival, its check moments from a due time, and the two figures (V6 held-too-long; held a day after reaching the main branch) are set down so a reader can work them out from the main branch's history. |
| 6 | What the figures can and cannot find | The V6 held-too-long figure can be other than 0 only if the rule's code on the main branch changes after M4; the second figure finds holds from a skewed or malformed raise time; neither finds a view showing a card with neither mark. |
| 7 | How to roll back | Redeploy the previous production deployment of the desk, then revert the merge, in that order. |
