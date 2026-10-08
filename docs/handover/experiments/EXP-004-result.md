# EXP-004 result — per-repository link values

registration: experiments/EXP-004-prefilled-link-per-repo.md   spec: S-001 (J1, J3, J7, AC16–AC19)
run: 2026-10-07, by the owner on the phone, with the links on the preview's `?exp=004` panel (built
in M1); Q4 from the preview's Universe screen (decisions/questions/P-001-m1-accept.md)
recorded by: the Builder, from the owner's report as the Chief of Staff handed it over (Setup CS5);
the Builder ran nothing and holds no token

## What the owner reported

- Every link length on `?exp=004` — 2,000, 6,000 and 8,000 characters, for each repository —
  opened GitHub's new-file page with the content prefilled, on the owner's phone.
- Nothing was committed: no `desk-link-test` branch was made, so there is no file to compare byte
  for byte.
- Q4: Personal-Org-Operating-Model's CI line read "can't read checks" on the preview
  (P-001-m1-accept.md, "Carried to M2").

## Measure, per repository

| Measure | Service-Desk | Personal-Org-Operating-Model |
|---|---|---|
| Q1, web commits to `main` | Not observed in this run (nothing was committed). Open before: the owner's web commit 50b73d7 of `decisions/P-001/stop-6.md` (C). | Not observed in this run. |
| Q2, content prefill with `value` | Filled at every length tested. Not compared byte for byte (nothing committed). Link (a), the short one with `&`, `#`, `%`, an emoji and newlines, was not reported separately. | The same |
| Q3, largest tested length that prefilled | 8,000 characters (the longest tested) | 8,000 characters |
| Q4, CI field on the preview | Not reported | "can't read checks" |

## Against the deciding threshold

- **Q2 and Q3:** the content filled at every tested length up to 8,000, so
  `contentPrefill: true`, `contentParam: "value"` and `linkCap: 6000` stand for both repositories
  (6,000 keeps a margin under the longest length seen to work). No change to
  `src/config/projects.json`.
- **Q1:** not settled by this run for either repository, because nothing was committed.
  `webCommitsToDefault: true` stands, as S-001 records at M1's acceptance (AC15, "As accepted").
  If a web commit to `main` is ever refused, AC18's new-branch route is the fallback, switched per
  repository in J7. See open question below.
- **Q4:** check runs are refused on private Personal-Org-Operating-Model: a fine-grained token has
  no Checks permission. From M2 the desk reads CI from workflow runs, which need Actions: read
  (S-001 AC29, Setup G3).

## Open

- Q1 was not observed on the phone. The registration lets the Chief of Staff confirm it with its
  own GitHub access (`GET /repos/{o}/{r}/rules/branches/main` and `protected` from
  `GET /repos/{o}/{r}/branches/main`). Until then the value rests on 50b73d7 for Service-Desk and
  on no observation for Personal-Org-Operating-Model.
