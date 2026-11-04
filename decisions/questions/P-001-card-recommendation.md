Ruling: A — the card fix is delivered now as a separate addition to the desk, project item P-003, with its milestone in the desk's own project document marked for P-003; the briefing work stays P-002

Question: questions/P-001-card-recommendation.md
Milestone: none (no milestone exists for this fix yet; this question decides which piece of work it joins)

Question, as put: How should the desk's fix for showing my recommendation on a decision card be delivered?
Options, as put:
  A. An addition to the desk now, as its own new piece of work (P-003), separate from the pull-request briefing page (P-002, not filed yet).
  B. Fold it into the pull-request briefing page (P-002).

How it was answered: the question was filed in PR #278 after the Critic's three checks (reviews/P-001-card-recommendation/critic.md, PASS at round 3), and put to the owner in the Chief of Staff's session (session_01QBwHGLAD7AxQEHaeDupxMw) on 2026-11-04 by the session's question tool, once PR #278 was open, with the options worded for the chat as "A: own addition now (Recommended)" and "B: fold into briefing page"; the owner chose "A: own addition now (Recommended)", which maps to option A. A reversible ruling, answered by the owner. Recorded by the Chief of Staff, word for word, as AGENTS.md §5 has a ruling asked in a session recorded.

## The owner's words, verbatim
"A: own addition now (Recommended)"

## The owner's answers given earlier in the session, carried by the question, verbatim
- On the go-ahead (session_01QBwHGJj8xSAqpKWLY9qhk5, 2026-11-03): "Proceed with the fix"
- On holding a card back (2026-11-04): "Well then we need to make sure the cards don't show up until then."
- On the one-day fallback (2026-11-04): "Show it after a day, flagged (Recommended)"

## How it is carried out
- The Chief of Staff files project item P-003 (a project request with no `enters`, so it starts at a short Discovery scaled to its size) and drafts its brief and milestone line in docs/PROJECT.md, the line ending ` · for: P-003`; the Critic checks the line before it goes to the owner, who approves the plan and milestone at P-003's Design gate.
- The fix's scope, as the question gives it: a decision card whose Chief of Staff's notes are not on the main branch is held off the owner's queue; once they are, it shows with the notes' recommendation and that answer's button marked Recommended; a day after the card was raised with no notes, it shows marked "No Chief of Staff recommendation yet". Gate cards are left as they are.
- It is built on the desk's page code with its tests and reviewed by the Reviewer and the design reviewer, then passes the Build and Launch gates; the owner approves the live deploy.
- Until it is live, the Chief of Staff puts its notes on the main branch before the owner answers any card, and says the recommended word in plain text.
