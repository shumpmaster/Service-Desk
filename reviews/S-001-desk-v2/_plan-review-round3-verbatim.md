# S-001, desk mockup v2, draft 3: the plan review's round-3 report, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/build/definer/s001-desk-v2 at 6e82065, by a fresh Reviewer. A FAIL at round 3 goes to the owner under the stop rule.

---

Verdict: FAIL

**For the owner:**
- Draft 3 fixes all of the round-2 findings: the 3 blocking ones (1 from the plan review, 2 from the Critic) and the 19 non-blocking ones. Nothing from round 1 has come back.
- The new verdict reading is right. I ran 12 verdict texts through both the desk's reader and the governance check's reader, including the four stray-character cases. They agree on every one.
- The project screens in stages 1a to 2 are buildable, and nothing becomes unreachable.
- All governance checks pass.
- **One thing fails this draft: the spec says something about your phone that isn't true.** It says the phone's new GitHub reads "silence nothing". GitHub gives the phone's sender a shared hourly allowance. When that runs low, the sender pauses sending, for up to about an hour.
  - The spec itself says a busy hour can already use up that allowance.
  - Such an hour happened on 19 Oct: 58 runs in one hour.
  - The new reads (up to about 180 an hour) make that pause come sooner in a busy hour.
- Nothing is lost when the sender pauses, and the board still shows everything. So the design is safe. The fix is wording in three places, not a change to the plan.

Spec lines are specs/S-001.md at 6e82065.

**Round-2 findings, plan review**
1. B1, the verdict reader: **resolved.**
   - J22 :10955-10768 names `verdictOf` (src/lib/j11.js:56-74) for rule 0, rule 1 and the sender. The same at J16 :10393-10396, J18 :10735 and Facts :13010-13023.
   - I ran 12 texts through `PYTHONDONTWRITEBYTECODE=1 python3 -I` (`review_check.parse_verdict`) and `node` (`verdictOf`). They agree on every one:

     | Text | parse_verdict | verdictOf |
     |---|---|---|
     | `"Verdict: PASS \n"`, `"Verdict: PASS\r\nAny suggestions\r\n"`, `"Verdict: PASS\t\n"`, `"﻿Verdict: PASS\n"` | PASS | PASS |
     | `"Verdict: FAIL\r\n"` | FAIL | FAIL |
     | `"Verdict: pass\n"`, double BOM, `​` lead, `\r\r\n`, two spaces after the colon, NBSP | None | other |
     | `"no verdict\n"` | None | null |

   - The page decodes blobs with `TextDecoder` (src/lib/github.js:513), which already drops a leading BOM, so that case reads PASS either way.
   - The tests are named: J22 :11123-11133, J16 :10611-10616, AC73 :7096-7100.
