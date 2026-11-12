# Research memo: Q-024, what interrupts a single supervisor and what waits

**Date:** 2026-11-12 · **Role:** researcher · **Depth asked:** 3 · **Topics:** notifications, briefing, dashboards, mobile, monitoring
**To:** the Source checker, through the Orchestrator, who records this memo in research/ (suggested name: research/Q-024-memo.md)

**How to read the marks.** Every statement is tagged **[fact]**, **[estimate]** or **[opinion]**, with a proposed grade:
- **A:** two or more independent authoritative sources, or one publisher's own documentation backed by a second page of theirs (product behaviour).
- **B:** one authoritative or peer-reviewed source.
- **C:** a secondary source only, or a search-result summary I could not confirm in the source itself.

None of these grades has been checked yet. The usual caveat about distance applies throughout. Most evidence comes from process control, hospital alarms, operations on-call work and software teams. None of it studies one person overseeing many AI-agent projects from a phone. Applying it to that setting is always **[opinion]**.

---

## 0. Short answer

1. **Deciding what interrupts.** Every field I looked at sorts signals into a few levels, judged by whether a person must act now:
   - interrupt now (a "page");
   - queue for business hours (a "ticket" or email);
   - record only (log or dashboard).

   Products put this into settings: urgency levels, support hours, Focus and Time Sensitive on iPhone. **[fact, A/B; §1]**

