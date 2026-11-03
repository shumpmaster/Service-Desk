# Q-021 memo: errors in machine-written summaries, how they are caught, and how readers rely on them

**Researcher, 2026-11-03. Depth 3. For the Source checker.**

**How I read the sources.** Every source was read through a summarising fetch of its abstract or landing page, not the full text. No paywalled full text was read. Where only a secondary report could be opened, I say so.

**Grades used here.**
- **A:** several independent primary sources agree.
- **B:** one peer-reviewed primary source, abstract read.
- **C:** a preprint, a vendor's own claim, or a single non-peer-reviewed source.
- **D:** only a secondary report was read.

**Closeness to the owner's setting:**
- **near:** summaries of code changes or pull requests written by AI agents.
- **mid:** summaries of documents or code, or checking of code.
- **far:** news, headlines, books or medicine.

**Existing library entries.** None share this question's topics. P-stale-visible-01 (topics design, dashboards) touches part D and is noted there.

---

## A. How often machine-written summaries are wrong, leave things out, or add things

**A1. Fact, B, near (preprint; abstract read).** The study looked at 23,247 pull requests written by five coding agents, with 974 annotated by hand.
- 406 (1.7%) showed high inconsistency between the description and the code.
- The most common type (45.4%) was "descriptions claim unimplemented changes".
- High-inconsistency pull requests were accepted 28.3% of the time against 80.0%, and took 55.8 hours to merge against 16.0.
- Caveat: the 1.7% comes from a heuristic score screened over all the pull requests, not a full hand count. It is a floor for gross mismatch, not the rate of all errors.
- Source: arXiv 2601.04886.

**A2. Fact, C, near.** Xiao, Hata, Treude and Matsumoto (FSE 2024) studied 18,256 pull requests whose descriptions were partly written by Copilot for PRs.
- Those pull requests needed less review time and were more likely to be merged.
- Developers often added their own text to the generated descriptions.
- No accuracy rate is reported. This is an association, not a measure of accuracy, and the abstract was read through a summarising fetch.
- Source: arXiv 2402.08967.

**A3. Fact, C (vendor measurement), mid.** Vectara's leaderboard (updated 2026-10-22) uses its own detector model to measure how often a model adds something unsupported when summarising.
- Across about 7,700 articles of 50 to 24,000 words, rates run from 1.8% to 24.2% by model. Claude Opus 4 is listed at 10.9%.
- Vectara states that the leaderboard "does not measure summary quality or completeness".
- The detector is itself imperfect (see B1), and the figures move with every update.
- Source: github.com/vectara/hallucination-leaderboard.

**A4. Fact, B, far.** FABLES (COLM 2024) annotated 3,158 claims in machine summaries of 26 books, at a cost of $5.2K.
- Most unfaithful claims concerned events and the states of characters, and needed indirect reasoning to spot.
- All the models frequently left out key events, details and themes, and over-weighted the end of the book.
- Source: arXiv 2404.01261.

**A5. Fact, B, mid.** Belém et al. (NAACL Findings 2025) built two benchmarks for summarising several documents at once.
- On average, up to 75% of the content in the summaries was hallucinated, with more of it towards the end.
- When asked to summarise a topic that the documents do not cover, GPT-3.5-turbo and GPT-4o still produced summaries 79.45% and 44% of the time.
- Most errors came from not following instructions or from overly generic content. Simple post-hoc fixes were "only moderately effective".
- Source: aclanthology 2025.findings-naacl.293.

**A6. Fact, B, far.** Zhang et al. (TACL 2024) found that news summaries from instruction-tuned models were judged on a par with summaries written by freelance writers. Instruction tuning mattered more than model size. Source: aclanthology 2024.tacl-1.3.

**A7. Fact, B, far.** Van Veen et al. (Nature Medicine 2024) had ten physicians compare clinical summaries.
- The best adapted models' summaries were judged equivalent to experts' in 45% of cases and better in 36%.
- Both the models and the experts made errors that could cause harm.
- Source: arXiv 2309.07430.

**A8. Estimate, C.** Taken together, A1 to A7 suggest the error rate depends on the setting.
- **Rarer:** short, single sources (A3 at single-digit percentages for many models, A6 at parity with people).
- **More common:** long or multiple sources, summaries asked about things the source does not contain, and late parts of the output (A4, A5).
- **Omission is the least measured error.** The only places it is measured are FABLES, at book length, and a secondary report of one study at D (C5).
- No study measured agent-written summaries of changes across several projects for a single reader.

## B. What catches or reduces errors, and what it costs

