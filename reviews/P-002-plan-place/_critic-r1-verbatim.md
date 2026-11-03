Verdict: FAIL

**Blocking**

1. **Option A hides a cost: the new Discovery's "Success defined" milestone would show as reached on day one.** In `governance/checks/v3_checks.py`:
   - `log_part` returns `"none"` for Discovery-2 (lines 1016–1036).
   - `file_part` marks Discovery-2 true whenever section 6 holds any value-target line (lines 1058–1059).
   - `_state` turns that into `("reached", None)` (line 1124).

   The desk's settled V1–V5 lines (`docs/PROJECT.md` lines 190–194) would therefore mark the new Discovery's Discovery-2 reached before any value target for it exists. Discovery-7's file part (sections 1, 4 and 5 filled, lines 1066–1069) is also already true from the desk's own lines. So that milestone, which this question is tagged to, would be reached on the Critic's pass alone, whether or not the new scope, limits and owners lines exist. The question says only that "the desk's screens show them with the desk's own". It never says the timeline would report a milestone the new work has not reached. An owner needs this to choose.

2. **Option A's safeguard needs a rule change the question does not mention.** Option A says "its brief is told which lines are new", and the recommendation says the gaps "are covered by the Critic". But the Critic's brief is fixed text: `dor-dispatch = "Check docs/PROJECT.md Part 1 against the definition of ready (D-052)."` (`governance/BRIEFS.toml` line 16). The same file says (lines 1–2): "filled with the plan entry's ids only. A brief never holds content copied from work products. Changing this file is a rule change (R3)." Telling the Critic which lines are new therefore means an R3 change, which needs the owner's approval (`AGENTS.md` §3; `governance/risk-paths.toml` lines 8–10). Nothing says this. Option A's cost, the blast radius ("the desk's records, its project document and the screens") and the recommendation all leave it out.

3. **The recommendation leans on claims the records do not support.**
   - "It is the route the model already provides for later work": the records support this only for milestones (`docs/PROJECT.md` line 69, the ` · for: P-<n>` form). The question's own WHY says the model "says nothing" about scope, owners, limits or value targets.
   - Option A calls adding lines to Part 1 "a reading the model does not state". But the model does say something: Part 1 is "settled at approval; its project milestones then change only as §3 … says" (`OPERATING_MODEL.md` line 176, and Context bullet 3). On a plain reading, A goes against a stated rule rather than filling a gap.
   - "The gaps … are covered by the Critic" depends on finding 2.

4. **Context bullet 10 (the portfolio) cannot be checked.** The cited source, "portfolio, top-level folders `ideas` and `library`", is not available in this environment (no portfolio checkout under `/home/user`). The desk's own records also suggest the description is incomplete:
   - `src/lib/portfolio.js` line 238 reads `rulings/` and `intent/` there as well.
   - `docs/PROJECT.md` lines 207–209 say the desk's weekly value figures are committed to the portfolio.

   The recommendation's reason for not offering the portfolio rests on this bullet.

**Non-blocking**

5. **Bullet 6 and Option A misstate the brief's scope.** They say the Critic's brief covers "the whole document" or that the Critic "is sent to read the whole document". The brief names "docs/PROJECT.md Part 1" (`BRIEFS.toml` line 16).
6. **Bullet 7 and Option A overstate how little the ready check does.** "Checks only that each of sections 1 to 8 … holds content" leaves out two things:
   - Section 3's milestone check (`v3_checks.py` lines 1399–1405), and section 9 through `check_ready` (lines 1383–1386).
   - A note when later work has no ` · for:` milestone (lines 1703–1706).

   So "cannot catch a missing piece of the new brief" is too strong for milestones, though it holds for the other sections.
7. **Option C's cost is partly speculation.**
   - "The page would be part of the desk's own screens" is a scope point that Discovery has not yet decided. The route ruling only says "on the desk", and the shortlist answers do not fix where the page lives.
   - "It would likely be undone" has no source.
8. **An option is missing.** The owner could keep a separate brief file in the desk's repository with no tool change, accepting that the checks and screens do not read it and the Critic checks it by hand. B is the only offered route to a separate document, and it needs a model change first. The owner should either be offered this or told why it is excluded.
9. **Bullet 8's section 9 fact ("The owner is the user.") is not used by any option.** Use it or drop it.
10. **The milestone tag fits but is arguable.** Discovery-7 ("Scope, limits and owners agreed") is a valid standard id (`v3_checks.py` line 372; `TAG_RE` at line 433). Discovery-8 ("A brief ready to rule on", line 374) arguably fits a question about where the brief lives better. Also, the project item this tag would count toward is not filed yet. The earlier route question used `Milestone: none` for the same reason (`decisions/questions/P-002-route.md` line 4).
11. **Risk class and default are consistent with the rules.** R0 matches `questions/**` (`risk-paths.toml` line 28), and "reversible" follows from it. `DEFAULT: none` and `TIMEOUT: none` on a reversible question departs from `AGENTS.md` §5 line 76. It matches the precedent I accepted earlier (`reviews/P-002-route-asks/_critic-r1-verbatim.md` finding 3), and the WHY now says what happens if the owner does not rule. This finding does not implicate my earlier check (D-050). If finding 2 stands, though, Option A carries an R3 consequence the blast radius should name.
12. **The form follows the template otherwise.** The extra `Asked in session:` line is beyond `questions/_TEMPLATE.md`. The WHY opens in plain words with no paths, code or ids, and nothing failed or skipped needs to lead.

**Verified as claimed**
- Bullet 1: `decisions/questions/P-002-route.md` lines 1 and 19.
- Bullet 2: `OPERATING_MODEL.md` line 116.
- Bullet 3: `OPERATING_MODEL.md` line 176.
- Bullet 4: `docs/PROJECT.md` line 69.
- Bullet 5: `v3_checks.py` lines 1240 and 1703–1711.
- Bullet 6, the request route: `orchestrator.py` line 1236.
- Bullet 8: `src/lib/projectpage.js` lines 563–566, and `docs/PROJECT.md` line 479.
- Bullet 9: `governance/SURFACES.md` line 67.
- Bullet 10's other half, LL-16: `Model-Lab/docs/LESSONS.md` lines 116–121.
- "Research carries on either way": `intake/requests/Q-017.toml` is tagged to a standard milestone.

**Open questions**
- Is the Discovery-2 and Discovery-7 effect in finding 1 intended for later work? If not, it is a model defect worth logging alongside LL-16, whichever option is chosen.
- Can the portfolio repository be made available, so bullet 10 can be checked?