# S-001 desk v2, stage 7 (dark mode and the screens no frame redraws): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-7 at 83118c1.

---

Verdict: FAIL

Stage 7 mostly does what it says, but three things fail. The phone's dark mode now covers every trial-view screen with mockup v2's colours and type. The old capital-letter labels are gone, Team sheet titles are 18 px, vermilion is only on the ◆, and the accepted desk is untouched. The three failures:
- When a notification tap leads to something that no longer waits, its banner still shows the old amber words.
- On a decision card, the open "whole record" no longer has its own panel, so the record's text reads like the sheet's own words.
- On members' pages, the first link in an opened group now sits flush under the group's heading, which fails the tap-spacing rule.

Each fix is small, and nothing here is irreversible.

**What I ran**
- **Worktrees:** detached scratch worktrees at 83118c1 and at 361b6b7; both removed at the end, repo and branch untouched.
- **Captures:** Playwright Chromium, 360×740 and 414×896, light and dark (the phone's own setting). Fixtures were always the head's, so only the page differed: main, extremes (md-extremes plus Zeta unreadable), sdq, unread25 and letters. Also a tap to a key that no longer waits, 401s, a forced render failure and "No such project". That is 2,064 PNGs per side, each with a measure dump.
- **Harness:** /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr7-h/ (cap7.mjs, tok.js, probe.mjs, spacing.js, acc7.mjs, an.mjs). Captures are in .../dr7-h/cap-new/ and .../dr7-h/cap-base/, crops in .../dr7-h/crops/.
- **Fonts:** Plex 400, 500 and 600 and Mono 400 and 500 loaded before every capture.
- **Tests:** the locked page tests ac80-board, ac81-bar-type and ac48-62-63-look, plus ac88-dark: 50 of 50 pass. The full suite `node --test tests/desk/`: 1,016 of 1,016 pass (.../dr7-h/suite.txt).

## Blocking findings

**F1. The tap banner's "That no longer waits on you" is still the accepted view's amber, in both themes.**
- **Rulebook:** part A items 2 (AC88: "every color … resolves to one of AC81's tokens", "no screen mixing the old look with the new"), 14 and 25, and AC81 ("blocker amber not used").
- **Capture:** .../dr7-h/crops/tap-new-dark.png (from cap-new/main-tap-landing-360-dark.png).
- **Measured:** the words' colour is rgb(255,204,128) in dark and rgb(138,90,0) in light, neither an AC81 token. Its ground and border did move to `--card`/`--line`.
- **Cause:** src/public/style.css:83 `.gone { color: var(--warn) }`. `.sb-tap` (sandbox.css:383) sets no `color`, so the old amber shows through.
- Base had the same amber. But this stage moves the banner, and the Builder lists it as moved, so the result is a mixed look on a screen the change altered. The AC88 test does not render the "gone" state, which is why it passes.

**F2. On a decision card's sheet, the open "The whole record" lost its panel and now reads as the sheet's own text.**
- **Rulebook:** part A item 8 (quoted record text must look different) and AC88 ("as distinct as", "keeps its layout"). Mockup v2 does not draw this fold, so part B does not apply.
- **Captures:** cap-base/ and cap-new/main-card_card_queue_Q_020_stop_1_md-whole-360-dark.png. The pixel diff is about 587k pixels.
- **Measured:** `.v2-fd > .sb-record` background:
  - base: rgb(238,240,242) on a #ffffff sheet in light; rgb(12,13,15) on #0f1012 in dark;
  - head: #ffffff on #ffffff and #0f1012 on #0f1012, with no rule.
  - Its text is 400 13 px, the same as the sheet's body. The question and gate folds keep a `--bg2` panel (sandbox.css:914), so the same "whole record" now looks two ways.
- **Cause:** sandbox.css:424 `.sb-record { background: var(--page) }`, and `--page` now resolves to `--bg`. The change added `.v2-fd > .sb-record` only to the code rule (:916), not to the panel rule (:914).
- **Same cause, non-blocking:** the Summary sheet's quoted JSON (`.sb-quote`/`pre`, :425) also lost its panel. It was rgb(238,240,242) on white, and rgb(12,13,15) on rgb(22,24,28) in dark. The sheet moved to `--page` (:370) and the quote sits on the same token. It is still told apart as 11 px Plex Mono.

**F3. Undersized targets: the first link in an opened "Responsible for" group on a member's page.**
- **Rulebook:** part A items 11 and 25 (WCAG 2.5.8, 24 px, with the spacing exception).
- **Where:** sandbox.js:2782, `ul.sb-qlist li a` inside `details.sb-card`.
- **Measured** (critic page, 360 px):
  - base: the link is 40.6 px tall (15.04/22.56 type wraps it to two lines) and passes;
  - head: it is 17 px tall at 13/18.85, flush under its summary (gap 0). Its centre is 8.5 px from the summary target, under the 12 px the exception needs.
  - Links are 26.8 px apart from each other, which passes.
- **Sweep** of every Service-Desk member page with groups opened, ignoring the fixed bar (.../dr7-h/sweep-groups.txt): base 4 failures, head 9.
  - New at 360: researcher, critic and definer.
  - New at 414: source-checker, researcher, and a second one on the orchestrator page.
- The change shrank these below the bar. It already gave `.sb-tlink` a 24 px minimum for the same reason.

## What passes, with evidence

- **Accepted view:** pixel-identical. 100 full-page captures from main and sdq, 360 and 414, light and dark (.../dr7-h/acc-base vs acc-new); `imgdiff` reports 0 differing, and the crawl texts are byte-identical.
- **Screens already on v2:** they change only where declared (.../dr7-h/imgdiff-v2-main.txt).
  - The marker's dot: box (28,19)–(38,29), not visible at 1×.
  - The Timeline's "Run N began" line box is 1 px shorter: 27.8 to 26.8 px, because `p.sb-began.gap` went from `--t-meta` 600 12.48 px to `--t-small` 12 px. Its visible text was already 12 px. Everything below moves up 1 px.
  - The decision card's fold (F2).
  - "checked N s ago" digits differ, which is capture timing.
  - The Home summary bubble's computed style is identical at base and head.
- **Item 27 and the owner's sizing ruling:** old-screen text uses only 24/600, 18/600 (sheet titles "Summary" and "Working now"), 13/400, 500 and 600, 12/400 and 600, 11/400 Mono, and 11/500. No letter-spacing remains outside v2's Now line.
- **Capitals:** base uppercased `sb-eyebrow`, `sb-h2`, `sb-tag` and the sheet section heads. Head has none; only v2's existing `v2-nowt` (Now · 19 Oct) remains. The Team tags no longer break mid-word ("NEX T" at base): .../dr7-h/crops/xteam-base.png vs xteam-new.png.
- **Vermilion:** across all 2,064 head captures the only non-v2 element in `--you` is `span.sb-ic.i-you`, the ◆. "Waiting on you" words, the owner's tile edge (`--line2`), running-log lanes (ink, ink2, ink3) and the Agents card bars (ink, sessions ink2, each named in words) are not vermilion. Captures: cap-new/extremes-Alpha_team-360-dark.png, cap-new/main-Service_Desk_m_owner_full-360-light.png, crops/agents-sd-mid.png. This agrees with P-001-redesign-type and AC81. AC69's list is an upper limit, and its test passes.
- **Blocker amber to `--bad`:** on old screens `--block` now marks only `.sb-stale` ("Can't read…", "Can't show the desk: …") and `.sb-warn`. v2 already uses `--bad` for these (sandbox.css:782, 1055, 1174). The words and the "!" carry the meaning. Capture: crops/boom-new.png.
- **Items 10, 12 and 9, all fixtures, both widths, both themes:** no text under 4.5:1, nothing scrolls sideways, and the only text boxes are 16 px (`v2-input`).
- **Other colours:** every other colour is an AC81 token. The only exceptions are style.css `.bar` backgrounds landing on the Agents SVG rects, which paint only by `fill` (a token), and SVG roots' default fill, which paints nothing.
- **Dark (item 25 and frame 12):** the dark token values equal desk-v2.html:33-39. A theme forced with `data-theme="dark"` and the phone's own dark give identical computed colours on the Team screen. The Team screen, members' pages, Working now, Summary, Time asked, Agents, Record notes, the v2.5 Reduced view and the error screens all sit on `#0f1012`/`#17181b` with ink, ink2 and ink3, matching frame 12's ground, cards and inks: cap-new/main-waiting_full-414-dark.png and main-Service_Desk_team-414-dark.png beside desk-v2/12-waiting-dark-414.png. Layout and words are kept (cap-base vs cap-new main-Personal_Org_Operating_Model_pipeline_full-360-light.png).
- **Sheets:** the Team sheets' closes are 44×44, and the titles are 600 18 px.

## Non-blocking follow-ups

1. Plan's line bubble: `.v2-plan .sb-bubble` (:1387) is `--bg`, but `.sb-bubble-top` (:192) and `.sb-bubble-note` (:562) stay `--surf`, now `--card`. In dark that is #17181b on #0f1012; base already had #16181c on #0f1012. In light it is a new, very faint #fbfbfb on #ffffff. Measured with a synthetic node, because no fixture has an estimate note long enough to clip.
2. The Working now sheet's "Cost: –" shows a dash for an unknown, with words after it. It is unchanged from base (item 5).
3. The Team screen's key (working, just finished, idle, ◆ waiting on you, not recorded) was there before this change; it was not added, so item 35 does not apply.

## Open questions

1. The brief names the whole-record fold on the pull request, deploy, hold and merge sheets. In the code only decision cards and questions carry `fullText` (src/lib/sandbox.js:928, 954), so those four sheets never draw a `.v2-fd` record, and no fixture has a deploy card. Is the fold meant to reach them, or is the list just broader than what renders?
2. Bubbles on non-v2 screens: none of the fixtures clips a text enough to open one, and every lineBox or summaryBox call site is on a v2 screen. Should a fixture with long texts be added, so that the bubbles' moved look is covered by a test?