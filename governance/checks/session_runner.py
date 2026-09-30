#!/usr/bin/env python3
"""session_runner — carries out the Orchestrator's plan entries safely (model S-014).

Usage:
  session_runner.py pack    --entry FILE --source DIR --now RFC3339 --control FILE [--pack DIR]
                            [--config DIR] [--request-month YYYY-MM] [--confirm]
                            [--builder-control FILE --builder-hash HEX] [--waivers FILE]
                            [--source-tip SHA]
  session_runner.py run     --pack DIR --control FILE --hash HEX --out DIR [--claude PATH]
  session_runner.py collect --pack DIR --control FILE --hash HEX --out DIR
  session_runner.py checks  --source DIR --changes DIR --control FILE --hash HEX
                            --builder-control FILE --builder-hash HEX --work DIR --out DIR
                            [--sandbox bwrap]
  session_runner.py record  --dest DIR --outcomes FILE --control FILE --hash HEX
                            (--run DIR | --checks DIR --changes DIR)

Five steps, each reading only the paths on its command line (AC1). `run` starts the pinned
command line; `checks` runs git only to give the cleaned tree a fresh one-commit repository
(L-0088), then the project code (governance/checks/check_all.sh); `pack`, `collect` and
`record` use no git and open no network connection.

  pack     One model S-012 plan entry (a JSON object: item, route, action, role, stage, spec, gate)
           -> a pack folder holding only what the role may see (governance/PACKS.toml:
           must_read and may_read, then include_feedback, minus must_not_see, which always
           wins; never .git, links, non-regular or oversized files, governance/HOLDOUTS.md or
           holdouts/**; `decisions/**/*-notes.md` never), the role's agent file and BRIEF.md
           (governance/BRIEFS.toml), and, outside the pack, a sealed control file. Prints the
           control file's sha256, which every later step takes as a separate argument (AC2).
           A `run-checks` entry gets a control file only, naming the builder's control file by
           hash. --config is the folder holding PACKS.toml, RUNNER.toml, BRIEFS.toml,
           ROUTING.toml and SURFACES.md (default: the source tree's governance/).
           --request-month (critic-triage only, required there): the month of the item's
           request; Triage gets the dispatch-log month files from it to --now's month.
           --confirm: the entry is a confirmation dispatch (the owner's `confirm`), so the
           critic's record is `_critic-confirm.md`.
           The role's model (model S-016 AC1) is the environment variable MODEL_<ROLE> (upper case,
           `-` as `_`; definer-freeze uses MODEL_DEFINER, critic-triage MODEL_CRITIC), never a file;
           missing or empty, the entry is refused (report it as result `error`). A checker's doers'
           variables must be set too, and a checker on its doer's model (D-056: critic against
           definer and check-author, check-author and reviewer against builder, source-checker
           against researcher) is refused unless --waivers (the default branch's
           decisions/model-waivers.md) holds the line `<checker role> <doer role>: <reason>`.
           RUNNER.toml's proven_version, proven_image_os and proven_image_version are sealed
           into the control file (model S-016 AC2). A MODEL_* value not matching
           ^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$ is refused (model S-013 AC9).
           --source-tip (model S-013 AC2): the item-branch commit the source tree was built from,
           sealed as the control file's `source_tip` (null without it: the item has no branch yet).
           A Definer dispatched at stage 3 for an item whose status file (in the source tree) lists
           a superseded spec not yet marked `superseded` there gets BRIEFS.toml's [notes]
           supersede line, {superseded} filled with that spec's id, and the control file names it
           as `supersede` (model S-013 AC7).
  run      Starts `claude -p <brief> --agent ... --model ... --max-turns ... --tools ...
           --allowedTools ... [--disallowedTools <command tools>]` in the pack, with only
           CLAUDE_CODE_OAUTH_TOKEN, PATH, fresh HOME and TMPDIR beside the pack (<pack>.home,
           <pack>.tmp), LANG, RUNNER.toml's pass_env names (while session_commands is "on",
           only if pass_env_cleared is true) and, while "on", CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1. Kills the process group at the role's
           time limit. "on" holds only while the pinned version is the proven one and the runner's
           ImageOS and ImageVersion match the proven image (model S-016 AC2); otherwise the session
           runs as "off" would, stderr.txt starts with a fixed line and result.json says
           "commands": "off-unproven". Writes answer.md, stderr.txt (each capped, with a marker when cut; the
           token, if echoed, is removed) and result.json (ok, error, timeout, usage-limit) in
           --out, outside the pack.
  collect  For a builder-class role: the files added, changed or deleted in the pack against
           the control file's manifest, kept only when safe and inside the role's lane (AC8),
           as --out/changes.json, --out/files/... and --out/discarded.txt (path: reason).
           Read-only roles produce an empty change set.
  checks   Copies the source tree without .git, holdouts, credential files, links and hard-linked
           files (listed in the log), applies the
           change set, makes governance/checks/**, tests/acceptance/**, checks/** and
           .github/** match the source exactly, restores or removes the builder's test-hook
           files (conftest.py, pytest.ini, ...), gives the tree a new git repository holding
           one commit of it (no history, no remote, hooks off, no git configuration from the
           environment; L-0088), then runs governance/checks/check_all.sh with
           only PATH, HOME, TMPDIR and LANG and a time limit. --out/checks.log (capped) and
           --out/result.json (verdict PASS for exit 0, FAIL otherwise) (AC9).
           --sandbox bwrap (model S-016 AC3): the script runs in its own bwrap, deny by default
           (the whole file system read-only, the check tree and fresh HOME and TMPDIR the only
           writable binds, /run hidden, no network, the caller's ids, no capabilities), after a
           preflight run of `true` in the same sandbox; a missing bwrap or a sandbox that does
           not start is an `error` result with a fixed reason, never an unsandboxed run.
  record   Writes the answer (or the check log followed by the discard list) byte for byte
           to its record under --dest, built from the control file's validated ids, and
           appends one line {item, session, role, record, result, verdict} to --outcomes,
           which model S-012's `step --outcomes` reads (AC10).

Exit 0 = done, 1 = refused (a control file that does not match its hash, a tampered pack,
an unknown role — report it as result `error`), 2 = usage or configuration error.
Requires Python 3.11+ (tomllib).
"""

import sys

if sys.version_info < (3, 11):
    print("ERROR: Python 3.11+ is required (tomllib)", file=sys.stderr)
    sys.exit(2)

import argparse  # noqa: E402
import hashlib  # noqa: E402
import json  # noqa: E402
import os  # noqa: E402
import re  # noqa: E402
import shutil  # noqa: E402
import signal  # noqa: E402
import stat  # noqa: E402
import subprocess  # noqa: E402
import threading  # noqa: E402
import time  # noqa: E402
import tomllib  # noqa: E402
import unicodedata  # noqa: E402

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import govlib as g  # noqa: E402
import orchestrator as orch  # noqa: E402
import review_check  # noqa: E402

CONTROL_FORMAT = "session-runner-control/1"
CONFIG_FILES = ("PACKS.toml", "RUNNER.toml", "BRIEFS.toml", "ROUTING.toml", "SURFACES.md")
ENTRY_KEYS = ("item", "route", "action", "role", "stage", "spec", "gate")

# model S-012's session roles (every model S-012 role but `checks`, which has no session) (AC4).
SESSION_ROLES = ("critic", "researcher", "source-checker", "definer", "definer-freeze", "check-author",
                 "builder", "reviewer", "critic-triage")
AGENT_OF = {"definer-freeze": "definer", "critic-triage": "critic"}
PACK_OF = {"definer-freeze": "definer"}          # critic-triage has its own PACKS.toml entry
CHECKERS = ("critic", "source-checker", "reviewer")  # a verdict line first; `checks` has no session
CHECK_AUTHOR = "check-author"
COMMAND_ROLES_EXTRA = ("reviewer",)             # with builder-class roles, get command tools when on
PLACEHOLDERS = ("spec", "item", "question", "project")

# Every id, route, month and hash is matched whole (re.fullmatch, so no trailing newline) and with
# ASCII [0-9] (never `\d`, which takes any Unicode digit): ids build paths and session ids (AC10).
ITEM_RE = re.compile(r"[PQE]-[0-9]+")
SPEC_RE = re.compile(r"S-[0-9]+")
ROUTE_RE = re.compile(r"[a-z][a-z0-9-]*")
MONTH_RE = re.compile(r"[0-9]{4}-[0-9]{2}")
MONTH_FILE_RE = re.compile(r"([0-9]{4}-[0-9]{2})\.jsonl")
HASH_RE = re.compile(r"[0-9a-f]{64}")

DANGEROUS_TOP = (".github", "governance", ".claude")
CHECK_PATHS = ("governance/checks", "tests/acceptance", "checks", ".github")
HOOK_NAMES = ("conftest.py", "sitecustomize.py", "usercustomize.py", "pytest.ini", "tox.ini", "setup.cfg",
              ".coveragerc", "pyproject.toml", ".pytest.ini", "pytest.toml", ".pytest.toml")   # + model S-016 AC10
LIMIT_KEYS = ("file_bytes", "change_set_bytes", "change_set_files", "path_part_bytes", "path_bytes",
              "record_bytes", "check_run_minutes")
