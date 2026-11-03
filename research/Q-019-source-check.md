Verdict: FAIL

I opened the memo's sources and could confirm some claims but not others. The unconfirmed ones keep the memo from passing, and I filed no library entries. I read the sources through the same kind of summarising fetch the Researcher used, so these results are as soft as theirs.

**Confirmed**
- **Waiting rule** (`research/Q-019-memo.md` §1, entry F-desk-pr-01):
  - `classifyPull` in `records.js` matches the memo's rule: draft, base not the default branch, or a same-repository `item/*` head branch in a v3 project. Otherwise it returns "waiting on your review or merge".
  - The function does not look at reviews or labels.
  - The memo cites `records.js` ~1258–1268. The function sits at lines 825–833 in the raw file, so the cited lines are wrong by more than 400.
- **`waiting.js` L88–116:** the cited range matches `waitingSet`. It skips job candidates (`jobs.has(n)`). The key is `${project}|${kind}|${id}`, as claimed.
- **`status/merges.jsonl`** (memo §7, entry F-desk-records-01): it has 10 lines, each with `"spec": null`, and none has a PR number. This matches.
- **`seen.js`** (memo §9, entry F-desk-seen-01): it has the key `desk-seen-v1`, the 10-second rule, "Mark as seen", and "nothing is stored on Cloudflare". This matches.
- **`words.mjs`:**
  - The outside-author wording ("Waits on you: a pull request from someone outside the project") is at line 34.
  - The "things now wait on you" wording is at line 41.
  - The memo cites L28–40, so the second line falls just outside it.
- **PR #268:** its Milestone line reads "none (the project item is not filed yet; …)". This matches.
- **PR #267:** the merge SHA is 7a91b6a…, and the GitHub milestone and labels are empty. These match.

**Not confirmed or wrong**
- **Handover line numbers** (memo §6, entry F-desk-notify-01): `docs/handover/service-desk.md` has the Service-Desk sender sentence at lines 24–25 and the Personal-Org-Operating-Model "no sender yet" sentence at lines 35–38. The memo cites ~47–48 and ~56–58.
- **Model-Lab and handover scope** (memo §6): the handover does not mention Model-Lab at all. The memo's claim that it "still says … today Service-Desk and Personal-Org-Operating-Model" at ~40–41 was not found.
- **PR #267 "Discovery-5, Discovery-4"** (memo §7): the fetch showed only the GitHub milestone field, not the description's `Milestone:` line. I could not confirm this value.
- **Not opened:** the other 19 PR pages and the following. The sample counts (6/11 naming ids, 5/11 "none", 4/11 spec id, 2/11 and 3/10 `reviews/<n>/`, 8/10 item ids) therefore remain unconfirmed.
  - `github.js`, `model.js`, `home.js`, `feed.js`, `sandbox.js`, `pulls.js`, `prfiles.js` and `scheduler.js`
  - the `dispatch-log` file
  - `reviews/README`
  - the tree at e6dd6b8
- **Library entries:**
  - F-desk-pr-02 rests on `feed.js`, `home.js` and `sandbox.js`, none of which I opened.
  - F-desk-notify-01 claims "no notification for merges". That is a negative claim, and nothing opened supports it.
  - F-desk-notify-01 also claims the key is `project|kind|id` and the wording is "Waits on you: <kind>: <title>". Both match.
- **Independence:** every source is the same repository at one commit, read through a summariser. The memo grades most items A or B, but the summariser's line numbers are wrong, so the A grades on `words.mjs` and `seen.js` are unsafe as stated.
- **Entry fields:** the `grade` field of F-desk-notify-01 holds two grades ("A for wording … B for scope"). The library form needs one.
- **No entries filed:** F-desk-pr-01 and F-desk-seen-01 are close to passing. They should wait for a corrected memo that has raw-file line numbers and a second independent read of each.

**Open questions**
1. Can the Researcher or the owner supply raw-file line numbers? The summariser's counts are unreliable, as the memo itself warned.
2. Is the Personal-Org-Operating-Model repository private? The milestone-rule claims (S-032 against S-033) remain untestable from public GitHub.
3. Does Model-Lab have a notification sender? The memo leaves this open, and the handover says nothing on it.