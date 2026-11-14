# Desk Element Library

The quiet, round, neutral look for the whole desk, taken from the owner's Craft references.

This library holds every element seen in the owner's seven Craft screenshots (references 11 to 17 in Service-Desk `docs/design/references/`). The measures come from the external audit of those screenshots (`docs/design/audit-2026-11-14-craft-v7.md`, Part 2). Mockup v8 (`docs/design/mockups/timeline-v8-craft.html`) is the first desk screen built from them. The palette is neutral only for now; the owner will add colour later.

## Principles

- **Neutral first, one blue.** The only hue is blue, and it means one thing: selected, or now. Nothing is coloured for decoration.
- **Rows, not boxes.** Lists are plain rows on the ground, split by inset hairlines. Cards are kept for things you can open.
- **Round shapes.** Controls are capsules and circles; sheets and popovers have a 28 radius. Nothing is square.
- **Floating controls are glass.** Top buttons, the capsule, the tab bar and the round button float over the content on `surface-floating` with `shadow-float`. Rows and text never cast a shadow.
- **The system font.** One family at a few sizes: 27, 19, 17, 15 and 13. Weight does the work, not colour.
- **Everything rises.** Settings and tools come up in bottom sheets; short choices open as popovers from the button that asked.

## Foundations

**Colour.** Tokens are semantic (`ground`, `surface`, `text-1`, `accent`). Light is sampled from the references. Dark is **assumed**: the references show no dark mode, so its values follow the usual iOS dark neutrals, and they are not yet reviewed.

**Type.** The system font (`sans`), plus a mono (`mono`) only for the desk's ids, such as S-011. The references have no mono.

**Spacing.** 16 is the screen margin, 8 the gap between chips and cards, 12 the sheet inset and 24 the gap between sections. Measures are points, used as px.

**Size.** The fixed control sizes (44 hit, 40 chip, 48 row, 42 menu row, 62 tab bar, 56 round button, 36 capsule) are tokens in their own family.

## Legibility: four values made darker

Words must reach 4.5:1 against what they sit on. Four reference values fall short, so the tokens use a darker value and the reference value is kept for icons only:

| Use | Reference | Token value | Ratio |
|---|---|---|---|
| Secondary words (`text-2`) | #7e8084, 3.6:1 on ground | #6b6d71 | 4.7:1 on ground, 5.2:1 on white |
| Apply fill (`accent`) | #3a85f6, white 3.6:1 | #2f6fd6 | 4.8:1 |
| Blue text button (`accent-text`) | #0a80d7, 4.1:1 on white | #0a6fc0 | 5.2:1 |
| Icons and placeholders (`icon`) | #7e8084 | kept | 3.6:1, so never words on their own |

`text-3` (2.2:1) and `text-4` (1.5:1) are for marks such as dots, chevrons and counts, never for words that matter. The other text pairs pass: `text-1` 15.2:1 on ground; selected-chip label 6.3:1; Now title 4.7:1; Done label 15.9:1; Cancel 6.6:1.

## Using the elements

- One LargeTitle per screen. Groups get a SectionHeading. Sheets use CapsLabel inside them.
- The TabBar holds the main sections as icons only, and each still needs a name for screen readers. The one RoundButton beside it is Now.
- A FilterChip row switches projects. Only the selected chip shows its full label.
- Only one NowBlock per plan.
- A BottomSheet always has a Done; Apply and Cancel pairs sit at the foot of a sheet.
- Motion stays as in v8: the branch from desk to project, sheets that rise, and the plan centring on Now. The reduced-motion setting turns it off.

## Open, the owner's to choose

- Colour: which hues join the neutrals, and what each means.
- The key shapes for milestones and sprints, and how "planned" is drawn on the trunk (TimelineTrunk shows a dashed ring as a placeholder).
- Positions: DeskHome puts the elements together at phone width. Comment on any card to move, resize or drop an element.
