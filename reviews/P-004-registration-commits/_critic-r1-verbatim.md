# The scope-check question — the Critic's round 1, verbatim

Read: questions/P-004-registration-commits.md at 95bd021 (orch/p004-discovery). Round 1 of at most
3 (D-044). Recorded by the orchestrator, session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-05.
The facts the Critic could not check (it holds no shell) were checked by the orchestrator: the nine
commits are on orch/p004-discovery, authored `definer`, each changing only
experiments/EXP-007-widget-refresh.md (`git show --name-only`); CI job 127059212294 fails only its
"v3_checks scope" step (read through GitHub); `surface_guard.py diff --range
origin/main..build/definer/p004-widget-exp` printed "OK: 9 commit(s) … checked"; force-push is
denied in this environment.

---

Verdict: FAIL

I read the card cold (round 1 of 3). I could not check two of its facts, because this session can only read files: it cannot run git and has no GitHub access.
- I could not confirm that the nine commits are on orch/p004-discovery with author `definer`. The short shas do agree with docs/handoff/2026-11-04-chief-of-staff-widget.md line 221 and reviews/EXP-007/_critic-r3-verbatim.md (4184785).
- I could not confirm the CI job 127059212294 fact, the surface_guard output, or that "this environment can't rewrite them" (the handoff says force-push is denied).
- The Orchestrator must confirm these before filing.

No finding implicates an earlier check of mine (D-050).

1. **Blocking. Option A and the recommendation understate what the exemption does.** Option A says: "the exemption covers only those nine… The checks then pass, and the other checks still ran on those commits and passed." The recommendation calls A a way of "letting a known, checked commit past one rule". In fact the exempt block is read by both range walks. check_scope skips exempt commits (v3_checks.py lines 1508 and 1521-1524), and so does surface_guard (surface_guard.py lines 290 and 311-314; SURFACES.md calls it "Commits the range guard skips"). So once the shas are listed, the surface check also stops judging them. Its earlier pass survives only as a past CI run. The card must say that every range check skips these commits from then on, not just the scope check. It should also say that "can be removed later" changes nothing in practice once #300 is merged, because main's commits are never walked again.

2. **Blocking. The WHY gives the wrong reason the check fails, which hides the fact that no spec file can fix it.** The WHY says: "the check accepts only a spec that has its own file, and P-004 has none yet." This suggests that writing a P-004 spec file later would fix it. It would not: SPEC_REF_RE (govlib.py line 822) accepts only `S-nnn`, so `P-004` is rejected whatever files exist; the file is looked up "at that commit" (v3_checks.py lines 1491-1500 and 1546-1548), so a later file cannot help. The Context bullet on line 20 has this right ("an S-numbered spec"). The WHY contradicts it.

3. **Blocking. Option B, and the "lead with failures" rule, leave out the second red check.** Option B says: "You merge #300 as it is, with the one check failing." The WHY says: "one of the desk's checks fails on it… with this check red." Context line 24 says the pull request description check is also red until the task "the scope check passes" is done. Under B that task is never done, so B merges with two red checks, unless the task is closed with ` (not done: …)`. The card says neither. AGENTS.md's "Plain English first" asks the card to open with what failed. The opening paragraph names only one failure.

4. **Non-blocking. One decision-log entry may not be enough.** Option A says: "with one entry in the decision log saying why." SURFACES.md line 120 says of exempt commits: "Each needs its own ledger entry." The code (surface_guard.py lines 115-126) only checks that the cited id exists, so nine lines citing one entry would pass the check. But the stated rule reads as one entry per commit. Either cite a reading that allows a shared entry, or say "nine entries".

5. **Non-blocking. The founding-commit precedent is weaker than the card implies.** Option A says: "as was done for the desk's founding commit." L-0002 exempted a template import "made before agent identities existed". These nine are a mislabel by a known agent. It is fair to cite the mechanism, but the card should not suggest the two cases are alike.

6. **Non-blocking. Two claims have no source.** Option C says: "a few days of work." This estimate has no source. "The nine commits" section (line 16) says each commit "changes only experiments/EXP-007-widget-refresh.md". This sits outside Context and gives no record. Cite the surface_guard run or a `git show --stat`, or move the claim into Context with a source.

7. **Non-blocking. A wording slip for a non-expert.** "Spec" is used in the WHY ("names which spec the work belongs to") but is never explained.

8. **No finding: risk class and default.** R3 is right: the change touches governance/** (risk-paths.toml line 10), and SURFACES.md line 120 says "adding one is R3". The reviews needed are reviewer + owner, which option A reflects. "Reversible" matches L-0002's record, but see finding 1 on what removal actually achieves. DEFAULT none with its stated departure is sound for an owner-approval change. The recommendation, A with C if this will recur, is reasonable once findings 1-3 are fixed.
