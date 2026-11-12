Status: I've found independent second sources for SLSA (the GitHub blog and Socket.dev) and for Dietvorst (an independent 2017 experiment, Prahl & Van Swol). Advani still has no independent replication. I'm writing up the revision now.

# Q-025 research memo, revision 3

*Researcher memo, revised 2026-11-12. Depth 3. This revision covers only the three entries the source check did not file: F-provenance-self-generated-01, F-algorithm-aversion-01 and F-agent-false-success-01. The five filed entries are not changed. Raw means I read the text myself; summarised means I saw it only through a summarising fetch. Nothing here is checked yet.*

## What changed since round 2

| Entry | Source-check finding | This revision |
|---|---|---|
| F-provenance-self-generated-01 | Two pages from one SLSA spec and two from one PROV spec, so not independent. The L1/L2 wording appears on the levels page only. | **Narrowed and re-sourced.** The claim now holds only what the SLSA spec and two independent publishers (the GitHub blog and Socket.dev) both say. The verbatim spec phrases and the PROV definition move to the note. |
| F-algorithm-aversion-01 | The finding rests on the paper alone. | **Independent replication added:** Prahl & Van Swol 2017 (*J. Forecasting*) ran a separate experiment. The claim is narrowed to the point both papers support, and the part Prahl & Van Swol did *not* replicate is stated. |
| F-agent-false-success-01 | One author's preprint. The trajectory count differed (≈10,000 vs ≈12,000). | **Count settled:** 9,876 tau2-bench trajectories plus 1,879 AppWorld trajectories (11,755 in all). The ICML page covers tau2-bench only. There is still no independent replication. It is still proposed at grade C, to be filed only under a waiver. |

## Findings

### Provenance written by the build itself (SLSA)
- **[fact, B]** SLSA v1.0 levels page (raw HTML confirmed by the checker in round 2):
  - At Build L1, provenance "is trivial to bypass or forge".
  - At L2, provenance is signed by a hosted build platform, and forging it "requires an explicit 'attack'".
  - At L3, signing secrets are "inaccessible to the user-defined build steps".
- **Independent source 1:** GitHub blog, Kristina Heidinger, 19 Dec 2024 (summarised):
  - L1: "Provenance exists for traceability, but minimal tamper resistance".
  - L2: "Provenance signed by a managed build platform, deterring simple tampering".
  - L3: "user-defined build steps should not have access to sensitive signing material".
- **Independent source 2:** Socket.dev glossary, dated 30 Oct 2026 (summarised):
  - L1 provenance "can be unsigned or self-generated".
  - At L2, "the platform's control plane signs the provenance", but code in the build can reach the signing identity.
  - At L3, signing material "MUST NOT be accessible to the environment running the user-defined build steps", which is "the first level at which code running inside your build cannot forge your provenance".
- **Supporting, same publisher as source 1:** GitHub docs (artifact attestations, summarised) say attestations alone give "SLSA v1.0 Build Level 2", and reusable workflows "provide isolation… to meet SLSA v1.0 Build Level 3".
- **Spec only (now in the note):**
  - "Every field… MUST be generated or verified by the build platform in a trusted control plane" (requirements page).
  - The W3C PROV definition of provenance. Its only other appearance I found is Wikipedia quoting W3C, which is tertiary, so I don't count it.

