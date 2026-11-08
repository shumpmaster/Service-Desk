# PR #328 — the Reviewer's returns, verbatim

Read: first check at build/chief-of-staff/definer-join-up-form 91f3ee4; second check at claude/epic-turing-vesqe7 5c35dd5, against origin/main 7382a55. Recorded by the orchestrator, session session_01QBwHGKhJ6vt6gamzfUwHwc, 2026-11-08. The short record is reviews/328/reviewer.md.

## Second check (the verdict of record)

Verdict: PASS

The re-landed change fixes both earlier findings. The surface guard now passes, the recorded pack sizes reproduce exactly, and every governance check and all 1569 tests pass on a merge with current main. One thing is still unchecked: the pull request does not exist yet. It must open with `## What this means for you` and a plain paragraph, or it fails review.

## Blocking
None.

## B1 (the guard failure) is resolved
- **The branches.** The build branch `build/chief-of-staff/definer-join-up-form` now holds only 1e9b909 (chief-of-staff). That commit holds just PACKS.toml and the ruling record, both chief-of-staff's surface. It is merged with `--no-ff` into `claude/epic-turing-vesqe7` (1cb7a48, orchestrator). The orchestrator's records follow in 5c35dd5 (ledger, register, digest), and every file is on the surface of the identity that committed it.
- **The surface guard.**
  - `surface_guard.py diff --range gh/main..claude/epic-turing-vesqe7 --branch claude/epic-turing-vesqe7` gives `OK: 4 commit(s) … checked (1 merge(s) skipped, 0 exempt, 0 human)`.
  - The guard on the build branch alone, named as itself, gives `OK: 1 commit(s)`.
- **check_all, with `GOV_BRANCH=claude/epic-turing-vesqe7 GOV_DEFAULT_BRANCH=main`, against current main (7382a55):**
  - On a local `--no-ff` merge into main: exit 0, "OK: all governance checks passed."
  - On the bare branch: exit 1, the only FAIL being `record_checks merges`. It reads the first-parent commits (a3af5ee, 1cb7a48, 5c35dd5), which have no `Item:` trailer. This does not block: the workflow's pull-request run uses `actions/checkout` with no `ref:`, so CI checks the merged tree. #325 and #327 landed the same way.
- **Tests.** `npm --prefix src test` on the merged tree: `# tests 1569`, `# pass 1569`, `# fail 0`.
- **Main's movement.** Since 65e0c00, main has changed only `status/**` and `dispatch-log/**` (one orchestrator pipeline run), so there is no overlap and no clash of ledger numbers.

## N1 (the pack sizes) is resolved
- I rebuilt the Definer pack (P-003, plan-fail, stage 3, S-005, dummy MODEL_* values) from main's tree at 65e0c00 and from the branch tip 5c35dd5. It gives 119 → 120 files, as L-0037 and the register row now say.
- The only added file is `docs/design/JOIN_UP_REVIEW.md`, and the other 119 are byte-identical.
- The 116/117 note credited to the Reviewer is accurate. The three-file gap is `decisions/P-003/*.md` and `docs/projects/P-003.md`, which item/P-003's tree lacks.
- The pack holds no `-notes.md` file.

## Unchanged from the first review, still sound
- **The TOML change.** It parses, the Definer's `may_read` gains only that file, and no `must_not_see` or holdout rule changes.
- **No leak.** The form is a blank template: no hoped-for answer, no holdout, no notes.
- **The records.** The ruling record, the owner's verbatim words, and L-0037's fields and citations are accurate. It is R3 with the owner's logged approval.

## Non-blocking
- **N3. The question file was not filed first (AGENTS.md §5).** This stands as before: disclosed, reversible, and the owner's words are verbatim. It is the second such slip, after c3bc37d, and is worth an improvement-register row if it happens again.
- **N4. The handoff commit is in the range.** a3af5ee (`docs/handoff/2026-11-08-chief-of-staff-p002-20.md`) is unrelated to the pack fix.
  - It says the Chief of Staff wrote it but is committed by orchestrator. That matches the surface (`docs/**`) and the part 18 and 19 handoffs on main.
  - It says the pack fix is "Not made", which was true when written and is overtaken by this pull request. The body should mention that the handoff is included.

