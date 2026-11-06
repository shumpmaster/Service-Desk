Ruling: A — at the end of the widget test, the widget sends its copy of what GitHub told it, and its log, straight to a new branch of the private portfolio repository, with a second key that can write files only in portfolio; one exception to "Phone only", for this test only

Question: questions/P-004-test-data-route.md
Milestone: none (the widget's milestone, M5, is still only a proposal in its plan, so nothing here serves a milestone yet)

Question, as put: May a copy of the widget test's data leave your phone, and by which route?
Options, as put:
  A. "Widget sends it to portfolio (Recommended)" — "One exception to Phone only: at the end of the test you tap "Send the test data", and the widget sends its copy straight to a new branch of your private portfolio repository on GitHub. It needs a second key, kept in the iPhone keychain like the first, that can write files only in portfolio (7-day expiry, deleted after); a key that can write portfolio's files could also change its main branch, which the desk reads, so a fault in the widget could change what the desk shows from portfolio. The copy never goes into your phone's Files, so your phone's iCloud backup doesn't pick it up. The Reviewer then downloads it into its working session to check it, as it already does with your repositories. Its own extra costs: the send step in the widget, the second key, and about 5 more minutes of your time."
  B. "You upload it to portfolio" — "One exception to Phone only, and to the desk's rule: you save the copy in Files (On My iPhone), upload it to a new branch of portfolio on github.com, then delete it and empty Files' Recently Deleted, which otherwise keeps it for 30 days. While the file is in Files, an iCloud backup may copy it, and that copy stays in Apple's iCloud until the backup is replaced, usually for days. You can avoid that by turning iCloud Backup off until the file is deleted. About 10 minutes."
  C. "Check timing only" — "No exception: the copy never leaves the phone. Only the log comes back, and it holds counts, project names and scrambled stand-ins for titles, no records. The test still checks that later refreshes finish and how long they take, but not whether each summary was right; that is checked later only by the desk's own test on sample records. This changes the pass mark the plan sets."

How it was answered: filed in PR #300 after the Critic's three readings (reviews/P-004-test-data-route/critic.md, PASS at round 3), then asked in session session_01QBwHGNFKViyibzxHx5qTtm on 2026-11-04 by the session's question tool, with the options exactly as above (recorded verbatim beforehand in docs/handoff/2026-11-04-chief-of-staff-widget.md, "The ask, as it will be put"). The owner chose "Widget sends it to portfolio (Recommended)", which is option A. A reversible ruling, answered by the owner. Recorded by the Chief of Staff, word for word.

## The owner's words, verbatim
"Widget sends it to portfolio (Recommended)"

## How it was carried out
- The test widget gained "Send the test data", guarded so it writes only the branch exp-007-test-data of portfolio, and lost its share items (reviews/EXP-007/_reviewer-widget-491baa7.md, PASS); EXP-007's registration took this route (experiments/EXP-007-widget-refresh.md, frozen at ad2709e).
- The owner sent the data on 2026-11-06 (portfolio, exp-007-test-data, 620e2f4), and the Reviewer judged the run (reviews/EXP-007/_reviewer-result.md).
