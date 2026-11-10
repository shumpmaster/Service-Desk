# Ruling needed: the loop stalls because its half-hourly timer fires only every few hours

Milestone: M4

WHY: The desk's loop is meant to wake itself every 30 minutes. In fact the timer has fired about 40 times in the last 10 days, not about 480: the gaps run 4 to 8 hours. After the loop starts itself five times in a row it stops by design and waits for the timer, so every time that cap is reached with work still to do, the work sits until the next late timer or until you start it by hand. That happened three times on 9 November (14:30Z, 15:32Z, and 21:22Z to 03:14Z), and it cost P-003 roughly 6 hours on the last one. The cap of five is the operating model's rule, not the desk's, so changing it is for the model's owner. Left unruled, the stalls go on and only your manual starts clear them.
OPTIONS:
  A. Raise it in the operating model as a lesson, with this evidence, and add a row to the desk's improvement register. Nothing on the desk changes now. I keep checking for stalls each session and tell you when a manual start would help; starting it stays your call. Cost: one model pull request for its owner to merge. Rules out nothing.
  B. As A, and also open a desk item so the desk tells you itself when the loop stops at the cap with work still ready. Cost: a new spec through the whole pipeline, which competes with P-003 for runs. Rules out nothing.
  C. Leave it as it is: no lesson, no register row. Stalls continue unrecorded; I still report them each session.
RECOMMENDATION: A, because the cause sits in the model's rule and GitHub's timer, so the fix belongs upstream, and A adds no work to a pipeline that is already the bottleneck.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the operating model's lessons file and the desk's improvement register; no code, check or workflow changes
DEFAULT: A   TIMEOUT: 24

## Context
- The loop's timer is set to every 30 minutes (source: .github/workflows/orchestrator.yml, `schedule`)
- The last 40 timer runs span 31 October 15:02Z to 10 November 11:30Z, 4 to 8 hours apart, for example 20:56Z then 03:14Z then 11:30Z on 9 and 10 November (source: GitHub Actions run list for orchestrator.yml, event schedule, read 2026-11-10 12:51Z)
- The loop starts itself at most five times in a row (source: governance/checks/orchestrator_git.py, `MAX_CHAIN = 5`, model S-015 AC10)
- The timer run at 20:56Z on 9 November was followed by five self-starts, the last at 21:17Z, and then nothing until the timer run at 03:14Z (source: GitHub Actions runs 866 to 872)
- The stalls at the cap at 14:30Z and 15:32Z on 9 November, and the part 27 note that held runs use up the chain (source: docs/handoff/2026-11-09-chief-of-staff-p002-28.md)
