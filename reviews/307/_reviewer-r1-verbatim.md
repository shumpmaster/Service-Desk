# PR #307: the Reviewer's round 1, verbatim

*Run by the orchestrator (session_01QBwHGKAZuqWeeC6Mst4w88) on 2026-11-06, at the branch tip 6ac1602. Its return follows, unchanged.*

Verdict: FAIL

The content of the pull request holds up. The sync is byte-identical to the model, the ledger and register entries are accurate, the gate case's citations check out and the suite passes. It fails on one thing: its own body fails the desk's pr-body check for two reasons that are not the two tasks left open by design. PR #302 failed in the same way (reviews/302/_reviewer-r1-verbatim.md B1).

**Blocking findings**

B1. The PR body fails pr-body on its form, apart from the open tasks.
- Command: `python3 governance/checks/governance_checks.py pr-body --event <the PR's REST payload wrapped as {"pull_request": …}>`, exit 1. It reports:
  - `FAIL: pr-body: the 'What this means for you' paragraph has 154 words; it needs 15 to 150`
  - `FAIL: pr-body: the 'Milestone:' line names "Discovery-8 (the card fix's Design gate case); the model sync serves no milestone (...)", neither a milestone id (M<id>) nor a standard milestone (Discovery-1 to Launch-5)`
  - the two expected "not a draft, but a task is neither ticked nor says why" lines, for the Reviewer task and the handoff task.
- GitHub agrees: check run `pr-body` (id 127614866070) on 6ac1602 concluded failure.
- The fix: cut at least 4 words from the paragraph, and make the Milestone line one form only (`Milestone: Discovery-8`, with the note about the sync moved into Context or Why). AGENTS.md §4 also allows `Milestone: none (<why>)` as a separate form.

**Notes**

N1. Part 1, the sync, is verified.
- `cmp` of governance/checks/{orchestrator_git,session_runner,v3_checks}.py against `git -C /home/user/Personal-Org-Operating-Model show b18259c:tools/<f>`: all three identical.
- .github/workflows/orchestrator.yml against b18259c:template-v3/.github/workflows/orchestrator.yml: identical. The only change in the diff is ` --check-tree` on the tree untar line. The changes untar line is untouched, as it should be.
- On origin/main, all three tools and the workflow were byte-identical to bbe010f, so L-0023's "byte-identical … at bbe010f before it" holds.
- `git diff --stat bbe010f b18259c -- template-v3 tools` lists only those 4 files. Everything else in that range is model-only (specs, tests, reviews, CHANGELOG), so the desk misses nothing.
- Model PR #50 is open, unmerged, head d08743a. It adds only a review record over b18259c; there is no diff in tools/ or template-v3/. The merge order in the body still holds.

N2. The trace claim is verified.
- origin/main's checks run against this tree: `v3_checks trace` gives exit 1 and `FAIL: 9 violation(s)`, all "no merge commit … reachable from HEAD".
- HEAD's checks: exit 0, 9 "cut short" NOTE lines, then the OK line. This matches the register row and the Context bullet.

N3. The local `record_checks merges` failure is an artefact of the local run, as claimed.
- Locally it flags 1e7a9bd, bb6cb4c and 6ac1602 (orchestrator commits with no Item: trailer).
- In a scratch clone I merged 6ac1602 `--no-ff` into origin/main under a non-agent identity, as a GitHub merge ref would be. There: `OK: every merge and Orchestrator commit on the first-parent line holds`, exit 0.
- CI's governance and build jobs were still in progress when I looked.

N4. `bash governance/checks/check_all.sh . origin/main` gives PASS on every step except `record_checks merges` (N3). That includes surface_guard diff, ledger_check, digest check, `v3_checks gates` and `v3_checks trace`.

N5. The desk suite passes: `cd src && npm test` gives tests 1569, pass 1569, fail 0.

N6. The gate case, docs/gates/P-003/design-gate-1-case.md, is verified.
- `v3_checks gates --base origin/main`: OK, exit 0.
- Every citation I checked supports its line:
  - P-003.md:3, 32, 44, 48, 53, 56–58, 61, 69, 79–81, 86, 90, 92, 99, 102–105 and 107
  - the dispatch-log P-003 lines (one error, then FAIL, FAIL, PASS)
  - decisions/P-003/dor-fail-2.md:2 (the proxy answer)
  - reviews/P-003-dor-dry-run/_critic-dry-run-1-verbatim.md (the borrowing findings)
  - research/P-003-sizing-findings.md:3 (one helper run's usage, no total)
  - reviews/P-003/_critic-dor.md on origin/item/P-003 (PASS)
- The case is unchanged since 8a44a65, the commit dry run 3 judged.
- `reviews/P-003/_critic-dor.md` exists only on the item branch. It resolves because the check overlays the item branch's records. In my scratch clone, which lacked that ref, gates failed on lines 5, 8 and 54 until I fetched the ref. CI uses fetch-depth 0, so it should resolve there.

N7. Section 1 of the case is plain, has no ids and leads with the failures, but it never says whether anything is irreversible (AGENTS.md §4).
- Line 6, "nothing is built until the Build gate, which you rule", implies it.
- The explicit "nothing is irreversible" was removed as uncited after dry run 1 (B1).
- Consider a cited reversibility clause, within the remaining word headroom (about 323 of 350 words).

N8. The body's "a cold dry run of the Critic passed on its third try" overstates how independent that run was.
- Dry runs 2 and 3 are "the same Critic session … resumed" (headers of _critic-dry-run-2/3-verbatim.md), on a pack assembled by hand.
- Only run 1 was cold.

N9. Smaller points in the body and register:
- The Reviewer task reads `reviews/&lt;this PR&gt;/reviewer.md`; name reviews/307/reviewer.md.
- The register row cites reviews/307/reviewer.md, which exists only once this verdict is recorded; record it before merge.
- §6 of the case gives no usage figure, although its cited record holds 91,414 tokens (dry run 3, N1).

N10. I can't verify the owner's quoted instruction in Why and in L-0023 `asked:` from the records. The only copies are the ledger itself, and the handoff's step 3, which paraphrases it. The owner should confirm it when merging.

N11. Ticked tasks:
- All six ticked tasks are done in the diff.
- The PACKS.toml line adds `docs/projects/{item}.md` to design-reviewer may_read, as the other packs already read it.
- L-0023 is well formed. The digest is regenerated and `digest check` passes.

N12. No join-up review applies: this pull request changes no screen or view (no src/ change).

**Open questions:** none beyond N10.

Token use: I can't measure it exactly; my estimate is about 75k.
