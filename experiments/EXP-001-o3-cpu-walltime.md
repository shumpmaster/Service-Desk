# EXP-001 — O3: do steady polls and cold-load batches fit Cloudflare Free's CPU and wall time?

status: registered (not run)   spec: S-001   open item: O3   registered: 2026-10-06 by definer
*Written without experiments/_REGISTRATION.md, which is not in this pack; restructure to it if it differs.*

## Question
On a Pages project with Pages Functions on the Workers Free plan, does (a) a steady poll (three
conditional GitHub requests, mostly 304) and (b) a cold-load batch of 30 outbound requests with full
bodies, parsed into S-001's J6 response, stay within 10 ms CPU and complete without a wall-time
failure?

## Why it bears load
PROJECT.md §5 ($0 ceiling) and §7 U1/O3. CPU limit: library/F-cf-workers-01.md:8 (A). Free-plan
HTTP wall time: not filed (library/F-cf-workers-03.md:8). Identical Pages/Workers limits: not
documented (library/facts/F-cf-06.md:4), so this runs on a Pages project.

## Hypothesis (stated before running)
H1: Steady polls fit (0 Error 1102 in 200 calls). H2: Cold-load batches of 30 fit (0 Error 1102 and
0 other limit errors in 20 calls, each completing in under 30 s).

## Method
- Where: the preview Pages project `service-desk-preview` (created by the owner by hand, Access on
  its `pages.dev` address and previews per F-cf-04), on the Workers Free plan. Not `needs-you`.
- What runs: the Builder's first J1/J6 function build, batch size 30, against Service-Desk and
  Personal-Org-Operating-Model with the read token.
- Runs: 200 steady polls at 60 s intervals (about 3.3 h); 20 cold-load calls (ETags cleared) at
  5 min intervals.
- Record per call: HTTP status, any Cloudflare error code (1102, 1027, other), wall time measured by
  the page, and the CPU time the Cloudflare dashboard shows for the Functions if it shows one (that
  Pages exposes per-request CPU is not in the library; if it doesn't, record "not available").

## Decision rule (fixed now)
- H1 and H2 both hold → batch size 30 stands; O3 closes "fits". S-001 unchanged.
- H1 holds, H2 fails → rerun H2 at batch 15, then 8. The first size that passes becomes the
  constant; S-001's J1 figure "30" is amended by a superseding spec only if it was frozen.
- H1 fails, or H2 fails at batch 8 → stop; the owner rules between the $5 Paid plan (new ceiling,
  F-hosting-01) and re-aiming (decisions/questions/P-001-o3-define.md).
- Any wall-time failure is reported with its duration; it is treated as H2 failing.

## Runner, cost, result file
Runner: Builder (during Build, before AC19 is checked); owner creates the preview project. Cost: $0
(within Free; ≈ 260 function requests). Result: `experiments/EXP-001-result.md`, with the raw table.
