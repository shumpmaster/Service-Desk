# M3E stage G8d: the Design reviewer's round 3 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8d at 102b051 (round-3 commits 8446e28 to 102b051, on 657694e) (G8d's work over 3058cc0).

---

Verdict: PASS

**Summary for the owner**
Round 3 builds both of your "A" answers, and the screens now say what the desk actually knows.
- **Every project shown:** when no project can be both read and drawn, Waiting no longer shows "Waiting on you 0", "Nothing here" and "Kicked back · none". The lane now gives no number and says "Can't read or show". The strip says "Kicked back · can't read or show". The red lines above it are unchanged.
- **One project shown alone:** take a project the desk couldn't draw whose read has since failed. It no longer says "0" and "Nothing here when last read". It now says "Can't show when last read" with no number, and the strip says "Kicked back · can't show when last read".
- **Same look:** the new words look exactly like the existing "Can't read" lane, in the same grey, size and font.
- **Signed out, every project shown:** still "Can't read".
- **Everything else is unchanged:** nothing else on Waiting, Home, a project page or the Pipeline view changed except clock ticks. Nothing scrolls sideways. All 1317 tests pass.

The Builder's "checking…" note is real but older than G8d (it dates from stage 1a). It doesn't block this round. I've put it to you as a question below.

**Evidence**
How I captured:
- Chromium through Playwright at 360×740 and 414×896, light and dark.
- IBM Plex Sans and Mono loaded (`document.fonts.check` true) on every capture except the older Pipeline view. That view uses no Mono and is pixel-identical before and after.
- Trees exported with `git archive`: before 657694e, after 102b051. The before tree uses the after tree's tests/, so both render the same fixtures.
- 76 captures per tree: the 19 g8d- shots (6 new) and 19 x- states (8 new), each at the 4 sizes and themes. Each `.txt` beside a `.png` holds the rendered text, an ARIA snapshot, computed styles with contrast, scrollWidth, and the set of styles in use.
- Folder: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r3/ (shots-before/, shots-after/, cmp.txt).

Findings by ruling and checklist item:
- **The two rulings (P-001-glance-no-quiet-lanes.md A, P-001-glance-cant-show-last-read.md A); spec AC91 (f) and AC89 (a) round 3; part A items 1, 4 and 5. Kept.** The only screens whose words changed are the targeted ones; every other difference is a clock digit.
  - **x-noquiet and g8d-waiting-cant-read-or-show** (Service-Desk and Personal-Org-Operating-Model can't be read, Alpha can't be drawn):
    - before: "Kicked back · none" / "Waiting on you 0" / "Nothing here"
    - after: "Kicked back · can't read or show" / "Waiting on you" / "Can't read or show"
  - **The same change on other states:**
    - x-noquiet-later (one read failed after a first read)
    - g8d-waiting-none-drawn (every project readable, none drawable)
    - x-ext-noquiet (md-extremes)
    - x-poom-noquiet (poom)
  - **g8d-waiting-cant-read-or-show-cards:** Alpha's last-read cards stay, with their count of 6. Only the strip changed, to "can't read or show", as AC91 (f) says.
  - **x-noquiet-pending** (a read still pending): "Not read yet" and "Kicked back · not read yet", as the spec's order puts it.
  - **x-cs-readfail-one, x-cs-readfail-one-cards, g8d-waiting-one-cant-show-last:**
    - before: "Kicked back · none when last read" / "0" / "Nothing here when last read"
    - after: "Kicked back · can't show when last read" / no count / "Can't show when last read"
    - The line above stays "✕ Can't read Alpha since 10:01: network error…", and under the title it stays "checked 3 min ago".
  - **Code:** src/public/lib/board.js:86, :106, :187, :237; src/public/sandbox.js:2020, :2030, :2431.
- **Signed out:**
  - g8d-waiting-signed-out-cant-show and x-cs-signedout are unchanged apart from clock digits: three "Can't read … since" lines, "Kicked back · can't read", and the lane "Can't read".
  - Shown alone and signed out, a can't-draw project (x-cs-signedout-one, g8d-waiting-one-signed-out-cant-show-last) gets state 5's new words "Can't show when last read". The line above still reads "Can't read Alpha since 10:01: Signed out — reload to sign in", as AC89 (a) round 3 has it.
  - g8d-home-signed-out-cant-show: only clock digits changed.
