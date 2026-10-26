# M3G stage QW1: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/builder/qw1 at 7ae05da (QW1's work over c2f6f94).

---

Verdict: PASS

Round 2 of QW1 (build/builder/qw1 at 7ae05da) carries out your answer on the reload fold (P-001-m3g-reload-fold.md, A) as you chose it, and nothing else on the screen changed since round 1. I found no blocking failure. One of the Builder's 28 refreshed captures no longer shows what its description says (N1), so don't show that one to you. The full suite passes, 1401 of 1401. I wrote nothing to the repository.

**Blocking findings**
None.

**Evidence**

*Your reload-fold answer (item 15).* I typed words in the section's own "Add your own words" box, then fully reloaded the page. Measured at 360 and 414 px, light and dark, each run several times:
- **The fold opens again with the words.** Before the reload: scroll 471 px, box top 300 px, words "Made-up words typed in the section". After the reload: the same three. The fold is open in the first drawing and the scroll lands where it was.
- **"Show choices ›" isn't opened.** A "Show choices" fold opened before the reload comes back closed; the words fold still reopens and the scroll still lands at 471.
- **A fold with no kept words stays closed.** It was opened but left empty before the reload.
- **A fold you close stays closed.** After the reopened fold was closed, it stayed closed through two minutes of the desk's polling.
- **One expected side effect.** An empty fold that was open above the scroll point closes, so the page shifts up by that box's height (1645 → 1527 px in my round-1 test). That is what the "stays closed" reading means, not a fault.
- In 1 of 15 runs my script measured before the page had drawn (section not drawn yet), so that run says nothing either way.
- The page with the reopened words: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/rev2/g-reload-words-360x740-light-viewport.png

*The Epsilon capture (round 1's N2).* qw1-epsilon-choices shows all four sizes.
- Six long choices, including an 80-character unbroken word, wrap inside their boxes.
- The buttons are 36 px tall, the title is cut at three lines, and nothing scrolls sideways.
- It is a full-page capture, so the fixed tab bar covers one choice: D at 360 light, F at 414 dark. My r-one-epsilon renders show every choice.

*Nothing else changed since round 1.*
- **Source diff (a765ea5..7ae05da).** Only three things in src/public/sandbox.js: which "Add your own words" folds start open (`keptAtLoad`), which re-read words stay under the head (only "Already answered" and "being recorded", B1), and the dropping of the other re-read words. No CSS change.
- **Every capture state re-rendered.** All 145 states at both widths and themes, 584 renders, compared pixel by pixel with round 1. The only differences are:
  - one-digit clock differences between runs;
  - Epsilon's 4 new captures;
  - qw1-busiest-folds (N1).
- **My own 36 review renders.** Busiest with every fold open, Epsilon alone, both state-5 cases, every kind of question, the mixed fixtures with Service-Desk and Personal-Org-Operating-Model, md-extremes, and the held question's sheet. Same computed styles and section text as round 1, apart from clock digits.
- **Item by item.** Round 1's checks all still hold:
  - sizes only 11, 12 and 13 px; weights 400, 500 and 600;
  - IBM Plex loaded; words box 16 px;
  - contrast at least 6.18:1 in light and 7.20:1 in dark;
  - nothing scrolls sideways anywhere;
  - order: section, quiet lines, strip, lanes;
  - the grey line in the section, the red line below it;
  - age shown; choices never cut; titles cut at three lines;
  - "none when last read" in state 5;
  - Home, project pages and Plan as before.
- **Tests.** The full suite passes on the 7ae05da tree, 1401 of 1401, including the round-2 cases for B1 and the reload fold.

**Non-blocking**
- **N1. qw1-busiest-folds no longer shows saved words.** The capture tool still clicks Alpha's "Add your own words" (tests/desk/tools/glance-shots.mjs, qw1-busiest-folds `click` list). Since round 2 that fold opens by itself, because the capture's setup keeps words for it, so the click now closes it.
  - The capture is 118 CSS px shorter than in round 1 and shows the fold closed with no words.
  - Its description still says "opened over words the device keeps".
  - The desk is behaving as you ruled; only the capture is out of date. Drop the click or change the description, and don't pick this capture for you.

**Questions for the owner**
None.

**Captures for the owner** (the Builder's are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1/shots/)
1. **qw1-busiest-360x740-light.png** — the section at the top of Waiting: the grey line, each question's age, and the first question's choices.
2. **qw1-one-beta-360x740-light.png** — one project shown: the question also asked in your session ("Also asked in your session: answer in one place", no "Done ✓"), and a kicked-back question with its reason.
3. **qw1-empty-360x740-light.png** — "Questions for you · none" above "Kicked back · none", as frame 4 draws it.
4. **qw1-epsilon-choices-414x896-dark.png** — the longest names, title and choices, in dark, nothing cut. The tab bar covers choice F in this full-page capture.
5. **/tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/rev2/g-reload-words-360x740-light-viewport.png** (mine) — your reload answer on screen: after a full reload, the fold is open with your words, where you left them.

**Beside the picture:** yes, one pair. Put /home/user/sd-qw1/docs/design/builds/m3g-picture/m3g-f1-board-360-light-first-screen.png beside qw1-busiest-360x740-light.png. Caption it so the differences read as planned:
- the "1 of 12 waiting" and "Answer first" lines come in QW2 and QW3;
- the age line and "Show choices ›" are your own answers.

Everything I made is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/qw1rev/:
- rev2/ — my round-2 renders and style dumps;
- all-head/ and all-head2/ — the full capture sets for round 1 and round 2;
- suite2.log — the full test run.
