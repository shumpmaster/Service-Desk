---
id: F-gh-ubuntu-slim-01
form: fact
claim: "ubuntu-slim: 1 CPU, 5 GB RAM, workflows run inside a container rather than a dedicated VM (hosted-runners page and the 2026-01-22 changelog); the container runs in unprivileged mode and jobs on single-CPU runners are limited to 15 minutes (hosted-runners page); the changelog dated 2026-01-22 says the 1 vCPU Linux runners are now generally available."
grade: B
publisher_note: same publisher (GitHub docs and changelog); part-wise
topics: [actions, billing]
checked_on: 2026-11-13
shelf_life: 12 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/actions/reference/runners/github-hosted-runners
  - https://github.blog/changelog/2026-01-22-1-vcpu-linux-runner-now-generally-available-in-github-actions/
note: "Container and 1 CPU: two pages. 15-minute limit and 'unprivileged': hosted-runners page only (the changelog fetched does not state them). GA date: changelog only. Single page for those parts, not load-bearing. The memo proposed A for the whole entry; not supported."
---
