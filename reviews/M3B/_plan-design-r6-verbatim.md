# M3B plan: the Design reviewer's round 6 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 09b963f (the plan, draft 6).

---

Verdict: PASS

In plain English: with the owner's answers in, the targets' row and sheet now read correctly at every stage.
- **Before launch:** no date shows anywhere. The row reads "Measured from launch · V4, replacing the old page, at launch".
- **From launch day on:** the dates are worked out from the actual launch day.
- **"Weekly checks not read yet":** these words are honest and match how the desk already talks about records it hasn't read.
- **V5's fallback:** "No weekly check recorded" reads true. One small wording mismatch with the other targets is noted below; it is not blocking.
- **The picture brief (CS32):** clear enough for me to draw from.
- **Regressions:** none found.

How I checked: the diff f36ca26..09b963f changes only specs/S-001.md, and nothing under src/ or tests/. Nothing renders differently yet, so I took no screenshots. I read the owner's seven answers in /home/user/Service-Desk/decisions/questions/P-001-m3b-*.md at bbedc38. I checked each state of the row and sheet against those answers, the design pack and mockup v2's frame 5.

**1. The words before launch, on launch day, during the 14 days and after**

- **Before launch:** the row reads "Measured from launch · V4, replacing the old page, at launch", fixed words read from no record (S-001.md:13141-13144).
  - This is frame 5's line (desk-v2.html:610) with only the date dropped, so part B item 26 holds.
  - It follows P-001-m3b-launch-date.md, A: "V4 reads "at launch""; "the desk shows no date before launch".
  - V5 reads "Before launch, weekday cards, last 14 days: …", then "Measured over the first 14 days after launch" with no date (:13205-13208). V1 to V3 read "Measured from launch" (:13240).
  - The quoted target lines and the stop rule carry no date once CS36 lands (:17517-17533). CS36 lands before VT1 (:17444), so no date is quoted either.
- **Launch day:** the row reads "Measured from <W1> · first weekly check due <D1>" (:13145-13146). W1 is the day after launch day, as P-001-m3b-window.md, A rules "whatever its date" (:13110-13112).
  - V5 reads "Launch day, weekday cards, last 14 days: …", then "Measured over the 14 days from <W1>" (:13209-13212).
  - V1 to V3 each have one line, "Measured from <W1>" (:13241-13242).
- **During the 14 days:** the row's states 3 to 5 (:13147-13153) never show "since" launch day, never "0 checked", and never a due date that has passed.
  - V5 reads "Since launch, day <d> of 14" (:13213).
  - Each target's measure follows the strict sequence of earlier drafts, unchanged.
- **After the 14 days:** states 6 to 8 are unchanged. The sheet's label for the window, "First 14 days after launch", is now a single string (:13115).
  - V4 is judged at launch, "met" once both parts hold, and never missed by a date (:13232-13235). The desk still states no V4 result of its own; the result comes only from your Chief of Staff's V4 line.
- **Plain words (item 19), times in Chicago (item 20), no made-up figures (item 5):** all hold.
  - Every date is worked out from M3C's reached date in `ownerTimeZone`.
  - A reached date set in the future keeps the desk "before launch" until that day (:13116-13119).

**2. "Weekly checks not read yet"**

- **Row:** state 0 reads "<n> targets · weekly checks not read yet" while the read is pending on a cold load, and "… not available" when it failed. It has no icon and replaces states 2 to 8 (:13136-13140).
- **Sheet:** it reads "Weekly checks: not read yet", and each target reads "not read yet", never "not recorded yet" or "First check due" until the read is in (:13249-13253). Every project's row uses the same words (:13164-13166), which settles my round-5 N1.
- **Against the pack (items 4 and 5):** a record not yet read is said in words, never shown as missing or zero.
  - The words match the desk's existing vocabulary: "Sprints: not read yet" (src/lib/home.js:554), "<ids> not read yet" (home.js:572) and the board's "not read yet" (src/lib/board.js:66, :119).
  - No new colour, size or weight is added.

**3. V5's "No weekly check recorded" fallback**

- Once the dispatch-log months no longer cover the window and no V5 line from your Chief of Staff exists, V5 reads "No weekly check recorded" with the dashed "?" (:13219-13223). So V5 always has a measure line.
- The "?" is the right mark: CS34 says a V5 line should exist by then (part B item 30).
- See N1 for a wording mismatch.

**CS32's picture brief (made-up launch day L)**

Clear enough to draw from (:17446-17478). It gives:
- every state 0 to 8 with its words and icon, written in terms of L + 1, D1 and DN;
- the sheet on launch day, before the first check, on day 5, after the window, unreadable and not yet read;
- each of V4's states;
- the stop rule as CS36 leaves it;
- every kind of sheet with "Didn't need me";
- Home's foot with a pre-launch trial week, since the owner chose C.

One choice is left to me: L's weekday, which sets how far D1 falls after L. I'll pick L and state it on the picture, with every date labelled NOT real. That is a drawing detail, not a gap.

**Regressions**

None found:
- "Didn't need me" is still the last line on every kind of sheet.
- The weekly line's rules, the icon rule and the state-8 caption are unchanged.
- The sequence of states is unchanged apart from state 0's new words and the dates now coming from L.
- The leftover fixed dates ("11 Nov", "12 Nov", "25 Nov") sit only in the change history (:3190-3490), not in AC97, VT1 or CS32.

**Blocking**

None.

**Non-blocking**

N1. V5's fallback uses a different phrase from the other targets for the same situation (item 19).
- After the window, V1 to V3 with no check read "Weekly check not recorded yet" with the dashed "?" (:13244-13245).
- V5 in the same planning project reads "No weekly check recorded" (:13221-13222). That is the phrase AC97 uses for projects other than Service-Desk (:13246).
- Two phrasings for one fact sit on one sheet. One phrase for both would read more consistently. A builder could align this in VT1 without a new ruling.

**Questions for the owner**

None new.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: AC97 at :13094-13278 (the window at :13106-13126, the row's states and icon at :13127-13176, V5 at :13203-13226, not read yet at :13249-13253); CS32 at :17446-17478; CS36 at :17517-17533
- /home/user/Service-Desk/decisions/questions/P-001-m3b-launch-date.md and P-001-m3b-window.md, the rulings these words follow