**B1. Fact, A (two independent benchmarks agree).** Automatic checkers are weak on the hard cases.
- FaithBench: even the best detectors, including GPT-4o as a judge, were about 50% accurate on cases where detectors disagreed (arXiv 2410.13210).
- SummEdits (EMNLP 2023): most models were "close to random chance", and GPT-4 was 8% below human performance (aclanthology 2023.emnlp-main.600).
- FABLES: no automatic rater "correlates strongly with human annotations, especially with regard to detecting unfaithful claims" (A4).

**B2. Fact, B, mid.** A model that checks its own work is biased in its own favour.
- Panickssery et al. (NeurIPS 2024): models judging text score their own output higher, where human judges rate it equal. The bias grows with the model's ability to recognise its own text (arXiv 2404.13076).
- Saraf et al. (preprint, grade C): the model name attached to a text changed preference rankings by up to 50 percentage points (arXiv 2508.21164).

**B3. Fact, B, mid.** Huang et al. (ICLR 2024) found that, on reasoning tasks, models struggle to correct themselves without outside feedback, and "at times, their performance even degrades". This was not tested on summaries. Source: arXiv 2310.01798.

**B4. Fact, C (vendor research), mid.** CriticGPT (OpenAI, 2024) trained critic models to review code.
- The critics caught more bugs than paid human reviewers.
- The critics also made up bugs that "could mislead humans".
- Human-plus-critic teams caught about as many bugs as the critics alone, while making up fewer.
- Source: arXiv 2407.00215.

**B5. Fact, C (vendor guidance), mid.** Anthropic's documentation recommends several techniques:
- Extract word-for-word quotes before the task, for documents over 20k tokens.
- Cite a supporting quote for each claim, and retract any claim that has no quote.
- Run the same prompt several times and compare the outputs ("best-of-N").
- Restrict the model to the documents it was given.

The documentation states that these "don't eliminate" hallucinations and that critical information should still be validated. No error rates are given. Source: platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations.

**B6. Fact, B, mid.** Chain-of-Verification (ACL Findings 2024) has the model draft an answer, plan check questions, answer them independently, then revise. It reduced hallucinations on list questions, closed-book question answering and long-form text. Summaries of changes were not tested. Source: arXiv 2309.11495.

**B7. Fact, B (cost), far.** Human checking is expensive at length.
- FABLES paid $5.2K for 26 book summaries (A4).
- SummEdits says its method of building edited summaries is 20 times cheaper per sample than earlier benchmarks (B1).

No study gives a cost per summary for checking descriptions of code changes.

**B8. Opinion, C.** B1 to B4 point in one direction: a check by an independent party (a different model or a person, with the source to hand) is better supported than an author checking its own summary. No study tested this directly on summaries of changes.

## C. How readers rely on a summary depending on what it says about its origin or checking

**C1. Fact, B, far.** Altay and Gilardi (PNAS Nexus 2024) ran two preregistered experiments with 4,976 people.
- An "AI-generated" label lowered how accurate headlines seemed, whether they were true or false and whether a person or a model wrote them. The effect was 2.66 percentage points, against 9.33 for a "false" label.
- When the label was defined as light use of AI, the effect disappeared.
- Source: PMC11443540.

**C2. Fact, C, far.** Wang, Sturgis and de Kadt (preprint, n=3,861) found that an AI label lowered how accurate an article seemed, but had little wider effect. Making the AI use more salient reduced the penalty. Source: arXiv 2506.16202.

**C3. Fact, B, far.** Pennycook et al. (Management Science 2020; n=5,271 and 1,568) studied warning labels on some headlines.
- Warnings on some headlines made untagged headlines seem more accurate: the "implied truth effect".
- Marking some true headlines as verified removed the effect and slightly reversed it.
- Source: dspace.mit.edu 1721.1/130380.
- Relevance: if only some summaries carry a mark, readers may read the absence of a mark as a sign the summary was checked.

**C4. Fact, B, mid.** Kim et al. (FAccT 2024, n=404, preregistered) found that first-person uncertainty ("I'm not sure, but…") reduced agreement with wrong answers and raised accuracy. General wording ("It's not clear…") had weaker effects that were not significant. The exact wording matters. Source: arXiv 2405.00623.

