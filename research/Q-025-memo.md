# Q-025 research memo, revision 2: as-of time, provenance, gaps, and noticing a stopped feed

*Researcher memo, revised 2026-11-12. Depth 3. Topics: dashboards, status-reports, briefing, trust, machine-summaries, monitoring.*

Each statement is marked **[fact]**, **[estimate]** or **[opinion]**, with a grade and its sources.
- **Raw:** I read the primary text myself.
- **Summarised:** I saw the text only through a summarising fetch.

Nothing here is checked yet; that is the Source checker's job. Revision 2 only covers the 8 entries that were not filed. F-gh-retention-checks-01 and F-gh-check-states-01 are filed and unchanged.

## What changed since round 1 (for the Source checker)

| Entry | Problem in round 1 | What this revision does |
|---|---|---|
| F-asof-age-label-01 | PDF not extractable; one source | NTSB PDF now read raw in full: every round-1 claim is on pages 1–3. AOPA added as a second source. The claim now holds only what both sources say; the 2010 case and the "guidance" finding move to a note as primary-only. |
| F-git-dates-settable-01 | Each half had one source | Split in two. The git env-var claim now has 3 sources. `--date` and web-interface signing move to notes as single-source. |
| F-gh-commit-verification-01 (new, split off) | — | 2 GitHub docs pages give the statuses. |
| F-log-gap-reporting-01 | One source | The CLI command reference and the integrity-validation intro page are added. The claim is narrowed to what is said twice. |
| P-feed-deadman-01 | Healthchecks states, blackout time and TMI cause unconfirmed | Healthchecks states now come from the official docs index and API reference. The 14:14 time is removed because sources disagree on the time. TMI "command, not position" now rests on a Kemeny passage and Control Global. |
| F-provenance-self-generated-01 | One source per claim | SLSA requirements page and W3C PROV-DM added. |
| F-algorithm-aversion-01 | One source | Crossref confirms the citation independently. The finding itself still has only the paper behind it, so it waits for a second source or a waiver. |
| F-agent-false-success-01 | Single-source preprint | The ICML workshop page confirms the author, venue and the gist, but not the figures. Stays grade C; waits for a waiver or replication. |

## Summary

1. **A view's as-of time is often not the age of what it shows.** The NTSB found that cockpit weather-radar "age" labels show when the image was assembled, not when the weather was observed. In one fatal accident, three updates each read about 1 minute old while the data was about 6, 7 and almost 8 minutes old. Git commit dates come from fields the committer can set.
2. **Mature tools give "no data", "late" and "cannot be validated" their own states** rather than reusing the last value:
   - Grafana: NoData and Error.
   - Healthchecks: new, up, late, down and paused.
   - Prometheus: drops stale series.
   - CloudTrail: validates backfill digests separately; periods without digests cannot be validated.
3. **A monitor cannot reliably report its own death.** The documented remedy is an always-firing signal that a separate outside service expects; that service alarms when the signal stops. In two classic cases operators trusted an indication that no longer reflected reality:
   - 2003 blackout: the alarm system failed silently.
   - Three Mile Island: the valve light showed the close command, not the valve's position.
4. **On trust in machine-written entries the evidence is indirect.** Algorithm aversion is one lab study. Agent false success is one preprint. SLSA calls self-generated provenance "trivial to bypass or forge".
5. **GitHub retention (already filed):** since 1 Oct 2026, checks, workflow runs and statuses are deleted after the Actions retention period. For public repositories that is at most 90 days.

---

## 1. How views show as-of time, provenance, gaps and half-finished states

