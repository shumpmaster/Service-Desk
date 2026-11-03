I've written revision 3 below. It fixes the two Section D items the checker couldn't confirm (Wen and Aghajani), and says plainly which parts of them are unread. It also takes in the checker's direct reads of the Belém and FABLES quotes, which settled both disputes. Nothing else changed.

---

# Q-021 memo, revision 3: errors in machine-written summaries, how they are caught, and how readers rely on them

**Researcher, 2026-11-03. Depth 3. For the Source checker. This replaces revision 2 (research/Q-021-memo.md).**

**How I read the sources.** I read every source through a summarising fetch of its abstract or landing page. I read no full texts. Where only a search summary or a secondary report could be opened, the item is graded D and I say so. Where I could not open a source at all, I say "not read" and state nothing from it as fact.

**Grades** (unchanged; applied per item):
- **A:** several independent primary sources agree.
- **B:** one peer-reviewed primary source, abstract read.
- **C:** a preprint, a vendor's own claim, or one non-peer-reviewed source.
- **D:** only a secondary report or a search summary was read.

**Closeness to the owner's setting:**
- **near:** summaries of code changes or pull requests written by AI agents.
- **mid:** summaries of documents or code, or checking of code.
- **far:** news, headlines, books or medicine.

**Existing library entries on these topics:** F-sum-detectors-weak-01, F-sum-self-preference-01, F-sum-long-multi-01, F-trust-ai-label-01, P-sum-independent-grounded-check-01 and P-stale-visible-01.

---

## A. How often summaries are wrong, leave things out, or add things

**A1. Fact, B, near.** Gong, Pinna, Bian and Zhang studied pull requests written by coding agents. The MSR 2026 programme lists the paper as accepted in the Mining Challenge track, as a "Talk" in a session titled "Posters".
- It covers 23,247 pull requests from five agents, 974 of them annotated by hand.
- 406 (1.7%) had high inconsistency between the description and the code.
- The most common type (45.4%) was "descriptions claim unimplemented changes".
- High-inconsistency pull requests were accepted 28.3% of the time, against 80.0% for the rest. They took 55.8 hours to merge, against 16.0.
- Caveat: the 1.7% comes from a heuristic screen, not a full hand count. It is a floor for gross mismatch.
- Sources: arXiv 2601.04886; MSR 2026 programme page.
- *Change:* "shown as a poster" now reads as the programme page puts it.

**A2. Fact, B, near.** Xiao, Hata, Treude and Matsumoto (Proc. ACM Softw. Eng. 1(FSE), 2024, pp. 1043–1065) studied 18,256 pull requests whose descriptions were partly written by Copilot for PRs.
- Those pull requests "require less review time and have a higher likelihood of being merged".
- Developers "complement the automated descriptions with their manual input".
- The paper reports no accuracy rate. The finding is an association only.
- Sources: arXiv 2402.08967; FSE 2024 programme page (the checker has not opened this page).

**A3. Fact, C (vendor measurement), mid.** Vectara's leaderboard was last updated on 2026-10-22.
- It covers "over 7700 articles", from 50 to 24,000 words.
- Hallucination rates run from 1.8% to 24.2%, depending on the model.
- Claude Opus 4 is listed at 12.0%. Other Claude models range from 9.8% (Haiku 4.5) to 12.2% (Opus 4.6).
- Vectara says it is "not evaluating the quality of the summaries, only the factual consistency of them".
- The figures change with every update.
- Source: github.com/vectara/hallucination-leaderboard.

**A4. Fact, B, far.** FABLES (COLM 2024) annotated 3,158 claims in machine summaries of 26 books, at a cost of $5.2K.
- Most unfaithful claims were about events and the states of characters.
- All the models often left out key events, details and themes, and gave too much weight to the end of the book.
- Source: arXiv 2404.01261.

**A5. Fact, B, mid.** Belém et al. (NAACL Findings 2025) studied summaries of several documents at once.
- The abstract says: "on average, up to 75% of the content in LLM-generated summary is hallucinated".
- When asked about a topic the documents do not cover, GPT-3.5-turbo still produced a summary 79.45% of the time, and GPT-4o 44% of the time.
- Source: aclanthology 2025.findings-naacl.293.
- *Change:* the source check confirmed the full wording, so the dispute is closed.

