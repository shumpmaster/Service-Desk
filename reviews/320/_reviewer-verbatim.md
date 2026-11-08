# PR #320 — the Reviewer's return, verbatim

Read: claude/vigilant-babbage-8d30jm at f0b0d43, against origin/main cf2cdaa. Recorded by the
orchestrator, session session_01QBwHGJ3CcwMQ1i8bkydhLN, 2026-11-07. The short record is
reviews/320/reviewer.md.

---

Verdict: PASS

I reviewed PR #320 at head f0b0d436a5bfa5763a50c9ef9aaaf58b1f402a38 against origin/main (cf2cdaa, which is also the merge base). No blocking finding. I changed no files: the worktree had 0 lines in `git status --porcelain` throughout. I ran my probes in a scratch clone at /tmp/claude-0/-home-user/2cab7625-2add-5776-84d3-aba440250a8f/scratchpad/reviewer2/sd, and the full check_all output is at /tmp/claude-0/-home-user/2cab7625-2add-5776-84d3-aba440250a8f/scratchpad/reviewer2/checkall.txt.

**Findings**

1. **Exempt lines: hold (non-blocking).**
   - The only change to governance/SURFACES.md is three added lines, 136-138: `712c951f164f5b5344106acb9f2ec237afb94436 L-0034`, `cd98e5f08cdfce990360dd0b3cc5958ccb3bc6ca L-0035` and `9328cfc05dcd76898f9869693386c52f99dc0521 L-0036`. Nothing else in the block changed.
   - Each of the three commits is on this branch and changes only experiments/EXP-008-widget-refresh-documents.md (`git show --stat`: 475+, 553+/336-, 295+/123-).
   - Each is authored and committed as `definer <definer@agents.invalid>`. `git interpret-trailers --parse` shows only `Agent-Session: session_01QBwHGJ3CcwMQ1i8bkydhLN` on each, with no Spec: trailer.
   - **Before the exemption:** in the scratch clone at a39b3aa (no exempt lines), `surface_guard.py diff --range origin/main..a39b3aa --branch build/definer/p004-exp008` gives "OK: 4 commit(s) … (1 merge(s) skipped, 0 exempt, 0 human)".
   - **Ledger:** main's latest entry is L-0033, so L-0034 is the next free ID. There are no duplicate IDs. `ledger_check.py check` gives "OK: docs/LEDGER.md has 36 well-formed entries".
   - **Width of the exemption:** ruling A (decisions/questions/P-004-result-spec.md:1 and :8) says "its written plan's commits … are handled the same way". The three exempted commits are exactly the Definer's plan commits. The Builder's widget commits (92caf00 and others) are not exempted and are not on this branch.

