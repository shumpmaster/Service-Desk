I've revised specs/S-012.md to fix the two blocking defects the second plan review found in AC41. The third blocking item, the join-up review rows, isn't something this spec can close. I haven't committed anything: the folder isn't a git repository, so the edit sits in the working copy only.

**1. What I changed**
- **AC41, the causes of a repeat:** I added cause (d), "a return seen by a run". It applies when the second sender's `from_run` names the first sender or a later run, and that run's `true` line doesn't hold the step's (`id`, `changed_at`). The four causes are now tried in a fixed order, (a), (b), (c), (d), and the first one that holds is the cause. So a repeat where both (a) and (b) hold is listed as (a). I also simplified (c), since the fixed order now does the work its extra condition did.
- **AC41, the matching key:** a wait is matched to `shown` lines and to notice lines by `id`, together with `project`, whatever the `changed_at`. Repeats are found in the notice lines alone, on (`project`, `id`, `changed_at`).
- **AC41's test** gains:
  - a case for cause (d);
  - a case where (a) and (b) both hold;
  - a step of each of the five waiting kinds, matched by its `id` from AC40.
- **J4** now has an id rule for each kind:
  - card or gate card: `<item>-<gate>-<n>`
  - owner question: `question:<name>`
  - pull request: `pr:<number>`

  These three are the forms S-009 gives at specs/S-009.md:154. The fourth is new: a deploy awaiting the owner's review is `deploy:<run id>/<run attempt>`, because a re-run is a new wait. Each id is built from the step's own records. J4's test now checks one id of each kind.
- **AC40** now lists each wait's waiting-list `id`, and its test checks it.
- **AC23** says a return that a run saw is resent by its own rule, not as an exception. **J5** points to cause (d).
- I added a revision note in the header, a Known limit on where the ids come from, two Risks, and a sentence under open question 1.

**2. Why**
- Under the old AC41, a return that AC23 and J5 require to be resent would have been reported to the owner as a fault of the route.
- AC40's output had no field that could be joined to J5's and J9's lines, which use the waiting-list id. Without one, AC41's test couldn't be written.
- (a) and (b) could both hold with no rule for which one wins.

**3. What I verified**
- I checked that `grep` finds (d), the id rule and the exception wording where they should be, consistent across AC23, AC41, J5, Risks and the open questions.
- I read specs/S-009.md:154 to confirm the three id forms. They are the forms S-009 uses in its own records, from its reading of src/ at its base commit. I worded the spec to claim only that, not that the desk uses them today.
- A Python replace confirmed each corrected sentence appeared exactly once. No tests were run, since this lane doesn't write or run any.

**4. What is undone**
- **Join-up review rows 1, 2, 3 and 5** stay blocking until the mockups and E2's result exist. Both the spec and the review agree it can't close them.
- **E1's output** (experiments/P-005-E1.md line 31) has an `id` field but doesn't say what form it takes. I left it alone, because the review didn't ask for it and E1 hasn't run. Aligning it with J4's id rule would be a small follow-up.

**5. What is needed outside my lane**
- In Build, the Builder's reading of src/ has to confirm the desk still forms ids as S-009 recorded. If it doesn't, that contradicts J4, which the stop rule makes a stop and a revision of this spec.
- The spec then goes back to the Critic for another plan review.

**6. Open questions**
- **The deploy id:** a re-run with a raised attempt now counts as a new wait. Should the owner see this at the scenario card, or only if E2's records show something different?
- **Aligning E1:** should E1's `id` be set to J4's id rule now, or left until E1 runs?