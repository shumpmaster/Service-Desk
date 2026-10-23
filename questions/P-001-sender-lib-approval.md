# Ruling needed: Should more of the desk's shared code that the phone's sender runs need your approval to change?

Milestone: none (a known-limits point for S-001 after MD3; it changes no screen)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: The phone's notification sender uses 16 shared code files. Changes to 3 of them already need your owner.md; the other 13 need only the two reviewers. Left unruled, it stays as now.
OPTIONS:
  A. Keep it as now — The 3 stay owner-approval; the 13 are checked by the Reviewer and CI.
  B. Add the 13 — Any change to them needs your owner.md, which would be most desk pull requests.
RECOMMENDATION: A — B would put your approval on nearly every desk change for little gain.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: which pull requests need your owner.md
DEFAULT: A   TIMEOUT: 168

## Context
- The planner's draft amendment "S-001 after MD3", its owner questions (source: specs/S-001.md on branch build/definer/s001-after-md3, the amendment's list (d))
