---
id: F-cf-cron-01
form: fact
claim: "Cloudflare Pages does not support Cron Triggers (Workers does); a Worker is needed for a scheduled trigger. Cloudflare's 2024 post words it as 'not yet supported in Pages', so this may change."
grade: A
topics: [cloudflare, hosting]
checked_on: 2026-10-08
shelf_life: 6 months
opened_by: source-checker (Q-011, 2026-10-08), through a summarising fetch
memo: research/Q-011-memo.md
publisher_note: same publisher (Cloudflare); two pages count as two sources under governance/standards/sources.md for product behaviour
sources:
  - https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/  # matrix: Cron Triggers Workers ✅, Pages ❌
  - https://blog.cloudflare.com/builder-day-2024-announcements/  # 2024-09-26: "features that are not yet supported in Pages, including Logpush, Hyperdrive, Cron Triggers, Queue Consumers, and Gradual Deployments"
note: The blog is two years old; the matrix is the current statement. Open question whether Pages has gained cron since.
---