## Six-part contract
- **Changed:** nothing. All runs were in the scratchpad (clone, trees, packs). The repository was not fetched into or modified.
- **Why:** an R3 re-review after B1 and N1.
- **Verified:** the commands and outputs above. The logs are in the scratchpad.
- **Undone:** the PR-body check. No pull request exists yet for `claude/epic-turing-vesqe7`; the REST lookup found none, only the closed #327 under another head. Still to check once it is open:
  - The plain-English opening paragraph. Under my instructions, the pull request fails review without it.
  - The `Milestone:`, `## Context`, `## Why` and `## Tasks` sections.
  - That the body does not end with lines of the form `Word: value`.
- **Needed outside my surface:** the orchestrator opens the pull request with that body and records this verdict verbatim in `reviews/<PR>/reviewer.md`. The owner merges, as L-0037 says.
- **Open questions:** whether the handoff commit a3af5ee should ride in this pull request, or whether the owner would rather review it apart from the R3 change.

## Files
- /home/user/Service-Desk/.github/workflows/governance.yml
- /tmp/claude-0/-home-user/161f3db7-af12-5489-9522-48471d435ab8/scratchpad/rev/re-bare.txt
- /tmp/claude-0/-home-user/161f3db7-af12-5489-9522-48471d435ab8/scratchpad/rev/re-merge.txt

## First check (superseded by the second)

Verdict: FAIL

The Definer's pack fix works: its pack gains that one file, nothing else in it changes, and the form leaks nothing it should not see. It fails because the surface guard you asked me to run fails: `surface_guard.py diff --range origin/main..build/chief-of-staff/definer-join-up-form --branch build/chief-of-staff/definer-join-up-form` gives `91f3ee4615a9: commit by 'orchestrator' on branch build/chief-of-staff/definer-join-up-form — only 'chief-of-staff' or a human may commit there`, `FAIL: 1 violation(s)`. CI will fail the same way if the pull request is opened from this branch. The claimed "check_all passes" was run without the branch name set, which is how it missed this.

I could not use the checklist I was told to follow: `docs/archive/OPERATING_MODEL_v2.5.1.md` is not in this repository (no `docs/archive/` folder), and the ledger stops at L-0037, so L-0112 does not exist here either. I reviewed against AGENTS.md §1, §4 and §5, the CLAUDE.md landing steps and your brief.

## Blocking
**B1. The orchestrator's commit is on the Chief of Staff's build branch.**
- Each file was written by its owner: PACKS.toml and the ruling record by chief-of-staff, which owns `governance/**` and `decisions/**`; the ledger, register and digest by orchestrator, which owns `docs/**` and `digest/**`. Only the build-branch rule breaks.
- CI sets the branch to the pull request's head branch (`.github/workflows/governance.yml:76`), and `check_all.sh:98` passes it to the guard.
- I ran check_all on a scratch clone:
  - Bare branch, branch name set as CI does: exit 1, the only FAIL being `surface_guard diff --range`. `record_checks merges` passes this way.
  - Bare branch, no branch name: exit 1, the only FAIL being `record_checks merges`. This is the claimed failure.
  - Local `--no-ff` merge into origin/main, no branch name: exit 0. This reproduces the claim.
  - Same merge, branch name set: exit 1, `surface_guard diff` FAIL.
- The #320 precedent does not cover this. There the orchestrator's records (and chief-of-staff's 1512b36) were on `orch/exp-008-registration`, where the build-branch rule does not apply.
- Possible fixes, for you to do: keep only 1e9b909 on the build branch; put the ledger, register and digest commit on an `orch/<task>` branch that merges the build branch with `--no-ff`; open the pull request from that `orch/` branch.

## Non-blocking
- **N1. The pack sizes don't reproduce.** Ledger L-0037 and the register row both record 119 → 120. Built from origin/item/P-003's tree with `MODEL_DEFINER`/`MODEL_CRITIC` set to dummy values, I get 116 → 117 in two ways: P-003's own PACKS.toml with only the new line added, and main's PACKS.toml against the branch's. The +1 is right: the only added file is `docs/design/JOIN_UP_REVIEW.md`, and every other file is byte-identical. The control files differ only in manifest and source_paths. The 119/120 source tree is not named, so the recorded figures can't be reproduced from committed trees. Name the source, or record the delta.
- **N2. A wrong comparison is easy here.** item/P-003's PACKS.toml is older than main's: it lacks `docs/projects/**` and `docs/projects/{item}.md` in about ten places. Dropping the branch's whole PACKS.toml into P-003's tree changes far more than one line. My comparisons kept that apart.
- **N3. The question file was not filed first (AGENTS.md §5).** I judge this non-blocking:
  - The owner's consent is recorded verbatim.
  - The change is reversible.
  - The slip is disclosed in both the ruling record and L-0037.
  - `governance_checks all` passes.

  It is the second such slip, though: c3bc37d, `P-003-third-review-timing.md`, did the same. A register row or a process fix should follow if it happens again.

