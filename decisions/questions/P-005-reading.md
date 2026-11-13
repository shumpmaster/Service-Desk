Ruling: A — the timeline reads with the desk's read-only key, with read permissions for deploys and pass-or-fail marks added to that same key; no GitHub App is made, and the project stays at T1
Proxy: done at the owner's request (the owner answered in the session by the question tool, verbatim: "A: Keep the read key (Recommended)"; the answer is the owner's own, and this line marks only that the Chief of Staff recorded it)

Question: questions/P-005-reading.md
Milestone: Discovery-7, M7, M8, M9

Question, as put: Should the timeline read your projects through a new read-only GitHub App, or keep the desk's read-only key?
Options, as put:
  A. Keep the read-only key: the timeline reads with the key the desk has today, with read permissions added for deploys and pass-or-fail marks, and shows CI from automated runs and those marks.
  B. Read through a read-only GitHub App: a private App on the owner's account, with read permissions only, check results included, its key held by the desk's server code on the owner's Cloudflare account.

How it was answered: the question was filed in PR #403 after the Critic's cold reads (round 1 FAIL, round 2 PASS), and put to the owner in the Chief of Staff's session (session_01QBwHGL64KjMdsZ4DVaQDkL) on 2026-11-13 by the session's question tool, once PR #403 was open, with the options worded for the chat as "A: Keep the read key (Recommended)" and "B: Read-only GitHub App", each with its consequences. The owner chose "A: Keep the read key (Recommended)", which maps to option A. A reversible ruling on the plan's scope; answered by the owner, not by proxy and not by default. Recorded by the Chief of Staff, word for word, as AGENTS.md §5 has a ruling asked in a session recorded.

## The owner's words, verbatim
"A: Keep the read key (Recommended)"

## How it is carried out
- The plan (docs/projects/P-005.md) is redrafted: the timeline reads with the desk's read-only key; section 5's limits stay at $0 of new spend and T1; the check-status mark is drawn from workflow runs and commit statuses, and a check result the key cannot read shows as not recorded.
- Adding the Deployments and Commit statuses read permissions to the key is the owner's own click on GitHub's token page, done when the build needs them; the key's value does not change.
- How alerts reach the owner from every project (a sender in each repository, a program on a Cloudflare timer, or a webhook on each repository) is chosen in Design, weighed against the draft 5-minute alert target, and put to the owner if it needs a new service.
- B stays open as its own change later, by a new ruling, for instance if experiment E2 shows check results carry something runs and statuses miss.
