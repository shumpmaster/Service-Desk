Ruling: B — the timeline keeps GitHub's run and check results for the whole life of the work, as copies saved as files in each project's own repository; nothing is stored at Cloudflare
Proxy: done at the owner's request (the owner answered in the session by the question tool, verbatim: "B: Copies as repo files (Recommended)"; the answer is the owner's own, and this line marks only that the Chief of Staff recorded it)

Question: questions/P-005-lasting-copies.md
Milestone: Discovery-7, M6, M7

Question, as put: GitHub now deletes its run results after 90 days; should the timeline keep copies for the whole life of the work, and if so, where?
Options, as put:
  A. 90 days, with no copies: the timeline shows each result while GitHub keeps it, then shows it as no longer kept.
  B. The whole life, as files in the repositories: each result is copied, soon after its run ends, into a file saved in its own repository, which the deleting does not touch.
  C. The whole life, at Cloudflare: a new program on the owner's Cloudflare account, run on a schedule, copies each result before it is deleted into Cloudflare's storage.

How it was answered: the question was filed in PR #403 after the Critic's cold reads (rounds 1 to 3 FAIL, round 4 PASS), and put to the owner in the Chief of Staff's session (session_01QBwHGL64KjMdsZ4DVaQDkL) on 2026-11-13 by the session's question tool, once PR #403 was open, with the options worded for the chat as "B: Copies as repo files (Recommended)", "A: 90 days, no copies" and "C: Copies at Cloudflare", each with its consequences. The owner chose "B: Copies as repo files (Recommended)", which maps to option B. A ruling on the plan's scope and data boundary; answered by the owner, not by proxy. Recorded by the Chief of Staff, word for word, as AGENTS.md §5 has a ruling asked in a session recorded.

## The owner's words, verbatim
"B: Copies as repo files (Recommended)"

## How it is carried out
- The plan (docs/projects/P-005.md) is redrafted: section 1's reach back through the whole life of the work holds for run and check results through the copies; section 5's data boundary records that lasting copies stay in the repositories and Cloudflare holds none; the "Looked at it; remember" mark is kept in the repositories or on each device, its place set in Design.
- The copies need a change to the records the projects keep, written by an automated job in each repository, since the desk holds no key that can write. That change is made in the operating model and comes to the owner as its own ruling, filed as a question with what it writes, how often and what it costs; until the owner approves it, nothing is copied, and each result that passes 90 days meanwhile shows as no longer kept.
- What a copy can read from GitHub, and how long copies are kept, are set in Design.
