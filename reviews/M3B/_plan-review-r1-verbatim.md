# M3B plan: the Reviewer's round 1 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 31ff26d (the plan, draft 1).

---

Verdict: FAIL

The plan is draft 1 of M3B, at 31ff26d on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I checked its claims about today's desk against the code at 3bfe663, and they hold:
- sandbox.js:1484, :1571-1578, :1099 and :1228-1238; projectpage.js:48-49 and :563-571; j11.js:140 and :181-194; asked.js:8 and :126-155; model.js:29-35 and :832; sandbox.css:1144.
- There is no `desk-metrics` key anywhere in src/, so AC25 and J5 are unbuilt.
- There is no `docs/metrics/` in the tree. The last ledger entry is L-0019.
- desk-deploy.yml:18-21 runs only for `src/**`. asks_merge.py:27-38 has no `intake/` kind.
- I ran `surface_guard.py diff --range 3bfe663..31ff26d`, `v3_checks.py trace/joins/ready` and `spec_check.py status`. All are OK.

The plan fails on five points that a Builder would trip on, or where it breaks a data rule.

**Blocking findings**

B1. The device's notes are dropped once the week's file lands, yet the plan says the offer comes back if the file is deleted. Both can't be true.
- AC25 as changed, S-001.md:12789: "Once the file is in the tree the week's notes are dropped from the device."
- J5, :13574-13575: "a week whose file is in the tree is dropped."
- Against that, J5 :13606-13607 says the offer "comes back if it is deleted", and VT3's locked case (:3296) is "the offer gone once the tree holds that week's file for this device, and back if it is deleted".
- Once the notes are gone, nothing is left to offer again. The test can't pass as written.

B2. The notes are keyed by AC73 key, but a portfolio card has no AC73 key.
- First-shown times are "kept once per AC73 key" (:12773-12774). Marks are kept "by its AC73 key" (:13572-13573). A coded item uses "the SHA-256 of its whole AC73 key" (:13602-13603).
- Yet VT2's row and AC25 (:3295, :12777-12778) put "Didn't need me" on "a portfolio card".
- The spec itself says a portfolio card has no such key: :11002-11003, "a portfolio card, which has none, by its id".
- AC73 also covers only "anything in a connected project" (:11289-11291), and V1 is "in a connected project" (docs/PROJECT.md:180).
- So the key, the hash and the V1/V2 scope for portfolio cards are all undefined.

B3. Coding private items with a plain hash does not keep them private in public Service-Desk.
- J5 (:13601-13605) codes another project's item as `c-` plus 12 hex digits of an unkeyed SHA-256 of its AC73 key, and says "so no private name or number lands in this public repository".
- AC73 keys are `<project>|<kind>|<id>`, where the id is a pull request number or a run id (:11330-11334). A key like `Personal-Org-Operating-Model|pr|42` falls to simple enumeration, so the claim is false.
- The spec's own standard for these keys is "stored only as J18's keyed hash" (:11334). AC76's "Nothing private in public places" requires counts and keyed hashes only (:11650-11656), and an issue body "holding no title, path or number of an item" (:11663). Personal-Org-Operating-Model is the private project (src/config/projects.json; AC76).
- Question 3's recommendation A (:19203-19217) rests on this claim. The page can hold no secret, so a keyed hash is not a drop-in fix. The design or the question's options need rework.

B4. V4 shows "Met" with no regard to its date, and can clash with the Chief of Staff's own judgment.
- V4's line is "by 2026-11-11", and section 6's miss rule says "a miss is V4 not met by its date" (docs/PROJECT.md:183, :191).
- AC97 (:12916-12917) says "state: 'Met' with the green check once both parts are there", ignoring the date. A late launch would show a missed target as met.
- AC97 also says that for a target J25 names, "the desk judges nothing itself … the state is the line's" (:12887-12889). Yet V4's archive part comes from a J25 V4 line (:12914-12915).
- So a J25 V4 line with state `missed` and the desk's own "Met" conflict, and no rule says which wins.

B5. The rule for which targets count as "measured" on the row's small line contradicts itself.
- :12866-12870 says "none measured yet" holds "while no target has a figure for the dates it is measured over". It then says a target counts "when its measure below gives a figure or a state of 'on track', 'met' or 'missed'".
- A J25 line always has a `figure`, even when its state is `not measured` (:15954-15956). Under the second rule that line counts as measured, against its own state.
- V4 with only "since <date> (M3C reached)" is neither clearly a figure nor a state.
- The locked case "the row's small line in each state" (:3294) can't be written unambiguously.

**Non-blocking findings (risks)**

