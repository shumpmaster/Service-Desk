Verdict: FAIL

The revision fixes all of my round-1 blocking findings and switches the recommendation to B, but it adds one new blocking problem: Option C leaves out a cost it shares with A.

**Blocking**

1. **New problem: Option C's cost leaves out the early "reached" marks, and the WHY says only A has them.**
   - The timeline judges every project item's standard milestones against `docs/PROJECT.md`, not against a side file.
   - "Success defined" is marked reached once section 6 holds any value-target line (`governance/checks/v3_checks.py` lines 1058–1059 and 1123–1124).
   - "Scope, limits and owners agreed" is marked reached once the brief check passes and sections 1, 4 and 5 have content (lines 1011–1015 and 1066–1069).
   - Under C the brief check still runs on the desk's plan, which the question itself admits ("the Discovery's automatic brief check reads the desk's plan, not this file", line 16). So under C both milestones would show as reached from the desk's own lines, exactly as under A.
   - The WHY (line 6) gives this cost only to the first option ("the first … shows two of the new work's milestones as reached too early"). C's cost (line 16) says only that the file's milestones "show nowhere". An owner comparing A with C is misled.

**Non-blocking**

2. **The blast radius contradicts Option A.** Line 18 ends "nothing on the live desk changes". But Option A says "The desk's screens show them with the desk's own" (line 9), and the desk's project page shows every value-target line in section 6 (`src/lib/projectpage.js` lines 563–566). Under A the live desk's screens would change.
3. **Option B leaves out one step.** The model change reaches the desk only when the desk adopts it, and that touches the desk's `governance/**` files. Those are R3 here and need the owner's approval (`governance/risk-paths.toml` lines 8–10). "More questions reach you" (line 13) partly covers this, but adoption should be named.
4. **B's "shows the new work's milestones truthfully" (line 17) is a hope.** Option B's change has not been planned yet, so nothing on record says it will mark milestones truthfully. Something like "is meant to" would match the records better.
5. **"Must name" in Context bullet 31 and "would fail that check" in Option C are stronger than the check.** Lines 1694–1699 make an unknown milestone a failure only for a draft spec. For a frozen spec the check only notes it.
6. **The new repository is now only listed as "not offered" (line 17).** The reason given is supported: the earlier ruling's question said "on the desk" (`decisions/questions/P-002-route.md` line 6, Context bullet 23), and the page code lives in this repository. This is acceptable, but it is the owner's call whether that premise holds.

**Round-1 findings**

| Round 1 | Status | Where it is fixed |
|---|---|---|
| 1. Early "reached" marks under A | Resolved for A; still open for C (finding 1 above) | Line 10; bullet 27 checked against lines 1011–1069, 1115–1124 and 409 |
| 2. The Critic's fixed brief needs a rule change | Resolved | Line 10; bullet 29 checked against `governance/BRIEFS.toml` lines 1–2 and 16 |
| 3. Recommendation leaned on unsupported claims | Resolved | Recommendation is now B at low confidence; A's cost says plainly it goes against a stated rule (line 10, bullet 25) |
| 4. Portfolio claim unverifiable | Resolved | Bullet 34 matches `src/lib/portfolio.js` lines 35 and 71–75 (and line 238); `/home/user/portfolio` holds only `ideas/` and `library/`, which fits "not a plan document the checks read" |
| 5. "Whole document" vs Part 1 | Resolved | Bullet 29 quotes "Part 1" |
| 6. Ready check described too narrowly | Resolved | Bullet 30 |
| 7. Option C was speculative | Resolved | The old C is now listed as not offered, with a source |
| 8. Missing option | Resolved | It is now Option C |
| 9. Unused section-9 bullet | Resolved | Removed |
| 10. Milestone tag | Resolved | `Milestone: none (…)` with a reason, matching the earlier route question |
| 11. Risk class and default | Consistent | R0 and reversible are right; DEFAULT none follows the earlier precedent and the WHY says what happens if you do not rule; the blast radius now names B's repository. This finding does not implicate my earlier check (D-050). |

**Context bullets checked against their sources**
- Bullets 22–30 and 32–34 say what their sources say.
- Bullet 31 overstates its source (finding 5).
- The WHY's opening is plain English, with no paths, code or ids.

**Open question**
- Under B, is the model change meant to fix the early "reached" marks? If so, B's "what happens" should say so; if not, B has the same cost too.