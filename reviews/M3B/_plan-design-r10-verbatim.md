# M3B plan: the Design reviewer's round 10 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-27 against build/definer/m3b-plan at 24543d8 (the plan, draft 10).

---

Verdict: PASS

In plain English: VT1's tests now quote only AC97's current words and marks.
- V5 before the 14 days is tested as grey with the planned ring, reading "Before launch, not counted" or "Launch day, not counted", with its bar filled `--ink3`.
- The rule that nothing is judged before the window now names V4 as the one exception.
- The row's dates now use AC97's own names.
- A check recorded as not measured is now said once.
- Nothing regressed.

How I judged it: the diff f83bb30..24543d8 changes only specs/S-001.md (+12 −5), and nothing under src/ or tests/. I pulled every quoted phrase out of VT1's row (S-001.md:3359) and checked each against AC97's text (:13167-13465), allowing for line wrapping and placeholders. Every phrase is found in AC97. The only phrases that don't match letter for letter are four quoted examples with their values filled in, which AC97 writes as patterns: "Value targets V1 to V5", "5 targets · first 14 days over · …", "Live so far" and "median, 3 – 16 Dec, 21 weekday cards".

**My round-9 points**
- **B1:** holds. VT1 now tests "before W1 nothing judged, with one exception, V4, judged from launch day: V5 grey there with the planned ring, "Before launch, not counted" before launch and "Launch day, not counted" on launch day, its bar's fill `--ink3`". That matches AC97's V5 rule and its verdict table. The owner-facing column says the same ("V5 grey before the 14 days, with the planned ring, …").
  - "no mark" now appears in VT1 only for state 0, where V1 to V3 show no mark, as AC97 says.
  - The sweep also fixed the row states: "Measured from <W1> · first weekly check due <D1>" and "Measured since <W1> · …", replacing the older "<the day after launch>" and "<date>" placeholders, as AC97's states 2 to 4 give them.
- **N1:** holds. AC97's verdict table (:13323) and VT1 both say the line "Not measured · your Chief of Staff's check, <its date>" replaces the check line. So "Your Chief of Staff's check, <date>: not measured" never shows under it, and the check is said once (item 19).

**Regressions:** none found. Apart from those, the diff changes only the lineage, the draft number and the draft-10 change record.

**Blocking:** none.

**Non-blocking:** none.

**Questions for the owner:** none.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: VT1's row at :3359; AC97 at :13167-13465, with its verdict table near :13321-13340
