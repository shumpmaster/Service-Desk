# S-001, desk mockup v2, draft 3: the Critic's round-3 report, verbatim

Dispatched by the orchestrator on 2026-10-20 against build/definer/s001-desk-v2 at 6e82065, by a fresh Critic. A FAIL at round 3 goes to the owner under the stop rule.

---

Verdict: FAIL

**Critic check, round 3: S-001 desk mockup v2, draft 3** (/home/user/sd-def-v2/specs/S-001.md, build/definer/s001-desk-v2 at 6e82065; I read the working tree at that path). Line numbers are from that file.

Summary:
- Every round-2 finding in both reports is resolved: the Critic's B1, B2 and notes 1–11, and the plan review's B1 and notes 2–8.
- Nothing resolved in round 1 has regressed.
- The fresh pass found one blocking problem: the heads chosen for the owner check never include an owner-required pull request, which is exactly where GitHub posts "Owner: after agents". That leaves the "With the agents" ruling largely not carried out, and the lead's promise untrue for that class.
- There are also 6 non-blocking findings.

## The Critic's round-2 report

- **B1 (the project screens between stages 1a and 3): resolved.**
  - AC81's "Until stage 3" (:6294-6323) settles the open points:
    - one bar at the foot;
    - a "Status · Timeline · Team · Waiting" row at the top of each project screen;
    - the Queue screen gone, with its address, the row's "Waiting", the queue button and Home's pill each opening Waiting filtered to that project, and Back returning;
    - today's Home cards opening Status;
    - the stage 3 end state.
  - Its tests are at :6396-6403.
  - The same text carries through:
    - the stage table (:1773, :1775);
    - AC82 (:6535-6537);
    - AC80 (:5844-5856);
    - Terms (:2235-2237);
    - AC68 (:5536-5538);
    - Risks (:13398-13404);
    - the brief (:14039-14044, :14130-14132);
    - the lead (:1602-1606).
