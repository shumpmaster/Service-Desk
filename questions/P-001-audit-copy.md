# Ruling needed: When an answer is too long to prefill, where should its copy text sit?

Milestone: none (a design follow-up after MD3; the planner gives it a milestone when it is built)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: When an answer can't be prefilled into GitHub, the sheet shows each answer's full text with a Copy button. Today those texts sit above the choices, so a three-option question shows three blocks of file text before A, B and C. It is rare with your settings. Left unruled, it stays as built.
OPTIONS:
  A. Inside each choice — A "Copy" in each choice's box, with the text one tap down in the existing "the file each answer writes" fold.
  B. Below the choices — The texts move under A, B and C.
  C. Above, as built — No change.
RECOMMENDATION: A — the decision stays first, and the text you paste is one tap away.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: question, gate and decision sheets, only when an answer can't be prefilled
DEFAULT: C   TIMEOUT: 168

## Context
- The audit choice (source: docs/design/audit-2026-10-22.md, section 6, on branch orch/md3-design-audit, pull request #194)
