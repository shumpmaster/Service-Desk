---
id: F-log-gap-reporting-01
form: fact
claim: "AWS CloudTrail validate-logs detects modification or deletion of log files and of digest files, validates backfill digest files as well as regular ones, and cannot validate periods for which digest files do not exist (validation disabled, CloudTrail logging stopped, or trail deleted)."
grade: B
topics: [monitoring, audit-logs, provenance]
checked_on: 2026-11-12
shelf_life: 24 months
opened_by: source-checker (Q-025, 2026-11-12); user-guide and CLI-reference pages read as full text; intro page through a summarising fetch
memo: research/Q-025-memo.md
supersedes: none
publisher_note: same publisher (AWS); behaviour claim; three pages.
sources:
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html  # detects changes; backfill chain; missing digest -> range that cannot be validated
  - https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/validate-logs.html  # digest and backfill digest files; no digests while disabled; same when logging stopped or trail deleted
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html  # modified/deleted detection; assert no files delivered in a period
note: "User-guide page only: output names the unvalidatable range; '(backfill)' output prefix; only files referenced by digests are checked."
---
