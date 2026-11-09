Verdict: FAIL

I checked the spec's header, its cited records and its plan. Two things stop a freeze. The "unchanged from S-005" claim can't be verified from this pack. Several load-bearing facts depend on files that aren't here.

**Findings**

1. **"Word for word" claim can't be verified (specs/S-006.md:11).**
   - The spec says every criterion, join sheet, fact, risk and open question is S-005's, word for word.
   - It says the owner's approval of S-005's criteria (decisions/P-003/criteria-9.md) therefore covers these same words.
   - specs/S-005.md is not in the pack. `specs/` holds only S-006.md.
   - criteria-9.md (line 1) says only "Decision: proceed". It names no spec and no text.
   - So I can't confirm that the approved criteria are the ones in this spec. The whole approval chain rests on this claim, and an unverifiable claim is a FAIL.
   - stop-11.md:3 allows only the id, the supersedes line "and anything the plan review requires", and says "Do not grow it". I can't tell whether the spec stayed within that.
   - Fix: put S-005 in the pack, or have the Orchestrator record a diff of S-005 and S-006 showing only the permitted changes.

2. **Facts the spec relies on for its checks are outside the pack (specs/S-006.md:188-194).**
   - The spec itself admits that src/, research/P-003-sizing-findings.md and the S-004 spec are not in the definer's pack.
   - AC9 and AC14 to AC17 rest on recorded baseline runs of behaviour that the spec says it cannot state. The spec says this openly and designs around it.
   - Weaker point: J1 infers the card-file name form `queue/<item>-<gate>-<n>.md` from a single example (docs/PROJECT.md:540). The spec flags this as a known limit.
   - These are disclosed limits, not defects. But AC9 and AC14 to AC17 can't be shown to be satisfiable before the freeze, and they could force a stop at the J5 `src/notify/**` boundary after the freeze.

3. **Size mismatch with the stop rule (specs/S-006.md:180-183).**
   - The restated estimate is 15 to 23 tests, against a plan stop rule of 24. The spec itself says this is "near it".
   - That leaves almost no margin for 19 acceptance criteria, 6 join tests and the baseline files.
   - The spec calls these estimates "not a measurement", so the risk of an early stop is real. I'd carry it to the gate.

**What I checked and found sound**

- The header names `milestones: M4`, and M4 exists in docs/projects/P-003.md:46 with a `· why:`. The spec title matches the milestone.
- The plan is the item's own (docs/projects/P-003.md), as S-035 requires.
- The Design approval record (decisions/P-003/dor-4.md) exists and says "proceed".
- docs/PROJECT.md:127, :540 and :588 say what the spec cites.
- The plan's §1 bullets (docs/projects/P-003.md:15-23) match AC1 to AC8, AC16 and AC17 as I read them.
- The join-up review section is present, and it rates both differences non-blocking.

**Open questions**

- Did the Builder's pack hold S-005? If so, can the Orchestrator attach a diff?
- Should AC16 hide every decision card when one notes file can't be fetched? The spec already asks this as open question 3, and it is not a freeze blocker.
- Can anyone check that J6's "first-parent history" and committer-time rules give the same result on a real main-branch history? No test fixture in the pack demonstrates it.