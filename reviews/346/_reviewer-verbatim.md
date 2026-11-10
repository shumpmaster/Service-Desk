# The Reviewer's return on PR #346, word for word

Verdict: PASS

**What this means for you.** I found no grounds to reject the change. Letting the Critic read the earlier specs adds exactly the six spec files and nothing else, at each stage where the Critic runs. Nothing the Critic must never see becomes visible, and every governance check passes on a trial merge. There are two catches, both about how the change lands rather than what it does. First, the current description of the pull request it would land in (#346) says that pull request only files a question and changes nothing. That stops being true once this commit is pushed there, so the description must be rewritten before it merges. Second, the record step checks the Critic's pack against the main branch, so this change has to reach main before the Critic's next review of the new spec (S-006). The change is reversible with one revert.

**Note on the checklist:** `docs/archive/OPERATING_MODEL_v2.5.1.md` is not in Service-Desk, and the ledger has no L-0112 (the same gap is noted in reviews/341 and reviews/343). I used `/home/user/Personal-Org-Operating-Model/docs/archive/OPERATING_MODEL_v2.5.1.md` §12 "Reviewer brief", items 1–7.

## 1. Changed (by file)
I changed nothing. My worktrees `rv346/wt` and `rv346/sim` and the temp branch `rv346-sim` are removed, and `git worktree list` shows only the main checkout and the `item` worktree, which isn't mine. Some scratch files are left in `/tmp/claude-0/-home-user/dd663cf2-3046-5c14-ae5c-e5b9fdc3b2db/scratchpad/rv346/`: the entry files, the before and after packs, and `/tmp/claude-0/-home-user/dd663cf2-3046-5c14-ae5c-e5b9fdc3b2db/scratchpad/rv346/checkall.txt`.

## 2. Why
To try to refute commit 4394cbec against the owner's ruling "A: approve the fix (Recommended)" on questions/P-003-critic-superseded-specs.md.

## 3. Verified (evidence per item)

**Item 1 (mechanism): pack builder honours the glob, nothing hidden is exposed. PASS.**
- **Plan review (stage 3).** I ran the pack command on a worktree of origin/item/P-003 (4d09811d) with the entry you gave, `--config` before and after, and `--now 2026-11-10T03:30:00Z`. Both runs returned 0, with 965 files before and 971 after. `diff` of the file lists: `> specs/S-002.md, S-003.md, S-004.md, S-005.facts.tmp, S-005.md, _TEMPLATE.md`. Nothing else differs: BRIEF.md is byte-identical (`cmp` → same), and in the control file only `source_paths` shrinks by those six.
- **Nothing hidden added.** `grep -cE "docs/reports/|docs/briefs/|holdout|-notes\.md$|\.git/"` on the after list gives `0`, though the worktree holds docs/reports/P-003-definer.md and three other files there.
- **Other Critic routes.**
  - checks-to-critic at stage 4: the same six files are added.
  - Discovery readiness check at stage 2 (spec null): those six plus specs/S-006.md.
  - critic-triage and critic-gate have their own PACKS entries and are unchanged.
- **Why S-001 is missing.** specs/S-001.md is 2,170,257 bytes, over RUNNER.toml's `file_bytes = 1048576`, so it is left out (it shows in `source_paths` as `specs/s-001.md`). The ruling record's "S-002 to S-006" is accurate but doesn't say why.
- **Independence.** The Critic's doers are `("definer", "check-author")` (session_runner.py:167). specs/** is the Definer's entire write surface (SURFACES.md `surface:definer` = `specs/**`, `experiments/**`). The extra files are earlier frozen specs and the template, not drafts or reasoning about the work under review. At stage 4 the Check author writes nothing in specs/. At stage 2 the extra specs belong to other items. So I found no current harm (but see N1).

**Item 2 (rulings and charters): nothing forbids it. PASS.**
- AGENTS.md doesn't mention the Critic's pack.
- .claude/agents/critic.md says "Must not see: The writer's drafts and reasoning; the writer's own summary of its work". Frozen earlier specs are neither. Its "May read" list is already narrower than PACKS (it leaves out tests/acceptance, checks, docs/design, research), so it doesn't exclude anything.
- The PACKS comments forbid nothing here. `must_not_see` is unchanged.

**Item 3 (surface): PASS.**
- `surface_guard.py diff --range claude/fervent-pasteur-0rih3z..build/chief-of-staff/critic-specs --branch build/chief-of-staff/critic-specs` → `OK: 1 commit(s) ... checked (0 merge(s) skipped, 0 exempt, 0 human)`, rc=0.
- The range from origin/main gives `OK: 3 commit(s) ... (1 merge(s) skipped ...)`.
- The author is `chief-of-staff <chief-of-staff@agents.invalid>`, the commit has the `Agent-Session: session_01QBwHGN37HCacjWVWzYVhq5` trailer, and `governance/**`, `decisions/**` and `questions/**` are all in `surface:chief-of-staff`.

**Item 4 (simulated merge): PASS.** I made a temp branch from origin/main (1e5670b7) and merged with `git -c user.name=shumpmaster ... merge --no-ff build/chief-of-staff/critic-specs` (97bf4599). `governance/checks/check_all.sh . origin/main` returned 0 with "OK: all governance checks passed." All 25 lines are PASS, including ledger_check, record_checks decisions and v3_checks scope.

**Item 5 (tests): PASS.**
- No test in Service-Desk pins the Critic's pack. The one match, tests/desk/j12-ac60-ac66-estimates.test.mjs:109, is an unrelated fixture.
- In the model repo, the tests check template-v3 rather than this file. `python3 -m unittest test_s010_v3_team` (run from tests/): `Ran 57 tests ... OK (skipped=1)`. `unittest discover -p test_s014_session_runner.py`: `Ran 86 tests ... OK`.
- I applied the model's `test_no_pattern_both_read_and_hidden` rule (its `overlaps()`) to the new Service-Desk PACKS.toml: `overlaps: []`.

**Brief items 2–6:**
- No test files changed.
- No new dependencies, permissions, network calls or data flows.
- No active ruling is violated: the change matches option A word for word, and `must_not_see` is unchanged as the option promised.
- Item 6 (redesigns) does not apply.

## 4. Findings
- **B0 (blocking for the merge, not for this commit). The PR body.** #346 (head cb465fe2, open, not a draft) opens correctly with `## What this means for you`, but it says "This pull request only files the question ... It changes nothing in the desk". Its Tasks list has only "File the question on the Critic's pack", and its Why gives only the instruction to file. With 4394cbec pushed, all three are untrue (AGENTS.md §4: "keep them true as it changes"). The body needs:
  - a new plain paragraph saying the Critic will now be shown the earlier specs;
  - the owner's words in Why;
  - Context for the three failed reviews;
  - a ticked task for the pack change.

  The PR also stops being questions-only: it becomes R3, so asks-merge cannot merge it, and it needs `reviews/346/reviewer.md` and `reviews/346/owner.md` (risk-paths.toml `R3 = ["reviewer", "owner"]`). Merging with the current body would be a FAIL.
- **N1 (non-blocking). Stray Definer files reach the Critic.** Because the glob covers the Definer's whole surface, any scratch file the Definer leaves in specs/ now reaches the Critic. One already has: specs/S-005.facts.tmp, 0 bytes, added by `definer` in 29bc71cd ("definer change set for P-003"). It is harmless today because it is empty. Two possible follow-ups:
  - a must_not_see entry such as `specs/*.tmp`;
  - a cleanup of that file by the Definer's surface.

  Either goes beyond the owner's words, so it needs its own ask.
- **N2 (non-blocking). Ordering.** record_checks reads PACKS.toml from the default tip (record_checks.py:56, 356). A Critic session whose manifest holds specs/S-005.md, recorded before this change reaches main, would be refused. Merge before the next S-006 plan-review dispatch.
- **N3 (non-blocking). L-0040 is missing from this branch.** The new PACKS comment cites L-0040, which is not on this branch. L-0040 does exist in the working tree of `orch/critic-specs-records`, which the main checkout moved to during my review. That matches the L-0037/L-0039 pattern, where the Orchestrator lands the ledger entry separately.
- **N4 (non-blocking). Answer and question in one PR.** The answer and the question's removal land in the same PR that filed the question. AGENTS.md §5 says the answer PR is "opened once the question file is on the default branch". The record admits this, it follows the #343 / L-0039 precedent, and `record_checks decisions` passes.

## 5. Undone
- I did not read the three plan-review texts at 95a631c2 and 965e7f6d. I relied on the question's Context and on the pack measurement.
- No review_check of #346's PR body or verdicts: that runs in CI against a pushed body.

## 6. Needed outside my surface / open questions
1. The Chief of Staff or Orchestrator: rewrite #346's body (B0), record reviews/346/reviewer.md and owner.md, and land L-0040.
2. Should the Critic's glob leave out non-spec files in specs/ (N1)? If so, that needs the owner, since it narrows the approved `specs/**`.
3. Should AGENTS.md §5's "opened once the question file is on the default branch" be enforced, or reworded to allow the same-PR form used in #343 and #346?
4. The Reviewer charter still points at a checklist this repository lacks (L-0112, OPERATING_MODEL v2.5.1).
