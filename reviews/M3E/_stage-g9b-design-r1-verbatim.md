# M3E stage G9b: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g9b at 704aba7 (G9b's work over 978d9d3).

---

Verdict: PASS

G9b changes one line of text and nothing else. Under the Home and Waiting titles, when any project's first read has failed, the line now says "Not read in this opening" where it used to say "Checking…". I tried to refute this and could not. I rendered the old code (978d9d3) and G9b (704aba7) from the same made-up states and compared them. The only difference in the rendered text, and in the pixels, is that one line. The line stays in its grey place: same element, size and colour, no icon. At 360 px it takes one line and nothing scrolls sideways. Every state you listed reads as the owner ruled. I have three non-blocking follow-ups, all behaviour that was already there before G9b. Nothing needs the owner.

**Evidence**
- **Rendered text, before and after.** I rendered the Builder's 7 `G9B_OPENS` screens plus 14 of my own states with tests/desk/tools/glance-shots.mjs. I ran it on copies of the tree under scratch, with a text dump added, never in the repo. Each state was rendered at 360×740 and 414×896, light and dark: 84 captures per tree. The only text that changes is the line. Other differences are clock jitter between the two runs ("checked 42 s ago" against "57 s ago", "3 h 20 m" against "3 h 21 m").
- **Pixels, before and after.** In every changed capture the difference is confined to the box (33,134)–(288,157) in device pixels at 2×. That is about 128 by 12 CSS px, one line. Nothing moves, and no capture's height changes. These captures are pixel-identical before and after:
  - Waiting with one project shown alone (`g9b-waiting-one-checking`, `r-waiting-alone-failed`);
  - Service-Desk's page (`r-page-sd-onefail`);
  - the Personal-Org-Operating-Model page (`r-page-sd-failheld-poom`).

**Checklist (part A)**
- **Item 1, rulings: holds.** Each ruling, read in a rendered state:
  - P-001-glance-checking-line, A: one failed with one on its way, every one failed, and one failed with the rest read all say "Not read in this opening", on both Home and Waiting.
  - -case, A: with every first read on its way, Home says "Checking…" and Waiting "checking…" (test file :67 and :182).
  - -twice, A: Home shows the grey line at the top and the red "✕ Not read in this opening" below "Since you last looked". The two are well apart and read acceptably (g9b-home-failed-held-360x740-light.png).
  - -alone, A: Service-Desk shown alone, its own read on its way beside a failed one, says "Checking…". The made-up project shown alone says "Not read in this opening".
  - -slow, A: signed out, and the mixed signed-out state, say "Not read in this opening". The 3-minute case is covered by ac91-g9b-checking-line.test.mjs:296.
  - A project read and then failing (state 5) says "checked 3 min ago" on both screens, as built.
  - The failed project, once read, says "checked <age> ago" on its first draw (test file :193). With another read still on its way it says "Checking…" (:246).
- **Item 2, spec: holds.** The change matches AC91 (c)'s G9b part, AC82's G9b note and G9b's row. `titleLine` is at src/lib/home.js:73 and src/public/lib/home.js. It is wired in at src/public/sandbox.js:729–730, :1084 and :2571. The "Nothing waiting on you" row on a project's page keeps `checkedWords` (sandbox.js:1366), unchanged as the spec says.
- **Items 4 and 5, quiet is honest and no made-up figures: hold for what changed.** The new line never reads as quiet, and it gives no time or count.
- **Item 6, every project: holds.** I rendered every project in the shared fixture, md-extremes (`extState`: Home and Waiting) and the quiet state. All render without error. md-extremes's line ("checked <age> ago") is unchanged.
- **Items 8, 10, 13, 14 and 25: hold.** The line's computed style is the same before and after: 12 px, weight 400, rgb(92,95,102) in light and rgb(162,165,172) in dark. Contrast is 6.4:1 on #fff and 7.77:1 on the dark page (15,16,18). There is no icon, and it never uses `--bad` or `--you`. The red line on Home's list stays rgb(179,22,42) in light and rgb(255,107,120) in dark.
- **Item 12, width: holds.** No capture reports scrolling sideways. At 360 px the line ends near 144 CSS px.
- **Items 19, 22 and 23, plain words, tabs and typeface: hold.** The words are plain, and no font, navigation or CSS changed. git diff 978d9d3..704aba7 touches no .css file.
- **Part B 27, sizes:** 12 px and weight 400 are on the mockup's scale. Mockup v2 does not draw this state, so the rest is judged by part A alone.

