# Ruling needed: run the safety proof on a schedule, so a new runner image does not silently switch the Builder's commands off

Milestone: M4

WHY: The Builder's shell and git run only while GitHub's runner image is from a month the safety proof has passed on. GitHub publishes new images every week or two, so commands switch off automatically each new month until the proof is run by hand and the new month is recorded. Nothing tells the owner when that happens: commands have been off since October, and it surfaced only when P-003's build needed them. The owner asked in this session to "run the proof on a schedule". This asks how.
OPTIONS:
  A. Weekly, every Monday, plus by hand as now. The scheduled run uses the Builder's own model (the MODEL_BUILDER repository variable), since a schedule has no one to type one in. The proof itself is unchanged: it still writes and commits nothing. When a scheduled run passes on an image month the runner settings do not yet hold, the Chief of Staff opens the settings change for your approval at its next session (an R3 rule change with the Reviewer's verdict). When one fails, the Chief of Staff reports it. Weekly catches a new month's image within about a week, even with GitHub's late timer.
  B. Monthly, on the 3rd, plus by hand. Fewer runs, but a new month's image that rolls out late in its first week can be missed for a month.
  C. As A, and the passing run also opens the settings change itself. Fewer steps for you, but the proof job would need write access to the repository and to pull requests, which it holds none of today. The proof's safety rests on it holding no write access, so this would need its own review.
RECOMMENDATION: A, because it catches each new image within a week and keeps the proof as safe as it is today, with no write access.
RISK CLASS: R0 (the question); the workflow change it leads to is R3   REVERSIBILITY: reversible   BLAST RADIUS: the scrub-proof workflow, and when Builder sessions on the desk may run commands
DEFAULT: none   TIMEOUT: none (it leads to an R3 workflow change, which waits for your ruling)

## Context
- Commands run only while the pinned version and the runner image's month match the last passing proof (source: governance/RUNNER.toml; governance/checks/session_runner.py)
- The proof starts only by hand today (source: .github/workflows/scrub-proof.yml, `workflow_dispatch`)
- The setup asks for the proof to be run by hand each month and before any update (source: docs/SETUP.md)
- The Builder ran with commands forced off on 11 November, on runner image 20261101.360.1 (source: GitHub Actions run 42977288824; docs/reports/P-003-builder.md on item/P-003)
- The proof workflow holds no write permission (source: .github/workflows/scrub-proof.yml, `permissions: {}` and each job's read-only permissions)
- The owner said "Okay run the proof on a schedule" in this session (source: session_01QBwHGNGhaxp9ABH6WFJJE2, 2026-11-11)