### As-of time
- **[fact, B] NTSB Safety Alert SA-017** (June 2012, revised December 2015), read raw (pages 1–3):
  - The age indicator "displays the age of the mosaic image created by the service provider", not the weather's age.
  - "Weather conditions depicted on the mosaic image will ALWAYS be older than the age indicated on the display."
  - In extreme cases the oldest data can exceed the indicated age by "15 to 20 minutes".
  - It names two fatal accidents:
    - 25 Mar 2010, AS350, Brownsville TN: one image read "about 1 minute old"; the weather was "about 5 minutes old".
    - 19 Dec 2011, PA-32-260, Bryan TX: the last three updates "should have each said that they were 1 minute old"; the conditions were "about 6, 7, and almost 8 minutes old, respectively".
  - The NTSB "has not found that such guidance contains details about the potential time difference between the age indicator and actual conditions".
  - **Second source:** AOPA (25 Jun 2012, summarised) independently gives the image-age point, "always older", 15–20 minutes, and the 2011 figures (1 minute shown against 6, 7 and almost 8). It does not mention the 2010 case or the guidance finding.
  - *(ntsb.gov/Advocacy/safety-alerts/Documents/SA-017.pdf; aopa.org/…/2012/june/25/ntsb-warns-of-in-cockpit-weather-delays)*
  - **Note for the checker:** the `data.ntsb.gov` URL now redirects. The `www.ntsb.gov/Advocacy/safety-alerts/Documents/SA-017.pdf` URL returns the PDF, and it reads as text once saved.
- **[fact, B] Git commit dates:** `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` set the author and committer timestamps. Three git-project pages say so (all summarised): git-commit, git-commit-tree (DATE FORMATS: "The `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` environment variables support the following date formats…"), and Pro Git §10.8 ("the timestamp used for the 'author' field" and "for the timestamp in the 'committer' field"). That `--date` overrides the author date is on git-commit only, so it is single-source.
- **[fact, B] GitHub `stale`:** filed as F-gh-check-states-01.

### Provenance
- **[fact, B] W3C PROV:** "Provenance is information about entities, activities, and people involved in producing a piece of data or thing, which can be used to form assessments about its quality, reliability or trustworthiness." The same sentence appears in PROV-Overview and PROV-DM (both summarised).
- **[fact, B] SLSA v1.0** (levels page and requirements page, both summarised):
  - L1 provenance is "trivial to bypass or forge".
  - At L2, forging "requires an explicit 'attack'", and the provenance is signed by the hosted platform. The requirements page says consumers "MUST be able to validate the authenticity".
  - At L3, signing secrets are "inaccessible to the user-defined build steps". The requirements page says they "MUST NOT be accessible to the environment running the user-defined build steps", and every field "MUST be generated or verified by the build platform in a trusted control plane".
- **[fact, B] GitHub commit verification** (two docs pages, summarised):
  - By default: Verified ("signed and the signature was successfully verified"), Unverified ("signed but the signature could not be verified"), and no status for unsigned commits.
  - In vigilant mode: Partially verified, for a verified signature where an author who is not the committer has vigilant mode on.
  - "GitHub will automatically use GPG to sign commits you make using the web interface" appears on the about-verification page only. A search snippet repeats it from that same page, so it is single-source.

### Gaps, and records rebuilt after the fact
- **[fact, B] AWS CloudTrail log validation.** Three AWS pages (the user-guide CLI page raw; the CLI reference and the intro page summarised) agree on three points:
  - `validate-logs` detects "Modification or deletion of CloudTrail log files" and of "digest files".
  - It validates "both digest files and backfill digest files". The user guide adds that backfill results carry a `(backfill)` prefix.
  - Periods without digests cannot be validated. The CLI reference says "digest files will not be created for the log files delivered" while validation was disabled, and "the same applies whenever you stop CloudTrail logging". The user guide says "the time range that cannot be validated is indicated in the output".

  Two details are single-source (user guide only): that the output names the range, and that only files referenced by digests are checked. The intro page adds that validation lets you "assert positively that no log files were delivered to your account during a given period".
- **[fact, B] Prometheus staleness and the 5-minute lookback:** confirmed in round 1 (prometheus.io querying basics). It has one page, so it is cited only inside P-feed-deadman-01.
- **[fact, B] Grafana NoData and Error states:** confirmed in round 1, also one page.
- **GitHub retention:** filed as F-gh-retention-checks-01.

