I've fixed every point the Source checker raised, and the revised memo follows in full for the Orchestrator to record over research/Q-024-memo.md. Two items from the checker's report are still not confirmed, so the revised memo states them at grade C or drops them: what the 2003 blackout report says, and Apple's Support guide on Scheduled Summary. I re-propose only the pattern the checker held back, with the 2003 blackout clause removed, plus two new entries.

---

# Research memo: Q-024, what interrupts a single supervisor and what waits (revision 2)

**Date:** 2026-11-12 · **Role:** researcher · **Depth asked:** 3 · **Topics:** notifications, briefing, dashboards, mobile, monitoring
**To:** the Source checker, through the Orchestrator, who records this memo in research/ (it replaces research/Q-024-memo.md)

**What changed since revision 1.** Each item below answers one line of research/Q-024-source-check.md. Everything else is the same as revision 1.

| Check finding | What this revision does |
|---|---|
| `P-monitor-shows-own-health-01` was held back because of its 2003 blackout clause | **Clause removed**; the pattern now rests only on filed entries (§10). I tried the official report: energy.gov `BlackoutFinal-Web.pdf` downloaded, but the fetch tool could not pull its text reliably and gave no verbatim quote I trust. NERC `ch5.pdf` returned 404, and web.archive.org cannot be reached. The 2003 case stays at grade C in §7 and is not used as support. |
| Iqbal & Horvitz: wrong venue, and "20 users" and "week two" not found | **Corrected.** It is a Microsoft Research technical report, MSR-TR-2009-67, dated February 2010 (also Yale CS TR #561). The page confirms a two-week field study. It does not give a participant count or which week alerts were turned off, so both details are removed. |
| Drew: "77 beds" and "March 2013" not confirmed | **Now confirmed in the PMC full text**, which I re-read this round: "five adult ICUs", 77 beds, March 2013, a "31-day study period". Proposed as a new entry (§10). |
| HSE "led to Better alarm handling" | **Removed.** §7 now says only that the HSE page lists that guidance as related content. |
| §0 item 6 said overview+detail is "best for understanding" | **Corrected** to "for particular tasks, such as document comprehension". |
| Murphy: "92 physicians" | **Corrected.** 76.9 a day is the mean for 46 primary-care physicians, out of a sample of 92 physicians. |
| GitHub "older docs say 5 months" | **Removed.** Only the current docs' 3 months is kept. |
| Never opened: Grafana OnCall, PagerDuty alert grouping, Apple Support Scheduled Summary guide | **Grafana opened:** confirmed, and proposed as a new entry. **PagerDuty grouping opened:** the page now redirects to docs.pagerduty.com. It lists four methods and gives no noise-reduction figure. "Exact field match" is not on that page and is removed. **Apple Support:** neither support.apple.com page I tried showed the text. That citation is dropped, and the claim now rests only on the Apple design guidelines row in the filed `F-ios-interruption-levels-01`. |
| Joint Commission alarm-fatigue line (the checker noted it is not drawn from the reported events) | **Wording corrected** in §7: it appears among "other factors", not among the counted contributing factors. |
| PagerDuty 30-minute timeout and "nine times" | **Upgraded** from C to B, because the Source checker confirmed them on the page. |

**How to read the marks.** Every statement is tagged **[fact]**, **[estimate]** or **[opinion]**, with a proposed grade:
- **A:** two or more independent authoritative sources, or one publisher's own documentation backed by a second page of theirs (for how a product behaves).
- **B:** one authoritative or peer-reviewed source.
- **C:** a secondary source only, or a search-result summary I could not confirm in the source itself.

Entries already filed by the Source checker are cited by their ID.

**A caution about distance.** Most evidence comes from process control, hospital alarms, operations on-call work and software teams. None of it studies one person overseeing many AI-agent projects from a phone. Applying it to that setting is always **[opinion]**.

---

## 0. Short answer

1. **Deciding what interrupts.** Every field I looked at sorts signals into a few levels, judged by whether a person must act now:
   - interrupt now (a "page");
   - queue for business hours (a "ticket" or email);
   - record only (a log or dashboard).

   Products build this into their settings: PagerDuty urgency levels and support hours, Grafana's Default and Important rules, and Time Sensitive notifications on iPhone. **[fact, A/B; §1]**

2. **Ceilings.**
   - Google SRE targets at most 2 incidents per 12-hour on-call shift. **[fact, B; F-oncall-ceiling-01]**
   - Process-industry guidance puts the most an operator can manage over the long run at about 12 alarms an hour. More than 10 new alarms in 10 minutes is a "flood". **[fact, B; F-alarm-rate-01]**
   - No source gives a daily cap for one person supervising work they are not continuously watching. **[fact: not found]**
   - In the largest survey, the number of alerts did not predict missed items; feeling overloaded did (Singh 2013). **[fact, B; F-alert-volume-vs-miss-01]**

3. **One alert per item, grouped, or at set times.**
   - Alertmanager groups by default. It waits 30 s to collect related alerts, sends one message per group, and then spaces later messages for that group at least 5 min apart. **[fact, B; F-alertmanager-grouping-01]**
   - The iPhone can hold ordinary notifications for a scheduled summary; Time Sensitive notifications override that hold. **[fact, B; Apple design guidelines, in F-ios-interruption-levels-01]**
   - One randomised field study found that batching three times a day improved well-being. It did not measure missed items. **[fact, B; F-batch-notify-01]**
   - The only controlled test of rate limiting under load I found (16 operators) found that limiting alarms to about one a minute, most important first, improved performance. **[fact, B; F-alarm-flood-presentation-01]**

4. **An item still waiting after its first alert.**
   - Tools repeat on a timer. Alertmanager repeats every 4 h by default, and only if nothing has changed.
   - Or they escalate after a timeout. PagerDuty's default is 30 min, and a policy repeats up to 9 times while nobody acknowledges. Grafana loops up to 5 times per repeat step.
   - Low-urgency items in PagerDuty never escalate.
   - Process control calls an alarm still active after about 24 h "stale". It treats this as a quality problem to fix, not something to keep re-sounding. **[fact, B]**
   - Repeats reduce how often people act on alerts. **[fact, B; F-alert-repeat-01]**

5. **What the supervisor sees after hours or days away.** The documented practices are:
   - a written handoff summary (Google SRE);
   - an inbox of items addressed to them, with "done" and "saved" states (GitHub);
   - handoff methods observed in high-risk control rooms (Patterson 2004). **[fact, B]**

   I found no study that measured catch-up screens directly. **[fact: not found]**

6. **Action items with the surrounding work or apart; folding by focus.**
   - The best-supported finding: a separate overview beside a detail view is often preferred. For particular tasks, such as document comprehension, no alternative has been found to be more effective. Its costs are screen space and the effort of linking the two views.
   - Distorting "fisheye" views have largely failed to show performance gains.
   - Emphasising or grouping the items that matter does help. **[fact, B; F-overview-detail-review-01]**
   - In alarm floods, performance improved when operators could view one area's alarms at a time instead of one list of everything. Many still went back to the single list. Some believed they were doing better because they saw fewer alarms. **[fact, B; F-alarm-flood-presentation-01]**

7. **Recorded failures** fall into four groups:
   - **floods:** Three Mile Island, Milford Haven, intensive care;
   - **misleading displays:** Three Mile Island, Milford Haven, Texas City, Buncefield;
   - **silent failure:** the 2003 blackout, grade C only;
   - **ignored channels:** Knight Capital; Target, grade C.

   Combining displays has failed in both directions:
   - Texas City kept inflow and outflow on separate screens, and the fix was to show the material balance.
   - Buncefield put many tanks on one screen (grade C).
   - Knight Capital mixed positions from several sources in one account.

   Fixes that were measured:
   - latching alarms until acknowledged, with retuned defaults, cut audible alarms by 89% with no missed events (Whalen 2014);
   - rate limiting during floods (ASM 2011).

---

## 1. How interrupt-or-wait is decided

- **[fact, B]** In the Google SRE Workbook, P2 events "send an email to team and notifies event stream channel", and P3 events are "informational only". (F-oncall-ceiling-01) https://sre.google/workbook/on-call/
- **[fact, B]** Google SRE: "Every page should be actionable." (P-notice-actionable-01)
- **[fact, B]** PagerDuty:
  - high urgency "escalates if not acknowledged";
  - low urgency "cannot escalate";
  - separate rules can apply during and outside support hours.

  (F-pagerduty-urgency-01) https://docs.pagerduty.com/incident-management/incidents/dynamic-notifications
- **[fact, B]** Grafana OnCall: each escalation step chooses "Default notifications" ("Standard alert notifications as configured in the user's profile") or "Important notifications" ("High-priority notifications that use more aggressive channels or frequencies"). Each responder sets their own rules. *Page opened this round.* https://grafana.com/docs/grafana-cloud/alerting-and-irm/oncall/configure/escalation-chains-and-routes
- **[fact, A]** Apple:
  - **Four levels.** Passive and Active do not override scheduled delivery or break through Focus. Time Sensitive does both. Critical also overrides the Ring/Silent switch.
  - **Guidance:** use Time Sensitive "only for notifications that are relevant in the moment", and "Build trust by accurately representing the urgency of each notification."

  (F-ios-interruption-levels-01)
- **[fact, B]** WebKit: Home Screen web app notifications "integrate with Focus". The page says nothing about interruption levels. (F-ios-interruption-levels-01)
- **[fact: unknown]** Whether a Web Push message to an iPhone Home Screen web app can be Time Sensitive, or is held for Scheduled Summary. Not stated on any Apple or WebKit page I read. See R1.
- **[fact, B]** GitHub Mobile's Working Hours setting controls when pushes are sent. (F-gh-11)

## 2. Ceilings per hour or per day

- **[fact, B]** SRE book: "the maximum number of incidents per day is 2 per 12-hour on-call shift", and no more than 25% of time on call. Workbook: a "maximum of two incidents per on-call shift", with "corrective action" if the load goes higher. (F-oncall-ceiling-01)
- **[fact, B]** Workbook case: a team getting 5 incidents per shift reduced its load by removing the causes (automating changes, a bug for every outage), not by filtering alerts. https://sre.google/workbook/on-call/
- **[fact, B]** Process industries:
  - up to 12 new alarms an hour is "the maximum manageable for an operator";
  - EEMUA flood: "a 10-minute period with more than 10 new alarms";
  - stale alarm: active about 24 h;
  - about one minute per alarm (Reising et al. 2004, as cited by ASM 2011).

  (F-alarm-rate-01)
- **[fact, C]** The finer EEMUA bands per 10 minutes come from a search summary only. The standard is paid and was not read. Not filed.
- **[fact, B]** Survey of 2,590 VA primary-care practitioners (median 63 alerts a day):
  - 86.9% found the quantity excessive;
  - 29.8% had missed results that delayed care;
  - feeling overloaded predicted missed results (OR 2.20);
  - the number of alerts per day was "unrelated to either outcome".

  Singh et al. 2013. (F-alert-volume-vs-miss-01)
- **[fact, B]** Murphy et al., JAMA Intern Med 2016: the 46 primary-care physicians in a sample of 92 physicians received a mean of 76.9 notifications a day, an estimated 66.8 min a day. The sample was 276,207 notifications, January to June 2015. *Corrected.* https://pmc.ncbi.nlm.nih.gov/articles/PMC4860883
- **[opinion]** These ceilings come from people whose job is continuous watching. For an owner who checks in now and then, the SRE figure (about 2 interrupting events per 12 hours) is the closest documented guide to a daily cap. It is not a finding for this setting.

## 3. One alert per item, grouped, or at set times

- **[fact, B]** Alertmanager:
  - `group_by` collects alerts with matching labels into one group;
  - `group_wait` (default 30 s) waits before the first message for a new group;
  - `group_interval` (default 5 min) spaces later messages for that group;
  - inhibition rules mute some alerts while another is firing;
  - mute and active time intervals restrict when routes notify.

  (F-alertmanager-grouping-01)
- **[fact, B]** PagerDuty Alert Grouping offers four methods: Intelligent, Content-Based ("Alert Content"), Intelligent + Alert Content, and Time-Based ("Time only"). The page says grouping is designed to "cut noise, reduce alert fatigue, and speed up response", and gives no figure. *Page opened this round; the old URL redirects here.* https://docs.pagerduty.com/ai-automation/aiops/noise-reduction/alert-grouping
- **[fact, B]** iPhone: Time Sensitive notifications override scheduled delivery. This is the "Overrides scheduled delivery: Yes" row in Apple's design guidelines table (in F-ios-interruption-levels-01). *Revised:* the Apple Support citation is dropped because neither page I tried showed the text. Grade lowered from A to B, since only one Apple page supports it.
- **[fact, A]** Web Push Topic: a message with a topic replaces any undelivered message with the same topic. (F-webpush-02b)
- **[fact, B]** Batching three times a day improved self-reported attention, productivity and mood. Missed items were not measured. (F-batch-notify-01)
- **[fact, B]** Iqbal & Horvitz, "Notifications and Awareness: A Field Study of Alert Usage and Preferences", Microsoft Research technical report MSR-TR-2009-67, February 2010. A two-week field study:
  - users treated alerts as "a mechanism to provide passive awareness rather than a trigger to switch tasks";
  - with notifications turned off, "some users … self interrupt more to explicitly monitor email arrival, while others appear to be able to better focus on their tasks".

  *Corrected:* venue fixed; no participant count or week design is claimed. https://www.microsoft.com/en-us/research/?p=157638
- **[fact, B]** ASM 2011 (16 operators, floods averaging 146 alarms): throttling to about 1 alarm a minute, by priority and time left to respond, with de-chattering, improved performance and lowered workload whatever the display. (F-alarm-flood-presentation-01)
- **[fact, B]** Wessel et al., CSCW 2021 (interviews with 21 practitioners): noise from bots on pull requests is "a recurrent and central problem". https://arxiv.org/abs/2103.13950. Ribeiro et al. 2022 merged bot comments into one, and measured only the preferences of 25 newcomers. https://arxiv.org/abs/2208.01624

## 4. An item still waiting after its first alert

- **[fact, B]** Alertmanager `repeat_interval` (default 4 h): notifications are not repeated if alerts have fired or resolved since the last group interval. (F-alertmanager-grouping-01)
- **[fact, B]** PagerDuty: the default escalation timeout is 30 min, and a policy repeats up to 9 times, only while unacknowledged. Low urgency cannot escalate. (F-pagerduty-urgency-01; *upgraded from C*)
- **[fact, B]** Grafana OnCall: "Loop the previous escalation steps up to five times"; each repeat step keeps its own counter. *Page opened this round; upgraded from C.*
- **[fact, B]** Stale alarms: suppressing one "will not address the underlying condition". (F-alarm-rate-01 source, VanCamp 2016)
- **[fact, C]** Alarm shelving under ISA-18.2: started by the operator, temporary, and returns on its own. From vendor pages via search only. Not filed.
- **[fact, B]** Repeats lower acceptance. (F-alert-repeat-01)
- **[fact, B]** Whalen et al. 2014: latching alarms that must be acknowledged, plus retuned defaults, gave an 89% fall in audible alarms, with no adverse events from missed alarms. (F-alarm-latch-retune-01)

## 5. What the supervisor sees of what piled up

- **[fact, B]** Google SRE: at the start of a shift, "read the handoff from the previous shift"; at the end, send a handoff email. https://sre.google/workbook/on-call/
- **[fact, B]** Patterson et al. 2004: of 21 handoff strategies, 19 were used in at least one of four high-risk control domains. Abstract only. DOI 10.1093/intqhc/mzh026
- **[fact, B]** GitHub notification inbox:
  - default filters for assigned, participating, review requested and @mentioned;
  - "Done" keeps an item for 3 months, and "Saved" keeps it indefinitely;
  - up to 15 custom filters.

  *Corrected: the "5 months" remark is removed.* https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox
- **[fact, B]** Show when data was last updated, and do not hide stale data. (P-stale-visible-01)
- **[fact, C]** A cue available when someone resumes work shortens the time to resume (Altmann & Trafton model). Search summaries only.
- **[fact: not found]** No study measured how well a summary of "what happened while you were away" catches missed items.

## 6. Display: action items together or apart; folding by focus

- **[fact, B]** Cockburn, Karlson & Bederson 2008 (F-overview-detail-review-01):
  - **overview+detail:** often preferred; "for particular tasks, such as document comprehension, no alternative has been found to be more effective"; costs screen space and the effort of integrating the views;
  - **zooming:** "easy to do badly";
  - **fisheye:** distortion views have largely failed to show performance gains;
  - **cues:** techniques that emphasise or group items help.
- **[fact, B]** ASM 2011 (F-alarm-flood-presentation-01):
  - viewing subsets of alarms by equipment area beat one list of all alarms;
  - the new overview displays showed no consistent advantage;
  - operators reverted to a single list;
  - some had a "mistaken perception" of doing better because they saw fewer alarms;
  - tag codes forced look-ups in the detailed list;
  - in a scrolling list, higher-priority alarms scroll off the page.
- **[fact, B]** NUREG/CR-6691 (O'Hara et al. 2000): six crews and three alarm display designs. Differences in performance were "modest", and operators' ratings were more sensitive to the designs than their measured performance. The NRC host returned 403 to the Source checker, who matched the abstract on an archived copy. https://www.nrc.gov/reading-rm/doc-collections/nuregs/contract/cr6691/index
- **[fact, B]** Treude & Storey 2010: dashboards for prioritising tasks, feeds for short-term planning. Adelman et al. 2019: one open record versus up to four made no difference to wrong-patient orders. (F-dashboard-feed-01)
- **[fact, B]** Put what is often needed on the first screen and the rest one step away. (P-glance-disclosure-01)

## 7. Recorded overload, misleading-display and ignored-display failures

| Case | What failed | Source | Fix recorded | Mark |
|---|---|---|---|---|
| Three Mile Island 1979 | Over 100 early alarms with no way to suppress unimportant ones; the alarm printer more than 1.5 h behind; the relief-valve light showed only the command sent | Kemeny Commission text, mirror only (F-misleading-display-cases-01) | not read | fact, B (mirror) |
| Texaco Milford Haven 1994 | Excessive alarms; graphics without process overviews; a valve shown open was shut | HSE case page https://www.hse.gov.uk/comah/sragtech/casetexaco94.htm | *Corrected:* the page lists HSE's "Better alarm handling" guidance as related content. It does not say the case led to it. | fact, B |
| BP Texas City 2005 | Level reading showed falling while the tower overfilled; inflow and outflow on different screens | CSB https://www.csb.gov/bp-america-texas-city-refinery-explosion/ | Recommendation 2005-4-I-TX-14: show material balance, multiple level indicators | fact, B (recommendation); C (screen detail) |
| Buncefield 2005 | A stuck gauge; one screen for many tanks; the tank's window stacked behind others | Secondary page only https://humanfactors101.com/incidents/buncefield-11-december-2005/ | not read | fact, C |
| North American blackout 2003 | The FirstEnergy control room's alarm and logging software stopped without the operators knowing | The Register 2004-04-08 (secondary). The official PDF (energy.gov BlackoutFinal-Web.pdf) downloaded, but the fetch tool could not extract its text reliably; NERC chapter PDF 404 | Vendor software fix (as quoted, secondary) | fact, C (not filed; not used as support) |
| Knight Capital 2012 | 97 unreviewed emails "not designed … to be system alerts"; PMON gave no automated alerts and its reports were delayed; one account held positions from "multiple sources" | SEC order 34-70694 (F-ignored-channel-knight-01) | Integrating those messages into monitoring "could have prevented the events" | fact, B |
| Target 2013 | Repeated malware alerts at the top grade, not acted on | Press reports only | not read | fact, C |
| Joint Commission alert no. 50 (2013) | 98 events, 80 deaths, 2009–2012; 85–99% of alarm signals need no intervention; counted factors include alarms "inappropriately turned off" and settings "not integrated with other medical devices" | PDF (F-alarm-latch-retune-01) | Inventory, guidelines, settings per patient | fact, B. *Corrected:* "alarm fatigue, the most common contributing factor" appears among the alert's other factors, not among the factors counted from the reported events. |
| UCSF intensive care, March 2013 | 2,558,760 alarms in 31 days, five adult ICUs, 77 beds, 461 patients; 88.8% of 12,671 annotated arrhythmia alarms were false positives | Drew et al., PLoS ONE 2014, full text https://pmc.ncbi.nlm.nih.gov/articles/PMC4206416 | Limit atrial-fibrillation alarms "to new onset and termination"; devices to ask "Do you want to continue to hear atrial fibrillation alarms?" | fact, B. *Bed count and month now confirmed in the full text.* |
| Flaky tests in continuous integration | "the loss of trust in the test outcomes" | Gruber & Fraser, ICST 2022 https://arxiv.org/abs/2203.00483 | n/a | fact, B |

- **[opinion]** Combining displays has failed in both directions:
  - Separating related data hid a contradiction (Texas City).
  - Mixing sources hid which one was failing (Knight; Buncefield at grade C).
  - Signals sent over a channel nobody treated as an alert were ignored (Knight).
  - Several monitors did not show their own health: PMON's delayed reports, and the stuck gauge (C). The 2003 case (C) would fit too.

  These are patterns I infer across cases, not findings of any single source.

## 8. Gaps and limits

- No study covers one person overseeing many semi-autonomous software projects. Every transfer to that setting is opinion.
- Batching studies measured well-being, not missed actions. Only ASM 2011 measured performance: 16 operators, p<.10.
- I did not read EEMUA 191 or ISA-18.2, which are paid. A decision card is needed if the exact bands matter.
- The 2003 blackout report: the official PDF exists at energy.gov, but the fetch tool cannot extract its text reliably. A Source checker with a PDF text tool could confirm the case.
- Apple Support's own Scheduled Summary page could not be read.
- R1 (iOS web-app push and Time Sensitive) is still unknown.

## 9. Research questions I add (unchanged)

1. **R1.** On iOS and iPadOS, can a Web Push notification to a Home Screen web app carry an interruption level, especially Time Sensitive? Are web-app notifications eligible for Scheduled Summary and for Focus allow-lists? *Decision served:* whether a phone-side tier between "interrupt" and "wait for the summary" is available. *Depth:* 2.
2. **R2.** Which studies measure missed or late required actions, not well-being, under immediate, batched and scheduled notification of items that need action? *Decision served:* the interruption rule. *Depth:* 3.
3. **R3.** What do the primary texts of EEMUA 191 and ANSI/ISA-18.2 (or IEC 62682) state as alarm-rate bands, and as flood, stale-alarm and shelving rules? *Decision served:* a daily or hourly ceiling. *Depth:* 3. Needs a paid source, so needs the owner's approval.
4. **R4.** What studies evaluate "since you were away" or handoff summaries for missed items after long absences, in any field? *Decision served:* the first screen after an absence. *Depth:* 3.

## 10. Proposed library entries (this round only; the 14 filed entries are not re-sent)

```yaml
---
id: P-monitor-shows-own-health-01
form: pattern
claim: "A supervision display or alert channel should show its own freshness and failure, and signals that need action should travel on a channel designed and treated as an alert. Supports: Knight Capital's PMON gave no automated alerts and its delayed reports were inaccurate, and 97 emails 'not designed … to be system alerts' went unreviewed (F-ignored-channel-knight-01); show when data was last updated and do not hide stale data (P-stale-visible-01); indications that showed the command sent rather than the actual state (F-misleading-display-cases-01). Inference across cases, untested for AI-agent oversight."
grade: B
topics: [monitoring, dashboards]
shelf_life: 36 months
opened_by: researcher (Q-024, 2026-11-12, revision 2)
memo: research/Q-024-memo.md
sources: [F-ignored-channel-knight-01, P-stale-visible-01, F-misleading-display-cases-01]
note: Revision 2 removes the 2003 blackout clause (secondary only). Rests only on filed entries.
---
```

```yaml
---
id: F-grafana-oncall-escalation-01
form: fact
claim: "Grafana OnCall: each escalation step notifies with either 'Default notifications' ('Standard alert notifications as configured in the user's profile') or 'Important notifications' ('High-priority notifications that use more aggressive channels or frequencies'); responders set their own rules. A repeat step will 'Loop the previous escalation steps up to five times'; each repeat step keeps its own counter."
grade: B
topics: [notifications, monitoring]
shelf_life: 12 months
opened_by: researcher (Q-024, 2026-11-12, revision 2)
memo: research/Q-024-memo.md
sources:
  - https://grafana.com/docs/grafana-cloud/alerting-and-irm/oncall/configure/escalation-chains-and-routes
note: Product behaviour, single page, read through the summarising fetch tool. Check the quotes against the raw page.
---
```

```yaml
---
id: F-icu-alarm-volume-01
form: fact
claim: "Drew et al., PLoS ONE 2014 (UCSF, five adult ICUs, 77 beds, March 2013): 2,558,760 unique alarms in the 31-day study period for 461 patients; '88.8% of the 12,671 annotated arrhythmia alarms were false positives'. Recommendations include limiting atrial-fibrillation alarms 'to new onset and termination of the arrhythmia' and devices asking 'Do you want to continue to hear atrial fibrillation alarms?'"
grade: B
topics: [monitoring, notifications]
shelf_life: 60 months
opened_by: researcher (Q-024, 2026-11-12, revision 2)
memo: research/Q-024-memo.md
sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4206416
note: Single site, one month; clinical setting, distant. Read through the summarising fetch tool. If PMC shows a captcha, use Europe PMC.
---
```

---

## Six-part contract

1. **What I changed.** I revised the memo. Every point in the source check is fixed, as listed in the "What changed" table:
   - re-proposed `P-monitor-shows-own-health-01` without the 2003 blackout clause;
   - corrected Iqbal & Horvitz, Murphy, the HSE "led to" line, §0 item 6, the GitHub retention and the Joint Commission factor wording;
   - confirmed the Drew details;
   - opened the Grafana and PagerDuty grouping pages, and dropped what they did not support;
   - dropped the Apple Support citation and lowered that claim's grade from A to B;
   - proposed two new facts.

   Nothing is on disk: I have no write tool.
2. **Why.** The source check failed the memo for claims its sources did not support. Each was either confirmed in a source I opened this round, cut back to what the source says, or moved to grade C and left out of every entry.
3. **What I verified.** I have no shell; these are page fetches:
   - **Drew, PMC full text:** confirms 77 beds, March 2013, five ICUs and 31 days.
   - **Iqbal & Horvitz, Microsoft page:** MSR-TR-2009-67, February 2010, two weeks; no participant count.
   - **PagerDuty grouping:** 301 redirect to docs.pagerduty.com. Four methods, no figure.
   - **Grafana:** Default and Important rules, up to five loops.
   - **Apple Support** (`108781` and the guide page): no Scheduled Summary text shown.
   - **2003 blackout report:** energy.gov `BlackoutFinal-Web.pdf` downloaded, but its text could not be extracted reliably (and the PDF page reader needs poppler, which is not installed here). NERC `ch5.pdf` returned 404; web.archive.org is blocked; the FERC presentation gave no readable text.
4. **What is undone.**
   - The 2003 blackout primary text.
   - The Apple Support Scheduled Summary page.
   - The Buncefield primary report and Target.
   - The paid alarm standards (EEMUA 191, ISA-18.2).
   - Evidence on missed items under batching and on catch-up summaries (R2, R4).
5. **What is needed outside my lane.**
   - **Source checker:** check the three entries in §10. If it has a PDF text tool, confirm the 2003 case in energy.gov `BlackoutFinal-Web.pdf`.
   - **Orchestrator:** record this revision over research/Q-024-memo.md.
   - **Chief of Staff:** a decision card if R3 (the paid standards) is wanted.
6. **Open questions.**
   - R1 to R4 above.
   - Should the Kemeny text, held only on a mirror, be checked against an official host before its 120-month shelf life stands? (Raised by the Source checker; still open.)

Sources:
- [Drew et al. 2014, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC4206416)
- [Iqbal & Horvitz, Microsoft Research](https://www.microsoft.com/en-us/research/?p=157638)
- [PagerDuty Alert Grouping](https://docs.pagerduty.com/ai-automation/aiops/noise-reduction/alert-grouping)
- [Grafana OnCall escalation chains](https://grafana.com/docs/grafana-cloud/alerting-and-irm/oncall/configure/escalation-chains-and-routes)
- [Apple Support 108781](https://support.apple.com/108781)
- [US–Canada Task Force final report (energy.gov)](https://www.energy.gov/sites/prod/files/oeprod/DocumentsandMedia/BlackoutFinal-Web.pdf)