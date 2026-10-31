Verdict: PASS

**Summary.** LA2 changes nothing on any screen. The before and after renders of every screen the change could reach are identical. The tap check was done in the code, not on a phone: the one change the owner can see is where a notification tap leads. The spec's own LA2 row names that change, and once launch is finished the taps keep every ruling. One open question needs the owner, ideally before L3. In the plan as written, between L3 (LA2 merged) and L9b (the phone re-subscribed on needs-you), the phone keeps receiving notifications through the preview's service worker. That worker opens only its own address, so a card's tap opens the preview's Home instead of the card. The spec chose this short window on purpose. I am raising it as a ruling-against-spec question, as the pack says to, not deciding it myself.

**What changed (`git diff 047f9ab..build/builder/la2`).** One value, `push.deskUrl`, moves from `https://service-desk-preview.pages.dev` to `https://needs-you.pages.dev`:
- src/config/projects.json:6
- src/lib/config.js:20
- src/public/lib/config.js:20 (byte-identical to src/lib/config.js)
- plus the rewritten tests at j7-config.test.mjs:90/97 and notify-j17-push.test.mjs:101/109.

**Evidence, "No visible change" path (pack, Evidence section)**
1. **Nothing in src/public reads deskUrl.**
   - The only mention is a comment, src/public/lib/notifyview.js:32.
   - The page reads only `push.vapidPublicKey`, at src/public/sandbox.js:543.
   - copySteps and testSteps, the notification-setup steps in More detail (notifyview.js:118-139), read only `projects`.
   - app.js reads only `projects` and `linkCap`.
   - No code in src/public serialises or hashes the config.
2. **Fake-DOM render, before and after.** I rendered the desk with its own code, using tests/desk/sandbox-helpers.mjs loadSandbox, from both trees exported outside the repo.
   - Setups: the real J7 projects, twoProjects, and extremes (5 projects, including the v2.5 poom fixture).
   - Screens: #/, #/waiting, #/work, #/since, #/pf/versions, #/p/Service-Desk, its timeline and team, #/p/Alpha, its team, #/p/Delta, #/waiting/Alpha.
   - Each screen was rendered in a plain browser and as an installed Home Screen app with notifications available (so the notification control shows), with folds opened, plus the app.js entry.
   - Result: 73 renders, byte-identical. Both dumps have sha256 64bc2470…b3f2. None contains "pages.dev".
3. **Real browser (Playwright, Chromium).** I served src/public from each tree and captured Home at 360×740 and 414×896, light and dark.
   - All four PNGs are pixel-identical before and after, and the rendered text is identical.
   - The DOM never contains "pages.dev".
   - Captures (the "after" set; the "before" set is alongside): /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/shots/after-360-light.png, after-360-dark.png, after-414-light.png, after-414-dark.png
4. **Tests, run in the exported trees.**
   - j7-config, notify-j17-push, notify-ac74 and notify-ac75: 42 of 42 pass.
   - Full `node --test tests/desk/`: 736 of 737 pass, on both base and LA2. The one ✖ is node's entry for the `tests/desk` directory argument itself, with no desk test failing, and it is the same before the change.

**The behaviour that does change: notification taps (judged under part A, items 1 and 2)**
- **Where the address is read.** Only the sender reads it (src/notify/sender.mjs:142). Item taps go to `openUrl(deskUrl, key)` at :291. Home, test, group and summary taps go to `homeUrl` at :214/:222/:270/:278/:301. The cost tap is at :306. The address formats are src/notify/words.mjs:20-27.
- **When it takes effect.** The sender runs from main (.github/workflows/desk-notify.yml:73-75), so taps name needs-you as soon as LA2 merges. This is what S-001.md:4027 says ("Notification taps naming `https://needs-you.pages.dev` once it merges").
- **After L9b.** The phone is subscribed through needs-you's own service worker. Taps open the card or Home there, which keeps P-001-notifications.md ("the tap opens the card") and P-001-notify-which-view.md (taps open the desk at its plain address from stage 8, words.mjs:15-17). No word of any notification changes.

**Open question for the owner (pack, "Where … a ruling and the spec seem to disagree … names both and asks")**
- **The ruling.** decisions/questions/P-001-notifications.md:10 records that the tap opens the card (also AC74).
- **The spec.** It merges LA2 at L3 (S-001.md:4246-4249) but moves the phone's subscription only at L9a/L9b (S-001.md:4266-4269). In between, pushes reach the preview's worker, and src/public/sw.js:21-30 (`safeAddress`) turns any address on another site into the preview's root (sw.js:44, :88). So a card's tap opens the preview's Home, not the card. The spec knows this: S-001.md:3882, and S-001.md:4321-4323, a reading marked "C, mine", not an owner ruling.
- **It will actually happen in the sitting.** desk-notify starts when desk-deploy is requested (desk-notify.yml:22-24, the `if:` at :53-63). A deploy waiting on the owner sends an item notification (sender.mjs:104; waiting.js:73-74). So the deploys at L4 (S-001.md:4254) and L6 (S-001.md:4258) should each send one, and its tap opens Home. The deploy is then one tap away on Waiting.
- **If the sitting stops between L3 and L6.** The stop rule (S-001.md:4274-4278) restores only C8's rollback "where L6 ran", plus needs-you-page and Operations-Hub. Nothing reverts LA2, so card taps would keep opening the preview's Home until a retry or a rollback. A safe point: sw.js never sends a tap to needs-you's old page.
- **The question.** Does the owner accept taps that open Home instead of the card for about 20 minutes of the sitting? And, if it stops between L3 and L6, until LA2 is reverted? I have not decided this either way.

**Checklist items checked against this change**
- Items 1 and 2: as above; screens unchanged, and taps after launch keep the rulings and AC74.
- Items 3, 4 and 5: no change, since nothing that counts, reads or shows figures reads the value.
- Items 6 and 12: renders are identical across the service-desk, poom and md-extremes setups, at 360 and 414 px.
- Items 8 to 11, 13, 14, 23 and 25: no CSS or markup change, and the captures are pixel-identical in light and dark.
- Part B: not applicable. The change does not carry out mockup v2.

**Non-blocking findings already present before the change**
- The known `--soft` contrast follow-up (pack, part A preamble) stands. It is not touched here.

**Notes**
- My captures use no desk-function backend, so they show the "can't read" state. That is enough for a before/after comparison, not for judging layout.
- Nothing was written inside the repository. The exported trees, render script and dumps are in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/