**A6. Fact, B, far.** Zhang, Ladhak, Durmus, Liang, McKeown and Hashimoto (TACL 12, 2024) found that "LLM summaries are judged to be on par with human written summaries" written by freelance writers. They also found that "instruction tuning, not model size, is the key". Source: aclanthology 2024.tacl-1.3.

**A7. Fact, B, far.** Van Veen et al. (Nature Medicine 2024) ran a reader study with ten physicians.
- The best adapted models' summaries were "equivalent (45%) or superior (36%)" to those of medical experts.
- The abstract adds: "The ensuing safety analysis highlights challenges faced by both LLMs and medical experts, as we connect errors to potential medical harm and categorize types of fabricated information."
- Source: arXiv 2309.07430.

**A8. Estimate, C.** Errors look rarer for short, single sources (A3, A6). They look more common for long sources, for several sources at once, for topics the source does not cover, and late in the output (A4, A5).
- Omission is the least measured kind of error. Only FABLES (books) and Sim et al. (C5, grade D) measure it.
- No study measured agent-written summaries of changes across several projects for one reader.

## B. What catches or reduces errors, and what it costs

**B1. Fact, A.** Automatic checkers are weak on hard cases.
- **FaithBench:** the best detectors were about 50% accurate (arXiv 2410.13210).
- **SummEdits:** most models were "close to random chance", and GPT-4 scored 8% below humans (EMNLP 2023; arXiv 2305.14540).
- **FABLES:** "we implement several LLM raters of faithfulness and find that none correlates strongly with human annotations, especially with regard to detecting unfaithful claims" (arXiv 2404.01261).
- *Change:* the source check confirmed the FABLES quote word for word, so the dispute is closed.

**B2. Self-checking is biased.**
- **Panickssery et al. (NeurIPS 2024), B, mid:** models that judge text score their own output higher. The bias grows the better they recognise their own text (arXiv 2404.13076).
- **Saraf et al. (preprint, last revised 2025-10-09), C, mid:**
  - ChatGPT, Gemini and Claude judged blog posts written by each other, told the true author, a false author, or no author.
  - "False attribution frequently reversed preference rankings, producing shifts of up to 50 percentage points in voting outcomes and up to 12 percentage points in quality ratings."
  - The "Claude" label raised scores whoever wrote the text, and Claude showed "intensified self-preference" (arXiv 2508.21164).

**B3. Fact, B, mid.** Huang et al. (ICLR 2024) found that models struggle to correct their own reasoning without outside feedback. This was not tested on summaries (arXiv 2310.01798).

**B4. Fact, C (vendor research), mid.** In CriticGPT (OpenAI, 2024), OpenAI trained models to critique code (arXiv 2407.00215).
- The critic models caught more bugs than paid human reviewers, but also made up bugs that were not there.
- Teams of a human plus a critic model made up fewer bugs than the critic models alone.

**B5. Fact, C (vendor guidance), mid.** Anthropic's guide "Reduce hallucinations" recommends:
- letting the model say "I don't know";
- for documents over 20k tokens, pulling out word-for-word quotes first;
- "Verify with citations": the model finds a supporting quote for each claim, and "if it can't find a quote, it must retract the claim";
- running the same prompt several times and comparing the outputs ("best-of-N");
- reviewing the model's summarised reasoning ("chain-of-thought verification");
- refining iteratively;
- restricting the model to the documents it was given.

The guide also says: "although these techniques significantly reduce hallucinations, they don't eliminate them entirely. Always validate critical information." It gives no error rates. Source: platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations.

**B6. Fact, B, mid.** Dhuliawala et al. (Findings of ACL 2024, pp. 3563–3578) tested Chain-of-Verification.
- The model drafts an answer and plans questions to check it. It answers them "independently so the answers are not biased by other responses", then revises the draft.
- This reduced hallucinations on Wikidata list questions, closed-book MultiSpanQA and long-form text. Summaries were not tested.
- Sources: arXiv 2309.11495; aclanthology 2024.findings-acl.212.

**B7. Fact, B (cost), far.** FABLES paid $5.2K to annotate summaries of 26 books. SummEdits reports that its method costs 20 times less per sample than earlier ones. No study gives a cost per summary for checking descriptions of code changes.

**B8. Opinion, C.** Taken together, B1 to B4 favour a check by an independent party with the source to hand over the author checking its own work. This has not been tested directly on summaries of changes.

## C. How readers rely on a summary depending on what it says about its origin or checking

