Verdict: FAIL

I tried to refute the spec and found three defects in the text and one gap in what EXP-001 measures. The spec also says itself that it cannot be frozen yet. I checked the cited library facts for F-cf-workers-03, F-cf-workers-05 and Q-004-facts. I did not open every cited file.

**Findings**

1. **AC19's two-device figure is wrong, and the spec's conclusion from it is false.** The text is at specs/S-001.md:352-354.
   - The two-devices case is stated as "about 10,600". By the spec's own assumptions it is 2×4,800 + 200 + 300 = 10,300, or 10,100 if cold loads aren't doubled.
   - It then says this "passes the 10,000 margin". Any of those figures is above 10,000, so it fails the margin the spec set itself.
   - AC19 (line 146-150) and A1 count two devices twice. The spec's own margin is therefore not met by the case it says it handles.
   - The "no Error 1027" conclusion still holds, because the Free limit is 100,000 (F-cf-workers-05:8, confirmed). The AC19 figures and the assumption text have to be corrected or the margin restated.

2. **J4's "latest file by name is the current plan" breaks for the same-minute rule.** The text is at S-001.md:230-232.
   - The second plan in a minute is named `…T0930Z-2.md`.
   - Compared as plain strings, `-` (0x2D) sorts before `.` (0x2E), so `T0930Z-2.md` sorts before `T0930Z.md`.
   - The first plan would therefore be read as the latest, which gives the wrong current plan in AC13. The naming or the ordering rule needs to change, for example a zero-padded suffix that sorts after, and be tested.

3. **J9 is incomplete and the spec says so (S-001.md:299).** Its source side has no path, sample or field rule for the status, sprint and dispatch-log files. AC6 (headline, sprint), AC12 and AC4's retry detection depend on those rules, so they can't be checked as written. The spec is honest about this, but it fails the definition of ready ("clear and consistent", governance/standards/definition-of-ready.md:17). It cannot be frozen until the samples are quoted.

4. **EXP-001 (S-001.md:407-416) leaves out the Access check.**
   - J8 requires the function to verify the Access token's signature on every request (F-auth-04).
   - The throwaway batch measures only the GitHub batch and does not include this step.
   - The 10 ms CPU pass bar (F-cf-workers-01:8) could pass in the experiment and fail in production.
   - A p95 from 20 samples is effectively the maximum, so the pass bar is weak as stated.

5. **A3 and A4 (S-001.md:348-351) don't match J1's cost model.**
   - Lines 364-369 say a cold load needs 30 to 120 requests per project, which is 1 to 4 batches.
   - The "3 more batched calls" on a changed head is unexplained.
   - The effect on the total is small, but the assumptions should reconcile.

**Open questions**
- Is a queue card file kept after it is answered? AC14 needs a card's raised time and AC5 needs open versus answered. The only evidence is queue/Q-003-failure-1.md (PROJECT.md:507). If cards are deleted on answer, J2 shows them as "withdrawn" and AC14 loses the raised time.
- Does a read that returns "unchanged" (J6) count as a successful read for the 3-minute "Quiet" rule in AC3? The spec doesn't say.
- docs/PROJECT.md:206 says "O5, closed", while lines 228 and 415 say it is open into Define. The spec follows the open reading. The brief should be made consistent.
- Owner questions 1 to 6 (S-001.md:463-482) are still unanswered. Question 6 is the same blocker as finding 3.
