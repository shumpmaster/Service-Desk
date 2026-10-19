Verdict: FAIL

**For the owner.** The amendment carries all eight of your rulings faithfully: you order milestones only, you set no dates, the Chief of Staff makes one rough estimate per milestone, each milestone gets a rough finish labelled an expectation, your picks show under "Not milestones yet", the automatic job takes over merging estimates after the model change, and Work ahead is built now in the trial view. Leaving phone notifications out of "Not milestones yet" is right, because they are built and live. Offering to add them as a milestone would ask for work that is already done. Two things have to be fixed before building. First, the arithmetic for "no work left, when you accept it" breaks the day after it is made. That estimate means "reached today", so the next day it counts as overdue. Every milestone after it in your order then shows its rough finish as "not available", until your Chief of Staff makes a new estimate and you merge it. With your two design milestones first in the order and waiting on your acceptance, the whole screen would go blank most days. The worked example contradicts its own rules for the same reason. Second, the screen is meant to show no wording like "target", but your own milestone "The desk's value targets shown" contains it, so the test cannot pass against the real records. Some notes follow. The summary leaves out some things you will see differently from the mockup you approved (phone notifications gone, the launch-target line not built). It also doesn't say that every new estimate will notify your phone until the model change lands. And Work ahead's "done when" still talks about timing you record yourself.

