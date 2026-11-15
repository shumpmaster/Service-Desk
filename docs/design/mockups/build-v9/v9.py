"""Build mockup v9 from v8: a style layer only (CSS appended after v8's, JS overrides before the first render).
Brings the mockup in line with the Desk Element Library's second pass against the Craft references."""
import json, os, sys
SRC, DST, ICONS = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(SRC, encoding="utf-8").read()

def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (a[:80], s.count(a)); s = s.replace(a, b)

def ph(name, w="regular"):
    f = os.path.join(ICONS, w, name + ("" if w == "regular" else "-" + w) + ".svg")
    return open(f).read().strip().replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg aria-hidden="true" focusable="false"', 1)

MORE = ('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" stroke-width="2"/>'
        '<circle cx="7.6" cy="12" r="1.45"/><circle cx="12" cy="12" r="1.45"/><circle cx="16.4" cy="12" r="1.45"/></svg>')
UI = {
 "back": ph("caret-left", "bold"), "more": MORE, "bell": ph("bell", "bold"), "bellOn": ph("bell", "fill"),
 "home": ph("house", "bold"), "homeOn": ph("house", "fill"), "plan": ph("calendar-dots", "bold"), "planOn": ph("calendar-dots", "fill"),
 "tray": ph("tray", "bold"), "trayOn": ph("tray", "fill"), "now": ph("record", "bold"),
 "search": ph("magnifying-glass", "bold"), "dots": ph("dots-three", "bold"), "down": ph("caret-down", "bold"),
 "check": ph("check", "bold"), "feed": ph("pulse", "bold"), "eye": ph("eye-slash", "bold"),
}
KINDS = {"branch": "git-branch", "commit": "git-commit", "pr": "git-pull-request", "check": "play-circle", "review": "eye",
         "merge": "git-merge", "deploy": "rocket-launch", "gate": "flag", "decision": "chat-circle-text",
         "research": "magnifying-glass", "stop": "hand-palm"}
ICONS_JS = {k: ph(v) for k, v in KINDS.items()}
CHEV = ph("caret-right", "bold").replace('<svg ', '<svg class="chev" ', 1)

rep("<title>Desk Timeline v8</title>", "<title>Desk Timeline v9</title>")
rep("Mockup, version 8,", "Mockup, version 9 (v8 restyled to the Desk Element Library's second pass: Phosphor icons in regular, bold and filled weights, glass with a white inner edge, Craft's heading layout, and legible blues),")

CSS = open(os.path.join(os.path.dirname(__file__), "v9.css"), encoding="utf-8").read()
i = s.rindex("</style>"); s = s[:i] + CSS + s[i:]

JS = ("\n  /* ================= v9: the library's icons and parts ================= */\n"
      "  var V9UI = " + json.dumps(UI) + ";\n"
      "  Object.keys(V9UI).forEach(function (k) { UI[k] = V9UI[k]; });\n"
      "  var V9K = " + json.dumps(ICONS_JS) + ";\n"
      "  Object.keys(V9K).forEach(function (k) { ICONS[k] = V9K[k]; });\n"
      "  CHEV = " + json.dumps(CHEV) + ";\n"
      + open(os.path.join(os.path.dirname(__file__), "v9.js"), encoding="utf-8").read() + "\n  render();\n})();\n</script>")
rep("  render();\n})();\n</script>", JS)
open(DST, "w", encoding="utf-8").write(s)
print("ok", len(s))
