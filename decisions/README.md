# Decisions (S-012)

The owner's answer to a card is `<item>/<gate>-<card>.md`. First line: `Decision: <word>`, one of the
card's listed words. When the Chief of Staff writes it on the owner's explicit instruction, the second
line is `Proxy: done at the owner's request` followed by the owner's exact words. A proxy is refused on
any word that closes an item and on `launch approve` (D-066).

The owner's rulings on questions are `questions/<question>.md`, with a first line `Ruling: <answer>`.

A ruling record holds only the ruling: the `Decision:` or `Ruling:` line, any `Proxy:` line, the
question as it was put to the owner, and the owner's own words. Any commentary by the Chief of Staff
goes in the matching `-notes.md` file. The Critic reads ruling records, so it can check a brief
that relies on an owner's ruling; it never sees `-notes.md` files (model L-0119).
