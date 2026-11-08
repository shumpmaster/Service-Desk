# Ruling needed: When the desk cannot read the record of when each card was raised, should it hide decision cards and say so, or show them at once?

Milestone: M4

WHY: Something failed: the Critic has failed the card fix's new spec twice, and the second time its first reason was this point. The plan says that when the desk has not read the record of when each card was raised, a decision card shows at once. Your re-specify ruling says a card is held or shown only from the records on main. The two cannot both hold: a card shown because one read missed that record would be hidden again by the next read, and the desk and the notifications could disagree. The rewritten spec follows your ruling, and the Definer marks it as needing your answer before the spec can be frozen. The plan was approved at its gate, so changing it needs your ruling. If you do not answer, the spec cannot be frozen and the fix waits; this question does not default.
OPTIONS:
  A. Hide them and say so — while the desk or the notification sender cannot read that record, it shows no decision cards and sends no notice for them, and the queue and Home show the line "Decision cards not shown: the dispatch log could not be read"; once the record is read, each card is held or shown by its real age. Gate cards, questions and pull requests are unaffected. The plan's section 1 is changed to match.
     Cost: while the record cannot be read, you do not see decision cards at all, only the line; a card hidden this way more than a day after it was raised counts as a miss in the weekly value check. Rules out: a decision card showing and then vanishing. Reversible: yes.
  B. Show them at once, as the plan says now — a card shows straight away, marked "No Chief of Staff recommendation yet", and may be hidden again on the next read once the record is read.
     Cost: the views and the notifications can disagree for a while, which goes against your ruling that every view and the sender agree; it needs your ruling to set that part of the ruling aside, and the spec rewritten again. Rules out: nothing. Reversible: yes.
RECOMMENDATION: A — it is the only choice that keeps your ruling that every view and the sender agree, and it never hides cards silently, since the line says why. Confidence: high; it would change if seeing every card at once matters more to you than the views agreeing (then B).
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the card fix's plan and spec only; nothing is built yet, and the live desk is unchanged until the fix goes live
CHECKED: read cold by the Critic before it goes to the owner; reviews/P-003-log-unread/critic.md
DEFAULT: none   TIMEOUT: none (the spec cannot be frozen on a default: the Definer marks it as needed before freeze)

## Context
- The owner's ruling on card stop-5: "Whether a card is held or shown comes only from the records on main, so every view and the sender agree" (source: decisions/P-003/stop-5.md)
- The plan's rule: "A decision card whose raise time is not recorded (older than the log the desk reads, or the log not yet read) shows at once with the 'No Chief of Staff recommendation yet' mark, so no card is ever held for good" (source: docs/projects/P-003.md, section 1)
- The Critic's plan review of S-003, round 2: FAIL; its first finding is that a read that skipped the log shows a card at once and the next read holds it again, which the ruling forbids (source: reviews/S-003/plan.md on the item/P-003 branch, its FAIL recorded on main by run gha-42430505492-1 in dispatch-log/2026-11.jsonl)
- The rewritten spec's AC16 hides decision cards and shows the line while a read cannot get the log, and its open question 1 asks the owner to rule this before freeze, recommending it (source: specs/S-003.md, AC16 and open question 1, on the item/P-003 branch)
- Part 1 of the plan, which holds section 1, is settled when the owner approves the move out of Discovery, and the Design gate was ruled proceed (source: docs/projects/P-003.md, opening note; decisions/P-003/dor-4.md)
- A miss of V6 includes any decision card held more than a day after it was raised (source: docs/projects/P-003.md, section 6)

## What option A changes in the plan

In section 1, the bullet "Notes with no recommended word count as no notes. A decision card whose raise time is not recorded (older than the log the desk reads, or the log not yet read) shows at once with the "No Chief of Staff recommendation yet" mark, so no card is ever held for good." becomes:

- Notes with no recommended word count as no notes. A decision card whose raise time is not recorded (older than the log the desk reads) shows at once with the "No Chief of Staff recommendation yet" mark, so no card is held for good by a missing record.
- While a read of the desk or of the notification sender cannot get the dispatch log, it shows no decision card and sends no notice for one, and the queue and Home say "Decision cards not shown: the dispatch log could not be read"; once the log is read, each card is held or shown by its real age.
