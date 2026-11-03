# Q-020 — researcher return

## 1 What I changed
I changed no files, because my role has no write access. Below is a dated, graded memo for the Orchestrator to record as `research/Q-020-memo.md`, followed by proposed library entries.

---

# Research memo — Q-020 — keeping one decision-maker informed about many changes — 2026-11-03

**Depth:** 3. **Method:** standard web field scan, then I opened the primary or nearest open page for each finding. Many publisher pages were blocked (PubMed and PMC behind a captcha, NN/g refused the connection, ResearchGate, Springer and ACM returned 403), and the PDF reader was unavailable, so several findings rest on search snippets only. Each row says what was opened.

**Grades.** A: two or more independent sources, opened. B: one authoritative source, opened (abstract or page). C: secondary page opened, or the primary seen only in search snippets. D: snippet only, not corroborated.

**Closeness to setting** (one owner, several projects, built mostly by AI agents):
- **Close:** software change oversight by one person.
- **Medium:** supervising automation, or project status reporting.
- **Distant:** clinical work, personal phone use, national intelligence.

### Area 1 — Alert volume, repeats and what gets acted on
| # | Statement | Type | Grade | Closeness | Opened |
|---|---|---|---|---|---|
| 1.1 | In a retrospective study of 112 primary-care clinicians (EHR data, 2010–2013), "likelihood of reminder acceptance dropped by 30% for each additional reminder received per encounter, and by 10% for each five percentage point increase in proportion of repeated reminders." Acceptance was linked to work complexity and repeats, not to amount of work. | fact | B | distant | Europe PMC abstract of Ancker et al. 2017, *BMC Med Inform Decis Mak* 17:36 |
| 1.2 | The same study: newly deployed reminders "did not show a pattern of declining response rates over time." This is evidence against slow desensitisation and points instead to load *within one sitting* and repetition. | fact | B | distant | same |
| 1.3 | A review of 17 papers found drug-safety alerts "overridden by clinicians in 49% to 96% of cases". "The most important reason … was alert fatigue caused by poor signal-to-noise ratio because the alert was not serious, was irrelevant, or was shown repeatedly." The authors add that "only unjustified overriding poses a problem." | fact | B (A for the repeat/irrelevance driver, together with 1.1) | distant | PMC1447540, van der Sijs et al. 2006, *JAMIA* 13(2) |
| 1.4 | Google SRE practice: "Every page should be actionable"; a page should be about "a novel problem"; pages with rote responses are "a red flag". | opinion (documented practice, one vendor) | B | medium–close | sre.google SRE book, "Monitoring Distributed Systems" |
| 1.5 | In security operations centres, analysts report very high false-positive rates; most are "benign triggers" (true alarms explained by legitimate activity). Survey n=20, interviews n=21. | fact (small qualitative study) | D | medium | USENIX page returned 403; seen in snippets only (Alahmadi, Axon, Martinovic, USENIX Security 2022) |
| 1.6 | 72–99% of clinical monitor alarms are false (Sendelbach & Funk 2013). | fact | D | distant | snippets only |
| 1.7 | **No source found** on how the share of notices a reader acts on changes when weekly volume swings several-fold. The nearest is 1.1, a per-sitting gradient. | gap | — | — | — |

### Area 2 — Delivery: one at a time, batched, or none
| # | Statement | Type | Grade | Closeness | Opened |
|---|---|---|---|---|---|
| 2.1 | In a randomised field experiment (n=237, phone notifications), batching three times a day improved attentiveness, productivity, mood and sense of control, and reduced stress, compared with normal delivery. Participants given *no* notifications gained few benefits and reported more anxiety and fear of missing out. | fact | B | distant (personal well-being, not decision quality) | Duke Scholars abstract page, Fitz et al. 2019, *Computers in Human Behavior* |
| 2.2 | Email logging of 40 workers over 12 days: batching was linked to higher self-rated productivity, but the study found "no evidence that batching email leads to lower stress". | fact | C | medium | MS Research page opened (first sentence only); finding from snippets (Mark et al., CHI 2016) |
| 2.3 | 20 users had desktop notifications switched off for a week; all switched them back on afterwards and valued the "passive awareness". | fact | D | medium | PDF unreadable; snippets only (Iqbal & Horvitz, CSCW 2010) |
| 2.4 | Phone users received about 63.5 notifications a day, mostly from messaging and email (n=15, one week). | fact | D | distant | PDF unreadable; snippets only (Pielot et al., MobileHCI 2014) |
| 2.5 | Taken together, 2.1–2.3 give no support for removing notices entirely, and modest, distant support for predictable batches over immediate delivery. None of these studies measured missed important items or decision quality. | opinion | — | — | — |

