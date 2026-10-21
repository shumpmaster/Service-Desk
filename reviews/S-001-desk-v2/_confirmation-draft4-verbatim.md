# S-001, desk mockup v2, draft 4: the Reviewer's confirmation check, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/build/definer/s001-desk-v2 at 6325373, by a fresh Reviewer, under the owner's answer A to P-001-desk-v2-plan-stop ("a fresh reviewer checks only those fixes; then building starts").

---

Verdict: PASS

**What this means for you:** Draft 4 fixes everything round 3 raised. That covers both blocking findings and all eleven small notes. Pull requests that need your verdict and are still waiting on the agents' fixes now go into "With the agents". The phone's new reads now come last in each run and are skipped when the hourly allowance runs low. The plan says plainly that a busy hour can still pause sending for up to about an hour, with nothing lost.

Nothing that needs you can be hidden, the A3 count (9,817 a day, 183 spare) is unchanged, and no secret or wider access is added. I found two small slips in the new text, both harmless (notes N1 and N2 below). One governance check fails at the branch tip only because the branch hasn't merged main's last commit. Merging origin/main before landing clears it.

This was a confirmation check of specs/S-001.md, draft 3 (6e82065) against draft 4 (6325373), on origin/build/definer/s001-desk-v2, under P-001-desk-v2-plan-stop.md (A). Line numbers below are from specs/S-001.md at 6325373.

**The Critic's round-3 findings**
- **B1 (the owner check missed every pull request (a) marks): fixed.**
  - `ownerCheckHeads` now leaves out only two kinds of pull request: one settled by its owner's verdict file, and one already with the agents by (ii). It takes the rest "whatever (a) gives" (:11190-11211). The same selection is in J16 (:10474-10489).
  - This matches the code. owner_signal.py:161-179 posts "Owner: after agents" only when the owner is required, and "Owner not required" otherwise. (i)'s prefix match (:11028) catches both variants, "· N other finding(s)" and "· other checks failing".
  - The two exclusions are correct: (i) changes nothing for a pull request that (ii) already puts with the agents, and an owner's verdict file read PASS or FAIL ends "after agents".
  - A pull request whose J20 list is unread is still chosen (:11202-11205).
  - I went through a differing read in both directions. The side with fewer reads leaves out fewer pull requests and pushes a later head out of its three. On that side (i) is unread, so the result is a card or a notification. It is needless, never hidden (:10482-10489).
  - The tripwire limit is stated:
    - J22's known limit (:11215-11223), citing owner_signal.py:209-215 (the code is at :207-208, close enough);
    - Risks (:13600-13605);
    - the lead (:1608-1613).
  - Tests: J22 :11271-11280, J16 :10719-10729, AC73 :7168-7172. The bound stays 3 heads a project, so A3 is unchanged (:12973-12976, :12964-12965).
