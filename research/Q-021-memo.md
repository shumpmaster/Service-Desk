I've revised the memo below. The checker was right about the Opus 4 figure. One A5 wording question and one FABLES quote question need someone to look again, because my re-reads disagree with the checker's reads.

---

# Q-021 memo, revision 2: errors in machine-written summaries, how they are caught, and how readers rely on them

**Researcher, 2026-11-03. Depth 3. For the Source checker. This replaces revision 1 (research/Q-021-memo.md).**

**How I read the sources.** I read every source through a summarising fetch of its abstract or landing page. I read no full texts. Where only a search summary or a secondary report could be opened, the item is graded D and I say so. In this revision I re-opened every source that research/Q-021-source-check.md flagged, plus the ones it listed as not opened.

**Grades** (unchanged; now applied per item, not per group):
- **A:** several independent primary sources agree.
- **B:** one peer-reviewed primary source, abstract read.
- **C:** a preprint, a vendor's own claim, or one non-peer-reviewed source.
- **D:** only a secondary report or a search summary was read.

**Closeness to the owner's setting:**
- **near:** summaries of code changes or pull requests written by AI agents.
- **mid:** summaries of documents or code, or checking of code.
- **far:** news, headlines, books or medicine.

**Existing library entries on these topics:** F-sum-detectors-weak-01, F-sum-self-preference-01, F-sum-long-multi-01, F-trust-ai-label-01 and P-sum-independent-grounded-check-01 (all filed after round 1), plus P-stale-visible-01.

---

## A. How often summaries are wrong, leave things out, or add things

**A1. Fact, B, near.** Gong, Pinna, Bian and Zhang studied pull requests written by coding agents. The paper was accepted to the MSR 2026 Mining Challenge track and shown as a poster.
- It covers 23,247 pull requests from five agents, 974 of them annotated by hand.
- 406 (1.7%) had high inconsistency between the description and the code.
- The most common type (45.4%) was "descriptions claim unimplemented changes".
- High-inconsistency pull requests were accepted 28.3% of the time against 80.0%, and took 55.8 hours to merge against 16.0.
- Caveat: the 1.7% comes from a heuristic screen, not a full hand count. It is a floor for gross mismatch.
- Sources: arXiv 2601.04886; MSR 2026 programme page.
- *Change:* revision 1 called this a preprint and graded it B in the text but C in the entry. The programme page shows it is peer-reviewed, so the grade is B in both places. It is still the only source in the near setting. An extended search found no second study measuring description accuracy. arXiv 2605.02273 studies who reviews agent pull requests, not description accuracy.

**A2. Fact, B, near.** Xiao, Hata, Treude and Matsumoto (Proc. ACM Softw. Eng. 1(FSE), 2024, pp. 1043–1065) studied 18,256 pull requests whose descriptions were partly written by Copilot for PRs.
- Those pull requests "require less review time and have a higher likelihood of being merged".
- Developers "complement the automated descriptions with their manual input".
- No accuracy rate is reported. This is an association only.
- Sources: arXiv 2402.08967; the venue is confirmed by the FSE 2024 programme page.
- *Change:* now opened. The grade moves from C to B because the paper is peer-reviewed.

**A3. Fact, C (vendor measurement), mid.** Vectara's leaderboard was last updated on 2026-10-22.
- It covers "over 7700 articles", from 50 to 24,000 words.
- Rates run from 1.8% to 24.2% by model.
- **Claude Opus 4 is listed at 12.0%.** Other Claude models range from 9.8% (Haiku 4.5) to 12.2% (Opus 4.6).
- Vectara says it is "not evaluating the quality of the summaries, only the factual consistency of them".
- Figures move with every update.
- Source: github.com/vectara/hallucination-leaderboard.
- *Change:* 10.9% was wrong and is now 12.0%. The quote is now the wording I saw in this fetch. My earlier phrase "or completeness" did not appear in it.

**A4. Fact, B, far.** FABLES (COLM 2024) annotated 3,158 claims in machine summaries of 26 books, at a cost of $5.2K.
- Most unfaithful claims concerned events and the states of characters.
- All the models frequently left out key events, details and themes, and over-weighted the end of the book.
- Source: arXiv 2404.01261.

