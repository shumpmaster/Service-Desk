# MapCard

The branch map as a raised card, so it steps out and does not blend into the timeline below. Asked for by the owner on 26 November 2026 (decisions/questions/P-005-design-round-8.md, answer 16: "For the branch chart can you put an outline around it and step it out a bit that way it has some depth and doesn't inherently blend in with the timeline below").

- **The card**: `map-card` (74% white, 78% grey in dark) over the ground's field, inset 10 from each edge of the screen, `radius-20`, a hairline `map-card-edge` with `glass-edge` along the top, and `shadow-map-card`, which falls onto the list.
- **A 12-point gap** under the card, inside the floating band, so rows pass under the band before they reach the card.
- **Inside**, the map draws as ruled (BranchMap, MilestoneMap): its width is the card's; label halos take the card's colour; the selected milestone's dashed edge is rounded and kept clear of the card's edge.
- **Folded** (MapFold), the card becomes a slim card with the same edge and shadow, the handle inside its foot.
- **Reduced transparency**: a solid card. **More contrast**: a darker edge.
