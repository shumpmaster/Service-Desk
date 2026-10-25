# M3G plan: the Critic's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/definer/questions-order at a9a0d36 (the plan, draft 1).

---

Verdict: FAIL

The M3G plan in draft 1 (a9a0d36, build/definer/questions-order) fails on five blocking findings. All five go back to the Definer. Finding 4 also needs the Chief of Staff before anything is filed. I have no shell, so I ran no diff. I read the amendment (specs/S-001.md:2708-2843), AC94 to AC96 (:9440-9646), the notes in AC80 (:7003-7007), AC77 (:10054-10057), J2 (:11630-11636) and J3 (:11692-11695), Areas touched (:14660-14668), CS28 to CS30 (:15102-15119), Risks (:16443-16461), the seven questions (:16860-16955) and the build plan (:17608-17629). I checked them against specs/_TEMPLATE.md, AGENTS.md, the owner's request record, docs/PROJECT.md section 3 and the rulings they cite.

**What holds**
- The owner's words and the four answers are quoted word for word and match the request record, lines 5-11 and 18-21, stray quote mark included.
- The three criteria are When/then scenarios. Their traces are V5, V1 and V2, and all three exist (docs/PROJECT.md:179-183).
- Each stage row names its `ac-test:` marks and the locked cases it changes, with file names.
- The `Blocks:` line is allowed by the checks as they stand. governance_checks.py:295-320 and :356-394 read only the labels, `Milestone:`, Context and reversibility.
- The id M3G is right: M3F is taken and ids are never reused. The `milestones:` header rightly stays unchanged until the line lands.
- The M3G line itself meets the milestone standard. The name is an achievement, the "done when" is a state reached on the preview, `phase: Build` fits answer 4, and the why is plain.
- No read is added, and questions/ and docs/ stay out of the Builder's areas.
- Questions 1, 2, 3, 6 and 7 are real owner decisions, each with options and a recommendation.

**Blocking findings**

1. **A question being asked in the session that blocks other cards is not defined.** This is the very case the owner's request is about.
   - A held question has no place and is "counted nowhere while held" (:9562-9563, :10057).
   - Rule 1 makes a blocker "each question at least one other card with a place waits on" (:9565), but places are only given to counted cards. So it is not said whether a held question with a `Blocks:` line is a blocker, or what the cards it holds up show in "after <k>" (:9583-9584), since it has no k.
   - The same gap exists under each of question 2's options (:16881-16887).
   - Rule broken: each criterion is a testable scenario.
   - Route: Definer. State the case in AC95 and AC96 under each option of question 2, and add it to their tests and to QW3's row.

2. **The blockers' order is not pinned.** The rule reads: "a blocker that waits on another blocker comes after it, and otherwise the earliest raised first; … in a loop, by raised time alone" (:9565-9568).
   - Example: blocker X (raised third) holds up blocker Y (raised first), and Z (raised second) blocks only a card. Picking the earliest blocker free to go next gives Z, X, Y. Keeping a chain together gives X, Y, Z. The text allows both.
   - A loop mixed with a chain is also open.
   - The tests "a chain" and "a loop broken by age" (:2832, :9609) can't decide between them. So "the order is total" (:9571) is true of whatever gets built, not of the spec.
   - Route: Definer. Name one rule, with the worked case above as a test.

3. **Older criteria still say otherwise, with no note.**
   - AC52 (:4681-4682): "Dependencies ("after #54") are named only where a record the desk reads states one. None does today (a model change), so none is named, and no row is marked "do first"." AC96 adds such a record with no model change, plus "after <k>" and "Answer first".
   - AC91 (f) still says the strip's cards go "the newest first" (:8832-8833). AC95 changes that order (:9585-9587), and the spec's header lineage line says "AC91 (f)'s strip order changed by AC95", yet AC91 (f) carries no note.
   - AC89 (j) cuts the board's card titles at three lines (:2211-2212). AC94 has the same question cards show their title "whole, never cut" (:9483), with no note in AC89 (j).
   - Rule broken: changed in place, each with a note naming its part; no two criteria in conflict.
   - Route: Definer.

4. **The section mixes projects with no groups. That choice is not marked C and is not put to the owner, yet the amendment says the board-scope ruling stands (:2841-2843).**
   - AC94 gives each question " · <project>" "since the section has no project groups" (:9479-9481). It cites the strip's form, not a reading of its own.
   - The ruling is "one board, grouped by project: in each lane a project's cards sit together under its name" (P-001-board-scope.md:1). The owner's words behind it: "I don't like to "cross boundaries" when I work" (:19; AC52 :4612-4614).
   - The strip's ungrouped form was itself a reading (C) the owner accepted. The section is a new piece. Readings (b) and (c), the order running across projects, also bear on these words but don't quote them.
   - Route: Definer. Either group the section by project in J7's order, or mark it C and add it to question 7 with the ruling's words quoted beside (b) and (c). The Chief of Staff files it so.