**A5. Fact, B, mid.** Belém et al. (NAACL Findings 2025) studied summaries of several documents at once.
- Up to 75% of the content in the summaries was hallucinated.
- When asked about a topic the documents do not cover, GPT-3.5-turbo and GPT-4o still produced summaries 79.45% and 44% of the time.
- Source: aclanthology 2025.findings-naacl.293.
- *Note for the checker:* I adopted your wording, "up to 75%". However, my re-fetch on 2026-11-03 returned the quote "on average, up to 75% of the content in LLM-generated summary is hallucinated". Our two summarising fetches disagree, so a direct read of the abstract should settle it. The filed wording is the weaker of the two and is safe either way.

**A6. Fact, B, far.** Zhang, Ladhak, Durmus, Liang, McKeown and Hashimoto (TACL 12, 2024) found that "LLM summaries are judged to be on par with human written summaries" written by freelance writers. They also found that "instruction tuning, not model size, is the key". Source: aclanthology 2024.tacl-1.3. *Now opened.*

**A7. Fact, B, far.** Van Veen et al. (Nature Medicine 2024) ran a reader study with ten physicians.
- The best adapted models' summaries were "equivalent (45%) or superior (36%)" to those of medical experts.
- "The ensuing safety analysis highlights challenges faced by both LLMs and medical experts, as we connect errors to potential medical harm and categorize types of fabricated information."
- Source: arXiv 2309.07430. The Nature page redirected to a login.
- *Now opened.* Revision 1 said both groups made "errors that could cause harm". The abstract supports only "challenges faced by both", with errors linked to potential harm. I have reworded the item to match.

**A8. Estimate, C.** Errors look rarer for short, single sources (A3, A6). They look more common for long or multiple sources, for topics the source does not cover, and late in the output (A4, A5).
- Omission is the least measured error. It is measured only in FABLES (books) and Sim et al. (C5, grade D).
- No study measured agent-written summaries of changes across several projects for one reader.

## B. What catches or reduces errors, and what it costs

**B1. Fact, A.** Automatic checkers are weak on hard cases.
- **FaithBench:** the best detectors were about 50% accurate (arXiv 2410.13210).
- **SummEdits:** most models were "close to random chance", and GPT-4 was 8% below humans (EMNLP 2023; arXiv 2305.14540).
- **FABLES:** my re-fetch returned "we implement several LLM raters of faithfulness and find that none correlates strongly with human annotations, especially with regard to detecting unfaithful claims". The checker's fetch summarised this as "weak correlation". The two are consistent, but the verbatim wording should be confirmed by a direct read.

**B2. Self-checking is biased.**
- **Panickssery et al. (NeurIPS 2024), B, mid:** models judging text score their own output higher, and the bias grows with how well they recognise their own text (arXiv 2404.13076).
- **Saraf et al. (preprint, last revised 2025-10-09), C, mid.**
  - ChatGPT, Gemini and Claude judged blog posts written by each other, under true, false and no attribution.
  - "False attribution frequently reversed preference rankings, producing shifts of up to 50 percentage points in voting outcomes and up to 12 percentage points in quality ratings."
  - The "Claude" label raised scores whoever wrote the text, and Claude showed "intensified self-preference" (arXiv 2508.21164).
- *Change:* Saraf is now opened. The claim is reworded to "false attribution", which is what the abstract says, instead of "the model name".

**B3. Fact, B, mid.** Huang et al. (ICLR 2024) found that models struggle to correct their own reasoning without outside feedback. This was not tested on summaries (arXiv 2310.01798).

**B4. Fact, C (vendor research), mid.** CriticGPT (OpenAI, 2024) trained critic models to review code (arXiv 2407.00215).
- The critics caught more bugs than paid human reviewers, but also made up bugs.
- Human-plus-critic teams made up fewer bugs than the critics alone.

