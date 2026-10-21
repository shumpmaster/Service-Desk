# S-001, desk mockup v2, draft 2: the Critic's round-2 report, verbatim

Dispatched by the orchestrator on 2026-10-20 against build/definer/s001-desk-v2 at dce34bb, by a fresh Critic.

---

Verdict: FAIL

Round 2 Critic check of specs/S-001.md, draft 2 of "S-001 desk mockup v2" (build/definer/s001-desk-v2 at dce34bb). Spec line numbers below are from that file.

Summary: all 15 of the Critic's round-1 findings and all 13 of the plan review's are resolved. Two new blocking findings came up in the fresh pass: a gap in how the stages stand alone, and a conflict with a standing owner ruling. There are also 11 non-blocking findings.

## Round-1 findings: the Critic's report

1. **"Latest" bubble dropped by the Definer's own reading.** Resolved. It is now the owner's ruling, P-001-latest-bubble.md (A). The spec builds that ruling in four places: :1832-1835, AC82 :6400-6402, AC54's note :3870-3874 (which names the parts of tile-summary-clip that it replaces) and :13335-13337. The lead tells the owner (:1603-1606).
2. **Order of stages 1a and 1b, and the operating-model project's pin.** Resolved.
   - (a) The order is now the same in the stage table (:1743-1744, :1752), Risks (:13087-13090) and the brief (:13763-13767): 1a merges, then 1b, then one preview deploy.
   - (b) Setup CS27 moves the Workflow 4 pin (:11942-11951).
   - One part is left: the lead's promise (non-blocking 8).
3. **The sender's rule-0 reads had no failure handling or tests.** Resolved.
   - Failure handling: J16 :10228-10238 covers failed, refused, 404, oversize and non-text reads (counted as given), forks, lists of 300 files or more, and an unreadable risk-paths.toml.
   - Tests: J16 :10403-10416; AC73 :6938-6945.
4. **Rule 0 in the operating-model project had no evidence.** Resolved. Facts relied on :12683-12693 gives commit ids and ancestry checks. Personal-Org-Operating-Model's own tools/review_check.py:12 also requires reviews/<PR>/<id>.md.
5. **Three places disagreed on what waits on questions 8, 9, 11 and 1c.** Resolved. Every question is answered (:1744-1745, :1891-1892, :13301-13341). The table's "Waits on" column names none.
6. **The brief's stage-1a sheet and frame 12.** Resolved in the brief (:13720-13731). The same staleness survives elsewhere (non-blocking 2).
7. **AC44 step 2 and stage 6b.** Resolved (:2794-2798; table :1758).
8. **AC81's type test missed 400 11 px.** Resolved (:6213-6222). I checked the list against every size and weight override in desk-v2.html and it is complete.
9. **AC80's marks paragraph named removed parts.** Resolved (:5962-5963).
10. **Terms dated "With the agents" wrongly.** Resolved (:2101-2104, :2202-2206).
11. **The "⋯ More" pill.** Resolved by P-001-settings-place.md (A) (:1836-1838, :6409-6411).
12. **The Pi font subset misses some marks.** Resolved. ◆ ✕ ▸ ⇅ are drawn as SVG icons (:6240-6247). The full ranges are recorded (:12605-12614).
13. **The colour-distance figures had no command or output.** Resolved. The program and its output are at :12618-12678.
14. **Open questions led with codes.** No longer applies: all are filed and answered (CS26, :11938-11941).
15. **AC80 had no V2 trace.** Resolved (:5728, :5805-5806).

## Round-1 findings: the plan review's report

1. **Rule 0 carried across heads.** Resolved. J22 :10731-10741; AC80 :5802-5805 and :5998-5999; tests :6132-6134 and :10878-10880.
2. **Stage 3 depended on stage 6a.** Resolved. J23's version reads and `publishesModel` move to stage 3 (:1754, :6451-6453, :10887-10901).
3. **A3 and J22 disagreed on rule 0's cost; AC14's test could not hold.** Resolved.
   - One verdict call per head (J22 :10742-10749).
   - A3 recounted to 9,817; I checked the sum: 9,355 − 50 + 250 + 50 + 212 = 9,817 (:12508-12540).
   - J24's extra call per opening is counted (:11001-11007).
   - AC14's test now asserts the bounds (:2378-2387).
   - One stale line remains (non-blocking 1).
4. **The sender's memory, cost and failure handling.** Resolved: J18 keeps verdicts by blob sha and each head's ETag (:10528-10534); J16 :10208-10243.
   - Forks are judged by (i) alone, and (i) is applied only where the page reads it (:10218-10220).
   - A remaining difference in inputs is non-blocking 7.