### Half-finished states
- **[fact, B] Healthchecks.io**, from official pages only (summarised):
  - The docs index defines the states. **New:** "has not received any pings yet". **Up:** "the last 'success' signal has arrived on time". **Late:** "due but has not arrived yet. It is not yet late by more than the check's configured Grace Time". **Down:** "has not arrived yet, and the Grace Time has elapsed". **Paused.**
  - The API reference gives the `status` values as `new`, `up`, `grace`, `down` and `paused`. The state the UI calls "late" appears in the API as `grace`.
  - The configuring_checks page says "Period is the expected time between pings" and "Grace Time is the additional time to wait before sending an alert when a check is late".
  - *(healthchecks.io/docs/; healthchecks.io/docs/api/; healthchecks.io/docs/configuring_checks/)*
- **GitHub check-run states:** filed as F-gh-check-states-01.

## 2. How readers notice a stale, stopped or wrong view, including when the feed itself has stopped

- **[fact, B] Watchdog alert.** The kube-prometheus Watchdog rule is `expr: vector(1)`, "meant to ensure that the entire alerting pipeline is functional… always firing" (raw manifest). PromLabs says to set the outside service to "expect an incoming alert notification every x minutes (plus some slack time)". Both were confirmed in round 1.
- **[fact, B] 2003 Northeast blackout.** Two independent press reports of the official investigations agree: FirstEnergy's control-room alarm function failed without the operators knowing, and they went on relying on their displays.
  - The Register (2004, summarised) quotes the final report: "Without a functioning alarm system, the [FirstEnergy] control area operators failed to detect the tripping of electrical facilities…" and "Unaware of the loss of alarms and a limited EMS, they made no alternate arrangements to monitor the system". It also says operators "didn't know they were relying on outdated information".
  - Computerworld (Nov 2003, on the interim report, summarised) says the alarm software began to malfunction "by 2:40 p.m. EDT… although FirstEnergy engineers weren't aware of the problem", and that operators "did not receive alarm notifications" at the 3:05 p.m. line trip.
  - **Correction:** I removed "around 14:14". A search summary attributes "shortly after 14:14 EDT" to the final report, but Computerworld's interim-report account says 2:40 p.m., and I could not read the final report itself (the PDF did not extract; the NERC chapter link returned 404).
  - Grade B for the core claim (a silent alarm failure, with operators unaware). The exact time is unresolved.
- **[fact, B] Three Mile Island:**
  - The NRC backgrounder (summarised) says the relief valve "became stuck open" and "Instruments in the control room, however, indicated to the plant staff that the valve was closed".
  - A Kemeny Commission passage, on the pddoc.com copy (summarised), says: "The PORV indicator light in the control room showed only that the signal had been sent to close the PORV rather than the fact that the PORV remained open."
  - Control Global (2009, summarised) independently says the status light was "not operated by a limit switch on the valve, but only by the … signal to the valve actuator solenoid".
  - So the claim that the light showed the command rather than the position now has two sources. pddoc.com is an unofficial transcription of the Kemeny report.
- **Already in the library:** F-gh-12b (scheduled workflows in public repositories are disabled after 60 days of inactivity; runs can be delayed or dropped) and F-webpush-03 (push subscriptions can expire).
- **[opinion]** In every case documented here, a silent stop is noticed through a separate path that expects regular check-ins, never by the stopped part reporting on itself. So a sender that opens an issue "if it can no longer send" covers only failures it sees while still running. It does not cover a run that never starts. This is my inference, not a tested finding.
- **[fact, B, not found]** I found no controlled study of how readers of software dashboards notice staleness.

## 3. Readers' trust when entries are machine-written by the system being watched

