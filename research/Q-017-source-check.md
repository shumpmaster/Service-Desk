Verdict: FAIL

I re-opened four of the memo's sources through the fetch tool, so everything below is grade B. The memo is not a groundwork map, so each entry has to pass on its own. Nothing passes with two independent confirmations, so I filed nothing in `library/`.

**Confirmed this round**
- **#239 body (memo lines 67, 115, 162).**
  - `pulls/239` reads "Nine locked cases rewritten, each in its own commit, two of them forced and named (AC80, AC89, AC91)".
  - It shows 41 commits and `created_at` 2026-10-25T19:40:48Z.
  - This matches the quote in the memo.
- **#239 round-1 commits (memo line 92).**
  - The `pulls/239/commits` view lists nine "Rewrite" commits before `cc76993`: e0015bd, 585cb35, ac47f6d, e25c44a, b9929fb, 50b89e0, a8d64b9, 69ec664 and f554f7a.
  - The last two end "(forced; not named in G8d's row)".
  - That matches the memo's round-1 list.
- **#5 run (memo line 63).**
  - Run 36853760813 is `governance`, event pull_request, conclusion failure, head `d7d0749f8bc7d959e35ed3af94bb635cce31211f`.
  - It ran 11:11:02–11:11:26Z, which matches the memo's times. The date is 2026-10-01, which the memo omits.
- **#5 PR (memo lines 63, 90).**
  - `pulls/5` has `created_at` 11:10:58Z and `merged_at` 11:28:14Z.
  - The body has "governance/checks/check_all.sh . origin/main passed; surface_guard OK".
  - The memo's quote drops the `governance/checks/` path prefix, so it is not word for word.

**Not confirmed**
1. **F-pr-desc-01d.**
   - The commit list I fetched cut off after 22 entries (`d968b1e`). The memo's own method notes (lines 51–53) say the same truncation happened before.
   - So I could not see `16e1389`, its message, or its 17:13:08Z time.
   - The tenth "Rewrite" commit, and the claim that the count line leaves out round 3's rewrite, are unconfirmed.
   - The earlier check (`research/Q-017-source-check.md` lines 13–16) also found the "forced" wording ambiguous. The memo withdrew the "short by one" claim.
2. **F-pr-desc-01a, 01b, 01c, 01e, 01f, 02, F-gh-api-01a, F-gh-api-01b and the three patterns.**
   - I did not independently re-open the #31 or #161 run records, #44 and its commits, the HTML "edited" markers, or the 14 bodies behind 01c.
   - For 01b, only the #5 half has a second opening, and it has no second source.
   - The #161 half of 01b has none.
3. **Rule binding dates (memo lines 41–45).** They are inferred (grade C) because the model repo is private.
4. **Load-bearing facts need two independent sources.** The memo itself says two views of one GitHub record are not independent (line 12). Each entry has only that one record.
5. **Pattern entries.** P-fetch-two-views-01 rests on the extraction miscounting its own lists. That is the memo's own observation, and I just saw the same truncation again.

**Open questions**
- Can authenticated `gh` or GraphQL be used to settle the commit list (the truncation is the blocker) and the raw body text?
- What does "two of them forced and named (AC80, AC89, AC91)" mean?
- Can the model repo's version dates be read?
- The memo's own gaps remain: six partial diffs, #148, edit timing, and whether checks were required before merging.