### Area 3 — Approval gates, review size and change oversight
| # | Statement | Type | Grade | Closeness | Opened |
|---|---|---|---|---|---|
| 3.1 | DORA: "no evidence was found to support the hypothesis that a more formal, external review process was associated with lower change fail rates". Heavyweight approval leads to "larger batches less frequently", likely with higher risk. DORA recommends peer review inside the development platform. | fact (survey research, Google-run programme, 2019 report) | B | close | dora.dev "Streamlining change approval" |
| 3.2 | In a study at Microsoft, the more files in a change, the lower the proportion of review comments that are useful to the author. | fact | C | close | MS Research page opened (first sentence only); finding from snippets (Bosu, Greiler, Bird, MSR 2015) |
| 3.3 | A study of 32,425 release notes from 1,000 GitHub projects, plus 15 interviews and 314 survey responses, found eight common content categories and "significant discrepancies between different stakeholders" on how release notes should be written and used. | fact | D | close | Monash page returned 403; snippets only (Bi et al., TSE 2020) |

### Area 4 — Supervising automation
| # | Statement | Type | Grade | Closeness | Opened |
|---|---|---|---|---|---|
| 4.1 | Review: automation complacency arises under multiple-task load, affects novices and experts alike, and is not overcome by simple practice. Automation bias produces both omission and commission errors and "cannot be prevented by training or instructions." | fact (integrative review) | B | medium | TU Berlin DepositOnce abstract, Parasuraman & Manzey 2010, *Human Factors* 52(3) |
| 4.2 | When a single operator supervises several unmanned vehicles, predicted capacity fell by up to 67% once wait times were modelled. Loss of situation awareness was the main source of those wait times. | fact (simulation and model) | B | medium (one supervisor, several autonomous workers) | MIT DSpace record, Cummings & Mitchell 2008, *IEEE SMC-A* 38(2) |
| 4.3 | 4.1 and 4.2 suggest that the cost of switching between projects and rebuilding context, not reading speed, may limit how many projects one owner can oversee. A brief that restores context on each switch would target that cost. This is not tested. | opinion | — | — | — |

### Area 5 — Who writes the status report
| # | Statement | Type | Grade | Closeness | Opened |
|---|---|---|---|---|---|
| 5.1 | Survey of 561 project managers: "optimistic biasing has a degrading effect on reporting quality"; reporting quality had "a positive effect" on project performance. The executive's power, the manager's trust in the executive, and the executive's communication quality directly affect selective reporting. | fact | B | medium | AIS eLibrary abstract, Iacovou, Thompson & Smith 2009, *MIS Quarterly* 33(4) |
| 5.2 | Among 56 experienced software project managers, reports were biased 60% of the time, and the bias was more than twice as likely to be optimistic as pessimistic. | fact | D | medium | Sloan Review and academia pages unreadable or 403; snippets only (Snow, Keil & Wallace 2007, *Information & Management*; Keil et al., MIT SMR 2014) |
| 5.3 | People's forecasts of their own task completion are too optimistic; their forecasts for others are less optimistic. | fact | D | distant | APA page did not load; snippets only (Buehler, Griffin & Ross 1994, *JPSP*) |
| 5.4 | **No source found** comparing the accuracy of status reports written by an AI agent about its own work with reports written by another party. Findings 5.1–5.3 concern human motives such as career and power, which may not transfer to agents. Q-021 covers errors in machine-written summaries. | gap | — | — | — |

### Area 6 — Briefing practice (case evidence)
| # | Statement | Type | Grade | Closeness | Opened |
|---|---|---|---|---|---|
| 6.1 | The 6 August 2001 President's Daily Brief item was "the 36th PDB item briefed so far that year that related to Bin Ladin or al Qaeda, and the first devoted to the possibility of an attack in the United States". The recipient read it as "historical in nature", and "no CSG or other NSC meeting was held" as a result. | fact (one documented case) | B | distant | 9/11 Commission Report, ch. 8, govinfo.library.unt.edu |
| 6.2 | Lesson drawn from 6.1: a new kind of item buried among many repeated items on the same topic, with no requested action, can be read as already known. This fits 1.1 and 1.3, which concern repetition. | opinion | — | — | — |

### Area 7 — Reading on a phone
| # | Statement | Type | Grade | Closeness | Opened |
|---|---|---|---|---|---|
| 7.1 | NN/g (2016): "no perceptible difference in reading comprehension" between phone and computer. "Hard passages actually took longer on mobile." Snippets add that a marginal interaction suggests comprehension falls on mobile as difficulty rises. | fact | C | medium | NN/g refused the connection; secondary summary opened (Information Today Europe, 2016-12-13) |
| 7.2 | Cloze test on privacy policies: 18.93% comprehension on mobile vs 39.18% on desktop, roughly half (Singh et al., *IJMHCI* 3(1), 2011). | fact | C | distant (dense legal text, 2011 screens) | secondary page opened (UX Magazine) |
| 7.3 | **No source found** on how many status items one person takes in per phone screen or per glance. The library already records this gap (P-glance-disclosure-01, "Not documented … item counts"). | gap | — | — | — |