- **Note 1 (J24's retry riding a verdict call): fixed.** It now rides only the optional loop's calls, never a verdict call (:11407-11414, test :11439-11440, A3 :12796-12797, :12971-12972).
- **Note 2 (Home's "Work ahead ›" in stages 2 to 4): fixed.**
  - The control stays in stage 1a and goes at stage 2 (AC81 :6360-6366; AC82 :6602-6605 and its test :6621; AC86 :6942; AC24 :8170). The Plan tab is the way in from stage 1a.
  - Small gap: the brief's stage 2 line (:14303) doesn't list AC24 among the criteria it notes. AC82 itself says AC24's test case is rewritten in stage 2's pull request.
- **Note 3 (AC84's "first part"): fixed.**
  - For a v3 project it is the whole sentence with ". Next: " written " · Next: " and the last "." dropped. For a v2.5 project it is the first sentence (:6789-6793; test :6837-6838; choice 16 :1940-1941).
  - Checked against AC83's forms at :6655-6658. It gives the line form at :6786.
- **Note 4 (the lead's "together"): fixed.**
  - The lead (:1653-1657) says the sender takes the rule at 1b's merge, a little before you approve the deploy, and that the board shows more in between. The brief (:14297-14299) agrees.
  - Consistent with Risks (:13581-13583) and with desk-notify.yml, which runs from main.
- **Note 5 (Areas touched): fixed.**
  - The test list now covers the brief's rewritten tests (:11953-11957).
  - It now says src/config/projects.json is the owner-approval path and configcheck.js is not. That matches governance/risk-paths.toml: projects.json is R3, and configcheck.js falls under src/** as R1.
- **Note 6 (header lineage): fixed.** Draft 3 and draft 4 entries are now in the lineage (:4).

**The plan review's round-3 findings**
- **B1 ("nothing is silenced" untrue): fixed.**
  - The claim is gone; no "nothing is silenced" text is left.
  - "What this can still pause" (:10526-10536) says the reads can bring the budget guard's stop up to about 180 requests sooner. A3 (:12981-12985) and Risks (:13592-13599) say the same.
  - The ruling's mechanism is in place (:10490-10500): the owner-check reads are the run's last reads, and they are all skipped below 400 remaining. A skipped read means (i) doesn't hold, so the pull request is judged as today. The kept answer is not used, so a skip can't hide anything. The board is not affected.
  - This is sound against src/notify/gh.mjs:1-5 and :62-70. The guard checks only the first answer that carries `X-RateLimit-Remaining`, with a floor of 300. A run makes at most about 3 owner-check reads, so starting from 400 or more they can't push that run under 300.
  - Facts (:13204-13208): I re-ran the commands and got 58 and 41 successful runs, with 0 failures in each hour.
- **Note 2 (the Status screen's wait rows and the filtered address): fixed.**
  - Waiting filtered to a project gets its own address, `waiting/<name>`. A refresh keeps the filter, and the filter's ✕ returns to `waiting`.
  - `p/<name>/queue/<key>` opens that address with the card's sheet open, or with no sheet when no card has that key (:6344-6352; test :6452-6455).
  - Checked against sandbox.js:1118 and parseRoute (:2223). Nothing else in the spec defines the Waiting address, so there is no conflict.
- **Note 3 (J24's retry against rule 1): fixed** (same fix as the Critic's note 1).
- **Note 4 (the other project screens, and AC56): fixed.**
  - The detail screens and the member screens get the foot bar only, with no top row, and Back returns to Status or Team (:6352-6357; test :6455-6456). Checked against sandbox.js:1107-1110.
  - AC56 has a new note (:4300-4306). The step names it uses match AC56's own text (the back path, steps 3 and 3b). It is also listed under "Other criteria changed in place" (:1864).
- **Note 5 (`ownerCheckHeads`'s loose ends): fixed.**
  - A head whose J20 list is unread is chosen (:11202-11205).
  - Ties on `created_at` go to the lower number (:10476, :11205-11207; tests :10724, :11278).
  - The effect of a differing read now falls on the head pushed out (:10484-10487).
- **Note 6 (verdict calls when `blobPhase` fails or is pending): fixed.**
  - The calls are made only when the blob phase returns `ok`. A skipped call is not a failed one and uses none of the head's 5 polls (:11085-11090; test :11278-11280).
  - Small citation drift: the pending return is at src/lib/scheduler.js:770, not :768-769.

**New small issues in the lines draft 4 changed (non-blocking; both still give a card, never a hidden one)**
- **N1. An expected card contradicts J22's own rule order.**
  - J22's draft-4 test (:11274-11275) takes an owner-required-by-class pull request with the tripwire's `error` and expects "rule 4's 'Open ↗'".
  - But rule 2, (a), applies before rule 4 (:11024, :11115), so that pull request is "Verdict ↗".
  - The known-limit sentence at :11219-11221 has the same slip. It is true for an R1 Builder pull request, but not for the R3 ones that trip the tripwire: src/notify/**, .github/**, governance/checks/**, src/lib/jobcand.js.
  - Fix: expect "Verdict ↗" in that test case, and say "a card (rule 2 or rule 4)" in the known limit.
- **N2. The wider choice of heads can shuffle cards, and the lead doesn't say so.**
  - Pull requests (a) marks now take up the 3 slots too, including ones that trip the tripwire. For those the read can change nothing: `error` never gives (i), and rule 2 comes before rules 1's owner states, 3 and 4.
  - So a later head can be pushed to fourth more often than in draft 3. A (b)-only need there shows rule 6's "Merge ↗ … not read yet", and a non-tripwire R3 pull request there misses (i). This is the stated fourth-head limit, never a hidden card.
  - The lead's "no cost is added" holds for calls, but not for this.
  - Fix: leave out an (a)-marked head whose files touch a signal-code path, or state the limit.
- **Minor:** "the last answer before them" (:10492-10493) doesn't say what happens when that answer has no `X-RateLimit-Remaining` header, as with an uncredentialed download. Either choice is safe.

**Standing guarantees:**
- Nothing that needs you is hidden: each changed path gives a card or a notification on the side with fewer reads.
- A3's 9,817 a day with 183 spare is unchanged.
- The sender's bound is still at most 3 heads a project and about 180 reads an hour.
- The diff adds no secret: I scanned it for token patterns and found none.
- No access is widened: only specs/S-001.md differs from the merge base (three-dot diff), .github/ is untouched, and the commit is `definer <definer@agents.invalid>`.

**The lead** (:1602-1619, :1680-1686) is plain and true, apart from N2's unstated trade.

**Checks**
- `GOV_BRANCH=build/definer/s001-desk-v2 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`: exit 1. 24 PASS, 1 FAIL: `governance_checks all`, with "questions/P-001-desk-v2-plan-stop.md: added in the range, but its answer record decisions/questions/P-001-desk-v2-plan-stop.md is already on the base origin/main: a reused name".
  - This is a branch-sync problem, not a spec problem. The branch last merged main at 2e82efe (#170). Main then moved that question to decisions/ in a4b3dc8 (#171, f3e0b2f), and that move is the only difference since.
  - The same suite against the merge base 2e82efe gives all 25 PASS, exit 0.
  - **Merge origin/main into the branch before it lands.**
- `python3 governance/checks/spec_check.py status`: "OK: every spec has a valid status and every ledger spec reference resolves", exit 0.

I changed and committed nothing. The worktree /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/conf-v2 is removed.