- **Unknown look, part A items 8, 23 and 27:**
  - "Can't read or show" and "Can't show when last read" are `.v2-empty.unknown`, 11px/400 IBM Plex Sans, rgb(92,95,102) in light and rgb(162,165,172) in dark. That is identical to the existing "Can't read" lane (x-cs-signedout).
  - The strip words are `v2-kw`, 11px/500 Plex Sans, identical to "can't read".
  - The lane head loses its Mono count, as the "Can't read" lane does.
  - The set of styles in use is identical before and after on every capture, so no new size, weight or font.
- **Items 10 and 25 (contrast):** the new lane and strip words measure 6.40:1 in light and 7.72:1 in dark, the same as "Can't read".
- **Item 12 (width):** scrollWidth equals clientWidth on all 152 after captures. On x-ext-noquiet the long Epsilon name wraps inside the width.
- **Item 13 and the screen reader:** the meaning is in words, not colour. ARIA on g8d-waiting-cant-read-or-show reads: region "Kicked back", paragraph "Kicked back · can't read or show"; region "Waiting on you", heading "Waiting on you" with no count, paragraph "Can't read or show". The alone screen reads the same way with "can't show when last read".
- **Item 6 (every project):** service-desk (g8d-), poom (x-poom-noquiet, x-poom-cs) and md-extremes (x-ext-noquiet, x-ext-cs, x-ext-cs-one) all render without error.
- **Nothing else moved:** after replacing digits, every capture outside the 13 targeted states has identical text before and after. Pixel differences there come only from clock ticks: "since 10:01"↔"10:02", ages, "checked 43 s"↔"0 s".
- **Tests and build (after tree):**
  - `node --test ../tests/desk/`: 1317 of 1317 passed (tests-after.log).
  - `node tools/build.mjs`: "build: PASS (2 connected projects; 36 page modules in step)" (build.log).

**Blocking findings**
None.

**Non-blocking findings** (there before this round, not made worse)
- **N1. With every project shown, "checking…" under Waiting's title stays up indefinitely while reads fail.**
  - Where: g8d-waiting-cant-read-or-show, x-noquiet, x-noquiet-later, x-ext-noquiet. While any project has never been read in this opening, Waiting's line under the title says "checking…". Home says "Checking…" too (x-noquiet-home).
  - Why it misleads: on these screens the reads have already failed, and the red lines just below say "✕ Can't read … in this opening". Shown alone, the same project's title line says "Not read in this opening" (AC89 (a) state 2), and AC89 (a) says "a failed read is never called 'checking…'".
  - What allows it: AC82's every-project rule ("Checking…" before every project has been read once in this opening) and checklist item 4 both permit it.
  - Why it's a follow-up, not a FAIL: it is not a false "Quiet", and it is older than G8d (sandbox.js:2107 `checkedWords`, from stage 1a, a4c6e3f).
  - Is it misleading? Mildly. It suggests a read still in progress, while the desk is in fact retrying failed reads. It also gives no age, and it disagrees with the alone view. The words are a choice for you (question 1).

**Notes**
- "Can't read or show" also appears when every project can be read but none can be drawn (g8d-waiting-none-drawn: three "Can't show …" lines above it). That case falls within the ruling as you answered it ("when no project … can be both read and drawn"), so I have not raised it.
- Without its count, the "Waiting on you" head sits level with "Done · last 24 h". That is the existing unknown-lane layout, the same as "Can't read".
- Known follow-up, untouched: the `--soft` contrast.

**Questions for the owner** (asked, not picked)
1. With every project shown, suppose a project has never been read since the desk opened and its reads keep failing. Waiting's line under the title says "checking…", and Home says "Checking…". Shown alone, the same project says "Not read in this opening". Should the every-project line change?
   - (a) Say what is known instead, for example "Not read in this opening" while any project's first read has failed, on both Home and Waiting.
   - (b) Leave as built; the red "Can't read" lines just below explain it.
   - Changing Waiting alone would split it from Home's same rule (AC82), so either answer should cover both.

**Pairs for the owner** (before on the left, after on the right, each labelled "Made-up fixture data (test fixtures) - NOT real projects, NOT real failures")
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r3/owner-pairs-final/01-waiting-every-project-360-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r3/owner-pairs-final/02-waiting-alone-360-dark.png