### What the evidence supports for the decision
- **Strongest and most consistent finding:** many notices at once, and repeated notices, lower the share acted on (1.1, 1.3; also 1.4 as practice; 6.1 as a case). Every source is distant from the owner's setting except 1.4, and none involves AI agents.
  - This makes the following **candidate traps** (opinion): repeating unchanged items; mixing items that need a decision with routine ones; sending pushes that need no action.
- **Closest-setting evidence** (3.1, 3.2): heavy approval gates and large batches of change do not lower failure rates in software delivery, and large changes get less useful review. This counts against designs that make the owner approve every change (opinion).
- **Self-reports by the party who did the work:** human evidence shows a bias towards optimism (5.1 graded B; 5.2 and 5.3 graded D). Nothing tests AI agents.
- **Formats with no evidence either way:** digest versus list versus status page for this setting; item counts on a phone; behaviour when volume swings. These stay open, or go to a cheap trial.

### Proposed library entries
```yaml
---
id: F-alert-repeat-01
form: fact
claim: "In a retrospective study of 112 primary-care clinicians (EHR, 2010–2013), 'likelihood of reminder acceptance dropped by 30% for each additional reminder received per encounter, and by 10% for each five percentage point increase in proportion of repeated reminders'; acceptance was associated with work complexity and repeated alerts, not amount of work; newly deployed reminders 'did not show a pattern of declining response rates over time'."
grade: B
topics: [notifications, briefing]
shelf_life: 60 months
sources:
  - https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1186/s12911-017-0430-8&resultType=core&format=json  # Ancker et al. 2017, BMC Med Inform Decis Mak 17:36
note: Clinical setting, distant. Proposed by researcher; not checked.
---
---
id: F-alert-override-01
form: fact
claim: "Review of 17 papers: drug safety alerts 'overridden by clinicians in 49% to 96% of cases'; 'The most important reason for overriding was alert fatigue caused by poor signal-to-noise ratio because the alert was not serious, was irrelevant, or was shown repeatedly'; 'only unjustified overriding poses a problem'."
grade: B
topics: [notifications, briefing]
shelf_life: 60 months
sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC1447540  # van der Sijs et al. 2006, JAMIA 13(2):138-147
---
---
id: F-batch-notify-01
form: fact
claim: "Randomised field experiment (n=237): phone notifications batched three times daily, vs as-usual, improved self-reported attentiveness, productivity, mood and phone control and reduced stress; a no-notification group gained few benefits and reported higher anxiety and fear of missing out. Decision quality and missed items not measured."
grade: B
topics: [notifications, mobile]
shelf_life: 60 months
sources:
  - https://scholars.duke.edu/publication/1402953  # Fitz et al. 2019, Computers in Human Behavior
---
---
id: F-change-approval-01
form: fact
claim: "DORA: 'no evidence was found to support the hypothesis that a more formal, external review process was associated with lower change fail rates'; heavyweight approval tends toward 'larger batches less frequently' with higher risk; DORA recommends peer review captured in the development platform. Survey-based research (2019 State of DevOps Report), Google-run programme."
grade: B
topics: [change-reporting, status-reports]
shelf_life: 36 months
sources:
  - https://dora.dev/capabilities/streamlining-change-approval/
---
---
id: F-automation-complacency-01
form: fact
claim: "Integrative review: automation complacency occurs under multiple-task load, in naive and expert users, and is not overcome by simple practice; automation bias yields omission and commission errors with imperfect aids and 'cannot be prevented by training or instructions'."
grade: B
topics: [briefing, status-reports]
shelf_life: 60 months
sources:
  - https://depositonce.tu-berlin.de/items/0c787d91-6021-480b-a333-009e0d1d0092/full  # Parasuraman & Manzey 2010, Human Factors 52(3)
---
---
id: F-supervisor-capacity-01
form: fact
claim: "Single-operator supervision of multiple UAVs: capacity predictions dropped by up to 67% when interaction, queuing and loss-of-situation-awareness wait times were modelled, with loss of SA as the primary source (simulation/model study)."
grade: B
topics: [briefing]
shelf_life: 60 months
sources:
  - https://dspace.mit.edu/handle/1721.1/90280  # Cummings & Mitchell 2008, IEEE SMC-A 38(2)
---
---
id: F-status-optimism-01
form: fact
claim: "Survey of 561 IS project managers: 'optimistic biasing has a degrading effect on reporting quality'; reporting quality has 'a positive effect' on project performance; executive power, PM trust in the executive and executive communication quality directly affect selective reporting."
grade: B
topics: [status-reports]
shelf_life: 60 months
sources:
  - https://aisel.aisnet.org/misq/vol33/iss4/11  # Iacovou, Thompson & Smith 2009, MISQ 33(4)
note: Human motives (career, power); transfer to AI-agent reports untested.
---
---
id: F-briefing-case-pdb-01
form: fact
claim: "9/11 Commission: the 6 Aug 2001 PDB item was 'the 36th PDB item briefed so far that year that related to Bin Ladin or al Qaeda, and the first devoted to the possibility of an attack in the United States'; the President told the Commission it was 'historical in nature'; 'No CSG or other NSC meeting was held to discuss the possible threat of a strike in the United States as a result of this report.'"
grade: B
topics: [briefing]
shelf_life: 120 months
sources:
  - https://govinfo.library.unt.edu/911/report/911Report_Ch8.htm
note: Single case; any lesson drawn is opinion.
---
---
id: P-notice-actionable-01
form: pattern
claim: "Send an interrupting notice only when it needs action and is new; do not repeat unchanged items. Evidence: repeats and per-sitting count lower acceptance (F-alert-repeat-01); irrelevant or repeated alerts drive override (F-alert-override-01); SRE practice 'Every page should be actionable' and about 'a novel problem'. All settings distant (clinical) or practice (one vendor); untested with AI-agent oversight."
grade: B
topics: [notifications, briefing]
shelf_life: 36 months
sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC1447540
  - https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1186/s12911-017-0430-8&resultType=core&format=json
  - https://sre.google/sre-book/monitoring-distributed-systems/
---
```
I am not proposing entries for the D- and C-graded rows (1.5, 1.6, 2.2–2.4, 3.2, 3.3, 5.2, 5.3, 7.1, 7.2) until their primary pages are opened.

