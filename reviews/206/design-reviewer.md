Verdict: PASS

**Evidence**
- **Plan (AC90 Plan part; ruling P-001-audit-repeat A; part A items 1 and 2).**
  - Each group's head says the shared reason once: "6 milestones · no estimates yet" and "6 rough finishes not available: MD1 has no estimate yet". Other projects read "… Service-Desk's MD1 has no estimate yet"; Alpha reads "9 milestones · …". md-extremes reads "9 milestones · estimate not available".
  - The rows drop those lines. Plan at 360 px shrinks from 2966 to 2041 px.
  - A row's own sheet is unchanged: 24 of 24 Plan sheet captures have identical sheet text.
  - Crops: CROPS/s3-plan-groups-360-light.png and CROPS/s3-plan-groups-414-dark.png.
- **Timeline (AC90 Timeline part; frame 7b).**
  - Each band has one "Why not recorded yet for <k> of <n> milestones · for the agents to add" line, and its milestones drop their own Why line.
  - A milestone alone in its run keeps its own line (M3C under Launch).
  - Crop: CROPS/crop-s3-tl-top-dark.png.
- **Home (AC90 Home part).**
  - main reads "3 projects · why their run went back: not recorded"; md-extremes reads "6 of 7 projects · …" (the seventh can't be read).
  - Each tile's Now line becomes "Now: Design, run 2". No fixture record gives a went-back date, so there is no date to keep.
  - Crops: CROPS/s3-home-grouphead-360-light.png and CROPS/s3-home-grouphead-extremes-414-dark.png.
- **New lines (items 8, 10, 14, 27).** 12 px, weight 400, IBM Plex Sans. Contrast 6.4:1 in light and 7.72:1 in dark. Grey only; no vermilion added. Sizes on screen are 11, 12, 13, 15 and 24 px.
- **Width (items 6, 12, 25).** No sideways scroll in any capture, on any fixture, in either theme.
- **Nothing else moved.**
  - main: 692 captures, 616 identical. Every difference is on Plan, the Timeline, Home, or Plan behind its sheets.
  - md-extremes: 1104 of 1204 identical, with the same pattern.
  - sdq and unread25: only the same three screens. letters: 176 of 176 identical. long: 187 of 188 (one clock tick).
- **Part B.** Matches frame 6's "one line, not one on each row" pattern, and frames 7b, 11 and H5 as far as they draw it. No key added (item 35).

**Non-blocking findings**
- **N1 (item 32 "opened at Now"; AC90 "under its band").** The current run's shared line sits right under its band, above the planned rows and the Now line. When the Timeline opens at Now, MD2 and MD1 show no Why line, and the line that explains why is off screen above. It follows the spec's words. Crop: CROPS/s3-timeline-at-now-360-light.png.
- **N2 (AC90's rule against its own Timeline bullet).** When the line covers every milestone, the Timeline says "for 2 of 2", "3 of 3" or "6 of 6 milestones". Plan, Home and Team say "<n> milestones" as AC90's rule asks. But AC90's Timeline bullet itself writes "<k> of <n>". This is a tension inside the spec.

**Follow-ups (already there before the change)**
- Home tile names are 17 px tall targets in the full-page captures. The audit already closed this.
- One base capture (unread25, 414 light) had a failed fake pull-request read. That was a capture flake, not the page.

**Open questions**
- N1: should the current run's shared line be visible when the Timeline opens at Now?
- N2: should the Timeline say "<n> milestones" when the line covers them all?

---

(Recorded verbatim by the orchestrator from reviews/M3D/_stage-3-4-5-design-r1-verbatim.md, its stage 3 part.)
