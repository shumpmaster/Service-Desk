Verdict: FAIL

I opened the cited sources again today (2026-10-01). Two entries pass and are filed. Three claims could not be confirmed and stay out.

**Confirmed and filed** (`library/Q-004-facts.md`, new rows at the end)
- **F-Q004-8 (GraphQL limits), memo lines 101–106:** the GraphQL rate-limits page matches on every point.
  - The limits are 5,000 per user (10,000 on Enterprise Cloud), 5,000 per app installation scaling to 12,500 (10,000 on Enterprise Cloud), and 1,000 per repo for GITHUB_TOKEN (15,000 for enterprise).
  - The cost method, 2,000 points/min, 500,000 nodes and `first`/`last` of 1–100 also match.
  - The page does not mention conditional requests or ETags.
  - It is a single first-party source, as with the other filed docs entries.
- **F-Q004-4, narrowed to W4 only (memo lines 68 and 99):**
  - Discussion 186279 was posted by github-actions[bot] and quotes "up to 40 minutes, with an average delay of 10 minutes", 14:00–17:40 UTC on 2026-02-03.
  - I filed only the Feb 3 incident. The thread was posted on Feb 5, 2026.

**Not confirmed, not filed**
- **W6 (2026-08-26, "fully burned down at 17:40 UTC"), memo lines 69 and 99:**
  - The memo's only source is "as checked in round 1", and there is no URL and no round-1 report in the pack.
  - I opened the GitHub August 2026 availability report. It lists incidents on Aug 6, 17, 20, 26 and 27, but the phrase is not in it.
  - The F-Q004-4 wording on lines 99–100 includes this claim, so it fails as written.
- **F-Q004-3a, "can take a few minutes" (memo lines 67 and 98):**
  - The phrase is not on the best-practices page, the handling-failed-deliveries page or the about-webhooks page.
  - The about-webhooks page says only "near real-time" (W1, which is confirmed).
  - The memo gives no URL for W2 ("webhooks docs (checked in round 1)"). The webhook-events-and-payloads URL returned a 404 for me, so I could not rule it out there. The claim is unverifiable.
- **F-Q004-5 / W3 (Mergify), memo lines 70 and 100:**
  - The figures match: p50 28.44 s, p95 37.15 s, 11 events/s, and about 40 minutes on 2026-04-27.
  - The measurement method (the timestamp in GitHub's payload to Mergify parsing the request) and the third-party-CI caveat also match.
  - The event-type conflict is settled in favour of today's fetch: the page names nine event types.
  - It is still a single vendor, which fails the two-source rule for load-bearing facts, and the memo itself says "not for load-bearing use". I did not file it.
- **PAT-Q004-1 (memo lines 107–114):** it rests on F-3a and F-5, which are not filed, so I did not file it either.

**Other confirmed items** (nothing new filed)
- **W11, W12, W8–W10:**
  - The best-practices page confirms the 2XX-within-10-seconds rule and the `X-GitHub-Delivery` redelivery sentence. It says nothing on delivery order.
  - The redelivering page confirms the 3-day window and who may redeliver (repo admin, org owner, app owner/manager).
  - The handling-failed-deliveries page confirms "GitHub does not automatically redeliver failed deliveries".
  - These match the already filed F-Q004-1 and F-Q004-2.

**Open questions**
1. W6 needs a URL, from the round-1 check or the Researcher.
2. W2 needs the exact docs page for "can take a few minutes".
3. The webhook-events-and-payloads URL I tried gave a 404. The already filed F-Q004-10 and F-Q004-11 cite that page, so someone should confirm the correct URL.
4. I did not open P1, P2, O1, W14–W16, vantaj, devactivity or discussion 173189. The memo lists the last three only as unproposed leads, and the rest were already filed in an earlier round.
5. There is still no independent second source for normal webhook latency.
