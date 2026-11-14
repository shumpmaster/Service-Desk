# Ruling needed: which phone widths the timeline must fit with no sideways scrolling

Milestone: M7

WHY: The timeline's spec (S-011) must name the phone widths its pages fit without sideways scrolling (its AC17). The Definer proposed 360 and 414 CSS pixels, but no record gives a figure, so the plan reviewer cannot pass a criterion whose figure is still open, and no locked check can be written for it. A ruling now lets the Definer's next round write the figure in as yours.
OPTIONS:
  A. 360 and 414 CSS pixels — the two widths the desk's build screenshots already use, so the timeline is checked the same way as the screens it joins. Any width between them fits too; a wider phone, such as a large iPhone at 430 to 440, gets the same layout with more room.
  B. 375 and 430 CSS pixels — the narrowest and widest current iPhones (the small model and the largest), and not the widths the desk's existing screenshots use.
RECOMMENDATION: A. It matches the desk's existing screenshots, and 360 is narrower than any iPhone the owner is likely to hold, so it covers B's narrow end too.
RISK CLASS: R0 (specs/**)   REVERSIBILITY: reversible (computed from R0)   BLAST RADIUS: the timeline's spec, its locked check for AC17 and the build screenshots of the timeline
DEFAULT: A   TIMEOUT: none — put to the owner in session; it waits until answered

## Context
- AC17's widths are "the definer's proposal", and the spec's open question 1 asks the owner to set them (source: specs/S-011.md on item/P-005, AC17 and "Open questions for the owner")
- The plan review, round 2: "AC17 cannot be locked … Either the owner sets the widths before freeze, or AC17 is marked as not yet checkable", and the build screenshots under docs/design/builds/ show 360 and 414 (source: reviews/S-011/plan.md on item/P-005, finding 3)
