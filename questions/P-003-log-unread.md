# Ruling needed: When the desk cannot read its records, should it hide decision cards and say so, show the ones that have notes, or show them all at once?

Milestone: M4

WHY: Something failed: the Critic has failed the card fix's new spec at both of its reviews, and the second time its first reason was this point. The next review is the third, and a third failure stops the work and brings it back to you. The plan says that when the desk has not read the record of when each card was raised, a decision card shows at once. Your re-specify ruling says a card is held or shown only from the records on main, so every view and the sender agree. The two cannot both hold: a card shown because one read missed that record would be hidden again by the next read, and the desk and the notifications could disagree. The rewritten spec follows your ruling, and its writer marks this as needing your answer before the spec is frozen. The plan was approved at its gate, so changing it needs your ruling. All the options can be undone. If you do not answer within 72 hours, I adopt my recommendation, B.
OPTIONS:
  A. Hide every decision card and say so — while a read of the desk or of the notification sender cannot get its records (the queue, the notes or the record of when each card was raised), it shows no decision card and sends no notice for one, and the queue and Home say which record could not be read. Once it is read, each card is held or shown by its real age. Gate cards, questions and pull requests are unaffected. This is what the rewritten spec says now.
     Cost: for as long as the records cannot be read, you see no decision card at all, only the line, with no time limit, which goes against the plan's promise that no card is hidden for more than a day; how often or for how long that happens is not known. The weekly value check cannot count these as misses, because a failed read leaves no record behind; the line on the desk at the time is the only sign. Rules out: a card shown and then hidden with no reason given, and views that disagree.
  B. Show the cards that have notes, hide the rest and say so — as A, except that when only the record of when cards were raised is missing, a decision card whose Chief of Staff notes are on main still shows with its recommendation, since that does not depend on when it was raised; only the cards without notes are hidden, with the line.
     Cost: as A, but only for cards without notes, so far fewer are hidden; the spec is changed once more before it is frozen and reviewed again. Rules out: the same as A.
  C. Show them all at once, as the plan says now — a card whose raise time has not been read shows straight away, marked "No Chief of Staff recommendation yet", and may be hidden again on the next read.
     Cost: a card can show and then vanish, and the views and the notifications can disagree for a while, which sets aside part of your re-specify ruling; the spec is rewritten again. Rules out: a card hidden for longer than a day by an outage.
RECOMMENDATION: B — it keeps your ruling that every view and the sender agree, says on the desk why cards are missing, and hides the fewest cards: the ones you most need, with my recommendation, still show. Confidence: medium; it would change to A if you would rather the spec not change again before its review, or to C if never missing a card matters more to you than the views agreeing.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the card fix's plan and spec only; nothing is built yet, and the live desk is unchanged until the fix goes live
DEFAULT: B   TIMEOUT: 72 hours

## Context
- The owner's ruling on card stop-5: "Whether a card is held or shown comes only from the records on main, so every view and the sender agree" (source: decisions/P-003/stop-5.md)
- The plan's rule: "A decision card whose raise time is not recorded (older than the log the desk reads, or the log not yet read) shows at once with the 'No Chief of Staff recommendation yet' mark, so no card is ever held for good" (source: docs/projects/P-003.md, section 1)
- The plan also says a card held for good: "never", that the rules "cannot leave a card hidden", and the owner's preference "never a card hidden for more than a day" (source: docs/projects/P-003.md, sections 7 and 8, and Part 2)
- The Critic's plan reviews of S-003: FAIL at round 1 and FAIL at round 2; round 2's first finding is that a read that skipped the log shows a card at once and the next read holds it again, which the ruling forbids (source: reviews/S-003/plan.md on the item/P-003 branch; dispatch-log/2026-11.jsonl, the critic outcome lines at 2026-11-08T00:15:45Z and 00:40:05Z)
- A third failed plan-review round stops the work and brings it back to the owner (source: docs/projects/P-003.md, section 6, stop rule)
- The rewritten spec's AC16 hides every decision card and shows a line naming what could not be read, while a read does not get the dispatch log, queue/ or the notes; its open question 1 asks the owner to rule this before freeze, recommending it (source: specs/S-003.md, AC16 and open question 1, on the item/P-003 branch)
- A card whose notes with a recommended word are on main shows whatever its age (source: specs/S-003.md, AC2, on the item/P-003 branch)
- V6's monitoring works out past states from the records alone, with no log kept by the desk or the browser (source: specs/S-003.md, AC13, on the item/P-003 branch)
- Part 1 of the plan, which holds sections 1 to 8, is settled when the owner approves the move out of Discovery, and the Design gate was ruled proceed (source: docs/projects/P-003.md, opening note; decisions/P-003/dor-4.md)

## What A or B changes in the plan

In section 1, the bullet "Notes with no recommended word count as no notes. A decision card whose raise time is not recorded (older than the log the desk reads, or the log not yet read) shows at once with the "No Chief of Staff recommendation yet" mark, so no card is ever held for good." becomes two bullets:

- Notes with no recommended word count as no notes. A decision card whose raise time is not recorded (older than the log the desk reads) shows at once with the "No Chief of Staff recommendation yet" mark.
- While a read of the desk or of the notification sender cannot get queue/, the notes or the dispatch log, it shows no decision card and sends no notice for one, and the queue and Home say which could not be read; once they are read, each card is held or shown by the rules above. *(Under B, add:)* When only the dispatch log could not be read, a decision card whose notes with a recommended word are on the main branch still shows with that word.

In section 6, after the paragraph on misses: "A decision card not shown because a read could not get the records is not counted as a miss: a failed read leaves no record, so the records cannot show it. The line on the queue and Home is its only sign."

In section 7, "A card held for good: never; after a day it shows, and a card with no recorded raise time shows at once." gains: "except while the desk cannot read its records, when the line on the queue and Home says so (section 1)".

In section 8, "cannot leave a card hidden, since every held card shows within a day or at once" gains: ", except while the records cannot be read, when the desk says so".

Part 2's preference, "never a card hidden for more than a day", is the owner's and stays as written; A or B is the one exception to it that the owner accepts.

Under C, the plan is unchanged, and the spec's AC16 is rewritten to show cards at once.
