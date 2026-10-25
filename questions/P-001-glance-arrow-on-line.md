# Ruling needed: On a Home tile, where should the "now" arrow go when a line leads into the now circle?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: The "now" step (G8) puts a small dark arrow 3 px left of the now run's icon on each Home tile, as the spec and the approved mock place it. The mock only drew a tile whose now circle starts its row. When a line comes into the now circle from the left, which is how every project past its first phase looks, the arrow sits on that line and can read as the line's arrowhead ("Build leads to Launch") more than "you are here". Left unruled, it stays as built.
OPTIONS:
  A. As built — the arrow stays 3 px left of the icon, on the line where there is one.
  B. The line stops short — where a line leads into the now circle, it ends before the arrow, so the arrow stands on its own; built in a small change after G8 lands.
  C. The arrow above the circle — on every tile it points down at the now circle from above, like the project page's strip, and never touches a line; built in a small change after G8 lands.
RECOMMENDATION: B — it keeps the place you approved and only clears the line, so the arrow reads the same on every tile.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the arrow on Home's tiles only; the other four arrows are unchanged
DEFAULT: B   TIMEOUT: 168

## Context
- AC92 (b) puts the tile's arrow 3 px left of the now run's icon (source: specs/S-001.md, AC92 (b))
- The approved mock drew only a tile whose now circle is first in its row (source: the G8 design review, note 1, to be filed verbatim as reviews/M3E/_stage-g8-design-r1-verbatim.md with G8's pull request)
- The before and after picture shows both cases (source: docs/design/builds/m3e-g8/04-home-tiles-NOT-real-360x740-light.png, filed with G8's pull request; the Alpha tile is made up)
