#!/usr/bin/env python3
"""desk_config_check — the desk's config check (spec S-001, Toolchain and deploy route).

Fails when src/wrangler.toml holds any key other than name, pages_build_output_dir
(which must be "public") and compatibility_date, or when src/package.json has a
`dependencies` block or any lifecycle script. desk-build runs it on every pull request,
and each desk-deploy job runs it again on the commit it is about to deploy.

  desk_config_check.py [--require] [SRC_DIR]

SRC_DIR defaults to src. Without --require, a missing SRC_DIR/package.json passes with a
note (before M1 there is no src/). With --require (the deploy jobs), it fails.
Python 3.11+ (tomllib). It reads files only and runs nothing from them.
"""
import json
import sys
import tomllib
from pathlib import Path

ALLOWED_TOML_KEYS = {"name", "pages_build_output_dir", "compatibility_date"}
LIFECYCLE_SCRIPTS = {
    "preinstall", "install", "postinstall",
    "preprepare", "prepare", "postprepare",
    "prepack", "postpack",
    "prepublish", "prepublishOnly", "publish", "postpublish",
}


def check(src: Path, require: bool) -> list[str]:
    pkg = src / "package.json"
    toml = src / "wrangler.toml"
    if not pkg.is_file() and not toml.is_file():
        if require:
            return [f"{pkg} and {toml} are missing; there is nothing to deploy"]
        print(f"note: no {pkg} yet; nothing to check")
        return []
    errors = []

    if not pkg.is_file():
        errors.append(f"{pkg} is missing")
    else:
        try:
            data = json.loads(pkg.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            errors.append(f"{pkg} is not valid JSON: {exc}")
            data = None
        if data is not None and not isinstance(data, dict):
            errors.append(f"{pkg} is not a JSON object")
        elif data is not None:
            if "dependencies" in data:
                errors.append(f"{pkg} has a `dependencies` block; the desk has no runtime dependencies")
            scripts = data.get("scripts", {})
            if not isinstance(scripts, dict):
                errors.append(f"{pkg} `scripts` is not an object")
            else:
                for name in sorted(LIFECYCLE_SCRIPTS & scripts.keys()):
                    errors.append(f"{pkg} has the lifecycle script `{name}`")

    if not toml.is_file():
        errors.append(f"{toml} is missing")
    else:
        try:
            conf = tomllib.loads(toml.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            errors.append(f"{toml} is not valid TOML: {exc}")
            conf = None
        if conf is not None:
            for key in sorted(conf.keys() - ALLOWED_TOML_KEYS):
                errors.append(f"{toml} has the key `{key}`; only "
                              f"{', '.join(sorted(ALLOWED_TOML_KEYS))} are allowed")
            if conf.get("pages_build_output_dir") != "public":
                errors.append(f'{toml} must set pages_build_output_dir = "public"')
    return errors


def main(argv: list[str]) -> int:
    require = "--require" in argv
    rest = [a for a in argv if a != "--require"]
    if len(rest) > 1 or any(a.startswith("-") for a in rest):
        print(__doc__, file=sys.stderr)
        return 2
    src = Path(rest[0] if rest else "src")
    errors = check(src, require)
    for err in errors:
        print(f"::error::{err}")
    if errors:
        return 1
    print("desk config check: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
