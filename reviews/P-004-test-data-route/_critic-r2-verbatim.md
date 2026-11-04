# The widget test's data-route question — the Critic's round 2, verbatim

Read: questions/P-004-test-data-route.md at 9a2bb84 (orch/p004-discovery). Round 2 of at most 3
(D-044). Recorded by the orchestrator, session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-04.

---

Verdict: FAIL

Round 2 of 3 (D-044). I read the card at 9a2bb84 cold. I accept the coordinator's two notes: the "Asked in session:" line is the desk's form, and portfolio has no workflows. Both blocking findings below are one-line wording fixes. The structure, the options and the recommendation now hold.

## Round 1 findings
1. **Answered.** The card now names the exception plainly: "any route that brings the copy back is a one-off exception to that ruling, for this test only."
2. **Answered.** Option B now states the copy that stays in Apple's iCloud "until the backup is replaced, usually for days", Files' Recently Deleted ("keeps it for 30 days"), a believable time ("About 10 minutes"), and that it is "One exception to Phone only, and to the desk's rule". The confidence is now medium.
3. **Answered.** The direct upload is now option A, and "turning iCloud Backup off" is now a mitigation in B. The double negative is gone.
4. **Answered.** "The Reviewer then downloads it into its working session to check it, as it already does with your repositories."
5. **Answered in substance.** The log, the workflows and what the desk reads are now covered, and src/config/projects.json does give portfolio `"defaultBranch": "main"`. The cache line is answered with a claim that is wrong, though: see new finding 1.
6. **Answered,** apart from the wording in new finding 2.
7. **Answered.** "frozen" is now "locked" and "registration" is now "written plan". "R0" stays only in the code line, as a cross-reference.
8. **Answered.** The line now says what can't be undone, and the departure from the usual default is named.
9. **Answered.** Method 3 is cited on its own line.

## New findings
1. **Blocking: a false statement about the widget.** The line is: "The widget's last menu item deletes them, along with its log and what it kept." At b2b1711, the Reviewer found that "Clear kept data" does not remove the stored copy, and that `clearSnapshot` is never called (reviews/EXP-007/_reviewer-widget-b2b1711.md, finding 4). The widget's menu (/home/user/sd-wt-builder/src/widget-test/entry.js:287–292) ends with "Forget key". No item deletes the cache, the log and the kept data. The line sits under "whichever you choose", but under B, C and D the widget is not changed at all. Either make it true by a change that every route gets, and say so, or state what is true today.

2. **Blocking: claims an approval the owner has not given.** Option C says: "This changes the pass mark you approved with the plan." The owner approves the plan only at P-004's Design gate (docs/PROJECT.md:616, "the owner approves it, with M5, at P-004's Design gate"), and that gate has not happened. Say "the pass mark the plan sets" instead.

3. **Non-blocking: the write key is described too narrowly.** Option A says the key "can only write files in portfolio". A key that can write portfolio's files can also change its main branch, which the desk reads. A fault in the widget could therefore change what the desk shows. Say so, and say where the second key is kept (the keychain, presumably).

4. **Non-blocking: unclear for option C.** "under B and C you upload it the same way as the copy": under C, no copy is uploaded. Say where the log goes under C, and how.

5. **Non-blocking: "only you" may be too narrow.** The line is: "by anyone who can read portfolio (only you)". Any app or key the owner has given read access to portfolio can read it too, including the agent sessions' GitHub access, which the Reviewer's download relies on. "You, and what you have given access" is truer.

None of these findings implicates an earlier check of mine (D-050).

Files read:
- /home/user/Service-Desk/questions/P-004-test-data-route.md
- /home/user/Service-Desk/src/config/projects.json
- /home/user/sd-wt-builder/src/widget-test/entry.js (lines 284–303). That worktree may hold edits not yet committed (Reviewer finding 1).
- From round 1, I relied again on reviews/EXP-007/_reviewer-widget-b2b1711.md and docs/PROJECT.md:615–658.
