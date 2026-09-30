# Review verdicts

One directory per PR, one file per required reviewer: `reviews/<PR>/<reviewer-id>.md`.
`governance/checks/review_check.py` reads them, together with governance/risk-paths.toml, and
fails the PR until every required verdict is present and PASS.

At T1 the orchestrator records each verdict verbatim, including the owner's (`owner.md`). This
is honor-based. At T2+ reviewers post their verdicts as PR reviews under their own identity.

A verdict file's first column-0 `Verdict:` line decides it:

```
Verdict: PASS
Reviewed: <head commit>
<the reviewer's evidence per checklist item, verbatim>
```

`Verdict:` may appear only at the start of a line, and only the first such line decides. So
don't paste a reviewer's return into the verdict file when it quotes `Verdict:` mid-line. Keep the
full return verbatim in a sibling file whose name starts with `_` (e.g.
`reviews/<PR>/_reviewer-verbatim.md`), and point to it from the verdict file.

This file (and any name starting with `_`) is not a verdict.
