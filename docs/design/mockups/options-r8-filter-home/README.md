# Options: a quick filter for the branch map, and home (round 8, answer 16)

Built over mockup v38 (`../timeline-v38-craft.html`). `source/build.py` writes `phone.html` (v38 with `source/fh.css` and `source/fh.js`, each option switched on by the phone's hash; see the head of `fh.js`); `source/page.py` writes `index.html`, using the round 8 options pages' stylesheet (`../options-r8/source/pages.py`).

## 1. A quick filter for the branch map

- In v38: In v38 the map shows every event of the phase, and the list every row, with no way to narrow them. What you most often look for, what waits on you and the turning points, sits among routine commits and reviews.
- Touches: None is removed or moved. A adds one small control on the map card; B adds a row under it (40 points of the band, which you asked to keep slim: round 7 answers 21 and 22, round 8 answer 6, item 8); C makes the lane names tappable. In every option the filter also quiets the list, so the pointer and the map's arrow carry on as ruled (round 7 answer 8; round 8 answer 6, items 4 and 5).
- Recommended: A. A filter button on the map card: one tap, no room taken, six useful cuts (Everything, Yours, Turning points, Reviews and checks, Research, Main only) each with its count, and the list quiets with the map.
- Phones: v38 as it is, No filter (`#light`); Option A, A filter button on the card (`#f=A.light`); Option A, Its panel open (`#f=A.light.open`); Option A, Showing Yours (`#f=A.light.pick=you`); Option A, Turning points, dark (`#f=A.dark.pick=turn`); Option B, A segmented row under the card (`#f=B.light`); Option B, Turning points chosen (`#f=B.light.pick=turn`); Option B, Dark (`#f=B.dark.pick=you`); Option C, Tap a lane's name (`#f=C.light`); Option C, One sprint alone (`#f=C.light.solo=2-2-2`); Option C, Dark (`#f=C.dark.solo=2-2-2`)

## 2. Home: the title

- In v38: In v38 home's title is a small "Timeline" with its live line at the top left of the floating bar, the bell and More at the right, the same slim bar a project page uses (round 6, answers 1 and 4). It reads like a label, not the start of the page.
- Touches: A and B: the slim floating bar of round 6 answers 1 and 4 appears once you scroll; at the top it is clear and a large title starts the page. B also moves round 4 answer 11's sentence into the heading. C keeps the bar as ruled and only centres the title.
- Recommended: A. A large title that folds into the bar: it is how iPhone apps start a page, it gives home a clear top, and once you scroll it becomes the slim floating bar you ruled.
- Phones: v38 as it is, The small title in the bar (`#light.home`); v38 as it is, Dark (`#dark.home`); Option A, A large title (`#t=A.light.home`); Option A, Scrolled (`#t=A.light.home.y=300`); Option A, Dark (`#t=A.dark.home`); Option B, The sentence as the heading (`#t=B.light.home`); Option B, Dark (`#t=B.dark.home`); Option C, A centred small title (`#t=C.light.home`)

## 3. Home: the search

- In v38: In v38 a full-width search field sits under the bar, 44 high, above what waits on you. It is used now and then, but it takes the first row of the page.
- Touches: None. The bar keeps its height (round 7 answers 21 and 22 apply to a project page; home's bar is the same slim bar).
- Recommended: A. A magnifier in the capsule beside the bell: always one tap away, it opens a field over the bar, and the row it frees goes back to what waits on you.
- Phones: Option A, A magnifier in the capsule (`#t=A.s=A.light.home`); Option A, Opened (`#t=A.s=A.sopen.light.home`); Option B, Pulled down from the top (`#t=A.s=B.light.home`); Option B, Pulled down (`#t=A.s=B.light.home.pulled`)

## 4. Home: can more be done?

- In v38: Home groups what waits on you by project, says what each answer holds up, shows a slim strip of what mattered, and folds the quiet projects (round 4, answers 7 to 12). It does not say whether anyone is at work, or what changed since you last looked, without opening each project.
- Touches: B adds one line under each project's strip (round 4 answer 12); C adds a card above the groups, where round 4 answer 7 took the old project cards away. "No" is a fair answer.
- Recommended: B. One quiet line per project, who is at work and how much is new since you last looked: the two things home cannot tell you today, and they decide which project you open first. A, nothing more, is also sound: home already does its one job well.
- Phones: Option A, Nothing more (`#t=A.s=A.light.home`); Option B, A line per project (`#t=A.s=A.m=B.light.home`); Option B, Dark (`#t=A.s=A.m=B.dark.home`); Option C, The week in one card (`#t=A.s=A.m=C.light.home`)

## Together: every recommendation

- In v38: Filter A, title A, search A and more B on v38.
- Touches: As each item above.
- Recommended: Shown together so you can see them as one page.
- Phones: Together, Home (`#t=A.s=A.m=B.f=A.light.home`); Together, Home, dark (`#t=A.s=A.m=B.f=A.dark.home`); Together, A project, filtered to Yours (`#t=A.s=A.m=B.f=A.light.pick=you`)

## What the filter matches

Yours: what waits on you and what is marked Yours. Turning points: stops, decisions, merges and gates, and what waits on you. Reviews and checks. Research. Main only: merges. What is left out goes to 14% on the map and 32% in the list; headings stay. C keeps a sprint's events by the list's numbers (2.2.2.x), so a commit the map draws as nothing still counts.
