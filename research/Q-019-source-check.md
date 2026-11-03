Verdict: FAIL

I filed no library entries. The memo itself (`research/Q-019-memo.md` L1) says Q-019 can't be filed at depth 3. My reads agree with that, and the earlier blockers still stand.

**Confirmed this round**
- **`status/merges.jsonl`:** I opened it at e6dd6b8. It has 10 lines, items Q-001, Q-004, Q-002, Q-005, Q-006, Q-008, Q-007, Q-011, Q-013 and Q-016. The merge prefixes match memo L259 and `spec` is null on every line (memo L258–L259).
- **Merge SHA for #258:** the pulls API gives `fa50572f…`, which matches memo L264. I opened only #258 myself.
- **Label search:** `is:pr no:label` gives total_count 265 with `incomplete_results` false, as in memo L254. I did not re-run the control searches or the `is:pr` total.

**Not confirmed, so these stay out**
1. **`seen.js` line numbers** (memo L311–L322, F-desk-seen-01 sources).
   - The 97 lines and the L74–L88 position come from the memo's own derivation in §9a. That derivation rests on a summariser's reading of the hunk headers. I can't reproduce them with a fetch that summarises.
   - The earlier round's read gave 89 lines, not 97. I have no way to settle this without a shell.
2. **Large-file facts.** F-desk-pr-01, F-desk-pr-02 and F-desk-notify-01 cite `records.js`, `github.js`, `model.js`, `home.js`, `feed.js`, `sandbox.js`, `waiting.js`, `words.mjs` and `sender.mjs` by grep string only (memo L47, L87). Q-019.md L11 and L32 require file and lines. I can't confirm the quoted strings without `grep -n`.
3. **No second independent source** for any code fact (memo L97 and §4). Commit diffs of the same code are not independent. The Orchestrator hasn't ruled on this (memo §5).
4. **Estimates (grade C) are still inside the proposed entries.** Examples: "merged changes are not notified" (memo L235–L239), no CI on the sheet, no direct commits shown, and the unread `reviews/<M…>/` folders.
5. **F-desk-records-01** is partly confirmed (merges.jsonl, labels). It still depends on the dispatch-log (15 lines, no PR field), the milestones page, and the other nine merge SHAs, which I did not open, so it is not filed.
6. **Samples** (F-desk-records-02) are the Researcher's own reads. Nobody else has checked them (memo L279).
7. **Provenance of "B" grades.** The memo grades its summariser-read quotes B, but each was read through a summarising model, not a word-for-word copy.

**Not filed:** F-desk-pr-01, F-desk-pr-02, F-desk-notify-01, F-desk-seen-01, F-desk-records-01 and F-desk-records-02.

**Open questions**
1. Can someone with a shell run `grep -n` for each quoted string and `wc -l src/lib/seen.js` at e6dd6b8? Only a shell can settle it.
2. Will the Orchestrator accept function names plus quoted strings in place of line numbers? Will it count "the code plus GitHub's server" as two sources? Without that ruling, depth 3 can't be met through fetch alone.
3. Is Personal-Org-Operating-Model private? It returns 404, and S-032 versus S-033 is still unresolved.
4. Should the sample-A and sample-B definitions (memo §6, questions 2 and 3) be settled before any sample count is filed?