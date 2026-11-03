---
id: F-sum-detectors-weak-01
form: fact
claim: "Automatic faithfulness checkers are unreliable on hard cases: the best detectors have near 50% accuracy on FaithBench (cases where detectors disagreed); most LLMs perform close to random chance on SummEdits, and the best (GPT-4) is 8% below estimated human performance; in FABLES, LLM auto-raters correlate weakly with human judgments, especially for unfaithful claims."
grade: A
topics: [machine-summaries, accuracy]
checked_on: 2026-11-03
shelf_life: 12 months
opened_by: source-checker (Q-021, 2026-11-03), abstracts/landing pages via summarising fetch; SummEdits read at arXiv 2305.14540 (the aclanthology page failed to load)
memo: research/Q-021-memo.md
sources:
  - https://arxiv.org/abs/2410.13210  # "even the best hallucination detection models have near 50% accuracies on FaithBench"
  - https://arxiv.org/abs/2305.14540  # SummEdits: "performance close to random chance"; "GPT-4, is still 8% below estimated human performance"
  - https://arxiv.org/abs/2404.01261  # FABLES: auto raters show weak correlation with human judgments
note: Three independent groups. The memo's verbatim FABLES quote ("correlates strongly...") was not seen in the summary; the weak-correlation finding was. Not tested on summaries of code changes.
---
