Ruling: A — the widget reads the desk's records from GitHub with a read-only key and runs a copy of the desk's own code; the desk's sign-in, server and notification sender are not changed; it starts as its own addition to the desk, project item P-004, with a short Discovery that first measures whether a widget can do that work

Question: questions/P-001-home-screen-widget.md
Milestone: none (no milestone exists for the widget yet; this question decides how it is built)

Question, as put: How should a home-screen widget get the desk's summary?
Options, as put:
  A. The widget reads GitHub itself and runs a copy of the desk's own code.
  B. Have the notification sender also save a summary for the widget.
  C. Don't change the desk; build the counts-only widget instead.

How it was answered: the question was filed in PR #283 after the Critic's five failed readings and the one focused confirmation review the owner chose at the round limit (reviews/P-001-home-screen-widget/critic.md, PASS), and put to the owner in session session_01QBwHGKYRJzkU6QvrF8X1wc on 2026-11-04 by the session's question tool, once PR #283 was open, with the options worded for the chat as "A: widget runs desk code (Recommended)", "B: sender saves a summary" and "C: counts-only widget"; the owner chose "A: widget runs desk code (Recommended)", which maps to option A. A reversible ruling, answered by the owner. Recorded by the Chief of Staff, word for word, as AGENTS.md §5 has a ruling asked in a session recorded (also kept in docs/handoff/2026-11-04-chief-of-staff-widget.md).

## The owner's words, verbatim
"A: widget runs desk code (Recommended)"

## The owner's answers given earlier in the session, carried by the question, verbatim
- On the three widget mockups (2026-11-04): "Option 2"
- At the Critic's round limit (2026-11-04): "One final check (Recommended)"

## How it is carried out
- The Chief of Staff files project item P-004 (a project request with no `enters`, so it starts at a short Discovery scaled to its size) and drafts its brief and milestone line in docs/PROJECT.md, the line ending ` · for: P-004`; the Critic checks it before it goes to the owner, who approves the plan and milestone at P-004's Design gate.
- Discovery measures first whether a Scriptable widget can make the GitHub reads (hundreds per project on a first refresh, a few dozen after) and run the desk's read model within its time and memory. If it cannot, the route comes back to the owner, with B or C as the fallbacks the question named.
- The widget's scope, as the question gives it: the desk's own summary, what waits on the owner and each project's state and headline, for the desk's three projects; a tap opens the desk. A build step in the desk's repository packs the desk's card-making code into one Scriptable file, rebuilt after each desk change that affects the cards.
- It is built as ordinary source with tests and reviewed by the Reviewer (the design reviewer too if it writes into the page's served files; the owner too if it changes the package file), then passes the Build and Launch gates.
