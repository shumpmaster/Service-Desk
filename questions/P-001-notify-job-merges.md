# Ruling needed: Should a pull request the automatic job will merge notify you?

Milestone: none (notifications are not yet a milestone; this question shapes the spec change that adds them)

WHY: You asked for a notification whenever anything at all waits on you, as an immediate priority. The desk counts every open pull request as waiting on you, including the small ones the automatic job merges itself within minutes. Notifying you for those would mean pings for things you never need to touch. Leaving it unruled holds the notifications spec.
OPTIONS:
  A. No: only what truly needs you — The sender checks the job's own rules and skips a pull request the job will merge; if the job leaves it for you (a failed check, an answer that needs your merge), you're notified then.
  B. Yes: every open pull request — As the desk counts them today, including the job's, which then merge minutes later.
RECOMMENDATION: A — every notification then means you have something to do.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: which events send a notification; nothing built changes yet
DEFAULT: A   TIMEOUT: 48

## Context
- The owner asked, on 2026-10-18 in the session, to "add as an immediate priority, to enable a notification system for whenever anything at all is waiting on me", and "I want to know exactly when something shifts from being on the desk and its agents - to being on me" (source: this session, 2026-10-18)
- The 8 October ruling sends phone notifications as Web Push to the desk on the owner's iPhone Home Screen, from a GitHub run, but only "when it raises a card", built in M3 (source: decisions/questions/P-001-notifications.md, line 1)
- While open, the asks-merge job's pull requests show as waiting on the owner; the job merges them once their checks pass, usually within minutes (source: decisions/questions/P-001-asks-merge-on-desk.md; docs/LEDGER.md, L-0017)
- The job leaves for the owner a closing whose question is not reversible, a defaulted ruling, an answer with no Proxy line or a differing Milestone line, and a record named -notes or holding -critic (source: governance/checks/asks_merge.py)
