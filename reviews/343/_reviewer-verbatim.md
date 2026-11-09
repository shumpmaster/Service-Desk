# The Reviewer's returns on PR #343, word for word

## First return

Verdict: FAIL

The fix itself holds up. The pack-list change in commit 9993def1 does what the owner approved, and I found nothing in it to block. The branch fails for a different reason: after your brief, a second commit, b5fdc9e8 (the ledger entry, register row and digest), was added to build/chief-of-staff/check-author-pack. It is committed as `orchestrator`, and the surface guard that CLAUDE.md requires before accepting a branch rejects it. Checked alone, 9993def1 would be a PASS.

**What this means for you:** the Check author will get its own tests and checks when the Critic sends them back. Its pack goes from 4 files (not counting the library and playbooks) to 23, and the desk's code, the builder's reports, the handover notes and the hidden holdout tests stay out. Before this can land, the ledger commit has to move off the Chief of Staff's build branch. That is a branch change only; no content changes.

## Blocking
**B1. The required surface guard fails on the branch tip.**
- `python3 governance/checks/surface_guard.py diff --range claude/fervent-pasteur-0rih3z..build/chief-of-staff/check-author-pack --branch build/chief-of-staff/check-author-pack` gives: `b5fdc9e8000f: commit by 'orchestrator' on branch build/chief-of-staff/check-author-pack — only 'chief-of-staff' or a human may commit there` and `FAIL: 1 violation(s)`.
- The same range ending at 9993def1 gives: `OK: 1 commit(s) ... checked`.
- The files in b5fdc9e8 are inside the orchestrator's surface, so only the branch is wrong. Fix: move b5fdc9e8 onto an `orch/<task>` branch and land it with its own `--no-ff` merge.
- The governance check run on the simulated merge (item 3) passed, but only because it ran on a temporary branch, not this one.

## Evidence per item
**1. The pack builder honours the new paths and still keeps hidden files out — PASS.**
- How the pack is built: `cmd_pack` in session_runner.py keeps a file when it matches what the role may read, and drops it if it matches `must_not_see`. `always_out()` always drops `.git`, `governance/HOLDOUTS.md` and `holdouts/**`, after Unicode normalising and case folding. Links and hard-linked files are never copied.
- `build_tree` in orchestrator_git.py builds the source from main's tip, then this item's changes, then the role branch. The pack's configuration defaults to that tree's `governance/` folder, so the fix takes effect as soon as it is on main.
- I ran your pack command for P-003 / checks-fail / S-005 against origin/item/P-003:
  - With main's governance: 4 files besides the library and playbooks (agent file, BRIEF.md, specs/S-005.md, reviews/S-005/_critic-checks.md); 112 in total.
  - With the branch's governance: 23 files; 131 in total. The 19 added files are checks/S-005/mutants.md and rubric.md, tests/acceptance/README.md, tests/acceptance/S-005/README.md, and 15 scripts in tests/acceptance/S-005.
  - Neither pack has any src/, docs/reports/, docs/handover/ or holdout file in it.
- The production path gives the same result. I ran `orchestrator_git.py tree --item P-003 --role check-author --ref S-005` with origin/main and then with the simulated merge as main, and packed with the default configuration. Result: 4 and 23 files, and the merged pack's file list is identical to the one above.
- I planted test files in a scratch copy of the tree. Excluded: holdouts/S-005/h.test.mjs, a hard link to a src/ file, and a symlink to src. Packed: checks/S-005/HOLDOUTS.md (see N3).
- `manifest_problems`, which checks a finished pack against what the role may read: against main's pack list it reports 19 problems (`checks/S-005/mutants.md is outside what check-author may read...`); against the branch's list, 0.
- The ruling's "4 before, 23 after" is confirmed. The question file said 22.

