# S-001 after the glance audit: the Critic's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/definer/glance-plan at 671eada.

---

Verdict: FAIL

The amendment fails on four blocking findings. All four go back to the Definer for draft 2, and finding 2 also needs the Chief of Staff before anything is filed. There are no shell tools in this session, so I couldn't run `git diff`. I read specs/S-001.md as it stands in /home/user/sd-definer (the amendment at :2382-2593, AC91 to AC93 at :8296-8688, the notes, the open questions at :15691-15744, and the brief at :16272-16305) and checked it against the records you named.

What holds: all eleven rulings are quoted word for word, and each matches line 1 of its record. So do the owner's words, the Done-shading comment and the operating-model go-ahead (owner-request record :7-9, :32, :56-58, :66-70). "Equal width" is applied as the ruling reads: AC91 (f) gives 1 : 1, the empty Done keeps its width (not D), and it replaces P-001-board-layout's "all three lanes at once" only for Kicked back. Several things match their sources:
- The red words on the can't-read lines are the one exception to the palette ruling's "never on words". That exception was in the proposal the ruling takes "as proposed" (round 2 audit :39, :53).
- The `--ok` and `--bad` values match src/public/sandbox.css:472 and :493, and the contrast and distance figures match round 2's table.
- The arrow's five places and sizes match round 2 :157-164, and the standard-checklist words match P-001-glance2-standard.md:1.
- The gate's short title comes from a real record line (orchestrator.py:893-895, GATE_TITLE at :105).
- The mockup's pK, pEq, pD, p7 and p10 match AC91 (f), (i) and (k).

The milestone records also hold:
- M3D is reached (docs/PROJECT.md:114), and the `milestones:` header rightly leaves M3E out until the owner approves it.
- The interim `Milestone: none (…)` reason has no parentheses inside it, so it passes PR_MILESTONE_NONE_RE (governance_checks.py:612).
- Holding G10 back until S-034 is frozen, released and synced, with a further draft after that, is sound. S-034 is still `status: draft` (Personal-Org-Operating-Model/specs/S-034-tasks-and-steps.md:3), and no stage from G1 to G9 waits on it.

**Blocking findings**

1. **AC92 (e)'s "how rare" limits are invented, unmarked and credited to the owner. They contradict the ruling, the owner-approved mockup and AC91 (a).**
   - specs/S-001.md:8603-8605 sets "at most two boxes on a screen, each at most three lines at 360 px, and the boxes together no more than a quarter of the first screen's height". It presents these as "the owner's 'It definitely shouldn't be overdone'", and none of them is marked C.
   - The ruling sets no number. Its words are "anchors stay occasional" (P-001-glance2-anchor.md:1), and it leaves the application to the Design reviewer: "The Design reviewer applies it screen by screen in the build brief" (its :13).
   - :8600-8601 goes further: "only what the screen exists to tell first (its criterion's opening clause)". That narrows the box back to the single most important thing, which the owner's widening rejected: "only accepting one thing omits other elements that might be close to or as important" (owner-request :68).
   - The cap breaks the box the owner already approved. The ruled project-page box ("the project page gets its boxed sentence and tally") is drawn at four lines at 360 px (shots/r2-q2-page-after.webp, approved with "love it, all").
   - It also breaks the Home box in the spec's own table (:8615). AC91 (a) (:8325-8331) adds a line each for the settle time and the undo, so the count, the parts line and both of those give four lines. AC82's "Can't read <project> since HH:MM" adds one line per unreadable project (:7389).
   - So AC92 (e)'s test (:8644-8647) fails screens that other criteria require.
   - Rules broken: a ruling applied as it reads; no made-up rule; no two criteria in conflict.
   - Route: Definer. Either drop the numbers and leave "never overdone" to the Design reviewer's per-screen list, which the ruling names, or mark them C with a reason that fits the ruled boxes and put them to the owner as a fourth reading. If the owner is to set a hard cap, the Chief of Staff asks.

2. **The proposed M3E line, under its recommended option A, fails the milestone standard and contradicts question 2's recommendation.**
   - Question 1, option A (:15698-15709) makes M3E a **Build** milestone that "is reached only once the model change is in and G10 is built".
   - Question 2, option A (:15721-15723) has G10 land "before or after launch, and never holds launch up".
   - A Build milestone has to be reached within Build, as a condition of the Build gate. One whose "done when" waits on another project's draft spec, which still has its own open owner questions (S-034 :9), is not reliably reached within its phase.
   - Under A, either the Build gate waits on S-034, or the owner passes the gate with M3E unreached. The recommendation tells the owner neither.
   - The M3E line by itself is an achievement and its why is plain. Option B's M3F line also passes.
   - Rule broken: each milestone is an achievement within its phase, needed to reach that phase's gate (D-052).
   - Route: Definer. Restate question 1 so that its recommendation fits question 2 and the milestone rules (B, or G10 under a milestone that is not a Build-gate condition), and say the consequence in plain words. The Critic checks the line again before the Chief of Staff files it.

