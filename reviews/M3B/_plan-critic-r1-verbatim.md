# M3B plan: the Critic's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 31ff26d (the plan, draft 1).

---

Verdict: FAIL

The M3B plan, draft 1 (specs/S-001.md, "The desk's value targets shown: M3B, as criteria and stages", :3134-3308, with AC97 :12843-12935, AC25 :12763-12794, J5 :13569-13611, J25 :15935-15993, CS32-CS35 :17067-17098, the questions :19175-19276, the brief :20300-20322), fails on five blocking findings. All five go back to the Definer. Finding 1 also needs the Chief of Staff before Q3 is filed. I have no shell, so I ran no git command or diff. I read the working tree in /home/user/sd-m3bdef as checked out and took it to be 31ff26d.

**What holds**
- The M3B line is quoted word for word (docs/PROJECT.md:113). So are V1 to V5 (:180-184) and the measurement design (:194-205, with one marked […]).
- These quotes match their records: "Ruling: A" and its option text (P-001-glance-plan-order.md:1, :8); "Launch (V4): 2026-11-11 …" (P-001-move-to-build-values.md:6); "criteria for M3B (value targets shown, which has none)" (P-001-trial-view-notes-2.md:168; intake/later-work.md:3); "Absolutely no fake numbers." (P-001-design-lab-1.md:7); the M3G answer (owner-request-2026-10-25-questions-and-order.md:21); the 4 to 8 days (intake/estimates.jsonl:5).
- The code citations are correct: sandbox.js:1484, :1571-1578, :1099, :1228-1238; projectpage.js:48-49, :563-571; sandbox.css:1144; j11.js:181-194; asked.js:126-155; model.js:29-35; asks_merge.py:27-38 (it has no intake/ kind); desk-deploy.yml:18-21; SURFACES.md (intake/** is the Chief of Staff's lane, the owner is in humans); the locked cases ac83-page.test.mjs:466 and ac82-home.test.mjs:115; mockup desk-v2.html:610 and :740. Nothing at docs/metrics/; LEDGER ends at L-0019.
- No owner ruling is invented or changed. The `milestones:` header (:15) already names M3B, in section 3's order, and the plan adds no id.

**Blocking findings**

B1. **The weekly file in the public repository: its "code" hides little, and publishing it can't be undone. The plan says the opposite to the owner.**
- J5 codes another project's item as `c-` plus the first 12 hex digits of an unkeyed SHA-256 of its whole AC73 key (:13602-13605). AC73 keys are a project, a kind and a path or a pull-request number. A pull-request number can be found by hashing the few hundred candidates.
- The spec's own rule for this case is a keyed hash: HMAC under a secret (J18 :15274; AC76 :11652-11654).
- So "no private name or number lands in this public repository" (:13603-13604) and Q3 A's "by a short code only, never by name" (:19207-19208) overstate what the code hides.
- Once a week's file (open times to the minute, items, marks) is committed to the public Service-Desk, deleting it later does not unpublish it. Yet:
  - the plain paragraph says "None of it is irreversible" (:3155);
  - the questions' preamble says "Each is reversible: R1, … undone by a later change" and "my recommendation is each one's default" (:19177-19179).
- AGENTS.md:68 requires the paragraph to say whether anything is irreversible, and AGENTS.md:77 says irreversible questions never default.
- Route: Definer (J5's code, Q3's options and their risk, the plain paragraph). Chief of Staff: whether Q3 may carry a DEFAULT when filed.

B2. **The six questions are not filed-ready.**
- No question has its own WHY, BLAST RADIUS, DEFAULT, TIMEOUT or Context. The only risk and default text is one shared preamble (:19177-19179). questions/_TEMPLATE.md:5-14 and AGENTS.md:75-80 require all of them.
- CS35 tells the Chief of Staff to file each with "its Context as written there" (:17095-17096), but none is written.
- Compare M3G's question 5, which carried `DEFAULT: A`, `TIMEOUT: 168` and its Context (:17014-17015).
- Each question is short enough to put in a chat. Q6's fourteen readings are long but no longer than M3G's sixteen.
- Route: Definer.

B3. **Q2 and Q4 don't fit together: under the recommended answers, M3B is reached after VT1 alone.**
- With Q2 = A, VT2 and VT3 carry `Milestone: M3B` (:3260, :3263).
- Neither today's line (PROJECT.md:113) nor the drafted rewording (:3254-3258) needs the device notes, "Didn't need me" or the weekly file. Before launch, V1 and V2 read "Measured from launch" whatever is built (AC97 :12920-12921).
- So the owner could accept M3B with two of its three steps unbuilt. Under the milestone standard, work tagged to a milestone is what is needed to reach it.
- The rewording does follow the milestones process: the Critic's check, then the owner's approval of the line, both named in the heading (CS33 :17080-17083; Q4 A :19221-19224), as M3G had (P-001-m3g-line.md, -critic.md) and M3A had (P-001-m3a-done-when.md, -critic.md). But the line drafted for it must hold under Q2's answer.
- Route: Definer. Draft the line for Q2 = A and for Q2 = B, or tie Q4 to Q2.

B4. **V4 shows "Met" whatever the date.**
- AC97 shows the green "Met" once both parts are recorded, "the date being in the quoted line" (:12916-12917).
- V4 is "by 2026-11-11" (PROJECT.md:183), and a miss is "V4 not met by its date" (:191). A launch after 11 November would show a missed target as met.
- Reading (e) (:19255-19256) does not tell the owner this.
- Route: Definer.

B5. **A portfolio card has no AC73 key, yet AC25 keys everything by one.**
- AC95's tie rule says a portfolio card "has none" (:11002-11003).
- AC25 and J5 keep "first shown" and "Didn't need me" by AC73 key (:12773-12774, :13572-13573), hash "its whole AC73 key" for the portfolio (:13602-13603), and list "a portfolio card" among the sheets that get the control (:12777; VT2 row :3295).
- This is undefined, and a Builder would have to guess.
- Route: Definer.

**Non-blocking notes**

N1. "The owner said "proceed" on 2026-10-26" (:3175) cites no record, and there is no 2026-10-26 reference in docs/design/references/. Route: Definer, to cite it; Chief of Staff, to record it.

N2. **The lineage entry and the body use different status words.**
- Line 4 says "AC82, AC83 and A3 noted" and "M3B's line reworded". The line is only drafted.
- The body says "Changed in place" (:3232-3236), the VT rows say "AC83 (changed)" and "AC82 (changed)" (:3294, :3296), but the notes are headed "Noted for M3B" (:8307, :8472).
- The M3 header says "AC25 is noted in place" (:12378), but AC25 says "Changed for M3B" (:12763).
- The `milestones:` header itself is consistent.
- Route: Definer.

N3. AC83's note keeps "its title, place, icon rule" (:8472-8473), while AC97 moves the icon from the planned ring to the half circle (:12870-12871). The two criteria conflict. Route: Definer.

N4. **The plain paragraph (:3136-3164):**
- J5 makes one file per device, so the cost is one commit per device per week. "Committing the week's file" understates it, and section 6 says "one commit a week" (PROJECT.md:202-203).
- The weekly check's pull request waits on the owner and notifies the phone every week (J25 :15985-15986). The paragraph doesn't say so.
- "About three days … inside your Chief of Staff's 4 to 8 days" reads oddly.
- It carries a file path (:3162), against AGENTS.md:68.
- The targets are quoted in the sheet, not "on Service-Desk's page".
- Route: Definer.

N5. **Readings marked C, or settled on the Definer's own say, sit outside the fourteen letters:**
- AC97 :12869-12871 (V5's before-launch figure not counted; the icon), :12873 (the sheet's small line), :12880-12881 (the earlier-checks list), :12901-12904 (V5 after its 14 days);
- J25 :15939 and :15944 (where the file lives, its form);
- J5 :13595-13600 (the week's V5 line; the rounding).
- AC97's row line "<n> targets · none measured yet" differs from the approved mockup's frame 5, "Measured from launch · V4, replacing the old page, by 11 Nov (proposed)" (desk-v2.html:610). Q1 A's "Mockup v2 draws the row there" is true of the row's place, not its words. Tell the owner.
- Route: Definer.

N6. Rounding a window's start down and its end up (:13598-13600) can put a card raised just after the desk closed inside a window, and so count a V1 miss. Section 6 says a card committed while the desk was closed is not a miss (PROJECT.md:200-201). Route: Definer.

N7. CS34 has the Chief of Staff record V3 in docs/LEDGER.md (:17087-17088). docs/** is the Orchestrator's lane (SURFACES.md:39, :77-91), and J25 rules docs/ out for exactly that reason (:15942-15943). Route: Definer and Chief of Staff.

N8. **Citation slips:**
- "so did AC24's 'Never a deadline'" (:3214): AC24's test only lets M3B's line show "target" (:12745-12747). It does not leave the measures to M3B.
- "'Value targets this spec traces to', above" (:3179): that section is below (:3442).
- That section still says lines 177–181 and V5 at :181 (:3443, :3459). They are now 180-184.
- Route: Definer.

N9. Q4 and then the line's approval ask the owner twice about the same line. M3A asked once, approve the new line or keep the old (P-001-m3a-done-when.md). Separately, PROJECT.md:105's heading does not name M3A's records, so CS33's "as M3A's" is only a partial precedent. That part is for the Chief of Staff.

N10. The drafted line reads as an achievement within Build and its why is plain. But "the owner wants to see on the desk itself whether it is doing what it was built for" cites no owner words. The records hold V5's "tracked and shown on the desk" and the pick "criteria for M3B". Check this at CS33.

**Self-implication (D-050):** none. This is my first check of this amendment, and no finding rests on an earlier verdict of mine.

Files:
- /home/user/sd-m3bdef/specs/S-001.md
- /home/user/sd-m3bdef/docs/PROJECT.md
- /home/user/sd-m3bdef/AGENTS.md
- /home/user/sd-m3bdef/questions/_TEMPLATE.md
- /home/user/sd-m3bdef/governance/SURFACES.md
- /home/user/sd-m3bdef/governance/risk-paths.toml
- /home/user/sd-m3bdef/governance/checks/asks_merge.py
- /home/user/sd-m3bdef/decisions/questions/P-001-glance-plan-order.md
- /home/user/sd-m3bdef/decisions/questions/P-001-move-to-build-values.md
- /home/user/sd-m3bdef/decisions/questions/P-001-trial-view-notes-2.md
- /home/user/sd-m3bdef/decisions/questions/P-001-m3g-line.md
- /home/user/sd-m3bdef/decisions/questions/P-001-m3g-line-critic.md
- /home/user/sd-m3bdef/decisions/questions/P-001-m3a-done-when.md
- /home/user/sd-m3bdef/docs/design/mockups/desk-v2.html
- /home/user/sd-m3bdef/intake/estimates.jsonl
