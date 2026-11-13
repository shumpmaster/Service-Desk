# P-005: a second dry run of the definition-of-ready check on draft 6 as filed, the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-13 at about 04:29 UTC (session session_01QBwHGJaKPAWHLvefBrVkKb), the same way as dry run 1, on draft 6 as filed, with the fallbacks for the alert route and the stopped-feed check that dry run 1's observation 1 asked about. A fresh session that did not see dry run 1. Not a pipeline verdict.*

Verdict: PASS

I checked docs/projects/P-005.md (draft 6) against governance/standards/definition-of-ready.md and the charter's definition-of-ready duties. I found no blocking finding.

**Findings**

1. **Section 3 project milestones (docs/projects/P-005.md lines 72-76).** M6 to M10 are listed in the milestone form: plain-English name, `done when`, `phase`, and a ` · why:` on each. None carries a `· for:`, which is right for an item with its own plan (S-035).
   - Each reads as an achievement, not a task. M6 is "The records can carry the timeline", done when each kind of event and each owner-waiting step is "known to have a record…". M7 to M10 are states of the desk, e.g. "The timeline is the desk (M10)".
   - Each why says in plain words why the project needs it. None contains a stray ` · `.
   - Phases are plausible. M6 is in Design, where E1 and E2 run, and M7 to M10 are in Build.

2. **Standard lines (lines 82-95).** Discovery-1 to Discovery-8 and Design-1 to Design-6 are all present, each `taken on` with a why. No skipped line needs a justification.
   - Each why is specific to this project. For example, Design-3 ties to E1 and E2, and Discovery-3 ties to Q-022 and the shortlist.

3. **Section 9 (line 220).** "The owner is the user." is one of the two allowed forms. Nothing in the brief contradicts it: the project serves only the owner's desk, and section 4 names no other users.

4. **Owner rulings cited in the plan.** Each ruling record exists and says what the plan claims.
   - decisions/questions/P-005-route.md line 1 and P-005-experiments.md lines 1 and 16 match the quoted options.
   - P-005-acting.md line 1, P-005-reading.md line 1 and P-005-lasting-copies.md line 1 also match.
   - P-005-groundwork-shortlist.md lines 9-19 hold answers 1 to 11 as the plan cites them. Answer 9 adds four kinds to the seven, which makes the eleven kinds the plan uses. Answer 10 means no milestone filter row, and answer 11 means "take them all in".
   - The experiments ruling (P-005-experiments.md lines 13, 19 and 20) is the owner's own, not a proxy. It covers the rule that an unknown may stay open into Design only with a named test and fallback (section 7 lines 157-161), and E1 and E2 are registered at Design-3.

5. **Sections 1 to 8 are all present with content.**
   - Value targets V7 to V9, how each is measured, the misses and costs, and the stop rule are in section 6.
   - Each open unknown in section 7 names what closes it and its fallback.
   - Section 8 defines the terms and cross-checks the constraints that could conflict: answer 2 against V8, acting against T1, and "records only" against "every recorded event".
   - The five core screens named in section 8 line 197 are consistent with docs/design/README.md.

6. **Part 2 Intent (lines 224-232).** It is marked as the Chief of Staff's draft, "to be confirmed", and has purpose, preferences, trade-offs and dislikes. Its quotes match the shortlist answers.

**Non-blocking observations**
- Many cited records are marked "outside the check's files" (the basis, the operating model, the ledger, specs/S-001.md, AGENTS.md). I could not verify them. The plan says so openly, as context for the owner rather than evidence, and no definition-of-ready point rests on them alone.
- I did not open the research memos Q-022 to Q-027 or the library F-/P- entries. They exist in research/. Their findings are carried as sourced claims with caveats. I did not test each caveat.
- The M6 "done when" is worded "is known to have a record". I accept it as an achievement. It leans on a state of knowledge and depends on E2's result.

**Open questions (for the owner at the Design gate, as the plan itself lists)**
- Do the draft V7 to V9 targets, the 5-minute V8 figure, the stop rule's thresholds (fewer than 10 waits, median under 1 hour) and the $0 ceiling stand?
- Is the paid-source approval for the alarm standards (R3) given?
- Is leaving out E3 accepted?
- Are facts that rest on single GitHub pages acceptable?
- Is extending record changes to Design allowed?
- Is answer 9 recorded as a change to the basis?
