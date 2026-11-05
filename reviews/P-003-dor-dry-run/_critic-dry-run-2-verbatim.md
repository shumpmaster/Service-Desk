# P-003: a dry run of the definition-of-ready check on its own plan (draft 3), the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-05 (session session_01QBwHGKpfNMbQeEnVRHpmEe), before any resubmission: a fresh read-only Critic session given only the pack the session runner builds for P-003's real check (`session_runner.py pack`, the plan entry P-003 critic ready-dispatch stage 2, on the committed tree at 2542c82, with dummy MODEL_* variables; 87 MB), told to read its charter and brief there and nothing outside the pack. Not a pipeline verdict; recorded by the orchestrator. Its findings 1 to 3 (three citations of records outside the pack) and its open questions 1 and 2 are answered in the plan's next commit; open question 3 is answered by removing those citations.*

Verdict: FAIL

The plan meets every substantive point of the definition of ready, sections 1 to 9. It fails on one thing only: the brief's rule that "An unverifiable claim is a FAIL" (BRIEF.md:9). The plan cites records that are not in the pack, so I could not check them. The fix is small: drop or reword those claims, or put the records in the pack. Nothing in the plan's substance needs to change.

**Findings (FAIL)**

1. **docs/projects/P-003.md:42** says M4's "earlier form, with ` · for: P-003` and its first why, passed the Critic's line check at round 2, reviews/P-003-m4-line/critic.md". The pack has no reviews/ folder and no file under that path. A search for "m4-line" finds nothing outside P-003.md itself, so the claim cannot be checked.
2. **docs/projects/P-003.md:6** says the earlier drafts' "readiness checks' findings are answered here (the last real check: reviews/P-003/_critic-dor.md on the item's branch)". That record is not in the pack, and BRIEF.md:7 says the folder holds no earlier feedback. I cannot tell whether those findings were answered.
3. **docs/projects/P-003.md:46** cites "questions/P-003-standard-lines.md", which is not in the pack. This one is not decisive. The owner's ruling, decisions/questions/P-003-standard-lines.md:1-19, confirms the proposal ("take on eleven … skip three": the groundwork map and short list, the search of how others solved it, the experiments). That matches the plan's three skipped lines (Discovery-3, Discovery-4, Design-3) at P-003.md:50, 51 and 58. Only the citation's path cannot be checked.

**Checked and passing**

- **Section 3 milestone (P-003.md:44): passes.**
  - The name "Every decision card shows the Chief of Staff's recommendation, or says it has none" is plain English and names an achievement.
  - Its 'done when' describes a state, not a task.
  - It is in Build and needed for the Build gate.
  - It carries no ` · for:`, which is correct for an item with its own plan (decisions/questions/P-003-plan-place.md:1, 10).
  - It has a ` · why:` in plain words with no " · " inside.
  - The reworded why is supported: Q-019/stop-1.md:1 and Q-017/stop-2.md:1 both read `re-specify`, and research/P-003-sizing-findings.md:35 gives those notes as `drop`. The research's section 2 (lines 19-21) says the desk never reads notes.
- **Standard lines: pass.** Discovery-1 to Discovery-8 and Design-1 to Design-6 are all present (P-003.md:48-61), each in the right form with a why.
  - Each skipped line says why the project can do without it (lines 50, 51 and 58).
  - The owner ruled on them (decisions/questions/P-003-standard-lines.md:16: "Merged, I want to go with your reccomendations on all of them").
  - The pack holds no copy of the model's table. That Discovery has 8 steps and Design 6 rests on the ruling's count of "fourteen" (line 1).
- **Section 9: passes.** It reads "The owner is the user." (P-003.md:119). That fits the desk's scope (docs/PROJECT.md:49, "Any user but the owner" is out), and nothing in P-003.md contradicts it.
- **Section 1 scope:** the rules at P-003.md:15-21 match the owner's words and the ruling's scope (decisions/questions/P-001-card-recommendation.md:17-23).
- **Section 2:** passes, citing the sizing's sections 2 and 4.
- **Section 4 owners:** passes. The roles of the design reviewer and of owner approval for the notification sender are supported by docs/PROJECT.md:616 (risk-paths.toml:20-24 and 43-49), though not by risk-paths.toml itself, which is not in the pack.
- **Section 5 limits:** passes. The tier T1 claim is supported by docs/PROJECT.md:168 and 464 rather than AGENTS.md, which is not in the pack.
- **Section 6:** V6 gives a measure, a target, a date, a miss, the cost to the owner's time and a stop rule. The stop rule's figures match the sizing (research:46, 59).
- **Section 7:** every account of the sizing matches research/P-003-sizing-findings.md sections 1, 3 and 7. The point that it is not independent of the plan is stated openly. No unknown is left open.
- **Section 8:** the cross-checks hold, apart from open question 2 below.

**Open questions**

1. V6 is measured "from the day M4 is live" (P-003.md:86), but M4's 'done when' ends "on the desk's preview" (line 44). Going live has no milestone of its own yet. That is allowed, since the Launch lines come before the Build gate, but the start date of V6 depends on lines not yet written.
2. Section 8 (P-003.md:114) claims "V6 counts exactly the cards M4's 'done when' covers". V6's miss would also count a card with no recorded raise time that is shown without the mark (scope at line 21), and M4's 'done when' does not cover that case. The same goes for notes that carry no recommended word, and for the timing of notifications. Is "exactly" meant? Or should M4's 'done when' name these cases? Neither choice breaks the definition of ready.
3. Were the records cited in findings 1 and 2 kept out of the Critic's pack on purpose? If so, the plan should not lean on them as evidence.
