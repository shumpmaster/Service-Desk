Ruling: A — fix only how the old behaviour is recorded, in a new spec; on failure card 15 that is `re-specify`
Proxy: done at the owner's request (the owner told the Chief of Staff in session session_01QBwHGHz5MYhhmpeH91GSdw on 2026-11-12, verbatim: "Can you go with your recommendations on the questions, then adjust the handover if needed and provide me a copy paste handover prompt to start a new session"; the recommendation on this question was A)

Question: questions/P-003-baseline-proof.md (filed in #362, removed here)
Milestone: M4

Question, as put: The card fix is blocked by a third fault, in its own spec, so which way should it go? Its tests need a record of the old behaviour proved from git history that the pipeline's Builder and check run do not have.
Options, as put: A: fix only how the old behaviour is recorded, in a new spec; B: change the pipeline instead; C: build the card fix outside the pipeline; D: keep going as it is.
Recommendation, as put: A.

How it was answered: in the Chief of Staff's session (session_01QBwHGHz5MYhhmpeH91GSdw), on 2026-11-12 at about 15:50Z, after the question was on the default branch (#362). The owner asked the Chief of Staff to go with its recommendations on the open questions: this one and failure card 15.

## The owner's words, verbatim
"Can you go with your recommendations on the questions, then adjust the handover if needed and provide me a copy paste handover prompt to start a new session"

## How it is carried out
- Failure card 15 is answered `re-specify` in decisions/P-003/failure-15.md, the word A gives on a failure card. It is a strike, the second on this work after stop card 5.
- Option A's wording said the Check author records the old behaviour. The Check author may not see the desk's code (.claude/agents/check-author.md), so the card's instruction keeps A's direction, a record made before the build that the Builder cannot change, and leaves who runs it and how it is guarded to the new spec (decisions/P-003/failure-15-notes.md, "A correction to option A's wording").
