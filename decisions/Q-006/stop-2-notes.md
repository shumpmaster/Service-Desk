# Chief of Staff's notes — Q-006 stop-2

**Recommendation: `re-specify`.**

The confirm check under the new source rule filed four entries: F-cf-workers-01, -02, -05 and
F-cf-do-01. They hold the facts O3 needs: 10 ms CPU on Free, network waits not counted as CPU, 50
outbound requests per invocation on Free, 100,000 requests a day. The desk needs about 15 outbound
requests per reconcile, so it fits. The verdict was still FAIL, because five other claims rest on
one page (or none) and a checker fails a memo with any unverifiable claim.

Those four entries sit on the item branch. They reach main, where the Critic can see them, only if
Q-006 passes. `drop` closes the item without merging them. `re-specify` sends it back to the
Researcher with rounds reset, and the Researcher's pack includes this last source check, which lists
exactly which claims passed and which were held. A revision that keeps the passing claims and drops
or marks the rest "not documented" should pass the next check and file the four entries.

Triage (triage/Q-006.md) suggested closing on the four filed entries. No card word does that;
`re-specify` is the nearest route to it. Triage's options (b) and (c), single-source filing or
widening the question, need new owner rulings and aren't needed for O3.

Process gap for the model: a source check that confirms the load-bearing facts but holds back side
claims still fails the whole memo, and the entries it filed are lost unless the item passes.
