Ruling: A — until P-004 has a spec, each of its builder-class commits (EXP-007's result, and the second test's registration and result) carries no Spec: trailer, on purpose, and is added to the exempt block of governance/SURFACES.md with its own ledger entry, shown to the owner first and checked by the Reviewer; the owner's merge of each pull request is the approval

Question: questions/P-004-result-spec.md
Milestone: none (the widget's milestone, M5, is still only a proposal in its plan, so nothing here serves a milestone yet)

Question, as put: How should the widget test's result be filed, so it passes the desk's scope check?
Options, as put:
  A. "Exempt each such commit (Recommended)" — "The Builder files the result where the test's plan says, in a commit with no spec label, on purpose, since P-004 can't have a spec before its Design gate. That commit is then added to the desk's list of commits its scope and surface checks skip, with an entry in the decision log saying why. If you choose a second test, its written plan's commits and its result's are handled the same way, and a repeat's result too; last time's plan took nine commits. The list so far holds the desk's founding commit and last time's nine, which were a mistake already on GitHub; these would be its first planned entries, each shown to you first and checked by the Reviewer. Your merging each pull request is your approval. Quick."
  B. "Keep the Reviewer's record as the result" — "No result file is written. The Reviewer's verdict, already on the desk word for word with a plain summary written for the result, stands as the result, and the desk's notes record that the test's plan named a file that was not written. No exemption and no check change, and the test data can be deleted as soon as you rule. The folder of the desk's test results has a gap where this one would be, and it covers only this result: a second test's plan would still need A or D."
  C. "Wait for P-004's spec" — "The result is filed once P-004 has a spec, after its Design gate. Any widget P-004 goes on to build, a fallback included, gets one there. No exemption, but the test data and the phone's copy wait, perhaps for weeks, and if P-004 is dropped the result is never filed. A second test's plan or a repeat's result would wait for the gate too."
  D. "Change the check" — "The check is changed so a Builder commit may name a project like P-004 when it changes only a test result file. Fixes this for every later project, but the desk's checks come from its operating model, so a change made only here could be undone at the next update: the lasting fix is a change to the model, with its own written plan, the Critic's check, the Reviewer's and your approval. Days to weeks; the result waits."

How it was answered: filed in PR #312 after the Critic's three readings (reviews/P-004-result-spec/critic.md, PASS at round 3), then asked in session session_01QBwHGJ3UVJ6HY4SS92w7UW on 2026-11-06 by the session's question tool, together with the other next-step question, with the options exactly as above (recorded verbatim beforehand in docs/handoff/2026-11-04-chief-of-staff-widget.md, "The ask, as it will be put", under "Update: the next-step questions filed"). The owner chose "Exempt each such commit (Recommended)", which is option A. A reversible ruling (R3), answered by the owner. Recorded by the Chief of Staff, word for word.

## The owner's words, verbatim
"Exempt each such commit (Recommended)"

## How it is carried out
- The Builder files docs/handover/experiments/EXP-007-result.md from the Reviewer's verdict (reviews/EXP-007/_reviewer-result.md), with the deviation that the run used 553bcc6, not 491baa7, in a commit with no Spec: trailer.
- The Chief of Staff adds that commit's full sha to the exempt block with a ledger entry, in the same pull request; the Reviewer checks it there.
- The second test's registration and result commits are handled the same way (decisions/questions/P-004-widget-next-step.md).
- Once EXP-007's result is on the default branch, the owner deletes the portfolio branch exp-007-test-data and the phone's test data; both EXP-007 keys may be deleted at once.