**B5. Fact, C (vendor guidance), mid.** Anthropic's guide "Reduce hallucinations" recommends:
- letting the model say "I don't know";
- for documents over 20k tokens, extracting word-for-word quotes first;
- "Verify with citations": the model finds a supporting quote for each claim, and "if it can't find a quote, it must retract the claim";
- running the same prompt several times and comparing the outputs ("best-of-N"), reviewing the model's summarised reasoning ("chain-of-thought verification"), refining iteratively, and restricting the model to the documents it was given.

The guide says: "although these techniques significantly reduce hallucinations, they don't eliminate them entirely. Always validate critical information." It gives no error rates.
- **Single URL:** platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations.
- *Change:* now opened. The mismatched URL in the source list is fixed.

**B6. Fact, B, mid.** Dhuliawala et al. (Findings of ACL 2024, pp. 3563–3578) tested Chain-of-Verification.
- The model drafts an answer, plans check questions, answers them "independently so the answers are not biased by other responses", then revises.
- This reduced hallucinations on Wikidata list questions, closed-book MultiSpanQA and long-form text. Summaries were not tested.
- Sources: arXiv 2309.11495; aclanthology 2024.findings-acl.212.
- *Change:* now opened. The venue was confirmed by search result.

**B7. Fact, B (cost), far.** FABLES paid $5.2K for 26 book summaries. SummEdits reports that its method costs 20 times less per sample than earlier ones. No study gives a cost per summary for checking descriptions of code changes.

**B8. Opinion, C.** B1 to B4 favour a check by an independent party with the source to hand over the author checking itself. This has not been tested directly on summaries of changes.

## C. How readers rely on a summary depending on what it says about its origin or checking

**C1. Fact, B, far.** Altay and Gilardi (PNAS Nexus 2024) ran two preregistered experiments with **n = 4,976**.
- An "AI-generated" label lowered how accurate headlines seemed, whether they were true or false. The effect was 2.66 percentage points, against 9.33 for a "false" label.
- The aversion disappeared when people were told the AI only improved clarity or wrote first drafts. It persisted when they believed the AI had "entirely written" the content.
- Source: academic.oup.com/pnasnexus/article/3/10/pgae403/7795946.
- *Change:* the OUP page confirmed n = 4,976. I reworded "light use" to match the page.

**C2. Fact, C, far.** Wang, Sturgis and de Kadt (preprint, n = 3,861): an AI label lowered how accurate an article seemed, and making the AI use more salient reduced the penalty (arXiv 2506.16202).

**C3. Fact, B, far.** Pennycook et al. (Management Science 2020) found the "implied truth effect": warnings on some headlines made untagged ones seem more accurate. Tagging true headlines as verified removed the effect (dspace.mit.edu 1721.1/130380).

**C4. Fact, B, mid.** Kim et al. (FAccT 2024, n = 404): first-person uncertainty ("I'm not sure, but…") reduced overreliance. General wording had weaker effects that were not significant (arXiv 2405.00623).

**C5. Reliance on wrong output** (graded per item):
- **Spatharioti, Rothschild, Goldstein and Hofman (preprint, C, mid).** They "observed overreliance on incorrect information when the LLM erred". "Confidence-based highlighting substantially increases the rate at which users spot incorrect information" (arXiv 2307.03744). *Now opened.*
- **Bansal et al. (CHI 2021, B, mid).** Explanations raised acceptance of the AI's answer whether or not it was right (arXiv 2006.14779).
- **Irons et al. (preprint 2026, C, mid).** Retrieved source passages supported checking about as well as the full source. Model explanations reduced error detection (arXiv 2603.11393).
- **Kelch (ICIS 2026, n = 280, B, mid).** A delay, notes and a checklist did not improve error detection (d = −0.033). 51.3% of checklist flags tied to an error were not followed by a correction.
- **Sim, Eiger and Kohno (AIES 2026), D.**
  - After a misleading summary, 44.8% answered correctly, against 83.6% after an accurate one.
  - Across prompts and models, the summaries omitted 51.6% of central details on average.
  - Read through a search summary of news reports (The National, News-Medical, MIT Media Lab). The AAAI page (ojs.aaai.org …/43310) returned "Access Denied" again.
  - *Change:* revision 1 said "most summaries left out the central event". That is replaced with the 51.6% figure, which is still at grade D.

