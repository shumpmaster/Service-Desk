Verdict: FAIL

I read the spec against the plan, both experiment registrations, the owner's ruling (decisions/P-005/stop-4.md) and the files in the pack. I'm sending the findings now.

**Findings**

1. **AC23 and J5 contradict each other (specs/S-011.md:53, :103).**
   - AC23 says the first successful run after a step's due time notifies it.
   - J5 says a run that cannot read one project "sends nothing for that project".
   - The next window starts at the last successful run's start. A step due in a run that could not read its project therefore falls in no later window, so it is never notified.
   - J5 also says a step in a "missed stretch" is not notified. That is true only on the fallback path, but the text doesn't say so.
   - The spec must say whether a partly failed run counts as "successful". It must also say how a project that couldn't be read is carried into the next window. As written, AC23's guarantee fails. A locked check built from it would be unsound.

2. **Unverifiable claim in AC17 (specs/S-011.md:45).**
   - It rests on "the widths the owner's design records use, per the plan review, reviews/S-010/plan.md; the records themselves are outside this pack".
   - Neither that file nor the design records are in the pack. The 360 and 414 px figures cannot be checked.
   - Either cite an in-pack record, or have the owner set the widths.

3. **The experiment registrations don't match what the spec cites (specs/S-011.md:59, :72, :109, :160).**
   - Both registrations name `spec: specs/S-010.md` (experiments/P-005-E1.md:3, P-005-E2.md:3), a spec this one supersedes. Line 178 says "Both are registered in this revision", but nothing in the pack shows they were updated.
   - AC46 requires E2's "Result" section to hold a row for each kind. E2 has no such section. Its output is a separate file, docs/handover/experiments/P-005-E2-result.md (E2:19).
   - AC40 cites E1's "The rule". E1's heading is "Rule" (E1:13).
   - Line 160 admits the definer did not re-read these files. AC46 is M6's acceptance test, so it points at a section that doesn't exist.

4. **AC20 conflicts with J4 (specs/S-011.md:50, :102).**
   - J4 adds deploys awaiting review to the waiting list. J4 says the other kinds are listed "as the desk lists them today".
   - AC20 demands that unreplaced core screens show the same steps and the same count.
   - Nothing says those screens must start showing deploys. "Areas touched" does not clearly cover that change to the screens.
   - Either the screens change or the test cannot pass. The spec needs to say which.

5. **AC25 and M8 don't line up (plan line 74).**
   - M8 says each thing that needs the owner "reaches their phone".
   - AC23 allows grouped notices and caps nothing. Its risk line admits that no daily limit was found.
   - Time Sensitive marking (AC25) is optional.
   - This is weaker than M8's wording. The spec should say it is a deliberate narrowing.

6. **Several citations point outside the pack (minor).**
   - Examples are docs/PROJECT.md line numbers and "plan line N". The plan is in the pack, but I did not verify the PROJECT.md lines.
   - The join-up review table is entirely "Open". The plan review rated four of its rows blocking. The spec says so itself (line 116), so it is honest, but the spec cannot be closed at the Design gate on its own terms.

**What I checked and found sound**
- The header's `milestones: M6, M7, M8` matches plan lines 72–74.
- The owner's six answers are carried into AC3, AC8, AC14, AC15, AC26 and J9 as written in stop-4.md.
- The three triage defects are fixed: AC23 sets no minute figure, AC40 is handed its "now", and the heading no longer says "owner-approved".
- AC40's rule matches E1's table.

**Open questions**
- Does a run that read some projects but not others count as "successful" for J5's window?
- Where do the 360 and 414 px widths come from, as an in-pack record?
- Should the E1 and E2 registrations be re-pointed to S-011 and given the section names the spec cites? Who does that?
- Does the unreplaced-screens change cover deploys, and is that inside the areas touched?