**C5. Fact, B, mid.** Several studies find that readers rely on output that is wrong, and that some aids work while others backfire.
- **Overreliance on errors.** Spatharioti et al. (preprint, grade C): people using a model-based search tool relied too much on its errors. Highlighting likely-wrong content by confidence "substantially increases" how often errors are spotted (arXiv 2307.03744).
- **Explanations that backfire.** Bansal et al. (CHI 2021): explanations made people more likely to accept the AI's answer whether or not it was right (arXiv 2006.14779; landing page only).
- **What helps checking.** Irons et al. (preprint 2026, grade C): showing the retrieved source passages supported checking about as well as the full source. Model-written explanations made people less likely to catch errors (arXiv 2603.11393).
- **Forcing reflection did not help.** Kelch (ICIS 2026, n=280): a 20-second delay, notes made before reading the source, and a checklist did not detectably improve error detection (d = −0.033). 51.3% of checklist flags tied to an error were not followed by a correction (aisel icis2026 …/24).
- **Errors distort memory (grade D).** Sim, Eiger and Kohno (AIES 2026): after a misleading AI summary, 44.8% recalled a detail correctly, against 83.6% after an accurate one. Most summaries left out the central event. Only secondary reports were read: the AAAI page returned an error.

**C6. Fact, C, far.** Valenzuela et al. (Digital Journalism 2026, conjoint experiment) found that outlets requiring human review of all AI content were rated more credible. Zier and Diakopoulos (interviews) found that audiences tell "AI-generated" apart from "AI-assisted", and that labels can prompt "I probably need to fact-check this". Only the Nieman Lab secondary report was read.

**C7. Estimate, C.** No study found tests marks on a single expert reader's own summaries of work from agents they direct. The evidence is mostly from crowd workers judging news.
- It suggests that a bare "AI-generated" mark lowers trust a little, and that a definition changes its effect (C1, C2).
- Marking only some items can make unmarked ones look checked (C3).
- A "reviewed" mark raises credibility (C6). No study measured whether that is warranted.
- How exactly uncertainty is worded changes reliance (C4).
- How much this transfers to the owner's setting is unknown.

## D. Summaries that go out of date

**D1. Fact, B, mid.** Studies of comments and documentation that fall behind the code:
- Radmanesh et al. (preprint, grade C): changes that leave comments inconsistent with the code are about 1.5 times more likely to introduce a bug. The effect is strongest right after the mismatch appears (arXiv 2409.10781).
- Tan, Wagner and Treude: most of 3,000+ GitHub projects had at least one documentation reference to code that no longer existed at some point (arXiv 2212.01479).
- Wen et al. (ICPC 2019) studied how code and comments change together across 1,500 Java projects. Only the bibliography page was read; the PDF returned 403.
- Aghajani et al. (ICSE 2019): one secondary report puts up-to-dateness at 39% of documentation content issues. Unopened (the PDF could not be read), so not proposed for the library.

**D2. Fact, C, mid.** Automatic detectors exist. CoCC reports over 90% precision in flagging comments made outdated by a code change (arXiv 2403.00251).

**D3. Gap.** I found no study of how readers notice that a summary is out of date. The nearest is design guidance (library P-stale-visible-01: show when it was last updated), which gives guidance but no evidence about readers.

## E. Strength of evidence and closeness to the owner's setting, in brief

| Topic | Strength | Closeness |
|---|---|---|
| Error rates | Moderate | One near study (A1, preprint); the rest mid or far |
| Automatic checkers are weak | Strong | Mid |
| Self-checking is biased | Moderate | Mid |
| Effects of marks | Moderate | Far: news, crowd workers |
| Staleness | Moderate on how common it is; none on how readers notice | Mid |

Overall, the evidence leaves open the error rate for this owner's own setting and the effect of a mark on one expert reader. A cheap trial on the owner's own repositories would settle the error rate (see question 1 below).

---

## Proposed library entries (fact and pattern forms; for the Source checker)

