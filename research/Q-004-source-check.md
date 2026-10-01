Verdict: PASS

I opened every cited source today (2026-10-01). Four entries are confirmed and filed in `library/Q-004-facts.md`. One memo figure was wrong and I corrected it. I wrote only to `library/`.

**Filed**
- **F-Q004-3a:**
  - `docs.github.com/en/webhooks/about-webhooks` says "Webhooks allow near real-time updates, since webhooks are triggered when an event happens."
  - The troubleshooting-webhooks page says "Webhook deliveries can take a few minutes to be delivered and to appear in the recent deliveries log." This is under "Webhook deliveries are not immediate".
  - The memo cites the about-webhooks page under `/using-webhooks/`, which returns 404. The page works at `/en/webhooks/about-webhooks`, so the filed entry uses that URL.
- **F-Q004-12:** the troubleshooting page, section "Webhooks deliveries are out of order", says "GitHub may deliver webhooks in a different order than the order in which the events took place". It also points to payload timestamps. The best-practices page says nothing on order.
- **F-Q004-13, filed with a correction:**
  - The status page title is "Incident with Actions", dated 2026-08-26.
  - It says throttles were "gradually raised between 15:54 and 17:22 to restore full webhook processing for Actions runs" and "The queue of webhook events was fully burned down at 17:40 UTC."
  - The memo says "2 h 50 min". The github.blog August 2026 report gives about 2 h 53 min, with a 15:11 UTC start. I filed 2 h 53 min.
  - The scope is Actions runs only, as the memo says.
  - The "more than one in five run starts failing" figure is in the report but is not in the entry.
- **PAT-Q004-1:** all seven dependencies (F-1, 3a, 4, 6, 7, 9, 12) are now filed or reconfirmed. The arithmetic in E1 holds: 15 calls per poll gives 900/h, 180/h and 60/h at 1, 5 and 15 minutes. "3 calls per repo" is the memo's assumption, and I kept it labelled as an estimate.

**Reconfirmed, already filed, no change**
- **F-Q004-4 (W4):** discussion 186279 was posted by github-actions[bot] on 2026-02-05. It says deliveries "were delayed by up to 40 minutes, with an average delay of 10 minutes", for 14:00–17:40 UTC on 2026-02-03.
- **F-Q004-1 and F-Q004-2:** the handling-failed-deliveries page says GitHub does not automatically redeliver failed deliveries. The redelivering page gives the 3-day window and who may redeliver. The best-practices page confirms the 2XX-within-10-seconds rule and the `X-GitHub-Delivery` redelivery sentence.
- **F-Q004-7:** a 304 on a conditional request does not count against the primary rate limit when sent with an `Authorization` header.
- **F-Q004-9:** "event latency can be anywhere from 30s to 6h".
- **F-Q004-10 and F-Q004-11:**
  - The events-and-payloads page confirms the 5,000-branch and 3-tag limits, the 2,048-commit cap and the 25 MB cap.
  - It confirms repo/org webhooks get only `created` and `completed` for check_run, and that the app needs write access to Checks to get `rerequested` and `requested_action`.
  - It does not say whether push commits list changed files, so W17 stays a gap.

**Not filed, as the memo says**
- **F-Q004-5 (Mergify):** I did not re-open it this round. It is withdrawn by the memo, and the earlier source-check report confirmed its figures.
- **Leads (W5, devactivity, discussion 173189):** I did not open these. The memo does not propose them.

**Open questions**
1. **Second source for latency:** there is still no independent second source for normal webhook latency, so every webhook fact is single-source (GitHub docs).
2. **F-Q004-6 wording:** the REST rate-limits page I fetched gives installation limits of 5,000 and 15,000 (Enterprise Cloud). It does not show the "up to 12,500" in filed F-Q004-6. That text may be GraphQL-specific, or the fetch summary may have dropped it. Re-check F-Q004-6 before anyone relies on that figure.
3. **Customer deliveries on 2026-08-26:** the status page does not say whether customer webhook deliveries were delayed, so F-Q004-13 must not be read as evidence of that.
4. **Not opened:** the Enterprise Cloud SLA, the REST compare endpoint for W17, and the memo's secondary leads.
