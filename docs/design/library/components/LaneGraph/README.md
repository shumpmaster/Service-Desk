# LaneGraph

How several branches show at once on the timeline: a git graph drawn in the library's groove. Chosen by the owner on 15 November 2026 ("Option C is my choice", of the lane options).

**On the timeline it is replaced by BranchMap.** The owner found the lanes took too much room left to right (decisions/questions/P-005-design-round-3.md, answers 1 to 3) and chose a branch map floating at the top instead, showing the whole phase and panning with the page (answer 6). The card is kept for the record and for any place that needs a vertical git graph; timeline mockups from v13 on draw no lanes beside the list.

- Main is the left lane. Its groove is 8 wide in `groove-main`, and its event icons sit on dark `main-mark` discs in `on-main-mark`. Branch grooves are 6 wide in `groove`, and their icons sit on `fill`.
- A branch opens the lowest free lane to the right where it starts, curving out of main, and keeps it while it is open. Branches open at the same time sit side by side.
- A merge curves the branch back into main. From a far lane, the curve crosses the lanes between. A merged branch frees its lane for the next branch. A branch still open runs to the top.
- Each icon is one event, in its kind's shape: the seven GitHub kinds only (the owner, 15 November 2026: "The only thing I really want to keep is the different 7 constants."). States are neutral; a running event is an outlined ring.
- Icons 26 round with a 15 glyph, a 3-point ring of `ground`; lanes 30 apart; rows 40 apart.
