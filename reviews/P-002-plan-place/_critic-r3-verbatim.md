Verdict: PASS

All six round-2 findings are resolved, and every new or changed line matches its source. Three small non-blocking points remain.

**Round-2 findings**
1. **C's early "reached" marks (was blocking): resolved.** The WHY (line 6) now says the first and third options both show two milestones reached too early, and C's cost (line 16) says the same.
2. **Blast radius against A: resolved.** Line 18 now names the project page under A and says "no code on the live desk changes". The page shows every value-target line (`src/lib/projectpage.js` lines 563–566), so this holds.
3. **B's adoption step: resolved.** Line 12 calls the desk's take-up "a rule change here for your approval", and line 13 adds adoption to the cost. New Context bullet 32 matches its sources: `governance/risk-paths.toml` lines 8–10 put `governance/**` in R3, and `AGENTS.md` §3 line 58 needs the owner's approval for R3.
4. **"Truthfully" overstated: resolved.** Line 17 now says "is meant to", and line 12 presents the early-marks fix as something the change's spec "would set", which is a plan, not a fact.
5. **Spec-milestones bullet: resolved.** Bullet 31 and Option C (line 16) now match `governance/checks/v3_checks.py` lines 1694–1699: a draft spec fails, a frozen one gets a note.
6. **New-repository option: no change needed.** It is still listed as not offered, with a sourced reason (bullets 23 and 33).

**Non-blocking**
1. **Line 16 gives the wrong cause for one mark.** "Success defined" is marked reached because section 6 holds value-target lines (`v3_checks.py` lines 1058–1059 and 1123–1124), not because of the brief check. Only "Scope, limits and owners agreed" depends on the brief check (lines 1011–1015). The cost itself is correct.
2. **Line 18 says C touches "the desk's records only".** But under C the timeline would still list the new item and show its two early "reached" marks (`v3_checks.py` line 1240 and `_state`). The same applies to A, whose blast radius names the project page but not the timeline.
3. **"The only option that keeps the desk's approved plan as approved" (line 17) is true only taken together with the rest of the sentence.** C also leaves the desk's plan untouched. What only B does is both keep the plan and aim to mark milestones truthfully. As written, an owner could read the first half on its own.

**Other checks**
- The Context bullets I checked in earlier rounds have not changed, and the new and changed ones (25, 27, 29, 30, 31, 32, 35) say what their sources say.
- The WHY opens in plain English, with no paths, code or ids.
- R0, reversible, no default and no timeout are consistent with the rules and with the earlier precedent. Nothing here implicates my earlier checks (D-050).

**Open question**
- If the owner picks C, who files the hand check of the separate brief, and under which route? The only pipeline brief check runs on the desk's plan (`governance/BRIEFS.toml` line 16).