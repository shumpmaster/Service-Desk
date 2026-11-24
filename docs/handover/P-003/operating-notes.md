# Decision cards wait for the Chief of Staff's notes: operating notes (P-003, M4)

## What this means for you

A decision card (a stop, failure or failed-readiness card) no longer shows the moment it is raised. It waits until
the Chief of Staff's notes recommend one of its answers, and then shows with that answer marked Recommended. If no
such notes come within a day, it shows anyway, marked "No Chief of Staff recommendation yet", with no answer
marked. A card's own Recommendation section never marks an answer any more. Gate cards, questions and pull
requests are unchanged. While the desk cannot read the records, it hides the decision cards it cannot judge and
says so on Waiting and Home. Nothing here is irreversible: rolling back is below.

*The Builder's operating notes for the card fix (spec S-014, AC18; plan docs/projects/P-003.md §4). They sit beside the
desk's own notes, docs/handover/desk-operations.md, and change none of them.*

## What a held decision card is, and when it shows

- A **decision card** is a card file `queue/<item>-<gate>-<n>.md` whose `<gate>` is `dor-fail`, `stop` or
  `failure`. A `dor`, `criteria` or `launch` card is a gate card, and is shown as before.
- A decision card is **held**: it is not on Waiting, not in Home's count, not on the board, gets no answer buttons
  and sends no notification, until the first of these is true on the main branch:
  1. Its notes, `decisions/<item>/<gate>-<n>-notes.md`, have a recommended word: the first line that starts
     `Recommendation:` (after any `#` heading marks and `**`, `*` or `_` at its start) holds, in backquotes, one of
     the card's own answer words, spelt exactly. The card then shows with that word's button, and only that one,
     marked Recommended, and the sheet says "The Chief of Staff recommends <word>".
  2. A day (24 hours) has passed since its raise time, the time in its `card` entry in the dispatch log. If the
     card has two entries, the earlier time counts. A raise time recorded in the future still counts from that
     time, so the card waits until it plus 24 hours.
  3. Its `card` entry is not in the part of the dispatch log the desk reads (this month's and last month's files):
     it was raised before then, so it shows at once.
- Notes that exist only on another branch or in an open pull request do not count. Notes whose line names no
  answer word, or a word in the wrong case, count as no notes.
- If notes are removed from the main branch within a card's first day, the card is held again until its day is up.
  That is the only way a shown card goes back to being held.
- A notification is sent at the sender's first run after the card shows, as for any card that newly waits on you.
  A notice sent before the card was held again opens to "That no longer waits on you"; the card comes back by
  itself.

## What "No Chief of Staff recommendation yet" means

The card has waited a day (or was raised before the part of the log the desk reads) and still has no notes with a
recommended word. No button is marked. When notes with a recommended word reach the main branch, the mark gives
way on the desk's next read (within a minute while the desk is open and visible; no reload is needed), and that
word's button is marked Recommended.

## The three "not shown" lines