KILL_GRACE_SECONDS = 3      # after the group kill, how long to wait for the output pipes to close
GIT_IDENTITY = ("session-runner", "session-runner@checks.invalid")

# model S-016 AC1: each role's model is a repository variable; D-056's pairs, checker -> its doers.
MODEL_ROLE = {"definer-freeze": "definer", "critic-triage": "critic"}
CHECKED_BY = {"critic": ("definer", "check-author"), "check-author": ("builder",), "reviewer": ("builder",),
              "source-checker": ("researcher",)}
WAIVER_RE = re.compile(r"([a-z][a-z-]*) ([a-z][a-z-]*): (\S.*)")

# model S-013 AC9: a role's model, as the MODEL_* variable must spell it.
MODEL_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:-]{0,127}")
SOURCE_TIP_RE = re.compile(r"[0-9a-f]{40}")

# model S-016 AC2: the proven values, and the one line a session run with commands forced off gets.
PROVEN_KEYS = ("proven_version", "proven_image_os", "proven_image_version")
PROVEN_IMAGE_OS_RE = re.compile(r"[a-z]+[0-9]+")          # model S-013 AC9
PROVEN_IMAGE_VERSION_RE = re.compile(r"[0-9.]{6,}")
IMAGE_VERSION_RE = re.compile(r"[0-9.]+")
UNPROVEN_LINE = "commands off: the pinned version or runner image is not the proven one (model S-016 AC2)"

# model S-016 AC3: the check run's sandbox, and its fixed reasons for not running.
SANDBOXES = ("bwrap",)
SANDBOX_MISSING = "bwrap was not found; the checks did not run"
SANDBOX_NOT_STARTED = "sandbox did not start"
SANDBOX_PREFLIGHT_SECONDS = 60


class Refused(Exception):
    """A step refuses its inputs (exit 1)."""


# --------------------------------------------------------------------------
# Small helpers


def id_ok(rx, value):
    """True when value is a str matched whole by rx (never a trailing newline)."""
    return isinstance(value, str) and rx.fullmatch(value) is not None


def norm(path):
    """A path as compared (AC3): Unicode NFC, case folded."""
    return unicodedata.normalize("NFC", path).casefold()


def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()


def is_utf8(rel):
    try:
        rel.encode("utf-8")
        return True
    except UnicodeEncodeError:
        return False


def show(rel):
    """A path as shown in a log: JSON-quoted, so control characters and odd bytes are visible."""
    return json.dumps(rel, ensure_ascii=False).encode("utf-8", "backslashreplace").decode("utf-8")


def inside(child, parent):
    """True when child is parent or below it (after resolving links)."""
    c, p = os.path.realpath(child), os.path.realpath(parent)
    return c == p or c.startswith(p.rstrip(os.sep) + os.sep)


def read_regular(path, limit=None, single=False):
    """The bytes of a regular file, never through a link; None when it is not one (or over limit).
    single: also None when the file has more than one hard link (a source file, never copied)."""
    try:
        fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    except OSError:
        return None
    try:
        st = os.fstat(fd)
        if not stat.S_ISREG(st.st_mode) or (limit is not None and st.st_size > limit):
            return None
        if single and st.st_nlink > 1:
            return None
        chunks = []
        while True:
            b = os.read(fd, 1 << 20)
            if not b:
                break
            chunks.append(b)
        return b"".join(chunks)
    finally:
        os.close(fd)


def write_bytes(path, data, mode=0o644):
    folder = os.path.dirname(path)
    if folder:                          # a bare file name is written in the current folder (model S-016 AC10)
        os.makedirs(folder, exist_ok=True)
    tmp = path + ".tmp-session-runner"
    with open(tmp, "wb") as fh:
        fh.write(data)
    os.chmod(tmp, mode)
    os.replace(tmp, path)


def write_json(path, obj):
    """JSON with every non-ASCII character escaped, so a path that is not UTF-8 is still written."""
    write_bytes(path, (json.dumps(obj, indent=1, sort_keys=True) + "\n").encode("ascii"))


def fresh_dir(path, what):
    """Create path as a new folder (an existing empty folder is accepted)."""
    if os.path.lexists(path):
        if os.path.islink(path) or not os.path.isdir(path) or os.listdir(path):
            raise g.UsageError("%s %s exists and is not an empty folder" % (what, path))
    else:
        os.makedirs(path)
    return path


def walk(root, prune_git=False):
    """Yield (rel, lstat, kind) under root, never following links; kind is dir, file, link or other."""
    stack = [""]
    while stack:
        rel = stack.pop()
        full = os.path.join(root, rel) if rel else root
        try:
            with os.scandir(full) as it:
                entries = sorted(it, key=lambda e: e.name)
        except OSError:
            continue
        subdirs = []
        for e in entries:
            r = "%s/%s" % (rel, e.name) if rel else e.name
            st = os.lstat(os.path.join(full, e.name))
            mode = st.st_mode
            if stat.S_ISLNK(mode):
                kind = "link"
            elif stat.S_ISDIR(mode):
                kind = "dir"
            elif stat.S_ISREG(mode):
                kind = "file"
            else:
                kind = "other"
            if kind == "dir" and prune_git and norm(e.name) == ".git":
                continue
            yield r, st, kind
            if kind == "dir":
                subdirs.append(r)
        stack.extend(reversed(subdirs))


def parents(n):
    """Every folder prefix of a normalized path."""
    parts = n.split("/")
    return ["/".join(parts[:i]) for i in range(1, len(parts))]


def under(n, prefix):
    return n == prefix or n.startswith(prefix + "/")


def hard_linked(st):
    """A regular file with more than one link: it may be another path's bytes (a holdout, a
    credential), so it is never packed or copied to the check tree, as links are not."""
    return stat.S_ISREG(st.st_mode) and st.st_nlink > 1


def is_hook_file(n):
    base = n.rsplit("/", 1)[-1]
    return base in HOOK_NAMES or base.endswith(".pth")


def always_out(n):
    """Never in a pack or a check tree (D-054): .git, the holdout record and the holdout sets."""
    return ".git" in n.split("/") or n == "governance/holdouts.md" or under(n, "holdouts")


def parse_now(text):
    try:
        return orch.parse_time(text)
    except ValueError as exc:
        raise g.UsageError("--now: %s" % exc)


def cap(data, total, limit):
    """data (the first bytes of a stream `total` bytes long) cut to at most `limit` bytes, with a marker."""
    if total <= limit and len(data) <= limit:
        return data, False
    marker = ("\n[session_runner: cut at %d of %d bytes]\n" % (limit, total)).encode("ascii")
    keep = max(0, limit - len(marker))
    return data[:keep] + marker, True


# --------------------------------------------------------------------------
# The configuration


def _load_toml(path):
    data = read_regular(path)
    if data is None:
        raise g.UsageError("cannot read %s" % path)
    try:
        return tomllib.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, tomllib.TOMLDecodeError) as exc:
        raise g.UsageError("%s: %s" % (path, exc))


def _str_list(value, where):
    if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
        raise g.UsageError("%s must be a list of strings" % where)
    return list(value)


def _number(value, where):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0:
        raise g.UsageError("%s must be a positive number" % where)
    return value


