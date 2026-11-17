# ProjectHeader

A project's page has one floating header: a slim bar with the title and status, the project pills right under it, then the BranchMap and the PhaseRow, all in one glass band that stays at the top as the page scrolls. Chosen by the owner on 16 November 2026 (decisions/questions/P-005-design-round-4.md: answer 13, "The project pills need to be part of the floating header as well."; answer 14, "Option B but you need to get rid of that gap of space between the title and pills. Honestly we can maybe shrink the title and update status and just convert it into a sleek header that stays with the pills and branch chart"; answer 16, option 1, "I like this option.").

- **The bar**, about 50 high: a 38 round Back on the left (glass); the project's name in 17 bold `text-1` with the status under it in 12 `text-2` ("Live · as of 17:25 UTC", the live dot in its colour; "read 1 min ago" drops here); the bell and More capsule at the right, a little smaller than on home (86%).
- **The pills**, right under the bar with no gap: the named FilterChips, slimmer (32 high, 14 type), in one row that scrolls sideways; the project you are in is picked out, with its waiting count.
- **Then the BranchMap and the PhaseRow**, as before.
- The whole band is `surface-floating`, blurred, with a `separator` hairline below; it is sticky at the top of the page from the first scroll. The large title no longer appears on a project's page; home keeps its LargeTitle.
- Icons: Phosphor (MIT), regular for rows, bold for controls and menus, fill for anything selected; Craft's own are Apple's SF Symbols, which a web page cannot use.
