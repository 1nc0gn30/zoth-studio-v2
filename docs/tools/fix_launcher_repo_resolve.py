#!/usr/bin/env python3
"""Layer C root fix: make repo-relative CLI launchers location-independent.

Finding (machine-verified this session): a family of tools ship a launcher at
``<repo>/bin/<id>`` that discovers its own repo with
``os.path.dirname(os.path.dirname(os.path.abspath(__file__)))`` (or the bash
equivalent ``$(dirname "$0")/..``).  That is correct while the file lives inside
the repo, but the SAME file is installed to ``/usr/local/bin``/``~/.local/bin``/
the ZothOS chroot, where the computation yields ``/usr`` / ``~/.local`` -- so
``src`` resolves to ``/usr/src`` and the tool dies with
``ModuleNotFoundError: No module named '<pkg>'`` (or, for the
``os.path.join(ROOT, "server.py")`` variants,
``can't open file '/usr/local/server.py'``).

Fix: prepend an idempotent shim (marker ``# zothos-repo-shim``) to the repo's
canonical launcher.  The shim re-executes the canonical repo copy
(``$ZOTH_REPO_DIR`` override, else ``~/NullAITech/<repo>``) whenever the
running file is NOT the repo copy, so repo-relative paths always resolve.  When
the repo copy itself runs, the shim is a no-op -- no recursion.

Repo copies are the source of truth, so re-syncing surfaces keeps the fix.

Read-only unless ``--apply``.  ``--apply`` writes the repo launchers and the
user-writable surfaces (``~/.local/bin``, the ZothOS chroot); root-owned
``/usr/local/bin`` writes are emitted to ``--sudo-script`` for ``sudo bash``.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parity_probe as pp  # noqa: E402

MARK = "# zothos-repo-shim"
QUOTES = ('"""', "'''")
ROOT = "~/NullAITech"
SURFACES_USER = ["~/.local/bin",
                 "~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin"]
SURFACE_ROOT = "/usr/local/bin"
SANE = {"HOME": "~",
        "PATH": "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
        "TERM": "dumb", "LANG": "C.UTF-8"}

PY_SHIM = '''{mark}: run the canonical repo copy so repo-relative paths resolve
import os as _os, sys as _sys
_here = _os.path.realpath(__file__)
_repo = _os.environ.get("ZOTH_REPO_DIR") or {root!r} + "/" + {repo!r}
_real = _os.path.join(_repo, "bin", {tid!r})
if _os.path.exists(_real) and _os.path.realpath(_real) != _here:
    _os.execv(_sys.executable, [_sys.executable, _real] + _sys.argv[1:])
del _os, _sys, _here, _repo, _real
'''

SH_SHIM = '''{mark}
_here="$(readlink -f "$0")"
_repo="${{ZOTH_REPO_DIR:-{root}/{repo}}}"
_real="$_repo/bin/{tid}"
if [ -f "$_real" ] && [ "$(readlink -f "$_real")" != "$_here" ]; then exec "$_real" "$@"; fi
'''


def candidate_launchers(repo: str, tid: str) -> list[str]:
    out = []
    for rel in (f"bin/{tid}", tid, f"scripts/{tid}", f"dist/{tid}"):
        p = os.path.join(repo, rel)
        if os.path.isfile(p):
            out.append(p)
    return out


def insert_shim(text: str, shim: str) -> str:
    """Insert *shim* after the shebang, docstring and any __future__ imports.

    ``from __future__`` imports must remain the first statements of the file, so
    the shim has to land after them or the launcher dies with a SyntaxError.
    """
    lines = text.splitlines(keepends=True)
    i = 1 if (lines and lines[0].startswith("#!")) else 0

    def _skip_blanks_and_comments(j: int) -> int:
        while j < len(lines) and (not lines[j].strip() or lines[j].lstrip().startswith("#")):
            j += 1
        return j

    i = _skip_blanks_and_comments(i)
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
        j = _skip_blanks_and_comments(i)
        if j < len(lines) and lines[j].lstrip().startswith("from __future__"):
            i = j + 1
            continue
        break
    head = "".join(lines[:i])
    tail = "".join(lines[i:])
    return head + ("\n" if head and not head.endswith("\n\n") else "") + shim + "\n" + tail


def probe(path: str, tid: str, timeout: int = 30) -> dict:
    res = {}
    for flag in ("--help", "--json"):
        try:
            r = subprocess.run([path, flag], capture_output=True, text=True,
                               env=SANE, timeout=timeout)
            res[flag] = r.returncode
        except Exception as exc:  # noqa: BLE001
            res[flag] = f"EXC:{type(exc).__name__}"
    return res


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", help="comma-separated tool ids (default: auto-detect)")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--sudo-script", default="~/.hermes/cache/scratch/fix_launcher_surfaces.sh")
    a = ap.parse_args()

    tools = {t["id"]: t for t in pp.parse_tools()}
    ids = [x for x in (a.ids.split(",") if a.ids else sorted(tools))]
    ids = [i for i in ids if i in tools]

    report, sudo_lines, rows = [], [], []
    for tid in ids:
        repo = pp.local_repo_dir(tools[tid]) or ""
        rec = {"id": tid, "repo": repo}
        cands = candidate_launchers(repo, tid) if repo else []
        if not cands:
            rec["status"] = "no-repo-launcher"
            rows.append(rec)
            continue
        src = cands[0]
        rec["repo_launcher"] = src
        rec["repo_copy"] = probe(src, tid)
        text = open(src, encoding="utf8", errors="replace").read()
        if MARK in text:
            rec["status"] = "already-shimmed"
        elif rec["repo_copy"]["--help"] != 0:
            rec["status"] = "repo-copy-broken"
        else:
            if text.startswith("#!") and "bash" in text.splitlines()[0]:
                shim = SH_SHIM.format(mark=MARK, root=ROOT, repo=os.path.basename(repo.rstrip("/")), tid=tid)
            else:
                shim = PY_SHIM.format(mark=MARK, root=ROOT, repo=os.path.basename(repo.rstrip("/")), tid=tid)
            rec["status"] = "shimmable"
            if a.apply:
                new = insert_shim(text, shim)
                assert new != text, tid
                with open(src, "w", encoding="utf8") as fh:
                    fh.write(new)
                os.chmod(src, 0o755)
                for s in SURFACES_USER:
                    d = os.path.join(s, tid)
                    if os.path.isdir(s):
                        shutil.copy2(src, d)
                        os.chmod(d, 0o755)
                sudo_lines.append(f"install -m 755 {src} {SURFACE_ROOT}/{tid}")
                rec["installed_user_surfaces"] = [s for s in SURFACES_USER if os.path.exists(os.path.join(s, tid))]
                for s in SURFACES_USER:
                    p = os.path.join(s, tid)
                    if os.path.exists(p) and os.path.realpath(p) != os.path.realpath(src):
                        rec.setdefault("surface_probe", {})[s] = probe(p, tid)
        rows.append(rec)
        print(f"{tid:24s} {rec['status']:16s} repo{rec['repo_copy']}")

    if a.apply and sudo_lines:
        with open(a.sudo_script, "w", encoding="utf8") as fh:
            fh.write("#!/bin/bash\nset -e\n" + "\n".join(sudo_lines) + "\n")
        os.chmod(a.sudo_script, 0o755)
        print(f"\nsudo script: {a.sudo_script}  ({len(sudo_lines)} root surfaces)")

    out = "~/.hermes/cache/scratch/fix_launcher_repo_resolve.json"
    json.dump(rows, open(out, "w"), indent=1)
    print("report ->", out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