class Config(object):
    def __init__(self, cdir):
        self.dir = cdir
        for name in CONFIG_FILES:
            if not os.path.isfile(os.path.join(cdir, name)):
                raise g.UsageError("the configuration folder %s has no %s" % (cdir, name))
        packs = _load_toml(os.path.join(cdir, "PACKS.toml"))
        self.packs = packs.get("roles", {})
        self.runner = _load_toml(os.path.join(cdir, "RUNNER.toml"))
        self.briefs = _load_toml(os.path.join(cdir, "BRIEFS.toml"))
        routing = _load_toml(os.path.join(cdir, "ROUTING.toml"))
        self.time_limits = routing.get("time_limits", {})
        text = g.check_text(read_regular(os.path.join(cdir, "SURFACES.md")) or b"", "SURFACES.md")
        self.surfaces = g.parse_surfaces(text)
        r = self.runner
        if not isinstance(r.get("version"), str) or not r["version"]:
            raise g.UsageError("RUNNER.toml: `version` must be a string")
        self.version = r["version"]
        self.session_commands = "on" if r.get("session_commands") == "on" else "off"   # AC6
        self.command_tools = _str_list(r.get("command_tools"), "RUNNER.toml command_tools")
        if not isinstance(r.get("max_turns"), int) or isinstance(r.get("max_turns"), bool) or r["max_turns"] < 1:
            raise g.UsageError("RUNNER.toml: `max_turns` must be a positive whole number")
        self.max_turns = r["max_turns"]
        self.usage_limit_patterns = _str_list(r.get("usage_limit_patterns"), "RUNNER.toml usage_limit_patterns")
        self.pass_env = _str_list(r.get("pass_env"), "RUNNER.toml pass_env")
        self.pass_env_cleared = r.get("pass_env_cleared") is True     # any other value counts as false
        self.credential_files = _str_list(r.get("credential_files"), "RUNNER.toml credential_files")
        limits = r.get("limits", {})
        self.limits = {}
        for k in LIMIT_KEYS:
            if k == "check_run_minutes":
                self.limits[k] = _number(limits.get(k), "RUNNER.toml [limits] %s" % k)
            else:
                v = limits.get(k)
                if not isinstance(v, int) or isinstance(v, bool) or v < 1:
                    raise g.UsageError("RUNNER.toml [limits] %s must be a positive whole number" % k)
                self.limits[k] = v
        if not isinstance(r.get("tools"), dict):
            raise g.UsageError("RUNNER.toml has no [tools] table")
        # model S-016 AC2: sealed as they are; a missing or non-string value is None (commands then stay off).
        self.proven = {k: r[k] if isinstance(r.get(k), str) else None for k in PROVEN_KEYS}

    def role_tools(self, role, cls):
        tools = _str_list(self.runner["tools"].get(role), "RUNNER.toml [tools] %s" % role)
        if self.session_commands == "on" and (cls == "builder" or role in COMMAND_ROLES_EXTRA):
            tools += [t for t in self.command_tools if t not in tools]
        return tools

    def time_limit(self, role):
        v = self.time_limits.get(role, self.time_limits.get("default", 30))
        return _number(v, "ROUTING.toml [time_limits] %s" % role)

    def lane(self, agent):
        return [[neg, pat] for neg, pat in self.surfaces.blocks.get(agent, [])]

    def role_class(self, agent):
        row = self.surfaces.row(agent)
        if row is None:
            raise g.UsageError("SURFACES.md: %s is not in the roster" % agent)
        return row.cls

    def pack_entry(self, role):
        name = PACK_OF.get(role, role)
        entry = self.packs.get(name)
        if not isinstance(entry, dict):
            raise g.UsageError("PACKS.toml has no [roles.%s]" % name)
        out = {}
        for key in ("must_read", "may_read", "must_not_see", "include_feedback"):
            out[key] = _str_list(entry.get(key, []), "PACKS.toml [roles.%s] %s" % (name, key))
        return out

    def note(self, name, values):
        """A [notes] line of BRIEFS.toml with its {id} placeholders filled (ids only), or None."""
        text = self.briefs.get("notes", {}).get(name) if isinstance(self.briefs.get("notes"), dict) else None
        if not isinstance(text, str):
            return None
        for k, v in values.items():
            text = text.replace("{%s}" % k, v)
        return text

    def brief(self, role, entry, feedback, notes=()):
        common = self.briefs.get("common", {})
        routes = self.briefs.get("routes", {})
        text = routes.get(entry["route"], routes.get("ready-dispatch"))
        for key in ("header", "doer_return", "checker_return"):
            if not isinstance(common.get(key), str):
                raise g.UsageError("BRIEFS.toml [common] has no `%s`" % key)
        if not isinstance(text, str):
            raise g.UsageError("BRIEFS.toml [routes] has no `%s` and no `ready-dispatch`" % entry["route"])

        def fill(t):
            for k, v in (("role", role), ("item", entry["item"]), ("spec", entry["spec"] or "none")):
                t = t.replace("{%s}" % k, v)
            return t

        where = ", ".join(feedback) if feedback else "none"
        ret = common["checker_return"] if role in CHECKERS else common["doer_return"]
        body = fill(text) + "".join("\n\n" + n for n in notes)
        return ("# Brief — %s, %s\n\n%s\n\n%s\n\nFeedback from earlier rounds in this folder: %s.\n\n%s\n"
                % (entry["item"], role, fill(common["header"]), body, where, ret))


# --------------------------------------------------------------------------
# Plan entries and control files


def load_entry(path):
    data = read_regular(path)
    if data is None:
        raise g.UsageError("cannot read the plan entry %s" % path)
    try:
        e = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, ValueError) as exc:
        raise g.UsageError("the plan entry %s is not JSON: %s" % (path, exc))
    if not isinstance(e, dict) or sorted(e) != sorted(ENTRY_KEYS):
        raise g.UsageError("a plan entry holds exactly %s" % ", ".join(ENTRY_KEYS))
    if not id_ok(ITEM_RE, e["item"]):
        raise g.UsageError("plan entry: item %r is not an item id" % (e["item"],))
    if e["spec"] is not None and not id_ok(SPEC_RE, e["spec"]):
        raise g.UsageError("plan entry: spec %r is not a spec id" % (e["spec"],))
    if not id_ok(ROUTE_RE, e["route"]):
        raise g.UsageError("plan entry: route %r" % (e["route"],))
    if e["action"] not in ("dispatch", "run-checks"):
        raise g.UsageError("plan entry: action %r" % (e["action"],))
    if isinstance(e["stage"], bool) or e["stage"] not in orch.STAGES:
        raise g.UsageError("plan entry: stage %r" % (e["stage"],))
    if not isinstance(e["role"], str):
        raise g.UsageError("plan entry: role %r" % (e["role"],))
    if e["gate"] is not None and not isinstance(e["gate"], str):
        raise g.UsageError("plan entry: gate %r" % (e["gate"],))
    return e


