"""Build mockup v10 from v9: a style layer only (CSS appended after v9's).
Raises the project chips as the Desk Element Library's FilterChip (named form) now does."""
import os, sys
SRC, DST = sys.argv[1], sys.argv[2]
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

rep("<title>Desk Timeline v9</title>", "<title>Desk Timeline v10</title>")
rep("Mockup, version 9 (", "Mockup, version 10 (v9 with raised project chips, as the owner asked; then ")
CSS = open(os.path.join(os.path.dirname(__file__), "v10.css"), encoding="utf-8").read()
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