```
---
id: F-sum-agent-pr-mci-01
form: fact
claim: "Of 23,247 PRs by five coding agents, 406 (1.7%) had high PR message–code inconsistency (heuristic screen; 974 hand-annotated); 'descriptions claim unimplemented changes' was 45.4% of types; high-inconsistency PRs were accepted 28.3% vs 80.0% and took 55.8 vs 16.0 hours to merge."
grade: C
topics: [summaries, machine-summaries, accuracy]
shelf_life: 12 months
sources: [https://arxiv.org/abs/2601.04886]
opened_by: researcher (Q-021), abstract via summarising fetch
---
```
```
---
id: F-sum-detectors-weak-01
form: fact
claim: "Automatic faithfulness checkers are unreliable on hard cases: best detectors ~50% accurate on FaithBench; most LLMs near chance on SummEdits, GPT-4 8% below humans; no auto-rater correlates strongly with humans on unfaithful claims in FABLES."
grade: A
topics: [machine-summaries, accuracy]
shelf_life: 12 months
sources: [https://arxiv.org/abs/2410.13210, https://aclanthology.org/2023.emnlp-main.600, https://arxiv.org/abs/2404.01261]
---
```
```
---
id: F-sum-self-preference-01
form: fact
claim: "LLM evaluators score their own outputs higher than humans do, linearly with self-recognition ability (Panickssery et al., NeurIPS 2024); intrinsic self-correction without external feedback can degrade reasoning answers (Huang et al., ICLR 2024)."
grade: B
topics: [machine-summaries, accuracy]
shelf_life: 18 months
sources: [https://arxiv.org/abs/2404.13076, https://arxiv.org/abs/2310.01798]
---
```
```
---
id: F-sum-vectara-01
form: fact
claim: "Vendor leaderboard (Vectara, HHEM, updated 2026-10-22): summary hallucination rates 1.8%–24.2% by model on ~7,700 articles of 50–24k words; does not measure completeness."
grade: C (vendor claim)
topics: [machine-summaries, accuracy]
shelf_life: 3 months
sources: [https://github.com/vectara/hallucination-leaderboard]
---
```
```
---
id: F-sum-long-multi-01
form: fact
claim: "Errors rise with length and number of sources: book-length summaries frequently omit key events and over-weight endings (FABLES); in multi-document summaries up to 75% of content was hallucinated on average, and GPT-4o summarised a non-existent topic 44% of the time."
grade: B
topics: [machine-summaries, accuracy]
shelf_life: 12 months
sources: [https://arxiv.org/abs/2404.01261, https://aclanthology.org/2025.findings-naacl.293/]
---
```
```
---
id: F-trust-ai-label-01
form: fact
claim: "An 'AI-generated' label lowers perceived accuracy of headlines regardless of truth or true authorship (−2.66 pp vs −9.33 pp for a 'false' label; n=4,976); defining the label as light AI use removed the effect."
grade: B
topics: [trust, machine-summaries]
shelf_life: 24 months
sources: [https://pmc.ncbi.nlm.nih.gov/articles/PMC11443540, https://arxiv.org/abs/2506.16202]
---
```
```
---
id: F-trust-implied-truth-01
form: fact
claim: "Warning tags on a subset of headlines make untagged ones seem more accurate (implied truth effect); also tagging some true items as verified removes it (Pennycook et al., Management Science 2020)."
grade: B
topics: [trust]
shelf_life: 36 months
sources: [https://dspace.mit.edu/handle/1721.1/130380]
---
```
```
---
id: F-trust-uncertainty-wording-01
form: fact
claim: "First-person uncertainty ('I'm not sure, but…') reduced agreement with an LLM and raised user accuracy (n=404, preregistered); general-perspective wording had weaker, non-significant effects."
grade: B
topics: [trust]
shelf_life: 24 months
sources: [https://arxiv.org/abs/2405.00623]
---
```
```
---
id: F-trust-checking-aids-01
form: fact
claim: "Retrieved source passages supported checking about as well as full source text, while LLM explanations reduced error detection (Irons et al. 2026, preprint); explanations raised acceptance of AI answers regardless of correctness (Bansal et al., CHI 2021); delay/notes/checklist did not improve error detection in summaries (Kelch, ICIS 2026, n=280)."
grade: C
topics: [trust, accuracy]
shelf_life: 18 months
sources: [https://arxiv.org/abs/2603.11393, https://arxiv.org/abs/2006.14779, https://aisel.aisnet.org/icis2026/user_engage/user_engage/24]
---
```
```
---
id: P-sum-independent-grounded-check-01
form: pattern
claim: "Check machine summaries with a party other than the author and with the source passages at hand. Evidence: self-preference (Panickssery 2024), weak intrinsic self-correction (Huang 2024), human+critic teams hallucinate less than critics alone (CriticGPT 2024, vendor), retrieved passages aid human checking (Irons 2026). Not tested directly on change summaries."
grade: C
topics: [machine-summaries, accuracy]
shelf_life: 12 months
sources: [https://arxiv.org/abs/2404.13076, https://arxiv.org/abs/2310.01798, https://arxiv.org/abs/2407.00215, https://arxiv.org/abs/2603.11393]
---
```

**Not proposed for the library:**
- Sim et al. on memory distortion (C5): only secondary reports read.
- Valenzuela and Zier on news labels (C6): only secondary reports read.
- Aghajani's 39% (D1): unopened.
- Wen 2019 (D1): only the bibliography page read.

## New research questions I'm adding (none closed)

