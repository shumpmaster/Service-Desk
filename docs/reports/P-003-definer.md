I've written specs/S-008.md as a draft and marked specs/S-007.md superseded. It isn't committed, because this workspace has no git.

**1. What I changed**
- **specs/S-007.md**: on line 3, `frozen` is now `superseded`. Nothing else in the file changed.
- **specs/S-008.md** (new, 231 lines, the same as S-007): it is S-007 with these lines changed, and the note at line 11 lists them:
  - **Lines 1, 3, 4:** the new id, `status: draft` with `frozen_at` set at the freeze gate, and S-007 added to the lineage.
  - **Line 11:** a new "supersedes" note quoting the failure-15 ruling.
  - **Line 18:** says the criteria rest on that ruling and go back to your scenario card for approval.
  - **Line 23 (the actual fix):** the new baseline run.
    - The Builder writes the adapter under tests/desk/ and commits it before any change under src/.
    - The Reviewer, not the Builder, runs it against src/ exactly as it stood at the base commit.
    - The Reviewer commits the output as the baseline record, kept with the locked checks, which the Builder can only read. The record names the base commit and gives a SHA-256 hash of each adapter file it used.
    - If the adapter has to change, the Reviewer re-runs it and replaces the record. The Builder never writes it.
    - Each locked check first confirms the adapter files still match those hashes, then runs the adapter on the built code and compares the result with the record. No check reads the branch's history.
  - **Line 58 (AC15):** the baseline run, not a test, records what the desk opens.
  - **Line 182:** the adapter is named as a test aid.
  - **Line 190:** who makes and keeps the record, with evidence.
  - **Line 208:** the risk of a wrong or altered baseline, rewritten.
  - **Lines 229–230:** the Builder's brief now says to wait for the Reviewer's record before touching src/, and never to write it.
  - **Lines 83, 97, 106, 116, 122, 145:** `S-007/J` → `S-008/J` in the join-test marks.

**2. Why**
Your failure-15 ruling said to fix the baseline run only. The old behaviour must be recorded from unchanged code, by a run the Builder cannot change, and kept with the locked tests. The git-history provenance check goes. The spec must also say who runs the adapter, since the Check author may not see src/. I chose the Reviewer: the plan names them as reviewing the build's code (P-003.md:87, :69). The record is guarded by the locked checks' read-only status plus the adapter hashes. The ruling said to carry everything else unchanged and list every changed line, so the length stays at 231.

**3. What I verified**
- `diff specs/S-007.md specs/S-008.md` changes lines 1, 3–4, 11, 18, 23, 58, 83, 97, 106, 116, 122, 145, 182, 190, 208 and 229–230, which is exactly the list in line 11.
- Comparing S-007 against itself with `superseded` swapped back to `frozen` leaves line 3 as the only difference.
- Both files are 231 lines.
- All 19 `[trace: V6 → …]` marks are still there.
- I checked the new evidence citations against the files I was given: P-003.md lines 67, 69 and 87, the template's line 36, and failure-15.md line 4.

**4. What is undone**
- Nothing is committed: there is no git here, so the branch `build/definer/P-003` and its trailers still need doing.
- The spec still has to go to the Critic, then the freeze gate, then your scenario card. It's a draft because line 23 and AC15 sit in the criteria section.

**5. What's needed from other roles**
- The Reviewer needs permission to commit the record file into the locked-checks path for this item. If their lane doesn't allow that, the Orchestrator would have to commit the file the Reviewer returns.
- The Check author must write the locked checks so they read that record and check the adapter hashes it lists.
- Whoever schedules Build has to put the Reviewer's run between the adapter commit and the first change under src/.

**6. Open questions**
- Is the Reviewer the right person to run the adapter, rather than the Orchestrator script? Nothing in my folder says what the Orchestrator can run.
- What remains on trust is that the Reviewer really ran the adapter against the base commit's src/. No check can show that; the spec says so openly in Risks (line 208).