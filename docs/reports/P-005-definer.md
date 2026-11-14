I've written S-011 as a draft and marked S-010 superseded. Nothing is committed: the folder isn't a git repository (`git status` returns "not a git repository"), so the files sit on disk in the pack.

**1. What I changed**
- **New `specs/S-011.md`** (draft, `lineage: [S-010]`, `milestones: M6, M7, M8`). It is S-010 with only these changes:
  - **Your six answers are written into the criteria**, each quoting `decisions/P-005/stop-4.md`:
    - M9 and M10 go to a second spec.
    - AC8: an agent step is "stalled" after 2 hours with no new record.
    - AC14: a project is "late" after 4 minutes with no successful read.
    - AC3 keeps the three record writers.
    - J9 and AC26: the weekly device log goes to `value/P-005/` in the portfolio repository.
    - AC15 and J7: the banner alone is enough if the outside check can't alert you.
  - **Triage's three spec defects are fixed:**
    - **AC23** no longer promises a phone notice within 5 minutes. It now says the first successful run of the alert route after a step falls due sends the notice. No route the plan names can promise a set number of minutes (facts F-gh-12 and F-gh-12b, plan line 136). The 5 minutes stays as V8's measure, counted by AC41. The Design states how late its chosen route can be, and that goes to you at the Design gate.
    - **AC40** is now handed the window's end and treats it as "now". A wait still open is measured up to that moment, and the count reads no clock of its own. Its test now also runs the count twice and expects identical figures.
    - **The criteria heading** now says they are approved at the scenario card, which this draft hasn't reached.
  - **One consequence of the AC23 fix:** in J5, when the route finds no earlier run, it now looks back over its own period instead of the timeline's 2-minute read interval. Otherwise a 5-minute schedule would skip steps.
  - **Housekeeping:**
    - Join-test labels now say S-011.
    - Criterion numbers are unchanged (AC27–AC36 stay unused).
    - The M9 drafts are not copied over; they remain readable in S-010.
    - The open questions are all answered.
    - The surface owner's brief now points to S-011.
- **`specs/S-010.md`**: only the status word changed. The file said `status: draft`, not `frozen` as the brief says, so I changed `draft` to `superseded`. See question 1.

**2. Why**
The owner's "criteria-wrong" ruling (`stop-4.md`) asked for a new spec that writes in the six answers and fixes triage's three defects.

**3. What I verified**
- Comparing S-010 with my saved copy shows exactly one changed line, the status line.
- S-011 has 36 criteria, each with its own `[trace: V → AC]` line.
- Join-test labels S-011/J1 to J10 are all present, and none still says S-010.
- Every library file S-011 cites exists, and the "Carried to the spec" section is gone.
- I checked the plan and `docs/PROJECT.md` lines the changes rely on (plan lines 136 and 180; `PROJECT.md` 115, 116, 205–209, 286–287, 588 and 593). Each supports what the spec says.
- I checked S-009's earliest-entry rule, which AC40 and J1 use.

**4. What is undone**
- No commit, because there is no git repository here.
- The Critic's plan review, the freeze gate and the scenario card haven't happened yet.
- The spec cites the two experiment registrations (`experiments/P-005-E1.md`, `experiments/P-005-E2.md`), but they aren't in this folder, so I couldn't re-read them. This is now listed in the spec's known limits.

**5. What is needed outside my lane**
- Commit to `build/definer/P-005` from a real checkout.
- Confirm the two experiment registrations exist on the branch, and that E2's has a "Result" section, which AC46 names.
- The M9 and M10 spec needs a pack with the four records the spec lists.

**6. Open questions**
1. S-010 was marked `draft` in the file, not `frozen`. Was it actually frozen? I treated the brief as meaning "mark it superseded".
2. The heading now reads "owner-approved at the scenario card, which this draft has not yet reached". If CI expects the template's exact heading, it should be changed back at freeze.