# P-003: a dry run of the definition-of-ready check on its own plan (draft 3, after dry run 2), the Critic's return verbatim

*Run by the Chief of Staff on 2026-11-05 (session session_01QBwHGKpfNMbQeEnVRHpmEe): a fresh read-only Critic session given only the pack the session runner builds for P-003's real check (`session_runner.py pack`, the plan entry P-003 critic ready-dispatch stage 2, on the committed tree at 46cf8be, with dummy MODEL_* variables; 87 MB), told to read its charter and brief there and nothing outside the pack. Not a pipeline verdict; recorded by the orchestrator. On this PASS, the Chief of Staff answers card 2 `resubmit` (decisions/P-003/dor-fail-2.md), in the same pull request as the plan it passed, so the real check reads that plan.*

Verdict: PASS

**Findings (all paths relative to the pack)**

1. **Section 3 has a project milestone, written in the right form.** docs/projects/P-003.md:44 holds one milestone, M4: "Every decision card shows the Chief of Staff's recommendation, or says it has none". It has a name, an id, a `done when`, `phase: Build` and a `· why:`, and no `· for:`, which is correct because P-003 has its own plan (decisions/questions/P-003-plan-place.md:1, 10). The name and the `done when` describe a state that is achieved ("waits off the owner's queue … then shows …", "on the desk's preview, with its tests"), not a task someone does. The milestone is needed to reach the Build gate. The why is in plain words and has no ` · ` inside it. It is backed by decisions/Q-019/stop-1.md:1 and decisions/Q-017/stop-2.md:1 (both `re-specify`), research/P-003-sizing-findings.md:35 (the notes for both say `drop`) and research/P-003-sizing-findings.md:21 (the desk never reads a notes file). The id M4 does not clash with anything in docs/PROJECT.md.

2. **All 14 standard lines are there, each with a why.** docs/projects/P-003.md:48-61 has Discovery-1 to Discovery-8 and Design-1 to Design-6 in the `- <Phase>-<n> (standard) · taken on|skipped · why:` form. Each of the three skipped ones (Discovery-3 and Discovery-4 at :50-51, Design-3 at :58) says why the project can do without it. decisions/questions/P-003-standard-lines.md:1, 16 and 19 match this: take on eleven of fourteen, skip the groundwork map, the search of how others solved it, and the experiments, and "the lines … stand as proposed".

3. **Section 9 is correct.** docs/projects/P-003.md:119 says "The owner is the user." That fits the rest of the brief: the desk serves only the owner (:27, :32, :128).

4. **The other sections are complete and their cited records support them.**
   - §1 (scope) and §8 (terms) define their key terms (:15, :112).
   - §2's chain of reasoning checks out against research/P-003-sizing-findings.md sections 1–4.
   - §4 gives an owner for every deliverable.
   - §5 states the spend ceiling, the data boundaries and the tier.
   - §6 has V6 with its measure, target and dates, plus a miss, the cost to the owner's time and a stop rule. The sizing figures there and in §7 match research/P-003-sizing-findings.md:46, :59.
   - §7 says why no groundwork map was needed, says how independent the sizing is, lists the risks and how the rules answer them, and leaves "No unknown is left open" (:107).
   - The intent quotes the owner word for word, matching decisions/questions/P-001-card-recommendation.md:17-19.

**Open questions (none of these made it a FAIL)**

- **AGENTS.md is not in the pack.** It is cited for the T1 tier at docs/projects/P-003.md:81. I checked the claim against docs/PROJECT.md:168 and :464 instead ("T1, as AGENTS.md says today").
- **governance/risk-paths.toml is not in the pack.** It is cited at docs/projects/P-003.md:70 for the design reviewer. The owner's ruling backs that claim (decisions/questions/P-001-card-recommendation.md:24).
- **The model's table of standard milestones (OPERATING_MODEL.md §4) is not in the pack.** So I can't confirm that Discovery-3, Discovery-4 and Design-3 are the groundwork map, the search of how others solved it, and the experiments. The ruling names the skipped steps by what they are, not by number.
- **docs/PROJECT.md:628 is out of date.** It still says "Like P-003, P-004 adds no Discovery or Design standard lines". P-003's own plan now has them. That file belongs to P-001 and is not under review here.
- **M4's `done when` names only "the owner's queue"** (docs/projects/P-003.md:44). Section 1 also holds the card off Home's count and the notifications (:18). That could be stated in the milestone too, or left to Design-1's scenarios.
