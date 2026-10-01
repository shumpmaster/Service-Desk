---
id: LIB-F-h
form: fact
title: Routine run sessions and /schedule access; who can trigger the Claude Code GitHub Action
topics: [claude-code, automation]
grade: A
checked_on: 2026-10-01
shelf_life: 3 months   # routines are a research preview
opened_by: source-checker (Q-005 round 3), full page text of the pages named
memo: research/Q-005-memo.md (F-13, F-14)
sources:
  - https://code.claude.com/docs/en/routines
  - https://code.claude.com/docs/en/claude-code-on-the-web  (Archive / Delete sessions)
  - https://code.claude.com/docs/en/authentication  (profiles and federation: features that need a claude.ai login)
  - https://code.claude.com/docs/en/github-actions  ("Who can trigger runs")
  - https://github.com/anthropics/claude-code-action/blob/main/docs/security.md  ("Who Can Trigger the Action")
independence: separate pages, same publisher (Anthropic), per owner ruling A (product behaviour only).
scope: F-14 in full (two pages). F-13 narrowed to the points two pages state.
---
Routines (F-13, two-page points):
- Each routine run is a normal cloud session and can be renamed, archived or deleted from the session menu (routines page; the web page documents archive and delete, and that archived sessions are hidden and deletion is permanent).
- `/schedule` needs a claude.ai subscription login. With a Console API key, an Anthropic profile or a cloud-provider login it is unavailable (routines troubleshooting; authentication page lists `/schedule` among features that need the claude.ai login).

GitHub Action trigger checks (F-14):
- Write access: on issue, pull request, comment and review events the triggering user must have write access (github-actions page; security.md also names `workflow_run`, where both the workflow actor and the upstream actor are checked). `allowed_non_write_users` bypasses it, needs your own `github_token`, and security.md calls it "a significant security risk".
- `schedule`, `workflow_dispatch` and `repository_dispatch` are not checked separately because there is no external actor (security.md; the github-actions page names `schedule` as an event no user authors).
- Bots: GitHub Apps and bots are rejected by default; list them in `allowed_bots`. Both pages say so. security.md warns that allowed bots are not checked for repository permissions, which matters on public repositories. The github-actions page adds that scheduled runs are attributed to a repository user, usually the last to change the cron schedule, and that user is checked too.

Not filed (routines page only):
- Pause/resume switch and Delete menu item on the routine detail page; `/schedule list`, `update`, `run` and run-history questions (v2.1.225 and v2.1.227 minimums); Owner "Routines" toggle ("existing routines stop running"); 72-hour skip when the GitHub connection is missing, then the routine turns off; a paused subscription means no runs.
- Not documented in any page opened: pausing or deleting a routine from the CLI, or an API to stop a running run.
