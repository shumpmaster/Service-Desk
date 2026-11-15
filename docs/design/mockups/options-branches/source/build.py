"""Build the branch options page: three ways to draw several branches at once, with the seven kinds on the lines.
python3 build.py <phosphor assets> ../index.html"""
import json, os, sys
ICONS, DST = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))

def ph(name, w="regular"):
    f = os.path.join(ICONS, w, name + ("" if w == "regular" else "-" + w) + ".svg")
    return open(f).read().strip().replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg aria-hidden="true" focusable="false"', 1)

KINDS = {"branch": "git-branch", "commit": "git-commit", "pr": "git-pull-request", "check": "play-circle",
         "review": "eye", "merge": "git-merge", "deploy": "rocket-launch"}
IC = {k: ph(v) for k, v in KINDS.items()}
tpl = open(os.path.join(HERE, "page.html"), encoding="utf-8").read()
open(DST, "w", encoding="utf-8").write(tpl.replace("/*ICONS*/{}", json.dumps(IC)))
print("ok")
