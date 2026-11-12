Verdict: FAIL

I checked the carried-over text against S-007, the plan and the cited records. The carry-over is accurate. The new baseline mechanism is not specified well enough to freeze.

**What holds up**
- The change list in specs/S-008.md:11 matches a line-by-line comparison with specs/S-007.md. The lines that differ are 1, 3, 4, 11, 18, 23, 58, 182, 190, 208, 229 and 230. The `S-007` → `S-008` marks are at 83, 97, 106, 116, 122 and 145. I found no unlisted change.
- The failure-15 quotations at S-008.md:11 match decisions/P-003/failure-15.md:4. The spec drops the git-history provenance test as ruled.
- The header names M4, which is in docs/projects/P-003.md:46. The join-up section follows the form in docs/design/JOIN_UP_REVIEW.md.

**Blocking findings**
1. **No join sheet for the adapter (S-008.md:23, 57, 190, 229).** The Builder writes the adapter before any change under `src/`. The locked checks then run that same adapter, unchanged and hash-locked, against the built code. Nothing says what interface the adapter calls or what form it writes out.
   - The built rule takes an injected moment and returns states and flags (AC11, J3). Base-commit code has neither. An adapter written for the old code cannot be known to run on the new code.
   - The only way out is "if the adapter must change, the Reviewer runs it again and replaces the record" (S-008.md:23). That is unbounded, and the Builder is told to wait (S-008.md:229). The spec's own rule, in specs/_TEMPLATE.md:14, is a join sheet for every connection.
   - The same gap leaves the locked checks without a stated output form, even though they are meant to be fixed before any work exists (S-008.md:190). Whether the checks can be written is unverifiable from this spec.
2. **Unproven roles.** The spec makes the Reviewer run code and commit the baseline record with the locked checks (S-008.md:23, 190, 208). Its evidence for that role is docs/projects/P-003.md:87 and :69. Both only say the Reviewer reviews the build and tries to break it. Nothing in the pack gives the Reviewer a run duty or a write lane for the record. S-008.md:208 admits that nothing shows the run used the base commit's `src/`. The Reviewer then reviews the build against a record it made itself.
3. **The adapter makes the baseline weak.** The Builder defines the inputs and outputs the baseline records, and the hash lock only freezes them. A narrow or empty adapter gives a record that AC9 and AC14 to AC17 pass trivially. The spec has no check that the adapter covers each case those criteria name: the three failed reads, a direct link, and a notice.

**Non-blocking**
- S-008.md:18 says AC15's "last two sentences" changed. Only one sentence changed (S-008.md:58); the last is identical to S-007. Correct the wording.
- S-008.md:18 relies on decisions/P-003/criteria-13.md:1, which is a bare "proceed" with no spec named. Whether it approved S-007's criteria is not shown in the record. Confirm it before the scenario card goes to the owner.
- The join-up review is dated 2026-11-08 and carried over unchanged. That is acceptable, since the screens did not change.

**Open questions**
- What entry point and output form do the adapter and the built rule share, and who fixes them: the Check author, the Definer or the Builder?
- Which role has the authority to run the base commit and commit the record, and where is that written?
- Who checks that the adapter covers every case AC9 and AC14 to AC17 name?