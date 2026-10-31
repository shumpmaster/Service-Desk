# Run records for Build's join-up review and the launch review

Gathered by the Orchestrator, 2026-10-31. R = b7d22fa0e1d02aa890672ba0d346c00443f680f4.

- **O3b, the preview of R (path 3):** desk-deploy run 41161879935, "deploy b7d22fa0e1d02aa890672ba0d346c00443f680f4 — O3b: the reviewed commit R, after #256", job `preview` success at 2026-10-31T02:52:51Z, approved by the owner.
- **CS37's read:** desk-deploy run 41151614374 (exp-002), printed `{"success": true, "production_branch": "main"}`; every production deployment of needs-you listed shows Branch `main`.
- **N8 test after R (path 2):** desk-notify run 41203166648, workflow_dispatch, `test` = `true`, success at 2026-10-31T12:54:53Z.
- **CI at R:** desk-build's run on #256 (head 8492d4a), or the Reviewer's own full-suite run at R. To be confirmed by the Reviewer.
- **desk-notify's runs on main, last 7 days, and open `desk-notify` issues:** to be read by the Reviewer with read-only `gh`.

Main after R holds only records (reviews/256/owner.md, 0f7df82); no deployable path has changed since R.

## Added after LA1 (2026-10-31)
- **CI after R:** desk-build push run 41218828445 on #257's merge (c6ddf82, which changed tests/** only), success at 2026-10-31T16:21:05Z, confirmed by the launch review (reviews/S-001/reviewer.md), which also ran the full suite at c6ddf82: 1568 of 1568 pass.
- **Deployable paths unchanged since R** at c6ddf82 (`git diff --quiet R HEAD -- src .github/workflows .github/deploy-tools .github/scripts`).
