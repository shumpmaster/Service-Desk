Verdict: PASS

The brief meets the definition of ready. Part 1 is the brief in `docs/projects/P-005.md`. I checked it against the records in my pack. Records the brief marks "outside the check's files" (the operating model, AGENTS.md, the ledger, the portfolio basis, specs) I could not open, so I took no claim on them as evidence.

**Findings**

1. **Section 3, project milestones (`docs/projects/P-005.md` lines 72–76).** M6 to M10 each read as an achievement, not a task, and each has a phase (Design for M6, Build for the rest).
   - Each carries a plain-English ` · why:` that says why the project needs it, with no ` · ` inside the reason.
   - None is for another item's plan (no ` · for:`), which fits P-005 having a plan of its own.
   - M6 reads: "The records can carry the timeline (M6) · done when every kind of event … has either a record change the owner approved or the owner's acceptance that it shows as not recorded". That is a state reached, not an action.

2. **Section 3, standard lines (lines 82–95).** Discovery-1 to Discovery-8 and Design-1 to Design-6 each have a `(standard) · taken on · why:` line, and each why is substantive. I cannot see the operating-model table, so I could not check the numbering against it.

3. **Section 9 (line 220).** "The owner is the user." This does not conflict with the rest of the brief, which has the owner as the only reader and actor.

4. **Owner rulings cited.**
   - The groundwork shortlist matches the brief on answers 1 to 11: answers 1 to 4, 5, 6, 7, 8, 9 (second row of four kinds), 10 (no milestone filter row) and 11 (take all in).
   - `decisions/questions/P-005-route.md` matches "A: Discovery, own plan". The experiments, acting, reading and lasting-copies rulings (the same `P-005-` folder) each match the sentence that cites them.
   - Verified in `library/`: F-alarm-rate-01, F-oncall-ceiling-01, F-asof-age-label-01, F-gh-retention-01 and -02, F-ios-interruption-levels-01, F-alert-volume-vs-miss-01, F-agent-false-success-01, F-high-cardinality-01, F-cloudevents-type-owner-01, F-rec-two-times-01, F-rec-actions-retention-02 and F-provenance-self-generated-01.
   - The five "core screens" in section 8 match `docs/design/README.md` lines 12–18.

5. **Internal consistency.**
   - Eleven kinds equals the seven GitHub kinds plus four model steps.
   - The T1 tier, the read-only key and "finish on GitHub" agree across sections 1, 5 and 8.
   - Experiments E1 and E2 each have a fallback, and the stop rule covers them.
   - Value targets and misses are marked as drafts for the owner at the Design gate.

**Non-blocking notes (carry into the gate case as risks)**

- M7's "done when" says reach back "through the whole life of the work". That depends on a records change the owner has not yet approved (line 182). The brief already says M7 shows those results as "no longer kept" if the change is not approved. The M7 wording should make clear that this outcome counts as done.
- Several facts rest on records I could not see (the "outside the check's files" items). The brief says so openly, so I did not count them against it.

**Open questions**

- Does the operating model's standard-milestone table still run Discovery-1 to Discovery-8 and Design-1 to Design-6? I could not check it.