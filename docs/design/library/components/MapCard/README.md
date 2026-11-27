# MapCard

The branch map as a raised glass card, with room around it and the whole map inside its outline. Asked for by the owner on 26 November 2026 (decisions/questions/P-005-design-round-8.md, answer 16: "For the branch chart can you put an outline around it and step it out a bit that way it has some depth and doesn't inherently blend in with the timeline below"; answer 17, a comment on v38: "The branch map needs more space to breath away from the other elements. And I want the map to entirely fit within its own space within the outline here if that makes sense? And I want it to have the glass look as well not just flat white").

- **Glass** (v39): `map-card` (46% white, 58% grey in dark) with a blur of 28 and saturation 2.2 over the ground's field, so its colours come through; a soft sheen from the top, a hairline `map-card-edge`, `glass-edge` along the top, and `shadow-map-card`, which falls onto the list.
- **Room** (v39): 16 from the screen's sides, 14 under the top row, 20 above the list.
- **Everything inside** (v39): `map-card-pad` (12) all round. The map is drawn to the inner box (its width is the card's width less the padding); main's lane starts and ends inside it, and main's label, the gate lines and their captions and flags, the selected milestone's dashed edge, the chip and the fold handle all sit inside. The inner box clips as a backstop.
- **Words** on the glass use `map-card-word` (5.3:1 or better at the most tinted point, light and dark); lane names keep clear of the right gate's line.
- **Folded** (MapFold), the card becomes a slim glass card with the same edge and shadow, the handle inside its foot.
- **Reduced transparency or more contrast**: a solid card with no blur. **More contrast**: a darker edge.
- **v42 (round 8, answer 25: "can we please increase the glass look as well?"):** 34% white (42% grey in dark), blur 34 and saturate 2.6, a brighter sheen and the glass rim (a bright top edge, a fainter left edge, a soft glow inside the top, the hairline); its words one shade further from the glass (map-card-word).
- **v46 (round 8, answers 31 and 32):** its first row is ProjectSummary's line (where the project stands, opening "About this project"); the gate lines, their captions and MapFilter's button start below it; the card is 40 points taller while open, and folds as before.
