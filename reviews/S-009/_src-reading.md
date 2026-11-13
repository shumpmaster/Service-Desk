# S-009 — today's code read (the outside-build plan, step 2)

*Recorded by the Chief of Staff's session (session_01QBwHGJGmgrBkfU9PjLST43) as `orchestrator`, under L-0051. The Reviewer's return, verbatim below the rule. Read at the base commit 0ae6c8d9b4597eb8d3b9a942d7535ca10f2297e6, src/ and tests/ only, unpacked into a scratch folder; main's tip c8003be2 has the same src/ and tests/. Dispatched 2026-11-13T04:26:46Z; returned 04:34:37Z.*

*The plan's stop rule for this step does not fire: the return names failed-read forms that today's read path already handles (answer 2).*

---

P-003 outside build, plan step 2. This is a code reading for S-009, so there is no verdict. I read only /tmp/claude-0/-home-user/ac6bc9b8-20ad-59d2-b4af-fac3ee45c43c/scratchpad/s009-reading (src/ and tests/ at base 0ae6c8d9). Paths below are relative to that folder. src/public/lib/*.js are build copies of src/lib/*.js: `diff -rq` shows src/lib has only 4 server-only files extra (access, api, configcheck, github). So I cite src/lib.

## changed
None. I wrote no file. Every test and node script ran in memory, and the folder still holds only src/ and tests/.

## why (the numbered answers)

**The main finding for S-009: today nothing reads a notes file, and a card is shown from the tree alone.** A notes file is in the tree but is never fetched. A queue card is flagged whether or not its blob was read. So "is the notes file on main" can already be told from the tree the desk and the sender hold (`tree.has(path)`). No new blob read is needed for that.

**1. Read places. Is there one shared fetch?**

The desk has two layers.

- **Server (Pages Function):**
  - `handle(context, kind, deps)` (lib/api.js:247) uses `deps.fetch || fetch` (:249), then calls `pollProject` or `readBlobs` (:296).
  - Every GitHub GET goes through `makeGetter(token, fetchImpl, counter)` (lib/github.js:171-190), which is keyed by URL, not by path. The URLs come from `urlsFor` (:98-123):
    - `tree: (sha) => …/git/trees/${sha}?recursive=1` (:104)
    - `blob: (sha) => …/git/blobs/${sha}` (:105)
    - `history: (path) => …/commits?path=…` (:107)
  - `pollProject` (:265) reads the branch, the PRs, the runs, and the tree when the head moved (:352-356: `const tres = await get(u.tree(treeSha))`).
  - `readBlobs` (:752) reads each blob by sha: `get(u.blob(sha), { accept: RAW_ACCEPT })` (:782).
  - History is allowed only for `HISTORY_PATH_RE = /^((decisions\/)?questions\/[^/]+\.md|queue\/ci-hold-[0-9a-f]{12}\.md)$/` (:19).
- **Page (lib/scheduler.js):**
  - `createDesk(opts)` (:175) calls only `opts.call(path, body)`. In production that is `callFunction(path, body, fetchImpl = fetch)` (:1626), POST to /api/poll and /api/blobs.
  - The tree is parsed into `st.tree` (Map path → {sha}) in `applyPoll` (:916-928).
  - Records are keyed by path in `recordsFor(st)` (:816-826): `const v = blobCache.get(cacheKey(kind, e.sha)); if (v !== undefined) records.set(path, v);`
  - What to fetch comes from `neededReads` (lib/model.js:216):
    - queue cards via `for (const card of openCards(tree)) add(card.path)` (:235)
    - the dispatch log via `for (const m of logMonths(now)) add(\`dispatch-log/${m}.jsonl\`)` (:233)
    - The scheduler maps those to shas in `missing` (:851) and calls `blobCall` (:943 → `call('/api/blobs', body)` :968).
- **Sender:**
  - `openCheckout(root, git)` (notify/checkout.mjs:31) reads the tree with `git ls-tree` (:35).
  - Its `blobs(paths) → Map(path → text|null)` (:43-69) uses `git cat-file --batch`.
  - `readRecords(project, checkout, nowDate)` (notify/collect.mjs:28-52) loops on `neededReads` and calls `checkout.blobs(...)` (:39). `checkout` is a passed-in object.
  - REST reads go through `makeGitHub({ token, fetch, apiBase }).get/list` (notify/gh.mjs:55-171), with injectable fetch. They are not used for queue/, notes or log files.

Shared function:
- Desk: GitHub reads all go through `makeGetter`, keyed by URL/sha. Page-side, records are keyed by path, but only after the fact.
- Sender: path-keyed `checkout.blobs(paths)`.
- No single function is shared by both.

**2. Failed-read forms, handling, and what the owner sees**

Server:
- A network throw becomes `null` (github.js:186-187: `catch { return null; }`).
- A non-OK answer becomes a `Failure` (`failFrom` :216). The poll answers `state: 'cant-read'` with a `reason` (`failWith` :277-284).
- One failed blob fails the whole call (:783 `if (!res || !res.ok) return fail(...)`, then :957-961 `out.state = 'cant-read'`). The other shas stay `null` (:779).

Page:
- `callFunction` gives `{ ok:false, reason:'network'|'signed-out'|'cloudflare' }` (:1626-1680).
- A poll with `cant-read` becomes an outcome failure (:1335-1336).
- A head move with `r.tree == null` gives `{ ok:false, reason:'github' }` (:917). `st.tree` stays the last one, or `null` in a fresh opening.
- In `blobCall`, a null blob is skipped (:1030 `if (text == null) continue;`) and its sha is marked in `st.blobFailed` (:972-975).
- `blobPhase` gives `{ ok:false, reason:'github' }` when a call made no progress (:1268). A thrown parse error gives reason `'page'` (:1355-1358).
- The failure sets `st.failure` (`fail` :875), and `readState` returns `{ read:'cant-read', … }` (lib/universe.js:15). The model is still built from the last tree and cached records (`desk.model` :1461-1470).

What the owner sees:
- **queue/ card blob unread:** the card is still flagged from the tree (model.js:722-739: `parsed: rec || null`, title falls back to `` `card ${card.gate}-${card.n}` ``).
- **Card sheet:** `loading: !p` (lib/sandbox.js:952), and `what` is `card <gate>-<n>`.
- **Waiting/board:** `oneProjectView` state 5 (lib/board.js:316-340). Cards from the last read stay shown, with the line "Can't read <project> since HH:MM: <words>", or "in this opening" if nothing has succeeded yet. If no read has ever succeeded there are no cards (tree null), state 2.
- **Home:** the box pill is `Can't read: ${read.words}` (lib/sandbox.js:520-522), ranked 1 (universe.js:35-39). I did not trace every Home line.
- **Dispatch log unread:** `logLoaded = false` (model.js:622-624). Card `raisedAt` becomes null, and the project reads as Can't read.

Run in memory with tests/desk/fake-desk.mjs:
```
blobNull-card | read: cant-read, reason github | card flagged: "P-001 dor-2: card dor-2" raised 09:00
blobNull-log  | read: cant-read, reason github | card flagged: "P-001 dor-2: Pick one" raised null
```

Sender:
- A git failure throws. That gives `{ read:false, why:'checkout' }` (collect.mjs:84-88), or `checkout = null` (sender.mjs:112-116).
- A non-blob or non-UTF-8 entry gives `null` per path (checkout.mjs:53, :64). `readRecords` turns that into an empty record: `parseRecord(b.kind, text == null ? '' : text, b.path)` (collect.mjs:43).
  - A failed log read therefore becomes an empty log, with **no failure flag**.
  - A failed card read becomes a card with no title. It stays in the set with `what` = `P-001 dor-2` (waiting.js:63).
- A REST failure gives `ReadFailed` → `{ read:false, why }` (collect.mjs:333-335).
- On not read, the sender logs `not read (${c.why}); the last set is kept` (sender.mjs:130), keeps `next.keys = { ...prev.keys }` (:237) and sends nothing for that project (:267 `if (c.read && toSend.length)`). After 30 minutes unread it adds an issue reason (:327).

Failed-read forms already handled that a test can inject by path:
- **Desk, by path:** the fake server's `blobNull: [path]` (tests/desk/fake-desk.mjs:200-203) answers `null` for that path's blob inside an `ok` call. Caveat: the real function never produces null blobs in an ok call; a failed blob makes the whole call `cant-read`.
- **Desk, by sha (closer to the real function):** `blobFail: [sha]`, where sha = `gitSha(text)` from the path (:205), gives the real function's form, a whole call `cant-read`. Also `fail: { state:'cant-read', reason }` per project (:149), and `fail: { kind:'network'|'cloudflare'|'signed-out' }` (:144-147).
- **Function, through a stubbed `deps.fetch`:** a test can fail by URL, `git/blobs/<sha>` or `git/trees/<sha>`. That is sha-keyed, not path-keyed.
- **Sender:** a fake `checkout` object whose `blobs(paths)` returns `null` for one path, or throws. `collect` uses only `tree, head, shallow, blobs, oldestAdd, isAncestor, git` (collect.mjs, grant.mjs:84-93, rule0.mjs:75-111). The existing sender tests build real git repos in os.tmpdir instead (notify-helpers.mjs:37-40, :100-107).
- **Notes files:** there is no read place today (see 3), so no failed-read form exists for them as reads. Their only signal is tree presence, and the existing failure forms for that are the poll/tree failures above.

**3. Notes files**

Neither the desk nor the sender reads a notes file. They are excluded explicitly:
- `parseAnswerPath`: `if (path.endsWith('-notes.md')) return null;` (records.js:36)
- `questionAnswerName`: the same guard (:51)
- `recordKind('decisions/P-001/dor-2-notes.md','v3')` returns `null` (run with node). So `neededReads` never asks for one.

In the fake-desk run, the notes file was in the tree but only 2 blobs were asked for (card and log). The notes file is present in `st.tree` and `checkout.tree` as a path. A grep for `notes.md` in lib, notify, functions, public/sandbox.js and app.js finds nothing else.

**4. Re-reads while open**

Yes, the desk polls:
- `POLL_MS = 60_000` (scheduler.js:19). `schedule` (:1406-1416) re-arms after every cycle while visible: `if (!desk.running || !isVisible() || st.pending) return;`
- On `visibilitychange` (public/sandbox.js:5664-5676 → `desk.visibilityChanged` :1435-1459), polling stops when hidden and is re-scheduled when visible.
- The portfolio is read every 5 minutes (`PORTFOLIO_POLL_MS` :66).

Reads on user action:
- `desk.arrival()` on a service-worker tap message (public/sandbox.js:5622)
- `desk.recheck` before an answer link when the last read is more than 30 s old (:1526, `RECHECK_AFTER_MS` :43)
- `desk.refreshUsage` (:1505)

The 15-second `setInterval` (public/sandbox.js:5709) only redraws; it makes no read. I found no focus listener.

**5. Card-file name parser**

```js
export const CARD_RE = /^queue\/([A-Z]+-[0-9]+)-([^/]+)-([0-9]+)\.md$/;   // records.js:10
export function parseCardPath(path) { const m = CARD_RE.exec(path); ... const [, item, gate, n] = m;
  return { path, item, gate, n: Number(n), answerPath: `decisions/${item}/${gate}-${n}.md` }; }  // :27-32
```
- The gate is everything between the item id and the final `-<digits>`, taken greedily.
- It does tell dor-fail from dor. Run with node: `queue/P-001-dor-fail-2.md` gives gate `dor-fail`, answerPath `decisions/P-001/dor-fail-2.md`, and `queue/P-001-dor-2.md` gives gate `dor`.
- Only `dor`, `criteria` and `launch` are gate cards (`GATE_WORDS` j11.js:24, `GATE_RULINGS` waiting.js:18). A dor-fail card is a plain decision card (board.js:571-590, sandbox.js:431).
- `classifyQueuePath` (records.js:72-82) treats these as other kinds: hold `queue/ci-hold-<12hex>.md`, merge `queue/<item>-merge-(conflict|by-hand).md`, README, `queue/merge/`. Anything else is `unparsed`.
- A card is "open" when `!tree.has(card.answerPath)` (model.js:139-146).

**6. Two `card` entries for one card**

Entries are kept in file order, the previous month first, then the current month (model.js:617-628). Each line is parsed by `parseLog` (records.js:592-620), and a `card` entry is `e.action === 'card'` (:544). It needs `item, gate, card, time` (:562): strings, except `card`, which is an integer (:554-557). Readers differ:
- **Card's `raisedAt` (queue, board, sheet): the last one wins.** `cardTimes.set(\`${e.item}/${e.gate}-${e.card}\`, new Date(e.time))` (model.js:636). Run: raised 10:00 of 09:00/10:00.
- **Time asked (`cardRows`, asked.js:21-53): the first in-window one wins** (`if (seen.has(path)) continue;` :31), and rows are sorted newest raised first (:52). Run: 09:00.
- **Home's events (`projectEvents`, home.js:323-331): all of them are kept**, one "New card" event each, with id `…|card|${path}|${e.time}`.
- **Team page Orchestrator (sandbox.js:1341-1349): all are kept**, reversed (`newest = (list) => [...list].reverse()` :1281).
- `neededReads` pushes one answer path per entry (model.js:244).

**7. Entry points for a test adapter (no network)**

Pure functions over records:
- `neededReads(project, tree, records, now, ctx)` (model.js:216) returns `{ blobs:[{path,sha,kind}], history, compare, optional }`.
- `recordKind(path, model)` (:51) and `parseRecord(kind, text, path)` (:89) parse one record.
- `buildModel(input)` (:464), with input `{ project, config, tree: Map, records: Map, history: Map, pullPages, checkPages, checksState, compare, now: Date, withdrawn, asking?, jobs? }`, returns the model. `.flagged` is the list of waiting items (cards: `{ kind:'card', key:'card:<path>', title, raisedAt, card }`).

Views:
- **Queue/Waiting:** `queueView(project, model, snap, nowMs)` (sandbox.js:470) returns `{ groups, waiting, rows, deploys, asking }`.
- **Board:** `projectCards({ project, model, snap, j22, rows, last, nowMs, tz, linkCap, parseRuns, projectDoc })` (board.js:528) returns `{ cards, agents, keep }`.
- **Card sheet:** `sheetView(project, model, snap, j, row)` (sandbox.js:936).
- **Home:** `briefingView(input)` (home.js:170) and `projectEvents(input)` (:263); their inputs are wide.
- **Owner-facing set:** `flaggedWait(projectName, f)` (waiting.js:58).

Sender's set:
- `waitingSet({ project, model, deploys, jobCandidates, held, outside })` (waiting.js:88) returns `[{ key, kind, id, what }]`. Run: `[{"key":"Service-Desk|card|queue/P-001-dor-fail-2.md","kind":"card",...}]`.
- `readRecords(project, checkout, nowDate)` (collect.mjs:28) returns `{ tree, records, history, compare }` from any checkout-shaped object.
- `collect(input)` (collect.mjs:78) also needs an injected `gh` (`makeGitHub({ fetch })`) and returns `{ read, set, model, counts }` or `{ read:false, why }`.
- `runSender(o)` (sender.mjs:32) takes `o.fetch` and `o.openCheckout`.

Desk end-to-end:
- `createDesk({ config, call, clock, store, isVisible, j11 })` (scheduler.js:175), with `call` = `fakeServer(repos, config, clock).call` (tests/desk/fake-desk.mjs:130). Then `desk.model(name)` (:1461) and `desk.snapshot(name)` (:1601).
- `handle(context, kind, { fetch, now, config })` (api.js:247) runs the function with a stubbed fetch.

**8. Tests**

- They are in tests/desk/ (118 `*.test.mjs` files).
- The command, from src/package.json, is `"test": "node --test ../tests/desk/*.test.mjs"`, run from src/.
- I did not run the full suite. 24 files write to os.tmpdir (scratch git repos via notify-helpers `tempDir`/`checkoutOf`, and ac91-glance-load's `mkdtempSync`), which would be writes outside the folder.
- I ran the other 94 files: 422 tests, 359 pass, 63 fail.
- **The 63 failures are all from files outside the folder, not code failures.** All are `ENOENT`: 62 for `s009-reading/decisions/questions/P-001-design-lab-open.md` and 1 for `s009-reading/docs/handover/desk-operations.md`. Those repo files are not in the unpacked folder.

## verified (commands + output)
- `node --version` gave v22.23.4. Then `node --test <94 files>`, from src/: `# tests 422 # pass 359 # fail 63`. Grouping the `Error: ENOENT` lines gave the two paths above, 62 + 1. `not ok … ../tests` count: 63.
- A node script with `recordKind`, `parseCardPath` and `classifyQueuePath` on sample paths confirmed the answers to 3 and 5.
- A node script with `buildModel`, `queueView`, `waitingSet` and `cardRows` on an in-memory tree with two `card` entries (09:00, 10:00) gave `raisedAt` 10:00 in the model and 09:00 in cardRows. A notes file in the tree gave no change to `flagged` or to `neededReads`.
- A node script with `createDesk` + `fakeServer` in three modes (ok, `blobNull` card, `blobNull` log) gave the output quoted in 2.
- `ls` of the folder afterwards shows only src and tests; it is not a git repo.

## undone
- I did not run the 24 tempdir-writing test files, mostly the sender's.
- I did not trace every Home line for a can't-read project; I traced only the pill and the box ranking.
- I did not confirm Home's "New card" handling with a real fixture.

## needed outside your surface
- A full test run needs the repository's decisions/ and docs/ files beside src/ and tests/, and permission to write to os.tmpdir.

## open questions
1. Should S-009 decide "notes file on main" from tree presence alone, which both readers already hold, or by reading the blob? A read would need a new `recordKind` and a `HISTORY_PATH_RE`/budget decision.
2. Which failed-read form should the tests inject?
   - `blobNull` (by path, null inside an ok call) is a form the real function does not produce.
   - `blobFail`/stubbed fetch (the real `cant-read` call form) is keyed by sha.
   - For notes files, if presence comes from the tree, the matching failure is a poll or tree failure. In a fresh opening `st.tree` is null and no card shows; after a read, the last tree is kept.
3. The sender turns an unreadable (non-UTF-8) dispatch log or card into an empty record with no "not read" flag (collect.mjs:43). Should S-009 count that as a failed read?
4. Which `card` entry is authoritative when there are two? The readers disagree today: the model takes the last, Time asked takes the first, Home and Team keep all.

---

## Follow-up, A to D (asked after the plan review's round 1; returned 2026-11-13, recorded verbatim)

S-009 step-2 follow-up (A to D). The only folder read was /tmp/claude-0/-home-user/ac6bc9b8-20ad-59d2-b4af-fac3ee45c43c/scratchpad/s009-reading (base 0ae6c8d9); paths below are relative to it. No file was changed or written.

## changed
None.

## why: the answers

**A. The Recommended mark comes from the gate case for gate cards and from the card's own section 5 otherwise.**

Both come from one function, `answerButtons(project, f, linkCap, words = '', opts = {})` (src/lib/board.js:448-460):
```js
const recWord = (gate ? caseWord(opts.caseRec) : null) || recommendedWord(c);   // :454
... recommended: recWord === w                                                  // :459
```
`gate` means `GATE_WORDS.includes(c.gate)`, with `GATE_WORDS = ['dor', 'criteria', 'launch']` (j11.js:24). A `dor-fail` card is a decision card.

Gate card (dor, criteria, launch):
- **File:** the gate case, `docs/gates/<item>/<phase>-gate-<n>-case.md` (path built at board.js:577; `GATE_CASE_RE` at j11.js:14; phase from `GATE_PHASE = { dor:'design', criteria:'build', launch:'launch' }` at j11.js:23).
- **Parser:** `parseGateCase(text)` (j11.js:709-732) gives `{ opening, recommendation }`. It looks in the `## 1.` section for a line matching `PROPOSER_RE = /^\*\*The proposer's recommendation:\*\* (proceed|hold|recycle(?: into (?:Discovery|Design|Build|Launch))?|kill)\b/` (j11.js:702).
- **Field:** `caseRec.recommendation`. `caseWord` (sheets.js:270-275) takes its first word if it is proceed, hold, recycle or kill.
- **How the record arrives:** `caseRec = snap.records.get(casePath)` (board.js:580), passed as `{ caseRec }` (board.js:581; public/sandbox.js:2725, :3502).
- **Fallback:** with no case record, a gate card falls back to the card's own section 5, as below.

Decision card, or a gate card without a case:
- **File:** the card file `queue/<item>-<gate>-<n>.md`, as `c.parsed.text`. `parseCard` (records.js:107-131) gives the options: `- \`word\`` lines under `## 4. Options` (:115-119).
- **Parser:** `recommendedWord(c)` (board.js:487-499). It reads the section that starts `^## 5\.`. The hit is the first option word in backquotes in that section, or else the first option word named as a whole word on its first non-blank line. On a gate card, lines starting `The Critic` or `The user representative` are skipped, and the standard words proceed, hold, recycle and kill also count.
- **The sheet's text** of the recommendation is `cardSection(p && p.text, 5)` (sandbox.js:955).

Sample texts, checked with node:
- Decision card:
  ```
  # Card

  ## 1. The decision
  Pick a colour

  ## 4. Options
  - `red` — red
  - `blue` — blue

  ## 5. Recommendation
  `blue`, because.
  ```
  Result: `red:false blue:true`.
- Gate card `dor`, with no case: a `## 5. Recommendation` section holding `` `hold` `` and then `The Critic: \`kill\`` gives `proceed:false hold:true recycle:false kill:false`.
- Gate case:
  ```
  # Case

  ## 1. The ask
  **The proposer's recommendation:** recycle into Design — why
  ```
  `parseGateCase` gives `recommendation: "recycle into Design"`, and the buttons become `recycle:true`, everything else false.

**Does `neededReads` ask for these files?**
- **Card file:** yes, a required read (`for (const card of openCards(tree)) add(card.path)`, model.js:235).
- **Gate case:** only as an optional read, and only when `ctx.j11` is set (model.js:297 `if (ctx.j11)`; :306-308 `if (phase) opt(\`docs/gates/${card.item}/${phase}-gate-${card.n}-case.md\`)`). The desk page sets `j11: true` (public/sandbox.js:5397). The sender does not set it (collect.mjs:34), so the sender never reads a gate case.
- **While a case is in the tree but unread:** the sheet shows `opening: 'reading…'` (sandbox.js:961), and the mark falls back to section 5.

**B. The sender keeps its previous set in a signed workflow artifact on GitHub.**

- **Where:** the artifact `desk-notify-state`, holding `state.json` and `state.sig` (state.mjs:1-5, :25-27). It is not an issue and not a passed-in store.
- **Reading it:** `lookupState({ gh, repo, repoId, defaultBranch, stateKey })` (sender.mjs:86) runs through REST:
  - the workflow runs list (state.mjs:278-280)
  - `/actions/runs/<id>/artifacts?name=desk-notify-state` (:293)
  - the zip download (:299)
  - `readZip` and then `verifyState` with an HMAC check (:302-304)
- **First run:** with no state, `prev = emptyState(...)` (sender.mjs:97-99).
- **Writing it:** every run that builds a state calls `writeState(o.outDir, S.stateKey, next)` (sender.mjs:313). That does `mkdirSync` and `writeFileSync` of both files in `outDir` (state.mjs:219-223). The workflow's upload step then turns them into the artifact. `writeState` is imported directly, not injected, so **a sender run always writes to disk at `o.outDir`**.

What a test supplies for two runs in a row, with no network:
- `runSender({ project, config, env, fetch, now, sleep, openCheckout, log, outDir })` (sender.mjs:32).
- `env` needs `GITHUB_REPOSITORY`, `GITHUB_REPOSITORY_ID`, `GITHUB_EVENT_NAME`, `GITHUB_TOKEN`, `DESK_VAPID_PRIVATE_KEY`, `DESK_VAPID_SUBJECT`, `DESK_PUSH_SUBSCRIPTION` and `DESK_NOTIFY_STATE_KEY`.
- `fetch` is a fake GitHub and push service that answers the state lookup from the artifacts it holds.
- Between runs, the state files written to `outDir` are zipped and added as the next run's artifact.

This already exists: `harness(opts)` in tests/desk/notify-helpers.mjs:482-529 uses `makeWorld` for the fake fetch (:224) and `makeZip` for the upload (:509-515). However, `h.outRoot = tempDir('notify-out-')` (:490) and the checkouts are real git repos (`checkoutOf`, :100-107), both under `os.tmpdir`. **Without a filesystem write, the sender cannot run as the code stands.**

**C. A notice opens `<deskUrl>/?open=<key>`, and a key not on the list says "That no longer waits on you" if the project was read.**

- **The link:** `openUrl(deskUrl, key)` = `` `${deskUrl}/?open=${encodeURIComponent(key)}` `` (notify/words.mjs:20-22). The key is `waitKey(project, kind, id)` = `` `${project}|${kind}|${id}` `` (waiting.js:27-29). For a card that is `<Project>|card|queue/<file>.md`, or `|gate|` for dor, criteria and launch.
- Grouped, summary and test notices open `homeUrl` = `` `${deskUrl}/` `` (words.mjs:25-27).

How the desk follows a key:
- `openTarget(location.search)` (lib/notifyview.js:35-46) sets `opening` at start (public/sandbox.js:5406-5407). A tap on an already-open page arrives through the service-worker message instead (:5616-5622).
- `followOpening(desk, built)` (public/sandbox.js:76-111) calls `tapDecision({ target, projects, box, settled })` (notifyview.js:68-91). Its rules, in order:
  - The project is unknown: `{ kind: 'gone', project: null }`.
  - The read is `checking`, or AC77's closed read is not settled: `{ kind: 'wait' }`, decided again on a later drawing.
  - The key is found in `model.flagged`: `item`. The desk goes to `go('waiting', 'card', t.key)` = `#/waiting/card/<key>`, with "Opened from a notification" (sandbox.js:96; `go` at :313; `OPENED_WORDS` at notifyview.js:48).
  - A held question (`held`) or a PR the automatic job is recording (`recording`) gets its own handling.
  - **The key is not in `flagged`** and the project reads `cant-read`: `cant-read`, which goes to the project's page with "Opened from a notification: the desk can't read this project just now" (sandbox.js:106; notifyview.js:50).
  - **The key is not in `flagged`** and the read is good: `gone`. If this device marked that card done, the desk goes to its Done row (sandbox.js:107-108). Otherwise it goes to the project's page, or `#/`, with `GONE_WORDS = 'That no longer waits on you'` (sandbox.js:109; notifyview.js:49).
- **A `#/waiting/card/<key>` address for a card that is not on the board:** `cardSheet(bd, built, only, sheetId, …)` (public/sandbox.js:3578; branch at :3608-3634) draws a sheet titled "No longer waiting". It says "That no longer waits on you" and "It is no longer on the board: answered, merged, withdrawn, or not read yet."

For S-009: a card held back (not flagged) on a good read would show "That no longer waits on you". In tests, `loadSandbox({ config, repos, search: '?open=<key>' })` drives this in memory (tests/desk/sandbox-helpers.mjs:134).

**D. Home's count needs a full board model; its "since" lines need one project's model and snapshot.**

`briefingView(input)` (lib/home.js:170-229) reads `{ bd, reads, flagged, signedOut, v3, lastReadMs, portfolio, nowMs, tz }`; the page builds this at public/sandbox.js:744-749. Inputs that come from records:
- **`bd`**, the board: the head `${n} need${n===1?'s':''} you` takes `bd.badge` (:178, :218). It also uses:
  - `bd.waits || bd.lanes`: the lanes `wait` and `kick`, then `groups[].rows`, each row with `raisedAt`, `kind`, `v25`, `project` and `flag.question.parsed` (:182-215)
  - `bd.counts`: Map project → `{ waiting, kicked }` (:187-190)
  - `bd.quiet.agents` and `bd.pendingAny` (:224-225)
- **`bd` comes from a glue function in the page, not in lib:** `boardOf(built, nowMs, only)` (public/sandbox.js:2266-2332), which is not exported. Its chain:
  - `buildModel` gives `model.flagged`.
  - `queueView` (sandbox.js:470) gives the rows.
  - `projectCards` (board.js:528) gives the cards.
  - `boardView({ projects: [{ project, cards, agents, read, recording, asking, answerRecording, recordRows, seenRows }], marks, only, nowMs, tz, signedOut, portfolio })` (board.js:1202; called at public/sandbox.js:2331) gives `bd`.
- **`reads`:** `[{ name, read: box.read, drawError, opening }]` (public/sandbox.js:745), from `readState` (universe.js:14).
- **`flagged`:** the sum of `model.flagged.length` (public/sandbox.js:746).
- **`lastReadMs`:** from the reads' `lastSuccessAt`.

`projectEvents(input)` (home.js:263) gives Home's "since you last looked" lines. It reads `{ project, model, snap, j, commits, ownerLogin, titles, nowMs, tz }` (called at public/sandbox.js:807-808). From records it uses:
- `model.questions` (:276)
- `ownerActions(project, model, snap, j)` for rulings (:285)
- `snap.tree` and `snap.records` (:267-268), to look up a card's title by path
- the dispatch-log rows, either `j.logRows` when `j.ready`, else `model.allEntries` (:320), as `card`, `decision` and `outcome` entries
- `j` from `j11Records(project, snap)` (sandbox.js:49): the roster and the log rows
- `commits` from `desk.commits(name)`, and the open PRs from the model

Minimum a test must supply for one project:
- **Count:** `project`, `config`, a tree and records (cards, status, dispatch log) for `buildModel`; a `snap` of `{ tree, records, checkPages }`; then `queueView`, `projectCards` (`j22` may be null) and `boardView` with `marks: { marks: {} }`; then `briefingView` with `reads: [{ name, read: { read: 'ok' } }]`, `flagged`, `nowMs` and `tz`.
- **Lines:** `projectEvents` with the same `project`, `model` and `snap`, and `j` (or null, in which case it uses `model.allEntries`), plus `nowMs` and `tz`.

Because `boardOf` lives in the DOM page module, the existing whole-chain route is `loadSandbox({ config, repos })` with `fakeServer` repos keyed by path (sandbox-helpers.mjs:134). I did not build a direct `boardView` input for Home in a run.

## verified (commands + output)
- A node script, in memory, called `answerButtons`, `parseCard` and `parseGateCase` on the sample texts in A. Output: `decision: red:false blue:true`; `gate, card only: proceed:false hold:true recycle:false kill:false`; `case parse: {"opening":"**The proposer's recommendation:** recycle into Design — why","recommendation":"recycle into Design"}`; `gate, with case: proceed:false hold:false recycle:true kill:false`.
- The rest was read and searched with grep and sed, with no writes.

## undone
- I did not run the sender twice: its harness writes to `os.tmpdir` and `outDir`.
- I did not drive Home's count through `boardView` or `loadSandbox` in a run.
- I did not trace the portfolio's part of Home.

## needed outside your surface
- Permission to write to a temp directory, if the sender's two-run behaviour has to be shown by running it.

## open questions
1. With S-009, a held-back card on a good read would make a notice tap and its sheet say "That no longer waits on you". Should that wording, or a "held" kind like AC77's, be part of the spec?
2. The gate case is read only on the desk (`ctx.j11`). The sender never reads it, but the sender does not need Recommended either, so this matters only if S-009 adds a sender-side check that depends on desk-only reads.
3. Home's count can only be had through `boardOf` in public/sandbox.js or through `loadSandbox`. Should the test adapter use `loadSandbox`, or should the spec ask for `boardOf` to move into lib?
