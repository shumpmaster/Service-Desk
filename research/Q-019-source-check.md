Verdict: FAIL

I filed no library entries. The memo says in its own first line (`research/Q-019-memo.md` L1) that Q-019 can't be filed at depth 3, and my reads agree. Nothing in the Q-019 memo is graded A, and the brief says an unverifiable claim is a FAIL.

**Confirmed this round**
- **`seen.js` at e6dd6b8** (memo §9, L302–L308; F-desk-seen-01 and -02).
  - I fetched the raw file and asked for the whole file with line numbers. It came back as 97 lines, which matches the header figure in memo L317.
  - The header comment is on L1–L5, and the constants `SEEN_KEY`, `SEEN_MIN_MS` and `MARKERS_OFF` are on L7–L9.
  - `createSeen` is on L16 and `let held` on L27.
  - The `hold(on)` block starts at L49, with its comment on L49–L52, and the `held` getter is on L56–L58.
  - `hidden()` is on L59–L73.
  - `markSeen()` and its comment run L74–L88.
  - These agree with the memo's derived ranges (L1–L23, L1–L26, L27, L46–L66 and L74–L88). There is no 7-day constant in the file.
  - This was still a summarising fetch. I did not run `wc -l` or `grep -n`, and the file content comes from the same single source as the memo's. The earlier round's read of 89 lines is not settled either.
  - The commit hunk headers and add/delete counts (memo L320–L325) were not re-opened this round. F-desk-seen-01 and -02 therefore have no independent confirmation.
- **Earlier rounds** (`research/Q-019-source-check.md` L6–L8). `status/merges.jsonl` L1–L10 (10 lines, `spec` null), the #258 merge SHA and the `is:pr no:label` total of 265 were confirmed. I did not re-open them.

**Not confirmed, so these stay out**
1. **F-desk-seen-01 and -02.**
   - Only one source reads the file text, and it is a summariser.
   - The commit-side numbers weren't re-opened.
   - "Two independent sources for load-bearing facts" isn't met.
   - Seen-01's claim that `createSeen` is "at or above L23" is weaker than what the full read shows, which is L16.
2. **F-desk-pr-01, F-desk-pr-02, F-desk-notify-01 and F-desk-since-01** (memo L422–L477). They are cited by function and search string, with no line numbers. Q-019.md L11 and L32 require file and lines, and the memo (L355) agrees these are held. I did not open them.
3. **F-desk-records-01b** (memo L407–L419). I did not open the other nine merge SHAs, dispatch-log/2026-11.jsonl or the milestones page.
4. **F-desk-records-02.** The sample counts are the Researcher's own reads. The sample definitions are also still open (memo L60–L61).
5. **F-desk-records-01a.** The merges.jsonl part was confirmed earlier. The label part (`is:pr` 265 and the `label:needs-you` control of 8) was not re-run, so the entry isn't filed. The whole entry should be re-confirmed in one pass.
6. **Grade-B provenance.** Every B rests on a summarising read. The memo's precedent is entries filed at A (F-wcag22-01, F-platform-targets-contrast-01, F-webpush-08), but those were matched against the wording. I couldn't check that here.

**Open questions**
1. Can someone with a shell run `wc -l`, `sed -n '74,88p'` and `grep -n` for each quoted string at e6dd6b8? That would settle seen.js and the large-file entries.
2. Will the Orchestrator accept function name plus quoted string in place of line numbers, accept GitHub hunk headers as line evidence, and count "code plus GitHub server" as two sources?
3. Is Personal-Org-Operating-Model private? It returns 404. Also, is the milestone rule from S-032 or S-033?
4. Should the sample A and B definitions be settled before any sample count is filed?
5. If seen.js is to be filed, should the source-checker re-open the four commit URLs next round, or only the shell route?