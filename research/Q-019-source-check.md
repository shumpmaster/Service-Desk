Verdict: FAIL

I filed no library entries. The memo's code facts rest on one primary source each, and the line numbers it does give don't hold up when I reopen them.

**Findings**

1. **The memo's line numbers for `seen.js` don't match my read.**
   - The memo (L88, L309–311) says `seen.js` was read in full and has 97 lines. It puts the header at L1–L5 and the constants at L7–L9.
   - My read of the same raw file at e6dd6b8 put the header at L1–3 and the constants at L5–7. It gave a total of 89 lines.
   - The quoted text, `SEEN_KEY`, `SEEN_MIN_MS` and `MARKERS_OFF` all match. The numbers do not.
   - Both reads went through a summarising fetch. So neither count can be trusted, and the memo's claim that the count matches GitHub's header can't be confirmed.
   - F-desk-seen-01 cites `seen.js#L1-L9` and "also L59–L88" (memo L374). Those citations stay unverified.

2. **`status/merges.jsonl` is confirmed.**
   - This is memo L262–266 and F-desk-records-01.
   - I found 10 lines, with items Q-001, Q-004, Q-002, Q-005, Q-006, Q-008, Q-007, Q-011, Q-013 and Q-016. The merge SHA prefixes and `"spec": null` match.
   - This is one source. The "none of sample A's SHAs appear" claim also needs the PR merge SHAs. I did not reopen those.

3. **There are no verified line numbers for the large files.**
   - `research/Q-019.md` L11 and L32 require citations by file and line.
   - The memo's own L88–89 and L324 admit that `records.js`, `github.js`, `model.js`, `home.js`, `feed.js`, `sandbox.js`, `pulls.js`, `waiting.js`, `words.mjs`, `scheduler.js` and `sender.mjs` have only grep strings.
   - The brief says an unverifiable claim is a FAIL. Finding 1 also shows that even the "matched" line counts can't be reproduced.

4. **There are no two independent sources for the load-bearing code facts.**
   - Memo L99 and §4 say so directly. The code at e6dd6b8 is the only primary source.
   - The PR pages and GitHub searches corroborate only indirectly. PR #180, for example, is silent on where the mark is stored (memo L316, L376).
   - F-desk-pr-01, F-desk-pr-02, F-desk-notify-01 and F-desk-seen-01 all depend on these facts.

5. **Several claims remain estimates (grade C) and stay out of the library.**
   - These include the CI line on the sheet, "merged changes are not notified" (§6), the unread `reviews/<milestone>/` folders, no direct commits shown, and the label count (memo L259).
   - The label search returned 265 pull requests with and without the filter, so it proves nothing (memo L16, L49).
   - F-desk-records-01 includes the labels and milestone sample counts. Its inclusion of an unproven part makes it unfileable as written.

6. **Samples were not rechecked.**
   - The sample counts (6/11, 5/11, 4/11 and 0/10), the `reviews/<n>/` counts and the 16-versus-0 search are all the Researcher's own reads. I did not verify them this round.
   - The memo itself (§4) says no one but the Researcher has checked sample A.

7. **Entry status.** F-desk-pr-01, F-desk-pr-02, F-desk-notify-01, F-desk-seen-01 and F-desk-records-01 are not filed.

**Open questions**
1. Can someone with a shell run `grep -n` at e6dd6b8 on the large files and on `seen.js`? The two summarised counts for `seen.js` (97 and 89) disagree, so only a shell can settle it.
2. Will the Orchestrator accept function names plus quoted strings in place of line numbers, and will it accept the code plus GitHub's server counts as "two sources"? The memo asks this at §5. If not, depth 3 can't be met through fetch alone.
3. Is Personal-Org-Operating-Model private? It returns 404, and S-032 versus S-033 stays open.
4. Should the sample-B and sample-A questions (memo §6, questions 2 and 3) be settled before any sample count is filed?