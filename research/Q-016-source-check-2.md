# Source check — Q-016 (round 2), verbatim

*The Source checker's return on the revised map, on a different model from the Researcher. Recorded by the orchestrator, session session_01QBwHGLrbUaowxNjhF5oC3A, 2026-11-01.*

Verdict: PASS

All nine of my round-1 findings are fixed in the revised research/Q-016-memo.md. The new I2 line checks out, and the proposed grades are acceptable. Three small fixes are left, none of them blocking. I did not edit any file and filed nothing in library/.

## Round-1 findings, re-checked
1. **Was blocking — the count (now lines 54–88, 203, 239): fixed.**
   - The tables match my count line for line: Oct 25 is 22 (#222–#243), the 8 days total 43 (42 before #264), and the weeks run 27, 28, 54, 121 and 21, about 55 a week.
   - Both methods are given and marked as mine. Line 203 now carries the 21–121 range.
   - I re-ran the API at 23:54Z on Nov 1: still 251 merged up to #264, and #265 still open, not merged. The figures still hold.
2. **#264 timing (line 72): fixed.** The Nov 1 row and the 251 total are marked as holding only from after 23:44:20Z.
3. **Visibility (lines 8–11, 129, 131, 186): fixed.** "May be private" is gone. Service-Desk is now stated as public, graded A from the API record.
4. **B2 (line 31): fixed.** The quote is now cited at :556, and the source is called a carried-forward principle from :553–555, not yet reconfirmed, graded "C, weak".
5. **C2 (lines 38–42): fixed.**
   - :212 is now limited to the V1/V2 figures, and :205–206 is right for the device marks.
   - The weekly committed record (:206–209) is added. It says "the times it was open and … 'didn't need me' marks", which matches the source.
6. **O1 (line 170):** :516 is correct.
7. **K1 (line 147):** the quote now matches the source at :558.
8. **Owner question 5 (line 183): fixed.** It now offers "nothing beyond what you have now", and a matching design trap is at line 205.
9. **I3 (line 135): fixed.** The URL it now redirects to is recorded.

## New or changed claims
10. **I2, line 132, confirmed.** The portfolio repository is described as private at docs/PROJECT.md:208 ("owner's private portfolio repository"), with :209 adding "none of it is published". Grade C is right: this is the project's own description, not an API check. Under my rules I did not check the portfolio's visibility myself, so "still to check; answered by R" stands correctly.
11. **Citations of my round-1 return, confirmed.** research/Q-016-source-check.md exists, and each cited line holds what the map says:
    - :9–37 holds the count.
    - :51 is the visibility finding.
    - :63 is the redirect.
    - :65–68 are the confirmed web quotes.
12. **Grades, acceptable:**
    - **C3, grade A (line 44):** a vendor's own documentation of its own product. I confirmed the quotes word for word earlier.
    - **D count, grade A (line 58)** and **I2 visibility, grade A (line 131):** fine.
    - **E1, grade B, and P1, grade B:** unchanged and fine.

## Remaining fixes (non-blocking)
13. **Line 87:** "Peaks of 36 in one day are well beyond what is readable one change at a time" is a judgement with no source, written as if it were fact. Mark it assumed, with "answered by E".
14. **Line 58:** "subject to the Source checker's own filing" does not apply, because nothing is filed from a groundwork map. Replace it with "confirmed by the Source checker (two methods)".
15. **Line 50, D1:** "known for Service-Desk" is true only for merged pull requests. For waiting ones the map has just one snapshot (one open: #265). Change it to "merged: known for Service-Desk; waiting: one snapshot only; other projects unknown".

## Form
Both shortlists are within limits (8 owner questions, 5 research questions). The owner questions are plain and neutral, and question 5 no longer leans toward building something. Known items are graded and sourced, inferences are labelled, and apart from finding 13 no unknown is dressed as fact. All six ways of keeping up listed in Q-016 are still covered.

Files: /home/user/Service-Desk/research/Q-016-memo.md (checked, not edited); /home/user/Service-Desk/research/Q-016-source-check.md (my round-1 return, cited by the map).
