# Ruling needed: Which milestone should the glance work count toward?

Milestone: none (the plan after the glance audit; its milestone is question P-001-glance-plan-milestones)
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your glance answers become ten build steps, G1 to G10. G1 to G9 change the screens and need nothing new; G10, each sprint's pieces of work counted, waits for the operating model's change (S-034) to be released and synced. A milestone is added only with your approval, and a Build milestone has to be reached before the Build gate. Left unruled, the steps go ahead as design follow-ups with no milestone.
OPTIONS:
  A. One milestone — M3E covers all ten steps; it is reached only once the model change is in and G10 is built, so either the Build gate waits on S-034, or the desk goes live with M3E unreached.
  B. Two milestones — M3E, "The desk's important things readable at a glance", for G1 to G9, after M3D and before M3C; and M3F, "Each sprint's pieces of work counted on the desk", for G10, filed later as work of its own once S-034 is released, so it can never hold the Build gate or launch. As its own piece of work, M3F goes through its own short route (a small Discovery, scaled to its size) with its own gate rulings for you. If S-034 lands before the Build gate, M3F could instead be pulled into this project's Build phase, but the Build gate would then wait for G10.
  C. No milestone yet — The steps go ahead as design follow-ups ("Milestone: none"); you name one later.
RECOMMENDATION: B — the Build gate and launch depend only on this project's work, and M3E can be reached as soon as G9 lands.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: docs/PROJECT.md section 3 (one or two new milestone lines); with B, a later piece of work of its own for M3F, with its own gate rulings
DEFAULT: C   TIMEOUT: 168

## Context
- The plan, its stages G1 to G10 and these questions (source: specs/S-001.md, "After the glance audit" and "Open questions for the owner", draft 3)
- The plan reviews, verbatim: the Critic and the Reviewer, PASS in round 3 (source: reviews/S-001-after-glance/)
- Your rulings the plan carries (source: decisions/questions/P-001-glance-*.md and P-001-glance2-*.md)
