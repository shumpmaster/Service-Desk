# V6's count on past records, before the Launch gate (P-003, Launch-4)

The Chief of Staff's one run of the weekly V6 count on past records (docs/projects/P-003.md section 6), made on
2026-11-22 by session_01QBwHGKtgD8HDSTUVrwvdSi, before the card fix goes live.

- **What was counted:** every decision card (`dor-fail`, `stop` or `failure`) that ever reached the main branch's
  first-parent history, up to main at 3a6613a (2026-11-22T20:32:08Z), with the moments ending at 2026-11-22T21:02:52Z:
  39 cards, the first arriving 2026-10-01T02:22Z.
- **How:** the two figures of docs/handover/P-003/operating-notes.md ("J6's check moments and the two figures"), each
  check moment run with the rule as built (src/lib/model.js at 3a6613a) on the records of the main-line commit current
  then, by `count.mjs` here (`node intake/v6/count.mjs 3a6613a 2026-11-22T21:02:52Z`, from the repository root, with
  the main branch's full history). It reads each commit's records through the sender's own reader,
  `openCheckout` and `readRecords`, given that commit as HEAD instead of a detached worktree; at two moments
  (2026-11-12T06:00Z and 2026-11-04T21:00Z) the two ways gave the same output byte for byte, and both listed young
  cards as `held`. A card's check moments before its file reached the main branch are skipped.
- **Result** (`2026-11-22-past-records.json`): V6 held-too-long misses 0 of 39; cards held a day after reaching the
  main branch 0; failed reads 0. As the operating notes say, the rule as built never holds a card past its day, so 0
  is the expected figure: the run shows the count working, not V6's result, which starts when the fix is live.
- **Recorded** in intake/value-checks.jsonl with state `not measured` and no value, since V6's window has not begun.
