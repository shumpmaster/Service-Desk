# Decisions (S-012)

The owner's answer to a card is `<item>/<gate>-<card>.md`. First line: `Decision: <word>`, one of the
card's listed words. When the Chief of Staff writes it on the owner's explicit instruction, the second
line is `Proxy: done at the owner's request` followed by the owner's exact words. A proxy is refused on
any word that closes an item, `kill` on the `dor`, `criteria` and `launch` cards among them; on `launch approve`
and `launch proceed`; and on any record holding a `Nothing needed:` line (D-066, S-024).

On a phase gate's card, three more lines may follow line 2, in any order (S-024); any other later line is
not read:
- `Into: <Phase>`: needed once with `recycle`, naming a phase that gate allows. The Design gate allows
  Discovery; the Build gate, Discovery or Design; the Launch gate, Discovery, Design, Build or Launch.
- `Reason: <text>`: needed once, with text, with `recycle` and with `hold`.
- `Nothing needed: Build`: passes Build with nothing needed. It is valid only on the Build gate's card
  (`criteria`), with `proceed`, with line 2 empty (never by proxy), once in the record, and only when the
  case holds a line `## Nothing needed in Build`. Only Build can be passed this way.

A record that lacks a line its word needs, or breaks a rule above, leaves the card open with an anomaly
naming what is wrong. `proceed`, `kill` and the old words need nothing beyond lines 1 and 2; over the user
representative's reject, the words that move the item forward need one more line (below). The record is read whole; one over 64 KiB is refused.

Over the user representative's reject (S-025), the words that move the item forward need one more line,
which may sit beside the lines above (a Build-gate `proceed` with `Nothing needed: Build` holds both):
```
Decision: proceed
<empty, or the Proxy: line>
User-Override: <one line: why you go on over the representative's reject>
```
The words that need it are `proceed` at all three gates, `build` on `dor`, and `approve` on `criteria` and
`launch`. Without a `User-Override:` line with text, the card stays open with an anomaly naming the missing
line. `hold`, `recycle`, `kill`, `re-aim`, `revise` and `stop` need nothing more; over an approve, or where
the representative did not run, the line is not read. Under a `Proxy:` line it is the owner's own words,
recorded by the Chief of Staff; the proxy rules above still apply.

The owner's rulings on questions are `questions/<question>.md`, with a first line `Ruling: <answer>`.

A ruling record holds only the ruling: the `Decision:` or `Ruling:` line, any `Proxy:` line, the
question and its options exactly as they were put to the owner (never a recommendation), and the
owner's own words. Any commentary by the Chief of Staff
goes in the matching `-notes.md` file. The Critic reads ruling records, so it can check a brief
that relies on an owner's ruling; it never sees `-notes.md` files (model L-0119).

A ruling put to the owner outside a card (for example a change to a project's milestones) is recorded in decisions/questions/<project>-<topic>.md; its first line is `Ruling: <what the owner ruled>`, then any `Proxy:` line, the question and its options as put, and the owner's own words.

The owner's approval of a project's target-user profile (S-025) is a ruling record of its own,
decisions/questions/<project item>-user-profile-<n>.md (`<n>` from 1), in the ruling-record form above:
line 1 `Decision: approve`; line 2 empty, or the `Proxy:` line with the owner's exact words; then the line
`Profile-Sha256: <64 lower-case hex>`, the SHA-256 of docs/users/PROFILE.md's bytes as approved; then the
question as put and the owner's own words. A profile changed after its approval no longer matches: the
checks stay red until the owner approves the new text in a new record (`<n>` + 1) and section 9 of the brief
names it.
