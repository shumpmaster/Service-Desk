Verdict: PASS

I checked `docs/projects/P-003.md` Part 1 against the definition of ready. It passes, with one limit on what I could check, noted under Open questions.

**Section 3 (milestones)**
- **Project milestone:** line 44 is the only one. Its name, "Every decision card shows the Chief of Staff's recommendation, or says it has none (M4)", states what is achieved, not a task. Its "done when" describes states reached: the card waits, then shows with the button marked, or shows after a day with the "No Chief of Staff recommendation yet" mark. The phase is Build and there is no `· for:`, as S-035 requires for a plan of its own. The `· why:` is plain, names the records, and has no ` · ` inside it.
- **Standard lines, Discovery:** lines 48–55 cover Discovery-1 to 8, each as `taken on` or `skipped` with a why.
- **Standard lines, Design:** lines 56–61 cover Design-1 to 6, each with a why.
- **Match with the owner's ruling:** 11 are taken on and 3 skipped (Discovery-3, Discovery-4, Design-3). That matches `decisions/questions/P-003-standard-lines.md`, line 1, and its line 13 records the owner's answer.
- **Skipped lines:** each why says why the project can do without it (lines 50, 51, 58).

**Section 9 (target user)**
- Line 119 reads `The owner is the user.` Nothing else in the brief contradicts it. The fix changes only the owner's own desk (sections 1, 4 and 5), and no outside users are named.

**Plan place (S-035)**
- The plan is `docs/projects/P-003.md`, in the owner's own-plan form per `decisions/questions/P-003-plan-place.md`.
- It borrows nothing from `docs/PROJECT.md`. Its own measure is V6, and it has no `· for:` tag.

**Claims and citations**
- **Section 2, the twice-overridden recommendation:** `decisions/Q-019/stop-1.md` and `decisions/Q-017/stop-2.md` both read "Decision: re-specify". `research/P-003-sizing-findings.md`, section 4, quotes both notes as `Recommendation: drop` on line 3. The claim is supported.
- **Section 2, notes never read:** the sizing findings, section 2 (`records.js:34-36`, `recordKind`), say the desk never reads a notes file.
- **Section 7, size:** the 60–90 lines, 8–12 tests and five files match the findings' sections 5 and 7.
- **Section 7, added rules:** the claim that the helper's reading added three rules and one missed place matches the findings' sections 3, 4 and 7.
- **Section 7, independence:** the plan admits the reading was briefed from draft 1, so it is not independent.
- **Intent quotes:** the three owner quotes match `decisions/questions/P-001-card-recommendation.md`, lines 17–19.

**Consistency (section 8)**
- Every held card shows within a day, or at once when its raise time is unrecorded, so none stays hidden for good.
- V6 and M4 agree, and the plan says why V6 starts only when the fix goes live.
- Design-5 and the Build gate review agree.

**Open questions**
- The notes files themselves (`decisions/Q-019/stop-1-notes.md` and the like) are not in my pack. I verified the "notes recommended `drop`" claim only through the helper's verbatim quotes in the findings file, which is what the plan cites.
- I did not review the dry-run record `reviews/P-003-dor-dry-run/…`. The card `decisions/P-003/dor-fail-2.md` cites it, and it is not in my pack.