Each shows on Waiting with one project shown (the project's queue) and in Home's briefing, and nowhere else: not
on the board with every project shown, and not in notifications.

- **"Decision cards not shown: queue/ could not be read"**: the last read did not get the file tree, or did not get
  the text of every card file in queue/. No decision card is shown.
- **"Decision cards not shown: the Chief of Staff's notes could not be read"**: a notes file for a decision card is
  on the main branch, but the read could not get its text. No decision card is shown. (One unreadable notes file
  hides every decision card, and the desk's usual "Can't read" line shows too.)
- **"Decision cards without Chief of Staff notes not shown: the dispatch log could not be read"**: the read got
  queue/ and the notes but not the dispatch log. The decision cards whose notes have a recommended word are shown
  as usual; the others are hidden, since their day cannot be counted. The line shows only while at least one card is
  hidden for this reason. The sender sends no notification for any card on such a run, and notifies them at its next
  run that reads the records.

A read that fails altogether, for example with the device offline or signed out, hides every decision card, with
the queue/ line, while the other cards stay shown from the last read with today's "Can't read" line. The lines
show only while the project reads "Can't read", not while a first read is still arriving. Nothing needs doing:
the cards come back by themselves, each held or shown by its real age, on the first read that gets the records.

## Running the rule on the records at a commit and a moment (AC13)

The rule is `decisionStates` in src/lib/model.js. It reads no clock, network or stored state: it is handed the
records and a moment. To run it on the main branch as it stood at commit `<sha>`, at moment `<ISO time>`, from a
clone of Service-Desk whose src/ holds M4's code (use M4's code for a commit from before M4 was merged; for a later
commit, the code at that commit):

```sh
git worktree add --detach /tmp/at-commit <sha>
node --input-type=module -e "
  import { openCheckout } from './src/notify/checkout.mjs';
  import { readRecords } from './src/notify/collect.mjs';
  import { decisionStates } from './src/lib/model.js';
  import config from './src/lib/config.js';
  const project = config.projects.find((p) => p.name === 'Service-Desk');
  const now = new Date(process.argv[1]);
  const { tree, records } = readRecords(project, openCheckout('/tmp/at-commit'), now);
  const r = decisionStates({ tree, records, now });
  console.log(JSON.stringify({ list: [...r.cards.values()], notRead: r.notRead, withoutNotes: r.withoutNotes }, null, 2));
" '<ISO time>'
git worktree remove /tmp/at-commit
```

It prints one entry per decision card in queue/ at that commit (answered cards are not in queue/'s open set):
`id` (`<item>-<gate>-<n>`), `raised` (the earliest `card` entry's time as recorded, or `not recorded`), `state`
(`held`, `shown, recommended <word>` or `shown, no recommendation yet`) and `word`. If the records at that commit
could not be read, `notRead` names `queue` or `notes` and the list is empty, or `withoutNotes` is true and the list
holds only the cards with a recommended word. Reading a git checkout, a file that is not text is read as empty: such a
log counts as having no entries, and such a notes file as no notes. tests/desk/s014-ac13-count.test.mjs runs these
steps on a made-up repository.

## J6's check moments and the two figures

All of these come from the main branch's history (`git log --first-parent --format='%H %cI' main`):

- **The main line** is the main branch's first-parent history, so a commit made on a pull-request branch counts
  from when it reached the main branch.
- **The commit current at a moment** is the latest commit on the main line whose committer time is at or before it.
- **A card's arrival** is the committer time of the first commit on the main line whose tree holds its card file
  (`git log --first-parent --diff-filter=A --format=%cI main -- queue/<id>.md`, its last line).
- **A card's check moments from a due time** are the due time itself, then the committer time of each later commit
  on the main line that changes queue/, any notes file (`decisions/*/*-notes.md`), the dispatch log
  (`dispatch-log/`), `src/lib/` (the rule's code and the modules it imports) or the two record readers the count
  runs (`src/notify/collect.mjs` and `src/notify/checkout.mjs`), stopping at the first commit whose tree no longer
  holds the card file. Between those commits only time passes, and that can only turn a held card to shown.
- At each check moment, run the rule (above) on the commit current then, at that moment, with the rule's code as
  it stood at that commit. For a commit before M4 was merged (2783b48, PR #465), use the code as M4 merged it.
- **A card's recorded raise time** is the one the rule gives at the first of its moments (its arrival, then each
  later check-moment commit) at which the rule lists it with a recorded time, so a card whose `card` entry reaches
  the main branch after its file still gets a V6 due time.

The figures, for each decision card:

1. **V6 held-too-long miss.** Due time: the recorded raise time plus 24 hours. The card is a miss if the rule gives
   it `held` at any of its check moments. A card with no recorded raise time is never held, so never a miss.
2. **Held a day after reaching the main branch**, reported beside V6 but not counted in it. Due time: the card's
   arrival plus 24 hours. Reported if `held` at any of its check moments.

A check moment at which the records cannot be read (`notRead`, or `withoutNotes` with the card left out) is a failed
read, reported as such, not a miss. A card answered before its due time has left the open set (its card file stays in
queue/, but it now has an answer; src/lib/model.js:141-147), so the rule no longer lists it, and it can be neither
a miss nor reported.

Example: a card and its entry arrive together at 2026-11-10 10:00, but the entry records 2026-11-11 09:00. With no
notes, at the V6 due time 2026-11-12 09:00 it is `shown, no recommendation yet`: not a miss. At the second figure's
due time, 2026-11-11 10:00, its age is 1 hour, so it is `held`: reported.

## What the figures can and cannot find

- The V6 held-too-long figure can be other than 0 only if the rule's code on the main branch changes after M4: the
  rule as built never holds a card past its recorded day. It guards against a later change.
- The second figure finds holds caused by a skewed or malformed raise time, such as the example above.
- Neither figure can find a view showing a decision card with neither mark: every shown state the rule gives
  carries one of the two, so a view that dropped the mark, or showed a card the rule did not list, leaves nothing in
  the records. That half of V6 is guarded by the tests before launch, not counted after it.

## Rolling back

1. Redeploy the previous production deployment of the desk: Cloudflare, Workers & Pages, the desk's project,
   Deployments, the last production deployment before M4, "…", "Rollback to this deployment" (as in
   docs/handover/desk-operations.md, "An earlier desk back"). The page then shows decision cards as before.
2. Then revert the merge on the main branch (`git revert -m 1 <the M4 merge commit>`, by pull request), so the
   notification sender, which runs the main branch's code, goes back too, and the next deploy does not bring M4 back.

Do them in that order.
