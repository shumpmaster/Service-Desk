# EXP-001 result — CPU and wall time on the preview

run: 2026-10-07T21:50:22.122Z to 2026-10-07T22:47:05.100Z (done)   BLOB_BATCH: 25
recorded by: the EXP-001 panel (`?exp=001`), committed by the owner

| Set | Calls | Excluded | 1102 | 1027 | Other CF | Wall ≥ 30 s | Not completed | Rate-limited | Max wall ms | p95 wall ms | Max cost.bytes | Max cost.github | Pass (panel) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| H1 | 300 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1938 | 996 | 159852 | 4 | yes |
| H2 | 40 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1295 | 1183 | 178434 | 11 | yes |
| H3 | 20 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1465 | 1413 | 666235 | 25 | yes |

## Repositories at the run

| Repository | Tree files | Blob bytes | Blob calls per cold load (max) |
|---|---|---|---|
| Service-Desk | 426 | 2636321 | 1 |
| Personal-Org-Operating-Model | 318 | 2930961 | 1 |

Largest single blob returned: 128110 characters.

## CPU (from the Cloudflare dashboard, filled in by the owner)

H1 p99 CPU: not available
H2 p99 CPU: not available
H3 p99 CPU: not available

The raw per-call table is pasted below from the panel's copy button.
