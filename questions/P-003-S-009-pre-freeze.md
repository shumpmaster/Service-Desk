# Ruling needed: before the card fix's spec is frozen, should two points from its last check be fixed?

Milestone: M4

WHY: The check of the lines that closed the six gaps passed, but it raised two new points before the spec is frozen. Nothing has been built and no code has changed. First, one new comparison rule expects today's desk to show something different when a direct link to a card is opened while the dispatch log cannot be read. The code reading suggests today's desk shows the same sheet either way, so the record of today's desk would probably fail that rule, and the build would stop for no real fault. That would happen after the adapter and the record are made. Second, question 13's text, which you answered A, still describes only two of the comparison's rules. It does not mention the new link-and-notice rule, the rule that every failing case has a matching good-read case, or the rule that every good-read case holds an open card. Your A would then be recorded against wording narrower than what it accepts.
OPTIONS:
  A. Fix both first. The Definer limits the new rule to notifications, and rewrites question 13 to name every coverage rule. A fresh Critic checks only those lines, and then the spec is frozen. If that check fails, it comes back to you. About half an hour.
  B. Freeze as it stands. Both are carried as risks, and the likely false stop comes back to you after the adapter and the record are made.
RECOMMENDATION: A. The first point is a likely stop at a costly moment, and both fixes are a sentence each.
RISK CLASS: R3 (the build's locked checks are under tests/acceptance/**)   REVERSIBILITY: irreversible (computed from R3; neither option changes code)   BLAST RADIUS: the card fix's spec and its build; no other project
DEFAULT: none — an R3 ruling never defaults   TIMEOUT: none

## Context
- The check of the lines that closed round 4's gaps passed, with two non-blocking points: the new rule (c) is backed for notices only and probably fails for direct links (N-A), and question 13 does not describe rule (c), the twin rule or the open-card rule (N-B) (source: reviews/S-009/plan.md, round 5)
- Rule (c) and the twin and open-card rules came in under your criteria answer B, which allowed the comparison's wording and question 13's options to change (source: questions/P-003-S-009-criteria.md, option B; specs/S-009.md:169, :288)
- The code reading shows one sheet for a direct link to a card not on the list, with no change by read state (source: reviews/S-009/_src-reading.md:290)
