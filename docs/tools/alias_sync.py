#!/usr/bin/env python3
"""Layer C alias-drift closure: make every alias CLI name byte-identical to its
repo-canonical launcher on every install surface.

Finding (machine-verified): the atlas tracks 16 legacy alias filenames
(``theme-forge``, ``yara-forge``, ``bounty-hub`` ...) that predate this session's
canonical-launcher upgrade (location-independent ``REPO_DIR`` + Electron/Braille
TUI preamble).  Alias copies left behind on ``~/.local/bin`` / ``/usr/local/bin``
/ the ZothOS chroot are the *pre-upgrade* generation, so the same name behaves
differently per surface and the atlas reports alias drift.

Policy (matches ``fix_launcher_repo_resolve.py``): **the repo copy is the source
of truth**; a surface entry may be a regular file or a symlink, but its *content*
must hash equal to the repo-canonical launcher for the same ``TOOL_ID``.

This tool therefore only rewrites surface entries whose content hash differs from
the canonical, and never touches an entry that already matches (link or file).

Read-only unless ``--apply``.  Root surfaces go through ``sudo -n install`` when
passwordless sudo is available, else they are emitted to ``--sudo-script``.

Exit codes: 0 = no drift / closed, 1 = drift remains.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time

HOME = os.path.expanduser("~")
ROOT = os.path.join(HOME, "NullAITech")
SURFACES = [
    ("chroot", os.path.join(ROOT, "zoth-os", "config", "includes.chroot", "usr", "local", "bin")),
    ("usr_local", "/usr/local/bin"),
    ("user_local", os.path.join(HOME, ".local", "bin")),
]
SCRATCH = os.path.join(HOME, ".hermes", "cache", "scratch")
CATALOG = os.path.join(ROOT, "zoth-studio-v2", "src", "data", "toolsData.js")

RE_TID = re.compile(r"^TOOL_ID\s*=\s*['\"]([^'\"]+)", re.M)
RE_VER = re.compile(r"^TOOL_VERSION\s*=\s*['\"]([^'\"]+)", re.M)
RE_REPO = re.compile(r"^TOOL_REPO\s*=\s*['\"]([^'\"]+)", re.M)
# Legacy alias names are discovered by scanning the surfaces, not hard-coded:
# any surface entry whose TOOL_ID is a known tool but whose filename != TOOL_ID.
def sha(path: str) -> str | None:
    try:
        with open(os.path.realpath(path), "rb") as fh:
            return hashlib.sha256(fh.read()).hexdigest()[:12]
    except OSError:
        return None


def head_text(path: str, limit: int = 200_000) -> str:
    try:
        with open(os.path.realpath(path), "r", errors="replace") as fh:
            return fh.read(limit)
    except OSError:
        return ""


def _g(rx: re.Pattern, txt: str) -> str | None:
    m = rx.search(txt)
    return m.group(1) if m else None


def find_repo_bin(tid: str, repo: str | None) -> str | None:
    cands = []
    if repo:
        cands.append(os.path.join(ROOT, repo, "bin", tid))
        cands.append(os.path.join(ROOT, repo, tid))
    cands.append(os.path.join(ROOT, tid, "bin", tid))
    try:
        for d in sorted(os.listdir(ROOT)):
            cands.append(os.path.join(ROOT, d, "bin", tid))
    except OSError:
        pass
    for c in cands:
        if os.path.isfile(c):
            return c
    return None


def catalog_versions() -> dict[str, str]:
    out: dict[str, str] = {}
    try:
        txt = open(CATALOG, "r", errors="replace").read()
    except OSError:
        return out
    for m in re.finditer(r"id: '([^']+)',(.*?)\n  \},", txt, re.S):
        v = re.search(r"version: '([^']*)'", m.group(2))
        if v:
            out[m.group(1)] = v.group(1)
    return out


def build_plan() -> dict:
    """Map alias-name -> {tid, surfaces{name:{path,exists,form,sha}}, canonical}."""
    cat = catalog_versions()
    aliases: dict[str, dict] = {}
    for sname, sdir in SURFACES:
        if not os.path.isdir(sdir):
            continue
        for fn in sorted(os.listdir(sdir)):
            p = os.path.join(sdir, fn)
            if not (os.path.isfile(p) or os.path.islink(p)):
                continue
            txt = head_text(p)
            m = RE_TID.search(txt)
            if not m:
                continue
            tid = m.group(1)
            if fn == tid:
                continue  # canonical presence, not an alias
            rec = aliases.setdefault(fn, {"tid": tid, "surfaces": {}})
            if rec["tid"] != tid:
                rec.setdefault("tid_conflict", []).append((sname, tid))
            rec["surfaces"][sname] = {
                "path": p,
                "exists": os.path.exists(p),
                "form": "link" if os.path.islink(p) else "file",
                "link": os.readlink(p) if os.path.islink(p) else None,
                "sha": sha(p),
                "size": os.path.getsize(os.path.realpath(p)) if os.path.exists(p) else 0,
                "ver": _g(RE_VER, txt),
            }
    for fn, rec in aliases.items():
        tid = rec["tid"]
        probe = os.path.join(next(iter(rec["surfaces"].values()))["path"])
        rb = find_repo_bin(tid, _g(RE_REPO, head_text(probe)))
        if rb is None:
            host = os.path.join("/usr/local/bin", tid)
            rb = host if os.path.isfile(host) else None
        rec["canonical"] = ({
            "path": rb, "sha": sha(rb), "size": os.path.getsize(os.path.realpath(rb)),
            "ver": _g(RE_VER, head_text(rb)),
            "catalog_ver": cat.get(tid),
        } if rb else None)
        rec["drift"] = sorted([s for s, d in rec["surfaces"].items()
                               if rec["canonical"] and d["sha"] != rec["canonical"]["sha"]])
    return {"aliases": aliases, "catalog": cat}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write changes (default: dry run)")
    ap.add_argument("--promote-version", action="store_true",
                    help="bump a stale canonical TOOL_VERSION up to the catalog value")
    ap.add_argument("--out", default=os.path.join(SCRATCH, "alias_sync.json"))
    ap.add_argument("--backup-dir", default=os.path.join(SCRATCH, "alias_backup_" + time.strftime("%Y%m%d_%H%M%S")))
    ap.add_argument("--sudo-script", default=os.path.join(SCRATCH, "alias_sync_root.sh"))
    a = ap.parse_args()

    plan = build_plan()
    al = plan["aliases"]
    print(f"alias names: {len(al)}   (canonical = repo copy for the same TOOL_ID)")
    print(f"{'alias':22s} {'tid':24s} {'ver~cat':12s} {'drift surfaces':40s}")
    drift_total = 0
    for fn in sorted(al):
        rec = al[fn]
        can = rec["canonical"]
        vcat = f"{(can or {}).get('ver')}~{(can or {}).get('catalog_ver')}" if can else "no-canonical"
        drift = rec["drift"]
        drift_total += len(drift)
        print(f"{fn:22s} {rec['tid']:24s} {vcat:12s} {','.join(drift) or '-':40s}"
              f" {len(rec['surfaces'])} surfaces")
    print(f"\ncontent drift entries: {drift_total}")

    # --- version-stale canonicals (evidence: catalog > canonical) -------------
    stale = {}
    for fn, rec in al.items():
        can = rec["canonical"]
        if not can or not can["catalog_ver"] or not can["ver"]:
            continue
        if can["catalog_ver"] != can["ver"]:
            stale.setdefault(can["path"], (rec["tid"], can["ver"], can["catalog_ver"]))
    for path, (tid, old, new) in sorted(stale.items()):
        print(f"  STALE-VERSION {tid}: canonical {old} -> catalog {new}  ({path})")
    plan["stale_version"] = [
        {"path": p, "tool_id": t, "canonical_ver": o, "catalog_ver": n}
        for p, (t, o, n) in sorted(stale.items())]

    if not a.apply:
        print("\ndry run: no files written (pass --apply)")
        json.dump(plan, open(a.out, "w"), indent=1, default=str)
        print("report ->", a.out)
        return 1 if drift_total else 0

    os.makedirs(a.backup_dir, exist_ok=True)
    written, backed, skipped = [], [], []
    sudo_lines = []

    # 1. bump stale canonical versions in the repo copy (source of truth)
    if a.promote_version:
        for path, (tid, old, new) in sorted(stale.items()):
            b = os.path.join(a.backup_dir, "canonical_" + os.path.basename(path))
            shutil.copy2(path, b)
            backed.append(b)
            txt = open(path, "r", errors="replace").read()
            txt2 = RE_VER.sub(f'TOOL_VERSION = "{new}"', txt, count=1)
            txt2 = txt2.replace(f"CLI (v{old})", f"CLI (v{new})", 1)
            if txt2 != txt:
                open(path, "w").write(txt2)
                written.append(path + f"  version {old}->{new}")
                # refresh the plan's canonical hashes
                for rec in al.values():
                    if rec["canonical"] and rec["canonical"]["path"] == path:
                        rec["canonical"]["sha"] = sha(path)
                        rec["canonical"]["ver"] = _g(RE_VER, head_text(path))
                        rec["drift"] = sorted([s for s, d in rec["surfaces"].items()
                                               if d["sha"] != rec["canonical"]["sha"]])

    # 2. unify drifting surface entries to the canonical bytes
    for fn in sorted(al):
        rec = al[fn]
        can = rec["canonical"]
        if not can:
            skipped.append(f"{fn}: no canonical resolved")
            continue
        for sname in rec["drift"]:
            d = rec["surfaces"][sname]
            dst = d["path"]
            b = os.path.join(a.backup_dir, sname + "__" + fn)
            if os.path.exists(dst) or os.path.islink(dst):
                shutil.copy2(os.path.realpath(dst), b)
                backed.append(b)
            if os.access(os.path.dirname(dst), os.W_OK):
                if os.path.islink(dst):
                    os.unlink(dst)
                shutil.copy2(can["path"], dst)
                os.chmod(dst, 0o755)
                written.append(f"{dst}  ({d['sha']} -> {sha(dst)})")
            else:
                sudo_lines.append(f"install -m 755 {can['path']} {dst}")
        # refresh drift after writes
        rec["drift"] = sorted([s for s, dd in rec["surfaces"].items()
                               if sha(dd["path"]) != can["sha"]])

    if sudo_lines:
        with open(a.sudo_script, "w") as fh:
            fh.write("#!/usr/bin/env bash\n# root-owned alias surfaces\nset -e\n" + "\n".join(sudo_lines) + "\n")
        os.chmod(a.sudo_script, 0o755)
        r = subprocess.run(["sudo", "-n", "bash", a.sudo_script], capture_output=True, text=True)
        if r.returncode == 0:
            written.append(f"sudo script applied: {a.sudo_script} ({len(sudo_lines)} files)")
            for fn in sorted(al):
                rec = al[fn]
                if not rec["canonical"]:
                    continue
                rec["drift"] = sorted([s for s, dd in rec["surfaces"].items()
                                       if sha(dd["path"]) != rec["canonical"]["sha"]])
        else:
            print(f"sudo failed ({r.returncode}): {r.stderr.strip()[:200]}")
            print("run manually:", f"sudo bash {a.sudo_script}")

    # 3. syntax check every written target
    syntax = {}
    for fn in sorted(al):
        for sname, d in al[fn]["surfaces"].items():
            p = d["path"]
            if not os.path.exists(p):
                continue
            real = os.path.realpath(p)
            if open(real, "rb").read(2) == b"#!":
                first = open(real, "r", errors="replace").readline()
                if "python" in first:
                    r = subprocess.run([sys.executable, "-m", "py_compile", real],
                                       capture_output=True, text=True)
                else:
                    r = subprocess.run(["bash", "-n", real], capture_output=True, text=True)
                syntax[f"{sname}/{fn}"] = "ok" if r.returncode == 0 else r.stderr.strip()[:120]

    remaining = {fn: al[fn]["drift"] for fn in sorted(al) if al[fn]["drift"]}
    print(f"\nbackups        : {len(backed)} -> {a.backup_dir}")
    print(f"files written  : {len(written)}")
    for w in written:
        print("   ", w)
    print(f"syntax         : {sum(1 for v in syntax.values() if v == 'ok')}/{len(syntax)} ok"
          + ("" if all(v == 'ok' for v in syntax.values()) else f"  BAD: {[k for k, v in syntax.items() if v != 'ok']}"))
    print(f"remaining drift: {sum(len(v) for v in remaining.values())}  {remaining or ''}")

    json.dump({"plan": plan, "written": written, "backups": backed, "syntax": syntax,
               "remaining": remaining}, open(a.out, "w"), indent=1, default=str)
    print("report ->", a.out)
    return 1 if remaining else 0


if __name__ == "__main__":
    raise SystemExit(main())
