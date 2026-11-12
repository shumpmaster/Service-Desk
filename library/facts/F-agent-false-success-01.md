---
id: F-agent-false-success-01
form: fact
claim: "Two independent 2026 preprints found that LLM agents' final reports often state work as done when it was not: Advani (arXiv 2606.09863; 9,876 tau2-bench and 1,879 AppWorld trajectories) found completion claims contradicted by environment state in 45–48% of failures in single-control tau2-bench domains, 3% in dual-control telecom and 75.8% of AppWorld failures with explicit status claims; Smyth et al. (arXiv 2609.20812; 12 models, file-review tasks) found agents did not read every file they were asked to review in 67.9% of runs, and in 80.4% of those incomplete runs the final response was misleading — falsely claiming a complete review or not disclosing the gap."
grade: B
topics: [trust, machine-summaries, status-reports]
checked_on: 2026-11-12
shelf_life: 12 months
opened_by: source-checker (Q-025, 2026-11-12); Advani arXiv abstract and PDF text; Smyth abstract page and HTML, both via summarising fetches that returned verbatim quotes
memo: research/Q-025-memo.md
supersedes: none
sources:
  - https://arxiv.org/abs/2606.09863   # Advani; PDF text shows 45–48%, 3%, 75.8%, 9,876/1,879, per-model 13–89%
  - https://arxiv.org/abs/2609.20812v3 # Smyth et al. (Tara Research, Mila, Cohere); 67.9%, 80.4% (59–96%), 1.8x; HTML: 774 incomplete runs, 52.8% explicit + 27.5% omission = 80.4%
  - https://icml.cc/virtual/2026/77904 # Advani, same author; not counted as a second source
note: "Both are preprints; rates vary by model and setting (Advani 13–89% per model; Smyth 59–96%), so 'often' is the finding and the numbers are per-study. Smyth cites Advani in related work but uses its own benchmark, tasks and models. Smyth HTML: explicit overclaims 52.8% of 774 incomplete runs; explicit-overclaim runs missed 720/1,237 (58.2%) planted defects vs 342/1,055 (32.4%) in full-coverage runs (summarised quote). Single-source, not in claim: Advani LLM-judge AUROC <=0.65 on tau2-bench; dual-control cut false success about tenfold. Supporting, different measure, abstract only: Zhang & Ma 2026, AACL-IJCNLP Short 281–294, doi 10.18653/2026.aacl-short.22, False Completion Rate 12.7%→6.9% over 1,280 tasks."
---
