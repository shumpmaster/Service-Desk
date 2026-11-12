Verdict: FAIL

The question is readable and its diagnosis is probably right. It fails on four counts: it breaks the rules for asking the owner (§5) on default and timeout, one Context bullet misstates its source, the risk class understates the recommended path, and it never says that the owner's last ruling on this build was expected to clear the way and did not.

I could not run git, so I could not check bullets 18, 19, 20 and 22, or the run artifact and control-file parts of bullet 23. All of those are sourced only on item/P-003. I checked everything else on the main checkout.

**Findings**

1. **Line 13 (`DEFAULT: none   TIMEOUT: none`)** contradicts line 12 and §5. Line 12 calls the question reversible. §5 says "Reversible questions adopt the recommendation at timeout"; only irreversible questions never default. The template wants a letter and a number of hours. The note "only you answer the card" is a reason about the later card, not this question. The file needs either a default and a timeout, or a reversibility that justifies having none.

2. **Line 12 (`RISK CLASS: R0 (the question); it leads to a new spec...`)** understates the risk of the options it puts. governance/risk-paths.toml makes `tests/acceptance/**` and `governance/**` R3 (owner approval). Option A's record is "kept with the locked tests", which is the check author's tests/acceptance surface (SURFACES.md), so A means R3 work. B changes governance or the operating model, also R3. "The pipeline's normal path" hides this. BLAST RADIUS ("the card fix only; nothing on the live desk changes") is also true only of A. B reaches the operating model and every project, and C bypasses the pipeline's own records.

3. **Line 5 (WHY): it does not lead with the earlier failure, and does not stand alone.**
   - The owner's last ruling on this build (decisions/questions/P-003-build-blocked.md, A: "fix both faults, then build") was put as "blocked by two desk faults, not by the work".
   - L-0046's licenses_next promised that "P-003's Builder can record its baseline after the owner answers stop card 14 `rebuild`".
   - This question shows that diagnosis missed a third fault, and that the expectation the owner ruled on was wrong. Plain English first means starting with what failed, and this is the main failure. The WHY only says "Since the rebuild:", which a reader coming in cold cannot place (whose rebuild, and why).
   - Context also omits this earlier ruling, though §4 lists "an earlier ruling" among the facts Context should carry.

4. **Line 21 (Context): the bullet misstates its source.**
   - The bullet says the check copy is "main's files plus the Builder's changes". session_runner.py step 5 supports "a fresh one-commit repository with no history" (lines 1695-1699).
   - But the check run's source tree (orchestrator_git.py build_tree, lines 624-656) is the default branch's tip, plus the item branch's own changes since their merge base, plus the role branch. session_runner.py never says "main".
   - The item branch layer matters here, because the locked S-007 tests that the check run restores live on item/P-003.

5. **Line 24 (Context): the stop-card citation points at the wrong route.**
   - The bullet cites `ROUTING.toml, review-fail` for "a third failed round raises a stop card". review-fail applies only at `round = "<3"` and sends the work back to the builder.
   - At round 3 or more, the `third-fail` route sends the item to critic-triage, and `triage-return` raises the stop card. So the card follows a Triage session, not the round itself.
   - The error half of the bullet is supported (orchestrator.py apply_outcome, lines 540-545, plus the ready-dispatch route).

6. **Line 5 and line 23 disagree on the turn count.** The WHY says the Builder "used all 50 of its turns". Context and status/outcomes.jsonl line 228 say 51 turns (`num_turns: 51`, `result: "error"`, control 7208116d…). The detail is small but checkable, so it should match.

7. **Line 5: a WHY fact with no Context bullet.** "It hands back all its changes at once" is part of the case that no Builder can pass, but no Context bullet supports it.

8. **Line 5: plain-English wording.** "(FAIL, nothing built)" puts a verdict code in the plain-English paragraph. "The build branch's git history", "the checks run on a fresh copy" and "timer run" are jargon a non-technical owner will not follow. None of these are paths or ids, so this is a judgement call, but the paragraph is meant to be readable cold.