**C6. Fact, D, far** (was wrongly graded C; only a secondary source was read). Nieman Lab (June 2026) reports two studies:
- **Valenzuela et al.** (Digital Journalism, conjoint experiment): "human review was the most influential factor considered". Outlets requiring it "were seen as more credible".
- **Zier and Diakopoulos** (interviews): readers distinguish "generated" from "assisted". One said: "I probably need to fact-check this".

**C7. Estimate, C.** No study tests marks on a single expert reader's summaries of their own agents' work. The evidence comes from crowd workers judging news. It suggests:
- a bare AI mark lowers trust slightly, and defining the mark changes its effect (C1, C2);
- marking only some items can make the unmarked ones look checked (C3);
- a "reviewed" mark raises credibility, though whether that is warranted is untested (C6, D);
- the exact wording of uncertainty matters (C4).

## D. Summaries that go out of date

**D1. Studies of comments and documentation that fall behind the code** (graded per item):
- **Radmanesh, Imani, Ahmed and Moshirpour (preprint, C).** Changes that leave comments inconsistent with the code are "around 1.5 times more likely" to lead to a bug-introducing commit. The effect is "highest immediately after the inconsistency is introduced" (arXiv 2409.10781).
- **Tan, Wagner and Treude (arXiv, C).** Of "over 3,000 GitHub projects", "most projects contain at least one outdated code element reference at some point in their history" (arXiv 2212.01479).
- **Wen, Nagy, Bavota and Lanza (ICPC 2019), D.** The authors call it the largest study of how code and comments change together, mining the full history of 1,500 Java projects. The figure comes from a search summary of the authors' PDF, which returned 403.
- **Aghajani et al. (ICSE 2019), D.** They built a taxonomy from 878 documentation artifacts, and it includes outdated or obsolete content. **Revision 1's figure of 39% is withdrawn.** I could not find it in any page I opened, and Never Work in Theory's review gives no percentage.

**D2. Fact, C, mid.** Huang, Chen, Chen and Zhou (preprint) describe CoCC, which "can effectively detect outdated comments with precision over 90%" (arXiv 2403.00251). *Now opened.*

**D3. Gap.** I found no study of how readers notice that a summary is out of date. The nearest is P-stale-visible-01, which is design guidance.

## E. Strength of evidence

| Topic | Strength | Closeness |
|---|---|---|
| Error rates | Moderate | Near: A1 (B) and A2 (B, no accuracy rate) |
| Automatic checkers are weak | Strong (A) | Mid |
| Self-checking is biased | Moderate | Mid |
| Effects of marks | Moderate | Far |
| Staleness | Moderate on how common it is; none on how readers notice | Mid |

---

## Proposed library entries (new or re-proposed; already-filed entries are not repeated)

