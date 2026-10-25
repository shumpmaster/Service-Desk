# Ruling needed: Should the briefing's "Can't read" lines name projects in the same order as the tiles?

Milestone: M3E
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: Your answer A on "Since you last looked" puts its grey "not read" lines in the order of Home's tiles. The briefing above it lists its red "✕ Can't read <project>" lines in the desk's settings order, which is older and was not changed. So with two projects failing, one screen can name them in two orders, for example "Service-Desk, Alpha" in the briefing and "Alpha, Service-Desk" in the list. Left unruled, it stays as built.
OPTIONS:
  A. As built — the briefing keeps settings order and the list follows the tiles.
  B. Tile order in both — the briefing's can't-read lines follow the tiles too; built in a small change after G7b lands.
RECOMMENDATION: B — one order on one screen, and the tiles' order is the one you see most.
RISK CLASS: R1   REVERSIBILITY: reversible   BLAST RADIUS: the order of the briefing's can't-read lines on Home only
DEFAULT: B   TIMEOUT: 168

## Context
- AC91 (c) as changed sets tile order for the grey lines (source: specs/S-001.md, AC91 (c))
- The Design reviewer asked this as Q2 (source: the G7b design review, to be filed verbatim as reviews/M3E/_stage-g7b-design-r1-verbatim.md with G7b's pull request)
- The picture with both orders (source: docs/design/builds/m3e-g7b/01-two-unreadable-tile-order-NOT-real-360-light.png, filed with G7b's pull request; made-up fixture)
