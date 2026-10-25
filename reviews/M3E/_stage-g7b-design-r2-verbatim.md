# M3E stage G7b: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g7b at 9fcc448 (fix commit 9fcc448, on 4167c78) (G7b's work over 39da454).

---

Verdict: PASS

**Round 2 for G7b (9fcc448), for the owner.** Nothing failed and nothing was skipped. As asked, I ran only the stage's own test file and the colour-guard file: 17 of 17 pass. I did not run the full suite; the Builder reports 1,257 of 1,257.

The fix closes a real gap. Before it, the desk could be failing to read a project whose tile it also couldn't draw, and "Since you last looked" would still say "Nothing new since 18 Oct, 19:00", which reads as all clear. That had been there since the first glance stage, before this one; my round-1 review didn't catch it, the Reviewer did.

Now that state shows the red "✕ Not read since 10:02" line, then the grey "Alpha not read since 10:02, its lines may be missing". Its time is the same as in the summary box above ("Can't read Alpha since 10:02"). Every other state looks as it did in round 1. The change is fully reversible.

**What changed.** One function in src/public/sandbox.js (`sinceReads`). A project the desk can't draw now keeps its read when that read is failing, so it counts as "can't read", as the summary box already counts it. While its read succeeds, it still gets no line. src/lib/home.js and src/public/lib/home.js are still identical.

**Evidence** (the same captures as round 1, at 9fcc448; 360 and 414 px, light and dark; fonts confirmed loaded):
- **The five round-1 states** (unread, unread-more, unread-two, signed-out, ext, plus my ext-more) match my round-1 captures in text, computed styles, contrast, icons and links.
  - The only differences are the capture clock's minute (10:01 against 10:02), and the summary box always moves with it.
  - Sideways scroll is 0 px everywhere, and no line is cut.
- **New state: a project that can't be drawn and whose read then fails**, at all four sizes and themes, with one, two and a full list (part A items 2, 4, 5, 10, 13 and 14).
  - The words: "Alpha not read since HH:MM, its lines may be missing", with the summary box's own time.
  - With two projects failing, the lines run Alpha then Service-Desk, which is the tile order.
  - The empty list's line is the red "Not read since HH:MM", never "Nothing new since".
  - With a full list, the grey line sits under "33 more in the last 7 days", and the count is unchanged.
  - Style: 400 12 px Plex Sans in `--ink2`. Contrast is 6.40:1 light and 7.72:1 dark. No icon, not a link.
  - The tile still says "✕ Can't show this project: …".
- **Before, at 39da454**, the same state showed "Nothing new since 18 Oct, 19:00" at all four sizes and themes. That is part A item 4 failing before G7b; the fix removes it.
- **A project that can't be drawn but whose read works:** still "Nothing new since 18 Oct, 19:00" with no grey line, the same at 39da454, 4167c78 and 9fcc448.
- **Tests:** the stage's file and the colour-guard file give 17 of 17 pass, including the new case for the Reviewer's first blocking finding (B1).

**Blocking findings**
None.

**Non-blocking notes**
- My round-1 notes N1 to N6 stand. In the new two-project state, N2 shows again: the summary box lists Service-Desk first, while the grey lines follow tile order (Alpha first).
- My round-1 review missed the "Nothing new since" problem in this state. I raised the can't-draw case only as a question (Q4) and didn't test the version where the read also fails. The pack's measure for this agent should record that.

**Q4 after the fix: narrowed, still open.** The half where the read fails is settled. The other half isn't: a project the desk can't draw whose read works adds nothing to the list (sandbox.js:773 skips it), yet the list can still say "Nothing new since 18 Oct, 19:00" with no grey line. The spec gives the grey line only to a project that "can't be read", and this was already so before G7b. So it isn't a finding against this change. The open question for the owner: should a project the desk can't draw also get "<project> not shown, its lines may be missing", or some such line? Q1 to Q3 go to the owner as desk questions, as you said.

**Owner pairs**, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7b-design/owner-pairs-final/:
- 01 to 04 are unchanged from round 1. The fix changes nothing they show beyond the clock minute.
- New: 05-cant-show-and-cant-read-NOT-real-360-light.png. It sets the desk now (39da454), showing "Nothing new since 18 Oct, 19:00" for a project it can't draw or read, beside 9fcc448, showing the red "Not read since 10:02" and the grey "Alpha not read since 10:02, its lines may be missing". Labelled MADE-UP FIXTURE — NOT REAL.

Round-2 captures and dumps, in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7b-design/:
- r2-after/: all states at 9fcc448, crops and full pages, with report.json.
- r1-after/: the new states at 4167c78.
- r0-before/: the new states at 39da454.
- scripts/crop2.mjs: the capture script.
