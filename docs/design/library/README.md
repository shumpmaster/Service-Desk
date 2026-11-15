# Desk Element Library

The quiet, round, neutral look for the whole desk, taken from the owner's Craft references.

This library holds every element seen in the owner's seven Craft screenshots (references 11 to 17 in Service-Desk `docs/design/references/`). The measures come from the external audit of those screenshots (`docs/design/audit-2026-11-14-craft-v7.md`, Part 2). Mockup v8 (`docs/design/mockups/timeline-v8-craft.html`) is the first desk screen built from them. The palette is neutral only for now; the owner will add colour later.

## Principles

- **Neutral first, one blue.** The only hue is blue, and it means one thing: selected, or now. Nothing is coloured for decoration.
- **Rows, not boxes.** Lists are plain rows on the ground, split by inset hairlines. Cards are kept for things you can open.
- **Round shapes.** Controls are capsules and circles; sheets and popovers have a 28 radius. Nothing is square.
- **The timeline's track is pressed in.** The trunk and its branches are a 6-point groove (`groove`, `shadow-groove`), the opposite of the raised chips; done work fills it (`groove-fill`).
- **Main stands out.** On the lane graph, main's groove is wider and darker (`groove-main`) and its icons sit on dark discs (`main-mark`); every branch takes its own lane while it is open.
- **The work between events is a plan.** Each step shows its actions (ActionPlan): what was planned, why, any problem and what was done about it, ticked off as it goes, numbered from phase to action. Red (`problem`) is used only for problems.
- **Chips are raised.** A light top edge, a darker bottom edge and a small drop make chips read as pressable; the selected chip lifts a little more.
- **Floating controls are glass.** Top buttons, the capsule, the tab bar and the round button float over the content: `surface-floating` is 78% opaque and blurs what is behind, and `shadow-float` adds a soft drop and a white inner edge. Sheets and popovers are frosted the same way. Rows and text never cast a shadow.
- **The system font.** One family at a few sizes: 27, 19, 17, 15 and 13. Weight does the work, not colour.
- **Everything rises.** Settings and tools come up in bottom sheets; short choices open as popovers from the button that asked.

## Foundations

**Colour.** Tokens are semantic (`ground`, `surface`, `text-1`, `accent`). Light is sampled from the references. Dark is **assumed**: the references show no dark mode, so its values follow the usual iOS dark neutrals, and they are not yet reviewed.

**Type.** The system font (`sans`) only. On an iPhone or Mac it is SF Pro, as in the references; elsewhere the nearest system face stands in. Ids such as S-011 sit in captions in the same font: the references have no monospace, and the desk's monospace breadcrumb is dropped.

**Icons.** Craft draws Apple's SF Symbols, which a web page cannot use. The library uses Phosphor (MIT licence), the closest open set: **regular** weight for list rows, **bold** for controls, tabs and menus, and the **filled** form for anything selected (the selected tab, the selected chip, the waiting bell). Sizes: 22 in rows and chips, 24 in top buttons, 26 in the capsule and menus, 27 in the tab bar. The circled More is drawn by hand to match SF's.

**Spacing.** 16 is the screen margin, 8 the gap between chips and cards, 12 the sheet inset and 24 the gap between sections. Section headings sit 8 in from the title (x 24). On a 393 by 852 screen: status bar 54, top buttons 6 below it, the large title at y 136, search at y 188, the tab bar 22 from the bottom. Measures are points, used as px.

**Size.** The fixed control sizes (44 hit, 40 chip, 48 row, 42 menu row, 62 tab bar, 56 round button, 36 capsule) are tokens in their own family.

## Legibility: three values made darker

Words must reach 4.5:1 against what they sit on. Three reference values fall short, so the tokens use a darker value; the original grey is kept, for icons only:

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
- A row of named FilterChips switches projects: every chip shows its name, and the selected one adds its count (the owner's choice, 15 November 2026). Chips are raised a little by `shadow-chip`.
- Only one NowBlock per plan.
- A BottomSheet always has a Done; Apply and Cancel pairs sit at the foot of a sheet.
- Motion: opening a project is a push, the desk out to the right and the plan in from the left, already on Now, in about half a second (the owner's choice, 15 November 2026). Nothing draws from the top down. Sheets still rise. The reduced-motion setting turns motion off.

## Open, the owner's to choose

- Colour: on hold. The owner, 15 November 2026: "Hold tight on the colors for now, the design needs to be ironed out".
- The key shapes for milestones and sprints, and how "planned" is drawn on the trunk (TimelineTrunk shows a dashed ring as a placeholder). The owner, 15 November 2026: "I think that will get changed around a bit as well".
- Positions: DeskHome puts the elements together at phone width. Comment on any card to move, resize or drop an element.
