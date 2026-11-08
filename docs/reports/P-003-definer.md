I've revised specs/S-003.md to answer all five plan-review findings, including both blocking ones. It is still a draft and goes back to the Critic for a second plan review.

## 1. What I changed
- **J1, clock skew (finding 1, blocking):** I replaced the wording that could be read two ways with one rule. A card's age is the current time minus the raise time in its log entry, and that time is never reset. A raise time in the future gives a negative age, which counts as "less than a day", so the card is held until the logged time plus 24 hours, then shown. J1 now has worked examples (10:00 logged; 09:58 that day → held; 09:59 the next day → held; 10:00 the next day → shown). The "records" paragraph defines "age" once, and AC1 and AC4 use it.
- **A notice already sent when its card goes back to held (finding 2, blocking):** new **AC15**. The sender withdraws nothing and sends nothing more. While the card is held, opening that notice shows the card sheet saying it waits for the Chief of Staff's notes, with no answer buttons, rather than "gone". When the card shows again, the same notice opens it as shown. I added this case to J4 and J5, to the risks, and as open question 5.
- **AC11 and the "at most once" notice (finding 3):** I moved the notice rule out of AC11 into a new **AC14** under "Notifications". It says what the sender may keep between runs and that this never decides whether a card is held or shown. Its test runs the sender over a chosen series of records and times, including a card that shows, goes back to held and shows again, and counts the notices per card. J5 now says what is handed over and has the Builder name the sender's current way of avoiding repeats in the J5 test. AC13 now says notices are not worked out from the records.
- **The owner's ruling record (finding 5):** I updated "The defect" and the known limits to say the Critic checked the quotations at source and found them matching.
- **Finding 4:** nothing changed; open question 3 still covers it, as the Critic advised.
- **Other edits:** the supersession note explains that AC14 and AC15 here are not S-002's criteria of those numbers. I added a fact for today's "gone" behaviour, a held-for-good line about far-future raise times, and open question 4.

## 2. Why
Findings 1 and 2 blocked the plan review: no J1 test could be written from the old wording, and a sent notice could point at a card that looks gone. Finding 3 left the J5 test undefined. Every change keeps the owner's stop-5 ruling that only the records on main decide whether a card is held or shown.

## 3. What I verified
- I read the review, the S-003 draft, the plan and all five earlier decision records.
- A search of the spec for every AC and open-question reference found all of them pointing at criteria and questions that exist. AC14 and AC15 are defined once each, and open questions 4 and 5 exist.
- I checked the J1 examples by hand against the 24-hour rule.
- No tests or builds were run; that is outside my lane.

## 4. What is undone
- The spec is not frozen; it needs a second plan review and then the freeze gate.
- Open questions 1 to 5 are still for the owner.
- The size may grow: AC14 and AC15 add about two tests and a change to `notifyview.js`, though it should stay within the stop rule's limit of about twice the sizing.
- The "gone" behaviour (sizing findings line 67, `notifyview.js:337`) is cited from the review only; I have not seen it at source.

## 5. Needed outside my lane
- **Critic:** a second plan review. Please check at source the sizing findings line 67 and `notifyview.js:337`, which AC15 rests on.
- **Owner approval:** AC15 probably changes `notifyview.js`, and AC14 may change what the sender keeps between runs. If either is one of the sender's own files, plan §4 needs the owner to approve the change.
- **Builder:** name the sender's current way of avoiding repeats in the J5 test.

## 6. Open questions
- **Far-future raise times (open question 4):** a malformed log entry with a time far in the future would hold a card until that time plus a day, which breaks the owner's "never hidden more than a day". The option is to treat such a time as unrecorded, so the card shows at once, at the cost of the card sometimes vanishing again later. The owner must choose.
- **Sent notice for a re-held card (open question 5):** leave it alone (this spec's default) or withdraw it and resend later, which tells the owner twice?
- **The plan review's own question, how the sender avoids repeats today:** still unknown in my pack. AC14 and AC15 are written so the J5 test can be built whatever the answer.