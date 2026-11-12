Verdict: FAIL

Only 2 of the 10 proposed entries pass and are filed. Eight stay out because a claim is unconfirmed or has only one source. I did not commit anything, because there is no git repository here.

## Filed (confirmed)
- **`library/facts/F-gh-retention-checks-01.md`**: the Oct 2026 changelog, the Aug 2026 changelog and the GitHub docs retention page agree.
  - Checks, workflow runs and statuses fall under the same retention setting as artifacts and logs, including third-party ones.
  - The default is 90 days, the public-repository maximum is 90, and private repositories allow 1 to 400.
  - Changing the setting does not restore removed data.
  - All three pages were read through summarising fetches, so I kept grade A under the vendor-behaviour rule in `governance/standards/sources.md`.
- **`library/facts/F-gh-check-states-01.md`**: the REST checks/runs page and the 2020 changelog agree.
  - The page lists the statuses and conclusions, says only Actions sets waiting, pending and requested, and says only GitHub sets `stale`.
  - The changelog gives the 14-day rule.
  - The 14 days appears on the 2020 page only, so I noted that it may have changed since.

## Not confirmed (not filed)
- **`F-asof-age-label-01` (NTSB SA-017):** I could not extract the PDF text. A search snippet of the PDF and AVweb support these points:
  - The age indicator shows the mosaic image's age, not the weather's.
  - The weather is "ALWAYS" older, by up to 15–20 minutes.
  - Two fatal accidents showed 1 minute against a gap of up to 5–8 minutes.

  I could not see the 2010 figure of about 5 minutes, the 2011 figures of 6, 7 and almost 8 minutes, or the "guidance did not give the gap size" statement. It is also a single source.
- **`F-git-dates-settable-01`:** git-commit confirms the date variables and `--date`, and the GitHub page confirms Verified, Unverified, Partially verified and web-interface signing. Each half has only one source, so neither meets the two-source rule.
- **`F-log-gap-reporting-01`:** every claim is on the CloudTrail page (lines about missing digests, `(backfill)`, and only referenced files). That is one source, and the memo marks it load-bearing.
- **`P-feed-deadman-01`:** several parts fail.
  - Healthchecks.io: its page defines Period and Grace Time but gives no new/up/late/down definitions, so "late/down" is unconfirmed.
  - 2003 blackout: The Register has the quote, "Unaware of the loss of alarms and a limited EMS, they made no alternate arrangements to monitor the system". It gives no 14:14 time, and the report itself was never read.
  - Three Mile Island: the NRC says the instruments "indicated … that the valve was closed", but nothing I read says the light showed the command rather than the valve's position.
  - kube-prometheus: Watchdog `vector(1)` is confirmed.
  - PromLabs: the "expect an incoming alert notification every x minutes (plus some slack time)" text is confirmed.
  - Grafana: NoData and Error states are confirmed.
  - Prometheus: staleness and the 5-minute lookback are confirmed.
- **`F-provenance-self-generated-01`:** SLSA L1, L2 and L3 wording matches, and so does the W3C PROV definition. Each claim has one source.
- **`F-algorithm-aversion-01`:** I read the PDF text directly, and it matches. The abstract says "more quickly lose confidence in algorithmic than human forecasters", it covers 5 studies, and the citation is JEP: General 2015, 144(1), 114–126. It is a single source.
- **`F-agent-false-success-01`:** the arXiv abstract matches (45–48%, 3%, 75.8%, AUROC not above 0.65, "confident closing language"). It is a single-source preprint, and I think you should treat it as grade C at best.

## Open questions
- Can someone open the NTSB SA-017 PDF as text, or point to a second source for it?
- Can someone read the NERC/DoE blackout report and the Kemeny Commission passage on the valve indicator?
- Can the Healthchecks.io state definitions come from the official docs rather than self-hosted copies?
- Should the single-source entries be re-checked with a second source, or does the owner want to waive the two-source rule for them? The rule is in `governance/standards/sources.md`.