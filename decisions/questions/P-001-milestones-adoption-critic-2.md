Verdict: PASS

- Every project's status visible on the phone (M1) · done when every connected project's status, and what waits on the owner, shows on the owner's phone · phase: Build · sprints: PR #40, PR #41

Passes. Both the name and the "done when" describe a state that has been reached (status is visible and shows on the phone), not something someone does. This is the core of the Universe screen in section 1, the phone is the first target named in "Where it must work", and it belongs in Build before the Launch gate. The sprints part fits the pattern.

- Cards answered straight from the desk (M2) · done when each decision card and owner question on the desk links the owner straight to its answer, filled in for the owner to commit on GitHub · phase: Build · sprints: PR #44

Passes. It describes a state reached and matches section 1's "answerable from the desk: the desk prepares the answer and the owner commits it on GitHub". After the split, it holds one achievement. The "done when" is narrower than the name: the cards link to a prefilled answer, and the answering itself happens on GitHub. That is faithful to §8 "act", so it is not a defect. PR #44 built AC16 to AC19 and was reviewed with a PASS.

- Agent usage shown on the desk (M2B) · done when each agent session's usage and context figures show on the desk · phase: Build · sprints: PR #44, PR #52

Passes. It describes a state reached, it is a single achievement, and it is in scope by the owner's ruling of 2026-10-04. PR #44 and PR #52 built AC22, AC23 and J10, and both passed review. See challenge 3 on D7.

- What a good desk looks like is known (MD1) · done when source-checked design research sets out what a good desk looks like and why · phase: Design · sprints: Q-013

Passes. It describes knowledge held, not research being done, and the "done when" names a result (research that sets out the answer). It is needed before the owner can choose the look in MD2. It is project-specific design research, so it does not duplicate the Discovery milestone "What already exists is known". `Q-013` fits `[PQE]-\d{3,}`.

- The desk's look and screens chosen (MD2) · done when the owner has picked the desk's look and its screens · phase: Design

Passes. "Has picked" describes a decision that has been made, not a task. The spec cannot freeze before the Build gate without it.

- The chosen design running on the real back end (MD3) · done when the chosen look runs on the desk's real back end, showing real records, on its preview site · phase: Design

Passes. It describes a state reached. I still hold that running on real data is Build-shaped work, but the owner has ruled twice that Design i2 ends only once the look runs on real data (S-023 approval 9, and Q2 of 2026-10-13). By that ruling it is needed to reach the Build gate. Changing its phase is the owner's call, not mine, so I am not failing it on phase. My view stays on record.

- Work ahead planned and scheduled from the desk (M3A) · done when the owner's chosen order and timing of coming work are recorded from the desk for the Chief of Staff to carry out · phase: Build

Passes. "Planned and scheduled" and "are recorded" describe a state reached. It is in section 1 by the rulings of 2026-10-01 and 2026-10-04, and it rightly leaves out automatic action by an Orchestrator. One small wording point, not a failure: "recorded from the desk" should read the same way as M2. By section 1, the record lands only when the owner commits the prefilled link on GitHub. "Recorded through the desk" or "filled in from the desk for the owner to commit" would say that more exactly. If the line is reworded, I need to check it again before it is committed.

- The desk's value targets shown (M3B) · done when the desk shows each value target (V1 to V5) from the project document against its measure · phase: Build

Passes on form. It describes a state reached, it is a single achievement, and it is now distinct from "Its own monitoring and feedback works", as the owner's re-scope ruling (Q3) intended. Challenge 1 is a scope problem this line raises; it has to be fixed in section 1, not in this line.

- The desk live at the needs-you address (M3C) · done when the owner's needs-you address opens the desk on production · phase: Launch

Passes. It describes a state reached, and it is needed for the Launch gate (V4, and section 1's "Launch"). It is the project's concrete version of the standard "It's live", which is acceptable. "needs-you" is the address's name as the owner uses it, not a code, so the name passes the no-codes rule. That is a judgement call, and I am noting it as one. See challenge 2 on the archive.

**Other challenges that matter**

1. **M3B goes beyond section 1's scope.** Section 1's "In" list does not include showing the value targets. Only V5 ("tracked and shown on the desk", in section 6) commits the desk to showing one. Showing V1 to V4 is new scope, and so far it rests only on the Q3 ruling. Section 1 should record it, citing that ruling, so the brief does not contradict itself.
   - Two parts of its "done when" are hard to meet as written. V2 (whether a flagged item really needed the owner) and V3 (the owner's time on upkeep) cannot be read from records alone. V1, V2, V3 and V5 are also measured over the 14 days after launch, so in Build the desk can show only the target and how it will be measured, not a result.
   - The spec should say what "against its measure" means before launch. Otherwise this milestone can't be shown reached in Build.

2. **No milestone covers archiving the old repository.** V4 and section 1's "Launch" both need the Operations-Hub repository archived (L-0115), and M3C covers only the address. The standard milestones may cover it through the handover, so I am not failing anything. But the owner should know that no project milestone shows that half of V4.

3. **M2B depends on D7.** Section 1 says the usage figures need the operating-model change D7, because the Orchestrator does not record tokens or context today. If D7 has not landed, PR #44 and PR #52 may have built the display without real figures to show. Before M2B is shown as reached, its records should confirm real sessions' figures appear on the desk.

4. **The listing order mixes phases.** Build lines (M1, M2, M2B) come before Design lines (MD1 to MD3), then Build and Launch follow again. The rule puts project milestones after the standard ones in each phase, so I would expect them grouped Discovery, Design, Build, Launch. The order can change only by the owner's ruling, so this is for the Chief of Staff to raise with the owner, not a failure here.

5. **Discovery has no project milestone.** The rule asks for "at least one" project milestone, and it reads as applying per phase ("after the standard ones in each phase"). If so, the brief would need a Discovery milestone. The project was approved before milestones were part of the form, and Discovery is behind it, so I am raising this for the owner, not failing on it.

6. **Self-check against my first review.** The scope gap in challenge 1 is new: it comes from the Q3 re-scope, so my first check could not have missed it. I am not reversing my earlier view on MD3. I am passing it only because the owner has ruled on its phase.