1. On the owner's own repositories, how often is an agent's account of a change wrong, missing something important, or claiming changes that were not made, judged against the diff? How does that differ when the summary is written by the agent that made the change and when it is written by a separate reader? Answered by experiment (E), depth 3.
2. For a single expert reader, does marking only some summaries as checked change how closely the unmarked ones are checked? Answered by research and experiment (R/E).
3. How do readers notice that a summary describes an older state of the code? Little research found; answered by research and experiment (R/E).

---

## Six-part return

1. **What I changed:** No files; I have no write tool. The memo above is for the Orchestrator to record verbatim in research/, and the proposed entries are for the Source checker.
2. **Why:** Q-021 asks for a graded memo at depth 3 on how often machine summaries are wrong, how errors are caught, how readers rely on marked summaries, and staleness.
3. **What I verified:** I have no shell, so I ran no commands. I opened about 30 sources through web search and fetch.
   - Most abstracts or pages were read through a summarising fetch.
   - Failures: the AAAI paper page returned "Access Denied"; the Wen 2019 PDF returned 403; the Aghajani PDF could not be read.
   - The library had no entries sharing this question's topics.
4. **What is undone:**
   - No full texts were read.
   - Omission rates on short inputs and on code changes are unmeasured.
   - No study measured the cost per summary of checking a change summary.
   - No study on how readers notice a stale summary was found.
   - Automation-bias reviews (for example Parasuraman and Manzey) were not opened, so they are not cited.
5. **What is needed outside my lane:**
   - The Source checker should check the proposed entries. A1 (preprint, nearest setting) and C5 (several preprints) carry the most risk.
   - The Chief of Staff may want to put the trial in new research question 1 to the owner. Paywalled full texts (Digital Journalism, ICSE) would need a decision card.
6. **Open questions:**
   - How well does evidence from crowd workers judging headlines transfer to one expert owner?
   - Does a "checked" mark carry an implied-truth risk when only some items carry it?
   - Is the 1.7% gross-mismatch rate in agent pull requests a floor, and how far off is the true rate?

Sources:
- [arXiv 2601.04886](https://arxiv.org/abs/2601.04886v2)
- [arXiv 2402.08967](https://arxiv.org/abs/2402.08967)
- [Vectara leaderboard](https://github.com/vectara/hallucination-leaderboard)
- [FABLES](https://arxiv.org/abs/2404.01261v2)
- [Belém et al.](https://aclanthology.org/2025.findings-naacl.293/)
- [Zhang et al. TACL](https://aclanthology.org/2024.tacl-1.3)
- [Van Veen et al.](https://arxiv.org/abs/2309.07430v5)
- [FaithBench](https://arxiv.org/abs/2410.13210)
- [SummEdits](https://aclanthology.org/2023.emnlp-main.600)
- [Panickssery et al.](https://arxiv.org/abs/2404.13076)
- [Saraf et al.](https://arxiv.org/abs/2508.21164)
- [Huang et al.](https://arxiv.org/abs/2310.01798)
- [CriticGPT](https://arxiv.org/abs/2407.00215)
- [Anthropic: reduce hallucinations](https://platform.claude.com/docs/claude/docs/minimizing-hallucinations)
- [Chain-of-Verification](https://arxiv.org/abs/2309.11495)
- [Altay & Gilardi](https://pmc.ncbi.nlm.nih.gov/articles/PMC11443540)
- [Wang, Sturgis & de Kadt](https://arxiv.org/abs/2506.16202)
- [Pennycook et al.](https://dspace.mit.edu/handle/1721.1/130380)
- [Kim et al.](https://arxiv.org/abs/2405.00623)
- [Spatharioti et al.](https://arxiv.org/abs/2307.03744)
- [Bansal et al.](https://arxiv.org/abs/2006.14779v2)
- [Irons et al.](https://arxiv.org/abs/2603.11393)
- [Kelch, ICIS 2026](https://aisel.aisnet.org/icis2026/user_engage/user_engage/24)
- [MIT Media Lab report](https://www.media.mit.edu/articles/ai-can-rewrite-your-memories-and-you-may-never-notice/)
- [Nieman Lab](https://niemanlab.org/2026/06/how-should-news-organizations-label-their-ai-use-for-audiences-new-studies-suggest-some-answers)
- [Radmanesh et al.](https://arxiv.org/abs/2409.10781)
- [Tan, Wagner & Treude](https://arxiv.org/abs/2212.01479)
- [Wen et al. bibliography](https://bibtex.github.io/ICPC-2019-WenNBL.html)
- [CoCC](https://arxiv.org/abs/2403.00251)