# Ruling needed: Where your Chief of Staff's recorded sessions show on the desk

Milestone: MD2

WHY: Your Chief of Staff's work is now recorded, session by session, with each helper it ran. Your ruling 5 says its sessions and the subagents it starts "are logged like pipeline sessions and appear on the agent panel". The trial view shows them on the Team screen, which is the agent panel: the Chief of Staff's tile, running log and working-now sheet, who has the ball, and each helper on its own member's tile. Pipeline sessions are also listed under More detail, Agents, with their usage; the Chief of Staff's are not, unless you say so. Left unruled, they show on the Team screen only. Only the trial view is affected.
OPTIONS:
  A. The Team screen only — as built. Meets "appear on the agent panel" in full. Meets "logged like pipeline sessions" in the records, where each piece of work and each helper has its line with its times and figures, and on the Team screen, where they show as a pipeline session does (status, running log, working-now sheet); but not in the Agents list, where pipeline sessions are also listed. Nothing more to build.
  B. Also in More detail, Agents — each piece of work and each helper as its own row beside the pipeline's sessions, with its start, end, run time and the figures it carries: a helper's tokens, tool uses and time show; the Chief of Staff's own tokens and cost, and every row's item, result and verdict, read "not recorded", since the lines hold none. Meets "logged like pipeline sessions" on the desk too, since that list is where pipeline sessions are logged, and "appear on the agent panel" as A does. A little more to build, in the trial view only.
RECOMMENDATION: A — the agent panel your ruling names already shows every line, and the Agents list's rows would be mostly "not recorded", because these lines carry no item, result or Chief of Staff figures; pick B if you want one list of all agent work, the pipeline's and the Chief of Staff's together.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the desk's trial view only: its More detail, Agents list; every record stays as it is
DEFAULT: A   TIMEOUT: 48

## Context
- Ruling 5 reads, in full: "5. **Chief of Staff sessions are recorded** (a model change): the Chief of Staff role exists on every project, so its sessions and the subagents it starts are logged like pipeline sessions and appear on the agent panel." (source: decisions/questions/P-001-design-lab-1.md:20)
- When the lab discussed it you wrote "If it's something that you will be doing on every project moving forward I will want your agents captured as well." (source: decisions/questions/P-001-design-lab-1.md:12)
- Ruling 1's agent panel is where you "tap an agent to see its work (record, outcome, usage)", and it also answers who has the ball; you confirmed with "Yes" that the Team screen inside each project, with each Home card lighting where an agent works, is that panel (source: decisions/questions/P-001-design-lab-1.md:16; decisions/questions/P-001-design-lab-open.md, answer 2)
- The session lines carry no item, route or stage, and the Chief of Staff's own tokens and cost are always null (source: Personal-Org-Operating-Model specs/S-033-file-every-ask.md, AC6 and Known limits)
- The Agents list shows each pipeline session's item and role, its start and end, its run time, its result and verdict, and its usage (source: specs/S-001.md, AC22, AC23 and J10)