2. **Ceilings.**
   - Google SRE (Google's site reliability engineering practice) targets at most 2 incidents per 12-hour on-call shift. **[fact, B]**
   - Process-industry guidance puts the most an operator can manage over the long run at about 12 alarms an hour. More than about 10 alarms in 10 minutes is a "flood". **[fact, B]**
   - No source gives a daily cap for one person supervising work they are not continuously watching. **[fact: not found]**
   - Volume alone was not what predicted missed items in the largest survey. Overload and poor tools were (Singh 2013). **[fact, B]**

3. **One alert per item, grouped, or at set times.**
   - Operations tools group by default: wait about 30 s to collect related alerts, send one message per group, then hold changes for about 5 min. **[fact, B]**
   - The iPhone can hold ordinary notifications for a scheduled summary and let Time Sensitive ones through. **[fact, A]**
   - One randomised field study found that batching three times a day improved well-being. It did not measure missed items. **[fact, B; library F-batch-notify-01]**
   - The only controlled test of rate limiting under load that I found (n=16 operators) found that holding alarms to about one a minute, most important first, improved performance. **[fact, B]**

4. **An item still waiting after its first alert.**
   - Tools repeat on a timer (Alertmanager, the Prometheus alert router: every 4 h by default, and only if nothing changed), or escalate after a timeout (PagerDuty: 30 min by default, repeat up to 9 times while nobody acknowledges).
   - Low-urgency items never escalate.
   - Process control calls an alarm still active after about 24 h "stale", and treats it as a quality problem to fix, not something to keep re-sounding. **[fact, B]**
   - Repeats reduce how often people act on alerts (library F-alert-repeat-01).

5. **What the supervisor sees after hours or days away.** The documented practices are:
   - a written handoff summary (Google SRE);
   - an inbox of items addressed to them, with "done" and "saved" states (GitHub);
   - handoff methods observed in high-risk control rooms (Patterson 2004). **[fact, B]**

   I found no study that measured catch-up screens directly. **[fact: not found]**

6. **Action items shown with the surrounding work or apart; folding by focus.**
   - The best-supported finding is that a separate overview next to a detail view is generally preferred, and is best for understanding. Its costs are screen space and the effort of linking the two views.
   - Distorting "fisheye" focus views have mostly failed to improve performance.
   - Simply highlighting the items that matter does help. **[fact, B; Cockburn et al. 2008 review]**
   - In alarm floods, operators who narrowed the list to one area at a time did better than those who read one list of everything. Many trained operators still went back to the single list, and felt they were doing better because they saw fewer alarms. **[fact, B]**

7. **Recorded failures.** The recorded failures fall into four groups:
   - **Floods:** Three Mile Island, Milford Haven, intensive-care units.
   - **Misleading displays:** a light that showed the command sent rather than the valve's position (Three Mile Island); a level reading that showed falling while the tower overfilled (Texas City); a gauge that stuck (Buncefield).
   - **Silent failure or staleness:** in the 2003 blackout, the alarm processor stopped without notice.
   - **Ignored signals:** Knight Capital's 97 emails that were "not designed to be system alerts"; repeated tool alerts at Target.

   **Combining displays has failed both ways:**
   - Texas City kept inflow and outflow on separate screens. The fix was to show the material balance together.
   - Buncefield put many tanks on one screen. The tank that overfilled sat in a window stacked behind others.
   - Knight Capital's account mixed positions from several sources, so staff "could not quickly determine the nature or source".

   **Fixes that were measured:**
   - Retuning defaults and latching alarms until acknowledged cut audible alarms by 89% with no missed events (Whalen 2014).
   - Rate limiting under floods improved operator performance (ASM 2011).

---

## 1. How interrupt-or-wait is decided

- **[fact, B]** The Google SRE Workbook (On-Call chapter) uses levels. Lower-severity events are not paged: P2 events "send an email to team and notifies event stream channel", and P3 events are "informational only". https://sre.google/workbook/on-call/
- **[fact, B]** Library P-notice-actionable-01 (graded B) already records Google SRE: "Every page should be actionable", pages should concern "a novel problem", and rote responses are "a red flag".
- **[fact, B]** In PagerDuty, high urgency "uses high-urgency notification rules and escalates if not acknowledged". Low urgency "uses low-urgency notification rules and cannot escalate". Separate rules can be set "during support hours" and "outside support hours". https://docs.pagerduty.com/incident-management/incidents/dynamic-notifications
- **[fact, B]** Grafana OnCall gives each user two rule sets, Default and Important. An escalation step chooses which one applies (search-result summary of Grafana docs; page not opened). https://grafana.com/docs/grafana-cloud/alerting-and-irm/oncall/configure/escalation-chains-and-routes
- **[fact, A]** Apple defines four notification levels. Passive and Active do not override scheduled delivery or break through Focus. Time Sensitive does both. Critical also overrides the Ring/Silent switch. Apple's guidance:
  - use Time Sensitive "only for notifications that are relevant in the moment", about an event "happening now or will happen within an hour";
  - "Build trust by accurately representing the urgency of each notification."

  Sources (same publisher, two pages): https://developer.apple.com/design/human-interface-guidelines/managing-notifications (read as the JSON data file) and https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel
- **[fact, B]** WebKit: notifications from Home Screen web apps "integrate with Focus" and "work exactly like notifications from other apps". The page says nothing about levels or Time Sensitive for web apps. https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- **[fact: unknown]** Whether a Web Push message to an iPhone Home Screen web app can be Time Sensitive, or is included in Scheduled Summary. Not stated by Apple or WebKit on the pages read. A search summary claimed web push cannot use Time Sensitive, but gave no primary source, so it is not filed. (This matters to the decision; see research question R1.)
- **[fact, B]** GitHub Mobile has a Working Hours setting that schedules when pushes are sent (library F-gh-11).

## 2. Ceilings per hour or per day

- **[fact, B]** Google SRE book: "the maximum number of incidents per day is 2 per 12-hour on-call shift", and no more than 25% of time on call. The Workbook says: "We target a maximum of two incidents per on-call shift... If the pager load gets too high, corrective action is warranted." Both are Google (one publisher). https://sre.google/sre-book/being-on-call/ ; https://sre.google/workbook/on-call/
- **[fact, B]** Workbook case: a team receiving 5 incidents per shift against a target of 2 cut its load by automating changes and tracking a bug for every outage. The fix was to remove the causes, not to filter alerts.
- **[fact, B]** Process industries: "an average long-term rate of new alarms occurring at a frequency of up to 12 alarms per hour is the maximum manageable for an operator". The EEMUA 191 flood definition is "a 10-minute period with more than 10 new alarms", lasting until a 10-minute interval with fewer than 5. A "stale alarm" stays active "most often specified as 24 hours". Source: VanCamp (Emerson), Chemical Engineering, 2016-03-01, https://www.chemengonline.com/alarm-management-numbers/. Independent support: Bullemer et al. 2011 cite EEMUA (1999) as "not more than 10 alarms in the first ten minutes following an upset", and ASM modelling as about 10 alarms per 10 minutes. (Abnormal Situation Management, ASM, is an industry research consortium sponsored by Honeywell.)
- **[fact, C]** The finer EEMUA bands (under 1 per 10 min "very likely acceptable", up to 2 "manageable", over 5 "likely over-demanding", over 10 "very likely unacceptable") come from a search-result summary only. The standard itself (EEMUA 191; ANSI/ISA-18.2) is paid and I did not read it.
- **[fact, B]** The ASM study's throttling design rests on human-performance work suggesting a ceiling of about 49 seconds per alarm, "approximately one minute per alarm" (Reising, Downs & Bayn 2004, as cited by Bullemer et al. 2011).
- **[fact, B]** Survey of 2,590 VA primary-care practitioners (response rate 51.8%; median 63 alerts a day): 86.9% found the quantity excessive and 29.8% had personally missed results that delayed care. Feeling overloaded predicted missed results (OR 2.20), and so did concern about electronic handoffs. But "the *number* of alerts that respondents reported they received per day was *unrelated* to either outcome". Singh et al., JAMA Intern Med 2013;173(8):702-4, https://pmc.ncbi.nlm.nih.gov/articles/PMC3822526
- **[fact, B]** In commercial EHRs (electronic health records), primary-care physicians received a mean of 76.9 notifications a day (92 physicians, 276,207 notifications, January to June 2015). That is an estimated 66.8 min a day at 52 s each. Murphy et al., JAMA Intern Med 2016, https://pmc.ncbi.nlm.nih.gov/articles/PMC4860883
- **[opinion]** These ceilings come from people whose job is continuous watching (control rooms, on-call shifts). For an owner who checks in now and then, the SRE figure fits interrupts better than the alarm-rate figure. "About 2 interrupting events per 12 hours" is the closest documented guide to a daily cap. It is not a finding for this setting.

## 3. One alert per item, grouped, or at set times

- **[fact, B]** Alertmanager:
  - `group_by` batches alerts with matching labels "into a single group";
  - `group_wait` (default 30s) waits "before sending the first notification for a new group", so related alerts and inhibiting alerts can arrive;
  - `group_interval` (default 5m) spaces later notifications for the group;
  - inhibition rules mute target alerts while a source alert is firing;
  - `mute_time_intervals` and `active_time_intervals` restrict when routes notify.

  https://prometheus.io/docs/alerting/latest/configuration/
- **[fact, C]** PagerDuty groups alerts by time window, by content (exact field match) or by machine learning. Its "up to 98% of noise" figure is vendor marketing and is not filed. https://support.pagerduty.com/docs/alert-grouping
- **[fact, A]** iPhone Scheduled Summary holds notifications from apps the user picks and delivers them at times the user sets. Time Sensitive notifications override it. Sources: Apple's managing-notifications guidelines (table: Time Sensitive "Overrides scheduled delivery: Yes"); Apple Support guide (search-result summary).
- **[fact, A]** Web Push Topic: a message with a topic replaces any undelivered message with the same topic (library F-webpush-02b).
- **[fact, B]** Library F-batch-notify-01 (Fitz et al. 2019, n=237): batching three times a day improved self-reported attention, productivity and mood. Missed items were not measured.
- **[fact, B]** Iqbal & Horvitz (CSCW 2010; 20 users, two weeks, notifications off in week two): people used email alerts as "a passive awareness mechanism". With alerts off, some checked email more on their own, while others focused better. https://www.microsoft.com/en-us/research/?p=157638
- **[fact, B]** ASM alarm-flood study (Bullemer, Reising, Tolsma, Laberge; ISA Automation Week 2011). Design: 16 working console operators, 12 ten-minute flood scenarios averaging 146 alarms each. Throttling to "1 alarm per minute", choosing by priority and time left to respond, with de-chattering (30/60/120 s by priority), "had a significant impact on operator performance regardless of the display type used" and lowered workload. This was "even though operators were unaware of when the technique was influencing alarm presentation rates". https://process.honeywell.com/content/dam/process/en/documents/document-lists/doc_asm-consortium/white-papers/October%2031%202011%20-%20Towards%20Improving%20Operator%20Alarm%20Flood%20Responses%20Alternative%20Alarm%20Presentation%20Techniques.pdf
- **[fact, B]** Software bots on pull requests: 21 practitioners interviewed. "Noise" (verbosity, too many actions, unrequested tasks) was "a recurrent and central problem". Wessel et al., CSCW 2021, https://arxiv.org/abs/2103.13950. A follow-up merged bot comments into one ("FunnelBot") and measured only the preferences of 25 newcomers (Ribeiro et al., ICSME NIER 2022, https://arxiv.org/abs/2208.01624).

## 4. An item still waiting after its first alert

- **[fact, B]** Alertmanager `repeat_interval` (default 4h): "Notifications are not repeated if any new alerts have fired or any firing alerts have resolved since the last group_interval." (Same source as §3.)
- **[fact, C]** PagerDuty (search-result summary of its escalation docs): the default escalation timeout is 30 minutes. A policy can repeat "up to nine times", and repeats apply only while unacknowledged. https://support.pagerduty.com/docs/escalation-policies
- **[fact, B]** PagerDuty: low-urgency items "cannot escalate" (§1).
- **[fact, C]** Grafana OnCall: a repeat step loops earlier steps up to five times (search summary).
- **[fact, B]** Process control: an alarm left active for about 24 h is "stale". "Suppressing the alarm will remove a stale alarm from the alarm list... but will not address the underlying condition." (VanCamp 2016.)
- **[fact, C]** Alarm "shelving" (ISA-18.2) is operator-started, temporary and usually time-limited, and the alarm returns automatically (vendor documentation via search summary only).
- **[fact, B]** Repeats lower acceptance: about 10% lower for each 5-point rise in the share of repeated reminders (library F-alert-repeat-01).
- **[fact, B]** A measured fix: on telemetry units, alarms for heart rate limits were changed from self-resetting to "crisis" alarms that must be acknowledged each time, with defaults retuned (heart rate low 45 / high 130). The result was "an overall 89% reduction in total mean weekly audible alarms", with "no adverse events related to missed cardiac monitoring events" and code blues down 50%. Whalen et al., J Cardiovasc Nurs 2014, DOI 10.1097/jcn.0000000000000114 (abstract read through Europe PMC).

## 5. What the supervisor sees of what piled up

- **[fact, B]** Google SRE: at the start of a shift, "read the handoff from the previous shift"; at the end, "send a handoff email to the next engineer on-call". (Workbook.)
- **[fact, B]** Patterson et al. 2004 looked for 21 handoff strategies in NASA mission control, Canadian nuclear plants, a US railroad dispatch centre and Toronto ambulance dispatch. "Nineteen of 21 strategies were used in at least one domain." Int J Qual Health Care 16(2):125-132, DOI 10.1093/intqhc/mzh026 (abstract only; I could not read the list of strategies).
- **[fact, B]** GitHub's notification inbox has default filters for assigned, participating, review requested and @mentioned. "Done" removes an item and keeps it for 3 months (current docs; older Enterprise docs say 5 months). Saved items are kept indefinitely. Up to 15 custom filters. https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox
- **[fact, B]** Library P-stale-visible-01: show when data was last updated; do not hide stale data.
- **[fact, C]** Interruption research (the Altmann & Trafton "memory for goals" model): having a cue available when work resumes shortens the time to resume (search-result summaries; primary papers not read).
- **[fact: not found]** No study measured how well a summary of "what happened while you were away" works for missed items.

## 6. Display: action items together or apart; folding by focus

- **[fact, B]** Cockburn, Karlson & Bederson, "A Review of Overview+Detail, Zooming, and Focus+Context Interfaces", ACM Computing Surveys 41(1), 2008 (full text read):
  - **Separate overview beside the detail view:** "Several studies have found that overview+detail interfaces are preferred... For particular tasks, such as document comprehension, no alternative has been found to be more effective." The costs are "additional use of screen real estate" and "the mental effort and time required to integrate the distinct views". It "may make it sub-optimal for dynamic activities".
  - **Zooming:** "zooming is easy to do badly".
  - **Fisheye (focus+context):** "evaluations of distortion-based techniques have largely failed to provide evidence of performance enhancements". Benefits "are strongly task dependent".
  - **Highlighting:** performance benefits are shown for cue techniques that "visually emphasize items... or group them". On mobile, two-level zoom best supported a monitoring task (Gutwin & Fedak 2004, as reviewed).

  https://www.microsoft.com/en-us/research/wp-content/uploads/2008/01/cockburn-ComputingSurveys09.pdf
- **[fact, B]** ASM 2011 (as in §3):
  - "operator performance under alarm flood conditions can be improved if the operator interface enables the operator to strategically view subsets of the alarms associated with specific equipment areas rather than a list containing all of the alarms";
  - the new overview displays showed no consistent advantage;
  - "many operators reverted back to the strategy they brought to the study... each of the three display conditions was effectively reduced to a single alarm list";
  - "a mistaken perception that they were performing better because they were aware of fewer alarms";
  - codes in the overview panels (such as TT1814) "forced operators to look in Detailed List"; short descriptions were suggested instead.

  The paper also says that in a scrolling chronological list, "Higher priority alarms will also be scrolled off a given page as it fills up".
- **[fact, B]** NRC (US Nuclear Regulatory Commission) and Halden reactor project, NUREG/CR-6691 (O'Hara et al. 2000). Six two-person crews, 16 trials, comparing dedicated tiles, mixed tiles plus message list, and alarms built into process displays. Crews "were able to detect the disturbances and handle them effectively". Differences were "modest", and alarm effects came as "interactions with scenario complexity". "Operators' ratings and evaluations were more sensitive to differences in alarm design" than measured performance was. https://www.nrc.gov/reading-rm/doc-collections/nuregs/contract/cr6691/index
- **[fact, B]** Treude & Storey, ICSE 2010 (one team of 150 developers plus four other teams): "dashboards become pivotal to task prioritization in critical project phases... while feeds are used for short term planning"; "the distinction between high-level and low-level awareness is often unclear". https://ink.library.smu.edu.sg/sis_research/8802
- **[fact, B]** A randomised trial with 3,356 clinicians and 4.49 million order sessions compared one open record with up to four. Wrong-patient order sessions were 90.7 vs 88.0 per 100,000 (OR 1.03, 95% CI 0.90-1.20). 66.2% of unrestricted sessions had only one record open anyway, which limited the trial's power. Adelman et al., JAMA 2019, https://pmc.ncbi.nlm.nih.gov/articles/PMC6518341
- **[fact, B]** Library P-glance-disclosure-01: put what is often needed on the first screen and the rest one step away; at most two levels (one source).

## 7. Recorded overload, misleading-display and ignored-display failures

| Case | What failed | How recorded or measured | Fix recorded | Mark |
|---|---|---|---|---|
| Three Mile Island 1979 | "Over 100 alarms went off in the early stages... with no way of suppressing the unimportant ones"; the alarm printer "was running more than 1 1/2 hours behind"; the relief-valve light "showed only that the signal had been sent to close the PORV rather than the fact that the PORV remained open"; key indicators "on the back of the control panel" | Presidential (Kemeny) Commission findings, read on a mirror site: https://pddoc.com/tmi2/kemeny/assessment_of_sinificant_events.htm | (Commission recommendations not read) | fact, B (mirror, not the official host) |
| Texaco Milford Haven 1994 | "Excessive number of alarms in emergency situation reduced effectiveness of operator response"; "Control panel graphics did not provide necessary process overviews"; "A control valve being shut when the control system indicated it was open" | HSE (UK Health and Safety Executive) case summary https://www.hse.gov.uk/comah/sragtech/casetexaco94.htm ; also cited as alarm flooding by ASM 2011 | Led to HSE's "Better alarm handling" guidance | fact, B |
| BP Texas City 2005 | Level indicator showed the tower level falling while it overfilled; flows in and out shown on different screens | CSB (US Chemical Safety Board) investigation; summary from search, recommendation text from the CSB page https://www.csb.gov/bp-america-texas-city-refinery-explosion/ | Recommendation 2005-4-I-TX-14: "Configure control board displays to clearly indicate material balance"; "multiple level indicators"; status "Closed - Acceptable Action" | fact, B (recommendation); C (screen detail) |
| Buncefield 2005 | Tank gauge "flatlined" and had stuck about 14 times before; independent high-level switch inoperable; "only one screen to display the ATG [automatic tank gauge] data for a number of storage tanks"; tank 912's "display window was stacked behind several other windows" | HSE 2011 "Buncefield: Why did it happen?", read only through a secondary page: https://humanfactors101.com/incidents/buncefield-11-december-2005/ | (not read) | fact, C (primary not read; the HSE PDF URL returned 404) |
| North American blackout 2003 | The utility's alarm function stopped delivering alarms without notice; "Without a functioning alarm system, the [FirstEnergy] control area operators failed to detect the tripping of electrical facilities" | US–Canada Task Force final report, quoted by The Register 2004-04-08: https://www.theregister.com/2004/04/08/blackout_bug_report/ | Vendor fix to the software (as quoted) | fact, C (primary report not read; NERC PDF link 404) |
| Knight Capital 2012 | From 8:01 a.m. an internal system sent "97 of these e-mail messages... before the 9:30 a.m. market open. Knight did not design these types of messages to be system alerts, and Knight personnel generally did not review them". The main risk monitor (PMON) "relied entirely on human monitoring and did not generate automated alerts", "did not display the limits", and was delayed, "resulting in reports that were inaccurate". One account held positions "from multiple sources", so staff "could not quickly determine the nature or source". Loss over $460 million in about 45 min | SEC order, Release 34-70694, 2013-10-16 (full text read): https://www.sec.gov/litigation/admin/2013/34-70694.pdf | The order says "Having a procedure that integrated the BNET Reject messages into Knight's monitoring... could have prevented the events"; independent consultant review | fact, B |
| Target 2013 | Malware alerts from a detection tool, repeated at its most urgent grade, not acted on | Press reports of Bloomberg Businessweek; Senate committee staff report (not read) | (not read) | fact, C |
| Hospital alarms (Joint Commission alert no. 50, 2013-04-08) | 98 alarm-related events, January 2009 to June 2012; 80 deaths; "between 85 and 99 percent of alarm signals do not require clinical intervention"; contributing factors included "Alarm signals inappropriately turned off (36)" and "Alarm conditions and settings that are not integrated with other medical devices"; "Alarm fatigue – the most common contributing factor" | Voluntary event reports ("not an epidemiologic data set"); PDF read: https://digitalassets.jointcommission.org/api/public/content/f65e5c9df2b94000a99445e0a7877007 | Inventory defaults, set guidelines and tailor settings per patient, cross-disciplinary review | fact, B |
| UCSF intensive care, March 2013 | 2,558,760 alarms in 31 days, 77 beds, 461 patients; "88.8% of the 12,671 annotated arrhythmia alarms were false positives" | Every alarm logged and a sample annotated: Drew et al., PLoS ONE 2014, https://pmc.ncbi.nlm.nih.gov/articles/PMC4206416 | Tailor settings per patient; limit atrial-fibrillation alarms "to new onset and termination" | fact, B |
| Continuous integration: flaky tests | Developers' main concern is "the loss of trust in the test outcomes" | Survey of 335 developers and testers: Gruber & Fraser, ICST 2022, https://arxiv.org/abs/2203.00483 | n/a | fact, B |

- **[opinion]** Taken together, the failures where displays were combined point both ways. Separating related data hid a contradiction (Texas City). Squeezing many sources onto one screen or into one account hid which one was failing (Buncefield, Knight). Signals that reached people over a channel nobody treated as an alert were ignored (Knight). And several cases share a display that did not show its own health: the alarm processor that died silently, the stuck gauge, PMON's delayed reports. These are patterns I infer across cases, not findings of any single source.

---

## 8. Gaps and limits

- No study covers one person overseeing many semi-autonomous software projects. All transfer is opinion.
- Batching studies measured well-being, not missed or late actions. Only the ASM study (n=16, small, exploratory, p<.10) measured performance.
- I did not read the primary alarm standards (EEMUA 191, ANSI/ISA-18.2). They are paid. **Escalation:** reading them needs a paid source. The Chief of Staff would put that to the owner as a decision card if the exact bands matter.
- Unknown whether iOS lets Home Screen web app Web Push be Time Sensitive, or include it in Scheduled Summary (R1 below).
- **Verification note:** the summarising fetch tool misreported the Joint Commission PDF. It gave "2016, over 350 cases, 72–99%". The PDF itself says 2013, 98 events / 80 deaths, 85–99%. The figures above come from the PDF. The Source checker should prefer the PDFs over summaries wherever both exist.

## 9. Research questions I add (research/_QUESTION.md form, neutral)

1. **R1.** On iOS and iPadOS, can a Web Push notification to a Home Screen web app carry an interruption level (especially Time Sensitive)? Are web app notifications eligible for Scheduled Summary and for Focus allow-lists? *Decision served:* whether a phone-side tier between "interrupt" and "wait for summary" is available. *Depth:* 2.
2. **R2.** Which studies measure missed or late required actions (not well-being) under immediate, batched and scheduled notification of items that need action? *Decision served:* the interruption rule. *Depth:* 3.
3. **R3.** What do the primary texts of EEMUA 191 and ANSI/ISA-18.2 (or IEC 62682) state as alarm-rate bands, flood, stale-alarm and shelving rules? *Decision served:* a daily or hourly ceiling. *Depth:* 3. Needs a paid source: owner approval.
4. **R4.** What studies evaluate "since you were away" or handoff summaries for missed items after long absences, in any field? *Decision served:* the first screen after an absence. *Depth:* 3.

---

## 10. Proposed library entries

Each entry below is a proposal only; the Source checker fills in checked_on.

```yaml
---
id: F-oncall-ceiling-01
form: fact
claim: "Google SRE book: 'the maximum number of incidents per day is 2 per 12-hour on-call shift' and no more than 25% of time on call; SRE Workbook: 'We target a maximum of two incidents per on-call shift... If the pager load gets too high, corrective action is warranted.' Workbook: P2 events email the team rather than page; P3 'informational only'."
grade: B
topics: [notifications, monitoring]
shelf_life: 36 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://sre.google/sre-book/being-on-call/
  - https://sre.google/workbook/on-call/
note: One publisher (Google); documented practice, not a study. Continuous on-call setting.
---
```

```yaml
---
id: F-alarm-rate-01
form: fact
claim: "Process industries: 'an average long-term rate of new alarms occurring at a frequency of up to 12 alarms per hour is the maximum manageable for an operator'; EEMUA 191 flood = 'a 10-minute period with more than 10 new alarms' until an interval with fewer than five; a stale alarm stays annunciated 'most often specified as 24 hours'. ASM 2011 cites EEMUA (1999) 'not more than 10 alarms in the first ten minutes following an upset' and about one minute per alarm to respond (Reising et al. 2004)."
grade: B
topics: [monitoring, notifications]
shelf_life: 60 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://www.chemengonline.com/alarm-management-numbers/  # VanCamp (Emerson) 2016
  - https://process.honeywell.com/content/dam/process/en/documents/document-lists/doc_asm-consortium/white-papers/October%2031%202011%20-%20Towards%20Improving%20Operator%20Alarm%20Flood%20Responses%20Alternative%20Alarm%20Presentation%20Techniques.pdf
note: Primary standards (EEMUA 191, ISA-18.2) are paid and were not read; finer per-10-minute bands not filed.
---
```

```yaml
---
id: F-alertmanager-grouping-01
form: fact
claim: "Prometheus Alertmanager: group_by batches matching alerts into one group; group_wait (default 30s) waits before the first notification of a new group; group_interval (default 5m) spaces later notifications; repeat_interval (default 4h), and 'Notifications are not repeated if any new alerts have fired or any firing alerts have resolved since the last group_interval'; inhibition rules mute targets while a source alert fires; mute/active time intervals."
grade: B
topics: [notifications, monitoring]
shelf_life: 12 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://prometheus.io/docs/alerting/latest/configuration/
note: Product behaviour, single page.
---
```

```yaml
---
id: F-pagerduty-urgency-01
form: fact
claim: "PagerDuty: high urgency 'escalates if not acknowledged'; low urgency 'cannot escalate'; notification rules can differ during and outside support hours. Escalation timeout default 30 minutes; a policy may repeat up to nine times, only while unacknowledged."
grade: B
topics: [notifications, monitoring]
shelf_life: 12 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://docs.pagerduty.com/incident-management/incidents/dynamic-notifications
  - https://support.pagerduty.com/docs/escalation-policies
note: Urgency rows read on the page; the timeout and repeat rows come from a search summary of the second page (grade C on their own).
---
```

```yaml
---
id: F-ios-interruption-levels-01
form: fact
claim: "Apple: four interruption levels. Passive and Active neither override scheduled delivery nor break through Focus; Time Sensitive does both; Critical also overrides the Ring/Silent switch. Use Time Sensitive 'only for notifications that are relevant in the moment' (now or within an hour); 'Build trust by accurately representing the urgency of each notification.' WebKit: Home Screen web app notifications 'integrate with Focus'; whether web push can be Time Sensitive is not stated."
grade: A
topics: [notifications, mobile]
shelf_life: 12 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
publisher_note: Apple HIG plus Apple API docs (same publisher, behaviour claim); WebKit row is single source.
sources:
  - https://developer.apple.com/design/human-interface-guidelines/managing-notifications
  - https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel
  - https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
---
```

```yaml
---
id: F-alarm-flood-presentation-01
form: fact
claim: "ASM Consortium study (Bullemer et al., ISA 2011; 16 console operators; 12 ten-minute floods averaging 146 alarms): throttling presentation to about 1 alarm per minute by priority and time-to-respond, with de-chattering, improved orienting and evaluating scores and lowered workload regardless of display; new overview displays showed no consistent advantage; performance improved when operators viewed 'subsets of the alarms associated with specific equipment areas rather than a list containing all of the alarms'; many reverted to the single list and some had 'a mistaken perception that they were performing better because they were aware of fewer alarms'."
grade: B
topics: [monitoring, dashboards, notifications]
shelf_life: 60 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://process.honeywell.com/content/dam/process/en/documents/document-lists/doc_asm-consortium/white-papers/October%2031%202011%20-%20Towards%20Improving%20Operator%20Alarm%20Flood%20Responses%20Alternative%20Alarm%20Presentation%20Techniques.pdf
note: Small exploratory sample; significance set at p<.10. Sponsored by an industry consortium (Honeywell trademark).
---
```

```yaml
---
id: F-overview-detail-review-01
form: fact
claim: "Cockburn, Karlson & Bederson review (ACM Computing Surveys 41(1), 2008): overview+detail is often preferred and for document comprehension 'no alternative has been found to be more effective', at the cost of screen space and 'the mental effort and time required to integrate the distinct views'; 'zooming is easy to do badly'; distortion-based focus+context 'largely failed to provide evidence of performance enhancements' and benefits are 'strongly task dependent'; cue techniques that emphasise or group matching items show performance benefits."
grade: B
topics: [dashboards, design]
shelf_life: 60 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://www.microsoft.com/en-us/research/wp-content/uploads/2008/01/cockburn-ComputingSurveys09.pdf
note: Review of mostly lab studies up to 2007; few were on phones.
---
```

```yaml
---
id: F-alert-volume-vs-miss-01
form: fact
claim: "Survey of 2,590 VA primary-care practitioners (51.8% response; median 63 alerts/day): 86.9% found alert quantity excessive; 29.8% had personally missed results that delayed care; information overload (OR 2.20) and electronic-handoff concerns predicted missed results, but the reported number of alerts per day 'was unrelated to either outcome' (Singh et al. 2013). In commercial EHRs, primary-care physicians averaged 76.9 notifications/day, est. 66.8 min/day (Murphy et al. 2016)."
grade: B
topics: [notifications, briefing]
shelf_life: 60 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC3822526
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4860883
note: Clinical setting, self-report survey; distant.
---
```

```yaml
---
id: F-alarm-latch-retune-01
form: fact
claim: "Telemetry units (Whalen et al. 2014): changing heart-rate alarms from self-resetting to crisis alarms that must be acknowledged, and retuning defaults (HR low 45 / high 130), gave 'an overall 89% reduction in total mean weekly audible alarms' with 'no adverse events related to missed cardiac monitoring events'; code blues down 50%. Joint Commission alert no. 50 (2013): 98 alarm-related events January 2009 to June 2012, 80 deaths; 85-99% of alarm signals need no intervention; alarm fatigue the most common contributing factor; 'Alarm conditions and settings that are not integrated with other medical devices' listed among factors."
grade: B
topics: [notifications, monitoring]
shelf_life: 60 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=TITLE:%22Novel%20approach%20to%20cardiac%20alarm%20management%20on%20telemetry%20units%22&resultType=core&format=json
  - https://digitalassets.jointcommission.org/api/public/content/f65e5c9df2b94000a99445e0a7877007
note: Single-site before/after pilot; Joint Commission data are voluntary reports, not epidemiological.
---
```

```yaml
---
id: F-ignored-channel-knight-01
form: fact
claim: "SEC order on Knight Capital (2013-10-16): an internal system sent 97 emails identifying 'Power Peg disabled' before the market opened; 'Knight did not design these types of messages to be system alerts, and Knight personnel generally did not review them'; its main monitor PMON 'did not generate automated alerts', 'did not display the limits', and was delayed so reports were inaccurate; one account held positions 'from multiple sources' so staff 'could not quickly determine the nature or source'. The order: integrating those messages into monitoring 'could have prevented the events'."
grade: B
topics: [monitoring, notifications]
shelf_life: 120 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://www.sec.gov/litigation/admin/2013/34-70694.pdf
note: Settled order; findings neither admitted nor denied by the respondent.
---
```

```yaml
---
id: F-misleading-display-cases-01
form: fact
claim: "Three Mile Island (Kemeny Commission): over 100 early alarms with no way to suppress unimportant ones; alarm printer more than 1.5 hours behind; relief-valve light showed only that a close signal was sent. Milford Haven 1994 (HSE): excessive alarms; graphics lacked process overviews; a valve shown open was shut. Texas City 2005 (CSB): recommendation to 'Configure control board displays to clearly indicate material balance' and add multiple level indicators."
grade: B
topics: [monitoring, dashboards]
shelf_life: 120 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://pddoc.com/tmi2/kemeny/assessment_of_sinificant_events.htm
  - https://www.hse.gov.uk/comah/sragtech/casetexaco94.htm
  - https://www.csb.gov/bp-america-texas-city-refinery-explosion/
note: Kemeny text read on a mirror. Buncefield (one screen, stacked windows) and the 2003 blackout (silent alarm failure) are held at grade C pending primary reads and are not in this entry.
---
```

```yaml
---
id: F-dashboard-feed-01
form: fact
claim: "Treude & Storey (ICSE 2010; one team of 150 developers plus four teams): 'dashboards become pivotal to task prioritization in critical project phases... while feeds are used for short term planning'. Adelman et al. (JAMA 2019 RCT, 3,356 clinicians): one open record vs up to four gave no difference in wrong-patient order sessions (90.7 vs 88.0 per 100,000; OR 1.03, 0.90-1.20), with 66.2% of unrestricted sessions using one record."
grade: B
topics: [dashboards]
shelf_life: 60 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources:
  - https://ink.library.smu.edu.sg/sis_research/8802
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC6518341
---
```

```yaml
---
id: P-repeat-on-change-01
form: pattern
claim: "Do not re-send an unchanged waiting item on a short timer; re-notify when its state changes, escalate once after a set timeout, and treat an item waiting very long as a problem to fix rather than to re-sound. Supports: Alertmanager suppresses repeats when nothing changed and defaults to 4h (F-alertmanager-grouping-01); PagerDuty escalates high urgency on timeout but never low urgency (F-pagerduty-urgency-01); stale-alarm practice (F-alarm-rate-01); repeats lower acceptance (F-alert-repeat-01); latching until acknowledged cut audible alarms 89% without missed events (F-alarm-latch-retune-01). The recommendation is an inference, untested for AI-agent oversight."
grade: B
topics: [notifications]
shelf_life: 36 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources: [see the cited entries]
---
```

```yaml
---
id: P-monitor-shows-own-health-01
form: pattern
claim: "A supervision display or alert channel should show its own freshness and failure, and signals that need action should travel on a channel designed and treated as an alert. Supports: PMON delays and unreviewed 'not alerts' emails at Knight (F-ignored-channel-knight-01); Apple and NN/g stale-data guidance (P-stale-visible-01); misleading indications (F-misleading-display-cases-01); 2003 silent alarm failure (grade C, not yet filed). Inference across cases."
grade: B
topics: [monitoring, dashboards]
shelf_life: 36 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources: [see the cited entries]
---
```

```yaml
---
id: P-focus-subset-01
form: pattern
claim: "In a combined view of many flows, let the supervisor narrow to one source or area while an overview stays visible, highlight action items rather than distort the layout, and label items in plain words, not codes. Supports: F-alarm-flood-presentation-01 (subsets beat one all-items list; codes forced look-ups; users reverted to the single list); F-overview-detail-review-01 (overview+detail preferred; cue highlighting helps; fisheye rarely helps). Caution: the new displays gave no consistent measured gain in the ASM study, and preference outran performance in several studies."
grade: B
topics: [dashboards, design]
shelf_life: 36 months
opened_by: researcher (Q-024, 2026-11-12)
memo: research/Q-024-memo.md
sources: [see the cited entries]
---
```

---

## Six-part contract

1. **What I changed.** Nothing on disk; I have no write tool. I produced the memo above, with 12 proposed facts, 3 proposed patterns and 4 new research questions.
2. **Why.** Q-024 asks for a depth-3 field scan to inform the phone interruption rule, whether to set a daily limit, and what goes on the first screen. I read the question and the 13 library entries that share its topics before searching.
3. **What I verified.** Web searches, then page fetches of the primary sources: SRE book and Workbook, Alertmanager docs, PagerDuty, Apple guidelines and API docs as JSON, WebKit, HSE, CSB, SEC, Europe PMC, PMC and NRC.
   - Four PDFs the summarising fetch could not parse I read in full from the saved download: the ASM 2011 paper, the Cockburn 2008 review, the SEC Knight order and Joint Commission alert no. 50.
   - That summarising fetch had misreported the Joint Commission alert. The memo uses the PDF's figures.
   - Two primary URLs returned 404: the HSE Buncefield report and the NERC blackout report. Those items are held at grade C.
   - Several items rest on search summaries only and are marked C.
4. **What is undone.**
   - Primary texts not read: EEMUA 191 and ISA-18.2 (paid), the 2003 blackout task-force report, the Buncefield report, the Patterson list of handoff strategies, and the papers behind the resumption-cue finding.
   - No evidence on how well catch-up summaries work, or on missed items under batching.
5. **What is needed outside my lane.**
   - The Source checker should check every entry. It should prefer the PDFs over summaries, and re-fetch the GitHub "Done" retention: 3 months in current docs, 5 months in older ones.
   - A decision card to the owner if the paid alarm standards are wanted (R3).
   - The Orchestrator to record the memo and open R1, R2 and R4 as research requests if useful.
6. **Open questions.**
   - Can iOS Home Screen web app push be Time Sensitive or part of Scheduled Summary (R1)?
   - What is the measured effect of batching on missed actions (R2)?
   - What exact alarm-rate bands do the standards give (R3)?
   - Do "since you were away" summaries work (R4)?