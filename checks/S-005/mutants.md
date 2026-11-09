# S-005: broken versions the locked checks must catch (D-046)

Each row is a deliberately broken version of the rule or views. Make the change on a scratch copy of a
passing build and run `node --test tests/acceptance/S-005/`. The named test must fail. A mutant that
survives is reported to the check author through the stop rule. The check is not edited (a new
spec supersedes it).

| # | Broken version | Must be caught by |
|---|---|---|
| M1 | Kind by prefix: `dor-fail` read as a `dor` gate card | J1 "kind comes from <gate>" |
| M2 | Age clamped at 0 (negative age shows at once), or measured from the read | J1 "clock skew", J1 "far in the future" |
| M3 | Strict `>` 24h instead of `>=` | J1 "a day from it", AC4, J1 skew 10:00 case |
| M4 | Section 5 still marks a decision card's button | AC3 |
| M5 | Case-insensitive word match (`Drop` → drop) | J2 "case differs" |
| M6 | Word taken without backticks | J2 "no backticks", AC6 |
| M7 | `Recommendation:` matched anywhere in a line | J2 "prose mention earlier", "mention only later" |
| M8 | The last, or any, `Recommendation:` line decides | J2 "two lines" (both cases) |
| M9 | Heading or bold marks not stripped | J2 "bold label", "italic label", "heading" |
| M10 | First backticked word taken even if not a card word | J2 "first backticked word that is a card word", AC6 |
| M11 | Notes matched by item only (`stop-2` notes used for `stop-1`) | J2 "notes for stop-2" |
| M12 | Notes read from any ref, not only main | AC8 |
| M13 | Missing log entry treated as held, or as raised now | J1 "log got, no entry", AC7, J6 list (`not recorded`) |
| M14 | Log not got → all decision cards hidden (or all shown) | J1/J3/AC17 "log not got" |
| M15 | Log not got → flag shown even when no card left out | J3 "flag if any left out", AC17 "no line" |
| M16 | One failed notes file hides only its own card | J3, AC16 "a needed notes file" |
| M17 | A gate card's notes file read (or its failure hides decision cards) | AC9 "does not look for notes", AC16 "a notes file the rule does not need" |
| M18 | Failed notes content treated as "no notes" | J2 "content cannot be got" |
| M19 | Latest of two `card` entries picked | J1 "two card entries" (with `duplicates: 'all'`) |
| M20 | Rule reads `Date.now()` | AC11 "never reads a clock", AC13 clock test |
| M21 | Desk caches a shown state (never goes back to held, or keeps cards through a failed read) | J3 "nothing carried", AC11 "open for hours", J4 "left open when a read fails" |
| M22 | Board (or Home) not filtered by the list | J4 "appear in no view", AC1, AC11 |
| M23 | Card sheet drops the mark, or marks no button for a recommended card | J4, AC2, AC4, AC11 |
| M24 | Sender notifies held cards, or misses first showing | J5, AC14 |
| M25 | Line text differs from the spec's words | J4 "exact lines", AC16, AC17 |
| M26 | Lines shown on the board only / not on Home | J4, AC16 |
| M27 | Held card's link opens an answerable sheet | AC1, AC15, J4 |
| M28 | Gate card loses today's Recommended mark | AC9 |
| M29 | Notes content fetched for decision cards with no notes file in the tree, or twice | AC10 |
| M30 | Monitor reports a card's raise time other than the rule's pick | J6, J1 |
| M31 | Change under src/notify/** | AC14 "unchanged from the base commit" |
| M32 | Baseline re-recorded after src/ changes | baseline-provenance |
