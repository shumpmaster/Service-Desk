# M3B plan: the Reviewer's round 6 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 09b963f (the plan, draft 6).

---

Verdict: PASS

Draft 6 of the M3B plan (09b963f on build/definer/m3b-plan, specs/S-001.md) is ready to land. I checked it read-only against the owner's answer records in /home/user/Service-Desk at bbedc38. Three small non-blocking fixes are below; none of them needs to hold the landing.

**1. Each answer is written in faithfully, and the "Answered" block is word for word.**
- I checked the block with a script (/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/cmp.py). It compared each record's question, every option, the whole "How it was answered" paragraph and its "Ruling:" against the "Answered: from the M3B plan" block. All 42 passages match, whitespace aside.
- The cited commits exist: bfd0128 and 237be68 (the questions), 6b94ecb (the answers, an ancestor of bbedc38).
- Each answer is written in:
  - **Window A:** W1 is the day after launch, WN the 14th day after it, and launch-day cards fall outside (:13106-13121).
  - **Line A:** "The milestone: M3B" quotes line A exactly as it stands at bbedc38 docs/PROJECT.md:113, and CS33 is marked done.
  - **Weekly file C:** J5 puts the file at `metrics/service-desk/…` in the portfolio repository; the A and B forms are removed.
  - **Stop rule A:** the rule is quoted in AC97.
  - **Launch date A:** the dates are dropped in AC97, J25, CS34 and CS36.
  - **Picture A:** CS32. **Readings A:** reading (e) as the launch-date answer changes it.

**2. No fixed launch or window date survives in AC97, J5, J25, VT1 to VT3, CS32 to CS36 or the plain paragraph.**
- I searched these parts for every dated form ("11 Nov", "12 Nov", "25 Nov", "18 Nov", "2 Dec", "2026-11"). What remains is only:
  - quotes of rulings and records;
  - the past drafts' notes;
  - the samples in J5 and J25, each labelled made up ("not a launch", "a made-up launch on 11 Nov").
- Row state 1 is now fixed words, "Measured from launch · V4, replacing the old page, at launch". CS32 works every date out from a made-up launch day L.

**3. V4 is never judged against a date, and the quoted stop rule matches CS36.**
- V4's state comes only from the Chief of Staff's J25 line, judged at launch and "never missed by a date". AC97 (:13231-13238), J25's `state` and CS34 all say so.
- CS36 removes "V4 not met by its date (proposed 2026-11-11)" and keeps the sentences after it as they stand. So the reworded rule still ends "… where the owner rules continue, re-aim or stop.", the end point AC97 quotes to (:13255-13262).
- CS36 lands before VT1.

**4. J5 and VT3 hang together with A and B gone, and the row is still a strict partition.**
- **J5 and VT3:** one place (the portfolio), one form, and one offer condition. Pre-launch weeks are offered as a trial, consistently, because the file is private. CS34 confirms the portfolio's rules before VT3 opens.
- **The row's states:** I checked each day against the conditions.
  - State 0 now covers J25's read failed or still pending. It applies only after launch, so it can't clash with state 1.
  - State 1 holds when M3C has no reached date, or today is before it.
  - State 2 holds only on the reached date, since W1 is always the day after.
  - States 3 to 8 split as before.
- **V5:** it has exactly one line every day, and once its log is no longer read the new fallback "No weekly check recorded" applies (:13205-13223).
- **Other projects:** they take state 0's words too.
- **Checks run:** `surface_guard diff --range aaf63fd..09b963f` is OK (5 commits). v3_checks trace, joins and ready, and spec_check status, are all OK.

**Non-blocking findings (risks)**

N1. One stale sentence survives. "Stop rule, rollback, cost" (:19065) still says "V4's date and PROJECT.md §6's miss rule still apply". After the launch-date answer and CS36, V4 has no date. Reword it to "PROJECT.md §6's miss rule as it stands".

N2. AC97's test still uses j11-77bfeae as Service-Desk's only real section 6 (:13273-13274). That fixture holds "by 2026-11-11" and the old miss rule.
- VT1 locks "no date shown before launch" and "the miss and stop rule's quote, as section 6 holds it after CS36".
- Against that fixture, the sheet would quote dates before launch. A Builder can't tell whether the no-date check covers the desk's own words only or quoted record text too.
- Fix: name a made-up section 6 in CS36's form (labelled NOT real), or the real one once CS36 lands. Also say that the no-date check covers the desk's own words.

N3. AC25's "the tree that shows a file landed is … J1's, or J23's for the portfolio" now applies only to J23's. This is harmless, but "J1's" can go.

**Open questions**
None.