N1. One locked case is missed. tests/desk/ac87-portfolio.test.mjs:75 asserts that Home's last three parts are `['hgroups', 'portfolio', 'home-more-detail']`. VT3 puts its line between the portfolio block and "More detail", but names only ac82-home.test.mjs:115 (:3296, :8307-8312).

N2. AC97's test names the wrong fixture.
- It says it uses "`service-desk/` (Service-Desk's section 6 as it is, real)" (:12931-12932).
- At 3bfe663, tests/desk/fixtures/service-desk/ holds no docs/PROJECT.md (only decisions, dispatch-log, governance, questions, queue and status).
- Section 6 is in j11-77bfeae, whose V lines are identical to today's. The stage note (:3270-3271) has it right.

N3. Rounding windows outward to the minute (:13598-13600) changes section 6's rule that "a card committed while the desk was closed is not a miss" (docs/PROJECT.md:200-201).
- A card committed up to a minute after a window really closed would count as a miss.
- V1's target is 0, so one false miss fails it.
- Reading (k) as put to the owner (:19266) gives only the file-length reason, not this effect.

N4. CS34 (:17084-17093) has the Chief of Staff record V3 in docs/LEDGER.md, "in a pull request in its lane".
- docs/** belongs to the Orchestrator (governance/SURFACES.md:39), and J25 itself rejects `docs/` as "the Orchestrator's" (:15942-15943).
- The surface guard would fail that pull request. Section 6's wording predates the plan, but CS34 should say who writes the ledger.

N5. The plain paragraph tells the owner that nothing changes "what counts as waiting on you, the counts, or when your phone is told" (:3155-3156). But J25's weekly pull request is a new item waiting on the owner that "shows and notifies" every week (:15985-15986). The paragraph should say so.

N6. AC97's header says each C reading "is one of question 6's, by its letter where it has one" (:12850-12851). Several C readings have no letter and are not among the fourteen:
- :12870 (V5's before-launch figure not counted);
- :12871 (the icon);
- :12873 (the sheet's small line);
- :12881 (earlier checks);
- :12904 (V5's fallback once its log is no longer read);
- :13597 (the weekly V5 line);
- :15939 and :15944 (J25's place and form);
- :15977 ("a newer check could not be read").

They should either get letters or be marked as Definer readings that are not put to the owner.

N7. Question 1 is largely settled by an existing ruling.
- The owner picked mockup v2 (MD2). Frame 5 draws the row under "The rest" (docs/design/mockups/desk-v2.html:610), and AC83 built it there.
- Option D (a new tab) and option B depart from the chosen screens.
- The new small line, "<n> targets · none measured yet", departs from frame 5's "Measured from launch · V4, replacing the old page, by 11 Nov (proposed)", and that departure is not listed as a reading.

N8. Reading (c) (:12918-12919, :19251) makes the 14 days 11 to 24 Nov for an 11 Nov launch. The confirmed values say the checks run "to 2026-11-25" (decisions/questions/P-001-move-to-build-values.md), and section 6 gives "2026-11-25 (14 days after V4's date)". The question doesn't show the owner this end-date difference.

N9. Held questions are handled inconsistently.
- "First shown" is when a read counts the item as waiting (:12772-12774), but a held question is not counted (AC94 :10696-10697; AC73 :11295-11296).
- The plan still gives a held question a first-shown time and "Didn't need me" (:12775, :12780). V2 counts "items the desk flagged", so a mark on an uncounted question could inflate V2.

N10. Nothing says what happens to a window with no end: the tab killed without a hidden event, or the write at unload failing. VT2 has no case for it (:3295, :12769-12771).

N11. "From each Monday" is Monday 00:00 UTC (:12781), which is Sunday 18:00 or 19:00 in Chicago. Reading (i) tells the owner "from Monday" (:19263).

N12. V5's fixed 14-day figure says "a card still open at the window's end counted at its wait to that end" (:12899-12901). It doesn't say whether a card answered after the window's end is capped at the end or counted at its full wait. The test case (:3294) covers only "open at the window's end".

**Open questions**
1. With question 2's answer B, VT2 and VT3 go into M3C's launch pull request (:3286-3287). Does that conflict with the Risks mitigation "no M3B stage touches the launch's own work" (:18581-18583)?
2. Is the Chief of Staff's weekly value-check pull request subject to J22's rule 0 (a required reviewer's verdict)? If so, it would be "with the agents" rather than waiting on the owner, which changes J25's "shows and notifies" claim.
3. For B3, is the intended fix to code only the planning project's items, to use question 3's option C (the private repository), or to send counts only?
