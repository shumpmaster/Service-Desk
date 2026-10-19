# The owner's request of 2026-10-19: the desk as a board

Said by the owner in the Chief of Staff's session (session_012RJPVKAoLga2RkqLYRDcBY) on 2026-10-19, word for word:

> Okay a couple of things. I’m using the service desk and I have 5 things waiting on me, I’ve executed 3 I think? Those actions still remain there? I’m thinking the ui has become a little overdone in the sense that, all I’m looking for is the equivalent of a kanban board. I drag and drop a “waiting on me” card to complete and then I click the one link that takes me directly to whatever is needed from me as prefilled as possible

What happened (the Orchestrator's reading, from the records):
- The three "executed" items were pull requests #126, #127 and #128. Each needed a merge. The owner followed the desk's verdict box for each, which committed `reviews/<n>/owner.md` with "Verdict: PASS" (commits 153824c, 6f94da1 and f8f54ef), and none was merged, so each still waits on the owner.
- The desk offers the verdict box for every open pull request in Merges (S-001 AC52), whether or not the pull request needs a verdict, and gives no plain "merge it" step. That is a gap in the desk, not a mistake by the owner.

## The owner's follow-ups of 2026-10-19, word for word

On the board questions (recorded as decisions/questions/P-001-board-direction.md and P-001-board-bounce.md):

> Option A - however i want it to be into a transitory state -dont put it back where i moved it from, put it in a lane for like "hung up" or "kicked back" or something

After mockup version 2:

> hold on - not quite. My intention is that if i move a card over and then pass my verdict or update - the desk takes that in stride and it accepts my statussing. The check is intended to then confirm - at whatever cadence - is currently capable. If the desk status shows a mismatch between what github shows, then that gets marked and the card gets captured into the "kicked back" column.
>
> This was my thought - do you see issues with that?

The Orchestrator's answer in the session: no blocking issues; the check confirms each card's own step, not the whole item; a grace of about 5 minutes before "Kicked back", since some steps take a minute or two to show on GitHub; the owner's Done marks are kept on that device only, since the desk cannot write. Mockup version 3 (docs/design/mockups/board.html) draws this.

After mockup version 3:

> I wanted Left to right lanes. Not vertical
