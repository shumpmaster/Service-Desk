# Ruling needed: How should milestones, sprints and pieces of work be counted?

Milestone: none (a design follow-up after M3D; the planner gives it a milestone when it is built)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: You see "0 of 5" even on finished phases because the only number counts the model's standard checklist, never your own milestones. Proposed: each phase leads with all its milestones ("3 of 5 reached") and its sprints ("7 of 7 sprints merged"), and says the unused standard ones in words ("Standard checklist: none tracked (5)"). For the pieces of work inside a sprint, nothing the desk reads lists them in advance, so a true "done of total" needs each sprint's pull request to carry its planned pieces as a task list: a change to the operating model's sprint form. Commit counts are possible sooner but have no total. Running-log entries could show for research sprints, and GitHub Actions runs for the latest commit on main; neither per pull-request sprint without new reads. This needs the Definer for S-001 (AC83, AC84) either way. Left unruled, it stays as built.
OPTIONS:
  A. Counts, pieces from a task list — Milestone and sprint counts as proposed; pieces counted done-of-total from a task list in each sprint's pull request (an operating-model change, then the desk reads it).
  B. Counts, pieces as commit counts — Milestone and sprint counts as proposed; pieces shown as a count of commits so far, with no total (one field added to the desk's pull-request read).
  C. Counts only — Milestone and sprint counts as proposed; pieces left for later.
  D. As built — "Standard: x of y" stays the only count.
RECOMMENDATION: A — it is the only way to a true done-of-total for pieces, and the milestone and sprint counts don't wait on it.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: The project page's milestones, the Timeline, the operating model's sprint form (A)
DEFAULT: D   TIMEOUT: 168

## Context
- The proposal, its rationale and the rulings it changes (source: docs/design/audit-2026-10-24-round-2.md)
- Before and after shots of the real desk (source: docs/design/mockups/glance-emphasis/index.html, round 2; the owner's private page https://claude.ai/artifact/QFYn6QWmAej31S5FXKYvux)
- The owner's round-2 ideas, word for word (source: docs/design/references/owner-request-2026-10-24-glance-emphasis.md)