```
---
id: F-sum-agent-pr-mci-01
form: fact
claim: "Of 23,247 PRs by five coding agents, 406 (1.7%) had high PR message–code inconsistency (heuristic screen; 974 hand-annotated); 'descriptions claim unimplemented changes' was 45.4% of types; high-inconsistency PRs were accepted 28.3% vs 80.0% and took 55.8 vs 16.0 hours to merge."
grade: B (single peer-reviewed source, MSR 2026 Mining Challenge)
topics: [summaries, machine-summaries, accuracy]
shelf_life: 12 months
sources: [https://arxiv.org/abs/2601.04886, https://2026.msrconf.org/details/msr-2026-mining-challenge/23/Analyzing-Message-Code-Inconsistency-in-AI-Coding-Agent-Authored-Pull-Requests]
note: single source; no second near-setting study found (extended search 2026-11-03)
---
```
```
---
id: F-sum-copilot-pr-desc-01
form: fact
claim: "18,256 PRs with Copilot-for-PRs-generated description parts needed less review time and were more likely to be merged; developers often added their own text. No accuracy measured (Xiao et al., FSE 2024)."
grade: B
topics: [summaries, machine-summaries]
shelf_life: 24 months
sources: [https://arxiv.org/abs/2402.08967, https://2024.esec-fse.org/details/fse-2024-research-papers/105/Generative-AI-for-Pull-Request-Descriptions-Adoption-Impact-and-Developer-Interven]
---
```
```
---
id: F-sum-vectara-01
form: fact
claim: "Vendor leaderboard (Vectara HHEM, updated 2026-10-22): summary hallucination rates 1.8%–24.2% by model on over 7,700 articles of 50–24,000 words; Claude Opus 4 at 12.0%; measures factual consistency only, not summary quality."
grade: C (vendor claim)
topics: [machine-summaries, accuracy]
shelf_life: 3 months
sources: [https://github.com/vectara/hallucination-leaderboard]
---
```
```
---
id: F-doc-stale-code-comments-01
form: fact
claim: "Docs and comments drift from code: changes leaving comments inconsistent are ~1.5x more likely to lead to a bug-introducing commit, highest right after the drift (Radmanesh et al., preprint); most of 3,000+ GitHub projects had at least one outdated code reference in docs at some point (Tan et al., preprint); a detector (CoCC) reports >90% precision on outdated comments (preprint)."
grade: C (three preprints, independent)
topics: [summaries, accuracy]
shelf_life: 24 months
sources: [https://arxiv.org/abs/2409.10781, https://arxiv.org/abs/2212.01479, https://arxiv.org/abs/2403.00251]
---
```

F-trust-implied-truth-01, F-trust-uncertainty-wording-01 and F-trust-checking-aids-01 are re-proposed unchanged from revision 1. I found no second source for any of them.

**Not proposed:** Sim et al. (D), Valenzuela and Zier (D), Wen (D), Aghajani (D, 39% withdrawn), Saraf (a single preprint that only supports the filed self-preference entry).

## New research questions (none closed)
Unchanged from revision 1 (questions 1 to 3).

---

## Six-part return

### 1. What I changed
The memo above replaces revision 1:
- **A3:** Opus 4 is now 12.0%, not 10.9%. The quote now uses the page's wording.
- **A5:** now says "up to 75%".
- **A1:** the venue is now MSR 2026 Mining Challenge, and the grade is B in both the text and the entry.
- **A2:** the venue is confirmed and the grade rises from C to B.
- **A7:** the wording on harm is narrowed to what the abstract says.
- **B2:** Saraf's claim is reworded to "false attribution", which is what the abstract says.
- **B5:** the URL is unified.
- **C1:** now cites the OUP source with n = 4,976, and the wording on how the label was defined is tightened.
- **C5:** Sim's omission claim is replaced with the 51.6% figure (still D).
- **C6:** regraded from C to D.
- **D1:** Aghajani's 39% is withdrawn. Wen and Aghajani are graded D.
- **Grades:** now set per item, not per group.
- **Library entries:** two new ones proposed (F-sum-copilot-pr-desc-01, F-doc-stale-code-comments-01), and F-sum-vectara-01 corrected.

### 2. Why
research/Q-021-source-check.md found:
- one wrong figure;
- one reworded claim;
- a grade that did not match between the text and the entry;
- a URL that did not match between the text and the source list;
- 13 items it did not open.

I re-opened all of them, so that whatever stays in the memo has a source someone actually read.

### 3. What I verified
I have no shell, so I ran no commands. All checks were web fetches and searches on 2026-11-03:
- **Vectara:** shows 12.0% for Opus 4. The range 1.8–24.2% is confirmed.
- **Belém:** the fetch returned "on average, up to 75%", which conflicts with the checker's read.
- **FABLES:** the fetch returned "none correlates strongly…", which differs from the checker's "weak correlation".
- **Opened for the first time, all confirmed as now worded:** Saraf, Xiao (plus the FSE programme page), Zhang (TACL), Van Veen (arXiv; Nature redirected to a login), Chain-of-Verification (arXiv, plus the ACL venue by search), the Anthropic guide, Spatharioti, Radmanesh, Tan, CoCC, and Nieman Lab.
- **Altay and Gilardi:** the OUP page gives n = 4,976.
- **A1:** the MSR 2026 page confirms acceptance.
- **Failures:**
  - The AAAI/AIES page was blocked again ("Access Denied").
  - The Wen PDF returned 403.
  - Never Work in Theory gives no percentage for Aghajani.
  - arXiv 2605.02273 was checked as a possible second near-setting source and did not qualify.

