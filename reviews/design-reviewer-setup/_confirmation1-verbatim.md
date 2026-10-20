# Pull request #148, the Design reviewer's setup: the Reviewer's first confirmation check, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/design-reviewer at ccd2125, by a fresh Reviewer, under the owner's answer A to P-001-design-reviewer-verdict ("A fresh Reviewer checks only that the round-3 findings are fixed, not the whole change again").

---

Verdict: FAIL

The two blocking findings, B1 and B2, are fixed, and so are six of the nine notes. The verdict is FAIL for two reasons. First, the checks fail in one place besides the expected one. Second, N3, N8 and N9 are neither fixed nor stated as known limits.

Checked: origin/orch/design-reviewer at ccd2125, against round-3 head 6d0b570. File paths below are on that branch.

**Per finding**
- **B1, fixed.** `governance/domains/design/README.md:55-63` adds a "Sized like Linear" rule. Nothing is judged against Linear until the owner's approval of a mockup is recorded, and only text-box-size A's 16 px is enforced until then. The quote matches option A of the stop question, which the owner picked (`decisions/questions/P-001-design-reviewer-stop.md` on origin/main). `README:143` (conflicts item 3) and `README:149-150` (text-box-size) point to that rule. `.claude/agents/design-reviewer.md:12` carries it too.
- **B2, fixed.** `docs/LEDGER.md:253` now reads "checked against the test data that exists for Service-Desk, the operating model's own repository and the extremes case; the inventory's made-up project joins once it has test data". That matches `README:256-261`. ledger_check passes, so the file is still append-only.
- **N1, fixed.** `README:109-110` names note 13 as narrowed by redesign-conflicts item 4, so a phase marked by icons alone is not a finding.
- **N2, fixed.** `README:330` now calls brief 3 an open conflict and points to conflict 1. Brief 4 is replaced by item 5 and text-box-size (`README:331-332`).
- **N3, not fixed and not stated as a limit.** `README:43-46` now says the orchestrator holds the question, which is honest about whose words those are. It still asserts "its timeout default does not apply while it is held", with no rule behind it. `questions/P-001-redesign-direction.md` still says `DEFAULT: C   TIMEOUT: 48` and records no hold. That timeout runs out around 2026-10-21 18:37 UTC. Neither the pack nor the PR body names this as a limit.
- **N4, fixed.** The added rulings are at `README:182-193`: acting-route, github-app-links, notifications and notify-job-merges. The three m3a rulings are at `README:197-202`. I checked each against its record and they are accurate. Item 2 now covers "AC48 to AC79" (`README:246`), which includes AC73-76.
- **N5, fixed.** Conflict 8, "Not tied to a milestone", is at `README:394-397`. Its note 21 text and "Agree with all four" match `P-001-trial-view-notes-2.md:101` and `:146`. Conflict 9, Team's tiles and logs, is at `README:398-401`, citing notes-1 note 11 and notes-2 note 30. Conflict 3 now says the Timeline is already kept (`README:379-380`).
- **N6, fixed.** A clash between the direction answer and the nav tabs goes to the owner (`README:48-51`). Item 17 now says a board card with one button per option passes (`README:299-304`).
- **N7, fixed.** `README:158` uses curly apostrophes (they’re), the same bytes as `P-001-design-discovery.md:11`.
- **N8, not fixed.** The PR #148 body (head ccd2125) still says "Nothing failed or was skipped in this pull request". Its known limits still name only the `record_checks merges` branch failure, not the `review_check pr` cause of the red CI check. The N5 fix also makes the body stale in a second place: it still says "it notes seven places where the redesign proposal still goes against earlier rulings", but the pack now lists nine conflicts (`README:362-401`).
- **N9, not fixed and not stated as a limit.** The Evidence section (`README:405-413`) is unchanged on this point. Nothing says there is no ready way to render the fixtures in a real browser, and neither the pack nor the PR body lists it as a known limit.

**A check the fixes did not break, but which fails now**
One check fails that round 3 did not hit. The branch carries `questions/P-001-design-reviewer-stop.md`, but origin/main already holds its answer record under the same name. Merging origin/main resolves it: I simulated the merge with `git merge-tree` and it is clean, and the merged tree keeps only `decisions/questions/P-001-design-reviewer-stop.md`. That merge also makes the path `README:59` cites exist on the branch; it is missing there now.

**Check output**
Run as `GOV_BRANCH=orch/design-reviewer GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`, in a scratch worktree of origin/orch/design-reviewer at ccd2125, since removed.
```
FAIL  governance_checks all (exit 1)
  questions/P-001-design-reviewer-stop.md: added in the range, but its answer record decisions/questions/P-001-design-reviewer-stop.md is already on the base origin/main: a reused name; file the question under a new name (model S-033 AC2)
FAIL  record_checks merges --base origin/main (exit 1)   [known: 12 orchestrator first-parent commits without Item: trailer]
PASS  all others: surface_guard check, surface_guard diff, ledger_check, digest, review_check lint, spec_check status/frozen/predates/facts, v3_checks scope/freeze/holdouts/milestones/gates/ready/trace/joins/sessions, record_checks decisions/routing/build-cap/grants, surface_guard charters
```

**To reach PASS**
- Merge origin/main into orch/design-reviewer, then re-run the checks.
- Record the hold on `questions/P-001-redesign-direction.md`, or state it as a known limit (N3).
- Fix the PR body: drop "Nothing failed", give the real cause of the red check, and change "seven" to "nine" (N8).
- State the browser-render gap as a known limit (N9).

**Open question**
The ruling allows no fourth review. Can the orchestrator make these fixes and send the setup on without another check, or does it come back for this confirmation again?
