# Pointer — do not add rules here

This project is governed by AGENTS.md. Read it first. If this file conflicts with it,
AGENTS.md wins and the conflict is a bug to fix.

## Claude Code mechanics only
- Builders and reviewer-class agents are Agent-tool subagents defined in .claude/agents/, one
  per roster row in governance/SURFACES.md. Dispatch the builder that owns the surface a change
  lives in, with a written brief (specs/_TEMPLATE.md, OPERATING_MODEL §12).
- Branches: each builder works on `build/<id>/<task>`, ideally in its own worktree
  (`git worktree add <dir> -b build/<id>/<task>`). The orchestrator works on `orch/<task>`.
  Reviewer-class agents have no branch.
- Identity: a builder commits with
  `git -c user.name=<id> -c user.email=<id>@agents.invalid commit`, and the message ends with a
  trailer paragraph holding `Agent-Session: <session id>` and `Spec: <spec id>`. The orchestrator
  commits the same way as `orchestrator`. Never add model names or AI co-author lines to commits.
- Before accepting a builder's branch:
  `python3 governance/checks/surface_guard.py diff --range <base>..build/<id>/<task> --branch build/<id>/<task>`.
  Then run the full suite, dispatch the required reviewers, record their verdicts verbatim in
  reviews/<PR>/<reviewer-id>.md, and merge with `git merge --no-ff` (never squash).
- If the environment can push only one branch, keep build/ branches local and merge them into
  the push branch with merge commits, so authorship survives.
- <how PRs, deploys, logs and screenshots work in this environment>
