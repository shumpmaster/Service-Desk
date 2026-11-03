Verdict: FAIL

The memo as a whole does not pass. One figure in its text is wrong, one proposed claim was reworded, and about 12 cited sources were never opened. I filed 5 of the 9 proposed entries. I held back the other 4. I read every source through a summarising fetch, as the Researcher did.

**Findings (memo line numbers)**
- **Wrong figure, line 38:** A3 says Claude Opus 4 is at 10.9% on the Vectara leaderboard. The page I opened (updated 2026-10-22) lists 12.0%. The other A3 figures match: 1.8% to 24.2%, over 7,700 articles, 50 to 24,000 words, and the statement that it measures consistency and not summary quality or completeness.
- **Reworded claim, line 49:** A5 and the proposed entry on line 214 say "on average, up to 75%". The abstract says only "up to 75%". I corrected the wording when filing. The 79.45% and 44% figures are confirmed.
- **Overstated venue, line 76:** B2 calls Saraf et al. (arXiv 2508.21164) a result at grade C, but I did not open it, so it is unchecked.
- **A1 (line 24):** confirmed on every figure (23,247 PRs, 5 agents, 974 annotated, 406 / 1.7%, 45.4%, 28.3% against 80.0%, 55.8 against 16.0 hours). The memo's text grades it B (line 24) but the proposed entry says C (line 170). It is the only near-setting study and has no second source.
- **Confirmed against the source:**
  - FaithBench near 50% (B1).
  - SummEdits: close to random chance, GPT-4 8% below humans, 20 times cheaper (B1, B7). I read it at arXiv 2305.14540 because the aclanthology page failed to load.
  - FABLES: 3,158 claims, 26 books, $5.2K, omissions, end-of-book weighting (A4, B7). The auto-rater finding is "weak correlation". I did not see the memo's verbatim "correlates strongly" quote.
  - Panickssery: the self-preference finding is confirmed. NeurIPS 2024 is confirmed by search result, not by the arXiv page.
  - Huang et al. (ICLR 2024).
  - CriticGPT (B4).
  - Pennycook (Management Science 2020, n=5,271 and 1,568).
  - Kim et al. (FAccT 2024, n=404).
  - Irons et al. (2026 preprint).
  - Bansal et al. (CHI 2021).
  - Kelch (ICIS 2026, n=280, d = −0.033, 51.3%).
  - Altay and Gilardi: 2.66 against 9.33 percentage points, and the effect disappears when the label is defined. I read this at the OUP page. PMC was blocked, so I could not confirm n=4,976 and used "nearly 5,000".
  - Wang et al.: n=3,861, AI labels lower perceived accuracy, and salience reduces the penalty.

**Filed**
- `library/facts/F-sum-detectors-weak-01.md` (grade A, three independent sources)
- `library/facts/F-sum-self-preference-01.md` (grade B)
- `library/facts/F-sum-long-multi-01.md` (grade B, wording corrected)
- `library/facts/F-trust-ai-label-01.md` (grade B, n stated as "nearly 5,000")
- `library/patterns/P-sum-independent-grounded-check-01.md` (grade C, every source confirmed, not tested on change summaries)

**Not filed**
- `F-sum-agent-pr-mci-01`, `F-trust-implied-truth-01`, `F-trust-uncertainty-wording-01`, `F-trust-checking-aids-01`: each rests on a single source (the checking-aids entry on one source per sub-claim). Under the two-source rule for load-bearing facts they are not confirmed. The content itself checked out.
- `F-sum-vectara-01`: a single vendor source, and the memo's own figure for Opus 4 was wrong.

**Not opened by me**
These claims are unverified and stay out of the library:
- A2 (Xiao et al., arXiv 2402.08967)
- A6 (Zhang et al., TACL 2024)
- A7 (Van Veen et al., Nature Medicine 2024)
- B5 (Anthropic documentation)
- B6 (Chain-of-Verification)
- C5 Spatharioti
- Saraf
- D1 (Radmanesh, Tan et al.)
- D2 (CoCC)
- Sim et al.
- Valenzuela and Zier (C6)
- Wen
- Aghajani

The memo's source list at line 327 gives a different URL for the Anthropic page than line 92 does.

**Open questions**
- Should the single-source entries be filed once a second source is found, or kept as pointers to the primary study? I applied the two-source rule strictly.
- The memo should correct line 38 (10.9% should be 12.0%) and the A5 wording, and open the unchecked sources, before it is relied on.