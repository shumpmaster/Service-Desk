# questions/P-003-standard-lines.md: the Critic's cold reading, round 1, verbatim

*Run by the Chief of Staff (session_01QBwHGKpfNMbQeEnVRHpmEe) on 2026-11-05, before the question goes to the owner. Recorded by the orchestrator.*

Verdict: FAIL

**Summary.** The question is mostly sound. The four skips in option A match the four `skipped` lines in the plan, and the WHY paragraph has no paths or ids. But one of the four skips should not be offered. The plan wants to skip the design join-up review (Design-5). That review is required: the model makes the Build gate carry Design's join-up review, and the review form says it is needed before Design can be marked done. It is also not a separate review. It is a section the Critic adds inside its plan review, and it compares every agreed screen side by side, and this fix touches five views. So option A wrongly says no check or gate needs the skipped records, and the skip's reason is wrong. Two smaller problems also need fixing: one Context bullet cites the sizing for a claim the sizing does not make, and the question says "you asked" for this question when the owner's recorded words did not ask for it.

**Findings**

1. **BLOCKING: Design-5 cannot be skipped as option A proposes.**
   - The question says the join-up review is "separate" and that "none is needed by a check or a gate" (questions/P-003-standard-lines.md:7-8).
   - The plan's reason says it "would repeat the plan review" (docs/projects/P-003.md:60).
   - Against the records:
     - The Build gate "carries Design's join-up review" (Personal-Org-Operating-Model/OPERATING_MODEL.md:201).
     - The review form says it is "Required before Design can be marked done" and is a section the Critic adds to its plan review, not a separate review (docs/design/JOIN_UP_REVIEW.md:3-7).
     - The model says skipping a standard milestone "excuses no record that a check or a gate needs" (OPERATING_MODEL.md:122).
   - The review compares screens and views side by side, not join sheets. This fix touches the card sheet, Home, the queue, the board and notifications (P-003.md:39).
   - Fix: take on Design-5 (option A becomes 11 taken on, 3 skipped), or give a reason that is true. The rest of the question then needs re-counting: "ten of the fourteen", "skip four", and the list of skips (lines 5 and 7).

2. **BLOCKING: Context bullet 3 cites the wrong source.**
   - It says the sizing found "no unknown left open (source: research/P-003-sizing-findings.md, sections 6 and 7)" (questions/P-003-standard-lines.md:19).
   - The sizing never says that. Its section 7 lists open points that need rules, such as "A rule is needed" for a card with no raise time (sizing:66-71). Its section 6 is about generated code paths, not size (sizing:55-56).
   - "No unknown is left open" is the plan's own claim (P-003.md:107).
   - Fix: cite P-003.md section 7 for that claim, and cite the sizing's section 7 for the 60 to 90 lines.

3. **BLOCKING: "You asked for these lines to be put to you" is not supported.**
   - The claim appears in the WHY paragraph (line 5) and on the DEFAULT line (line 14), and Context bullet 5 attributes the ask to "your ruling" (line 21).
   - The owner's words, quoted verbatim, ask only for the card to stay held until a dry run passes (decisions/questions/P-003-plan-place.md:7).
   - Putting the standard lines to the owner first appears only under "How it is carried out" (line 11), which is how the Chief of Staff carries the ruling out, not the owner's words.
   - Fix: say the Chief of Staff is putting these lines to the owner because the readiness check's notes call for the owner's ruling on them (decisions/P-003/dor-fail-2-notes.md:18-19). Then justify "DEFAULT: none" on that basis or replace it (see finding 6).

4. **Non-blocking: the WHY paragraph contradicts itself in its opening.**
   - "Nothing has failed yet on this, but the card fix's readiness check failed last time…" (line 5).
   - Lead with the failure directly.
   - Also consider stating what is at stake: a third failure sends the fix to Triage and a stop card (dor-fail-2-notes.md:6-7).

5. **Non-blocking: option B's "days of work" has no record behind it** (line 10). Say "several more helper sessions", or give a source.

6. **Non-blocking: DEFAULT.**
   - AGENTS.md §5 (line 76-77) has reversible questions adopt the recommendation at timeout.
   - This question is R0 and reversible, so "DEFAULT: none / TIMEOUT: none" departs from that rule, and its only stated reason is the unsupported "you asked" (finding 3).
   - Separately, the model rules these lines with the Design gate anyway, and until then a change needs only the Critic's check (OPERATING_MODEL.md:122). So DEFAULT A with a timeout would also be consistent.
   - RISK CLASS R0 and reversible are otherwise right: under OPERATING_MODEL.md:122, a skip can later be changed to taken on with only the Critic's check.

7. **Checked and true:**
   - The three remaining skips match the model's table (OPERATING_MODEL.md:155, 156, 163) and the plan (P-003.md:50, 51, 58):
     - Discovery-3, the expert's map and short list;
     - Discovery-4, the search of how others solved the problem;
     - Design-3, the experiments.
   - Discovery-3's reason holds against P-003.md:97.
   - Discovery-4's reason holds: the two `re-specify` answers are in decisions/Q-019/stop-1.md:1 and decisions/Q-017/stop-2.md:1, and P-003.md:32.
   - Design-3's reason holds against P-003.md:107, though that is the plan's claim, not the sizing's (finding 2).
   - The ten taken-on lines are in the model's form, and their whys are sensible and supported:
     - Discovery-1 cites "Proceed with the fix" (P-001-card-recommendation.md:17).
     - Design-2's views match the sizing's §1.
   - Context bullets 1, 2 and 4 are true:
     - Bullet 1: dor-fail-2-notes.md:17.
     - Bullet 2: P-003.md:46-61.
     - Bullet 4: OPERATING_MODEL.md:122, 149.
