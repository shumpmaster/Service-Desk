# Ruling needed: Should a pull request still waiting on the agents' fixes count as waiting on you?

Milestone: MD2
Asked in session: session_012RJPVKAoLga2RkqLYRDcBY

WHY: When GitHub's owner check says the agents still have findings to fix first, the pull request is open but nothing is asked of you yet. On the board it would sit in "Waiting on you" with "The agents still have findings to fix first." That is the "why is this still here?" feeling you described. Left unruled, it counts, as every open pull request does today.
OPTIONS:
  A. Don't count it — It shows in a quiet line, "With the agents: <n>", and counts again once the agents are done and it needs you.
  B. Keep counting it — It stays a card in "Waiting on you" with those words.
RECOMMENDATION: A — everything in "Waiting on you" is then something for you to do.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: whether such pull requests count on the desk; notifications would follow the same rule
DEFAULT: B   TIMEOUT: 48

## Context
- The owner asked why done items "still remain there" (source: docs/design/references/owner-request-2026-10-19-board.md on orch/board-mockup)
- The board plan shows "The agents still have findings to fix first." for an "Owner: after agents" check (source: specs/S-001.md on build/definer/s001-board, J22)