## What I checked
- **The TOML is valid.** It parses with tomllib, and `[roles.definer].may_read` is `['specs/**', 'library/patterns/**', 'docs/design/JOIN_UP_REVIEW.md']`.
- **Nothing is weakened.** The only change to PACKS.toml is that line. `must_not_see` (empty for the Definer) is unchanged. The builder's holdout exclusions (`governance/HOLDOUTS.md`, `holdouts/**`) and every other role are unchanged.
- **No leak.** `JOIN_UP_REVIEW.md` is a blank form: placeholders, a five-row check table, and a sign-off pointing to the gate's decision record. It holds no hoped-for answer, no holdout and no reference to any `-notes.md` file. Only the one file was added, not `docs/design/**`, so the screens, references and audits stay out.
- **The basis holds.**
  - The Critic's charter requires the section in that form (`.claude/agents/critic.md` line 16).
  - On item/P-003, `reviews/S-005/plan.md` is a FAIL, finding 1 being "does not follow the form".
  - `specs/S-005.md:148` and `:219` say the form was not in the Definer's pack.
  - `triage/P-003.md` finding 1 says the same of S-004.
  - The owner's words are verbatim in the ruling record ("Orchestrator kicked off, i approve the fix"), and L-0037 quotes part of them.
  - M4 exists in `docs/projects/P-003.md` §3.
  - L-0037 has every field and matches the record. The register row is well-formed.
  - `ledger_check` and `digest check` pass, so the digest is regenerated correctly.
- **Risk class.** `governance/**` is R3 (`governance/risk-paths.toml:10`): owner approval, which is given and logged.
- **Commit identities.** Both commits use `<id>@agents.invalid` with an `Agent-Session:` trailer and carry no model names.

## Six-part contract
- **Changed:** nothing. All work stayed in the scratchpad (scratch clone and pack builds).
- **Why:** an R3 review, trying to refute the change.
- **Verified:** the surface guard (FAIL above), the four check_all runs above, and the pack builds (`session_runner.py pack --entry {"item":"P-003","route":"plan-fail","action":"dispatch","role":"definer","stage":3,"spec":"S-005","gate":null}`).
- **Undone:** the PR-body check. There is no pull request for this branch yet (the GitHub REST lookup returned none), so I could not check that its body opens with `## What this means for you` and a plain paragraph. Its Milestone, Context, Why and Tasks sections are unchecked too. Whoever opens it must include them; without that opening paragraph the pull request fails review.
- **Needed outside my surface:** the orchestrator re-lands per B1; whoever wrote the ledger corrects or explains N1's 119/120 in a new entry or the register.
- **Open questions:**
  1. Which source tree gave 119 and 120?
  2. Should the pull request come from an `orch/` branch, which is the usual path, or should the orchestrator's records go in a follow-up pull request?
  3. Where is the v2.5.1 §12 checklist I was told to use? It is not in this repository.

## Files
- /home/user/Service-Desk/governance/PACKS.toml (on the branch)
- /home/user/Service-Desk/governance/SURFACES.md
- /home/user/Service-Desk/governance/checks/check_all.sh
- /home/user/Service-Desk/.github/workflows/governance.yml
- /tmp/claude-0/-home-user/161f3db7-af12-5489-9522-48471d435ab8/scratchpad/rev/ca-bare.txt
- /tmp/claude-0/-home-user/161f3db7-af12-5489-9522-48471d435ab8/scratchpad/rev/ca-bare-nobranch.txt
- /tmp/claude-0/-home-user/161f3db7-af12-5489-9522-48471d435ab8/scratchpad/rev/ca-merge.txt
- /tmp/claude-0/-home-user/161f3db7-af12-5489-9522-48471d435ab8/scratchpad/rev/ca-merge-br.txt