**Tests**
- The full desk suite on G9b's tree passes 1342 of 1342.
- The tests from before G9b, run against G9b's source, pass 1322 of 1322, so no locked case had to change.
- ac91-g9b-checking-line.test.mjs fails against the old source, so its cases do catch the old behaviour.

**Blocking findings**
None.

**Non-blocking findings** (all already on screen before G9b and unchanged by it; follow-ups to file)
- **N1. Waiting never names a project whose first read is still on its way (items 4 and 5).**
  - On Waiting with one project failed, one on its way and one read, the screen shows: "Not read in this opening", "Nothing waiting: Personal-Org-Operating-Model", "✕ Can't read Alpha in this opening", then "Waiting on you 0", "Nothing here" and "Kicked back · none".
  - Nothing says Service-Desk is still being read, and the lane shows 0 while its count is unknown.
  - The lanes are drawn as AC91 (f) says, and G9b's spec keeps them that way on purpose. Before G9b the line's "checking…" was the only hint that a read was still coming. The new line is still true, since Service-Desk has not been read in this opening, so item 4 holds.
  - Evidence: g9b-waiting-failed-held-360x740-dark.png. The Chief of Staff may want to ask the owner whether Waiting should name a project whose read is still on its way.
- **N2. A read project's own page says "checking…" (items 4 and 19).** With the made-up project failed and Service-Desk read, Service-Desk's page says "Nothing waiting on you · checking…", and keeps saying it for as long as the other project fails. The spec keeps `checkedWords` here (AC91 (c), "the screens"). Evidence: rendered text of r-page-sd-onefail, lines 26–27, identical before and after.
- **N3. Signed out, Waiting never says so (item 19), and two of the Builder's captures are duplicates.**
  - g9b-waiting-signed-out-* and g9b-waiting-every-failed-* are byte-identical (md5 013376d4…). Signed out, Waiting shows only "✕ Can't read <project> in this opening" for each project, never "Signed out — reload to sign in", which Home's briefing does show.
  - The page's tab title still says "Not quiet: can't read 1 project · Checking…" while the line says "Not read in this opening". This is AC4, unchanged by the spec, and the test file pins it at :202.

**Questions for the owner**
None. No two rulings conflict here, and no ruling conflicts with the checklist.

**Captures for the pull request** (in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9b/shots/)
1. g9b-home-failed-held-360x740-light.png: the main case. It shows the grey line, the red "✕ Not read in this opening" further down (the "both stay" answer), and Service-Desk's tile still saying "Checking…".
2. g9b-waiting-failed-held-360x740-dark.png: Waiting with every project shown, in dark. The lanes are unchanged ("Nothing here", "Kicked back · none") beside the new line.
3. g9b-waiting-one-checking-360x740-light.png: one project shown alone keeps its own "Checking…" although another project failed (the "alone" answer).
4. g9b-home-signed-out-360x740-dark.png: signed out counts as failed (the "slow" answer), under "Signed out — reload to sign in".
5. g9b-waiting-every-failed-414x896-light.png: every project failed, at the wider size. Use it instead of the waiting-signed-out capture, which is identical.

My own renders, before and after, are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9b-rev/out-head and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9b-rev/out-base, with a .txt text dump beside each .png. Test logs are /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9b-rev/full-head.txt and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g9b-rev/full-old.txt. I changed nothing in the repository.
