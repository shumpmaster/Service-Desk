# Service Desk

The owner's control panel, redesigned under the AI Build Operating Model v3 (the model's L-0115, D-081). What it is for is being captured in docs/PROJECT.md.

This project runs under the AI Build Operating Model
(version: governance/OPERATING_MODEL_VERSION). Start with AGENTS.md. In a v2.x project,
`OPERATING_MODEL §n` references mean the v2.5.1 rulebook, archived in the operating-model
repository at docs/archive/OPERATING_MODEL_v2.5.1.md.

## Repository settings (do this once)

- **Turn off squash merging** (GitHub: Settings → General → Pull Requests → untick "Allow
  squash merging"). A squash merge rewrites every commit's author to the merger, which erases
  the evidence the surface guard checks. Use merge commits.
- Add yourself to the `humans` block in governance/SURFACES.md, with the email your commits use.
- Optional: run the governance checks before every push, in each clone:
  `cp .github/hooks/pre-push .git/hooks/pre-push`. Only that hook runs, and a later change to the
  tracked file doesn't run until you copy it again, so re-copy only after reviewing the change.
  The push stops if a check fails; `git push --no-verify` skips it, and CI still decides.
  The hook compares against the remote's default branch (`git remote set-head origin --auto` sets it;
  otherwise it assumes `main`).
  Copy it while the reviewed default branch is checked out. The hook runs each pushed commit's own
  `governance/checks/check_all.sh`, so it helps you catch mistakes but is not a security boundary;
  review stays the boundary. A global hooks-path setting in your own git config turns it off.

## Governance checks (Python 3.11+, no dependencies)

```
governance/checks/check_all.sh . [BASE_REF [PR]]
```
