Verdict: FAIL

**For the owner.** Draft 3 fixes both problems I raised last time. A "no work left" estimate now lasts until you accept the milestone, so the rough finishes no longer go blank the next day. The word ban now covers only the desk's own words, so your milestone "The desk's value targets shown" appears as written. All nine smaller notes are fixed as well. You are now told:
- about the notification each estimate sends you;
- that phone notifications are gone from "Not milestones yet" and the launch-target line is not built;
- that your Chief of Staff files a question at its next session, not at once;
- that you see the button on Home before the build.

One new contradiction blocks it. The test now says your private operating-model project's files must never be copied into this public repository; it uses placeholders instead. But the Builder's instructions still tell it to use those project's sprint files "as real records". Copying them would be hard to undo once public. A one-line fix to the instructions clears it. Two small notes are below.

I read /home/user/sd-orch-m3a/specs/S-001.md at the merged tip of orch/m3a-work-ahead. Line numbers below are from that file.

**Round 1 findings**

1. Rough finish broken by a 0-to-0 estimate: **fixed**.
   - A 0-to-0 estimate now holds until the milestone is reached: :5756-5762, :5791-5794, :7603-7604, and CS21 :8892-8893.
   - Estimates are now each milestone's own days of work (:7571-7577).
   - "Once you accept it" shows only for a 0-to-0 estimate; on the last day of its range an under-way milestone shows today's date (:5817-5818).
   - I checked every date in the worked example (:5819-5829), including 20, 23 and 24 Oct, and they follow the rules. The tests cover them (:5925-5928).
2. Word ban clashing with the real milestone names: **fixed**. The ban now covers only the desk's own fixed words, matched as whole words, and record text is shown as written (:5830-5836, test :5955-5958).
3. Phone notifications drop not told to you: **fixed**. It is now in the lead (:1155-1162), the differences list (:1258-1261) and the lineage. J15 gives it no id (:7695-7697). The note on where the estimates pick went is kept (:1256-1257, :5866).
4. Estimate notifications not told to you: **fixed** (:1152-1153).
5. Who changes the sender at the model sync: **fixed**. It is a separate Builder pull request with the owner's R3 verdict, landing before or with the job's fifth kind (:7652-7660).
6. M3A's "done when": **fixed**. It is reworded before M3A's acceptance, with the Critic's check and your approval (CS22 :8900-8906, brief :10421-10424).
7. Parts of the screen no mockup draws: **fixed**. They are listed (:1266-1270), and the brief orders the Chief of Staff to show you the Home control before the pull request (:10418-10420).
8. Delay in filing a question after a tap: **fixed** (:1159-1161, :5864-5868).
9. Stale order of work in the earlier milestone's steps: **fixed** (:2136-2138). AC24's test is reversed at MD3 (:5697-5698).
10. `planning` on an old-pipeline project, or not true/false: **fixed** (J7 :6785-6787, test :6812-6814). The brief does not carry it (note B).
11. Rulings not yet on the default branch: **fixed**. Both are now on the default branch (:1217-1218, Facts relied on :9341-9347).

**New findings**

A. **BLOCKING. The Builder's instructions still say to use the private project's sprint files as real records** (brief :10408-10410).
   - What is wrong: the brief says to use "Personal-Org-Operating-Model's sprints at 90f53e3 as real records". AC24's test now says "in poom/'s placeholder form only … no file of that private project is copied into this public repository" (:5914-5915). Facts relied on says the same (:9348-9351), as does the lead ("neither does now", :1148-1150) and the Orchestrator's ruling "placeholder fixtures only".
   - Why it matters: the Builder works from the brief. Copying the private files into this public repository would expose them, and that is hard to undo.
   - Fix: Definer, make the brief match AC24.

B. **Note. The brief's list for M3A has only part of J7's rules** (:10399). It lists only the second-`planning: true` rule. It leaves out draft 3's rule that `planning` on an old-pipeline (v2.5) entry, or a value other than true or false, fails the build (:6785-6787). The test is listed, so this is low risk. Fix: Definer.

C. **Note. Two small gaps opened by draft 3's fixes.**
   - The add-only check's rule 3 rejects any `time` after the job's clock (:7650). The desk accepts up to 10 minutes ahead (:7607-7609). An estimate made on a slightly fast clock would be shown by the desk but left for you to merge. That is harmless, but the two rules should match.
   - Narrowing the word ban to the desk's own words lets the Chief of Staff's estimate notes show words like "due" or "deadline". That cuts against "never a deadline". Fix: CS21 should tell the Chief of Staff not to write such words in its notes.

No fix narrowed what you were promised. Counting estimates as each milestone's own days of work fits your words, "rough estimates of duration", and the mockup's "days of work".

No self-implication flag: none of these findings comes from my own earlier checks.
