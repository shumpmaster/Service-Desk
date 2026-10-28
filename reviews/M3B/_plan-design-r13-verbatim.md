# M3B plan: the Design reviewer's round 13 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-28 against build/definer/m3b-plan at 34ce5f5 (the plan, draft 12).

---

Verdict: PASS

In plain English: all four changes are wording and record-keeping fixes, and they agree with the approved picture, AC25 and VT2's row.
- **"Didn't need me":** the build plan now says it is the last line, below "Done ✓ · Close".
- **Storage words:** J5 now says "Not noted on this device", the words VT2's row uses.
- **After 8 weeks:** an item still waiting is noted again and its mark goes. The existing line "Notes are kept on this device for 8 weeks, then dropped." covers that.
- **Times:** they are cut to the second in the weekly file, never rounded.
- **Regressions:** none found.

How I judged it: the diff e1ba0c6..34ce5f5 changes only specs/S-001.md (+48 −12), and nothing under src/ or tests/. I read each changed line and checked it against:
- the approved "Didn't need me" frames, docs/design/builds/m3b-picture/m3b-overview-3-didnt-need-me-360-light.png, which were kept for round 2 because nothing in them changed;
- AC25, VT2's row and reading (k);
- the design pack.

**One by one**
- **Build plan, VT2 (S-001.md:21331-21333): holds.** It now says "Didn't need me" goes "below each such sheet's "Done ✓ · Close", as its last line". That matches:
  - the approved frames: on a card's sheet it sits below "Done ✓ · Close", and below "Undo · Close" while confirming; on question and gate sheets it sits below the sheet's foot; on "No longer waiting" it sits below "Close";
  - AC25 and VT2's row (:3360).
  
  The old "above" wording, the last trace of draft 1's placement, is gone.
- **J5's storage words (:14170-14173): holds.** "Not noted on this device" replaces "metrics not recorded on this device". It now matches VT2's row and AC25, so there is one phrase for one state (item 19).
- **After 8 weeks (:13130-13140, :13177-13180, :14209-14213): holds.**
  - A first-shown note and a mark are each dropped 8 weeks after the week of their own time.
  - An item still waiting is then noted again as if first shown, and its sheet shows "Didn't need me" again.
  - Nothing on the counts, the badge or the notifications changes, and no target's figure moves.
  - The sheet's existing line "Notes are kept on this device for 8 weeks, then dropped." stays true, because a mark is one of the notes. No new on-screen words are needed, and no figure is invented or lost (item 5).
- **Times (:13121-13126, :14250-14253, and VT3's row at :3361): holds.** Times are kept to the millisecond on the device and written to the file cut to the second, never rounded (":59.999 written :59"). This is the weekly file, a record, not a screen. Nothing the owner sees changes; the Chicago-time display rules are unchanged (item 20).
- **VT2's new cases and AC25's page events: holds.** These are the back-forward-cache `pageshow` event, a page loaded hidden noting nothing, and the confirming and kicked-back sheets for gates and questions. They change behaviour, not words or marks, and they match the approved frames for confirming and kicked-back sheets.

**Regressions:** none found. Apart from these, the diff changes only the lineage and the draft-12 record (:3619-3633). The AC97 targets' sheet and row, the scales, the grey ring, the link order, the weekly line and "Your weekly figures" are unchanged.

**Blocking:** none.

**Non-blocking:** none.

**Questions for the owner:** none.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: the build-plan VT2 line at :21331-21333; AC25's changes at :13121-13180; J5 at :14170-14253; VT2's and VT3's rows at :3360-3361
- /home/user/sd-m3bdef/docs/design/builds/m3b-picture/m3b-overview-3-didnt-need-me-360-light.png
