# Ruling needed: Which of the model's standard checklist steps for exploring and designing should the card fix take on, and which skip?

Milestone: Discovery-8

WHY: The card fix's last readiness check failed, first because its plan had no line for these steps, and a third failure would send the fix to a stop card, so the next real check must pass. The model has a fixed checklist for every project: eight steps for exploring the idea and six for designing it. Each project's plan says, for each step, whether it takes it on or skips it, and why, so you see what is being dropped before you rule. The card fix now has a plan of its own, and its plan proposes taking on eleven of the fourteen and skipping three, since it is a small change to the desk's own code: no outside expert's map, no search of how others solved it, and no experiment. The readiness check's notes call for your ruling on these lines, so I put them to you before the trial run of that check. Leaving it unruled holds the card fix where it is: its readiness card stays held, and nothing else waits on it.
OPTIONS:
  A. Take on eleven and skip three, as the plan proposes — skipped: the expert's map and its short list (the fix asks nothing outside the desk's own code), the search of how others solved the problem (it was seen directly in two of your answers), and the experiments (no unknown is left that needs one). Every other step is taken on, each with its reason in the plan, the side-by-side check of the screens it changes among them.
     Cost: the three skipped records will not exist; no check or gate needs them for this fix. Rules out: nothing; any skipped step can be taken on later with only the Critic's check. Reversible: yes.
  B. Take on all fourteen — the fix gets an expert's map, a search of others' solutions and an experiment too.
     Cost: several more helper sessions for a change of about 60 to 90 lines, with no question for them to answer. Rules out: nothing. Reversible: yes.
  C. Another mix — say which to change; the plan takes your lines before its trial run.
RECOMMENDATION: A — it takes on every step that answers something this fix needs, and skips only those with nothing to answer. Confidence: high; it would change if you want this fix to show the full checklist as an example for later work.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: the card fix's plan only; the desk's first plan and every other project are unchanged
CHECKED: read cold by the Critic, 2026-11-05, PASS at round 2; reviews/P-003-standard-lines/critic.md
DEFAULT: A   TIMEOUT: 72 hours (the lines are ruled again with the fix's Design gate, and until then any change needs only the Critic's check)

## Context
- The card fix's last real readiness check failed first on its plan having no line for the exploring and designing steps, and a third failure leads to Triage and a stop card (source: decisions/P-003/dor-fail-2-notes.md, opening and finding 1)
- The readiness check's notes say those lines need the owner's ruling (source: decisions/P-003/dor-fail-2-notes.md, finding 1)
- The card fix now has a plan of its own, which proposes eleven steps taken on and three skipped, each with its reason (source: docs/projects/P-003.md, section 3)
- The plan finds no unknown left open (source: docs/projects/P-003.md, section 7)
- The fix's sizing puts it at about 60 to 90 lines in five files (source: research/P-003-sizing-findings.md, section 7)
- The model's checklist has eight exploring steps and six designing steps, any of them may be skipped with a reason, and a skip excuses no record a check or a gate needs (source: Personal-Org-Operating-Model OPERATING_MODEL.md §4, "Standard milestones" and "Why and context (S-032)")
- The design side-by-side check of every changed screen is required before Design is done (source: docs/design/JOIN_UP_REVIEW.md)
