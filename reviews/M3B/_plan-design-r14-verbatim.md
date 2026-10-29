# M3B plan: the Design reviewer's round 14 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-29 against build/definer/m3b-plan at 17746e9 (the plan, draft 13).

---

Verdict: PASS

In plain English: draft 13 writes VT3's review fixes into the spec, and each one matches the approved picture.
- **Landing:** a tap on Home's line must land with the whole "Your weekly figures" block in view, its "8 weeks" line included.
- **Chevron:** Home's line has a small grey (`--ink2`) chevron.
- **Waiting for reads:** nothing is offered until the records the weekly file needs have been read.
- **Every week saved:** the block disappears.
- **"Never changes it":** Home's sentence "The desk reads your portfolio repository and never changes it" stays.

On question 2 of VT3's review (the close button scrolled out of view when the sheet opens at the weekly block), I agree with your reading. The approved picture draws that landing, and a long sheet has always scrolled its close away.

How I judged it: the diff 55a2484..17746e9 changes only specs/S-001.md (+53 −12), and nothing under src/ or tests/. I checked it against:
- the approved images, docs/design/builds/m3b-picture/m3b-overview-4-home-weekly-360-light.png and round-2/m3b-r2-5-weekly-figures-trial-weeks-360-light.png;
- VT3's design review, /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/reviews-vt3/r1-design.md;
- the design pack.

**One by one**
- **The tap's landing (AC25, S-001.md:13194-13197; VT3's row at :3361): holds.**
  - The spec now says the line opens Service-Desk's page with the targets' sheet over it, scrolled to "Your weekly figures" "once the sheet is drawn whole, landing with the whole block in view, its last line included".
  - VT3 locks this at 360 and 414 px, with one and eight weeks.
  - That is what both frames draw: the block from "Your weekly figures" down to "Notes are kept on this device for 8 weeks, then dropped." It fixes my VT3 B1 in the spec. The Builder's code fix is VT3's to confirm.
- **Home's chevron (AC25 :13192-13194; AC82's note :8669-8670; VT3's row): holds.** It is a small `--ink2` chevron, as the picture draws it and as the portfolio rows and "More detail" have theirs (item 14: no heavier mark on the owner's upkeep).
- **The offer waits for the reads (AC25 :13179-13188; J5 :14279-14300): holds.** No line and no block until every v3 project's records and the dispatch log are read, and a truncated portfolio tree counts as unread.
  - The screen never offers a file that would say "not available until … has been read" (item 5).
  - The older-week words, "not available: the dispatch log months the desk reads no longer cover this week", are in the file, not on a screen.
- **Every week saved (AC25 :13201-13204; J5 :14296-14300): holds.** The block and its "8 weeks" sentence go when Home's line goes. The picture draws only states that have weeks to save, so nothing contradicts this, and an empty heading is never left behind.
- **"Never changes it" (draft-13 record, :3651-3653): holds.**
  - The sentence stays, and it is still true: the owner commits on GitHub and the desk writes nothing, as with answer links.
  - m3b-overview-4 draws it directly above "Last week's desk figures are ready to save", in both the one-week and eight-week frames. The owner approved that.
  - This settles my VT3 question 1 by the owner's own approval, so it needn't be asked again.
- **Trial weeks:** VT3's row and AC25 keep round 2's single "Before launch: a trial, not counted" line (r2-5, small fix (b)). This replaces round 1's per-week label in m3b-overview-4, as the owner ruled.
- **The file's windows across midnight UTC, and a zero-length window:** these are record detail in J5, not on screen. No design point.

**Question 2 of VT3's review (the close out of view on landing)**

I agree it is covered.
- Both approved frames draw the sheet opened at "Your weekly figures" with the close out of view. The owner approved that landing.
- The close scrolling away is not new. The sheet's head has always scrolled with its content on any long sheet, and Escape and a tap outside still close it (P-001-trial-view-notes-1, as the pack checks it).
- If anything is followed up, it is the desk-wide question of a pinned close on long sheets. That is a non-blocking follow-up already present before this change, not a finding against M3B. I'd withdraw it as a question to the owner for this entry.

**Regressions:** none found. Apart from these, the diff changes only VT3's row, the lineage and the draft-13 record. VT2's row is unchanged, and AC97's targets' sheet and row are untouched.

**Blocking:** none.

**Non-blocking:** none.

**Questions for the owner:** none.

Files:
- /home/user/sd-m3bdef/specs/S-001.md: AC25's weekly offer at :13179-13204; AC82's note at :8669-8670; J5 at :14279-14300; VT3's row at :3361; the draft-13 record at :3635-3653
- /home/user/sd-m3bdef/docs/design/builds/m3b-picture/m3b-overview-4-home-weekly-360-light.png and /home/user/sd-m3bdef/docs/design/builds/m3b-picture/round-2/m3b-r2-5-weekly-figures-trial-weeks-360-light.png