**2. Nothing forbids the Check author reading its own checks, and nothing it must not see is newly exposed — PASS.**
- .claude/agents/check-author.md says "Never sees work products" and lists them as src/**, docs/handover/** and any builder return; that list is unchanged. "Never: edit a check once locked" does not conflict: the checks only lock when the Critic passes them, and route checks-fail sends them back before that.
- AGENTS.md line 51 ("never shares a session with the builder it tests") is unaffected.
- The PACKS.toml comment "Any work product." still matches `must_not_see`.
- Only the Check author writes tests/acceptance/** and checks/** (governance/SURFACES.md), so everything newly exposed is its own output and never the builder's.
- Other specs' checks: main has none today (`git ls-tree -d origin/main tests/acceptance/ checks/` is empty). Once specs land, their checks will be included too. This does not matter for independence: they are Check author output, the Builder, Critic and Reviewer already read them, and a fix spec needs the checks of the spec it fixes.

**3. Governance checks on a simulated merge into main — PASS.**
- I branched a temp branch from origin/main, merged the branch with `--no-ff` as shumpmaster, and ran `check_all.sh . origin/main`. Exit 0, all 25 checks PASS (`OK: all governance checks passed.`).
- The merge adds 8 files, including the base's handoff and session lines.
- Cleaned up afterwards: the temp branch and both of my worktrees are removed. Nothing was pushed.

**4. Tests that fix the Check author's pack contents — none here.**
- Service-Desk has no test that reads its PACKS.toml. The one match, tests/desk/j12-ac60-ac66-estimates.test.mjs:109, is fixture data.
- The model's tests check template-v3/governance/PACKS.toml, not this repository. I ran `test_s014_session_runner` and `test_s010_v3_team` from /home/user/Personal-Org-Operating-Model/tests: `Ran 143 tests ... OK (skipped=1)`. This branch changes neither.

**Pull request body.** The body of #343 (head claude/fervent-pasteur-0rih3z, open) starts with `## What this means for you` and a plain paragraph, so it meets the rule. It now needs rewriting, because it still says "This pull request holds only the session's handoff and lines. Nothing in the desk changes", and this R3 change will land in it.

## Non-blocking
- **N1.** The "May read" line in .claude/agents/check-author.md still says "The library; the playbooks." It now lists less than PACKS.toml gives the role. The critic's agent file lags PACKS.toml in the same way already.
- **N2.** The paths could be narrowed to `tests/acceptance/{spec}/**`, `tests/acceptance/README.md` and `checks/{spec}/**`. That would keep packs smaller once more specs land, but it would hide from a fix spec the checks of the spec it fixes, so the broad form is defensible.
- **N3.** The holdout exclusion works by path only. A file named HOLDOUTS.md inside checks/ was packed, and the Critic and Builder packs have the same gap. Only the Check author can write there, and the file holds fingerprints, not tests.
- **N4.** The ledger's "orchestrator run 847" is correct: `gh api .../actions/runs/42640235485` returns run_number 847.

## Open questions
1. Has the Chief of Staff raised the same gap in the model's template-v3/governance/PACKS.toml? Option A included that, and I found no record of it yet.
2. Should the Check author's agent file be updated to match (N1), and by whom? .claude/** belongs to the orchestrator, and the role card lives in the model.
3. The reviewer checklist path given to me, docs/archive/OPERATING_MODEL_v2.5.1.md, does not exist in Service-Desk, which runs model version 3.7.2 (governance/OPERATING_MODEL_VERSION). I found no L-0112 in docs/LEDGER.md either. I used /home/user/Personal-Org-Operating-Model/docs/archive/OPERATING_MODEL_v2.5.1.md §12 (its reviewer brief) instead.

Files: /home/user/Service-Desk/governance/PACKS.toml, /home/user/Service-Desk/decisions/questions/P-003-check-author-pack.md, /home/user/Service-Desk/docs/LEDGER.md, /home/user/Service-Desk/.claude/agents/check-author.md, /home/user/Service-Desk/governance/checks/session_runner.py, /home/user/Service-Desk/governance/checks/orchestrator_git.py. A worktree at /tmp/claude-0/-home-user/dd663cf2-3046-5c14-ae5c-e5b9fdc3b2db/scratchpad/item was already there before my review; I left it alone.

## Re-check, after the branch split

Verdict: PASS. The branch fix clears B1, and the ledger, register and digest commit moved over with no change to its content.

**Re-check (B1):**
- **The two branches:** `build/chief-of-staff/check-author-pack` now ends at 9993def1. `orch/check-author-pack-records` is at 1310a7e0, committed by `orchestrator <orchestrator@agents.invalid>`, and its parent is 9993def1.
- **Surface guard on the Chief of Staff's branch:** `surface_guard.py diff --range claude/fervent-pasteur-0rih3z..build/chief-of-staff/check-author-pack --branch build/chief-of-staff/check-author-pack` gives `OK: 1 commit(s) ... checked (0 merge(s) skipped, 0 exempt, 0 human)`.
- **Surface guard on the orchestrator's branch:** `surface_guard.py diff --range build/chief-of-staff/check-author-pack..orch/check-author-pack-records --branch orch/check-author-pack-records` gives `OK: 1 commit(s) ... checked (0 merge(s) skipped, 0 exempt, 0 human)`.
- **Content unchanged:** `git diff b5fdc9e8 1310a7e0 | wc -l` is 0, so the two trees are identical.

The rest of my first report still stands. With the two paths added, the Check author's pack goes from 4 files to 23. The desk's code (src/), the reports, the handover notes and the holdouts stay out. On the simulated merge, `check_all.sh` passed all 25 checks.

The ruling itself did not change, and the merged tree equals the one I checked. So I did not re-run check_all or rebuild the packs for this re-check.

**Before merge:**
- **Landing order:** merge `build/chief-of-staff/check-author-pack` and then `orch/check-author-pack-records`, each with `git merge --no-ff`.
- **PR #343:** its body still says "Nothing in the desk changes". It needs rewriting, because this R3 change now lands in that pull request.

**Open questions:** you've closed them. The model's template is LL-043 in Personal-Org-Operating-Model PR #53, N1 goes to the handoff, and the checklist path is a known carried item.
