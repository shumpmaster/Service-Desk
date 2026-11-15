Verdict: FAIL

I read specs/S-012.md in full, experiments/P-005-E1.md and the earlier review in reviews/S-012/plan.md. I did not open the library, decision and plan files the spec cites. The four earlier blocking items are addressed. Two new blocking defects are in AC41, and the join-up review is still open.

**Blocking**

1. **AC41 treats a legitimate return as a fault of the route.**
   - AC23 (line 63) and J5 (line 132) say a step is sent again when a run that read its project found it gone from the waiting list and a later run finds it back. This holds even with `changed_at` unchanged.
   - AC41 (lines 103-107) lists every step sent more than once with the same (`id`, `changed_at`). It allows only causes (a), (b) and (c), and calls everything else "unexplained, a fault of the route".
   - A step that left the list, was seen gone and came back fits none of the three causes. It would be reported as a fault of the route. The spec's own rule produces a false fault that goes to the owner with the week's misses.
   - The repeat-test list (line 111) has no such case, so a test written from this spec would pass either way.
   - Fix: add a cause (d) for a return seen through a `true` line without the step, or exclude such repeats. Add the case to the test.

2. **AC41 has no key to join AC40's waits to J5's and J9's lines.**
   - AC41 (lines 95-97) takes its steps from "AC40's count". AC40's listed fields (line 82) are kind, project, start record and time, end record and time, and who acted. They do not include a J4 waiting-list `id` or `changed_at`.
   - The notice lines (J5) and the `shown` lines (J9) are keyed by waiting-list `id`.
   - The spec never says how a wait is matched to an `id`. That can only be done by reconstructing J4's id, and the spec doesn't say how. Without a join key, AC41's test cannot be written.
   - Fix: add the J4 `id` and `changed_at` to AC40's output, or state the mapping per kind.
   - Cause (a) and cause (b) can also both hold: the second sender's `from_run` is `null` and the first sender has no `true` line. No precedence is given at lines 104-106.

3. **Join-up review rows 1, 2, 3 and 5 are still blocking.**
   - The mockups and E2's result file do not exist (spec lines 148-154).
   - The spec says it cannot close them. I agree: that review comes at the end of Design, once they exist.

**Non-blocking, carried as risks**
- Row 4 of the join-up review (two screens doing the same job until M10) is carried in Risks.
- AC37 and J10 pass only by finding no widget copy until P-004 adds one. The spec says so.
- The approval of the M7 pull request depends on the Builder's reading of src/. The spec names this at line 168.
- J12's file place (`value/P-005/checks.jsonl`) is open question 2. It is not a blocker.
- The start of a wait for the four kinds other than decision cards may differ from when the desk first lists the step. The spec admits this (line 200). It says the effect is only to show a step as later than it was, but I did not verify that.

**Open questions**
- Should a return seen by a run be a visible cause (d), or should the spec drop the resend for returns whose `changed_at` is unchanged? The owner's question 1 (line 231) chose to resend only when a run saw the step gone, and AC41 has to agree with that.
- Which field ties an AC40 wait to a J4 `id` for the pull request, gate and deploy kinds?