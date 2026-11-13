## The Critic's independent view

The brief passed its readiness check, and the case follows the brief faithfully. It has four weaknesses:
- It over-runs the length cap.
- It gives no reason to proceed with two standard Discovery milestones not reached.
- It leaves out a risk the readiness check asked it to carry.
- It has some citations that do not support the line they sit on.

None of these gives a reason to stop the project. They can be fixed by redrafting the case.

**The Critic's recommendation:** hold. Return the case to the Chief of Staff to fix the points below, then proceed.
- **Plan:** the plan itself holds up. It stays at $0 and T1. Acting finishes on GitHub. The experiments and the unknowns each have a fallback, and the stop rule covers them. The owner's rulings on acting, reading, lasting copies and experiments match what the brief says they say.
- **Why hold:** the owner cannot properly rule on this case as written. It asks the owner to proceed with Discovery-3 and Discovery-5 "not reached", and it gives no reason for doing so (see Milestones). It also leaves out a risk the readiness check said to carry, and the length cap is broken.
- **Redrafted case:** it should add the missing reason, restore the omitted risk, cut to the cap and replace the bad citations. I would expect to recommend proceeding on that version.

**Citation check:**
- **Length (sections 1–8):** the form caps these at 350 counted words. By my estimate they run to roughly 550–600, mostly in sections 5, 7 and 8. The case breaks its form.
- **Section 1, line 14:** the caption "Where the timeline stands" cites `docs/design/references/comments-2026-10.md:31` and `:32`. Those lines are the owner's October comments on the four versus six phases. They say nothing about where the timeline stands. This is a record that does not say what is claimed.
- **Section 2, lines 20 and 33:** "Today things wait on you too long" cites line 56 of the project document. That line says the owner's own busyness is the main cause and that things "sit longer than they should". The case states it more flatly. The case also does not connect the vision to the risk in section 5 that the timeline may not shorten waits.
- **Section 5, line 59:** "research Q-028 awaits its source check" cites only the dispatch log. The brief never cites Q-028, and the log does not say what Q-028 is about. The log does show a first source check that failed and a second one dispatched, so "awaits" is roughly right. The case does not say why the copying-job question depends on it.
- **Section 5, line 59:** "a copying job of unknown cost" cites `P-005.md:182`. That line says the cost is to be filed against the $0 ceiling. It does not say the cost is unknown, though that is a fair reading.
- **Section 3, lines 37–38:** the finding on the read key is supported. The finding on the alert limit is supported by line 151. That is thin for a section that is meant to report what Discovery found.
- **Section 9, line 93:** "some after several rounds" cites six source-check files and the log. I confirmed from the log only the Q-028 failure. I could not confirm the others from the log.
- **Visuals:** the four visuals match their text alternatives. They add no figures, and the unknown gate-ruling time is drawn dashed.
- **Section 8, line 82:** "fourteen standard steps" is correct. Discovery-1 to Discovery-8 plus Design-1 to Design-6 make fourteen.
- **Target-user profile:** the project has none (section 9 reads "The owner is the user."), so the proposal-reading check does not apply.

**Milestones:**
- **Discovery-3 "The expert's questions answered" and Discovery-5 "What already exists is known" are both "not reached".** This is a finding. The case says only that their research passed its source checks (line 7 and the appendix). It does not say why the owner is asked to proceed without them. The brief takes both on as standard milestones (lines 84 and 86). Add the reason, or reconsider whether they are in fact reached.
- **Discovery-1, -4 and -6 are "not recorded".** Under the rule these are not findings, and the case does not claim them reached.
- **Discovery-2, -7 and -8 are "reached".** They match the readiness PASS and the rulings.
- **Project milestones M6 to M10:**
  - They are listed in the plan (`P-005.md:72–76`) but not in the case's milestone block, which shows only Discovery lines. I cannot check that block against the tool's output.
  - Each reads as an achievement, not a task. Each has a `· why:` in plain words. None has a sprint, and none could have one before this gate.
- **M7's done-when reaches back "through the whole life of the work".** That depends on the copying job the owner has not approved (`P-005.md:182`). The readiness check asked for this to be carried into the case as a risk. The case puts it only in the folded appendix (line 92), not in the risks section. It should be moved up. The M7 wording should also say that showing older results as "no longer kept" counts as done.