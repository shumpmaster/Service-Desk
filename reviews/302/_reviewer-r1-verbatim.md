# PR #302 — the Reviewer's review, round 1 (verbatim)

*Reviewer subagent, in the Chief of Staff's session session_01QBwHGLbgYHaUscbaU5paSC, 2026-11-05, on cd9271b.*

Verdict: FAIL

The sync itself is sound: the checks, template changes and lanes all match the model and the brief. It fails on two things the PR still has to fix: the pull request body (B1, B2) and the missing ledger entry (B3). Fixing those means editing the body and adding one entry, with no change to the content.

**Blocking findings**

B1. The PR body fails the desk's own pr-body check, and CI is red on it.
- The "What this means for you" paragraph has 173 words; the limit is 150.
- I ran `python3 governance/checks/governance_checks.py pr-body --event <PR 302 event>` and got `FAIL: pr-body: the 'What this means for you' paragraph has 173 words; it needs 15 to 150`, exit 1.
- GitHub agrees: the pr-body check run on cd9271b concluded failure (job 127035181422, same message).

B2. One Context bullet is false for the command it cites.
- It says "Every governance check gives the same result as on main except the timeline's expected change … (source: governance/checks/check_all.sh . origin/main, before and after)".
- Run that way, the branch also fails `record_checks merges`, which passes on main: `commit cd9271b by orchestrator (no Item: trailer) changes .claude/agents/builder.md, … docs/users/_PROFILE.md, outside status/**, dispatch-log/** and queue/**` (governance/checks/record_checks.py:515-535).
- This is only a local artefact. On a simulated GitHub merge ref (a scratch clone, merged with --no-ff, `GOV_BRANCH=orch/model-3.7.0-sync`), `merges` passes, and in real CI on the PR (job 127035181612) `merges` and `trace` both PASS.
- So the work is fine, but the owner is told something the cited command contradicts. The bullet should name the local `merges` failure the way it names the `trace` one.

B3. No ledger entry and no improvement-register row.
- AGENTS.md §4 (Landing) requires a "ledger entry + improvement-register row in the same PR", and §1 says "Not in docs/LEDGER.md → did not happen".
- This is an R3 governance change, yet docs/LEDGER.md and docs/IMPROVEMENT_REGISTER.md are untouched, and the Tasks section plans neither.
- The desk's earlier syncs each had an entry: L-0005, L-0008, L-0011, L-0015 (v3.4.0) and L-0016 (v3.5.0). No 3.6.0 entry is visible, but that does not waive the rule.

**Notes (non-blocking)**

N1. The four checks files are identical. `governance/checks/{v3_checks,orchestrator,govlib,governance_checks}.py` match `bbe010f:tools/*` byte for byte (`cmp`).

N2. The template changes are carried completely and nothing else changed.
- I compared the model's diff of `template-v3` from 226f1c5 to bbe010f with the desk's diff from origin/main to the branch (excluding the checks files and the version file).
- They differ only in surrounding context lines: the desk's own PACKS.toml lines (LL-015 feedback, definition-of-ready, the research-item chain, the design-reviewer pack), its filled PROJECT.md, and shifted line numbers. Every added and removed line is identical.
- The desk's customisations are kept, OPERATING_MODEL_VERSION is 3.7.0, and docs/projects/_TEMPLATE.md matches `bbe010f:template-v3/docs/PROJECT.md` byte for byte.

N3. Commit identities match the SURFACES.md lanes.
- `surface_guard.py diff --range origin/main..orch/model-3.7.0-sync --branch orch/model-3.7.0-sync --root .` gives `OK: 2 commit(s) … checked`.
- 23640a7 is chief-of-staff: governance/**, docs/PROJECT.md, docs/projects/**, intake/**.
- cd9271b is orchestrator: .claude/**, and docs/** files outside the chief-of-staff exclusions.
- Neither commit has a `Spec:` trailer or any model name.
- Both carry the same Agent-Session id under two identities. The guard allows this; the owner may want to confirm it is intended.

N4. Locally, check_all differs from main only in the expected places plus B2.
- P-003 and P-004 now read Discovery-2 "reached" → "not recorded" and Discovery-7 "not reached" → "not recorded"; P-001's timeline is unchanged.
- `trace` fails on the same nine lines on both sides; it is a shallow clone and CI passes it.
- In CI, `review_check pr 302` fails only for the missing reviews/302/owner.md and reviews/302/reviewer.md. That is expected at this point.

N5. The "not done" task about the Chief of Staff's card is honest about why, but weak on where the work went.
- /home/user/portfolio (not shallow, one branch, main) tracks only ideas/ and library/, so there is no card file to edit.
- But "the text is named under Context" says where the text is, not who will do the work, or when. AGENTS.md §4 asks for "where the work went". A handoff item or a question would fix that.
- The paragraph also understates the change as "two short bullets". At bbe010f, portfolio-template/CLAUDE.md has four edits: two existing bullets amended (read/write and "Your other duties"), one sentence added to the Discovery bullet, and one new bullet. The Context bullet lists all four.

N6. The other Tasks are fine.
- The four ticked tasks are each done (N1, N2).
- The unticked "Reviewer's verdict" task is allowed while the PR is a draft. It is a draft, and the check passes that part.
- Note it must be ticked or ended before the PR is marked ready: a ready-state run of the check flags it.

N7. Wording in the plain paragraph: it calls P-004 "the widget fix", but P-004 is the home-screen widget, an addition.

N8. Remaining mentions of "docs/PROJECT.md" in the desk: none that S-035 required this sync to change.
- src/lib/feed.js, src/lib/j11.js and src/lib/sandbox.js (and their src/public copies) and the tests/desk fixtures read docs/PROJECT.md only. S-035 sends that work to the desk's own J1 under S-001, after the sync.
- intake/requests/P-003.toml and P-004.toml are accurate for the old path. Queue cards say "project document", which S-035 defines as the item's plan.
- One gap S-035 did not reach: the desk-only design-reviewer pack (governance/PACKS.toml:116) may read `docs/PROJECT.md` but not `docs/projects/{item}.md`, while .claude/agents/design-reviewer.md:23 promises "the project document". It will matter once an item with its own plan (P-002) goes through design review. Worth an `{item}` line in a later change.

**Open questions**
- Q1. Was the missing 3.6.0 ledger entry an intended precedent? If so, the owner should rule it, since AGENTS.md §4 says otherwise.
- Q2. Should "where the work went" for the card name a record, given that no card file exists anywhere the agents can reach?

**Six-part contract**
- Changed: nothing. I registered a temporary detached worktree in the scratchpad and removed it afterwards; the tree is clean. A /home/user/sd-handoff worktree that is not mine appeared during the run.
- Why: review of PR #302 against S-035's "Adoption by projects", AGENTS.md §4 and the reviewer charter.
- Verified: the `cmp` checks; the patch-to-patch diff; `surface_guard diff --range`; `check_all.sh . origin/main` on the branch and on main; the simulated CI merge ref; the pr-body check; GitHub check runs and job logs. Outputs and patches are in /tmp/claude-0/-home-user/c49c7dbe-fb81-5529-837f-439e3372d601/scratchpad/review-302/ (branch.out, main.out, ci.out, body.md, gov-ci.log, m2, d2).
- Undone: I did not re-run the desk's npm test suite locally; CI's desk-build passed on cd9271b.
- Needed outside my surface: the author fixes B1 to B3 (the PR body and a ledger entry plus register row); the orchestrator records this verdict.
- Open questions: Q1 and Q2 above.