**C1. Fact, B, far.** Altay and Gilardi (PNAS Nexus 2024) ran two preregistered experiments with n = 4,976.
- An "AI-generated" label made headlines seem less accurate, whether they were true or false. The label lowered perceived accuracy by 2.66 percentage points, against 9.33 for a "false" label.
- The drop disappeared when people were told the AI only improved clarity or wrote first drafts. It stayed when they believed the AI had "entirely written" the content.
- Source: academic.oup.com/pnasnexus/article/3/10/pgae403/7795946.

**C2. Fact, C, far.** Wang, Sturgis and de Kadt (preprint, n = 3,861) found that an AI label made an article seem less accurate. Saying more prominently how the AI was used reduced that penalty (arXiv 2506.16202).

**C3. Fact, B, far.** Pennycook et al. (Management Science 2020) found the "implied truth effect": warnings on some headlines made the untagged ones seem more accurate. Tagging true headlines as verified removed the effect (dspace.mit.edu 1721.1/130380).

**C4. Fact, B, mid.** Kim et al. (FAccT 2024, n = 404) found that uncertainty phrased in the first person ("I'm not sure, but…") reduced overreliance. More general phrasing had weaker effects that were not significant (arXiv 2405.00623).

**C5. Reliance on wrong output** (graded per item):
- **Spatharioti, Rothschild, Goldstein and Hofman (preprint, C, mid).** They "observed overreliance on incorrect information when the LLM erred". "Confidence-based highlighting substantially increases the rate at which users spot incorrect information" (arXiv 2307.03744).
- **Bansal et al. (CHI 2021, B, mid).** Explanations made people more likely to accept the AI's answer whether or not it was right (arXiv 2006.14779).
- **Irons et al. (preprint 2026, C, mid).** Retrieved source passages helped readers check about as well as the full source did. The model's explanations made readers worse at finding errors (arXiv 2603.11393).
- **Kelch (ICIS 2026, n = 280, B, mid).** A delay, notes and a checklist did not improve error detection (d = −0.033). 51.3% of checklist flags tied to an error were not followed by a correction.
- **Sim, Eiger and Kohno (AIES 2026), D.**
  - After a misleading summary, 44.8% of readers answered correctly, against 83.6% after an accurate one. Source: The National, News-Medical and MIT Media Lab.
  - Across prompts and models, the summaries left out 51.6% of central details on average. Source: The National and News-Medical; the MIT page does not give this figure.
  - The AAAI page (ojs.aaai.org …/43310) returned "Access Denied".
  - *Change:* each figure now names only the pages that carry it.

**C6. Fact, D, far.** Nieman Lab (June 2026) reports two studies. Only this secondary report was read.
- **Valenzuela et al.** (Digital Journalism, conjoint experiment): "human review was the most influential factor considered". Outlets that required it "were seen as more credible".
- **Zier and Diakopoulos** (interviews): readers tell "generated" apart from "assisted". One said: "I probably need to fact-check this".

**C7. Estimate, C.** No study tests marks on summaries of an expert's own agents' work, read by that one expert. The evidence comes from crowd workers judging news. It suggests:
- a bare AI mark lowers trust slightly, and explaining what the mark means changes its effect (C1, C2);
- marking only some items can make the unmarked ones look checked (C3);
- a "reviewed" mark raises credibility, though nobody has tested whether that trust is deserved (C6, grade D);
- the exact wording of uncertainty matters (C4).

## D. Summaries that go out of date

**D1. Studies of comments and documentation that fall behind the code** (graded per item):
- **Radmanesh, Imani, Ahmed and Moshirpour (preprint, C).** Changes that leave comments inconsistent with the code are "around 1.5 times more likely" to lead to a bug-introducing commit. The effect is "highest immediately after the inconsistency is introduced" (arXiv 2409.10781).
- **Tan, Wagner and Treude (arXiv, C).** Of "over 3,000 GitHub projects", "most projects contain at least one outdated code element reference at some point in their history" (arXiv 2212.01479).
- **Wen, Nagy, Bavota and Lanza (ICPC 2019): not read; no findings stated.**
  - Only the title is confirmed: "A large-scale empirical study on code-comment inconsistencies" (bibtex.github.io; ICPC 2019 programme page).
  - The topic, comments that fall out of step with code, follows from the title alone.
  - The author PDF (inf.usi.ch) and the ACM page both returned 403. The programme page shows no abstract.
  - *Change:* revision 2's "largest study… 1,500 Java projects" is withdrawn. A search summary on 2026-11-03 described the paper as "the largest study at date investigating how code and comments co-evolve", with 500 commits analysed by hand. I could not open a page that says this, so I state no numbers from it.
