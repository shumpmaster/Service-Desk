Verdict: FAIL

I filed no library entries. The memo gives no file and line citations, so I could not confirm the claims to the brief's standard. I read the sources through the same kind of summarising fetch the Researcher used, so my reads are as soft as theirs.

**Findings**

1. **No file and line citations.**
   - `research/Q-019.md` L11 requires "which file and lines show it", and L32 sets depth 3 as "cited by file and line".
   - The memo says it gives none (memo L84, §2 of the return).
   - I tried to supply them. My fetch of `src/lib/records.js` at e6dd6b8 returned `ITEM_BRANCH_RE` at "line 897" and `classifyPull` at "lines 900–910".
   - I cannot rely on those numbers. The memo records that the same kind of fetch gave line 868 and also 1,135 earlier newlines for the same function (memo L45).
   - The line numbers stay unverified.

2. **The text of `classifyPull` is confirmed.**
   - `src/lib/records.js`, `classifyPull`, matches memo L109–114:
     - A draft returns `flagged: false`, with the reason `'draft'`.
     - A base other than `project.defaultBranch` returns `flagged: false`.
     - In a v3 project, a same-repository head matching `^item/…` returns `flagged: false`.
     - Anything else returns `flagged: true, why: 'waiting on your review or merge'`.
   - The wording and the regex are as the memo quotes them. This is one source only.

3. **PR #180 matches the memo.**
   - The description mentions "Since you last looked" with "Mark as seen", and the 7-day bound.
   - It does not say where the mark is stored (memo L293).
   - So F-desk-seen-01's second source corroborates the feature only, not the storage claim. That claim rests on `seen.js` alone, which I did not reopen.

4. **No two independent sources for any load-bearing fact.**
   - Every code fact rests on one repository at one commit, read through one summariser (memo L93).
   - The memo says plainly that PR pages are corroboration and not a second primary source.
   - The duty is two independent sources for load-bearing facts.

5. **Sources not reopened this round.**
   - These files: `github.js`, `model.js`, `home.js`, `feed.js`, `sandbox.js`, `pulls.js`, `prfiles.js`, `scheduler.js`, `seen.js`, `words.mjs`, `waiting.js`, `sender.mjs`, `merges.jsonl`, `dispatch-log/2026-11.jsonl`, `reviews/`.
   - Also the PR pages other than #180. I did not check the sample counts for these samples:
     - 6/11 and 5/11 for `Milestone:`.
     - 4/11 for the spec id.
     - The `reviews/<n>/` counts.
     - 8/10 for Q-ids.
     - Sample B at 0/10.
   - F-desk-pr-02 and F-desk-records-01 depend on all of these. They stay unconfirmed, so neither can be filed.

6. **Estimates are not fileable.**
   - Several claims are graded C: the CI line on the sheet (L123), the claim that no merges are notified (L222–225), and the claim that no merge SHA is in `merges.jsonl` (L234, L262).
   - The Researcher has withdrawn F-desk-notify-02. The remaining C items are labelled as estimates and stay out of the library.

7. **Parts the memo leaves unanswered (memo §0, return §4).**
   - Model-Lab's sender and the ` · sprints:` contents are out of bounds, which the memo handles correctly.
   - Personal-Org-Operating-Model returns 404, so S-032 against S-033 is unresolved.
   - Where the 7-day bound lives in the code, and whether the PR cursor carries between polls, are not established.

**Entry status**
- F-desk-pr-01: its text matches the source, but there is no second source and no verified lines. Not filed.
- F-desk-pr-02, F-desk-notify-01, F-desk-seen-01, F-desk-records-01: not enough checked. Not filed.
- F-desk-notify-02: withdrawn. Not filed.

**Open questions**
1. Can someone with a shell run `grep -n` on the raw files at e6dd6b8? That would give real line numbers and an independent read. It would also settle the negative claims (`grep -c` for merged/mergedAt in `sender.mjs`, and for the ten SHAs in `merges.jsonl`).
2. Is Personal-Org-Operating-Model private? If so, S-032 against S-033 cannot be settled from this pack.
3. Will the Orchestrator accept function-name and quoted-text citations in place of line numbers? If not, depth 3 cannot be met through fetch alone.
4. Where does the "7-day bound" from PR #180 sit in the code?