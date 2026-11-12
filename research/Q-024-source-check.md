Verdict: FAIL

The memo has claims I could not confirm, so it fails under the "unverifiable claim" rule. I filed the 14 entries that passed in the library. I held back one entry and the memo's unconfirmed claims. I did not commit anything, because this folder is not a git repository.

## Filed (14)
The new files are in `library/facts/` and `library/patterns/`, each with `checked_on: 2026-11-12`, shelf life, grade, topics and who opened each source. Quotes and figures matched the sources I opened. Most were read raw. Where I used a different route it is recorded in `opened_by`.

- **`F-oncall-ceiling-01` (B):** The SRE book says "the maximum number of incidents per day is 2 per 12-hour on-call shift" and no more than 25% of time on call. The Workbook has the "maximum of two incidents" and "corrective action" text, and the P2 email and P3 "informational only" rows.
- **`F-alarm-rate-01` (B):**
  - VanCamp has the 12-alarms-an-hour figure, the flood definition and the 24-hour stale alarm.
  - The Honeywell/ASM PDF has the EEMUA 10-in-10-minutes figure and the 49-seconds-per-alarm ceiling.
- **`F-alertmanager-grouping-01` (B):** The defaults of 30s, 5m and 4h are on the page. So are the `repeat_interval` sentence, the inhibition rules, and mute and active time intervals.
- **`F-pagerduty-urgency-01` (B):**
  - The memo marked the 30-minute timeout and "nine times" rows as a search summary. I confirmed them on `support.pagerduty.com/docs/escalation-policies`.
  - The urgency and support-hours rows are on the other page. I rewrote the entry's note to say this.
- **`F-ios-interruption-levels-01` (A):** Apple's design guidelines table and the API page agree. The two quotes are present. WebKit says Home Screen web app notifications "integrate with Focus" and says nothing about interruption levels.
- **`F-alarm-flood-presentation-01` (B):** The ASM PDF confirms:
  - 16 operators;
  - a target of 1 alarm per minute;
  - de-chattering at 30, 60 and 120 seconds;
  - p<.10;
  - the "strategically view subsets" and "mistaken perception" quotes;
  - the TT1814 tag-code example.
- **`F-overview-detail-review-01` (B):** The Cockburn PDF (full text) has every quoted phrase.
- **`F-alert-volume-vs-miss-01` (B):** Singh 2013 matches: 2,590 responders, 51.8%, median 63, 86.9%, 29.8%, OR 2.20, and "unrelated to either outcome". Murphy 2016 matches: 76.9 a day, 276,207 notifications, 66.8 minutes.
- **`F-alarm-latch-retune-01` (B):** Whalen's abstract matches (89% reduction, HR 45/130, code blues down 50%). The Joint Commission PDF matches: Alert no. 50, 8 April 2013, 98 events, 80 deaths, 85–99%, and the "not integrated" factor. The alarm-fatigue line sits among the "other factors" not drawn from the reported events.
- **`F-ignored-channel-knight-01` (B):** The SEC order (Release 70694, 16 October 2013) has the 97 emails, the "not design … system alerts" quote, the PMON statements, "multiple sources", and "could have prevented".
- **`F-misleading-display-cases-01` (B):**
  - The Kemeny text is only on the pddoc.com mirror.
  - The HSE Milford Haven page and the CSB recommendation 2005-4-I-TX-14 match.
- **`F-dashboard-feed-01` (B):** Treude's abstract matches. Adelman's numbers match; the PMC page showed me a captcha, so I read the abstract through Europe PMC.
- **`P-repeat-on-change-01` and `P-focus-subset-01` (B):** Both rest only on entries that are filed or already in the library.

## Not filed, or not confirmed
- **`P-monitor-shows-own-health-01`:** It names the 2003 blackout alarm failure as support. That case is only on a secondary page (The Register, via the memo) and I did not confirm it. The pattern stays out until that clause is removed or a primary source is opened.
- **Iqbal & Horvitz (memo §3):**
  - The Microsoft page is a technical report from February 2010, not a CSCW paper.
  - The "passive awareness" and "turning off notifications" findings are there.
  - "20 users" and "notifications off in week two" are not.
  - The memo does not propose an entry for it.
- **Drew (memo §7, UCSF):**
  - The abstract confirms 2,558,760 alarms, 461 patients and 88.8%.
  - The "77 beds" and "March 2013" details are not in what I could read.
- **HSE "led to Better alarm handling" (memo §7):** The Texaco page only lists that guidance as related content. It does not say the case led to it.
- **Memo §0 item 6 ("best for understanding"):** The review says overview+detail is the best option "for particular tasks, such as document comprehension". The filed entry is accurate; the summary overstates it.
- **Murphy (memo §2):** The 76.9 a day is for 46 primary-care physicians. The "92 physicians" figure is the whole sample.
- **GitHub inbox (memo §5):** The current docs give 3 months for Done, indefinite for Saved, and 15 custom filters. I could not find the older "5 months" figure.
- **Never opened:** Grafana OnCall, the PagerDuty alert-grouping page and the Apple Support Scheduled Summary guide. The Buncefield, 2003 blackout and Target items are secondary only. All stay out, as the memo already says.
- **NUREG/CR-6691:** The NRC site returned 403. I read the abstract through a web.archive.org copy of the NRC page, and it matches. The memo does not propose an entry for it.

## Open questions
- Should the held pattern be re-sent without the 2003 blackout clause, or wait for a primary read of that report?
- Should the mirror-only Kemeny text be checked against an official host before the 120-month shelf life stands?
- The memo's R1 (can iOS web-app push be Time Sensitive?) is still open. Apple and WebKit are silent on it, so nothing about it is filed.