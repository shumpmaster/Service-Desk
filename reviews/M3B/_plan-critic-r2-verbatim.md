# M3B plan: the Critic's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 617ec2e (the plan, draft 2).

---

Verdict: FAIL

Draft 2 (617ec2e, on aaf63fd) closes all five of round 1's blocking findings, and eight of the ten notes in full (N4 and N8 partly; see notes 1 and 4). It still fails, on three new blocking points, two of them in the filed questions. I have no shell, so I read the working tree in /home/user/sd-m3bdef as checked out and took it to be 617ec2e. Line numbers below are specs/S-001.md unless named.

**Round 1, checked**
- **B1, the public file: closed.**
  - A public file now holds only the open times, Service-Desk's own items and counts. It never holds another project's or the portfolio's item, nor a hash of one (J5 :13736-13763; J25 :16130-16131).
  - Q3 is R3, irreversible, with no default (:19517-19518), and the plain paragraph says what can't be undone (:3157-3160).
  - The hash's weakness is stated as fact, with AC73's key form (:18307-18309).
- **B2, the questions filed-ready: closed.** All six are in questions/_TEMPLATE.md's form (:19421-19642), and CS35 adds `Asked in session:` (:17302-17307). Q2's and Q3's `DEFAULT: none` reads as no default under AC12's rule (:2156-2157) and AGENTS.md:76-77.
- **B3, scope and line: closed.** Q2 is one ask with a line drafted for each scope (:3272-3296, :19460-19476). Line A names the notes and the weekly file.
- **B4, V4: closed.** The desk sets no state of its own for V4. Its address part is a fact with a date, and its state is the Chief of Staff's J25 line, judged against V4's date (:13033-13035, :13055-13060; CS34 :17295).
- **B5, portfolio cards: closed.** They are out, as are held questions while held, with a test case (:12873-12878; VT2 row :3335; facts :18310-18311).
- **N1 to N10: settled, except as notes 1 and 4 below say.**
  - The record docs/design/references/owner-request-2026-10-26-m3b-proceed.md quotes "Okay let's proceed!" as the plan does.
  - Every change note is headed "Changed for M3B", the lineage says "drafted", and the `milestones:` header (:15) still matches section 3.
  - AC83's note now gives the icon to AC97 (:8577-8578).
  - Open times keep the second (:13780-13781).
  - V3 is recorded once, in J25, with CS36 for section 6's clause.
  - The citations are corrected.
- These new citations check out: `desk-pulls-v3` is today's key (src/lib/pulls.js:16); ac87-portfolio.test.mjs:75; owner_signal.py:163-164; sandbox.js:3418-3424 and :3459-3464; J7's portfolio entry (projects.json:15).

**Blocking findings**

B1. **Question 1 leaves out the reading its own records give.**
- Its WHY and options rest on counting launch day as day 1. Then A gives 15 days to 25 November and B ends a day short (:19427-19435).
- Section 6 defines the date as "2026-11-25 (14 days after V4's date…)" (docs/PROJECT.md:180-184). That is the 14 days after launch day, 12 to 25 November, which matches both "14 days" and "25 November".
- So the WHY's premise, "the two should agree", is itself a reading, and the option that makes them agree is not offered.
- Route: Definer. Add it, and say what it does to launch-day cards.

B2. **Question 2's no-default rests on a rule the project document does not hold, and its Context misquotes it.**
- The preamble (:19415-19416) and `DEFAULT: none (a milestone's line changes only with your approval)` (:19480) say a line changes only with the owner's approval.
- Its Context cites "add one only with the owner's approval" (:19484).
- docs/PROJECT.md:69 says a reworded line needs the Critic's check "before it is committed (a rewording needs no owner ruling)". "Add one only with the owner's approval" is about new milestones.
- Asking the owner anyway is fine, as M3A did. But the question would tell the owner something untrue about their own rule. The scope choice, moving VT2 and VT3 to M3C, is a sound reason to keep no default.
- Route: Definer.
- Self-implication (D-050): yes. In round 1 I accepted the brief's framing, "an owner ruling plus a Critic check", and steered toward one ask (B3, N9) without checking section 3's text. Triage should weigh this.

B3. **After the 14 days, the row's icon is the desk's own verdict.**
- AC97 draws the green check "when none is missed" (:13013-13015). That holds even when some or all targets have no check, or only `not measured`: "<n> targets · first 14 days over · 0 met · 0 missed" gets a green check.
- This breaks AC97's own headline, "the desk calls no target met or missed itself" (:12981), and the plain paragraph's "the desk itself never calls a target met or missed" (:3151).
- Route: Definer. Show the green check only when every target's latest line is `met`, or no success mark.