- **B2 (the Chief of Staff's sessions on Home): resolved.**
  - J24 lists no session kind and quotes the ruling (:11231-11238); choice 9 says so too (:1901).
  - The test asserts no session line (:11290-11292).
  - I checked decisions/questions/P-001-cos-sessions-on-desk.md:1.
- **N1 (AC42's out-of-date note): resolved** (:2780-2786).
- **N2 (AC52 and AC53 notes against AC80): resolved.**
  - AC52 (:3582-3586, :3589-3604) and AC53 (:3767-3776) bring the box back and rewrite the box tests rather than dropping them.
  - Both are named in "Other criteria changed in place" (:1833-1834).
- **N3 (Home's group order and starting state): resolved.**
  - AC82 (:6476-6484) and AC54's note (:3946-3961) give the order and starting state; the test is at :6553-6555.
  - desk-v2.html:816-820 confirms active ▾, Closed ▾, Done ▸.
  - The reasoning holds under the rulebook's order of authority and its part B (governance/domains/design/README.md:34, :48-49), and the lead tells the owner (:1612-1614).
- **N4 (the Team screen's phase line): resolved.**
  - AC84 (:6729-6733), AC68 (:5525-5536), the answered list (:13666-13670) and the brief (:14128-14130) all put the same line, in the page's form, on Team.
- **N5 (stage 6b's `Milestone:` line): resolved** (:1784-1793).
  - governance/checks/governance_checks.py:62-63 allows `Milestone: none (<reason>)` with no parenthesis inside the reason, and the spec's reason has none.
  - A separate milestone is left as a Chief of Staff proposal.
- **N6 (J24's commit cap): resolved.**
  - 250 is used throughout (:11245-11246, :11274-11276); no "300 commits" text is left.
  - The evidence command and output are in Facts (:12996-13005), and widening the token is "not relied on" (:13006-13011).
- **N7 (different inputs on (i)): resolved as asked.**
  - `ownerCheckHeads` is shared by the page and the sender (J16 :10400-10412; J22 :11077-11080), with tests at :10620-10622 and :11132-11133.
  - See new B1 on the selection itself.
- **N8 (the lead says more than the plan holds): resolved.**
  - The lead now covers the one-deploy instruction and CS27's gap (:1630-1637), and gives MD2 and MD3 their plain names (:1626-1628).
  - A small leftover is non-blocking 4.
- **N9 (AC87's trace): resolved** (V1 traced, with its reason, :6899, :6909-6914).
- **N10 (J22 rule 1 still saying "alone"): resolved** (:10987-10995); no "alone in a blob call" text is left in rule 1.
- **N11 (J7's join sheet): resolved** (:9333-9354, with tests).

## The plan review's round-2 report

- **B1 (the verdict reader): resolved.**
  - `verdictOf` decides every verdict file:
    - rule 0 and rule 1 (:10937-10950, :10998);
    - the sender (J16 :10386-10389);
    - the choices (:1882-1884);
    - the brief (:14046-14047, :14104).
  - Real-on-real tests against `parse_verdict` cover the four texts (:11123-11133, :10613-10617), and Facts gives the command and output (:13012-13025).
  - I checked src/lib/j11.js:56-74 against governance/checks/review_check.py:67-87: they match (BOM, CR, trailing blanks, a non-column-0 `Verdict:`). j11.js:49 shows AC60 already uses it.
- **N2 (A3's per-cycle bound): resolved** (:12636-12640: 6 + 2 × 5 = 16; AC14 :2434-2435).
- **N3 ("only when that read fails" too narrow; the verdict calls off the optional loop): resolved** (:10962-10968, :10977-10983; test :11121-11122). The cited scheduler.js:756-770, :790-794 and github.js:626-633, :673-676 hold.
- **N4 (the sender and the board not fed the same inputs on (i)): resolved** (as Critic N7).
- **N5 (the "mostly free 304s"): resolved.**
  - Every status read is now counted as a 200 (:10427-10439; Risks :13417-13423; A3 :12817-12820).
  - The Vary and run-count evidence is in Facts (:13030-13039); 249 + 13 + 529 + 199 = 990 checks out.
- **N6 (AC81's bar in stage 1a): resolved** (as Critic B1).
- **N7 (retrying J24's failed read): resolved** (:11259-11264; test :11288-11289). It has a new inconsistency, non-blocking 1.
- **N8 (a verdict file on the default branch): resolved** (J22 :10930-10933, :10948-10954; J16 :10389-10392; A3 :12814-12815; tests).

**Round 1, no regression:** I spot-checked these and all hold:
- the "Latest" bubble ruling;
- the 1a → 1b → one-deploy order and CS27;
- the sender's failure rules;
- the operating-model evidence;
- no waits on questions;
- the AC44 step 2 / 6b split;
- AC81's type list;
- the Pi icons;
- the colour figures;
- P1's permissions;
- a mark never confirmed by rule 0 (:1808, :6219, :6233);
- the layout-check method;
- the `tier:` comment.

## New findings

**BLOCKING**

**B1. The heads chosen for the owner check skip every pull request that needs the owner by its paths, so rule 0's (i), "Owner: after agents", can almost never hold.** This is against P-001-board-after-agents.md (A), and the lead's promise is untrue for those pull requests. Route to Define.
- **The selection:**
  - The owner check is read only for "the open pull requests whose card is not already 'Verdict ↗' by (a) or settled by their verdict file" (J22 :11077-11079; J16 :10402-10403, the same `ownerCheckHeads`).
  - Rule 6 then treats the rest as "not read".
- **Where GitHub posts the status:** only when the owner is required, which is mostly (a)'s case.
  - governance/checks/owner_signal.py:163-164: not required gives `success`.
  - owner_signal.py:172-179: "Owner: after agents" is posted only for an owner-required change.
  - :209-215: a tripwire change gets `error` instead.
  - So, in a public v3 project, (i) can hold only where the owner is required by file contents alone ((b): a weakened test and the like), never by class.
- **A real class it misses:** owner-required (R3) changes outside the signal-code paths.
  - Examples are AGENTS.md, governance/** other than checks/, and .claude/** (governance/risk-paths.toml:8-24; govlib.py:981). #148, "Set up the Design reviewer", is one; CS24's own pull request is another.
  - Once the reviewer's PASS is in, (ii) no longer holds. If the checks then fail, rule 2(a) gives a "Verdict ↗" card, and from draft 3 the phone notifies too.
  - Yet the owner check reads "Owner: after agents", the exact status whose old card ("The agents still have findings to fix first.") the ruling's option B named (P-001-board-after-agents.md:9).
- **What the lead says:** "a pull request still waiting on the agents' fixes … is no longer a card … and your phone stops notifying for it" (:1655-1658).
- **Not stated anywhere:** J22's known limit names only private repositories, v2.5 projects and a fourth head (:11084-11089).
- **The tripwire half is unstated too:** for a change that trips the tripwire (nearly every Service-Desk Builder pull request, :11041-11044), (i) can never hold, because the check posts `error`. Such a pull request waiting on the agents' fixes after its reviewer's PASS shows as rule 4's "Open ↗" card. This is a model limit, but the owner isn't told.
- **Why it matters:**
  - The design reviewer's part A, item 3 ("Waiting is real", README:283-286) would fail stage 1a.
  - The ruling isn't carried out for the case it was written about.
  - Whether to widen the selection (and at what cost against A3's 183 spare calls and J16's count) or state the limit to the owner is Define's choice.

**Non-blocking (all routed to Define)**

1. **J24's retry rides a call that J22 says carries nothing else.**
   - J24 lets a failed commits read ride "a verdict call that has room in its 25" (:11261-11262).
   - J22 says each head's verdict call holds "the owner's and every required reviewer's [blobs] … and nothing else" (:10971-10973, :10990-10991).
   - A3 says "J24's commits ride J20's calls and the optional loop's, inside the 6" (:12642), but verdict calls sit outside the 6 (:10980-10981).
   - A failing verdict blob fails its whole call (github.js:631), taking the ridden commits page with it.
2. **Home's "Work ahead ›" control in stages 2 to 4 is undecided.**
   - AC81 says Home's "Work ahead ›" control "stays until" stage 5 (:6312-6313).
   - Stage 2 rebuilds Home to AC82, which neither draws nor names it (:6414-6565).
   - AC86 removes it at stage 5 (:6875, :6897).
   - The Builder can't tell whether stage 2's Home carries it.
3. **AC84's test can't hold as written.**
   - It asks the phase line to equal "the first part of AC83's sentence", character for character (:6769-6772).
   - The line's form is "<now phase>, <…> · Next: <…>" (:6724-6725), while the sentence reads "<now phase>, <…>. Next: <…>." (:6593-6595).
   - "First part" is never defined, here or in choice 16 (:1912).
4. **The lead's "so the board and your phone take the new rule together" (:1633-1634) is slightly too strong.**
   - The sender runs from main, so it takes rule 0 at 1b's merge, before the owner approves the deploy. Risks says so (:13412-13414).
   - The gap is on the safe side (the board shows more), but the lead doesn't say it.
5. **Areas touched's test list (:11802-11803) is out of date.**
   - It omits AC52, AC53, AC55, AC56, AC66–AC68, AC69, AC74, AC77 and AC79, whose test files the brief now rewrites (:14073-14086).
   - Its "src/lib/configcheck.js (an owner-approval path)" (:11801-11802) reads as if configcheck.js were R3. It is not (risk-paths.toml:20-23 lists src/config/projects.json).
6. **The header lineage stops at draft 2** (:4, which ends "…drawn as icons)]"), while the amendment is headed "draft 3" (:1600). Every other amendment records each of its drafts there.

## What holds
- The milestones header (:15) matches docs/PROJECT.md section 3 (:106-114).
  - MD2 reached on 2026-10-20 matches PROJECT.md:110 and P-001-md2-accept.md.
  - Every stage serves MD3, whose "done when" stage 8 meets.
  - AC86's "accepted with M3A, 2026-10-20" matches PROJECT.md:112.
- Every 2026-10-20 ruling line the spec quotes matches line 1 of its file (15 checked), and the rulebook's six spec points are addressed (:1812-1823).
- The lead is plain, and apart from B1 and note 4 it is accurate.
- The new numbers are all evidenced: 9,817 and 183; 16 calls a cycle; 260–800 reads a day and 180 an hour; 990 = 249 + 13 + 529 + 199; the 250-commit cap.
- Each stage now stands alone. Stage 2's Status tap is in stage 1a's form, and stage 3 ends the interim.

## D-050
B1 sits in J22's head selection. That selection was carried from the board's draft 4 into draft 1 and kept through rounds 1 and 2, whose Critic (note 7) and plan review (note 4) examined its inputs without raising this. So it implicates those earlier checks, not one of mine.

Files:
- /home/user/sd-def-v2/specs/S-001.md
- /home/user/sd-def-v2/governance/checks/owner_signal.py
- /home/user/sd-def-v2/governance/risk-paths.toml
- /home/user/sd-def-v2/governance/checks/govlib.py
- /home/user/sd-def-v2/decisions/questions/P-001-board-after-agents.md
- /home/user/sd-def-v2/governance/domains/design/README.md
- /home/user/sd-def-v2/src/lib/j11.js
- /home/user/sd-def-v2/governance/checks/review_check.py
- /home/user/sd-def-v2/governance/checks/governance_checks.py
- /home/user/sd-def-v2/docs/design/mockups/desk-v2.html
- /home/user/sd-def-v2/docs/PROJECT.md
