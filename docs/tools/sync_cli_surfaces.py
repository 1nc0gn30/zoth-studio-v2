#!/usr/bin/env python3
"""Layer C sync repair: refresh stale CLI install surfaces from the repo canonical.

Rule enforced: every surface (/usr/local/bin, ~/.local/bin, zoth-os chroot
usr/local/bin) must hold the byte-identical canonical binary that the repo ships.
Read-mostly: it only writes a surface when its hash differs from the canonical,
and it re-hashes after copying to prove the repair. It never touches a surface
whose hash already matches, never kills a process, and never pushes anywhere.

Usage: python3 sync_cli_surfaces.py            # report only
       python3 sync_cli_surfaces.py --apply    # repair drift
"""
import argparse, hashlib, os, shutil, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import parity_probe as pp  # noqa: E402

SURFACES = [
    ("S1 /usr/local/bin", "/usr/local/bin"),
    ("S2 ~/.local/bin", os.path.expanduser("~/.local/bin")),
    ("S3 zoth-os chroot", "/home/zoth/NullAITech/zoth-os/config/includes.chroot/usr/local/bin"),
]
REPO_BIN = ["bin/{id}", "{id}", "dist/{id}", "scripts/{id}"]


def sha(p):
    with open(p, "rb") as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def canonical(repo, tid):
    for c in REPO_BIN:
        p = os.path.join(repo, c.format(id=tid))
        if os.path.isfile(p):
            return p
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--ids", default="")
    a = ap.parse_args()
    tools = pp.parse_tools()
    if a.ids:
        want = {x for x in a.ids.split(",") if x}
        tools = [t for t in tools if t["id"] in want]

    fixed, drifted, blocked = [], [], []
    for t in tools:
        tid = t["id"]
        repo = pp.local_repo_dir(t) or ""
        src = canonical(repo, tid)
        if not src:
            continue
        want = sha(src)
        for label, d in SURFACES:
            dst = os.path.join(d, tid)
            if not os.path.isfile(dst):
                continue
            if sha(dst) == want:
                continue
            drifted.append((tid, label))
            if a.apply:
                try:
                    shutil.copy2(src, dst)
                    os.chmod(dst, 0o755)
                except PermissionError:
                    blocked.append((tid, label))
                    print(f"BLOCKED  {tid:26s} {label}  (no write permission)")
                    continue
                ok = sha(dst) == want
                print(f"{'REPAIRED' if ok else 'FAILED  '} {tid:26s} {label}  <- {src}  sha_ok={ok}")
                if ok:
                    fixed.append((tid, label))
            else:
                print(f"WOULD FIX {tid:26s} {label}")

    if not a.apply:
        print(f"\ndrifted surfaces: {len(drifted)} -> {drifted}")
        print("re-run with --apply to repair")
    else:
        print(f"\nrepaired: {len(fixed)}/{len(drifted)} drift(s); blocked (needs root): {len(blocked)}")
        for t_, l_ in blocked:
            print(f"   need-sudo {t_:26s} {l_}")


if __name__ == "__main__":
    main()
