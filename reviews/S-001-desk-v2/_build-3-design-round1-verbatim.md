# S-001 desk v2, stage 3 (the project page and its Timeline): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-3 at b3e2156.

---

Verdict: FAIL

**In short:** The project page, the Timeline and the Team screen's phase line mostly carry out frames 5, 6, 6b, 7b and 8. The Timeline keeps what you liked and gains the clean-up. Three things fail:
- Opening "Details" on a project's page breaks the layout.
- A project the desk can't read shows made-up zeros.
- The Experiments sheet's links are too small to tap safely.

Each is a small fix. Home, Waiting and Plan are unchanged from 28b829d.

**What I ran.** Stage 3 at b3e2156, in a detached scratch worktree (now removed). Chromium through Playwright, served by tests/desk/fake-desk.mjs. Captures at 360×740 and 414×896, light and dark, plus the Timeline at 1024×1366. All captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr-3b-out/ (`shots/`, `wide/`, `base/`); the harness is cap3.mjs, setups3.mjs, probe.mjs and behave3c.mjs in the same folder.

Fixtures:
- Service-Desk at 77bfeae, with J12's pull requests.
- Personal-Org-Operating-Model in placeholder form, with `publishesModel`.
- "Members", made up: all 24 standard lines written, Design-2 and Build-4 skipped.
- The md-extremes set, plus three made-up projects: Eta (long titles), Zeta (can't read) and a long-named project with five Design runs and one recorded reason.
- AC61's fixture, for a long Context.

Tests:
- The locked page tests ac80-board, ac81-bar-type and ac48-62-63-look: 47 of 47 pass. The branch rewrites all three; AC81's text allows that ("that test rewritten in stage 3's pull request"). That is the Reviewer's to confirm.
- The whole desk suite: 946 of 946 pass.

## Blocking findings

**B1. Opening "Details" breaks the page's layout.** (Part A item 1, AC83 "Details … opening AC55's views as built"; part B item 26.)
- Captures: shots/x-details-open-360.png, shots/main-page-sd-details-414-light.png.
- `details.v2-pdetail` computes `display: flex`. Opened, the summary is squeezed into a column 110 px wide at 360 (142 px at 414). It wraps to about six lines, with the links, Notifications and Actions usage in a second column beside it.
- Cause: sandbox.css:132, `.sb-more { … display: inline-flex; … min-height: 44px }`, which the new `<details class="v2-pdetail sb-more">` (sandbox.js `detailsNode`) inherits. Nothing sets it back to block.

**B2. A project the desk can't read shows zeros as values.** (Part A item 5, "an unknown shown in words, never as a value or zero"; AC83 "At work now … as the tile".)
- Capture: shots/extremes-page-zeta-414-dark.png, for "Zeta-unreadable", which has never been read.
- The page says "At work now: no agent run recorded", "with the agents: 0" and "Experiments · 0 registered".
- Home's tile for the same project says "At work: not available".
- Cause: `pageTwoRows` uses `(p.agents || []).length`, and `restRows` counts an empty tree.

**B3. The Experiments sheet's links fail the tap-target rule.** (Part A item 11, WCAG 2.5.8.)
- Capture: shots/main-page-sd-experiments-414-dark.png.
- Each link is 14 px tall (widths 154 to 238 px), and they sit about 23 px apart. Each link is alone in its list item, not in a sentence, so the inline exception does not apply.
- The 24 px spacing check fails for all 5 links, at both widths and in both themes.

## Non-blocking findings

1. **Sprint titles carry the browser's default h4 margins** (part B items 26 and 32; frame 7b `.sp { gap: 6px }`).
   - `.v2-spt` (sandbox.css:1278) sets the font only, so the `<h4>` keeps 17.29 px margins above and below.
   - The title sits 23 px under its date row instead of about 6 px, and as far again above Technical.
   - This is the main thing keeping the sprint card looser than 7b. Capture: shots/main-tl-sd-sprint-414-light.png.
2. **The marks row is uneven.** A mark with a reason ("– checks", "– review") is a `<details>`: 12 px, in a 24 px flex summary. The others are 11 px spans. So they sit about 4 to 9 px lower and in a different size. Frame 7b draws one even line. Same capture, and wide/main-tl-sd-sprint-1024-light.png.
3. **Text shows through a gap between the pinned header and the pinned band** (part B item 32).
   - The band's pinned offset is rounded up to the next 8 px: header bottom 93 → band top 96 at 360 and 414; 107 → 112 and 146 → 152 for the long name; 87 → 88 at 1024.
   - Content scrolls through the 1 to 6 px gap, visible as "Why not recorded yet…" in shots/main-tl-sd-open-360-light.png.
4. **A false "1 more" under Why** (AC84 "a long one cut at three lines with "<n> more ▸"").
   - In AC61's fixture, Why shows "1 more" with nothing hidden (height 34 px = scrollHeight 34 px).
   - `longText` counts paragraphs, not whether anything was actually cut. The Context cut itself is correct: 3 lines, 50.4 px. Capture: shots/x-ac61-more-360.png.
5. **The opened phase's run heading drops "<how it ran>"** (AC83 "Run <k> · <its dates> · <how it ran>"; frame 6 "· went through pull requests, outside the pipeline"). It reads "Run 2 · 8 Oct – now", and ac83-page.test.mjs:258 pins that form.
6. **The waits row lists full card titles with no limit** (AC83 "the waiting items' short names"; frame 5 draws one line). For Eta at 360 it runs to about 13 lines and pushes the milestones off the first screen. Capture: shots/extremes-page-eta-full-360-light.png.
7. **The pinned area is large.**
   - The phase line wraps to two lines for Service-Desk at 360 and 414, so header plus band come to about 132 px pinned.
   - With a long project name, the header grows to 146 px plus a 36 px band: about a quarter of a 740 px screen. Capture: shots/extremes-tl-long-360-light.png.
   - Nothing overflows sideways. See question 1.
8. **Personal-Org-Operating-Model's page** (frame 8) also carries "Your last action … / Your merges?" and a "Details" row, which frame 8 doesn't draw. Capture: shots/main-page-poom-full-414-light.png.

## Checked and holding (both widths, both themes)

**Width and type:**
- No sideways scroll and no script errors in any capture.
- On the page and the Timeline, text uses only 24, 18, 15, 13, 12 and 11 px, in IBM Plex Sans and Plex Mono, at weights 400, 500 and 600.

**Contrast and colour:**
- No new text under 4.5:1.
- Vermilion appears only on the badge and the ◆.
- On the Timeline, Technical, Context and Why are `--ink2` words with a `--line2` edge.

**The page:**
- The milestones by phase work as ruled:
  - the project's own and the standard ones share one line per phase (P-001-milestones-together);
  - read from the bottom up;
  - the three states have distinct marks and words;
  - the "why not written yet" line appears once per phase;
  - Members' Design-2 reads "skipped · why: …" in softer text.
- Enter and Space fold and unfold a phase.
- The top line reads "v3 · model 3.5.0 · T1" and "… · publishes model 3.5.0".
- A tile's tap opens the page.

**The Timeline:**
- It opens with the Now line just under the header and band (136 px at 360). The phase line's tap returns to Now, and the Team screen's phase line opens the Timeline at Now.
- The desk's in-page refresh keeps folds, scroll and open sheets.
- Every sheet closes on Escape and on a tap outside.
- No new motion.

**Unchanged screens:** Home, Waiting and Plan match 28b829d in all 16 captures: text, positions, colours, tap targets and fonts. The only differences are the "checked N s ago" clock.

**Team:** the phase line is the same component with the same words, pinned, with no boxed marker left. The rest of the screen keeps its old layout until stage 7, as AC84 allows.

**The owner's Timeline:** Everything you said you liked stays:
- one feed, newest at the top;
- a band for each phase run;
- each milestone's "Done when" and "Why";
- each sprint's Technical, Context and Why;
- "Not tied to a milestone";
- the ends.

The clean-up landed:
- a compact pinned header;
- lighter bands with no box;
- a thin rail in the phase's colour;
- status icons in circles;
- small grey labels;
- the Now line as the only heavy rule;
- Linear-sized type.

Non-blocking findings 1 to 3 are what still separate it from 7b.

## Already there before this change (follow-ups, not part of this verdict)
- On Team, "Waiting on you, the oldest for …" is 4.18:1 (#d23c0f at 12.48 px on #eef0f2). It is the same at 28b829d.
- The Timeline's "Run 2 began · why it went back: not recorded" lacks the date frame 7b shows ("Run 2 began 8 Oct"), while the page's own line gives "from 8 Oct".

## Open questions
1. P-001-timeline-marker asks for "one short line", but AC84 sets its words as the whole first part of the sentence, which wraps to two lines on a phone. Should the line be cut to one line, or is two acceptable? That is for the owner or the Definer; I'm not picking.
2. The Timeline keeps AC59's "Status icons" key, folded at its foot. Part B item 35 says no key is added, while AC84 says every word AC59 shows stays. The spec outranks the checklist, so I raise it as a question, not a finding.
3. Is there a record source for "<how it ran>" (non-blocking finding 5)? If not, AC83 should say what the heading shows without it.