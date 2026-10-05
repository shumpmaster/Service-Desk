Verdict: PASS

I read `docs/PROJECT.md` (Part 1) against `governance/standards/definition-of-ready.md`, and traced each ruling and library entry it cites. The brief meets all eight items. It has four weak points that I list below, none of which fails the exit.

**Evidence by item**
- **(1) Scope, (2) strategy, (3) plan.** The scope has in, out and where it works (§1, lines 10–53). The strategy chain is at §2 (55–64). The plan is two levels deep with dependencies (§3, 66–104).
- **(4) Owners.** The §4 table (109–122) covers every deliverable, the owner's rulings, the by-hand settings and the outside parties.
- **(5) Limits.** The $0 hosting ceiling, the $0 API spend, the data boundaries and a T1 tier are all stated, with the tier checked against each trigger (§5, 127–157).
- **(6) Value and stop rule.** V1–V4 each have a measure, target and date. Pre-launch time is a stated miss, and V1/V2 have a measurement route (§6, 164–189).
- **(7) Solid foundation.** The three items left open into Define each meet the L-0119 rule: a named test, a fallback, and a recorded owner ruling.
  - **O3, CPU and wall-time.** Test and fallback are at line 382. The rulings are `decisions/questions/P-001-o3-define.md` and `P-001-o3-walltime.md`, each "Ruling: yes" with the owner's words.
  - **O5, how `needs-you` deploys.** Test and fallback are at line 384. The ruling is `P-001-o5-define.md`.
  - **O6, usage figures.** Test and fallback are at line 385. The rulings are `P-001-o6-define.md` and `P-001-o6-fallback.md` (option A). The fallback is $0, which fits the §5 ceiling.
  - **Citations.** I spot-checked these library entries and each matches the brief's text:
    - F-cf-workers-01: 10 ms CPU on Free.
    - F-cf-workers-02: 50 outbound requests per invocation.
    - F-cf-workers-03: six connections, and the Free wall-time limit not filed (line 8).
    - F-cf-workers-05: 100,000 requests a day.
    - F-cf-workers-08: occasional overages tolerated.
    - F-hosting-01: the $5 Paid plan.
    - F-Q004-1, -2, -4, -7, -9 and -12.
  - **Arithmetic.** The shown arithmetic is correct: 5×60×16 = 4,800, and 3×5×60 = 900.
  - **Unfiled facts.** The brief marks the facts that are not filed or are unverified as C (our own observation or inference) and does not rely on them for its design.
- **(8) Clear and consistent.** Terms are defined (§8, 390–401). The tensions are checked (427–446), including the moved date, D-066 and the tier.

**Weak points (none blocks the exit)**
1. **O5 fallback against V4.** The fallback is "a new project with permanent redirect" (`PROJECT.md:384`; `P-001-o5-define.md`). V4 says the desk "serves the Operations-Hub address" (line 167). A redirect from the old address is not the same as serving it. The old project's survival is also unclear, because the old repository is archived. The Definer should settle this. The owner may need to confirm that a redirect meets V4.
2. **V4 date has no arithmetic.** The 2026-11-11 date is marked E, "about two weeks" for D7 (lines 169–171). §7's header says E figures are "shown with its arithmetic" (line 198). There is no arithmetic for the full date. The owner sets the date on the move-to-Build card, so this is not blocking.
3. **Q-009 drop record is thin.** `decisions/Q-009/stop-1.md` holds only "Decision: drop", with no owner words or proxy line. The brief says the owner dropped it (lines 385, 418). The Orchestrator should confirm that is the owner's decision. Nothing in the design relies on Q-009.
4. **Part 2 is stale in places.** The intent draft still talks of a 2026-10-28 launch and a spend line (lines 502–503, 476). Part 1 reconciles both. It is living and awaits owner confirmation.

**Open questions**
- Does the owner accept that a redirect satisfies V4? See weak point 1.
- Is `needs-you` a Direct Upload project? That is O5's test in Define. I cannot verify it from this pack, and the brief says so itself (line 384).
