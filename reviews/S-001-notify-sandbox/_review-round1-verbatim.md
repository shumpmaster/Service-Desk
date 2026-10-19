Verdict: PASS with notes

**For the owner.** First, today's question: the desk already on main does not have the "every tap lands on Home" defect. I loaded main's code in a real browser (Chromium) and tapped four kinds of address. Each landed where it should:
- a waiting question opened that question, marked "Opened from a notification";
- a question being asked in your session opened, shown as held;
- a question that is gone showed "That no longer waits on you";
- a pull request opened its project, marked "Opened from a notification".

That defect only existed partway through the Builder's own work on this change, and the Builder fixed it before handing it over. So turning notifications on today with the current desk is fine; this has not been tried on a real iPhone (that is EXP-006).

This follow-up does what you ruled:
- the Home Screen icon now opens your page, the new design;
- every notification tap opens your page, following the same rules: it waits for the check on closed pull requests, shows a held question as held, and says "no longer waits" only when something really stopped;
- a tap sent before the change, to the older address, is passed on to your page;
- the plain address still opens the older view, unchanged.

Three things need your attention:
- an icon you added before this change may keep opening the older view until you remove it and add it again (Setup N13);
- the sender's file `src/notify/words.mjs` is a class you approve yourself, so this needs your verdict as well as mine;
- iOS behaviour still needs the phone check in EXP-006 case 12.

**What I ran** (on fresh copies, never the branch: 9ee85b2 at `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev5`, origin/main at `…/scratchpad/rev5main`):
- **Full suite:** `npm --prefix src ci && npm --prefix src run build && npm --prefix src test`. "build: PASS (2 connected projects; 24 page modules in step)"; 659 tests, 659 pass, exit 0. AC14's counts are unchanged (4,997; 5,180; notifications day 5,101 calls, 312 J20 reads). Log: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev5-test.log`.
- **My real-browser tap check:** `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev5tap/tap.mjs`, Chromium with the fake desk function, run against both copies.
  - **On main**, all four `/?open=` addresses landed as described in the owner paragraph above.
  - **`/?sandbox&open=` on 9ee85b2:**
    - a question opened its response sheet, "Opened from a notification";
    - a held question opened the Queue, shown under "Asked in your session";
    - a gone question opened the project with "That no longer waits on you";
    - a pull request opened its sheet;
    - a deploy opened the Queue at its row;
    - `actions-usage` opened the project's More detail;
    - in every case the address afterwards kept `?sandbox` only.
  - **Old-style addresses on 9ee85b2:** `/?open=<key>` was passed on to the sandbox and landed the same way. An unknown project gave "That no longer waits on you" on Home.
  - **Plain addresses on 9ee85b2:** `/` stays the accepted view with no forward, and `/?sandbox` opens the sandbox Home.
- **The Builder's phone script** (`phone2/check.mjs`), pointed at my copy: no horizontal overflow at 360×740 or 414×896 on any of its 7 screens.
- **`review_check.py classify`** on the changed `src` paths: `src/notify/words.mjs` is R3; the rest are R1.

**Against the amendment and the tap rules (AC74, AC77)**
- **Shared rules:** both views now use `tapDecision` (`src/lib/notifyview.js`) for the tap rules: wait while the project is still being read or until AC77's closed read has settled; held or being recorded shows as held; can't-read says so and is never claimed stopped; gone only when the project was read, the read settled, and the item isn't there.
- **The sandbox** (`src/public/sandbox.js`):
  - it reads `?open=` when it starts and then strips it, keeping `?sandbox`;
  - a tap handed to a sandbox window already open runs `desk.arrival()`, and a cost tap also runs `refreshUsage()` (draft 9).
- **The accepted view** (`src/public/app.js`):
  - it forwards `?open=` with `location.replace` before anything strips the address, and old service-worker handovers are forwarded the same way;
  - `takeOpening` now runs only inside `startDesk`;
  - plain `/` is untouched.
- **`sw.js`:** it hands a tap only to a window showing the sandbox and navigates an accepted-view window instead.
- **Manifest and build:** `id` "/" and `start_url` "/?sandbox", and the build checks both.
- **The sender's addresses:** `/?sandbox&open=<key>` and `/?sandbox`.

**Was any test weakened?** No. Assertion counts, before → after:

| Test file | Assertions |
|---|---|
| notify-ac74-desk | 34→51 (tests 6→9) |
| notify-ac74 | 35→38 |
| notify-ac75 | 114→119 |
| notify-ac77-desk-reads | 99→100 |
| notify-ac78-desk | 73→76 |
| ac77, ac78-j21, j17, j18 | unchanged |

The changed assertions retarget tap tests from the accepted view to the sandbox; the hold, wait and "no longer waits" checks are kept. There is a regression test for the defect: notify-ac74-desk, "with the browser's history, the forward still carries the tap; the address is not stripped first".

**Findings**
1. **Note (process).** `src/notify/words.mjs` is R3, so `reviews/<PR>/owner.md` is needed as well as this verdict.
2. **Note (tests).** The accepted view's own tap-following, used only when `location.replace` is missing or throws (`app.js` `forwardToSandbox` returning false, then `followOpening`), is no longer exercised by any test. The page harness always provides `replace`, and every former accepted-view tap test was moved to the sandbox. Real browsers always have `location.replace`, so this path is effectively a fallback; the shared `tapDecision` stays tested through the sandbox. Low risk.
3. **Note (spec's own gap, stated).** An icon added before this change may still start at `/`; taps open the sandbox either way (Setup N13).

**Open questions:** none.