**Non-blocking notes**
1. **The Chief of Staff's weekly figures are public under every answer to Q3.**
   - J25 lives in public Service-Desk and holds V1 to V3 figures, among them the owner's upkeep estimate ("25 minutes, your estimate", :16143), and device codes in `source`.
   - Yet Q3 C says "Nothing is published", and its BLAST RADIUS "under C, nothing public" (:19512, :19517).
   - The plain paragraph says "Nothing else here is irreversible" (:3159-3160).
   - The data is mild, but say so. Route: Definer.
2. Q1's WHY and Context quote "over the first 14 days after launch, 2026-11-25" for four targets (:19427, :19441-19442). V3's line reads "at most 30 minutes a week after launch, 2026-11-25" (docs/PROJECT.md:182). Route: Definer.
3. **Question 4.**
   - Its WHY says that before launch "the only part that can apply is the redesign taking more than about 2 hours a week" (:19539-19540). But V4 not met by 11 November can also apply before launch (docs/PROJECT.md:191).
   - AC97 quotes "the paragraph of section 6 that starts **Miss and stop rule:**" (:13072-13074). That paragraph runs to :206 and takes in the whole measurement design. Say where the quote ends (:194, "re-aim or stop.").
   - Route: Definer.
4. "Value targets this spec traces to" still gives V5 as docs/PROJECT.md:181 (:3554). It is now :184. Route: Definer.
5. The amendment calls the targets' place "settled, not asked (reading (a))" (:3212-3213), yet reading (a) is put to the owner in Q6 (:19594-19595). Use one wording. Route: Definer.
6. CS36 "lands before VT3 does" (:17314), but "When each opens" names only the C case (:3328-3329). Say whether the ledger clause, reading (r), also waits for VT3. Route: Definer.

**CS33: the Critic's check of question 2's lines**

Outcome: PASS for both lines. I checked them against docs/PROJECT.md:69 and the form of the M3G check (P-001-m3g-line-critic.md).

The lines checked:
- A: "The desk's value targets shown (M3B) · done when the desk's preview shows each value target (V1 to V5) from the project document against its measure, the figure where one is recorded or worked out from the records and the measure's state in words where none is yet, and the desk notes on each device what the missed-decision and false-alarm counts need and offers each week's figures for the owner to commit, each with its tests · phase: Build · why: the owner asked for the desk to show its value targets, its response time tracked and shown on it"
- B: "The desk's value targets shown (M3B) · done when the desk's preview shows each value target (V1 to V5) from the project document against its measure, the figure where one is recorded or worked out from the records and the measure's state in words where none is yet, each with its tests · phase: Build · why: the owner asked for the desk to show its value targets, its response time tracked and shown on it"

Findings:
- **Text:** both lines match :3274-3288 and Q2's options (:19461-19474) word for word.
- **Name:** unchanged, plain English, an achievement, with no code but the id in its place.
- **"Done when":**
  - Both read as states reached on the preview, with tests, not tasks.
  - In A, "notes" and "offers" describe what the desk does, not work someone does.
  - Each matches its scope: A needs VT1 to VT3, so it can't be reached with its own steps unbuilt; B needs VT1 alone, with VT2 and VT3 carried as M3C's.
  - Both hold under either answer to Q1, Q4 and Q5, and under any answer to Q3: under B, counts only, the desk still "offers each week's figures".
- **Phase:** Build fits, and each is needed before the Build gate.
- **Why:** present, plain, with no " · " inside, and true to the records: V5's "tracked and shown on the desk", a target the owner added (:3538-3547), and the owner's pick "criteria for M3B" (P-001-trial-view-notes-2.md:168).
- **For the Chief of Staff:**
  - By docs/PROJECT.md:69, a rewording needs only this check before it is committed. The owner's answer to Q2 settles the scope.
  - When committing, name this check and the answer in the milestones' heading (CS33 :17281-17286).
  - Not blocking: the why says who asked rather than what it is for, and "its response time tracked and shown on it" reads awkwardly. A plainer form would be "the owner wants to see on the desk whether it is meeting its targets, its response time among them".

Files:
- /home/user/sd-m3bdef/specs/S-001.md
- /home/user/sd-m3bdef/docs/PROJECT.md
- /home/user/sd-m3bdef/docs/design/references/owner-request-2026-10-26-m3b-proceed.md
- /home/user/sd-m3bdef/questions/_TEMPLATE.md
- /home/user/sd-m3bdef/AGENTS.md
- /home/user/sd-m3bdef/governance/checks/governance_checks.py
- /home/user/sd-m3bdef/governance/checks/owner_signal.py
- /home/user/sd-m3bdef/src/config/projects.json
- /home/user/sd-m3bdef/src/lib/pulls.js
- /home/user/sd-m3bdef/src/public/sandbox.js
- /home/user/sd-m3bdef/tests/desk/ac87-portfolio.test.mjs
- /home/user/sd-m3bdef/decisions/questions/P-001-m3g-line-critic.md
