#!/usr/bin/env python3
"""Layer C completion: give every CLI a deterministic top-level ``--json``.

The Layer C invariant requires ``<tool> --help`` **and** ``<tool> --json`` to exit
0 with clean output.  Most tools satisfy this directly, but a family of
subcommand-based tools (``etsy-connector``, ``etsy-pod-forge``, ...) only accept
``--json`` *after* a subcommand, so the bare invocation dies with argparse's
``unrecognized arguments: --json`` and exit 2 -- which makes the tool invisible to
JSON-driven orchestration (ZothOS launchers, Zoth Studio, agent routers).

Fix: in the tool's own launcher (``<repo>/bin/<id>``, the source of truth for all
three surfaces), intercept a *lone* ``--json`` before dispatch and print a
capability manifest built from the tool's OWN ``--help`` output (commands parsed,
never invented):

    {"tool": "...", "ok": true, "kind": "json-manifest", "version": "...",
     "local_port": 8108, "studio_route": "/tools/...", "commands": [...], ...}

Only tools whose top-level ``--json`` currently FAILS are touched, so real
``--json`` behaviour of unaffected tools is never shadowed.  Idempotent via the
``# zothos-json-manifest`` marker.  Read-only unless ``--apply``.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parity_probe as pp  # noqa: E402

MARK = "# zothos-json-manifest"
SURFACES_USER = ["~/.local/bin",
                 "~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin"]
SURFACE_ROOT = "/usr/local/bin"
SANE = {"HOME": "~",
        "PATH": "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
        "TERM": "dumb", "LANG": "C.UTF-8"}
BAD = re.compile(r"unrecognized arguments|invalid choice|unrecognized option", re.I)

BLOCK = '''{mark}: deterministic machine-readable manifest for `{tid} --json`
import sys as _zsys


def _zoth_manifest_subs(_help):
    for _line in (_help or "").splitlines():
        if "{{" not in _line or "}}" not in _line:
            continue
        _inner = _line.split("{{", 1)[1].split("}}", 1)[0]
        if "," not in _inner:
            continue
        _s = [x.strip() for x in _inner.split(",") if x.strip()]
        if _s and all(x.replace("-", "").replace("_", "").isalnum() for x in _s):
            return [x for x in _s if x != "help"]
    return []


def _zoth_manifest():
    import json as _zj, subprocess as _zsp
    _r = _zsp.run([_zsys.executable, _zsys.argv[0], "--help"],
                  capture_output=True, text=True, timeout=60)
    _subs = _zoth_manifest_subs((_r.stdout or "") + (_r.stderr or ""))
    print(_zj.dumps({{"tool": {tid!r}, "ok": True, "kind": "json-manifest",
                     "version": {ver!r}, "local_port": {port}, "execution_type": {exe!r},
                     "studio_route": "/tools/" + {tid!r}, "entry": __file__,
                     "commands": _subs,
                     "usage": "run `{tid} --help`" + ("; subcommands: " + ", ".join(_subs) if _subs else "")}},
                    indent=2, sort_keys=True))
    raise SystemExit(0)


if _zsys.argv[1:] == ["--json"]:
    _zoth_manifest()
{mark}-end
'''

QUOTES = ('"""', "'''")


def find_launcher(repo: str, tid: str) -> str | None:
    for rel in (f"bin/{tid}", tid, f"scripts/{tid}"):
        p = os.path.join(repo, rel)
        if os.path.isfile(p):
            return p
    return None


def probe_json(path: str, tid: str, timeout: int = 40) -> tuple:
    try:
        r = subprocess.run([path, "--json"], capture_output=True, text=True,
                           env=SANE, timeout=timeout)
        return r.returncode, (r.stdout or "") + (r.stderr or "")
    except Exception as exc:  # noqa: BLE001
        return f"EXC:{type(exc).__name__}", ""


def help_text(path: str, timeout: int = 40) -> str:
    try:
        r = subprocess.run([path, "--help"], capture_output=True, text=True,
                           env=SANE, timeout=timeout)
        return (r.stdout or "") + (r.stderr or "")
    except Exception:  # noqa: BLE001
        return ""


def strip_existing(text: str) -> str:
    """Remove a previously inserted manifest region (new or legacy terminator)."""
    txt = re.sub(r"# zothos-json-manifest:.*?# zothos-json-manifest-end\n", "", text,
                 flags=re.S)
    txt = re.sub(r"# zothos-json-manifest:.*?^if sys\.argv\[1:\] == \[\"--json\"\]:\n    _zoth_manifest\(\)\n",
                 "", txt, flags=re.S | re.M)
    return txt


