# Ruling needed: Should a pull request waiting on a reviewer's verdict count as waiting on you?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: You ruled that a pull request still with the agents doesn't count as waiting on you. A pull request still waiting on a reviewer's verdict, such as the Design reviewer's or a security reviewer's, is the same kind of wait. Left unruled, it counts as waiting on you.
OPTIONS:
  A. Don't count it — It joins the quiet "With the agents" line until every reviewer has given a verdict and it needs you.
  B. Count it — It stays a card in "Waiting on you", saying which verdict is missing.
RECOMMENDATION: A — "Waiting on you" then holds only what you can act on now.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: whether such pull requests count on the desk; notifications would follow the same rule
DEFAULT: B   TIMEOUT: 48

## Context
- The owner's answer on pull requests with the agents (source: decisions/questions/P-001-board-after-agents.md)
- Frame 1's "With the agents" line (source: docs/design/mockups/desk-v2/README.md on orch/desk-mockup-v2)