3. **AC92 (c)'s counts are not defined for cases the records already hold.**
   - T counts every standard milestone with "a state recorded … in any run" (:8545-8547). That takes in "not needed" (the model's state, AC59 :5577-5578) and skipped ones with a recorded state. Neither can ever be reached, so a finished phase could still read "4 of 5": the owner's complaint, "Even on phases we've fully completed".
   - The spec doesn't say whether a "carried over" standard milestone, which AC59 draws with the reached check (:5590), counts in R.
   - "<k> tracked · <u> not tracked · <j> skipped" (:8562-8563) doesn't say whether skipped ones fall inside u, so k + u + j has no defined total. The `u` here also clashes with the sprints' `u` (:8552).
   - m and u are defined only for pull requests (:8550-8552). A phase whose sprints are research or pipeline items would read "7 sprints · 0 merged", which looks like nothing done. Yet the spec's own Discovery example reads "7 sprints · 7 merged" (:8572-8574).
   - Rules broken: each criterion is a testable scenario; nothing misleading.
   - Route: Definer.

4. **Changes made with no note where the older criteria still say otherwise. One claimed note doesn't exist, and one claim contradicts AC91 (h).**
   - AC91 (l) (:8438-8440) changes the date form of "Your last action" (AC55 :4954, "the time as J9 gives times"; J9 :11160-11161) and of a member's page (AC49). AC49, AC55 and J9 have no note.
   - G4's row (:2567) names none of their test cases.
   - (l)'s test, "each date with a time in the one form" (:8467), lists no places, so it can't be checked.
   - AC92 (a) says "AC48, AC81 and AC88, noted" (:8488-8489), but AC88 (:8025-8050) has no note.
   - The header over AC65 to AC68 (:6124-6126) still says "no colour is added beyond the phase colours and the coral 'needs you' diamond", while AC92 (a) colours the tile drawing's marks.
   - "What changes" (:2490-2491) says gate titles are "no longer cut", and AC89 (j)'s note (:8173-8174) says the cut applies only to other card titles. AC91 (h) still cuts a gate title "at two with the fade" (:8406-8407).
   - Rules broken: "Changed in place, each with a note naming its part" (:2485); no two criteria in conflict.
   - Route: Definer.

**Non-blocking notes**

5. **The owner is told something false.**
   - The owner's paragraph says "your count is the biggest text" (:2391), and G1 says "the largest text" (:2564).
   - The ruling gives it 18 px (P-001-glance-count.md:1). AC91 (a) keeps the screen title at `--t-title`, 24 px (:8321-8322; AC81 :7249). The mockup the owner saw shows "Home" larger (shots/03-count-after.webp).
   - Better: "the largest text under the title".
   - Route: Definer.

6. **The brief and the stage table disagree on G5.** The brief's G5 reads "derivation only, in src/lib/ with its src/public/lib copy" (:16289-16290). The stage table's G5 puts the counts on screen (:2568), and every stage is said to touch src/public/** (:2553-2554). Route: Definer.

7. **AC93 already differs from S-034's draft.**
   - Steps are linked to their sprint only; S-034 set aside a milestone key (S-034 :39).
   - A pull-request sprint's steps sit in the Chief of Staff's session lines, which J13 reads, not J9 (S-034 :5, :27).
   - Places to correct: the amendment (:2544-2545, :2549), AC93 (:8661-8662, :8668-8670) and the brief (:16298-16299), which name only J9 and J12.
   - The gating covers this, but the text should not claim something S-034 does not do.

8. **The empty strip's words differ from the ruling.** The ruling's words are "Kicked back · none" (P-001-glance-lanes.md:1). AC91 (f) (:8369-8370) gives the two words with no " · " between them.

9. **"The card's whole first sentence (section 1's first line)" (:8408) is ambiguous.** That line (GATE_QUESTION, orchestrator.py:806-812) holds two or three sentences. Say which is shown.

10. **AC91 (c) doesn't say what happens to the tile's existing red "✕ Can't read since …" line at its foot** (audit :43). If it stays, a tile carries two red lines with the same words.

11. **A carried-over standard milestone would turn green.** It is drawn with AC59's reached check (:5590), so under AC92 (a) (:8491-8492) it turns green, though it is not reached. Say whether it does.

12. **The audits' fixtures can't be rebuilt from the repository.** `mix`, `ext`, `text`, `unread` and `quiet` were put together by scripts outside it (audit :219; round 2 :326). :2556-2557 and :8441-8443 should say how the Builder builds them.

13. **G7 and question 3.** If question 3 is answered A after G7 lands, no stage builds Plan's "moved" edge (:2592-2593, :16292-16293).

**Open questions**
- Does the owner want any fixed cap on soft boxes, or is the Design reviewer's per-screen list, tried on the preview, the rule? (Finding 1.)
- Should a "not needed" or skipped standard milestone with a recorded state count in a phase's total? (Finding 3.)

Checked and fine:
- No join-up review section is due, since this is not the end of Design.
- The "M3D's follow-ups that this work closes" all match docs/CHECKPOINT.md:46, :49, :53 and :62.
- "Answered by the owner: the eleven rulings" is right: six from round 1 and five from round 2.

Self-implication (D-050): none. No earlier check of mine covered this draft.

Files:
- /home/user/sd-definer/specs/S-001.md
- /home/user/sd-definer/decisions/questions/P-001-glance2-anchor.md
- /home/user/sd-definer/decisions/questions/P-001-glance-lanes.md
- /home/user/sd-definer/docs/design/references/owner-request-2026-10-24-glance-emphasis.md
- /home/user/sd-definer/docs/design/audit-2026-10-24.md
- /home/user/sd-definer/docs/design/audit-2026-10-24-round-2.md
- /home/user/sd-definer/docs/design/mockups/glance-emphasis/shots/r2-q2-page-after.webp
- /home/user/sd-definer/docs/design/mockups/glance-emphasis/shots/03-count-after.webp
- /home/user/sd-definer/governance/checks/orchestrator.py
- /home/user/Personal-Org-Operating-Model/specs/S-034-tasks-and-steps.md
