Verdict: PASS

The Reviewer's verdict on PR #300 (R3: governance/SURFACES.md's exempt block gains the nine plan-writer commits of EXP-007, L-0023 to L-0031, the owner's answer "Exempt the nine commits (Recommended)"), verbatim below. Finding 4's wording fault in the register row was fixed after it. Recorded by the orchestrator, session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-05. Note, 2026-11-06: main took L-0023 for the model 3.7.2 sync while this PR was open, so the nine entries were renumbered L-0024 to L-0032 at the merge of main; the verdict below names their earlier numbers.

---

Verdict: PASS

The R3 change does what the owner chose: nine exempt lines, nine ledger entries, one register row and a regenerated digest. Nothing else is exempted, and nothing under src/ changes. I found no blocking defects. One non-blocking wording fault in the register row should be fixed before merge.

I tested "before" in a throwaway local clone, checked out at a9b3870^ (68148cb, the commit before the SURFACES change). The repo under review was not touched.

1. **The nine shas: correct (non-blocking, no defect).** `git diff origin/main..HEAD -- governance/SURFACES.md` adds exactly 9 lines, L-0023 to L-0031, under the existing c1c9a56 L-0002 line. `git log --format='%h %an' --all -- experiments/EXP-007-widget-refresh.md` lists exactly 9 commits, all by definer: 57c024b, 3dd65a5, e11b6f4, ddc67fb, 7fdeedc, 514675d, 389dd68, 4184785, ad2709e — the nine exempted shas. `git show --name-only --format='%an %ae %H'` on each gives `definer definer@agents.invalid <full sha>` and only `experiments/EXP-007-widget-refresh.md`, with trailers `Spec: P-004` and `Agent-Session:`. No other sha was added. The SURFACES commit a9b3870 is by chief-of-staff and the ledger commit b6e6c6f by orchestrator; neither is exempt, and both pass surface_guard.

2. **The ledger entries: correct (non-blocking, no defect).** `git diff origin/main..HEAD -- docs/LEDGER.md` has no `-` lines. ledger_check: "OK: docs/LEDGER.md has 31 well-formed entries; append-only since the base ref". IDs L-0023 to L-0031, sequential after L-0022, no gaps or repeats. Each entry's decision names the full sha its SURFACES line pairs with; all nine pairs match. Fields follow L-0002 and L-0022. Cosmetic only: L-0023's title has nested brackets, "(EXP-007 draft 1 (its pre-registration))".

3. **The other checks: correct (non-blocking, no defect).** Before the exemption, at 68148cb: `surface_guard.py diff --range origin/main..build/definer/p004-widget-exp --branch build/definer/p004-widget-exp` gives "OK: 9 commit(s) … checked (0 merge(s) skipped, 0 exempt, 0 human)". At HEAD, the same command gives "OK … 9 exempt". At HEAD, `v3_checks.py scope --base origin/main` gives "OK: every spec-scoped commit stays inside its spec's Areas touched" (9 exempt), exit code 0.

4. **The register row: the scope claim is true; one phrase is not (non-blocking).** Before, at 68148cb, `v3_checks scope` gives "FAIL: 9 violation(s)", each "Spec: P-004 names no spec file in specs/ at that commit"; after, it passes; surface_guard diff passes both before and after. "No other check result changed" is false: the check_all summaries differ in `review_check pr 300` (PASS before, FAIL after) as well as `v3_checks scope`, because the risk class rose from R0 ("Required reviews: none") to R3 ("missing reviews/300/owner.md, reviews/300/reviewer.md"). Expected, and clears once the verdicts are recorded, but the sentence is not true. Suggested wording: "…no other check result changed apart from the PR's risk class rising to R3".

5. **The digest: correct (non-blocking, no defect).** `python3 governance/checks/digest.py check` gives "OK: docs/DIGEST.md and 3 scope pack(s) match docs/LEDGER.md". DIGEST.md reads 29 active rulings from 31 entries and gains a P-004 section; digest/p-004.md is new. Cosmetic: the generator's cut-off makes "… …" where the quoted text already holds an ellipsis.

6. **The full governance run: only expected failures (non-blocking).** `governance/checks/check_all.sh . origin/main 300` fails 2 of 25 steps: review_check pr 300, only on the missing reviews/300/owner.md and reviews/300/reviewer.md; and v3_checks trace, 9 violations "sprint PR #40/#41/#44/#52/#72/#74/#75/#77 has no merge commit reachable from HEAD", the shallow-clone limit (`git rev-parse --is-shallow-repository` gives true), the same 9 before the change. record_checks merges passed locally. Everything else passed.

7. **The rest of the PR: records only (non-blocking, no defect).** `git diff --stat origin/main..HEAD -- src` is empty. Every changed path outside reviews/, docs/handoff/, questions/ and experiments/ is part of the R3 change: governance/SURFACES.md, docs/LEDGER.md, docs/IMPROVEMENT_REGISTER.md, docs/DIGEST.md, digest/p-004.md. The handoff records the owner's answer verbatim, matching option A in questions/P-004-registration-commits.md, which the Critic passed. Option A's "each with an entry in the decision log" matches the nine entries; an older handoff paragraph saying "one ledger entry" is superseded by the question as asked.

Open questions: none blocking. Fix the wording in finding 4 before the owner merges.
