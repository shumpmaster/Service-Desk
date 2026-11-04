# Ruling needed: How may the widget test's data come back from your phone?

Milestone: none (the widget's milestone, M5, is still only a proposal in its plan, so nothing here serves a milestone yet)
Asked in session: session_01QBwHGNFKViyibzxHx5qTtm

WHY: To check that the test widget shows the right summary on your phone, the team member who checks the work (the Reviewer, who did not make it) needs a copy of what GitHub told the widget at each refresh, which holds your projects' records, including the two private ones (Personal-Org-Operating-Model and portfolio). Your ruling keeps that data on the phone only, and the desk's rule lets your project content go only to GitHub and Cloudflare. There is no way back from the phone that touches neither the phone's own storage, which your phone's iCloud backup may copy (a point not yet ruled), nor some place on GitHub. The route first drafted had you upload the copy to Service-Desk, which is a public repository, so it would have published your private projects' records; that route is withdrawn. Until you rule, the test can't be frozen or given to you. Nothing on the desk changes either way.
OPTIONS:
  A. "Send it through portfolio (Recommended)" — "The widget's copy goes back only through GitHub: you save it on the phone for a minute (On My iPhone, not iCloud Drive), upload it to a new branch of your private portfolio repository, and then delete it from the phone. The branch is deleted once the result is filed. Your records stay on GitHub, in a private repository; a phone backup that runs during that minute may copy the file."
  B. "Check timing only" — "Nothing with your records leaves the widget. The test still checks that later refreshes finish and how long they take, but whether each summary was right is not checked on your phone, only later by the desk's own test on sample records. This loosens the plan's pass mark."
  C. "Pause the test" — "Stop here. The test widget is kept only in this session's working copy, so it would have to be rebuilt in a later session."
RECOMMENDATION: A, because it keeps your records on GitHub, in a private place, and keeps the test's pass mark as the plan set it; the only exposure is a minute on the phone's own storage. My confidence is high. It would change if you don't want the other projects' records stored, even briefly, in the portfolio repository.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: only the widget test's steps and its registration; nothing the desk does or shows
DEFAULT: none (a ruling on where your project content goes is not taken by default)   TIMEOUT: none

## Context
- The test's check replays what GitHub told the widget, saved only in the phone's Caches folder, which the phone's backup skips; returning it was routed through the phone's own files and a Service-Desk branch (source: experiments/EXP-007-widget-refresh.md on build/definer/p004-widget-exp, Draft 3, Methods 6 and 7)
- The Critic found that route puts project content where the phone-only ruling does not reach, and asked for a ruling or a new route (source: reviews/EXP-007/_critic-r2-verbatim.md, finding 7)
- Service-Desk and Model-Lab are public repositories; Personal-Org-Operating-Model and portfolio are private (source: GitHub's repository listing for shumpmaster, read 2026-11-04 in session session_01QBwHGNFKViyibzxHx5qTtm)
- Your ruling: "Phone only (Recommended)", "Key in the iPhone keychain, records cached on the phone only, nothing synced to iCloud. Stays within the desk's current rule.", with the phone's own iCloud backup set apart as not ruled (source: decisions/questions/P-004-widget-why-and-data.md)
- The desk's brief lets the projects' content go only to GitHub and Cloudflare, plus Anthropic if a later piece of work leads to sessions (source: docs/PROJECT.md, lines 165-166)
- The plan's pass mark needs the later refresh to show "a correct summary every time", and the Reviewer compares each logged summary with the desk's own code run on the records as they stood then (source: docs/PROJECT.md, "Later work: the home-screen widget (P-004)", "Its Discovery, scaled to its size")
- The Reviewer checked the test widget: the log, the only file in the folder the backup copies, holds no project content; nothing goes to iCloud; it talks only to GitHub (source: reviews/EXP-007/_reviewer-widget-b2b1711.md)
