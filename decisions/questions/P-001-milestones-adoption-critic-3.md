Verdict: PASS

- Every project's status visible on the phone (M1) · done when every connected project's status, and what waits on the owner, shows on the owner's phone · phase: Build · sprints: PR #40, PR #41

Passes. The name and the "done when" both describe something achieved: a status that can be seen, a thing that shows. Neither describes something someone does. It is the Universe screen from §1, which is Build output and needed to pass Build. The sprints match the pattern.

- Cards answered straight from the desk (M2) · done when each card on the desk links the owner straight to its answer · phase: Build · sprints: PR #44

Passes. It describes a result, not a task. The "done when" matches, word for word, the text in the option the owner chose ("Put back 'each card on the desk links the owner straight to its answer'"). It sits in Build, and PR #44 built it (AC16 to AC19). Two points that don't fail it:
- **The name promises more than the "done when".** The name says "answered", but the "done when" only says the card links to its answer. The commit on GitHub, which §1 makes part of answering, is left out. The owner chose this narrower wording, so it stands.
- **Owner questions are no longer named.** §1 makes both "decision cards and owner questions" answerable from the desk. The owner's wording drops questions, so no project milestone now names them. "The work is built" still covers them through S-001 AC16 to AC19, so nothing is unaccounted for. But if "card" is meant to include questions, the record should say so.

- Agent usage shown on the desk (M2B) · done when each agent session's usage and context figures show on the desk · phase: Build · sprints: PR #44, PR #52

Passes. It describes a result: figures showing on the desk. It matches §1's "Agent usage and context" item, which is in the first version by the owner's ruling, so it is needed for Build. PR #44 and PR #52 built AC22, AC23 and J10.

- What a good desk looks like is known (MD1) · done when source-checked design research sets out what a good desk looks like and why · phase: Design · sprints: Q-013

Passes. It describes a state of knowledge, and the "done when" is research that exists and has been source-checked. It is Design groundwork that MD2's choice depends on. Q-013 matches the pattern.

- The desk's look and screens chosen (MD2) · done when the owner has picked the desk's look and its screens · phase: Design

Passes. "Chosen" and "has picked" describe a choice already made, not an action still to do, in the same style as the standard "the owner has answered its short list". The scope can't be fixed before the Build gate until the look and screens are chosen.

- The chosen design running on the real back end (MD3) · done when the chosen look runs on the desk's real back end, showing real records, on its preview site · phase: Design

Passes. It describes a state reached, and the preview site makes it something you can check. The phase is Design by the owner's two rulings: at approval 9 ("Design i2 ends only once the look runs on real data") and Q2 on 2026-10-13. My earlier view that this is Build work is on record and is not raised again.

- Work ahead planned and scheduled from the desk (M3A) · done when the owner's chosen order and timing of coming work are recorded from the desk for the Chief of Staff to carry out · phase: Build · sprints: none

Passes. It describes something achieved: the choices are recorded. It is not a task for the Chief of Staff. It matches §1's "Planning and scheduling" item, which is in the first version by the owner's ruling of 2026-10-01.

Minor: "recorded from the desk" should be read the way §1 means it. The desk prepares the record and the owner commits it on GitHub by the prefilled link. Nothing acts on the choices automatically (ruling of 2026-10-04).

- The desk's value targets shown (M3B) · done when the desk shows each value target (V1 to V5) from the project document against its measure · phase: Build

Passes. It describes a result: something the desk shows. It is the re-scoped line from the owner's Q3 ruling, almost word for word, and it is distinct from "Its own monitoring and feedback works". V5 itself requires it to be "tracked and shown on the desk", so it is needed in Build.

- The desk live at the needs-you address (M3C) · done when the owner's needs-you address opens the desk on production · phase: Launch

Passes. It describes a state, and you can check it by opening the address. It matches §1's Launch item and V4, so it is needed for Launch. Two points that don't fail it:
- **It overlaps the standard "It's live".** For a desk whose only user is the owner, this is close to the overlap I raised against M3B. What still sets it apart is the takeover of a particular address.
- **The archive step is missing.** The "done when" doesn't cover archiving the old repository, which both V4 and §1's Launch item require. Unless the owner wants that step named, only V4 and the handover now track it.

"needs-you" is the Cloudflare Pages project name. It is acceptable here only because it is also the name the owner uses for the address.

**Other challenges**

1. **A failing in my own earlier check.** My second check returned PASS on a wider M2 line that did not match the owner's approved words. It added owner questions and the GitHub step. I tested only whether it read as an achievement, and I did not compare it with the owner's ruling. The sync review caught the mismatch, not me. From here on, I'll check every new or reworded line against the owner's recorded wording as well as the form.
2. **Build vs actual use.** "Recorded" (M3A) and "links ... to its answer" (M2) should be read as the capability being built and working on the preview. They should not mean that real owner choices have been recorded, which is something for after launch. Otherwise a Build milestone would depend on how the product is used, which can't happen until after launch. The wording allows the capability reading, so this does not fail them.
3. **Format.** All nine lines follow the form: name, then (M<id>), then the "done when", then the phase, in that order. None has a " · for:" item, which is correct, since none is for later work. Every " · sprints:" entry matches `(?:PR #\d+|[PQE]-\d{3,})`. No M3 line appears, which is consistent with S-023.
