I wrote the draft spec S-005 and marked S-004 superseded. Two of the owner's latest instructions could not be fully met from this folder: the join-up review form file and a source for the tests folder are both missing (part 5). Nothing was frozen, run or committed.

**1. What I changed**
- **`specs/S-005.md` (new, draft):** it covers M4, traces every criterion to V6 (AC1–AC19), has join sheets J1–J6 with tests marked `join-test: S-005/J<n>`, and lists the areas touched as before. Changes from S-004:
  - **AC7** now uses the plan's narrow reading: a card shows at once only when it was raised before the part of the dispatch log the desk reads. It says why: a new card's log entry lands on the main branch with its card file.
  - **Removed as a result:** the case of a card file arriving before its log entry, from J3, J6 and AC13. AC13's test now has two sample cards instead of three.
  - **The "rare" risk** (a notice opening to a card that has left the list) now names the only two cases it can happen in, and says why.
  - **Join-up section** rewritten, with a note that its form is my own.
  - **Citations:** every reference to an earlier review round is gone, and so are research file line numbers. Each fact now cites a file in this folder, or names the plan or the project document as citing it.
  - **Trimmed:** the long revision-history paragraphs are replaced by one short "Supersedes" note.
- **`specs/S-004.md`:** only the status word changed, to `superseded`. One correction to the brief: that word was `draft`, not `frozen` (it was never frozen; `frozen_at: —`). S-002 and S-003 went from draft to superseded the same way.

**2. Why**
The owner's latest ruling, `decisions/P-003/stop-7.md` ("criteria-wrong"), asks for exactly these changes. The earlier ruling in `stop-5.md` still holds: the weekly value check, its reports and the end-of-year card stay with the Chief of Staff, not in this spec.

**3. What I verified** (search tool only; there was no shell, so no `wc` or diff)
- S-005 has no mentions of `reviews/`, `research/`, `S-004/J`, "plan review" or "rare".
- 19 trace tags were found, AC1 to AC19.
- S-004 and S-005 both have 196 non-empty lines. I couldn't measure character counts. I expect S-005 is shorter, since the revision paragraphs are gone, but "not grown" is not confirmed by a count.
- Each `docs/PROJECT.md` line I cite (85, 121, 125, 127, 540, 588, 616) says what I use it for. The grades of the four library entries are A, B, B and B, as cited.
- The status lines read: S-004 superseded, S-005 draft.

**4. What is undone**
- The Critic's plan review, the freeze and the owner's scenario card have not happened. S-005 shows `frozen_at: —`.
- No commit was made, since this folder is not a git repository.

**5. Needed outside my lane**
- **`docs/design/JOIN_UP_REVIEW.md` is not in my pack.** The owner asked for the join-up section in that file's form, but I couldn't see it, so the form I used is my own and is labelled as such (open question 7). Add the file to my pack, or have the Critic check the section against it.
- **The `tests/desk/` folder has no source here** apart from S-004 itself. The Builder should confirm it; if the tests live elsewhere, that path goes in before freeze.

**6. Open questions**
- **For the owner** (none blocks freeze): the same six as in S-004. Question 2 is reworded to cover only a skewed or malformed raise time.
- **For the Critic:** the join-up form (question 7).
- **On AC7:** the rule cannot tell from the records why a card's log entry is missing, so AC7 relies on your statement that a new card's entry lands with its card file. This is listed as a known limit in the spec.