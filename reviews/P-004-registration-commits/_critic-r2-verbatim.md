# The scope-check question — the Critic's round 2, verbatim

Read: questions/P-004-registration-commits.md at a970f92 (orch/p004-discovery). Round 2 of at most
3 (D-044). Recorded by the orchestrator, session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-05.

---

Verdict: PASS

Round 2 of 3: the card at a970f92 answers all seven round 1 findings. Two new findings remain, both non-blocking. I read the card cold again and accept the facts you checked for me (in reviews/P-004-registration-commits/_critic-r1-verbatim.md). No finding implicates an earlier check of mine (D-050).

**Round 1 findings**
1. Answered. Option A now says the surface check also skips the nine, that only its past run shows they passed, and that removing them later changes nothing once #300 is merged. See new finding 9 for an overreach this introduced.
2. Answered. The WHY now says the check "never accepts" P-004 and that "no file written later can change that". This matches Context line 17.
3. Answered. The WHY now opens with "Two of the desk's checks fail" and names the second one. Option B now says the task is closed with a reason, so "only the scope check stays red".
4. Answered. The card now says "each with an entry in the decision log", matching Context line 20.
5. Answered. The card now says "a different case", and Context line 21 gives L-0002's reason.
6. Answered. "A few days of work" is gone. The claim about the nine commits is now in Context line 18, with `git show --name-only` as its source.
7. Answered. "Spec" is now explained: "the written plan for built work (a spec, numbered S-001 and so on)".

**New findings**
9. **Non-blocking. Option A now claims too much.** It says: "From then on every check that walks commits skips these nine, not only the scope check." Only two checks read the exempt list: the scope check (v3_checks.py lines 1508 and 1521) and the surface check (surface_guard.py lines 290 and 311). Other commit walks do not skip the nine: check_decisions (record_checks.py line 439), the milestone walk (v3_checks.py line 1800) and presence_notes (v3_checks.py line 2319). Context line 20 names exactly the two that skip, so A contradicts the card's own Context. The overclaim errs toward caution, so it does not mislead about risk. Better wording would be "the scope check and the surface check both skip these nine". The same goes for "the desk's list of commits its commit checks skip".
10. **Non-blocking. Option C leaves out the owner's own approval.** It says C "needs its own written plan, the Critic's check and the Reviewer's". Changing governance/checks/** is R3 under governance/risk-paths.toml (line 10, `governance/**`), and an R3 change needs the reviewer and the owner (line 36). So the owner's own approval is a cost of C, too.

**Risk and reversibility**
R3 is still right, and so are "reversible" and DEFAULT none with its stated reason. The recommendation (A, then C if this will recur) is sound and supported by Context lines 18-20.
