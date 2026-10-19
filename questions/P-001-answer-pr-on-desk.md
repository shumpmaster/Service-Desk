# Ruling needed: While your answer is being recorded, should its pull request still count as waiting on you?

Milestone: none (notifications are not yet a milestone; this question shapes how the desk counts)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: When your Chief of Staff marks a question as asked in your session, the desk will show it, once built, as "being asked", then "your answer is being recorded" once the pull request that records your answer opens, with no answer link either way. The pull request itself still shows under Merges as waiting on you while it is open, as you chose on 17 October, though the automatic job merges it within minutes; it sends no notification, as you ruled on 18 October. So the desk still shows one thing for you to do when there is nothing. A question asked without the mark, or still open after 8 hours, shows its answer link as before. Left unruled, the pull request keeps counting.
OPTIONS:
  A. Keep counting it — As you chose on 17 October. It shows under Merges as waiting on you, with the words "Your answer to <question>: the automatic job merges it, usually within minutes", and the desk is not "Quiet" until it merges. No extra reads.
  B. Show the automatic job's pull requests as being recorded — Only pull requests the job may merge itself (ones that only file or answer a question, tidy away a question already answered, or add your Chief of Staff's notes): while open and not yet left for you, they show as "Being recorded by the automatic job", not counted, so the desk can read "Quiet". If the job leaves one for you, for example because a check failed, it counts again at once, as it would notify. The desk then reads each such pull request's checks and the job's latest runs, about 5 to 8 more GitHub reads per pull request, a few a day, within its limits. This changes your 17 October answer for those pull requests only.
RECOMMENDATION: B — everything the desk shows as waiting on you is then something to do, as your notifications already are.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: how the automatic job's open pull requests count on the desk; what notifies does not change
DEFAULT: A   TIMEOUT: 48

## Context
- The owner reported following a stale answer link on a question already answered in the session (source: docs/design/references/owner-report-2026-10-18-stale-answer-link.md)
- The seven questions, filed in four pull requests, sat on main for about 4, 54, 6 and 3 minutes, filing by filing, between the filing and the answer being merged (source: docs/design/references/owner-report-2026-10-18-stale-answer-link.md)
- The owner chose to keep filing every ask, and to close the gap between an answer in the session and its record landing (source: decisions/questions/P-001-file-only-required.md)
- While open, the automatic job's pull requests show as waiting on the owner (source: decisions/questions/P-001-asks-merge-on-desk.md)
- A pull request the automatic job will merge sends no notification (source: decisions/questions/P-001-notify-job-merges.md)
- A question marked as asked in a session, or whose answer's pull request is open, shows with no answer link (source: specs/S-001.md, AC77)