5. **The 1a/1b order and the pin.** Resolved (as Critic 2).
6. **The operating-model project's evidence.** Resolved (as Critic 4).
7. **The Timeline's phase marker.** Resolved by P-001-timeline-marker.md (A) (AC84 :6582-6592; AC68 :5440-5445). The Team screen's form is non-blocking 4.
8. **PR #166 to be cited, the waits lifted, tile-summary-clip cited.** Resolved (:1706-1721, :6360-6364).
9. **Setup P1 misstated the token's permissions.** Resolved (:11956-11959).
10. **A mark could be confirmed by rule 0 alone.** Resolved (:5989-5993; test :6134-6136).
11. **Layout checks needed a named method.** Resolved (AC81 :6281-6285; AC82 :6424-6428; AC84 :6629-6634).
12. **J23's `tier:` comment; J24's v2.5 merges.** Resolved. The comment is stripped (:10892-10895), and the v2.5 merges are a stated known limit (:10969-10973, :12697-12698).
13. **The Pi subset misses marks.** Resolved (as Critic 12).

The plan review's two open questions are answered: one call per head, and a J18 field.

## New findings

**BLOCKING**

**B1. The stages don't stand alone for the project screens between stage 1a and stage 3.** Routed to Define.
- **What stage 1a does:** it brings in the new bar, "floating at the foot of every trial-view screen" (AC81 :6180-6181). It also puts the board "in place of AC52's groups, response sheet, confirmation, tracker and 'Done today' fold in each project's Queue" (AC80 :5751-5752).
- **What is left undecided:**
  - The old project screens and their own bottom bar, Status · Timeline · Team · Queue (:13377), stay until AC83 replaces them in stage 3.
  - AC81 says "The project screens' bar goes" (:6196-6203), but the replacement it names is AC83's (stage 3).
  - The brief's stage 1a speaks only of Home and Plan keeping today's screens (:13707-13708).
  - The spec doesn't say what the project screens do in stages 1a and 2:
    - whether two bottom bars show;
    - where the old bar's "Queue" tab goes once the Queue's contents are gone;
    - whether moving between Status, Timeline and Team is kept.
- **Stage 2 has the same gap:** "a tap on a tile opens the project's page (AC83)" (:6403), but AC83 is stage 3's.
- **Why it matters:** the owner tries each stage on the preview, and the Builder would have to guess.

**B2. J24 lists the Chief of Staff's sessions on Home, against a standing ruling the spec doesn't name.** Routed to Define, to stay within the ruling or put the point to the owner.
- J24 adds the kind "a Chief of Staff session started or ended: J13's session line times" to "Since you last looked" (:10980).
- The ruling reads: "Ruling: A — the Chief of Staff's recorded sessions show on the Team screen only, as built, and are not listed under More detail, Agents" (decisions/questions/P-001-cos-sessions-on-desk.md:1).
- The rulebook carries it as "the Chief of Staff's sessions show on the Team screen only" (governance/domains/design/README.md:177).
- Mockup v2's Home draws no such line (desk-v2.html:749-761).
- J24's kinds are a Definer choice, marked (C) (:1865). Nowhere does the spec name this ruling or say why the kind falls outside it. The design reviewer would fail stage 2 on part A, item 1.

**Non-blocking (all routed to Define unless noted)**

1. **AC42's 2026-10-20 note is out of date.** It says "J24's commits read and J22's rule 0 add no call" (:2731-2733). A3 now counts +200 for rule 0 and +50 for J24 (:12510-12526), and J24's own cost section agrees with A3 (:11001-11007).
2. **AC52's and AC53's notes contradict AC80.**
   - AC52's note keeps the sheet "but the text box" (:3529-3531).
   - AC53's note says the board has "no text box or rule line" and that the text-box test cases "give way" (:3700-3706).
   - AC80 brings the box back (:5883-5893), and AC85's numbered question relies on AC53's boxes (:6679-6683).
   - AC52 still treats board-scope as an open question following its default (:3526-3528).
   - Neither criterion is in "Other criteria changed in place" (:1792-1804).
3. **The order and starting state of Home's groups are not settled.**
   - AC82 uses frame H5's words, in the frame's order: active; "Closed or not run by the desk"; Done (:6349-6352).
   - AC54 keeps Active; Done; Closed, with Closed starting closed (:3979, :4005).
   - Frame H5 draws Closed second, and open (desk-v2.html:816-820).
   - AC82 says neither which order holds nor which groups start open.
