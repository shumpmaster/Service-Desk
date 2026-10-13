Verdict: FAIL

- See every project's status on my phone (M1) · done when the owner sees, on the phone, every connected project's status and what waits on them · phase: Build · sprints: PR #40, PR #41

FAIL. The name is an instruction in the owner's voice ("See …"). The "done when" ("the owner sees …") describes something someone does, not something achieved. The substance fits Build: it is the universe screen from §1, phone first. A rewording that keeps it: "Every project's status readable on the phone · done when every connected project's status, and what waits on it, shows on the owner's phone".

- Answer my cards and see agent usage from the desk (M2) · done when the owner's answers to cards are made from the desk and each agent session's usage is shown there · phase: Build · sprints: PR #44, PR #52

FAIL. The name is two instructions ("Answer …", "see …"). It also joins two separate achievements in one line, against the rule of one per line. The "done when" contradicts §1: there the desk prepares the answer and the owner commits it on GitHub, so answers are not "made from the desk". Owner questions are left out, though §1 puts them next to cards. Agent usage depends on the D7 change to the operating model (§1), and this line names no such dependency. It should be two milestones: one for cards and questions answerable from the desk, one for agent usage shown. Before PR #52 is cited as building the usage view, check that D7 has landed.

- Know what good looks like (MD1) · done when checked design research says what a good desk looks like · phase: Design · sprints: Q-013

FAIL. The name is an instruction ("Know …"). The "done when" is an achievement, but "what a good desk looks like" is too vague to tell when it is reached. The sprints field misuses the form: it should list sprints such as "PR #40", and Q-013 is a question record, not a sprint. Its place in Design is defensible, since the research feeds the criteria the Build gate approves. A possible rewording: "A good desk described from checked research".

- The desk's look and screens chosen (MD2) · done when the owner has picked the desk's look and its screens · phase: Design

PASS. The name is a plain achievement, and "has picked" is a state reached, not an ongoing task. It belongs in Design: the chosen screens shape the criteria by scenario, and the Build gate depends on those.

- The chosen design running on the real back end (MD3) · done when the chosen look runs on the desk's real data on the preview · phase: Design

FAIL on phase. It reads as an achievement, but running the design on real data is built work. The model says Build stage 4's locked checks are "written independently before any work", so build work done in Design comes before the checks it should be held to. Design's gate needs criteria, join sheets and a reviewed plan, not running code, so this is not needed to reach that gate. If it is meant as a feasibility prototype, it should be a registered experiment with a fallback. Otherwise it should move to Build, which takes the owner's ruling. The name and the "done when" also disagree ("real back end" against "real data"), and "the preview" is not defined anywhere in the brief.

- Work ahead planned and scheduled from the desk (M3A) · done when the order and timing of coming work are set from the desk · phase: Build

PASS, with one challenge. It reads as an achievement, it is in Build, and it matches §1's planning and scheduling. The challenge: "set from the desk" can be read as the desk scheduling the work, which the owner's ruling of 2026-10-04 rules out (no Orchestrator acts on it automatically). A clearer wording: "the owner's chosen order and timing are recorded from the desk for the Chief of Staff to carry out".

- The desk shows whether it does what it promised (M3B) · done when the desk shows its own value measures against their targets · phase: Build

FAIL. It reads as an achievement, but it is not the project's own milestone. §4 says the product's own monitoring, feedback and review are covered by the standard milestones "The work is built" and "Independently reviewed and passing", and confirmed by "Its own monitoring and feedback works". Project milestones must be the project's own. §1 also lists no value-measure screen in scope. If the owner wants this as a feature, §1 needs it first; if not, the line should be dropped as a duplicate.

- The desk live at the needs-you address (M3C) · done when the owner's needs-you address opens the desk on production · phase: Launch

PASS. It is an achievement, it is in Launch, and it is needed for the Launch gate: it is §1's takeover of the Operations-Hub address. "needs-you" is the address name the owner uses, not a code. It is specific enough not to repeat "It's live".

Other challenges:
- **Scope gap at launch:** §1 puts archiving the old repository (L-0115) in Launch, and no milestone covers it. M3C covers only the address.
- **Phases with no milestone:** Discovery has none. If the rule's "at least one … in each phase" means one per phase, Discovery fails. If it means one in total, it is fine. The Chief of Staff should settle which reading applies.
- **IDs:** the mixed scheme (M1, MD1, M3A) fits the `(M<id>)` form. Even so, M3A to M3C sit under no M3, which suggests an M3 was split. If an M3 ever existed, it must be kept and ended with ` · dropped`, not deleted or renumbered.
- **Unclaimed scope:** "Team and pipeline" and "Time asked of the owner" belong to no milestone. This is allowed, but they will have no achievement tracked on the timeline.
