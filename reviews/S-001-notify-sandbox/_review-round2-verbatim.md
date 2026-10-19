Verdict: PASS with notes

**For the owner.** The new key is valid and is the only code change: the Builder swapped your new public key into the one place it lives and its two generated copies, and updated the one test that pins it to the new value. The old key no longer appears anywhere in the branch. The full suite passes (659 of 659), and the desk's request counts are unchanged. Your own approval is still needed, because the config file and the sender's tap addresses are in the class you approve. One record needs fixing: `reviews/120/reviewer.md` says "PASS", but my verdict was "PASS with notes".

**What I checked**
- **The key:** `BFTM_IZawd-WOl_Mgf5RzLMAtGYwL7lIO9y9p2gVOQYwAjjIphr6q_TN4hiLCLasXYhdGhQqDHUuEyX40BMC8bM`
  - 87 characters of base64url, decoding to 65 bytes, first byte 0x04;
  - x and y are both below the field prime, and the point satisfies y² = x³ − 3x + b on P-256.
- **Nothing else changed in code:**
  - 9ca27c1 (by `builder <builder@agents.invalid>`) changes exactly 4 files, one line each: `src/config/projects.json`, `src/lib/config.js`, `src/public/lib/config.js` and `tests/desk/j7-config.test.mjs`. Only the key string changed; `deskUrl` stayed the same.
  - Under `src` and `tests`, 9ee85b2..e589caa (the head I passed in round 1, up to now) holds only those 4 lines.
  - The rest of that range is records: the Definer's spec line 3a71ee4, merged at 5a46d22, plus b49997b and d6a1b4b, and the merge e589caa by `orchestrator`.
- **Old key gone:** a search of the working tree finds no trace of `BB_bmBhW2WPgp57…`.
- **No test weakened:** the j7-config change swaps the pinned key in one assertion. No assertion was removed, and the generated-config check (`GENERATED.push` equals `CONFIG.push`) still runs.
- **Full suite**, in a fresh copy of e589caa at `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev6`:
  - `npm --prefix src ci && npm --prefix src run build && npm --prefix src test`: "build: PASS (2 connected projects; 24 page modules in step)"; 659 tests, 659 pass, 0 fail, exit 0.
  - AC14's counts are unchanged: 4,997; 5,180; and the notifications day at 5,101 calls with 312 J20 reads.
  - Log: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev6-test.log`.
- **The Definer's spec line** (3a71ee4: a `?open=actions-usage` tap on the accepted view is forwarded to the sandbox, which opens More detail at the usage line) matches the code and the test I saw in round 1 (notify-ac78-desk).

**Findings**
1. **Note (process). The owner's R3 verdict is still needed.** `src/config/projects.json` and `src/notify/words.mjs` are both R3, so the pull request needs `reviews/120/owner.md` as well as mine.
2. **Note (record). `reviews/120/reviewer.md` doesn't carry my verdict as given.** It says "Verdict: PASS"; my round-1 verdict was "PASS with notes". The verbatim copy in `reviews/S-001-notify-sandbox/_review-round1-verbatim.md` is correct, and its explanation in the file is honest. Still, the operating rules ask for the verdict to be recorded verbatim in `reviews/<PR>/reviewer.md`. If the check really can't accept "PASS with notes", that limit belongs in a question to fix the check, not in a rewritten verdict. Not blocking for the code.
3. **Round 1's two other notes still stand:** the accepted view's own tap handling, used only when it can't hand the address on to the sandbox, has no test; and an icon added before the change may keep opening the older view until it is added again (Setup N13).

**Open questions:** none.
