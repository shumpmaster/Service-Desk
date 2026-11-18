Decision: criteria-wrong
Proxy: done at the owner's request (the owner answered in the session by the question tool, verbatim: "criteria-wrong (Recommended)"; the answer is the owner's own, and this line marks only that the Chief of Staff recorded it)

Asked in session session_01QBwHGLS7KNezEJ9vEK469a after 13:40Z on 2026-11-17, once the card's notes (decisions/P-005/stop-6-notes.md) were filed in #455; the answer was received after the session's worker restarted, and before 12:48Z on 2026-11-18 (the clock read when this was drafted; the answer itself was not timed). Recorded once #455 put the notes on main.

## The owner's rulings the new spec takes (all readable by the Definer, L-0055)
- Everything stop-5.md lists: S-010's six answers (decisions/P-005/stop-4.md); AC17's widths (decisions/questions/P-005-s011-widths.md); the reading of M8 (decisions/questions/P-005-s011-m8-reading.md); the widget copy's folder (decisions/questions/P-005-widget-folder.md).
- Which pull requests count, at any moment while open: decisions/questions/P-005-s012-pr-counted.md.
- A return to ready is a second wait: decisions/questions/P-005-s012-pr-return.md.

## What the new spec should fix (triage/P-005.md and reviews/S-012/plan.md on item/P-005)
- AC40 and experiments/P-005-E1.md line 26 together: a pull request counts if the desk's rules would have listed it at any moment while it was open, not at the window's end. E1 has not run.
- AC40 and AC41: each spell between ready for review and back to draft, merge or close is its own wait; AC41 matches `shown` and notice lines only if dated at or after the wait's start and before its end.
- AC41 cause (d): state what happens when the run named by `from_run` has no `true` line or its log is past keeping, so the repeat is not reported as "unexplained"; add the case to the test.
- Non-blocking, while there: the repeat count reads only runs that started in the window, so a first send before the window and a second inside it is missed.
- Keep S-012's revisions that the third review found sound: cause (d) and its order, and the waiting-list `id` as AC40's and AC41's join key.
