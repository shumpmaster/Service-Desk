I've revised `specs/S-004.md` against the second plan review. It's still a draft and not frozen. One thing to know first: this is S-004's second failed plan review, so if the next one also fails, the plan's stop rule sends the work back to the owner.

**1. What I changed**
- **The V6 count (blocking finding 1).** The count used to look at a card only at its raise time plus 24 hours. That is the exact moment the rule shows the card, so the count could never find one held too long. J6 now checks each card at every later moment its state can change: each later commit to the main branch that touches `queue/`, the notes, the dispatch log or the rule's code in `src/lib/`. At each moment it uses the rule's code as it stood on the main branch then.
- **A second figure.** J6 also reports cards still held a day after their card file first reached the main branch. This catches a skewed or far-future raise time, and a log entry that arrives after its card. By the plan's meaning of "raised" these are not V6 misses, so they are reported beside V6, not counted in it.
- **Saying what each figure can find.** J6 and AC13 now say openly that, with the rule as M4 builds it, the V6 figure is 0 by construction. It only catches a later change to the rule. AC13's test now shows the second figure finding two such cards and passing one shown on time.
- **Text that depended on the count.** AC18 (operating notes), the risks, and open questions 2 and 4 now match the new count.
- **Finding 2.** I added a "Join-up review (Design)" section in the form the review used. It says the board and notifications carry no "not shown" line; that is now a risk and new open question 5.
- **Finding 3.** AC10 and AC12 now say that reading a notes file is one new kind of read on the existing read path, and that this is not a breach. They name what would be one.
- **Finding 4.** AC14 now covers the case where the old sender can't be handed card lists: the test may use a stand-in under `tests/desk/`, and failing that the build stops (J5 and the builder's brief say the same).
- **Finding 6.** The sections are reordered so the criteria run AC1 to AC19 in order. Nothing is renumbered.
- **Smaller additions.** The review's question about which of two log entries counts is new open question 6. I also added a fact and two limits about reading the main branch's commit history. The revision note records both review rounds.

**2. Why**
The review failed the spec on finding 1 alone. I kept the plan's definition of "raised" and did not redefine V6, since that would change the plan, which is the Chief of Staff's job. No criterion changes what the desk does.

**3. What I verified**
I checked the criteria list: all 19 appear once, in order. Each has its V6 trace, and J1 to J6 each name a join test. I worked J6's examples through the age rule by hand: a card at exactly 24 hours is shown, and a card at 1 hour is held. Nothing else could be run, since I only write specs.

**4. What is undone**
- The spec is not frozen; it goes to the Critic's plan review next.
- J6's check-moment procedure is prose for the Chief of Staff, not code.
- The size estimate is unchanged (tests 15–23, near the stop rule's 24).

**5. Needed outside my lane**
- **Critic:** run the plan review again.
- **Chief of Staff:** decide whether "held a day after reaching the main branch" should count in V6. That would change plan §6.
- **Builder:** name the operating-notes file under `docs/handover/` in the build's return.
- **Owner:** approve any later change to the notification sender (questions 1 and 5).

**6. Open questions**
None blocks freezing.
- **1.** Should a later change stop the sender notifying twice?
- **2.** Should cards held a day after reaching the main branch count as V6 misses?
- **3.** Is it acceptable that one unreadable notes file hides every decision card?
- **4.** Is checking the no-mark half of V6 by tests before launch enough?
- **5.** Should the board or notifications also show the "not shown" lines?
- **6.** When the log has two entries for one card, is counting from the earlier one right?

One note for the Critic: the review said `specs/S-003.md` was not in its folder, but it is in mine.