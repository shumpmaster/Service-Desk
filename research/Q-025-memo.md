# Q-025 research memo: showing as-of time, provenance and gaps, and noticing a stopped feed

*Researcher memo, 2026-11-12. Depth 3. Topics: dashboards, status-reports, briefing, trust, machine-summaries, monitoring.*

Each statement is marked **[fact]**, **[estimate]** or **[opinion]**, with a grade (A/B/C, used as the library uses them) and its sources. "Raw" means I read the primary text myself. "Summarised" means I saw it only through a summarising fetch. Nothing here has been checked yet; that is the Source checker's job.

## Summary

1. **A view's as-of time is often not the age of what it shows.** The NTSB found that cockpit radar "age" labels showed when the picture was assembled, not when the weather was observed. In two fatal accidents the label said about 1 minute while the data was 5–8 minutes old. Git commit dates come from fields the committer sets. GitHub check runs left unfinished are turned to `stale` by GitHub after 14 days.
2. **Mature tools give "no data", "late" and "not recorded" their own states rather than reusing the last value or showing green.** Examples: Grafana's NoData and Error states, Healthchecks' new/up/late/down, Prometheus dropping stale series from results, and CloudTrail naming the time ranges it cannot check and labelling backfilled records separately.
3. **A monitor cannot reliably report its own death.** The documented answer is an always-firing signal that a separate outside service expects, and that service raises the alarm when the signal stops (a "dead man's switch"). The 2003 blackout (an alarm system failed silently and operators kept trusting it) and Three Mile Island (a control-room light showed a command, not the valve's real position) are the classic cases.
4. **On trust in machine-written entries the evidence is indirect.** People lose confidence in an algorithm faster than in a human after seeing it make the same mistake. LLM agents often claim success that the environment state contradicts (preprint), and LLM judges are fooled by confident closing language. Self-generated provenance is called "trivial to forge" in the supply-chain security standard SLSA.
5. **A finding that bears directly on the desk.** Since 1 Oct 2026, GitHub deletes checks, workflow runs and statuses once they pass the Actions retention period. For public repositories that period is at most 90 days. Links from a history view to those records will stop working.

---

## 1. How views show as-of time, provenance, gaps and half-finished states

### As-of time
- **[fact, B]** NTSB Safety Alert SA-017 (June 2012, revised December 2015), read raw: the cockpit NEXRAD (weather radar) age indicator "displays the age of the mosaic image created by the service provider", not the age of the weather. "Weather conditions depicted on the mosaic image will ALWAYS be older than the age indicated on the display", by up to 15–20 minutes in extreme cases. In two fatal accidents the display said about 1 minute old while the data was about 5 minutes old (2010) and about 6, 7 and almost 8 minutes old (2011). NTSB found that existing guidance did not give the size of the gap. *(data.ntsb.gov/advocacy/safety-alerts/Documents/SA-017.pdf)*
- **[fact, B]** git: author and committer dates are taken from the `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` environment variables if set, and `--date` overrides the author date (summarised). *(git-scm.com/docs/git-commit)*
- **[fact, B]** GitHub: an incomplete check run older than 14 days has its conclusion set to `stale`, and "Only GitHub can mark check runs as stale" (summarised). *(developer.github.com/changes/2020-02-03-stale-conclusion)*
- **Already in the library:** P-stale-visible-01 (Apple Widgets: show when the content was last updated; NN/g: state plainly when there is no data) and F-gh-12/12b (scheduled runs can be delayed or dropped).

### Provenance
- **[fact, B]** W3C PROV: "Provenance is information about entities, activities, and people involved in producing a piece of data or thing, which can be used to form assessments about its quality, reliability or trustworthiness" (summarised). *(w3.org/TR/prov-overview/)*
- **[fact, B]** SLSA v1.0, the supply-chain security standard (summarised):
  - Build L1: provenance "is trivial to bypass or forge".
  - Build L2: provenance comes from a hosted build platform, and forging it "requires an explicit 'attack'".
  - Build L3: signing secrets must not be accessible to "user-defined build steps".
  - *(slsa.dev/spec/v1.0/levels)*
- **[fact, B]** GitHub commit verification (summarised): statuses are Verified, Unverified and, in vigilant mode, Partially verified, for an author who is not the committer. Commits made in the web interface are signed by GitHub. *(docs.github.com, about-commit-signature-verification)*

### Gaps, and records rebuilt after the fact
- **[fact, B]** AWS CloudTrail `validate-logs`, read raw from the docs page:
  - It detects modified or deleted log and digest files.
  - "If a digest file is missing or not valid, the time range that cannot be validated is indicated in the output."
  - Backfill digests form a separate chain, prefixed `(backfill)`.
  - It checks only files referenced by digests.
  - *(docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html)*
- **[fact, B]** Prometheus: when a series stops returning samples it is marked stale and "no value is returned" afterwards. The lookback period defaults to 5 minutes (summarised). *(prometheus.io/docs/prometheus/latest/querying/basics/)*
- **[fact, B]** Grafana alerting (summarised):
  - "No Data" means the query succeeded with no data points. "Error" means evaluation failed.
  - By default these raise DatasourceNoData and DatasourceError alerts.
  - They can be configured to Alerting, Normal or "Keep last state".
  - *(grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/)*
- **[fact, A]** GitHub retention change: from 1 Oct 2026, checks, workflow runs and statuses follow the Actions artifact and log retention setting, including those created by third-party apps. The public-repository maximum is 90 days, the default is 90 days, and "Changing the setting won't restore data that was previously removed". Several GitHub sources agree; two changelog entries were summarised. *(github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses; github.blog/changelog/2026-08-27-…; docs.github.com retention page)*

### Half-finished states
- **[fact, B]** GitHub check run `status` values are queued, in_progress, completed, waiting, requested and pending, and "Only GitHub Actions can set a status of waiting, pending, or requested". Conclusions include action_required, cancelled, skipped, stale and timed_out (summarised). *(docs.github.com/en/rest/checks/runs)*
- **[fact, B]** Healthchecks.io (summarised): Period is "the expected time between pings", and Grace Time is "the additional time to wait before sending an alert when a check is late". The state definitions (new/up/late/down) were seen only on self-hosted copies of the docs, so that part is C. *(healthchecks.io/docs/configuring_checks/)*

## 2. How readers notice a stale, stopped or wrong view, including when the feed itself has stopped

- **[fact, B]** kube-prometheus Watchdog rule, read from the raw manifest: `expr: vector(1)`, described as "an alert meant to ensure that the entire alerting pipeline is functional. This alert is always firing…". PromLabs training (summarised) says the outside service is set to "expect an incoming alert notification every x minutes (plus some slack time)" and to alert you otherwise. It names the failures this catches: a broken meta-monitoring setup, Alertmanager being down, or the network being cut off. *(raw.githubusercontent.com/prometheus-operator/kube-prometheus/main/manifests/kubePrometheus-prometheusRule.yaml; training.promlabs.com/…/end-to-end-watchdog-alerts/)*
- **[fact, C]** 2003 Northeast blackout. The final report, as quoted by The Register, says: "Unaware of the loss of alarms and a limited EMS, they made no alternate arrangements to monitor the system". The alarm function failed around 14:14. The US DoE press release (read raw) lists "Inadequate situational awareness" as one of four groups of causes. I could not read the report text itself (the PDF did not render and the NERC links returned 404), so this is C until the report is checked. *(theregister.com/2004/04/08/blackout_bug_report/; energy.gov … Blackout_Press_Release_April_5_2004.pdf; energy.gov … BlackoutFinal-Web.pdf, not read)*
- **[fact, B / C]** Three Mile Island. The NRC backgrounder says: "Instruments in the control room, however, indicated to the plant staff that the valve was closed" (summarised; B). That the light showed the close *signal* rather than the valve's actual position comes from secondary sources and Kemeny Commission excerpts in search results, which I did not read directly (C). *(nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html; pddoc.com/tmi2/kemeny/…)*
- **Already in the library:** F-gh-12b says scheduled workflows in public repositories are disabled after 60 days without activity, and scheduled runs can be delayed or dropped. F-webpush-03 says push subscriptions can expire. Both are ways a feed can stop with nothing visible on the receiving end.
- **[opinion]** Across these cases, the failure that goes unnoticed is a view that keeps showing its last good state with no sign that updates have stopped. In every documented remedy, the signal that something has stopped comes from a separate path that expects a regular check-in, not from the stopped component reporting on itself. As a consequence, a sender that opens an issue "if it can no longer send" covers failures it can see while it is still running. It does not cover a run that never starts, such as a disabled schedule or dropped queued jobs. That is my inference, not a tested finding.
- **[fact, B, not found]** I found no controlled study of how readers of software dashboards notice staleness. The pages that make such claims (Smashing Magazine and vendor blogs) give no evidence, so I have not used them.

## 3. Readers' trust when entries are machine-written by the system being watched

- **[fact, B]** Dietvorst, Simmons and Massey 2015 (*JEP: General* 144(1):114–126), read raw. Across five studies, "people more quickly lose confidence in algorithmic than human forecasters after seeing them make the same mistake". This held even among participants who saw the algorithm beat the human. The setting is forecasting with lab and MTurk participants, so it is some distance from reading status records.
- **[fact, C]** Advani 2026, "From Confident Closing to Silent Failure" (arXiv 2606.09863, FAGEN@ICML2026 workshop; abstract summarised):
  - False success (the agent asserts completion but the environment state shows otherwise) was 45–48% of failures in single-control τ2-bench domains, 3% in dual-control telecom, and 75.8% of AppWorld coding-agent trajectories that made explicit status claims.
  - No LLM judge configuration exceeded AUROC 0.65 (a detection score where 0.5 is chance). Judges relied on "confident closing language".
  - It is a single-author workshop preprint, hence C.
- **[fact, C]** McGuirl and Sarter 2006 (*Human Factors*): showing pilots continually updated system-confidence information improved trust calibration compared with giving only overall reliability. Seen only in search snippets; the abstract was blocked by a bot check.
- **Already in the library:** F-automation-complacency-01 (automation bias cannot be prevented by training), F-trust-ai-label-01 (an "AI-generated" label lowers perceived accuracy whatever the content), F-sum-self-preference-01 and P-sum-independent-grounded-check-01 (models rate their own output higher), F-status-optimism-01 (human status reports skew optimistic).
- **[opinion]** SLSA's levels and the false-success preprint point the same way: an entry written by the actor being watched is weaker evidence than one written by the platform it runs on, such as a GitHub check, merge or signature. The documented examples keep that difference visible: SLSA's levels, GitHub's Verified versus Unverified, and CloudTrail's separate `(backfill)` label. No study tests whether showing that difference changes how a reader trusts the view.

## Field scan

I covered:
- **Operations monitoring:** Prometheus, Grafana, kube-prometheus, Healthchecks.
- **Audit logs:** CloudTrail.
- **Version control and CI:** git, GitHub checks, signatures, retention.
- **Provenance standards:** W3C PROV, SLSA.
- **Accident investigation:** NTSB, the 2003 blackout, TMI.
- **Human factors and trust:** Dietvorst, McGuirl and Sarter, plus Lee and See 2004, which I located but could not read (two hosts blocked it).

Not covered: Atlassian Statuspage component states (the doc page returned 404), and incident-postmortem timeline conventions.

## Proposed library entries

```yaml
---
id: F-asof-age-label-01
form: fact
claim: "NTSB SA-017 (2012, rev. 2015): the cockpit NEXRAD age indicator shows the age of the mosaic image, not of the weather; depicted conditions are 'ALWAYS' older, by up to 15–20 minutes in extreme cases; in two fatal accidents the display read about 1 minute while the data was about 5 and about 6–8 minutes old; NTSB found existing guidance did not give the size of the gap."
grade: B
topics: [dashboards, status-reports, monitoring]
shelf_life: 120 months
sources:
  - https://data.ntsb.gov/advocacy/safety-alerts/Documents/SA-017.pdf  # read raw
note: Aviation setting, distant; single authoritative source.
---
```
```yaml
---
id: F-gh-retention-checks-01
form: fact
claim: "From 2026-10-01, GitHub deletes checks, workflow runs and statuses (including third-party ones) once they exceed the Actions artifact/log retention setting; default 90 days; public-repository maximum 90 days; private up to 400 days; deleted data is not restored by changing the setting."
grade: A
topics: [github, monitoring, dashboards]
shelf_life: 12 months
sources:
  - https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses
  - https://github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses
  - https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization
note: All summarised fetches. The private 400-day figure is from the docs page only.
---
```
```yaml
---
id: F-gh-check-states-01
form: fact
claim: "GitHub check runs have statuses queued, in_progress, completed, waiting, requested, pending (only Actions may set waiting/pending/requested) and conclusions including action_required, cancelled, skipped, stale, timed_out; GitHub alone sets 'stale' on check runs incomplete for more than 14 days."
grade: B
topics: [github, status-reports, dashboards]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/rest/checks/runs
  - https://developer.github.com/changes/2020-02-03-stale-conclusion
---
```
```yaml
---
id: F-git-dates-settable-01
form: fact
claim: "git takes author and committer dates from GIT_AUTHOR_DATE / GIT_COMMITTER_DATE if set, and --date overrides the author date; GitHub marks commits Verified/Unverified by signature, and signs web-interface commits itself."
grade: B
topics: [github, provenance, status-reports]
shelf_life: 36 months
sources:
  - https://git-scm.com/docs/git-commit
  - https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
---
```
```yaml
---
id: F-log-gap-reporting-01
form: fact
claim: "CloudTrail validate-logs reports modified or deleted log and digest files, states the time range that cannot be validated when a digest is missing or invalid, validates backfill digests as a separate chain labelled '(backfill)', and checks only files referenced by digests."
grade: B
topics: [monitoring, audit-logs, provenance]
shelf_life: 24 months
sources:
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html  # read raw
---
```
```yaml
---
id: P-feed-deadman-01
form: pattern
claim: "To notice that a monitoring path itself has stopped, emit an always-on heartbeat that a separate outside service expects within a period plus grace, and alert from that service when it is missing (kube-prometheus Watchdog vector(1) 'meant to ensure that the entire alerting pipeline is functional'; PromLabs; Healthchecks period/grace). Mature tools also give no-data, error and late their own states rather than reusing the last value (Grafana NoData/Error; Prometheus staleness; Healthchecks late/down). Cases where a silent stop went unnoticed: the 2003 blackout alarm failure; TMI's misleading valve indication. Documented practice and case evidence, not a controlled study; untested with AI-agent oversight."
grade: B
topics: [monitoring, dashboards, status-reports]
shelf_life: 36 months
sources:
  - https://raw.githubusercontent.com/prometheus-operator/kube-prometheus/main/manifests/kubePrometheus-prometheusRule.yaml
  - https://training.promlabs.com/training/monitoring-and-debugging-prometheus/metrics-based-meta-monitoring/end-to-end-watchdog-alerts/
  - https://healthchecks.io/docs/configuring_checks/
  - https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/
  - https://prometheus.io/docs/prometheus/latest/querying/basics/
  - https://www.theregister.com/2004/04/08/blackout_bug_report/
  - https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html
note: The blackout quote is from a secondary source (C) until the final report text is checked; the Healthchecks state names were seen on self-hosted copies only.
---
```
```yaml
---
id: F-provenance-self-generated-01
form: fact
claim: "SLSA v1.0: Build L1 provenance 'is trivial to bypass or forge'; L2 (hosted platform) forging 'requires an explicit attack'; L3 requires signing secrets be inaccessible to user-defined build steps. W3C PROV defines provenance as information about entities, activities and people involved in producing data, used to assess its quality, reliability or trustworthiness."
grade: B
topics: [trust, provenance, machine-summaries]
shelf_life: 36 months
sources:
  - https://slsa.dev/spec/v1.0/levels
  - https://www.w3.org/TR/prov-overview/
---
```
```yaml
---
id: F-algorithm-aversion-01
form: fact
claim: "Dietvorst, Simmons & Massey 2015 (JEP: General 144(1):114–126), five studies: people 'more quickly lose confidence in algorithmic than human forecasters after seeing them make the same mistake', and chose an inferior human more often after seeing the algorithm perform, even when they saw it outperform the human."
grade: B
topics: [trust, machine-summaries]
shelf_life: 60 months
sources:
  - https://faculty.wharton.upenn.edu/wp-content/uploads/2016/11/20-Dietvorst-Simmons-Massey-2015.pdf  # read raw
note: Forecasting choice task with lab and MTurk participants; distant from reading status records.
---
```
```yaml
---
id: F-agent-false-success-01
form: fact
claim: "Preprint (Advani 2026, FAGEN@ICML2026 workshop): LLM agents' false success (asserting completion when environment state shows otherwise) was 45–48% of failures in single-control tau2-bench domains, 3% in dual-control telecom, and 75.8% of AppWorld self-assessing coding-agent trajectories with explicit status claims; no LLM-judge configuration exceeded AUROC 0.65 on tau2-bench, and judges relied on confident closing language."
grade: C
topics: [trust, machine-summaries, status-reports]
shelf_life: 12 months
sources:
  - https://arxiv.org/abs/2606.09863
note: Single-author workshop preprint; benchmark setting.
---
```

## New research questions (in neutral form)

1. What do readers of a phone status view do when it shows its last good state after its feed has stopped, compared with a view that marks the data's age or a no-data state?
2. Does labelling each history entry by who wrote it (the platform versus the acting agent) change how accurately readers judge whether the entry is true?
3. Which documented ways exist for a view to tell "a record was deleted under retention" apart from "the step was never recorded"?

---

## Six-part contract

1. **What I changed:** No files; I have no write tools. This memo is the output, for the Orchestrator to record in research/ and pass to the Source checker.
2. **Why:** Q-025 asks how views show as-of time, provenance, gaps and half-finished states, how a stopped feed is noticed, and what is known about trust in machine-written entries. It asks for depth 3.
3. **What I checked:** I read the brief, research/Q-025.md and the 15 library entries sharing its topics. I ran about 20 web searches and about 30 fetches.
   - **Read raw:** NTSB SA-017, the DoE blackout press release, Dietvorst 2015, and the CloudTrail docs page.
   - **Seen only through summarising fetches:** the rest, as marked in the memo.
   - **Failed:** the blackout final report (PDF did not render; NERC links returned 404), the Kemeny report page (timed out), Lee and See and McGuirl and Sarter (bot checks), and the Atlassian Statuspage docs (404).
4. **What is undone:**
   - A direct read of the 2003 blackout report text and the Kemeny Commission passage on the valve indicator.
   - The abstracts of McGuirl and Sarter and of Lee and See.
   - Statuspage conventions and postmortem timeline conventions.
   - I found no direct study of how readers notice stale software dashboards.
5. **What is needed outside my lane:**
   - The Source checker should verify the proposed entries, especially the C-grade blackout and TMI sources and the preprint.
   - No level-5 expert or paid source is needed.
6. **Open questions:**
   - Are the connected project repositories public? If so, GitHub's 90-day cap on retention applies to the records the desk links to. The 60-day schedule shutdown for inactive public repositories (F-gh-12b) also applies to the Orchestrator and the alert sender.
   - Is there anything outside GitHub that expects a regular check-in from the sender or the Orchestrator?

Sources:
- [NTSB SA-017](https://data.ntsb.gov/advocacy/safety-alerts/Documents/SA-017.pdf)
- [AOPA on SA-017](https://www.aopa.org/news-and-media/all-news/2012/june/25/ntsb-warns-of-in-cockpit-weather-delays)
- [GitHub stale conclusion](https://developer.github.com/changes/2020-02-03-stale-conclusion)
- [GitHub check runs API](https://docs.github.com/en/rest/checks/runs)
- [GitHub retention change, 2026-10-01](https://github.blog/changelog/2026-10-01-actions-retention-now-covers-checks-runs-and-statuses)
- [GitHub retention announcement, 2026-08-27](https://github.blog/changelog/2026-08-27-actions-retention-will-cover-checks-workflow-runs-and-statuses)
- [GitHub retention docs](https://docs.github.com/en/organizations/managing-organization-settings/configuring-the-retention-period-for-github-actions-artifacts-and-logs-in-your-organization)
- [git-commit](https://git-scm.com/docs/git-commit)
- [GitHub commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
- [CloudTrail validate-logs](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html)
- [Prometheus querying basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana NoData and Error states](https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/)
- [Healthchecks.io](https://healthchecks.io/docs/configuring_checks/)
- [kube-prometheus rules](https://raw.githubusercontent.com/prometheus-operator/kube-prometheus/main/manifests/kubePrometheus-prometheusRule.yaml)
- [PromLabs watchdog alerts](https://training.promlabs.com/training/monitoring-and-debugging-prometheus/metrics-based-meta-monitoring/end-to-end-watchdog-alerts/)
- [SLSA levels](https://slsa.dev/spec/v1.0/levels)
- [W3C PROV overview](https://www.w3.org/TR/prov-overview/)
- [The Register on the blackout report](https://www.theregister.com/2004/04/08/blackout_bug_report/)
- [DoE blackout press release](https://www.energy.gov/sites/prod/files/oeprod/DocumentsandMedia/Blackout_Press_Release_April_5_2004.pdf)
- [NRC TMI backgrounder](https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html)
- [Kemeny excerpt](https://pddoc.com/tmi2/kemeny/assessment_of_sinificant_events.htm)
- [Dietvorst et al. 2015](https://faculty.wharton.upenn.edu/wp-content/uploads/2016/11/20-Dietvorst-Simmons-Massey-2015.pdf)
- [Advani 2026](https://arxiv.org/abs/2606.09863)
- [McGuirl & Sarter (SWOV record)](https://swov.nl/en/publicatie/supporting-trust-calibration-and-effective-use-decision-aids-presenting-dynamic-system)
- [Lee & See 2004 (PubMed)](https://pubmed.ncbi.nlm.nih.gov/15151155/)