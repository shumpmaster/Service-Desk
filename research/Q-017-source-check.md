Verdict: FAIL

I filed nothing in `library/`. The earlier round's blockers were the 22-entry truncation and the single-record problem. I cleared the truncation, but the single-record problem remains, so no entry meets the two-independent-sources rule.

**What I confirmed this round**
All of these came through the fetch tool, so they are grade B.
- **#161 body (memo lines 28, 64, 119):** `pulls/161` contains "Nothing failed or was skipped in this pull request." It is followed by "It marks M3A … as reached today". `created_at` is 2026-10-20T14:32:43Z, `merged_at` is 14:43:33Z, and the head is `612cf90b…`. This matches the memo.
- **#161 runs (memo line 64):** `actions/runs?head_sha=612cf90b…` returns total_count 5. The push `governance` run 39440152795 concluded failure at 14:32:27Z. The four pull_request runs succeeded, and `desk-notify-ready` started at 14:43:36Z, after the merge. This matches the memo exactly.
- **#239 commit 16e1389 (memo lines 95–99):** `pulls/239/commits?per_page=10&page=3` returned 10 entries, so the truncation did not recur at that page size.
  - It includes `16e1389e7640407ca7601c0fb7c1090807399447`, "Rewrite round 2's locked case about projects the desk can't draw whose read fails", at 2026-10-25T17:13:08Z.
  - Its neighbours are 8446e28 (17:12:51Z) and 3b582a3 (17:15:34Z).
  - The fetch tool listed the page newest-first, so 16e1389 shows as item 4 rather than the memo's item 7. That is consistent with the memo's entry 27 if the order is reversed. The position depends on how the extraction ordered the page, so I treat it as unreliable.

**Why this is a FAIL**
1. **Independence (memo lines 16 and 184).** The memo says every fact rests on one GitHub record, and I found the same. Reopening the record or reading another view of it checks the extraction, not the record. The rule requires two independent sources for load-bearing facts, so no entry passes. The memo asks the owner for a ruling on this standard. That is outside my lane, and I cannot waive the rule.
2. **Entries I did not re-open:** F-pr-desc-01a (the #31 diff and `orchestrator` run), 01b (the #5 half), 01c, 01e, 01f, 02, F-gh-api-01a, F-gh-api-01b, and the three patterns. Memo line 180 says the #31 diff, #135, #175, #213 and #252 were not re-opened. I did not re-open them either. They are unconfirmed.
3. **Rule binding dates (memo lines 37–45).** These are inferred (grade C) because the model repo is private. The "0 of 15 sections missing" count and the "required on its date" judgement depend on them.
4. **P-fetch-two-views-01.** It rests only on observations of the extraction's own errors. It has no independent evidence and cannot be filed as a pattern.
5. **F-pr-desc-01d.** The commit exists and the page sizes add up. The claim "round 1 only" is the memo's own estimate (C), and the meaning of "two of them forced and named" is still open. It is not fileable as a fact.
6. **Absence findings.** The memo grades the #239 body search "could not be determined" (lines 52, 144). I agree.

**Open questions**
- Will the owner or Chief of Staff rule that "the primary record, opened twice" meets the evidence standard for facts about a single GitHub record? If not, no entry here can pass without a different kind of source, such as raw output from an authenticated `gh` or GraphQL call.
- Can the model repo's version dates be read, to turn the grade-C rule binding dates into facts?
- What does "two of them forced and named (AC80, AC89, AC91)" mean? What does #44's "5 Builder commits (`Spec: S-001`)" count?
- Six partial diffs, #148, edit timing, and whether checks were required before merging are still unchecked.