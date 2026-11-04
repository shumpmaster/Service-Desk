# Ruling needed: How should the pipeline's check run get past the desk's large files, before any work reaches it?

Milestone: none (the card fix's own milestone, M4, is still only a proposal in its plan, and the desk's standard "work is built" milestone, Build-2, was skipped)
Asked in session: session_01QBwHGK3RYTVPrSa4MEcix4

WHY: Nothing is broken yet, but it will be. The card fix (the change that makes a decision card show my recommendation) will be the first piece of work here to reach a check run: the step after building, where the pipeline copies the whole project, with the builder's changes, into a sealed space and runs the project's checks on it. The copying refuses outright if any one file is over 1 MB, and the desk has three today: two design screenshots, and the desk's own plan for its first version (2 MB, cited all over the project, so it cannot be moved). So the first check run here will be refused and stop the work with a failure card. No check run has happened here yet, which is why nobody has seen it; the Reviewer found it while checking the size-limit change you approved. The same copying also refuses a project over 128 MiB in total; the desk is at about 106 MiB and grows with each round of design pictures. The copying code is the operating model's own, used unchanged in every project made from it. Leaving it unruled costs nothing until the card fix is built.
OPTIONS:
  A. Fix it in the operating model, for the check run's copy only: leave out the design folder's images (no check reads them), let ordinary text files of any size through up to the total limit, both when it is packed and when it is unpacked for the run, and list what was left out, as it already does for links. Every other bundle, and every set of changes a builder returns, keeps today's limits.
     What happens: I file it with the operating model as a lesson and a short plan of its own, after the plan-per-project change you just approved; the model's builders make it, its Reviewer checks it, you merge it, and the desk takes it at its next model update.
     Gain: fixed once, for every project, Model-Lab included, and it stays fixed as the design folder grows; the desk's first-version plan stays in, so the checks that read it still work.
     Cost: it waits behind the plan-per-project change, so it may land after the card fix is ready for its check run; then the card fix waits for it, or you take B for the gap. A check that requires a cited file to exist would fail if a record ever cited a left-out image; none does today, and the run's list of left-out files would show it. Rules out: nothing. Reversible: yes.
  B. Fix it here only: shrink the two screenshots under 1 MB, and raise this project's per-file limit to 4 MB so the first-version plan fits.
     What happens: two pictures change, and one line of the pipeline's limits, in a pull request for you to merge.
     Gain: quick; the card fix's check run can go through as soon as it is merged.
     Cost: the per-file limit is loosened for every bundle and every builder's changes here, not only the check run; the next screenshot over 1 MB needs shrinking too; the 128 MiB total is still reached as the folder grows; and the desk's limits then differ from the operating model's. Rules out: nothing. Reversible: yes.
  C. Wait: rule it when the card fix reaches its check run.
     What happens: nothing now.
     Gain: no work until it is needed.
     Cost: a refused check run and a failure card at that point, then A or B under time pressure. Rules out: nothing. Reversible: yes.
RECOMMENDATION: A — the cause is in the operating model's own code, so fixing it there, for the check run only, fixes every project without loosening any other limit; B stays available if the card fix is built first. Confidence: high on the facts, which anyone can measure again with the pipeline's own copying command; medium on the timing, since the model's queue decides when A lands. It would change if you want the card fix built before the model change can land (then B now, and A as well).
RISK CLASS: R3   REVERSIBILITY: costly (every option can be undone, but A and B change the pipeline's tools or rules, risk class R3, which needs your approval (A4), so it never defaults)   BLAST RADIUS: every check run in this project; with A, every project made from the operating model at its next update
DEFAULT: none (a change to the pipeline's tools is your ruling)   TIMEOUT: none
CHECKED: read cold by the Critic, 2026-11-04, PASS at round 2; reviews/check-run-tree-limit/critic.md

## Context
- The Reviewer of the size-limit change found that the check run copies the whole project and refuses any file over 1 MB instead of leaving it out, and that no check run has ever been dispatched here (source: reviews/287/_reviewer-r1-verbatim.md, item 3)
- The dispatch logs hold no check-run entry (source: dispatch-log/2026-10.jsonl and dispatch-log/2026-11.jsonl, no `run-checks` action)
- On today's main branch the pipeline's own copying command refuses: "ERROR: refused: docs/design/builds/m3g-qw2/02-qw2-busiest-360x740-light-MADE-UP-NOT-real.png is 1089406 bytes, over the per-file cap of 1048576" (source: governance/checks/orchestrator_git.py, `tar --dir <main> --limits governance/RUNNER.toml`, run 2026-11-04)
- Three files on main are over 1 MB: two build screenshots (1,089,406 and 1,218,210 bytes) and specs/S-001.md (2,170,257 bytes); the tracked files total about 106 MiB (source: `git ls-tree -r -l origin/main`, 2026-11-04)
- specs/S-001.md is the desk's first-version plan, read by the governance checks from specs/ (source: specs/S-001.md, its header; governance/checks/spec_check.py)
- The limits are 1,048,576 bytes for one file and 134,217,728 bytes in total (source: governance/RUNNER.toml, [limits]; decisions/questions/P-003-critic-pack-cap.md)
- The copying code refuses a file over the per-file limit, or a total over the total limit, rather than leaving it out, and the same code makes the other bundles and the builder's change sets (source: governance/checks/orchestrator_git.py, make_tar and its callers)
- The check run runs the project's checks, governance/checks/check_all.sh, on the copied tree (source: governance/checks/session_runner.py, the check-run step)
- The desk's copy of that code is the operating model's tools/orchestrator_git.py unchanged (source: a diff of the two files, 2026-11-04)
- The card fix is at its readiness check, before its Design gate (source: status/P-003.toml; docs/PROJECT.md, "Later work: the card fix (P-003)")
- The owner approved the operating model's plan-per-project change for freeze and build on 2026-11-04 (source: Personal-Org-Operating-Model docs/LEDGER.md, L-0152, in its pull request #44)
