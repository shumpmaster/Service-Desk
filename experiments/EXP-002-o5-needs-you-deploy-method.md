# EXP-002 — O5: is the `needs-you` Pages project Direct Upload or Git-integrated?

status: registered (not run)   spec: S-001   open item: O5   registered: 2026-10-06 by definer
*Written without experiments/_REGISTRATION.md, which is not in this pack; restructure to it if it differs.*

## Question
Which deployment method does the Cloudflare Pages project `needs-you` use?

## Why it bears load
A Pages project can't switch method (library/facts/F-cf-03.md:4, B). S-001's AC17 deploys the desk
with `wrangler pages deploy` into `needs-you`, which works only for a Direct Upload project. The
only evidence so far is Operations-Hub's workflow (bd84592, line 110), outside the library (C).

## Expectation (stated before looking)
Direct Upload, matching the observed `wrangler pages deploy site --project-name needs-you`.

## Method
The owner, by hand (Cloudflare settings are the owner's alone, PROJECT.md §4): Cloudflare dashboard
→ Workers & Pages → `needs-you` → Settings / Deployments. Record whether a Git repository is
connected ("Git integration" with a repository and production branch) or not ("Direct Upload"), and
a screenshot or the exact wording. Also record the project's custom domains and whether each has an
Access application (needed for AC15 and AC17; F-cf-04).

## Decision rule (fixed now)
- Direct Upload → S-001 stands: `.github/workflows/desk-deploy.yml` deploys previews to
  `service-desk-preview` and, after launch approval, production to `needs-you`.
- Git-integrated → the owner's fallback (decisions/questions/P-001-o5-define.md): a new Pages
  project for the desk and a permanent redirect from the old address; the Definer writes a
  superseding spec for AC17 before Build reaches D6.
- Can't tell from the dashboard → a question to the owner through the channel; Build continues on
  the preview, which doesn't depend on the answer.

## Runner, cost, result file
Runner: the owner (about 5 minutes); the Chief of Staff files the card. Cost: $0.
Result: `experiments/EXP-002-result.md`.