- **Aghajani et al. (ICSE 2019), B for what is stated.**
  - The ICSE 2019 programme page gives the abstract: "we mined, analyzed, and categorized 878 documentation-related artifacts stemming from four different sources, namely mailing lists, Stack Overflow discussions, issue repositories, and pull requests. The result is a detailed taxonomy of documentation issues".
  - The abstract also says that "the creation and the maintenance of documentation is often neglected, negatively impacting its quality and usefulness".
  - *Change:* revision 2's claim that the taxonomy includes outdated or obsolete content is withdrawn. Neither the abstract nor Never Work in Theory says so. A search summary named categories such as "Outdated example" and "Other Up-to-dateness issues". The author PDF (emadpres.github.io/pdfs/icse2019.pdf) downloaded, but the fetch tool could not turn it into readable text, so this part is unconfirmed. The 39% figure stays withdrawn.

**D2. Fact, C, mid.** Huang, Chen, Chen and Zhou (preprint) describe CoCC, which "can effectively detect outdated comments with precision over 90%" (arXiv 2403.00251).

**D3. Gap.** I found no study of how readers notice that a summary is out of date. The nearest item is P-stale-visible-01, which is design guidance, not a study.

## E. Strength of evidence

| Topic | Strength | Closeness |
|---|---|---|
| Error rates | Moderate | Near: A1 (B) and A2 (B, no accuracy rate) |
| Automatic checkers are weak | Strong (A) | Mid |
| Self-checking is biased | Moderate | Mid |
| Effects of marks | Moderate | Far |
| Staleness | Moderate on how common it is (two preprints, plus a detector preprint); none on how readers notice | Mid |

---

## Proposed library entries

These are unchanged from revision 2. The source check confirmed their content and held them back only under the two-source rule:
- F-sum-agent-pr-mci-01
- F-sum-copilot-pr-desc-01
- F-sum-vectara-01
- F-doc-stale-code-comments-01

The F-doc-stale-code-comments-01 entry never cited Wen or Aghajani, so the Section D fixes do not touch it.

F-trust-implied-truth-01, F-trust-uncertainty-wording-01 and F-trust-checking-aids-01 are also unchanged, and each still has a single source.

**Not proposed:** Sim et al. (D), Valenzuela and Zier (D), Wen (not read), Aghajani (abstract only; the outdated-content part is unconfirmed), Saraf (a single preprint that only supports the filed self-preference entry).

## New research questions (none closed)
Unchanged from revision 1 (questions 1 to 3).

---

## Six-part return

### 1. What I changed
- **Wen (D1):** now marked "not read". The "largest study… 1,500 Java projects" claim is withdrawn. Only the title is stated.
- **Aghajani (D1):** the claim that the taxonomy covers outdated or obsolete content is withdrawn. What remains is quoted from the ICSE 2019 abstract, and the item is regraded from D to B for what is stated.
- **A1:** "shown as a poster" now reads "a 'Talk' in a session titled 'Posters'".
- **A5 and B1:** both now use the wording the checker confirmed word for word, and both disputes are marked closed.
- **C5 Sim:** each figure names only the pages that carry it. 51.6% is no longer credited to the MIT page.
- **Section E:** the staleness row now says what its rating rests on.
- **Unchanged:** all other items and all the proposed entries.

### 2. Why
research/Q-021-source-check.md gave a FAIL for two reasons:
- Wen's claim wasn't supported by the page cited for it.
- Aghajani's claim about outdated content wasn't supported by the page cited for it.

The checker said it would expect a PASS once these were removed or fixed. The A1 wording and the Sim attribution were smaller points from the same check.

### 3. What I verified
I have no shell, so I ran no commands. These are the web searches and fetches from 2026-11-03:
- **ICSE 2019 programme page (Aghajani):** gave the full abstract. It confirms 878 artifacts, four sources and "a detailed taxonomy of documentation issues". It does not mention outdated content.
- **emadpres.github.io/pdfs/icse2019.pdf (Aghajani):** downloaded (253 KB), but the fetch tool couldn't turn it into text, and the local PDF reader failed (pdftoppm is not installed). The PDF is unread.
- **Scinapse (Aghajani):** returned a reCAPTCHA page.
- **Wen:** the inf.usi.ch PDF returned 403, and so did dl.acm.org. The ICPC 2019 programme page lists no abstract. Two searches returned only search summaries, which I have not used as fact.