4. **The Team screen's phase line doesn't match the ruling's "same way".**
   - The ruling: one short line "the same way the project page does" (P-001-timeline-marker.md:1).
   - AC84 and AC68 keep AC68's marker on Team as built: a box, "<Phase> · run <k>", "next to reach: <code>" (:5451-5455, :6590-6592). The project page's form is "second time through", with the milestone's plain-English name (AC83 :6456-6458).
   - The brief's stage 3 says it builds "the short phase line atop the Timeline and Team" (:13776-13777), which disagrees with AC84.
5. **Stage 6b's milestone.** The table ties 6b to MD3 (:1758). AC44 says MD3's line doesn't need it and that it may land after stage 8 (:2795-2798), so possibly after MD3 is reached. The spec doesn't say what 6b's `Milestone:` line is in that case. Routed to Define; to the Chief of Staff if a milestone line is wanted (:1762-1764).
6. **J24's commit cap contradicts itself.**
   - The known limit says GitHub lists at most 250 commits (:12718-12720).
   - J24's awkward case speaks of "more than 300 commits (the newest beyond the third page not read)" (:11010-11011).
   - Both this limit and the token-widening limit (:12721-12722) rest on GitHub's behaviour with only (E). software.md:337 asks for the same evidence as a fact.
7. **The page and the sender feed the shared rule-0 function different inputs on (i).**
   - The page reads the owner check for at most 3 heads a project (J22 :10840-10844).
   - The sender reads it for every head where (i) applies (J16 :10218-10224).
   - On AC14's 5 open pull requests a project, a fourth or fifth head can be a card on the board while the phone stays silent.
   - AC73's rule-0 cases (:6938-6945) don't cover a fourth head.
8. **The lead says more than the plan holds.**
   - "So the phone and the desk keep agreeing" (:1636-1637) leaves out two gaps:
     - until CS27 lands, the operating-model project's phone still notifies pull requests the board puts with the agents (:13092-13094, :11948-11950);
     - the owner must leave stage 1a's own waiting preview deploy unapproved until 1b merges (:13764-13766). The owner will get a deploy card for 1a's run, and the lead says only that the stages "go to your preview together" (:1614).
   - The lead also uses "MD2" and "MD3" without their plain names (:1617-1618).
9. **AC87 adds a new kind that needs the owner and changes Quiet** (:2123-2124, :2153-2154, :6806-6814), but traces only to V4 (:6756).
10. **J22 rule 1 still says the owner's verdict blob rides "alone in a blob call of its own"** (:10754-10757). Rule 0 now puts it in the head's one call with the reviewers' verdicts (:10742-10744), and A3 counts that one call per head.
11. **J7's join sheet** (:9111-9140) doesn't carry the new `publishesModel` and `portfolio` keys. Only J23 describes them (:10896-10906), and "What changes" doesn't name J7.

## What holds
- The spec's milestones header matches docs/PROJECT.md section 3.
- MD2 reached on 2026-10-20 matches PROJECT.md:110 and P-001-md2-accept.md. Every stage serving MD3 fits MD3's "done when" (PROJECT.md:111) and the portfolio rulings' `Milestone: MD3`. 6b is the exception (non-blocking 5).
- All eleven 2026-10-20 answers are quoted word for word and built: AC82, AC83, AC84, AC85, AC86, AC87 and the stage brief.
- All six of the rulebook's spec points are addressed (:1780-1791).
- The standard-milestone count is right: 24 = 8 + 6 + 5 + 5 (v3_checks.py:343-379).
- The colour tokens match desk-v2.html:20 and :29.
- src/notify/collect.mjs:113 supports the sender's "no judgement on an unread list".
- src/lib/api.js:108 supports the J12 limit for v3 projects.

## D-050
B1 and B2, and non-blocking 2 and 4, sit in text that draft 1 already had or carried in, and that the round-1 Critic (an earlier session in this role) checked without raising them. That earlier check said "The owner's lead is plain" and "Areas touched cover the new work". These findings implicate that check, though not one of mine.

Files: /home/user/sd-def-v2/specs/S-001.md; /home/user/sd-def-v2/decisions/questions/P-001-cos-sessions-on-desk.md; /home/user/sd-def-v2/decisions/questions/P-001-timeline-marker.md; /home/user/sd-def-v2/docs/design/mockups/desk-v2.html; /home/user/sd-def-v2/governance/domains/design/README.md
