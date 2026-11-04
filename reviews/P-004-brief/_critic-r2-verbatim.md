# Critic, round 2, verbatim — docs/PROJECT.md "Later work: the home-screen widget (P-004)" (2026-11-04)

**Verdict: FAIL** (2 blocking, 7 non-blocking)

Draft 2 deals with all eleven of round 1's findings in substance. Five citations are true and say what is claimed:
- src/lib/access.js:1-4
- src/lib/model.js:1-3
- src/notify/collect.mjs:1-6
- src/tools/build.mjs:8 (stale made files fail the check)
- governance/risk-paths.toml:20-24 (with package.json at :18)

The request sum is now shown and checks out: S-001:14611 gives 25 requests per blob call and :4954-4955 gives 16 blob calls, so about 400. The handoff's "Update: P-004's plan" quotes the owner's two answers word for word. The P-004.toml request agrees with the plan and has no `enters`. Two things fail it:
- **The two new answers are not on record as AGENTS.md §5 requires.**
- **The plan for measuring the main unknown can't be carried out as written.**

## Blocking

1. **"Data on the phone": "By the owner's ruling, "Phone only (Recommended)" (docs/handoff/2026-11-04-chief-of-staff-widget.md, …)", and the Why's "Their words, verbatim: "See what's waiting at a glance" (docs/handoff/…)".**
   - **What is wrong:** AGENTS.md §5 (model S-033), line 80, says every ruling put to the owner, "including one asked in a session", is filed first as `questions/<name>.md`. The answer then goes in `decisions/questions/<name>.md` with the owner's exact words.
   - Neither answer has a question file or a decision record. I searched questions/ and decisions/ for P-004, "Phone only" and "at a glance": the only hit is the earlier P-001-home-screen-widget ruling.
   - The handoff file does not say a question was filed before either ask.
   - Both precedents went through decisions/:
     - P-001-home-screen-widget (question filed in PR #283, then answered);
     - P-003's "Show it after a day, flagged (Recommended)" (in decisions/questions/P-001-card-recommendation.md).
   - The plan calls the data rule "the owner's ruling", and Part 1 §5's data boundary now rests on it. So it must cite a ruling record, not a handoff note.
   - **Stage:** asking the owner (Chief of Staff, AGENTS.md §5). The brief's citations are wrong because of it.

2. **"Its Discovery, scaled to its size", first bullet: "The owner adds a throwaway test widget that … runs the desk's card-making code on them", followed by "Then size the work: which parts of the desk's card-making code the copy needs, and whether any of them only work in a browser."**
   - **What is wrong:** the test needs the desk's card-making code already packed into one file that runs in Scriptable. That file is what the Build-phase tool will make. Whether the code can run outside a browser at all is the second step's question, but the first step already depends on the answer. So the order is the wrong way round.
   - The plan names nobody who writes the test widget and its throwaway copy of the code. The owner cannot. "Owners and limits" gives the owner only "runs the test widget".
   - The owner's "about 15 minutes for the test widget" assumes someone hands them a ready script.
   - Say who makes the throwaway script and its packed code in Discovery, and that this work also answers the "only work in a browser" question. If it can't be made without changing the desk's code, say that this comes back to the owner (as "What it does not cover" already says).
   - **Stage:** Discovery planning (stage 2, Shape): the plan for the main unknown.

## Non-blocking

3. **M5's why: "the owner wants to see what's waiting at a glance, without opening the desk".**
   - "without opening the desk" is not the owner's reason. It is close to "Open the desk less often", an option the owner was offered and did not choose (handoff, "Update: P-004's plan").
   - Round 1 said to use the owner's reason and not invent one. End the why at "at a glance", or add "on their home screen".
   - **Stage:** milestone drafting (the why, model S-032).

4. **"Staying in step on the phone": "compares its copy's version with the one on the desk's main branch".**
   - The live desk is deployed only with the owner's approval (P-003's Done-when: "the owner approves the live deploy, as for every change to the live desk"), so main can be ahead of what the live desk shows.
   - An updated widget then matches main, not the desk. M5's "as the desk shows them" and the Success test can then quietly fail.
   - Say which one the widget follows, or that the gap is accepted.
   - **Stage:** brief drafting (scope against M5's done-when).

5. **"What it covers", third bullet: "One file holding a copy … kept in the repository", against "no change to what the live desk serves".**
   - The plan doesn't say where the file lives. Under src/public/ it would be served, which goes against that promise. It would also need the design reviewer that the ruling names "if it writes into the page's served files" (P-001-home-screen-widget.md:25; risk-paths.toml:43-49), and draft 2's Done-when has dropped that reviewer.
   - Say it lives outside src/public/. The same applies to the owner's guide, which "Owners and limits" places "under src/".
   - **Stage:** brief drafting.

6. **Discovery, second sub-bullet: "a later one up to 30 (23 when nothing has changed, lines 14620-14621)".**
   - Those lines limit one poll call. A later refresh after changes also makes blob calls for the changed records, up to 25 each (:14611). So "up to 30" understates a later refresh, and the cited lines don't say it.
   - **Stage:** brief drafting (citation).

7. **Discovery, pass mark: "over a day of normal refreshes" and "A first refresh … may still pass if it can be done once inside the Scriptable app and kept".**
   - A quiet day may not test a busy one, when many records change and a later refresh comes close to a first read's cost.
   - If the first read has to be done in the app, the owner has to do that step: on install, and again if what the widget has kept is lost. Neither the guide nor the owner's time covers it.
   - **Stage:** Discovery planning.

8. **"Owners and limits": "about 15 minutes … about 15 minutes … then about a minute per update, inside the 30 minutes a week of upkeep the desk allows (section 6, V3)".**
   - In the setup week, the 30 minutes uses all of V3's weekly allowance before any other upkeep on the desk. Also, how often updates come depends on how often the card-making code changes, and the plan gives no estimate.
   - Say that the setup week may go past V3, or that setup is not counted as upkeep, and give a rough number of updates.
   - **Stage:** brief drafting (value and cost).

9. **Smaller points.**
   - Why, first paragraph: "and asked how it should get that summary, "A: …"" reads as if the owner asked. The owner was asked, and answered.
   - M5's name, "What waits on the owner on their home screen", is a topic rather than something achieved. "… shown on their home screen" would match M1's form ("visible on the phone").
   - Done-when: "three shared judgment files" includes ledgergrant.js, which risk-paths.toml:23 calls a ledger grant reading, not a judgment.
   - **Stage:** brief and milestone drafting.

**Round 1 resolved:**
- 1: test as a widget refresh, all three projects and the portfolio, a steady figure and a pass mark (but see finding 2).
- 2: the build check plus the "Update the widget" notice.
- 3: by finding 1 of this round, resolved in substance but not on record.
- 4: by finding 3 of this round, mostly resolved.
- 5–8, 10 and 11: resolved.
- 9: mostly resolved (plain words such as "card-making code").

**M5's form checks:** the parts are in order, ` · for: P-004` comes before ` · why:`, there is no " · " inside any part, and M5 is not used anywhere else.

**Self-implication flag (D-050):** finding 2 implicates round 1's check. Round 1 read the same "runs the read model" measurement bullet and did not raise that it needs the code packed first, or that nobody is named to make the test.
