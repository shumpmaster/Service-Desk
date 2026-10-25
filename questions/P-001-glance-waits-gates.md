# Ruling needed: How should a project page list two gate cards waiting at the same gate?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: On a project's page, the line of short names under "◆ <n> wait on you" is cut at two lines. When two gate cards wait at the same gate, the words that tell the second one apart (", case 2", "…for P-005", "launch-2") fall past that cut in every example reviewed, and the longer names push other items, such as "a merge of P-002", out of view on a phone. Tapping the line still opens Waiting with every title whole, so nothing is hidden for good. The question is what you see first at a glance. Left unruled, it stays as built.
OPTIONS:
  A. As built — each card keeps its own name, in board order, with the cut unchanged; the second card's distinguishing part is often only visible after a tap.
  B. Name a gate's cards once — the gate's name once, then each item or case: "the Launch gate for P-004 and P-005", or "the Launch gate for P-004, cases 1 and 2", in the place of the first card; the line gets shorter, so both usually show and earlier items stay visible; the cut, order and count are unchanged, though the line then holds fewer names than its count. Built in G5.
  C. Gate cards first — both are more likely to show, but the line no longer follows the board's order and other items move further past the cut. Built in G5.
  D. Cut at three lines instead of two — more shows, but the line takes another line on every page with many waits. Built in G5.
RECOMMENDATION: B — the only option that shortens the line, keeping the cut, the order and the tap as they are.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the waits line on a project's page only; counts, badges and Waiting are unchanged
DEFAULT: B   TIMEOUT: 168

## Context
- G4 names a waiting gate card "the <Phase> gate for <item>", and two cards for one item add ", case N" or "<gate>-<n>" (source: specs/S-001.md, AC89 (c), with the Definer's G4 notes)
- The Design reviewer found the second gate card's distinguishing part past the line's two-line cut in every example, at 360 and 414 px (source: the G4 design review, finding N2, to be filed verbatim as reviews/M3E/_stage-g4-design-r1-verbatim.md with G4's pull request)
- The spec keeps the line's two-line cut and its tap to Waiting, where every title is whole (source: specs/S-001.md, AC89 (c))
