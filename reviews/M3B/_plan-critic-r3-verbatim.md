# M3B plan: the Critic's round 3 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at cc2d826 (the plan, draft 3).

---

Verdict: PASS

Draft 3 (cc2d826) closes all three of round 2's blocking findings and all six of its notes, and I found nothing new that blocks. Two small notes remain for the Definer. I have no shell, so I read the working tree in /home/user/sd-m3bdef as checked out and took it to be cc2d826. Line numbers below are specs/S-001.md unless named.

**Round 2, checked**
- **B1, question 1's readings: closed.**
  - Q1 now offers A, 12–25 Nov (recommended); B, 11–24 Nov; and C, 11–25 Nov, 15 days. Each says what it does to launch-day cards and to the sheet's words (:19569-19578).
  - The quotes match the project document: "V4's date plus 14 days" (docs/PROJECT.md:188-189), and V3's own words (:182).
  - AC97 gives each reading's words, "of 14" or "of 15" (:13049-13067), and VT1's row tests all three (:3346).
  - `DEFAULT: A` matches its "Left unruled" line.
- **B2, question 2's rule: closed.**
  - The amendment, Q2's WHY, its Context and CS33 now cite docs/PROJECT.md:69 correctly: "a rewording needs no owner ruling" (:3270-3274, :19602-19604, :19623-19624, :17398-17400).
  - The question is asked anyway, because the same answer settles the scope.
  - R1, reversible, `DEFAULT: A`, `TIMEOUT: 168` agree with AGENTS.md:76.
  - Its Context gives both lines word for word, matching :3281-3295.
- **B3, the row's icon: closed.**
  - One rule at every time (:13090-13095): a red cross if any target is `missed`; the green check only if every target is `met`; the half circle if any is on track or met; otherwise the ring.
  - The row's parts count every target, a + b + c + d + e being the number of targets (:13072-13075).
  - VT1's row tests the green check's absence with 3 met and 2 on track, and after the window with no checks (:3346).
  - The plain paragraph and reading (h) say the same (:3151, :19778-19781).
- **Notes 1 to 6: settled.**
  - J25's public figures are named in the plain paragraph (:3160-3162), in Q3 (:19669-19671, its BLAST RADIUS :19675) and in Risks (:18936).
  - Q1 quotes V3 in its own words.
  - Q4's WHY names V4's date (:19700-19701). Its quote ends at "re-aim or stop.", which matches docs/PROJECT.md:191-194, and AC97 :13159-13165 agrees.
  - "Value targets this spec traces to" now gives docs/PROJECT.md:184 (:3599).
  - Reading (a) is put to the owner in Q6, and the "settled" wording is gone (:3215-3216, :19553).
  - CS36's ledger clause waits for nothing in the build (:17435-17437, :3339-3340).
- **Also checked:** `sheetFoot` exists (sandbox.js:3083), and the lineage carries a draft-3 entry.

**Non-blocking notes (Definer)**
1. **Under Q1's recommended A, the row and the sheet name different start days.**
   - The row's launch-week words are "Measured since <launch date>" (:13080), drawn in CS32 as "Measured since 11 Nov" (:17373-17374).
   - Under A the window starts on 12 Nov, and the sheet says "Measured from 12 Nov" (:13056).
   - Use the window's first day on the row, or say that launch day isn't counted.
2. **Under Q1's C, the row's words read awkwardly.** "<window words>" goes into the row as "<n> targets · Launch day and the 14 days over · …" (:13064, :13085), with a capital mid-line and odd grammar. Give C its own row words.

**Self-implication (D-050):** none new. Round 2's flag on B2 stands as recorded.

**CS33: the Critic's check of question 2's lines (draft 3)**

Outcome: PASS for both lines. I checked them against docs/PROJECT.md:69 and the form of the M3G check (P-001-m3g-line-critic.md).

The lines checked:
- A: "The desk's value targets shown (M3B) · done when the desk's preview shows each value target (V1 to V5) from the project document against its measure, the figure where one is recorded or worked out from the records and the measure's state in words where none is yet, and the desk notes on each device what the missed-decision and false-alarm counts need and offers each week's figures for the owner to commit, each with its tests · phase: Build · why: the owner wants to see on the desk whether it is meeting its targets, its response time among them"
- B: "The desk's value targets shown (M3B) · done when the desk's preview shows each value target (V1 to V5) from the project document against its measure, the figure where one is recorded or worked out from the records and the measure's state in words where none is yet, each with its tests · phase: Build · why: the owner wants to see on the desk whether it is meeting its targets, its response time among them"

Findings:
- **Text:** both lines match :3281-3295 and Q2's Context (:19625-19637) word for word.
- **Name:** unchanged, plain English, an achievement, with no code but the id in its place.
- **"Done when":**
  - Both read as states reached on the preview, with tests, not tasks.
  - Each matches its scope: A needs all three steps, so M3B can't be reached with any of them unbuilt; B needs the first step alone.
  - Both hold under every answer to Q1, Q3, Q4 and Q5.
- **Phase:** Build fits, and each is needed before the Build gate.
- **Why:**
  - Present, with no " · " inside, and plain words that say why the project needs the milestone.
  - It is true to the records: V5's "tracked and shown on the desk", a target the owner added (:3583-3592), and the owner's pick "criteria for M3B" (P-001-trial-view-notes-2.md:168).
  - The draft-2 why was changed, which counts as a rewording, so this check covers the lines as they now stand.
- **For the Chief of Staff:**
  - By docs/PROJECT.md:69, this check is all a rewording needs before it is committed.
  - Commit line A or B as the owner answers, or line A if Q2 defaults at its timeout. With C, commit nothing.
  - Name this check and the answer record in the milestones' heading (CS33 :17394-17404).

Files:
- /home/user/sd-m3bdef/specs/S-001.md
- /home/user/sd-m3bdef/docs/PROJECT.md
- /home/user/sd-m3bdef/AGENTS.md
- /home/user/sd-m3bdef/src/public/sandbox.js
- /home/user/sd-m3bdef/decisions/questions/P-001-m3g-line-critic.md
