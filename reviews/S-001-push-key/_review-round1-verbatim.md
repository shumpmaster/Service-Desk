Verdict: PASS with notes

**For the owner.** This change adds your notification public key and the preview's address to the desk's settings file, which is all J7 asks for. I checked the key myself: it is 87 characters and decodes to 65 bytes starting 0x04, on the P-256 curve. The address is the preview's, as it must be until launch. The full suite passes (654 of 654 tests), and the desk's request counts are exactly what they were before. No test was weakened: each check that the settings had no key was swapped for one that checks the key is present, and the old "no key yet" behaviour is still tested using settings copies that leave the key out. The one thing it still needs is your own approval: `src/config/projects.json` is a class you must approve (R3), so the Reviewer's verdict alone is not enough to merge it.

**What I ran** (in a fresh copy of cf1f3e4 at `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev4`, never on the branch):
- `npm --prefix src ci && npm --prefix src run build && npm --prefix src test`: "build: PASS (2 connected projects; 24 page modules in step)"; 654 tests, 654 pass, exit 0. Log: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev4-test.log`.
- AC14's counts match those at 6b2b227, which has the same src and tests as origin/main:
  - 4,997 calls (4,850 polls, 147 blob calls);
  - with J12 failing, 5,180;
  - the notifications day, 5,101 calls with 312 J20 reads.
  So A3 and AC14 are unchanged.
- `python3 governance/checks/review_check.py classify <the 7 changed paths>`:
  - `src/config/projects.json`: R3;
  - the two generated `config.js` files and the four test files: R1.
  The change is R3, so `[reviews]` requires both `reviewer` and `owner`.
- The key, checked on my own: 87 characters, 65 bytes, first byte 0x04, and it satisfies the P-256 curve equation.
- Commits: 211a6bb is by `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers. The merge cf1f3e4 is by `orchestrator <orchestrator@agents.invalid>`, with `Agent-Session`.

**Against the spec**
- **J7 (notifications part):** `push` is top-level and holds exactly `{vapidPublicKey, deskUrl}`, with `deskUrl` `https://service-desk-preview.pages.dev` until launch (Setup N10). The build's check passes on it. Both generated configs carry the same value, and the j7-config test asserts that.
- **AC75:** the accepted page built from the committed config now offers "Turn on notifications" from the Home Screen and never asks on load. Safari still gets the "add to Home Screen" words. "Aren't set up yet" no longer shows.
- **CS18:** N1's public key is handed to the Builder for J7, and the path is R3 in `governance/risk-paths.toml`.

**Did any test get weaker?** No.
- Three old assertions that the committed config has no `push` were removed: `j7-config` (one) and `notify-ac75` (two). Each is replaced by a key-present check, and the no-key path is re-asserted on a copy of the config with `push` removed: it builds, the sender stops at its first step with "push … missing or not in form", and the desk says "Aren't set up yet" with no button.
- `notify-entry` now also checks that the committed config gets past `push` and stops at the first missing secret. `notify-j17-push` adds the first step against the real config: it passes with a matching throwaway key and stops at the keys' check with any other key.
- My counts of `assert.*(` calls are 2 lower than the Builder's in every file (j7 46→49, ac75 105→114, entry 18→22, j17 75→84), but the increases (+3, +9, +4, +9) match his exactly.

**Findings**
1. **Note (process). The owner's R3 verdict is still needed.** The change classifies R3, so `reviews/<PR>/owner.md` is required alongside this verdict before it lands on main, as CS18 says.
2. **Note (test coverage). The accepted page's no-key words are no longer tested on the accepted page itself.** The no-key rendering ("Notifications aren't set up yet", no button, on Home's top line) is now exercised only in the sandbox (`tests/desk/notify-ac75.test.mjs`, the new fixture test using `loadSandbox`). The accepted page imports the committed config, so the test can't swap in one without the key. Both views share `notifyState` and `NOTIFY_WORDS`, which are unit-tested, so the risk is low. A page harness that accepts a config would close this gap.

**Open questions:** none.
