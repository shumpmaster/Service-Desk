Verdict: FAIL

I checked the P-003 section of docs/PROJECT.md (lines 576–613) against the definition of ready. The milestone line is sound, but the brief fails on two points, and several claims can't be checked from this folder.

**Findings**

1. **Discovery and Design standard lines are missing (blocking).**
   - Section 3 (docs/PROJECT.md lines 68–127) has standard lines only for Build-1 to Build-5 and Launch-1 to Launch-5 (lines 118–127).
   - A grep for `(Discovery|Design)-\d` finds only the template text at line 69.
   - The definition of ready (model S-032) fails a brief whose section 3 lacks a `- <Phase>-<n> (standard) · taken on|skipped · why:` line for any Discovery or Design standard milestone.
   - The brief has none for Discovery-1 to Discovery-8 or Design-1 and up. The Discovery-8 milestone is named in decisions/questions/P-003-critic-pack-cap.md line 4.

2. **The M4 line passes on its form.** The line at docs/PROJECT.md line 595:
   > `Every decision card shows the Chief of Staff's recommendation, or says it has none (M4) · done when a decision card waits off the owner's queue … on the desk's preview, with its tests · phase: Build · for: P-003 · why: twice on 3 November the owner answered a decision card the opposite way to what they meant, because the desk showed only a pointer to the Chief of Staff's notes and marked no answer as recommended`
   - The name and the done-when each describe an outcome rather than a task.
   - The why is plain and has no ` · ` inside it.
   - It carries `· for: P-003`, as the template asks.
   - The line is still only a proposal. It is not yet in section 3 (line 593 says it goes in after owner approval), so there is nothing to check there.

3. **Several claims have no record in this folder (unverifiable, so FAIL).**
   - **Critic check:** the line cites "reviews/P-003-m4-line/critic.md, PASS at round 2" (line 593). No reviews/ folder is in my pack.
   - **Owner's wrong-way answers:** the Why (line 580) says the owner answered the opposite way twice, citing decisions/Q-019/stop-1.md and decisions/Q-017/stop-2.md. Q-019/stop-1.md holds only "Decision: re-specify". It says nothing about what the owner meant, so the claim isn't supported there.
   - **Notes files:** the sizing findings (research/P-003-sizing-findings.md lines 31–39) quote line numbers from five or more notes files. None are in my pack, so the four "forms" and the rule at PROJECT.md line 608 can't be checked.
   - **Code references:** the findings cite src/ line numbers (for example model.js:734-739 and sandbox.js:955). No src/ is in my pack, so none can be checked.
   - **The Discovery:** it ran as a read-only helper. The findings file says it is recorded verbatim, with no review record behind it.

4. **The Discovery sizing is not independent of its brief.** Findings §2 says "the brief's citations are correct", and the Why at line 580 uses the same citations. That is a statement of agreement, not a check. The findings also raise things the brief did not specify (notifications, no raise time, the second file to change, and Q-003's heading-only notes). Lines 608–610 now cover these, which is good.

5. **Section 9 is fine.** Line 479 reads "The owner is the user." The desk serves only the owner, so nothing contradicts it.

6. **dor-fail-1.** decisions/P-003/dor-fail-1.md holds only "Decision: resubmit". It gives no reasons, so I can't tell which earlier failures it answers.

**Open questions**

- Does the owner's approval of the standard lines for the project (Discovery and Design) cover P-003? Part 1 may be meant to carry them. If so, the Chief of Staff should point to the record that says so.
- Can the reviews/P-003-m4-line round records and the notes files be added to my pack?
- Is the shared-brief arrangement (line 577, borrowed "Success defined" marks) approved? Line 577 says it is, citing the "accepted for small additions" ruling, but I can't see that ruling's record.