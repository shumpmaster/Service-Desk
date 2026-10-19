Ruling: the Orchestrator commits each Reviewer's verdict file (reviews/<PR>/reviewer.md) itself, word for word from the Reviewer's return, on this and future pull requests; the owner's own verdict (reviews/<PR>/owner.md) is always the owner's to write
Proxy: done at the owner's request (the owner answered in the session on 2026-10-14, multiple choice; the selection and the option texts are quoted verbatim below)

Question, as put: "The reviewer's verdict has to be saved as reviews/72/reviewer.md before the PR can go green. Who should add it?"
Answer: "You add it (Recommended)" (option text: "I commit the reviewer's text word for word, as the project's own rules allow, here and on future PRs. Your own verdict (owner.md) always stays yours to write.")
The other option offered: "I'll add it myself" ("You paste the text from the PR comment into a new file in GitHub, as you have before.").

How it is read: it matches CLAUDE.md ("record their verdicts verbatim in reviews/<PR>/<reviewer-id>.md") and reviews/README.md (at T1 the orchestrator records each verdict verbatim). It covers the Reviewer's file only. The owner's verdict file is never written by an agent, and no verdict text is ever changed. First applied: reviews/72/reviewer.md, and reviews/70/reviewer.md, which PR #70 merged without.
