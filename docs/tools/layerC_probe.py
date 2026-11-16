#!/usr/bin/env python3
"""Layer C probe: CLI binary + desktop-launcher determinism across the three
install surfaces.

For every catalog tool (parity_probe.parse_tools) it:
  1. resolves the binary name(s) that actually exist on the three surfaces
       S1 /usr/local/bin            (system install)
       S2 ~/.local/bin              (user install - must never shadow S1 with a stale stub)
       S3 zoth-os/config/includes.chroot/usr/local/bin   (ISO payload)
  2. hashes each copy (sha256) and classifies sync state:
       in_sync | drift | s1_only | s2_only | s3_only | s1+s2 | none
  3. reads PATH order (`which -a`) and flags a stale S2 shadowing a newer S1
  4. runs `<bin> --help` and `<bin> --json` (timeout, cwd = the tool repo) and records
     exit code + first output line, per the Layer C invariant
  5. summarises .desktop launcher presence in the zoth-os tree

Read-only: it never writes to the install surfaces, never installs, never pushes.
Records append to layerC_results.jsonl (resumable).

Usage: python3 layerC_probe.py [--ids a,b] [--no-run] [--json-out PATH]
"""
import argparse, hashlib, json, os, re, subprocess, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import parity_probe as pp  # noqa: E402

S1 = "/usr/local/bin"
S2 = os.path.expanduser("~/.local/bin")
S3 = "~/NullAITech/zoth-os/config/includes.chroot/usr/local/bin"
SURFACES = (("S1", S1), ("S2", S2), ("S3", S3))
ZOTHOS = "~/NullAITech/zoth-os"
SCRATCH = "~/.hermes/cache/scratch"