5. **Question 5, and in part question 4, are not real owner decisions, and each holds up QW2 (:2825).**
   - Question 5's option B, "a new card meanwhile goes last, unnumbered", breaks answer 3. A new blocker would not come first, and a card would not show its place ("each card shows its place … a question other cards wait on comes first").
   - Question 5's "never under your thumb" part is already AC40's rule (:4680, :6990). Option A is therefore what the rulings already require.
   - AC95's headline already asserts option A (:9548-9549), while :9594 marks it "pending question 5".
   - Question 4's option A is "nothing changes", and the request asks nothing about Home. Option B is new scope, which the spec can leave as a later idea.
   - Route: Definer. Settle question 5 in AC95, citing answer 3 and AC40. Settle question 4 as not changed, or at least stop it holding up QW2.

**Non-blocking notes**
- **A. "G8c".** The owner's answer 4 names "the glance work (G8c, G9)" (request :21; quoted at :2754), but the spec has no G8c. "Where this fits" (:2834) says G1 to G9 only. Say what G8c is, for instance a stage for the open glance questions such as P-001-glance-moved-among-grey.md, and whether M3G waits on it. Route: Definer; the Chief of Staff confirms.
- **B. Question 1 understates option A's upkeep and option B's delay.**
  - A pull request that changes an open question is not covered by the asks-merge job (asks_merge.py:126-136; P-001-board-scope.md:21). So every later `Blocks:` fix (CS28 :15107-15109, AC96 :9624-9626) waits on a merge the job can't do. "About a minute a question" leaves this out.
  - Option B holds up QW3, so M3G, and therefore M3B and the launch, which come after it by answer 4. M3G's "done when" would then wait on another project's release, the same problem round 1 found with M3E. Tell the owner.
  - Consider the reverse form too: the waiting item names the question when it is opened.
- **C. C readings outside the twelve.** Question 7 says each reading "is marked C where it is written", but these are marked C and not listed:
  - a kicked-back question shown in the section (:9468);
  - the section with one project shown (:9464-9465);
  - the blocker's words and its sheet list (:9580-9584);
  - where the place shows (:9576-9577);
  - the section's look (:9528).
  The last two stay unconfirmed if the owner picks question 6's option B.
- **D. Question 2's option C keeps the "tiny little line drop down" the owner complained of, under the plan's own reading.** Say so in the option. Reading (b), "4 of 6" above "2 of 6", is weighty enough to warrant its own question rather than a letter in question 7.
- **E. The conditions for opening the stages disagree.**
  - QW3 opens once question 1 "is and its record exists" (:2825), once "its record can be written" (:17623), or "once the first such line can be written" (:15109). Pick one.
  - Nothing requires CS29 to land before the stage pull requests carry `Milestone: M3G`, or before CS30 files questions naming M3G. Give the order.
- **F. Template sections not updated.** "Facts relied on" has no entry for this amendment: no `answerButtons`, no `boardView`'s badge, no fact about the checks allowing the line. Known limits are missing, among them this one: "Questions for you · none" with one project unreadable can hide a question filed since that project's last read. The strip's G2 argument (:8824-8830) doesn't carry over to a newly filed question, and AC94's reason (:9525-9526) covers only questions from the last read.
- **G. Test gaps.**
  - The sheet's " · <k> of <N>" (:9577-9578) and the "Recommended" label (:9493-9494) are in no test or stage row.
  - AC96's test lacks a `Blocks:` line after `WHY:` and a file with no `WHY:` line.
- **H. The id tie-break (:9571) is undefined across projects.** Say whether the project is part of the id.
- **I. Wording to check before the M3G line is filed.**
  - Its "buttons that open GitHub" is false for v2.5 questions under reading (i).
  - AC96 keeps the sheet's "Unblocks" line for the milestone (:9638-9639) beside "Cards waiting on it", which gives "unblocks" two meanings on one sheet.

**Self-implication (D-050):** none. This is my first check of this amendment, and no finding rests on an earlier verdict of mine.

Files:
- /home/user/sd-qdef/specs/S-001.md
- /home/user/sd-qdef/docs/design/references/owner-request-2026-10-25-questions-and-order.md
- /home/user/sd-qdef/specs/_TEMPLATE.md
- /home/user/sd-qdef/AGENTS.md
- /home/user/sd-qdef/docs/PROJECT.md
- /home/user/sd-qdef/decisions/questions/P-001-board-scope.md
- /home/user/sd-qdef/decisions/questions/P-001-board-answer.md
- /home/user/sd-qdef/decisions/questions/P-001-glance-lanes.md
- /home/user/sd-qdef/governance/checks/governance_checks.py
- /home/user/sd-qdef/governance/checks/asks_merge.py
