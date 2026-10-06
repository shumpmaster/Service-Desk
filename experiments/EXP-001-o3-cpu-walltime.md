# Experiment registration — EXP-001

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (J1, J6, J8, AC14, AC15)   open item: O3   milestone: M1, at its first preview deploy
runner: the owner, from a signed-in desktop browser, using the experiment panel the Builder builds
into M1 (about 15 minutes of the owner's time, counted against the pre-launch 2 hours a week). The
Builder holds no secret and can't reach the Access-protected preview.
result: docs/handover/experiments/EXP-001-result.md, with the summary and the raw table. The
Builder records it from what the owner commits or hands over.
rulings: decisions/questions/P-001-o3-define.md, P-001-o3-walltime.md (fallback);
decisions/questions/P-001-build-path.md question 0 (run during Build, not Define)

## Hypothesis
The M1 desk function fits Cloudflare's Workers Free plan when it runs as a Pages Function, for all
three kinds of call:
- H1: steady polls (J1's poll call, mostly 304s);
- H2: cold-load blob calls of `BLOB_BATCH` = 25 against both connected repositories;
- H3: a heaviest-case blob call against the largest connected repository.

"Fits" means no Error 1102, no Error 1027, no wall-time failure, and a CPU figure under 10 ms where
Cloudflare shows one.

Why it bears load:
- **$0 ceiling:** PROJECT.md §5 and §7, U1 and O3.
- **CPU limit:** library/F-cf-workers-01.md:8 (A).
- **Wall time:** no Free-plan HTTP wall-time limit is filed (library/F-cf-workers-03.md:8).
- **Pages vs Workers:** identical limits are not documented, and Workers Logs is Workers-only
  (library/facts/F-cf-06.md:4). So the run must be on the Pages project itself.

## Method
- **Where:** the preview Pages project `service-desk-preview`, on the Workers Free plan, as
  deployed by the Chief of Staff's desk-deploy workflow from the M1 pull request's branch. Not
  `needs-you`. The run happens behind its Access application.
- **No test-only path (decided here).** Every call is the owner's own: the panel runs in the
  owner's signed-in browser, so each request carries a real `Cf-Access-Jwt-Assertion` with the
  owner's `email` and goes through J8's full check.
  - An Access service token carries no `email`, so it could never pass J8.
  - S-001 adds no exception to J8 for it.
- **What runs:** the real M1 function (J1, J6, J8), not a spike. The page's experiment panel
  (`?exp=001`, built by the Builder in M1, tested against a fake function) drives the calls.
- **The owner's steps** (about 15 minutes in all):
  1. Open `?exp=001` on the preview, on a desktop browser, and press Start.
  2. Leave the tab in the foreground for the run, about 75 minutes. Browsers may slow background
     tabs (C), so the panel stops and says so if the tab is hidden.
  3. Afterwards, open the Pages project's Functions metrics in Cloudflare's dashboard, and note any
     CPU-time percentiles shown for the run window. If none are shown, note "not available".
  4. Commit the panel's summary through the prefilled link it offers. The link goes to
     `docs/handover/experiments/EXP-001-result.md` on the M1 branch; a human commit may touch any
     path. Paste the raw table, which the panel offers through the copy fallback.
- **H1, steady polls:** 300 poll calls, alternating between the two repositories, one every 10 s
  (about 50 minutes). Steady polls are mostly 304s, which cost nothing at GitHub
  (library/Q-004-facts.md:9, A).
- **H2, cold loads:** 20 cold loads, 10 per repository, with the page cache cleared each time,
  interleaved with H1. Each is one poll call with `head: null`, then every blob call the tree needs.
  20 × about 80 GitHub requests = 1,600 full reads in the hour, under 5,000
  (library/Q-004-facts.md:8, A).
- **H3, heaviest case:** 20 blob calls against Personal-Org-Operating-Model. Each holds the 25
  largest blobs in its tree: `docs/LEDGER.md` (128,438 bytes on 2026-10-06), then the largest
  `specs/*.md` and `docs/**` files.
  - This is far more than the desk ever asks of that repository (J6 fetches about 5 blobs there).
    So it bounds the byte volume a call can carry, as records grow.
- **Recorded per call** (by the panel):
  - which set it belongs to;
  - the HTTP status;
  - any Cloudflare error code (1102, 1027, other);
  - wall time, measured from send to last byte (`performance.now()`);
  - J6's `cost.github` and `cost.bytes`.
- **Recorded per set:** the dashboard's CPU percentiles, or "not available". That Pages exposes
  them is not in the library (library/facts/F-cf-06.md:4 marks Workers Logs as Workers-only).
- **Representativeness:** the result states the size of each repository at the run.
  - Its repository size: on 2026-10-06, 1,963 KB for Personal-Org-Operating-Model and 1,067 KB for
    Service-Desk.
  - Its tracked-file count: 318 and 319.
  - The largest single blob returned.

## Measure
- **Per set:** the count of Error 1102, the count of Error 1027, the count of wall-time failures,
  and the count of calls that didn't complete.
- **Wall time:** its maximum and 95th percentile per set.
- **CPU:** the dashboard's percentiles, if any.
- **Load:** the largest `cost.bytes` and `cost.github` per set.
- **A3:** the number of blob calls one cold load needs, per repository.

## Sample
300 steady polls, 20 cold loads (2 repositories × 10) and 20 heaviest-case calls, in one run of
about 75 minutes.

## Exclusions
- **Calls that failed before reaching the function**, such as a network drop on the phone. They
  are logged and repeated, and they don't count. If more than 5% fail this way, the set is re-run.
- **Not excluded:** calls that fetched the Access keys, and calls during a GitHub rate-limit
  answer. A rate-limit answer is recorded as such and doesn't count as a pass or a fail.

## Deciding threshold
- **Pass**, separately for H1, H2 and H3, when all of these hold:
  - zero Error 1102 and zero Error 1027;
  - every call completes, in under 30 s of wall time (our own bar, E);
  - if Cloudflare shows CPU percentiles, the 99th is under 10 ms.
- **If any set fails, the owner's fallback applies**
  (decisions/questions/P-001-o3-define.md, P-001-o3-walltime.md):
  - Lower `BLOB_BATCH` to 12 and re-run the failing sets, then to 6.
  - If H1 fails, the batch size can't help, so go straight to the next step.
  - If it still fails at 6, M1 is not accepted, and the owner rules on the $5 Paid
    plan, which needs a new ceiling, or on re-aiming.
- **A changed batch size or count:** if the batch size changes, or a cold load needs more than 3
  blob calls (A3), S-001's AC14 arithmetic is redone with the measured figures in the result file.
  The Definer folds the result into S-001.
- **Re-run trigger:** the Chief of Staff re-runs H3 when any single blob a call returns exceeds
  twice the largest blob H3 tested.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/S-001-rev, before any run (revised
after the Reviewer's round 1, with no run yet)
