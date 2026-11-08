Verdict: FAIL

I could not check several things the spec relies on, and some criteria contradict each other or depend on unanswered owner questions. Findings are in order of weight.

1. **AC11 contradicts AC7 and J3.** AC11 says a card's state comes "from the records and the moment alone, whatever was read before" (specs/S-003.md:38). AC7 and J3 make the state depend on whether the dispatch log was read in that read (:30, :62). A read that skipped the log shows the card at once, and the next read holds it again. "Log not read" is a fact about the read, not a record on main.
   - This is the exact thing the owner's ruling forbids (decisions/P-003/stop-5.md:3: "comes only from the records on main").
   - The spec admits the problem in open question 3 (:100) but still freezes AC7 as written.
   - Two reads of the same records can give different states, so the "views and sender agree" claim fails in this case.

2. **The criteria depend on owner answers that are still open.** Open questions 1, 3, 4 and 5 (:98–102) decide the behaviour of AC5, AC7, J1, AC14 and AC15.
   - A spec cannot be frozen with scenarios whose outcome depends on unanswered questions.
   - The header "Acceptance criteria (scenarios; owner-approved)" (:18) has no support. The only approval on file for this spec is decisions/P-003/stop-5.md, which says "re-specify" and approves no criteria. The Design-gate approval in decisions/P-003/dor-4.md covers the plan, not these AC14, AC15 or J1–J5 additions.

3. **The mechanism for AC14 and AC15 is unknown.** The spec says "How the sender keeps that record today is not known" (:80, :64). It also says a fix may be needed in src/notify/**, which "needs the owner's approval" (:64).
   - Yet src/notify/** is already listed under Areas touched (:67), with no approval on file.
   - A criterion whose feasibility is unknown is unverifiable, and the test cannot be written yet.
   - AC15's "opens the card sheet saying the card is waiting, with no answer buttons" adds new behaviour (a new sheet state in J4, a change to the "gone" re-check). The sizing never covered this: research/P-003-sizing-findings.md:67 only flags the "gone" problem.

4. **The size claim is unsupported.** The spec still says "60 to 90 lines, 8 to 12 tests" (:76, :107), taken from the sizing in research/P-003-sizing-findings.md:59–64.
   - That sizing predates the sender memory, the waiting sheet (AC15), the replay at a past moment (AC13) and the five join tests.
   - The 180-line stop rule is likely to trip, and the spec does not address this.

5. **Second-hand evidence I could not check.**
   - reviews/S-003/plan.md is cited for the "gone" behaviour and for the owner-quotation check (:14, :47, :79), but it is not in my folder.
   - notifyview.js:337 and src/** are also not in my folder.
   - I could confirm only that research/P-003-sizing-findings.md:67 says what the spec attributes to it.
   - Under the "unverifiable is a FAIL" rule, these claims fail.

6. **A weak spot in J2.** The rule reads "the first line containing `Recommendation:`" (:51). Any earlier prose line that mentions that string would decide the word. The sizing's real notes (research/P-003-sizing-findings.md:32–39) show the line is usually line 3, but the rule does not require that. Pinning it to a line that starts with `Recommendation:` once the marks are stripped would be safer.

7. **Smaller point.** AC1 says a held card has "no card sheet reachable" (:24), while AC15 and J4 make a waiting sheet reachable from a notice or a direct link. The wording "from those views" nearly reconciles them, but AC1 should say so.

**What checked out**
- The header `milestones: M4` matches docs/projects/P-003.md:44.
- The plan file is the item's own plan.
- The sizing quotations match.
- docs/PROJECT.md:85, :588 and :616 support the facts they are cited for.
- The owner-record quotations match decisions/questions/P-001-card-recommendation.md:17–19.
- The J2 examples agree with the real note forms in the sizing findings (:32–39).
- I did not find a join-up review section in the form docs/design/JOIN_UP_REVIEW.md. The spec's J1–J5 join sheets partly stand in for it, but there is no side-by-side view review.

**Open questions**
- Should a read without the dispatch log hold nothing back, or show cards at once? It cannot be both under the owner's records-only ruling. This needs the owner and a change to plan §1.
- Which mechanism does the sender use today to remember the notices it has sent, and does fixing it need owner approval for src/notify/**? Settle this before freeze, not in the Builder's test.
- Should the size and stop-rule figures be restated for the criteria as they now stand?