---

## 2 Why
Q-020 asks for a depth-3 graded memo. Its question does not begin with "Groundwork map:", so I wrote a memo rather than a map. Existing library entries on the same topics (P-glance-disclosure-01, P-notify-permission-01, P-stale-visible-01, F-gh-11, F-webpush-*) cover platform mechanics and glanceable layout. None covers briefing evidence, so they add nothing new here, apart from the existing gap on phone item counts.

## 3 What I verified
- **Opened successfully (11 pages):**
  - Europe PMC API: Ancker 2017
  - PMC1447540: van der Sijs 2006
  - Duke Scholars: Fitz 2019
  - TU Berlin DepositOnce: Parasuraman & Manzey 2010
  - AIS eLibrary: Iacovou et al. 2009
  - dora.dev
  - sre.google
  - 9/11 Report ch. 8
  - MIT DSpace: Cummings & Mitchell 2008
  - Information Today Europe and UX Magazine, as secondary pages for the NN/g study and Singh 2011
- **Failed:**
  - pubmed and PMC5387195 (cookie or captcha wall)
  - nngroup.com (connection refused)
  - Springer, ResearchGate, academia.edu, USENIX, Monash, econbiz (403)
  - Semantic Scholar (429)
  - web.archive.org (not allowed)
  - all PDFs: Buehler 1994, Mark 2016, Pielot 2014, Iqbal & Horvitz 2010, MIT SMR 2014 (no PDF renderer)
- All fetches went through a summarising fetch, so quotations should be confirmed against the raw pages.

## 4 What is undone
- Primary pages for 1.5, 1.6, 2.2–2.4, 3.2, 3.3, 5.2, 5.3, 7.1 and 7.2 still need opening.
- I found no evidence on:
  - volume that swings several-fold
  - item counts per phone screen
  - accuracy of AI agents' self-reports compared with reports by others
  - digest versus status page for one owner
- Incident-management and release-note practice is covered only thinly.

## 5 What is needed outside my lane
- **Source checker:** check the proposed entries. A fetcher that can render PDFs or get past the PMC captcha would upgrade the D and C rows, especially Snow, Keil & Wallace 2007 (5.2) and Bosu et al. 2015 (3.2), which are the closest in setting.
- **Chief of Staff:** no paid source or level-5 expert is needed. The full texts of Snow, Keil & Wallace 2007 (*Information & Management*) and Bi et al. 2020 (TSE) are paywalled, and only their abstracts or snippets were seen.

## 6 Open questions (added, none closed)
1. Does an AI agent's report on its own work show the optimistic bias seen in human status reports, and does a report by a second agent or a check against the record reduce it? (Links to Q-021.)
2. When weekly change volume swings several-fold, does the share of items a single overseer acts on fall, and does a fixed-size digest change that?
3. How many project-status items can one person take in reliably on one phone screen or in one glance?
4. Does a brief that restores context when the owner switches project (see 4.2) reduce errors compared with a plain list of changes?