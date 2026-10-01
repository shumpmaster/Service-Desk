Verdict: FAIL

I opened every source the memo cites and filed the entries that passed. Four of the eleven proposed facts and the pattern entry did not pass. An unverifiable claim is a FAIL, so the round fails.

**Filed** to `library/Q-004-facts.md`: F-Q004-1, 2, 6, 7, 9, 10, 11. Each one rests on a single GitHub docs page, so the grade is A. The filed entries carry my own checked-on date and source-opened-by (2026-10-01, source-checker). Entries 6 and 9 are filed as the memo states them. The memo's rows don't repeat the page's wording, so I checked them against the page text I fetched.

**Confirmed against the fetched page** (memo line numbers):
- W1: "near real-time" (line 26).
- W2: "can take a few minutes" (line 27).
- W8: "does not automatically redeliver" (line 33).
- W9: past 3 days, admin or app owner/manager (line 34).
- W10: list-deliveries and redeliver endpoints exist (line 35).
- W11: 2XX within 10 s, queue the payload (line 36).
- W14: 25 MB, 5,000 branches, 3 tags, 2,048 commits (line 39).
- W15: check_run actions (line 40).
- W16: no localhost, certificate failures (line 41).
- W13: the best-practices page says nothing on order.
- P1–P4: rate limits, the 304 rule, the commits parameters and 300/3,000 file limits (lines 48–51).
- O1: the Events API quote, 300 events, 30 days (line 91).
- O2: Actions `paths` filter and event-creation limits (line 92).
- W4: the 2026-02-03 incident, up to 40 min, average 10 min.
- W6: the 2026-08-26 incident, "queue of webhook events was fully burned down at 17:40 UTC".
- W3: the Mergify figures match, but see below.

**Not confirmed, so not filed:**
- **F-Q004-3 (W2/W7):** the W2 quote is confirmed. The "no delivery-time guarantee" part is a claim of absence, and I can't confirm it without reading all of GitHub's docs and terms. I did not check an SLA page.
- **F-Q004-4 (W4–W6):** W4 and W6 are confirmed. W5 (3.4 min average, 62 min p99, "no events lost") could not be opened. x.com returned HTTP 402, and it rests on a search snippet only. The "up to 62 min" figure is therefore unverified. A re-filed entry restricted to W4 and W6 would be fine.
- **F-Q004-5 (W3):** the Mergify numbers are confirmed, but it is one vendor's data. The two-independent-sources rule for load-bearing facts is not met. The page also says Jenkins delays distort the picture, and it names no event types for the 28/37 s figures, so the memo's event list (PR, review, check-run, status, push) is not confirmed.
- **F-Q004-8 (G1):** I confirmed the Enterprise Cloud 10,000, the 5,000 app base with a 12,500 cap, the 2,000 points per minute secondary limit, `first`/`last` of 1–100, 500,000 nodes, and a minimum cost of 1. I did not confirm the 5,000 per user, the 1,000 per repo for Actions, or the exact cost formula. My fetch summarised the page and did not quote those. The memo's "sum of connection requests ÷ 100" wording was not confirmed against the page's own wording.
- **G2:** the Jamie Magee blog returned HTTP 403, and GitHub's page does not mention conditional requests. The ETag claim stays out.
- **PAT-Q004-1:** this is an opinion (O), and it depends on the unconfirmed G2 and on W5-style timing claims. I did not file it.

**Discrepancies:**
- **W12 (line 37):** the memo says a redelivery keeps the same ID "so it can be used to drop duplicates". The best-practices page says to use `X-GitHub-Delivery` to ensure each delivery is unique per event. My fetch summary read the same-ID-on-redelivery point as preventing dedup on that header alone. I could not settle which reading is right, and no entry depends on it.
- **W7 and W13:** the memo cites "the four docs pages above" for W7. I could not tell which four pages it means.
- **W17:** the payload page does not say whether commits list added/modified/removed files. That matches the memo's own gap.

**Open questions:**
1. Can the Orchestrator supply a first-party source for the 2026-06-11 incident, for example a githubstatus.com incident page (W5)?
2. Is there an independent second measurement of webhook latency, to meet the two-source rule?
3. Should I re-fetch the GraphQL page for the full G1 wording and re-check F-Q004-8?
4. The `library/` and `governance/` folders did not exist in this pack. I created `library/` and filed there. Please confirm that is right.
5. The pack contains `.env*` files, package manager config and lockfiles. I did not open them, as the memo asked.
