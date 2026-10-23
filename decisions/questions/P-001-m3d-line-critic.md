# The Critic's check of the follow-up milestone line (M3D), 2026-10-23, verbatim

The Chief of Staff's first draft failed this check; the line the owner approved (decisions/questions/P-001-m3d-line.md) is the corrected wording the Critic gives below, filed unchanged.

---

Verdict: FAIL

The line can't go to the owner as drafted. Its "done when" covers only the audit's fixes and four design answers, but the work it would sit over has more in it. Three findings block it, four don't.

**Blocking**

1. **It does not cover the stages truthfully.** The owner's question was whether the work after MD3 should get its own milestone. This line covers only part of that work:
   - **Stage 6b** (how the desk loads, notification taps, EXP-004's panel words, AC89 (m)) comes from stage 8's review, not the audit.
   - **Stage 7** (a Done portfolio card kicked back in about 5 minutes) comes from the 19 Oct ruling in P-001-board-bounce.md. The audit lists it under "Not rechecked today", not as a fix.
   - **Stage 8** is "Nothing on screen: tests and tools only", so it can never "show on the desk's preview".
   - **Other stages carry non-audit work too:** stage 4's AC49 (lanes never look alike) comes from the lanes ruling, and AC89 (h)–(k) in stages 1, 2, 5 and 6a are review follow-ups.

   The line breaks the rule that "done when" says what is achieved, because it leaves these out. Widen it (corrected wording below), or say plainly that 6b, 7 and 8 carry `Milestone: none`. That second route would need its own word to the owner, since option A was put as a milestone for the work after MD3.

2. **"your design answers" in the name is not the owner's name for it.** The line lives in the project document, where every other line says "the owner". Its own "done when" also says "the owner's". "Small fixes" also undersells the work: keeping typed words across a reload and moving the copy route are not small fixes.

3. **"the owner's four design answers of the same day" is ambiguous.** The owner gave at least five design answers on 22 Oct: repeat, copy, team and reload, plus P-001-desk-v2-lanes.md, which stage 4 builds. A stranger can't tell which four are meant. Name them in words.

**Not blocking**

4. **Why:** plain, no " · " inside, no gendered pronoun ("their" is fine). It just says the owner wants it, which is enough here since the owner asked for it. Widen it to match the new scope.

5. **Phase:** Build is right. MD3 (Design) is reached, M3A and M3B are Build, the work must land before M3C (Launch), and the option the owner picked said Build.

6. **Id:** M3D is not used in docs/PROJECT.md or any record. It does appear as a made-up dropped milestone in test fixtures: tests/desk/j4-j14-j15-work-ahead.test.mjs:105, tests/desk/ac24-work-ahead.test.mjs:587 and tests/desk/fixtures/README.md:376 (in /home/user/sd-def-md3-after). It is also easy to misread as MD3, the line above it. It follows M3A to M3C, so keep it, but the Chief of Staff should know.

7. **Form:** "in place" and "show on the preview" read as achievements, not tasks. Placing it before M3C is part of what the owner approves.

**Corrected wording (one option)**
- The desk's faults fixed and the owner's design answers built (M3D) · done when the faults found by the 22 October design audit and by the reviews of the new desk are fixed, a Done portfolio card is kicked back within about 5 minutes, and the owner's 22 October answers (a "not yet" reason said once per group, Copy inside each choice's box, idle team members on one line, typed words and scroll kept across a full reload, and lanes open together never looking alike) show on the desk's preview, each with its tests · phase: Build · why: the owner wants the faults found since the new look went in fixed, and their design choices built, before the desk goes live

**What I read from:** I have no git tool, so I couldn't read origin/main itself. I read section 3 from the working trees in /home/user/Service-Desk and /home/user/sd-def-md3-after. The Service-Desk tree looks out of date: it has neither the question file nor the audit. The sd-def-md3-after copy's rules add only the S-033 ` · reached:` clause, which doesn't change this check. Records checked:
- /home/user/sd-def-md3-after/specs/S-001.md (stage table at lines 2315–2325, item 37 at line 2243, AC89 at line 7775 onward)
- /home/user/sd-def-md3-after/docs/design/audit-2026-10-22.md (section 4)
- /home/user/sd-def-md3-after/decisions/questions/P-001-audit-repeat.md, P-001-audit-copy.md, P-001-audit-team.md, P-001-audit-reload.md, P-001-desk-v2-lanes.md and P-001-board-bounce.md