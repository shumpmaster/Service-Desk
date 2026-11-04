# Critic, round 2, verbatim — questions/P-004-widget-why-and-data.md (2026-11-04)

**Verdict: FAIL.** I found 2 blocking findings and 5 non-blocking ones.

These parts check out against the records:
- **Handoff quotes.** These match docs/handoff/2026-11-04-chief-of-staff-widget.md exactly: both question texts on lines 16-17 (handoff:41-45), every option label on lines 16-18 (handoff:42-46, :61-65), and all three answers.
- **Context.** Bullet 1 matches reviews/P-004-brief/_critic-r3-verbatim.md:17-25. Bullet 2 matches docs/PROJECT.md:165-166 ("a later piece of work" stands in for U3, which is out of the first version; PROJECT.md:381). Bullet 3 is right: both section headings exist, and handoff:55 marks the earlier reading superseded. Bullet 4's heading exists, abbreviated, at decisions/questions/P-001-card-recommendation.md:16.
- **Line 22.** It cites round 3's finding 6 correctly (r3:53-57). The handoff (:69-70) agrees that the backup point was not put to the owner.
- **Line 3.** It is right: M5 is still only proposed (PROJECT.md:616).
- **Options form.** The reader at src/lib/sandbox.js:745-772 splits OPTIONS as "lettered" (A and B). It takes the recommended letter as "A", from `/^([A-Z])\b/` on line 10.
- **D-019 parts.** All seven are now present. Confidence and what would change it are on line 10, and the checker is on line 13.

Round 1 findings resolved: 1, 3, 4, 5, 6, 8 and 9. Finding 2 is resolved apart from the A-to-C glosses (see finding 1 below). Finding 7 is mostly resolved (see finding 6).

## Blocking

1. **Lines 16 and 17: option descriptions quoted as put that no record holds.**
   - **The text in question:**
     - Line 16: "("Key in the iPhone keychain, records cached on the phone only, nothing synced to iCloud. Stays within the desk's current rule.")" and "("Scriptable may keep its files in iCloud, so they sync across your devices. Widens the rule to add Apple's iCloud; needs its own ruling.")".
     - Line 17: "("So you know whether anything is waiting on you without opening the desk.")", "("So you only open the desk when something actually needs you.")" and "("So nothing waits on you unnoticed between notifications.")".
   - **What is wrong:** the handoff gives only the option labels for these two asks (handoff:41-46). It gives a description only for the third ask's first option (:62-65).
     - I searched the whole repository for these five descriptions. They appear only in this file.
     - The section is headed "verbatim", and these lines will become the answer record's "as put". Yet they cannot be checked against any record.
     - The line-17 texts are the same "so you …" glosses that round 1, finding 2, said were added afterwards. They now appear as words the owner was shown. Either the handoff failed to record them, or they were never put. A cold reader cannot tell which.
   - **Stage:** continuity (handoff, AGENTS.md §7) and card drafting. This is the same failure as round 1's finding 1.

2. **Line 8, option A: "nothing in Scriptable's iCloud folder", against the option as put on line 16: "nothing synced to iCloud"; and line 16, "Options A and B above are those two, worded for this card."**
   - **What is wrong:**
     - **The rewording narrows what was ruled, on the very point line 22 sets apart.** As put (taking line 16's quote at its word), the owner chose "nothing synced to iCloud". Card option A promises only that nothing sits in Scriptable's iCloud folder, which leaves the phone's iCloud backup outside the ruling. "Ruling: A" would then record a narrower ruling than the one the owner chose, and the narrowing would decide the backup point that line 22 says "has not been put to you".
     - **A and B also add terms the owner never saw:** "Cost: a new phone reads the records again", "which needs a change to the desk's brief" and "Reversible: yes, by removing the files".
     - **"Worded for this card" does not say these are additions and not ruled,** as round 1, finding 2, required ("Anything added afterwards must be marked as added, and must not be taken as ruled").
     - **The card does not say which wording the answer record's "Options, as put" will hold.**
   - **Precedent:** in P-001 the filed options came first and were checked, and the chat wording was mapped onto them (decisions/questions/P-001-card-recommendation.md:7-11). Here the card's options were drafted after the answer, so the mapping runs the other way. Those card options are only a restatement of what was put, and the record has to rest on the options as put.
   - **Stage:** card drafting (Chief of Staff, D-019; AGENTS.md §5, S-033).

## Non-blocking

3. **Line 18: "Told that the widget's plan had reached the Critic's three-round limit, with this as its one blocking fault, and asked how to continue".**
   - This paraphrases the question. The handoff holds its exact words at :58-61 ("The widget's plan (P-004) hit the Critic's 3-round limit. … How should I continue?").
   - It also drops the description of the chosen option (:62-65). That description is what the owner agreed to: "a question carrying both of your answers word for word … fix the 7 smaller points, then the Critic does one final focused check".
   - The other two answers quote their questions, so the answer record would have no "Question, as put" for this one.
   - **Stage:** card drafting.

4. **Line 8, A: "Keeps the desk's rule, unchanged"; line 10, "it keeps the desk's data rule as it is".**
   - Line 22 then says the phone's backup may copy the storage "whichever option is chosen".
   - A cold reader meets an unqualified gain that the card later undercuts. A's gain, or the recommendation, should point to the set-apart point.
   - **Stage:** card drafting.

5. **Line 9, B: "Reversible: yes, by removing the files".**
   - Removing the files stops future syncing. It does not undo the copies Apple has already held and synced to other devices.
   - The gloss overstates what can be undone, even though the option was not chosen.
   - **Stage:** card drafting (reversibility, D-019).

6. **Line 6, plain English for a non-expert.**
   - "the Critic's check" and "its Design gate" are not explained. Scriptable, the keychain and the GitHub key now are, which resolves round 1's finding 7 apart from these two.
   - **Stage:** card drafting (AGENTS.md §4).

7. **Line 12: "DEFAULT: none (the answer is already given)", with the reader's split (sandbox.js:761-765).**
   - Waiting will show this file with an A/B answer box, as if it were still open.
   - The card never tells the owner whether to answer it again. If they answer through the desk, that answer closes the question at once (AGENTS.md §5) and could differ from the answer already given.
   - The precedent rated a bare "DEFAULT: none" with only a reason in brackets as blocking (reviews/P-002-route-asks/_critic-r1-verbatim.md:33-37, :69-70). Here the brackets do say why nothing defaults, so I rate it non-blocking. One sentence in WHY saying what the owner should do with the card would settle it.
   - **Stage:** card drafting.

**Self-implication flag (D-050):** finding 1 implicates round 1, which wrote that "the quotes … match the handoff exactly … all the options". That held only for the labels. Round 1 did not require the options as put to be the labels alone.
