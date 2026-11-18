I've written S-013 as a draft, marked S-012 superseded, and pointed both experiment registrations at S-013. Nothing is committed: this folder is not a git repository, so I couldn't commit to `build/definer/<task>`.

**1. What I changed**
- **`specs/S-013.md` (new, draft).** It is S-012's text with only these changes, each listed at the top of the spec:
  - **AC40, which pull requests count.** A pull request now counts if the desk's code would have listed it as waiting on you at any moment while it was open (your ruling in `P-005-s012-pr-counted.md`). The count tries each record time in the project while the pull request was open, plus the window's end if it is still open. Before, a finished pull request was never counted.
  - **AC40, a return to ready is a second wait** (your ruling in `P-005-s012-pr-return.md`). Each spell, from ready for review to back to draft, merged or closed, is timed as its own wait. Both spells share the id `pr:<number>` and are told apart by their start.
  - **AC41, dating.** A notice or a "shown" record counts for a wait only if it is dated at or after the wait's start and before its end.
  - **So a second spell can be sent and shown at all:**
    - In the waiting list (J4), a pull request's "last changed" time is never earlier than the start of its current spell, so the alert route (J5) sends it again when it comes back to ready.
    - The device log (J9) writes a new "shown" line for each new (project, id, last changed) and now carries the project. S-012's "shown" line had no project, although an id is only unique within its project.
  - **AC41, new cause (e) "notified set not readable".** This covers a repeat where the run named by `from_run` has its log past keeping or missing, or has no `true` line for the project. It is listed apart, naming that run, and never as "unexplained". (e) is tried after (b) and before (c), because (c) and (d) both need that line.
  - **AC41, repeats across the window's start.** The earlier notice is now looked for in every log still kept, including before the window, so a first send before the window and a second inside it is found.
  - **Tests.** The tests for AC40, AC41, J4, J5 and J9 gain all of these cases.
  - **Other sections.** The M8 note, AC23, AC26, J11, the known limits, the risks and the open questions follow these changes. I kept, as asked: cause (d), the order (a)–(d), and the waiting-list id as the join key. All `join-test` labels now say S-013.
- **`specs/S-012.md`:** only the status word changed, to `superseded`.
- **`experiments/P-005-E1.md`:** every "S-012" now reads "S-013". The pull-request row (line 23) and line 26 now state your two rulings. Line numbers are unchanged. E1 has not run.
- **`experiments/P-005-E2.md`:** every "S-012" now reads "S-013" (lines 3 and 14).

**2. Why:** your "criteria-wrong" ruling in `decisions/P-005/stop-6.md`, and the two pull-request rulings behind it.

**3. What I verified**
- I compared S-012 and S-013 with `grep -oE` on the criterion lines. All 36 criteria trace to a value target with matching numbers.
- The `join-test` labels are the same set in both specs (J1–J10 and J12; J11 had no test in S-012 either), and no S-012 label is left in S-013.
- Every text replacement was checked to match exactly once. Line 3 of S-012 now reads `status: superseded`.
- I did not run any spec checks (such as `v3_checks trace`); they are not in this folder.

**4. What is undone**
- No commit, so no `Agent-Session:` trailer.
- `frozen_at` is not set; that happens at the freeze gate.
- The Critic's plan review has not been done.

**5. Needed outside my lane**
- Someone with the repository needs to commit this work.
- **S-012 was not frozen in this copy.** Its status read `draft` with no freeze commit, while the brief said "frozen". I changed that word to `superseded` anyway; someone should confirm this matches the version on main.

**6. Open questions**
- **New question 4:** your ruling doesn't say which version of the desk's code decides whether a pull request "would have been listed". I used the code on main at the window's end, so re-running the count gives the same figures. The other reading is the code as it stood at each moment. If you prefer that, AC40 and E1 line 26 change before freeze.
- **Question 1 is narrower now:** only a pull request moves its "last changed" time on a return; other kinds that leave and come back between two runs are still not re-sent.
- **Questions 2 and 3 are carried over unchanged:** where the weekly value record lives, and a week with no device log counting nothing as shown.