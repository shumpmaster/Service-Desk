Verdict: FAIL

The question is clear, in the right form, and nearly every claim holds up against its sources. It fails on one point: option A says it rules out nothing, but once building starts it does. Nothing was edited.

**Findings**

1. **Blocking.** questions/P-003-hidden-tests.md:8 (option A, "Rules out: nothing; a set can be added later … Reversible: yes"). This leaves out a real cost.
   - The model's Build stage 4 says the checks are "Written independently before any work: visible locked checks plus hidden holdouts" (OPERATING_MODEL.md:143). Build-1 is "Tests written before the work" (:167).
   - P-003.md:37 does say that taking a line back on after the gate needs only the Critic's check, so the procedure claim is true. But a hidden set written after the Builder has started can never meet Build-1 for this fix.
   - Build-3 ("holds against the hidden tests too", :169) can be taken back on only until the Reviewer passes the work.
   - So A shuts off Build-1 for this fix once building starts, and Build-3 at the Reviewer's pass. The record can be changed back; the chance to have hidden tests in time cannot.
   - A's cost and "rules out" should say this in plain words, for example "a set added after building starts can no longer count as written before the work". The recommendation at :13 should take it into account.

2. **Non-blocking.** :7–8 versus :12. The options are not judged on equal terms. C's cost names how it misreads at a glance. A has the same kind of misreading: "Tests written before the work: skipped" sits beside visible tests that were in fact locked before the work. A does not say so. The desk's own question noted the same risk in its option A (decisions/questions/P-001-launch-standard-lines.md:8).

3. **Non-blocking.** :7 ("as you ruled the same lines for the desk itself"), :13 ("the way you chose for the desk itself") and Context :26. The earlier ruling is a weaker match than these lines suggest.
   - The source does say what bullet :26 claims: Build-3's reason was "with no hidden tests" (P-001-launch-standard-lines.md:1, :8).
   - But the desk's Build-1 was skipped because no tests were locked at all (the Builder's own tests were used), and the desk was built outside the pipeline.
   - Here the visible tests will be locked. The question should say how the two cases differ, rather than present the earlier one as the same.

4. **Non-blocking.** Context :21 says the session runner "only keeps holdout paths out of the agents' reading packs". The word "only" is wrong:
   - the runner also strips holdouts from the check tree it builds (session_runner.py:78, :357–358);
   - orchestrator.yml:255 confirms the builder's code runs only on the holdout-free tree;
   - a separate check (v3_checks.py:1896–1908) guards changes to the holdouts register.
   The main claim holds: no workflow or check runs a hidden set. The word "holdout" appears in .github/ only in that one comment, and governance/checks has no step that runs one.

5. **Non-blocking.** :10 (option B, "the plan says this fix leaves the pipeline unchanged"). The plan's words are "How cards and notes are written, the Orchestrator, and the operating model: unchanged" (docs/projects/P-003.md:27). It does not say "pipeline", and it does not name the automated checks or governance files. Context :23 quotes the plan correctly; B's wording should match it.

6. **Non-blocking (could not fully check).** Context :25. The decision record decisions/questions/P-003-launch-lines.md:1–12 has only the question and options as put, with Milestone: Design-6. It says nothing about Build-1 or Build-3, or about settling this before the Build gate. So the claim rests entirely on the filed question in git history, which I cannot read (no shell).
   - The bullet cites commit f0e0df8, but your brief pointed me to `ce9b8d7^`. Please check which commit is right and that its note says what the bullet claims.

7. **Non-blocking (noted, not failed).** Context :27. reviews/S-005/plan.md is on item/P-003, which I cannot read. status/P-003.toml (stage 3, state "ready", role "critic-gate", next_gate "criteria", spec S-005, plan_round 1) fits the claim: with no case written, that status matches the "case-wait" route (governance/ROUTING.toml:285–291).

8. **Non-blocking.** Plain English.
   - :5: the paragraph says "Two of its lines" but names them in plain words only in option A (:7). Name them in the paragraph itself.
   - :9: "their fingerprint is recorded with a ledger entry" and "Register a hidden set" are jargon for someone reading on a phone. Something like "a short code for each test file is logged so any change shows" would do.
   - Apart from these, the paragraph has no paths or ids, and it is understandable.

9. **Non-blocking.** Missing option, :6–12. The question does not say why there is no lighter middle route, such as hidden tests run once by hand outside the Builder's view instead of through a new automated step. If none is possible (the runner strips holdouts from check trees, and reviewers have no shell), a short note in B or in the paragraph would show that B is not a straw man.

10. **Non-blocking.** :15. `CHECKED:` is not a field in questions/_TEMPLATE.md. The form check ignores extra fields (governance_checks.py:125–126), so it causes no error. But it names a record (reviews/P-003-hidden-tests/critic.md) that exists only once this verdict is recorded, and with this FAIL it must not claim a passed check yet.

**What held up**
- **Form:** every template field is present. The Milestone line reads "Build-1, Build-3", and both places match the model's table. Each Context bullet cites a source in "(source: …)", and "not recorded" does not appear.
- **Context :19:** matches OPERATING_MODEL.md:167 and :169.
- **Context :20:** matches governance/HOLDOUTS.md:3–9. The sets are kept outside the repository and readable only by the automated checks, and the register lists none.
- **Context :22:** matches risk-paths.toml:8–13 and :36. governance/** and .github/** are in the highest class, which needs the reviewer and the owner.
- **Risk class R0:** right, since questions/** and docs/** are R0 (risk-paths.toml:28). Reversible, so defaulting to the recommendation after 72 hours follows AGENTS.md §5.
- **Context :23:** matches P-003.md:27.
- **Context :24:** matches P-003.md:37.
- **Stage order:** the checks are locked after the Build gate. The question's "locks the visible tests before any work exists" fits the model's stage 4.
- **Design reviewer:** the claim that it reviews the work holds. The fix touches src/public/ (P-003.md:41), which needs the design reviewer (risk-paths.toml:48–49).
