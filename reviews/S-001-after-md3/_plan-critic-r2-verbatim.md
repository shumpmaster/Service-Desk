# S-001 after MD3: the Critic's round 2, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/definer/s001-after-md3 at da6bab2.

---

Verdict: FAIL

Draft 2 resolves all thirteen of my round-1 findings, and the four new rulings are quoted and applied. It fails on one new point. The lanes ruling the owner accepted rests on "their rows naming them", and that is not true of the Chief of Staff's running log. The fix is small.

The four answers were read from /home/user/sd-a-after5 (cos/after-md3-answers, PR #202). M3D was judged against that PROJECT.md:
- The M3D line in docs/PROJECT.md:114 matches P-001-m3d-line.md:13 word for word.
- The spec's header (specs/S-001.md:15) names M3D between M3B and M3C, as the ruling places it.
- Every stage carries `Milestone: M3D` (:2329-2344, :15498-15499).

**Blocking finding**

A. **"Each row names its lane in words" is not true of the Chief of Staff's log.**
   - The owner accepted "lanes from different times may share a look, their rows naming them" (P-001-lanes-alike.md:1). The question as put said "Each row names its lane in words".
   - The spec states this as fact at :3698 and :14070, and in the lead at :2019. No criterion requires it.
   - It holds on pipeline logs: every lane row's words come from `entryWords`, which always starts with the item (src/lib/records.js:587-609).
   - It fails on the Chief of Staff's log. Only the "Started: <doing>" row names the piece. Its helper rows and its "Handed back · <time>" end row sit in the piece's lane but don't name it (src/lib/sandbox.js:1385-1387; spec :3713-3720). Each Chief of Staff piece is a lane, so that log can hold more lanes than looks.
   - Rule broken: a ruling must be applied as given, and nothing may be stated that the criteria and the build don't hold.
   - Route: Definer. Add to AC49 that every row on a lane names its lane (on the Chief of Staff's log, its piece's `doing`), with a case in the stage-4 test. Or correct the claim, and have the Chief of Staff put it back to the owner.

**Round-1 findings 1 to 13**
1. Resolved, apart from A. Lanes open at once now take different looks (:3689-3695), with stage-4 cases (:3755-3759). The fourth look is marked C. The five-at-once limit is within the question as put ("up to four at once").
2. Resolved. AC89 (a) now has five defined read states, and "checking…" is never used for a failed read (:7794-7812).
3. Resolved. The AC90 and AC89 (e) notes are now in AC24 (:9195-9200), AC41 (:3215), AC59 (:5216), AC82 (:7251) and AC86 (:7647). The "What changes" list is corrected (:2086-2101).
4. Resolved. AC90's Team part moved to stage 4 (:2322, :7994-7997, :15506).
5. Resolved. The cap is marked C, per device, the day runs from midnight in `ownerTimeZone`, and the 11th mark is defined (:7911-7917). A3 notes a second device (:13975-13976).
6. Resolved. AC69's new note governs, and its CSS citations check out (sandbox.css:236, :278, :515, :560, :599, :792, :795). One slip, see note 5.
7. Resolved. Risks (:14693-14697), A3 and J23 all say 9,952 and 48. The lead tells the owner (:2031).
8. Resolved. CS27 now cites the operating-model project's workflow listing, with its command and commit (:2123-2127).
9. Resolved. The lead names the milestone in plain words (:2012-2013), and stage 8 is called out as not on the preview (:2020). One stale phrase, see note 1.
10. Resolved. Item 30's fixtures are placed in stages 6a and 4. AC80's and AC83's cases are now "rewritten" (:2319).
11. Superseded by M3D. One stale phrase, see note 2.
12. Resolved. "Nine in all" (:2039). J23 names `no-access` (:12306).
13. Rightly left as it is: the frozen EXP-005 text is not changed.

**Non-blocking notes** (all route to the Definer)
1. The lead still says "that is put to you" (:2019), but :2032-2036 says the owner answered. Drop the phrase.
2. :2343-2344 says "The `Milestone: none (…)` reasons of draft 2". Those reasons were in draft 1.
3. "As they were put:" (:14941) heads the spec's own drafts, not the words put to the owner. Question 4 here has options A, B and C, but P-001-lanes-alike.md shows two. Question 3's "Default B" is in no record. Either quote the records' "Question, as put" text or relabel the list.
4. The lead's "a status any agent could post" (:2033) and the heading at :14942 say more than the record does. The record says "something able to post GitHub statuses, an agent given that access for example" (P-001-agent-status-hide.md:5).
5. AC69 says "Your last action" sets "its edge and label in `--ink2`" (:6200-6201). On the page `.sb-last` has `border: 0` (sandbox.css:901), so it has no edge.
6. AC89 (a) has two small gaps:
   - A first read still unanswered after 3 minutes in view is "can't be read" by :7795-7797. Yet the table's rows 1 and 2 cover only "not answered yet" and "failed". "HH:MM" (:7808) has no failure time to take for that cause.
   - Row 2's "Not read in this opening" is new wording, but not marked C.
7. AC24's "Estimate: not available … on every row" for a failed J14 read (:9204) still repeats per row. AC90's general rule would fold it, but AC24's note covers only "not made yet".
8. :14071 says "six looks are the most a line style allows". It is three styles in at most two greys each, six in all (:3685-3686).
9. M3D's "done when" promises a kick-back "within about 5 minutes" and lanes open together "never looking alike". AC89 (l)'s 11th mark of a day, and five lanes open at once, fall outside that. Both are rare and the owner accepted them, but the milestone's case at its gate should say so.

Self-implication (D-050): none. The M3D line's Critic check (P-001-m3d-line-critic-2.md) was another session's. This check re-judges none of my own earlier verdicts.

Files:
- /home/user/sd-def-md3-after/specs/S-001.md
- /home/user/sd-def-md3-after/src/lib/sandbox.js
- /home/user/sd-def-md3-after/src/lib/records.js
- /home/user/sd-def-md3-after/src/public/sandbox.css
- /home/user/sd-a-after5/decisions/questions/P-001-lanes-alike.md
- /home/user/sd-a-after5/decisions/questions/P-001-m3d-line.md
- /home/user/sd-a-after5/docs/PROJECT.md