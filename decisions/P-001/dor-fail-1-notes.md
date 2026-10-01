# Chief of Staff's notes — P-001 dor-fail-1

**Recommendation: `resubmit`, after the two fix PRs merge.** Not before: the next check reads
docs/PROJECT.md and the pack rules from main at dispatch.

The Critic's return (reviews/P-001/_critic-dor.md on item/P-001) failed the brief on four findings.
What each needs:

1. **The evidence wasn't in the pack.** Partly the pack: it lacked the definition of ready, which
   the Critic's card allows. The pack PR adds it, and only it (R3: it needs the reviewer's and your
   review records). Widening the pack to research/ and decisions/ failed review: it goes beyond the
   Critic's card, and decisions/ can carry my own reasoning. So the brief now rests only on library
   entries, which the Critic does see. Each entry's opened-by line shows the Source checker filed
   it. The two Operations-Hub rows are marked observed (C) and not load-bearing.
2. **U2 and D2.1 open while §7 read "solid".** The brief now lists every open item in one table
   ("Open at this exit", O1 to O3). U2's route is your ruling: questions/P-001-acting-route.md.
   D2.1 is restated as observed (C), with a one-step fallback.
3. **Grades didn't match the library.** Fixed: every grade is now the library's (L-F10 A with the
   one-page note, L-F2 A, L-F11 B).
4. **U1 omitted free-plan limits.** Fixed by design: no WebSockets, and the open page drives the
   reconcile poll, so no cron or alarm is needed and requests stay near 1% of the daily
   allowance. The one gap left is the per-invocation CPU and outbound-request limits (O3). I
   propose research Q-006 for it, which needs your approval (D-051).

Minor points: Fly.io now cites F-hosting-04a. The record-check claim is gone from §7; the
no-credential route is described as a design option. Planning-in-scope is your ruling: questions/P-001-planning-scope.md.

If O1 to O3 are ruled before the resubmit, the next check sees a brief with nothing open but O3's
measurement. If not, the brief says plainly that they're open, and the Critic's own open question
1 asks whether that's acceptable. Ruling them first is the stronger submission.