### Algorithm aversion
- **[fact, B] Dietvorst, Simmons & Massey 2015** (raw, authors' PDF; citation confirmed by Crossref). Across five studies, people "more quickly lose confidence in algorithmic than human forecasters after seeing them make the same mistake". This held even among those who saw the algorithm outperform the human.
- **Independent replication: Prahl & Van Swol 2017**, *J. Forecasting* 36(6):691–702 (abstract via IDEAS/RePEc and a search index, summarised). Different authors and a different experiment found that "after receiving bad advice, utilization of automated advice decreased significantly more than advice from humans".
  - That abstract also says: "We do not replicate the finding that human advice is generally utilized more than automated advice."
  - So only the *after-an-error* asymmetry has two sources. A general preference for human advice does not, and the claim no longer says it.
- **Also seen, not counted:** beSpacific (3 Mar 2015) repeats the 2015 abstract word for word. It is a different publisher but has no independent content.

### Agent false success
- **[fact, C] Advani 2026**, arXiv 2606.09863 v1 (1 Jun 2026), FAGEN@ICML2026 (abstract, summarised):
  - 9,876 tau2-bench trajectories across 8 model families, and 1,879 AppWorld trajectories across 4 families.
  - False success was 45–48% of failures in single-control domains, 3% in dual-control telecom, and 75.8% of AppWorld self-assessing trajectories with explicit status claims.
  - No LLM-judge configuration exceeded AUROC 0.65 on tau2-bench (0.54 on AppWorld).
  - TF-IDF detectors reached AUROC 0.83 and 0.95.
- **ICML page:** gives the tau2-bench figures only: 9,876 trajectories, 45–48%, 3% and AUROC 0.65. It does not mention AppWorld or 75.8%. This explains the ≈10k vs ≈12k gap. The ICML page also does confirm the 45–48% and 3% figures, which corrects my round-2 note. It is the same author, so it adds no independence.
- **Not a replication:** Wang, Wang & Wu 2026 (arXiv 2609.08589, abstract) find that agents' progress reports are unreliable, mostly mid-task, but recover at completion. That is a related but different measure: it does not test false completion claims and does not cite Advani.

## Proposed library entries (revised)

```yaml
---
id: F-provenance-self-generated-01
form: fact
claim: "SLSA v1.0 build levels: at Build L1 provenance may be unsigned or self-generated and gives little tamper resistance (spec: 'trivial to bypass or forge'); at L2 the provenance is signed by a hosted/managed build platform, deterring simple tampering; at L3 the signing material must not be accessible to the user-defined build steps, so code in the build cannot forge its own provenance."
grade: B
topics: [trust, provenance, machine-summaries]
shelf_life: 36 months
sources:
  - https://slsa.dev/spec/v1.0/levels  # raw HTML confirmed by checker, round 2
  - https://github.blog/enterprise-software/devsecops/enhance-build-security-and-reach-slsa-level-3-with-github-artifact-attestations/  # summarised; GitHub, independent of the OpenSSF spec
  - https://socket.dev/glossary/supply-chain-levels-for-software-artifacts.md  # summarised; Socket, independent
note: "Spec only, not in the claim: 'Every field… MUST be generated or verified by the build platform in a trusted control plane' (slsa.dev/spec/v1.0/requirements). W3C PROV defines provenance as information about entities, activities and people involved in producing data, used to assess its quality, reliability or trustworthiness (PROV-Overview, PROV-DM: one spec; Wikipedia quotes it, which is tertiary). GitHub docs: artifact attestations alone = SLSA Build L2; reusable workflows give L3 isolation (same publisher as the blog)."
---
```
```yaml
---
id: F-algorithm-aversion-01
form: fact
claim: "After seeing an automated advisor err, people cut their reliance on it more than they cut reliance on a human advisor who erred: Dietvorst, Simmons & Massey 2015 (five studies; held even when the algorithm outperformed the human) and, independently, Prahl & Van Swol 2017 (utilization of automated advice fell significantly more than of human advice after bad advice). Prahl & Van Swol did not replicate a general preference for human advice."
grade: B
topics: [trust, machine-summaries]
shelf_life: 60 months
sources:
  - https://faculty.wharton.upenn.edu/wp-content/uploads/2016/11/20-Dietvorst-Simmons-Massey-2015.pdf  # read raw (round 1)
  - https://ideas.repec.org/a/wly/jforec/v36y2017i6p691-702.html  # summarised; J. Forecasting 36(6):691-702
  - https://api.crossref.org/works/10.1037/xge0000033  # citation details only
note: "Forecasting tasks, lab/online participants; distant from status records written by agents. The 'not replicated' sentence is from the Prahl & Van Swol abstract as given by a search index; IDEAS's summary did not repeat it — checker please confirm on the publisher page (doi 10.1002/for.2464)."
---
```
```yaml
---
id: F-agent-false-success-01
form: fact
claim: "Preprint (Advani 2026, arXiv 2606.09863, FAGEN@ICML2026), 9,876 tau2-bench and 1,879 AppWorld trajectories: LLM agents' false success (claiming completion when environment state shows otherwise) was 45–48% of failures in single-control tau2-bench domains, 3% in dual-control telecom, and 75.8% of AppWorld self-assessing trajectories with explicit status claims; no LLM-judge configuration exceeded AUROC 0.65 on tau2-bench (0.54 on AppWorld)."
grade: C
topics: [trust, machine-summaries, status-reports]
shelf_life: 12 months
sources:
  - https://arxiv.org/abs/2606.09863
  - https://icml.cc/virtual/2026/77904  # same author; tau2-bench figures only
note: "Single-author workshop preprint; no independent replication found (2609.08589 studies progress reporting, a different measure). File only under an owner waiver, or hold."
---
```

## Six-part contract

**1. What I changed.**
- **F-provenance-self-generated-01:** narrowed to the SLSA L1/L2/L3 points, with two independent publishers added (the GitHub blog and Socket.dev). The trusted-control-plane line and the PROV definition moved to the note.
- **F-algorithm-aversion-01:** added Prahl & Van Swol 2017 as an independent replication. The claim is narrowed to the after-an-error asymmetry, and it states the part that was not replicated.
- **F-agent-false-success-01:** settled the trajectory count. I also corrected my round-2 note, which wrongly said the ICML page does not confirm the figures. It stays at grade C and is still single-source.

**2. Why.** The source check filed none of these three. The SLSA and PROV pages each came from a single specification, which the vendor-behaviour rule doesn't cover. Dietvorst rested on the paper alone. Advani had a single author and a count that didn't match. Each fix either brings in an independent publisher or narrows the claim to what two sources actually say, rather than asking for the rule to be widened.

**3. What I verified** (tool calls and results):
- **arXiv 2606.09863 abstract:** 9,876 and 1,879 trajectories; v1 dated 1 Jun 2026.
- **ICML page:** 9,876 tau2-bench trajectories, 45–48%, 3% and AUROC 0.65; no AppWorld figures.
- **GitHub blog fetch:** the L1/L2/L3 wording, by Heidinger, 19 Dec 2024.
- **Socket.dev fetch:** the L1/L2/L3 wording, including the "MUST NOT be accessible" quote.
- **GitHub docs fetch:** attestations give L2; reusable workflows give L3.
- **IDEAS/RePEc fetch:** Prahl & Van Swol citation and abstract (bad advice cuts reliance on automation more).
- **Search snippet:** the "do not replicate… generally utilized more" sentence. IDEAS's summary left it out.
- **beSpacific fetch:** repeats the 2015 abstract. Not counted.
- **Wikipedia PROV fetch:** quotes the W3C definition with no specific citation. Not counted.
- **arXiv 2609.08589 abstract:** related work, not a replication.
- **Searches:** I found no independent replication of Advani.

**4. What is undone.**
- I have not read the Prahl & Van Swol full text, and the "not replicated" sentence needs confirming on the publisher page.
- Advani still has no independent support.
- Carried over from earlier rounds: an official Kemeny copy, the blackout final-report time, McGuirl & Sarter, Lee & See, Statuspage component states, and postmortem timeline conventions.

**5. What is needed outside my lane.**
- **Source checker:** re-check the three entries, and confirm the Prahl & Van Swol abstract at doi 10.1002/for.2464.
- **Chief of Staff:** ask the owner whether Advani may be filed at grade C under a waiver or should be held. The Dietvorst waiver should no longer be needed. Widening the rule to cover specifications should no longer be needed for the SLSA claim. It would still be needed if PROV is wanted as an entry of its own.
- No level-5 expert or paid source is needed.

**6. Open questions.**
- Is Socket.dev's glossary, dated October 2026, an acceptable independent secondary source, or does it need to be backed by the GitHub blog alone?
- Should the W3C PROV definition become a separate definitional entry under a rule for specifications, or stay as a note?
- Carried over: are the connected repositories public? And does anything outside GitHub expect a regular check-in from the sender or the Orchestrator?

Sources:
- [SLSA v1.0 levels](https://slsa.dev/spec/v1.0/levels)
- [SLSA v1.0 requirements](https://slsa.dev/spec/v1.0/requirements)
- [GitHub blog: reach SLSA Level 3 with artifact attestations](https://github.blog/enterprise-software/devsecops/enhance-build-security-and-reach-slsa-level-3-with-github-artifact-attestations/)
- [Socket.dev glossary: SLSA](https://socket.dev/glossary/supply-chain-levels-for-software-artifacts.md)
- [GitHub docs: artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations)
- [W3C PROV-Overview](https://www.w3.org/TR/prov-overview/)
- [W3C PROV-DM](https://www.w3.org/TR/prov-dm/)
- [Wikipedia: PROV (Provenance)](https://en.wikipedia.org/wiki/PROV_(Provenance))
- [Dietvorst et al. 2015](https://faculty.wharton.upenn.edu/wp-content/uploads/2016/11/20-Dietvorst-Simmons-Massey-2015.pdf)
- [Crossref record](https://api.crossref.org/works/10.1037/xge0000033)
- [Prahl & Van Swol 2017 (IDEAS/RePEc)](https://ideas.repec.org/a/wly/jforec/v36y2017i6p691-702.html)
- [beSpacific, 3 Mar 2015](https://www.bespacific.com/?p=44411)
- [Advani 2026, arXiv](https://arxiv.org/abs/2606.09863)
- [Advani 2026, ICML page](https://icml.cc/virtual/2026/77904)
- [Wang, Wang & Wu 2026, arXiv](https://arxiv.org/abs/2609.08589)