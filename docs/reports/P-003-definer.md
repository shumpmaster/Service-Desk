I've revised specs/S-003.md, but it can't be frozen yet: one owner ruling is needed first (question 1 below). Every other review finding is answered in the spec.

## 1. What I changed
- **Finding 1 (AC7 vs AC11):** AC7 now covers only a dispatch log on main that has no `card` entry for the card. A read that couldn't get the log at all is a new criterion, AC16. That read gives no decision card a state: it shows none of them, sends no notice for them, and puts a line on the queue and Home saying "Decision cards not shown: the dispatch log could not be read". AC11, J1, J3 and J5 now say the same.
- **Finding 3 (sender mechanism, new sheet state):** AC14 now asks nothing of the sender's own files. Held cards aren't on the shared card list, so they get no notice. A card gets one notice the first time it shows. The two repeat cases (a recommendation arriving later; a card going back to held and showing again) keep today's sender behaviour, and the test checks that against the sender as it was before the fix. AC15 drops the new "waiting" sheet: a held card's link or notice opens what the desk opens today for a card not on its list. src/notify/** is out of Areas touched. If the build turns out to need a change there, it stops and comes back to the owner.
- **Finding 2 (approval):** the criteria heading now says "for the owner's approval on the scenario card, not yet approved", and the header says the dor-4 approval covers the plan only. Open questions are cut to one that must be ruled before freeze and two marked as not holding the criteria up. The old questions about a second notice (1) and exact matching (2) are dropped because the plan's text settles them.
- **Finding 4 (size):** I restated it as my own estimate, not a measurement: about 80–120 lines and 14–22 tests. The upper end is close to the stop rule's 24 tests. The plan's stop rule is unchanged, with the src/notify/** stop added.
- **Finding 5 (unchecked sources):** I dropped notifyview.js:337 and the citations to the old review's findings. Citations now point to what this review confirmed at source (lines 17–19 of the owner's record, research:67, research:32–39).
- **Finding 6 (J2):** the notes' line is now the first line that begins with `Recommendation:` once leading heading, bold or italic marks are removed. I added an italic example and a prose-line example.
- **Finding 7 (AC1):** AC1 now says no view offers a held card's answer buttons, and a link or notice to it opens what the desk shows today.

## 2. Why
The owner's ruling (stop-5) says a card's state comes only from the records on main. The notification changes and dropping the waiting sheet keep the criteria to what the shared rule can deliver without unknown sender code or unsized new screens. That also answers the reviewer's point that a criterion can't be frozen while it depends on open questions or on a mechanism nobody has checked.

## 3. What I verified
- All 16 criteria carry `[trace: V6 → ACn]`.
- No references to notifyview, the old review's findings or the removed questions are left.
- docs/PROJECT.md:85, :127, :540, :588 and :616 say what the spec cites them for.
- Plan §1, §4, §6 and §7 match how the spec uses them.

I ran no tests; that's outside my lane.

## 4. What is undone
- The spec isn't ready to freeze until the owner rules on question 1.
- The size is still an estimate; nobody has re-sized the work.
- I haven't seen the sender's code or research/P-003-sizing-findings.md myself.

## 5. Needed outside my lane
- **Chief of Staff:** put question 1 to the owner through the channel, then bring plan §1's "or the log not yet read … shows at once" in line with the ruling.
- **Critic:** check at source that research:67 says what the spec relies on, and that the size estimate is reasonable.
- **Design reviewer:** the side-by-side view review that plan Design-5 calls for (docs/design/JOIN_UP_REVIEW.md form) is still missing. The Build gate carries it, and I don't write it.
- This revision goes to the third plan-review round. Under the plan's stop rule, a third failure sends the work back to the owner.

## 6. Open questions
1. **Needed before freeze:** if a read can't get the dispatch log, should the desk hold decision cards back and say so (the spec's recommended choice, following stop-5), or keep the plan's "show at once" (which would need the owner to change stop-5)?
2. **Doesn't hold the criteria up:** should a later change stop today's sender from sending a repeat notice in the two cases above?
3. **Doesn't hold the criteria up:** is it acceptable that a malformed far-future raise time holds a card until that time plus a day? It would show up as a V6 miss in the Chief of Staff's value check.