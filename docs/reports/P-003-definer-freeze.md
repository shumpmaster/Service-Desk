I've frozen S-007. The plan review passed, and the owner's latest criteria ruling (criteria-13, "proceed") comes after the change ruling for this spec. I changed no criterion, but I couldn't make the freeze commit, so the freeze isn't recorded until someone commits it.

**1. What I changed** (only `specs/S-007.md`; still 231 lines)
- **Line 3:** `status: draft` is now `status: frozen`. `frozen_at` now names "the freeze commit on build/definer/P-003 that sets this line", with its hash to be recorded at merge. S-005 used the same wording because there is no git here.
- **Line 11** (the list of changes from S-006): the line-3 entry now says "status and frozen_at: `frozen` here, `superseded` in S-006". It used to say `draft`, which would have been wrong after the freeze.
- **Line 18** (criteria heading): it pointed at the older approval, criteria-9. It now reads "owner-approved, decisions/P-003/criteria-13.md:1, "proceed"".
- Nothing else changed: no criterion, join sheet, fact, risk, open question or brief.

**2. Why**
- My handoff runs plan review, then the freeze gate, then the owner's scenario card. All three are done: `reviews/S-007/plan.md` is a PASS that found no unlisted changes, stop-12 asked for the AC13 fix S-007 makes, and criteria-13 says "proceed".
- The three edits are only the freeze record and keeping the spec's own notes true.
- This is a fix that entered at Design, so it needs a "## The defect" section naming the ruling record. That section is present (line 13). Because it isn't a stage-4 copy-over fix, no `fixes:` line is needed.

**3. What I verified** (no shell or git here; file reads and searches only)
- I read the whole spec, the template, the plan review and the rulings that matter (stop-5, stop-6, stop-7, criteria-8, criteria-9, stop-11, stop-12, criteria-13, failure-10, dor-4). I didn't open dor-3, dor-fail-1 or dor-fail-2.
- The plan lines the spec cites (§1 to §8) say what the spec says they do. stop-7.md:3 also matches.
- Searching for `^status:` across specs/ shows S-007 is the only frozen spec, and S-002 to S-006 are all `superseded`.
- The line count is still 231, so the spec's "both 231 lines long" claim and every line number in its change note still hold.
- The milestone, `milestones: M4`, matches docs/projects/P-003.md:46.

**4. What is undone**
- **The freeze commit:** it isn't made, because the workspace has no git. It needs to be committed to `build/definer/P-003` as `definer <definer@agents.invalid>`, with the `Agent-Session:` trailer, and its hash recorded at merge.
- **The locked-checks path:** the brief's "path set at freeze" is still unfilled. It belongs to the check author.

**5. Needed outside my lane**
- Whoever runs the freeze gate needs to make that commit and record its hash.
- The check author writes the locked checks for S-007 and names their path.
- The Build gate then goes to the owner, carrying the join-up review and the risks the spec lists. The biggest is the build possibly stopping: the test estimate of 15 to 23 is close to the stop rule's 24, and a change to src/notify/** would also stop it (J5).

**6. Open questions**
- I took criteria-13 to be the owner's approval of S-007, because its number comes after stop-12. The record itself only says "proceed" and doesn't name a spec. If it was about something else, line 18 should go back to citing criteria-9.
- The spec's six questions for the owner (lines 219–224) are unchanged, and none of them blocks the freeze.