### 4. What is undone
- Wen is still unread. Whether Aghajani's taxonomy has an "up-to-dateness" category is still unconfirmed.
- I read no full texts.
- I found no second sources for the four held-back entries or the three re-proposed trust entries.
- The Sim primary page is still blocked.

### 5. What is needed outside my lane
- **Source checker:** please confirm the Aghajani abstract quote on the ICSE 2019 page. Someone with a PDF-to-text tool could also read emadpres.github.io/pdfs/icse2019.pdf and settle the "up-to-dateness" category.
- **Chief of Staff:** two calls:
  - a policy call on whether a single-source, peer-reviewed fact in the owner's own setting (A1) may be filed with a "single source" mark;
  - a decision card if the full texts are wanted (Digital Journalism, AIES, Wen).

### 6. Open questions
- If Aghajani's PDF does confirm "up-to-dateness" categories, should D1 carry it as a second source on how common stale documentation is? It would sit alongside Tan et al.
- Is the 1.7% gross-mismatch rate a floor, and how far off is the true rate?
- How well do findings from crowd workers carry over to one expert owner?

Sources:
- [ICSE 2019 page, Aghajani](https://2019.icse-conferences.org/details/icse-2019-Technical-Papers/49/Software-Documentation-Issues-Unveiled) · [Aghajani author PDF (could not be turned into text)](https://emadpres.github.io/pdfs/icse2019.pdf) · [Never Work in Theory](https://neverworkintheory.org/2021/10/06/software-documentation-issues-unveiled.html)
- [Wen et al. bibliography](https://bibtex.github.io/ICPC-2019-WenNBL.html) · [ICPC 2019 page](https://conf.researchr.org/details/icpc-2019/icpc-2019-Technical-Research/23/A-Large-Scale-Empirical-Study-on-Code-Comment-Inconsistencies) · [Wen PDF (403)](https://www.inf.usi.ch/lanza/Downloads/Wen2019a.pdf) · [ACM (403)](https://dl.acm.org/doi/abs/10.1109/ICPC.2019.00019)
- [arXiv 2601.04886](https://arxiv.org/abs/2601.04886) · [MSR 2026 page](https://2026.msrconf.org/details/msr-2026-mining-challenge/23/Analyzing-Message-Code-Inconsistency-in-AI-Coding-Agent-Authored-Pull-Requests) · [arXiv 2402.08967](https://arxiv.org/abs/2402.08967) · [FSE 2024 page](https://2024.esec-fse.org/details/fse-2024-research-papers/105/Generative-AI-for-Pull-Request-Descriptions-Adoption-Impact-and-Developer-Interven)
- [Vectara](https://github.com/vectara/hallucination-leaderboard) · [FABLES](https://arxiv.org/abs/2404.01261) · [Belém et al.](https://aclanthology.org/2025.findings-naacl.293/) · [Zhang et al.](https://aclanthology.org/2024.tacl-1.3) · [Van Veen et al.](https://arxiv.org/abs/2309.07430v5)
- [Saraf et al.](https://arxiv.org/abs/2508.21164) · [Chain-of-Verification](https://arxiv.org/abs/2309.11495) · [ACL Findings 2024](https://aclanthology.org/2024.findings-acl.212/) · [Anthropic guide](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
- [Altay & Gilardi](https://academic.oup.com/pnasnexus/article/3/10/pgae403/7795946) · [Spatharioti et al.](https://arxiv.org/abs/2307.03744) · [Nieman Lab](https://niemanlab.org/2026/06/how-should-news-organizations-label-their-ai-use-for-audiences-new-studies-suggest-some-answers)
- Sim et al. (secondary): [The National](https://www.thenationalnews.com/news/us/2026/09/30/ai-generated-summaries-accuracy-study/) · [News-Medical](https://www.news-medical.net/news/20260925/AI-generated-video-summaries-can-reshape-peoples-memories-of-events.aspx) · [MIT Media Lab](https://www.media.mit.edu/articles/ai-can-rewrite-your-memories-and-you-may-never-notice/)
- [Radmanesh et al.](https://arxiv.org/abs/2409.10781) · [Tan, Wagner & Treude](https://arxiv.org/abs/2212.01479) · [CoCC](https://arxiv.org/abs/2403.00251)