# S-001 after the glance audit: the Critic's round 3, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/definer/glance-plan at 878caf9.

---

Verdict: PASS

Draft 3 at 878caf9 fixes both of my round-2 blocking findings and notes A to I. The new count class is a fair reading of the ruling and is already put to the owner, and the M3E and M3F lines meet the milestone standard. Six non-blocking notes remain (below). The one that matters most is note 1, on what "an item of its own" costs the owner. I have no shell, so I ran no diff. I read the amendment, AC92, AC93, the open questions and the brief's glance section in /home/user/sd-definer/specs/S-001.md, and checked them against the template in the operating-model repository, its OPERATING_MODEL.md, S-023, and Service-Desk's docs/PROJECT.md.

**What holds**
1. **Round-2 finding 1 is fixed.**
   - M3F is always later work, ` · for: <the item filed for it>`, and never a milestone of this project's Build phase. The same holds in the milestone paragraph (:2603-2609), question 1 B (:15993-15999), question 2 A (:16008-16010) and the brief (:16585-16587).
   - The Build alternative and its consequence are stated plainly: "it would then be a condition of the Build gate, which would wait for G10" (:16000-16002).
   - Question 1 A's consequence is also stated (:15979-15981).
   - The recommendations agree: B in question 1, A in question 2, and the plain paragraph (:2413-2416).
   - The model allows later work before the first item is done (S-023 :621, "Nothing now refuses later work because the earlier project is not done"). So "before launch or after it" (:2609) holds.
2. **Round-2 finding 2 is fixed.**
   - (e) is marked C at :8663-8664, :8685 and :8686.
   - (f), (g) and (i) fall under the class order's C at :8749-8750, with (g) restated at :8762-8763 and :8773.
   - (h) is marked C at :8863-8864.
   - All five are in question 4 (:16036-16051), each standing unless the owner says otherwise.
   - The "settled by the rulings" line is corrected: the readings now sit under "Not settled by them" (:2536-2541).
3. **Notes A to I are fixed.** A: :8863-8864 and 4 (h). B: "the pieces of work within each sprint apart" (:15985). C: the paragraph leads with the failed rounds (:2384-2386). D: ", <z> running" (:8816). E: one sprint form everywhere (:8800-8803, :8879). F: :8886-8888. G: :8947-8949. H: marked E, "no record gives these times" (:16012-16015). I: y, x and z on the CI line, h for (d)'s per-run count.
4. **The new count class, class 5 (:8767-8773), is faithful.**
   - The ruling says "the unused standard ones said in words", and the owner complained of "0 out of X … Even on phases we've fully completed". Leaving out of the total the ones the model cannot record, or whose phase finished with nothing recorded, and naming them in words, fits both.
   - It does go beyond the ruling's letter, because a taken-on line is not "unused" in the section-3 sense. It is marked C and put to the owner as 4 (g), with the finished-phase branch named.
   - The worked case is consistent with the test cases (:8778-8781, :8907-8910).
   - The example "4 tracked · 4 not tracked" holds, because Service-Desk's section 3 has no standard lines yet.
5. **The milestone lines meet the standard.**
   - M3E (:15984-15991): the name is an achievement; the "done when" is a state achieved on the preview, not a task; phase: Build, placed before M3C (Launch); a plain why with no ` · ` inside it.
   - M3F (:15994-15997): an achievement; ` · for:` after the phase and before the why, in the template's order; a plain why. Its phase, Build, is the filed item's own Build phase, so it is needed for that item's gate.
   - The placeholder must become a real `P-<n>`. The Critic checks the actual line before filing (:15975-15976).
6. **The owner's paragraph** (:2384-2418) leads with the failed rounds and says nothing was skipped. It is plain, with no paths or ids, says none of it is irreversible, and its "nine readings" matches question 4's (a) to (i).

**Blocking findings**
None.

**Non-blocking notes**
1. **"An item of its own" has costs the owner isn't told.**
   - Evidence: :15993-15999, :2604-2613, :2566-2567, :16607-16609; OPERATING_MODEL.md :116.
   - Under the model, a new project item goes its own way through the phases. Add-on work "starts a new Discovery, scaled to its size", and the Chief of Staff proposes which route and the owner approves. The template also has the item's own spec name M3F in its header.
   - Question 1 B never says that G10, as its own item, may bring its own gates for the owner to rule.
   - The amendment also keeps G10 and AC93 in this spec ("a draft after S-034 freezes"). It doesn't say whether S-001's header would name M3F or whether the item gets a spec of its own. S-023 :605 says the first item's merge is never tied to a ` · for:` milestone.
   - Route: the Chief of Staff, when filing question 1, should state the item's likely route and its extra gate rulings under BLAST RADIUS. The Definer, in the next draft, should say which spec plans G10 once the item is filed. The Critic reads that card cold (D-019).
2. **Stale CI letters at :2544.** It still says "<k> of <n> workflows passed", but AC92 (c) now uses "<y> of <x>" (:8816).
3. **Test (c) leaves out o** (:8903 lists "k, q, j and e"), though its cases include class 5. It should assert o too.
4. **(d)'s per-run wording doesn't match class 5.** Class 5 also covers a recordable taken-on milestone whose phase finished with nothing recorded (:8767-8768). (d) equates class 5 with "the model can't record" (:8835-8837), so in an earlier run such a row could fall into the fold as "not recorded yet" rather than "taken on · not recorded by the model". Say which.
5. **M3F's "done when" says "each sprint's planned pieces of work show done of total"** (:15994-15995). AC93 shows "pieces not recorded" for sprints with no list (:8960-8961). Consider "each sprint that lists its pieces of work" when the real line is drafted.
6. **Reading (b)'s place in AC93 has no C mark** (:8962-8964), though question 4 says each reading is "marked C where it is written".

**Open questions**
- For the Chief of Staff and the Definer, under note 1: when G10's item is filed, is it planned in S-001 or in a spec of its own, and which phases and gates does it go through?

**Self-implication (D-050):** yes. Note 1 implicates my round-2 check: its route offered M3F as ` · for:` later work without saying what an item of its own costs the owner, or which spec then plans it. Whoever runs Triage should weigh that.

Files:
- /home/user/sd-definer/specs/S-001.md
- /home/user/sd-definer/docs/PROJECT.md
- /home/user/Personal-Org-Operating-Model/template-v3/docs/PROJECT.md
- /home/user/Personal-Org-Operating-Model/OPERATING_MODEL.md
- /home/user/Personal-Org-Operating-Model/specs/S-023-six-phases.md
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews/_plan-critic-r2-verbatim.md
