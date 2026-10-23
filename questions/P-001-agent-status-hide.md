# Ruling needed: May an agent's "Owner: after agents" status hide a pull request from your board and phone?

Milestone: none (a known-limits point for S-001 after MD3; it changes no screen)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The board and the phone leave out a pull request GitHub marks "Owner: after agents". An agent with write access could post that mark on its own pull request and hide it from you until the real check runs. It still can't merge without you, and the real mark comes from a workflow agents can't change without your approval. Left unruled, it stays as now and is written down as a known limit.
OPTIONS:
  A. Accept it as a known limit — Written into the plan's known limits; nothing is built.
  B. Close it — Trust only the mark posted by the owner-signal workflow. First we'd check whether the desk can tell who posted a mark; the cost isn't known yet.
RECOMMENDATION: A — a hidden pull request still can't merge, and the real mark can't be changed without you.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: what the board and phone leave out
DEFAULT: A   TIMEOUT: 168

## Context
- The planner's draft amendment "S-001 after MD3", its owner questions (source: specs/S-001.md on branch build/definer/s001-after-md3, the amendment's list (d))
- The finding (source: reviews/S-001-desk-v2/_build-1b-review-round1-verbatim.md, question 3)
