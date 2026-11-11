# Ruling needed: the card fix's build is blocked by two faults in the desk's machinery, not by the work

Milestone: M4

WHY: The Builder ran at 07:08Z on 11 November and built nothing, correctly. The runner had switched its shell and git off, because GitHub's runner image is now November's and the desk's safety proof was last passed on September's. The spec needs the old code run first, to record a baseline, so no build is possible without commands. The check run that followed then failed for a second reason, which would fail even a perfect build. It lays the item branch's files over main, and that replaces main's 41-entry ledger with the branch's 26-entry copy, so the exemption lines and the digest no longer match. Each timer run will now retry the Builder, which cannot build, and after the third failed round a stop card comes. Neither fault is the Builder's or the spec's, and no Builder can fix either.
OPTIONS:
  A. Fix both, then build. You run the safety proof by hand on today's image (the scrub-proof workflow). If it passes, I record November's image in the runner settings, a rule change you approve with the Reviewer's verdict. I also fix the check run's copy so it keeps main's ledger and adds the item branch's own entries, renumbered above main's where a number is taken, and rebuilds the digests. That is a tool change with the Reviewer's verdict and yours. Both are raised in the operating model. If a stop card comes first, I recommend `rebuild`, which resets the rounds. Cost: two pull requests and two reviews, about a day.
  B. Pause P-003 until the operating model fixes both upstream. Nothing on the desk changes. The stop card comes and waits. Cost: an unknown wait; no desk change.
  C. Leave it as it is and decide at the stop card. The rounds run out on work that cannot be done; nothing is fixed meanwhile.
RECOMMENDATION: A, because both faults sit in the desk's own runner settings and tools, which the Chief of Staff's lane holds, and fixing them unblocks the build within a day. The safety proof is the step the desk's setup asks for each month anyway.
RISK CLASS: R0 (the question); the fixes it leads to are R3   REVERSIBILITY: reversible   BLAST RADIUS: every builder-class session on the desk (commands) and every item's check run (the ledger); no live change
DEFAULT: none   TIMEOUT: none (the fixes are R3 rule changes, so they wait for your ruling)

## Context
- The Builder's report says it had no shell and no git, so it built nothing and recorded no baseline (source: docs/reports/P-003-builder.md on item/P-003)
- The run's control record grants Bash, but the runner turns commands off when the runner image does not match the proof (source: reviews/S-007/_control/0-703c5b71b08d.json on item/P-003; governance/checks/session_runner.py, commands_off)
- The Builder's session ran on runner image 20261101.360.1; the last proof is recorded for image 202609 (source: GitHub Actions job 130379442662, run 42977288824; governance/RUNNER.toml, proven_image_version)
- The desk's setup asks for the proof to be run by hand each month and before any new image (source: docs/SETUP.md; .github/workflows/scrub-proof.yml)
- The check run failed its surface check (12 exemption lines cite ledger entries the copy lacks) and its digest check (source: reviews/S-007/checks.txt on item/P-003)
- The check run's copy is main plus the item branch's changed files, so item/P-003's docs/LEDGER.md (26 entries, from 4 November plus 5 superseded entries) replaces main's (41) (source: governance/checks/orchestrator_git.py, build_tree and apply_commit_diff)
- A failed check run sends the work back to the Builder up to round 3, then to a stop card, where `rebuild` resets the rounds (source: governance/ROUTING.toml, checks-run-fail; governance/checks/orchestrator.py)
- The ledger ids already clash between main and item/P-003 (source: Personal-Org-Operating-Model docs/LESSONS.md LL-046)
