# Ruling needed: Should a project's page say "checking…" because a different project's read is failing?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: G9b's design review (round 1, N2) found that with one project failing and Service-Desk read, Service-Desk's own page says "Nothing waiting on you · checking…", and keeps saying it for as long as the other project fails. The words come from the whole desk's reads, not the page's own project. This was so before G9b, and G9b's spec left the row unchanged on purpose. Left unruled, it stays as built.
OPTIONS:
  A. The page's own project — the row says "checked <age> ago" from that project's own last read.
  B. As built.
RECOMMENDATION: A — a project's page should speak for that project, as Waiting does with one project shown.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the "Nothing waiting on you" row on a project's page
DEFAULT: B   TIMEOUT: 168

## Context
- The finding (source: reviews/M3E/_stage-g9b-design-r1-verbatim.md, N2)
- The row's words today (source: src/public/sandbox.js, `checkedWords`)
- G9b's screens (source: specs/S-001.md, AC91 (c), "the line under Home's and Waiting's titles")
