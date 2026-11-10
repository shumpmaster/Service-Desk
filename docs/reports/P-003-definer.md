I revised `specs/S-006.md`. The plan review's main finding was that the "word for word from S-005" claim couldn't be checked, but S-005 is in my pack. I compared the two specs line by line and the claim holds. The reviewer's own pack didn't have S-005, so the reviewer needs it before re-reading.

**1. What I changed** (in `specs/S-006.md` only; it is still 232 lines, so nothing grew)
- **Line 11, the supersedes note.** It used to make a bare claim that everything was S-005's word for word. It now lists exactly what differs from `specs/S-005.md`: the id on line 1, the status on line 3, the lineage on line 4, the note itself, and `S-005` → `S-006` at lines 83, 97, 106, 116, 122, 145, 229 and 230. It also names the one risk change below. It sets out the approval chain from the records:
  - `criteria-8.md` sent S-005 back with "change no criterion".
  - `criteria-9.md` then says "proceed", but names no text.
  - `stop-11.md` calls S-005's criteria "not wrong" and carries them into this spec unchanged.
- **The stop-rule risk under Risks.** It is now "The build stopping early, carried to the Build gate". It covers both early-stop routes the review raised: the test estimate (15 to 23) is close to the limit of 24, and AC9 and AC14 to AC17 rest on baseline runs whose source code isn't in the pack, which could hit the `src/notify/**` boundary at J5.

**2. Why**
- **Finding 1 (blocking):** the claim needed evidence a reader can check. stop-11 allows only "the id, the supersedes line and anything the plan review requires", and both edits stay inside that.
- **Findings 2 and 3:** the review called these disclosed limits and asked for them to be carried to the gate. So I extended the existing risk line rather than adding new material, since stop-11 and stop-7 both say "Do not grow it."

**3. What I verified** (I had no shell, so there was no `diff` command)
- I read both specs in full and compared them line by line. Both are 232 lines, and lines 13 to 228 match apart from the S-005/S-006 join-test marks.
- A search for `S-00[0-9]` in both files: every id difference is at lines 1, 4, 11, 83, 97, 106, 116, 122, 145, 229 and 230. Line 188's `S-004` is the same in both.
- I re-read every decision record. `criteria-8.md:1-4` and `stop-11.md:1-3` say what the new note quotes.
- No criterion, join sheet, fact or open question was edited. The line count is unchanged.

**4. What is undone**
- The spec is not frozen. It needs the Critic's plan review again, then the freeze gate.
- Findings 2 and 3 are only carried to the gate, not settled. They can't be settled until Build: the source code and the sizing memo aren't in my pack.

**5. Needed outside my lane**
- **Orchestrator:** put `specs/S-005.md` in the Critic's pack for the re-review. Otherwise finding 1 will fail again for the same reason. A recorded diff of the two specs from a tool would be a stronger check than my line-by-line reading.

**6. Open questions**
- `criteria-9.md` says only "proceed" and names no spec. Could the Orchestrator or the owner confirm it was the ruling on S-005's criteria? The order of the records supports this, but no record says it.
- AC16 (whether one unreadable notes file should hide every decision card) is already the spec's open question 3. It doesn't block the freeze.
- The reviewer asked whether J6's first-parent history and committer-time rules give the right answer on a real main-branch history. That can only be checked in Build, against real history.