- **[fact, B, single-source content] Dietvorst, Simmons and Massey 2015**, read raw (the authors' PDF).
  - **Finding:** across five studies, "people more quickly lose confidence in algorithmic than human forecasters after seeing them make the same mistake". This held even among participants who saw the algorithm outperform the human.
  - **Citation:** Crossref and Semantic Scholar independently confirm the title, authors, *JEP: General* 144(1):114–126, and 2015. Neither shows the abstract (the publisher withholds it).
  - **Second source for the finding:** a search-index copy of the abstract (attributed to repository.upenn.edu) gives the same "even among those who saw the algorithm outperform the human" point, but that host returned 403, so I have not counted it.
- **[fact, C] Advani 2026**, arXiv 2606.09863, accepted to FAGEN@ICML2026, read via the abstract (summarised):
  - False success was "45--48% of failures in single-control tau2-bench domains, 3% in dual-control telecom, and 75.8% among AppWorld self-assessing coding-agent trajectories with explicit status claims".
  - No judge configuration "exceeds AUROC 0.65 on tau2-bench" (0.54 on AppWorld).
  - Judges rely on "confident closing language".
  - The ICML virtual page (icml.cc/virtual/2026/77904) confirms the title, the single author, the workshop ("Failure Modes in Agentic AI…"), and "approaching half in some customer-service domains". It is the same author, not independent replication.
- **[fact, C]** McGuirl and Sarter 2006: unchanged and still unread. Not proposed as an entry.
- **[opinion]** Unchanged from round 1: an entry written by the actor being watched is weaker evidence than one the platform writes. No study tests whether showing that difference changes how readers trust a view.

## Field scan
Unchanged from round 1. Not covered: Statuspage component states, and postmortem timeline conventions.

## Proposed library entries (revised; the two filed entries are omitted)

```yaml
---
id: F-asof-age-label-01
form: fact
claim: "NTSB SA-017 (2012, rev. 2015): the in-cockpit NEXRAD age indicator shows the age of the mosaic image, not of the weather; depicted conditions are 'ALWAYS' older, by up to 15–20 minutes in extreme cases; in a fatal 2011 accident the last three updates read 1 minute old while the conditions were about 6, 7 and almost 8 minutes old."
grade: B
topics: [dashboards, status-reports, monitoring]
shelf_life: 120 months
sources:
  - https://www.ntsb.gov/Advocacy/safety-alerts/Documents/SA-017.pdf  # read raw, pp.1-3
  - https://www.aopa.org/news-and-media/all-news/2012/june/25/ntsb-warns-of-in-cockpit-weather-delays  # summarised
note: "Primary-only (SA-017 p.2, read raw), not in the claim: a second fatal accident (2010, AS350) where 1 minute was shown against about 5; and NTSB 'has not found that such guidance contains details about the potential time difference'. Aviation setting, distant."
---
```
```yaml
---
id: F-git-dates-settable-01
form: fact
claim: "git takes a commit's author and committer timestamps from the GIT_AUTHOR_DATE and GIT_COMMITTER_DATE environment variables, so commit dates are whatever the committing environment sets."
grade: B
topics: [github, provenance, status-reports]
shelf_life: 36 months
sources:
  - https://git-scm.com/docs/git-commit
  - https://git-scm.com/docs/git-commit-tree
  - https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables
note: "All summarised. '--date overrides the author date' is on git-commit only (single source). All three are git-project pages."
---
```
```yaml
---
id: F-gh-commit-verification-01
form: fact
claim: "GitHub shows a commit as Verified (signed, signature verified), Unverified (signed, signature could not be verified) or with no status (unsigned); in vigilant mode unsigned commits show Unverified and a verified commit with a non-committer author who enabled vigilant mode shows Partially verified."
grade: B
topics: [github, provenance, status-reports]
shelf_life: 24 months
sources:
  - https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
  - https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits
note: "Summarised. 'GitHub will automatically use GPG to sign commits you make using the web interface' is on the first page only (single source)."
---
```
```yaml
---
id: F-log-gap-reporting-01
form: fact
claim: "AWS CloudTrail validate-logs detects modification or deletion of log files and of digest files, validates backfill digest files as well as regular ones, and cannot validate periods for which no digests exist (validation disabled, logging stopped or trail deleted)."
grade: B
topics: [monitoring, audit-logs, provenance]
shelf_life: 24 months
sources:
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html  # read raw
  - https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/validate-logs.html  # summarised
  - https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html  # summarised
note: "User-guide page only (single source): the output names the time range that cannot be validated; backfill results are prefixed '(backfill)'; only files referenced by digests are checked."
---
```
```yaml
---
id: P-feed-deadman-01
form: pattern
claim: "To notice that a monitoring path has itself stopped, emit an always-on heartbeat that a separate outside service expects within a period plus grace, and alert from that service when it is missing (kube-prometheus Watchdog vector(1); PromLabs; Healthchecks period/grace). Mature tools give no-data, error, late and down their own states rather than reusing the last value (Grafana NoData/Error; Prometheus staleness; Healthchecks new/up/late/down/paused). Case evidence of silent stops being trusted: the 2003 blackout, where the control-room alarm function failed without operators knowing; TMI, where the relief-valve light showed only that the close signal was sent, not the valve's position. Documented practice and cases, not a controlled study; untested with AI-agent oversight."
grade: B
topics: [monitoring, dashboards, status-reports]
shelf_life: 36 months
sources:
  - https://raw.githubusercontent.com/prometheus-operator/kube-prometheus/main/manifests/kubePrometheus-prometheusRule.yaml
  - https://training.promlabs.com/training/monitoring-and-debugging-prometheus/metrics-based-meta-monitoring/end-to-end-watchdog-alerts/
  - https://healthchecks.io/docs/
  - https://healthchecks.io/docs/api/
  - https://healthchecks.io/docs/configuring_checks/
  - https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/
  - https://prometheus.io/docs/prometheus/latest/querying/basics/
  - https://www.theregister.com/2004/04/08/blackout_bug_report/
  - https://www.computerworld.com/article/1323183/software-failure-cited-in-august-blackout-investigation.html
  - https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html
  - https://pddoc.com/tmi2/kemeny/assessment_of_sinificant_events.htm
  - https://www.controlglobal.com/articles/2009/3MileIslandAccident0905
note: "Blackout: secondary press accounts of the interim and final reports; failure time differs between them (14:14 per a search summary of the final report, 2:40 p.m. per Computerworld on the interim report), so no time is claimed. Healthchecks API names the late state 'grace'. pddoc.com is an unofficial transcription of the Kemeny report. Grafana and Prometheus parts each rest on one vendor page, the norm for vendor behaviour."
---
```
```yaml
---
id: F-provenance-self-generated-01
form: fact
claim: "SLSA v1.0: Build L1 provenance 'is trivial to bypass or forge'; at L2 provenance is signed by a hosted build platform and forging it 'requires an explicit attack'; at L3 secrets used to sign provenance must not be accessible to user-defined build steps and every provenance field must be generated or verified by the platform's trusted control plane. W3C PROV defines provenance as information about entities, activities and people involved in producing data, used to assess its quality, reliability or trustworthiness."
grade: B
topics: [trust, provenance, machine-summaries]
shelf_life: 36 months
sources:
  - https://slsa.dev/spec/v1.0/levels
  - https://slsa.dev/spec/v1.0/requirements
  - https://www.w3.org/TR/prov-overview/
  - https://www.w3.org/TR/prov-dm/
note: "All summarised. Each pair is two pages of the same specification."
---
```
```yaml
---
id: F-algorithm-aversion-01
form: fact
claim: "Dietvorst, Simmons & Massey 2015 (JEP: General 144(1):114–126), five studies: people 'more quickly lose confidence in algorithmic than human forecasters after seeing them make the same mistake', and were less likely to choose the algorithm over an inferior human after seeing it perform, even when they saw it outperform the human."
grade: B
topics: [trust, machine-summaries]
shelf_life: 60 months
sources:
  - https://faculty.wharton.upenn.edu/wp-content/uploads/2016/11/20-Dietvorst-Simmons-Massey-2015.pdf  # read raw
  - https://api.crossref.org/works/10.1037/xge0000033  # citation details only
note: "Finding rests on the paper itself; Crossref and Semantic Scholar confirm the citation, not the content. Needs a second source for the finding or an owner waiver for a primary peer-reviewed paper. Forecasting task with lab and MTurk participants; distant from status records."
---
```
```yaml
---
id: F-agent-false-success-01
form: fact
claim: "Preprint (Advani 2026, FAGEN@ICML2026 workshop): LLM agents' false success (asserting completion when environment state shows otherwise) was 45–48% of failures in single-control tau2-bench domains, 3% in dual-control telecom, and 75.8% among AppWorld self-assessing coding-agent trajectories with explicit status claims; no LLM-judge configuration exceeded AUROC 0.65 on tau2-bench (0.54 on AppWorld), and judges relied on confident closing language."
grade: C
topics: [trust, machine-summaries, status-reports]
shelf_life: 12 months
sources:
  - https://arxiv.org/abs/2606.09863
  - https://icml.cc/virtual/2026/77904  # confirms author, venue, gist; not the figures
note: "Single-author workshop preprint; no independent replication found. File only under an owner waiver, or hold."
---
```

## New research questions (neutral form)
These are unchanged from round 1:
1. What do readers of a phone status view do when it shows its last good state after its feed has stopped, compared with a view that marks the data's age or a no-data state?
2. Does labelling each history entry by who wrote it (the platform or the acting agent) change how accurately readers judge whether the entry is true?
3. Which documented ways exist for a view to tell "a record was deleted under retention" apart from "the step was never recorded"?

---

## Six-part contract

**1. What I changed.** I revised the memo for the 8 entries that were not filed:
- **F-asof-age-label-01:** re-sourced; the claim is narrowed to what two sources say.
- **F-git-dates-settable-01:** split, which adds the new **F-gh-commit-verification-01**.
- **F-log-gap-reporting-01:** second and third sources added; claim narrowed.
- **P-feed-deadman-01:** fixed. The Healthchecks states now come from official pages, the 14:14 time is removed, and the TMI claim has a second source.
- **F-provenance-self-generated-01:** second sources added.
- **F-algorithm-aversion-01 and F-agent-false-success-01:** extra corroboration added, and both are flagged plainly as still single-source.

I wrote no files; I have no write tools.

**2. Why.** The source check found that claims lacked a second source or had not been seen in the text. Where I could not find a second source, I moved the detail out of the claim into a note marked "single source" rather than keep it in the claim.

**3. What I verified** (tool calls and what they returned):
- **NTSB:** the PDF from `www.ntsb.gov/Advocacy/...` was saved and read raw. All round-1 claims are on pages 1–3, including the 2010 figure (5 minutes), the 2011 figures (6, 7 and almost 8 minutes) and the guidance sentence. `data.ntsb.gov` redirects. AOPA confirms the 2011 figures. GA News returned 403, and AIN is behind a paywall.
- **git:** git-commit-tree and Pro Git confirm the date variables.
- **GitHub verification:** both GitHub pages confirm the statuses. Web signing appears on one page only.
- **CloudTrail:** the CLI reference and intro page confirm detection, backfill and the no-digest periods.
- **Healthchecks:** the docs index and API reference confirm the states.
- **SLSA and PROV:** the SLSA requirements page and PROV-DM confirm the wording.
- **TMI:** the pddoc Kemeny passage and Control Global confirm that the light showed the signal, not the position. The NRC page was re-confirmed.
- **Blackout:** The Register was re-read; Computerworld (interim report) gives 2:40 p.m. The final-report PDF is saved but would not extract (no PDF renderer, so text extraction failed), and the NERC ch5 link returned 404.
- **Dietvorst:** Crossref and Semantic Scholar confirm the citation without the abstract. SSRN and the Penn repository returned 403, and PubMed showed only a cookie wall.
- **Advani:** the arXiv abstract was re-read. The ICML page confirms the author and venue, but not the figures.

**4. What is undone:**
- A direct read of the 2003 final report text: the exact time the alarms failed, and the quote checked in the original.
- A second source for the content of Dietvorst 2015.
- Independent support for the Advani figures.
- McGuirl and Sarter, Lee and See, Statuspage, and postmortem timeline conventions (all carried over from round 1).

**5. What is needed outside my lane:**
- The Source checker should re-check the revised entries.
- Someone with a PDF text tool should open the blackout final report (energy.gov `BlackoutFinal-Web.pdf`, chapter 5) and settle the time.
- The Chief of Staff should ask the owner whether the two-source rule can be waived for a primary peer-reviewed paper read raw (Dietvorst) and for a preprint kept at grade C (Advani), or whether both should wait.
- No level-5 expert or paid source is needed.

**6. Open questions:**
- Should the "single source" details kept in the notes go into the library at all, or be dropped?
- For vendor behaviour (Grafana and Prometheus, one vendor page each), does the vendor-behaviour rule used for the filed retention entry also cover their use inside P-feed-deadman-01?
- Carried over: are the connected repositories public? If so, the 90-day retention cap and the 60-day schedule shutdown apply. And is there anything outside GitHub that expects a regular check-in from the sender or the Orchestrator?

Sources:
- [NTSB SA-017](https://www.ntsb.gov/Advocacy/safety-alerts/Documents/SA-017.pdf)
- [AOPA on SA-017](https://www.aopa.org/news-and-media/all-news/2012/june/25/ntsb-warns-of-in-cockpit-weather-delays)
- [git-commit](https://git-scm.com/docs/git-commit)
- [git-commit-tree](https://git-scm.com/docs/git-commit-tree)
- [Pro Git, environment variables](https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables)
- [GitHub, about commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
- [GitHub, vigilant mode statuses](https://docs.github.com/en/authentication/managing-commit-signature-verification/displaying-verification-statuses-for-all-of-your-commits)
- [CloudTrail validate-logs, user guide](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-cli.html)
- [CloudTrail validate-logs, CLI reference](https://docs.aws.amazon.com/cli/latest/reference/cloudtrail/validate-logs.html)
- [CloudTrail integrity validation, intro](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-log-file-validation-intro.html)
- [Healthchecks docs](https://healthchecks.io/docs/)
- [Healthchecks API](https://healthchecks.io/docs/api/)
- [Healthchecks, configuring checks](https://healthchecks.io/docs/configuring_checks/)
- [SLSA levels](https://slsa.dev/spec/v1.0/levels)
- [SLSA requirements](https://slsa.dev/spec/v1.0/requirements)
- [W3C PROV overview](https://www.w3.org/TR/prov-overview/)
- [W3C PROV-DM](https://www.w3.org/TR/prov-dm/)
- [The Register on the blackout report](https://www.theregister.com/2004/04/08/blackout_bug_report/)
- [Computerworld on the interim blackout report](https://www.computerworld.com/article/1323183/software-failure-cited-in-august-blackout-investigation.html)
- [NRC TMI backgrounder](https://www.nrc.gov/reading-rm/doc-collections/fact-sheets/3mile-isle.html)
- [Kemeny Commission passage (pddoc copy)](https://pddoc.com/tmi2/kemeny/assessment_of_sinificant_events.htm)
- [Control Global on TMI](https://www.controlglobal.com/articles/2009/3MileIslandAccident0905)
- [Dietvorst et al. 2015](https://faculty.wharton.upenn.edu/wp-content/uploads/2016/11/20-Dietvorst-Simmons-Massey-2015.pdf)
- [Crossref record](https://api.crossref.org/works/10.1037/xge0000033)
- [Advani 2026, arXiv](https://arxiv.org/abs/2606.09863)
- [Advani 2026, ICML page](https://icml.cc/virtual/2026/77904)