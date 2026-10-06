# EXP-004 — Prefilled answer links, per connected repository

status: registered (not run)   spec: S-001 (J3, J7, AC9–AC11)   registered: 2026-10-06 by definer
*Written without experiments/_REGISTRATION.md, which is not in this pack; restructure to it if it differs.*

## Questions
For each connected repository (Service-Desk, Personal-Org-Operating-Model):
1. Is the default branch open to the owner's web commits of a new file (no push ruleset or branch
   protection blocking it)? PROJECT.md §7 U2: "Define checks this per repository."
2. Does a link `https://github.com/<owner>/<repo>/new/<branch>?filename=<path>&value=<content>`
   prefill both the file name and the content, on the phone's browser? (Content parameter name
   `value` is our assumption; no content parameter is documented, library/F-gh-05.md:8.)
3. Up to what link length does the new-file page still open with the content filled in? (No limit
   documented for this page; other GitHub pages return 414, library/F-gh-06.md:8.)

## Expectation (stated before running)
1. Open in both (Service-Desk observed open: commit cdff558, PROJECT.md:314-316, C).
2. Yes, with `value`. 3. At least 6,000 characters (S-001's AC10 cap).

## Method
- Q1, the owner by hand: Settings → Branches and Settings → Rules → Rulesets for each repository;
  record any rule on the default branch.
- Q2 and Q3, the owner on the phone's browser: open four links the Definer or Builder supplies
  per repository, each creating `docs/metrics/link-test-<n>.md` on a **new branch**
  `desk-link-test` (choose "create a new branch" at commit; nothing lands on the default branch):
  (a) a short content with `&`, `#`, `%`, an emoji and two newlines; (b) a link of 2,000 characters;
  (c) 6,000; (d) 8,000. Record for each: file name filled? content filled and byte-identical? any
  error page? Then delete the branch.
- If `value` doesn't prefill the content in (a), stop and record; no other name is guessed
  without a source.

## Decision rule (fixed now)
- Q1 open → `webCommitsToDefault: true` in `config/projects.json`; blocked → `false` (AC11's
  new-branch route).
- Q2 works → `contentPrefill: true`; fails → `false` (AC10's copy route) and S-001's J3 is
  corrected before freeze.
- Q3: the largest tested length that worked becomes AC10's cap if below 6,000; if (c) works, the cap
  stays 6,000.

## Runner, cost, result file
Runner: the owner (about 15 minutes, inside the pre-launch 2 hours a week); links prepared by the
Builder. Cost: $0. Result: `experiments/EXP-004-result.md`.
