## 1. What I changed
I revised `specs/S-008.md`, which grew from 231 to 258 lines:
- **New join sheet J7 (lines 146–171)** for the baseline cases, the adapter, the record and the locked checks. It fixes:
  - the command: `node tests/desk/baseline/adapter.mjs <case> <output>`, with no network;
  - the clock: the adapter fixes it to each case's `moment`, so the same call works on base code that reads a clock and on built code whose caller hands the rule a moment;
  - the entry points the adapter may call. They must exist at the base commit, and the build must keep them working the same way, adding fields only;
  - the JSON forms of the case file, output and record. Output is sorted, so the same run always gives the same bytes;
  - the cases the checks must set at least, covering every case AC9 and AC14–AC17 name;
  - how each kind of result is compared, a coverage check, and stop-and-return if the adapter cannot run.
- **Line 23 (the baseline run):** the Check author now writes the cases from the spec; the Builder only writes the adapter. The runner is any role other than the Builder or the Check author, proposed as the Reviewer and left to open question 7. The old open-ended "the Reviewer re-runs it if the adapter changes" is gone: the adapter and cases are frozen once the record exists.
- **Other lines:** 18 (AC15 wording; criteria-13 flagged), 208 (J7's test is not an extra test), 216 (the evidence for the runner's role, stated honestly), 234 (the risk entry), 244 and new 251 (open question 7, which needs a ruling before freeze), 256–257 (the brief), and the change list at line 11.

## 2. Why
- **Finding 1 (no join sheet):** J7 says what the adapter calls, what it writes out, and who fixes each part. The adapter is bounded because it is frozen once the record exists.
- **Finding 2 (unproven roles):** nothing in the pack gives any role the run duty or a place to commit the record. I say so instead of claiming it, and ask for a ruling.
- **Finding 3 (weak baseline):** the Builder no longer chooses the inputs, and the locked check now fails a record that misses a case or is too narrow.
- **Non-blocking items:** I fixed the "last two sentences" wording to "second-to-last sentence" and flagged that criteria-13 names no spec.

## 3. What I verified
- `diff specs/S-007.md specs/S-008.md` lists changed lines 1, 3–4, 11, 18, 23, 58, the marks at 83/97/106/116/122/145, 146–171, 208, 216, 234, 244, 251 and 256–257. That matches the change list at line 11 exactly.
- No `S-007/` join-test marks are left (grep count 0).
- Every new citation is to a file in the pack, and the quoted lines say what they are cited for: `docs/projects/P-003.md:6` (P-003 borrows nothing from the first plan), `failure-15.md:4` ("a run the Builder cannot change"), and `docs/PROJECT.md:624` (the earlier plan's Reviewer duty).
- No criterion's scenario changed. Only line 23, which defines the baseline run, and the AC15 wording carried from the last round differ.

## 4. What is undone
- Nothing is committed: this workspace is not a git repository, so the `build/definer/P-003` commit with its trailers still has to be made.
- The spec is not frozen and should not be until question 7 is ruled.

## 5. Needed outside my lane
- A written duty and write lane for whoever runs the adapter and commits the record (proposed: the Reviewer). That goes in governance or role cards, or in the plan's §4 owners table (the Chief of Staff's).
- Confirmation that `decisions/P-003/criteria-13.md` approved S-007's criteria.
- The Check author must write the cases and checks to J7's forms.

## 6. Open questions
- **Question 7 (blocks freeze):** who runs the baseline, and should a second party who may read the code rerun it to confirm? This should go to the owner through the channel.
- **Feasibility is only known in Build:** whether the base commit's card sheet and sender can run outside a browser through the adapter. If not, J7 makes the build stop and return.