2. A3's per-cycle bound: **resolved.** 6 + 2 × 5 = 16 (:12636-12640). AC14's test asserts 16 (:2428-2431).
3. "Only when that read fails" overstated: **resolved.** :10962-10968 cites scheduler.js:756-770 and :790-794, which I checked.
4. The sender reading (i) for every head: **resolved.** `ownerCheckHeads` (≤3 heads) is shared by the page and the sender (J16 :10399-10409, J22 :11079-11081, AC73 :7096-7098).
   - The sender has every input it needs. AC52's order for a pull request is `created_at` (:8877), which is in J1's list.
   - I went through both directions of a differing owner-verdict read (head X settled on one side only, which pushes head W out of that side's three). In each case the side that doesn't read (i) for W shows a card or notifies. The side that reads it judges W as GitHub's own check does. So it gives needless items, never a hidden one.
5. The "mostly free 304s": **resolved as asked.** Every read is now counted as a 200 (:10427-10439), and the run counts are given (:13038-13042). But the new conclusion is wrong: new BLOCKING 1.
6. AC81's bar in stage 1a: **resolved** by "Until stage 3" (:6297-6314) and the stage table (:1773, :1775-1776).
7. J24's retry: **resolved** (:11259-11264), but see new note 3.
8. Verdict files on the default branch: **resolved** (J22 :10930-10934, :10766-10772; J16 :10397-10402).
   - The tree's verdict blobs are already read: they are J11's optional reads (src/lib/model.js:297-300).
   - An unread one counts as given. A `removed` one doesn't count. The sender reads them from its full checkout of the default branch (desk-notify.yml checkout step).

**Round-2 findings, Critic**
- B1 (the project screens in stages 1a to 2): **resolved.** See (2) below.
- B2 (the Chief of Staff's sessions): **resolved** (:11231-11238). The quote matches P-001-cos-sessions-on-desk.md:1 and the design README:177.
- Notes 1 to 11: **all resolved.**
  - 1: :2782-2786.
  - 2: :3582-3599, :3767-3776, and both criteria are in "changed in place" (:1833).
  - 3: :3945-3961 and :6476-6484. The order matches desk-v2.html:816-820.
  - 4: :5525-5538 and :6727-6731, matching the brief (:14129-14132).
  - 5: :1785-1792. The `none (…)` reason passes `PR_MILESTONE_NONE_RE` (governance_checks.py:612).
  - 6: :12996-13011. I re-ran the REST-description command: it prints `pulls/list-commits` and "Lists a maximum of 250 commits…".
  - 7: see plan review 4.
  - 8: the lead, :1662-1673.
  - 9: AC87's V1 trace (:6899, :6909-6914).
  - 10: :10988-10993.
  - 11: J7, :9333-9346.

**Round 1:** nothing regressed. Rule 0 is still never kept across heads, AC14's bounds stand, as do the 1a → 1b → one deploy order, CS27 and P1 = G1.

**New findings**

BLOCKING
1. **"Nothing is silenced" is untrue, and the spec contradicts itself on it.**
   - J16 :10435-10437 says the owner-check reads are "at most about 180 in an hour of 60 runs, against the token's own 1,000 an hour and far from the budget guard's last 300, so nothing is silenced".
   - That compares the new reads alone with the guard's floor. But the guard reads the token's total `X-RateLimit-Remaining` (src/notify/gh.mjs:2-5, :67). That total is per repository and shared with asks-merge and the Orchestrator (:10368-10369).
   - J16 itself says the same 60-run hour already costs "about 25 each is 1,500 … which the guard cuts off at the limit's last 300" (:10372-10375).
   - A stopped run sends nothing, for up to about an hour (AC74 :7151-7153).
   - Real hours come near that worst case. `gh api …/desk-notify.yml/runs?created=2026-10-19&status=success|failure` gives 58 sender runs between 21:00 and 22:00 UTC on 2026-10-19, and 41 between 17:00 and 18:00.
   - So in a busy hour the new reads bring the guard's stop up to about 180 requests sooner. In hours near the floor, they cause stops that wouldn't otherwise happen.
   - The same claim appears in Risks :13418-13422 (the reads "could trip the budget guard, which stops sending", answered by these figures) and A3 :12816-12819. The lead's "stated without the hopeful parts" (:1648) then doesn't hold.
   - The design itself is safe (delayed, never lost; the board unaffected). This is a false record, not an unsafe build.
   - Fix (wording only): say that in a busy hour, which J16 already bounds at about 1,500, these reads make the guard stop up to about 180 requests sooner, delaying sends to the next run with budget, up to about an hour (AC74), with nothing lost. Optionally, make the owner-check reads last in a run, or skip them when the remaining budget is near the floor.

Non-blocking
2. **The Status screen's wait rows aren't covered in stages 1a to 2.**
   - They link to `p/<name>/queue/<key>` (src/public/sandbox.js:1118), as the v2.5 waits do.
   - "Until stage 3" redirects only `p/<name>/queue` (:6309). `parseRoute` gives kind `queue` for both (sandbox.js:2223), so a redirect will likely catch both. The spec doesn't say whether the sheet opens.
   - The board's address when filtered to one project (for "replacing its history entry" and refresh) isn't named either.
   - Nothing is unreachable: the card is always on the Waiting tab.
3. **J24's retry contradicts rule 1.**
   - J24 :11261 lets the retry ride "a verdict call that has room".
   - Rule 1 :10988-10990 says the verdict call holds "the required reviewers' verdict blobs and nothing else", because one failed blob fails the whole call (github.js:626-633).
   - A3 :12639 says J24 rides "inside the 6", but verdict calls are outside the 6.
   - Pick one. The effect is only a later retry.
4. **The other project screens aren't named in "Until stage 3".**
   - The detail screens (Pipeline, Time asked, Agents, Record notes: `detailScreen`, sandbox.js:1109) and the member screens (:1846, :1857) carry the project bar today.
   - The spec gives the top row only to Status, Timeline and Team (:6301-6304, test :6396-6398). It should say whether the others get the row or rely on Back and Home. They stay reachable either way.
   - AC56's own text (:4321, :4340-4343) still describes Queue paths, with no note pointing to AC81. The brief does list the ac56 tests to rewrite.
   - ac55-status.test.mjs:432's `SB_NAV` (…`Queue`) and its link crawl (:501-513) will need the new bar's words. That is covered by the brief's rewrite rule.
5. **`ownerCheckHeads` has two loose ends.**
   - It doesn't say how it treats a head whose J20 list is unread on the page, where (a) is unknown.
   - It has no tie-break for equal `created_at`. The page's and the sender's lists may come in different orders.
   - Either choice is safe (needless items only). A tie-break by number would make the AC73 test exact.
   - The sentence "the side without the read leaves (i) unread for that head" (:10407-10409) puts the effect on the wrong head. It falls on the head pushed out of the three.
6. **It doesn't say whether the per-head verdict calls run when `blobPhase` fails or is still pending.** (:10978-10983.) Skipping them is safe (unread counts as given), but say which.

**Checks**
- `GOV_BRANCH=build/definer/s001-desk-v2 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`: all 25 PASS, exit 0.
- `spec_check.py status`: OK. `spec_check.py facts --base origin/main`: OK.
- The recount holds: 9,817 with 183 to spare, consistent at :1624, :2428, :2785, :12809 and :13434.
- **Security:**
  - A token-pattern scan of the draft-2 → draft-3 diff found nothing.
  - Only specs/S-001.md changed against main. The commit is `definer <definer@agents.invalid>`.
  - desk-notify.yml's permissions are unchanged, and the checkout keeps no token on disk.
  - The new Facts commands are unauthenticated `curl` calls to raw.githubusercontent.com and a read-only `gh api`. I re-ran the 250-commit and 1,000-an-hour ones; both match.

**Open questions**
- Should the sender order or skip its owner-check reads near the budget floor, or is a reworded record enough? (BLOCKING 1)

I changed and committed nothing. The worktree /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/pr-v2r3 is removed (`git worktree list` no longer shows it).
