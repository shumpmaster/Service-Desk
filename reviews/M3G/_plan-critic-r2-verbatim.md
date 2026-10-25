# M3G plan: the Critic's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at 2ca5255 (the plan, draft 2).

---

Verdict: FAIL

Draft 2 (2ca5255) fixes all five of my round-1 blocking findings and notes C to I. Note A is fixed except that a record it cites is not on this branch, and note B is fixed but its merge claim needs a source (notes 1 and 3 below). It fails on two new blocking findings, both caused by the new question 1. Both go back to the Definer, and the Chief of Staff needs both settled before filing. I have no shell, so I read the working tree in /home/user/sd-qdef as checked out and took it to be 2ca5255.

**Round 1, checked**
1. **The held blocker: fixed.** A held question is one of the model's `askingRows`, never a card, and never a blocker in the order (:9739-9754, model.js:545-551). What it shows, and what its held-up cards say ("Waits on a question being asked in your session"), is stated under both options of question 3. QW3's row (:2862) and AC95's test (:9776-9777) cover it, and AC96 lists it as "being asked in your session" (:9808).
2. **The blocker order: fixed.** The procedure (:9685-9690) is deterministic. I worked all five cases (:9691-9695) by hand and each matches. When no blocker is free, a loop member always exists, so the rule always places someone.
3. **Missing notes: fixed.** There are now notes in AC52 (:4750-4754), AC80 (:7075-7082), AC89 (j) (:8584-8586), AC91 (f) (:8913-8915) and AC77 (:10233-10237). AC89 (j) is kept rather than overridden: titles are cut at three lines, reading (d).
4. **Grouping: fixed.** The section is grouped by project in J7's order (:9548-9551), and the board-scope ruling and the "cross boundaries" words are quoted (:2763-2765).
5. **Settleable questions: fixed.** Old question 5 is settled by answer 3 with AC40 (:9755-9761), and Home is not changed (:2800-2802).

On the notes:
- A: G8c and G8d are named (:2864-2868).
- B: question 2's upkeep, delay and the reverse form are stated (:17119-17128).
- C: there are fifteen lettered readings, and every C mark in AC94 to AC96 carries its letter.
- D: question 3's option B says it keeps the line the owner complained of (:17138-17139).
- E: there is one list of when each stage opens (:2852-2856).
- F: Facts relied on and Known limits are added (:16195-16229), with the unreadable-project grey line (:9580-9584).
- G: the sheet's place, "Recommended", and the WHY-less and after-WHY cases are now tested.
- H: ties go by J7 order, then the AC73 key (:9702-9704).
- I: the line names the v2.5 copy route, and "unblocks" is kept for milestones only (:9738).

The quotes I checked match their records: P-001-answer-choice-spacing.md:1, P-001-trial-view-notes-1.md:61, P-001-design-discovery.md:9 and P-001-glance-opening-wording.md.

**Blocking findings**

1. **Question 1 is called reversible but given no default, and the plan contradicts itself on whether it has a recommendation.**
   - :17091 says "Each is reversible: R1", and :17092 and :17114 say question 1 has "No default". AGENTS.md:76-77 says: "Reversible questions adopt the recommendation at timeout … Irreversible questions never default." OPERATING_MODEL.md:100 says the same. The template requires `DEFAULT: <letter>` (questions/_TEMPLATE.md:11), yet CS30 orders `DEFAULT: none` (:15294).
   - Recommendation:
     - Question 1 reads "Recommendation: B" (:17113).
     - CS30 says "its recommendation (none for question 1 …)" (:15293-15294).
     - The owner's paragraph says "The other four have a recommendation" (:2732).
   - The consequences:
     - QW2 opens only "once question 1 is answered (it has no default)" (:2854). M3G then has no bound, and M3B and the launch come after M3G by answer 4.
     - The question would sit on the desk's own section with a `DEFAULT:` that is not a letter, which its clock line ("Settles as <letter> · <when>", :9592-9593) reads.
   - Route: Definer, then the Chief of Staff. Give question 1 a default and a timeout like the others, or show why it is not reversible. Then make :2728-2732, :15293-15294 and :17091-17114 agree.

2. **M3G's line, and AC95's headline, stop being true under question 1's option C. The order of steps means the line cannot be reworded before it is approved.**
   - The line reads "a question other cards wait on first … then the rest oldest first" (:2823-2824), and AC95's headline says the same (:9668-9669).
   - Option C numbers "every question … before every other kind of card", so "a blocker in a later project's group comes after an earlier project's other questions" (:9721-9723, :17108-17111).
   - :2832-2833 says that if question 1's answer changes the line, "the line is reworded before it is approved". But CS29 (the owner approves the line) comes before CS30 (filing the questions): "In this order: CS29, then CS30" (:15285-15286; :2853). So the line is approved before question 1 is even put to the owner.
   - Route: Definer. Word the line and AC95's headline so they hold under all three options. Otherwise, say the line comes back to the owner after question 1, and drop "before it is approved".

**Non-blocking notes**
1. **"Waits for the Orchestrator's merge" cites no rule** (:9795-9797, :15300-15301, :16227, :16674, :17119-17120).
   - OPERATING_MODEL.md:100 lists what the asks-merge job may merge, then says "Those two, an answer to a question that cannot be undone, and everything else wait for the owner's merge."
   - questions/** is R0 (governance/risk-paths.toml:28), so the Orchestrator's merge may still hold under AGENTS.md §3. Cite which rule applies before question 2 is filed.
   - If the owner merges, option A's real cost is a card on the owner's board for each correction (V3, upkeep). The question should say so.
2. **Question 2's option B cites "J12's body read" for an open pull request** (:9799-9800, :9814-9815, :11815). J12 keeps no body (:12671-12674). An open pull request's body comes from J1's open list (:12670). Also, a `Waits on:` line placed last in a body would be read as a commit trailer (AGENTS.md:70). Say where in the body it goes.
3. **G8d's record, docs/design/references/owner-answers-2026-10-25-g8c-review.md (:2866-2867), is not on this branch.** Land it first, or say which branch holds it.
4. **Question 1 uses discovery answer 6 as a rule about "kinds"** (:2765-2766, :17098-17099). It answered "Irreversible or self-defaulting decisions versus routine PRs?" (P-001-design-discovery.md:9). Say what it was about. Answer 4, "I want them bucketed by project" (:7), bears more directly on options A and B and is not cited.

**Self-implication (D-050):** yes, for blocking finding 2. My round-1 note E asked for one stated order with CS29 first. The Definer followed it, and that order is what now clashes with the rewording clause. Whoever runs Triage should weigh that.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/AGENTS.md
- /home/user/sd-qdef/questions/_TEMPLATE.md
- /home/user/Personal-Org-Operating-Model/OPERATING_MODEL.md
- /home/user/sd-qdef/governance/risk-paths.toml
- /home/user/sd-qdef/governance/checks/asks_merge.py
- /home/user/sd-qdef/decisions/questions/P-001-design-discovery.md
- /home/user/sd-qdef/decisions/questions/P-001-answer-choice-spacing.md
- /home/user/sd-qdef/decisions/questions/P-001-trial-view-notes-1.md
- /home/user/sd-qdef/decisions/questions/P-001-glance-opening-wording.md
