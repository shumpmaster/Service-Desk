Verdict: PASS

The line checked:

- The desk's faults fixed and the owner's design answers built (M3D) · done when the faults found by the 22 October design audit and by the reviews of the new desk are fixed, a Done portfolio card is kicked back within about 5 minutes, and the owner's 22 October answers (a "not yet" reason said once per group, Copy inside each choice's box, idle team members on one line, typed words and scroll kept across a full reload, and lanes open together never looking alike) show on the desk's preview, each with its tests · phase: Build · why: the owner wants the faults found since the new look went in fixed, and their design choices built, before the desk goes live


The line, quoted whole as it stands at /home/user/sd-a-after5/docs/PROJECT.md:114:

"- The desk's faults fixed and the owner's design answers built (M3D) · done when the faults found by the 22 October design audit and by the reviews of the new desk are fixed, a Done portfolio card is kicked back within about 5 minutes, and the owner's 22 October answers (a "not yet" reason said once per group, Copy inside each choice's box, idle team members on one line, typed words and scroll kept across a full reload, and lanes open together never looking alike) show on the desk's preview, each with its tests · phase: Build · why: the owner wants the faults found since the new look went in fixed, and their design choices built, before the desk goes live"

Findings:
- **Achievement, not a task:** the name and the "done when" both say what is achieved ("fixed", "built", "kicked back", "show on the desk's preview"). Nothing in it is something someone does. The name is in plain words the owner would use.
- **No codes or ids:** the only id is in the (M3D) slot. "Done" is a card state, not a code.
- **Covers every stage, truthfully** (checked against the stage table, /home/user/sd-def-md3-after/specs/S-001.md:2315-2325, and the (b) list at 2180-2250):
  - Stages 1, 6a and 6b, and the focus and Tab parts of stage 2, are covered by "the faults found by the 22 October design audit and by the reviews of the new desk". The (b) items each cite either the audit or a stage review.
  - Stage 2's reload work is "typed words and scroll kept across a full reload". Stage 3 is the "not yet" reason. Stage 4 is the idle line and the lanes. Stage 5 is Copy.
  - Stage 7 is the Done card kicked back (item 25). Its J23 part (template files and README not counted) is a review finding (item 26), so the "faults" clause covers it.
  - Stage 8 is tests and tools only. All of its item 37 points are review findings, so "faults found by … the reviews … fixed, … each with its tests" covers it. That is a broad reading, but a fair one.
- **The why:** plain words, with no " · " inside.
- **Phase and id:** Build is right; this is build work before the Launch milestone M3C. M3D appears in no real record. It appears only in made-up test fixtures (tests/desk/j4-j14-j15-work-ahead.test.mjs, tests/desk/ac24-work-ahead.test.mjs, tests/desk/fixtures/README.md), which is not a clash.
- **No gendered pronouns:** "their" is used for the owner.
- **Word for word:** the line matches the approved line in /home/user/sd-a-after5/decisions/questions/P-001-m3d-line.md:13 exactly. It is placed just before M3C, as that ruling says.

Non-blocking notes:
1. The line calls all five answers the owner's "22 October answers". The lanes part ("lanes open together never looking alike") is worded from the 23 October ruling, decisions/questions/P-001-lanes-alike.md. That ruling narrowed the 22 October one in P-001-desk-v2-lanes.md ("every lane looks different"). The 22 October answer is still the source, so I don't count this as untrue. If the line is reworded later, "22 and 23 October answers" would be exact; a rewording needs only the Critic's check.
2. Two places don't yet show M3D, though they are outside this line:
   - The spec's "The milestone each serves" (S-001.md:2327-2340) still says it is awaiting P-001-after-md3-milestone.md, with default B. Each stage's pull request should carry M3D from now on.
   - The approval sources line above the milestone list (PROJECT.md:105) does not cite P-001-m3d-line.md.
3. An earlier Critic record exists, decisions/questions/P-001-m3d-line-critic.md. I did not rely on it, and this check does not judge it.
---

*Recorded verbatim by the Chief of Staff on 2026-10-23. A fresh Critic session made this check, not the one that wrote the corrected wording (decisions/questions/P-001-m3d-line-critic.md). The "The line checked" block repeats the line the report quotes, so the milestones check can find it at the start of a line.*
