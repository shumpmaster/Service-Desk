# EXP-007's test widget — the Reviewer's check of the ASCII repack at 553bcc6, verbatim

On the owner's iPhone, the packed file at 491baa7 failed to parse ("Error on line 1027: SyntaxError:
Unexpected EOF"): raw control and line-separator characters sat in a string literal. 553bcc6 packs
the file as pure ASCII (needs-you-test.js 363,013 bytes, sha256
eb53c5b7b9030e30baa3480acc533800760db35e04ced00588bb94b2f4f748da). Recorded by the orchestrator,
session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-05.

---

Verdict: PASS

1. Scope: holds. `git diff --stat 491baa7 553bcc6` lists only src/widget-test/needs-you-test.js (+90/−90), pack.mjs (+26/−2) and test.mjs (+16); one commit. pack.mjs: esbuild charset utf8 → ascii, the new `asciiOnly()` on the bundle, and a final check that stops the pack if any byte outside printable ASCII is left.
2. Bytes: holds. 363013 bytes, every byte 0x0A or 0x20–0x7E (no tabs, no CRs). 491baa7's file had 293 bytes outside that range.
3. Same program: holds. Both files parsed with acorn 8.19 (ecmaVersion latest, script, top-level await allowed), ignoring start, end and raw, comparing string values, template cooked values, identifier names, regex pattern plus flags. Both trees: 66086 nodes, 2494 string literals, 254 regex literals, 329 template literals, 0 tagged templates, 230 comments. A plain comparison differs only in regex patterns (source text: `· ` old, `\xB7 ` new); with the old patterns' non-ASCII characters written as `asciiOnly` would write them, the trees are equal (`ASTs equal with old regex patterns canonicalised: true`). 9 regex literals changed source (U+B7, U+2014, U+FEFF, U+2013; flags '' and 'g'); old and new compiled and matched against each escaped character, the character inside text, and neighbouring code points: 0 differences. Strings, template cooked values and identifiers equal as they stand.
4. `asciiOnly()` (pack.mjs:27–38): safe for this bundle — in strings, templates and regexes, including character classes and ranges, u and non-u mode; surrogate pairs as two `\u` escapes; a character after an odd number of backslashes stops the pack. It could change meaning where none occur in this file: a raw U+2028, U+2029 or CR ending a `//` comment (0 such comments); a raw CR in a template's raw text (cooked values equal, 0 tagged templates); between tokens or in identifiers it would be a syntax error, not a silent change. The trees in point 3 are equal, so none happened here.
5. Tests: pass. `node --test src/widget-test/test.mjs` on the export: 38/38, about 147 s, exit 0; the new pure-ASCII test passes; the judge reports "total: 6 match".

Open questions: pack.mjs could not be re-run in a scratch clone (its `git log -- ../lib` needs history the clone lacks); point 3 compares the committed file itself. Non-blocking: `asciiOnly`'s doc comment calls escaping safe everywhere, untrue for line terminators in comments and template raw text; a later lib change bringing either in would not stop the pack.
