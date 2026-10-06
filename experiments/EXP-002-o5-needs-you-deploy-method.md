# Experiment registration — EXP-002

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (AC26)   open item: O5   milestone: M1, at its first preview deploy
runner: Builder (with the deploy credential), or the owner in the dashboard if the Builder has none
result: docs/handover/experiments/EXP-002-result.md
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
1. The Builder runs `npx wrangler pages project list` with the deploy credential, and saves the
   row for `needs-you`. Wrangler's columns (project name, domains, Git provider, last modified)
   are as observed in its output, not a library fact (C).
2. If the output doesn't settle the question, or the Builder has no credential, the owner opens
   Cloudflare dashboard → Workers & Pages → `needs-you` → Settings. The owner records whether a Git
   repository is connected, with a screenshot or the exact wording.
3. Either way, record the project's custom domains, and whether each one has an Access
   application. That is needed for AC26 and for F-cf-04's per-hostname policies.

## Measure
- Deployment method: Direct Upload, Git-integrated, or can't tell.
- The custom domains of `needs-you`.
- The Access application on each hostname: yes or no.

## Sample
One project, `needs-you`, read once.

## Exclusions
none

## Deciding threshold
- **Direct Upload:** AC26 stands. At M3 the Chief of Staff's workflow deploys `src/` to `needs-you`
  with `wrangler pages deploy`, in an environment the owner approves.
- **Git-integrated:** the owner's fallback (decisions/questions/P-001-o5-define.md).
  - A new Pages project serves the desk.
  - `needs-you.pages.dev` is 301-redirected with Bulk Redirects to a custom domain of the new
    project (library/facts/F-cf-07.md:4, A; only a custom-domain target is documented).
  - The owner has ruled that this counts as meeting V4.
  - The Builder notes it in the M1 handover, and M3's launch steps follow it.
- **Can't tell:** a question to the owner through the Chief of Staff. M1 and M2 continue on the
  preview, which doesn't depend on the answer.

## Holdout use
none

frozen: the commit that adds this file on build/definer/S-001-rev, before any run