9. **Lines 7-10 (OPTIONS): uneven and not fully honest about cost.**
   - **Form:** the template's form is `<choice> — <what happens, cost, what it rules out>`. Only A names its cost, and none says what it rules out.
   - **A:** "About a day of the pipeline's time" has no source.
   - **B:** "likely for weeks" has no source.
   - **C:** no cost or time at all, only open problems.
   - **D:** written as a dismissal ("No grounds") rather than stated neutrally with its cost.
   - **Missing cost:** none of the options says what happens before the card arrives. Since the owner's word can only go on a card, the next timer runs keep re-sending the Builder until a stop or failure card comes. That spends up to two more failed rounds, or one more error, under every option, and the owner should know.

10. **Line 15: content outside the template.** The "A risk with A" paragraph sits between the header block and `## Context`, where the template has no place for it. It is a cost of option A (nineteen criteria in a 50-turn session; max_turns = 50 in governance/RUNNER.toml) and belongs in A's option line. Leaving it out of A makes A look cheaper than the file admits.

11. **Line 11 (RECOMMENDATION)** mostly follows from the options, since A is the only option that fixes the one bad definition within the normal path. But it rests on the unstated R0 framing (finding 2) and the unsourced "about a day" (finding 9). Its second sentence, about raising B as a lesson, goes beyond the template's "letter + one-line reason".

**Bullets I checked and found supported**
- **Line 23:** 51 turns, a limit of 50, and result error (status/outcomes.jsonl line 228; RUNNER.toml max_turns = 50).
- **Line 22:** checks PASS, then the Reviewer FAIL after the rebuild (status/outcomes.jsonl lines 225-227). Only the outcomes are supported; the content of the checks and review records is on the branch.
- **Line 25:** gates.stop offers criteria-wrong and checks-wrong, with strikes false; gates.failure offers only retry, re-specify, rebuild and drop; re-specify is a strike, and orchestrator.py lines 1492-1493 record it at either gate.
- **Line 26:** session_runner.py step 3 (lines 1652-1679) restores every file under governance/checks, tests/acceptance, checks and .github to its source version.
- **Line 27:** docs/LEDGER.md L-0007 says "the desk (P-001) is built outside the pipeline".
- **Line 3:** M4 is a milestone in docs/projects/P-003.md.
- **Option A is feasible:** the check author is builder-class (SURFACES.md line 22) and owns tests/acceptance/**. With session_commands "on", builder-class roles also get the command tools, which include Bash (RUNNER.toml lines 23-24 and 33-34).

**Bullets I could not verify (they live only on origin/item/P-003)**
- **Line 18:** specs/S-007.md
- **Line 19:** tests/acceptance/S-007/baseline-provenance.test.mjs
- **Line 20:** docs/reports/P-003-builder.md
- **Line 22:** reviews/S-007/checks.txt and reviews/S-007/_reviewer-build.md (only the outcome rows are checked above)
- **Line 23:** reviews/S-007/_control/0-7208116d9263.json, plus the GitHub Actions run 43143962522 artifact

**Files read**
- /home/user/Service-Desk/questions/P-003-baseline-proof.md
- /home/user/Service-Desk/questions/_TEMPLATE.md
- /home/user/Service-Desk/AGENTS.md
- /home/user/Service-Desk/governance/ROUTING.toml
- /home/user/Service-Desk/governance/risk-paths.toml
- /home/user/Service-Desk/governance/RUNNER.toml
- /home/user/Service-Desk/governance/SURFACES.md
- /home/user/Service-Desk/governance/checks/orchestrator.py
- /home/user/Service-Desk/governance/checks/orchestrator_git.py
- /home/user/Service-Desk/governance/checks/session_runner.py
- /home/user/Service-Desk/docs/LEDGER.md
- /home/user/Service-Desk/status/outcomes.jsonl
- /home/user/Service-Desk/decisions/questions/P-003-build-blocked.md
- /home/user/Service-Desk/.github/workflows/orchestrator.yml
