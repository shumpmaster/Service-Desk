# The owner's request of 2026-10-19: the desk as a board

Said by the owner in the Chief of Staff's session (session_012RJPVKAoLga2RkqLYRDcBY) on 2026-10-19, word for word:

> Okay a couple of things. I’m using the service desk and I have 5 things waiting on me, I’ve executed 3 I think? Those actions still remain there? I’m thinking the ui has become a little overdone in the sense that, all I’m looking for is the equivalent of a kanban board. I drag and drop a “waiting on me” card to complete and then I click the one link that takes me directly to whatever is needed from me as prefilled as possible

What happened (the Orchestrator's reading, from the records):
- The three "executed" items were pull requests #126, #127 and #128. Each needed a merge. The owner followed the desk's verdict box for each, which committed `reviews/<n>/owner.md` with "Verdict: PASS" (commits 153824c, 6f94da1 and f8f54ef), and none was merged, so each still waits on the owner.
- The desk offers the verdict box for every open pull request in Merges (S-001 AC52), whether or not the pull request needs a verdict, and gives no plain "merge it" step. That is a gap in the desk, not a mistake by the owner.
