# Experiment registration — EXP-002

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (AC28)   open item: O5   milestone: M1, on the preview after M1's merge
runner: the Chief of Staff, through the read-only `exp-002` job of `.github/workflows/desk-deploy.yml`
(environment `preview`, whose secrets only the workflow holds). If the log can't settle it, the
owner checks the dashboard (about 5 minutes, counted against the pre-launch 2 hours a week). The
Builder holds no Cloudflare token and runs nothing here.
result: docs/handover/experiments/EXP-002-result.md, recorded by the Builder from the Chief of
Staff's hand-over
rulings: decisions/questions/P-001-o5-define.md (fallback); P-001-move-to-build-values.md (a 301
counts as meeting V4); P-001-build-path.md question 0 (run during Build)

## Hypothesis
The Cloudflare Pages project `needs-you` is a Direct Upload project, not Git-integrated.
- **What points that way:** Operations-Hub's `.github/workflows/needs-you-page.yml` at bd84592,
  line 110, runs `wrangler pages deploy site --project-name needs-you` (PROJECT.md §7, U1). That
  evidence is outside the library (C).
- **Why it bears load:** a Pages project can't switch deployment method
  (library/facts/F-cf-03.md:4, B). Deploying the desk into `needs-you` by `wrangler pages deploy`
  works only for Direct Upload.

## Method
Read-only. Nothing on `needs-you` is changed or deployed, by L-0115.
1. The Chief of Staff dispatches the `exp-002` job (`workflow_dispatch`), and the owner approves it
   in the `preview` environment (about 1 minute). It runs the Chief of Staff's pinned wrangler
   (`.github/deploy-tools/`, installed with `--ignore-scripts`) with `pages project list`, with the
   token in that step's `env:` only, and prints the output to the job log. The Chief of Staff
   copies the `needs-you` row from the log.
   - Wrangler's columns (project name, domains, Git provider, last modified) are as observed in its
     output, not a library fact (C).
2. If the row doesn't settle the question, the owner opens Cloudflare dashboard → Workers & Pages →
   `needs-you` → Settings. The owner records whether a Git repository is connected, and its
   production branch, with a screenshot or the exact wording.
3. Either way, record:
   - the project's production branch, which the `production` job's `--branch` uses;
   - its custom domains;
   - whether each hostname has an Access application (needed for AC28 and F-cf-04's per-hostname
     policies).

## Measure
- Deployment method: Direct Upload, Git-integrated, or can't tell.
- The production branch.
- The custom domains of `needs-you`.
- The Access application on each hostname: yes or no.

## Sample
One project, `needs-you`, read once.

## Exclusions
none

## Deciding threshold
- **Direct Upload:** AC28 stands. At M3 the `production` job deploys the built desk to `needs-you`
  with `wrangler pages deploy --branch <production branch>`, once the owner approves it in the
  `production` environment.
- **Git-integrated:** the owner's fallback (decisions/questions/P-001-o5-define.md).
  - A new Pages project serves the desk, with a custom domain on it. Whether the owner holds a
    domain is S-001 owner question 5.
  - `needs-you.pages.dev` is 301-redirected with Bulk Redirects to a custom domain of the new
    project (library/facts/F-cf-07.md:4, A; only a custom-domain target is documented).
  - The owner has ruled that this counts as meeting V4.
  - It is noted in the M1 result file, and M3's launch steps (S-001 Setup C7) follow it.
- **Can't tell:** a question to the owner through the Chief of Staff. M1 and M2 continue on the
  preview, which doesn't depend on the answer.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/S-001-rev, before any run (revised
after the Reviewer's round 1, with no run yet)
