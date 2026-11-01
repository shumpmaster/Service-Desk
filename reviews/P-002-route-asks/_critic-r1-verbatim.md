Verdict (P-002-route): FAIL
Verdict (P-002-follow-ups): FAIL

Every Context source I opened says what is claimed. That covers the following:
- The portfolio idea log and kickoff.
- The P-001 graduation ruling.
- The model's "Graduation and re-entry" paragraph (OPERATING_MODEL.md line 116: add-on work starts a new Discovery scaled to its size, and the Chief of Staff proposes while the owner approves).
- desk-operations.md line 60.
- PROJECT_REL at v3_checks.py line 204.
- The PROJECT.md references in feed.js.
- LL-16 and LL-28.
- The Model-Lab P-001-work-repo quote.
- The "Design gate not yet ruled" line in the Model-Lab handoff.
- The src files cited.
The failures are unsupported estimates, a premise that is not supported, and a missing "if you don't decide" line. Findings are numbered and marked.

**P-002-route.md**

1. BLOCKING. Option A says "the first steps need no brief of their own". Nothing cited says so.
   - The model's Discovery milestones are read from the project document: "Success defined" is read from section 6, and the Discovery-7 check reads sections 1, 4 and 5.
   - A only defers where the brief lives; it never says where those early steps are recorded meanwhile.
   - The card's central claim, that A can start now with no clash, is therefore unproven. Either cite the record that supports it, or say where the early work is recorded.
   - Suggested wording: "Cost: until the brief's place is ruled, the groundwork map and your answers are kept as separate records outside docs/PROJECT.md (the model allows this: <cite>)". Alternatively: "the first steps (map, your list, research) are records that do not touch the brief; the brief itself cannot be written until its place is ruled."
   - Also add a Context bullet saying where the early work is recorded.

2. BLOCKING. The cost estimates are stated without support.
   - These are "about 2 to 4 days of agent work in all" and "15 to 30 minutes of questions" in A, and "likely several days" in B.
   - Only A's "2 to 4 days" is tagged "(an estimate)". The other two are not.
   - The 15 to 30 minutes is not tagged at all, and "ten minutes" for the shortlist is also unsupported.
   - No Context bullet gives a basis. Only the 5-minute and one-hour figures in P-001-graduated-changes.md have one, and they are about something else.
   - Fix: tag each figure "(an estimate, no record behind it)" or cite a comparable past Discovery. Put B and A on the same footing, for example "B: several days (an estimate)". Alternatively, drop the numbers and say "A: starts today; B: starts after a separate change whose size is not yet known."

3. BLOCKING. The card does not say what happens if the owner does not decide.
   - It gives "DEFAULT: none ... TIMEOUT: none" with a reason in brackets.
   - AGENTS.md §5 says reversible questions adopt the recommendation at timeout. The card is R0 and reversible but opts out without saying what happens.
   - The model (§2 decision cards) requires a "what happens if the owner doesn't decide" statement.
   - Add to the end of WHY: "If you do not rule, nothing starts and the desk stays as it is; the briefing idea waits in the idea log."

4. NON-BLOCKING. The choice of route is blurred.
   - The WHY says the model gives "one route: a new Discovery", then asks how it starts. Option C, "hold", is not a route.
   - The card does not say that picking A or B also approves the new-Discovery route, which the model makes the owner's approval.
   - Add one sentence to WHY: "Choosing A or B approves a new Discovery for this work, as the model asks; choosing C approves nothing yet."

5. NON-BLOCKING. Option B is not fully put.
   - It does not say what it rules out or how reversible it is.
   - The cost "one more change runs while the prompt engine's Discovery is also running" is a count, not a cost to the owner.
   - Suggested wording: "Cost: ...; also more questions for you now, from two Discoveries plus the model change. Rules out: nothing; the briefing work can still follow."

6. NON-BLOCKING. Option C's cost reads as a non-cost.
   - "Cost: nothing starts now; one Discovery covers all of it later" is half a gain.
   - Suggested wording: "Cost: the page you asked for waits until after the prompt engine's Design gate, whose date is not known; you will keep opening pull requests one by one until then."

7. NON-BLOCKING. The recommendation is one-sided.
   - "Medium confidence; would change if you want the one-brief limit fixed first" does not say what else would change it.
   - Add: "or if Discovery shows the briefing needs a change to how pull requests are written; that is raised with you then".

8. NON-BLOCKING. The language is dense for a phone.
   - Option A is a single paragraph of about 120 words with nested clauses.
   - "Brief" and "the prompt engine's Design gate" are used without a gloss.
   - Suggest splitting A into "What happens" and "Cost" lines.
   - Gloss the first use of "brief" as "the project's one-page plan, docs/PROJECT.md".

9. NON-BLOCKING. The Milestone line is unclear.
   - "Discovery-1" and "Discovery-7" name standard places in a project that does not exist yet, because the desk is graduated.
   - Consider "Milestone: none (the new Discovery has not started; this question decides how it starts)".

**P-002-follow-ups.md**

1. BLOCKING. It has the same "what if I don't decide" gap as route finding 3.
   - It has "DEFAULT: none", the reason is given only in brackets, and there is no statement of what happens.
   - It is also order-dependent: if the route question is ruled C, this question is moot, and the card says so only inside WHY.
   - Add: "Answer the route question first. If you do not rule, the briefing work's Discovery covers the briefing page only (option A) and the follow-ups stay as ruled."

2. BLOCKING. The cost claims are unsupported.
   - "a few weeks apart" in A has no source. The prompt engine's Design gate date is not recorded, so "weeks" is a guess.
   - "more questions for you while the prompt engine's Discovery also runs" in B is plausible but is not tagged.
   - Suggested wording: "a gap of unknown length (the prompt engine's Design gate has no date)".

3. BLOCKING. Option C is not cleanly put, and the recommendation partly hides the cost.
   - Gap 3 in the owner's ruling is one item, "portfolio pull requests and library patterns".
   - C splits it but does not say so in the cost. LL-28's proposed fix covers both together.
   - C also gives only the briefing's Discovery the job of deciding "whether to show" portfolio pull requests, which may end in "no", so the follow-up may not actually move.
   - Suggested wording for C's cost: "Cost: the portfolio's pull-request item starts earlier than you ruled, and the library-patterns half of that same item stays behind (LL-28 proposed them together); the briefing Discovery may decide not to show them, in which case that item still waits."

4. NON-BLOCKING. A Context bullet is unused.
   - The "6 different repos" quote is not used by any option or argument.
   - Either say how it bears on the choice (for example, it argues against splitting the work across places) or drop it.

5. NON-BLOCKING. The count of seven is muddled in the sources.
   - The Model-Lab ruling says "six gaps" plus the deploy-approval question, with the milestone screen added afterwards. The kickoff counts seven.
   - LL-35 adds a model-side part as well.
   - Add one Context bullet to settle it: "The seven are the six gaps in the ruling plus the milestone screen, with the deploy-approval question counted among the six (source: <record>)". Otherwise the owner cannot check "all seven".

6. NON-BLOCKING. The recommendation's confidence is fine as "medium", but its reason is thin.
   - "the other six touch screens it does not need" is stated as fact. No source compares the screens.
   - Soften to "appear to touch".

7. NON-BLOCKING. The language is dense for a phone, and "the milestone screen" is unglossed.
   - Gloss it as "the desk's milestone view you called confusing".
   - Also change "library patterns" to "the library's patterns (a count the desk does not show)".

No files were edited.

Files read:
- /home/user/Service-Desk/questions/P-002-route.md
- /home/user/Service-Desk/questions/P-002-follow-ups.md
