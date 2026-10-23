# Ruling needed: On a team member's running log, may two lanes from different times share a look?

Milestone: none (a design follow-up after MD3; it joins the follow-up milestone if you approve one)
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: You ruled that every lane "looks different at a glance" (greys plus line styles). The new look's greys give at most six looks, and four are in use. The plan's next draft makes lanes that are open at the same time always look different, while up to four are open at once; every log in the test data has at most three open at once. But one log can hold 11 lanes over its life, so a lane that closed higher up can share a look with a later one. Each row names its lane in words. Left unruled, it is written as a known limit.
OPTIONS:
  A. Accept it — Lanes open together always differ; lanes from different times may share a look, with their rows naming them.
  B. Two more looks — Add the other two looks the greys allow (dark dotted and mid-grey solid), so up to six lanes open together differ; lanes from different times can still share.
  C. Something else — Say what you'd like.
RECOMMENDATION: A — what a glance needs to tell apart is lanes running side by side, and a closed lane higher up has its name on its rows.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: team members' running logs
DEFAULT: A   TIMEOUT: 168

## Context
- The lanes ruling (source: decisions/questions/P-001-desk-v2-lanes.md)
- The Critic's finding that lanes open together could look alike (source: the plan review of S-001 after MD3, round 1, finding 1; the orchestrator's session record, to be recorded with the amendment)