2. **Measurements: hold (non-blocking).**
   - **Scope at HEAD:** `v3_checks.py scope --base origin/main` exits 0, with the 3 exempt commits skipped and "OK: every spec-scoped commit stays inside its spec's Areas touched".
   - **Scope without the exempt lines** (scratch clone at a39b3aa, origin/main set to cf2cdaa): exactly 3 violations, then "FAIL: 3 violation(s)", exit 1:
     - "712c951f164f: builder commit by 'definer' has no Spec: trailer"
     - "cd98e5f08cdf: … no Spec: trailer"
     - "9328cfc05dcd: … no Spec: trailer"
   - **Scope at 1512b36** (the exempt lines added): passes.
   - **Surface guard at HEAD:** `surface_guard.py diff --range origin/main..HEAD` gives "OK: 8 commit(s) … (2 merge(s) skipped, 3 exempt, 0 human)".
   - **check_all:** `bash governance/checks/check_all.sh . origin/main` exits 1. Every step passes except one: "FAIL record_checks merges --base origin/main". It flags a39b3aa and f0b0d43 as orchestrator commits with no Item: trailer that touch paths outside status/**, dispatch-log/** and queue/**.

3. **The record_checks merges FAIL is an artifact of running locally, not a defect of this PR (non-blocking).**
   - **Why:** locally HEAD is the branch tip, so the check walks the branch's own first-parent line and finds the orchestrator's merges. On a pull request, CI (.github/workflows/governance.yml:94-95) checks out GitHub's merge ref and uses HEAD^1 as the base. The only first-parent commit is then GitHub's synthetic merge, which is not orchestrator's.
   - **Simulation:** in the scratch clone I made a non-orchestrator `--no-ff` merge of f0b0d43 onto cf2cdaa. `record_checks.py merges --base HEAD^1` then gives "OK: every merge and Orchestrator commit on the first-parent line holds", exit 0.
   - **PR #300 had the same failure and still passed CI.** Locally at 78fc819 with base 97bfaf5 the check prints "commit 78fc819f5042 by orchestrator (no Item: trailer) changes .github/workflows/orchestrator.yml, digest/p-004.md, …" and "FAIL: 1 violation(s)". Yet PR #300 merged on 2026-11-06T16:39:39Z, and its check run `governance` shows success (`gh api …/commits/78fc819/check-runs`).

4. **The registration as frozen: holds (non-blocking).**
   - **Pass mark:** the quoted block at experiments/EXP-008-widget-refresh-documents.md:607-614 is identical, after joining the lines, to the bullet in docs/PROJECT.md Part 2, "Its Discovery, scaled to its size" (line 623). A Python comparison returned True. docs/PROJECT.md is not changed by this PR.
   - **The `frozen:` line** (:864) reads "the last commit that changes this file on build/definer/p004-exp008, before any run". That commit is 9328cfc: `git log origin/main..HEAD -- <file>` lists 9328cfc, cd98e5f and 712c951, and `git diff 9328cfc HEAD -- experiments/` is empty. `v3_checks freeze` passes.
   - **The review records agree with each other:**
     - critic.md: "Verdict: PASS", with round 3 PASS at 9328cfc.
     - _critic-r3-verbatim.md:3 and :9: read at 9328cfc, "Verdict: PASS".
     - Rounds 1 and 2: FAIL at 712c951 and at cd98e5f.
     - _reviewer-widget-92caf00.md: "Verdict: PASS", read against Draft 2 (cd98e5f), so before the freeze. This matches "Before freezing" at :857-862.
   - **Reviewer finding 1 is resolved:** the widget check said to settle, before the freeze, how "a 200 whose body is no branch" is treated. Draft 3 settles it at :22, :367 and :500.
   - **Cited files exist:** the registration cites reviews/EXP-008/critic.md and reviews/EXP-008/_reviewer-widget-92caf00.md, and both exist.

5. **Identity: holds (non-blocking).**
   - All 8 commits are authored and committed under role identities: definer ×3, orchestrator ×4, chief-of-staff ×1, all @agents.invalid.
   - Each has an Agent-Session trailer.
   - Grepping the commit messages for co-authored, claude, opus, gpt and anthropic finds nothing.
   - a39b3aa (cf2cdaa + 9328cfc) and f0b0d43 (1512b36 + 9994c5c) are two-parent `--no-ff` merges.

6. **Public-repo safety: holds (non-blocking).**
   - The diff names the private repositories (shumpmaster/Personal-Org-Operating-Model and shumpmaster/portfolio) and portfolio's branch `exp-008-test-data`. It holds none of their content: no titles, PR numbers, data or tokens.
   - These names are already public on main: src/config/projects.json lists them, and experiments/EXP-007-widget-refresh.md mentions portfolio 19 times.
   - A grep for tokens (ghp_, github_pat), "secret" and email addresses found nothing sensitive. One hit, the registration's :680, is about hashed titles being guessable, not a leak.
   - The verbatim review files and the handoff contain local container paths (/tmp/claude-0/… scratchpad paths and /home/user/sd-wt-builder). They are harmless, and they were kept because the records are verbatim.

7. **Ticked tasks: each is done (non-blocking).**
   - **Task 1:** EXP-008 is registered. Its pass mark is unchanged (finding 4). The outcome table covers a run with no counted later refresh: F2, N5, and the catch-all N6 "Anything else with no counted later refresh" (:850-852). It was frozen after the Critic's round 3 PASS.
   - **Task 2:** the widget is rebuilt. 92caf00 exists locally on build/builder/p004-exp008-widget only, authored builder@agents.invalid. It is not on this branch, which fits PROJECT.md's "not merged". The Reviewer's PASS was read against Draft 2, before the freeze. I did not re-audit the widget code; that was outside this brief.
   - **Task 3:** SURFACES.md lines 136-138, L-0034 to L-0036 in docs/LEDGER.md, the IMPROVEMENT_REGISTER row, and digest/p-004.md and docs/DIGEST.md all regenerated. `digest check` passes.
   - The two unticked tasks (the Reviewer's and the owner's verdicts) are correctly left unticked.

**Open questions**

- CI on PR #320 was still running when I checked: `governance` and `build` were in progress for f0b0d43. Merging should wait for `governance` to succeed.
- The commit's check runs include one `pr-body` failure at 23:13:26Z, followed by a success at 23:14:10Z, presumably after the body was edited. Confirm the latest one stands.
- There is no join-up section. This is a stage-3/experiment registration PR rather than a stage 5 Build review, so I took it as not applicable.
- Ruling A says each entry is "shown to you first and checked by the Reviewer". This review is the Reviewer's half; the owner's approval is their merge.
