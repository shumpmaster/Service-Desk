# Brief P-003-v6-weekly-notes — the operating notes, ready for the weekly V6 count

*Written by the Chief of Staff (session_01QBwHGNUK5iZdYDfRqBTsM2) on 2026-11-24, for the Builder. Spec: S-014
(frozen). Handoff: docs/handoff/2026-11-23-chief-of-staff-p002-64.md, "Next, in order", item 2.*

**Goal.** Before the first weekly V6 count, make docs/handover/P-003/operating-notes.md say what spec S-014's J6
says about the count's check moments and its reuse, closing the launch review's N3 and N5's wording point
(reviews/S-009/reviewer.md, N3, N5 and open question 3).

**Do:**
1. **N3, the watched code.** In "J6's check moments and the two figures", the check moments name only
   `src/lib/model.js`. J6 says "the rule's code in src/lib/" (specs/S-014.md, J6). Change the bullet so a check
   moment is any later main-line commit that changes queue/, any notes file, the dispatch log, `src/lib/` (the
   rule's code and the modules it imports), or the two record readers the count runs, `src/notify/collect.mjs` and
   `src/notify/checkout.mjs` (open question 3).
2. **J6's code-at-commit sentence.** Add, where the notes say "run the rule on the commit current then", J6's
   own words: the rule is run with the rule's code as it stood at that commit, and for a commit before M4 was
   merged (2783b48, PR #465), the code as M4 merged it.
3. **N5, the wording.** The sentence "A card answered before its due time has left queue/ and has no check
   moments" is wrong: card files stay in queue/; an answered card leaves the open set (src/lib/model.js:141-147).
   Say that instead, and that the rule then no longer lists it, so it can be neither a miss nor reported.
4. **The raise time.** Add one sentence: a card's recorded raise time is the one the rule gives at the first of
   its moments (its arrival, then each later check-moment commit) at which the rule lists it with a recorded
   time, so a card whose `card` entry reaches the main branch after its file still gets a V6 due time.

**Do not** change tests, src/, specs, intake/ (the count script, intake/v6/count.mjs, is the Chief of Staff's and
is being changed to match in the same pull request), or anything else in docs/handover/. Keep every other word.

**Areas touched:** docs/handover/P-003/operating-notes.md only.

**Branch and identity:** a worktree at /home/user/sd-builder-v6 on `build/builder/p003-v6-weekly-notes`, from
`claude/chief-of-staff-p003-followthrough-1k2be5`. Commit with
`git -c user.name=builder -c user.email=builder@agents.invalid commit`, the message ending with a blank line and
`Agent-Session: session_01QBwHGNUK5iZdYDfRqBTsM2/builder-1` and `Spec: S-014`. No model names. Do not push.

**Verify:** `python3 governance/checks/surface_guard.py diff --range <base>..HEAD --branch build/builder/p003-v6-weekly-notes`
and `governance/checks/check_all.sh .` from the worktree; report the outputs.

**Return** the six-part contract: changed (by file) · why · verified (command + output) · undone · needed outside
your surface · open questions.