def write_control(path, obj):
    if os.path.lexists(path):
        raise g.UsageError("the control file %s already exists" % path)
    data = (json.dumps(obj, indent=1, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")
    write_bytes(path, data)
    return sha_bytes(data)


# --------------------------------------------------------------------------
# Role models (model S-016 AC1)


def model_var(role):
    """The repository variable holding a role's model: MODEL_<ROLE>, upper case, `-` as `_`."""
    return "MODEL_" + MODEL_ROLE.get(role, role).upper().replace("-", "_")


def load_waivers(path):
    """The (checker, doer) pairs decisions/model-waivers.md waives: lines `<checker role> <doer role>: <reason>`
    naming one of D-056's pairs exactly (the checker as its model's role: critic, not critic-triage)."""
    if not path:
        return set()
    data = read_regular(path)
    if data is None:
        raise g.UsageError("cannot read the waivers file %s" % path)
    out = set()
    for line in data.decode("utf-8", "replace").split("\n"):
        m = WAIVER_RE.fullmatch(line.rstrip("\r"))
        if m and m.group(2) in CHECKED_BY.get(m.group(1), ()) and m.group(3).strip():
            out.add((m.group(1), m.group(2)))
    return out


def role_model(role, environ, waivers):
    """(model, waived pairs) for a session role, from the environment; Refused naming the variable when
    it or a doer's is missing or empty, or when a checker shares a doer's model without a waiver."""
    base = MODEL_ROLE.get(role, role)
    var = model_var(base)
    model = environ.get(var, "")
    if not model.strip():
        raise Refused("the repository variable %s is not set (or is empty), so role %s has no model; "
                      "report it as result `error` (model S-016 AC1)" % (var, role))
    if not MODEL_RE.fullmatch(model):
        raise Refused("the repository variable %s is not a model name (^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$); "
                      "refused (model S-013 AC9)" % var)
    used = []
    for doer in CHECKED_BY.get(base, ()):
        dvar = model_var(doer)
        dmodel = environ.get(dvar, "")
        if not dmodel.strip():
            raise Refused("the repository variable %s is not set (or is empty), so %s's model cannot be checked "
                          "against its doer %s's (D-056); refused (model S-016 AC1)" % (dvar, base, doer))
        if not MODEL_RE.fullmatch(dmodel):
            raise Refused("the repository variable %s is not a model name; refused (model S-013 AC9)" % dvar)
        if dmodel == model:
            if (base, doer) not in waivers:
                raise Refused("%s and %s name the same model: a %s must not run on the %s's model (D-056) unless "
                              "decisions/model-waivers.md on the default branch holds `%s %s: <reason>`; refused "
                              "(model S-016 AC1)" % (var, dvar, base, doer, base, doer))
            used.append([base, doer])
    return model, used


def load_control(path, expected, pack=None, what="control file"):
    """The control file, only if its bytes match the hash passed separately (AC2)."""
    if not id_ok(HASH_RE, expected):
        raise g.UsageError("the %s hash must be 64 lower-case hex digits" % what)
    if pack is not None and inside(path, pack):
        raise Refused("the %s %s is inside the pack; control data is never read from the pack" % (what, path))
    data = read_regular(path)
    if data is None:
        raise Refused("cannot read the %s %s" % (what, path))
    if sha_bytes(data) != expected:
        raise Refused("the %s %s does not match its hash; refused" % (what, path))
    obj = json.loads(data.decode("utf-8"))
    if not isinstance(obj, dict) or obj.get("format") != CONTROL_FORMAT:
        raise Refused("the %s %s is not a session-runner control file" % (what, path))
    return obj


# --------------------------------------------------------------------------
# pack


def _fill(patterns, values):
    """Patterns with placeholders filled, normalized; a pattern whose placeholder has no value is dropped."""
    out = []
    for p in patterns:
        names = re.findall(r"\{([^}]*)\}", p)
        for n in names:
            if n not in PLACEHOLDERS:
                raise g.UsageError("PACKS.toml: unknown placeholder {%s} in %r" % (n, p))
        if any(values.get(n) is None for n in names):
            continue
        for n in names:
            p = p.replace("{%s}" % n, values[n])
        out.append(norm(p))
    return out


def _any(patterns, n):
    return any(g.glob_match(p, n) for p in patterns)


def superseded_spec(source, entry):
    """The spec a Definer's session supersedes (model S-013 AC7): the last spec the item's status file
    lists as superseded whose file in the source tree is not yet marked `superseded`; else None."""
    data = read_regular(os.path.join(source, "status", "%s.toml" % entry["item"]))
    try:
        st = tomllib.loads(data.decode("utf-8")) if data is not None else {}
    except (UnicodeDecodeError, tomllib.TOMLDecodeError):
        return None
    old = st.get("superseded") if isinstance(st.get("superseded"), list) else []
    specs = os.path.join(source, "specs")
    names = sorted(os.listdir(specs)) if os.path.isdir(specs) else []
    for sid in reversed(old):
        if not id_ok(SPEC_RE, sid) or sid == entry["spec"]:
            continue
        for n in names:
            if g.is_spec_name(n) and g.spec_id(n) == sid:
                text = read_regular(os.path.join(specs, n))
                status = g.spec_status(text.decode("utf-8", "replace"))[0] if text is not None else None
                if status != "superseded":
                    return sid
    return None


def manifest_problems(roles, ctl):
    """Why a control file's manifest holds paths its role may not read under PACKS.toml's [roles]
    (model S-013 AC5 gate-packs): outside must_read, may_read and include_feedback, inside
    must_not_see, a holdout path or the Chief of Staff's notes. BRIEF.md and the agent file are the
    pack's own. [] when every path is readable."""
    role = ctl.get("role")
    entry = ctl.get("entry") or {}
    name = PACK_OF.get(role, role)
    pe = roles.get(name) if isinstance(roles, dict) else None
    if not isinstance(pe, dict):
        return ["PACKS.toml on the default tip has no [roles.%s]" % name]
    item, spec = entry.get("item"), entry.get("spec")
    values = {"spec": spec, "item": item, "project": None,
              "question": item if isinstance(item, str) and item.startswith("Q-") else None}

    def lst(key):
        v = pe.get(key, [])
        return [x for x in v if isinstance(x, str)] if isinstance(v, list) else []

    reads = _fill(lst("must_read") + lst("may_read"), values)
    feedback = _fill(lst("include_feedback"), values)
    hidden = _fill(lst("must_not_see"), values)
    agent = AGENT_OF.get(role, role)
    reserved = (norm("BRIEF.md"), norm(".claude/agents/%s.md" % agent))
    out = []
    for rel in sorted(ctl.get("manifest") or {}):
        n = norm(rel)
        if n in reserved:
            continue
        if always_out(n):
            out.append("%s is a holdout path" % rel)
        elif under(n, "decisions") and n.endswith("-notes.md"):
            out.append("%s is the Chief of Staff's notes" % rel)
        elif not (_any(reads, n) or _any(feedback, n)) or _any(hidden, n):
            out.append("%s is outside what %s may read under PACKS.toml" % (rel, role))
    return out


def cmd_pack(a):
    now = parse_now(a.now)
    now_s = orch.fmt_time(now)
    entry = load_entry(a.entry)
    source = a.source
    if not os.path.isdir(source):
        raise g.UsageError("--source %s is not a folder" % source)
    cfg = Config(a.config or os.path.join(source, "governance"))
    if inside(a.control, source):
        raise g.UsageError("the control file must be outside the source tree")
    role = entry["role"]
    session = "%s:%s:%s" % (entry["item"], entry["route"], now_s)
    source_tip = a.source_tip
    if source_tip is not None and not id_ok(SOURCE_TIP_RE, source_tip):
        raise g.UsageError("--source-tip %r is not a full commit id" % (source_tip,))

    if entry["action"] == "run-checks" or role == "checks":
        if entry["action"] != "run-checks" or role != "checks":
            raise g.UsageError("a run-checks entry has role `checks`, and only it")
        if a.pack:
            raise g.UsageError("a run-checks entry gets a control file only, no pack folder (AC2)")
        if not a.builder_control or not a.builder_hash:
            raise g.UsageError("a run-checks entry needs --builder-control and --builder-hash")
        b = load_control(a.builder_control, a.builder_hash, what="builder's control file")
        if b.get("class") != "builder" or b["entry"]["item"] != entry["item"]:
            raise Refused("the builder's control file is not a builder-class session of item %s" % entry["item"])
        control = {"format": CONTROL_FORMAT, "entry": entry, "dispatched_at": now_s, "session": session,
                   "role": "checks", "builder_control_hash": a.builder_hash, "limits": dict(cfg.limits),
                   "credential_files": cfg.credential_files, "source_tip": source_tip}
        print(write_control(a.control, control))
        return 0

    if role not in SESSION_ROLES:
        raise Refused("unknown role %r in the plan entry for %s; report it as result `error`" % (role, entry["item"]))
    if not a.pack:
        raise g.UsageError("a session entry needs --pack")
    if inside(a.pack, source) or inside(source, a.pack):
        raise g.UsageError("the pack folder and the source tree must not hold each other")
    if inside(a.control, a.pack):
        raise g.UsageError("the control file must be outside the pack folder (AC2)")
    request_month = None
    if role == "critic-triage":
        if not id_ok(MONTH_RE, a.request_month):
            raise g.UsageError("a critic-triage entry needs --request-month YYYY-MM (the month of the item's request)")
        request_month = a.request_month
        if request_month > now.strftime("%Y-%m"):
            raise g.UsageError("--request-month is after --now")
    if a.confirm and role != "critic":
        raise g.UsageError("--confirm is for a critic's confirmation dispatch")
    model, waived = role_model(role, os.environ, load_waivers(a.waivers))   # before anything is written (AC1)
    agent = AGENT_OF.get(role, role)
    cls = cfg.role_class(agent)
    lim = cfg.limits

    spec = entry["spec"]
    item = entry["item"]
    values = {"spec": spec, "item": item, "question": item if item.startswith("Q-") else None, "project": None}
    pe = cfg.pack_entry(role)
    reads = _fill(pe["must_read"] + pe["may_read"], values)
    feedback_p = _fill(pe["include_feedback"], values)
    hidden = _fill(pe["must_not_see"], values)
    agent_rel = ".claude/agents/%s.md" % agent
    agent_bytes = read_regular(os.path.join(source, ".claude", "agents", agent + ".md"))
    if agent_bytes is None:
        raise g.UsageError("the source tree has no agent file %s" % agent_rel)

    pack = fresh_dir(a.pack, "--pack")
    manifest = {}
    feedback = []
    source_paths = []
    reserved = (norm("BRIEF.md"), norm(agent_rel))
    now_month = now.strftime("%Y-%m")
    for rel, st, kind in walk(source, prune_git=True):
        if not is_utf8(rel):
            continue
        n = norm(rel)
        copied = False
        if kind == "file" and not hard_linked(st) and not always_out(n) and st.st_size <= lim["file_bytes"] \
                and n not in reserved:
            is_read, is_fb = _any(reads, n), _any(feedback_p, n)
            keep = (is_read or is_fb) and not _any(hidden, n)
            if keep and under(n, "decisions") and n.endswith("-notes.md"):
                keep = False            # the Chief of Staff's notes, never (AC5), by name
            if keep and role == "critic-triage" and under(n, "dispatch-log"):
                m = MONTH_FILE_RE.fullmatch(n.rsplit("/", 1)[-1])
                keep = bool(m) and n.count("/") == 1 and request_month <= m.group(1) <= now_month
            if keep:
                data = read_regular(os.path.join(source, rel), lim["file_bytes"], single=True)
                if data is not None:
                    write_bytes(os.path.join(pack, rel), data)
                    manifest[rel] = sha_bytes(data)
                    copied = True
                    if is_fb and not is_read:
                        feedback.append(rel)
        if not copied and kind != "dir":
            source_paths.append(n)
    write_bytes(os.path.join(pack, agent_rel), agent_bytes)
    manifest[agent_rel] = sha_bytes(agent_bytes)
    supersede = superseded_spec(source, entry) if role == "definer" and entry["stage"] == 3 else None
    notes = []
    if supersede:
        note = cfg.note("supersede", {"superseded": supersede})
        if note is None:
            raise g.UsageError("BRIEFS.toml has no [notes] supersede line (model S-013 AC7)")
        notes.append(note)
    brief = cfg.brief(role, entry, sorted(feedback), notes)
    brief_bytes = brief.encode("utf-8")
    write_bytes(os.path.join(pack, "BRIEF.md"), brief_bytes)
    manifest["BRIEF.md"] = sha_bytes(brief_bytes)

    limits = dict(lim)
    limits["session_minutes"] = cfg.time_limit(role)
    control = {
        "format": CONTROL_FORMAT, "entry": entry, "dispatched_at": now_s, "session": session,
        "role": role, "agent": agent, "class": cls, "confirm": bool(a.confirm), "request_month": request_month,
        "lane": cfg.lane(agent), "check_author_lane": cfg.lane(CHECK_AUTHOR), "limits": limits,
        "cli_version": cfg.version, "model": model, "model_waivers": waived, "max_turns": cfg.max_turns,
        "tools": cfg.role_tools(role, cls), "command_tools": cfg.command_tools,
        "session_commands": cfg.session_commands, "usage_limit_patterns": cfg.usage_limit_patterns,
        "pass_env": cfg.pass_env, "pass_env_cleared": cfg.pass_env_cleared, "brief": brief, "manifest": manifest,
        "source_paths": sorted(set(source_paths)), "source_tip": source_tip, "supersede": supersede,
    }
    control.update(cfg.proven)
    print(write_control(a.control, control))
    return 0


# --------------------------------------------------------------------------
# Running a program: an allowlisted environment, a process group, a time limit, capped output


class _Reader(threading.Thread):
    def __init__(self, stream, keep):
        threading.Thread.__init__(self, daemon=True)
        self.stream, self.keep = stream, keep
        self.buf, self.total = bytearray(), 0

    def run(self):
        while True:
            b = self.stream.read1(65536)      # what is there now, so a held-open pipe loses nothing
            if not b:
                break
            self.total += len(b)
            room = self.keep - len(self.buf)
            if room > 0:
                self.buf += b[:room]


def _killpg(proc):
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


def run_program(argv, cwd, env, seconds, keep, merge_stderr=False):
    """Run argv in its own process group; kill the whole group at the limit. Returns
    (exit code or None, timed out, (stdout bytes, total), (stderr bytes, total))."""
    proc = subprocess.Popen(argv, cwd=cwd, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT if merge_stderr else subprocess.PIPE,
                            start_new_session=True)
    readers = [_Reader(proc.stdout, keep)]
    if not merge_stderr:
        readers.append(_Reader(proc.stderr, keep))
    for r in readers:
        r.start()
    timed_out = False
    try:
        rc = proc.wait(timeout=seconds)
    except subprocess.TimeoutExpired:
        timed_out = True
        _killpg(proc)
        proc.wait()
        rc = None
    _killpg(proc)          # whatever the session left behind in its group goes too
    # A child that left the group (setsid) may still hold the pipes: wait for them only a short
    # grace in all, then go on with what was read (finding 12). The readers are daemon threads.
    deadline = time.monotonic() + KILL_GRACE_SECONDS
    for r in readers:
        r.join(max(0.0, deadline - time.monotonic()))
    out = (bytes(readers[0].buf), readers[0].total)
    err = (bytes(readers[1].buf), readers[1].total) if not merge_stderr else (b"", 0)
    return rc, timed_out, out, err


# --------------------------------------------------------------------------
# run


def verify_pack(pack, manifest):
    """The pack holds exactly the manifest's files, unchanged, before a session runs."""
    seen = set()
    for rel, st, kind in walk(pack):
        if kind == "dir":
            continue
        if kind != "file" or rel not in manifest:
            raise Refused("the pack holds %s, which is not in the control file's manifest" % show(rel))
        data = read_regular(os.path.join(pack, rel))
        if data is None or sha_bytes(data) != manifest[rel]:
            raise Refused("the pack's %s does not match the control file's manifest" % show(rel))
        seen.add(rel)
    missing = sorted(set(manifest) - seen)
    if missing:
        raise Refused("the pack lacks %s from the control file's manifest" % show(missing[0]))


def session_env(ctl, home, tmp):
    """Only what AC7 names: the token, PATH, HOME, TMPDIR, LANG, pass_env and the scrub switch.
    pass_env goes to the session while session_commands is off; while on, only if the control file
    says pass_env_cleared (AC6: a live proof showed those variables carry no credential)."""
    env = {"PATH": os.environ.get("PATH", os.defpath), "HOME": home, "TMPDIR": tmp,
           "LANG": os.environ.get("LANG", "C.UTF-8")}
    tok = os.environ.get("CLAUDE_CODE_OAUTH_TOKEN")
    if tok:
        env["CLAUDE_CODE_OAUTH_TOKEN"] = tok
    pass_env = ctl["pass_env"] if ctl["session_commands"] != "on" or ctl.get("pass_env_cleared") is True else []
    for name in pass_env:
        if name in os.environ and name not in env:
            env[name] = os.environ[name]
    if ctl["session_commands"] == "on":
        env["CLAUDE_CODE_SUBPROCESS_ENV_SCRUB"] = "1"
    return env


def proven(ctl, environ):
    """Whether commands may really be on (model S-016 AC2): the pinned version is proven_version, the
    runner's ImageOS is proven_image_os, and its ImageVersion starts with proven_image_version (at least
    six characters, digits and dots only). Any missing, empty or malformed value on either side: no."""
    values = [ctl.get(k) for k in PROVEN_KEYS] + [ctl.get("cli_version"), environ.get("ImageOS"),
                                                  environ.get("ImageVersion")]
    if not all(isinstance(v, str) and v for v in values):
        return False
    pv, pos, piv, version, image_os, image_version = values
    if not PROVEN_IMAGE_VERSION_RE.fullmatch(piv) or not IMAGE_VERSION_RE.fullmatch(image_version):
        return False
    if not PROVEN_IMAGE_OS_RE.fullmatch(pos):
        return False
    return version == pv and image_os == pos and image_version.startswith(piv)


def commands_off(ctl):
    """The control data a session runs with when commands are forced off: as "off" would run it."""
    cmd = set(ctl["command_tools"])
    return dict(ctl, session_commands="off", tools=[t for t in ctl["tools"] if t not in cmd])


def session_argv(claude, ctl):
    tools = ",".join(ctl["tools"])
    argv = [claude, "-p", ctl["brief"], "--agent", ctl["agent"], "--model", ctl["model"],
            "--max-turns", str(ctl["max_turns"]), "--tools", tools, "--allowedTools", tools]
    if ctl["session_commands"] != "on":
        argv += ["--disallowedTools", ",".join(ctl["command_tools"])]
    return argv


def _redact(data, token):
    return data.replace(token, b"[token removed]") if token else data


def cmd_run(a):
    ctl = load_control(a.control, a.hash, pack=a.pack)
    if ctl.get("role") == "checks" or "manifest" not in ctl:
        raise Refused("a check run's control file has no session to run")
    if not os.path.isdir(a.pack):
        raise g.UsageError("--pack %s is not a folder" % a.pack)
    verify_pack(a.pack, ctl["manifest"])
    if inside(a.out, a.pack):
        raise g.UsageError("--out must be outside the pack (AC7)")
    base = os.path.abspath(a.pack).rstrip(os.sep)
    home, tmp = base + ".home", base + ".tmp"
    for d in (home, tmp):
        if os.path.lexists(d):
            raise g.UsageError("%s already exists; HOME and TMPDIR are fresh folders" % d)
    out = fresh_dir(a.out, "--out")
    os.makedirs(home)
    os.makedirs(tmp)
    unproven = ctl["session_commands"] == "on" and not proven(ctl, os.environ)
    if unproven:
        ctl = commands_off(ctl)
    env = session_env(ctl, home, tmp)
    lim = ctl["limits"]
    token = os.environ.get("CLAUDE_CODE_OAUTH_TOKEN", "").encode("utf-8")
    keep = lim["record_bytes"] + len(token)
    result = {"control": a.hash, "session": ctl["session"]}
    answer, errout = (b"", 0), (b"", 0)
    try:
        vrc, _, vout, _ = run_program([a.claude, "--version"], a.pack, env, 60, 4096)
        version_ok = vrc == 0 and ctl["cli_version"] in vout[0].decode("utf-8", "replace").split()
    except OSError as exc:
        version_ok, vout = False, (str(exc).encode("utf-8"), 0)
    if not version_ok:
        result.update(result="error", exit=None, timed_out=False,
                      reason="the command line is not version %s" % ctl["cli_version"])
        errout = (vout[0][:4096], len(vout[0][:4096]))
    else:
        rc, timed_out, answer, errout = run_program(session_argv(a.claude, ctl), a.pack, env,
                                                    lim["session_minutes"] * 60, keep)
        err_text = errout[0].decode("utf-8", "replace").casefold()
        if timed_out:
            res = "timeout"
        elif rc == 0:
            res = "ok"
        elif any(p.casefold() in err_text for p in ctl["usage_limit_patterns"]):
            res = "usage-limit"
        else:
            res = "error"
        result.update(result=res, exit=rc, timed_out=timed_out)
    ans, ans_cut = cap(_redact(answer[0], token), answer[1], lim["record_bytes"])
    lead = (UNPROVEN_LINE + "\n").encode("ascii") if unproven else b""
    err, err_cut = cap(lead + _redact(errout[0], token), len(lead) + errout[1], lim["record_bytes"])
    result.update(answer_bytes=answer[1], answer_cut=ans_cut, stderr_bytes=errout[1], stderr_cut=err_cut)
    if unproven:
        result["commands"] = "off-unproven"
    write_bytes(os.path.join(out, "answer.md"), ans)
    write_bytes(os.path.join(out, "stderr.txt"), err)
    write_json(os.path.join(out, "result.json"), result)
    print("OK: session %s: %s" % (ctl["session"], result["result"]))
    return 0


# --------------------------------------------------------------------------
# collect


def rules_of(lane):
    return [(bool(neg), norm(p)) for neg, p in lane]


def path_problem(rel, ctl):
    """Why a changed path is unsafe or outside the role's lane (AC8), or None."""
    if not is_utf8(rel):
        return "the name is not UTF-8"
    lim = ctl["limits"]
    if rel.startswith("/") or os.path.isabs(rel):
        return "an absolute path"
    parts = rel.split("/")
    if any(p in ("", ".", "..") for p in parts):
        return "a path through `..`"
    if any(ord(c) < 32 or 0x7f <= ord(c) < 0xa0 for c in rel):
        return "a control character in the path"
    if any(p.endswith((".", " ")) for p in parts):
        return "a name ending in a dot or a space"
    if any(len(p.encode("utf-8")) > lim["path_part_bytes"] for p in parts):
        return "a name over %d bytes" % lim["path_part_bytes"]
    if len(rel.encode("utf-8")) > lim["path_bytes"]:
        return "a path over %d bytes" % lim["path_bytes"]
    n = norm(rel)
    nparts = n.split("/")
    if ".git" in nparts:
        return "under .git"
    if nparts[0] in DANGEROUS_TOP:
        return "under %s" % nparts[0]
    if ctl["role"] != CHECK_AUTHOR and g.surface_includes(rules_of(ctl["check_author_lane"]), n):
        return "inside the check author's lane"
    if not g.surface_includes(rules_of(ctl["lane"]), n):
        return "outside the %s lane" % ctl["agent"]
    return None


class Collisions(object):
    """Paths already taken in one change set, compared as in AC3 (NFC, case folded): the later of
    two paths that collide, as the same file or as a file and a folder, is refused (finding 8)."""

    def __init__(self):
        self.files, self.dirs = {}, {}

    def problem(self, rel):
        n = norm(rel)
        if n in self.files:
            return "differs only in case or Unicode form from %s in the change set" % show(self.files[n])
        if n in self.dirs:
            return ("differs only in case or Unicode form from the folder %s in the change set"
                    % show(self.dirs[n]))
        for d in parents(n):
            if d in self.files:
                return ("a folder that differs only in case or Unicode form from the file %s in the change set"
                        % show(self.files[d]))
        return None

    def take(self, rel):
        n = norm(rel)
        self.files[n] = rel
        parts = rel.split("/")
        for i, d in enumerate(parents(n), 1):
            self.dirs.setdefault(d, "/".join(parts[:i]))


def collect_changes(pack, ctl):
    """(kept, discarded): kept = [(rel, op, data or None, mode)], discarded = [(rel, reason)]."""
    manifest = ctl["manifest"]
    lim = ctl["limits"]
    manifest_n = {}
    for p in manifest:
        manifest_n[norm(p)] = p
    source_n = set(ctl["source_paths"])
    source_dirs = set(d for p in source_n for d in parents(p))
    manifest_dirs = set(d for p in manifest_n for d in parents(p))
    files_n = source_n | set(manifest_n)
    discarded, cands, present = [], [], set()
    for rel, st, kind in walk(pack):
        if kind == "dir":
            continue
        if kind == "link":
            discarded.append((rel, "a link"))
            continue
        if kind == "other":
            discarded.append((rel, "not a regular file"))
            continue
        present.add(rel)
        if rel in manifest and st.st_size <= lim["file_bytes"]:
            data = read_regular(os.path.join(pack, rel))
            if data is not None and sha_bytes(data) == manifest[rel]:
                continue                                    # unchanged
        op = "change" if rel in manifest else "add"
        if st.st_nlink > 1:
            discarded.append((rel, "a hard link"))
            continue
        if st.st_mode & (stat.S_ISUID | stat.S_ISGID):
            discarded.append((rel, "a set-uid or set-gid file"))
            continue
        if st.st_size > lim["file_bytes"]:
            discarded.append((rel, "over the per-file limit (%d bytes)" % lim["file_bytes"]))
            continue
        cands.append((rel, op, st))
    for rel in manifest:
        if rel not in present:
            cands.append((rel, "delete", None))
    kept = []
    taken = Collisions()
    for rel, op, st in sorted(cands, key=lambda c: c[0]):
        why = path_problem(rel, ctl)
        n = norm(rel) if why is None else None
        if why is None and op == "add":
            if n in manifest_n:
                why = "differs only in case or Unicode form from %s in the pack" % show(manifest_n[n])
            elif n in source_n:
                why = "already exists in the source tree but was not in the pack"
            elif n in source_dirs or n in manifest_dirs:
                why = "a file that replaces a folder"
            elif any(d in files_n for d in parents(n)):
                why = "a folder that replaces a file"
        if why is None and op != "delete":
            why = taken.problem(rel)
        if why is None and op != "delete":
            data = read_regular(os.path.join(pack, rel), lim["file_bytes"])
            if data is None:
                why = "not a regular file"
            else:
                mode = 0o755 if st.st_mode & 0o111 else 0o644
                kept.append((rel, op, data, mode))
                taken.take(rel)
                continue
        if why is None:
            kept.append((rel, op, None, None))
            continue
        discarded.append((rel, why))
    total = sum(len(k[2]) for k in kept if k[2] is not None)
    if kept and (total > lim["change_set_bytes"] or len(kept) > lim["change_set_files"]):
        reason = ("the change set (%d files, %d bytes) is over the limit (%d files, %d bytes); rejected whole"
                  % (len(kept), total, lim["change_set_files"], lim["change_set_bytes"]))
        discarded += [(k[0], reason) for k in kept]
        kept = []
    return kept, sorted(discarded, key=lambda d: d[0])


def discard_lines(discarded):
    return "".join("%s: %s\n" % (show(p), why) for p, why in discarded)


def cmd_collect(a):
    ctl = load_control(a.control, a.hash, pack=a.pack)
    if ctl.get("role") == "checks" or "manifest" not in ctl:
        raise Refused("a check run's control file has no pack to collect")
    if not os.path.isdir(a.pack):
        raise g.UsageError("--pack %s is not a folder" % a.pack)
    if inside(a.out, a.pack):
        raise g.UsageError("--out must be outside the pack")
    out = fresh_dir(a.out, "--out")
    doc = {"control": a.hash, "session": ctl["session"], "role": ctl["role"], "changes": [], "discarded": []}
    if ctl["class"] != "builder":
        doc["note"] = "a read-only role: no change set (AC8)"
        kept, discarded = [], []
    else:
        kept, discarded = collect_changes(a.pack, ctl)
    for rel, op, data, mode in kept:
        rec = {"path": rel, "op": op}
        if data is not None:
            write_bytes(os.path.join(out, "files", rel), data, mode)
            rec.update(sha256=sha_bytes(data), mode="%04o" % mode, bytes=len(data))
        doc["changes"].append(rec)
    doc["discarded"] = [{"path": p, "reason": why} for p, why in discarded]
    write_json(os.path.join(out, "changes.json"), doc)
    write_bytes(os.path.join(out, "discarded.txt"), discard_lines(discarded).encode("utf-8"))
    print("OK: %d change(s) kept, %d discarded" % (len(kept), len(discarded)))
    return 0


# --------------------------------------------------------------------------
# checks


def load_changes(cdir, expected_control):
    data = read_regular(os.path.join(cdir, "changes.json"))
    if data is None:
        raise Refused("cannot read %s/changes.json" % cdir)
    doc = json.loads(data.decode("utf-8"))
    if not isinstance(doc, dict) or doc.get("control") != expected_control:
        raise Refused("the change set was not collected under the builder's control file")
    return doc


def credential(n, patterns):
    base = n.rsplit("/", 1)[-1]
    for p in patterns:
        q = norm(p)
        if g.glob_match(q, n) or ("/" not in q and g.glob_match(q, base)):
            return True
    return False


def source_file(source, rel, creds):
    """The source tree's bytes for rel, or None when it has no regular file there (or it is excluded)."""
    n = norm(rel)
    if always_out(n) or credential(n, creds):
        return None
    return read_regular(os.path.join(source, rel), single=True)


def safe_target(tree, rel):
    """tree/rel, when every folder on the way is a real folder inside the tree (or absent)."""
    cur = tree
    for part in rel.split("/")[:-1]:
        cur = os.path.join(cur, part)
        if os.path.lexists(cur) and (os.path.islink(cur) or not os.path.isdir(cur)):
            return None
    return os.path.join(tree, rel)


def _remove(path):
    if os.path.isdir(path) and not os.path.islink(path):
        shutil.rmtree(path)
    elif os.path.lexists(path):
        os.unlink(path)


def fresh_repository(tree, work, tmp, when, seconds):
    """Give the cleaned tree a new git repository holding one commit of it (L-0088), so the
    project's checks that list tracked files can run; it has no history, no remote and no hooks,
    and reads no git configuration from the environment. Returns None, or why it failed."""
    template = os.path.join(work, "git-template")        # an empty template: no sample hooks
    os.makedirs(template)
    name, email = GIT_IDENTITY
    env = {"PATH": os.environ.get("PATH", os.defpath), "HOME": work, "TMPDIR": tmp, "LANG": "C",
           "GIT_CONFIG_NOSYSTEM": "1", "GIT_AUTHOR_NAME": name, "GIT_AUTHOR_EMAIL": email,
           "GIT_COMMITTER_NAME": name, "GIT_COMMITTER_EMAIL": email,
           "GIT_AUTHOR_DATE": when, "GIT_COMMITTER_DATE": when}
    opts = ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "-c", "init.defaultBranch=main",
            "-c", "user.name=%s" % name, "-c", "user.email=%s" % email]
    for argv in (["init", "-q", "--template=%s" % template, "."],
                 ["add", "--all", "--force", "."],
                 ["commit", "-q", "--no-verify", "--allow-empty", "-m", "The check tree (model S-014 AC9, L-0088)"]):
        try:
            rc, timed_out, (text, _), _ = run_program(["git"] + opts + argv, tree, env, seconds, 4096,
                                                      merge_stderr=True)
        except OSError as exc:
            return "git %s could not start: %s" % (argv[0], exc)
        if rc != 0 or timed_out:
            return "git %s failed (%s): %s" % (argv[0], "timed out" if timed_out else "exit %s" % rc,
                                               text.decode("utf-8", "replace").strip())
    return None


def sandbox_argv(bwrap, tree, home, tmp, command):
    """The check run's bwrap (model S-016 AC3): the whole file system read-only (submounts too); a fresh
    /dev and /proc; /run a new empty tmpfs (the Docker socket and every other socket there hidden;
    /var/run links into it); the fresh temp folder also at /tmp; the check tree, HOME and TMPDIR the
    only writable binds; every namespace unshared (so no network) with the caller's uid and gid; the
    process dies with its parent, in a new session, with no capabilities."""
    return [bwrap, "--ro-bind", "/", "/", "--dev", "/dev", "--proc", "/proc", "--tmpfs", "/run",
            "--bind", tmp, "/tmp", "--bind", tree, tree, "--bind", home, home, "--bind", tmp, tmp,
            "--unshare-all", "--uid", str(os.getuid()), "--gid", str(os.getgid()),
            "--die-with-parent", "--new-session", "--cap-drop", "ALL", "--chdir", tree, "--"] + list(command)


def cmd_checks(a):
    # Every folder argument absolute: the tree, HOME and TMPDIR are used from another folder (finding 3).
    for k in ("source", "changes", "control", "builder_control", "work", "out"):
        setattr(a, k, os.path.abspath(getattr(a, k)))
    if a.sandbox is not None and a.sandbox not in SANDBOXES:
        raise g.UsageError("--sandbox must be one of: %s" % ", ".join(SANDBOXES))
    ctl = load_control(a.control, a.hash)
    bctl = load_control(a.builder_control, a.builder_hash, what="builder's control file")
    if ctl.get("role") != "checks":
        raise Refused("the check run's control file is not a check run's (role %r)" % (ctl.get("role"),))
    if ctl.get("builder_control_hash") != a.builder_hash:
        raise Refused("the check run's control file names another builder control file")
    changes = load_changes(a.changes, a.builder_hash)
    source = a.source
    if not os.path.isdir(source):
        raise g.UsageError("--source %s is not a folder" % source)
    if inside(a.work, source) or inside(a.out, a.work) or inside(a.out, source):
        raise g.UsageError("--work and --out must be outside the source tree, and --out outside --work")
    work = fresh_dir(a.work, "--work")
    out = fresh_dir(a.out, "--out")
    tree, home, tmp = (os.path.join(work, d) for d in ("tree", "home", "tmp"))
    for d in (tree, home, tmp):
        os.makedirs(d)
    creds = ctl["credential_files"]
    lim = ctl["limits"]
    log = []

    # 1. The source tree without .git, holdouts, credential files or links (AC9).
    for rel, st, kind in walk(source, prune_git=True):
        n = norm(rel)
        if kind == "dir" or always_out(n):
            continue
        if credential(n, creds):
            continue
        if kind != "file" or hard_linked(st):
            why = "a link" if kind == "link" else "a hard link" if kind == "file" else "not a regular file"
            log.append("not copied (%s): %s" % (why, show(rel)))
            continue
        data = read_regular(os.path.join(source, rel), single=True)
        if data is not None:
            write_bytes(os.path.join(tree, rel), data, 0o755 if st.st_mode & 0o111 else 0o644)

    # 2. The change set, each path judged again against the builder's control file.
    applied = []
    taken = Collisions()
    for rec in changes.get("changes", []):
        rel, op = rec.get("path"), rec.get("op")
        why = path_problem(rel, bctl) if isinstance(rel, str) else "not a path"
        if why is None and op in ("add", "change"):
            why = taken.problem(rel)
        target = safe_target(tree, rel) if why is None else None
        if why is None and target is None:
            why = "a folder on the way is not a folder"
        if why is None and op in ("add", "change"):
            data = read_regular(os.path.join(a.changes, "files", rel), lim["file_bytes"])
            if data is None or sha_bytes(data) != rec.get("sha256"):
                why = "its file does not match the change set"
            elif os.path.isdir(target) and not os.path.islink(target):
                why = "a folder is in the way"
            else:
                write_bytes(target, data, 0o755 if rec.get("mode") == "0755" else 0o644)
        elif why is None and op == "delete":
            if os.path.lexists(target) and not os.path.isdir(target):
                os.unlink(target)
        elif why is None:
            why = "unknown operation %r" % (op,)
        if why is not None:
            log.append("change not applied (%s): %s" % (why, show(rel) if isinstance(rel, str) else rel))
            continue
        if op in ("add", "change"):
            taken.take(rel)
        applied.append(rel)

    # 3. The check paths exactly as in the source.
    src_checks = {}
    for rel, st, kind in walk(source, prune_git=True):
        n = norm(rel)
        if kind == "file" and not hard_linked(st) and any(under(n, p) for p in CHECK_PATHS) \
                and not always_out(n) and not credential(n, creds):
            src_checks[rel] = (os.path.join(source, rel), st.st_mode)
    for rel, st, kind in list(walk(tree)):
        n = norm(rel)
        if kind == "dir" or not any(under(n, p) for p in CHECK_PATHS):
            continue
        if rel not in src_checks:
            _remove(os.path.join(tree, rel))
            log.append("removed (added under a check path): %s" % show(rel))
    for rel, (path, mode) in sorted(src_checks.items()):
        want = read_regular(path, single=True)
        if want is None:
            continue
        target = os.path.join(tree, rel)
        have = read_regular(target) if os.path.lexists(target) else None
        if have != want:
            for d in [tree] + [os.path.join(tree, *rel.split("/")[:i]) for i in range(1, rel.count("/") + 1)]:
                if os.path.lexists(d) and (os.path.islink(d) or not os.path.isdir(d)):
                    _remove(d)
            if os.path.isdir(target) and not os.path.islink(target):
                shutil.rmtree(target)
            write_bytes(target, want, 0o755 if mode & 0o111 else 0o644)
            log.append("restored to the source's version (a check path): %s" % show(rel))

    # 4. Test-hook files the builder added, changed or deleted.
    for rel in applied:
        if not is_hook_file(norm(rel)):
            continue
        target = os.path.join(tree, rel)
        want = source_file(source, rel, creds)
        if want is not None:
            if read_regular(target) != want:
                write_bytes(target, want)
                log.append("restored to the source's version (a test-hook file the builder changed): %s" % show(rel))
        elif os.path.lexists(target):
            _remove(target)
            log.append("removed (a test-hook file the builder added): %s" % show(rel))

    # 5. A fresh one-commit repository of the prepared tree (L-0088), then the project's checks,
    #    with no secrets.
    git_problem = fresh_repository(tree, work, tmp, ctl["dispatched_at"], 300)
    head_git = ("== Made a fresh one-commit repository of the check tree (no history, no remote; L-0088)"
                if git_problem is None else "== Could not make the check tree's repository: %s" % git_problem)
    env = {"PATH": os.environ.get("PATH", os.defpath), "HOME": home, "TMPDIR": tmp,
           "LANG": os.environ.get("LANG", "C.UTF-8")}
    script = os.path.join(tree, "governance", "checks", "check_all.sh")
    head = ["== Check run %s (model S-014 AC9)" % ctl["session"],
            "== Prepared the check tree (%d change(s) applied)" % len(applied)] + log + [head_git]
    result = {"control": a.hash, "session": ctl["session"]}
    command = ["bash", "governance/checks/check_all.sh", "."]
    sandbox_problem = None
    if a.sandbox == "bwrap" and git_problem is None and read_regular(script) is not None:
        # model S-016 AC3: never an unsandboxed run; a start failure is never taken for a failing check.
        bwrap = shutil.which("bwrap", path=env["PATH"])
        if bwrap is None:
            sandbox_problem = SANDBOX_MISSING
            head.append("== bwrap is not on PATH; the checks did not run")
        else:
            try:
                prc, pto, (ptext, _), _ = run_program(sandbox_argv(bwrap, tree, home, tmp, ["true"]), tree, env,
                                                      SANDBOX_PREFLIGHT_SECONDS, 4096, merge_stderr=True)
            except OSError as exc:
                prc, pto, ptext = None, False, str(exc).encode("utf-8")
            if prc != 0 or pto:
                sandbox_problem = SANDBOX_NOT_STARTED
                head.append("== The sandbox did not start (bwrap preflight: %s): %s"
                            % ("timed out" if pto else "exit %s" % prc, ptext.decode("utf-8", "replace").strip()))
            else:
                head.append("== The check run's sandbox started (bwrap preflight; model S-016 AC3)")
                command = sandbox_argv(bwrap, tree, home, tmp, command)
    if git_problem is not None:
        body, footer = b"", "== the checks did not run\nverdict: FAIL"
        result.update(result="error", verdict="FAIL", exit=None, timed_out=False)
    elif read_regular(script) is None:
        body, footer = b"", "== governance/checks/check_all.sh is missing; nothing ran"
        result.update(result="error", verdict="FAIL", exit=None, timed_out=False)
    elif sandbox_problem is not None:
        body, footer = b"", "== the checks did not run\nverdict: FAIL"
        result.update(result="error", verdict="FAIL", exit=None, timed_out=False, reason=sandbox_problem)
    else:
        rc, timed_out, (body, total), _ = run_program(command, tree, env, lim["check_run_minutes"] * 60,
                                                        lim["record_bytes"], merge_stderr=True)
        verdict = "PASS" if rc == 0 and not timed_out else "FAIL"
        footer = ("== Timed out after %s minute(s); the process group was killed" % lim["check_run_minutes"]
                  if timed_out else "== Exit %d" % rc)
        footer += "\nverdict: %s" % verdict
        result.update(result="ok", verdict=verdict, exit=rc, timed_out=timed_out)
        result["output_bytes"] = total
    head_b = ("\n".join(head) + "\n== governance/checks/check_all.sh output\n").encode("utf-8")
    foot_b = ("\n" + footer + "\n").encode("utf-8")
    room = max(0, lim["record_bytes"] - len(head_b) - len(foot_b))
    body_c, _ = cap(body, result.get("output_bytes", len(body)), room)
    text = head_b + body_c + foot_b
    text, _ = cap(text, len(text), lim["record_bytes"])
    write_bytes(os.path.join(out, "checks.log"), text)
    write_json(os.path.join(out, "result.json"), result)
    print("OK: check run %s: %s" % (ctl["session"], result["verdict"]))
    return 0


# --------------------------------------------------------------------------
# record


def record_path(ctl):
    """The record's path under the destination, from the control file's validated ids (AC10)."""
    e = ctl["entry"]
    item, spec, stage, role = e["item"], e["spec"], e["stage"], ctl["role"]
    if not id_ok(ITEM_RE, item):
        raise Refused("the control file's item %r is not an id" % (item,))
    if spec is not None and not id_ok(SPEC_RE, spec):
        raise Refused("the control file's spec %r is not an id" % (spec,))

    def need_spec():
        if spec is None:
            raise Refused("a %s record at stage %s needs a spec" % (role, stage))
        return spec

    if role == "checks":
        return "reviews/%s/checks.txt" % need_spec()
    if role == "critic":
        if ctl.get("confirm"):
            return "reviews/%s/_critic-confirm.md" % (spec if stage in (3, 4) and spec else item)
        if stage == 2:
            return "reviews/%s/_critic-dor.md" % item
        if stage == 3:
            return "reviews/%s/plan.md" % need_spec()
        if stage == 4:
            return "reviews/%s/_critic-checks.md" % need_spec()
        if stage == 8:
            return "reviews/%s/_critic-evidence.md" % item
        raise Refused("no critic record at stage %s" % stage)
    if role == "critic-triage":
        return "triage/%s.md" % item
    if role == "reviewer":
        return "reviews/%s/reviewer.md" % need_spec()
    if role == "researcher":
        return "research/%s-memo.md" % item
    if role == "source-checker":
        return "research/%s-source-check.md" % item
    if role in ("definer", "definer-freeze", "check-author", "builder"):
        return "docs/reports/%s-%s.md" % (item, role)
    raise Refused("unknown role %r" % (role,))


def write_record(dest, rel, data):
    """Write under dest only: every folder on the way must be a real folder (never a link)."""
    parts = rel.split("/")
    cur = dest
    for part in parts[:-1]:
        cur = os.path.join(cur, part)
        if os.path.lexists(cur) and (os.path.islink(cur) or not os.path.isdir(cur)):
            raise Refused("the record %s would be written outside %s (%s is not a folder)" % (rel, dest, cur))
    full = os.path.join(dest, *parts)
    if os.path.islink(full) or (os.path.lexists(full) and not os.path.isfile(full)):
        raise Refused("the record %s is not a regular file in %s" % (rel, dest))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if not inside(os.path.dirname(full), dest):
        raise Refused("the record %s would be written outside %s" % (rel, dest))
    write_bytes(full, data)


def load_result(rdir, expected):
    data = read_regular(os.path.join(rdir, "result.json"))
    if data is None:
        raise Refused("cannot read %s/result.json" % rdir)
    res = json.loads(data.decode("utf-8"))
    if not isinstance(res, dict) or res.get("control") != expected:
        raise Refused("%s/result.json is not from this control file" % rdir)
    if res.get("result") not in orch.RESULTS:
        raise Refused("%s/result.json: unknown result %r" % (rdir, res.get("result")))
    return res


def cmd_record(a):
    ctl = load_control(a.control, a.hash)
    if not os.path.isdir(a.dest):
        raise g.UsageError("--dest %s is not a folder" % a.dest)
    role = ctl["role"]
    lim = ctl["limits"]
    rel = record_path(ctl)
    if role == "checks":
        if not a.checks or not a.changes:
            raise g.UsageError("a check run is recorded with --checks and --changes")
        res = load_result(a.checks, a.hash)
        changes = load_changes(a.changes, ctl["builder_control_hash"])
        log = read_regular(os.path.join(a.checks, "checks.log")) or b""
        disc = [(d.get("path"), d.get("reason")) for d in changes.get("discarded", [])]
        tail = ("\n== Discarded from the builder's last change set (model S-014 AC8)\n%s"
                % (discard_lines(disc) or "none\n")).encode("utf-8")
        data, _ = cap(log + tail, len(log) + len(tail), lim["record_bytes"])
        result = res["result"]
        verdict = res.get("verdict") if result == "ok" and res.get("verdict") in ("PASS", "FAIL") else "none"
        write_record(a.dest, rel, data)
        record = rel
    else:
        if not a.run:
            raise g.UsageError("a session is recorded with --run")
        res = load_result(a.run, a.hash)
        answer = read_regular(os.path.join(a.run, "answer.md")) or b""
        result = res["result"]
        if result == "ok" and not answer.strip():
            result = "error"                      # an empty answer (J4)
        record, verdict = None, "none"
        if result == "ok":
            data, _ = cap(answer, len(answer), lim["record_bytes"])
            write_record(a.dest, rel, data)
            record = rel
            if role in CHECKERS:
                verdict = review_check.parse_verdict(answer.decode("utf-8", "replace")) or "malformed"
    e = ctl["entry"]
    line = json.dumps({"item": e["item"], "session": ctl["session"], "role": role, "record": record,
                       "result": result, "verdict": verdict}, ensure_ascii=False)
    with open(a.outcomes, "a", encoding="utf-8", newline="\n") as fh:
        fh.write(line + "\n")
    print("OK: %s %s -> %s (%s, %s)" % (role, ctl["session"], record or "no record", result, verdict))
    return 0


# --------------------------------------------------------------------------
# main


def build_parser():
    p = argparse.ArgumentParser(prog="session_runner.py", description=__doc__.split("\n")[0])
    sub = p.add_subparsers(dest="cmd")

    s = sub.add_parser("pack")
    s.add_argument("--entry", required=True)
    s.add_argument("--source", required=True)
    s.add_argument("--now", required=True)
    s.add_argument("--control", required=True)
    s.add_argument("--pack")
    s.add_argument("--config")
    s.add_argument("--request-month")
    s.add_argument("--confirm", action="store_true")
    s.add_argument("--builder-control")
    s.add_argument("--builder-hash")
    s.add_argument("--waivers")
    s.add_argument("--source-tip")

    s = sub.add_parser("run")
    for k in ("--pack", "--control", "--hash", "--out"):
        s.add_argument(k, required=True)
    s.add_argument("--claude", default="claude")

    s = sub.add_parser("collect")
    for k in ("--pack", "--control", "--hash", "--out"):
        s.add_argument(k, required=True)

    s = sub.add_parser("checks")
    for k in ("--source", "--changes", "--control", "--hash", "--builder-control", "--builder-hash", "--work",
              "--out"):
        s.add_argument(k, required=True)
    s.add_argument("--sandbox")

    s = sub.add_parser("record")
    for k in ("--dest", "--outcomes", "--control", "--hash"):
        s.add_argument(k, required=True)
    s.add_argument("--run")
    s.add_argument("--checks")
    s.add_argument("--changes")
    return p


COMMANDS = {"pack": cmd_pack, "run": cmd_run, "collect": cmd_collect, "checks": cmd_checks, "record": cmd_record}


def main(argv=None):
    parser = build_parser()
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if not args.cmd:
        parser.print_usage(sys.stderr)
        return 2
    try:
        return COMMANDS[args.cmd](args)
    except Refused as exc:
        print("ERROR: refused: %s" % exc, file=sys.stderr)
        return 1
    except g.UsageError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
