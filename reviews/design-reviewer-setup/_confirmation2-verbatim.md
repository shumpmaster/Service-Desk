# Pull request #148, the Design reviewer's setup: the Reviewer's second confirmation check, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/orch/design-reviewer at 7205323, by a fresh Reviewer, under the owner's answer A to P-001-design-reviewer-verdict. Every item in scope passed except 1(a): origin/main moved (#160) after the branch merged it. The orchestrator merged origin/main again (bc5d9b3) and asked the same Reviewer to re-run 1(a).

---

Verdict: FAIL

The branch fails on one point only: origin/main moved again after it was merged. Every other item in scope passes. This is the same kind of failure the first confirmation found, and one more merge of origin/main clears it. Checked at origin/orch/design-reviewer 7205323, in a scratch worktree that I have since removed. I changed nothing on the branch.

**1(a) Merge and re-run: FAIL.** Commit e795164 merged origin/main at 14:30:19. origin/main then moved to a48d31b at 14:31:05 (#160, "accept M3A"). The check run named in the brief fails in two places, and only one of them is expected:
- `governance_checks all` fails because `questions/P-001-m3a-accept.md` was added in the range, but its answer `decisions/questions/P-001-m3a-accept.md` is already on origin/main. The check reads that as a reused name.
- `record_checks merges` fails as expected (16 orchestrator first-parent commits on an orch/ branch).

To test the fix, I made a throwaway local merge of origin/main in the scratch worktree and re-ran the checks. The merge was clean and only `record_checks merges` failed. CI runs on GitHub's merge ref, so it likely won't see the reused name. Run locally with PR 148, `review_check pr 148` fails as the PR body says: reviews/148/owner.md and reviews/148/reviewer.md are missing (R3).

**1(b) N3: fixed.** `governance/domains/design/README.md` (the rulebook) no longer mentions a hold or a timeout. It says the owner ruled "desk mockup v2, with Home, 'is the direction for the whole desk'", citing decisions/questions/P-001-redesign-direction-v2.md, A, and that this answer closes questions/P-001-redesign-direction.md. Both match the records on origin/main. The cited mockup commit d2afcfc is exactly the tip of origin/orch/desk-mockup-v2. Part B is now tied to v2, and later rulings take precedence over its frames. `.claude/agents/design-reviewer.md:12` says the same.

**1(c) N8: fixed and accurate.** The live PR body (head 7205323) matches the quote in the brief word for word. It gives the real cause of the red check: the missing reviews/148/reviewer.md and owner.md, which matches the review_check result above. "Four points the mockup doesn't settle" matches the rulebook's "Still open" list, conflicts 8 to 11; seven more are listed as settled. The known limits are all true: RUNNER.toml has 0 matches for design-reviewer, the Members Letter fixture and real-browser rendering are named, and so is the `--soft` follow-up (rulebook around line 272). "Nothing failed or was skipped" is kept but qualified in the same sentence, which I accept.

**1(d) N9: fixed.** The rulebook's Evidence section now has "Known limit: no ready way to render the fixtures in a real browser yet". The four test paths it names all exist.

**2. Lines changed since ccd2125: pass.**
- **Owner quotes:** exact against origin/main. "is the direction for the whole desk" and 'measures "sized like Linear" against it' come from the -redesign-direction-v2 ruling line. "is measured against the mockup you approve next" comes from the -design-reviewer-stop option as put.
- **Quotes from the mockup's notes (docs/design/mockups/desk-v2/README.md):** exact, except that one ("Agent-owned gaps, such as …, use a grey diamond") wraps across lines 116–117. The rulebook's sizes match the README and the `--t-*` tokens: 24, 18, 15, 13, 12 and 11 px, weights 400/500/600, 16 px text boxes, board text 11 and 12 px.
- **Paths:** every cited P-001 record exists under decisions/questions/, and every docs/ and tests/ path exists. The one exception is questions/P-001-redesign-direction.md, which is gone because the question is closed. It is cited only as the closed question, next to its decisions/ record.
- **The ten rulings:** -redesign-direction-v2, -home-tab, -home-tiles, -timeline-labels, -why-line, -domain-review-count, -gate-buttons, -portfolio-tab, -design-reviewer-verdict and the closed -redesign-direction are each described accurately against their records. The rulebook's list of mockup items not yet ruled (1c, 1d, 1e, 5, 7) also matches the README's "Not ruled" list.
- **docs/design:** `git diff origin/orch/desk-mockup-v2 origin/orch/design-reviewer -- docs/design` is empty. Against origin/orch/board-mockup, the branch only adds files (35), so board-mockup's 58 files are there unchanged.
- **Not checked:** the "Spec points" sentence about S-001 AC48, AC54 and AC57. I only spot-checked AC54's two-column grid, which is confirmed.

**To reach PASS:** merge origin/main into orch/design-reviewer again and re-run the checks.

**Check output** (`GOV_BRANCH=orch/design-reviewer GOV_DEFAULT_BRANCH=main bash governance/checks/check_all.sh . origin/main`, at 7205323)
```
FAIL  governance_checks all (exit 1)
  questions/P-001-m3a-accept.md: added in the range, but its answer record decisions/questions/P-001-m3a-accept.md is already on the base origin/main: a reused name; file the question under a new name (model S-033 AC2)
FAIL  record_checks merges --base origin/main (exit 1)   [expected: 16 orchestrator first-parent commits without Item: trailer]
PASS  all others: surface_guard check, surface_guard diff, ledger_check, digest, review_check lint, spec_check status/frozen/predates/facts, v3_checks scope/freeze/holdouts/milestones/gates/ready/trace/joins/sessions, record_checks decisions/routing/build-cap/grants, surface_guard charters
After a throwaway local merge of origin/main: only record_checks merges fails.
With PR 148: review_check pr 148 also fails (missing reviews/148/owner.md and reviews/148/reviewer.md).
```

**Open question:** origin/main keeps moving as answers merge, so this failure can come back after any re-merge. Should the next confirmation be run straight after a fresh merge, or judged against the PR's merge ref the way CI does?