def insert_block(text: str, block: str) -> str:
    """Insert the manifest block after shebang/docstring/__future__ imports."""
    lines = text.splitlines(keepends=True)
    i = 1 if (lines and lines[0].startswith("#!")) else 0

    def skip(j):
        while j < len(lines) and (not lines[j].strip() or lines[j].lstrip().startswith("#")):
            j += 1
        return j

    i = skip(i)
    if i < len(lines) and lines[i].lstrip().startswith(QUOTES):
        q = lines[i].lstrip()[:3]
        if lines[i].strip().count(q) >= 2 and len(lines[i].strip()) > 3:
            i += 1
        else:
            i += 1
            while i < len(lines) and q not in lines[i]:
                i += 1
            i += 1
    while True:
        j = skip(i)
        if j < len(lines) and lines[j].lstrip().startswith("from __future__"):
            i = j + 1
            continue
        break
    head, tail = "".join(lines[:i]), "".join(lines[i:])
    return head + ("\n" if head and not head.endswith("\n\n") else "") + block + "\n\n" + tail


def version_of(repo: str) -> str:
    for f in ("pyproject.toml", "package.json"):
        p = os.path.join(repo, f)
        if os.path.exists(p):
            m = re.search(r'^version\s*=\s*["\']([^"\']+)', open(p, errors="replace").read(), re.M)
            if m:
                return m.group(1)
    return "0.0.0"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", help="comma-separated ids (default: whole catalog)")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--force", action="store_true", help="rewrite already-manifested tools")
    ap.add_argument("--sudo-script", default="~/.hermes/cache/scratch/fix_json_surfaces.sh")
    a = ap.parse_args()

    tools = {t["id"]: t for t in pp.parse_tools()}
    ids = (a.ids.split(",") if a.ids else sorted(tools))
    rows, sudo_lines, touched = [], [], []
    for tid in ids:
        t = tools.get(tid)
        if not t:
            continue
        repo = pp.local_repo_dir(t) or ""
        launcher = find_launcher(repo, tid) if repo else None
        if not launcher:
            continue
        if not open(launcher, errors="replace").read().startswith("#!") or "python" not in open(launcher, errors="replace").readline():
            rows.append({"id": tid, "status": "non-python-launcher", "launcher": launcher})
            continue
        text = open(launcher, encoding="utf8", errors="replace").read()
        if MARK in text:
            if not a.force:
                rows.append({"id": tid, "status": "already-manifested", "launcher": launcher})
                continue
        code, out = probe_json(launcher, tid)
        helptext = help_text(launcher)
        top_json = any(re.match(r"\s*--json", ln) for ln in (helptext or "").splitlines())
        if code == 0:
            rows.append({"id": tid, "status": "json-ok", "exit": code, "launcher": launcher})
            continue
        if top_json:
            # real top-level --json contract: non-zero exit is domain truth (live
            # backend down, etc.) -- never shadow it with a manifest.
            rows.append({"id": tid, "status": "json-backend-dependent", "exit": code,
                         "detail": (out or "").strip().splitlines()[:1], "launcher": launcher})
            continue
        if not (BAD.search(out or "") or code in (1, 2)):
            rows.append({"id": tid, "status": "json-other", "exit": code, "launcher": launcher})
            continue
        block = BLOCK.format(mark=MARK, tid=tid, ver=version_of(repo),
                             port=t.get("localPort") if isinstance(t.get("localPort"), int) else 0,
                             exe=t.get("executionType") or "local_cli")
        rows.append({"id": tid, "status": "manifestable", "launcher": launcher, "was_exit": code})
        if a.apply:
            base = strip_existing(text)
            new = insert_block(base, block)
            assert new != base
            open(launcher, "w", encoding="utf8").write(new)
            os.chmod(launcher, 0o755)
            for s in SURFACES_USER:
                if os.path.isdir(s):
                    shutil.copy2(launcher, os.path.join(s, tid))
                    os.chmod(os.path.join(s, tid), 0o755)
            sudo_lines.append(f"install -m 755 {launcher} {SURFACE_ROOT}/{tid}")
            touched.append(tid)
        print(f"{tid:24s} {rows[-1]['status']}")

    if a.apply and sudo_lines:
        open(a.sudo_script, "w").write("#!/bin/bash\nset -e\n" + "\n".join(sudo_lines) + "\n")
        os.chmod(a.sudo_script, 0o755)
        print(f"\nsudo script: {a.sudo_script} ({len(sudo_lines)} root surfaces)")

    out = "~/.hermes/cache/scratch/fix_top_level_json.json"
    json.dump(rows, open(out, "w"), indent=1)
    from collections import Counter
    print("status counts:", dict(Counter(r["status"] for r in rows)))
    print("report ->", out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
