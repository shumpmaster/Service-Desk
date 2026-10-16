# J11's fixture: Service-Desk's records at 3117150 (S-001 J11, AC50, AC51)

The records the model's timeline reads, copied from Service-Desk at commit 3117150 (the commit
S-001 names), and the timeline the model printed for that commit: the test oracle.

- `tree.txt`: `git ls-tree -r --name-only 3117150` (the paths the tree holds, for the link rule).
- The record files: `docs/PROJECT.md`, `dispatch-log/2026-10.jsonl`, `status/[PQE]-*.toml`,
  `status/merges.jsonl`, `specs/S-001.md`, `intake/requests/*.toml`, `governance/SURFACES.md`,
  `.github/workflows/orchestrator.yml`, each as it was at 3117150; and, from 2026-10-16 (J11's
  added read, AC60's review mark, AC72's check), every verdict file `reviews/<n>/<name>.md` whose
  name does not start with `_`, copied unchanged with `git show 3117150:<path>`.
- `trace-notes.txt`: the timeline's `NOTE:` lines of
  `python3 governance/checks/v3_checks.py trace --root .`, run in a checkout of 3117150 (with
  `git archive 3117150`); the two lines that are not the timeline (value targets, criteria checked)
  are left out.
- The expected now run, which the `NOTE:` lines don't mark (AC50's rule is the Definer's, C): Design i2,
  because MD2 is its first project milestone with no sprint.

Regenerate it in the pull request that adopts a model version whose timeline rules change.
