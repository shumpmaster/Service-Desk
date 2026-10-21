# Setup CS24 (risk-paths: src/lib/j22.js R3): the Reviewer's round-1 report, verbatim

Dispatched by the orchestrator on 2026-10-21 against origin/build/chief-of-staff/cs24-rule0-r3 at f654125 (pull request #174, closed and re-opened from this branch).

---

Verdict: FAIL

The one-line change is correct, and leaving out the imports is acceptable. The FAIL rests only on the owner-facing "What this means for you" paragraph: it promises the owner more coverage than the change gives. Changing the wording of the PR body is enough to fix it. The diff itself needs no change.

**Finding 1 (blocking): two sentences in the PR body (#174) are inaccurate.**
- "any future change to the code that decides whether a pull request is 'with the agents' needs your verdict". Not quite true. Rule 0's part (ii) turns on `verdictWord`, which reads each verdict through `verdictOf` from src/lib/j11.js. src/lib/records.js `classifyPull` picks which heads get an owner check, through `ownerCheckHeads`. Both files stay R1 (`review_check.py classify src/lib/j11.js` → R1, `src/lib/records.js` → R1). So a change to j11.js can change what rule 0 decides without the owner's verdict.
- "as the other code your phone's notification sender runs already does". False. The sender already imports R1 modules directly: src/notify/collect.mjs:6-10 imports model.js, cos.js, waiting.js, asking.js and prfiles.js; grant.mjs:8 imports pulls.js; costs.mjs:6 and sender.mjs:16 import usage.js. The spec says this outright in Risks ("the limit, stated plainly", S-001 on orch/desk-v2, around line 13681): "`src/lib/**` is not R3 … a routine change there reaches Service-Desk's sender on its next run with the Reviewer's review only".
- The PR's "Why" section does say the imports stay ordinary paths. But the owner approves an R3 change on the plain paragraph, and that paragraph claims the opposite.
- Suggested fix: say the change makes j22.js itself need the owner's verdict, as src/notify/ and the two CS23 modules already do. Then add one plain sentence: the smaller files it uses (j11.js, records.js, prfiles.js), like the rest of src/lib/ the sender runs, still need only the Reviewer.

The rest of the paragraph checks out:
- "Nothing failed or was skipped": true. check_all exited 0, every line read PASS, and there were no FAIL or SKIP lines.
- "Stage 1b can't open until this lands": true. CS24 says "Before stage 1b's pull request", and the stage table at line 1813 lists Setup CS24 as a precondition for 1b.
- "needs your verdict": true. governance/** is R3, and `classify governance/risk-paths.toml` → R3.
- "reversible": true. It is a one-line revert, which itself would be R3.

**Does the change do what CS24 asks?** Yes. CS24 (S-001 on orch/desk-v2, line 12476) asks for "the path of J22's rule 0 module under `src/lib/`" to go on the R3 list, as CS23 did. The diff (f654125) adds exactly `"src/lib/j22.js"` to `[classes] R3`, with a comment citing CS24. Nothing else changes. `ruleZero` (line 444) and `ownerCheckHeads` (line 471) are both in src/lib/j22.js on orch/desk-v2. The sender imports from `../lib/`, so src/lib/ (not src/public/lib/) is the copy it will run.

**Is leaving the imports out a real gap?** It is a real gap, but a known and accepted one. It should not block this PR.
- **The real part:** j22.js pulls in j11.js directly and, through records.js and prfiles.js, pulls.js as well; pulls.js also imports j11.js. That is 4 R1 files. If `verdictOf` started reading PASS as FAIL, rule 0 would keep a pull request "with the agents" and the phone would not alert: a missed notification. And any module the sender loads runs in the same process as the secrets.
- **Why it is acceptable:**
  - The spec's Risks section deliberately keeps `src/lib/**` off R3 because it is most of the desk's code, and the stated mitigation is that the Reviewer's brief says the sender runs src/lib/ code with the secrets.
  - CS23's reviewer (reviews/130/reviewer.md) passed the same weak spot (ledgergrant.js uses `pyStrip` from pulls.js), within that accepted limit.
  - Listing j22's imports alone would not close the gap. The sender already runs other R1 modules today (model.js, waiting.js, prfiles.js, pulls.js and others). Closing it properly means making the whole set of src/lib/ files the sender loads R3, which is the decision the spec turned down.
- So it is acceptable by precedent and by the spec. If the owner wants it closed, that is a new question for the spec (an amendment to Risks), not a fix to this PR.

**Does the glob match?** Yes, it is an exact path.
- `classify src/lib/j22.js` → R3.
- `src/lib/j22.jsx` → R1 and `src/lib/sub/j22.js` → R1, so it catches nothing else.
- `src/public/lib/j22.js` → R1, but the sender never loads it, it is byte-identical on orch/desk-v2, and src/tools/build.mjs fails stale copies. This is the same as under CS23.
- j22.js isn't on main yet (stage 1a lives on orch/desk-v2). Adding the R3 line ahead of the file is harmless, and review_check lint passes.

**Checks** (worktree at origin/build/chief-of-staff/cs24-rule0-r3, since removed):
- `GOV_BRANCH=build/chief-of-staff/cs24-rule0-r3 GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main` → exit 0, "OK: all governance checks passed". All 25 summary lines are PASS, including the surface_guard diff and review_check lint.
- `python3 governance/checks/review_check.py classify src/lib/j22.js` → `src/lib/j22.js: R3`.

**Note (non-blocking):** commit f654125 has an `Agent-Session:` trailer but no `Spec: S-001` trailer, which CLAUDE.md asks for. CS23's commit 2462c1f has the same gap, and no check catches it.

**Open questions**
1. Does the owner want the spec's "src/lib/** is not R3" limit looked at again, now that a decision affecting notifications (rule 0) rests on `verdictOf` in an R1 file? That would be a spec amendment, not part of this PR.
2. If stage 1a's pull request renames the module before it merges, this line has to follow it.
