# Ruling needed: do two Cloudflare pages count as two sources for Cloudflare's own limits?

WHY: The Q-006 source check failed (research/Q-006-source-check.md on item/Q-006). Partly that's the memo: five items were wrong or overstated, and the Researcher revises those next round. But the checker also filed nothing, because every fact about Cloudflare's limits (CPU time, outbound requests, durations) is documented only by Cloudflare. Your ruling A on Q-005 covers Anthropic pages only, and the source standard says anything wider needs its own ruling. Without one, Q-006 can't pass however good the revision is, and O3 in the brief stays open.
OPTIONS:
  A. Any vendor, its own product — for facts about how a vendor's own product behaves (its limits and behaviour), two different pages of that vendor's documentation count as two sources, labelled "same publisher". Claims about cost, risk or quality still need an independent source. This covers Cloudflare now and GitHub or others later without another card.
  B. Cloudflare only — the same rule, for Cloudflare pages only. Another vendor needs another card.
  C. Strict — no change. Q-006 can't pass; O3 closes by measuring a real Worker in Define instead, and the Critic sees O3 as open until then.
RECOMMENDATION: A — it's the same reasoning you accepted for Anthropic: the vendor is the only authority on its own product's limits, and the stricter bar stays where independence matters. The checker found the main facts correct on Cloudflare's own pages (10 ms CPU on Free, 50 outbound requests per invocation).
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the research library and the Shape evidence for docs/PROJECT.md §7; no code or deployed system. Changing the source standard file afterwards is an R3 change with its own review.
DEFAULT: A   TIMEOUT: 24
