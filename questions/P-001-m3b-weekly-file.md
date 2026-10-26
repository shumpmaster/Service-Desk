# Ruling needed: Where should the desk's weekly file go, given Service-Desk is public?

Milestone: M3B
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Each week the desk offers a file of its figures for you to commit, so the record isn't only on a phone. It holds when you had the desk open and what it showed you. Service-Desk is public: anything committed there stays public for good, even if deleted later. A short code for your private project's items would not protect them: it can be worked back by trying the likely numbers. Whatever you answer here, your Chief of Staff's weekly figures (the counts and your upkeep estimate) stay public in Service-Desk, each week's published when you merge it. The step that saves the file waits on this answer.
OPTIONS:
  A. Service-Desk, its own items only — the file there holds when the desk was open and Service-Desk's own items, which are public already; for your private project, only counts the desk works out on that device. Your desk-open times become public for good, and a count is each device's own.
  B. Service-Desk, counts only — the file holds counts per project: no times and no items. Nothing personal is published, but your Chief of Staff can't check missed decisions item by item, and deploys, missing cards, hold cards and merge cards, which have no raised time the desk reads, can't be counted.
  C. Your portfolio repository, everything — the same file with every project's items by name, in your private portfolio repository. None of the file is published; your Chief of Staff counts across all your devices item by item, as the project document designs; the project document's "in Service-Desk" is reworded, which you approve by merging.

  Under every option, your Chief of Staff's weekly figures (the counts and your upkeep estimate in minutes) are kept in Service-Desk, so they are public; they are mild, and never name your private project's items.
RECOMMENDATION: C — nothing is published that can't be taken back, and the full record is kept for the checks; it needs your Chief of Staff able to read the portfolio repository, and the portfolio's rules to allow your commit there, both confirmed before the step is built.
RISK CLASS: R3   REVERSIBILITY: irreversible (A and B publish to a public repository, which can't be undone)   BLAST RADIUS: under A, your desk-open times and Service-Desk's items, public for good; under B, counts; under C, none of the file; under all three, the weekly figures
DEFAULT: none (irreversible: it never settles itself, AGENTS.md §5)   TIMEOUT: none

## Context
- The design: the desk notes when it was open, when it first showed each card and the "didn't need me" marks, and a weekly link "commits those figures to `docs/metrics/<week>.md` in Service-Desk" (source: docs/PROJECT.md:194-205)
- Service-Desk is public, and nothing private goes in public places (source: specs/S-001.md on branch build/definer/m3b-plan at f36ca26, AC76)
- An unkeyed hash of an item's key can be reversed by trying the likely keys, and the page can hold no secret for a keyed one (source: the Critic's B1 and the Reviewer's B3, plan review round 1 of the M3B plan)
- The desk already reads the portfolio repository's tree, read only; this would be its first link that commits there, so the portfolio's own rules are checked first (source: specs/S-001.md on branch build/definer/m3b-plan at f36ca26, J23; Setup CS34)
- The weekly check's lines are in Service-Desk under every answer (source: specs/S-001.md on branch build/definer/m3b-plan at f36ca26, J25)
