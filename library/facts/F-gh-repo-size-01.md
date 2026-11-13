---
id: F-gh-repo-size-01
form: fact
claim: "About large files: 'ideally less than 1 GB, and less than 5 GB is strongly recommended'; warning for files over 50 MiB; GitHub blocks files over 100 MiB. Repository limits page: it 'recommend[s] staying within' these maximums: on-disk size 10 GB, directory width 3,000 entries, directory depth 50, 5,000 branches, push rate 6 pushes per minute per repository (recommended maximum); push size 'is enforced at 2GB'; single object size recommended 1 MB, enforced at 100 MB."
grade: A
publisher_note: same publisher (GitHub docs); 100 MiB block on two pages, rest on one
topics: [github, records]
checked_on: 2026-11-13
shelf_life: 12 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
  - https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits
note: "Correction to the memo: the memo calls the 10 GB, 3,000-entry, depth, branch and push-rate figures 'limits'. The repository-limits page presents them as recommended maximums; only push size (2 GB) and single object (100 MB) are stated as enforced, and 100 MiB is stated as blocked on both pages. The A grade holds only for the 100 MiB block; the rest is single page, not load-bearing."
---
