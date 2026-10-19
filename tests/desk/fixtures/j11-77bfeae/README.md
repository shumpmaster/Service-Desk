# J11's fixture for Work ahead: Service-Desk's records at 77bfeae (S-001 AC24)

The records the model's timeline reads, copied from Service-Desk at commit 77bfeae, as
`j11-3117150/` was made, and the timeline the model printed for that commit: the oracle of AC24's
test (MD1 to MD3 in Design i2, the now run; M3A and M3B in Build i2; M3C in Launch i1; M1, M2 and
M2B reached). Real records, made on 2026-10-19.

- `tree.txt`: `git ls-tree -r --name-only 77bfeae` (the paths the tree holds).
- The record files: `docs/PROJECT.md`, `dispatch-log/*.jsonl`, `status/[PQE]-*.toml`,
  `status/merges.jsonl`, `specs/S-*.md`, `intake/requests/*.toml`, `governance/SURFACES.md`,
  `.github/workflows/orchestrator.yml` and every verdict file `reviews/<n>/<name>.md` whose name
  does not start with `_` (README.md left out), each copied unchanged with `git show 77bfeae:<path>`.
- `trace-notes.txt`: the timeline's `NOTE:` lines of
  `python3 governance/checks/v3_checks.py trace --root .`, run in a checkout of 77bfeae (with
  `git archive 77bfeae`); the two lines that are not the timeline (value targets, criteria checked)
  are left out.
- The expected now run, which the `NOTE:` lines don't mark (AC50's rule): Design i2, because MD3 is
  its first project milestone with no sprint, so MD3 is the next to reach.

No file of Personal-Org-Operating-Model is here: AC24's test uses poom/'s placeholder form for it.
