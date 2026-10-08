# EXP-002 result — how `needs-you` deploys

registration: experiments/EXP-002-o5-needs-you-deploy-method.md   spec: S-001 (AC28)   open item: O5
run: 2026-10-07, by desk-deploy's read-only `exp-002` job (GitHub Actions run 37689475141),
approved by the owner in the `preview` environment
recorded by: the Builder, from the Chief of Staff's hand-over (Setup CS5); the Builder ran nothing

## What the run showed

`wrangler pages project list`, run by the Chief of Staff's pinned wrangler with the token in the
step's `env:` only, listed two projects. The rows, as handed over:

| Project | Domains | Git Provider | Last modified |
|---|---|---|---|
| `service-desk-preview` | (not handed over) | No | (not handed over) |
| `needs-you` | `needs-you.pages.dev` | No | about 2 hours before the run |

Nothing on `needs-you` was changed or deployed (L-0115). The owner did not need to open the
dashboard (method step 2): the row settled the question.

## Measure

| Measure | Result |
|---|---|
| Deployment method | **Direct Upload** (Git Provider: No) |
| Production branch | Not shown by `pages project list`. Operations-Hub's `needs-you-page` workflow deploys with `--branch main` (bd84592, line 110; S-001 AC28), which points to `main` (C). The `production` job's `--branch` is confirmed against the dashboard before AC28's launch. |
| Custom domains of `needs-you` | None listed: the Domains column held only `needs-you.pages.dev` |
| Access application on each hostname | Not shown by the run. Setup C6 puts one on `needs-you.pages.dev` before launch |

## Against the deciding threshold

**Direct Upload: AC28 stands.** At M3 the `production` job deploys the built desk straight into
`needs-you` with `wrangler pages deploy --branch <production branch>`, once the owner approves it
in the `production` environment and has disabled Operations-Hub's `needs-you-page` workflow (Setup
C8). The fallback (a new Pages project, a custom domain and a Bulk Redirect,
decisions/questions/P-001-o5-define.md) is not needed, and Setup C7 is dropped.

## What changes

No code or config: S-001 already records the outcome (AC28; "Experiments in Build"). This file is
the recorded result the spec's "Facts relied on" cites.
