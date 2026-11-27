# Ground

The page's background: slight colour, not flat grey. Chosen by the owner on 26 November 2026 (decisions/questions/P-005-design-round-8.md, answers 15 and 16: "I'm really trying to introduce some slight color variation into the background I think"; "I like option a"), from docs/design/mockups/options-r8-ground/.

- **Three fields** over the plain `ground`: `ground-field-a` (blue, from the top left), `ground-field-b` (lavender, from the right a third of the way down), `ground-field-c` (mint, from the bottom), each fading out by 60%. In dark they are faint deep glows on near-black.
- **Fixed** to the screen, the same on every page, so it is never mistaken for a status. The glass controls catch it.
- **Words**: on the field, secondary words use `text-2-on-field`, one shade darker in light, so they keep 4.5:1 at the most tinted point (4.93:1 measured). Cards, rows and status colours are unchanged.
- **The floating band** paints the same field, lined up with the screen, so the colour runs on behind it. iPhone Safari does not keep a fixed background on an element, so the field is a fixed layer behind the page and the band is told its own place on the screen as it moves.
- **A tad lighter** (v47): in light, the plain ground half a step lighter (`#f6f7fa`, was `#f2f3f7`) and the fields a little softer (blue 18%, lavender 17%, mint 12%, were 22, 21 and 15). The owner, 27 November 2026 (decisions/questions/P-005-design-round-9.md, answers 1 and 2): "It looks great so far, maybe just lighten the background up a tad?"; "C", from docs/design/mockups/options-r9-lighter/. Dark is unchanged.
- **Reduced transparency or more contrast**: the plain ground alone.
- It loosens the neutral grey ground of decisions/questions/P-005-rebrand-style.md and the one-blue rule, for the background only.