def sha(path):
    try:
        h = hashlib.sha256()
        with open(path, "rb") as fh:
            for chunk in iter(lambda: fh.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()[:12], os.path.getsize(path)
    except Exception as e:
        return f"ERR:{type(e).__name__}", -1


def dir_index():
    idx = {}
    for tag, d in SURFACES:
        names = set()
        try:
            names = set(os.listdir(d))
        except Exception:
            pass
        idx[tag] = names
    return idx


def candidates(tid, repo_base, idx):
    """Binary names to look for, ordered by confidence."""
    names = [tid]
    if repo_base and repo_base != tid:
        names.append(repo_base)
    names += [f"{tid}-tui", f"{repo_base}-tui" if repo_base else None]
    allnames = set().union(*idx.values())
    # fuzzy: any installed name that starts with the id / repo base (handles
    # e.g. tool id `bolt.diy` -> binary `bolt-diy`)
    for n in sorted(allnames):
        base = n.rstrip("-tui").rstrip("_")
        if n in names:
            continue
        for k in (tid, repo_base or ""):
            if not k:
                continue
            k_norm = k.replace(".", "-").replace("_", "-")
            n_norm = n.replace(".", "-").replace("_", "-")
            if n_norm in (k_norm, k_norm + "-tui", k_norm + "-cli", k_norm + "-launch"):
                names.append(n)
    out, seen = [], set()
    for n in names:
        if n and n not in seen and any(n in idx[t] for t, _ in SURFACES):
            seen.add(n)
            out.append(n)
    return out[:6]


def which_order(name):
    p = subprocess.run(["bash", "-lc", f"which -a {name} 2>/dev/null"], capture_output=True, text=True)
    return [l for l in p.stdout.split("\n") if l.strip()]


def run_probe(binary, repo):
    res = {}
    cwd = repo if repo and os.path.isdir(repo) else "/tmp"
    for flag in ("--help", "--json"):
        try:
            p = subprocess.run(["bash", "-lc", f"timeout 25 {binary} {flag}"],
                               capture_output=True, text=True, cwd=cwd, timeout=35)
            first = next((l.strip() for l in (p.stdout or "").split("\n") if l.strip()), "")
            res[flag] = {"rc": p.returncode, "len": len(p.stdout or ""),
                         "first": first[:90], "err": (p.stderr or "").strip()[-90:] if p.returncode else ""}
        except subprocess.TimeoutExpired:
            res[flag] = {"rc": "timeout", "len": 0, "first": "", "err": "exceeded 35s"}
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ids", default="")
    ap.add_argument("--no-run", action="store_true")
    ap.add_argument("--json-out", default=os.path.join(SCRATCH, "layerC_results.jsonl"))
    a = ap.parse_args()

    tools = pp.parse_tools()
    if a.ids:
        want = {x for x in a.ids.split(",") if x}
        tools = [t for t in tools if t["id"] in want]
    idx = dir_index()
    desktop = glob.glob(os.path.join(ZOTHOS, "**", "*.desktop"), recursive=True)

    stats = {"in_sync": 0, "drift": 0, "single_surface": 0, "none": 0, "shadowed": 0,
             "help_bad": 0, "json_bad": 0, "no_binary": 0}
    rows = []
    for t in tools:
        tid = t["id"]
        repo = pp.local_repo_dir(t) or ""
        repo_base = os.path.basename(repo.rstrip("/")) if repo else ""
        cands = candidates(tid, repo_base, idx)
        rec = {"id": tid, "repo": repo, "candidates": cands, "surfaces": {}, "sync": {}, "which": {},
               "runs": {}, "desktop": [os.path.relpath(d, ZOTHOS) for d in desktop
                                       if tid.replace(".", "") .lower() in os.path.basename(d).lower()][:3]}
        if not cands:
            rec["sync"]["state"] = "none"
            stats["none"] += 1
            stats["no_binary"] += 1
        else:
            for c in cands:
                rec["surfaces"][c] = {tag: (sha(os.path.join(d, c)) if c in idx[tag] else None)
                                      for tag, d in SURFACES}
                rec["which"][c] = which_order(c)
            primary = cands[0]
            sh = rec["surfaces"][primary]
            present = [tag for tag, v in sh.items() if v]
            hashes = {v[0] for v in sh.values() if v}
            sizes = {v[1] for v in sh.values() if v}
            if len(present) == 1:
                state = f"{present[0]}_only"
                stats["single_surface"] += 1
            elif len(hashes) == 1:
                state = "in_sync"
                stats["in_sync"] += 1
            else:
                state = "drift"
                stats["drift"] += 1
            w = rec["which"][primary]
            s2pos = next((i for i, p in enumerate(w) if p.startswith(S2)), None)
            s1pos = next((i for i, p in enumerate(w) if p.startswith(S1)), None)
            shadow_bad = False
            if s2pos is not None and s1pos is not None and s2pos < s1pos:
                if sh["S1"] and sh["S2"] and sh["S1"][0] != sh["S2"][0]:
                    shadow_bad = True
                    stats["shadowed"] += 1
            rec["sync"] = {"state": state, "primary": primary, "present": present,
                           "shadowed_by_local": shadow_bad,
                           "path_order": w[:4]}
            if not a.no_run:
                runbin = w[0] if w else (os.path.join(S1, primary) if sh["S1"] else None)
                if runbin and os.path.exists(runbin):
                    rec["runs"] = run_probe(runbin, repo)
                    if rec["runs"].get("--help", {}).get("rc") not in (0,):
                        stats["help_bad"] += 1
                    if rec["runs"].get("--json", {}).get("rc") not in (0,):
                        stats["json_bad"] += 1
        rows.append(rec)
        with open(a.json_out, "a") as fh:
            fh.write(json.dumps(rec) + "\n")
        s = rec["sync"]
        print(f"{tid:32s} {s.get('state','?'):14s} {','.join(s.get('present',[])):8s}"
              f" {'SHADOW!' if s.get('shadowed_by_local') else '':7s}"
              f" help={rec['runs'].get('--help',{}).get('rc','-')}"
              f" json={rec['runs'].get('--json',{}).get('rc','-')}"
              f" desktop={len(rec['desktop'])}", flush=True)

    print("\n=== summary:", json.dumps(stats))
    print("=== .desktop files in zoth-os tree:", len(desktop))


if __name__ == "__main__":
    main()