I read /home/user/sd-orch-m3a/specs/S-001.md (line numbers below are this file), the eight ruling records in decisions/questions/ (both of today's answers are in the worktree), /home/user/sd-orch-m3a/docs/design/mockups/work-ahead.html, docs/PROJECT.md section 3, governance/SURFACES.md and decisions/questions/P-001-trial-view-notes-2.md:150-184. I have no shell, so I did not check the commits.

**BLOCKING**

1. **A 0-to-0 estimate turns overdue the next day and blanks the rough finish** (J14 :7516-7520; AC24 step 2 :5751-5759, step 4 :5764-5766, step 5 :5770-5771, worked example :5772-5778; CS21 :8790-8792).
   - What is wrong:
     - J14 defines `high_days` as the days "until the milestone is expected reached, the owner's acceptance included". It counts an under-way milestone as past its estimate when "today is after the estimate's date plus `high_days`".
     - For a 0–0 estimate ("no work left … when you accept it"), that is the very next day. MD1 and MD2 are under way, since they have sprints, and they sit first in the order. So from day 2, step 4 makes every row after them, and the card, read "not available".
     - CS21 then has the Chief of Staff re-estimate "whenever it turns stale". In practice that means a fresh 0–0 line for each milestone waiting on acceptance every day. Each is a pull request the owner merges and gets notified about until the model change.
   - The worked example is wrong under these rules. On 20 Oct, MD1 and MD2's 0–0 estimates of 18 Oct are already past, so MD3 cannot read "21 Oct – 23 Oct". On 24 Oct the rows from MD1 on are "not available", not only MD3 to M3C. The test pins exactly these cases (:5860-5862).
   - Step 5 also gives any under-way milestone on the last day of its estimate (e = `high_days`) "when you accept it". That claims the owner's acceptance is all that remains, which no record says (AC41).
   - Why it matters: the owner's stated purpose is a rough finish to set expectations, and as written it fails on most days.
   - → Definer: give "no work left, waiting on acceptance" a meaning that does not expire daily, or say how it holds. Show "when you accept it" only for a 0–0 latest estimate, never because days have passed. Redo the worked example and its test cases.

2. **The "never a deadline" word ban contradicts the real fixture** (AC24 :5779-5781; test :5880-5881; rows show name and "done when" :5699-5701; docs/PROJECT.md:113).
   - What is wrong: the ban forbids any text on the screen holding "target". But M3B's own name, "The desk's value targets shown", and its "done when", "each value target (V1 to V5)", are shown on its row. The test uses section 3 at 77bfeae as a real record. So either the test fails, or the Builder has to alter the owner's milestone words.
   - Why it matters: an acceptance test that cannot pass as written forces the Builder to guess.
   - → Definer: limit the ban to the screen's own words (labels, finishes, card), not to milestone names, "done when" lines or notes quoted from records.

**NOTES**

3. **Dropping "Phone notifications (W3)" is right, but it is not told to the owner** (J15 :7601-7603; mockup :175; lead :1146-1164; "Where the build differs" :1231-1246).
   - Notifications are built and live (:1395-1396, :9936-9939) and were never a milestone (:805-808). A "Tap to ask for it as a milestone" row for them would be false, so leaving the row out is correct.
   - But the owner approved a mockup showing three rows, and their picks ruling named four. The drop appears only in J15 and in "What this spec does not cover". It is missing from the plain lead, from the list of differences from the mockup, and from the lineage.
   - Other gaps of the same kind:
     - the lead's "Nothing failed or was skipped" leaves out the launch-target line, which the mockup draws and the spec does not build;
     - the mockup's explanation of where the estimates pick went (mockup :172) is dropped from the "Not milestones yet" line (:5809-5810) with no listing;
     - W2's note adds "M3B's criteria", which the mockup did not show (it matches its record, :168);
     - the lead's "those two milestones" (:1152) has no antecedent.
   - The spec also names a "W3" that is never in the file. A later W3 would then clash with "never reused".
   - → Definer: add these to the lead and the differences list, and drop the "W3" label.

4. **The lead does not say that each estimate notifies the owner's phone in the interim** (lead :1148-1150 against J14 :7539-7541, :7552-7554). The ruling's option A as put said estimates would sit in the Queue "a few a week". J14 says each one also notifies. Under finding 1 as written, that would be daily. → Definer.

5. **Who makes the notification sender's change at the model sync is unclear** (J14 :7566-7570). "At the sync, here: J16's job-candidate kinds … gain the same fifth kind … That is the sync's own change."
   - The sync is the Orchestrator's, but `src/notify/` is the Builder's surface and is R3 (CS18). The Orchestrator never edits code.
   - Nothing orders the two changes. If the sync lands first, the sender notifies estimate pull requests the job will merge, against ruling A in P-001-notify-job-merges.md.
   - → Definer: name it as a separate Builder pull request, R3, that lands with or before the sync.

6. **M3A's "done when" does not match what is built, and the owner is about to accept against it** (CS22 :8801-8806; docs/PROJECT.md:112).
   - It reads "the owner's chosen order and timing … recorded from the desk". After the date ruling, no timing is recorded from the desk. CS22 reads "timing" as the Chief of Staff's estimates and says "this spec does not depend on" rewording the line.
   - M3A is now accepted on its own, soon, against that line. A gate case citing "reached" would rest on a reading rather than on the line itself.
   - → Chief of Staff: reword the line, with the Critic's check, before M3A's acceptance. Definer: make that an order in the brief. Whether a rewording needs no owner ruling is also asserted from "docs/PROJECT.md section 3", which does not say so. Confirm it, or put the reworded line to the owner.

7. **New screen elements beyond the mockup** (AC24 :5668-5672 and :5682-5684, :5689-5693, :5818-5824, :5831-5838). The owner asked for mockups first. The "Work ahead" control on Home's top line changes a screen the owner already approved, and it is drawn nowhere. The same goes for the dropped fold, "not in your recorded plan", the ask states, "Not added" and the stale wordings. The ruling's "tried on the preview first" partly covers this. → Chief of Staff: show the owner at least the Home control before or with the preview.

8. **A tap on "Not milestones yet" does more than the ruling says** (J15 :7609-7625; CS21 :8795-8797). The ruling says "tapping one files a question". As built, the owner commits an ask on GitHub, and the question is filed only at the Chief of Staff's next session start, which could be days. The (C) is reasonable for a desk that holds no write credential, but the owner is not told about the delay. → Definer: one plain line.

9. **The other milestones step still sends AC24 to after MD** (:2107). It reads "M3's new views (AC24, AC25) are then built in the chosen design", which contradicts draft 2's "built now" (:5622-5623, :5655-5667). It is not in "Changed in place". → Definer.

10. **J7 does not cover `planning: true` on a v2.5 entry, or a non-boolean `planning`** (J7 :6704-6708). J14 and J15 put the estimates and the later-work list in "the planning project". J6's v2.5 reads (:6645-6647) would not fetch them, and J4 ignores v2.5 rows. Other keys of this kind fail the build on a wrong-kind value (:6719-6720). → Definer: fail the build in both cases.

11. **Records not yet on the default branch** (:1208-1209, :9926-9927; Facts relied on :9206-9239). Draft 2 rests on the two answers on cos/m3a-answers-3 (pull request #123). Facts relied on names neither of them, nor the mockup's merge onto this branch. → Definer: add them. Orchestrator: merge #123 before this spec lands.

**Join-up review (Design: the agreed screens, side by side).** Screens checked: Work ahead (docs/design/mockups/work-ahead.html, version 2) against the sandbox's Home, Status and Queue as AC48, AC56, AC57 and AC66 give them.

| Check | Result | Fix |
|---|---|---|
| One meaning per colour or status signal | Pass. The ring, half-fill and gold edge reuse AC57's meanings. Coral is used only for "waiting on you in your Queue" (AC69). | — |
| One navigation | Pass. AC56's back and Home controls, with one way in from Home. | Note 7 (the control is not drawn) |
| Consistent type, spacing and codes | Pass. The mockup uses the trial view's tokens. | — |
| No two screens doing the same job | Pass. Ordering changes no other screen (:5694-5696). | — |
| Every screen's data available from the records, or listed as a needed change | Fails for the rough finish (finding 1). Fails for the word ban against section 3's words (finding 2). The rest come from J4, J11, J14, J15 and J9. | Findings 1 and 2 |

Needed changes to the records: J14's estimate file and J15's list (CS20), and the model change for estimate merges (a dependency, J14).

No self-implication flag: I had not checked this amendment before.