### 4. What is undone
- I read no full texts.
- I did not search for second sources for the implied-truth, uncertainty-wording or checking-aids entries.
- The Sim, Wen and Aghajani primary pages are still unread.
- The disagreements over the Belém and FABLES quotes are unresolved.

### 5. What is needed outside my lane
- **Source checker:** please check the Belém and FABLES abstracts directly, check the four entries proposed above, and decide on single-source entries.
- **Chief of Staff:** a decision card if the full texts are wanted (Digital Journalism, AIES, and the Aghajani PDF).

### 6. Open questions
- Should single-source, peer-reviewed entries in the near setting (A1) be filed with a "single source" mark rather than held back? It is the only evidence for the owner's own setting.
- Is the 1.7% gross-mismatch rate a floor, and how far off is the true rate?
- How well do findings from crowd workers transfer to one expert owner?

Sources:
- [arXiv 2601.04886](https://arxiv.org/abs/2601.04886) · [MSR 2026 page](https://2026.msrconf.org/details/msr-2026-mining-challenge/23/Analyzing-Message-Code-Inconsistency-in-AI-Coding-Agent-Authored-Pull-Requests) · [arXiv 2605.02273](https://arxiv.org/abs/2605.02273)
- [arXiv 2402.08967](https://arxiv.org/abs/2402.08967) · [FSE 2024 page](https://2024.esec-fse.org/details/fse-2024-research-papers/105/Generative-AI-for-Pull-Request-Descriptions-Adoption-Impact-and-Developer-Interven)
- [Vectara leaderboard](https://github.com/vectara/hallucination-leaderboard) · [FABLES](https://arxiv.org/abs/2404.01261) · [Belém et al.](https://aclanthology.org/2025.findings-naacl.293/) · [Zhang et al.](https://aclanthology.org/2024.tacl-1.3) · [Van Veen et al.](https://arxiv.org/abs/2309.07430v5)
- [Saraf et al.](https://arxiv.org/abs/2508.21164) · [Chain-of-Verification](https://arxiv.org/abs/2309.11495) · [ACL Findings 2024](https://aclanthology.org/2024.findings-acl.212/) · [Anthropic: Reduce hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Altay & Gilardi, OUP](https://academic.oup.com/pnasnexus/article/3/10/pgae403/7795946) · [Spatharioti et al.](https://arxiv.org/abs/2307.03744) · [Nieman Lab](https://niemanlab.org/2026/06/how-should-news-organizations-label-their-ai-use-for-audiences-new-studies-suggest-some-answers)
- Sim et al. (secondary): [The National](https://www.thenationalnews.com/news/us/2026/09/30/ai-generated-summaries-accuracy-study/), [News-Medical](https://www.news-medical.net/news/20260925/AI-generated-video-summaries-can-reshape-peoples-memories-of-events.aspx), [MIT Media Lab](https://www.media.mit.edu/articles/ai-can-rewrite-your-memories-and-you-may-never-notice/), [AAAI (blocked)](https://ojs.aaai.org/index.php/AIES/article/view/43310)
- [Radmanesh et al.](https://arxiv.org/abs/2409.10781) · [Tan, Wagner & Treude](https://arxiv.org/abs/2212.01479) · [CoCC](https://arxiv.org/abs/2403.00251) · [Wen et al. bibliography](https://bibtex.github.io/ICPC-2019-WenNBL.html) · [Never Work in Theory, Aghajani](https://neverworkintheory.org/2021/10/06/software-documentation-issues-unveiled.html) · [ICSE 2019 page](https://2019.icse-conferences.org/event/icse-2019-technical-papers-software-documentation-issues-unveiled)